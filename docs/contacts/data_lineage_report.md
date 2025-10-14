# Data Lineage Report: Números Fantasma em /contacts

**Data:** 2025-10-14
**Analista:** Claude Data Analyst
**Baseado em:** docs/contacts/architecture_probe.md

---

## 1. Resumo Executivo

### Arquivos Analisados
- **Backend:** 22 arquivos TS (Services, Controllers, Models, Migrations)
- **Frontend:** 2 arquivos JS (Pages)
- **Total de linhas analisadas:** ~4.500 linhas de código

### Evidências Principais
- **H1 (Normalização Inconsistente):** ✅ **CONFIRMADA** - 5 pontos de entrada com normalizações diferentes, nenhum valida E.164
- **H2 (Vazamento RBAC):** ✅ **PARCIALMENTE CONFIRMADA** - Filtro por userId implementado, mas sem validação de canViewAllContacts em todas as rotas
- **H3 (Socket.io Cache Stale):** ✅ **CONFIRMADA** - Reducer `UPDATE_CONTACTS` adiciona contatos sem validar filtros ativos (linha 91 de index.js)
- **H4 (Importações Indiscriminadas):** ✅ **CONFIRMADA** - Importação WhatsApp roster traz todos os contatos sem consentimento, não há campo `source`

---

## 2. Análise por Hipótese

### H1: Normalização Inconsistente

#### Evidências Encontradas:

**1. Arquivo:** `/backend/src/models/Contact.ts:38-40`
```typescript
@AllowNull(false)
@Unique
@Column
number: string;
```
**Problema:** Constraint `@Unique` no modelo, mas **sem hook de normalização**. O constraint só previne duplicatas exatas, não duplicatas lógicas como `+5511999999999` vs `5511999999999`.

**2. Arquivo:** `/backend/src/services/ContactServices/CreateOrUpdateContactService.ts:81`
```typescript
const number = isGroup ? rawNumber : rawNumber.replace(/[^0-9]/g, "");
```
**Problema:** Remove apenas caracteres não-numéricos, **não adiciona prefixo +**, não valida E.164, não adiciona código de país se ausente.

**3. Arquivo:** `/backend/src/services/ContactServices/ImportContactsService.ts:34`
```typescript
number = `${number}`.replace(/\D/g, "");
```
**Problema:** Excel import usa mesma lógica frágil - remove formatação mas não normaliza para E.164.

**4. Arquivo:** `/backend/src/services/WbotServices/ImportContactsService.ts:54`
```typescript
const number = id.replace(/\D/g, "");
```
**Problema:** WhatsApp roster import também apenas remove não-dígitos. Um número como `+55 (11) 99999-9999` do Excel vira `5511999999999`, enquanto o mesmo número do WhatsApp (sem formatação) pode vir como `5511999999999` ou `11999999999` dependendo da origem.

**5. Arquivo:** `/backend/src/controllers/ContactController.ts:187-195`
```typescript
const findContact = await Contact.findOne({
  where: {
    number: newContact.number.replace("-", "").replace(" ", ""),
    companyId
  }
})
if (findContact) {
  throw new AppError("ERR_DUPLICATED_CONTACT", 409);
}

newContact.number = newContact.number.replace("-", "").replace(" ", "");
```
**Problema:** Normalização parcial - apenas remove hífen e espaço, não valida formato completo. Se o usuário enviar `(11) 99999-9999`, ficará como `(11)999999999` no banco.

**6. Arquivo:** `/backend/src/services/ContactServices/UpsertContactFromBaileysService.ts:4`
```typescript
function extractNumberFromJid(jid: string): string {
  try { return jid.split("@")[0].split(":")[0].replace(/\D/g, ""); } catch { return ""; }
}
```
**Problema:** Extrai número do JID Baileys (ex: `5511999999999@s.whatsapp.net`), mas remove TODOS os não-dígitos, incluindo o `+` se presente.

#### Padrões de Normalização Detectados:

| Arquivo | Linha | Padrão | Problema |
|---------|-------|--------|----------|
| CreateOrUpdateContactService.ts | 81 | `rawNumber.replace(/[^0-9]/g, "")` | Remove formatação, mas não valida E.164 nem adiciona prefixo + |
| ImportContactsService.ts (Excel) | 34 | `${number}.replace(/\D/g, "")` | Mesma lógica frágil, perde código de país se vier com + |
| ImportContactsService.ts (Wbot) | 54 | `id.replace(/\D/g, "")` | Remove +, não diferencia código de país de DDD |
| ContactController.ts | 195 | `number.replace("-", "").replace(" ", "")` | Normalização parcial, deixa parênteses e outros chars |
| UpsertContactFromBaileysService.ts | 4 | `jid.split("@")[0].split(":")[0].replace(/\D/g, "")` | Remove LID/JID suffix, mas perde prefixo + |

**Total de pontos de entrada:** 5
**Pontos com validação E.164:** 0

#### Comparação com Frontend:

**Arquivo:** `/frontend/src/utils/formatPhoneWithCountryFlag.js:1-216`
- **Usa `libphonenumber-js`** para parsing E.164 completo (linhas 117-123)
- **MAS:** Apenas para **exibição** (formatação com bandeira de país)
- **NÃO é usada** para normalização antes de salvar no backend

```javascript
// Exemplo de uso CORRETO no frontend (apenas display):
if (!isValidPhoneNumber(cleanNumber)) {
  return phoneNumber; // Retorna sem formatar
}
const parsed = parsePhoneNumber(cleanNumber);
let formattedNumber = parsed.formatInternational(); // +55 11 99999-9999
```

**Problema:** A lógica de normalização E.164 existe no frontend, mas **não é replicada no backend**.

#### Queries SQL Propostas:

```sql
-- Query 1: Detectar duplicatas lógicas
SELECT
  REGEXP_REPLACE(number, '\D', '', 'g') as normalized_number,
  COUNT(*) as occurrences,
  ARRAY_AGG(id) as contact_ids,
  ARRAY_AGG(number) as raw_numbers,
  ARRAY_AGG(name) as contact_names
FROM contacts
WHERE "companyId" = :companyId
GROUP BY normalized_number
HAVING COUNT(*) > 1
ORDER BY occurrences DESC;

-- Query 2: Detectar números sem código de país (suspeitos)
SELECT id, number, name, "companyId", channel, "whatsappId", "createdAt"
FROM contacts
WHERE "companyId" = :companyId
  AND LENGTH(REGEXP_REPLACE(number, '\D', '', 'g')) < 12 -- E.164 BR = 13 dígitos (55 + 11 + 9 + 8)
ORDER BY "createdAt" DESC;

-- Query 3: Detectar números com formatação não normalizada
SELECT id, number, name, "companyId", channel
FROM contacts
WHERE "companyId" = :companyId
  AND number ~ '[^0-9+]'; -- Contém caracteres além de dígitos e +

-- Query 4: Analisar variações do mesmo número
-- Exemplo: buscar todas as variações de 11999999999
SELECT id, number, name, channel, "createdAt"
FROM contacts
WHERE "companyId" = :companyId
  AND REGEXP_REPLACE(number, '\D', '', 'g') = '5511999999999'
ORDER BY "createdAt" ASC;
```

**Resultado Esperado (em Produção):**
- **Query 1:** Se H1 for verdadeira, retornará múltiplas linhas com `occurrences > 1`, indicando que o mesmo número (normalizado) aparece com diferentes formatações
- **Query 2:** Retornará números com menos de 12 dígitos, indicando falta de código de país
- **Query 3:** Retornará números com parênteses, hífens, espaços
- **Query 4:** Deve retornar 1 linha se normalização funciona, ou múltiplas se há duplicatas

**Severidade:** 🔴 **CRÍTICA**

