# Contacts API Documentation

## Visão Geral

API para gerenciamento de contatos no ChatIA Flow com suporte a:
- Normalização E.164 de números de telefone
- Rastreamento de origem (source)
- Filtro de contatos da agenda (isInAgenda)
- Importação de múltiplas fontes (WhatsApp roster, chats, Excel)

## Endpoints

### 1. Listar Contatos

**GET** `/contacts`

Retorna lista paginada de contatos com filtros avançados.

#### Query Parameters

| Parâmetro | Tipo | Obrigatório | Descrição |
|-----------|------|-------------|-----------|
| `searchParam` | string | Não | Busca por nome ou número |
| `pageNumber` | string | Não | Número da página (default: 1) |
| `contactTag` | string | Não | JSON array de tag IDs |
| `isGroup` | string | Não | "true" ou "false" |
| `source` | enum | Não | Filtrar por origem: `manual`, `whatsapp_roster`, `excel_import`, `auto_created`, `chat_import` |
| `onlyAgenda` | string | Não | "true" para mostrar apenas contatos da agenda |

#### Response Headers

- `X-Total-Count-Filtered`: Total de contatos após filtros
- `X-Total-Count-All`: Total de contatos na company (sem filtros)

#### Response Body

```json
{
  "contacts": [
    {
      "id": 1,
      "name": "João Silva",
      "number": "+5511999999999",
      "email": "joao@example.com",
      "isGroup": false,
      "urlPicture": "https://...",
      "active": true,
      "companyId": 1,
      "channel": "whatsapp",
      "source": "manual",
      "isInAgenda": true,
      "tags": [
        { "id": 1, "name": "VIP" }
      ]
    }
  ],
  "count": 100,
  "hasMore": true
}
```

#### Exemplos

```bash
# Listar todos os contatos
curl -X GET "http://localhost:8080/contacts" \
  -H "Authorization: Bearer {token}"

# Buscar por nome ou número
curl -X GET "http://localhost:8080/contacts?searchParam=João" \
  -H "Authorization: Bearer {token}"

# Filtrar apenas contatos da agenda
curl -X GET "http://localhost:8080/contacts?onlyAgenda=true" \
  -H "Authorization: Bearer {token}"

# Filtrar por origem (whatsapp_roster)
curl -X GET "http://localhost:8080/contacts?source=whatsapp_roster" \
  -H "Authorization: Bearer {token}"

# Combinar filtros
curl -X GET "http://localhost:8080/contacts?onlyAgenda=true&source=manual&pageNumber=2" \
  -H "Authorization: Bearer {token}"
```

---

### 2. Criar Contato

**POST** `/contacts`

Cria novo contato com normalização automática de número.

#### Request Body

```json
{
  "name": "Maria Santos",
  "number": "11 99999-8888",
  "email": "maria@example.com",
  "channel": "whatsapp",
  "source": "manual",
  "isInAgenda": true,
  "disableBot": false,
  "acceptAudioMessage": true
}
```

#### Validações

- `name`: Obrigatório, mínimo 1 caractere
- `number`: Obrigatório, será normalizado para E.164 (ex: `+5511999998888`)
- `email`: Opcional, formato de email válido
- `source`: Default `manual`
- `isInAgenda`: Default `true`

#### Response

```json
{
  "id": 2,
  "name": "Maria Santos",
  "number": "+5511999998888",
  "email": "maria@example.com",
  "source": "manual",
  "isInAgenda": true,
  "companyId": 1,
  "createdAt": "2025-10-14T10:00:00.000Z"
}
```

#### Erros

- `400`: Número inválido (não passou normalização E.164)
- `409`: Contato duplicado (número já existe para essa company)

---

### 3. Importar Contatos do WhatsApp Roster

**POST** `/contacts/import`

Importa contatos da agenda do telefone conectado ao WhatsApp.

#### Request Body

```json
{
  "whatsappId": 1,
  "filterGroups": true,
  "onlyAgenda": true
}
```

#### Parâmetros

- `whatsappId`: ID da conexão WhatsApp (opcional, usa default se não informado)
- `filterGroups`: `true` para ignorar grupos (default: `true`)
- `onlyAgenda`: `true` para marcar contatos como `isInAgenda=true` (default: `true`)

#### Response

```json
{
  "message": "Contacts imported successfully"
}
```

#### Comportamento

- Contatos importados terão `source: "whatsapp_roster"`
- Contatos duplicados (mesmo número) serão atualizados com novo nome
- Logs estruturados registram sucesso/falha de cada contato

---

### 4. Importar Contatos de Chats Recentes

**POST** `/contacts/import/chats`

