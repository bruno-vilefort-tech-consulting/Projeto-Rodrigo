# 🗄️ Models - ChatIA Backend

Documentação completa dos 55+ models Sequelize-TypeScript.

---

## Índice

- [Core Models](#core-models)
- [Sistema de Mensagens](#sistema-de-mensagens)
- [Campanhas e Automação](#campanhas-e-automação)
- [Integrações](#integrações)
- [Configurações](#configurações)
- [Relações Entre Models](#relações-entre-models)

---

## Core Models

### User

**Arquivo:** `src/models/User.ts`

```typescript
@Table
class User extends Model<User> {
  @PrimaryKey @AutoIncrement @Column
  id: number;

  @Column
  name: string;

  @Column
  email: string;

  @Column
  passwordHash: string;

  @Column
  tokenVersion: number;

  @Column({ defaultValue: "admin" })
  profile: string; // "admin" | "user" | "super"

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: Company;

  @BelongsToMany(() => Queue, () => UserQueue)
  queues: Queue[];

  @BelongsToMany(() => Whatsapp, () => WhatsappQueue)
  whatsapps: Whatsapp[];

  @HasMany(() => Ticket)
  tickets: Ticket[];

  // Permissões específicas
  @Column
  allowConnections: string; // "enabled" | "disabled"

  @Column
  showDashboard: string;

  @Column
  defaultTheme: string; // "light" | "dark"

  @Column
  defaultMenu: string; // "open" | "closed"

  @Column
  language: string; // "pt" | "en" | "es" | "tr" | "ar"

  @Column
  canViewAllContacts: boolean;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}
```

**Validações:**
- Email único por empresa
- Password hash com bcrypt
- TokenVersion para invalidar tokens

---

### Contact

**Arquivo:** `src/models/Contact.ts`

```typescript
@Table
class Contact extends Model<Contact> {
  @PrimaryKey @AutoIncrement @Column
  id: number;

  @Column
  name: string;

  @Column
  number: string; // WhatsApp number

  @Column
  email: string;

  @Column(DataType.TEXT)
  profilePicUrl: string;

  @Default(true)
  @Column
  isGroup: boolean;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: Company;

  @HasMany(() => Ticket)
  tickets: Ticket[];

  @BelongsToMany(() => Tag, () => ContactTag)
  tags: Tag[];

  @HasMany(() => ContactCustomField)
  extraInfo: ContactCustomField[];

  @Column
  remoteJid: string; // Baileys JID

  @Default(true)
  @Column
  active: boolean;

  @HasMany(() => ContactWallet)
  wallets: ContactWallet[];

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}
```

**Relações:**
- 1:N com Tickets
- N:M com Tags
- 1:N com ContactCustomField (campos extras)
- 1:N com ContactWallet (carteiras)

---

### Ticket

**Arquivo:** `src/models/Ticket.ts`

```typescript
@Table
class Ticket extends Model<Ticket> {
  @PrimaryKey @AutoIncrement @Column
  id: number;

  @Column({ defaultValue: "pending" })
  status: string; // "open" | "pending" | "closed"

  @Column
  unreadMessages: number;

  @Column
  lastMessage: string;

  @Default(false)
  @Column
  isGroup: boolean;

  @Default(uuidv4())
  @Column
  uuid: string;

  @Default("whatsapp")
  @Column
  channel: string;

  @Column
  closedAt: Date;

  @ForeignKey(() => Contact)
  @Column
  contactId: number;

  @BelongsTo(() => Contact)
  contact: Contact;

  @ForeignKey(() => User)
  @Column
  userId: number;

  @BelongsTo(() => User)
  user: User;

  @ForeignKey(() => Queue)
  @Column
  queueId: number;

  @BelongsTo(() => Queue)
  queue: Queue;

  @ForeignKey(() => Whatsapp)
  @Column
  whatsappId: number;

  @BelongsTo(() => Whatsapp)
  whatsapp: Whatsapp;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: Company;

  @HasMany(() => Message)
  messages: Message[];

  @BelongsToMany(() => Tag, () => TicketTag)
  tags: Tag[];

  // Flow & Bot
  @Column
  flowWebhook: boolean;

  @Column
  lastFlowId: string;

  @Column
  hashFlowId: string;

  @Column
  flowStopped: string;

  @Column(DataType.JSON)
  dataWebhook: object;

  @Default(false)
  @Column
  isBot: boolean;

  @Default(0)
  @Column
  amountUsedBotQueues: number;

  // Integrations
  @Default(false)
  @Column
  useIntegration: boolean;

  @ForeignKey(() => QueueIntegrations)
  @Column
  integrationId: number;

  @BelongsTo(() => QueueIntegrations)
  queueIntegration: QueueIntegrations;

  @Default(false)
  @Column
  typebotStatus: boolean;

  @Column
  typebotSessionId: string;

  @Column
  typebotSessionTime: Date;

  // LGPD
  @Column
  lgpdAcceptedAt: Date;

  @Column
  lgpdSendMessageAt: Date;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}
```

**Estados:**
- `pending`: Aguardando atendimento
- `open`: Em atendimento
- `closed`: Finalizado

---

### Message

**Arquivo:** `src/models/Message.ts`

```typescript
@Table
class Message extends Model<Message> {
  @PrimaryKey @AutoIncrement @Column
  id: number;

  @Column(DataType.TEXT)
  body: string;

  @Default(0)
  @Column
  ack: number; // 0-5 (sending, sent, delivered, read, played)

  @Default(false)
  @Column
  read: boolean;

  @Column
  mediaType: string; // "chat" | "image" | "video" | "audio" | "document"

  @Column
  mediaUrl: string;

  @Default(false)
  @Column
  fromMe: boolean;

  @Default(false)
  @Column
  isDeleted: boolean;

  @Column
  timestamp: number;

  @ForeignKey(() => Message)
  @Column
  quotedMsgId: number; // Reply to message

  @BelongsTo(() => Message, 'quotedMsgId')
  quotedMsg: Message;

  @ForeignKey(() => Ticket)
  @Column
  ticketId: number;

  @BelongsTo(() => Ticket)
  ticket: Ticket;

  @ForeignKey(() => Contact)
  @Column
  contactId: number;

  @BelongsTo(() => Contact)
  contact: Contact;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: Company;

  @Column
  remoteJid: string;

  @Column
  dataJson: string;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}
```

**ACK States:**
- 0: Enviando
- 1: Enviado
- 2: Entregue
- 3: Lido
- 4: Lido
- 5: Reproduzido (áudio)

---

### Company

**Arquivo:** `src/models/Company.ts`

```typescript
@Table
class Company extends Model<Company> {
  @PrimaryKey @AutoIncrement @Column
  id: number;

  @Column
  name: string;

  @Column
  document: string; // CNPJ

  @Default(true)
  @Column
  status: boolean;

  @Column
  dueDate: Date;

  @Column
  recurrence: string; // "monthly" | "yearly"

  @ForeignKey(() => Plan)
  @Column
  planId: number;

  @BelongsTo(() => Plan)
  plan: Plan;

  @HasMany(() => User)
  users: User[];

  @HasMany(() => Ticket)
  tickets: Ticket[];

  @HasMany(() => Contact)
  contacts: Contact[];

  @HasMany(() => Whatsapp)
  whatsapps: Whatsapp[];

  @HasMany(() => CompaniesSettings)
  settings: CompaniesSettings[];

  @Column
  paymentMethod: string; // "credit_card" | "boleto" | "pix"

  @Column
  lastLogin: Date;

  @Column
  timezone: string; // "America/Sao_Paulo"

  @Column
  timezoneSource: string; // "system" | "custom"

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}
```

**Multi-Tenant:**
Todas as entidades principais têm `companyId` para isolamento.

---

### Queue

**Arquivo:** `src/models/Queue.ts`

```typescript
@Table
class Queue extends Model<Queue> {
  @PrimaryKey @AutoIncrement @Column
  id: number;

  @Column
  name: string;

  @Column
  color: string;

  @Column(DataType.TEXT)
  greetingMessage: string;

  @Column(DataType.JSON)
  schedules: object[]; // Horários de funcionamento

  @Column(DataType.TEXT)
  outOfHoursMessage: string;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: Company;

  @HasMany(() => Chatbot)
  chatbots: Chatbot[];

  @HasMany(() => QueueIntegrations)
  queueIntegrations: QueueIntegrations[];

  @BelongsToMany(() => User, () => UserQueue)
  users: User[];

  @BelongsToMany(() => Whatsapp, () => WhatsappQueue)
  whatsapps: Whatsapp[];

  @Column
  orderQueue: number;

  @ForeignKey(() => Files)
  @Column
  fileListId: number;

  @BelongsTo(() => Files)
  fileList: Files;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}
```

---

### Whatsapp

**Arquivo:** `src/models/Whatsapp.ts`

```typescript
@Table
class Whatsapp extends Model<Whatsapp> {
  @PrimaryKey @AutoIncrement @Column
  id: number;

  @Column
  name: string;

  @Column({ unique: true })
  session: string;

  @Column(DataType.TEXT)
  qrcode: string;

  @Default("DISCONNECTED")
  @Column
  status: string; // "CONNECTED" | "DISCONNECTED" | "OPENING" | "PAIRING" | "TIMEOUT"

  @Column
  battery: string;

  @Column
  plugged: boolean;

  @Column
  number: string;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: Company;

  @BelongsToMany(() => Queue, () => WhatsappQueue)
  queues: Queue[];

  @Column(DataType.TEXT)
  greetingMessage: string;

  @Column(DataType.TEXT)
  complationMessage: string;

  @Default(true)
  @Column
  allowGroup: boolean;

  @Column
  timeUseBotQueues: number;

  @Column
  timeSendQueue: number;

  @Column
  importOldMessages: string;

  @Column
  closedTicketsPostImported: boolean;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}
```

**Status:**
- CONNECTED: Conectado ao WhatsApp
- DISCONNECTED: Desconectado
- OPENING: Abrindo sessão
- PAIRING: Pareando dispositivo
- TIMEOUT: Timeout

---

## Sistema de Mensagens

### QuickMessage

```typescript
@Table
class QuickMessage extends Model<QuickMessage> {
  @PrimaryKey @AutoIncrement @Column
  id: number;

  @Column
  shortcut: string; // "/"

  @Column(DataType.TEXT)
  message: string;

  @Column
  mediaPath: string;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @ForeignKey(() => User)
  @Column
  userId: number;
}
```

### ScheduledMessages

```typescript
@Table
class ScheduledMessages extends Model<ScheduledMessages> {
  @PrimaryKey @AutoIncrement @Column
  id: number;

  @Column
  data_mensagem_programada: Date;

  @Column(DataType.TEXT)
  mensagem: string;

  @Column
  mediaPath: string;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @ForeignKey(() => Contact)
  @Column
  contactId: number;

  @ForeignKey(() => Whatsapp)
  @Column
  whatsappId: number;

  @Default("pending")
  @Column
  status: string; // "pending" | "sent" | "error"
}
```

---

## Campanhas e Automação

### Campaign

```typescript
@Table
class Campaign extends Model<Campaign> {
  @PrimaryKey @AutoIncrement @Column
  id: number;

  @Column
  name: string;

  @Default("pending")
  @Column
  status: string; // "pending" | "running" | "completed" | "canceled"

  @Column(DataType.TEXT)
  message: string;

  @Column
  mediaPath: string;

  @Column
  scheduledAt: Date;

  @ForeignKey(() => ContactList)
  @Column
  contactListId: number;

  @BelongsTo(() => ContactList)
  contactList: ContactList;

  @ForeignKey(() => Whatsapp)
  @Column
  whatsappId: number;

  @BelongsTo(() => Whatsapp)
  whatsapp: Whatsapp;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @HasMany(() => CampaignShipping)
  shippings: CampaignShipping[];

  @Column
  openTicket: boolean;
}
```

### FlowBuilder

```typescript
@Table
class FlowBuilder extends Model<FlowBuilder> {
  @PrimaryKey @AutoIncrement @Column
  id: number;

  @Column
  name: string;

  @Column(DataType.JSON)
  flow: object; // React Flow JSON

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
```

### Chatbot

```typescript
@Table
class Chatbot extends Model<Chatbot> {
  @PrimaryKey @AutoIncrement @Column
  id: number;

  @Column
  name: string;

  @Column
  color: string;

  @Column(DataType.TEXT)
  greetingMessage: string;

  @ForeignKey(() => Queue)
  @Column
  queueId: number;

  @BelongsTo(() => Queue)
  queue: Queue;

  @ForeignKey(() => Queue)
  @Column
  optQueueId: number;

  @BelongsTo(() => Queue, 'optQueueId')
  optQueue: Queue;

  @ForeignKey(() => User)
  @Column
  optUserId: number;

  @BelongsTo(() => User)
  optUser: User;

  @ForeignKey(() => Files)
  @Column
  optFileId: number;

  @BelongsTo(() => Files)
  optFile: Files;
}
```

---

## Integrações

### QueueIntegrations

```typescript
@Table
class QueueIntegrations extends Model<QueueIntegrations> {
  @PrimaryKey @AutoIncrement @Column
  id: number;

  @Column
  type: string; // "dialogflow" | "n8n" | "openai" | "typebot"

  @Column
  name: string;

  @Column(DataType.TEXT)
  projectName: string; // Dialogflow

  @Column(DataType.TEXT)
  jsonContent: string; // Dialogflow credentials

  @Column(DataType.TEXT)
  urlN8N: string;

  @Column(DataType.TEXT)
  language: string; // Dialogflow

  @Column
  typebotDelayMessage: number;

  @Column(DataType.TEXT)
  typebotExpires: string;

  @Column(DataType.TEXT)
  typebotKeywordFinish: string;

  @Column(DataType.TEXT)
  typebotKeywordRestart: string;

  @Column(DataType.TEXT)
  typebotRestartMessage: string;

  @Column(DataType.TEXT)
  typebotSlug: string;

  @Column(DataType.TEXT)
  typebotUrl: string;

  @ForeignKey(() => Queue)
  @Column
  queueId: number;

  @ForeignKey(() => Company)
  @Column
  companyId: number;
}
```

---

## Configurações

### CompaniesSettings

```typescript
@Table
class CompaniesSettings extends Model<CompaniesSettings> {
  @PrimaryKey @AutoIncrement @Column
  id: number;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @Column
  hoursCloseTicketsAuto: string;

  @Column
  chatBotType: string; // "text" | "button" | "list"

  @Column
  acceptCallWhatsapp: string; // "enabled" | "disabled"

  @Column
  userRating: string; // "enabled" | "disabled"

  @Column
  scheduleType: string; // "company" | "queue"

  @Column
  acceptAudioMessageContact: string;

  @Column
  sendSignMessage: string;

  @Column
  sendGreetingAccepted: string;

  @Column
  SettingsTransfTicket: string;

  @Column
  sendMsgTransfTicket: string;

  @Column
  sendGreetingMessageOneQueues: string;

  @Column
  lgpdDeleteMessage: string;

  @Column
  lgpdHideNumber: string;

  @Column
  lgpdConsent: string;

  @Column
  lgpdLink: string;

  @Column(DataType.TEXT)
  lgpdMessage: string;
}
```

### Plan

```typescript
@Table
class Plan extends Model<Plan> {
  @PrimaryKey @AutoIncrement @Column
  id: number;

  @Column
  name: string;

  @Column
  users: number;

  @Column
  connections: number;

  @Column
  queues: number;

  @Column
  value: number;

  @Column
  amount: number;

  @Default(true)
  @Column
  useWhatsapp: boolean;

  @Default(true)
  @Column
  useFacebook: boolean;

  @Default(true)
  @Column
  useInstagram: boolean;

  @Default(true)
  @Column
  useCampaigns: boolean;

  @Default(true)
  @Column
  useSchedules: boolean;

  @Default(true)
  @Column
  useInternalChat: boolean;

  @Default(true)
  @Column
  useExternalApi: boolean;

  @Default(true)
  @Column
  useKanban: boolean;

  @Default(true)
  @Column
  useOpenAi: boolean;

  @Default(true)
  @Column
  useIntegrations: boolean;

  @HasMany(() => Company)
  companies: Company[];
}
```

---

## Relações Entre Models

### Diagrama ER

```
Company
├── hasMany User
├── hasMany Contact
├── hasMany Ticket
├── hasMany Whatsapp
├── hasMany Queue
├── hasMany Campaign
├── hasMany FlowBuilder
├── hasMany CompaniesSettings
└── belongsTo Plan

User
├── belongsTo Company
├── hasMany Ticket
├── belongsToMany Queue (UserQueue)
└── belongsToMany Whatsapp (WhatsappQueue)

Contact
├── belongsTo Company
├── hasMany Ticket
├── belongsToMany Tag (ContactTag)
└── hasMany ContactCustomField

Ticket
├── belongsTo Contact
├── belongsTo User
├── belongsTo Queue
├── belongsTo Whatsapp
├── belongsTo Company
├── hasMany Message
└── belongsToMany Tag (TicketTag)

Message
├── belongsTo Ticket
├── belongsTo Contact
├── belongsTo Company
└── belongsTo Message (quotedMsg)

Queue
├── belongsTo Company
├── hasMany Chatbot
├── hasMany QueueIntegrations
├── belongsToMany User (UserQueue)
└── belongsToMany Whatsapp (WhatsappQueue)

Whatsapp
├── belongsTo Company
└── belongsToMany Queue (WhatsappQueue)
```

---

## Índices e Performance

### Principais Índices

```sql
-- Tickets
CREATE INDEX idx_tickets_company_status ON Tickets(companyId, status);
CREATE INDEX idx_tickets_contact ON Tickets(contactId);
CREATE INDEX idx_tickets_user ON Tickets(userId);
CREATE INDEX idx_tickets_uuid ON Tickets(uuid);

-- Messages
CREATE INDEX idx_messages_ticket ON Messages(ticketId);
CREATE INDEX idx_messages_company ON Messages(companyId);

-- Contacts
CREATE INDEX idx_contacts_number ON Contacts(number);
CREATE INDEX idx_contacts_company ON Contacts(companyId);
```

---

---

## Sistema de Tags

### Tag

**Arquivo:** `src/models/Tag.ts`

```typescript
@Table
class Tag extends Model<Tag> {
  @PrimaryKey @AutoIncrement @Column
  id: number;

  @Column
  name: string;

  @Column
  color: string;

  @Column
  kanban: number; // Ordem no Kanban

  @Column
  timeLane: number; // Tempo na lane (segundos)

  @Column
  nextLaneId: number; // Próxima lane

  @Column
  rollbackLaneId: number; // Lane de retorno

  @Column
  greetingMessageLane: string;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: Company;

  @BelongsToMany(() => Ticket, () => TicketTag)
  tickets: Ticket[];

  @BelongsToMany(() => Contact, () => ContactTag)
  contacts: Contact[];

  @HasMany(() => TicketTag)
  ticketTags: TicketTag[];

  @HasMany(() => ContactTag)
  contactTags: ContactTag[];

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}
```

**Uso:**
- Organizar tickets e contatos
- Sistema Kanban (timeLane, nextLaneId)
- Automação de fluxo com greetingMessage

### ContactTag

**Arquivo:** `src/models/ContactTag.ts`

```typescript
@Table
class ContactTag extends Model<ContactTag> {
  @PrimaryKey @AutoIncrement @Column
  id: number;

  @ForeignKey(() => Tag)
  @Column
  tagId: number;

  @BelongsTo(() => Tag)
  tag: Tag;

  @ForeignKey(() => Contact)
  @Column
  contactId: number;

  @BelongsTo(() => Contact)
  contact: Contact;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}
```

**Relação:** N:M entre Contact e Tag

### TicketTag

**Arquivo:** `src/models/TicketTag.ts`

```typescript
@Table
class TicketTag extends Model<TicketTag> {
  @PrimaryKey @AutoIncrement @Column
  id: number;

  @ForeignKey(() => Tag)
  @Column
  tagId: number;

  @BelongsTo(() => Tag)
  tag: Tag;

  @ForeignKey(() => Ticket)
  @Column
  ticketId: number;

  @BelongsTo(() => Ticket)
  ticket: Ticket;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}
```

**Relação:** N:M entre Ticket e Tag

---

## Sistema de Campos Customizados

### ContactCustomField

**Arquivo:** `src/models/ContactCustomField.ts`

```typescript
@Table
class ContactCustomField extends Model<ContactCustomField> {
  @PrimaryKey @AutoIncrement @Column
  id: number;

  @Column
  name: string; // "CPF", "Endereço", etc

  @Column
  value: string;

  @ForeignKey(() => Contact)
  @Column
  contactId: number;

  @BelongsTo(() => Contact)
  contact: Contact;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}
```

**Exemplo de Uso:**
```typescript
// Adicionar campos extras ao contato
const contact = await Contact.findByPk(1, {
  include: [
    {
      model: ContactCustomField,
      as: 'extraInfo'
    }
  ]
});

// Criar campo customizado
await ContactCustomField.create({
  contactId: 1,
  name: 'CPF',
  value: '123.456.789-00'
});
```

---

## Sistema de Carteiras

### ContactWallet

**Arquivo:** `src/models/ContactWallet.ts`

```typescript
@Table
class ContactWallet extends Model<ContactWallet> {
  @PrimaryKey @AutoIncrement @Column
  id: number;

  @Column
  name: string;

  @ForeignKey(() => Contact)
  @Column
  contactId: number;

  @BelongsTo(() => Contact)
  contact: Contact;

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
```

**Propósito:** Gerenciar carteiras de clientes para organização de vendas.

---

## Sistema de Avaliações

### UserRating

**Arquivo:** `src/models/UserRating.ts`

```typescript
@Table({ tableName: "UserRatings" })
class UserRating extends Model<UserRating> {
  @PrimaryKey @AutoIncrement @Column
  id: number;

  @Column
  rate: number; // 1-5 estrelas

  @ForeignKey(() => Ticket)
  @Column
  ticketId: number;

  @BelongsTo(() => Ticket)
  ticket: Ticket;

  @ForeignKey(() => User)
  @Column
  userId: number;

  @BelongsTo(() => User)
  user: User;

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
```

**Query NPS:**
```typescript
// Calcular NPS
const ratings = await UserRating.findAll({
  where: { companyId },
  attributes: [
    [sequelize.fn('COUNT', sequelize.col('id')), 'total'],
    [sequelize.fn('AVG', sequelize.col('rate')), 'average'],
  ]
});

// Classificar
const promoters = await UserRating.count({
  where: { companyId, rate: { [Op.gte]: 4 } }
});
const detractors = await UserRating.count({
  where: { companyId, rate: { [Op.lte]: 2 } }
});
```

---

## Sistema de Avisos

### Announcement

**Arquivo:** `src/models/Announcement.ts`

```typescript
@Table
class Announcement extends Model<Announcement> {
  @PrimaryKey @AutoIncrement @Column
  id: number;

  @Column
  priority: number; // 1 - alta, 2 - média, 3 - baixa

  @Column
  title: string;

  @Column(DataType.TEXT)
  text: string;

  @Column
  get mediaPath(): string | null {
    if (this.getDataValue("mediaPath")) {
      return `${process.env.BACKEND_URL}/public/announcements/${this.getDataValue("mediaPath")}`;
    }
    return null;
  }

  @Column
  mediaName: string;

  @Column
  status: boolean;

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
```

**Getter Virtual:** mediaPath retorna URL completa automaticamente.

---

## Sistema de Chat Interno

### Chat

```typescript
@Table
class Chat extends Model<Chat> {
  @PrimaryKey @AutoIncrement @Column
  id: number;

  @Column
  title: string;

  @Column
  ownerId: number;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: Company;

  @HasMany(() => ChatUser)
  users: ChatUser[];

  @HasMany(() => ChatMessage)
  messages: ChatMessage[];

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}
```

### ChatUser

```typescript
@Table
class ChatUser extends Model<ChatUser> {
  @PrimaryKey @AutoIncrement @Column
  id: number;

  @ForeignKey(() => Chat)
  @Column
  chatId: number;

  @BelongsTo(() => Chat)
  chat: Chat;

  @ForeignKey(() => User)
  @Column
  userId: number;

  @BelongsTo(() => User)
  user: User;

  @Column
  unreads: number;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}
```

### ChatMessage

```typescript
@Table
class ChatMessage extends Model<ChatMessage> {
  @PrimaryKey @AutoIncrement @Column
  id: number;

  @Column(DataType.TEXT)
  message: string;

  @Column
  mediaPath: string;

  @ForeignKey(() => Chat)
  @Column
  chatId: number;

  @BelongsTo(() => Chat)
  chat: Chat;

  @ForeignKey(() => User)
  @Column
  senderId: number;

  @BelongsTo(() => User)
  sender: User;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}
```

---

## Sistema de Logs

### LogTicket

**Arquivo:** `src/models/LogTicket.ts`

```typescript
@Table
class LogTicket extends Model<LogTicket> {
  @PrimaryKey @AutoIncrement @Column
  id: number;

  @Column
  type: string; // "create" | "update" | "delete" | "transfer"

  @Column(DataType.JSON)
  oldData: object;

  @Column(DataType.JSON)
  newData: object;

  @ForeignKey(() => Ticket)
  @Column
  ticketId: number;

  @BelongsTo(() => Ticket)
  ticket: Ticket;

  @ForeignKey(() => User)
  @Column
  userId: number;

  @BelongsTo(() => User)
  user: User;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: Company;

  @CreatedAt
  createdAt: Date;
}
```

**Auditoria:**
```typescript
// Log de alteração
await LogTicket.create({
  type: 'update',
  ticketId,
  userId,
  companyId,
  oldData: { status: 'open', userId: 1 },
  newData: { status: 'closed', userId: 2 }
});

// Buscar histórico
const logs = await LogTicket.findAll({
  where: { ticketId },
  include: [{ model: User, as: 'user' }],
  order: [['createdAt', 'DESC']]
});
```

---

## Sistema de IA

### Prompt

```typescript
@Table
class Prompt extends Model<Prompt> {
  @PrimaryKey @AutoIncrement @Column
  id: number;

  @Column
  name: string;

  @Column(DataType.TEXT)
  prompt: string;

  @Column
  apiKey: string;

  @Column
  maxTokens: number;

  @Column
  temperature: number;

  @Column
  maxMessages: number;

  @Column
  queueId: number;

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
```

---

## Sistema de Arquivos

### Files

```typescript
@Table
class Files extends Model<Files> {
  @PrimaryKey @AutoIncrement @Column
  id: number;

  @Column
  name: string;

  @Column(DataType.TEXT)
  message: string;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: Company;

  @HasMany(() => FilesOptions)
  options: FilesOptions[];

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}
```

### FilesOptions

```typescript
@Table
class FilesOptions extends Model<FilesOptions> {
  @PrimaryKey @AutoIncrement @Column
  id: number;

  @Column
  name: string;

  @Column
  path: string;

  @ForeignKey(() => Files)
  @Column
  fileId: number;

  @BelongsTo(() => Files)
  file: Files;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}
```

---

## Sistema de Cobrança

### Invoices

```typescript
@Table
class Invoices extends Model<Invoices> {
  @PrimaryKey @AutoIncrement @Column
  id: number;

  @Column
  detail: string;

  @Column
  status: string; // "pending" | "paid" | "canceled"

  @Column
  value: number;

  @Column
  dueDate: Date;

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
```

### Subscriptions

```typescript
@Table
class Subscriptions extends Model<Subscriptions> {
  @PrimaryKey @AutoIncrement @Column
  id: number;

  @ForeignKey(() => User)
  @Column
  userId: number;

  @BelongsTo(() => User)
  user: User;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: Company;

  @Column
  isActive: boolean;

  @Column
  expiresAt: Date;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}
```

---

## Sistema de Uso de API

### ApiUsages

```typescript
@Table
class ApiUsages extends Model<ApiUsages> {
  @PrimaryKey @AutoIncrement @Column
  id: number;

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: Company;

  @Column
  dateUsed: Date;

  @Column
  usedOnDay: number;

  @Column
  usedText: number;

  @Column
  usedPDF: number;

  @Column
  usedImage: number;

  @Column
  usedVideo: number;

  @Column
  usedOther: number;

  @Column
  usedCheckNumber: number;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}
```

**Tracking:**
```typescript
// Incrementar uso
await ApiUsages.increment('usedText', {
  where: { companyId, dateUsed: today }
});

// Relatório mensal
const usage = await ApiUsages.findAll({
  where: {
    companyId,
    dateUsed: {
      [Op.between]: [startOfMonth, endOfMonth]
    }
  },
  attributes: [
    [sequelize.fn('SUM', sequelize.col('usedText')), 'totalText'],
    [sequelize.fn('SUM', sequelize.col('usedImage')), 'totalImages']
  ]
});
```

---

## Validações e Constraints

### Validações no Model

```typescript
@Table
class User extends Model<User> {
  @Column({
    validate: {
      notEmpty: { msg: "Nome não pode ser vazio" },
      len: { args: [3, 100], msg: "Nome deve ter entre 3-100 caracteres" }
    }
  })
  name: string;

  @Column({
    validate: {
      isEmail: { msg: "Email inválido" },
      notEmpty: { msg: "Email obrigatório" }
    },
    unique: { name: 'unique_email_company', msg: "Email já cadastrado" }
  })
  email: string;

  @Column({
    validate: {
      min: { args: [6], msg: "Senha mínima de 6 caracteres" }
    }
  })
  set password(value: string) {
    const hash = bcrypt.hashSync(value, 10);
    this.setDataValue('passwordHash', hash);
  }
}
```

### Hooks de Lifecycle

```typescript
@Table
class Ticket extends Model<Ticket> {
  // Hook: Antes de criar
  @BeforeCreate
  static async generateUUID(ticket: Ticket) {
    ticket.uuid = uuidv4();
  }

  // Hook: Depois de criar
  @AfterCreate
  static async notifyCreate(ticket: Ticket) {
    const io = getIO();
    io.to(`company-${ticket.companyId}`).emit('ticket', {
      action: 'create',
      ticket
    });
  }

  // Hook: Antes de atualizar
  @BeforeUpdate
  static async logUpdate(ticket: Ticket) {
    if (ticket.changed('status')) {
      await LogTicket.create({
        ticketId: ticket.id,
        type: 'update',
        oldData: ticket.previous('status'),
        newData: ticket.status
      });
    }
  }

  // Hook: Depois de deletar
  @AfterDestroy
  static async cleanupMessages(ticket: Ticket) {
    await Message.destroy({
      where: { ticketId: ticket.id }
    });
  }
}
```

---

## Queries Avançadas

### Transações

```typescript
// Criar ticket com mensagem (transação)
await sequelize.transaction(async (t) => {
  const ticket = await Ticket.create({
    contactId,
    userId,
    status: 'open',
    companyId
  }, { transaction: t });

  await Message.create({
    ticketId: ticket.id,
    body: 'Atendimento iniciado',
    fromMe: true,
    companyId
  }, { transaction: t });

  return ticket;
});
```

### Lock Pessimista

```typescript
// Lock para prevenir race conditions
await sequelize.transaction(async (t) => {
  const ticket = await Ticket.findByPk(ticketId, {
    lock: t.LOCK.UPDATE,
    transaction: t
  });

  ticket.status = 'closed';
  await ticket.save({ transaction: t });
});
```

### Aggregations

```typescript
// Dashboard stats
const stats = await Ticket.findAll({
  where: { companyId },
  attributes: [
    'status',
    [sequelize.fn('COUNT', sequelize.col('id')), 'total'],
    [sequelize.fn('AVG', sequelize.col('unreadMessages')), 'avgUnread']
  ],
  group: ['status']
});

// Result:
// [
//   { status: 'open', total: 10, avgUnread: 2.5 },
//   { status: 'pending', total: 5, avgUnread: 5.2 }
// ]
```

### Complex Joins

```typescript
// Tickets com contato, usuário, fila e tags
const tickets = await Ticket.findAll({
  where: { companyId },
  include: [
    {
      model: Contact,
      as: 'contact',
      attributes: ['id', 'name', 'number', 'profilePicUrl'],
      include: [
        {
          model: ContactCustomField,
          as: 'extraInfo'
        }
      ]
    },
    {
      model: User,
      as: 'user',
      attributes: ['id', 'name', 'email']
    },
    {
      model: Queue,
      as: 'queue',
      attributes: ['id', 'name', 'color']
    },
    {
      model: Tag,
      as: 'tags',
      through: { attributes: [] }, // Omitir tabela pivot
      attributes: ['id', 'name', 'color']
    }
  ],
  order: [
    ['updatedAt', 'DESC'],
    [{ model: Tag, as: 'tags' }, 'name', 'ASC']
  ]
});
```

### Subqueries

```typescript
// Contatos com último ticket
const contacts = await Contact.findAll({
  where: { companyId },
  attributes: {
    include: [
      [
        sequelize.literal(`(
          SELECT MAX("createdAt")
          FROM "Tickets"
          WHERE "Tickets"."contactId" = "Contact"."id"
        )`),
        'lastTicketDate'
      ]
    ]
  },
  order: [[sequelize.literal('lastTicketDate'), 'DESC']]
});
```

### Paginação com Cursor

```typescript
interface PaginationRequest {
  limit: number;
  cursor?: number; // ID do último item
}

const getTickets = async ({ limit, cursor }: PaginationRequest) => {
  const tickets = await Ticket.findAll({
    where: {
      companyId,
      ...(cursor && { id: { [Op.gt]: cursor } })
    },
    limit: limit + 1, // +1 para verificar hasMore
    order: [['id', 'ASC']]
  });

  const hasMore = tickets.length > limit;
  const items = hasMore ? tickets.slice(0, -1) : tickets;
  const nextCursor = items[items.length - 1]?.id;

  return { items, hasMore, nextCursor };
};
```

### Full-Text Search

```typescript
// Busca em múltiplos campos
const contacts = await Contact.findAll({
  where: sequelize.literal(`
    LOWER("name") LIKE LOWER(:search) OR
    LOWER("email") LIKE LOWER(:search) OR
    "number" LIKE :search
  `),
  replacements: { search: `%${searchParam}%` }
});
```

---

## Scopes

### Default Scopes

```typescript
@DefaultScope(() => ({
  attributes: { exclude: ['passwordHash'] }
}))
@Scopes(() => ({
  withPassword: {
    attributes: { include: ['passwordHash'] }
  },
  active: {
    where: { active: true }
  },
  withQueues: {
    include: [{ model: Queue, as: 'queues' }]
  }
}))
@Table
class User extends Model<User> {
  // ...
}

// Uso:
const users = await User.scope('active', 'withQueues').findAll();
const user = await User.scope('withPassword').findByPk(1);
```

---

## Performance Tips

### Eager Loading

```typescript
// ❌ N+1 Problem
const tickets = await Ticket.findAll();
for (const ticket of tickets) {
  const contact = await ticket.getContact(); // N queries
}

// ✅ Eager Loading
const tickets = await Ticket.findAll({
  include: [{ model: Contact }] // 1 query
});
```

### Lazy Loading

```typescript
const ticket = await Ticket.findByPk(1);
const messages = await ticket.getMessages(); // Lazy load
```

### Índices Compostos

```sql
-- Migration
CREATE INDEX idx_tickets_company_status_date
ON "Tickets"("companyId", "status", "createdAt" DESC);
```

---

**Total de Models:** 55
**Total de Relações:** 150+
**Migrations:** 278
**Hooks Lifecycle:** BeforeCreate, AfterCreate, BeforeUpdate, AfterUpdate, BeforeDestroy, AfterDestroy