**Justificativa:**
- **Impacto:** Fragmentação de identidade do contato - tickets, mensagens e histórico ficam espalhados em múltiplos registros
- **Probabilidade:** Alta - existem 5 pontos de entrada com lógicas diferentes
- **Remediação:** Adicionar hook `@BeforeCreate`/`@BeforeUpdate` no modelo Contact.ts + migration de correção

---

### H2: LEFT JOIN/UNION Vazamento RBAC

#### Evidências Encontradas:

**1. Arquivo:** `/backend/src/services/ContactServices/ListContactsService.ts:44-60`
```typescript
// <<-- ALTERAÇÃO 3: Lógica principal de restrição de contatos
// Se o perfil do usuário não for 'admin', aplicamos o filtro.
if (!(profile === "admin" || canViewAllContacts)) {
  // 1. Busca todos os 'contactId' da tabela de Tickets que pertencem ao 'userId' atual.
  const userTickets = await Ticket.findAll({
    where: { userId },
    attributes: ["contactId"], // Seleciona apenas a coluna 'contactId' para otimização
    group: ["contactId"]       // Agrupa para obter IDs de contato únicos
  });

  // 2. Mapeia o resultado para um array de números (IDs dos contatos)
  const contactIds = userTickets.map(t => t.contactId);

  // 3. Adiciona a condição à query: o ID do contato DEVE estar na lista de IDs que o usuário atendeu.
  // Se o usuário não atendeu nenhum ticket, a lista 'contactIds' será vazia e nenhum contato será retornado.
  whereCondition.id = {
    [Op.in]: contactIds
  };
}
```

**Análise:**
- ✅ **LÓGICA CORRETA:** A query filtra tickets por `userId` antes de extrair `contactId`
- ✅ **ISOLAMENTO POR COMPANY:** A query posteriormente adiciona `whereCondition.companyId` (linha 79-82)
- ⚠️ **PROBLEMA POTENCIAL 1:** Se `contactIds` for vazio (usuário sem tickets), retorna array vazio - correto
- ⚠️ **PROBLEMA POTENCIAL 2:** Não valida se `req.user.canViewAllContacts` foi corretamente populado

**2. Arquivo:** `/backend/src/controllers/ContactController.ts:132-156`
```typescript
export const index = async (req: Request, res: Response): Promise<Response> => {
  const { searchParam, pageNumber, contactTag: tagIdsStringified, isGroup } = req.query as IndexQuery;
  // <<-- ALTERAÇÃO 1: Adicionado 'profile' para obter o perfil do usuário
  const { id: userId, companyId, profile } = req.user;

  console.log("index", { companyId, userId, searchParam, profile });

  let tagsIds: number[] = [];

  if (tagIdsStringified) {
    tagsIds = JSON.parse(tagIdsStringified);
  }

  const { contacts, count, hasMore } = await ListContactsService({
    searchParam,
    pageNumber,
    companyId,
    tagsIds,
    isGroup,
    userId: Number(userId),
    profile,
    canViewAllContacts: !!(req as any).user?.canViewAllContacts // <-- CAST PERIGOSO
  });

  return res.json({ contacts, count, hasMore });
};
```

**Análise:**
- ✅ **EXTRAÇÃO CORRETA:** Usa `req.user` populado pelo middleware `isAuth`
- ⚠️ **PROBLEMA:** Cast `(req as any).user?.canViewAllContacts` sugere que o tipo não está correto
- ⚠️ **NÃO VALIDADO:** Não verifica se `req.user` foi corretamente populado pelo middleware

**3. Arquivo:** `/backend/src/models/Contact.ts:38-40`
```typescript
@AllowNull(false)
@Unique
@Column
number: string;
```

**Análise:**
- ❌ **CONSTRAINT ÚNICO SIMPLES:** O `@Unique` é apenas no campo `number`, não em `(number, companyId)`
- ⚠️ **PROBLEMA:** Teoricamente, o mesmo número não pode existir em companies diferentes devido a esse constraint
- ✅ **MIGRATION CORREÇÃO:** O arquivo `/backend/src/database/migrations/20230708192530-add-unique-constraint-to-Contacts-table.ts` adiciona constraint composto:

```typescript
// Migration que CORRIGE o problema:
return queryInterface.addConstraint("Contacts", ["number", "companyId"], {
  type: "unique",
  name: "number_companyid_unique"
});
```

**Conclusão:** A constraint UNIQUE composta **foi adicionada via migration**, então o `@Unique` no modelo é redundante/incorreto. A validação real está no banco de dados.

#### Queries SQL Propostas:

```sql
-- Query 1: Verificar se há tickets com contactId de outras companies (VIOLAÇÃO GRAVE)
SELECT
  t.id as ticket_id,
  t."userId",
  t."contactId",
  t."companyId" as ticket_company,
  c."companyId" as contact_company,
  c.name,
  c.number
FROM tickets t
JOIN contacts c ON t."contactId" = c.id
WHERE t."companyId" != c."companyId";

-- Query 2: Verificar constraint UNIQUE composto
SELECT
  conname,
  contype,
  pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conrelid = 'contacts'::regclass
  AND conname LIKE '%number%';

-- Query 3: Testar isolamento de contatos por userId
-- Simula o que ListContactsService faz
WITH user_contact_ids AS (
  SELECT DISTINCT "contactId"
  FROM tickets
  WHERE "userId" = :userId
)
SELECT c.id, c.name, c.number, c."companyId"
FROM contacts c
WHERE c.id IN (SELECT "contactId" FROM user_contact_ids)
  AND c."companyId" = :companyId
ORDER BY c.name ASC;

-- Query 4: Verificar contatos visíveis para user não-admin sem tickets próprios
SELECT
  c.id,
  c.name,
  c.number,
  c."companyId",
  COUNT(t.id) FILTER (WHERE t."userId" = :userId) as my_ticket_count,
  COUNT(t.id) as total_ticket_count
FROM contacts c
LEFT JOIN tickets t ON c.id = t."contactId"
WHERE c."companyId" = :companyId
GROUP BY c.id
HAVING COUNT(t.id) FILTER (WHERE t."userId" = :userId) = 0 -- Sem tickets do user
ORDER BY c.name ASC
LIMIT 10;
```

**Resultado Esperado (em Produção):**
- **Query 1:** Deve retornar **0 linhas** (se não há violação de integridade)
- **Query 2:** Deve mostrar constraint `number_companyid_unique` do tipo UNIQUE em `(number, companyId)`
- **Query 3:** Deve retornar apenas contatos de tickets do `userId` especificado
- **Query 4:** Se retornar linhas, indica contatos visíveis sem tickets do usuário (possível vazamento)

**Severidade:** 🟠 **ALTA** (reduzida de CRÍTICA após análise)

**Justificativa:**
- **Lógica de filtro está correta** no código atual
- **Risco principal:** Middleware `isAuth` não popular `canViewAllContacts` corretamente
- **Risco secundário:** Cast `(req as any).user` pode ocultar erros de tipo
- **Remediação:** Adicionar validação explícita de `req.user` no controller + testes de integração RBAC

---

### H3: Cache Stale Socket.io

#### Evidências Encontradas:

**1. Arquivo:** `/frontend/src/pages/Contacts/index.js:66-108` (reducer)
```javascript
const reducer = (state, action) => {
  if (action.type === "LOAD_CONTACTS") {
    const contacts = action.payload;
    const newContacts = [];

    contacts.forEach((contact) => {
      const contactIndex = state.findIndex((c) => c.id === contact.id);
      if (contactIndex !== -1) {
        state[contactIndex] = contact;
      } else {
        newContacts.push(contact);
      }
    });

    return [...state, ...newContacts];
  }

  if (action.type === "UPDATE_CONTACTS") {
    const contact = action.payload;
    const contactIndex = state.findIndex((c) => c.id === contact.id);

    if (contactIndex !== -1) {
      state[contactIndex] = contact;
      return [...state];
    } else {
      return [contact, ...state]; // ❌ PROBLEMA: ADICIONA contato sem validar filtros
    }
  }

  if (action.type === "DELETE_CONTACT") {
    const contactId = action.payload;

    const contactIndex = state.findIndex((c) => c.id === contactId);
    if (contactIndex !== -1) {
      state.splice(contactIndex, 1);
    }
    return [...state];
  }

  if (action.type === "RESET") {
    return [];
  }
};
```

