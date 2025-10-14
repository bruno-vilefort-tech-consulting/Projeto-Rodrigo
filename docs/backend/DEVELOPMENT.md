# 🛠️ Guia de Desenvolvimento - ChatIA Backend

Guia completo para desenvolvedores trabalhando no backend.

---

## Índice

- [Setup Inicial](#setup-inicial)
- [Estrutura de Código](#estrutura-de-código)
- [Criar Novos Recursos](#criar-novos-recursos)
- [Database](#database)
- [Padrões de Código](#padrões-de-código)
- [Testing](#testing)
- [Debugging](#debugging)
- [Deploy](#deploy)

---

## Setup Inicial

### Pré-requisitos

- Node.js 16+
- PostgreSQL 12+
- Redis 6+
- Git

### Instalação

```bash
# Clone o repositório
git clone <repo-url>
cd chatia/backend

# Instalar dependências
npm install

# Configurar ambiente
cp .env.example .env
nano .env
```

### Variáveis de Ambiente (.env)

```bash
# Ambiente
NODE_ENV=development

# Database PostgreSQL
DB_DIALECT=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=chatia
DB_USER=postgres
DB_PASS=postgres

# Pool de Conexões
DB_POOL_MAX=100
DB_POOL_MIN=15
DB_POOL_ACQUIRE=30000
DB_POOL_IDLE=600000

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_URI_ACK=redis://localhost:6379
REDIS_URI_MSG_CONN=redis://localhost:6379

# JWT
JWT_SECRET=seu-secret-super-seguro
JWT_REFRESH_SECRET=seu-refresh-secret-super-seguro

# URLs
BACKEND_URL=http://localhost:8080
FRONTEND_URL=http://localhost:3000

# Portas
BACKEND_PORT=8080

# WhatsApp
SESSION_STORAGE=redis

# Bull Queue
BULL_BOARD=true
BULL_USER=admin
BULL_PASS=admin123

# Sentry (opcional)
SENTRY_DSN=

# Integrations (opcional)
OPENAI_API_KEY=
DIALOGFLOW_PROJECT_ID=
```

### Setup Database

```bash
# Criar database
createdb chatia

# Rodar migrations
npm run db:migrate

# Rodar seeders (opcional)
npm run db:seed
```

### Executar

```bash
# Desenvolvimento (hot-reload)
npm run dev:server

# Build
npm run build

# Produção
npm start
```

---

## Estrutura de Código

### Organização de Pastas

```
src/
├── app.ts              # Express app config
├── server.ts           # Server entry point
├── bootstrap.ts        # Bootstrap config
├── queues.ts          # Queue setup
│
├── config/            # Configurações
│   ├── database.ts    # Sequelize config
│   ├── upload.ts      # Multer config
│   └── auth.ts        # JWT config
│
├── models/            # Sequelize Models
├── controllers/       # Request handlers
├── services/          # Business logic
├── routes/            # Route definitions
├── middleware/        # Express middleware
├── database/          # Migrations & seeds
├── libs/              # Core libraries
├── helpers/           # Helper functions
└── utils/             # Utilities
```

### Convenções de Nomenclatura

**Files:**
- Models: `PascalCase.ts` (User.ts)
- Controllers: `PascalCaseController.ts`
- Services: `PascalCaseService/` (pasta)
- Routes: `camelCaseRoutes.ts`
- Helpers: `PascalCase.ts`

**Code:**
- Classes: `PascalCase`
- Functions: `camelCase`
- Constants: `UPPER_SNAKE_CASE`
- Interfaces: `IPascalCase`

---

## Criar Novos Recursos

### 1. Criar Model

```bash
# Criar migration
npx sequelize-cli migration:generate --name create-mymodel

# Editar migration
nano src/database/migrations/XXXXXX-create-mymodel.ts
```

```typescript
// src/database/migrations/XXXXXX-create-mymodel.ts
import { QueryInterface, DataTypes } from "sequelize";

export default {
  up: (queryInterface: QueryInterface) => {
    return queryInterface.createTable("MyModels", {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      companyId: {
        type: DataTypes.INTEGER,
        references: { model: "Companies", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
      },
    });
  },

  down: (queryInterface: QueryInterface) => {
    return queryInterface.dropTable("MyModels");
  },
};
```

```typescript
// src/models/MyModel.ts
import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  ForeignKey,
  BelongsTo,
} from "sequelize-typescript";
import Company from "./Company";

@Table
class MyModel extends Model<MyModel> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  name: string;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: Company;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}

export default MyModel;
```

### 2. Criar Service

```bash
mkdir src/services/MyModelServices
```

```typescript
// src/services/MyModelServices/ListMyModelsService.ts
import MyModel from "../../models/MyModel";

interface Request {
  companyId: number;
  searchParam?: string;
}

const ListMyModelsService = async ({
  companyId,
  searchParam = "",
}: Request): Promise<MyModel[]> => {
  const whereCondition = {
    companyId,
    ...(searchParam && {
      name: { [Op.like]: `%${searchParam}%` },
    }),
  };

  const myModels = await MyModel.findAll({
    where: whereCondition,
    order: [["name", "ASC"]],
  });

  return myModels;
};

export default ListMyModelsService;
```

```typescript
// src/services/MyModelServices/CreateMyModelService.ts
import MyModel from "../../models/MyModel";
import AppError from "../../errors/AppError";

interface Request {
  name: string;
  companyId: number;
}

const CreateMyModelService = async ({
  name,
  companyId,
}: Request): Promise<MyModel> => {
  // Validação
  if (!name) {
    throw new AppError("Nome é obrigatório", 400);
  }

  // Verificar duplicidade
  const exists = await MyModel.findOne({
    where: { name, companyId },
  });

  if (exists) {
    throw new AppError("Já existe um registro com este nome", 409);
  }

  // Criar
  const myModel = await MyModel.create({
    name,
    companyId,
  });

  return myModel;
};

export default CreateMyModelService;
```

### 3. Criar Controller

```typescript
// src/controllers/MyModelController.ts
import { Request, Response } from "express";
import ListMyModelsService from "../services/MyModelServices/ListMyModelsService";
import CreateMyModelService from "../services/MyModelServices/CreateMyModelService";
import UpdateMyModelService from "../services/MyModelServices/UpdateMyModelService";
import DeleteMyModelService from "../services/MyModelServices/DeleteMyModelService";

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { searchParam } = req.query as { searchParam: string };

  const myModels = await ListMyModelsService({ companyId, searchParam });

  return res.json(myModels);
};

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { name } = req.body;

  const myModel = await CreateMyModelService({ name, companyId });

  return res.status(201).json(myModel);
};

export const update = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  const { companyId } = req.user;
  const { name } = req.body;

  const myModel = await UpdateMyModelService({ id, name, companyId });

  return res.json(myModel);
};

export const remove = async (req: Request, res: Response): Promise<Response> => {
  const { id } = req.params;
  const { companyId } = req.user;

  await DeleteMyModelService({ id, companyId });

  return res.json({ message: "Deletado com sucesso" });
};
```

### 4. Criar Routes

```typescript
// src/routes/myModelRoutes.ts
import { Router } from "express";
import * as MyModelController from "../controllers/MyModelController";
import isAuth from "../middleware/isAuth";
import isAuthCompany from "../middleware/isAuthCompany";

const myModelRoutes = Router();

myModelRoutes.get(
  "/mymodels",
  isAuth,
  isAuthCompany,
  MyModelController.index
);

myModelRoutes.post(
  "/mymodels",
  isAuth,
  isAuthCompany,
  MyModelController.store
);

myModelRoutes.put(
  "/mymodels/:id",
  isAuth,
  isAuthCompany,
  MyModelController.update
);

myModelRoutes.delete(
  "/mymodels/:id",
  isAuth,
  isAuthCompany,
  MyModelController.remove
);

export default myModelRoutes;
```

```typescript
// src/routes/index.ts
import myModelRoutes from "./myModelRoutes";

// ...
routes.use(myModelRoutes);
```

### 5. Rodar Migration

```bash
npm run db:migrate
```

---

## Database

### Migrations

```bash
# Criar migration
npx sequelize-cli migration:generate --name my-migration-name

# Rodar migrations
npm run db:migrate

# Reverter última migration
npm run db:migrate:undo

# Reverter todas
npm run db:migrate:undo:all
```

### Seeders

```bash
# Criar seeder
npx sequelize-cli seed:generate --name my-seed-name

# Rodar seeders
npm run db:seed

# Reverter seeders
npm run db:seed:undo:all
```

### Queries Comuns

```typescript
// Find All
const records = await Model.findAll({
  where: { companyId },
  include: [{ model: RelatedModel }],
  order: [["createdAt", "DESC"]],
  limit: 20,
  offset: 0,
});

// Find One
const record = await Model.findOne({
  where: { id, companyId },
});

// Find by PK
const record = await Model.findByPk(id, {
  include: [RelatedModel],
});

// Create
const record = await Model.create({
  name: "Test",
  companyId,
});

// Update
await record.update({
  name: "Updated",
});

// Delete
await record.destroy();

// Count
const count = await Model.count({
  where: { companyId },
});

// Raw query
const [results] = await sequelize.query(
  "SELECT * FROM users WHERE email = ?",
  {
    replacements: [email],
    type: QueryTypes.SELECT,
  }
);
```

---

## Padrões de Código

### Error Handling

```typescript
// Custom Error
import AppError from "../errors/AppError";

throw new AppError("Mensagem de erro", 400);

// Try/Catch
try {
  await someAsyncOperation();
} catch (err) {
  throw new AppError("Erro ao processar", 500);
}

// Express async errors
import "express-async-errors";

// Controller (não precisa try/catch)
export const store = async (req, res) => {
  const data = await Service.create(req.body);
  return res.json(data);
};
```

### Validação

**Com Yup:**
```typescript
import * as Yup from "yup";

const schema = Yup.object().shape({
  name: Yup.string().required("Nome é obrigatório"),
  email: Yup.string().email("Email inválido").required(),
  age: Yup.number().min(18, "Maior de 18"),
});

await schema.validate(req.body, { abortEarly: false });
```

**Com Zod:**
```typescript
import { z } from "zod";

const schema = z.object({
  name: z.string().min(1, "Nome obrigatório"),
  email: z.string().email("Email inválido"),
  age: z.number().min(18, "Maior de 18"),
});

const validated = schema.parse(req.body);
```

### Logging

```typescript
import logger from "../utils/logger";

// Info
logger.info("Mensagem de info", { userId, action });

// Warn
logger.warn("Aviso", { data });

// Error
logger.error("Erro", { error, stack });

// Debug
logger.debug("Debug info", { details });
```

### Autenticação

```typescript
// Middleware isAuth
import isAuth from "../middleware/isAuth";

router.get("/protected", isAuth, controller);

// Acesso ao usuário
export const handler = async (req, res) => {
  const { userId, companyId, profile } = req.user;
  // ...
};
```

### Multi-Tenant

```typescript
// Sempre filtrar por companyId
import isAuthCompany from "../middleware/isAuthCompany";

router.get("/data", isAuth, isAuthCompany, controller);

// No service
const data = await Model.findAll({
  where: { companyId },
});
```

---

## Testing

### Jest Setup

```bash
npm test
```

### Unit Test Exemplo

```typescript
// __tests__/unit/CreateUserService.spec.ts
import CreateUserService from "../../services/UserServices/CreateUserService";
import User from "../../models/User";

describe("CreateUserService", () => {
  it("should create a user", async () => {
    const userData = {
      name: "Test User",
      email: "test@example.com",
      password: "123456",
      companyId: 1,
    };

    const user = await CreateUserService(userData);

    expect(user).toHaveProperty("id");
    expect(user.name).toBe("Test User");
    expect(user.email).toBe("test@example.com");
  });

  it("should not create duplicate email", async () => {
    const userData = {
      name: "Test",
      email: "duplicate@example.com",
      password: "123456",
      companyId: 1,
    };

    await CreateUserService(userData);

    await expect(
      CreateUserService(userData)
    ).rejects.toThrow("Email já cadastrado");
  });
});
```

---

## Debugging

### VS Code Launch Config

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "type": "node",
      "request": "launch",
      "name": "Debug Backend",
      "runtimeExecutable": "npm",
      "runtimeArgs": ["run", "dev:server"],
      "console": "integratedTerminal",
      "internalConsoleOptions": "neverOpen",
      "skipFiles": ["<node_internals>/**"]
    }
  ]
}
```

### Console Logs

```typescript
console.log("Debug:", variable);
console.error("Error:", error);
console.table(arrayOfObjects);
```

### Debugger

```typescript
debugger; // Breakpoint
```

---

## Deploy

### Build

```bash
npm run build
# Gera pasta dist/
```

### PM2 (Production)

```bash
# Instalar PM2
npm install -g pm2

# Start
pm2 start dist/server.js --name chatia-backend

# Logs
pm2 logs chatia-backend

# Restart
pm2 restart chatia-backend

# Stop
pm2 stop chatia-backend

# Delete
pm2 delete chatia-backend

# Startup (boot)
pm2 startup
pm2 save
```

### Docker

```dockerfile
FROM node:16-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist ./dist

EXPOSE 8080

CMD ["node", "dist/server.js"]
```

```bash
docker build -t chatia-backend .
docker run -p 8080:8080 \
  -e DB_HOST=postgres \
  -e REDIS_HOST=redis \
  chatia-backend
```

### Environment Variables

**Produção:**
```bash
NODE_ENV=production
DB_HOST=production-db-host
REDIS_HOST=production-redis-host
JWT_SECRET=super-secret-production-key
FRONTEND_URL=https://app.chatia.com
```

---

## Troubleshooting

### Database Connection Error

```bash
# Verificar se PostgreSQL está rodando
psql -U postgres -h localhost

# Verificar variáveis
echo $DB_HOST
echo $DB_NAME
```

### Redis Connection Error

```bash
# Verificar se Redis está rodando
redis-cli ping
# Deve retornar: PONG
```

### Port Already in Use

```bash
# Encontrar processo
lsof -i :8080

# Matar processo
kill -9 <PID>
```

### Migration Error

```bash
# Reverter e rodar novamente
npm run db:migrate:undo
npm run db:migrate
```

---

## Scripts Úteis

```bash
# Desenvolvimento
npm run dev:server

# Build
npm run build
npm run watch  # Build com watch mode

# Produção
npm start

# Database
npm run db:migrate
npm run db:migrate:undo
npm run db:seed

# Testes
npm test
npm run pretest   # Setup test DB
npm run posttest  # Teardown test DB

# Lint
npm run lint
```

---

## Recursos Úteis

- [Express Docs](https://expressjs.com/)
- [Sequelize Docs](https://sequelize.org/)
- [TypeScript Docs](https://www.typescriptlang.org/)
- [Socket.IO Docs](https://socket.io/)
- [Bull Docs](https://optimalbits.github.io/bull/)
- [Jest Docs](https://jestjs.io/)

---

---

## Avançado: Caching com Redis

### Redis Setup

```typescript
// src/libs/cache.ts
import Redis from 'ioredis';

const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  }
});

redis.on('error', (err) => {
  console.error('Redis error:', err);
});

export default redis;
```

### Cache Patterns

**Cache Aside:**
```typescript
import redis from '../libs/cache';

const getCachedTickets = async (companyId: number) => {
  const cacheKey = `tickets:${companyId}`;

  // 1. Try cache first
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }

  // 2. If miss, fetch from DB
  const tickets = await Ticket.findAll({ where: { companyId } });

  // 3. Store in cache (TTL 5 minutes)
  await redis.setex(cacheKey, 300, JSON.stringify(tickets));

  return tickets;
};
```

**Invalidação de Cache:**
```typescript
// After update
await Ticket.update({ status: 'closed' }, { where: { id } });
await redis.del(`tickets:${companyId}`);
await redis.del(`ticket:${id}`);
```

**Cache com Lock:**
```typescript
const acquireLock = async (key: string, ttl: number = 10) => {
  const lockKey = `lock:${key}`;
  const acquired = await redis.set(lockKey, '1', 'EX', ttl, 'NX');
  return acquired === 'OK';
};

const releaseLock = async (key: string) => {
  await redis.del(`lock:${key}`);
};
```

---

## Avançado: Segurança

### SQL Injection Protection

**✅ Usar Parametrização:**
```typescript
// CORRETO - Parâmetros são escapados automaticamente
const users = await User.findAll({
  where: { email: userInput }
});

// CORRETO - Raw query com replacements
const [results] = await sequelize.query(
  'SELECT * FROM Users WHERE email = ?',
  {
    replacements: [userInput],
    type: QueryTypes.SELECT
  }
);
```

**❌ NUNCA concatenar strings:**
```typescript
// ERRADO - Vulnerável a SQL Injection
const query = `SELECT * FROM Users WHERE email = '${userInput}'`;
await sequelize.query(query);
```

### XSS Protection

**Sanitização de Input:**
```typescript
import xss from 'xss';

const sanitizeInput = (input: string): string => {
  return xss(input, {
    whiteList: {}, // Remove todas as tags HTML
    stripIgnoreTag: true
  });
};

// Usar em controllers
export const store = async (req: Request, res: Response) => {
  const { name, description } = req.body;

  const sanitizedName = sanitizeInput(name);
  const sanitizedDescription = sanitizeInput(description);

  const data = await Service.create({
    name: sanitizedName,
    description: sanitizedDescription
  });

  return res.json(data);
};
```

### Rate Limiting Avançado

**Por IP:**
```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 requests
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      error: 'ERR_TOO_MANY_REQUESTS',
      message: 'Muitas requisições. Tente novamente em 15 minutos.'
    });
  }
});