Importa contatos de conversas ativas nas últimas X horas e marca como `isInAgenda=true`.

#### Request Body

```json
{
  "whatsappId": 1,
  "hours": 24
}
```

#### Parâmetros

- `whatsappId`: ID da conexão WhatsApp (obrigatório)
- `hours`: Janela de tempo para buscar chats (default: 24h, máximo: 168h)

#### Response

```json
{
  "message": "15 contatos importados de chats recentes",
  "imported": 15,
  "skipped": 3
}
```

#### Comportamento

- Busca mensagens das últimas X horas
- Atualiza apenas contatos com `isInAgenda=false` para `true`
- Atualiza `source` para `chat_import`
- Ignora grupos

---

### 5. Importar Contatos de Excel/CSV

**POST** `/contactsImport`

Importa contato individual de planilha Excel/CSV.

#### Request Body

```json
{
  "number": "11 99999-7777",
  "name": "Pedro Costa",
  "email": "pedro@example.com",
  "validateContact": "true",
  "tags": "VIP,Cliente"
}
```

#### Parâmetros

- `validateContact`: "true" para validar número no WhatsApp antes de importar
- `tags`: String separada por vírgulas de nomes de tags

#### Response

```json
{
  "id": 3,
  "name": "Pedro Costa",
  "number": "+5511999997777",
  "source": "excel_import",
  "tags": [
    { "id": 1, "name": "VIP" },
    { "id": 2, "name": "Cliente" }
  ]
}
```

---

### 6. Atualizar Contato

**PUT** `/contacts/:contactId`

Atualiza dados de contato existente.

#### Request Body

```json
{
  "name": "João Silva Jr.",
  "number": "11 99999-9999",
  "email": "joao.jr@example.com",
  "active": true
}
```

#### Validações

- Se `number` for alterado e `channel=whatsapp`, valida no WhatsApp
- Número será normalizado para E.164

---

### 7. Deletar Contato

**DELETE** `/contacts/:contactId`

Remove contato da base de dados.

#### Response

```json
{
  "message": "Contact deleted"
}
```

#### Comportamento

- Emite evento Socket.IO `company-{companyId}-contact` com `action: "delete"`
- Tickets relacionados não são deletados (apenas órfãos)

---

### 8. Deleção em Massa

**DELETE** `/contacts/batch-delete`

Remove múltiplos contatos de uma vez.

#### Request Body

```json
{
  "contactIds": [1, 2, 3, 4, 5]
}
```

#### Response

```json
{
  "message": "5 contatos deletados com sucesso."
}
```

---

## Feature Flags

Todos os endpoints respeitam as seguintes feature flags no `.env`:

| Flag | Descrição |
|------|-----------|
| `FEATURE_CONTACTS_FIX` | Habilita toda a feature de correção de "Números Fantasma" |
| `FEATURE_CONTACTS_NORMALIZE_E164` | Ativa hook de normalização E.164 no modelo Contact |
| `FEATURE_CONTACTS_SOURCE_FIELD` | Permite filtrar por campo `source` na API |
| `FEATURE_CONTACTS_ONLY_AGENDA_FILTER` | Ativa filtro `onlyAgenda` no endpoint GET /contacts |

### Exemplo de Configuração

```bash
# .env
FEATURE_CONTACTS_FIX=true
FEATURE_CONTACTS_NORMALIZE_E164=true
FEATURE_CONTACTS_SOURCE_FIELD=true
FEATURE_CONTACTS_ONLY_AGENDA_FILTER=true
```

---

## Socket.IO Events

Todos os eventos de contatos são emitidos no namespace `company-{companyId}`:

### Evento: `company-{companyId}-contact`

```javascript
{
  action: "create" | "update" | "delete" | "reload",
  contact: { /* objeto Contact */ },
  contactId: number // (apenas para action: "delete")
}
```

#### Exemplos

```javascript
// Frontend: Escutar eventos
socket.on(`company-${companyId}-contact`, (data) => {
  if (data.action === "create") {
    console.log("Novo contato:", data.contact);
  } else if (data.action === "delete") {
    console.log("Contato deletado:", data.contactId);
  }
});
```

---

## Modelo de Dados

### Contact

