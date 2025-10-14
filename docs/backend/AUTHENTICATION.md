# AUTHENTICATION - ChatIA Flow Backend

## Visão Geral

Sistema de autenticação baseado em **JWT (JSON Web Tokens)** com refresh tokens, RBAC (Role-Based Access Control) e controle de horário de trabalho.

### Características

- **JWT Access Token** (15 minutos de duração)
- **JWT Refresh Token** (7 dias de duração - cookie httpOnly)
- **3 Perfis**: admin, user, super
- **Multi-tenant** (companyId isolamento)
- **Horário de trabalho** por usuário
- **Master Key** bypass
- **Password Reset** via email

---

## Configuração

### auth.ts

```typescript
export default {
  secret: process.env.JWT_SECRET || "mysecret",
  expiresIn: "15m",
  refreshSecret: process.env.JWT_REFRESH_SECRET || "myanothersecret",
  refreshExpiresIn: "7d"
};
```

**Variáveis de Ambiente**:
```bash
JWT_SECRET=your-secret-key-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-key-min-32-chars
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
MASTER_KEY=emergency-access-key  # Opcional
```

---

## Fluxo de Autenticação

### 1. Login (POST /auth/login)

```typescript
// SessionController.ts
export const store = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const { token, serializedUser, refreshToken } = await AuthUserService({
    email,
    password
  });

  // Envia refresh token como cookie httpOnly
  SendRefreshToken(res, refreshToken);

  // Emite evento Socket.IO
  io.of(serializedUser.companyId.toString())
    .emit(`company-${serializedUser.companyId}-auth`, {
      action: "update",
      user: { id, email, companyId, token }
    });

  return res.status(200).json({
    token,
    user: serializedUser
  });
};
```

**Request**:
```json
POST /auth/login
{
  "email": "admin@admin.com",
  "password": "123456"
}
```

**Response**:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "Admin",
    "email": "admin@admin.com",
    "profile": "admin",
    "companyId": 1,
    "queues": [...],
    "super": true
  }
}
```

**Cookie Set**:
```
Set-Cookie: jrt=<refreshToken>; HttpOnly; Path=/; SameSite=Strict
```

### 2. AuthUserService (Validação)

```typescript
const AuthUserService = async ({ email, password }) => {
  const user = await User.findOne({
    where: { email },
    include: ["queues", { model: Company }]
  });

  if (!user) {
    throw new AppError("ERR_INVALID_CREDENTIALS", 401);
  }

  // Verificar horário de trabalho
  const now = new Date().getHours() * 3600 + new Date().getMinutes() * 60;
  const start = parseTime(user.startWork);
  const end = parseTime(user.endWork);

  if (now < start || now > end) {
    throw new AppError("ERR_OUT_OF_HOURS", 401);
  }

  // Validar senha (com suporte a Master Key)
  if (password === process.env.MASTER_KEY) {
    // Bypass com master key
  } else if (!(await user.checkPassword(password))) {
    throw new AppError("ERR_INVALID_CREDENTIALS", 401);
  }

  // Atualizar lastLogin da empresa
  await company.update({ lastLogin: new Date() });

  // Criar tokens
  const token = createAccessToken(user);
  const refreshToken = createRefreshToken(user);

  const serializedUser = await SerializeUser(user);

  return { serializedUser, token, refreshToken };
};
```

### 3. CreateTokens (JWT)

```typescript
// Access Token (15min)
export const createAccessToken = (user: User): string => {
  return sign(
    {
      username: user.name,
      profile: user.profile,
      id: user.id,
      companyId: user.companyId
    },
    authConfig.secret,
    { expiresIn: authConfig.expiresIn }
  );
};