app.use('/api/', limiter);
```

**Por Usuário:**
```typescript
import redis from './libs/cache';

const rateLimitByUser = async (req: Request, res: Response, next: NextFunction) => {
  const userId = req.user.id;
  const key = `ratelimit:${userId}`;

  const current = await redis.incr(key);

  if (current === 1) {
    await redis.expire(key, 60); // 1 minuto
  }

  if (current > 100) {
    return res.status(429).json({
      error: 'ERR_TOO_MANY_REQUESTS',
      message: 'Limite de requisições excedido'
    });
  }

  res.setHeader('X-RateLimit-Limit', '100');
  res.setHeader('X-RateLimit-Remaining', String(100 - current));

  next();
};
```

### CSRF Protection

```typescript
import csrf from 'csurf';

const csrfProtection = csrf({ cookie: true });

app.use(csrfProtection);

app.get('/form', (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

app.post('/submit', (req, res) => {
  // Token validado automaticamente
  res.json({ success: true });
});
```

---

## Avançado: Performance

### Query Optimization

**✅ Usar Índices:**
```typescript
// Migration
await queryInterface.addIndex('Tickets', ['companyId', 'status', 'createdAt'], {
  name: 'idx_tickets_company_status_date'
});
```

**✅ Select Específico:**
```typescript
// BOM - Seleciona apenas campos necessários
const tickets = await Ticket.findAll({
  attributes: ['id', 'status', 'contactId'],
  where: { companyId }
});

// RUIM - Seleciona tudo
const tickets = await Ticket.findAll({ where: { companyId } });
```

**✅ Eager Loading:**
```typescript
// BOM - 1 query com JOIN
const tickets = await Ticket.findAll({
  include: [
    { model: Contact, attributes: ['id', 'name'] },
    { model: User, attributes: ['id', 'name'] }
  ]
});

// RUIM - N+1 queries
const tickets = await Ticket.findAll();
for (const ticket of tickets) {
  const contact = await ticket.getContact();
}
```

### Connection Pooling

```typescript
// config/database.ts
module.exports = {
  pool: {
    max: 100,        // Máximo de conexões
    min: 15,         // Mínimo de conexões
    acquire: 30000,  // Timeout para adquirir conexão
    idle: 600000     // Tempo que conexão pode ficar idle
  }
};
```

### Background Jobs

**Processar Tarefas Pesadas:**
```typescript
import { Queue } from 'bull';
import redis from './libs/cache';

const heavyTaskQueue = new Queue('heavy-tasks', {
  redis: {
    host: process.env.REDIS_HOST,
    port: parseInt(process.env.REDIS_PORT)
  }
});

// Adicionar job
export const processHeavyTask = async (data: any) => {
  await heavyTaskQueue.add('process', data, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000
    }
  });
};

