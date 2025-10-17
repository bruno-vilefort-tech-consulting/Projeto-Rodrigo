# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Prompt Processing Protocol

**CRÍTICO**: Antes de executar qualquer tarefa, você DEVE seguir este protocolo:

### 1. Análise de Contexto Profundo

Quando o usuário fizer um prompt, você DEVE:

1. **Identificar o recurso/rota/componente mencionado**
2. **Fazer uma análise profunda do código** para obter todo o contexto necessário
3. **Reescrever o prompt usando tags XML** para melhor estruturação
4. **Processar o novo prompt otimizado**

### 2. Template XML para Reescrita de Prompt

```xml
<task>
  <type><!-- feature | fix | refactor | docs --></type>
  <scope>
    <backend>
      <routes><!-- rotas afetadas --></routes>
      <controllers><!-- controllers afetados --></controllers>
      <services><!-- services afetados --></services>
      <models><!-- models afetados --></models>
    </backend>
    <frontend>
      <pages><!-- páginas afetadas --></pages>
      <components><!-- componentes afetados --></components>
      <hooks><!-- hooks afetados --></hooks>
    </frontend>
  </scope>
  <requirements>
    <!-- requisitos extraídos do prompt original -->
  </requirements>
  <context>
    <!-- contexto extraído da análise de código -->
  </context>
  <implementation_plan>
    <!-- plano de implementação baseado na análise -->
  </implementation_plan>
</task>
```

### 3. Exemplo de Processo

**Prompt original do usuário:**
> "Adicionar validação de CPF no cadastro de usuários"

**Análise:**
1. Identificar: cadastro de usuários → `UserController`, `User` model, página `Users`
2. Analisar código existente:
   - `backend/src/controllers/UserController.ts`
   - `backend/src/models/User.ts`
   - `backend/src/services/UserServices/`
   - `frontend/src/pages/Users/index.js`
3. Reescrever prompt:

```xml
<task>
  <type>feature</type>
  <scope>
    <backend>
      <routes>/users</routes>
      <controllers>UserController</controllers>
      <services>CreateUserService, UpdateUserService</services>
      <models>User</models>
    </backend>
    <frontend>
      <pages>Users</pages>
      <components>UserModal</components>
      <hooks>useUsers</hooks>
    </frontend>
  </scope>
  <requirements>
    - Adicionar campo CPF no cadastro
    - Validar formato de CPF (XXX.XXX.XXX-XX)
    - Validar CPF duplicado
    - Máscara de entrada no frontend
  </requirements>
  <context>
    - Backend usa Sequelize ORM com PostgreSQL
    - Validação com Yup
    - Frontend usa Material-UI v4
    - Sistema multi-tenant (companyId)
  </context>
  <implementation_plan>
    1. Adicionar migration para campo cpf
    2. Atualizar modelo User com validação
    3. Atualizar serviços de criação/atualização
    4. Adicionar validação no controller
    5. Adicionar campo no formulário frontend
    6. Adicionar validação no frontend
  </implementation_plan>
</task>
```

## Arquitetura do Projeto

### Stack Tecnológico

**Backend:**
- Node.js + TypeScript + Express
- PostgreSQL com Sequelize ORM (v5)
- Socket.IO v4 para real-time
- Bull Queue com Redis para jobs assíncronos
- WhatsApp via Baileys (@whiskeysockets/baileys)
- JWT para autenticação

**Frontend:**
- React 17 + JavaScript
- Material-UI v4 (migração parcial para v5)
- Socket.IO Client v4
- React Query v3
- Zustand para state management
- i18next (5 idiomas: pt, en, es, tr, ar)

### Estrutura Backend

```
backend/src/
├── controllers/     # Controladores de rotas
├── models/         # Modelos Sequelize (54 modelos)
├── services/       # Lógica de negócio organizada por domínio
│   ├── ContactServices/
│   ├── TicketServices/
│   ├── WbotServices/  # WhatsApp Baileys
│   ├── MessageServices/
│   └── ...
├── routes/         # Definições de rotas Express
├── libs/           # Bibliotecas core
│   ├── socket.ts   # Configuração Socket.IO com namespaces
│   ├── wbot.ts     # WhatsApp socket management
│   ├── queue.ts    # Bull Queue setup
│   └── cache.ts    # Redis cache layer
├── middleware/     # Auth, validation
├── database/
│   └── migrations/ # Sequelize migrations
├── helpers/        # Utilitários
└── queues.ts       # Definição de jobs assíncronos
```

### Estrutura Frontend

```
frontend/src/
├── pages/          # 45 páginas (rotas principais)
├── components/     # 152+ componentes reutilizáveis
├── hooks/          # 33 custom hooks
├── context/        # 13 contexts (Auth, Socket, Tickets, etc)
├── services/       # API calls e Socket.IO worker
├── translate/      # i18n (5 idiomas)
└── config/         # Feature flags, env
```

## Padrões de Desenvolvimento

### Multi-tenancy (CRÍTICO)

**TODOS os queries devem filtrar por `companyId`**:

