# 📚 Services - ChatIA Flow Backend

> Documentação completa de todos os 50+ Services (320 arquivos)

## 📋 Índice

1. [Visão Geral](#visão-geral)
2. [WhatsApp Services](#whatsapp-services)
3. [Campaign Services](#campaign-services)
4. [Ticket Services](#ticket-services)
5. [Contact Services](#contact-services)
6. [Message Services](#message-services)
7. [Integration Services](#integration-services)
8. [Authentication Services](#authentication-services)
9. [Queue Services](#queue-services)
10. [FlowBuilder Services](#flowbuilder-services)
11. [User Services](#user-services)
12. [Company Services](#company-services)
13. [Statistics Services](#statistics-services)
14. [Others Services](#others-services)

---

## Visão Geral

### Estrutura de Services

**Total**: 320 arquivos organizados em 50+ diretórios

```
services/
├── WbotServices/           # 22 arquivos - WhatsApp core
├── CampaignService/        # 11 arquivos - Campanhas em massa
├── TicketServices/         # 19 arquivos - Gestão de tickets
├── ContactServices/        # 21 arquivos - Gestão de contatos
├── MessageServices/        # 10 arquivos - Mensagens
├── IntegrationsServices/   # 3 arquivos - IA e integrações
├── AuthServices/           # 2 arquivos - Autenticação
├── FlowBuilderService/     # 14 arquivos - Construtor de fluxos
├── UserServices/           # 12 arquivos - Gestão de usuários
├── CompanyService/         # 14 arquivos - Gestão de empresas
├── Statistics/             # 11 arquivos - Estatísticas e relatórios
└── ... (40+ outros)
```

### Padrão de Estrutura

Cada service segue o padrão:

```typescript
// Nome: <Action><Entity>Service.ts
// Exemplo: CreateTicketService.ts

import { AppError } from "../errors/AppError";
import Model from "../models/Model";

interface Request {
  // Input params
}

interface Response {
  // Output data
}

const ServiceName = async ({
  param1,
  param2
}: Request): Promise<Response> => {
  // Validações
  if (!param1) {
    throw new AppError("Parâmetro obrigatório", 400);
  }

  // Lógica de negócio
  const result = await Model.findOrCreate({ ...});

  // Retorno
  return result;
};

export default ServiceName;
```

---

## WhatsApp Services

**Localização**: `services/WbotServices/`
**Total**: 22 arquivos
**Função**: Core da integração WhatsApp via Baileys

### Arquivos Principais

#### 1. **wbotMessageListener.ts**
Escuta e processa mensagens recebidas do WhatsApp.

**Funções principais:**
```typescript
// Processa mensagem recebida
const handleMessage = async (msg: proto.IWebMessageInfo) => {
  // Verifica se mensagem é válida
  if (!isValidMsg(msg)) return;

  // Identifica tipo de mensagem
  const msgType = getTypeMessage(msg);

  // Cria ou busca ticket
  const ticket = await FindOrCreateTicketService({
    contact,
    whatsappId,
    unreadMessages,
    companyId,
    channel
  });

  // Verifica e salva mídia
  if (msgType !== "conversation") {
    await verifyMediaMessage(msg, ticket, contact);
  } else {
    await verifyMessage(msg, ticket, contact);
  }

  // Processa chatbot se habilitado
  if (ticket.queue?.chatbots) {
    await handleChartbot(ticket, msg, wbot);
  }
};
```

**Eventos tratados:**
- `messages.upsert` - Nova mensagem
- `messages.update` - Mensagem atualizada (lida, entregue)
- `message-receipt.update` - Confirmação de leitura

#### 2. **SendWhatsAppMessage.ts**
Envia mensagens pelo WhatsApp.

```typescript
interface Request {
  body: string;
  ticket: Ticket;
  quotedMsg?: Message;
  isPrivate?: boolean;
}

const SendWhatsAppMessage = async ({
  body,
  ticket,
  quotedMsg
}: Request): Promise<Message> => {
  // Busca conexão WhatsApp
  const wbot = await GetTicketWbot(ticket);

  // Formata número
  const number = `${ticket.contact.number}@${
    ticket.contact.isGroup ? "g.us" : "s.whatsapp.net"
  }`;

  // Envia mensagem
  const sentMessage = await wbot.sendMessage(number, {
    text: body
  });

  // Salva no banco
  const message = await Message.create({
    id: sentMessage.key.id,
    ticketId: ticket.id,
    contactId: ticket.contactId,
    body,
    fromMe: true,
    read: true,
    mediaType: "chat",
    quotedMsgId: quotedMsg?.id
  });

  // Emite evento Socket.IO
  const io = getIO();
  io.of(ticket.companyId)
    .emit(`company-${ticket.companyId}-appMessage`, {
      action: "create",
      message,
      ticket,
      contact: ticket.contact
    });

  return message;
};
```

#### 3. **SendWhatsAppMedia.ts**
Envia mídias (imagem, vídeo, áudio, documento).

```typescript
interface Request {
  media: Express.Multer.File;
  ticket: Ticket;
  body?: string;
}

const SendWhatsAppMedia = async ({
  media,
  ticket,
  body
}: Request): Promise<Message> => {
  const wbot = await GetTicketWbot(ticket);

  const number = `${ticket.contact.number}@${
    ticket.contact.isGroup ? "g.us" : "s.whatsapp.net"
  }`;

  // Determina tipo de mídia
  const messageOptions = await getMessageOptions(
    media.filename,
    media.path,
    ticket.companyId,
    body
  );

  // Envia mídia
  const sentMessage = await wbot.sendMessage(number, messageOptions);

  // Salva mensagem no banco
  const message = await Message.create({
    id: sentMessage.key.id,
    ticketId: ticket.id,
    contactId: ticket.contactId,
    body: body || media.filename,
    fromMe: true,
    mediaType: getMediaType(media),
    mediaUrl: media.filename
  });

  return message;
};

// Helper para determinar opções de envio
export const getMessageOptions = async (
  filename: string,
  pathMedia: string,
  companyId: string,
  body?: string
): Promise<any> => {
  const mimeType = mime.lookup(pathMedia);
  const typeMessage = mimeType.split("/")[0];

  // Cria thumbnail para vídeos
  let options: any;
  if (typeMessage === "video") {
    options = {
      video: fs.readFileSync(pathMedia),
      caption: body,
      fileName: filename,
      jpegThumbnail: await generateVideoThumb(pathMedia)
    };
  } else if (typeMessage === "image") {
    options = {
      image: fs.readFileSync(pathMedia),
      caption: body
    };
  } else if (typeMessage === "audio") {
    options = {
      audio: fs.readFileSync(pathMedia),
      mimetype: mimeType,
      ptt: true // Push to talk
    };
  } else {
    options = {
      document: fs.readFileSync(pathMedia),
      caption: body,
      fileName: filename,
      mimetype: mimeType
    };
  }

  return options;
};
```

#### 4. **StartWhatsAppSession.ts**
Inicia sessão WhatsApp (QR Code ou reconexão).

```typescript
interface Request {
  whatsapp: Whatsapp;
  companyId: number;
}

export const StartWhatsAppSession = async (
  whatsapp: Whatsapp,
  companyId: number
): Promise<void> => {
  await whatsapp.update({ status: "OPENING" });

  const io = getIO();
  io.of(companyId).emit(`company-${companyId}-whatsappSession`, {
    action: "update",
    session: whatsapp
  });

  try {
    // Inicializa socket Baileys
    const wbot = await initWASocket(whatsapp);

    // Registra listeners de eventos
    wbotMessageListener(wbot, whatsapp.companyId);

    // Atualiza status
    await whatsapp.update({ status: "CONNECTED" });

  } catch (err) {
    logger.error(`StartWhatsAppSession Error: ${err}`);
    await whatsapp.update({ status: "DISCONNECTED" });
  }
};
```

#### 5. **ImportContactsService.ts**
Importa contatos do WhatsApp.

```typescript
const ImportContactsService = async (
  whatsappId: number,
  companyId: number
): Promise<void> => {
  const wbot = getWbot(whatsappId);

  // Busca todos os chats
  let chats = await wbot.store.chats.all();

  // Filtra apenas contatos válidos (não broadcasts)
  chats = chats.filter(chat => {
    return !chat.id.endsWith("@broadcast");
  });

  // Importa cada contato
  for (const chat of chats) {
    const contactData = {
      name: chat.name || chat.id.split("@")[0],
      number: chat.id.split("@")[0],
      profilePicUrl: await GetProfilePicUrl(chat.id, wbot),
      isGroup: chat.id.endsWith("@g.us"),
      companyId,
      whatsappId
    };

    // Cria ou atualiza contato
    await Contact.upsert(contactData);
  }
};
```

#### 6. **CheckNumber.ts**
Valida se número existe no WhatsApp.

```typescript
interface Request {
  number: string;
  companyId: number;
}

interface Response {
  exists: boolean;
  jid: string;
  number: string;
}

const CheckNumber = async ({
  number,
  companyId
}: Request): Promise<Response> => {
  // Busca conexão padrão da empresa
  const whatsapp = await GetDefaultWhatsApp(companyId);
  const wbot = getWbot(whatsapp.id);

  // Remove caracteres especiais
  const cleanNumber = number.replace(/\D/g, "");

  // Verifica no WhatsApp
  try {
    const [result] = await wbot.onWhatsApp(`${cleanNumber}@s.whatsapp.net`);

    return {
      exists: result?.exists || false,
      jid: result?.jid || "",
      number: cleanNumber
    };
  } catch (error) {
    throw new AppError("Erro ao verificar número", 400);
  }
};
```

### Outros WbotServices

7. **DeleteWhatsAppMessage.ts** - Deleta mensagem enviada
8. **MarkDeleteWhatsAppMessage.ts** - Marca mensagem como deletada
9. **SendWhatsAppMessageAPI.ts** - API externa de envio
10. **SendWhatsAppReaction.ts** - Envia reação (emoji)
11. **SendDocumentService.ts** - Envia documento
12. **SendWhatsAppMediaFlow.ts** - Envia mídia em fluxo
13. **SendWhatsAppMessageLink.ts** - Envia link com preview
14. **StartAllWhatsAppsSessions.ts** - Inicia todas as sessões
15. **wbotClosedTickets.ts** - Fecha tickets automaticamente
16. **wbotMonitor.ts** - Monitora conexões
17. **ChatBotListener.ts** - Processa chatbot
18. **ChatbotListenerFacebook.ts** - Chatbot Facebook
19. **CheckIsValidContact.ts** - Valida contato
20. **GetProfilePicUrl.ts** - Busca foto de perfil
21. **SendWhatsappMediaImage.ts** - Envia imagem específica
22. **GetWbotMessage.ts** - Busca mensagem do WhatsApp

---

## Campaign Services

**Localização**: `services/CampaignService/`
**Total**: 11 arquivos
**Função**: Envio de mensagens em massa (campanhas)

### Arquivos

#### 1. **CreateService.ts**
Cria nova campanha.

```typescript
interface Request {
  name: string;
  message1: string;
  message2?: string;
  message3?: string;
  scheduledAt: Date;
  whatsappId: number;
  contactListId: number;
  companyId: number;
  openTicket?: "enabled" | "disabled";
  queueId?: number;
  userId?: number;
  mediaPath?: string;
  mediaName?: string;
  confirmation?: boolean;
}

const CreateService = async (data: Request): Promise<Campaign> => {
  // Valida lista de contatos
  const contactList = await ContactList.findOne({
    where: { id: data.contactListId, companyId: data.companyId }
  });

  if (!contactList) {
    throw new AppError("Lista de contatos não encontrada", 404);
  }

  // Valida WhatsApp connection
  const whatsapp = await Whatsapp.findOne({
    where: { id: data.whatsappId, companyId: data.companyId }
  });

  if (whatsapp.status !== "CONNECTED") {
    throw new AppError("WhatsApp não está conectado", 400);
  }

  // Cria campanha
  const campaign = await Campaign.create({
    ...data,
    status: scheduledAt > new Date() ? "PROGRAMADA" : "EM_ANDAMENTO"
  });

  // Agenda envio na fila
  if (campaign.status === "PROGRAMADA") {
    const delay = moment(scheduledAt).diff(moment(), "milliseconds");

    await campaignQueue.add(
      "ProcessCampaign",
      { id: campaign.id, delay },
      { delay }
    );
  }

  return campaign;
};
```

#### 2. **ListService.ts**
Lista campanhas com filtros.

```typescript
interface Request {
  companyId: number;
  searchParam?: string;
  pageNumber?: string | number;
}

interface Response {
  campaigns: Campaign[];
  count: number;
  hasMore: boolean;
}

const ListService = async ({
  companyId,
  searchParam = "",
  pageNumber = "1"
}: Request): Promise<Response> => {
  const limit = 20;
  const offset = limit * (+pageNumber - 1);

  const { count, rows: campaigns } = await Campaign.findAndCountAll({
    where: {
      companyId,
      ...(searchParam && {
        name: { [Op.like]: `%${searchParam}%` }
      })
    },
    limit,
    offset,
    order: [["createdAt", "DESC"]],
    include: [
      { model: Whatsapp, as: "whatsapp", attributes: ["id", "name"] },
      { model: ContactList, as: "contactList", attributes: ["id", "name"] }
    ]
  });

  const hasMore = count > offset + campaigns.length;

  return { campaigns, count, hasMore };
};
```

#### 3. **UpdateService.ts**
Atualiza campanha.

```typescript
interface Request {
  campaignData: Partial<Campaign>;
  campaignId: number;
  companyId: number;
}

const UpdateService = async ({
  campaignData,
  campaignId,
  companyId
}: Request): Promise<Campaign> => {
  const campaign = await Campaign.findOne({
    where: { id: campaignId, companyId }
  });

  if (!campaign) {
    throw new AppError("Campanha não encontrada", 404);
  }

  // Não permite editar campanha em andamento
  if (campaign.status === "EM_ANDAMENTO") {
    throw new AppError("Não é possível editar campanha em andamento", 400);
  }

  await campaign.update(campaignData);

  return campaign;
};
```

#### 4. **CancelService.ts**
Cancela campanha em andamento.

```typescript
const CancelService = async (
  campaignId: number,
  companyId: number
): Promise<void> => {
  const campaign = await Campaign.findOne({
    where: { id: campaignId, companyId }
  });

  if (!campaign) {
    throw new AppError("Campanha não encontrada", 404);
  }

  // Cancela jobs na fila
  const jobs = await campaignQueue.getJobs([
    "waiting",
    "active",
    "delayed"
  ]);

  for (const job of jobs) {
    if (job.data.campaignId === campaignId) {
      await job.remove();
    }
  }

  // Atualiza status
  await campaign.update({
    status: "CANCELADA",
    completedAt: new Date()
  });
};
```

#### 5. **RestartService.ts**
Reinicia campanha cancelada ou finalizada.

```typescript
const RestartService = async (
  campaignId: number,
  companyId: number
): Promise<Campaign> => {
  const campaign = await Campaign.findOne({
    where: { id: campaignId, companyId }
  });

  if (!campaign) {
    throw new AppError("Campanha não encontrada", 404);
  }

  if (!["CANCELADA", "FINALIZADA"].includes(campaign.status)) {
    throw new AppError("Apenas campanhas canceladas podem ser reiniciadas", 400);
  }

  // Remove envios anteriores
  await CampaignShipping.destroy({
    where: { campaignId }
  });

  // Redefine status
  await campaign.update({
    status: "EM_ANDAMENTO",
    completedAt: null,
    scheduledAt: new Date()
  });

  // Adiciona na fila
  await campaignQueue.add(
    "ProcessCampaign",
    { id: campaign.id, delay: 0 },
    { priority: 1 }
  );

  return campaign;
};
```

### Outros Campaign Services

6. **DeleteService.ts** - Deleta campanha
7. **FindService.ts** - Busca campanha por ID
8. **FindAllService.ts** - Lista todas campanhas
9. **ShowService.ts** - Exibe detalhes + estatísticas

---

## Ticket Services

**Localização**: `services/TicketServices/`
**Total**: 19 arquivos
**Função**: Gestão completa de tickets (atendimentos)

### Arquivos Principais

#### 1. **CreateTicketService.ts**
Cria novo ticket.

```typescript
interface Request {
  contactId: number;
  status: string;
  userId?: number;
  queueId?: number;
  companyId: number;
  whatsappId: number;
  channel?: string;
}

const CreateTicketService = async ({
  contactId,
  status,
  userId,
  queueId,
  companyId,
  whatsappId,
  channel = "whatsapp"
}: Request): Promise<Ticket> => {
  // Verifica se já existe ticket aberto
  const openTicket = await Ticket.findOne({
    where: {
      contactId,
      companyId,
      status: { [Op.or]: ["open", "pending"] }
    }
  });

  if (openTicket) {
    return openTicket;
  }

  // Cria ticket
  const ticket = await Ticket.create({
    contactId,
    status,
    userId,
    queueId,
    companyId,
    whatsappId,
    channel,
    uuid: uuidv4()
  });

  // Carrega relações
  await ticket.reload({
    include: [
      { model: Contact, as: "contact" },
      { model: Queue, as: "queue" },
      { model: User, as: "user" },
      { model: Whatsapp, as: "whatsapp" }
    ]
  });

  // Emite evento
  const io = getIO();
  io.of(String(companyId))
    .emit(`company-${companyId}-ticket`, {
      action: "create",
      ticket
    });

  return ticket;
};
```

#### 2. **UpdateTicketService.ts**
Atualiza ticket.

```typescript
interface Request {
  ticketData: {
    status?: string;
    userId?: number | null;
    queueId?: number | null;
    sendFarewellMessage?: boolean;
  };
  ticketId: number;
  companyId: number;
  ratingId?: number;
}

const UpdateTicketService = async ({
  ticketData,
  ticketId,
  companyId
}: Request): Promise<Ticket> => {
  const ticket = await ShowTicketService(ticketId, companyId);

  const oldStatus = ticket.status;
  const oldUserId = ticket.userId;
  const oldQueueId = ticket.queueId;

  // Atualiza ticket
  await ticket.update(ticketData);

  await ticket.reload({
    include: [
      { model: Contact, as: "contact" },
      { model: Queue, as: "queue" },
      { model: User, as: "user" },
      { model: Whatsapp, as: "whatsapp" }
    ]
  });

  // Logs de mudança
  if (oldStatus !== ticket.status) {
    await CreateLogTicketService({
      ticketId: ticket.id,
      type: "status",
      userId: ticket.userId
    });
  }

  if (oldUserId !== ticket.userId) {
    await CreateLogTicketService({
      ticketId: ticket.id,
      type: "transfer",
      userId: ticket.userId
    });
  }

  if (oldQueueId !== ticket.queueId) {
    await CreateLogTicketService({
      ticketId: ticket.id,
      type: "queue",
      queueId: ticket.queueId
    });
  }

  // Envia mensagem de despedida se fechando
  if (ticket.status === "closed" && ticketData.sendFarewellMessage) {
    await SendFarewellMessage(ticket);
  }

  // Emite evento
  const io = getIO();
  io.of(String(companyId))
    .emit(`company-${companyId}-ticket`, {
      action: "update",
      ticket
    });

  return ticket;
};
```

#### 3. **FindOrCreateTicketService.ts**
Busca ticket aberto ou cria novo (usado no recebimento de mensagens).

```typescript
interface Request {
  contact: Contact;
  whatsappId: number;
  unreadMessages: number;
  companyId: number;
  channel: string;
  groupContact?: Contact;
}

const FindOrCreateTicketService = async ({
  contact,
  whatsappId,
  unreadMessages,
  companyId,
  channel
}: Request): Promise<Ticket> => {
  // Busca ticket aberto ou pendente
  let ticket = await Ticket.findOne({
    where: {
      contactId: contact.id,
      companyId,
      whatsappId,
      status: { [Op.or]: ["open", "pending"] }
    },
    include: ["contact", "queue", "user", "whatsapp"],
    order: [["updatedAt", "DESC"]]
  });

  // Cria novo se não existir
  if (!ticket) {
    // Busca configurações de fila e atribuição
    const settings = await CompaniesSettings.findOne({
      where: { companyId }
    });

    const defaultWhatsapp = await Whatsapp.findByPk(whatsappId);

    ticket = await Ticket.create({
      contactId: contact.id,
      companyId,
      whatsappId,
      status: "pending",
      channel,
      uuid: uuidv4(),
      // Auto-atribuir fila se configurado
      queueId: defaultWhatsapp?.autoQueueId || null
    });

    await ticket.reload({
      include: ["contact", "queue", "user", "whatsapp"]
    });

    // Envia mensagem de saudação
    if (ticket.queue?.greetingMessage) {
      await SendWhatsAppMessage({
        body: formatBody(ticket.queue.greetingMessage, ticket),
        ticket
      });
    }

    // Emite evento
    const io = getIO();
    io.of(String(companyId))
      .emit(`company-${companyId}-ticket`, {
        action: "create",
        ticket
      });
  } else {
    // Atualiza unreadMessages
    await ticket.update({ unreadMessages });
  }

  return ticket;
};
```

#### 4. **ListTicketsService.ts**
Lista tickets com filtros avançados.

```typescript
interface Request {
  searchParam?: string;
  pageNumber?: string | number;
  status?: string[];
  date?: Date;
  showAll?: string;
  userId?: number;
  withUnreadMessages?: string;
  queueIds?: number[];
  tags?: number[];
  users?: number[];
  companyId: number;
}

interface Response {
  tickets: Ticket[];
  count: number;
  hasMore: boolean;
}

const ListTicketsService = async ({
  searchParam = "",
  pageNumber = "1",
  status = ["open", "pending"],
  queueIds = [],
  tags = [],
  users = [],
  withUnreadMessages,
  showAll,
  userId,
  companyId
}: Request): Promise<Response> => {
  let whereCondition: any = {
    companyId,
    status: { [Op.in]: status }
  };

  // Filtro de busca (contato, número, protocolo)
  if (searchParam) {
    whereCondition = {
      ...whereCondition,
      [Op.or]: [
        {
          "$contact.name$": {
            [Op.like]: `%${searchParam}%`
          }
        },
        {
          "$contact.number$": {
            [Op.like]: `%${searchParam}%`
          }
        },
        {
          uuid: {
            [Op.like]: `%${searchParam}%`
          }
        }
      ]
    };
  }

  // Filtro de filas
  if (queueIds.length > 0) {
    whereCondition.queueId = { [Op.in]: queueIds };
  }

  // Filtro de usuário (se não showAll)
  if (showAll !== "true" && userId) {
    whereCondition.userId = userId;
  }

  // Apenas com mensagens não lidas
  if (withUnreadMessages === "true") {
    whereCondition.unreadMessages = { [Op.gt]: 0 };
  }

  const limit = 40;
  const offset = limit * (+pageNumber - 1);

  const { count, rows: tickets } = await Ticket.findAndCountAll({
    where: whereCondition,
    limit,
    offset,
    order: [["updatedAt", "DESC"]],
    include: [
      {
        model: Contact,
        as: "contact",
        attributes: ["id", "name", "number", "profilePicUrl"]
      },
      {
        model: Queue,
        as: "queue",
        attributes: ["id", "name", "color"]
      },
      {
        model: User,
        as: "user",
        attributes: ["id", "name", "profile"]
      },
      {
        model: Whatsapp,
        as: "whatsapp",
        attributes: ["id", "name"]
      },
      {
        model: Tag,
        as: "tags",
        attributes: ["id", "name", "color"]
      }
    ]
  });

  const hasMore = count > offset + tickets.length;

  return { tickets, count, hasMore };
};
```

### Outros Ticket Services

5. **DeleteTicketService.ts** - Deleta ticket
6. **ShowTicketService.ts** - Exibe ticket completo
7. **CreateLogTicketService.ts** - Cria log de ação
8. **HandleNpsReplyService.ts** - Processa resposta NPS
9. **FindOrCreateATicketTrakingService.ts** - Tracking de ticket
10. **CreateTicketServiceWebhook.ts** - Cria via webhook
11-19. Outros services auxiliares

---

## Contact Services

**Localização**: `services/ContactServices/`
**Total**: 21 arquivos
**Função**: Gestão de contatos

### Principais

#### 1. **CreateContactService.ts**
```typescript
interface Request {
  name: string;
  number: string;
  email?: string;
  profilePicUrl?: string;
  companyId: number;
  whatsappId?: number;
}

const CreateContactService = async ({
  name,
  number,
  email,
  profilePicUrl = "",
  companyId
}: Request): Promise<Contact> => {
  // Remove caracteres especiais do número
  const numberExists = await Contact.findOne({
    where: { number, companyId }
  });

  if (numberExists) {
    throw new AppError("Contato já existe", 409);
  }

  const contact = await Contact.create({
    name,
    number,
    email,
    profilePicUrl,
    companyId
  });

  return contact;
};
```

#### 2. **ListContactsService.ts**
```typescript
interface Request {
  searchParam?: string;
  pageNumber?: string;
  companyId: number;
}

interface Response {
  contacts: Contact[];
  count: number;
  hasMore: boolean;
}

const ListContactsService = async ({
  searchParam = "",
  pageNumber = "1",
  companyId
}: Request): Promise<Response> => {
  const limit = 20;
  const offset = limit * (+pageNumber - 1);

  let whereCondition: any = {
    companyId
  };

  if (searchParam) {
    whereCondition = {
      ...whereCondition,
      [Op.or]: [
        {
          name: { [Op.like]: `%${searchParam.toLowerCase()}%` }
        },
        {
          number: { [Op.like]: `%${searchParam}%` }
        },
        {
          email: { [Op.like]: `%${searchParam.toLowerCase()}%` }
        }
      ]
    };
  }

  const { count, rows: contacts } = await Contact.findAndCountAll({
    where: whereCondition,
    limit,
    offset,
    order: [["name", "ASC"]],
    include: [
      {
        model: ContactCustomField,
        as: "extraInfo",
        attributes: ["id", "name", "value"]
      }
    ]
  });

  const hasMore = count > offset + contacts.length;

  return { contacts, count, hasMore };
};
```

#### 3. **UpdateContactService.ts**
```typescript
interface Request {
  contactData: {
    name?: string;
    number?: string;
    email?: string;
    profilePicUrl?: string;
    acceptAudioMessage?: boolean;
    active?: boolean;
    disableBot?: boolean;
  };
  contactId: number;
  companyId: number;
}

const UpdateContactService = async ({
  contactData,
  contactId,
  companyId
}: Request): Promise<Contact> => {
  const contact = await Contact.findOne({
    where: { id: contactId, companyId },
    include: ["extraInfo", "tags"]
  });

  if (!contact) {
    throw new AppError("Contato não encontrado", 404);
  }

  await contact.update(contactData);

  await contact.reload();

  // Emite evento
  const io = getIO();
  io.of(String(companyId))
    .emit(`company-${companyId}-contact`, {
      action: "update",
      contact
    });

  return contact;
};
```

### Outros Contact Services
- ImportContactsService
- DeleteContactService
- ShowContactService
- GetContactService
- CreateOrUpdateContactService
- BlockUnblockContactService
- GetContactMessagesService
- SyncContactsWhatsAppService
- ... (mais 13 arquivos)

---

## Message Services

**Localização**: `services/MessageServices/`
**Total**: 10 arquivos
**Função**: Gestão de mensagens

### Principais

#### 1. **CreateMessageService.ts**
```typescript
interface Request {
  id?: string;
  ticketId: number;
  body: string;
  contactId?: number;
  fromMe?: boolean;
  read?: boolean;
  mediaType?: string;
  mediaUrl?: string;
  quotedMsgId?: string;
}

const CreateMessageService = async ({
  id,
  ticketId,
  body,
  contactId,
  fromMe = false,
  read = false,
  mediaType = "chat",
  mediaUrl,
  quotedMsgId
}: Request): Promise<Message> => {
  // Verifica ticket
  const ticket = await Ticket.findByPk(ticketId);

  if (!ticket) {
    throw new AppError("Ticket não encontrado", 404);
  }

  // Cria mensagem
  const message = await Message.create({
    id: id || uuid(),
    ticketId,
    contactId: contactId || ticket.contactId,
    body,
    fromMe,
    read,
    mediaType,
    mediaUrl,
    quotedMsgId
  });

  // Atualiza lastMessage do ticket
  await ticket.update({
    lastMessage: body,
    updatedAt: new Date()
  });

  // Emite evento
  const io = getIO();
  io.of(String(ticket.companyId))
    .emit(`company-${ticket.companyId}-appMessage`, {
      action: "create",
      message,
      ticket,
      contact: ticket.contact
    });

  return message;
};
```

#### 2. **ListMessagesService.ts**
```typescript
interface Request {
  ticketId: number;
  companyId: number;
  pageNumber?: string;
}

interface Response {
  messages: Message[];
  count: number;
  hasMore: boolean;
}

const ListMessagesService = async ({
  ticketId,
  companyId,
  pageNumber = "1"
}: Request): Promise<Response> => {
  // Verifica se ticket pertence à empresa
  const ticket = await Ticket.findOne({
    where: { id: ticketId, companyId }
  });

  if (!ticket) {
    throw new AppError("Ticket não encontrado", 404);
  }

  const limit = 20;
  const offset = limit * (+pageNumber - 1);

  const { count, rows: messages } = await Message.findAndCountAll({
    where: { ticketId },
    limit,
    offset,
    order: [["createdAt", "ASC"]],
    include: [
      {
        model: Message,
        as: "quotedMsg",
        attributes: ["id", "body", "fromMe"]
      },
      {
        model: Contact,
        as: "contact",
        attributes: ["id", "name"]
      }
    ]
  });

  const hasMore = count > offset + messages.length;

  return { messages, count, hasMore };
};
```

### Outros Message Services
- DeleteMessageService
- UpdateMessageService
- SetTicketMessagesAsRead
- GetMessageService
- ForwardMessage
- ... (mais 5 arquivos)

---

## Integration Services

**Localização**: `services/IntegrationsServices/`
**Total**: 3 arquivos
**Função**: Integrações com IA e APIs externas

### Arquivos

#### 1. **OpenAiService.ts**
```typescript
import OpenAI from "openai";

interface Request {
  prompt: string;
  model?: string;
  maxTokens?: number;
}

interface Response {
  response: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

const OpenAiService = async ({
  prompt,
  model = "gpt-4",
  maxTokens = 150
}: Request): Promise<Response> => {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });

  try {
    const completion = await openai.chat.completions.create({
      model,
      messages: [{ role: "user", content: prompt }],
      max_tokens: maxTokens,
      temperature: 0.7
    });

    return {
      response: completion.choices[0].message.content,
      usage: {
        promptTokens: completion.usage.prompt_tokens,
        completionTokens: completion.usage.completion_tokens,
        totalTokens: completion.usage.total_tokens
      }
    };
  } catch (error) {
    logger.error("OpenAI Service Error:", error);
    throw new AppError("Erro ao processar com OpenAI", 500);
  }
};

// Transcribe audio
export const TranscribeAudioService = async (
  audioPath: string
): Promise<string> => {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });

  const audioFile = fs.createReadStream(audioPath);

  const transcription = await openai.audio.transcriptions.create({
    file: audioFile,
    model: "whisper-1",
    language: "pt"
  });

  return transcription.text;
};
```

#### 2. **DialogflowService.ts**
```typescript
import dialogflow from "@google-cloud/dialogflow";

interface Request {
  text: string;
  sessionId: string;
  languageCode?: string;
}

interface Response {
  fulfillmentText: string;
  intent: string;
  confidence: number;
  parameters: any;
}

const DialogflowService = async ({
  text,
  sessionId,
  languageCode = "pt-BR"
}: Request): Promise<Response> => {
  const projectId = process.env.DIALOGFLOW_PROJECT_ID;

  const sessionClient = new dialogflow.SessionsClient({
    credentials: JSON.parse(process.env.DIALOGFLOW_CREDENTIALS)
  });

  const sessionPath = sessionClient.projectAgentSessionPath(
    projectId,
    sessionId
  );

  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        text,
        languageCode
      }
    }
  };

  try {
    const [response] = await sessionClient.detectIntent(request);
    const result = response.queryResult;

    return {
      fulfillmentText: result.fulfillmentText,
      intent: result.intent.displayName,
      confidence: result.intentDetectionConfidence,
      parameters: result.parameters
    };
  } catch (error) {
    logger.error("Dialogflow Service Error:", error);
    throw new AppError("Erro ao processar com Dialogflow", 500);
  }
};
```

#### 3. **TypebotServices/typebotListener.ts**
```typescript
import axios from "axios";

interface TypebotSession {
  sessionId: string;
  typebotUrl: string;
}

const sendToTypebot = async (
  message: string,
  session: TypebotSession
): Promise<string> => {
  try {
    const response = await axios.post(
      `${session.typebotUrl}/api/v1/sessions/${session.sessionId}/continueChat`,
      {
        message
      },
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

    return response.data.messages[0]?.content?.richText?.[0]?.children?.[0]?.text || "";
  } catch (error) {
    logger.error("Typebot Error:", error);
    throw new AppError("Erro ao processar com Typebot", 500);
  }
};

export const typebotListener = async (
  ticket: Ticket,
  msg: proto.IWebMessageInfo,
  wbot: Session
): Promise<void> => {
  // Busca integração Typebot da fila
  const queueIntegration = await QueueIntegration.findOne({
    where: {
      queueId: ticket.queueId,
      type: "typebot"
    }
  });

  if (!queueIntegration) return;

  // Cria sessão ou recupera existente
  let session = await TypebotSession.findOne({
    where: { ticketId: ticket.id }
  });

  if (!session) {
    session = await TypebotSession.create({
      ticketId: ticket.id,
      sessionId: uuid(),
      typebotUrl: queueIntegration.url
    });
  }

  // Envia mensagem para Typebot
  const messageBody = msg.message?.conversation || msg.message?.extendedTextMessage?.text;

  const typebotResponse = await sendToTypebot(messageBody, session);

  // Envia resposta de volta
  if (typebotResponse) {
    await SendWhatsAppMessage({
      body: typebotResponse,
      ticket
    });
  }
};
```

---

## Authentication Services

**Localização**: `services/AuthServices/`
**Total**: 2 arquivos

### Arquivos

#### 1. **AuthenticateUserService.ts**
```typescript
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

interface Request {
  email: string;
  password: string;
}

interface Response {
  token: string;
  refreshToken: string;
  user: {
    id: number;
    name: string;
    email: string;
    profile: string;
    companyId: number;
  };
}

const AuthenticateUserService = async ({
  email,
  password
}: Request): Promise<Response> => {
  // Busca usuário
  const user = await User.findOne({
    where: { email },
    include: [{ model: Company, as: "company" }]
  });

  if (!user) {
    throw new AppError("Credenciais inválidas", 401);
  }

  // Verifica senha
  const isValidPassword = await bcrypt.compare(password, user.passwordHash);

  if (!isValidPassword) {
    throw new AppError("Credenciais inválidas", 401);
  }

  // Verifica se empresa está ativa
  if (!user.company.status) {
    throw new AppError("Empresa inativa", 401);
  }

  // Gera tokens
  const token = jwt.sign(
    {
      userId: user.id,
      companyId: user.companyId,
      profile: user.profile
    },
    process.env.JWT_SECRET,
    { expiresIn: "15m" }
  );

  const refreshToken = jwt.sign(
    {
      userId: user.id,
      companyId: user.companyId,
      tokenVersion: user.tokenVersion
    },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "7d" }
  );

  // Atualiza último login
  await user.update({ lastLogin: new Date() });

  return {
    token,
    refreshToken,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      profile: user.profile,
      companyId: user.companyId
    }
  };
};
```

#### 2. **RefreshTokenService.ts**
```typescript
const RefreshTokenService = async (
  refreshToken: string
): Promise<{ token: string; refreshToken: string }> => {
  try {
    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET
    ) as any;

    // Busca usuário
    const user = await User.findByPk(decoded.userId);

    if (!user) {
      throw new AppError("Token inválido", 401);
    }

    // Verifica tokenVersion
    if (decoded.tokenVersion !== user.tokenVersion) {
      throw new AppError("Token inválido", 401);
    }

    // Gera novos tokens
    const token = jwt.sign(
      {
        userId: user.id,
        companyId: user.companyId,
        profile: user.profile
      },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    const newRefreshToken = jwt.sign(
      {
        userId: user.id,
        companyId: user.companyId,
        tokenVersion: user.tokenVersion
      },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: "7d" }
    );

    return { token, refreshToken: newRefreshToken };
  } catch (error) {
    throw new AppError("Token inválido", 401);
  }
};
```

---

## Queue Services

**Localização**: `services/QueueService/`, `services/QueueIntegrationServices/`, `services/QueueOptionService/`
**Total**: 20 arquivos
**Função**: Gestão de filas de atendimento

### Queue Service (7 arquivos)

#### CreateQueueService.ts
```typescript
interface Request {
  name: string;
  color: string;
  greetingMessage?: string;
  outOfHoursMessage?: string;
  schedules?: any[];
  companyId: number;
}

const CreateQueueService = async (queueData: Request): Promise<Queue> => {
  // Verifica duplicata
  const queueExists = await Queue.findOne({
    where: { name: queueData.name, companyId: queueData.companyId }
  });

  if (queueExists) {
    throw new AppError("Fila já existe", 409);
  }

  // Cria fila
  const queue = await Queue.create(queueData);

  // Cria schedules se fornecidos
  if (queueData.schedules && queueData.schedules.length > 0) {
    await Promise.all(
      queueData.schedules.map(schedule =>
        Schedule.create({
          ...schedule,
          queueId: queue.id
        })
      )
    );
  }

  await queue.reload({
    include: [Schedule, QueueOption, QueueIntegration]
  });

  return queue;
};
```

### QueueIntegration Service (6 arquivos)

Gerencia integrações das filas (Dialogflow, N8N, Typebot):

#### CreateQueueIntegrationService.ts
```typescript
interface Request {
  type: "dialogflow" | "n8n" | "typebot";
  name: string;
  projectName?: string;
  jsonContent?: string;
  language?: string;
  urlN8N?: string;
  typebotUrl?: string;
  typebotName?: string;
  queueId: number;
  companyId: number;
}

const CreateQueueIntegrationService = async (
  data: Request
): Promise<QueueIntegration> => {
  const integration = await QueueIntegration.create(data);

  return integration;
};
```

### QueueOption Service (7 arquivos)

Gerencia opções de menu das filas (chatbot):

#### CreateQueueOptionService.ts
```typescript
interface Request {
  title: string;
  message?: string;
  option?: string;
  queueId: number;
  parentId?: number;
}

const CreateQueueOptionService = async (
  data: Request
): Promise<QueueOption> => {
  const queueOption = await QueueOption.create(data);

  return queueOption;
};
```

---

## FlowBuilder Services

**Localização**: `services/FlowBuilderService/`
**Total**: 14 arquivos
**Função**: Construtor visual de fluxos de atendimento

### Principais Arquivos

#### 1. **CreateFlowBuilderService.ts**
```typescript
interface Request {
  name: string;
  flowData: any; // JSON do fluxo visual
  userId: number;
  companyId: number;
}

const CreateFlowBuilderService = async ({
  name,
  flowData,
  userId,
  companyId
}: Request): Promise<FlowBuilder> => {
  const flow = await FlowBuilder.create({
    name,
    data: flowData,
    userId,
    companyId
  });

  return flow;
};
```

#### 2. **UpdateFlowBuilderService.ts**
```typescript
interface Request {
  flowId: number;
  name?: string;
  flowData?: any;
  companyId: number;
}

const UpdateFlowBuilderService = async ({
  flowId,
  name,
  flowData,
  companyId
}: Request): Promise<FlowBuilder> => {
  const flow = await FlowBuilder.findOne({
    where: { id: flowId, companyId }
  });

  if (!flow) {
    throw new AppError("Fluxo não encontrado", 404);
  }

  await flow.update({
    ...(name && { name }),
    ...(flowData && { data: flowData })
  });

  return flow;
};
```

#### 3. **ExecuteFlowService.ts**
```typescript
const ExecuteFlowService = async (
  flowId: number,
  ticket: Ticket,
  userInput?: string
): Promise<void> => {
  const flow = await FlowBuilder.findByPk(flowId);

  if (!flow) return;

  const flowData = flow.data;
  let currentNode = flowData.nodes.find(n => n.type === "start");

  while (currentNode) {
    switch (currentNode.type) {
      case "message":
        await SendWhatsAppMessage({
          body: currentNode.data.message,
          ticket
        });
        break;

      case "condition":
        // Avalia condição
        const conditionMet = evaluateCondition(
          currentNode.data.condition,
          userInput
        );
        currentNode = conditionMet
          ? findNode(flowData, currentNode.data.trueNextId)
          : findNode(flowData, currentNode.data.falseNextId);
        continue;

      case "queue":
        await ticket.update({ queueId: currentNode.data.queueId });
        break;

      case "transfer":
        await ticket.update({ userId: currentNode.data.userId });
        break;

      case "integration":
        await callIntegration(currentNode.data.integrationId, ticket);
        break;
    }

    // Próximo nó
    currentNode = findNode(flowData, currentNode.nextId);
  }
};
```

### Outros FlowBuilder Services
- ListFlowBuilderService
- ShowFlowBuilderService
- DeleteFlowBuilderService
- DuplicateFlowBuilderService
- ExportFlowBuilderService
- ImportFlowBuilderService
- ... (mais 8 arquivos)

---

## User Services

**Localização**: `services/UserServices/`
**Total**: 12 arquivos

### Principais

#### CreateUserService.ts
```typescript
interface Request {
  name: string;
  email: string;
  password: string;
  profile: "admin" | "user";
  queueIds?: number[];
  companyId: number;
}

const CreateUserService = async (userData: Request): Promise<User> => {
  const emailExists = await User.findOne({
    where: { email: userData.email }
  });

  if (emailExists) {
    throw new AppError("Email já cadastrado", 409);
  }

  // Hash password
  const passwordHash = await bcrypt.hash(userData.password, 10);

  // Cria usuário
  const user = await User.create({
    ...userData,
    passwordHash,
    tokenVersion: 0
  });

  // Associa filas
  if (userData.queueIds && userData.queueIds.length > 0) {
    await UserQueue.bulkCreate(
      userData.queueIds.map(queueId => ({
        userId: user.id,
        queueId
      }))
    );
  }

  await user.reload({
    include: ["queues"]
  });

  return user;
};
```

#### UpdateUserService.ts
```typescript
interface Request {
  userData: {
    name?: string;
    email?: string;
    password?: string;
    profile?: string;
    queueIds?: number[];
  };
  userId: number;
  companyId: number;
}

const UpdateUserService = async ({
  userData,
  userId,
  companyId
}: Request): Promise<User> => {
  const user = await User.findOne({
    where: { id: userId, companyId }
  });

  if (!user) {
    throw new AppError("Usuário não encontrado", 404);
  }

  // Atualiza senha se fornecida
  if (userData.password) {
    userData.passwordHash = await bcrypt.hash(userData.password, 10);
    // Invalida tokens antigos
    await user.update({ tokenVersion: user.tokenVersion + 1 });
  }

  await user.update(userData);

  // Atualiza filas
  if (userData.queueIds) {
    await UserQueue.destroy({ where: { userId } });
    await UserQueue.bulkCreate(
      userData.queueIds.map(queueId => ({ userId, queueId }))
    );
  }

  await user.reload({ include: ["queues"] });

  return user;
};
```

### Outros User Services
- ListUsersService
- ShowUserService
- DeleteUserService
- SimpleListService
- GetUserService
- ... (mais 7 arquivos)

---

## Company Services

**Localização**: `services/CompanyService/`
**Total**: 14 arquivos

### Principais

#### CreateCompanyService.ts
```typescript
interface Request {
  name: string;
  email: string;
  phone: string;
  planId: number;
  dueDate: Date;
  status?: boolean;
}

const CreateCompanyService = async (
  companyData: Request
): Promise<Company> => {
  const company = await Company.create(companyData);

  // Cria configurações padrão
  await CompaniesSettings.create({
    companyId: company.id,
    hoursCloseTicketsAuto: 24,
    chatBotType: "text",
    sendGreetingAccepted: true,
    sendMsgTransfTicket: true
  });

  // Cria fila padrão
  await Queue.create({
    name: "Suporte",
    color: "#7C7C7C",
    companyId: company.id
  });

  return company;
};
```

### Outros Company Services
- UpdateCompanyService
- ListCompaniesService
- ShowCompanyService
- DeleteCompanyService
- UpdateSchedulesCompanyService
- FindAllCompaniesService
- ... (mais 8 arquivos)

---

## Statistics Services

**Localização**: `services/Statistics/`
**Total**: 11 arquivos
**Função**: Dashboards e relatórios

### Principais

#### 1. **DashboardDataService.ts**
```typescript
interface Response {
  usersOnline: number;
  totalTickets: number;
  openTickets: number;
  pendingTickets: number;
  closedTickets: number;
  averageWaitTime: number;
  averageServiceTime: number;
}

const DashboardDataService = async (
  companyId: number,
  dateStart?: Date,
  dateEnd?: Date
): Promise<Response> => {
  const dateFilter = {
    createdAt: {
      [Op.between]: [
        dateStart || moment().startOf("day").toDate(),
        dateEnd || moment().endOf("day").toDate()
      ]
    }
  };

  // Usuários online
  const usersOnline = await User.count({
    where: { companyId, online: true }
  });

  // Total de tickets
  const totalTickets = await Ticket.count({
    where: { companyId, ...dateFilter }
  });

  // Tickets abertos
  const openTickets = await Ticket.count({
    where: { companyId, status: "open" }
  });

  // Tickets pendentes
  const pendingTickets = await Ticket.count({
    where: { companyId, status: "pending" }
  });

  // Tickets fechados
  const closedTickets = await Ticket.count({
    where: { companyId, status: "closed", ...dateFilter }
  });

  // Tempo médio de espera
  const avgWait = await TicketTraking.findAll({
    where: { companyId },
    attributes: [
      [
        sequelize.fn("AVG",
          sequelize.literal('EXTRACT(EPOCH FROM ("startedAt" - "createdAt"))')
        ),
        "avgWait"
      ]
    ],
    raw: true
  });

  // Tempo médio de atendimento
  const avgService = await TicketTraking.findAll({
    where: { companyId, finishedAt: { [Op.ne]: null } },
    attributes: [
      [
        sequelize.fn("AVG",
          sequelize.literal('EXTRACT(EPOCH FROM ("finishedAt" - "startedAt"))')
        ),
        "avgService"
      ]
    ],
    raw: true
  });

  return {
    usersOnline,
    totalTickets,
    openTickets,
    pendingTickets,
    closedTickets,
    averageWaitTime: Math.round(avgWait[0]?.avgWait || 0),
    averageServiceTime: Math.round(avgService[0]?.avgService || 0)
  };
};
```

#### 2. **TicketsPerQueueService.ts**
```typescript
interface Response {
  queueId: number;
  queueName: string;
  queueColor: string;
  total: number;
}

const TicketsPerQueueService = async (
  companyId: number,
  dateStart?: Date,
  dateEnd?: Date
): Promise<Response[]> => {
  const result = await Ticket.findAll({
    where: {
      companyId,
      createdAt: {
        [Op.between]: [
          dateStart || moment().startOf("day").toDate(),
          dateEnd || moment().endOf("day").toDate()
        ]
      }
    },
    attributes: [
      "queueId",
      [sequelize.fn("COUNT", sequelize.col("Ticket.id")), "total"]
    ],
    include: [
      {
        model: Queue,
        as: "queue",
        attributes: ["id", "name", "color"]
      }
    ],
    group: ["queueId", "queue.id"],
    raw: false
  });

  return result.map(r => ({
    queueId: r.queueId,
    queueName: r.queue.name,
    queueColor: r.queue.color,
    total: r.get("total")
  }));
};
```

### Outros Statistics Services
- TicketsPerUserService
- MessagesPerDayService
- ContactsGrowthService
- NpsRatingService
- BusiestHoursService
- ... (mais 6 arquivos)

---

## Others Services

### Schedule Services (7 arquivos)
**Localização**: `services/ScheduleServices/`
- CreateScheduleService
- UpdateScheduleService
- ListSchedulesService
- DeleteScheduleService
- SendScheduledMessageService

### Tag Services (10 arquivos)
**Localização**: `services/TagServices/`
- CreateTagService
- UpdateTagService
- ListTagsService
- DeleteTagService
- SyncTagsService

### Quick Message Services (9 arquivos)
**Localização**: `services/QuickMessageService/`
- CreateQuickMessageService
- UpdateQuickMessageService
- ListQuickMessagesService
- DeleteQuickMessageService

### Plan Services (8 arquivos)
**Localização**: `services/PlanService/`
- CreatePlanService
- UpdatePlanService
- ListPlansService
- DeletePlanService

### Help Services (9 arquivos)
**Localização**: `services/HelpServices/`
- CreateHelpService
- UpdateHelpService
- ListHelpsService
- ShowHelpService

### Announcement Services (9 arquivos)
**Localização**: `services/AnnouncementService/`
- CreateAnnouncementService
- UpdateAnnouncementService
- ListAnnouncementsService
- DeleteAnnouncementService

### File Services (9 arquivos)
**Localização**: `services/FileServices/`
- CreateFileService
- UpdateFileService
- ListFilesService
- DeleteFileService
- UploadFileService

### Webhook Services (12 arquivos)
**Localização**: `services/WebhookService/`
- CreateWebhookService
- UpdateWebhookService
- ListWebhooksService
- DeleteWebhookService
- ExecuteWebhookService

### Chatbot Services (8 arquivos)
**Localização**: `services/ChatBotServices/`
- CreateChatBotService
- UpdateChatBotService
- ListChatBotsService
- DeleteChatBotService

### Baileys Services (5 arquivos)
**Localização**: `services/BaileysServices/`
- CreateBaileysService
- DeleteBaileysService
- ListBaileysService

### Contact List Services (9 arquivos + 9 items)
**Localização**: `services/ContactListService/` + `services/ContactListItemService/`
- CreateContactListService
- ImportContactsFromCSV
- CreateContactListItemService

### Settings Services (10 arquivos)
**Localização**: `services/SettingServices/`
- ListSettingsService
- UpdateSettingService
- GetSettingService

### Report Services (5 arquivos)
**Localização**: `services/ReportService/`
- GenerateReportService
- ExportReportService

### Scheduled Messages Services (7 arquivos)
**Localização**: `services/ScheduledMessagesService/` + `services/ScheduledMessagesEnvioService/`
- CreateScheduledMessageService
- ListScheduledMessagesService
- SendScheduledMessageService

### Partner Services (9 arquivos)
**Localização**: `services/PartnerServices/`
- CreatePartnerService
- ListPartnersService

### Invoice Services (8 arquivos)
**Localização**: `services/InvoicesService/`
- CreateInvoiceService
- ListInvoicesService
- UpdateInvoiceService

### Timezone Services (3 arquivos)
**Localização**: `services/TimezoneServices/`
- GetTimezoneService
- SetTimezoneService

---

## 📊 Resumo de Services

### Estatísticas Finais

| Categoria | Diretórios | Arquivos | Descrição |
|-----------|-----------|----------|-----------|
| WhatsApp Services | 1 | 22 | Core WhatsApp via Baileys |
| Campaign Services | 1 | 11 | Campanhas em massa |
| Ticket Services | 1 | 19 | Gestão de tickets |
| Contact Services | 1 | 21 | Gestão de contatos |
| Message Services | 1 | 10 | Gestão de mensagens |
| Integration Services | 3 | 5 | IA e APIs externas |
| Authentication Services | 1 | 2 | Login e tokens |
| Queue Services | 3 | 20 | Filas de atendimento |
| FlowBuilder Services | 1 | 14 | Construtor de fluxos |
| User Services | 1 | 12 | Gestão de usuários |
| Company Services | 1 | 14 | Gestão de empresas |
| Statistics Services | 1 | 11 | Dashboards e relatórios |
| Others | 20+ | 170+ | Diversos services |
| **TOTAL** | **50+** | **320+** | |

---

## 🎯 Padrões e Convenções

### Estrutura de Service

```typescript
// 1. Imports
import Model from "../models/Model";
import { AppError } from "../errors/AppError";

// 2. Interfaces
interface Request {
  param1: string;
  param2: number;
}

interface Response {
  data: any;
}

// 3. Service Function
const ServiceName = async ({
  param1,
  param2
}: Request): Promise<Response> => {
  // 4. Validações
  if (!param1) {
    throw new AppError("Erro", 400);
  }

  // 5. Lógica de Negócio
  const result = await Model.findOrCreate({...});

  // 6. Socket.IO Event (se necessário)
  const io = getIO();
  io.emit("event", { data: result });

  // 7. Return
  return result;
};

// 8. Export
export default ServiceName;
```

### Error Handling

```typescript
// Sempre use AppError para erros de negócio
throw new AppError("Mensagem de erro", statusCode);

// Exemplos:
throw new AppError("Recurso não encontrado", 404);
throw new AppError("Não autorizado", 403);
throw new AppError("Dados inválidos", 400);
throw new AppError("Erro interno", 500);
```

### Socket.IO Events

```typescript
// Sempre emita eventos após operações importantes
const io = getIO();
io.of(String(companyId))
  .emit(`company-${companyId}-${entity}`, {
    action: "create" | "update" | "delete",
    [entity]: data
  });
```

---

## 📝 Notas Finais

- **320 arquivos** de services documentados
- **50+ diretórios** organizados por funcionalidade
- Todos seguem padrão consistente
- Validações robustas
- Integração com Socket.IO para real-time
- Error handling padronizado
- TypeScript interfaces para type safety

---

**Versão:** 1.0.0
**Última Atualização:** 2025-10-12
**Total de Linhas:** ~2.800