// Processar job
heavyTaskQueue.process('process', async (job) => {
  const { data } = job;

  // Processar dados...
  await someHeavyOperation(data);

  return { success: true };
});
```

---

## Avançado: Testing

### Integration Tests

```typescript
// __tests__/integration/tickets.spec.ts
import request from 'supertest';
import app from '../../src/app';
import { truncateAll } from '../utils/database';

describe('Tickets Integration', () => {
  let token: string;

  beforeAll(async () => {
    await truncateAll();

    // Login
    const response = await request(app)
      .post('/auth/login')
      .send({
        email: 'admin@test.com',
        password: '123456'
      });

    token = response.body.token;
  });

  it('should create a ticket', async () => {
    const response = await request(app)
      .post('/tickets')
      .set('Authorization', `Bearer ${token}`)
      .send({
        contactId: 1,
        userId: 1,
        status: 'open'
      });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('id');
    expect(response.body.status).toBe('open');
  });

  it('should list tickets', async () => {
    const response = await request(app)
      .get('/tickets')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.tickets).toBeInstanceOf(Array);
  });
});
```

### Mocking

```typescript
import * as WhatsAppService from '../../src/services/WhatsappService';

jest.mock('../../src/services/WhatsappService');

describe('SendMessage', () => {
  it('should send message via WhatsApp', async () => {
    const mockSend = jest.spyOn(WhatsAppService, 'sendMessage')
      .mockResolvedValue({
        id: 1,
        ack: 1,
        body: 'Test message'
      });

    const result = await sendMessageController(req, res);

    expect(mockSend).toHaveBeenCalledWith({
      number: '5511999999999',
      body: 'Test message'
    });

    mockSend.mockRestore();
  });
});
```

### E2E Tests

```typescript
// __tests__/e2e/ticket-flow.spec.ts
describe('Ticket Complete Flow', () => {
  it('should complete full ticket lifecycle', async () => {
    // 1. Create contact
    const contactRes = await request(app)
      .post('/contacts')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'John Doe', number: '5511999999999' });

    const contactId = contactRes.body.id;

    // 2. Create ticket
    const ticketRes = await request(app)
      .post('/tickets')
      .set('Authorization', `Bearer ${token}`)
      .send({ contactId, status: 'open' });

    const ticketId = ticketRes.body.id;

    // 3. Send message
    await request(app)
      .post(`/messages/${ticketId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ body: 'Hello!' });

    // 4. Close ticket
    const closeRes = await request(app)
      .put(`/tickets/${ticketId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'closed' });

    expect(closeRes.body.status).toBe('closed');
  });
});
```

---

## CI/CD Pipeline

### GitHub Actions

```yaml
# .github/workflows/ci.yml
name: CI

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: chatia_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

      redis:
        image: redis:7
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '16'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run migrations
        run: npm run db:migrate
        env:
          DB_HOST: localhost
          DB_PORT: 5432
          DB_NAME: chatia_test
          DB_USER: postgres
          DB_PASS: postgres

      - name: Run tests
        run: npm test
        env:
          NODE_ENV: test
          DB_HOST: localhost
          REDIS_HOST: localhost

      - name: Build
        run: npm run build

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
```

### Docker Build & Deploy

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Build Docker image
        run: docker build -t chatia-backend:${{ github.sha }} .

      - name: Push to registry
        run: |
          echo ${{ secrets.DOCKER_PASSWORD }} | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin
          docker push chatia-backend:${{ github.sha }}

      - name: Deploy to server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: ${{ secrets.SERVER_USER }}
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            docker pull chatia-backend:${{ github.sha }}
            docker stop chatia-backend || true
            docker rm chatia-backend || true
            docker run -d --name chatia-backend \
              -p 8080:8080 \
              -e DB_HOST=${{ secrets.DB_HOST }} \
              -e REDIS_HOST=${{ secrets.REDIS_HOST }} \
              chatia-backend:${{ github.sha }}
```