// Refresh Token (7 dias)
export const createRefreshToken = (user: User): string => {
  return sign(
    {
      id: user.id,
      tokenVersion: user.tokenVersion,
      companyId: user.companyId
    },
    authConfig.refreshSecret,
    { expiresIn: authConfig.refreshExpiresIn }
  );
};
```

**Payload do Access Token**:
```json
{
  "username": "Admin",
  "profile": "admin",
  "id": 1,
  "companyId": 1,
  "iat": 1704897600,
  "exp": 1704898500
}
```

### 4. Refresh Token (POST /auth/refresh)

```typescript
export const update = async (req: Request, res: Response) => {
  const token: string = req.cookies.jrt;

  if (!token) {
    throw new AppError("ERR_SESSION_EXPIRED", 401);
  }

  const { user, newToken, refreshToken } = await RefreshTokenService(
    res,
    token
  );

  SendRefreshToken(res, refreshToken);

  return res.json({ token: newToken, user });
};
```

---

## Middleware de Autenticação

### isAuth.ts

```typescript
import { verify } from "jsonwebtoken";

interface TokenPayload {
  id: string;
  username: string;
  profile: string;
  companyId: number;
  iat: number;
  exp: number;
}

const isAuth = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throw new AppError("ERR_SESSION_EXPIRED", 401);
  }

  const [, token] = authHeader.split(" ");

  try {
    const decoded = verify(token, authConfig.secret);
    const { id, profile, companyId } = decoded as TokenPayload;

    // Atualizar status online do usuário
    updateUser(id, companyId);

    // Buscar usuário completo
    const fullUser = await ShowUserService(id, companyId);

    // Adicionar usuário ao request
    req.user = {
      id,
      profile,
      companyId,
      canViewAllContacts: !!fullUser.canViewAllContacts
    };
  } catch (err) {
    throw new AppError("Invalid token", 403);
  }

  return next();
};
```

**Uso em Rotas**:
```typescript
import isAuth from "../middleware/isAuth";

router.get("/tickets", isAuth, TicketController.index);
router.post("/tickets", isAuth, TicketController.store);
```

---

## RBAC (Controle de Acesso)

### Perfis

| Perfil | Permissões | Descrição |
|--------|------------|-----------|
| **super** | Todas | Super admin (multi-tenant) |
| **admin** | Todas da empresa | Admin da empresa |
| **user** | Limitadas | Usuário comum |

### Verificação de Perfil

```typescript
// Apenas admin ou super
if (!["admin", "super"].includes(req.user.profile)) {
  throw new AppError("ERR_NO_PERMISSION", 403);
}

// Apenas super
if (req.user.profile !== "super") {
  throw new AppError("ERR_NO_PERMISSION", 403);
}

// isAuthCompany.ts (verifica companyId)
const isAuthCompany = async (req: Request, res: Response, next: NextFunction) => {
  const { companyId } = req.params;

  if (req.user.companyId !== parseInt(companyId) && req.user.profile !== "super") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  return next();
};
```

### Verificação por Rota

```typescript
// Rotas de Company (apenas super)
router.post("/companies", isAuth, isSuper, CompanyController.store);

// Rotas de Users (admin ou super)
router.get("/users", isAuth, isAdminOrSuper, UserController.index);

// Rotas de Tickets (todos autenticados)
router.get("/tickets", isAuth, TicketController.index);
```

---

## Password Reset

### 1. Forgot Password (POST /auth/forgot-password)

```typescript
export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;

  const user = await User.findOne({ where: { email } });
  if (!user) {
    throw new AppError("E-mail não encontrado.", 404);
  }

  // Gerar token de reset (válido por 30min)
  const token = crypto.randomBytes(32).toString("hex");
  const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

  user.passwordResetToken = token;
  user.passwordResetExpires = new Date(Date.now() + 30 * 60 * 1000);
  await user.save();

  // Enviar email
  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: email,
    subject: "Redefinição de Senha",
    text: `Clique no link para redefinir sua senha: ${resetUrl}`
  });

  return res.status(200).json({ message: "E-mail enviado com sucesso." });
};
```

### 2. Reset Password (POST /auth/reset-password)

```typescript
export const resetPassword = async (req: Request, res: Response) => {
  const { token, newPassword } = req.body;

  const user = await User.findOne({
    where: {
      passwordResetToken: token,
      passwordResetExpires: { [Op.gt]: new Date() }
    }
  });

  if (!user) {
    throw new AppError("Token inválido ou expirado.", 400);
  }

  // Atualizar senha (bcrypt hash automático no model)
  user.password = newPassword;
  user.passwordResetToken = null;
  user.passwordResetExpires = null;
  await user.save();

  return res.status(200).json({ message: "Senha redefinida com sucesso." });
};
```

---

## Recursos de Segurança

### 1. Token Version (Invalidação)

```typescript
// Model User.ts
@Column
tokenVersion: number;