```typescript
{
  id: number;
  name: string;
  number: string; // E.164 normalizado: +5511999999999
  email: string;
  profilePicUrl: string;
  isGroup: boolean;
  disableBot: boolean;
  acceptAudioMessage: boolean;
  active: boolean;
  channel: "whatsapp" | "instagram" | "facebook";
  source: "manual" | "whatsapp_roster" | "excel_import" | "auto_created" | "chat_import";
  isInAgenda: boolean;
  companyId: number;
  whatsappId: number;
  remoteJid: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### Source Values

| Valor | Descrição |
|-------|-----------|
| `manual` | Criado manualmente via UI ou API |
| `whatsapp_roster` | Importado da agenda do telefone (roster) |
| `excel_import` | Importado de planilha Excel/CSV |
| `auto_created` | Criado automaticamente ao receber mensagem de número desconhecido |
| `chat_import` | Importado de chats ativos recentes |

---

## Normalização E.164

Todos os números de telefone são normalizados para o formato E.164:

### Formato E.164

- Começa com `+`
- Código de país (2-3 dígitos)
- Código de área (2 dígitos)
- Número (8-9 dígitos)
- **Exemplo:** `+5511999999999`

### Regras de Normalização

1. Remove espaços, hífens, parênteses
2. Adiciona `+` se não existir
3. Adiciona código de país `+55` se número BR sem código
4. Valida com `libphonenumber-js`
5. Rejeita números inválidos com erro `ERR_INVALID_PHONE_NUMBER`

### Exemplos

| Entrada | Saída |
|---------|-------|
| `(11) 99999-9999` | `+5511999999999` |
| `11 99999 9999` | `+5511999999999` |
| `5511999999999` | `+5511999999999` |
| `+55 11 99999-9999` | `+5511999999999` |

---

## Erros Comuns

### ERR_INVALID_PHONE_NUMBER

**Status:** 400

**Causa:** Número não passou validação E.164

**Solução:** Verificar formato do número. Deve ter 10-15 dígitos.

### ERR_DUPLICATED_CONTACT

**Status:** 409

**Causa:** Já existe contato com esse número para essa company

**Solução:** Usar endpoint de atualização ou deletar contato duplicado

### ERR_CONTACT_NUMBER_REQUIRED

**Status:** 400

**Causa:** Número vazio ou null

**Solução:** Fornecer número válido

---

## Testes

### Executar Testes Unitários

```bash
cd backend
npm test -- normalizePhoneNumber
```

### Cobertura de Testes

- ✅ Normalização de números BR (11 variações)
- ✅ Normalização de números internacionais (US, UK, AR)
- ✅ Edge cases (null, vazio, inválido)
- ✅ Detecção de duplicatas lógicas
- ✅ Performance (1000 normalizações < 1s)

---

## Migrations

### 20251014100000-add-source-isInAgenda-to-contacts.ts

Adiciona campos `source` e `isInAgenda` à tabela Contacts.

```bash
npm run db:migrate
```

### 20251014110000-normalize-existing-contacts.ts

Normaliza números existentes para E.164 com backup automático.

**⚠️ IMPORTANTE:** Valida duplicatas antes de aplicar.

```bash
npm run db:migrate
```

### 20251014120000-add-unique-constraint-contacts.ts

Adiciona constraint UNIQUE composto (number, companyId) com índice CONCURRENTLY.

```bash
npm run db:migrate
```

### Rollback

```bash
npm run db:migrate:undo
```

---

## Changelog

### v2.2.2v-26 (2025-10-14)

#### Added
- ✅ Campo `source` (enum) para rastrear origem de contatos
- ✅ Campo `isInAgenda` (boolean) para filtrar contatos da agenda
- ✅ Hook de normalização E.164 com libphonenumber-js
- ✅ Validator Zod para entrada de dados
- ✅ Filtro `onlyAgenda` em GET /contacts
- ✅ Filtro `source` em GET /contacts
- ✅ Endpoint POST /contacts/import/chats
- ✅ Headers `X-Total-Count-Filtered` e `X-Total-Count-All`
- ✅ Feature flags para rollout gradual
- ✅ Logs estruturados com Pino
- ✅ Testes unitários para normalização E.164
- ✅ Migration de normalização de números existentes
- ✅ Migration de constraint UNIQUE composto

#### Changed
- ⚠️ GET /contacts agora retorna `source` e `isInAgenda`
- ⚠️ POST /contacts agora valida E.164 (pode rejeitar números)
- ⚠️ ImportContactsService agora aceita objeto com opções

#### Fixed
- 🐛 Duplicatas lógicas de números em formatos diferentes
- 🐛 Contatos "fantasma" de importações indiscriminadas
- 🐛 Falta de rastreamento de origem de contatos

---

## Suporte

Para dúvidas ou problemas:
- **Logs:** Verifique logs estruturados com `companyId` e `userId`
- **Sentry:** Erros são automaticamente reportados
- **Feature Flags:** Desabilite flags se houver problemas

---

**Gerado em:** 2025-10-14
**Versão:** v2.2.2v-26