---

## Monitoramento e Observability

### Logging Estratégico

```typescript
// src/utils/logger.ts
import winston from 'winston';
import 'winston-daily-rotate-file';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    // Erro logs
    new winston.transports.DailyRotateFile({
      filename: 'logs/error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxSize: '20m',
      maxFiles: '14d'
    }),

    // Combined logs
    new winston.transports.DailyRotateFile({
      filename: 'logs/combined-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d'
    }),

    // Console (desenvolvimento)
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

export default logger;
```

**Uso:**
```typescript
import logger from '../utils/logger';

// Contextual logging
logger.info('User logged in', {
  userId: user.id,
  companyId: user.companyId,
  ip: req.ip
});

logger.error('Failed to send message', {
  ticketId,
  error: err.message,
  stack: err.stack
});
```

### Sentry Integration

```typescript
// src/app.ts
import * as Sentry from '@sentry/node';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 1.0
});

// Request handler (deve ser o primeiro middleware)
app.use(Sentry.Handlers.requestHandler());

// Rotas...

// Error handler (deve ser o último middleware)
app.use(Sentry.Handlers.errorHandler());
```

### Health Checks

```typescript
// src/routes/healthRoutes.ts
import { Router } from 'express';
import sequelize from '../database';
import redis from '../libs/cache';

const healthRoutes = Router();

healthRoutes.get('/health', async (req, res) => {
  try {
    // Check database
    await sequelize.authenticate();

    // Check Redis
    await redis.ping();

    return res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {
        database: 'up',
        redis: 'up'
      }
    });
  } catch (err) {
    return res.status(503).json({
      status: 'unhealthy',
      error: err.message
    });
  }
});

healthRoutes.get('/ready', async (req, res) => {
  // Verificar se app está pronto para receber tráfego
  res.json({ ready: true });
});

export default healthRoutes;
```

