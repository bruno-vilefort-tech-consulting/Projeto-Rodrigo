# ChatIA Flow - Backend

> Sistema backend Node.js/TypeScript para multi-atendimento via WhatsApp

[![Node.js](https://img.shields.io/badge/Node.js-16+-green.svg)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-4.2+-blue.svg)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-4.17-lightgrey.svg)](https://expressjs.com/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.7.4-black.svg)](https://socket.io/)
[![Sequelize](https://img.shields.io/badge/Sequelize-5.22-blue.svg)](https://sequelize.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-12+-blue.svg)](https://www.postgresql.org/)

---

## 📚 Documentação Completa

### 🎯 Documentos Principais

- **[README.md](./README.md)** - Visão geral e quick start (você está aqui!)
- **[DOCUMENTATION.md](./DOCUMENTATION.md)** - Arquitetura completa (13 KB)

### 🏗️ Arquitetura e Estrutura

- **[MODELS.md](./MODELS.md)** - 55 models Sequelize-TypeScript (34 KB)
- **[API.md](./API.md)** - 250+ endpoints REST completos (36 KB)
- **[SERVICES.md](./SERVICES.md)** - 320+ services documentados (52 KB)
- **[DATABASE.md](./DATABASE.md)** - Schema, migrations e otimizações (25 KB)

### 🔐 Autenticação e Segurança

- **[AUTHENTICATION.md](./AUTHENTICATION.md)** - JWT, RBAC e refresh tokens (12 KB)
- **[MIDDLEWARE.md](./MIDDLEWARE.md)** - Express middleware (5.5 KB)

### ⚡ Real-time e Processamento

- **[WEBSOCKET.md](./WEBSOCKET.md)** - Socket.IO e namespaces (38 KB)
- **[QUEUES.md](./QUEUES.md)** - Bull queues e background jobs (48 KB)

### 🔌 Integrações e Bibliotecas

- **[INTEGRATIONS.md](./INTEGRATIONS.md)** - OpenAI, Dialogflow, N8N, Typebot (34 KB)
- **[LIBS.md](./LIBS.md)** - Core libraries (wbot, socket, cache) (26 KB)
- **[HELPERS.md](./HELPERS.md)** - 29 helper functions (62 KB)

### 🚀 Deploy e Desenvolvimento

- **[DEVELOPMENT.md](./DEVELOPMENT.md)** - Guia completo de desenvolvimento (34 KB)
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Docker, PM2, Nginx, SSL (33 KB)

**Total:** 15 documentos | ~465 KB

---

## 🚀 Quick Start

```bash
# Instalar dependências
npm install

# Configurar ambiente
cp .env.example .env
# Editar .env com suas configurações

# Criar database
createdb chatia

# Rodar migrations
npm run db:migrate

# Rodar seeders (opcional)
npm run db:seed

# Desenvolvimento
npm run dev:server

# Build
npm run build

# Produção
npm start
```

---

## 📊 Visão Geral

### Características Principais

✅ **API REST** completa com Express.js
✅ **WebSocket** real-time com Socket.IO
✅ **ORM** Sequelize-TypeScript
✅ **Database** PostgreSQL com pool otimizado
✅ **Cache & Queues** Redis + Bull
✅ **WhatsApp** integração via Baileys
✅ **Multi-tenant** suporte a múltiplas empresas
✅ **JWT Authentication** com refresh tokens
✅ **RBAC** sistema de permissões granular
✅ **Integrações** OpenAI, Dialogflow, N8N, Typebot

### Stack Tecnológico

**Core:**
- **Runtime**: Node.js 16+
- **Language**: TypeScript 4.2+
- **Framework**: Express.js 4.17
- **ORM**: Sequelize-TypeScript 1.1
- **Database**: PostgreSQL 12+
- **Cache**: Redis + IORedis
- **Queue**: Bull 3.11

**Real-time:**
- **Socket.IO**: 4.7.4
- **Socket.IO Admin UI**: 0.5.1

**WhatsApp:**
- **Baileys**: @whiskeysockets/baileys (nightly)
- **QR Code Terminal**: 0.12.0

**Integrações:**
- **OpenAI**: 4.24.7
- **Dialogflow**: @google-cloud/dialogflow 5.9.0
- **Google Gemini**: @google/generative-ai 0.24.1
- **MercadoPago**: 2.0.15

**Segurança:**
- **JWT**: jsonwebtoken 8.5.1
- **Bcrypt**: bcryptjs 2.4.3
- **Helmet**: 7.1.0
- **CORS**: 2.8.5

**Utilitários:**
- **Moment**: moment-timezone 0.6.0
- **Axios**: 1.5.0
- **Multer**: 1.4.4 (upload)
- **Yup**: 0.32.11 (validação)
- **Zod**: 3.23.8 (validação)
- **Winston**: 3.13.0 (logs)
- **Pino**: 7.8.0 (logs)

---

## 📁 Estrutura do Projeto

```
backend/
├── src/
│   ├── @types/              # TypeScript definitions
│   ├── app.ts              # Express app setup
│   ├── server.ts           # Server entry point
│   ├── bootstrap.ts        # Bootstrap configuration
│   ├── queues.ts           # Queue setup
│   │
│   ├── config/             # Configurações
│   │   ├── database.ts     # Sequelize config
│   │   ├── upload.ts       # Multer config
│   │   └── auth.ts         # JWT config
│   │
│   ├── controllers/        # 45+ Controllers
│   │   ├── AuthController.ts
│   │   ├── TicketController.ts
│   │   ├── MessageController.ts
│   │   ├── ContactController.ts
│   │   ├── UserController.ts
│   │   └── ... (40+ outros)
│   │
│   ├── models/             # 55+ Models (Sequelize)
│   │   ├── User.ts
│   │   ├── Contact.ts
│   │   ├── Ticket.ts
│   │   ├── Message.ts
│   │   ├── Company.ts
│   │   ├── Queue.ts
│   │   ├── Whatsapp.ts
│   │   └── ... (48+ outros)
│   │
│   ├── services/           # 50+ Services
│   │   ├── AuthServices/
│   │   ├── ContactServices/
│   │   ├── MessageServices/
│   │   ├── TicketServices/
│   │   ├── WbotServices/   # WhatsApp (20+ files)
│   │   ├── CampaignService/
│   │   ├── FlowBuilderService/
│   │   └── ... (43+ outros)
│   │
│   ├── routes/             # 44+ Routes
│   │   ├── index.ts        # Route aggregator
│   │   ├── authRoutes.ts
│   │   ├── ticketRoutes.ts
│   │   ├── messageRoutes.ts
│   │   └── ... (40+ outros)
│   │
│   ├── middleware/         # Middlewares
│   │   ├── isAuth.ts       # JWT validation
│   │   ├── isAuthCompany.ts# Multi-tenant
│   │   ├── isSuper.ts      # Super user
│   │   └── tokenAuth.ts
│   │
│   ├── database/
│   │   ├── index.ts        # Sequelize connection
│   │   ├── migrations/     # 93+ migrations
│   │   └── seeds/          # Database seeders
│   │
│   ├── libs/               # Libraries
│   │   ├── socket.ts       # Socket.IO setup
│   │   ├── wbot.ts         # WhatsApp bot
│   │   ├── queue.ts        # Bull queue
│   │   ├── cache.ts        # Redis cache
│   │   └── store.ts        # State management
│   │
│   ├── helpers/            # 29+ Helpers
│   │   ├── CheckSettings.ts
│   │   ├── Mustache.ts
│   │   ├── SendMessage.ts
│   │   └── ... (26+ outros)
│   │
│   ├── utils/              # Utilities
│   │   ├── logger.ts       # Winston/Pino
│   │   └── ... (outros)
│   │
│   ├── jobs/               # Background jobs
│   ├── queues/             # Queue processors
│   ├── errors/             # Custom errors
│   └── scripts/            # Utility scripts
│
├── public/                 # Static files
├── certs/                  # SSL certificates
├── .env                    # Environment variables
├── package.json
├── tsconfig.json
├── jest.config.js
└── README.md
```

---

## 📊 Métricas do Projeto

| Métrica | Valor |
|---------|-------|
| Linhas de código TS | ~61.743 |
| Models | 55+ |
| Controllers | 45+ |
| Services | 50+ |
| Routes | 44+ |
| Migrations | 93+ |
| Helpers | 29+ |
| Dependências | 102 |

---

## 🔐 Autenticação e Segurança

### JWT Authentication
- Access token (exp: 15min)
- Refresh token (exp: 7 dias)
- Middleware de validação
- Token rotation automática

### RBAC (Role-Based Access Control)
- **admin**: Acesso completo
- **user**: Acesso limitado
- **super**: Super usuário (multi-tenant)

### Segurança
- Helmet (headers HTTP seguros)
- CORS configurável
- Rate limiting
- SQL injection protection (Sequelize)
- XSS protection
- Bcrypt para passwords

---

## 🗄️ Database

### PostgreSQL
```bash
# Criar database
createdb chatia

# Rodar migrations
npm run db:migrate

# Reverter migration
npm run db:migrate:undo

# Seeders
npm run db:seed
npm run db:seed:undo:all
```

### Pool de Conexões
```typescript
{
  max: 100,      // Máximo de conexões
  min: 15,       // Mínimo de conexões
  acquire: 30000, // Timeout de aquisição
  idle: 600000   // Timeout de idle
}
```

---

## 🔄 Real-time (Socket.IO)

### Eventos Principais

**Server → Client:**
- `company-{id}-ticket` - Atualizações de tickets
- `company-{id}-appMessage` - Novas mensagens
- `company-{id}-contact` - Atualizações de contatos
- `company-{id}-user` - Atualizações de usuários
- `company-{id}-chat` - Chat interno
- `company-{id}-whatsappSession` - Status de conexão
- `company-{id}-auth` - Multi-device auth

**Client → Server:**
- `joinChatBox` - Entrar em sala de ticket
- `leaveChatBox` - Sair de sala
- `joinTickets` - Entrar em sala de status
- `joinNotification` - Notificações

📖 **Ver [WEBSOCKET.md](./docs/WEBSOCKET.md) para detalhes**

---

## 📨 WhatsApp Integration

### Baileys (Multi-Device)
- Conexão via QR Code
- Múltiplas sessões simultâneas
- Suporte a grupos
- Envio de mídia (imagem, vídeo, áudio, documento)
- Localização e contatos
- Mensagens agendadas
- Import de conversas antigas

### Tipos de Mensagem
- Texto
- Imagem
- Vídeo
- Áudio (voz)
- Documento (PDF, etc)
- Localização
- Contato (vCard)
- Botões interativos
- Listas

📖 **Ver [docs/WHATSAPP.md](./docs/WHATSAPP.md) para detalhes**

---

## 🎯 Filas e Jobs (Bull)

### Queues Disponíveis
- **messageQueue**: Processamento de mensagens
- **sendScheduledMessages**: Mensagens agendadas
- **campaignQueue**: Envio de campanhas
- **importContactsQueue**: Importação de contatos

### Bull Board
Interface web para monitoramento de filas:
```
http://localhost:8080/admin/queues
```

Autenticação via Basic Auth (BULL_USER/BULL_PASS)

---

## 🔌 Integrações

### IA e NLP
- **OpenAI** (GPT-4, Whisper) - Chat e transcrição
- **Dialogflow** - NLU e chatbots
- **Google Gemini** - IA generativa

### Automação
- **N8N** - Webhooks e workflows
- **Typebot** - Chatbot builder

### Pagamentos
- **MercadoPago** - Gateway de pagamento
- **Asaas** - Cobranças recorrentes

### ERP/CRM
- **Bling** - Integração com ERP
- **Supabase** - Backend as a Service

### Outros
- **Facebook/Instagram** - Mensagens
- **Webhooks** - Customizáveis

📖 **Ver [docs/INTEGRATIONS.md](./docs/INTEGRATIONS.md) para detalhes**

---

## 🌍 Multi-Tenant

Sistema preparado para múltiplas empresas:

```typescript
// Isolamento por companyId
const tickets = await Ticket.findAll({
  where: { companyId: req.user.companyId }
});

// Middleware de isolamento
import isAuthCompany from './middleware/isAuthCompany';
router.get('/tickets', isAuthCompany, TicketController.index);
```

Cada empresa tem:
- Usuários isolados
- Tickets isolados
- Contatos isolados
- Conexões WhatsApp isoladas
- Configurações próprias
- Plano e recursos específicos

---

## 🛠️ Desenvolvimento

### Scripts Disponíveis

```bash
# Desenvolvimento com hot-reload
npm run dev:server

# Build TypeScript
npm run build

# Produção
npm start

# Testes
npm test
npm run pretest
npm run posttest

# Migrations
npm run db:migrate
npm run db:migrate:undo
npm run db:migrate:undo:all

# Seeders
npm run db:seed
npm run db:seed:undo:all

# Lint
npm run lint
```

### Variáveis de Ambiente

Ver arquivo `.env` para configuração completa:
- `NODE_ENV` - Ambiente (development/production)
- `DB_*` - Configurações do PostgreSQL
- `REDIS_*` - Configurações do Redis
- `JWT_SECRET` - Secret para JWT
- `BACKEND_URL` / `FRONTEND_URL`
- E mais 30+ variáveis...

📖 **Ver [DEVELOPMENT.md](./docs/DEVELOPMENT.md) para guia completo**

---

## 🧪 Testes

```bash
npm test
```

Framework: Jest 27
Coverage: Em desenvolvimento

---

## 📦 Deploy

### Desenvolvimento Local
```bash
npm run dev:server
```

### Produção (PM2)
```bash
pm2 start dist/server.js --name chatia-backend
pm2 logs chatia-backend
pm2 restart chatia-backend
```

### Docker
```dockerfile
FROM node:16-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
CMD ["node", "dist/server.js"]
```

### Cluster Mode
```bash
# server-cluster.ts disponível para multi-core
node dist/server-cluster.js
```

---

## 📈 Monitoramento

### Logs
- **Winston**: Logs estruturados
- **Pino**: Logs de performance
- **Sentry**: Error tracking

### Métricas
- Bull Board para filas
- Socket.IO Admin UI para WebSocket

---

## 🔗 APIs Principais

### Autenticação
```bash
POST   /auth/login
POST   /auth/refresh
DELETE /auth/logout
GET    /auth/me
```

### Tickets
```bash
GET    /tickets
POST   /tickets
GET    /tickets/:id
PUT    /tickets/:id
DELETE /tickets/:id
```

### Mensagens
```bash
GET    /messages/:ticketId
POST   /messages/:ticketId
PUT    /messages/:messageId
DELETE /messages/:messageId
```

### WhatsApp
```bash
GET    /whatsapp
POST   /whatsapp
PUT    /whatsapp/:id
DELETE /whatsapp/:id
POST   /whatsapp/start-session
```

📖 **Ver [API.md](./docs/API.md) para lista completa (200+ endpoints)**

---

## 🤝 Contribuindo

1. Criar branch: `git checkout -b feature/nova-feature`
2. Commit: `git commit -m 'feat: adicionar nova feature'`
3. Push: `git push origin feature/nova-feature`
4. Pull Request

**Convenção de Commits**: [Conventional Commits](https://www.conventionalcommits.org/)

---

## 📄 Licença

Propriedade privada - Todos os direitos reservados.

---

## 📞 Suporte

- Email: suporte@chatia.com
- Documentação: [DOCUMENTATION.md](./DOCUMENTATION.md)

---

## 🔗 Links Úteis

- [Express.js Docs](https://expressjs.com/)
- [Sequelize Docs](https://sequelize.org/)
- [Socket.IO Docs](https://socket.io/)
- [TypeScript Docs](https://www.typescriptlang.org/)
- [Baileys Docs](https://github.com/WhiskeySockets/Baileys)
- [Bull Docs](https://optimalbits.github.io/bull/)

---

**Versão:** 2.2.2v-26
**Última Atualização:** 2025-10-12
**Node:** 16+
**PostgreSQL:** 12+
**Redis:** 6+