**Problema Crítico (linha 91):**
```javascript
} else {
  return [contact, ...state]; // ADICIONA contato que não estava na lista
}
```

**Análise:**
- ❌ **NÃO VALIDA FILTROS:** Se o reducer receber um evento `UPDATE_CONTACTS` de um contato que não passou pelos filtros ativos (searchParam, tags), ele será **adicionado à lista** mesmo assim
- ❌ **CASO DE USO PROBLEMÁTICO:**
  1. User filtra contatos por tag "VIP"
  2. Outro user da mesma company cria contato sem tag "VIP"
  3. Socket.io emite `company-${companyId}-contact` com `action: "create"`
  4. Reducer recebe e adiciona contato à lista (linha 91)
  5. User vê contato sem tag "VIP" na lista filtrada

**2. Arquivo:** `/frontend/src/pages/Contacts/index.js:220-244` (Socket.io listener)
```javascript
useEffect(() => {
  if (!socket || !socket.on) return;

  const companyId = user.companyId;
  const onContactEvent = (data) => {
    if (data.action === "update" || data.action === "create") {
      dispatch({ type: "UPDATE_CONTACTS", payload: data.contact });
    }

    if (data.action === "delete") {
      dispatch({ type: "DELETE_CONTACT", payload: +data.contactId });
      setSelectedContactIds((prevSelected) =>
        prevSelected.filter((id) => id !== +data.contactId)
      );
    }
  };
  socket.on(`company-${companyId}-contact`, onContactEvent);

  return () => {
    if (socket && socket.off) {
      socket.off(`company-${companyId}-contact`, onContactEvent);
    }
  };
}, [socket]);
```

**Análise:**
- ✅ **CLEANUP CORRETO:** O `return` do useEffect remove o listener ao desmontar (linha 239-243)
- ✅ **NAMESPACE CORRETO:** Usa `company-${companyId}-contact` - isolamento por company
- ⚠️ **DEPENDÊNCIA:** O useEffect depende apenas de `[socket]`, não de `user.companyId`
  - **Risco:** Se `user.companyId` mudar (troca de company), o listener antigo não é removido

**3. Arquivo:** `/frontend/src/pages/Contacts/index.js:186-191` (Reset ao mudar filtros)
```javascript
useEffect(() => {
  dispatch({ type: "RESET" });
  setPageNumber(1);
  setSelectedContactIds([]);
  setIsSelectAllChecked(false);
}, [searchParam, selectedTags]);
```

**Análise:**
- ✅ **RESET CORRETO:** Limpa o estado ao mudar `searchParam` ou `selectedTags`
- ✅ **DEPENDÊNCIAS CORRETAS:** O useEffect reage a mudanças nos filtros
- ❌ **NÃO LIMPA LISTENER:** O listener Socket.io continua ativo e pode adicionar contatos que não passam pelos novos filtros

**4. Arquivo:** `/backend/src/controllers/ContactController.ts:123-127` (Emissão Socket.io)
```typescript
io.of(String(companyId))
  .emit(`company-${companyId}-contact`, {
    action: "create",
    contact
  });
```

**Análise:**
- ✅ **NAMESPACE CORRETO:** Usa `io.of(String(companyId))` - isolamento por company
- ✅ **EVENTO CORRETO:** Nome do evento inclui `companyId`
- ⚠️ **NÃO VALIDA FILTROS:** Emite para todos os usuários da company, não filtra por `searchParam` ou tags

#### Exemplos de "Números Fantasma" (Casos de Teste)

**Caso 1: Contato Fantasma por Filtro de Tags**

**Setup:**
1. User A filtra contatos por tag "VIP" (3 contatos na lista)
2. User B (mesma company) cria contato "João" sem tag "VIP"

**Estado Atual (H3 verdadeira):**
1. Backend emite `company-${companyId}-contact` com `action: "create", contact: { id: 999, name: "João", tags: [] }`
2. Frontend de User A recebe evento via Socket.io (linha 225)
3. Reducer executa `UPDATE_CONTACTS` (linha 83-93)
4. Contato "João" não existe no state, então cai no `else` (linha 91)
5. Reducer retorna `[contact, ...state]` - **adiciona João à lista**
6. User A vê 4 contatos, incluindo "João" sem tag "VIP"

**Estado Desejado (H3 falsa):**
1. Reducer valida se contato tem tag "VIP" antes de adicionar
2. Se não tiver, ignora o evento
3. User A continua vendo apenas 3 contatos com tag "VIP"

**Caso 2: Contato Fantasma por Busca (searchParam)**

**Setup:**
1. User A busca por "Maria" (1 contato na lista)
2. User B cria contato "João Silva"

**Estado Atual (H3 verdadeira):**
1. Reducer adiciona "João Silva" à lista (linha 91)
2. User A vê "João Silva" na lista de busca por "Maria"

**Estado Desejado (H3 falsa):**
1. Reducer valida se "João Silva" corresponde ao `searchParam` "Maria"
2. Se não corresponder, ignora o evento
3. User A continua vendo apenas "Maria"

#### Queries SQL Propostas:

```sql
-- Backend: Não aplicável - Socket.io opera em memória
-- Para validar, seria necessário:
-- 1. Habilitar logs do Socket.io: export DEBUG=socket.io:*
-- 2. Filtrar logs de eventos: grep "emitting packet" logs/socket.log

-- Query alternativa: Verificar volume de eventos Socket.io vs HTTP
-- (Requer instrumentação no código)
SELECT
  'socket_io_events' as source,
  COUNT(*) as event_count
FROM socket_io_logs
WHERE event_name = 'company-contact'
  AND "timestamp" > NOW() - INTERVAL '1 hour'
UNION ALL
SELECT
  'http_requests' as source,
  COUNT(*) as event_count
FROM http_logs
WHERE path = '/contacts/'
  AND "timestamp" > NOW() - INTERVAL '1 hour';
```

**Severidade:** 🔴 **CRÍTICA**

**Justificativa:**
- **Impacto:** UX confusa - contatos aparecem em listas filtradas onde não deveriam estar
- **Probabilidade:** Alta - comportamento atual do reducer
- **Remediação:** Refatorar reducer para validar filtros antes de adicionar contatos + adicionar testes E2E

---

### H4: Importações Indiscriminadas

#### Evidências Encontradas:

**1. Arquivo:** `/backend/src/services/WbotServices/ImportContactsService.ts:52-79`
```typescript
if (isArray(phoneContactsList)) {
  phoneContactsList.forEach(async ({ id, name, notify }) => {
    if (id === "status@broadcast" || id.includes("g.us")) return; // Ignora grupos
    const number = id.replace(/\D/g, "");

    const existingContact = await Contact.findOne({
      where: { number, companyId }
    });

    if (existingContact) {
      // Atualiza o nome do contato existente
      existingContact.name = name || notify;
      await existingContact.save();
    } else {
      // Criar um novo contato
      try {
        await CreateContactService({
          number,
          name: name || notify,
          companyId
        });
      } catch (error) {
        Sentry.captureException(error);
        logger.warn(
          `Could not get whatsapp contacts from phone. Err: ${error}`
        );
      }
    }
  });
}
```

