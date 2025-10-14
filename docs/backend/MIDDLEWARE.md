# MIDDLEWARE - ChatIA Flow Backend

## Visão Geral

O ChatIA Flow utiliza **5 middlewares principais** para autenticação, autorização e segurança das rotas.

---

## Lista de Middlewares

| Middleware | Arquivo | Propósito |
|------------|---------|-----------|
| **isAuth** | isAuth.ts | Autenticação JWT padrão |
| **isAuthCompany** | isAuthCompany.ts | Validação de companyId |
| **isSuper** | isSuper.ts | Apenas perfil super |
| **tokenAuth** | tokenAuth.ts | API token (Whatsapp) |
| **envTokenAuth** | envTokenAuth.ts | Token de environment |

---

## 1. isAuth

**Propósito**: Valida JWT access token e adiciona `req.user`.

**Código**:
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

    updateUser(id, companyId);

    const fullUser = await ShowUserService(id, companyId);

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

**Uso**:
```typescript
router.get("/tickets", isAuth, TicketController.index);
```

**Adiciona ao req.user**:
```typescript
{
  id: number,
  profile: "admin" | "user" | "super",
  companyId: number,
  canViewAllContacts: boolean
}
```

---

## 2. isAuthCompany

**Propósito**: Valida que o usuário pertence à empresa solicitada.

**Código**:
```typescript
const isAuthCompany = async (req: Request, res: Response, next: NextFunction) => {
  const { companyId } = req.params;

  // Super pode acessar qualquer empresa
  if (req.user.profile === "super") {
    return next();
  }

  // Outros devem pertencer à empresa
  if (req.user.companyId !== parseInt(companyId)) {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  return next();
};
```

**Uso**:
```typescript
router.get("/companies/:companyId/users", isAuth, isAuthCompany, UserController.index);
```

---

## 3. isSuper

**Propósito**: Apenas perfil "super" pode acessar.

**Código**:
```typescript
const isSuper = (req: Request, res: Response, next: NextFunction) => {
  if (req.user.profile !== "super") {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }

  return next();
};
```

**Uso**:
```typescript
router.post("/companies", isAuth, isSuper, CompanyController.store);
router.delete("/companies/:id", isAuth, isSuper, CompanyController.remove);
```

---

## 4. tokenAuth

**Propósito**: Autenticação via API token do Whatsapp (para integrações).

**Código**:
```typescript
const tokenAuth = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throw new AppError("ERR_SESSION_EXPIRED", 401);
  }

  const [, token] = authHeader.split(" ");

  try {
    const whatsapp = await Whatsapp.findOne({ where: { token } });

    if (!whatsapp || whatsapp.token !== token) {
      throw new AppError("ERR_SESSION_EXPIRED", 401);
    }

    req.user = {
      companyId: whatsapp.companyId,
      profile: "api",
      id: whatsapp.id
    };
  } catch (err) {
    throw new AppError("Invalid token", 403);
  }

  return next();
};
```

**Uso**:
```typescript
router.post("/api/messages/send", tokenAuth, ApiController.sendMessage);
```

**Header Requerido**:
```
Authorization: Bearer <whatsapp_token>
```

---

## 5. envTokenAuth

**Propósito**: Token estático de environment (raramente usado).

**Uso**: Webhooks de integrações externas.

---

## Combinação de Middlewares

### Admin ou Super

```typescript
const isAdminOrSuper = (req: Request, res: Response, next: NextFunction) => {
  if (!["admin", "super"].includes(req.user.profile)) {
    throw new AppError("ERR_NO_PERMISSION", 403);
  }
  return next();
};

router.get("/users", isAuth, isAdminOrSuper, UserController.index);
```

### Multi-Tenant com Verificação

```typescript
router.get(
  "/companies/:companyId/tickets",
  isAuth,           // 1. Valida JWT
  isAuthCompany,    // 2. Valida companyId
  TicketController.index
);
```

### API Externa

```typescript
router.post(
  "/api/messages",
  tokenAuth,        // Token do Whatsapp
  ApiController.sendMessage
);
```

---

## Express Middleware Chain

```typescript
app.use(helmet());                    // Segurança HTTP
app.use(cors(corsOptions));           // CORS
app.use(express.json());              // Parse JSON
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());              // Parse cookies

// Rotas públicas
app.use("/auth", authRoutes);

// Rotas protegidas
app.use("/api", isAuth, apiRoutes);

// Error handler
app.use(errorHandler);
```

---

## Resumo

| Middleware | Validação | Adiciona req.user | Uso Principal |
|------------|-----------|-------------------|---------------|
| **isAuth** | JWT Token | ✅ | Todas as rotas protegidas |
| **isAuthCompany** | companyId | ❌ | Rotas multi-tenant |
| **isSuper** | profile=super | ❌ | Operações administrativas |
| **tokenAuth** | Whatsapp token | ✅ | APIs externas |
| **envTokenAuth** | ENV token | ✅ | Webhooks |

---

**Documentação gerada**: Janeiro 2025
**Versão**: 1.0
