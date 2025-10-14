# Frontend Plan: UX e Políticas de Cache - Correção "Números Fantasma"

**Data:** 2025-10-14
**Responsável:** Frontend Planner
**Status:** PLANEJAMENTO COMPLETO
**Baseado em:** architecture_probe.md, data_lineage_report.md, backend-plan.md

---

## Índice

1. [UX do Filtro "Meus Contatos"](#1-ux-do-filtro-meus-contatos)
2. [Política de Cache React State](#2-política-de-cache-react-state)
3. [Refatoração do Reducer](#3-refatoração-do-reducer)
4. [Componentes Afetados](#4-componentes-afetados)
5. [Custom Hooks](#5-custom-hooks)
6. [Estados UI (4 Obrigatórios)](#6-estados-ui-4-obrigatórios)
7. [Data Fetching e Socket.IO](#7-data-fetching-e-socketio)
8. [Plano de Commits Granulares](#8-plano-de-commits-granulares)
9. [Estratégia de Testes E2E](#9-estratégia-de-testes-e2e)
10. [Acessibilidade (A11y)](#10-acessibilidade-a11y)
11. [Internacionalização (i18n)](#11-internacionalização-i18n)
12. [Material-UI v4/v5 Strategy](#12-material-ui-v4v5-strategy)

---

## 1. UX do Filtro "Meus Contatos"

### 1.1 Mockup ASCII da Interface

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│ Contatos (150)                                               [+ Novo Contato]  │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  🔍  [Buscar contatos por nome ou número...                            ] [ X ] │
│                                                                                 │
│  🏷️  Filtrar por tags:  [VIP ×] [Cliente ×] [Prospect ×]                      │
│                                                                                 │
│  ┌─────────────────────────────────────────────────────────────────────────┐   │
│  │ 📋 Mostrar:                                                             │   │
│  │   ○ Todos os contatos (auto-criados, importados, manuais)             │   │
│  │   ● Somente meus contatos (agenda)                                     │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                 │
│  📊 Origem: [ Todos ▼ ]                                                        │
│      └─ Opções: Todos, Manual, WhatsApp, Excel, Auto-criados, Chats           │
│                                                                                 │
│  [Importar/Exportar ▼]  [ ] Selecionar tudo    [Deletar selecionados (0)]    │
│                                                                                 │
├─────────────────────────────────────────────────────────────────────────────────┤
│  [ ] 📷  João Silva           +55 11 99999-9999   joao@example.com   🔧 Manual │
│  [ ] 📷  Maria Oliveira       +55 11 98888-8888   maria@example.com  📱 WA     │
│  [ ] 📷  Pedro Santos         +55 11 97777-7777                        📊 Excel│
│  [ ] 📷  Contato Desconhecido +55 11 96666-6666                        🤖 Auto │
│  ...                                                                            │
│                                                                                 │
│  ← Anterior    Página 1 de 5    Próximo →                                      │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

### 1.2 Elementos Novos da UI

#### 1.2.1 Radio Group: "Meus Contatos" vs "Todos"

**Localização:** Abaixo do campo de busca e filtro de tags

**Opções:**
1. **"Todos os contatos"** (`showOnlyAgenda = false`)
   - Mostra contatos com `isInAgenda = true` E `isInAgenda = false`
   - Inclui contatos auto-criados de mensagens recebidas
   - Inclui contatos importados de chats

2. **"Somente meus contatos"** (`showOnlyAgenda = true`) - DEFAULT
   - Mostra apenas contatos com `isInAgenda = true`
   - Inclui contatos criados manualmente
   - Inclui contatos importados da agenda WhatsApp
   - Inclui contatos importados de Excel/CSV

**Comportamento:**
- Default ao carregar página: "Somente meus contatos" (selecionado)
- Preferência salva no `localStorage`: `contacts_show_only_agenda`
- Ao mudar opção: Dispatch `RESET` + Refetch com novo filtro

**Material-UI v5 Component:**
```jsx
<FormControl component="fieldset">
  <FormLabel component="legend">Mostrar</FormLabel>
  <RadioGroup
    aria-label="Filtro de contatos"
    name="contact-filter"
    value={showOnlyAgenda ? 'only_agenda' : 'all'}
    onChange={(e) => setShowOnlyAgenda(e.target.value === 'only_agenda')}
  >
    <FormControlLabel
      value="all"
      control={<Radio />}
      label={i18n.t("contacts.filters.showAll")}
    />
    <FormControlLabel
      value="only_agenda"
      control={<Radio />}
      label={i18n.t("contacts.filters.showOnlyAgenda")}
    />
  </RadioGroup>
</FormControl>
```

---

#### 1.2.2 Dropdown: "Origem"

**Localização:** Abaixo do Radio Group

**Visibilidade:**
- Visível APENAS se "Todos os contatos" estiver selecionado
- Hidden se "Somente meus contatos" estiver selecionado

**Opções:**
- `all`: "Todos" (default)
- `manual`: "Manual" (criado pela UI)
- `whatsapp_roster`: "WhatsApp (agenda)"
- `excel_import`: "Excel/CSV"
- `auto_created`: "Auto-criados"
- `chat_import`: "Importados de chats"

**Comportamento:**
- Ao mudar opção: Dispatch `RESET` + Refetch com `source` filtrado
- Preferência salva no `localStorage`: `contacts_source_filter`

**Material-UI v5 Component:**
```jsx
{!showOnlyAgenda && (
  <FormControl fullWidth sx={{ mt: 2 }}>
    <InputLabel id="source-filter-label">
      {i18n.t("contacts.filters.source")}
    </InputLabel>
    <Select
      labelId="source-filter-label"
      value={sourceFilter}
      label={i18n.t("contacts.filters.source")}
      onChange={(e) => setSourceFilter(e.target.value)}
    >
      <MenuItem value="all">{i18n.t("contacts.filters.sourceAll")}</MenuItem>
      <MenuItem value="manual">{i18n.t("contacts.filters.sourceManual")}</MenuItem>
      <MenuItem value="whatsapp_roster">{i18n.t("contacts.filters.sourceWhatsappRoster")}</MenuItem>
      <MenuItem value="excel_import">{i18n.t("contacts.filters.sourceExcelImport")}</MenuItem>
      <MenuItem value="auto_created">{i18n.t("contacts.filters.sourceAutoCreated")}</MenuItem>
      <MenuItem value="chat_import">{i18n.t("contacts.filters.sourceChatImport")}</MenuItem>
    </Select>
  </FormControl>
)}
```

---

#### 1.2.3 Badge de Origem

**Localização:** Última coluna de cada linha do contato

**Visual:**
- Manual: 🔧 (ferramenta)
- WhatsApp: 📱 (celular)
- Excel: 📊 (gráfico)
- Auto-criados: 🤖 (robô)
- Chats: 💬 (balão de conversa)

**Tooltip:** Ao passar o mouse, exibe descrição completa
- "Criado manualmente"
- "Importado da agenda WhatsApp"
- "Importado de Excel/CSV"
- "Criado automaticamente ao receber mensagem"
- "Importado de chats ativos"

**Material-UI v5 Component:**
```jsx
<Tooltip title={getSourceLabel(contact.source)}>
  <span role="img" aria-label={contact.source}>
    {getSourceEmoji(contact.source)}
  </span>
</Tooltip>
```

**Helper Functions:**
```javascript
const getSourceEmoji = (source) => {
  const emojiMap = {
    manual: '🔧',
    whatsapp_roster: '📱',
    excel_import: '📊',
    auto_created: '🤖',
    chat_import: '💬'
  };
  return emojiMap[source] || '❓';
};

const getSourceLabel = (source) => {
  const labelMap = {
    manual: i18n.t("contacts.source.manual"),
    whatsapp_roster: i18n.t("contacts.source.whatsappRoster"),
    excel_import: i18n.t("contacts.source.excelImport"),
    auto_created: i18n.t("contacts.source.autoCreated"),
    chat_import: i18n.t("contacts.source.chatImport")
  };
  return labelMap[source] || i18n.t("contacts.source.unknown");
};
```

---

### 1.3 Fluxos de Usuário

#### Fluxo 1: Usuário quer ver apenas sua agenda

**Passo 1:** User entra em `/contacts`
- Radio "Somente meus contatos" já está selecionado (default)
- Dropdown "Origem" está oculto

**Passo 2:** Sistema carrega contatos
- API: `GET /contacts/?onlyAgenda=true`
- Query: `WHERE isInAgenda = true AND companyId = :companyId`
- Retorna apenas contatos da agenda pessoal do usuário

**Passo 3:** Lista exibe contatos
- Cada contato mostra badge de origem (🔧 📱 📊)
- User vê apenas contatos que ele gerencia ativamente

**Passo 4:** User clica em contato
- Modal `ContactModal` abre com detalhes
- User pode editar nome, email, tags, etc.

---

#### Fluxo 2: Usuário quer ver todos (incluindo auto-criados)

**Passo 1:** User seleciona radio "Todos os contatos"
- `setShowOnlyAgenda(false)`
- Dropdown "Origem" aparece (com opção "Todos" selecionada)
- Sistema dispara refetch

**Passo 2:** Sistema recarrega contatos
- API: `GET /contacts/?onlyAgenda=false&source=all`
- Query: `WHERE companyId = :companyId` (sem filtro de isInAgenda)
- Retorna TODOS os contatos (agenda + auto-criados)

**Passo 3:** User filtra por origem "Auto-criados"
- `setSourceFilter('auto_created')`
- Sistema dispara refetch

**Passo 4:** Sistema carrega contatos auto-criados
- API: `GET /contacts/?onlyAgenda=false&source=auto_created`
- Query: `WHERE source = 'auto_created' AND companyId = :companyId`
- Lista exibe contatos criados ao receber mensagens de números desconhecidos

**Passo 5:** User vê contatos com badge 🤖
- User identifica que são números comerciais (103115, 190, etc.)
- User pode decidir adicionar à agenda ou deletar

---

#### Fluxo 3: Importação de Contatos WhatsApp

**Passo 1:** User clica em "Importar/Exportar" → "Importar do WhatsApp"
- Modal `ContactImportWpModal` abre

**Passo 2:** User configura importação
- Seleciona conexão WhatsApp (dropdown)
- Marca checkbox: [x] Filtrar grupos (default: true)
- Marca checkbox: [x] Adicionar à minha agenda (default: true)

**Passo 3:** User confirma importação
- API: `POST /contacts/import { whatsappId: 1, filterGroups: true, onlyAgenda: true }`
- Backend importa contatos do roster Baileys
- Backend marca contatos como `source='whatsapp_roster'` e `isInAgenda=true`

**Passo 4:** Sistema exibe toast de sucesso
- Mensagem: "150 contatos importados, 50 ignorados (grupos)"
- Contagem vem do backend: `{ imported: 150, ignored: 50, duplicates: 10 }`

**Passo 5:** Lista atualiza via Socket.io
- Backend emite eventos `company-${companyId}-contact` para cada contato criado
- Frontend reducer recebe eventos
- **IMPORTANTE:** Reducer NÃO adiciona contatos novos se filtros estiverem ativos
- Solução: Dispatch `RESET` após importação para forçar refetch

---

#### Fluxo 4: Socket.io Fantasma (Problema Corrigido)

**ANTES (Problema H3):**

**Passo 1:** User A filtra contatos por tag "VIP" (3 contatos)
- Estado: `contacts = [João (VIP), Maria (VIP), Pedro (VIP)]`

**Passo 2:** User B (mesma company) cria contato "Carlos" sem tag "VIP"
- Backend emite: `company-1-contact { action: "create", contact: Carlos }`

**Passo 3:** Frontend de User A recebe evento
- Reducer executa `UPDATE_CONTACTS` (linha 91 do reducer)
- Contato "Carlos" não existe no state
- **BUG:** Reducer adiciona Carlos ao state: `[Carlos, João, Maria, Pedro]`

**Passo 4:** User A vê 4 contatos (Carlos aparece como "fantasma")
- User A pensa: "De onde veio esse Carlos? Eu filtrei por VIP!"

---

**DEPOIS (Solução):**

**Passo 1:** User A filtra contatos por tag "VIP" (3 contatos)
- Estado: `contacts = [João (VIP), Maria (VIP), Pedro (VIP)]`

**Passo 2:** User B cria contato "Carlos" sem tag "VIP"
- Backend emite: `company-1-contact { action: "create", contact: Carlos }`

**Passo 3:** Frontend de User A recebe evento
- Reducer executa `UPDATE_CONTACTS`
- Contato "Carlos" não existe no state
- **CORREÇÃO:** Reducer retorna `state` inalterado (não adiciona Carlos)

**Passo 4:** User A continua vendo apenas 3 contatos (VIP)
- Filtros são respeitados
- Se User A remover filtro, verá Carlos normalmente

---

## 2. Política de Cache React State

### 2.1 Estado Atual (Problemático)

**Arquivo:** `frontend/src/pages/Contacts/index.js`

**Reducer Linha 83-93:**
```javascript
if (action.type === "UPDATE_CONTACTS") {
  const contact = action.payload;
  const contactIndex = state.findIndex((c) => c.id === contact.id);

  if (contactIndex !== -1) {
    state[contactIndex] = contact;
    return [...state];
  } else {
    return [contact, ...state]; // ❌ PROBLEMA: Adiciona sem validar filtros
  }
}
```

**Problema:**
- Adiciona contatos novos via Socket.io sem validar se passam pelos filtros ativos
- Filtros ativos: `searchParam`, `selectedTags`, `showOnlyAgenda`, `sourceFilter`
- Resulta em "números fantasma" na lista filtrada

---

### 2.2 Estado Desejado (Corrigido)

**Reducer Refatorado:**
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
      // ✅ CASO 1: Contato já existe no state - ATUALIZAR
      state[contactIndex] = contact;
      return [...state];
    } else {
      // ✅ CASO 2: Contato novo - NÃO ADICIONAR
      // Motivo: Contato pode não passar pelos filtros ativos (tags, searchParam, onlyAgenda)
      // Se usuário quiser ver, ele remove filtros ou faz refresh manual
      console.log('[Contacts Reducer] Socket.io event: New contact created, but not added to filtered list', contact);
      return state; // ✅ Retorna estado inalterado
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

**Justificativa:**
1. **Socket.io é para updates, não para novos itens**
   - Socket.io serve para sincronizar updates em contatos já carregados
   - Novos contatos devem vir via API com filtros aplicados

2. **Filtros são aplicados no backend**
   - A query inicial `GET /contacts/?tags=[1,2]&searchParam=joão` já filtra
   - Socket.io não tem contexto dos filtros ativos do usuário

3. **Adicionar novos via Socket.io causa inconsistência**
   - User A filtra por tag "VIP"
   - User B cria contato sem tag "VIP"
   - Se adicionar via Socket.io, User A vê contato sem tag "VIP"

4. **Solução alternativa: Invalidação automática**
   - Se quiser sincronizar novos contatos, usar debounce de 5s
   - Após 5s sem eventos Socket.io, fazer refetch automático
   - Implementação futura (não neste commit)

---

### 2.3 Política de Invalidação

**Quando invalidar o estado (dispatch RESET + refetch):**

| Trigger | Ação | Motivo |
|---------|------|--------|
| User muda `searchParam` | Dispatch `RESET` → Refetch com novo `searchParam` | Debounce 500ms já implementado |
| User adiciona/remove tags | Dispatch `RESET` → Refetch com novos `selectedTags` | Já implementado |
| User muda radio "Meus Contatos" ↔ "Todos" | Dispatch `RESET` → Refetch com `onlyAgenda` | NOVO |
| User muda dropdown "Origem" | Dispatch `RESET` → Refetch com `source` | NOVO |
| User confirma importação de contatos | Dispatch `RESET` → Refetch | NOVO |
| User deleta contato(s) | Dispatch `RESET` → Refetch | Já implementado |

**NÃO invalidar (manter cache):**

| Trigger | Ação | Motivo |
|---------|------|--------|
| Socket.io `UPDATE_CONTACTS` (update) | Atualizar in-place | Contato já existe no state |
| Socket.io `DELETE_CONTACT` | Remover do array | Simples remoção |
| User troca de página (paginação) | Append na lista | Paginação incremental |

---

### 2.4 Comparação: Antes vs Depois

**Cenário:** User A filtra por tag "VIP", User B cria contato sem tag "VIP"

| Aspecto | ANTES (H3 problemático) | DEPOIS (H3 corrigido) |
|---------|-------------------------|------------------------|
| Socket.io evento recebido | ✅ Sim | ✅ Sim |
| Reducer tenta adicionar contato | ❌ Sim (linha 91) | ✅ Não (retorna state) |
| Contato aparece na lista de User A | ❌ Sim (fantasma) | ✅ Não |
| User A remove filtro | ✅ Vê contato | ✅ Vê contato |
| User A faz refresh | ✅ Vê contato | ✅ Vê contato |

---

## 3. Refatoração do Reducer

### 3.1 Arquivo a Modificar

**Caminho:** `frontend/src/pages/Contacts/index.js`

**Linhas:** 66-108 (função `reducer`)

---

### 3.2 Código Completo do Reducer Refatorado

```javascript
// frontend/src/pages/Contacts/index.js

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
      // Contato já existe: atualizar in-place
      state[contactIndex] = contact;
      return [...state];
    } else {
      // Contato novo: NÃO adicionar via Socket.io
      // Motivo: Novo contato pode não passar pelos filtros ativos (tags, searchParam, onlyAgenda, source)
      // Se usuário quiser ver, ele pode:
      // - Remover filtros (mudará para "Todos os contatos")
      // - Fazer refresh manual (F5)
      // - Aguardar próxima invalidação automática (se implementada)

      console.log(
        '[Contacts Reducer] Socket.io event: New contact created, but NOT added to filtered list.',
        'Contact ID:', contact.id,
        'Contact Name:', contact.name,
        'Reason: Active filters may exclude this contact.'
      );

      return state; // Retorna estado inalterado
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

---

### 3.3 Diff do Código (Antes → Depois)

```diff
  if (action.type === "UPDATE_CONTACTS") {
    const contact = action.payload;
    const contactIndex = state.findIndex((c) => c.id === contact.id);

    if (contactIndex !== -1) {
      state[contactIndex] = contact;
      return [...state];
    } else {
-     return [contact, ...state]; // Adiciona contato novo
+     // NÃO adicionar contato novo via Socket.io
+     console.log('[Contacts Reducer] Socket.io event: New contact created, but NOT added to filtered list.', contact);
+     return state; // Retorna estado inalterado
    }
  }
```

---

### 3.4 Casos de Teste para o Reducer

**Teste 1: Atualizar contato existente**
```javascript
// Arrange
const initialState = [
  { id: 1, name: 'João', number: '+5511999999999' }
];

// Act
const newState = reducer(initialState, {
  type: 'UPDATE_CONTACTS',
  payload: { id: 1, name: 'João Silva', number: '+5511999999999' }
});

// Assert
expect(newState).toHaveLength(1);
expect(newState[0].name).toBe('João Silva');
```

**Teste 2: NÃO adicionar contato novo via Socket.io**
```javascript
// Arrange
const initialState = [
  { id: 1, name: 'João', number: '+5511999999999' }
];

// Act
const newState = reducer(initialState, {
  type: 'UPDATE_CONTACTS',
  payload: { id: 2, name: 'Maria', number: '+5511988888888' }
});

// Assert
expect(newState).toHaveLength(1); // ✅ Não adicionou Maria
expect(newState[0].id).toBe(1); // ✅ Apenas João continua
```

**Teste 3: Deletar contato existente**
```javascript
// Arrange
const initialState = [
  { id: 1, name: 'João', number: '+5511999999999' },
  { id: 2, name: 'Maria', number: '+5511988888888' }
];

// Act
const newState = reducer(initialState, {
  type: 'DELETE_CONTACT',
  payload: 1
});

// Assert
expect(newState).toHaveLength(1);
expect(newState[0].id).toBe(2);
```

---

## 4. Componentes Afetados

### 4.1 Componente Principal: `pages/Contacts/index.js`

**Arquivo:** `frontend/src/pages/Contacts/index.js`

**Modificações:**

#### Estados Novos

```javascript
// NOVO: Hook customizado para filtros (criar)
const { showOnlyAgenda, setShowOnlyAgenda, sourceFilter, setSourceFilter } = useContactFilters();

// Estados existentes (mantém)
const [loading, setLoading] = useState(false);
const [pageNumber, setPageNumber] = useState(1);
const [searchParam, setSearchParam] = useState("");
const [contacts, dispatch] = useReducer(reducer, []);
const [selectedContactId, setSelectedContactId] = useState(null);
const [contactModalOpen, setContactModalOpen] = useState(false);
const [selectedTags, setSelectedTags] = useState([]);
// ... outros estados ...
```

#### Refetch ao Mudar Filtros

```javascript
// NOVO: Invalidar ao mudar showOnlyAgenda
useEffect(() => {
  dispatch({ type: "RESET" });
  setPageNumber(1);
  setSelectedContactIds([]);
  setIsSelectAllChecked(false);
}, [showOnlyAgenda, sourceFilter]); // Adicionar novas dependências

// Existente (mantém)
useEffect(() => {
  dispatch({ type: "RESET" });
  setPageNumber(1);
  setSelectedContactIds([]);
  setIsSelectAllChecked(false);
}, [searchParam, selectedTags]);
```

#### Chamada API Atualizada

```javascript
// MODIFICADO: Adicionar params onlyAgenda e source
useEffect(() => {
  setLoading(true);
  const delayDebounceFn = setTimeout(() => {
    const fetchContacts = async () => {
      try {
        const { data } = await api.get("/contacts/", {
          params: {
            searchParam,
            pageNumber,
            contactTag: JSON.stringify(selectedTags),
            onlyAgenda: showOnlyAgenda, // NOVO
            source: sourceFilter === 'all' ? undefined : sourceFilter // NOVO
          },
        });
        dispatch({ type: "LOAD_CONTACTS", payload: data.contacts });
        setHasMore(data.hasMore);
        setLoading(false);
      } catch (err) {
        toastError(err);
      }
    };
    fetchContacts();
  }, 500);
  return () => clearTimeout(delayDebounceFn);
}, [searchParam, pageNumber, selectedTags, showOnlyAgenda, sourceFilter]); // Novas dependências
```

#### UI: Radio Group

```javascript
// NOVO: Adicionar antes da lista de contatos
<Paper className={classes.filterPaper} elevation={1}>
  <FormControl component="fieldset">
    <FormLabel component="legend">
      {i18n.t("contacts.filters.showLabel")}
    </FormLabel>
    <RadioGroup
      aria-label="Filtro de contatos por agenda"
      name="contact-filter"
      value={showOnlyAgenda ? 'only_agenda' : 'all'}
      onChange={(e) => setShowOnlyAgenda(e.target.value === 'only_agenda')}
    >
      <FormControlLabel
        value="all"
        control={<Radio />}
        label={i18n.t("contacts.filters.showAll")}
      />
      <FormControlLabel
        value="only_agenda"
        control={<Radio />}
        label={i18n.t("contacts.filters.showOnlyAgenda")}
      />
    </RadioGroup>
  </FormControl>
</Paper>
```

#### UI: Dropdown Origem

```javascript
// NOVO: Adicionar após Radio Group (condicional)
{!showOnlyAgenda && (
  <Paper className={classes.filterPaper} elevation={1}>
    <FormControl fullWidth>
      <InputLabel id="source-filter-label">
        {i18n.t("contacts.filters.source")}
      </InputLabel>
      <Select
        labelId="source-filter-label"
        value={sourceFilter}
        label={i18n.t("contacts.filters.source")}
        onChange={(e) => setSourceFilter(e.target.value)}
      >
        <MenuItem value="all">{i18n.t("contacts.filters.sourceAll")}</MenuItem>
        <MenuItem value="manual">{i18n.t("contacts.filters.sourceManual")}</MenuItem>
        <MenuItem value="whatsapp_roster">{i18n.t("contacts.filters.sourceWhatsappRoster")}</MenuItem>
        <MenuItem value="excel_import">{i18n.t("contacts.filters.sourceExcelImport")}</MenuItem>
        <MenuItem value="auto_created">{i18n.t("contacts.filters.sourceAutoCreated")}</MenuItem>
        <MenuItem value="chat_import">{i18n.t("contacts.filters.sourceChatImport")}</MenuItem>
      </Select>
    </FormControl>
  </Paper>
)}
```

#### UI: Badge de Origem na Tabela

```javascript
// MODIFICADO: Adicionar coluna "Origem" na tabela
<TableBody>
  {contacts.map((contact) => (
    <TableRow key={contact.id}>
      {/* ... colunas existentes ... */}

      <TableCell align="center">
        <Tooltip title={getSourceLabel(contact.source)}>
          <span role="img" aria-label={contact.source}>
            {getSourceEmoji(contact.source)}
          </span>
        </Tooltip>
      </TableCell>
    </TableRow>
  ))}
</TableBody>
```

---

### 4.2 Componente: `ContactImportWpModal/index.js`

**Arquivo:** `frontend/src/components/ContactImportWpModal/index.js`

**Modificações:**

#### Estados Novos

```javascript
// NOVO: Checkboxes para filtros de importação
const [filterGroups, setFilterGroups] = useState(true);
const [addToAgenda, setAddToAgenda] = useState(true);
```

#### UI: Checkboxes

```javascript
// NOVO: Adicionar após seleção de conexão WhatsApp
<FormControlLabel
  control={
    <Checkbox
      checked={filterGroups}
      onChange={(e) => setFilterGroups(e.target.checked)}
      color="primary"
    />
  }
  label={i18n.t("contacts.import.filterGroups")}
/>

<FormControlLabel
  control={
    <Checkbox
      checked={addToAgenda}
      onChange={(e) => setAddToAgenda(e.target.checked)}
      color="primary"
    />
  }
  label={i18n.t("contacts.import.addToAgenda")}
/>
```

#### Chamada API Atualizada

```javascript
// MODIFICADO: Passar novos params para API
const handleImport = async () => {
  try {
    setLoading(true);
    const { data } = await api.post("/contacts/import", {
      whatsappId: selectedWhatsappId,
      filterGroups, // NOVO
      onlyAgenda: addToAgenda // NOVO
    });

    // Exibir toast com contagem
    toast.success(
      i18n.t("contacts.import.importSuccess", {
        imported: data.imported,
        ignored: data.ignored
      })
    );

    // Invalidar lista de contatos
    onImportComplete && onImportComplete(data);
    handleClose();
  } catch (err) {
    toastError(err);
  } finally {
    setLoading(false);
  }
};
```

#### Props Novos

```javascript
// NOVO: Callback para atualizar lista após importação
interface ContactImportWpModalProps {
  isOpen: boolean;
  handleClose: () => void;
  selectedTags: number[];
  hideNum: boolean;
  userProfile: string;
  onImportComplete?: (result: { imported: number; ignored: number }) => void; // NOVO
}
```

---

### 4.3 Componente: `ContactModal/index.js`

**Arquivo:** `frontend/src/components/ContactModal/index.js`

**Modificações:**

#### Validação de Número E.164

```javascript
// NOVO: Adicionar validação Yup para E.164
const ContactSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, i18n.t("validation.tooShort"))
    .max(50, i18n.t("validation.tooLong"))
    .required(i18n.t("validation.required")),

  number: Yup.string()
    .matches(
      /^\+?\d{10,15}$/,
      i18n.t("validation.phoneInvalid") // "Número de telefone inválido (formato E.164)"
    )
    .required(i18n.t("validation.required")),

  email: Yup.string().email(i18n.t("validation.emailInvalid"))
});
```

#### Campo Hidden: source

```javascript
// NOVO: Adicionar campo hidden para source='manual'
<Formik
  initialValues={{
    name: contact?.name || "",
    number: contact?.number || "",
    email: contact?.email || "",
    source: contact?.source || "manual" // NOVO
  }}
  validationSchema={ContactSchema}
  onSubmit={(values, actions) => {
    // ...
  }}
>
  {({ values, errors, touched, handleChange, handleBlur, handleSubmit }) => (
    <Form>
      {/* Campos existentes */}

      {/* Campo hidden */}
      <input type="hidden" name="source" value={values.source} />

      <Button type="submit" color="primary" variant="contained">
        {i18n.t("contactModal.buttons.okAdd")}
      </Button>
    </Form>
  )}
</Formik>
```

---

### 4.4 Componente NOVO: `hooks/useContactFilters.js`

**Arquivo:** `frontend/src/hooks/useContactFilters.js` (criar)

**Objetivo:** Centralizar lógica de filtros e persistência no localStorage

**Código Completo:**

```javascript
// frontend/src/hooks/useContactFilters.js

import { useState, useEffect } from 'react';

/**
 * Hook customizado para gerenciar filtros de contatos
 *
 * Persiste preferências do usuário no localStorage:
 * - contacts_show_only_agenda: boolean (default: true)
 * - contacts_source_filter: string (default: 'all')
 *
 * @returns {Object} Estados e setters para filtros
 */
export const useContactFilters = () => {
  // Estado: showOnlyAgenda (default: true = "Somente meus contatos")
  const [showOnlyAgenda, setShowOnlyAgenda] = useState(() => {
    const saved = localStorage.getItem('contacts_show_only_agenda');
    // Se não houver preferência salva, usar true como default
    return saved === 'false' ? false : true;
  });

  // Estado: sourceFilter (default: 'all')
  const [sourceFilter, setSourceFilter] = useState(() => {
    const saved = localStorage.getItem('contacts_source_filter');
    return saved || 'all';
  });

  // Sincronizar showOnlyAgenda com localStorage
  useEffect(() => {
    localStorage.setItem('contacts_show_only_agenda', String(showOnlyAgenda));
  }, [showOnlyAgenda]);

  // Sincronizar sourceFilter com localStorage
  useEffect(() => {
    localStorage.setItem('contacts_source_filter', sourceFilter);
  }, [sourceFilter]);

  return {
    showOnlyAgenda,
    setShowOnlyAgenda,
    sourceFilter,
    setSourceFilter
  };
};

export default useContactFilters;
```

**Uso no Componente:**
```javascript
// frontend/src/pages/Contacts/index.js

import useContactFilters from '../../hooks/useContactFilters';

const Contacts = () => {
  const { showOnlyAgenda, setShowOnlyAgenda, sourceFilter, setSourceFilter } = useContactFilters();

  // ...resto do componente
};
```

---

### 4.5 Helper Functions (Criar)

**Arquivo:** `frontend/src/utils/contactSourceHelpers.js` (criar)

```javascript
// frontend/src/utils/contactSourceHelpers.js

import i18n from '../translate/i18n';

/**
 * Retorna o emoji correspondente à origem do contato
 * @param {string} source - Origem do contato (manual, whatsapp_roster, etc.)
 * @returns {string} Emoji
 */
export const getSourceEmoji = (source) => {
  const emojiMap = {
    manual: '🔧',
    whatsapp_roster: '📱',
    excel_import: '📊',
    auto_created: '🤖',
    chat_import: '💬'
  };
  return emojiMap[source] || '❓';
};

/**
 * Retorna o label traduzido correspondente à origem do contato
 * @param {string} source - Origem do contato
 * @returns {string} Label traduzido
 */
export const getSourceLabel = (source) => {
  const labelKeys = {
    manual: 'contacts.source.manual',
    whatsapp_roster: 'contacts.source.whatsappRoster',
    excel_import: 'contacts.source.excelImport',
    auto_created: 'contacts.source.autoCreated',
    chat_import: 'contacts.source.chatImport'
  };

  const key = labelKeys[source] || 'contacts.source.unknown';
  return i18n.t(key);
};

/**
 * Retorna a cor do Material-UI correspondente à origem
 * @param {string} source - Origem do contato
 * @returns {string} Nome da cor (primary, secondary, default, etc.)
 */
export const getSourceColor = (source) => {
  const colorMap = {
    manual: 'primary',
    whatsapp_roster: 'success',
    excel_import: 'info',
    auto_created: 'warning',
    chat_import: 'secondary'
  };
  return colorMap[source] || 'default';
};
```

---

## 5. Custom Hooks

### 5.1 Hook: `useContactFilters`

**Já especificado na seção 4.4**

**Resumo:**
- Gerencia estados `showOnlyAgenda` e `sourceFilter`
- Persiste preferências no localStorage
- Sincroniza estados com localStorage via `useEffect`

---

### 5.2 Hook Existente: `useContacts` (NÃO MODIFICAR)

**Arquivo:** `frontend/src/hooks/useContacts/index.js`

**Status:** MANTÉM INALTERADO

**Motivo:**
- Este hook não é usado na página principal `/contacts`
- É usado apenas em outros componentes (ex: `TicketsListCustom`)
- Modificar causaria side effects desnecessários

---

## 6. Estados UI (4 Obrigatórios)

### 6.1 Happy Path: Dados Carregados com Sucesso

**Quando:** API retorna lista de contatos (mesmo que vazia)

**UI:**
- Tabela renderizada com contatos
- Badge de origem visível em cada linha
- Paginação funcional
- Filtros aplicados corretamente

**Código:**
```javascript
{!loading && contacts.length > 0 && (
  <>
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell padding="checkbox" />
          <TableCell>{i18n.t("contacts.table.name")}</TableCell>
          <TableCell>{i18n.t("contacts.table.number")}</TableCell>
          <TableCell>{i18n.t("contacts.table.email")}</TableCell>
          <TableCell align="center">{i18n.t("contacts.table.source")}</TableCell>
          <TableCell align="center">{i18n.t("contacts.table.actions")}</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {contacts.map((contact) => (
          <TableRow key={contact.id}>
            <TableCell padding="checkbox">
              <Checkbox
                checked={selectedContactIds.includes(contact.id)}
                onChange={() => handleSelectContact(contact.id)}
              />
            </TableCell>
            <TableCell>{contact.name}</TableCell>
            <TableCell>{formatPhoneWithCountryFlag(contact.number)}</TableCell>
            <TableCell>{contact.email}</TableCell>
            <TableCell align="center">
              <Tooltip title={getSourceLabel(contact.source)}>
                <span role="img" aria-label={contact.source}>
                  {getSourceEmoji(contact.source)}
                </span>
              </Tooltip>
            </TableCell>
            <TableCell align="center">
              <IconButton onClick={() => handleEditContact(contact.id)}>
                <EditIcon />
              </IconButton>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>

    {/* Paginação */}
    <TablePagination
      component="div"
      count={contactsCount}
      page={pageNumber - 1}
      onPageChange={handleChangePage}
      rowsPerPage={100}
      rowsPerPageOptions={[100]}
    />
  </>
)}
```

---

### 6.2 Empty State: Nenhum Contato Encontrado

**Quando:**
- API retorna lista vazia
- Filtros ativos não retornam resultados

**UI:**
- Ícone ilustrativo (📇)
- Mensagem: "Nenhum contato encontrado"
- CTA: Botão "Importar Contatos" ou "Criar Novo Contato"

**Código:**
```javascript
{!loading && contacts.length === 0 && (
  <Paper className={classes.emptyStatePaper}>
    <Box display="flex" flexDirection="column" alignItems="center" p={4}>
      <span role="img" aria-label="contatos vazios" style={{ fontSize: 64 }}>
        📇
      </span>
      <Typography variant="h6" gutterBottom>
        {i18n.t("contacts.emptyState.title")}
      </Typography>
      <Typography variant="body2" color="textSecondary" gutterBottom>
        {showOnlyAgenda
          ? i18n.t("contacts.emptyState.descriptionAgenda")
          : i18n.t("contacts.emptyState.descriptionAll")}
      </Typography>
      <Box mt={2}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setContactModalOpen(true)}
        >
          {i18n.t("contacts.buttons.add")}
        </Button>
        <Button
          variant="outlined"
          color="primary"
          startIcon={<ImportExportIcon />}
          onClick={() => setImportContactModalOpen(true)}
          style={{ marginLeft: 8 }}
        >
          {i18n.t("contacts.buttons.import")}
        </Button>
      </Box>
    </Box>
  </Paper>
)}
```

---

### 6.3 Loading State: Carregando Dados

**Quando:**
- Primeira carga da página
- Mudança de filtros (após dispatch RESET)
- Mudança de página (paginação)

**UI:**
- Skeleton rows na tabela (Material-UI v5)
- Ou: BackdropLoading com spinner

**Opção 1: Skeleton (Recomendado)**
```javascript
{loading && (
  <Table size="small">
    <TableHead>
      <TableRow>
        <TableCell padding="checkbox" />
        <TableCell>{i18n.t("contacts.table.name")}</TableCell>
        <TableCell>{i18n.t("contacts.table.number")}</TableCell>
        <TableCell>{i18n.t("contacts.table.email")}</TableCell>
        <TableCell align="center">{i18n.t("contacts.table.source")}</TableCell>
        <TableCell align="center">{i18n.t("contacts.table.actions")}</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {[...Array(10)].map((_, index) => (
        <TableRow key={index}>
          <TableCell padding="checkbox">
            <Skeleton variant="rectangular" width={24} height={24} />
          </TableCell>
          <TableCell><Skeleton variant="text" /></TableCell>
          <TableCell><Skeleton variant="text" /></TableCell>
          <TableCell><Skeleton variant="text" /></TableCell>
          <TableCell align="center"><Skeleton variant="text" /></TableCell>
          <TableCell align="center"><Skeleton variant="circular" width={24} height={24} /></TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
)}
```

**Opção 2: BackdropLoading (Alternativa)**
```javascript
{loading && <BackdropLoading />}
```

---

### 6.4 Error State: Erro ao Carregar

**Quando:**
- API retorna erro (401, 403, 500, etc.)
- Timeout de conexão
- Erro de rede

**UI:**
- Mensagem de erro amigável
- Botão "Tentar Novamente"
- Detalhes técnicos (colapsáveis)

**Código:**
```javascript
const [error, setError] = useState(null);

// Na chamada API
try {
  const { data } = await api.get("/contacts/", { params: { ... } });
  dispatch({ type: "LOAD_CONTACTS", payload: data.contacts });
  setError(null); // Limpar erro
} catch (err) {
  setError(err);
  toastError(err);
}

// UI
{error && (
  <Paper className={classes.errorPaper}>
    <Box display="flex" flexDirection="column" alignItems="center" p={4}>
      <span role="img" aria-label="erro" style={{ fontSize: 64 }}>
        ⚠️
      </span>
      <Typography variant="h6" gutterBottom>
        {i18n.t("contacts.errorState.title")}
      </Typography>
      <Typography variant="body2" color="textSecondary" gutterBottom>
        {i18n.t("contacts.errorState.description")}
      </Typography>
      <Box mt={2}>
        <Button
          variant="contained"
          color="primary"
          startIcon={<RefreshIcon />}
          onClick={() => window.location.reload()}
        >
          {i18n.t("contacts.buttons.retry")}
        </Button>
      </Box>
      {/* Detalhes técnicos (opcional) */}
      <Accordion>
        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
          <Typography variant="caption">{i18n.t("contacts.errorState.details")}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Typography variant="caption" component="pre">
            {JSON.stringify(error, null, 2)}
          </Typography>
        </AccordionDetails>
      </Accordion>
    </Box>
  </Paper>
)}
```

---

## 7. Data Fetching e Socket.IO

### 7.1 Axios: Padrões de Requisição

#### GET `/contacts/` (Lista com Filtros)

```javascript
const fetchContacts = async () => {
  setLoading(true);
  setError(null);

  try {
    const { data } = await api.get("/contacts/", {
      params: {
        searchParam,
        pageNumber,
        contactTag: JSON.stringify(selectedTags),
        onlyAgenda: showOnlyAgenda, // NOVO
        source: sourceFilter === 'all' ? undefined : sourceFilter // NOVO
      },
    });

    dispatch({ type: "LOAD_CONTACTS", payload: data.contacts });
    setHasMore(data.hasMore);
    setContactsCount(data.count);
  } catch (err) {
    setError(err);
    toastError(err);
  } finally {
    setLoading(false);
  }
};
```

#### POST `/contacts/` (Criar Contato)

```javascript
const handleSubmitContact = async (values) => {
  try {
    const { data } = await api.post("/contacts/", {
      name: values.name,
      number: values.number,
      email: values.email,
      source: 'manual', // NOVO: Criação manual
      isInAgenda: true // NOVO
    });

    toast.success(i18n.t("contactModal.success.add"));
    handleCloseContactModal();

    // Invalidar lista (opção 1: refetch)
    dispatch({ type: "RESET" });
    fetchContacts();

    // Ou (opção 2: adicionar diretamente)
    dispatch({ type: "LOAD_CONTACTS", payload: [data] });
  } catch (err) {
    toastError(err);
  }
};
```

#### POST `/contacts/import` (Importar WhatsApp)

```javascript
const handleImportWhatsApp = async () => {
  try {
    setLoading(true);
    const { data } = await api.post("/contacts/import", {
      whatsappId: selectedWhatsappId,
      filterGroups: true, // NOVO
      onlyAgenda: true // NOVO
    });

    toast.success(
      i18n.t("contacts.import.importSuccess", {
        imported: data.imported,
        ignored: data.ignored
      })
    );

    // Invalidar lista para refetch
    dispatch({ type: "RESET" });
    fetchContacts();
  } catch (err) {
    toastError(err);
  } finally {
    setLoading(false);
  }
};
```

---

### 7.2 Socket.IO: Padrões de Listener

#### Namespace

```javascript
const companyId = user.companyId;
const namespace = `/workspace-${companyId}`; // Padrão ChatIA Flow

// Ou (se usar formato antigo):
const namespace = String(companyId);
```

#### Eventos e Payloads

**Evento:** `company-${companyId}-contact`

**Payload:**
```javascript
{
  action: 'create' | 'update' | 'delete',
  contact?: Contact, // Se action = create ou update
  contactId?: number // Se action = delete
}
```

#### Listener (Correto)

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
}, [socket, user.companyId]); // Dependências: socket E companyId
```

**Correção Aplicada:**
- Adicionar `user.companyId` nas dependências do useEffect
- Garantir que listener é removido se companyId mudar (troca de company)

---

### 7.3 Sincronização Local (Reducer)

**Fluxo Completo:**

1. **Backend cria/atualiza contato:**
   ```typescript
   const contact = await Contact.create(contactData);
   io.of(String(companyId)).emit(`company-${companyId}-contact`, {
     action: "create",
     contact
   });
   ```

2. **Frontend recebe evento via Socket.io:**
   ```javascript
   socket.on(`company-${companyId}-contact`, (data) => {
     if (data.action === "create") {
       dispatch({ type: "UPDATE_CONTACTS", payload: data.contact });
     }
   });
   ```

3. **Reducer processa:**
   ```javascript
   if (action.type === "UPDATE_CONTACTS") {
     const contact = action.payload;
     const contactIndex = state.findIndex((c) => c.id === contact.id);

     if (contactIndex !== -1) {
       // Atualizar contato existente
       state[contactIndex] = contact;
       return [...state];
     } else {
       // NÃO adicionar contato novo (filtros podem excluir)
       return state;
     }
   }
   ```

4. **UI reflete mudança:**
   - Se contato já existia: Nome/email/tags atualizados
   - Se contato era novo: NÃO aparece (respeitando filtros)

---

## 8. Plano de Commits Granulares

### Commit 1: feat(frontend): add useContactFilters hook

**Arquivos:**
- `frontend/src/hooks/useContactFilters.js` (criar)
- `frontend/src/hooks/index.js` (adicionar export)

**Checklist:**
- [ ] Criar hook `useContactFilters` com estados `showOnlyAgenda` e `sourceFilter`
- [ ] Adicionar persistência no localStorage
- [ ] Adicionar testes unitários (Jest)
- [ ] Validar que valores default são corretos (true e 'all')
- [ ] Validar que `useEffect` sincroniza com localStorage
- [ ] Documentar hook com JSDoc

**Estimativa:** 1 hora

**Dependências:** Nenhuma

**Critérios de Aceite:**
- [ ] Hook retorna `{ showOnlyAgenda, setShowOnlyAgenda, sourceFilter, setSourceFilter }`
- [ ] Valor default de `showOnlyAgenda` é `true`
- [ ] Valor default de `sourceFilter` é `'all'`
- [ ] Preferências persistem após refresh da página (F5)
- [ ] Testes unitários passam

---

### Commit 2: fix(frontend): refactor Contacts reducer to respect filters

**Arquivos:**
- `frontend/src/pages/Contacts/index.js` (modificar reducer)

**Checklist:**
- [ ] Modificar reducer `UPDATE_CONTACTS` para NÃO adicionar contatos novos
- [ ] Adicionar log de debug: `console.log('[Contacts Reducer] Socket.io event: ...')`
- [ ] Manter lógica de atualização para contatos existentes
- [ ] Adicionar comentário explicando a mudança
- [ ] Testar manualmente: Criar contato em outra aba, verificar que não aparece em lista filtrada

**Estimativa:** 1 hora

**Dependências:** Nenhuma

**Critérios de Aceite:**
- [ ] Reducer NÃO adiciona contatos novos via Socket.io (linha 91 removida)
- [ ] Reducer continua atualizando contatos existentes (in-place)
- [ ] Log de debug aparece no console ao receber evento de novo contato
- [ ] Teste manual confirma que "fantasmas" não aparecem mais

---

### Commit 3: feat(frontend): add "Meus Contatos" vs "Todos" radio group

**Arquivos:**
- `frontend/src/pages/Contacts/index.js` (adicionar UI)
- `frontend/src/translate/languages/pt.js` (adicionar chaves)

**Checklist:**
- [ ] Integrar hook `useContactFilters` em `Contacts/index.js`
- [ ] Adicionar UI: Radio Group com 2 opções
- [ ] Adicionar Material-UI v5: `<RadioGroup>`, `<FormControlLabel>`, `<Radio>`
- [ ] Adicionar invalidação ao mudar `showOnlyAgenda` (dispatch RESET)
- [ ] Atualizar chamada API com param `onlyAgenda`
- [ ] Adicionar chaves i18n: `contacts.filters.showOnlyAgenda`, `contacts.filters.showAll`
- [ ] Testar: Alternar radio → Lista atualiza

**Estimativa:** 2 horas

**Dependências:** Commit 1, Commit 2

**Critérios de Aceite:**
- [ ] Radio Group renderiza com 2 opções
- [ ] Default é "Somente meus contatos" (checked)
- [ ] Ao alternar, dispatch `RESET` é chamado
- [ ] API é chamada com `onlyAgenda=true` ou `onlyAgenda=false`
- [ ] Lista atualiza com contatos corretos
- [ ] Preferência persiste no localStorage

---

### Commit 4: feat(frontend): add source filter dropdown

**Arquivos:**
- `frontend/src/pages/Contacts/index.js` (adicionar UI)
- `frontend/src/translate/languages/pt.js` (adicionar chaves)

**Checklist:**
- [ ] Adicionar UI: Dropdown "Origem" (visível apenas se "Todos os contatos")
- [ ] Adicionar Material-UI v5: `<Select>`, `<MenuItem>`
- [ ] Adicionar 6 opções: Todos, Manual, WhatsApp, Excel, Auto-criados, Chats
- [ ] Atualizar chamada API com param `source`
- [ ] Adicionar invalidação ao mudar `sourceFilter` (dispatch RESET)
- [ ] Adicionar chaves i18n para cada opção
- [ ] Testar: Dropdown só aparece se "Todos" selecionado
- [ ] Testar: Selecionar origem → Lista filtra corretamente

**Estimativa:** 2 horas

**Dependências:** Commit 3

**Critérios de Aceite:**
- [ ] Dropdown visível APENAS se "Todos os contatos" selecionado
- [ ] Dropdown oculto se "Somente meus contatos" selecionado
- [ ] 6 opções disponíveis (Todos, Manual, WhatsApp, Excel, Auto-criados, Chats)
- [ ] Ao selecionar origem, dispatch `RESET` é chamado
- [ ] API é chamada com `source=manual` (ou outro)
- [ ] Lista exibe apenas contatos da origem selecionada

---

### Commit 5: feat(frontend): update ContactImportWpModal with new options

**Arquivos:**
- `frontend/src/components/ContactImportWpModal/index.js` (modificar)
- `frontend/src/translate/languages/pt.js` (adicionar chaves)

**Checklist:**
- [ ] Adicionar estados `filterGroups` e `addToAgenda` (ambos default true)
- [ ] Adicionar UI: 2 checkboxes no modal
- [ ] Atualizar POST `/contacts/import` com novos params
- [ ] Exibir toast com contagem de importados/ignorados
- [ ] Adicionar callback `onImportComplete` para invalidar lista
- [ ] Adicionar chaves i18n: `contacts.import.filterGroups`, `contacts.import.addToAgenda`
- [ ] Testar: Desmarcar "Filtrar grupos" → Grupos são importados
- [ ] Testar: Desmarcar "Adicionar à agenda" → `isInAgenda=false`

**Estimativa:** 2 horas

**Dependências:** Commit 4

**Critérios de Aceite:**
- [ ] Checkboxes renderizam no modal (ambos checked por default)
- [ ] API `/contacts/import` recebe params `filterGroups` e `onlyAgenda`
- [ ] Toast exibe mensagem: "150 contatos importados, 50 ignorados"
- [ ] Callback `onImportComplete` é chamado após importação
- [ ] Lista de contatos é invalidada (dispatch RESET + refetch)

---

### Commit 6: feat(frontend): add E.164 validation in ContactModal

**Arquivos:**
- `frontend/src/components/ContactModal/index.js` (modificar)
- `frontend/src/translate/languages/pt.js` (adicionar chaves)

**Checklist:**
- [ ] Adicionar validação Yup: `Yup.string().matches(/^\+?\d{10,15}$/)`
- [ ] Adicionar campo hidden `source='manual'` no Formik
- [ ] Exibir mensagem de erro se número for inválido
- [ ] Adicionar chave i18n: `validation.phoneInvalid`
- [ ] Testar: Inserir número inválido "123" → Erro exibido
- [ ] Testar: Inserir número válido "+5511999999999" → Aceito
- [ ] Testar: Backend normaliza número corretamente

**Estimativa:** 1.5 horas

**Dependências:** Commit 5

**Critérios de Aceite:**
- [ ] Validação rejeita números com < 10 dígitos (ex: "123")
- [ ] Validação rejeita números com > 15 dígitos
- [ ] Validação aceita números E.164 válidos (ex: "+5511999999999")
- [ ] Campo hidden `source` tem valor "manual"
- [ ] POST `/contacts/` envia `source='manual'`
- [ ] Mensagem de erro amigável é exibida

---

### Commit 7: feat(frontend): add source badge in contact list rows

**Arquivos:**
- `frontend/src/pages/Contacts/index.js` (adicionar coluna)
- `frontend/src/utils/contactSourceHelpers.js` (criar)
- `frontend/src/translate/languages/pt.js` (adicionar chaves)

**Checklist:**
- [ ] Criar helper functions: `getSourceEmoji()`, `getSourceLabel()`
- [ ] Adicionar coluna "Origem" na tabela de contatos
- [ ] Adicionar Tooltip com descrição completa
- [ ] Adicionar emojis: 🔧 📱 📊 🤖 💬
- [ ] Adicionar chaves i18n para cada origem
- [ ] Testar: Badge aparece corretamente em cada linha
- [ ] Testar: Tooltip mostra descrição ao hover

**Estimativa:** 2 horas

**Dependências:** Commit 6

**Critérios de Aceite:**
- [ ] Badge 🔧 aparece para contatos `source='manual'`
- [ ] Badge 📱 aparece para contatos `source='whatsapp_roster'`
- [ ] Badge 📊 aparece para contatos `source='excel_import'`
- [ ] Badge 🤖 aparece para contatos `source='auto_created'`
- [ ] Badge 💬 aparece para contatos `source='chat_import'`
- [ ] Tooltip mostra descrição completa ao passar o mouse
- [ ] Coluna "Origem" é centralizada na tabela

---

### Commit 8: test(frontend): add E2E tests for contact filters

**Arquivos:**
- `frontend/__tests__/e2e/contacts-filters.spec.js` (criar)
- `playwright.config.js` (verificar configuração)

**Checklist:**
- [ ] Criar teste E2E: Selecionar "Somente meus contatos" → Lista atualiza
- [ ] Criar teste E2E: Socket.io NÃO adiciona contatos fora do filtro
- [ ] Criar teste E2E: Importação WhatsApp com filtros
- [ ] Criar teste E2E: Dropdown "Origem" filtra corretamente
- [ ] Validar que testes passam localmente (Playwright)
- [ ] Documentar setup necessário (seed data, mocks)

**Estimativa:** 3 horas

**Dependências:** Commit 7

**Critérios de Aceite:**
- [ ] Teste 1 passa: Filtro "Somente meus contatos" funciona
- [ ] Teste 2 passa: Socket.io não adiciona "fantasmas"
- [ ] Teste 3 passa: Importação WhatsApp com filtros
- [ ] Teste 4 passa: Dropdown "Origem" filtra corretamente
- [ ] Todos os testes passam no CI/CD

---

## 9. Estratégia de Testes E2E

### 9.1 Ferramentas

- **Framework:** Playwright (já usado no ChatIA Flow)
- **Linguagem:** JavaScript/TypeScript
- **Browser:** Chromium (headless no CI, headed localmente)

---

### 9.2 Teste 1: Filtro "Somente Meus Contatos"

**Arquivo:** `frontend/__tests__/e2e/contacts-filters.spec.js`

```javascript
import { test, expect } from '@playwright/test';

test.describe('Contacts Filters', () => {
  test.beforeEach(async ({ page }) => {
    // Setup: Login e navegar para /contacts
    await page.goto('http://localhost:3000/login');
    await page.fill('input[name="email"]', 'admin@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');
    await page.waitForURL('**/tickets');

    await page.goto('http://localhost:3000/contacts');
    await page.waitForSelector('h1:has-text("Contatos")');
  });

  test('should filter contacts by isInAgenda', async ({ page }) => {
    // Verificar que default é "Somente meus contatos"
    const radioOnlyAgenda = page.locator('input[value="only_agenda"]');
    await expect(radioOnlyAgenda).toBeChecked();

    // Contar contatos na lista (deve ser apenas agenda)
    const agendaContactsCount = await page.locator('table tbody tr').count();
    console.log('Contatos na agenda:', agendaContactsCount);

    // Alternar para "Todos os contatos"
    await page.click('input[value="all"]');

    // Aguardar refetch (API response)
    await page.waitForResponse((response) =>
      response.url().includes('/contacts') && response.status() === 200
    );

    // Contar novamente (deve ser maior ou igual)
    const allContactsCount = await page.locator('table tbody tr').count();
    console.log('Todos os contatos:', allContactsCount);

    expect(allContactsCount).toBeGreaterThanOrEqual(agendaContactsCount);
  });
});
```

---

### 9.3 Teste 2: Socket.io Não Adiciona Contatos Fora do Filtro

```javascript
test('should not add new contacts via Socket.io when filters are active', async ({ page, context }) => {
  // Setup: Filtrar por tag "VIP"
  await page.goto('http://localhost:3000/contacts?contactTag=[1]');
  await page.waitForSelector('table tbody tr');

  const initialCount = await page.locator('table tbody tr').count();
  console.log('Contatos iniciais (VIP):', initialCount);

  // Abrir nova aba e criar contato SEM tag "VIP"
  const newPage = await context.newPage();
  await newPage.goto('http://localhost:3000/contacts');
  await newPage.click('button:has-text("Novo Contato")');
  await newPage.fill('input[name="name"]', 'Contato Fantasma');
  await newPage.fill('input[name="number"]', '+5511999999999');
  await newPage.click('button:has-text("Adicionar")');

  // Aguardar confirmação
  await newPage.waitForSelector('.Toastify__toast--success');
  await newPage.close();

  // Aguardar 2 segundos (tempo para Socket.io processar)
  await page.waitForTimeout(2000);

  // Verificar que contato NÃO foi adicionado na página original (count permanece o mesmo)
  const finalCount = await page.locator('table tbody tr').count();
  console.log('Contatos finais (VIP):', finalCount);

  expect(finalCount).toBe(initialCount);
});
```

---

### 9.4 Teste 3: Importação WhatsApp com Filtros

```javascript
test('should import WhatsApp contacts with filters', async ({ page }) => {
  // Setup
  await page.goto('http://localhost:3000/contacts');
  await page.click('button:has-text("Importar/Exportar")');
  await page.click('text=Importar do WhatsApp');

  // Aguardar modal abrir
  await page.waitForSelector('div[role="dialog"]');

  // Selecionar conexão WhatsApp
  await page.selectOption('select[name="whatsappId"]', '1');

  // Marcar opções
  await page.check('input[name="filterGroups"]'); // Filtrar grupos
  await page.check('input[name="addToAgenda"]'); // Adicionar à agenda

  // Confirmar importação
  await page.click('button:has-text("Importar")');

  // Aguardar resposta da API
  await page.waitForResponse((response) =>
    response.url().includes('/contacts/import') && response.status() === 200
  );

  // Verificar toast de sucesso
  const toast = page.locator('.Toastify__toast--success');
  await expect(toast).toContainText('importados');

  // Extrair números do toast (ex: "150 contatos importados")
  const toastText = await toast.textContent();
  console.log('Toast:', toastText);

  expect(toastText).toMatch(/\d+ contatos importados/);
});
```

---

### 9.5 Teste 4: Dropdown "Origem" Filtra Corretamente

```javascript
test('should filter contacts by source', async ({ page }) => {
  // Setup: Selecionar "Todos os contatos"
  await page.goto('http://localhost:3000/contacts');
  await page.click('input[value="all"]');

  // Aguardar dropdown aparecer
  await page.waitForSelector('select[name="sourceFilter"]', { state: 'visible' });

  // Selecionar origem "Manual"
  await page.selectOption('select[name="sourceFilter"]', 'manual');

  // Aguardar refetch
  await page.waitForResponse((response) =>
    response.url().includes('/contacts') &&
    response.url().includes('source=manual') &&
    response.status() === 200
  );

  // Verificar que todos os contatos têm badge 🔧
  const badges = page.locator('table tbody tr td:last-child span[role="img"]');
  const badgeCount = await badges.count();

  for (let i = 0; i < badgeCount; i++) {
    const badgeText = await badges.nth(i).textContent();
    expect(badgeText).toBe('🔧');
  }
});
```

---

## 10. Acessibilidade (A11y)

### 10.1 Checklist WCAG AA

**Requisitos Mínimos:**
- [x] Contraste mínimo 4.5:1 (texto normal)
- [x] Contraste mínimo 3:1 (texto grande e ícones)
- [x] ARIA labels em todos os elementos interativos
- [x] Navegação por teclado (Tab, Enter, Esc)
- [x] Focus indicators visíveis (outline ou ring)
- [x] Screen reader compatibility

---

### 10.2 Radio Group

**Requisitos:**
- Grupo de rádios deve ter `<fieldset>` e `<legend>`
- Cada opção deve ter `<label>` associado
- Seleção deve ser visível (outline)

**Código:**
```jsx
<FormControl component="fieldset">
  <FormLabel component="legend" id="contact-filter-legend">
    {i18n.t("contacts.filters.showLabel")}
  </FormLabel>
  <RadioGroup
    aria-labelledby="contact-filter-legend"
    name="contact-filter"
    value={showOnlyAgenda ? 'only_agenda' : 'all'}
    onChange={(e) => setShowOnlyAgenda(e.target.value === 'only_agenda')}
  >
    <FormControlLabel
      value="all"
      control={<Radio />}
      label={i18n.t("contacts.filters.showAll")}
    />
    <FormControlLabel
      value="only_agenda"
      control={<Radio />}
      label={i18n.t("contacts.filters.showOnlyAgenda")}
    />
  </RadioGroup>
</FormControl>
```

**Navegação por Teclado:**
- Tab: Focar no grupo de rádios
- Seta para cima/baixo: Alternar entre opções
- Enter/Espaço: Selecionar opção

---

### 10.3 Dropdown "Origem"

**Requisitos:**
- Dropdown deve ter `<label>` associado via `id`
- Seleção deve ser anunciada por screen reader
- Focus deve ser visível

**Código:**
```jsx
<FormControl fullWidth>
  <InputLabel id="source-filter-label">
    {i18n.t("contacts.filters.source")}
  </InputLabel>
  <Select
    labelId="source-filter-label"
    id="source-filter"
    value={sourceFilter}
    label={i18n.t("contacts.filters.source")}
    onChange={(e) => setSourceFilter(e.target.value)}
    aria-describedby="source-filter-description"
  >
    <MenuItem value="all">{i18n.t("contacts.filters.sourceAll")}</MenuItem>
    <MenuItem value="manual">{i18n.t("contacts.filters.sourceManual")}</MenuItem>
    {/* ... */}
  </Select>
  <FormHelperText id="source-filter-description">
    {i18n.t("contacts.filters.sourceDescription")}
  </FormHelperText>
</FormControl>
```

**Navegação por Teclado:**
- Tab: Focar no dropdown
- Enter/Espaço: Abrir lista de opções
- Seta para cima/baixo: Navegar entre opções
- Enter: Selecionar opção
- Esc: Fechar dropdown sem selecionar

---

### 10.4 Badge de Origem (Tooltip)

**Requisitos:**
- Emoji deve ter `role="img"` e `aria-label`
- Tooltip deve ser anunciado por screen reader
- Tooltip deve aparecer ao focar (não apenas hover)

**Código:**
```jsx
<Tooltip title={getSourceLabel(contact.source)} arrow>
  <span
    role="img"
    aria-label={getSourceLabel(contact.source)}
    tabIndex={0} // Permite focar com Tab
    style={{ cursor: 'help' }}
  >
    {getSourceEmoji(contact.source)}
  </span>
</Tooltip>
```

**Navegação por Teclado:**
- Tab: Focar no badge
- Tooltip aparece automaticamente ao focar

---

### 10.5 Tabela de Contatos

**Requisitos:**
- Tabela deve ter `<caption>` ou `aria-label`
- Headers devem usar `<th scope="col">`
- Células devem usar `<td>`

**Código:**
```jsx
<Table aria-label={i18n.t("contacts.table.ariaLabel")}>
  <TableHead>
    <TableRow>
      <TableCell padding="checkbox">
        <Checkbox
          indeterminate={selectedContactIds.length > 0 && selectedContactIds.length < contacts.length}
          checked={isSelectAllChecked}
          onChange={handleSelectAll}
          inputProps={{ 'aria-label': i18n.t("contacts.table.selectAll") }}
        />
      </TableCell>
      <TableCell>{i18n.t("contacts.table.name")}</TableCell>
      <TableCell>{i18n.t("contacts.table.number")}</TableCell>
      <TableCell>{i18n.t("contacts.table.email")}</TableCell>
      <TableCell align="center">{i18n.t("contacts.table.source")}</TableCell>
      <TableCell align="center">{i18n.t("contacts.table.actions")}</TableCell>
    </TableRow>
  </TableHead>
  <TableBody>
    {contacts.map((contact) => (
      <TableRow key={contact.id}>
        {/* ... células ... */}
      </TableRow>
    ))}
  </TableBody>
</Table>
```

---

### 10.6 Botões de Ação

**Requisitos:**
- Ícones sem texto devem ter `aria-label`
- Botões devem ter focus visível
- Botões desabilitados devem ter `aria-disabled="true"`

**Código:**
```jsx
<IconButton
  onClick={() => handleEditContact(contact.id)}
  aria-label={i18n.t("contacts.buttons.edit", { name: contact.name })}
  size="small"
>
  <EditIcon />
</IconButton>

<IconButton
  onClick={() => handleDeleteContact(contact.id)}
  aria-label={i18n.t("contacts.buttons.delete", { name: contact.name })}
  size="small"
  disabled={!canDeleteContact}
  aria-disabled={!canDeleteContact}
>
  <DeleteIcon />
</IconButton>
```

---

## 11. Internacionalização (i18n)

### 11.1 Chaves de Tradução (pt.js)

**Arquivo:** `frontend/src/translate/languages/pt.js`

**Adicionar no objeto `contacts`:**

```javascript
contacts: {
  // ... chaves existentes ...

  filters: {
    showLabel: "Mostrar",
    showAll: "Todos os contatos (auto-criados, importados, manuais)",
    showOnlyAgenda: "Somente meus contatos (agenda)",
    source: "Origem",
    sourceDescription: "Filtrar contatos por origem de criação",
    sourceAll: "Todos",
    sourceManual: "Manual",
    sourceWhatsappRoster: "WhatsApp (agenda)",
    sourceExcelImport: "Excel/CSV",
    sourceAutoCreated: "Auto-criados",
    sourceChatImport: "Importados de chats"
  },

  source: {
    manual: "Criado manualmente",
    whatsappRoster: "Importado da agenda WhatsApp",
    excelImport: "Importado de Excel/CSV",
    autoCreated: "Criado automaticamente ao receber mensagem",
    chatImport: "Importado de chats ativos",
    unknown: "Origem desconhecida"
  },

  import: {
    filterGroups: "Filtrar grupos",
    addToAgenda: "Adicionar à minha agenda",
    importSuccess: "{{imported}} contatos importados, {{ignored}} ignorados"
  },

  emptyState: {
    title: "Nenhum contato encontrado",
    descriptionAgenda: "Você ainda não possui contatos na sua agenda. Crie manualmente ou importe do WhatsApp.",
    descriptionAll: "Nenhum contato disponível. Ajuste os filtros ou crie um novo contato."
  },

  errorState: {
    title: "Erro ao carregar contatos",
    description: "Não foi possível carregar a lista de contatos. Verifique sua conexão e tente novamente.",
    details: "Detalhes técnicos"
  },

  table: {
    ariaLabel: "Lista de contatos",
    selectAll: "Selecionar todos os contatos",
    source: "Origem",
    // ... outras chaves existentes ...
  }
},

validation: {
  phoneInvalid: "Número de telefone inválido (formato E.164: +5511999999999)",
  // ... outras validações ...
}
```

---

### 11.2 Chaves de Tradução (en.js)

**Arquivo:** `frontend/src/translate/languages/en.js`

```javascript
contacts: {
  filters: {
    showLabel: "Show",
    showAll: "All contacts (auto-created, imported, manual)",
    showOnlyAgenda: "My contacts only (agenda)",
    source: "Source",
    sourceDescription: "Filter contacts by creation source",
    sourceAll: "All",
    sourceManual: "Manual",
    sourceWhatsappRoster: "WhatsApp (roster)",
    sourceExcelImport: "Excel/CSV",
    sourceAutoCreated: "Auto-created",
    sourceChatImport: "Imported from chats"
  },

  source: {
    manual: "Created manually",
    whatsappRoster: "Imported from WhatsApp roster",
    excelImport: "Imported from Excel/CSV",
    autoCreated: "Auto-created when message received",
    chatImport: "Imported from active chats",
    unknown: "Unknown source"
  },

  import: {
    filterGroups: "Filter groups",
    addToAgenda: "Add to my agenda",
    importSuccess: "{{imported}} contacts imported, {{ignored}} ignored"
  },

  emptyState: {
    title: "No contacts found",
    descriptionAgenda: "You don't have contacts in your agenda yet. Create manually or import from WhatsApp.",
    descriptionAll: "No contacts available. Adjust filters or create a new contact."
  },

  errorState: {
    title: "Error loading contacts",
    description: "Could not load contact list. Check your connection and try again.",
    details: "Technical details"
  },

  table: {
    ariaLabel: "Contact list",
    selectAll: "Select all contacts",
    source: "Source"
  }
},

validation: {
  phoneInvalid: "Invalid phone number (E.164 format: +5511999999999)"
}
```

---

### 11.3 Chaves de Tradução (es.js, tr.js, ar.js)

**Replicar estrutura para os 3 idiomas restantes:**
- es.js (Espanhol)
- tr.js (Turco)
- ar.js (Árabe)

**Exemplo (Espanhol):**
```javascript
contacts: {
  filters: {
    showLabel: "Mostrar",
    showAll: "Todos los contactos (auto-creados, importados, manuales)",
    showOnlyAgenda: "Solo mis contactos (agenda)",
    // ...
  }
}
```

---

### 11.4 Uso no Código

**Padrão:**
```javascript
import { i18n } from '../translate/i18n';

// Em componentes funcionais
const { t } = useTranslation();

// Uso direto
const label = t("contacts.filters.showOnlyAgenda");

// Uso com interpolação
const message = t("contacts.import.importSuccess", {
  imported: 150,
  ignored: 50
});
```

---

## 12. Material-UI v4/v5 Strategy

### 12.1 Estratégia de Versões

**Regra Geral:**
- **v4:** Usar APENAS para layouts existentes (LoggedInLayout, MainContainer, MainHeader, Title)
- **v5:** Usar para TODOS os novos componentes (Table, Dialog, TextField, Select, etc.)

**Motivo:**
- ChatIA Flow está em migração gradual de v4 para v5
- Novos componentes devem usar v5 para facilitar migração futura
- Layouts antigos mantêm v4 para evitar quebrar páginas existentes

---

### 12.2 Componentes v4 (Manter)

**Usados na Página `/contacts`:**

```javascript
// Imports v4
import { makeStyles } from "@material-ui/core/styles";
import MainContainer from "../../components/MainContainer"; // v4
import MainHeader from "../../components/MainHeader"; // v4
import Title from "../../components/Title"; // v4

// Layout
<MainContainer className={classes.mainContainer}>
  <MainHeader>
    <Title>{i18n.t("contacts.title")} ({contactsCount})</Title>
    <MainHeaderButtonsWrapper>
      {/* Botões */}
    </MainHeaderButtonsWrapper>
  </MainHeader>

  {/* Conteúdo (v5) */}
</MainContainer>
```

---

### 12.3 Componentes v5 (Novos)

**Imports:**
```javascript
// Imports v5
import {
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  TablePagination,
  Radio,
  RadioGroup,
  FormControl,
  FormControlLabel,
  FormLabel,
  Select,
  MenuItem,
  InputLabel,
  Tooltip,
  Skeleton,
  Paper,
  Box,
  Typography,
  Button,
  Checkbox
} from '@mui/material';
```

**Exemplo de Uso:**
```jsx
// Radio Group (v5)
<FormControl component="fieldset">
  <FormLabel component="legend">
    {i18n.t("contacts.filters.showLabel")}
  </FormLabel>
  <RadioGroup
    value={showOnlyAgenda ? 'only_agenda' : 'all'}
    onChange={(e) => setShowOnlyAgenda(e.target.value === 'only_agenda')}
  >
    <FormControlLabel
      value="all"
      control={<Radio />}
      label={i18n.t("contacts.filters.showAll")}
    />
    <FormControlLabel
      value="only_agenda"
      control={<Radio />}
      label={i18n.t("contacts.filters.showOnlyAgenda")}
    />
  </RadioGroup>
</FormControl>

// Select (v5)
<FormControl fullWidth>
  <InputLabel id="source-filter-label">
    {i18n.t("contacts.filters.source")}
  </InputLabel>
  <Select
    labelId="source-filter-label"
    value={sourceFilter}
    label={i18n.t("contacts.filters.source")}
    onChange={(e) => setSourceFilter(e.target.value)}
  >
    <MenuItem value="all">{i18n.t("contacts.filters.sourceAll")}</MenuItem>
    <MenuItem value="manual">{i18n.t("contacts.filters.sourceManual")}</MenuItem>
  </Select>
</FormControl>
```

---

### 12.4 Estilos (makeStyles vs sx)

**v4 (makeStyles):**
```javascript
import { makeStyles } from "@material-ui/core/styles";

const useStyles = makeStyles((theme) => ({
  mainContainer: {
    flex: 1,
    padding: theme.spacing(1),
    overflowY: "scroll",
    ...theme.scrollbarStyles,
  },
  filterPaper: {
    padding: theme.spacing(2),
    marginBottom: theme.spacing(2)
  }
}));

// Uso
const classes = useStyles();
<MainContainer className={classes.mainContainer}>
```

**v5 (sx prop):**
```jsx
<Paper
  sx={{
    padding: 2,
    marginBottom: 2,
    backgroundColor: (theme) => theme.palette.background.paper
  }}
>
  {/* Conteúdo */}
</Paper>

<Box
  display="flex"
  flexDirection="column"
  alignItems="center"
  p={4}
>
  {/* Empty state */}
</Box>
```

**Recomendação:**
- Usar `makeStyles` apenas para estilos de layout v4 (MainContainer, etc.)
- Usar `sx` prop para novos componentes v5
- Facilita migração futura (sx é compatível com v5)

---

### 12.5 Compatibilidade Theme

**ChatIA Flow usa theme customizado:**

```javascript
// frontend/src/layout/themeLight.js
const theme = createTheme({
  palette: {
    primary: { main: '#6B46C1' },
    secondary: { main: '#F59E0B' },
    background: {
      default: '#FAFAFA',
      paper: '#FFFFFF'
    }
  },
  // ...
});
```

**Acessar no sx:**
```jsx
<Paper
  sx={{
    backgroundColor: (theme) => theme.palette.background.paper,
    borderRadius: (theme) => theme.spacing(1)
  }}
>
```

**Acessar no makeStyles:**
```javascript
const useStyles = makeStyles((theme) => ({
  paper: {
    backgroundColor: theme.palette.background.paper,
    borderRadius: theme.spacing(1)
  }
}));
```

---

## Conclusão

Este documento especifica completamente:
- ✅ UX do filtro "Meus Contatos" vs "Todos" (mockups ASCII, fluxos de usuário)
- ✅ Política de cache React State (correção de H3 - reducer refatorado)
- ✅ Refatoração do Reducer (linha 91 corrigida)
- ✅ Componentes afetados (4 existentes + 1 novo hook)
- ✅ Custom Hooks (`useContactFilters` com localStorage)
- ✅ 4 Estados UI obrigatórios (Happy, Empty, Loading, Error)
- ✅ Data Fetching (Axios) e Socket.IO (padrões corretos)
- ✅ Plano de commits granulares (8 commits frontend-only)
- ✅ Estratégia de testes E2E (Playwright com 4 testes)
- ✅ Acessibilidade WCAG AA (checklist completa)
- ✅ Internacionalização (5 idiomas: pt, en, es, tr, ar)
- ✅ Material-UI v4/v5 strategy (layouts v4, novos componentes v5)

**Próximos Passos:**
1. Implementar commits 1-8 (frontend)
2. Testar localmente após cada commit
3. Executar testes E2E (Playwright)
4. Validar acessibilidade (axe-core)
5. Deploy em staging
6. Validação com usuários reais

---

**planner-frontend=done**