**Análise:**
- ❌ **IMPORTA TODOS OS CONTATOS:** O loop processa **todos** os itens de `phoneContactsList` sem filtro
- ⚠️ **FILTRO PARCIAL:** Ignora `status@broadcast` e grupos (linha 53), mas não filtra outros casos:
  - Contatos de broadcasts individuais
  - Contatos de listas de transmissão
  - Números comerciais (ex: suporte de empresas)
- ❌ **SEM CONFIRMAÇÃO:** Não pede confirmação ao usuário sobre quais contatos importar
- ❌ **SEM CAMPO `source`:** Cria contatos via `CreateContactService`, mas não marca origem como `whatsapp_roster`

**2. Arquivo:** `/backend/src/controllers/ImportPhoneContactsController.ts:4-10`
```typescript
export const store = async (req: Request, res: Response): Promise<Response> => {
  const { companyId } = req.user;

  await ImportContactsService(companyId);

  return res.status(200).json({ message: "contacts imported" });
};
```

**Análise:**
- ❌ **NÃO RECEBE PARÂMETROS:** Não recebe `whatsappId` do body, usa default via `GetDefaultWhatsApp`
- ❌ **NÃO VALIDA AUTORIZAÇÃO:** Não verifica se usuário confirmou importação
- ⚠️ **RESPOSTA GENÉRICA:** Retorna apenas `{ message: "contacts imported" }` sem contagem

**3. Arquivo:** `/backend/src/services/ContactServices/ImportContactsService.ts:52-63` (Excel)
```typescript
for (const contact of contacts) {
  const [newContact, created] = await Contact.findOrCreate({
    where: {
      number: `${contact.number}`,
      companyId: contact.companyId
    },
    defaults: contact
  });
  if (created) {
    contactList.push(newContact);
  }
}
```

**Análise:**
- ✅ **USA `findOrCreate`:** Não cria duplicatas se número já existe
- ❌ **SEM CAMPO `source`:** Não marca origem como `excel_import`
- ❌ **SEM VALIDAÇÃO DE FORMATO:** Aceita qualquer formato de número (já tratado em H1)

**4. Arquivo:** `/backend/src/models/Contact.ts:67-69`
```typescript
@Default("whatsapp")
@Column
channel: string;
```

**Análise:**
- ✅ **CAMPO `channel` EXISTE:** Diferencia `whatsapp`, `instagram`, `facebook`
- ❌ **FALTA CAMPO `source`:** Não há campo para diferenciar:
  - `manual` (criado via UI)
  - `whatsapp_roster` (importado da agenda)
  - `excel_import` (importado de planilha)
  - `auto_created` (criado ao receber mensagem)
  - `chat_import` (importado de conversas ativas)

**5. Arquivo:** `/frontend/src/pages/Contacts/index.js:383-391`
```javascript
const handleimportChats = async () => {
  console.log("handleimportChats")
  try {
    await api.post("/contacts/import/chats"); // ❌ ENDPOINT NÃO EXISTE
    history.go(0);
  } catch (err) {
    toastError(err);
  }
};
```

**Análise:**
- ❌ **BUG:** Frontend chama endpoint `/contacts/import/chats` que **não existe** no backend
- ⚠️ **FUNCIONALIDADE INCOMPLETA:** UI tem opção para importar chats, mas não está implementada

#### Inventário de Fontes de Dados

**Backend - Pontos de Criação de Contatos**

| Arquivo | Linha | Método | Source Inferida | Validação E.164? | Marca `source`? |
|---------|-------|--------|-----------------|------------------|-----------------|
| CreateContactService.ts | 66 | `Contact.create()` | manual | ❌ | ❌ |
| CreateOrUpdateContactService.ts | 154/170 | `Contact.create()` | auto_created | ❌ | ❌ |
| ImportContactsService.ts (Excel) | 53 | `Contact.findOrCreate()` | excel_import | ❌ | ❌ |
| ImportContactsService.ts (Wbot) | 67 | `CreateContactService()` | whatsapp_roster | ❌ | ❌ |
| ContactController.ts (importXls) | 94 | `CreateOrUpdateContactServiceForImport()` | excel_import | ⚠️ (opcional) | ❌ |

**Total de pontos de entrada:** 5
**Pontos com validação E.164:** 0
**Pontos que marcam `source`:** 0

**Frontend - Pontos de Leitura/Atualização**

| Arquivo | Linha | Método | Cache? | Filtro por source? | Respeita filtros? |
|---------|-------|--------|--------|-------------------|-------------------|
| pages/Contacts/index.js | 198 | `api.get("/contacts/")` | React state | ❌ | ✅ |
| pages/Contacts/index.js | 225 | Socket.io `company-contact` | ❌ | ❌ | ❌ (linha 91) |
| pages/Contacts/index.js | 91 | reducer `UPDATE_CONTACTS` | ❌ | ❌ | ❌ |

#### Queries SQL Propostas:

```sql
-- Query 1: Contagem por canal e associação com WhatsApp
SELECT
  channel,
  COUNT(*) as total,
  COUNT(CASE WHEN "whatsappId" IS NOT NULL THEN 1 END) as with_whatsapp,
  COUNT(CASE WHEN "whatsappId" IS NULL THEN 1 END) as without_whatsapp
FROM contacts
WHERE "companyId" = :companyId
GROUP BY channel
ORDER BY total DESC;

-- Query 2: Contatos de grupos (não deveriam estar na agenda)
SELECT
  id,
  name,
  number,
  "isGroup",
  "remoteJid",
  channel,
  "createdAt"
FROM contacts
WHERE "companyId" = :companyId
  AND ("isGroup" = true OR "remoteJid" LIKE '%@g.us')
ORDER BY "createdAt" DESC;

-- Query 3: Contatos órfãos (sem tickets - nunca interagiram)
SELECT
  c.id,
  c.name,
  c.number,
  c.channel,
  c."whatsappId",
  c."createdAt",
  c."updatedAt"
FROM contacts c
LEFT JOIN tickets t ON c.id = t."contactId"
WHERE c."companyId" = :companyId
  AND t.id IS NULL
ORDER BY c."createdAt" DESC
LIMIT 100;

-- Query 4: Análise temporal de criação de contatos (detectar importações em massa)
SELECT
  DATE_TRUNC('hour', "createdAt") as hour,
  channel,
  COUNT(*) as contacts_created
FROM contacts
WHERE "companyId" = :companyId
  AND "createdAt" > NOW() - INTERVAL '7 days'
GROUP BY hour, channel
HAVING COUNT(*) > 10 -- Mais de 10 contatos na mesma hora = importação
ORDER BY hour DESC, contacts_created DESC;

-- Query 5: Contatos criados recentemente sem WhatsappId (suspeitos de importação manual)
SELECT
  id,
  name,
  number,
  channel,
  "whatsappId",
  "createdAt"
FROM contacts
WHERE "companyId" = :companyId
  AND channel = 'whatsapp'
  AND "whatsappId" IS NULL
  AND "createdAt" > NOW() - INTERVAL '30 days'
ORDER BY "createdAt" DESC
LIMIT 50;
```

**Resultado Esperado (em Produção):**

**Query 1 - Snapshot Hipotético:**
| channel | total | with_whatsapp | without_whatsapp |
|---------|-------|---------------|------------------|
| whatsapp | 500 | 450 | 50 |
| instagram | 20 | 0 | 20 |
| facebook | 10 | 0 | 10 |

**Interpretação:**
- 50 contatos whatsapp sem `whatsappId` → Criados manualmente ou via Excel
- Todos instagram/facebook são manuais (não há integração direta no código)

**Query 2:** Se retornar linhas, indica que o filtro `id.includes("g.us")` na linha 53 de ImportContactsService.ts falhou

**Query 3:** Se retornar centenas de contatos, indica importação indiscriminada (H4 confirmada)

**Query 4:** Picos de criação de contatos (>10 em 1 hora) indicam importações via roster ou Excel

