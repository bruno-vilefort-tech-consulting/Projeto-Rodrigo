# 📚 Documentação Backend - ChatIA Flow

> Documentação completa do backend Node.js/TypeScript

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [Arquitetura](#arquitetura)
3. [Tecnologias](#tecnologias)
4. [Estrutura](#estrutura)
5. [Database](#database)
6. [Autenticação](#autenticação)
7. [Multi-Tenant](#multi-tenant)
8. [Real-time](#real-time)
9. [Integrações](#integrações)
10. [Deploy](#deploy)

---

## Visão Geral

**ChatIA Flow Backend** é uma API REST robusta construída com Node.js, TypeScript e Express, com suporte a WebSocket para comunicação em tempo real.

### Características

- 🚀 **API REST** completa com 200+ endpoints
- 🔄 **Real-time** com Socket.IO 4.7.4
- 🗄️ **PostgreSQL** com Sequelize ORM
- 📨 **WhatsApp** via Baileys (multi-device)
- 🔐 **JWT** Authentication + Refresh Token
- 🏢 **Multi-tenant** isolamento por empresa
- 🎯 **Bull Queue** para jobs assíncronos
- 🤖 **IA** OpenAI, Dialogflow, Gemini
- 🔌 **Integrações** N8N, Typebot, MercadoPago

### Métricas

| Métrica | Valor |
|---------|-------|
| Código TypeScript | ~61.743 linhas |
| Models | 55+ |
| Controllers | 45+ |
| Services | 50+ |
| Routes | 44+ |
| Migrations | 93+ |
| Helpers | 29+ |
| Dependencies | 102 |

---

## Arquitetura

### Padrão MVC + Services

```
┌─────────────┐
│   Client    │
│ (Frontend)  │
└──────┬──────┘
       │ HTTP/WebSocket
       ▼
┌─────────────┐
│   Routes    │ (44+)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Middleware  │ (Auth, Validation)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│Controllers  │ (45+)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Services   │ (50+) - Business Logic
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Models    │ (55+) - Sequelize
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Database   │ (PostgreSQL)
└─────────────┘
```

### Camadas

1. **Routes**: Definição de endpoints
2. **Middleware**: Autenticação, validação, logging
3. **Controllers**: Orquestração de requisições
4. **Services**: Lógica de negócio
5. **Models**: Representação de dados (ORM)
6. **Database**: Persistência (PostgreSQL)

### Padrões Utilizados

- **Repository Pattern** (Services layer)
- **Dependency Injection** (via imports)
- **Factory Pattern** (Model creation)
- **Observer Pattern** (Socket.IO events)
- **Queue Pattern** (Bull for async jobs)

---

## Tecnologias

### Core Stack

```json
{
  "node": "16+",
  "typescript": "4.2+",
  "express": "4.17.3",
  "sequelize": "5.22.3",
  "sequelize-typescript": "1.1.0",
  "pg": "8.7.3",
  "socket.io": "4.7.4",
  "ioredis": "5.3.0",
  "bull": "3.11.0"
}
```

### Database & Cache

- **PostgreSQL 12+**: Database principal
- **Redis 6+**: Cache + Queue
- **Sequelize**: ORM TypeScript
- **93 Migrations**: Schema versionado

### WhatsApp Integration

```json
{
  "@whiskeysockets/baileys": "nightly",
  "qrcode-terminal": "0.12.0",
  "sharp": "image processing",
  "fluent-ffmpeg": "media conversion"
}
```

### IA & NLP

```json
{
  "openai": "4.24.7",
  "@google-cloud/dialogflow": "5.9.0",
  "@google/generative-ai": "0.24.1"
}
```

### Segurança

```json
{
  "helmet": "7.1.0",
  "cors": "2.8.5",
  "bcryptjs": "2.4.3",
  "jsonwebtoken": "8.5.1",
  "express-rate-limit": "rate limiting"
}
```

### Utilitários

```json
{
  "moment-timezone": "0.6.0",
  "axios": "1.5.0",
  "multer": "1.4.4",
  "yup": "0.32.11",
  "zod": "3.23.8",
  "winston": "3.13.0",
  "pino": "7.8.0"
}
```

---

## Estrutura

### Diretórios Principais

```
src/
├── app.ts                 # Express setup
├── server.ts             # Server entry point
├── bootstrap.ts          # App bootstrap
├── queues.ts            # Queue setup
│
├── @types/              # TypeScript types
├── config/              # Configurações
├── controllers/         # 45+ Controllers
├── models/              # 55+ Models
├── services/            # 50+ Services
├── routes/              # 44+ Routes
├── middleware/          # Auth & validation
├── database/            # Migrations & seeds
├── libs/                # Core libs (socket, wbot)
├── helpers/             # 29+ Helpers
├── utils/               # Utilities
├── jobs/                # Background jobs
├── queues/              # Queue processors
├── errors/              # Custom errors
└── scripts/             # Utility scripts
```

### Convenções

**Naming:**
- Models: PascalCase (`User.ts`)
- Services: PascalCase + Service (`UserService/`)
- Controllers: PascalCase + Controller (`UserController.ts`)
- Routes: camelCase + Routes (`userRoutes.ts`)

**File Structure:**
```typescript
// Controller
import Service from '../services/Service';
export const index = async (req, res) => {
  const data = await Service.list();
  return res.json(data);
};

// Service
import Model from '../models/Model';
export const list = async () => {
  return await Model.findAll();
};
```

---

## Database

### PostgreSQL Configuration

```typescript
// config/database.ts
{
  dialect: "postgres",
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  pool: {
    max: 100,      // Max connections
    min: 15,       // Min connections
    acquire: 30000,
    idle: 600000
  },
  logging: false,
  timezone: "+00:00"
}
```

### Models (55+)

**Core Models:**
- User, Contact, Ticket, Message
- Company, Queue, Whatsapp
- Campaign, FlowBuilder
- QueueIntegration, Tag

**Relações:**
```typescript
// User
User.hasMany(Ticket);
User.belongsTo(Company);
User.belongsToMany(Queue, { through: UserQueue });

// Ticket
Ticket.belongsTo(Contact);
Ticket.belongsTo(User);
Ticket.belongsTo(Queue);
Ticket.belongsTo(Whatsapp);
Ticket.hasMany(Message);
Ticket.belongsToMany(Tag, { through: TicketTag });
```

### Migrations

93 migrations versionando schema:
```bash
npm run db:migrate          # Run all
npm run db:migrate:undo     # Undo last
npm run db:migrate:undo:all # Reset
```

Principais migrations:
- `20200717133438-create-users.ts`
- `20200717145643-create-tickets.ts`
- `20200717170223-create-whatsapps.ts`
- `20210109192518-add-column-companyId-*`
- `20230802214345-create-table-flowbuilder.ts`

📖 **Ver [docs/MODELS.md](./docs/MODELS.md) para todos os models**

---

## Autenticação

### JWT Strategy

**Access Token:**
- Expira em 15 minutos
- Payload: `{ userId, companyId, profile }`
- Header: `Authorization: Bearer <token>`

**Refresh Token:**
- Expira em 7 dias
- Armazenado em cookie HTTP-only
- Rotação automática

### Fluxo de Auth

```
1. POST /auth/login { email, password }
2. Validate credentials
3. Generate access + refresh tokens
4. Return tokens
5. Client stores access token
6. Client includes token in requests
7. Middleware validates token
8. On 403, refresh via POST /auth/refresh
9. Repeat from step 3
```

### Middleware

```typescript
// middleware/isAuth.ts
export default async (req, res, next) => {
  const token = req.headers.authorization?.replace('Bearer ', '');

  if (!token) {
    throw new AppError("Token não fornecido", 403);
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.userId = decoded.userId;
    req.companyId = decoded.companyId;
    req.profile = decoded.profile;
    return next();
  } catch (err) {
    throw new AppError("Token inválido", 403);
  }
};
```

### RBAC

**Perfis:**
- `admin`: Acesso total na empresa
- `user`: Acesso limitado
- `super`: Multi-empresa (apenas infra)

**Verificação:**
```typescript
// middleware/isSuper.ts
if (req.profile !== "super") {
  throw new AppError("Acesso negado", 403);
}
```

📖 **Ver [docs/AUTHENTICATION.md](./docs/AUTHENTICATION.md)**

---

## Multi-Tenant

### Isolamento por Company

Cada empresa (`companyId`) tem dados isolados:

```typescript
// Middleware
import isAuthCompany from './middleware/isAuthCompany';

// Aplicado em todas as rotas
router.get('/tickets', isAuth, isAuthCompany, TicketController.index);

// isAuthCompany.ts
export default async (req, res, next) => {
  const { companyId } = req.user;

  // Injeta companyId em todas as queries
  req.companyId = companyId;

  next();
};
```

### Estrutura

```
Company 1                  Company 2
├── Users                 ├── Users
├── Contacts              ├── Contacts
├── Tickets               ├── Tickets
├── Messages              ├── Messages
├── Whatsapps             ├── Whatsapps
├── Queues                ├── Queues
└── Settings              └── Settings
```

### Query Scoping

```typescript
// Sempre filtra por companyId
const tickets = await Ticket.findAll({
  where: {
    companyId: req.user.companyId,
    status: 'open'
  }
});
```

---

## Real-time

### Socket.IO Setup

```typescript
// libs/socket.ts
import { Server } from "socket.io";

export const initIO = (httpServer) => {
  const io = new Server(httpServer, {
    cors: { origin: FRONTEND_URL, credentials: true },
    maxHttpBufferSize: 1e6,
    pingTimeout: 20000,
    pingInterval: 25000
  });

  // JWT Middleware
  io.use((socket, next) => {
    const token = socket.handshake.query.token;
    const decoded = jwt.verify(token, JWT_SECRET);
    socket.data.user = decoded;
    next();
  });

  // Namespaces dinâmicos
  io.of(/^\/workspace-\d+$/).on('connection', handleConnection);

  return io;
};
```

### Eventos

**Emitidos pelo server:**
```typescript
const io = getIO();
const namespace = io.of(`/workspace-${companyId}`);

// Ticket atualizado
namespace.emit(`company-${companyId}-ticket`, {
  action: "update",
  ticket: ticketData
});

// Nova mensagem
namespace.emit(`company-${companyId}-appMessage`, {
  action: "create",
  message: messageData,
  ticket: ticketData
});
```

**Recebidos do client:**
```typescript
socket.on('joinChatBox', (ticketId) => {
  socket.join(ticketId);
});

socket.on('leaveChatBox', (ticketId) => {
  socket.leave(ticketId);
});
```

### Rooms (Salas)

- `notification`: Notificações globais
- `{ticketId}`: Sala específica do ticket
- `open`, `pending`, `closed`: Salas por status

📖 **Ver [docs/WEBSOCKET.md](./docs/WEBSOCKET.md)**

---

## Integrações

### WhatsApp (Baileys)

```typescript
// libs/wbot.ts
import makeWASocket from '@whiskeysockets/baileys';

const sock = makeWASocket({
  auth: state,
  printQRInTerminal: true,
  logger: pino({ level: 'silent' })
});

sock.ev.on('messages.upsert', handleMessage);
sock.ev.on('connection.update', handleConnection);
```

### OpenAI

```typescript
// services/OpenAiService
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: OPENAI_API_KEY });

const completion = await openai.chat.completions.create({
  model: "gpt-4",
  messages: [{ role: "user", content: prompt }]
});
```

### Dialogflow

```typescript
import dialogflow from '@google-cloud/dialogflow';

const sessionClient = new dialogflow.SessionsClient({
  credentials: JSON.parse(DIALOGFLOW_CREDENTIALS)
});

const responses = await sessionClient.detectIntent(request);
```

### N8N Webhooks

```typescript
// Queue Integration
const response = await axios.post(integration.urlN8N, {
  message: messageData,
  contact: contactData,
  ticket: ticketData
});
```

📖 **Ver [docs/INTEGRATIONS.md](./docs/INTEGRATIONS.md)**

---

## Deploy

### Desenvolvimento

```bash
npm run dev:server
# http://localhost:8080
```

### Produção (PM2)

```bash
npm run build
pm2 start ecosystem.config.js
pm2 logs chatia-backend
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

### Environment Variables

```bash
NODE_ENV=production
DB_HOST=postgres
DB_NAME=chatia_prod
JWT_SECRET=super-secret-key
REDIS_HOST=redis
FRONTEND_URL=https://app.chatia.com
```

📖 **Ver [docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)**

---

## 📚 Documentação Detalhada

- **[docs/MODELS.md](./docs/MODELS.md)** - 55+ Models
- **[docs/API.md](./docs/API.md)** - Endpoints REST
- **[docs/SERVICES.md](./docs/SERVICES.md)** - Business Logic
- **[docs/WEBSOCKET.md](./docs/WEBSOCKET.md)** - Real-time
- **[docs/DATABASE.md](./docs/DATABASE.md)** - PostgreSQL
- **[docs/DEVELOPMENT.md](./docs/DEVELOPMENT.md)** - Dev Guide

---

**Versão:** 2.2.2v-26
**Última Atualização:** 2025-10-12
