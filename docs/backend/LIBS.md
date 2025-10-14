# 📚 Core Libraries - ChatIA Flow Backend

> Documentação das 6 bibliotecas fundamentais do sistema (libs/)

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [wbot.ts](#wbotts)
3. [socket.ts](#socketts)
4. [cache.ts](#cachets)
5. [queue.ts](#queuets)
6. [store.ts](#storets)
7. [ticketLock.ts](#ticketlockts)

---

## Visão Geral

### Estrutura

```
libs/
├── wbot.ts          # 471 linhas - WhatsApp Bot (Baileys)
├── socket.ts        # 210 linhas - Socket.IO setup
├── cache.ts         # 150 linhas - Redis cache layer
├── queue.ts         # 80 linhas - Bull queue wrapper
├── store.ts         # 120 linhas - State management
└── ticketLock.ts    # 90 linhas - Ticket locking system
```

### Responsabilidades

| Lib | Função | Dependências |
|-----|--------|-------------|
| **wbot.ts** | Gerencia conexões WhatsApp via Baileys | @whiskeysockets/baileys, node-cache |
| **socket.ts** | Configura Socket.IO com namespaces | socket.io, zod, jsonwebtoken |
| **cache.ts** | Abstração para cache Redis | ioredis |
| **queue.ts** | Abstração para filas Bull | bull |
| **store.ts** | Armazena estado das sessões | - |
| **ticketLock.ts** | Sistema de locks distribuídos | ioredis |

---

## wbot.ts

**Localização**: `src/libs/wbot.ts`
**Linhas**: 471
**Função**: Core da integração WhatsApp via Baileys

### Estrutura Principal

```typescript
import makeWASocket, {
  AuthenticationState,
  DisconnectReason,
  WASocket,
  fetchLatestWaWebVersion
} from "@whiskeysockets/baileys";
import NodeCache from "node-cache";
import { useMultiFileAuthState } from "../helpers/useMultiFileAuthState";

// Caches
const msgRetryCounterCache = new NodeCache({
  stdTTL: 600,      // 10 minutos
  maxKeys: 1000,
  checkperiod: 300,
  useClones: false
});

const msgCache = new NodeCache({
  stdTTL: 60,       // 1 minuto
  maxKeys: 1000,
  checkperiod: 300,
  useClones: false
});

// Logger Baileys
const loggerBaileys = MAIN_LOGGER.child({});
loggerBaileys.level = "error";

// Session type
type Session = WASocket & {
  id?: number;
  store?: Store;
};

// Array de sessões ativas
const sessions: Session[] = [];

// Mapa de retries do QR Code
const retriesQrCodeMap = new Map<number, number>();
```

### Funções Principais

#### 1. getWbot

Retorna sessão WhatsApp ativa.

```typescript
export const getWbot = (whatsappId: number): Session => {
  const sessionIndex = sessions.findIndex(s => s.id === whatsappId);

  if (sessionIndex === -1) {
    throw new AppError("ERR_WAPP_NOT_INITIALIZED");
  }

  return sessions[sessionIndex];
};
```

**Uso**:
```typescript
const wbot = getWbot(whatsappId);
await wbot.sendMessage(number, { text: "Olá!" });
```

#### 2. removeWbot

Remove sessão WhatsApp.

```typescript
export const removeWbot = async (
  whatsappId: number,
  isLogout = true
): Promise<void> => {
  try {
    const sessionIndex = sessions.findIndex(s => s.id === whatsappId);

    if (sessionIndex !== -1) {
      if (isLogout) {
        // Faz logout e fecha conexão
        sessions[sessionIndex].logout();
        sessions[sessionIndex].ws.close();
      }

      // Remove do array
      sessions.splice(sessionIndex, 1);
    }
  } catch (err) {
    logger.error(err);
  }
};
```

#### 3. restartWbot

Reinicia todas as sessões de uma empresa.

```typescript
export const restartWbot = async (
  companyId: number,
  session?: any
): Promise<void> => {
  try {
    const whatsapps = await Whatsapp.findAll({
      where: { companyId },
      attributes: ["id"]
    });

    whatsapps.map(async c => {
      const sessionIndex = sessions.findIndex(s => s.id === c.id);
      if (sessionIndex !== -1) {
        sessions[sessionIndex].ws.close();
      }
    });
  } catch (err) {
    logger.error(err);
  }
};
```

#### 4. initWASocket

Inicializa socket WhatsApp (Baileys).

```typescript
export const initWASocket = async (whatsapp: Whatsapp): Promise<Session> => {
  return new Promise(async (resolve, reject) => {
    try {
      const io = getIO();
      const { id, name, allowGroup, companyId } = whatsapp;

      // Busca versão mais recente do WhatsApp Web
      const { version, isLatest } = await fetchLatestWaWebVersion({});
      logger.info(`using WA v${version.join(".")}, isLatest: ${isLatest}`);
      logger.info(`Starting session ${name}`);

      let retriesQrCode = 0;
      let wsocket: Session = null;

      // Carrega estado de autenticação
      const { state, saveCreds } = await useMultiFileAuthState(whatsapp);

      // Cria socket Baileys
      wsocket = makeWASocket({
        version,
        logger: loggerBaileys,
        printQRInTerminal: false,
        auth: {
          creds: state.creds,
          keys: makeCacheableSignalKeyStore(state.keys, logger)
        },
        generateHighQualityLinkPreview: true,
        linkPreviewImageThumbnailWidth: 192,

        // Ignora broadcasts e grupos (se configurado)
        shouldIgnoreJid: (jid) => {
          return isJidBroadcast(jid) || (!allowGroup && isJidGroup(jid));
        },

        browser: Browsers.appropriate("Desktop"),
        defaultQueryTimeoutMs: undefined,
        msgRetryCounterCache,
        markOnlineOnConnect: false,
        retryRequestDelayMs: 500,
        maxMsgRetryCount: 5,
        emitOwnEvents: true,
        fireInitQueries: true,
        transactionOpts: {
          maxCommitRetries: 10,
          delayBetweenTriesMs: 3000
        },
        connectTimeoutMs: 25_000,

        // Recupera mensagens do cache
        getMessage: msgDB.get
      });

      // Event: connection.update
      wsocket.ev.on("connection.update", async ({ connection, lastDisconnect, qr }) => {
        logger.info(
          `Socket ${name} Connection Update ${connection || ""} ${
            lastDisconnect ? lastDisconnect.error.message : ""
          }`
        );

        // Desconectado
        if (connection === "close") {
          const statusCode = (lastDisconnect?.error as Boom)?.output?.statusCode;

          if (statusCode === 403) {
            // Banido
            await whatsapp.update({ status: "PENDING", session: "" });
            await DeleteBaileysService(whatsapp.id);
            await cacheLayer.delFromPattern(`sessions:${whatsapp.id}:*`);

            io.of(String(companyId))
              .emit(`company-${whatsapp.companyId}-whatsappSession`, {
                action: "update",
                session: whatsapp
              });

            removeWbot(id, false);
          } else if (statusCode !== DisconnectReason.loggedOut) {
            // Reconecta
            removeWbot(id, false);
            setTimeout(() => StartWhatsAppSession(whatsapp, companyId), 2000);
          } else {
            // Logout
            await whatsapp.update({ status: "PENDING", session: "" });
            await DeleteBaileysService(whatsapp.id);
            await cacheLayer.delFromPattern(`sessions:${whatsapp.id}:*`);

            io.of(String(companyId))
              .emit(`company-${whatsapp.companyId}-whatsappSession`, {
                action: "update",
                session: whatsapp
              });

            removeWbot(id, false);
            setTimeout(() => StartWhatsAppSession(whatsapp, companyId), 2000);
          }
        }

        // Conectado
        if (connection === "open") {
          await whatsapp.update({
            status: "CONNECTED",
            qrcode: "",
            retries: 0,
            number:
              wsocket.type === "md"
                ? jidNormalizedUser((wsocket as WASocket).user.id).split("@")[0]
                : "-"
          });

          io.of(String(companyId))
            .emit(`company-${whatsapp.companyId}-whatsappSession`, {
              action: "update",
              session: whatsapp
            });

          const sessionIndex = sessions.findIndex(s => s.id === whatsapp.id);
          if (sessionIndex === -1) {
            wsocket.id = whatsapp.id;
            sessions.push(wsocket);
          }

          resolve(wsocket);
        }

        // QR Code gerado
        if (qr !== undefined) {
          if (retriesQrCodeMap.get(id) && retriesQrCodeMap.get(id) >= 3) {
            // Máximo de 3 QR Codes
            await whatsapp.update({
              status: "DISCONNECTED",
              qrcode: ""
            });
            await DeleteBaileysService(whatsapp.id);
            await cacheLayer.delFromPattern(`sessions:${whatsapp.id}:*`);

            io.of(String(companyId))
              .emit(`company-${whatsapp.companyId}-whatsappSession`, {
                action: "update",
                session: whatsapp
              });

            wsocket.ev.removeAllListeners("connection.update");
            wsocket.ws.close();
            wsocket = null;
            retriesQrCodeMap.delete(id);
          } else {
            logger.info(`Session QRCode Generate ${name}`);
            retriesQrCodeMap.set(id, (retriesQrCode += 1));

            await whatsapp.update({
              qrcode: qr,
              status: "qrcode",
              retries: 0,
              number: ""
            });

            const sessionIndex = sessions.findIndex(s => s.id === whatsapp.id);
            if (sessionIndex === -1) {
              wsocket.id = whatsapp.id;
              sessions.push(wsocket);
            }

            io.of(String(companyId))
              .emit(`company-${whatsapp.companyId}-whatsappSession`, {
                action: "update",
                session: whatsapp
              });
          }
        }
      });

      // Event: creds.update
      wsocket.ev.on("creds.update", saveCreds);

      // Import de mensagens antigas (se configurado)
      setTimeout(async () => {
        const wpp = await Whatsapp.findByPk(whatsapp.id);

        if (wpp?.importOldMessages && wpp.status === "CONNECTED") {
          let dateOldLimit = new Date(wpp.importOldMessages).getTime();
          let dateRecentLimit = new Date(wpp.importRecentMessages).getTime();

          addLogs({
            fileName: `preparingImportMessagesWppId${whatsapp.id}.txt`,
            forceNewFile: true,
            text: `Aguardando conexão para iniciar a importação de mensagens:
Whatsapp nome: ${wpp.name}
Whatsapp Id: ${wpp.id}
Criação do arquivo de logs: ${moment().format("DD/MM/YYYY HH:mm:ss")}
Selecionado Data de inicio de importação: ${moment(dateOldLimit).format("DD/MM/YYYY HH:mm:ss")}
Selecionado Data final da importação: ${moment(dateRecentLimit).format("DD/MM/YYYY HH:mm:ss")}
`
          });

          const statusImportMessages = new Date().getTime();
          await wpp.update({ statusImportMessages });

          // Event: messaging-history.set
          wsocket.ev.on("messaging-history.set", async (messageSet: any) => {
            const statusImportMessages = new Date().getTime();
            await wpp.update({ statusImportMessages });

            const whatsappId = whatsapp.id;
            let filteredMessages = messageSet.messages;
            let filteredDateMessages = [];

            filteredMessages.forEach(msg => {
              const timestampMsg = Math.floor(msg.messageTimestamp["low"] * 1000);

              if (
                isValidMsg(msg) &&
                dateOldLimit < timestampMsg &&
                dateRecentLimit > timestampMsg
              ) {
                if (msg.key?.remoteJid.split("@")[1] != "g.us") {
                  // Mensagem individual
                  addLogs({
                    fileName: `preparingImportMessagesWppId${whatsapp.id}.txt`,
                    text: `Adicionando mensagem para pos processamento:
Não é Mensagem de GRUPO >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
Data e hora da mensagem: ${moment(timestampMsg).format("DD/MM/YYYY HH:mm:ss")}
Contato da Mensagem : ${msg.key?.remoteJid}
Tipo da mensagem : ${getTypeMessage(msg)}

`
                  });
                  filteredDateMessages.push(msg);
                } else {
                  if (wpp?.importOldMessagesGroups) {
                    // Mensagem de grupo
                    addLogs({
                      fileName: `preparingImportMessagesWppId${whatsapp.id}.txt`,
                      text: `Adicionando mensagem para pos processamento:
Mensagem de GRUPO >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
Data e hora da mensagem: ${moment(timestampMsg).format("DD/MM/YYYY HH:mm:ss")}
Contato da Mensagem : ${msg.key?.remoteJid}
Tipo da mensagem : ${getTypeMessage(msg)}

`
                    });
                    filteredDateMessages.push(msg);
                  }
                }
              }
            });

            if (!dataMessages?.[whatsappId]) {
              dataMessages[whatsappId] = [];
              dataMessages[whatsappId].unshift(...filteredDateMessages);
            } else {
              dataMessages[whatsappId].unshift(...filteredDateMessages);
            }

            setTimeout(async () => {
              const wpp = await Whatsapp.findByPk(whatsappId);

              io.of(String(companyId))
                .emit(`importMessages-${wpp.companyId}`, {
                  action: "update",
                  status: { this: -1, all: -1 }
                });

              io.of(String(companyId))
                .emit(`company-${companyId}-whatsappSession`, {
                  action: "update",
                  session: wpp
                });
            }, 500);

            setTimeout(async () => {
              const wpp = await Whatsapp.findByPk(whatsappId);

              if (wpp?.importOldMessages) {
                let isTimeStamp = !isNaN(
                  new Date(Math.floor(parseInt(wpp?.statusImportMessages))).getTime()
                );

                if (isTimeStamp) {
                  const ultimoStatus = new Date(
                    Math.floor(parseInt(wpp?.statusImportMessages))
                  ).getTime();
                  const dataLimite = +add(ultimoStatus, { seconds: +45 }).getTime();

                  if (dataLimite < new Date().getTime()) {
                    ImportWhatsAppMessageService(wpp.id);
                    wpp.update({ statusImportMessages: "Running" });
                  }
                }
              }

              io.of(String(companyId))
                .emit(`company-${companyId}-whatsappSession`, {
                  action: "update",
                  session: wpp
                });
            }, 1000 * 45);
          });
        }
      }, 2500);

    } catch (error) {
      Sentry.captureException(error);
      console.log(error);
      reject(error);
    }
  });
};
```

### Message Cache

```typescript
// Helper para cache de mensagens
export default function msg() {
  return {
    // Recupera mensagem do cache
    get: (key: WAMessageKey) => {
      const { id } = key;
      if (!id) return;

      let data = msgCache.get(id);
      if (data) {
        try {
          let msg = JSON.parse(data as string);
          return msg?.message;
        } catch (error) {
          logger.error(error);
        }
      }
    },

    // Salva mensagem no cache
    save: (msg: WAMessage) => {
      const { id } = msg.key;
      const msgtxt = JSON.stringify(msg);
      try {
        msgCache.set(id as string, msgtxt);
      } catch (error) {
        logger.error(error);
      }
    }
  };
}

export const msgDB = msg();
```

---

## socket.ts

**Localização**: `src/libs/socket.ts`
**Linhas**: 210
**Função**: Configura Socket.IO com JWT, namespaces e validação Zod

### Setup

```typescript
import { Server as SocketIO } from "socket.io";
import { instrument } from "@socket.io/admin-ui";
import jwt from "jsonwebtoken";
import { z } from "zod";

let io: SocketIO;

export const initIO = (httpServer): SocketIO => {
  io = new SocketIO(httpServer, {
    cors: {
      origin: process.env.FRONTEND_URL,
      credentials: true
    },
    maxHttpBufferSize: 1e6,  // 1MB
    pingTimeout: 20000,      // 20 segundos
    pingInterval: 25000      // 25 segundos
  });

  // Admin UI (desenvolvimento)
  if (process.env.NODE_ENV === "development") {
    instrument(io, {
      auth: false,
      mode: "development"
    });
  }

  // Middleware de autenticação JWT
  io.use((socket, next) => {
    try {
      const token = socket.handshake.query.token as string;

      if (!token) {
        return next(new Error("Token não fornecido"));
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.data.user = decoded;

      next();
    } catch (error) {
      logger.error("Socket auth error:", error);
      next(new Error("Token inválido"));
    }
  });

  // Namespaces dinâmicos por empresa
  io.of(/^\/workspace-\d+$/).on("connection", handleConnection);

  logger.info("✅ Socket.IO initialized");

  return io;
};

export const getIO = (): SocketIO => {
  if (!io) {
    throw new Error("Socket.IO not initialized");
  }
  return io;
};
```

### Connection Handler

```typescript
const handleConnection = (socket) => {
  const { user } = socket.data;
  const namespace = socket.nsp;

  logger.info(`Socket connected: ${socket.id} - User: ${user.userId} - Namespace: ${namespace.name}`);

  // Join em salas
  socket.on("joinChatBox", (ticketId: string) => {
    socket.join(ticketId);
    logger.info(`Socket ${socket.id} joined room: ${ticketId}`);
  });

  socket.on("leaveChatBox", (ticketId: string) => {
    socket.leave(ticketId);
    logger.info(`Socket ${socket.id} left room: ${ticketId}`);
  });

  socket.on("joinTickets", (status: string) => {
    socket.join(status);
    logger.info(`Socket ${socket.id} joined tickets: ${status}`);
  });

  socket.on("joinNotification", () => {
    socket.join("notification");
    logger.info(`Socket ${socket.id} joined notification`);
  });

  socket.on("disconnect", (reason) => {
    logger.info(`Socket disconnected: ${socket.id} - Reason: ${reason}`);
  });
};
```

### Validação com Zod

```typescript
// Schemas de validação
const TicketSchema = z.object({
  id: z.number(),
  status: z.enum(["open", "pending", "closed"]),
  unreadMessages: z.number()
});

const MessageSchema = z.object({
  id: z.string(),
  body: z.string(),
  ticketId: z.number(),
  fromMe: z.boolean()
});

// Emite eventos com validação
export const emitTicket = (
  companyId: number,
  action: "create" | "update" | "delete",
  ticket: any
) => {
  try {
    // Valida dados
    const validatedTicket = TicketSchema.parse(ticket);

    // Emite evento
    io.of(`/workspace-${companyId}`)
      .emit(`company-${companyId}-ticket`, {
        action,
        ticket: validatedTicket
      });
  } catch (error) {
    logger.error("Ticket validation error:", error);
  }
};
```

---

## cache.ts

**Localização**: `src/libs/cache.ts`
**Linhas**: 150
**Função**: Abstração para cache Redis

### Setup

```typescript
import Redis from "ioredis";

const redis = new Redis({
  host: process.env.REDIS_HOST || "localhost",
  port: Number(process.env.REDIS_PORT) || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  db: Number(process.env.REDIS_DB) || 0,
  maxRetriesPerRequest: 3,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  }
});

redis.on("connect", () => {
  logger.info("✅ Redis connected");
});

redis.on("error", (error) => {
  logger.error("Redis error:", error);
});
```

### Funções

```typescript
class CacheLayer {
  // Set valor
  async set(key: string, value: any, ttl?: number): Promise<void> {
    const stringValue = JSON.stringify(value);

    if (ttl) {
      await redis.setex(key, ttl, stringValue);
    } else {
      await redis.set(key, stringValue);
    }
  }

  // Get valor
  async get<T>(key: string): Promise<T | null> {
    const value = await redis.get(key);

    if (!value) return null;

    try {
      return JSON.parse(value) as T;
    } catch {
      return value as any;
    }
  }

  // Delete
  async del(key: string): Promise<void> {
    await redis.del(key);
  }

  // Delete por padrão
  async delFromPattern(pattern: string): Promise<void> {
    const keys = await redis.keys(pattern);

    if (keys.length > 0) {
      await redis.del(...keys);
    }
  }

  // Verifica se existe
  async exists(key: string): Promise<boolean> {
    const result = await redis.exists(key);
    return result === 1;
  }

  // Incrementa
  async incr(key: string): Promise<number> {
    return await redis.incr(key);
  }

  // Decrementa
  async decr(key: string): Promise<number> {
    return await redis.decr(key);
  }

  // Expira
  async expire(key: string, seconds: number): Promise<void> {
    await redis.expire(key, seconds);
  }

  // TTL
  async ttl(key: string): Promise<number> {
    return await redis.ttl(key);
  }
}

export default new CacheLayer();
```

### Uso

```typescript
import cacheLayer from "./libs/cache";

// Salvar
await cacheLayer.set("user:123", { name: "João" }, 3600); // 1 hora

// Recuperar
const user = await cacheLayer.get<User>("user:123");

// Deletar
await cacheLayer.del("user:123");

// Deletar por padrão
await cacheLayer.delFromPattern("sessions:*");
```

---

## queue.ts

**Localização**: `src/libs/queue.ts`
**Linhas**: 80
**Função**: Abstração para Bull Queue

### Wrapper

```typescript
import BullQueue from "bull";

const connection = process.env.REDIS_URI || "";

class Queue {
  private queue: BullQueue.Queue;

  constructor(name: string, options = {}) {
    this.queue = new BullQueue(name, connection, options);

    this.queue.on("error", (error) => {
      logger.error(`Queue ${name} error:`, error);
    });
  }

  // Adiciona job
  async add(jobName: string, data: any, options = {}): Promise<BullQueue.Job> {
    return await this.queue.add(jobName, data, options);
  }

  // Processa jobs
  process(jobName: string, handler: any): void {
    this.queue.process(jobName, handler);
  }

  // Remove job
  async remove(jobId: string): Promise<void> {
    const job = await this.queue.getJob(jobId);
    if (job) {
      await job.remove();
    }
  }

  // Limpa jobs
  async clean(grace: number, status: string): Promise<void> {
    await this.queue.clean(grace, status);
  }

  // Pausa fila
  async pause(): Promise<void> {
    await this.queue.pause();
  }

  // Resume fila
  async resume(): Promise<void> {
    await this.queue.resume();
  }

  // Busca job
  async getJob(jobId: string): Promise<BullQueue.Job | null> {
    return await this.queue.getJob(jobId);
  }

  // Lista jobs
  async getJobs(types: string[]): Promise<BullQueue.Job[]> {
    return await this.queue.getJobs(types);
  }
}

export default Queue;
```

---

## store.ts

**Localização**: `src/libs/store.ts`
**Linhas**: 120
**Função**: State management para sessões

### Interface

```typescript
export interface Store {
  chats: Map<string, any>;
  messages: Map<string, any>;
  contacts: Map<string, any>;
  presences: Map<string, any>;
}

export class Store {
  constructor() {
    this.chats = new Map();
    this.messages = new Map();
    this.contacts = new Map();
    this.presences = new Map();
  }

  // Bind eventos do socket
  bind(ev: any): void {
    ev.on("chats.set", ({ chats }) => {
      chats.forEach(chat => {
        this.chats.set(chat.id, chat);
      });
    });

    ev.on("chats.update", (updates) => {
      updates.forEach(update => {
        const chat = this.chats.get(update.id);
        if (chat) {
          Object.assign(chat, update);
        }
      });
    });

    ev.on("messages.set", ({ messages }) => {
      messages.forEach(msg => {
        this.messages.set(msg.key.id, msg);
      });
    });

    ev.on("contacts.set", ({ contacts }) => {
      contacts.forEach(contact => {
        this.contacts.set(contact.id, contact);
      });
    });

    ev.on("presence.update", ({ id, presences }) => {
      this.presences.set(id, presences);
    });
  }

  // Busca chat
  getChat(jid: string): any {
    return this.chats.get(jid);
  }

  // Busca mensagem
  getMessage(id: string): any {
    return this.messages.get(id);
  }

  // Busca contato
  getContact(jid: string): any {
    return this.contacts.get(jid);
  }

  // Limpa store
  clear(): void {
    this.chats.clear();
    this.messages.clear();
    this.contacts.clear();
    this.presences.clear();
  }
}
```

---

## ticketLock.ts

**Localização**: `src/libs/ticketLock.ts`
**Linhas**: 90
**Função**: Sistema de locks distribuídos para tickets

### Implementação

```typescript
import Redis from "ioredis";

const redis = new Redis({
  host: process.env.REDIS_HOST,
  port: Number(process.env.REDIS_PORT)
});

class TicketLock {
  private lockPrefix = "ticket:lock:";
  private lockTTL = 30; // 30 segundos

  // Adquire lock
  async acquire(ticketId: number): Promise<boolean> {
    const key = `${this.lockPrefix}${ticketId}`;

    // SET NX EX (set if not exists com expiration)
    const result = await redis.set(
      key,
      "locked",
      "EX",
      this.lockTTL,
      "NX"
    );

    return result === "OK";
  }

  // Libera lock
  async release(ticketId: number): Promise<void> {
    const key = `${this.lockPrefix}${ticketId}`;
    await redis.del(key);
  }

  // Verifica se está locked
  async isLocked(ticketId: number): Promise<boolean> {
    const key = `${this.lockPrefix}${ticketId}`;
    const exists = await redis.exists(key);
    return exists === 1;
  }

  // Renova lock
  async renew(ticketId: number): Promise<boolean> {
    const key = `${this.lockPrefix}${ticketId}`;
    const result = await redis.expire(key, this.lockTTL);
    return result === 1;
  }
}

export default new TicketLock();
```

### Uso

```typescript
import ticketLock from "./libs/ticketLock";

// Adquire lock
const acquired = await ticketLock.acquire(ticketId);

if (!acquired) {
  throw new AppError("Ticket sendo processado por outro atendente", 409);
}

try {
  // Processa ticket
  await UpdateTicketService({ ticketId, ... });
} finally {
  // Sempre libera lock
  await ticketLock.release(ticketId);
}
```

---

## 📊 Resumo

| Lib | Linhas | Função Principal | Dependência |
|-----|--------|------------------|-------------|
| wbot.ts | 471 | WhatsApp Baileys | @whiskeysockets/baileys |
| socket.ts | 210 | Socket.IO setup | socket.io, zod, jwt |
| cache.ts | 150 | Redis cache | ioredis |
| queue.ts | 80 | Bull queue | bull |
| store.ts | 120 | State management | - |
| ticketLock.ts | 90 | Distributed locks | ioredis |
| **Total** | **1.121** | | |

---

**Versão:** 1.0.0
**Última Atualização:** 2025-10-12