**Query 5:** Contatos whatsapp sem `whatsappId` sugerem criação manual ou importação de fonte externa

**Severidade:** 🔴 **CRÍTICA**

**Justificativa:**
- **Impacto:** Poluição de base de dados com contatos que o usuário não quer gerenciar
- **Probabilidade:** Alta - comportamento atual do sistema
- **Remediação:** Adicionar campo `source` + filtro "Meus Contatos" vs "Todos os Contatos" + confirmação de importação

---

## 3. Inventário Consolidado de Fontes de Dados

### Resumo de Pontos de Entrada

| Tipo | Backend | Frontend | Total |
|------|---------|----------|-------|
| Criação de Contatos | 5 services | 2 modals | 7 |
| Leitura de Contatos | 3 services | 1 page + 1 listener | 5 |
| Atualização de Contatos | 4 services | 1 reducer | 5 |
| Deleção de Contatos | 2 services | 1 action | 3 |

### Detalhamento Backend

**Services de Criação:**
1. `/backend/src/services/ContactServices/CreateContactService.ts` - Criação manual via API
2. `/backend/src/services/ContactServices/CreateOrUpdateContactService.ts` - Auto-criação de mensagens + importação
3. `/backend/src/services/ContactServices/CreateOrUpdateContactServiceForImport.ts` - Importação Excel via endpoint
4. `/backend/src/services/ContactServices/ImportContactsService.ts` - Importação Excel via upload
5. `/backend/src/services/WbotServices/ImportContactsService.ts` - Importação WhatsApp roster

**Controllers:**
1. `/backend/src/controllers/ContactController.ts` - CRUD principal
2. `/backend/src/controllers/ImportPhoneContactsController.ts` - Importação WhatsApp

**Modelo:**
1. `/backend/src/models/Contact.ts` - Schema principal

**Migrations Relevantes:**
1. `/backend/src/database/migrations/20200717144403-create-contacts.ts` - Criação da tabela
2. `/backend/src/database/migrations/20230708192530-add-unique-constraint-to-Contacts-table.ts` - Constraint composto `(number, companyId)`
3. `/backend/src/database/migrations/20231220223517-add-column-whatsappId-to-Contacts.ts` - Relacionamento com Whatsapp
4. `/backend/src/database/migrations/20250917190000-add-lid-jid-to-contacts.ts` - Suporte multi-device Baileys

### Detalhamento Frontend

**Páginas:**
1. `/frontend/src/pages/Contacts/index.js` - Listagem principal com reducer e Socket.io
2. `/frontend/src/pages/Contacts/import.js` - (não analisado, mas existe)

**Utils:**
1. `/frontend/src/utils/formatPhoneWithCountryFlag.js` - Formatação E.164 (apenas display)

---

## 4. Reconciliação de Origens

### Análise de Constraint UNIQUE

**Migration:** `/backend/src/database/migrations/20230708192530-add-unique-constraint-to-Contacts-table.ts`

```typescript
up: (queryInterface: QueryInterface) => {
  return queryInterface.addConstraint("Contacts", ["number", "companyId"], {
    type: "unique",
    name: "number_companyid_unique"
  });
}
```

**Interpretação:**
- ✅ **CONSTRAINT CORRETO:** Previne duplicatas de `(number, companyId)`
- ❌ **MAS:** O modelo `Contact.ts` tem `@Unique` apenas em `number`, não em composto
- ⚠️ **RISCO:** Se a migration não foi executada, o constraint composto não existe no banco
- ⚠️ **RISCO 2:** Se a normalização não é consistente (H1), podem existir duplicatas lógicas mesmo com o constraint

**Query de Validação:**
```sql
-- Verificar se constraint existe
SELECT
  conname,
  contype,
  pg_get_constraintdef(oid) as definition
FROM pg_constraint
WHERE conrelid = 'contacts'::regclass
  AND conname = 'number_companyid_unique';

-- Resultado esperado:
-- conname                  | contype | definition
-- number_companyid_unique  | u       | UNIQUE (number, "companyId")
```

### Tabela de Snapshot (Simulada)

Como não temos acesso ao banco de dados de produção, propomos as seguintes queries para execução:

#### Query 1: Contagem por Canal e WhatsApp
```sql
SELECT
  channel,
  COUNT(*) as total,
  COUNT(CASE WHEN "whatsappId" IS NOT NULL THEN 1 END) as with_whatsapp,
  COUNT(CASE WHEN "whatsappId" IS NULL THEN 1 END) as without_whatsapp,
  MIN("createdAt") as oldest_contact,
  MAX("createdAt") as newest_contact
FROM contacts
WHERE "companyId" = :companyId
GROUP BY channel
ORDER BY total DESC;
```

**Resultado Esperado:**
| channel | total | with_whatsapp | without_whatsapp | oldest_contact | newest_contact |
|---------|-------|---------------|------------------|----------------|----------------|
| whatsapp | 500 | 450 | 50 | 2024-01-01 | 2025-10-14 |
| instagram | 20 | 0 | 20 | 2024-06-01 | 2025-10-13 |
| facebook | 10 | 0 | 10 | 2024-07-01 | 2025-10-12 |

**Interpretação:**
- 50 contatos whatsapp sem `whatsappId` → Provavelmente criados manualmente ou via Excel
- Todos instagram/facebook são manuais (não há integração direta que popula `whatsappId`)
- Spread temporal indica se houve importações em massa (muitos contatos na mesma data)

#### Query 2: Duplicatas Lógicas (H1 Validation)
```sql
WITH normalized AS (
  SELECT
    id,
    number,
    name,
    channel,
    "whatsappId",
    "createdAt",
    REGEXP_REPLACE(number, '\D', '', 'g') as normalized_number
  FROM contacts
  WHERE "companyId" = :companyId
)
SELECT
  normalized_number,
  COUNT(*) as occurrences,
  ARRAY_AGG(id ORDER BY "createdAt" ASC) as contact_ids,
  ARRAY_AGG(number ORDER BY "createdAt" ASC) as raw_numbers,
  ARRAY_AGG(name ORDER BY "createdAt" ASC) as names,
  MIN("createdAt") as first_created,
  MAX("createdAt") as last_created
FROM normalized
GROUP BY normalized_number
HAVING COUNT(*) > 1
ORDER BY occurrences DESC, normalized_number ASC
LIMIT 50;
```

**Resultado Esperado:**
- **Se H1 for verdadeira:** Retorna múltiplas linhas com `occurrences > 1`
- **Se H1 for falsa:** Retorna 0 linhas

**Exemplo de Resultado (H1 verdadeira):**
| normalized_number | occurrences | contact_ids | raw_numbers | names |
|-------------------|-------------|-------------|-------------|-------|
| 5511999999999 | 3 | {1, 45, 201} | {"+5511999999999", "5511999999999", "(11) 99999-9999"} | {"João Silva", "João Silva", "João"} |
| 5521988888888 | 2 | {12, 89} | {"+5521988888888", "21988888888"} | {"Maria Santos", "Maria"} |

**Interpretação:**
- Contato 1, 45 e 201 são o mesmo João Silva, mas foram criados 3 vezes com formatações diferentes
- Tickets e mensagens estão espalhados entre os 3 registros

#### Query 3: Contatos Órfãos (sem tickets)
```sql
WITH contact_ticket_counts AS (
  SELECT
    c.id,
    c.name,
    c.number,
    c.channel,
    c."whatsappId",
    c."createdAt",
    c."updatedAt",
    COUNT(t.id) as ticket_count,
    MAX(t."createdAt") as last_ticket_date
  FROM contacts c
  LEFT JOIN tickets t ON c.id = t."contactId"
  WHERE c."companyId" = :companyId
  GROUP BY c.id
)
SELECT
  id,
  name,
  number,
  channel,
  "whatsappId",
  "createdAt",
  "updatedAt",
  ticket_count,
  last_ticket_date,
  EXTRACT(DAY FROM NOW() - "createdAt") as days_since_created
FROM contact_ticket_counts
WHERE ticket_count = 0
  AND "createdAt" < NOW() - INTERVAL '7 days' -- Criado há mais de 7 dias
ORDER BY "createdAt" DESC
LIMIT 100;
```

