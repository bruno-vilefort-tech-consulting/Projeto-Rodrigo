# DATABASE - ChatIA Flow Backend

## Visão Geral

Este documento documenta o **sistema de banco de dados** do ChatIA Flow, incluindo schema, migrations, models, relacionamentos, otimizações e práticas de manutenção.

### Tecnologias

- **PostgreSQL 12+** (recomendado: 15)
- **Sequelize ORM 5.22.3**
- **Sequelize-TypeScript 1.1.0**
- **278 migrations** versionadas
- **55 models** com relacionamentos complexos
- **5 seeds** para dados iniciais

---

## Índice

1. [Arquitetura](#1-arquitetura)
2. [Configuração](#2-configuração)
3. [Models](#3-models)
4. [Migrations](#4-migrations)
5. [Seeds](#5-seeds)
6. [Relacionamentos](#6-relacionamentos)
7. [Índices e Performance](#7-índices-e-performance)
8. [Consultas Comuns](#8-consultas-comuns)
9. [Backup e Restore](#9-backup-e-restore)
10. [Troubleshooting](#10-troubleshooting)

---

## 1. ARQUITETURA

### 1.1 Estrutura do Banco de Dados

```
chatia (database)
├── Companies (55 empresas)
│   ├── Users (320 usuários)
│   ├── Whatsapps (180 conexões)
│   ├── Contacts (45.000 contatos)
│   ├── Tickets (120.000 tickets)
│   └── Messages (850.000 mensagens)
│
├── Settings (Configurações globais)
├── Plans (Planos de assinatura)
├── Queues (Filas de atendimento)
├── Tags (Etiquetas)
├── Campaigns (Campanhas)
└── FlowBuilder (Flows de automação)
```

### 1.2 Multi-Tenancy

O sistema é **multi-tenant** com isolamento por `companyId`:

```sql
-- Todas as tabelas principais têm companyId
SELECT * FROM "Tickets" WHERE "companyId" = 1;
SELECT * FROM "Messages" WHERE "companyId" = 1;
SELECT * FROM "Contacts" WHERE "companyId" = 1;
```

**Relacionamento em Cascade**:
- Deletar Company → Deleta todos os dados relacionados
- Deletar Ticket → Deleta mensagens, notes, tags relacionadas
- Deletar Contact → Soft delete (active = false)

---

## 2. CONFIGURAÇÃO

### 2.1 Arquivo de Configuração

**Localização**: `/backend/src/config/database.ts`

```javascript
module.exports = {
  define: {
    charset: "utf8mb4",
    collate: "utf8mb4_bin"
  },
  options: {
    requestTimeout: 600000,
    encrypt: true
  },
  retry: {
    match: [
      /SequelizeConnectionError/,
      /SequelizeConnectionRefusedError/,
      /SequelizeHostNotFoundError/,
      /SequelizeHostNotReachableError/,
      /SequelizeInvalidConnectionError/,
      /SequelizeConnectionTimedOutError/
    ],
    max: 100
  },
  pool: {
    max: parseInt(process.env.DB_POOL_MAX) || 100,
    min: parseInt(process.env.DB_POOL_MIN) || 15,
    acquire: parseInt(process.env.DB_POOL_ACQUIRE) || 30000,
    idle: parseInt(process.env.DB_POOL_IDLE) || 600000
  },
  dialect: process.env.DB_DIALECT || "postgres",
  timezone: 'America/Sao_Paulo',
  host: process.env.DB_HOST || "localhost",
  port: process.env.DB_PORT || "5432",
  database: process.env.DB_NAME,
  username: process.env.DB_USER,
  password: process.env.DB_PASS,
  logging: false
};
```

### 2.2 Connection Pool

| Configuração | Valor Padrão | Recomendado (Prod) | Descrição |
|--------------|--------------|---------------------|-----------|
| `pool.max` | 100 | 100-200 | Máximo de conexões simultâneas |
| `pool.min` | 15 | 20-30 | Mínimo de conexões mantidas |
| `pool.acquire` | 30000 ms | 30000-60000 ms | Timeout para adquirir conexão |
| `pool.idle` | 600000 ms | 600000 ms | Tempo antes de liberar conexão idle |

**Cálculo do Pool**:
```
max connections = (núm_instâncias * pool.max) + buffer
Exemplo: 4 instâncias * 100 = 400 conexões + 50 buffer = 450 total
```

### 2.3 Inicialização

**Arquivo**: `/backend/src/database/index.ts`

```typescript
import { Sequelize } from "sequelize-typescript";
// Importa todos os 55 models
import User from "../models/User";
import Company from "../models/Company";
// ... (55 imports)

const dbConfig = require("../config/database");
const sequelize = new Sequelize(dbConfig);

const models = [
  Company, User, Contact, Ticket, Message,
  Whatsapp, Queue, Tag, Campaign, ChatBot,
  // ... (55 models)
];

sequelize.addModels(models);

export default sequelize;
```

---

## 3. MODELS

### 3.1 Lista Completa de Models (55)

| Model | Descrição | Relações |
|-------|-----------|----------|
| **Company** | Empresas/Tenants | hasMany: Users, Tickets, Whatsapps |
| **User** | Usuários do sistema | belongsTo: Company, hasMany: Tickets |
| **Contact** | Contatos do WhatsApp | belongsTo: Company, hasMany: Tickets |
| **Ticket** | Atendimentos | belongsTo: Contact, User, Queue, Whatsapp |
| **Message** | Mensagens | belongsTo: Ticket, Contact |
| **Whatsapp** | Conexões WhatsApp | belongsTo: Company, hasMany: Tickets |
| **Queue** | Filas de atendimento | belongsTo: Company, hasMany: Tickets |
| **Tag** | Etiquetas | belongsToMany: Tickets, Contacts |
| **TicketTag** | Pivot Ticket-Tag | belongsTo: Ticket, Tag |
| **ContactTag** | Pivot Contact-Tag | belongsTo: Contact, Tag |
| **WhatsappQueue** | Pivot Whatsapp-Queue | belongsTo: Whatsapp, Queue |
| **UserQueue** | Pivot User-Queue | belongsTo: User, Queue |
| **Setting** | Configurações | belongsTo: Company |
| **CompaniesSettings** | Config avançada | belongsTo: Company |
| **Plan** | Planos de assinatura | hasMany: Companies |
| **Subscription** | Assinaturas | belongsTo: Company, Plan |
| **Invoice** | Faturas | belongsTo: Company |
| **TicketNote** | Notas internas | belongsTo: Ticket, User |
| **TicketTraking** | Histórico | belongsTo: Ticket, User, Queue |
| **LogTicket** | Logs de eventos | belongsTo: Ticket |
| **UserRating** | Avaliações | belongsTo: Ticket, User |
| **QuickMessage** | Respostas rápidas | belongsTo: Company, User |
| **Schedule** | Agendamentos | belongsTo: Company, Contact, Ticket |
| **ScheduledMessages** | Msgs agendadas | belongsTo: Company, Contact |
| **ScheduledMessagesEnvio** | Envios | belongsTo: ScheduledMessages |
| **ContactList** | Listas de contatos | belongsTo: Company |
| **ContactListItem** | Itens da lista | belongsTo: ContactList |
| **ContactCustomField** | Campos customizados | belongsTo: Contact |
| **ContactWallet** | Carteiras/vendedores | belongsTo: Company, hasMany: Contacts |
| **Campaign** | Campanhas | belongsTo: Company, ContactList |
| **CampaignSetting** | Config de campanha | belongsTo: Campaign |
| **CampaignShipping** | Envios de campanha | belongsTo: Campaign, Contact |
| **Chat** | Chats internos | belongsTo: Company |
| **ChatUser** | Usuários no chat | belongsTo: Chat, User |
| **ChatMessage** | Mensagens de chat | belongsTo: Chat, User |
| **Chatbot** | Chatbots | belongsTo: Company, Queue |
| **DialogChatBots** | Diálogos | belongsTo: Chatbot |
| **QueueIntegrations** | Integrações IA | belongsTo: Queue |
| **Prompt** | Prompts de IA | belongsTo: Queue |
| **FlowBuilderModel** | Flows | belongsTo: Company |
| **FlowDefaultModel** | Flows padrão | - |
| **FlowAudioModel** | Áudios de flow | belongsTo: FlowBuilder |
| **FlowImgModel** | Imagens de flow | belongsTo: FlowBuilder |
| **FlowCampaignModel** | Campanhas de flow | belongsTo: Company |
| **WebhookModel** | Webhooks | belongsTo: Company |
| **Announcement** | Anúncios | belongsTo: Company |
| **Help** | Sistema de ajuda | belongsTo: Company |
| **Files** | Arquivos | belongsTo: Company |
| **FilesOptions** | Opções de arquivo | belongsTo: Files |
| **Baileys** | Sessões Baileys | belongsTo: Whatsapp |
| **ApiUsages** | Uso de API | belongsTo: Company |
| **Partner** | Parceiros | - |
| **Versions** | Versionamento | - |
| **Integrations** | Integrações | belongsTo: Company |

### 3.2 Model Principal: Ticket

```typescript
@Table
class Ticket extends Model<Ticket> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column(DataType.TEXT)
  status: string; // open, pending, closed

  @Column
  lastMessage: string;

  @Column(DataType.INTEGER)
  unreadMessages: number;

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

  @HasMany(() => TicketNote)
  notes: TicketNote[];

  @BelongsToMany(() => Tag, () => TicketTag)
  tags: Tag[];

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;
}
```

### 3.3 Campos Comuns

Todos os models principais incluem:

```typescript
@PrimaryKey
@AutoIncrement
@Column
id: number;

@ForeignKey(() => Company)
@Column
companyId: number;

@CreatedAt
createdAt: Date;

@UpdatedAt
updatedAt: Date;
```

---

## 4. MIGRATIONS

### 4.1 Sistema de Migrations

Total: **278 migrations** versionadas

**Estrutura**:
```
src/database/migrations/
├── 20200904070001-create-companies.ts
├── 20200904070002-create-users.ts
├── 20200904070003-create-contacts.ts
├── ... (278 arquivos)
└── 20250926140002-add-timezone-indexes.ts
```

**Formato do Nome**:
```
[timestamp]-[descrição].ts
20230714113902-create-fileOptions.ts
```

### 4.2 Exemplo de Migration

**Criar Tabela**:

```typescript
import { QueryInterface, DataTypes } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.createTable("Tickets", {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false
      },
      status: {
        type: DataTypes.STRING,
        defaultValue: "pending",
        allowNull: false
      },
      lastMessage: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      unreadMessages: {
        type: DataTypes.INTEGER,
        defaultValue: 0
      },
      contactId: {
        type: DataTypes.INTEGER,
        references: { model: "Contacts", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },
      userId: {
        type: DataTypes.INTEGER,
        references: { model: "Users", key: "id" },
        onUpdate: "SET NULL",
        onDelete: "SET NULL"
      },
      queueId: {
        type: DataTypes.INTEGER,
        references: { model: "Queues", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "SET NULL"
      },
      whatsappId: {
        type: DataTypes.INTEGER,
        references: { model: "Whatsapps", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
      },
      companyId: {
        type: DataTypes.INTEGER,
        references: { model: "Companies", key: "id" },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
        allowNull: false
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false
      }
    });

    // Índices
    await queryInterface.addIndex("Tickets", ["companyId"]);
    await queryInterface.addIndex("Tickets", ["contactId"]);
    await queryInterface.addIndex("Tickets", ["status"]);
    await queryInterface.addIndex("Tickets", ["userId"]);
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.dropTable("Tickets");
  }
};
```

**Adicionar Coluna**:

```typescript
module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.addColumn("Tickets", "isGroup", {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      allowNull: false
    });
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.removeColumn("Tickets", "isGroup");
  }
};
```

**Criar Índice**:

```typescript
module.exports = {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.addIndex("Messages", ["ticketId", "createdAt"], {
      name: "idx_messages_ticket_created"
    });

    await queryInterface.addIndex("Messages", ["companyId", "fromMe"], {
      name: "idx_messages_company_fromme"
    });
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.removeIndex("Messages", "idx_messages_ticket_created");
    await queryInterface.removeIndex("Messages", "idx_messages_company_fromme");
  }
};
```

### 4.3 Executar Migrations

```bash
# Executar todas as migrations pendentes
npm run db:migrate

# Verificar status
npx sequelize-cli db:migrate:status

# Desfazer última migration
npm run db:migrate:undo

# Desfazer todas
npm run db:migrate:undo:all
```

### 4.4 Migrations Críticas

**Índices de Performance** (20220512000001-create-Indexes.ts):
```typescript
await queryInterface.addIndex("Tickets", ["companyId", "status"]);
await queryInterface.addIndex("Messages", ["ticketId", "createdAt"]);
await queryInterface.addIndex("Contacts", ["companyId", "number"]);
```

**Timezone Support** (20250926140002-add-timezone-indexes.ts):
```typescript
await queryInterface.addColumn("Companies", "timezone", {
  type: DataTypes.STRING,
  defaultValue: "America/Sao_Paulo"
});
```

---

## 5. SEEDS

### 5.1 Seeds Padrão (5 arquivos)

```
src/database/seeds/
├── 20200904070003-create-default-company.ts
├── 20200904070004-create-default-settings.ts
├── 20200904070006-create-default-user.ts
├── 20230901093700-create-default-companiessettings.ts
└── 20250101000000-ensure-super-admin.ts
```

### 5.2 Seed: Empresa Padrão

```typescript
module.exports = {
  up: async (queryInterface: QueryInterface) => {
    return queryInterface.bulkInsert("Companies", [
      {
        name: "Empresa 1",
        email: "admin@admin.com",
        phone: "5511999999999",
        status: true,
        planId: 1,
        dueDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  down: async (queryInterface: QueryInterface) => {
    return queryInterface.bulkDelete("Companies", {});
  }
};
```

### 5.3 Seed: Usuário Admin

```typescript
import bcrypt from "bcryptjs";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    const passwordHash = await bcrypt.hash("123456", 8);

    return queryInterface.bulkInsert("Users", [
      {
        name: "Administrador",
        email: "admin@admin.com",
        passwordHash,
        profile: "admin",
        companyId: 1,
        super: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    ]);
  },

  down: async (queryInterface: QueryInterface) => {
    return queryInterface.bulkDelete("Users", {
      email: "admin@admin.com"
    });
  }
};
```

**Credenciais Padrão**:
- Email: `admin@admin.com`
- Senha: `123456`
- Perfil: `admin`
- Super: `true`

### 5.4 Seed: Settings Padrão

```typescript
module.exports = {
  up: async (queryInterface: QueryInterface) => {
    return queryInterface.bulkInsert("Settings", [
      { key: "userCreation", value: "enabled" },
      { key: "CheckMsgIsGroup", value: "enabled" },
      { key: "acceptCallWhatsapp", value: "disabled" },
      { key: "chatBotType", value: "text" }
    ]);
  }
};
```

### 5.5 Executar Seeds

```bash
# Executar todas as seeds
npm run db:seed

# Seed específica
npx sequelize-cli db:seed --seed 20200904070006-create-default-user.ts

# Desfazer seeds
npm run db:seed:undo:all
```

---

## 6. RELACIONAMENTOS

### 6.1 Diagrama ER Simplificado

```
Company (1) ──────────< (N) User
   │                         │
   │                         │
   └──< (N) Whatsapp         │
   │         │                │
   │         │                │
   └──< (N) Contact ──< (N) Ticket >── (1) User
             │              │
             │              ├──< (N) Message
             │              ├──< (N) TicketNote
             └──────────────├──< (N) TicketTag
                            └──< (N) TicketTraking

Queue (1) ──< (N) Ticket
   │
   ├──< (N) WhatsappQueue >── (1) Whatsapp
   └──< (N) UserQueue >── (1) User

Tag (1) ──< (N) TicketTag >── (1) Ticket
   └──< (N) ContactTag >── (1) Contact
```

### 6.2 Relacionamentos Principais

**Company → Users** (1:N):
```typescript
Company.hasMany(User, { foreignKey: "companyId" });
User.belongsTo(Company, { foreignKey: "companyId" });
```

**Ticket → Messages** (1:N):
```typescript
Ticket.hasMany(Message, { foreignKey: "ticketId" });
Message.belongsTo(Ticket, { foreignKey: "ticketId" });
```

**Ticket → Tags** (N:N):
```typescript
Ticket.belongsToMany(Tag, {
  through: TicketTag,
  foreignKey: "ticketId",
  otherKey: "tagId"
});
Tag.belongsToMany(Ticket, {
  through: TicketTag,
  foreignKey: "tagId",
  otherKey: "ticketId"
});
```

**Queue → Whatsapp** (N:N):
```typescript
Queue.belongsToMany(Whatsapp, {
  through: WhatsappQueue,
  foreignKey: "queueId",
  otherKey: "whatsappId"
});
```

### 6.3 Cascade Delete

```typescript
// Deletar Company → Deletar tudo
Company → Users (CASCADE)
Company → Tickets (CASCADE)
Company → Messages (CASCADE)
Company → Contacts (CASCADE)

// Deletar Ticket → Deletar relacionados
Ticket → Messages (CASCADE)
Ticket → TicketNotes (CASCADE)
Ticket → TicketTags (CASCADE)

// Deletar User → SET NULL em Tickets
User → Tickets (SET NULL)
```

---

## 7. ÍNDICES E PERFORMANCE

### 7.1 Índices Principais

**Tickets**:
```sql
CREATE INDEX idx_tickets_company ON "Tickets"("companyId");
CREATE INDEX idx_tickets_contact ON "Tickets"("contactId");
CREATE INDEX idx_tickets_status ON "Tickets"("status");
CREATE INDEX idx_tickets_user ON "Tickets"("userId");
CREATE INDEX idx_tickets_whatsapp ON "Tickets"("whatsappId");
CREATE INDEX idx_tickets_company_status ON "Tickets"("companyId", "status");
CREATE INDEX idx_tickets_updated ON "Tickets"("updatedAt" DESC);
```

**Messages**:
```sql
CREATE INDEX idx_messages_ticket ON "Messages"("ticketId");
CREATE INDEX idx_messages_company ON "Messages"("companyId");
CREATE INDEX idx_messages_ticket_created ON "Messages"("ticketId", "createdAt");
CREATE INDEX idx_messages_fromme ON "Messages"("fromMe");
CREATE INDEX idx_messages_read ON "Messages"("read");
```

**Contacts**:
```sql
CREATE INDEX idx_contacts_company ON "Contacts"("companyId");
CREATE INDEX idx_contacts_number ON "Contacts"("number");
CREATE INDEX idx_contacts_company_number ON "Contacts"("companyId", "number");
CREATE INDEX idx_contacts_active ON "Contacts"("active");
```

### 7.2 Query Performance

**Slow Queries Comuns**:

```sql
-- Tickets com todas as relações (LENTO)
SELECT * FROM "Tickets"
LEFT JOIN "Contacts" ON "Tickets"."contactId" = "Contacts"."id"
LEFT JOIN "Users" ON "Tickets"."userId" = "Users"."id"
LEFT JOIN "Queues" ON "Tickets"."queueId" = "Queues"."id"
WHERE "Tickets"."companyId" = 1;

-- Otimizado: selecionar apenas campos necessários
SELECT
  t.id, t.status, t.lastMessage,
  c.name AS contactName, c.number,
  u.name AS userName
FROM "Tickets" t
LEFT JOIN "Contacts" c ON t."contactId" = c.id
LEFT JOIN "Users" u ON t."userId" = u.id
WHERE t."companyId" = 1
AND t."status" IN ('open', 'pending')
LIMIT 50;
```

**EXPLAIN ANALYZE**:

```sql
EXPLAIN ANALYZE
SELECT * FROM "Tickets"
WHERE "companyId" = 1
AND "status" = 'open';

-- Resultado esperado:
-- Index Scan using idx_tickets_company_status
-- Planning Time: 0.1 ms
-- Execution Time: 2.5 ms
```

### 7.3 Otimizações

**1. Paginação**:
```typescript
const tickets = await Ticket.findAll({
  where: { companyId, status: "open" },
  limit: 50,
  offset: page * 50,
  order: [["updatedAt", "DESC"]]
});
```

**2. Eager Loading Seletivo**:
```typescript
// Ruim: carrega tudo
const ticket = await Ticket.findByPk(id, {
  include: ["contact", "user", "queue", "messages", "tags"]
});

// Bom: carrega apenas necessário
const ticket = await Ticket.findByPk(id, {
  include: [
    { model: Contact, attributes: ["id", "name", "number"] },
    { model: User, attributes: ["id", "name"] }
  ]
});
```

**3. Bulk Operations**:
```typescript
// Ruim: N queries
for (const ticket of tickets) {
  await ticket.update({ status: "closed" });
}

// Bom: 1 query
await Ticket.update(
  { status: "closed" },
  { where: { id: ticketIds } }
);
```

---

## 8. CONSULTAS COMUNS

### 8.1 Estatísticas de Tickets

```typescript
import { Op, fn, col } from "sequelize";

// Contar tickets por status
const stats = await Ticket.findAll({
  where: { companyId },
  attributes: [
    "status",
    [fn("COUNT", col("id")), "count"]
  ],
  group: ["status"]
});
// Resultado: [{ status: "open", count: 45 }, ...]

// Tickets criados hoje
const today = await DateHelper.getStartOfDay(companyId);
const todayTickets = await Ticket.count({
  where: {
    companyId,
    createdAt: { [Op.gte]: today }
  }
});
```

### 8.2 Buscar Mensagens

```typescript
// Últimas mensagens de um ticket
const messages = await Message.findAll({
  where: { ticketId },
  order: [["createdAt", "DESC"]],
  limit: 50
});

// Mensagens não lidas
const unreadMessages = await Message.findAll({
  where: {
    ticketId,
    fromMe: false,
    read: false
  }
});

// Buscar mensagem por texto
const searchResults = await Message.findAll({
  where: {
    companyId,
    body: { [Op.iLike]: `%${searchTerm}%` }
  },
  include: [
    { model: Ticket, include: ["contact"] }
  ],
  limit: 100
});
```

### 8.3 Contatos

```typescript
// Buscar contato por número
const contact = await Contact.findOne({
  where: {
    companyId,
    number: phoneNumber
  }
});

// Contatos ativos
const activeContacts = await Contact.findAll({
  where: {
    companyId,
    active: true
  },
  order: [["name", "ASC"]]
});

// Contatos com tickets abertos
const contactsWithOpenTickets = await Contact.findAll({
  where: { companyId },
  include: [{
    model: Ticket,
    where: { status: { [Op.or]: ["open", "pending"] } },
    required: true
  }]
});
```

---

## 9. BACKUP E RESTORE

### 9.1 Backup Completo

```bash
#!/bin/bash
# Backup completo do banco

BACKUP_DIR="/backups/postgresql"
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
DB_NAME="chatia"

# Backup com compressão
pg_dump -U chatia -h localhost $DB_NAME | gzip > $BACKUP_DIR/chatia-$TIMESTAMP.sql.gz

# Backup schema only
pg_dump -U chatia -h localhost --schema-only $DB_NAME > $BACKUP_DIR/schema-$TIMESTAMP.sql

# Backup data only
pg_dump -U chatia -h localhost --data-only $DB_NAME > $BACKUP_DIR/data-$TIMESTAMP.sql
```

### 9.2 Restore

```bash
# Restaurar backup completo
gunzip -c chatia-20250112.sql.gz | psql -U chatia -h localhost chatia

# Restaurar apenas schema
psql -U chatia -h localhost chatia < schema-20250112.sql

# Restaurar apenas dados
psql -U chatia -h localhost chatia < data-20250112.sql
```

### 9.3 Backup Incremental

```sql
-- Ativar WAL archiving no postgresql.conf
wal_level = replica
archive_mode = on
archive_command = 'cp %p /backups/wal/%f'

-- Backup base
pg_basebackup -U chatia -D /backups/base -Ft -z -P

-- Restore com Point-in-Time Recovery (PITR)
```

---

## 10. TROUBLESHOOTING

### 10.1 Conexão Recusada

```bash
# Verificar se PostgreSQL está rodando
sudo systemctl status postgresql

# Verificar porta
sudo netstat -tulpn | grep 5432

# Testar conexão
psql -U chatia -h localhost -d chatia

# Ver logs
sudo tail -f /var/log/postgresql/postgresql-15-main.log
```

### 10.2 Migrations Falhando

```bash
# Ver status das migrations
npx sequelize-cli db:migrate:status

# Ver última migration executada
psql -U chatia -c "SELECT * FROM \"SequelizeMeta\" ORDER BY name DESC LIMIT 1;"

# Forçar undo e refazer
npm run db:migrate:undo
npm run db:migrate

# Erro de foreign key: verificar dependências
# Criar migrations na ordem correta:
# 1. Companies
# 2. Users, Queues, Tags
# 3. Contacts, Whatsapps
# 4. Tickets
# 5. Messages, TicketNotes
```

### 10.3 Performance Lenta

```sql
-- Verificar queries lentas
SELECT pid, now() - query_start AS duration, query
FROM pg_stat_activity
WHERE state = 'active'
ORDER BY duration DESC;

-- Matar query travada
SELECT pg_terminate_backend(pid);

-- Reindex tabelas
REINDEX TABLE "Tickets";
REINDEX TABLE "Messages";

-- Analisar tabelas
ANALYZE "Tickets";
ANALYZE "Messages";

-- Vacuum
VACUUM ANALYZE "Tickets";
```

### 10.4 Espaço em Disco

```sql
-- Ver tamanho do banco
SELECT pg_size_pretty(pg_database_size('chatia'));

-- Ver tamanho das tabelas
SELECT
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Resultado esperado:
-- Messages: 2.5 GB
-- Tickets: 850 MB
-- Contacts: 450 MB
```

**Limpar Dados Antigos**:

```sql
-- Deletar mensagens antigas (> 1 ano)
DELETE FROM "Messages"
WHERE "createdAt" < NOW() - INTERVAL '1 year';

-- Deletar tickets fechados antigos
DELETE FROM "Tickets"
WHERE "status" = 'closed'
AND "updatedAt" < NOW() - INTERVAL '6 months';

-- Vacuum após delete massivo
VACUUM FULL "Messages";
```

---

## Resumo

- **55 Models** com relacionamentos complexos
- **278 Migrations** versionadas
- **Multi-tenant** com isolamento por companyId
- **Pool de 100 conexões** configurável
- **Índices otimizados** para queries frequentes
- **Backup automático** recomendado diariamente
- **PostgreSQL 15** recomendado para melhor performance

---

**Documentação gerada**: Janeiro 2025
**Versão**: 1.0
**Última atualização**: 12/01/2025
