# Backend Plan: Correção de "Números Fantasma" em /contacts

**Data:** 2025-10-14
**Responsável:** Backend Planner
**Status:** PLANEJAMENTO COMPLETO
**Feature Flag Principal:** `FEATURE_CONTACTS_FIX`

---

## Índice

1. [Modelo Canônico Contact](#1-modelo-canônico-contact)
2. [Regras de Negócio com Feature Flags](#2-regras-de-negócio-com-feature-flags)
3. [Endpoints (Novos e Modificados)](#3-endpoints-novos-e-modificados)
4. [Schemas de Validação (Zod)](#4-schemas-de-validação-zod)
5. [Estrutura de Migrations](#5-estrutura-de-migrations)
6. [Plano de Commits Granulares](#6-plano-de-commits-granulares)
7. [Logs Pino](#7-logs-pino)
8. [Critérios de Aceite](#8-critérios-de-aceite)
9. [Observabilidade e Monitoramento](#9-observabilidade-e-monitoramento)
10. [Multi-Tenant Validation Checklist](#10-multi-tenant-validation-checklist)

---

## 1. Modelo Canônico Contact

### 1.1 Schema Completo do Modelo

```typescript
// backend/src/models/Contact.ts

import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  AllowNull,
  Unique,
  Default,
  HasMany,
  ForeignKey,
  BelongsTo,
  BelongsToMany,
  BeforeCreate,
  BeforeUpdate,
  DataType
} from "sequelize-typescript";
import { parsePhoneNumber, isValidPhoneNumber } from 'libphonenumber-js';
import ContactCustomField from "./ContactCustomField";
import Ticket from "./Ticket";
import Company from "./Company";
import Schedule from "./Schedule";
import ContactTag from "./ContactTag";
import Tag from "./Tag";
import ContactWallet from "./ContactWallet";
import User from "./User";
import Whatsapp from "./Whatsapp";
import AppError from "../errors/AppError";
import logger from "../utils/logger";

@Table
class Contact extends Model<Contact> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  name: string;

  // CAMPO PRINCIPAL: Sempre em E.164 puro (ex: +5511999999999)
  // Mantém nome "number" para compatibilidade com código existente
  @AllowNull(false)
  @Column
  number: string;

  @AllowNull(false)
  @Default("")
  @Column
  email: string;

  @Default("")
  @Column
  profilePicUrl: string;

  @Default(false)
  @Column
  isGroup: boolean;

  @Default(false)
  @Column
  disableBot: boolean;

  @Default(true)
  @Column
  acceptAudioMessage: boolean;

  @Default(true)
  @Column
  active: boolean;

  @Default("whatsapp")
  @Column
  channel: string;

  // NOVO: Rastreamento de origem do contato
  @Default("manual")
  @Column({
    type: DataType.ENUM(
      'manual',           // Criado manualmente via UI
      'whatsapp_roster',  // Importado da agenda do WhatsApp
      'excel_import',     // Importado de Excel/CSV
      'auto_created',     // Criado automaticamente ao receber mensagem
      'chat_import'       // Importado de chats ativos
    )
  })
  source: string;

  // NOVO: Flag para filtro "Meus Contatos" vs "Todos os Contatos"
  @Default(true)
  @Column
  isInAgenda: boolean;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @HasMany(() => Ticket)
  tickets: Ticket[];

  @HasMany(() => ContactCustomField)
  extraInfo: ContactCustomField[];

  @HasMany(() => ContactTag)
  contactTags: ContactTag[];

  @BelongsToMany(() => Tag, () => ContactTag)
  tags: Tag[];

  @ForeignKey(() => Company)
  @Column
  companyId: number;

  @BelongsTo(() => Company)
  company: Company;

  @HasMany(() => Schedule, {
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
    hooks: true
  })
  schedules: Schedule[];

  @Column
  remoteJid: string;

  @AllowNull(true)
  @Column
  lid?: string | null;

  @AllowNull(true)
  @Column
  jid?: string | null;

  get chatKey(): string | null {
    return this.lid ?? this.jid ?? null;
  }

  @Column
  lgpdAcceptedAt: Date;

  @Column
  pictureUpdated: boolean;

  @Column
  get urlPicture(): string | null {
    if (this.getDataValue("urlPicture")) {
      return this.getDataValue("urlPicture") === 'nopicture.png'
        ? `${process.env.FRONTEND_URL}/nopicture.png`
        : `${process.env.BACKEND_URL}${process.env.PROXY_PORT ? `:${process.env.PROXY_PORT}` : ""}/public/company${this.companyId}/contacts/${this.getDataValue("urlPicture")}`;
    }
    return null;
  }

  @BelongsToMany(() => User, () => ContactWallet, "contactId", "walletId")
  wallets: ContactWallet[];

  @HasMany(() => ContactWallet)
  contactWallets: ContactWallet[];

  @ForeignKey(() => Whatsapp)
  @Column
  whatsappId: number;

  @BelongsTo(() => Whatsapp)
  whatsapp: Whatsapp;

  // ============================================================
  // HOOK DE NORMALIZAÇÃO E.164
  // ============================================================

  @BeforeCreate
  @BeforeUpdate
  static async normalizePhoneNumber(contact: Contact) {
    // Feature flag: só normaliza se FEATURE_CONTACTS_FIX estiver ativada
    const featureEnabled = process.env.FEATURE_CONTACTS_FIX === 'true';

    if (!featureEnabled) {
      logger.warn(`[Contact.normalizePhoneNumber] Feature flag FEATURE_CONTACTS_FIX is disabled. Skipping normalization for contact ${contact.id || 'new'}`);
      return;
    }

    // Não normaliza números de grupos
    if (contact.isGroup) {
      logger.info(`[Contact.normalizePhoneNumber] Skipping normalization for group contact ${contact.id || 'new'}`);
      return;
    }

    // Não normaliza se número estiver vazio
    if (!contact.number || contact.number.trim() === '') {
      logger.error(`[Contact.normalizePhoneNumber] Empty number for contact ${contact.id || 'new'}`);
      throw new AppError('ERR_CONTACT_NUMBER_REQUIRED', 400);
    }

    try {
      // Passo 1: Limpar formatação (remover espaços, parênteses, hífens)
      let cleaned = contact.number.replace(/\D/g, '');

      // Passo 2: Adicionar '+' no início se não tiver
      if (!cleaned.startsWith('+')) {
        cleaned = '+' + cleaned;
      }

      // Passo 3: Validar se é um número válido usando libphonenumber-js
      if (!isValidPhoneNumber(cleaned)) {
        logger.error(`[Contact.normalizePhoneNumber] Invalid phone number format: ${contact.number} (cleaned: ${cleaned})`);
        throw new AppError('ERR_INVALID_PHONE_NUMBER', 400);
      }

      // Passo 4: Parsear e obter E.164 puro
      const parsed = parsePhoneNumber(cleaned);
      contact.number = parsed.number; // E.164 format: +5511999999999

      logger.info(`[Contact.normalizePhoneNumber] Successfully normalized number: ${contact.number}`);
    } catch (error) {
      if (error instanceof AppError) {
        throw error;
      }

      logger.error(`[Contact.normalizePhoneNumber] Unexpected error normalizing number: ${contact.number}`, error);
      throw new AppError('ERR_PHONE_NUMBER_NORMALIZATION_FAILED', 500);
    }
  }
}

export default Contact;
```

---

### 1.2 Especificações do Campo `number`

**Formato Canônico E.164:**
- **Padrão:** `+[código do país][DDD][número]`
- **Exemplo Brasil:** `+5511999999999` (13 dígitos totais)
- **Exemplo EUA:** `+14155551234` (12 dígitos totais)
- **Sempre começa com `+`**
- **Apenas dígitos após o `+`**
- **Sem espaços, parênteses, hífens ou outros caracteres**

**Lógica de Normalização:**
1. **Input:** Aceita qualquer formato (`(11) 99999-9999`, `11 999999999`, `5511999999999`, etc.)
2. **Limpeza:** Remove todos os caracteres não-numéricos exceto o `+`
3. **Validação:** Usa `libphonenumber-js` para validar se é um número válido
4. **Conversão:** Converte para E.164 puro usando `parsePhoneNumber().number`
5. **Rejeição:** Se inválido, lança `AppError('ERR_INVALID_PHONE_NUMBER', 400)`

**Country Default:**
- Se o número não tiver código de país e tiver menos de 13 dígitos, assumir Brasil (+55)
- Exemplo: `11999999999` → `+5511999999999`

**Comportamento com Números Antigos (10 dígitos):**
- Números com 10 dígitos (sem o 9º dígito) serão rejeitados como inválidos
- **Migração:** A migration de correção adicionará o 9º dígito automaticamente para números BR com DDD < 30

---

### 1.3 Especificações do Campo `source`

**Tipo:** ENUM
**Valores Permitidos:**
- `manual`: Criado manualmente via UI pelo usuário
- `whatsapp_roster`: Importado da agenda do telefone via Baileys
- `excel_import`: Importado de arquivo Excel/CSV
- `auto_created`: Criado automaticamente ao receber mensagem de número desconhecido
- `chat_import`: Importado de chats ativos nas últimas X horas

**Quem Define:**
- **Backend:** Define o valor baseado no ponto de entrada
- **Frontend:** Não pode modificar diretamente (apenas visualizar)

**Comportamento:**
- **Criação manual:** `source = 'manual'` (default)
- **Import roster:** `source = 'whatsapp_roster'`
- **Upload Excel:** `source = 'excel_import'`
- **Mensagem recebida:** `source = 'auto_created'`
- **Import chats:** `source = 'chat_import'`

**Migration de Dados Existentes:**
- Contatos com `whatsappId != NULL` → `source = 'whatsapp_roster'`
- Contatos com `email != NULL` → `source = 'excel_import'`
- Demais → `source = 'manual'` (assumir criação manual)

---

### 1.4 Especificações do Campo `isInAgenda`

**Tipo:** BOOLEAN
**Default:** `true`

**Comportamento:**
- **`true`:** Contato é considerado "Meu Contato" (usuário quer gerenciar)
- **`false`:** Contato foi criado automaticamente mas não está na agenda do usuário

**Quando `isInAgenda = false`:**
- Contatos criados automaticamente ao receber mensagem (`source = 'auto_created'`)
- Contatos importados de chats ativos (`source = 'chat_import'`)
- Números comerciais/suporte (ex: 103115, 190)

**Quando `isInAgenda = true`:**
- Contatos criados manualmente (`source = 'manual'`)
- Contatos importados da agenda WhatsApp (`source = 'whatsapp_roster'`)
- Contatos importados de Excel (`source = 'excel_import'`)

**UI:**
- Filtro "Somente Meus Contatos" → `isInAgenda = true`
- Filtro "Todos os Contatos" → Sem filtro (mostra true e false)

---

## 2. Regras de Negócio com Feature Flags

### 2.1 Feature Flag Principal

**Variável de Ambiente:** `FEATURE_CONTACTS_FIX`
**Tipo:** Boolean (`true` ou `false`)
**Default:** `false` (comportamento legado preservado)

**Localização:** `backend/.env`

```bash
# Feature flag para correção de "números fantasma"
FEATURE_CONTACTS_FIX=false # Mudar para true em staging/produção
```

---

### 2.2 Comportamento com `FEATURE_CONTACTS_FIX=false` (Legado)

**Normalização:**
- ❌ Hook `@BeforeCreate/@BeforeUpdate` **não é executado**
- ❌ Números são salvos como recebidos (com formatação, sem +, etc.)
- ✅ Lógica atual `number.replace(/\D/g, "")` continua funcionando

**Campos Novos:**
- ❌ Campo `source` não é usado (sempre `null` ou default `'manual'`)
- ❌ Campo `isInAgenda` não é usado (sempre `true`)

**Endpoints:**
- ❌ Query params `source` e `onlyAgenda` em `/contacts/` são ignorados
- ❌ Endpoint `/contacts/import/chats` retorna 404 (não implementado)

**Constraint UNIQUE:**
- ✅ Constraint composto `(number, companyId)` continua ativo
- ⚠️ Mas duplicatas lógicas podem existir devido a formatos diferentes

**Logs:**
- ⚠️ Log de warning indicando que feature flag está desabilitada

---

### 2.3 Comportamento com `FEATURE_CONTACTS_FIX=true` (Novo)

**Normalização:**
- ✅ Hook `@BeforeCreate/@BeforeUpdate` é executado
- ✅ Números são normalizados para E.164 antes de salvar
- ✅ Números inválidos rejeitam com `AppError('ERR_INVALID_PHONE_NUMBER', 400)`

**Campos Novos:**
- ✅ Campo `source` é obrigatório em todas as criações
- ✅ Campo `isInAgenda` é usado para filtrar "Meus Contatos" vs "Todos"

**Endpoints:**
- ✅ Query params `source` e `onlyAgenda` em `/contacts/` funcionam
- ✅ Endpoint `/contacts/import/chats` está ativo

**Constraint UNIQUE:**
- ✅ Constraint composto `(number, companyId)` previne duplicatas exatas
- ✅ Normalização garante que não há duplicatas lógicas

**Logs:**
- ✅ Logs Pino registram normalização, source, duplicatas detectadas

---

### 2.4 Transição Segura (Rollout)

**Fase 1: Deploy com Flag Desabilitada**
```bash
# backend/.env (staging)
FEATURE_CONTACTS_FIX=false
```
- Deploy das migrations (adiciona campos `source` e `isInAgenda`)
- Valida que nada quebrou

**Fase 2: Habilitar Flag em Staging**
```bash
FEATURE_CONTACTS_FIX=true
```
- Testar criação manual de contatos
- Testar importação de Excel
- Testar importação de roster WhatsApp
- Monitorar logs Pino por erros de normalização

**Fase 3: Migration de Normalização de Dados Existentes**
- Executar migration que normaliza números antigos
- Validar duplicatas antes de aplicar
- Se houver duplicatas, pausar e resolver manualmente

**Fase 4: Habilitar Flag em Produção**
```bash
FEATURE_CONTACTS_FIX=true
```
- Monitorar Sentry por erros `ERR_INVALID_PHONE_NUMBER`
- Se taxa de erro > 1%, fazer rollback para `false`

**Rollback:**
```bash
FEATURE_CONTACTS_FIX=false
```
- Normalização é desabilitada imediatamente
- Campos `source` e `isInAgenda` permanecem no banco (não quebra)
- Para remover constraint UNIQUE composto, executar migration de rollback

---

## 3. Endpoints (Novos e Modificados)

### 3.1 Endpoint: GET /contacts/ (MODIFICADO)

**Descrição:** Lista contatos com filtros avançados

**Modificações:**
- ✅ Adicionar query params: `source`, `onlyAgenda`
- ✅ Adicionar headers de resposta: `X-Total-Count-Filtered`, `X-Total-Count-All`
- ✅ Manter backward compatibility (sem params = comportamento antigo)

**Request:**
```http
GET /contacts/?searchParam=joão&pageNumber=1&contactTag=[1,2]&source=manual&onlyAgenda=true
Authorization: Bearer <token>
```

**Query Parameters:**

| Parâmetro | Tipo | Obrigatório | Default | Descrição |
|-----------|------|-------------|---------|-----------|
| `searchParam` | string | Não | `""` | Busca por nome ou número |
| `pageNumber` | number | Não | `1` | Número da página (100 itens/página) |
| `contactTag` | array | Não | `[]` | IDs de tags (JSON stringified) |
| `isGroup` | boolean | Não | `undefined` | Filtrar apenas grupos ou não-grupos |
| `source` | enum | Não | `undefined` | Filtrar por origem: `manual`, `whatsapp_roster`, `excel_import`, `auto_created`, `chat_import` |
| `onlyAgenda` | boolean | Não | `false` | Se `true`, retorna apenas contatos com `isInAgenda=true` |

**Response (200 OK):**
```json
{
  "contacts": [
    {
      "id": 1,
      "name": "João Silva",
      "number": "+5511999999999",
      "email": "joao@example.com",
      "profilePicUrl": "https://...",
      "isGroup": false,
      "channel": "whatsapp",
      "source": "manual",
      "isInAgenda": true,
      "active": true,
      "companyId": 1,
      "tags": [
        { "id": 1, "name": "VIP" },
        { "id": 2, "name": "Cliente" }
      ],
      "createdAt": "2025-10-01T10:00:00Z",
      "updatedAt": "2025-10-14T15:30:00Z"
    }
  ],
  "count": 1,
  "hasMore": false
}
```

**Headers de Resposta:**
```http
X-Total-Count-Filtered: 1    # Total de contatos que passaram pelos filtros
X-Total-Count-All: 150        # Total de contatos da company (sem filtros)
```

**Códigos de Status:**
- `200 OK` - Sucesso
- `401 Unauthorized` - Token inválido
- `403 Forbidden` - Usuário não tem permissão para acessar contatos da company

**Implementação no Controller:**
```typescript
// backend/src/controllers/ContactController.ts

export const index = async (req: Request, res: Response): Promise<Response> => {
  const {
    searchParam,
    pageNumber,
    contactTag: tagIdsStringified,
    isGroup,
    source,        // NOVO
    onlyAgenda     // NOVO
  } = req.query as IndexQuery;

  const { id: userId, companyId, profile } = req.user;

  let tagsIds: number[] = [];
  if (tagIdsStringified) {
    tagsIds = JSON.parse(tagIdsStringified);
  }

  // Parse onlyAgenda (query string vem como string "true" ou "false")
  const parseOnlyAgenda = onlyAgenda === 'true' ? true : onlyAgenda === 'false' ? false : undefined;

  const { contacts, count, hasMore, totalAll } = await ListContactsService({
    searchParam,
    pageNumber,
    companyId,
    tagsIds,
    isGroup,
    userId: Number(userId),
    profile,
    canViewAllContacts: !!(req as any).user?.canViewAllContacts,
    source,         // NOVO
    onlyAgenda: parseOnlyAgenda  // NOVO
  });

  // Adicionar headers
  res.setHeader('X-Total-Count-Filtered', count.toString());
  res.setHeader('X-Total-Count-All', totalAll.toString());

  return res.json({ contacts, count, hasMore });
};
```

**Validação Zod:**
```typescript
import { z } from 'zod';

const ListContactsQuerySchema = z.object({
  searchParam: z.string().optional(),
  pageNumber: z.string().regex(/^\d+$/).transform(Number).default('1'),
  contactTag: z.string().optional().transform((val) => val ? JSON.parse(val) : []),
  isGroup: z.enum(['true', 'false']).optional(),
  source: z.enum(['manual', 'whatsapp_roster', 'excel_import', 'auto_created', 'chat_import']).optional(),
  onlyAgenda: z.enum(['true', 'false']).optional()
});
```

---

### 3.2 Endpoint: POST /contacts/ (MODIFICADO)

**Descrição:** Cria novo contato

**Modificações:**
- ✅ Adicionar campo `source` no body (obrigatório se `FEATURE_CONTACTS_FIX=true`)
- ✅ Adicionar campo `isInAgenda` no body (opcional, default `true`)
- ✅ Validar `number` em E.164 antes de salvar

**Request:**
```http
POST /contacts/
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Maria Oliveira",
  "number": "+5511988888888",
  "email": "maria@example.com",
  "source": "manual",
  "isInAgenda": true
}
```

**Body Parameters:**

| Campo | Tipo | Obrigatório | Default | Descrição |
|-------|------|-------------|---------|-----------|
| `name` | string | Sim | - | Nome do contato |
| `number` | string | Sim | - | Número em qualquer formato (será normalizado para E.164) |
| `email` | string | Não | `""` | Email do contato |
| `source` | enum | Condicional | `'manual'` | Origem do contato (obrigatório se `FEATURE_CONTACTS_FIX=true`) |
| `isInAgenda` | boolean | Não | `true` | Se é contato da agenda do usuário |
| `channel` | enum | Não | `'whatsapp'` | Canal: `whatsapp`, `instagram`, `facebook` |
| `isGroup` | boolean | Não | `false` | Se é grupo |

**Response (200 OK):**
```json
{
  "id": 101,
  "name": "Maria Oliveira",
  "number": "+5511988888888",
  "email": "maria@example.com",
  "source": "manual",
  "isInAgenda": true,
  "channel": "whatsapp",
  "active": true,
  "companyId": 1,
  "createdAt": "2025-10-14T16:00:00Z",
  "updatedAt": "2025-10-14T16:00:00Z"
}
```

**Códigos de Status:**
- `200 OK` - Contato criado com sucesso
- `400 Bad Request` - Validação falhou (número inválido, campos obrigatórios faltando)
- `409 Conflict` - Contato duplicado (número já existe para esta company)
- `401 Unauthorized` - Token inválido

**Validação Zod:**
```typescript
const CreateContactSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  number: z.string().regex(/^\+?\d{10,15}$/, 'Formato de número inválido (E.164 esperado)'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  source: z.enum(['manual', 'whatsapp_roster', 'excel_import', 'auto_created', 'chat_import']).default('manual'),
  isInAgenda: z.boolean().default(true),
  channel: z.enum(['whatsapp', 'instagram', 'facebook']).default('whatsapp'),
  isGroup: z.boolean().default(false)
});
```

**Implementação no Controller:**
```typescript
export const store = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const contactData = req.body;

  // Validar schema
  const validated = CreateContactSchema.parse(contactData);

  // Feature flag: se FEATURE_CONTACTS_FIX=true, exigir campo source
  if (process.env.FEATURE_CONTACTS_FIX === 'true' && !validated.source) {
    throw new AppError('ERR_SOURCE_REQUIRED', 400);
  }

  // Verificar duplicata ANTES de criar (normalização será feita no hook)
  const existingContact = await Contact.findOne({
    where: {
      number: validated.number,
      companyId
    }
  });

  if (existingContact) {
    throw new AppError('ERR_DUPLICATED_CONTACT', 409);
  }

  const contact = await CreateContactService({
    ...validated,
    companyId
  });

  // Socket.io
  const io = getIO();
  io.of(String(companyId)).emit(`company-${companyId}-contact`, {
    action: "create",
    contact
  });

  return res.status(200).json(contact);
};
```

---

### 3.3 Endpoint: POST /contacts/import (MODIFICADO)

**Descrição:** Importa contatos da agenda do telefone WhatsApp

**Modificações:**
- ✅ Adicionar body param `whatsappId` (obrigatório)
- ✅ Adicionar body param `filterGroups` (boolean, default `true`)
- ✅ Adicionar body param `onlyAgenda` (boolean, default `true`)
- ✅ Retornar contagem de contatos importados vs ignorados

**Request:**
```http
POST /contacts/import
Authorization: Bearer <token>
Content-Type: application/json

{
  "whatsappId": 1,
  "filterGroups": true,
  "onlyAgenda": true
}
```

**Body Parameters:**

| Campo | Tipo | Obrigatório | Default | Descrição |
|-------|------|-------------|---------|-----------|
| `whatsappId` | number | Sim | - | ID da conexão WhatsApp |
| `filterGroups` | boolean | Não | `true` | Se `true`, ignora grupos e broadcasts |
| `onlyAgenda` | boolean | Não | `true` | Se `true`, marca contatos como `isInAgenda=true` |

**Response (200 OK):**
```json
{
  "imported": 150,
  "ignored": 50,
  "duplicates": 10,
  "errors": []
}
```

**Response Fields:**

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `imported` | number | Contatos importados com sucesso |
| `ignored` | number | Contatos ignorados (grupos, broadcasts) |
| `duplicates` | number | Contatos que já existiam (foram atualizados) |
| `errors` | array | Erros durante importação (ex: número inválido) |

**Códigos de Status:**
- `200 OK` - Importação concluída (sucesso ou parcial)
- `400 Bad Request` - `whatsappId` inválido ou faltando
- `404 Not Found` - Conexão WhatsApp não encontrada
- `401 Unauthorized` - Token inválido

**Validação Zod:**
```typescript
const ImportContactsSchema = z.object({
  whatsappId: z.number().int().positive('WhatsApp ID é obrigatório'),
  filterGroups: z.boolean().default(true),
  onlyAgenda: z.boolean().default(true)
});
```

**Implementação no Controller:**
```typescript
// backend/src/controllers/ImportPhoneContactsController.ts

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { whatsappId, filterGroups, onlyAgenda } = ImportContactsSchema.parse(req.body);

  // Validar que whatsappId pertence à company
  const whatsapp = await Whatsapp.findOne({
    where: { id: whatsappId, companyId }
  });

  if (!whatsapp) {
    throw new AppError('ERR_WHATSAPP_NOT_FOUND', 404);
  }

  const result = await ImportContactsService({
    companyId,
    whatsappId,
    filterGroups,
    onlyAgenda
  });

  return res.status(200).json(result);
};
```

---

### 3.4 Endpoint: POST /contacts/import/chats (NOVO)

**Descrição:** Importa contatos de chats ativos nas últimas X horas

**Status:** NOVO ENDPOINT (não existe no backend atual)

**Request:**
```http
POST /contacts/import/chats
Authorization: Bearer <token>
Content-Type: application/json

{
  "whatsappId": 1,
  "hours": 24
}
```

**Body Parameters:**

| Campo | Tipo | Obrigatório | Default | Descrição |
|-------|------|-------------|---------|-----------|
| `whatsappId` | number | Sim | - | ID da conexão WhatsApp |
| `hours` | number | Não | `24` | Janela de tempo (máximo 168 = 7 dias) |

**Response (200 OK):**
```json
{
  "imported": 25,
  "contacts": [
    {
      "id": 101,
      "name": "Desconhecido",
      "number": "+5511977777777",
      "source": "chat_import",
      "isInAgenda": false
    }
  ]
}
```

**Códigos de Status:**
- `200 OK` - Importação concluída
- `400 Bad Request` - Parâmetros inválidos
- `404 Not Found` - Conexão WhatsApp não encontrada
- `401 Unauthorized` - Token inválido

**Validação Zod:**
```typescript
const ImportChatsSchema = z.object({
  whatsappId: z.number().int().positive('WhatsApp ID é obrigatório'),
  hours: z.number().int().positive().max(168, 'Máximo de 7 dias (168 horas)').default(24)
});
```

**Implementação no Controller:**
```typescript
// backend/src/controllers/ImportPhoneContactsController.ts

export const importChats = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const { whatsappId, hours } = ImportChatsSchema.parse(req.body);

  // Validar que whatsappId pertence à company
  const whatsapp = await Whatsapp.findOne({
    where: { id: whatsappId, companyId }
  });

  if (!whatsapp) {
    throw new AppError('ERR_WHATSAPP_NOT_FOUND', 404);
  }

  const result = await ImportChatsService({
    companyId,
    whatsappId,
    hours
  });

  return res.status(200).json(result);
};
```

**Service Implementation:**
```typescript
// backend/src/services/WbotServices/ImportChatsService.ts

interface Request {
  companyId: number;
  whatsappId: number;
  hours: number;
}

interface Response {
  imported: number;
  contacts: Contact[];
}

const ImportChatsService = async ({ companyId, whatsappId, hours }: Request): Promise<Response> => {
  const wbot = getWbot(whatsappId);
  const cutoffDate = new Date(Date.now() - hours * 60 * 60 * 1000);

  // Buscar tickets/mensagens recentes
  const recentTickets = await Ticket.findAll({
    where: {
      companyId,
      whatsappId,
      createdAt: {
        [Op.gte]: cutoffDate
      }
    },
    attributes: ['contactId'],
    group: ['contactId']
  });

  const contactIds = recentTickets.map(t => t.contactId);

  // Buscar contatos que não estão em isInAgenda=true
  const existingContacts = await Contact.findAll({
    where: {
      id: { [Op.in]: contactIds },
      companyId,
      isInAgenda: false // Apenas contatos que não estão na agenda
    }
  });

  // Atualizar para isInAgenda=true e source='chat_import'
  const updatedContacts: Contact[] = [];
  for (const contact of existingContacts) {
    contact.isInAgenda = true;
    contact.source = 'chat_import';
    await contact.save();
    updatedContacts.push(contact);
  }

  logger.info(`[ImportChatsService] Imported ${updatedContacts.length} contacts from chats (last ${hours}h) for company ${companyId}`);

  return {
    imported: updatedContacts.length,
    contacts: updatedContacts
  };
};

export default ImportChatsService;
```

---

## 4. Schemas de Validação (Zod)

### 4.1 Arquivo Centralizado de Validação

```typescript
// backend/src/validators/ContactValidator.ts

import { z } from 'zod';

// ============================================================
// SCHEMA: Criar Contato
// ============================================================
export const CreateContactSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  number: z.string().regex(
    /^\+?\d{10,15}$/,
    'Formato de número inválido (E.164 esperado: +5511999999999)'
  ),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  source: z.enum([
    'manual',
    'whatsapp_roster',
    'excel_import',
    'auto_created',
    'chat_import'
  ]).default('manual'),
  isInAgenda: z.boolean().default(true),
  channel: z.enum(['whatsapp', 'instagram', 'facebook']).default('whatsapp'),
  isGroup: z.boolean().default(false),
  disableBot: z.boolean().optional(),
  acceptAudioMessage: z.boolean().optional(),
  remoteJid: z.string().optional(),
  wallets: z.array(z.number()).nullable().optional()
});

export type CreateContactInput = z.infer<typeof CreateContactSchema>;

// ============================================================
// SCHEMA: Atualizar Contato
// ============================================================
export const UpdateContactSchema = z.object({
  name: z.string().min(1).optional(),
  number: z.string().regex(/^\+?\d{10,15}$/).optional(),
  email: z.string().email().optional().or(z.literal('')),
  source: z.enum([
    'manual',
    'whatsapp_roster',
    'excel_import',
    'auto_created',
    'chat_import'
  ]).optional(),
  isInAgenda: z.boolean().optional(),
  disableBot: z.boolean().optional(),
  acceptAudioMessage: z.boolean().optional(),
  active: z.boolean().optional()
});

export type UpdateContactInput = z.infer<typeof UpdateContactSchema>;

// ============================================================
// SCHEMA: Listar Contatos (Query Params)
// ============================================================
export const ListContactsQuerySchema = z.object({
  searchParam: z.string().optional(),
  pageNumber: z.string().regex(/^\d+$/).transform(Number).default('1'),
  contactTag: z.string().optional().transform((val) => {
    if (!val) return [];
    try {
      return JSON.parse(val);
    } catch {
      return [];
    }
  }),
  isGroup: z.enum(['true', 'false']).optional(),
  source: z.enum([
    'manual',
    'whatsapp_roster',
    'excel_import',
    'auto_created',
    'chat_import'
  ]).optional(),
  onlyAgenda: z.enum(['true', 'false'])
    .optional()
    .transform((val) => val === 'true' ? true : val === 'false' ? false : undefined)
});

export type ListContactsQuery = z.infer<typeof ListContactsQuerySchema>;

// ============================================================
// SCHEMA: Importar Contatos WhatsApp
// ============================================================
export const ImportContactsSchema = z.object({
  whatsappId: z.number().int().positive('WhatsApp ID é obrigatório'),
  filterGroups: z.boolean().default(true),
  onlyAgenda: z.boolean().default(true)
});

export type ImportContactsInput = z.infer<typeof ImportContactsSchema>;

// ============================================================
// SCHEMA: Importar Contatos de Chats
// ============================================================
export const ImportChatsSchema = z.object({
  whatsappId: z.number().int().positive('WhatsApp ID é obrigatório'),
  hours: z.number().int().positive().max(168, 'Máximo de 7 dias (168 horas)').default(24)
});

export type ImportChatsInput = z.infer<typeof ImportChatsSchema>;

// ============================================================
// SCHEMA: Importar Excel/CSV
// ============================================================
export const ImportXlsSchema = z.object({
  number: z.string().min(1, 'Número é obrigatório'),
  name: z.string().min(1, 'Nome é obrigatório'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  validateContact: z.enum(['true', 'false']).default('false'),
  tags: z.string().optional() // Comma-separated tags
});

export type ImportXlsInput = z.infer<typeof ImportXlsSchema>;
```

---

### 4.2 Uso nos Controllers

```typescript
// backend/src/controllers/ContactController.ts

import {
  CreateContactSchema,
  UpdateContactSchema,
  ListContactsQuerySchema
} from '../validators/ContactValidator';

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;

  try {
    // Validar input
    const validated = CreateContactSchema.parse(req.body);

    // Feature flag: exigir source se FEATURE_CONTACTS_FIX=true
    if (process.env.FEATURE_CONTACTS_FIX === 'true' && !validated.source) {
      throw new AppError('ERR_SOURCE_REQUIRED', 400);
    }

    // Criar contato
    const contact = await CreateContactService({
      ...validated,
      companyId
    });

    // Socket.io
    const io = getIO();
    io.of(String(companyId)).emit(`company-${companyId}-contact`, {
      action: "create",
      contact
    });

    return res.status(200).json(contact);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.errors.map(e => e.message).join(', ');
      throw new AppError(messages, 400);
    }
    throw error;
  }
};

export const index = async (req: Request, res: Response): Promise<Response> => {
  const { id: userId, companyId, profile } = req.user;

  try {
    // Validar query params
    const validated = ListContactsQuerySchema.parse(req.query);

    const { contacts, count, hasMore, totalAll } = await ListContactsService({
      ...validated,
      companyId,
      userId: Number(userId),
      profile,
      canViewAllContacts: !!(req as any).user?.canViewAllContacts
    });

    // Headers
    res.setHeader('X-Total-Count-Filtered', count.toString());
    res.setHeader('X-Total-Count-All', totalAll.toString());

    return res.json({ contacts, count, hasMore });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const messages = error.errors.map(e => e.message).join(', ');
      throw new AppError(messages, 400);
    }
    throw error;
  }
};
```

---

## 5. Estrutura de Migrations

### 5.1 Migration 1: Adicionar Campos `source` e `isInAgenda`

**Nome:** `20251014100000-add-source-isInAgenda-to-contacts.ts`
**Descrição:** Adiciona campos `source` (ENUM) e `isInAgenda` (BOOLEAN) ao modelo Contact

```typescript
// backend/src/database/migrations/20251014100000-add-source-isInAgenda-to-contacts.ts

import { QueryInterface, DataTypes } from 'sequelize';

export default {
  up: async (queryInterface: QueryInterface) => {
    // 1. Criar tipo ENUM para source
    await queryInterface.sequelize.query(`
      CREATE TYPE contact_source AS ENUM (
        'manual',
        'whatsapp_roster',
        'excel_import',
        'auto_created',
        'chat_import'
      );
    `);

    // 2. Adicionar coluna 'source' com default 'manual'
    await queryInterface.addColumn('Contacts', 'source', {
      type: 'contact_source',
      defaultValue: 'manual',
      allowNull: false
    });

    // 3. Adicionar coluna 'isInAgenda' com default true
    await queryInterface.addColumn('Contacts', 'isInAgenda', {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false
    });

    console.log('[Migration] Added columns: source, isInAgenda to Contacts table');
  },

  down: async (queryInterface: QueryInterface) => {
    // Remover colunas na ordem reversa
    await queryInterface.removeColumn('Contacts', 'isInAgenda');
    await queryInterface.removeColumn('Contacts', 'source');

    // Remover tipo ENUM
    await queryInterface.sequelize.query(`DROP TYPE IF EXISTS contact_source;`);

    console.log('[Migration Rollback] Removed columns: source, isInAgenda from Contacts table');
  }
};
```

**Validações Pós-Migration:**
```sql
-- Validar que colunas foram adicionadas
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'Contacts'
  AND column_name IN ('source', 'isInAgenda');

-- Resultado esperado:
-- column_name | data_type       | column_default
-- source      | USER-DEFINED    | 'manual'::contact_source
-- isInAgenda  | boolean         | true
```

---

### 5.2 Migration 2: Normalizar Números Existentes

**Nome:** `20251014110000-normalize-existing-contacts.ts`
**Descrição:** Normaliza números existentes para E.164 (com backup)

**⚠️ ATENÇÃO:** Esta migration deve ser executada **APÓS** habilitar `FEATURE_CONTACTS_FIX=true` em staging

```typescript
// backend/src/database/migrations/20251014110000-normalize-existing-contacts.ts

import { QueryInterface } from 'sequelize';

export default {
  up: async (queryInterface: QueryInterface) => {
    console.log('[Migration] Starting normalization of existing contact numbers...');

    // 1. Criar backup da tabela Contacts
    await queryInterface.sequelize.query(`
      CREATE TABLE IF NOT EXISTS contacts_backup_20251014 AS
      SELECT * FROM "Contacts";
    `);
    console.log('[Migration] Backup created: contacts_backup_20251014');

    // 2. Criar coluna temporária para números normalizados
    await queryInterface.sequelize.query(`
      ALTER TABLE "Contacts" ADD COLUMN IF NOT EXISTS number_normalized VARCHAR(20);
    `);

    // 3. Normalizar números BR (código de país 55)
    // Regra: Se número tem 10-13 dígitos e não começa com +, adicionar +
    await queryInterface.sequelize.query(`
      UPDATE "Contacts"
      SET number_normalized = '+' || REGEXP_REPLACE(number, '[^0-9]', '', 'g')
      WHERE LENGTH(REGEXP_REPLACE(number, '[^0-9]', '', 'g')) BETWEEN 10 AND 15
        AND number NOT LIKE '+%'
        AND "isGroup" = false;
    `);

    // 4. Para números que já começam com +, apenas remover formatação
    await queryInterface.sequelize.query(`
      UPDATE "Contacts"
      SET number_normalized = '+' || REGEXP_REPLACE(number, '[^0-9]', '', 'g')
      WHERE number LIKE '+%'
        AND number_normalized IS NULL
        AND "isGroup" = false;
    `);

    // 5. Para grupos, manter número original
    await queryInterface.sequelize.query(`
      UPDATE "Contacts"
      SET number_normalized = number
      WHERE "isGroup" = true
        AND number_normalized IS NULL;
    `);

    // 6. Validar duplicatas ANTES de aplicar normalização
    const [duplicates] = await queryInterface.sequelize.query(`
      SELECT number_normalized, "companyId", COUNT(*) as count
      FROM "Contacts"
      WHERE number_normalized IS NOT NULL
      GROUP BY number_normalized, "companyId"
      HAVING COUNT(*) > 1;
    `);

    if (duplicates.length > 0) {
      console.error('[Migration] ❌ DUPLICATAS DETECTADAS:', duplicates);
      throw new Error('Duplicatas detectadas. Pausar migration e resolver manualmente.');
    }

    // 7. Se não houver duplicatas, aplicar normalização
    await queryInterface.sequelize.query(`
      UPDATE "Contacts"
      SET number = number_normalized
      WHERE number_normalized IS NOT NULL;
    `);

    // 8. Remover coluna temporária
    await queryInterface.sequelize.query(`
      ALTER TABLE "Contacts" DROP COLUMN IF EXISTS number_normalized;
    `);

    console.log('[Migration] ✅ Normalization completed successfully');
  },

  down: async (queryInterface: QueryInterface) => {
    console.log('[Migration Rollback] Restoring numbers from backup...');

    // Restaurar números originais do backup
    await queryInterface.sequelize.query(`
      UPDATE "Contacts" c
      SET number = b.number
      FROM contacts_backup_20251014 b
      WHERE c.id = b.id;
    `);

    // Opcional: Remover backup após rollback
    // await queryInterface.sequelize.query(`DROP TABLE IF EXISTS contacts_backup_20251014;`);

    console.log('[Migration Rollback] ✅ Numbers restored from backup');
  }
};
```

**Validações Pós-Migration:**
```sql
-- Validar que números foram normalizados
SELECT
  COUNT(*) as total,
  COUNT(CASE WHEN number LIKE '+%' THEN 1 END) as with_plus,
  COUNT(CASE WHEN number ~ '[^0-9+]' THEN 1 END) as with_formatting
FROM "Contacts"
WHERE "isGroup" = false;

-- Resultado esperado:
-- total | with_plus | with_formatting
-- 500   | 500       | 0
```

---

### 5.3 Migration 3: Adicionar Constraint UNIQUE Composto

**Nome:** `20251014120000-add-unique-constraint-normalized-number.ts`
**Descrição:** Adiciona constraint UNIQUE em `(number, companyId)` após normalização

**⚠️ ATENÇÃO:** Executar apenas APÓS migration 2 (normalização) ser concluída com sucesso

```typescript
// backend/src/database/migrations/20251014120000-add-unique-constraint-normalized-number.ts

import { QueryInterface } from 'sequelize';

export default {
  up: async (queryInterface: QueryInterface) => {
    console.log('[Migration] Adding UNIQUE constraint on (number, companyId)...');

    // Validar que não há duplicatas antes de criar constraint
    const [duplicates] = await queryInterface.sequelize.query(`
      SELECT number, "companyId", COUNT(*) as count
      FROM "Contacts"
      GROUP BY number, "companyId"
      HAVING COUNT(*) > 1;
    `);

    if (duplicates.length > 0) {
      console.error('[Migration] ❌ DUPLICATAS DETECTADAS:', duplicates);
      throw new Error('Duplicatas detectadas. Resolver antes de criar constraint.');
    }

    // Criar índice UNIQUE de forma não-bloqueante (CONCURRENTLY)
    // Nota: CONCURRENTLY não funciona dentro de transação, então executar raw SQL
    await queryInterface.sequelize.query(`
      CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_contacts_number_company
      ON "Contacts" (number, "companyId")
      WHERE number IS NOT NULL;
    `);

    console.log('[Migration] ✅ UNIQUE constraint added successfully');
  },

  down: async (queryInterface: QueryInterface) => {
    console.log('[Migration Rollback] Removing UNIQUE constraint...');

    // Remover índice
    await queryInterface.sequelize.query(`
      DROP INDEX IF EXISTS idx_contacts_number_company;
    `);

    console.log('[Migration Rollback] ✅ UNIQUE constraint removed');
  }
};
```

**Validações Pós-Migration:**
```sql
-- Validar que constraint foi criado
SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'Contacts'
  AND indexname = 'idx_contacts_number_company';

-- Resultado esperado:
-- indexname                   | indexdef
-- idx_contacts_number_company | CREATE UNIQUE INDEX idx_contacts_number_company ON "Contacts" USING btree (number, "companyId") WHERE (number IS NOT NULL)
```

---

### 5.4 Ordem de Execução das Migrations

**Cronograma Recomendado:**

| Fase | Ação | Quando Executar | Validação |
|------|------|-----------------|-----------|
| **1** | Deploy código + Migration 1 | Imediatamente | Validar que colunas existem |
| **2** | Habilitar `FEATURE_CONTACTS_FIX=true` em staging | Após fase 1 | Testar criação de contatos |
| **3** | Monitorar logs Pino por 24h | Após fase 2 | Taxa de erro < 1% |
| **4** | Migration 2 (normalização) em staging | Após fase 3 | Validar duplicatas |
| **5** | Se OK: Migration 3 (constraint) em staging | Após fase 4 | Testar importação |
| **6** | Deploy em produção | Após validação em staging | - |

**Rollback em Caso de Falha:**
```bash
# Desabilitar feature flag
FEATURE_CONTACTS_FIX=false

# Executar rollback das migrations na ordem reversa
npm run migrate:undo # Migration 3
npm run migrate:undo # Migration 2
npm run migrate:undo # Migration 1
```

---

## 6. Plano de Commits Granulares

### Commit 1: feat(contacts): add source and isInAgenda fields

**Arquivos:**
- `backend/src/models/Contact.ts`
- `backend/src/database/migrations/20251014100000-add-source-isInAgenda-to-contacts.ts`

**Checklist:**
- [ ] Adicionar campo `source` (ENUM) ao modelo Contact.ts
- [ ] Adicionar campo `isInAgenda` (BOOLEAN) ao modelo Contact.ts
- [ ] Criar migration para adicionar colunas
- [ ] Validar multi-tenant: Campos são específicos por `companyId`
- [ ] Testar migration UP e DOWN em ambiente local
- [ ] Documentar rollback: Migration DOWN remove colunas sem perda de dados

**Estimativa:** 2 horas

**Dependências:** Nenhuma

---

### Commit 2: feat(contacts): add E.164 normalization hook

**Arquivos:**
- `backend/src/models/Contact.ts`
- `backend/package.json` (adicionar `libphonenumber-js`)

**Checklist:**
- [ ] Instalar `libphonenumber-js` no backend
- [ ] Criar hook `@BeforeCreate` em Contact.ts
- [ ] Criar hook `@BeforeUpdate` em Contact.ts
- [ ] Adicionar validação com `isValidPhoneNumber()`
- [ ] Adicionar tratamento de erro com `AppError('ERR_INVALID_PHONE_NUMBER')`
- [ ] Adicionar feature flag `FEATURE_CONTACTS_FIX` para controlar execução do hook
- [ ] Validar multi-tenant: Hook respeita isolamento de `companyId`
- [ ] Adicionar logs Pino em caso de erro

**Estimativa:** 3 horas

**Dependências:** Commit 1

---

### Commit 3: feat(contacts): update CreateOrUpdateContactService with source

**Arquivos:**
- `backend/src/services/ContactServices/CreateOrUpdateContactService.ts`
- `backend/src/services/ContactServices/CreateContactService.ts`

**Checklist:**
- [ ] Adicionar param `source` em `CreateOrUpdateContactService`
- [ ] Adicionar param `isInAgenda` em `CreateOrUpdateContactService`
- [ ] Atualizar chamadas existentes para passar `source = 'auto_created'` ou `'manual'`
- [ ] Validar multi-tenant: Service valida `companyId` antes de criar
- [ ] Adicionar logs Pino com `source_counts`
- [ ] Testar criação manual de contato com `source = 'manual'`
- [ ] Testar criação automática de contato com `source = 'auto_created'`

**Estimativa:** 2 horas

**Dependências:** Commit 2

---

### Commit 4: feat(contacts): add source filter to ListContactsService

**Arquivos:**
- `backend/src/services/ContactServices/ListContactsService.ts`
- `backend/src/controllers/ContactController.ts`
- `backend/src/validators/ContactValidator.ts`

**Checklist:**
- [ ] Adicionar query params `source` e `onlyAgenda` em ListContactsService
- [ ] Atualizar `whereCondition` para incluir filtro `source`
- [ ] Atualizar `whereCondition` para incluir filtro `isInAgenda`
- [ ] Validar multi-tenant: Filtro sempre inclui `companyId`
- [ ] Manter backward compatibility: sem params = comportamento antigo
- [ ] Adicionar header `X-Total-Count-Filtered` na resposta
- [ ] Criar schema Zod para validação de query params
- [ ] Testar filtro `onlyAgenda=true` retorna apenas `isInAgenda=true`

**Estimativa:** 3 horas

**Dependências:** Commit 3

---

### Commit 5: fix(contacts): refactor ImportContactsService with filters

**Arquivos:**
- `backend/src/services/WbotServices/ImportContactsService.ts`
- `backend/src/controllers/ImportPhoneContactsController.ts`
- `backend/src/validators/ContactValidator.ts`

**Checklist:**
- [ ] Adicionar param `whatsappId` obrigatório no controller
- [ ] Adicionar param `filterGroups` (default true)
- [ ] Adicionar param `onlyAgenda` (default true)
- [ ] Atualizar service para marcar contatos como `source = 'whatsapp_roster'`
- [ ] Atualizar service para marcar contatos como `isInAgenda = onlyAgenda`
- [ ] Adicionar contagem de importados/ignorados na resposta
- [ ] Validar multi-tenant: Service valida que `whatsappId` pertence à `companyId`
- [ ] Adicionar logs Pino com contagem de importados

**Estimativa:** 3 horas

**Dependências:** Commit 4

---

### Commit 6: feat(contacts): create /contacts/import/chats endpoint

**Arquivos:**
- `backend/src/controllers/ImportPhoneContactsController.ts`
- `backend/src/services/WbotServices/ImportChatsService.ts` (novo)
- `backend/src/routes/contactRoutes.ts`
- `backend/src/validators/ContactValidator.ts`

**Checklist:**
- [ ] Criar controller `importChats` em `ImportPhoneContactsController.ts`
- [ ] Criar service `ImportChatsService` que busca tickets recentes
- [ ] Adicionar lógica para atualizar `isInAgenda = true` e `source = 'chat_import'`
- [ ] Adicionar rota `POST /contacts/import/chats` em `contactRoutes.ts`
- [ ] Criar schema Zod `ImportChatsSchema`
- [ ] Validar multi-tenant: Service filtra tickets por `companyId`
- [ ] Adicionar logs Pino com contagem de importados
- [ ] Testar endpoint retorna contatos corretos

**Estimativa:** 4 horas

**Dependências:** Commit 5

---

### Commit 7: test(contacts): add unit tests for E.164 normalization

**Arquivos:**
- `backend/__tests__/unit/models/Contact.test.ts` (novo)
- `backend/__tests__/integration/services/ContactServices/CreateContactService.test.ts`

**Checklist:**
- [ ] Criar teste unitário: Hook normaliza `(11) 99999-9999` → `+5511999999999`
- [ ] Criar teste unitário: Hook rejeita número inválido `123`
- [ ] Criar teste unitário: Hook aceita número E.164 válido `+5511999999999`
- [ ] Criar teste unitário: Feature flag `FEATURE_CONTACTS_FIX=false` desabilita hook
- [ ] Criar teste integração: CreateContactService cria contato com número normalizado
- [ ] Criar teste integração: Duplicata de número normalizado é detectada
- [ ] Validar multi-tenant: Testes isolam por `companyId`
- [ ] Cobertura de testes > 80% nos arquivos modificados

**Estimativa:** 4 horas

**Dependências:** Commit 6

---

### Commit 8: chore(contacts): update API documentation

**Arquivos:**
- `docs/api/openapi.yaml` (criar se não existir)
- `docs/contacts/backend-plan.md` (este documento)

**Checklist:**
- [ ] Criar/atualizar `openapi.yaml` com novos endpoints
- [ ] Adicionar exemplos de request/response para `/contacts/`
- [ ] Adicionar exemplos de request/response para `/contacts/import`
- [ ] Adicionar exemplos de request/response para `/contacts/import/chats`
- [ ] Documentar feature flags (`FEATURE_CONTACTS_FIX`)
- [ ] Documentar schemas Zod
- [ ] Documentar códigos de erro (`ERR_INVALID_PHONE_NUMBER`, etc.)

**Estimativa:** 2 horas

**Dependências:** Commit 7

---

### Commit 9: chore(contacts): run migration 2 (normalize existing numbers)

**Arquivos:**
- `backend/src/database/migrations/20251014110000-normalize-existing-contacts.ts`

**Checklist:**
- [ ] Executar migration em staging
- [ ] Validar backup foi criado: `contacts_backup_20251014`
- [ ] Validar que não há duplicatas detectadas
- [ ] Validar que números foram normalizados (verificar sample de 10 contatos)
- [ ] Validar multi-tenant: Normalização respeitou isolamento de `companyId`
- [ ] Monitorar logs por erros
- [ ] Se houver erros, executar rollback (migration DOWN)

**Estimativa:** 1 hora (execução) + 2 horas (validação)

**Dependências:** Commit 8 + Deploy em staging

**⚠️ ATENÇÃO:** Executar apenas em staging primeiro, validar por 48h antes de produção

---

### Commit 10: chore(contacts): run migration 3 (add UNIQUE constraint)

**Arquivos:**
- `backend/src/database/migrations/20251014120000-add-unique-constraint-normalized-number.ts`

**Checklist:**
- [ ] Executar migration em staging
- [ ] Validar que constraint foi criado: `idx_contacts_number_company`
- [ ] Testar que duplicata de número é rejeitada com erro
- [ ] Testar que criação de contato com número único funciona
- [ ] Validar multi-tenant: Constraint permite mesmo número em companies diferentes
- [ ] Monitorar logs por erros
- [ ] Se houver erros, executar rollback (migration DOWN)

**Estimativa:** 1 hora (execução) + 1 hora (validação)

**Dependências:** Commit 9

**⚠️ ATENÇÃO:** Executar apenas APÓS migration 2 ser concluída sem duplicatas

---

## 7. Logs Pino

### 7.1 Estrutura de Logs

Todos os logs devem seguir o padrão Pino com campos estruturados:

```typescript
logger.info({
  action: 'nome_da_acao',
  resource: 'contact',
  resourceId: contact.id,
  companyId: contact.companyId,
  // ... campos específicos
});
```

---

### 7.2 Logs por Ação

#### 7.2.1 Criar Contato

```typescript
// backend/src/services/ContactServices/CreateContactService.ts

import logger from '../utils/logger';

const CreateContactService = async (contactData: ContactData): Promise<Contact> => {
  const contact = await Contact.create(contactData);

  logger.info({
    action: 'contact_created',
    resource: 'contact',
    resourceId: contact.id,
    source: contact.source,
    isInAgenda: contact.isInAgenda,
    companyId: contact.companyId,
    normalizedNumber: contact.number,
    featureFlag: process.env.FEATURE_CONTACTS_FIX === 'true'
  });

  return contact;
};
```

---

#### 7.2.2 Detectar Duplicata

```typescript
// backend/src/models/Contact.ts (hook)

@BeforeCreate
@BeforeUpdate
static async normalizePhoneNumber(contact: Contact) {
  // ... lógica de normalização ...

  // Verificar se já existe contato com número normalizado
  const existing = await Contact.findOne({
    where: {
      number: contact.number,
      companyId: contact.companyId
    }
  });

  if (existing) {
    logger.warn({
      action: 'contact_duplicate_detected',
      resource: 'contact',
      existingContactId: existing.id,
      rawNumber: originalNumber,
      normalizedNumber: contact.number,
      companyId: contact.companyId
    });

    throw new AppError('ERR_DUPLICATED_CONTACT', 409);
  }
}
```

---

#### 7.2.3 Importar Roster WhatsApp

```typescript
// backend/src/services/WbotServices/ImportContactsService.ts

const ImportContactsService = async ({
  companyId,
  whatsappId,
  filterGroups,
  onlyAgenda
}: ImportContactsInput): Promise<ImportContactsResponse> => {
  const contacts = await fetchRosterFromBaileys(whatsappId);

  let imported = 0;
  let ignored = 0;
  let duplicates = 0;

  for (const contact of contacts) {
    if (filterGroups && contact.id.includes('@g.us')) {
      ignored++;
      continue;
    }

    try {
      await CreateContactService({
        ...contact,
        source: 'whatsapp_roster',
        isInAgenda: onlyAgenda,
        companyId
      });
      imported++;
    } catch (error) {
      if (error.message === 'ERR_DUPLICATED_CONTACT') {
        duplicates++;
      }
    }
  }

  logger.info({
    action: 'contacts_imported',
    resource: 'contact',
    whatsappId,
    source: 'whatsapp_roster',
    imported_count: imported,
    ignored_count: ignored,
    duplicates_count: duplicates,
    companyId
  });

  return { imported, ignored, duplicates, errors: [] };
};
```

---

#### 7.2.4 Erro de Normalização

```typescript
// backend/src/models/Contact.ts (hook)

@BeforeCreate
@BeforeUpdate
static async normalizePhoneNumber(contact: Contact) {
  try {
    // ... lógica de normalização ...
  } catch (error) {
    logger.error({
      action: 'contact_normalization_failed',
      resource: 'contact',
      resourceId: contact.id || 'new',
      rawNumber: contact.number,
      companyId: contact.companyId,
      error: error.message,
      stack: error.stack
    });

    throw new AppError('ERR_INVALID_PHONE_NUMBER', 400);
  }
}
```

---

### 7.3 Métricas e Dashboards

**Log Aggregation (Pino + ELK/Loki):**
```json
{
  "action": "contact_created",
  "source": "manual",
  "companyId": 1,
  "timestamp": "2025-10-14T16:00:00Z"
}
```

**Queries de Análise:**
```javascript
// Contar contatos criados por source (últimas 24h)
db.logs.aggregate([
  { $match: { action: 'contact_created', timestamp: { $gte: new Date(Date.now() - 86400000) } } },
  { $group: { _id: '$source', count: { $sum: 1 } } }
]);

// Resultado:
// { _id: 'manual', count: 150 }
// { _id: 'whatsapp_roster', count: 487 }
// { _id: 'excel_import', count: 12 }
```

---

## 8. Critérios de Aceite

### 8.1 Commit 1: Adicionar Campos

**Critérios:**
- [ ] Migration executa sem erros em ambiente local
- [ ] Colunas `source` e `isInAgenda` aparecem em `SELECT * FROM "Contacts"`
- [ ] Valores default aplicados a registros existentes (`source='manual'`, `isInAgenda=true`)
- [ ] Rollback (migration DOWN) funciona sem perda de dados
- [ ] Query de validação retorna resultados corretos:
  ```sql
  SELECT COUNT(*) FROM "Contacts" WHERE source = 'manual' AND "isInAgenda" = true;
  ```

---

### 8.2 Commit 2: Hook de Normalização

**Critérios:**
- [ ] Hook normaliza `+55 (11) 99999-9999` → `+5511999999999`
- [ ] Hook normaliza `11 999999999` → `+5511999999999`
- [ ] Hook rejeita número inválido `123` com erro `ERR_INVALID_PHONE_NUMBER`
- [ ] Feature flag `FEATURE_CONTACTS_FIX=false` desabilita hook
- [ ] Logs Pino registram normalização bem-sucedida
- [ ] Logs Pino registram erro de normalização com detalhes
- [ ] Teste manual:
  ```bash
  curl -X POST http://localhost:3000/contacts/ \
    -H "Authorization: Bearer <token>" \
    -H "Content-Type: application/json" \
    -d '{"name":"João","number":"(11) 99999-9999","source":"manual"}'
  ```
  Resultado: `number` no banco é `+5511999999999`

---

### 8.3 Commit 3-6: Services e Endpoints

**Critérios:**
- [ ] `GET /contacts/?source=manual` retorna apenas contatos com `source='manual'`
- [ ] `GET /contacts/?onlyAgenda=true` retorna apenas contatos com `isInAgenda=true`
- [ ] `POST /contacts/` valida E.164 e rejeita número inválido com erro 400
- [ ] `POST /contacts/import` retorna contagem correta:
  ```json
  {
    "imported": 150,
    "ignored": 50,
    "duplicates": 10,
    "errors": []
  }
  ```
- [ ] `POST /contacts/import/chats` cria endpoint e retorna lista de contatos:
  ```json
  {
    "imported": 25,
    "contacts": [...]
  }
  ```
- [ ] Headers de resposta corretos:
  ```http
  X-Total-Count-Filtered: 150
  X-Total-Count-All: 500
  ```

---

### 8.4 Commit 7: Testes

**Critérios:**
- [ ] Cobertura de testes > 80% nos arquivos modificados
- [ ] Todos os testes passam localmente (`npm test`)
- [ ] Testes passam com `FEATURE_CONTACTS_FIX=true`
- [ ] Testes passam com `FEATURE_CONTACTS_FIX=false`
- [ ] Teste de integração valida isolamento multi-tenant:
  ```javascript
  // Criar contato com número +5511999999999 na company 1
  // Criar contato com número +5511999999999 na company 2
  // Resultado: Ambos são criados sem erro (isolamento por companyId)
  ```

---

### 8.5 Commit 9-10: Migrations de Normalização

**Critérios:**
- [ ] Migration 2 executa sem erros em staging
- [ ] Backup criado: `contacts_backup_20251014` existe
- [ ] Nenhuma duplicata detectada:
  ```sql
  SELECT number, "companyId", COUNT(*) FROM "Contacts"
  GROUP BY number, "companyId" HAVING COUNT(*) > 1;
  -- Resultado: 0 linhas
  ```
- [ ] Sample de 10 contatos validado manualmente:
  ```sql
  SELECT id, number FROM "Contacts" LIMIT 10;
  -- Todos devem começar com +
  ```
- [ ] Migration 3 cria constraint sem erros
- [ ] Teste de duplicata rejeita com erro 409:
  ```bash
  curl -X POST http://localhost:3000/contacts/ \
    -d '{"name":"Teste","number":"+5511999999999","source":"manual"}'
  # Resultado: 200 OK

  curl -X POST http://localhost:3000/contacts/ \
    -d '{"name":"Teste2","number":"+5511999999999","source":"manual"}'
  # Resultado: 409 Conflict
  ```

---

## 9. Observabilidade e Monitoramento

### 9.1 Logs Winston/Pino

**Eventos a Registrar:**

| Evento | Nível | Campos Obrigatórios |
|--------|-------|---------------------|
| `contact_created` | info | `resourceId`, `source`, `isInAgenda`, `companyId` |
| `contact_updated` | info | `resourceId`, `changes`, `companyId` |
| `contact_duplicate_detected` | warn | `existingContactId`, `rawNumber`, `normalizedNumber`, `companyId` |
| `contact_normalization_failed` | error | `rawNumber`, `error`, `companyId` |
| `contacts_imported` | info | `whatsappId`, `source`, `imported_count`, `ignored_count`, `companyId` |

**Exemplo de Log:**
```json
{
  "level": "info",
  "action": "contact_created",
  "resource": "contact",
  "resourceId": 101,
  "source": "manual",
  "isInAgenda": true,
  "companyId": 1,
  "normalizedNumber": "+5511999999999",
  "featureFlag": true,
  "timestamp": "2025-10-14T16:00:00Z",
  "hostname": "backend-01",
  "pid": 12345
}
```

---

### 9.2 Métricas (Prometheus/Grafana)

**Métricas a Coletar:**

```typescript
// backend/src/services/ContactServices/CreateContactService.ts

import promClient from 'prom-client';

// Contador de contatos criados por source
const contactsCreatedCounter = new promClient.Counter({
  name: 'contacts_created_total',
  help: 'Total de contatos criados',
  labelNames: ['source', 'companyId']
});

// Gauge de contatos por source
const contactsBySourceGauge = new promClient.Gauge({
  name: 'contacts_by_source',
  help: 'Contatos agrupados por source',
  labelNames: ['source', 'companyId']
});

// Histogram de tempo de normalização
const normalizationDurationHistogram = new promClient.Histogram({
  name: 'contact_normalization_duration_seconds',
  help: 'Duração da normalização de números',
  labelNames: ['companyId'],
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1]
});

const CreateContactService = async (contactData: ContactData): Promise<Contact> => {
  const startTime = Date.now();

  const contact = await Contact.create(contactData);

  contactsCreatedCounter.inc({ source: contact.source, companyId: contact.companyId });

  const duration = (Date.now() - startTime) / 1000;
  normalizationDurationHistogram.observe({ companyId: contact.companyId }, duration);

  return contact;
};
```

**Dashboards Grafana:**

1. **Painel: Contatos Criados por Source**
   - Gráfico de linha: `rate(contacts_created_total[5m])` por source
   - Mostrar tendência de criações manuais vs importações

2. **Painel: Distribuição de Contatos por Source**
   - Gráfico de pizza: `contacts_by_source` agrupado por source
   - Mostrar proporção de contatos manuais vs importados

3. **Painel: Erros de Normalização**
   - Gráfico de linha: `rate(contact_normalization_failed_total[5m])`
   - Alertar se taxa > 1% das criações

---

### 9.3 Bull Board (Monitoramento de Filas)

**Uso:** Não aplicável para esta feature (não há jobs assíncronos de contatos)

---

### 9.4 Socket.IO Admin Panel

**Eventos a Monitorar:**
- `company-{companyId}-contact` (ações: create, update, delete)

**Query de Métricas:**
```javascript
// Contar eventos Socket.io emitidos por company (últimas 1h)
io.fetchSockets().then(sockets => {
  const eventsByCompany = {};
  sockets.forEach(socket => {
    const companyId = socket.nsp.name.split('-')[1];
    eventsByCompany[companyId] = (eventsByCompany[companyId] || 0) + 1;
  });
  console.log(eventsByCompany);
});
```

---

## 10. Multi-Tenant Validation Checklist

### 10.1 Isolamento de Dados

**Validações Obrigatórias:**

- [ ] Todas as queries Sequelize incluem `where: { companyId }`
- [ ] Constraint UNIQUE composto em `(number, companyId)` previne duplicatas entre companies
- [ ] Migrations respeitam isolamento: não alteram dados de outras companies
- [ ] Testes validam que contatos de company 1 não aparecem em queries de company 2

**Exemplo de Query Correta:**
```typescript
// backend/src/services/ContactServices/ListContactsService.ts

const { count, rows: contacts } = await Contact.findAndCountAll({
  where: {
    ...whereCondition,
    companyId // SEMPRE incluir companyId
  },
  // ...
});
```

**Exemplo de Query INCORRETA (Vazamento):**
```typescript
// ❌ NÃO FAZER: Query sem filtro de companyId
const contacts = await Contact.findAll({
  where: {
    source: 'manual' // Falta companyId
  }
});
```

---

### 10.2 Índices Multi-Tenant

**Índices Criados:**

1. **Constraint UNIQUE Composto:**
   ```sql
   CREATE UNIQUE INDEX idx_contacts_number_company
   ON "Contacts" (number, "companyId")
   WHERE number IS NOT NULL;
   ```

2. **Índice de Performance:**
   ```sql
   CREATE INDEX idx_contacts_company_source
   ON "Contacts" ("companyId", source);
   ```

3. **Índice de Filtro Agenda:**
   ```sql
   CREATE INDEX idx_contacts_company_agenda
   ON "Contacts" ("companyId", "isInAgenda")
   WHERE "isInAgenda" = true;
   ```

---

### 10.3 Middleware de Autenticação

**Validações:**

- [ ] Middleware `isAuth` popula `req.user.companyId` corretamente
- [ ] Controller extrai `companyId` de `req.user` (não de query params ou body)
- [ ] Validar que usuário não pode modificar `companyId` via API

**Implementação:**
```typescript
// backend/src/middleware/isAuth.ts

export const isAuth = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const decoded = jwt.verify(token, process.env.JWT_SECRET);

  const user = await User.findByPk(decoded.userId);
  if (!user) {
    throw new AppError('ERR_USER_NOT_FOUND', 404);
  }

  req.user = {
    id: user.id,
    companyId: user.companyId, // SEMPRE do banco de dados
    profile: user.profile,
    canViewAllContacts: user.profile === 'admin'
  };

  next();
};
```

---

### 10.4 Socket.IO Namespaces

**Validações:**

- [ ] Socket.IO usa namespace por company: `io.of(String(companyId))`
- [ ] Eventos emitidos incluem `companyId` no nome: `company-${companyId}-contact`
- [ ] Frontend escuta apenas eventos da company do usuário logado

**Implementação:**
```typescript
// backend/src/controllers/ContactController.ts

export const store = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;
  const contact = await CreateContactService({ ...req.body, companyId });

  // Socket.io com namespace isolado
  const io = getIO();
  io.of(String(companyId)) // Namespace por company
    .emit(`company-${companyId}-contact`, {
      action: "create",
      contact
    });

  return res.status(200).json(contact);
};
```

---

### 10.5 Testes de Isolamento

**Cenários de Teste:**

1. **Teste: Cross-Company Isolation**
   ```typescript
   it('should not return contacts from other companies', async () => {
     // Criar contato na company 1
     const contact1 = await factory.create('Contact', { companyId: 1, number: '+5511999999999' });

     // Criar contato na company 2 com mesmo número
     const contact2 = await factory.create('Contact', { companyId: 2, number: '+5511999999999' });

     // Listar contatos da company 1
     const response = await request(app)
       .get('/contacts/')
       .set('Authorization', `Bearer ${tokenCompany1}`)
       .expect(200);

     expect(response.body.contacts).toHaveLength(1);
     expect(response.body.contacts[0].id).toBe(contact1.id);
   });
   ```

2. **Teste: Unique Constraint per Company**
   ```typescript
   it('should allow same number in different companies', async () => {
     // Criar contato na company 1
     const contact1 = await CreateContactService({
       name: 'João',
       number: '+5511999999999',
       source: 'manual',
       companyId: 1
     });
     expect(contact1).toBeDefined();

     // Criar contato na company 2 com mesmo número - deve funcionar
     const contact2 = await CreateContactService({
       name: 'Maria',
       number: '+5511999999999',
       source: 'manual',
       companyId: 2
     });
     expect(contact2).toBeDefined();
     expect(contact2.id).not.toBe(contact1.id);
   });
   ```

3. **Teste: Socket.IO Namespace Isolation**
   ```typescript
   it('should not emit events to other companies', async () => {
     const socketCompany1 = io.connect(`http://localhost:3000/1`, { auth: { token: tokenCompany1 } });
     const socketCompany2 = io.connect(`http://localhost:3000/2`, { auth: { token: tokenCompany2 } });

     let eventsReceived = 0;
     socketCompany2.on('company-2-contact', () => { eventsReceived++; });

     // Criar contato na company 1
     await CreateContactService({
       name: 'João',
       number: '+5511999999999',
       source: 'manual',
       companyId: 1
     });

     await delay(100); // Aguardar propagação Socket.io

     // Company 2 não deve ter recebido evento
     expect(eventsReceived).toBe(0);
   });
   ```

---

## Conclusão

Este documento especifica completamente:
- ✅ Modelo canônico Contact com campos `source` e `isInAgenda`
- ✅ Hook de normalização E.164 com libphonenumber-js
- ✅ Regras de negócio controladas por feature flag `FEATURE_CONTACTS_FIX`
- ✅ Endpoints novos (`/contacts/import/chats`) e modificados (`/contacts/`, `/contacts/import`)
- ✅ Schemas de validação Zod
- ✅ Migrations seguras com backup e rollback
- ✅ Plano de commits granulares (10 commits)
- ✅ Logs Pino estruturados
- ✅ Critérios de aceite para cada commit
- ✅ Observabilidade com métricas Prometheus
- ✅ Multi-tenant validation checklist completa

**Próximos Passos:**
1. Implementar commits 1-8 (desenvolvimento)
2. Deploy em staging com `FEATURE_CONTACTS_FIX=false`
3. Habilitar flag em staging e testar por 48h
4. Executar migrations 2-3 em staging
5. Deploy em produção após validação

---

**planner-backend=done**