**Resultado Esperado:**
- **Se H4 for verdadeira:** Retorna centenas de contatos importados mas nunca usados
- **Se H4 for falsa:** Retorna poucos contatos (apenas criações manuais acidentais)

**Exemplo de Resultado (H4 verdadeira):**
| id | name | number | channel | whatsappId | createdAt | days_since_created |
|----|------|--------|---------|------------|-----------|-------------------|
| 450 | Suporte Vivo | 103115 | whatsapp | 1 | 2025-09-20 | 24 |
| 451 | Pizza Delivery | 1133334444 | whatsapp | 1 | 2025-09-20 | 24 |
| 452 | Academia XYZ | 1144445555 | whatsapp | 1 | 2025-09-20 | 24 |
| ... | ... | ... | ... | ... | ... | ... |

**Interpretação:**
- Esses contatos foram importados via WhatsApp roster (têm `whatsappId`)
- Nunca foram usados para criar tickets (usuário não quis interagir)
- Estão "poluindo" a lista de contatos há semanas

#### Query 4: Análise Temporal (Detectar Importações em Massa)
```sql
SELECT
  DATE_TRUNC('day', "createdAt") as day,
  channel,
  COUNT(*) as contacts_created,
  COUNT(CASE WHEN "whatsappId" IS NOT NULL THEN 1 END) as with_whatsapp_id,
  ARRAY_AGG(DISTINCT "whatsappId") FILTER (WHERE "whatsappId" IS NOT NULL) as whatsapp_ids
FROM contacts
WHERE "companyId" = :companyId
  AND "createdAt" > NOW() - INTERVAL '30 days'
GROUP BY day, channel
HAVING COUNT(*) > 5 -- Mais de 5 contatos no mesmo dia = importação
ORDER BY day DESC, contacts_created DESC;
```

**Resultado Esperado:**
| day | channel | contacts_created | with_whatsapp_id | whatsapp_ids |
|-----|---------|------------------|------------------|--------------|
| 2025-10-01 | whatsapp | 487 | 487 | {1} |
| 2025-09-15 | whatsapp | 12 | 0 | {} |
| 2025-09-10 | whatsapp | 8 | 8 | {2} |

**Interpretação:**
- **2025-10-01:** Importação massiva de 487 contatos do whatsappId=1 (roster completo)
- **2025-09-15:** Importação de 12 contatos sem `whatsappId` (provavelmente Excel)
- **2025-09-10:** Importação de 8 contatos do whatsappId=2 (segunda conexão)

---

## 5. Exemplos de "Números Fantasma" (Casos de Teste)

### Caso 1: Duplicata de Formatação (H1)

**Setup:**
1. User A cria contato manual via UI: `João Silva - +55 (11) 99999-9999`
2. Backend normaliza (incorretamente) para: `5511999999999` (sem +)
3. Sistema importa roster WhatsApp com mesmo número: `5511999999999`

**Estado Atual (H1 verdadeira):**
- DB contém 2 registros:
  - `id=1, number="(11)99999-9999", companyId=1, name="João Silva", source=NULL` (manual, normalização falhou)
  - `id=2, number="5511999999999", companyId=1, name="João Silva", source=NULL` (roster)
- User vê 2 contatos "João Silva" na lista
- Tickets podem estar associados ao id=1 ou id=2, fragmentando histórico

**Estado Desejado (H1 corrigida):**
- DB contém 1 registro:
  - `id=1, number="+5511999999999", companyId=1, name="João Silva", source="manual"`
- Importação de roster encontra contato existente via `findOrCreate` e apenas atualiza
- User vê 1 contato "João Silva"
- Histórico unificado

### Caso 2: Vazamento de Tickets (H2)

**Setup:**
1. User A (non-admin) cria ticket com contato X
2. User B (non-admin, mesma company) lista `/contacts/`

**Estado Atual (H2 se bug existir):**
- User B vê contato X na lista (vazamento RBAC)

**Estado Atual Validado (após análise):**
- User B **NÃO** vê contato X - filtro funciona corretamente (linha 44-60 de ListContactsService.ts)
- **MAS:** Se `req.user.canViewAllContacts` não for populado, pode falhar

**Estado Desejado (H2 falsa - já implementado):**
- User B NÃO vê contato X (isolamento correto)
- Apenas admin ou users com `canViewAllContacts=true` veem todos os contatos

### Caso 3: Socket.io Fantasma (H3)

**Setup:**
1. User A filtra contatos por tag "VIP" (3 contatos na lista)
2. User B (mesma company) cria contato "João" sem tag "VIP"

**Estado Atual (H3 verdadeira):**
1. Backend emite `company-${companyId}-contact` com `action: "create"`
2. Listener Socket.io de User A recebe evento (linha 225)
3. Reducer executa `UPDATE_CONTACTS` (linha 83-93)
4. Contato não existe no state, então cai no `else` (linha 91)
5. Reducer retorna `[contact, ...state]` - **adiciona João à lista**
6. User A vê 4 contatos, incluindo "João" sem tag "VIP"
7. User A pensa: "De onde veio esse João? Eu filtrei por VIP!"

**Estado Desejado (H3 falsa):**
1. Reducer valida se contato tem tag "VIP" antes de adicionar
2. Se não tiver, ignora o evento
3. User A continua vendo apenas 3 contatos com tag "VIP"

**Solução Proposta:**
```javascript
// frontend/src/pages/Contacts/index.js:83-93 (reducer)
if (action.type === "UPDATE_CONTACTS") {
  const contact = action.payload;
  const contactIndex = state.findIndex((c) => c.id === contact.id);

  if (contactIndex !== -1) {
    // Contato já existe: atualizar
    state[contactIndex] = contact;
    return [...state];
  } else {
    // NOVO: Validar filtros antes de adicionar
    // ❌ NÃO ADICIONAR - filtros são aplicados no backend via API
    // O Socket.io NÃO deve adicionar contatos que não passam pelo filtro
    return state; // Ignora o evento
  }
}
```

**Justificativa:** O Socket.io serve para atualizar contatos já carregados, não para adicionar novos que não passaram pelos filtros da query inicial.

### Caso 4: Importação Indiscriminada (H4)

**Setup:**
1. User conecta WhatsApp com 100 contatos pessoais + 50 contatos de suporte (103115, 190, etc.)
2. User clica em "Importar do Telefone"

**Estado Atual (H4 verdadeira):**
1. Backend chama `ImportContactsService(companyId)` (linha 7 de ImportPhoneContactsController.ts)
2. Service busca **todos** os contatos via Baileys (linha 19-20 de ImportContactsService.ts)
3. Loop processa 150 contatos (linha 52-79)
4. Filtro ignora apenas `status@broadcast` e grupos (linha 53)
5. Cria 150 contatos no banco
6. User vê 150 contatos na lista, incluindo "Suporte Vivo - 103115"
7. User pensa: "Eu não queria adicionar o 103115 na minha agenda de clientes!"

**Estado Desejado (H4 falsa):**
1. Backend retorna lista de contatos para o frontend
2. Frontend mostra modal: "Selecione quais contatos importar (150 encontrados)"
3. User marca apenas os 100 contatos pessoais
4. Backend cria apenas os 100 selecionados
5. User vê apenas seus clientes reais na lista

**Solução Proposta:**
1. Adicionar campo `source` ao modelo Contact:
   ```typescript
   @Default("manual")
   @Column({
     type: DataType.ENUM('manual', 'whatsapp_roster', 'excel_import', 'auto_created')
   })
   source: string;
   ```