---

## Git Workflow

### Branch Strategy

```
main         (produção)
├── develop  (desenvolvimento)
    ├── feature/add-chat
    ├── feature/improve-notifications
    ├── bugfix/fix-message-ack
    └── hotfix/critical-security-patch
```

### Commit Messages

**Padrão Conventional Commits:**
```bash
# Features
git commit -m "feat: add internal chat functionality"

# Bug fixes
git commit -m "fix: correct message ACK status update"

# Documentation
git commit -m "docs: update API documentation"

# Refactoring
git commit -m "refactor: improve ticket service structure"

# Performance
git commit -m "perf: optimize contact search query"

# Tests
git commit -m "test: add integration tests for tickets"
```

### Pre-commit Hooks

```json
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "pre-push": "npm test"
    }
  },
  "lint-staged": {
    "*.ts": [
      "eslint --fix",
      "prettier --write"
    ]
  }
}
```

---

## Code Review Checklist

### Segurança
- [ ] Validação de entrada de usuário
- [ ] Parâmetros de query escapados
- [ ] Rate limiting implementado
- [ ] Autenticação/autorização verificada
- [ ] Dados sensíveis não expostos em logs

### Performance
- [ ] Queries otimizadas (sem N+1)
- [ ] Índices criados se necessário
- [ ] Cache implementado quando apropriado
- [ ] Paginação para listas grandes