```typescript
// Backend - SEMPRE incluir where com companyId
const tickets = await Ticket.findAll({
  where: { companyId: req.user.companyId }
});

// Socket.IO - Usar namespace por empresa
io.of(`/workspace-${companyId}`).emit('ticket-update', data);

// Frontend - Socket connection
const socket = SocketWorker(companyId, userId);
```

### Socket.IO Real-time

**Padrão de Namespaces:**
- Backend: `/workspace-{companyId}`
- Autenticação via JWT no handshake
- Rooms: por ticket ID, status, notification

**Eventos principais:**
- `ticket-update`, `ticket-create`, `ticket-delete`
- `contact-update`, `contact-create`
- `message-create`, `message-update`
- `whatsappSession` (status de conexão)

**Implementação:**
```typescript
// Backend - Emitir evento
import { getIO } from "../libs/socket";

const io = getIO();
io.of(`/workspace-${companyId}`)
  .to(ticketId)
  .emit('ticket-update', { action: 'update', ticket });

// Frontend - Escutar evento
useEffect(() => {
  const socket = SocketWorker(companyId, user.id);

  socket.on('ticket-update', (data) => {
    // handle update
  });

  return () => socket.off('ticket-update');
}, [companyId, user.id]);
```

### Autenticação e Autorização

**JWT Payload:**
```typescript
{
  id: number,          // user ID
  profile: string,     // 'admin' | 'user' | 'super'
  companyId: number,
  iat: number,
  exp: number
}
```

**Middleware:**
- `isAuth`: Valida JWT e adiciona `req.user`
- `isAuthCompany`: Valida companyId do recurso
- `isSuper`: Apenas super admin

### WhatsApp/Baileys Integration

**Sessions:**
- Gerenciadas por `backend/src/libs/wbot.ts`
- Multi-device support (@whiskeysockets/baileys)
- QR Code flow para autenticação
- Auto-reconnect com retry logic
- Import histórico de mensagens opcional

**Key Functions:**
- `getWbot(whatsappId)`: Get WhatsApp session
- `initWASocket(whatsapp)`: Initialize connection
- `removeWbot(whatsappId)`: Disconnect session

### Queue Jobs (Bull)

**Configuração:** `backend/src/libs/queue.ts`
- Redis-backed job queue
- Retry com backoff exponencial
- Limiter para rate limiting

**Jobs comuns:**
- `SendMessage`: Envio assíncrono de mensagens
- `VerifyContact`: Validação de contatos
- `ProcessCampaign`: Campanhas em massa
- `WebHook`: Dispatch de webhooks

### Database Migrations

**Comandos:**
```bash
# Backend
npm run db:migrate              # Rodar migrations
npm run db:migrate:undo         # Desfazer última migration
npm run db:migrate:undo:all     # Desfazer todas

# Criar migration
npx sequelize-cli migration:generate --name nome-da-migration
```

**Padrão:**
- Sempre criar UP e DOWN
- Testar rollback antes de commit
- Incluir indexes para performance
- Considerar timezone `America/Sao_Paulo`

### Frontend State Management

**Abordagens:**
1. **React Query** - Server state (cache, refetch)
2. **Context API** - Global state (Auth, Socket, Theme)
3. **Zustand** - Component state (FlowBuilder, Kanban)

**Feature Flags:**
```javascript
// frontend/src/config/featureFlags.js
import { useFeatureFlag } from '../config/featureFlags';

const kanbanV2 = useFeatureFlag('KANBAN_V2');
```

### Internacionalização (i18n)

**5 idiomas suportados:** pt (BR), en, es, tr, ar

```javascript
import { i18n } from "../translate/i18n";

// No componente
const { t } = useTranslation();
<Typography>{t('tickets.title')}</Typography>

// Adicionar tradução em:
// - frontend/src/translate/languages/pt.js
// - frontend/src/translate/languages/en.js
// - frontend/src/translate/languages/es.js
// - frontend/src/translate/languages/tr.js
// - frontend/src/translate/languages/ar.js
```

## Comandos de Desenvolvimento

### Backend
```bash
cd backend

# Desenvolvimento
npm run dev:server              # ts-node-dev com hot reload

# Build
npm run build                   # Compilar TypeScript
npm start                       # Rodar dist/server.js

# Database
npm run db:migrate              # Rodar migrations
npm run db:seed                 # Seed database

# Testes
npm run test                    # Jest tests
npm run lint                    # ESLint

# Produção
PORT=8080 npm start
```

### Frontend
```bash
cd frontend

# Desenvolvimento
npm start                       # CRA dev server (port 3000)

# Build
npm run build                   # Build para produção

# Testes
npm test                        # Jest + React Testing Library
```

### Docker/PM2 (Produção)
```bash
# Porta padrão backend: 8080
# Porta padrão frontend: 3000

# PM2
pm2 start backend/dist/server.js --name chatia-backend
pm2 start frontend/npm -- start --name chatia-frontend
```

## Debugging e Logs

### Backend Logging
```typescript
import logger from "../utils/logger";

logger.info("Informação");
logger.warn("Aviso");
logger.error("Erro", { extra: data });
```