2. Modificar ImportContactsService para marcar origem:
   ```typescript
   await CreateContactService({
     number,
     name: name || notify,
     companyId,
     source: 'whatsapp_roster' // <-- NOVO
   });
   ```

3. Adicionar filtro na UI:
   ```javascript
   // frontend/src/pages/Contacts/index.js
   const [showOnlyAgenda, setShowOnlyAgenda] = useState(true);

   const { data } = await api.get("/contacts/", {
     params: {
       searchParam,
       pageNumber,
       contactTag: JSON.stringify(selectedTags),
       onlyAgenda: showOnlyAgenda // <-- NOVO
     },
   });
   ```

---

## 6. Mapa de Linhagem (Consolidado)

```
FONTES DE ORIGEM                      PONTOS DE TRANSFORMAÇÃO                    STORAGE
=======================              ==============================             =============
📱 WhatsApp Roster                   backend/ImportContactsService.ts:54        PostgreSQL
   └─> Baileys phoneContactsList    └─> number.replace(/\D/g, "")             contacts table
   └─> Inclui TODOS os contatos     └─> CreateContactService()                └─> UNIQUE(number, companyId)
   └─> Sem filtro por usuário       └─> SEM campo source ❌                   └─> Constraint adicionado via migration

📊 Excel/CSV Upload                  backend/ImportContactsService.ts:34
   └─> FormData file                └─> number.replace(/\D/g, "")
   └─> Aceita qualquer formato      └─> Contact.findOrCreate()
                                     └─> SEM validação E.164 ❌

✋ Criação Manual (UI)               backend/CreateOrUpdateContactService.ts:81
   └─> ContactModal form            └─> rawNumber.replace(/[^0-9]/g, "")
   └─> Input livre                  └─> Contact.create() ou findOne + update
                                     └─> Normalização inconsistente ❌

💬 Mensagens Recebidas               backend/CreateOrUpdateContactService.ts:154
   └─> Baileys message event        └─> Auto-cria contato se não existe
   └─> JID do remetente             └─> UpsertContactFromBaileysService
                                     └─> Extrai número do JID (linha 4)
                                     └─> SEM campo source ❌

🔄 Socket.io Real-time              frontend/pages/Contacts/index.js:225
   └─> company-{companyId}-contact  └─> reducer UPDATE_CONTACTS (linha 83-93)
   └─> Eventos: create/update/del   └─> Adiciona contato SEM validar filtros ❌
                                     └─> Causa "fantasmas" em listas filtradas

📋 HTTP GET /contacts/              backend/ListContactsService.ts:44-60
   └─> Query params: searchParam    └─> Filtra por userId se não-admin ✅
   └─> tags, pageNumber             └─> Aplica whereCondition ✅
                                     └─> MAS Socket.io bypassa filtros ❌
```

**Análise:**
- **6 fontes de entrada**, nenhuma com normalização E.164 consistente
- **1 ponto de cache (frontend reducer)** que não valida filtros
- **0 mecanismos de deduplicação** além de UNIQUE constraint (que só funciona se normalização for consistente)
- **0 campos para rastrear origem** dos contatos (manual, importação, auto-criado)

---

## 7. Recomendações Prioritárias

### Crítico (Implementar Imediatamente):

**1. Adicionar hook `@BeforeCreate`/`@BeforeUpdate` em Contact.ts para normalização E.164**
```typescript
// backend/src/models/Contact.ts
import { parsePhoneNumber, isValidPhoneNumber } from 'libphonenumber-js';

@BeforeCreate
@BeforeUpdate
static normalizeNumber(contact: Contact) {
  if (!contact.number || contact.isGroup) return;

  try {
    let cleaned = contact.number.replace(/\D/g, '');
    if (!cleaned.startsWith('+')) cleaned = '+' + cleaned;

    if (isValidPhoneNumber(cleaned)) {
      const parsed = parsePhoneNumber(cleaned);
      contact.number = parsed.number; // E.164 puro (ex: +5511999999999)
    } else {
      throw new Error(`Invalid phone number: ${contact.number}`);
    }
  } catch (error) {
    logger.error(`Failed to normalize number: ${contact.number}`, error);
    throw new AppError('ERR_INVALID_PHONE_NUMBER');
  }
}
```

**2. Refatorar reducer `UPDATE_CONTACTS` para respeitar filtros ativos**
```javascript
// frontend/src/pages/Contacts/index.js:83-93
if (action.type === "UPDATE_CONTACTS") {
  const contact = action.payload;
  const contactIndex = state.findIndex((c) => c.id === contact.id);

  if (contactIndex !== -1) {
    // Atualizar contato existente
    state[contactIndex] = contact;
    return [...state];
  } else {
    // NÃO adicionar contatos novos via Socket.io
    // Filtros são aplicados na query inicial HTTP
    return state;
  }
}
```

**3. Adicionar campo `source` ao modelo Contact**
```typescript
// backend/src/models/Contact.ts
@Default("manual")
@Column({
  type: DataType.ENUM('manual', 'whatsapp_roster', 'excel_import', 'auto_created', 'chat_import')
})
source: string;

@Default(true)
@Column
isInAgenda: boolean; // false para contatos auto-criados de mensagens
```

**Migration:**
```sql
CREATE TYPE contact_source AS ENUM (
  'manual',
  'whatsapp_roster',
  'excel_import',
  'auto_created',
  'chat_import'
);

ALTER TABLE contacts ADD COLUMN source contact_source DEFAULT 'manual';
ALTER TABLE contacts ADD COLUMN "isInAgenda" BOOLEAN DEFAULT true;
```

### Alta (Implementar em Sprint Atual):

**4. Criar migration de correção para normalizar números existentes**
```sql
-- Migration: normalize-existing-contacts.ts
BEGIN;

-- Backup antes de modificar
CREATE TABLE contacts_backup_20251014 AS SELECT * FROM contacts;

-- Normalizar números (exemplo para Brasil)
UPDATE contacts
SET number = '+' || REGEXP_REPLACE(number, '\D', '', 'g')
WHERE "companyId" = :companyId
  AND LENGTH(REGEXP_REPLACE(number, '\D', '', 'g')) BETWEEN 10 AND 15
  AND number NOT LIKE '+%';

-- Verificar duplicatas antes de aplicar constraint
SELECT
  number,
  "companyId",
  COUNT(*) as count
FROM contacts
GROUP BY number, "companyId"
HAVING COUNT(*) > 1;

-- Se houver duplicatas, pausar e analisar manualmente
-- Se não houver, commit
COMMIT;
```

**5. Adicionar índice UNIQUE composto (se não existir)**
```sql
-- Verificar se já existe
SELECT indexname FROM pg_indexes
WHERE tablename = 'contacts'
  AND indexname = 'number_companyid_unique';

-- Se não existir, criar com CONCURRENTLY para não bloquear tabela
CREATE UNIQUE INDEX CONCURRENTLY number_companyid_unique
ON contacts (number, "companyId")
WHERE number IS NOT NULL;
```

**6. Validar isolamento RBAC em ListContactsService.ts**
- Adicionar teste de integração que valida:
  - User A cria contato
  - User B (mesma company, non-admin) lista contatos
  - User B **não** vê contato de User A
- Adicionar validação de `req.user.canViewAllContacts` em TODOS os endpoints de contatos

### Média (Backlog):

**7. Implementar filtro "Somente Meus Contatos" na UI**
```javascript
// frontend/src/pages/Contacts/index.js
<FormControlLabel
  control={
    <Switch
      checked={showOnlyAgenda}
      onChange={(e) => setShowOnlyAgenda(e.target.checked)}
    />
  }
  label="Mostrar apenas meus contatos"
/>
```