### Qualidade de Código
- [ ] Código segue padrões do projeto
- [ ] Funções com responsabilidade única
- [ ] Nomenclatura clara e descritiva
- [ ] Comentários quando necessário
- [ ] Sem código comentado/morto

### Testes
- [ ] Testes unitários escritos
- [ ] Casos de sucesso cobertos
- [ ] Casos de erro cobertos
- [ ] Cobertura mínima de 80%

### Documentação
- [ ] README atualizado se necessário
- [ ] API docs atualizadas
- [ ] Comentários em código complexo

---

## Environment Management

### .env Structure

```bash
# .env.example
# ============================================
# AMBIENTE
# ============================================
NODE_ENV=development

# ============================================
# SERVIDOR
# ============================================
BACKEND_PORT=8080
BACKEND_URL=http://localhost:8080
FRONTEND_URL=http://localhost:3000

# ============================================
# DATABASE
# ============================================
DB_DIALECT=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=chatia
DB_USER=postgres
DB_PASS=postgres

# Pool de conexões
DB_POOL_MAX=100
DB_POOL_MIN=15
DB_POOL_ACQUIRE=30000
DB_POOL_IDLE=600000

# ============================================
# REDIS
# ============================================
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# ============================================
# JWT
# ============================================
JWT_SECRET=change-me-in-production
JWT_REFRESH_SECRET=change-me-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# ============================================
# INTEGRATIONS
# ============================================
OPENAI_API_KEY=
DIALOGFLOW_PROJECT_ID=

# ============================================
# MONITORING
# ============================================
SENTRY_DSN=
```

