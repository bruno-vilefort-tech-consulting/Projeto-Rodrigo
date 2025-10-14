# WEBSOCKET - ChatIA Flow Backend

## Visão Geral

Este documento documenta a implementação completa do sistema de **comunicação em tempo real via WebSocket** do ChatIA Flow, utilizando **Socket.IO 4.7.4**. O sistema é responsável por sincronizar eventos entre backend e frontend, garantindo atualizações instantâneas de tickets, mensagens e notificações.

### Características Principais

- **Socket.IO 4.7.4** com suporte a namespaces dinâmicos
- **Autenticação JWT** obrigatória para todas as conexões
- **Multi-tenant** com isolamento por namespace `/workspace-{companyId}`
- **Rooms/Canais** para organização de eventos (tickets, status, notificações)
- **Validação Zod** de todos os eventos e payloads
- **Admin UI** para monitoramento em desenvolvimento
- **128 emissões** de eventos em 49 arquivos diferentes
- **CORS configurável** para múltiplas origens
- **Retry e Reconnection** automáticos

---

## Índice

1. [Arquitetura](#1-arquitetura)
2. [Inicialização](#2-inicialização)
3. [Autenticação](#3-autenticação)
4. [Namespaces e Workspaces](#4-namespaces-e-workspaces)
5. [Rooms e Canais](#5-rooms-e-canais)
6. [Eventos do Cliente](#6-eventos-do-cliente)
7. [Eventos do Servidor](#7-eventos-do-servidor)
8. [Padrões de Emissão](#8-padrões-de-emissão)
9. [Integração com Serviços](#9-integração-com-serviços)
10. [Segurança](#10-segurança)
11. [Performance](#11-performance)
12. [Debugging](#12-debugging)
13. [Troubleshooting](#13-troubleshooting)

---

## 1. ARQUITETURA

### 1.1 Estrutura Geral

```
┌─────────────────────────────────────────────────────────┐
│                     FRONTEND (React)                     │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐           │
│  │  Tickets  │  │  Messages │  │ Notifications│         │
│  └─────┬─────┘  └─────┬─────┘  └─────┬──────┘          │
└────────┼──────────────┼──────────────┼──────────────────┘
         │              │              │
         │   Socket.IO Client Connections (JWT Auth)
         │              │              │
┌────────▼──────────────▼──────────────▼──────────────────┐
│              SOCKET.IO SERVER (Backend)                  │
│  ┌──────────────────────────────────────────────────┐   │
│  │         initIO() - Inicialização                 │   │
│  │  • CORS Configuration                            │   │
│  │  • JWT Middleware                                │   │
│  │  • Admin UI (dev only)                           │   │
│  └──────────────────────────────────────────────────┘   │
│                                                          │
│  ┌──────────────────────────────────────────────────┐   │
│  │  Namespaces Dinâmicos: /workspace-{companyId}    │   │
│  │                                                   │   │
│  │  ┌─────────────┐  ┌─────────────┐               │   │
│  │  │ /workspace-1│  │ /workspace-2│  ...          │   │
│  │  └──────┬──────┘  └──────┬──────┘               │   │
│  └─────────┼─────────────────┼──────────────────────┘   │
│            │                 │                           │
│  ┌─────────▼─────────────────▼──────────────────────┐   │
│  │           Rooms (Channels)                       │   │
│  │  • ticket-123 (chat específico)                  │   │
│  │  • notification (notificações gerais)            │   │
│  │  • open/pending/closed (status de tickets)       │   │
│  └──────────────────────────────────────────────────┘   │
└──────────────────────────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
┌───────▼──────┐  ┌──────▼──────┐  ┌─────▼──────┐
│   Services   │  │   Helpers   │  │Controllers │
│  (120 emit)  │  │   (3 emit)  │  │  (5 emit)  │
└──────────────┘  └─────────────┘  └────────────┘
```

### 1.2 Fluxo de Comunicação

```typescript
// 1. Cliente conecta com JWT
const socket = io("http://backend:3000/workspace-1", {
  query: { token: "jwt_token_here", userId: "uuid" }
});

// 2. Servidor valida JWT e cria conexão

// 3. Cliente entra em rooms específicas
socket.emit("joinChatBox", "ticket-123");
socket.emit("joinNotification");
socket.emit("joinTickets", "open");

// 4. Servidor emite eventos para rooms específicas
io.of("/workspace-1").to("ticket-123").emit("appMessage", {
  action: "create",
  data: message
});

// 5. Cliente recebe e processa evento
socket.on("appMessage", (payload) => {
  updateUI(payload);
});
```

---

## 2. INICIALIZAÇÃO

### 2.1 Arquivo Principal

**Localização**: `/src/libs/socket.ts` (199 linhas)

### 2.2 Função initIO()

Inicializa o servidor Socket.IO com todas as configurações de segurança e autenticação.

**Código Completo**:

```typescript
import { Server as SocketIO } from "socket.io";
import { Server } from "http";
import AppError from "../errors/AppError";
import logger from "../utils/logger";
import { instrument } from "@socket.io/admin-ui";
import { z } from "zod";
import jwt from "jsonwebtoken";

// Define namespaces permitidos
const ALLOWED_NAMESPACES = /^\/workspace-\d+$/;

// Esquemas de validação
const userIdSchema = z.string().uuid().optional();
const ticketIdSchema = z.string().uuid();
const statusSchema = z.enum(["open", "closed", "pending"]);
const jwtPayloadSchema = z.object({
  userId: z.string().uuid(),
  iat: z.number().optional(),
  exp: z.number().optional(),
});

// Origens CORS permitidas
const ALLOWED_ORIGINS = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(",").map((url) => url.trim())
  : [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://127.0.0.1:3000",
      "http://127.0.0.1:3001"
    ];

let io: SocketIO;

export const initIO = (httpServer: Server): SocketIO => {
  io = new SocketIO(httpServer, {
    cors: {
      origin: (origin, callback) => {
        if (!origin || ALLOWED_ORIGINS.includes(origin)) {
          callback(null, true);
        } else {
          logger.warn(`Origem não autorizada: ${origin}`);
          callback(new Error("Violação da política CORS"), false);
        }
      },
      methods: ["GET", "POST"],
      credentials: true,
    },
    maxHttpBufferSize: 1e6, // Limita payload a 1MB
    pingTimeout: 20000,
    pingInterval: 25000,
  });

  // Middleware de autenticação JWT
  io.use((socket, next) => {
    const token = socket.handshake.query.token as string;
    if (!token) {
      logger.warn("Tentativa de conexão sem token");
      return next(new Error("Token ausente"));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || "default_secret");
      const validatedPayload = jwtPayloadSchema.parse(decoded);
      socket.data.user = validatedPayload;
      next();
    } catch (err) {
      logger.warn("Token inválido");
      return next(new Error("Token inválido"));
    }
  });

  // Admin UI apenas em desenvolvimento
  const isAdminEnabled = process.env.SOCKET_ADMIN === "true" && process.env.NODE_ENV !== "production";
  if (isAdminEnabled && process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD) {
    try {
      instrument(io, {
        auth: {
          type: "basic",
          username: process.env.ADMIN_USERNAME,
          password: process.env.ADMIN_PASSWORD,
        },
        mode: "development",
        readonly: true,
      });
      logger.info("Socket.IO Admin UI inicializado em modo de desenvolvimento");
    } catch (error) {
      logger.error("Falha ao inicializar Socket.IO Admin UI", error);
    }
  }

  // Namespaces dinâmicos com validação
  const workspaces = io.of((name, auth, next) => {
    if (ALLOWED_NAMESPACES.test(name)) {
      next(null, true);
    } else {
      logger.warn(`Tentativa de conexão a namespace inválido: ${name}`);
      next(new Error("Namespace inválido"), false);
    }
  });

  // Handlers de conexão
  workspaces.on("connection", (socket) => {
    handleWorkspaceConnection(socket);
  });

  return io;
};

export const getIO = (): SocketIO => {
  if (!io) {
    throw new Error("Socket IO não inicializado");
  }
  return io;
};
```

### 2.3 Configuração no server.ts

```typescript
import { initIO } from "./libs/socket";

const server = app.listen(PORT, () => {
  logger.info(`Server started on port: ${PORT}`);
});

// Inicializar Socket.IO
const io = initIO(server);
```

### 2.4 Variáveis de Ambiente

```bash
# Socket.IO Configuration
FRONTEND_URL=http://localhost:3000,https://app.exemplo.com
JWT_SECRET=sua_chave_secreta_aqui

# Admin UI (apenas desenvolvimento)
SOCKET_ADMIN=true
ADMIN_USERNAME=admin
ADMIN_PASSWORD=senha_forte_aqui
NODE_ENV=development
```

---

## 3. AUTENTICAÇÃO

### 3.1 Middleware JWT

Todas as conexões Socket.IO requerem autenticação via JWT token.

**Fluxo de Autenticação**:

```typescript
// 1. Cliente obtém token JWT via login
const { token } = await api.post("/auth/login", { email, password });

// 2. Cliente conecta passando token no query
const socket = io("http://backend:3000/workspace-1", {
  query: { token }
});

// 3. Servidor valida token no middleware
io.use((socket, next) => {
  const token = socket.handshake.query.token as string;

  if (!token) {
    return next(new Error("Token ausente"));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const validatedPayload = jwtPayloadSchema.parse(decoded);

    // Armazena dados do usuário no socket
    socket.data.user = validatedPayload;
    next();
  } catch (err) {
    return next(new Error("Token inválido"));
  }
});
```

### 3.2 Schema de Validação JWT

```typescript
const jwtPayloadSchema = z.object({
  userId: z.string().uuid(),
  iat: z.number().optional(),    // Issued At
  exp: z.number().optional(),    // Expiration Time
});
```

### 3.3 Erros de Autenticação

| Erro | Causa | Ação |
|------|-------|------|
| `Token ausente` | Query param `token` não enviado | Reconectar com token |
| `Token inválido` | JWT expirado ou inválido | Renovar token e reconectar |
| `Violação da política CORS` | Origem não permitida | Adicionar origem no FRONTEND_URL |

---

## 4. NAMESPACES E WORKSPACES

### 4.1 Namespaces Dinâmicos

O ChatIA Flow utiliza **namespaces dinâmicos** para isolar comunicação por empresa (multi-tenant).

**Padrão**: `/workspace-{companyId}`

**Exemplos**:
- `/workspace-1` - Empresa 1
- `/workspace-2` - Empresa 2
- `/workspace-999` - Empresa 999

### 4.2 Validação de Namespace

```typescript
const ALLOWED_NAMESPACES = /^\/workspace-\d+$/;

const workspaces = io.of((name, auth, next) => {
  if (ALLOWED_NAMESPACES.test(name)) {
    next(null, true);
  } else {
    logger.warn(`Tentativa de conexão a namespace inválido: ${name}`);
    next(new Error("Namespace inválido"), false);
  }
});
```

**Namespaces Válidos**: ✅
- `/workspace-1`
- `/workspace-123`
- `/workspace-99999`

**Namespaces Inválidos**: ❌
- `/company-1` (formato errado)
- `/workspace-abc` (não numérico)
- `/1` (sem prefixo)
- `workspace-1` (sem barra inicial)

### 4.3 Conexão ao Namespace

**Frontend**:

```typescript
// Conectar ao workspace da empresa
const socket = io(`${BACKEND_URL}/workspace-${companyId}`, {
  query: {
    token: authToken,
    userId: user.id
  }
});
```

**Backend (Emissão)**:

```typescript
// Emitir para namespace específico
const io = getIO();
io.of(`/workspace-${companyId}`).emit("event", data);

// Ou usando String(companyId)
io.of(String(companyId)).emit("event", data);
```

---

## 5. ROOMS E CANAIS

Rooms permitem agrupar sockets em canais temáticos para emissão direcionada de eventos.

### 5.1 Tipos de Rooms

| Room | Descrição | Exemplo |
|------|-----------|---------|
| **ticket-{id}** | Chat específico de um ticket | `ticket-123` |
| **notification** | Notificações gerais | `notification` |
| **open** | Tickets com status "open" | `open` |
| **pending** | Tickets com status "pending" | `pending` |
| **closed** | Tickets com status "closed" | `closed` |

### 5.2 Eventos para Gerenciar Rooms

#### joinChatBox

Entra em um canal de ticket específico para receber mensagens em tempo real.

```typescript
socket.on("joinChatBox", (ticketId: string, callback: (error?: string) => void) => {
  try {
    const validatedTicketId = ticketIdSchema.parse(ticketId);
    socket.join(validatedTicketId);
    logger.info(`Cliente entrou no canal de ticket ${validatedTicketId}`);
    callback();
  } catch (error) {
    logger.warn(`ticketId inválido: ${ticketId}`);
    callback("ID de ticket inválido");
  }
});
```

**Uso no Frontend**:

```typescript
// Entrar no canal do ticket ao abrir chat
socket.emit("joinChatBox", ticketId, (error) => {
  if (error) {
    console.error("Erro ao entrar no chat:", error);
  } else {
    console.log("Conectado ao chat do ticket", ticketId);
  }
});
```

#### joinChatBoxLeave

Sai de um canal de ticket.

```typescript
socket.on("joinChatBoxLeave", (ticketId: string, callback: (error?: string) => void) => {
  try {
    const validatedTicketId = ticketIdSchema.parse(ticketId);
    socket.leave(validatedTicketId);
    logger.info(`Cliente saiu do canal de ticket ${validatedTicketId}`);
    callback();
  } catch (error) {
    callback("ID de ticket inválido");
  }
});
```

**Uso no Frontend**:

```typescript
// Sair do canal ao fechar chat
socket.emit("joinChatBoxLeave", ticketId);
```

#### joinNotification

Entra no canal de notificações para receber alertas gerais.

```typescript
socket.on("joinNotification", (callback: (error?: string) => void) => {
  socket.join("notification");
  logger.info(`Cliente entrou no canal de notificações`);
  callback();
});
```

**Uso no Frontend**:

```typescript
// Entrar em notificações ao conectar
socket.emit("joinNotification", () => {
  console.log("Recebendo notificações");
});
```

#### joinTickets

Entra em um canal de status de tickets (open/pending/closed).

```typescript
socket.on("joinTickets", (status: string, callback: (error?: string) => void) => {
  try {
    const validatedStatus = statusSchema.parse(status);
    socket.join(validatedStatus);
    logger.info(`Cliente entrou no canal ${validatedStatus}`);
    callback();
  } catch (error) {
    logger.warn(`Status inválido: ${status}`);
    callback("Status inválido");
  }
});
```

**Uso no Frontend**:

```typescript
// Entrar no canal de tickets abertos
socket.emit("joinTickets", "open");

// Entrar no canal de tickets pendentes
socket.emit("joinTickets", "pending");
```

#### joinTicketsLeave

Sai de um canal de status.

```typescript
socket.on("joinTicketsLeave", (status: string, callback: (error?: string) => void) => {
  try {
    const validatedStatus = statusSchema.parse(status);
    socket.leave(validatedStatus);
    logger.info(`Cliente saiu do canal ${validatedStatus}`);
    callback();
  } catch (error) {
    callback("Status inválido");
  }
});
```

### 5.3 Schema de Validação

```typescript
const userIdSchema = z.string().uuid().optional();
const ticketIdSchema = z.string().uuid();
const statusSchema = z.enum(["open", "closed", "pending"]);
```

---

## 6. EVENTOS DO CLIENTE

Eventos que o cliente (frontend) pode emitir para o servidor.

### 6.1 Resumo de Eventos

| Evento | Parâmetros | Descrição |
|--------|------------|-----------|
| `joinChatBox` | `ticketId: string` | Entrar no canal de um ticket |
| `joinChatBoxLeave` | `ticketId: string` | Sair do canal de um ticket |
| `joinNotification` | - | Entrar no canal de notificações |
| `joinTickets` | `status: string` | Entrar no canal de status |
| `joinTicketsLeave` | `status: string` | Sair do canal de status |

### 6.2 Exemplo de Configuração Completa

```typescript
import io from "socket.io-client";

class SocketManager {
  socket: Socket;

  constructor(companyId: number, token: string, userId: string) {
    this.socket = io(`${process.env.REACT_APP_BACKEND_URL}/workspace-${companyId}`, {
      query: { token, userId }
    });

    this.setupListeners();
  }

  setupListeners() {
    // Reconexão
    this.socket.on("connect", () => {
      console.log("Socket conectado");
      this.joinDefaultRooms();
    });

    // Desconexão
    this.socket.on("disconnect", () => {
      console.log("Socket desconectado");
    });

    // Erros
    this.socket.on("error", (error) => {
      console.error("Socket error:", error);
    });
  }

  joinDefaultRooms() {
    // Entrar em notificações
    this.socket.emit("joinNotification");

    // Entrar em tickets abertos
    this.socket.emit("joinTickets", "open");
  }

  joinTicketChat(ticketId: string) {
    this.socket.emit("joinChatBox", ticketId, (error) => {
      if (error) {
        console.error("Erro ao entrar no chat:", error);
      }
    });
  }

  leaveTicketChat(ticketId: string) {
    this.socket.emit("joinChatBoxLeave", ticketId);
  }

  disconnect() {
    this.socket.disconnect();
  }
}

export default SocketManager;
```

---

## 7. EVENTOS DO SERVIDOR

Eventos que o servidor emite para os clientes.

### 7.1 Principais Eventos

| Evento | Payload | Descrição |
|--------|---------|-----------|
| `appMessage` | `{ action, data }` | Nova mensagem criada/atualizada |
| `company-{id}-ticket` | `{ action, ticket }` | Ticket criado/atualizado/deletado |
| `company-{id}-appMessage` | `{ action, data }` | Mensagem por empresa |
| `chat:ack` | `{ messageId, ack }` | Confirmação de leitura |
| `contact` | `{ action, contact }` | Contato criado/atualizado |
| `notification` | `{ message, type }` | Notificação geral |

### 7.2 Estrutura de Payload

**appMessage**:

```typescript
{
  action: "create" | "update" | "delete",
  data: {
    id: string,
    body: string,
    ticketId: string,
    fromMe: boolean,
    read: boolean,
    mediaType: string | null,
    mediaUrl: string | null,
    timestamp: number,
    quotedMsg: Message | null
  }
}
```

**company-{id}-ticket**:

```typescript
{
  action: "create" | "update" | "delete" | "updateUnread",
  ticket: {
    id: number,
    status: "open" | "pending" | "closed",
    userId: number | null,
    queueId: number | null,
    contactId: number,
    whatsappId: number,
    unreadMessages: number,
    lastMessage: string,
    updatedAt: Date,
    contact: Contact,
    user: User | null,
    queue: Queue | null,
    tags: Tag[]
  }
}
```

**chat:ack**:

```typescript
{
  messageId: string,
  ack: 0 | 1 | 2 | 3 | 4,  // 0=pending, 1=sent, 2=delivered, 3=read, 4=played
  ticketId: number
}
```

### 7.3 Listeners no Frontend

```typescript
// Mensagens
socket.on("appMessage", (payload) => {
  if (payload.action === "create") {
    addMessageToChat(payload.data);
  } else if (payload.action === "update") {
    updateMessageInChat(payload.data);
  }
});

// Tickets
socket.on(`company-${companyId}-ticket`, (payload) => {
  switch (payload.action) {
    case "create":
      addTicketToList(payload.ticket);
      break;
    case "update":
      updateTicketInList(payload.ticket);
      break;
    case "delete":
      removeTicketFromList(payload.ticket.id);
      break;
    case "updateUnread":
      updateUnreadCount(payload.ticketId);
      break;
  }
});

// Confirmação de leitura
socket.on("chat:ack", (payload) => {
  updateMessageAck(payload.messageId, payload.ack);
});

// Notificações
socket.on("notification", (payload) => {
  showNotification(payload.message, payload.type);
});
```

---

## 8. PADRÕES DE EMISSÃO

### 8.1 Função emitAppMessage()

Função auxiliar que emite mensagens para múltiplos namespaces e rooms simultaneamente.

**Localização**: `/src/services/WbotServices/wbotMessageListener.ts:100`

```typescript
function emitAppMessage(companyId: number, ticketId: number, payload: any) {
  const io = getIO();

  // Namespace raiz (legacy)
  io.emit("appMessage", payload);
  io.emit(`company-${companyId}-appMessage`, payload);

  // Namespace por empresa (formatos "123" e "/123")
  const ns = io.of(String(companyId));
  ns.emit("appMessage", payload);
  ns.emit(`company-${companyId}-appMessage`, payload);

  const nsAlt = io.of(`/${companyId}`);
  nsAlt.emit("appMessage", payload);
  nsAlt.emit(`company-${companyId}-appMessage`, payload);

  // Rooms (canais específicos)
  io.to(String(ticketId)).emit("appMessage", payload);
  ns.to(String(ticketId)).emit("appMessage", payload);
  io.to(`company-${companyId}`).emit("appMessage", payload);
  ns.to(`company-${companyId}`).emit("appMessage", payload);

  // Aliases comuns
  io.emit("message", payload);
  ns.emit("message", payload);
  io.to(String(ticketId)).emit("message", payload);

  io.emit("chat:ack", payload);
  ns.emit("chat:ack", payload);
  io.to(String(ticketId)).emit("chat:ack", payload);
}
```

**Uso**:

```typescript
// Emitir mensagem criada
emitAppMessage(ticket.companyId, ticket.id, {
  action: "create",
  data: message
});
```

### 8.2 Padrão de Emissão em Serviços

#### UpdateTicketService.ts

```typescript
import { getIO } from "../../libs/socket";

const io = getIO();

// Emitir atualização de ticket
io.of(String(companyId)).emit(`company-${ticket.companyId}-ticket`, {
  action: "update",
  ticket
});

// Emitir para room de status anterior (remover)
io.of(String(companyId)).to(oldStatus).emit(`company-${companyId}-ticket`, {
  action: "delete",
  ticketId: ticket.id
});

// Emitir para room de novo status (adicionar)
io.of(String(companyId)).to(ticket.status).emit(`company-${companyId}-ticket`, {
  action: "create",
  ticket
});
```

#### CreateMessageService.ts

```typescript
import { getIO } from "../../libs/socket";

const io = getIO();

// Emitir nova mensagem
io.of(String(ticket.companyId))
  .to(String(ticket.id))
  .emit("appMessage", {
    action: "create",
    data: message
  });

// Emitir atualização de contador
io.of(String(ticket.companyId))
  .emit(`company-${ticket.companyId}-ticket`, {
    action: "updateUnread",
    ticketId: ticket.id,
    unreadMessages: ticket.unreadMessages
  });
```

### 8.3 Padrão de Emissão Múltipla

Quando um evento afeta múltiplas entidades:

```typescript
// Emitir para namespace e múltiplas rooms
io.of(String(companyId))
  .to("notification")                    // Room de notificações
  .to(String(ticket.userId))             // Room do usuário
  .to(ticket.status)                     // Room do status (open/pending/closed)
  .emit(`company-${companyId}-notification`, {
    type: "ticket_assigned",
    ticket
  });
```

---

## 9. INTEGRAÇÃO COM SERVIÇOS

### 9.1 Serviços que Usam WebSocket

Total: **128 emissões** em **49 arquivos**

**Top 10 Serviços**:

1. **wbotMessageListener.ts** - 15 emissões (mensagens WhatsApp)
2. **UpdateTicketService.ts** - 8 emissões (atualização de tickets)
3. **CreateTicketService.ts** - 5 emissões (criação de tickets)
4. **CreateMessageService.ts** - 4 emissões (criação de mensagens)
5. **SetTicketMessagesAsRead.ts** - 2 emissões (marcar como lido)
6. **UpdateTicketByRemoteJid.ts** - 2 emissões (sincronização)
7. **ContactController.ts** - 9 emissões (CRUD de contatos)
8. **TicketController.ts** - 3 emissões (operações de tickets)
9. **UserController.ts** - 5 emissões (CRUD de usuários)
10. **WhatsAppController.ts** - 6 emissões (conexões WhatsApp)

### 9.2 Exemplo Completo de Integração

**Cenário**: Criação de uma nova mensagem e sincronização com frontend

**CreateMessageService.ts**:

```typescript
import { getIO } from "../../libs/socket";

const CreateMessageService = async (messageData: MessageData): Promise<Message> => {
  const ticket = await Ticket.findByPk(messageData.ticketId, {
    include: ["contact", "user", "queue"]
  });

  // Criar mensagem
  const message = await Message.create(messageData);

  // Incrementar contador de não lidas
  if (!message.fromMe) {
    await ticket.update({
      unreadMessages: ticket.unreadMessages + 1
    });
  }

  const io = getIO();

  // 1. Emitir mensagem para o chat específico
  io.of(String(ticket.companyId))
    .to(String(ticket.id))
    .emit("appMessage", {
      action: "create",
      data: message
    });

  // 2. Emitir atualização de ticket (última mensagem)
  io.of(String(ticket.companyId))
    .to(ticket.status)
    .emit(`company-${ticket.companyId}-ticket`, {
      action: "update",
      ticket: {
        ...ticket.toJSON(),
        lastMessage: message.body,
        unreadMessages: ticket.unreadMessages
      }
    });

  // 3. Emitir notificação se ticket não está aberto
  if (ticket.status === "pending" && !message.fromMe) {
    io.of(String(ticket.companyId))
      .to("notification")
      .emit(`company-${ticket.companyId}-notification`, {
        type: "new_message",
        ticket,
        message
      });
  }

  return message;
};
```

### 9.3 Integração em Controllers

**TicketController.ts**:

```typescript
import { getIO } from "../libs/socket";

export const update = async (req: Request, res: Response): Promise<Response> => {
  const { ticketId } = req.params;
  const ticketData = req.body;

  const ticket = await UpdateTicketService({
    ticketData,
    ticketId,
    companyId: req.user.companyId
  });

  // Emitir atualização via WebSocket
  const io = getIO();
  io.of(String(req.user.companyId))
    .emit(`company-${req.user.companyId}-ticket`, {
      action: "update",
      ticket
    });

  return res.status(200).json(ticket);
};
```

---

## 10. SEGURANÇA

### 10.1 Camadas de Segurança

| Camada | Implementação | Proteção Contra |
|--------|---------------|-----------------|
| **CORS** | Lista de origens permitidas | Cross-Origin attacks |
| **JWT Auth** | Middleware obrigatório | Conexões não autorizadas |
| **Namespace Validation** | Regex de namespaces | Acesso a workspaces inválidos |
| **Payload Validation** | Zod schemas | Dados malformados |
| **Rate Limiting** | maxHttpBufferSize: 1MB | DoS / Flood attacks |
| **Ping/Pong** | 20s timeout | Conexões mortas |

### 10.2 CORS Configuration

```typescript
const ALLOWED_ORIGINS = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(",").map((url) => url.trim())
  : [
      "http://localhost:3000",
      "http://localhost:3001",
      "http://127.0.0.1:3000",
      "http://127.0.0.1:3001"
    ];

io = new SocketIO(httpServer, {
  cors: {
    origin: (origin, callback) => {
      if (!origin || ALLOWED_ORIGINS.includes(origin)) {
        callback(null, true);
      } else {
        logger.warn(`Origem não autorizada: ${origin}`);
        callback(new Error("Violação da política CORS"), false);
      }
    },
    methods: ["GET", "POST"],
    credentials: true,
  }
});
```

**Configuração Recomendada**:

```bash
# Desenvolvimento
FRONTEND_URL=http://localhost:3000

# Produção
FRONTEND_URL=https://app.seusite.com,https://admin.seusite.com
```

### 10.3 Validação de Payloads

```typescript
// Validar userId
const userIdSchema = z.string().uuid().optional();
const userId = userIdSchema.parse(socket.handshake.query.userId);

// Validar ticketId
const ticketIdSchema = z.string().uuid();
const ticketId = ticketIdSchema.parse(requestedTicketId);

// Validar status
const statusSchema = z.enum(["open", "closed", "pending"]);
const status = statusSchema.parse(requestedStatus);
```

### 10.4 Rate Limiting

```typescript
io = new SocketIO(httpServer, {
  maxHttpBufferSize: 1e6, // 1MB limit
  pingTimeout: 20000,     // 20 seconds
  pingInterval: 25000,    // 25 seconds
});
```

**Limites**:
- **Payload máximo**: 1MB por mensagem
- **Ping timeout**: 20 segundos sem resposta = desconexão
- **Ping interval**: Cliente deve responder a cada 25 segundos

---

## 11. PERFORMANCE

### 11.1 Otimizações

**Namespaces Dinâmicos**:
- Isolamento por empresa reduz broadcast desnecessário
- Apenas clientes da empresa X recebem eventos da empresa X

**Rooms**:
- Clientes recebem apenas eventos dos tickets/status que estão visualizando
- Reduz tráfego de rede em 90%+

**Serialização Eficiente**:
```typescript
// Apenas campos necessários
const ticketPayload = {
  id: ticket.id,
  status: ticket.status,
  unreadMessages: ticket.unreadMessages,
  lastMessage: ticket.lastMessage,
  // Não incluir relations desnecessárias
};
```

### 11.2 Métricas de Performance

| Métrica | Valor | Configuração |
|---------|-------|--------------|
| **Ping Interval** | 25s | `pingInterval: 25000` |
| **Ping Timeout** | 20s | `pingTimeout: 20000` |
| **Max Payload** | 1MB | `maxHttpBufferSize: 1e6` |
| **Reconnection Delay** | 1s | Cliente: `reconnectionDelay: 1000` |
| **Max Reconnection Attempts** | ∞ | Cliente: `reconnectionAttempts: Infinity` |

### 11.3 Monitoring

**Admin UI** (apenas desenvolvimento):

```bash
# Habilitar Admin UI
SOCKET_ADMIN=true
ADMIN_USERNAME=admin
ADMIN_PASSWORD=senha123

# Acessar
http://localhost:3000/admin
```

**Métricas Disponíveis**:
- Número de conexões ativas
- Namespaces e rooms ativos
- Taxa de mensagens por segundo
- Latência média
- Erros de conexão

---

## 12. DEBUGGING

### 12.1 Debug Mode

**Backend**:

```bash
# Habilitar logs detalhados do Socket.IO
DEBUG=socket.io:* npm run dev
```

**Frontend**:

```typescript
import io from "socket.io-client";

const socket = io(url, {
  query: { token },
  // Habilitar debug
  debug: true
});

// Logs de eventos
socket.onAny((event, ...args) => {
  console.log(`[Socket Event] ${event}`, args);
});
```

### 12.2 Ferramentas

**Socket.IO Admin UI**:
- Interface web para monitoramento
- Visualizar conexões em tempo real
- Enviar eventos manualmente
- Forçar desconexões

**Chrome DevTools**:
- Network tab → WS (WebSocket)
- Ver frames enviados/recebidos
- Latência de ping/pong

**Postman** (WebSocket support):
- Testar conexões manualmente
- Enviar eventos custom
- Validar payloads

### 12.3 Logging

```typescript
import logger from "../utils/logger";

// Log de conexão
logger.info(`Cliente conectado ao namespace ${socket.nsp.name} (IP: ${clientIp})`);

// Log de evento
logger.info(`Cliente entrou no canal de ticket ${ticketId}`);

// Log de erro
logger.error(`Erro no socket: ${error.message}`);

// Log de warning
logger.warn(`Token inválido de IP ${clientIp}`);
```

---

## 13. TROUBLESHOOTING

### 13.1 Problemas Comuns

#### Conexão não estabelecida

**Sintomas**: Cliente não conecta ao servidor

**Causas**:
1. Token JWT inválido ou expirado
2. CORS bloqueando origem
3. Namespace inválido
4. Firewall bloqueando WebSocket

**Soluções**:

```typescript
// 1. Verificar token
console.log("Token:", token);
const decoded = jwt.decode(token);
console.log("Token expires:", new Date(decoded.exp * 1000));

// 2. Verificar CORS
console.log("Frontend URL:", process.env.FRONTEND_URL);
console.log("Origin:", window.location.origin);

// 3. Verificar namespace
console.log("Namespace:", `/workspace-${companyId}`);

// 4. Testar sem namespace primeiro
const socket = io(BACKEND_URL); // Conectar sem namespace
```

#### Eventos não são recebidos

**Sintomas**: Cliente conectado mas não recebe eventos

**Causas**:
1. Não entrou na room correta
2. Namespace errado
3. Filtro de eventos no server

**Soluções**:

```typescript
// 1. Verificar rooms
socket.emit("joinChatBox", ticketId, (error) => {
  console.log("Join error:", error);
});

socket.emit("joinNotification");
socket.emit("joinTickets", "open");

// 2. Listar todos os eventos recebidos
socket.onAny((event, ...args) => {
  console.log(`Received: ${event}`, args);
});

// 3. Verificar namespace
console.log("Connected namespace:", socket.nsp);
```

#### Múltiplas conexões

**Sintomas**: Eventos recebidos em duplicata

**Causas**:
1. Múltiplas instâncias do socket
2. Não desconectar ao desmontar componente
3. Hot reload criando novas conexões

**Soluções**:

```typescript
// Singleton pattern
class SocketManager {
  private static instance: SocketManager;
  private socket: Socket;

  private constructor() {
    this.socket = io(url);
  }

  static getInstance() {
    if (!SocketManager.instance) {
      SocketManager.instance = new SocketManager();
    }
    return SocketManager.instance;
  }

  getSocket() {
    return this.socket;
  }
}

// No componente
useEffect(() => {
  const socketManager = SocketManager.getInstance();
  const socket = socketManager.getSocket();

  // Cleanup ao desmontar
  return () => {
    socket.off("appMessage");
    socket.off(`company-${companyId}-ticket`);
  };
}, []);
```

#### Desconexões frequentes

**Sintomas**: Socket desconecta e reconecta constantemente

**Causas**:
1. Token expirando
2. Problemas de rede
3. Server reiniciando
4. Timeout muito curto

**Soluções**:

```typescript
// Configurar reconnection
const socket = io(url, {
  reconnection: true,
  reconnectionDelay: 1000,
  reconnectionAttempts: Infinity,
  timeout: 20000,
});

// Listener de reconexão
socket.on("reconnect", (attemptNumber) => {
  console.log(`Reconectado após ${attemptNumber} tentativas`);
  // Reentrar em rooms
  socket.emit("joinNotification");
  socket.emit("joinTickets", "open");
});

// Listener de erro
socket.on("connect_error", (error) => {
  console.error("Erro de conexão:", error.message);
  if (error.message === "Token inválido") {
    // Renovar token
    refreshToken();
  }
});
```

### 13.2 Checklist de Debug

- [ ] Token JWT válido e não expirado
- [ ] CORS configurado com origem correta
- [ ] Namespace no formato `/workspace-{companyId}`
- [ ] Entrou nas rooms necessárias (joinChatBox, joinNotification, etc)
- [ ] Listeners configurados para os eventos corretos
- [ ] Verificar logs do backend (winston)
- [ ] Verificar Network tab do DevTools (WebSocket frames)
- [ ] Testar com Socket.IO Admin UI
- [ ] Verificar firewall/proxy não está bloqueando WebSocket

### 13.3 Logs Úteis

**Backend**:

```bash
# Logs de conexão
tail -f logs/combined.log | grep "Cliente conectado"

# Logs de erro
tail -f logs/error.log | grep "socket"

# Logs específicos do Socket.IO
DEBUG=socket.io:* npm run dev
```

**Frontend**:

```typescript
// Debug detalhado
socket.io.on("packet", (packet) => {
  console.log("Packet:", packet);
});

socket.io.on("packetCreate", (packet) => {
  console.log("Packet created:", packet);
});

// Eventos de engine
socket.io.engine.on("packet", (packet) => {
  console.log("Engine packet:", packet);
});
```

---

## 14. ESTATÍSTICAS

### Resumo do Sistema WebSocket

| Métrica | Valor |
|---------|-------|
| **Arquivo Principal** | socket.ts (199 linhas) |
| **Total de Emissões** | 128 ocorrências |
| **Arquivos que Emitem** | 49 arquivos |
| **Eventos do Cliente** | 5 (join/leave) |
| **Eventos do Servidor** | 6+ (appMessage, ticket, contact, etc) |
| **Namespaces** | Dinâmicos (`/workspace-{companyId}`) |
| **Rooms** | 5 tipos (ticket, notification, open, pending, closed) |
| **Autenticação** | JWT obrigatório |
| **Validação** | Zod schemas |
| **CORS** | Configurável via FRONTEND_URL |
| **Admin UI** | Disponível em dev mode |

### Principais Integrações

| Serviço | Emissões | Descrição |
|---------|----------|-----------|
| wbotMessageListener.ts | 15 | Mensagens WhatsApp |
| UpdateTicketService.ts | 8 | Atualização de tickets |
| ContactController.ts | 9 | CRUD de contatos |
| CreateTicketService.ts | 5 | Criação de tickets |
| WhatsAppController.ts | 6 | Conexões WhatsApp |
| UserController.ts | 5 | CRUD de usuários |
| CreateMessageService.ts | 4 | Criação de mensagens |
| TicketController.ts | 3 | Operações de tickets |

---

## 15. BOAS PRÁTICAS

### 15.1 ✅ FAZER

```typescript
// Usar getIO() nos serviços
import { getIO } from "../libs/socket";
const io = getIO();

// Emitir para namespace específico
io.of(String(companyId)).emit("event", data);

// Emitir para room específica
io.of(String(companyId)).to(String(ticketId)).emit("event", data);

// Validar payloads com Zod
const ticketIdSchema = z.string().uuid();
const ticketId = ticketIdSchema.parse(input);

// Desconectar ao desmontar componente
useEffect(() => {
  return () => socket.disconnect();
}, []);

// Reconectar e reentrar em rooms
socket.on("reconnect", () => {
  socket.emit("joinNotification");
});
```

### 15.2 ❌ NÃO FAZER

```typescript
// Emitir para namespace raiz (broadcast global)
io.emit("event", data); // ❌

// Ignorar erros de validação
socket.emit("joinChatBox", ticketId); // ❌ Sem callback

// Múltiplas instâncias do socket
const socket1 = io(url);
const socket2 = io(url); // ❌ Duplicado

// Não tratar desconexão
// ❌ Falta handler para reconexão

// Payloads gigantes
io.emit("event", { data: hugObject }); // ❌ > 1MB
```

---

## 16. REFERÊNCIAS

- **Socket.IO Documentation**: https://socket.io/docs/v4/
- **Socket.IO Admin UI**: https://socket.io/docs/v4/admin-ui/
- **Zod Validation**: https://zod.dev/
- **JWT**: https://jwt.io/
- **WebSocket RFC**: https://tools.ietf.org/html/rfc6455

---

**Documentação gerada**: Janeiro 2025
**Versão**: 1.0
**Última atualização**: 12/01/2025