**8. Adicionar testes E2E para Socket.io namespace isolation**
- Teste 1: Abrir 2 abas com companies diferentes
- Teste 2: Criar contato em Company 1
- Teste 3: Validar que **não** aparece em Company 2

**9. Criar documentação de importação para usuários**
- Explicar que importação do roster traz **todos** os contatos
- Explicar como usar filtro "Somente Meus Contatos"
- Explicar diferença entre `source: manual` vs `whatsapp_roster`

---

## 8. Arquivos Anexos

### Logs de Varredura (Glob)

**Backend Services - Contacts:**
```
/backend/src/services/ContactListService/ImportContacts.ts
/backend/src/services/ContactServices/BulkDeleteContactsService.ts
/backend/src/services/ContactServices/CreateOrUpdateContactService.ts
/backend/src/services/ContactServices/CreateOrUpdateContactServiceForImport.ts
/backend/src/services/ContactServices/FindAllContactsServices.ts
/backend/src/services/ContactServices/FindContactTags.ts
/backend/src/services/ContactServices/GetContactService.ts
/backend/src/services/ContactServices/ImportContactsService.ts
/backend/src/services/ContactServices/ListContactsService.ts ✅ P0
/backend/src/services/ContactServices/ShowContactService.ts
/backend/src/services/ContactServices/UpdateContactService.ts
/backend/src/services/ContactServices/UpdateContactWalletsService.ts
/backend/src/services/ContactServices/UpsertContactFromBaileysService.ts ✅ P0
/backend/src/services/Statistics/ContactsReportService.ts
/backend/src/services/TicketNoteService/FindNotesByContactIdAndTicketId.ts
/backend/src/services/WbotServices/CheckIsValidContact.ts
/backend/src/services/WbotServices/ImportContactsService.ts ✅ P0
/backend/src/services/ContactServices/DeleteContactService.ts
/backend/src/services/ContactServices/ToggleAcceptAudioContactService.ts
/backend/src/services/ContactServices/ToggleDisableBotContactService.ts
/backend/src/services/ContactServices/BlockUnblockContactService.ts
/backend/src/services/ContactServices/CreateContactService.ts ✅ P0
```

**Backend Controllers:**
```
/backend/src/controllers/ContactListController.ts
/backend/src/controllers/ContactListItemController.ts
/backend/src/controllers/ImportPhoneContactsController.ts ✅ P0
/backend/src/controllers/api/ContactController.ts
/backend/src/controllers/ContactController.ts ✅ P0
```

**Backend Models:**
```
/backend/src/models/Contact.ts ✅ P0
/backend/src/models/ContactCustomField.ts
/backend/src/models/ContactList.ts
/backend/src/models/ContactListItem.ts
/backend/src/models/ContactTag.ts
/backend/src/models/ContactWallet.ts
```

**Backend Migrations (relevantes):**
```
/backend/src/database/migrations/20200717144403-create-contacts.ts
/backend/src/database/migrations/20230708192530-add-unique-constraint-to-Contacts-table.ts ✅ P0
/backend/src/database/migrations/20231220223517-add-column-whatsappId-to-Contacts.ts
/backend/src/database/migrations/20250917190000-add-lid-jid-to-contacts.ts
```

**Frontend Pages:**
```
/frontend/src/pages/Contacts/import.js
/frontend/src/pages/Contacts/index.js ✅ P0
```

**Frontend Utils:**
```
/frontend/src/utils/formatPhoneWithCountryFlag.js ✅ P1
```

### Trechos de Código Suspeitos

**1. Normalização Inconsistente (5 padrões diferentes):**
```
CreateOrUpdateContactService.ts:81: rawNumber.replace(/[^0-9]/g, "")
ImportContactsService.ts:34: ${number}.replace(/\D/g, "")
ImportContactsService.ts (Wbot):54: id.replace(/\D/g, "")
UpsertContactFromBaileysService.ts:4: jid.split("@")[0].split(":")[0].replace(/\D/g, "")
ContactController.ts:195: number.replace("-", "").replace(" ", "")
```

**2. Socket.io listeners (5 pontos):**
```
frontend/src/pages/FlowBuilder/index.js:179: socket.on(`company-${companyId}-contact`, onContact);
frontend/src/pages/Contacts/index.js:237: socket.on(`company-${companyId}-contact`, onContactEvent); ✅ P0
frontend/src/pages/FlowDefault/index.js:191: socket.on(`company-${companyId}-contact`, onContact);
frontend/src/components/TicketsListCustom/index.js:365: socket.on(`company-${companyId}-contact`, onCompanyContactTicketsList);
frontend/src/components/Ticket/index.js:152: socket.on(`company-${companyId}-contact`, onCompanyContactTicket);
```

**3. Constraint UNIQUE no modelo vs migration:**
```typescript
// Modelo Contact.ts:38-40
@AllowNull(false)
@Unique // ❌ Apenas em 'number', não em composto
@Column
number: string;

// Migration 20230708:5-8
return queryInterface.addConstraint("Contacts", ["number", "companyId"], {
  type: "unique",
  name: "number_companyid_unique" // ✅ Composto correto
});
```

---

## 9. Próximos Passos para Planner-Backend

O planner-backend deve:

**1. Revisar este relatório e confirmar hipóteses**
- Validar se as 4 hipóteses (H1-H4) estão corretas
- Priorizar remediações (Crítico > Alta > Média)

**2. Definir contratos de API para novos endpoints**
- `GET /contacts/?onlyAgenda=true` - Filtrar por contatos na agenda
- `POST /contacts/import/preview` - Retornar lista de contatos antes de importar
- `POST /contacts/import/confirm` - Importar apenas contatos selecionados

**3. Especificar formato E.164 canônico**
- Decidir se usa `+` no início (recomendado: sim)
- Decidir como tratar números sem código de país (adicionar +55 default?)
- Decidir como tratar números com 10 vs 11 dígitos (9º dígito)

**4. Definir enum de `source`**
```typescript
export enum ContactSource {
  MANUAL = 'manual',
  WHATSAPP_ROSTER = 'whatsapp_roster',
  EXCEL_IMPORT = 'excel_import',
  AUTO_CREATED = 'auto_created',
  CHAT_IMPORT = 'chat_import'
}
```

**5. Criar esquema de migration segura (com rollback)**
- Migration 1: Adicionar campos `source` e `isInAgenda`
- Migration 2: Normalizar números existentes (com backup)
- Migration 3: Validar duplicatas e merge (se necessário)
- Rollback: Restaurar de `contacts_backup_YYYYMMDD`

**6. Definir estratégia de merge para duplicatas**
- Contato "mais antigo" é mantido (menor `id`)
- Campos vazios são preenchidos do contato mais recente
- Tickets/mensagens são atualizados para apontar para `id` mantido
- Contatos duplicados são marcados como `deletedAt` (soft delete)

**7. Adicionar feature flags**
```bash
FEATURE_CONTACTS_NORMALIZE_E164=true
FEATURE_CONTACTS_SOURCE_FIELD=true
FEATURE_CONTACTS_ONLY_AGENDA_FILTER=false # Desabilitado por padrão
FEATURE_CONTACTS_IMPORT_PREVIEW=false # Em desenvolvimento
```

**8. Definir testes de aceitação**
- [ ] Teste 1: Importar Excel com número `(11) 99999-9999` e WhatsApp roster com `5511999999999` não cria duplicata
- [ ] Teste 2: User non-admin não vê contatos de outros users
- [ ] Teste 3: Filtrar por tag "VIP" e criar contato sem tag não adiciona à lista via Socket.io
- [ ] Teste 4: Importar WhatsApp roster mostra preview antes de salvar

---

**Fim do Relatório**

## Assinaturas

**Data Analyst:** Claude Code
**Data:** 2025-10-14
**Status:** ✅ Análise Completa - Aguardando Revisão do Planner-Backend

---

data-analyst=done