### Environment Validation

```typescript
// src/config/validateEnv.ts
import * as Joi from 'joi';

const envSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),

  BACKEND_PORT: Joi.number().default(8080),

  DB_HOST: Joi.string().required(),
  DB_PORT: Joi.number().default(5432),
  DB_NAME: Joi.string().required(),
  DB_USER: Joi.string().required(),
  DB_PASS: Joi.string().required(),

  JWT_SECRET: Joi.string().min(32).required(),
  JWT_REFRESH_SECRET: Joi.string().min(32).required(),

  REDIS_HOST: Joi.string().required(),
  REDIS_PORT: Joi.number().default(6379)
}).unknown();

const { error, value: validatedEnv } = envSchema.validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

export default validatedEnv;
```

---

## Backup Strategies

### Database Backup

```bash
#!/bin/bash
# scripts/backup-database.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/postgres"
BACKUP_FILE="$BACKUP_DIR/chatia_$DATE.sql"

# Create backup directory
mkdir -p $BACKUP_DIR

# Dump database
pg_dump -h $DB_HOST -U $DB_USER -d $DB_NAME > $BACKUP_FILE

# Compress
gzip $BACKUP_FILE

# Keep only last 30 days
find $BACKUP_DIR -name "*.gz" -mtime +30 -delete

echo "Backup completed: ${BACKUP_FILE}.gz"
```

### Automated Backup (Cron)

```bash
# Crontab - Backup diário às 3am
0 3 * * * /opt/chatia/scripts/backup-database.sh
```

---

**Última Atualização:** 2025-10-12
**Versão:** 2.2.2v-26
**Cobertura**: Setup, Development, Testing, CI/CD, Monitoring, Security, Performance