// Incrementar tokenVersion invalida todos os refresh tokens
await user.update({ tokenVersion: user.tokenVersion + 1 });

// RefreshTokenService verifica tokenVersion
const payload = verify(token, authConfig.refreshSecret);
const user = await User.findByPk(payload.id);

if (user.tokenVersion !== payload.tokenVersion) {
  throw new AppError("ERR_SESSION_EXPIRED", 401);
}
```

### 2. Horário de Trabalho

```typescript
// User Model
@Column
startWork: string;  // "08:00"

@Column
endWork: string;    // "18:00"

// Validação no AuthUserService
const now = getTimeInSeconds(new Date());
const start = parseTimeToSeconds(user.startWork);
const end = parseTimeToSeconds(user.endWork);

if (now < start || now > end) {
  throw new AppError("ERR_OUT_OF_HOURS", 401);
}
```

### 3. Master Key (Bypass)

```typescript
// .env
MASTER_KEY=emergency-access-key-xyz

// AuthUserService
if (password === process.env.MASTER_KEY) {
  // Bypass password check
  // Útil para suporte técnico ou emergências
}
```

### 4. Rate Limiting

```typescript
import rateLimit from "express-rate-limit";

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 tentativas
  message: "Muitas tentativas de login. Tente novamente em 15 minutos."
});

router.post("/auth/login", loginLimiter, SessionController.store);
```

---

## Frontend Integration

### 1. Login

```typescript
// Login request
const response = await api.post("/auth/login", {
  email: "admin@admin.com",
  password: "123456"
});

// Salvar token
localStorage.setItem("token", response.data.token);
localStorage.setItem("user", JSON.stringify(response.data.user));

// Cookie com refresh token é salvo automaticamente
```

### 2. Axios Interceptor

```typescript
// Add token a todas as requisições
api.interceptors.request.use(config => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto refresh em 401
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const { data } = await api.post("/auth/refresh");
        localStorage.setItem("token", data.token);
        api.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
        originalRequest.headers["Authorization"] = `Bearer ${data.token}`;
        return api(originalRequest);
      } catch (refreshError) {
        // Redirect to login
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
```

### 3. Logout

```typescript
const logout = async () => {
  await api.delete("/auth/logout");
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "/login";
};
```

---

## Troubleshooting

### Token Expirado

```bash
# Error: ERR_SESSION_EXPIRED
# Solução: Fazer refresh do token
POST /auth/refresh
```

### Fora do Horário de Trabalho

```bash
# Error: ERR_OUT_OF_HOURS
# Solução: Ajustar startWork/endWork do usuário
UPDATE "Users" SET "startWork" = '00:00', "endWork" = '23:59' WHERE id = 1;
```

### Cookie Não Enviado

```bash
# Verificar configuração CORS
credentials: true

# Frontend deve incluir
withCredentials: true
```

---

## Resumo

- **JWT Access Token**: 15 minutos
- **JWT Refresh Token**: 7 dias (httpOnly cookie)
- **3 Perfis**: super, admin, user
- **Horário de trabalho** configurável por usuário
- **Master Key** para bypass de emergência
- **Password Reset** via email com token de 30 minutos
- **Token Version** para invalidação em massa

---

**Documentação gerada**: Janeiro 2025
**Versão**: 1.0