### Socket.IO Debug
- Backend: Logs automáticos em `backend/src/libs/socket.ts`
- Frontend: `window.socketReal` exposto para debug

### Bull Queue Monitor
- URL: `/admin/queues`
- Auth: Basic Auth (BULL_USER/BULL_PASS em .env)

## Boas Práticas

### Backend
1. **Sempre validar com Yup** nos controllers
2. **Usar transações** para operações multi-tabela
3. **Incluir companyId** em TODOS os queries
4. **Emitir eventos Socket.IO** após mudanças de estado
5. **Usar serviços** para lógica de negócio (não no controller)
6. **Tratar erros com AppError** para respostas consistentes

### Frontend
1. **Material-UI v5** para componentes novos (não v4)
2. **Implementar 4 estados UI**: happy, loading, error, empty
3. **Usar React Query** para data fetching
4. **Limpar listeners Socket.IO** no cleanup do useEffect
5. **Traduzir TODOS os textos** (5 idiomas)
6. **Responsive design** com Material-UI breakpoints

### Socket.IO
1. **Namespace por empresa**: `/workspace-{companyId}`
2. **Joins específicos**: `joinChatBox(ticketId)`, `joinTickets(status)`
3. **Validar dados** antes de emitir
4. **Usar rooms** para broadcast seletivo

### Security
1. **JWT em TODOS endpoints** (exceto públicos)
2. **Validar companyId** do recurso vs user
3. **Sanitizar inputs** (XSS, SQL injection)
4. **Rate limiting** em endpoints críticos
5. **CORS restrito** às origens permitidas

## Troubleshooting

### Socket.IO não conecta
1. Verificar token JWT válido
2. Verificar namespace correto (`/workspace-{companyId}`)
3. Verificar CORS no backend
4. Check logs: backend `libs/socket.ts` e frontend console

### WhatsApp desconecta
1. Check `backend/src/libs/wbot.ts` logs
2. Verificar Baileys session em `backend/public/company{id}/sessions/`
3. QR Code expirado? Gerar novo
4. Verificar anti-ban delays em campanhas

### Migration falha
1. Verificar sintaxe SQL
2. Testar rollback (down migration)
3. Backup database antes de rodar
4. Check `backend/src/database/migrations/`

### Build frontend falha
1. Verificar todas traduções têm mesmas keys
2. Check imports de Material-UI (v4 vs v5)
3. Limpar cache: `rm -rf node_modules/.cache`

## Environment Variables

### Backend (.env)
```bash
# Database
DB_DIALECT=postgres
DB_HOST=localhost
DB_PORT=5432
DB_NAME=chatia
DB_USER=postgres
DB_PASS=password

# Redis
REDIS_URI_ACK=redis://localhost:6379
REDIS_URI_MSG_CONN=redis://localhost:6379

# JWT
JWT_SECRET=sua-chave-secreta
JWT_REFRESH_SECRET=sua-refresh-secret

# Server
PORT=8080
HOST=0.0.0.0
FRONTEND_URL=http://localhost:3000

# Socket.IO
SOCKET_ADMIN=true
ADMIN_USERNAME=admin
ADMIN_PASSWORD=senha

# Bull Queue
BULL_BOARD=true
BULL_USER=admin
BULL_PASS=senha
```

### Frontend (.env)
```bash
REACT_APP_BACKEND_URL=http://localhost:8080

# Feature Flags
REACT_APP_FEATURE_KANBAN_V2=false
```

## Arquivos Importantes

### Configuração
- `backend/src/config/database.ts` - DB config (Sequelize)
- `backend/src/config/auth.ts` - JWT config
- `backend/src/config/redis.ts` - Redis URIs
- `frontend/src/config/env.js` - Environment variables

### Core
- `backend/src/libs/socket.ts` - Socket.IO setup
- `backend/src/libs/wbot.ts` - WhatsApp/Baileys
- `backend/src/libs/queue.ts` - Bull Queue
- `frontend/src/services/SocketWorker.js` - Socket.IO client
- `frontend/src/services/api.js` - Axios instance

### Routes
- `backend/src/routes/index.ts` - Route registry
- `frontend/src/routes/Route.js` - Protected routes

## Convenções de Código

### Naming
- **Backend:** PascalCase para classes/models, camelCase para funções
- **Frontend:** PascalCase para componentes, camelCase para funções/hooks
- **Database:** snake_case para colunas, PascalCase para models

### Commits (Conventional Commits)
```
feat(tickets): adicionar filtro por data
fix(socket): corrigir namespace connection
refactor(auth): simplificar middleware
docs(readme): atualizar instruções
```

### File Organization
```
# Services
backend/src/services/{Domain}Services/{Action}Service.ts

# Components
frontend/src/components/{ComponentName}/index.js

# Pages
frontend/src/pages/{PageName}/index.js
```

---

**Lembre-se:** SEMPRE seguir o protocolo de análise de contexto profundo e reescrita de prompt em XML antes de implementar qualquer mudança. Isso garante precisão máxima na implementação.
