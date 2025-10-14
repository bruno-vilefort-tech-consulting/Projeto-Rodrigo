# Plano de Implementação: SearchBar no CompaniesManager

## 1. Contexto do Projeto

**Localização:** `/frontend/src/components/CompaniesManager/index.js` (linhas 541-684)

**Página:** `/settings` → Tab "Empresas" (`/frontend/src/pages/SettingsCustom/index.js:184`)

**Stack Técnico:**
- React 17.0.2 com hooks funcionais
- Material-UI v4 (NÃO v5 - manter consistência com projeto)
- Axios para requisições HTTP
- use-debounce v7.0.0 (já instalado)
- i18n com suporte a 5 idiomas (pt, en, es, tr, ar)

**Padrão de Referência:**
O componente `/frontend/src/pages/Companies/index.js` (linhas 304-316) implementa SearchBar com debounce local usando `useMemo`. Este é o padrão aprovado para busca client-side no projeto.

**Decisão Arquitetural:**
Após análise do código de referência (`/frontend/src/pages/Companies/index.js:115-125`), a implementação usará **busca local** (filtro client-side) com `useMemo`, não busca server-side. Esta decisão simplifica a implementação e segue o padrão já estabelecido no projeto.

---

## 2. Tarefas por Commit (8 commits)

### **Commit 1: Adicionar imports e estado searchTerm**
**Estimativa:** 30 minutos

**Arquivos:**
- `/frontend/src/components/CompaniesManager/index.js`

**Checklist:**
- [ ] Importar `useDebounce` de 'use-debounce' (linha 2, após imports React)
- [ ] Importar `InputAdornment`, `IconButton` de '@material-ui/core' (linha 2-17)
- [ ] Importar `SearchIcon`, `ClearIcon` de '@material-ui/icons' (linha 22-23)
- [ ] Adicionar estado `searchTerm` inicializado como string vazia (linha 545, após estado `loading`)
- [ ] Adicionar estado `debouncedSearch` usando useDebounce com delay 400ms
- [ ] Verificar que imports não quebram build

**Dependências:** Nenhuma

**Código Sugerido:**
```javascript
// Linha 1 - Adicionar ao import React
import React, { useState, useEffect, useMemo } from "react";

// Linha 2-17 - Atualizar imports Material-UI
import {
  makeStyles,
  Paper,
  Grid,
  FormControl,
  InputLabel,
  MenuItem,
  TextField,
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
  IconButton,
  Select,
  InputAdornment, // NOVO
} from "@material-ui/core";

// Linha 22-23 - Adicionar imports de ícones
import { Edit as EditIcon } from "@material-ui/icons";
import SearchIcon from "@material-ui/icons/Search"; // NOVO
import ClearIcon from "@material-ui/icons/Clear"; // NOVO

// Linha 31 - Adicionar import useDebounce
import { useDebounce } from 'use-debounce';

// Linha 545 - Adicionar estados (após linha 546)
const [searchTerm, setSearchTerm] = useState("");
const [debouncedSearch] = useDebounce(searchTerm, 400);
```

---

### **Commit 2: Implementar lógica de filtragem com useMemo**
**Estimativa:** 1 hora

**Arquivos:**
- `/frontend/src/components/CompaniesManager/index.js`

**Checklist:**
- [ ] Criar `filteredRecords` usando `useMemo` para filtrar records baseado em `debouncedSearch`
- [ ] Filtrar por: name, email, phone (campos textuais relevantes)
- [ ] Usar `.toLowerCase()` para case-insensitive search
- [ ] Adicionar verificação de valores null/undefined com optional chaining
- [ ] Testar lógica com console.log temporário

**Dependências:** Commit 1

**Código Sugerido:**
```javascript
// Linha 561 - Adicionar após useEffect de loadPlans (logo antes de loadPlans function)
const filteredRecords = useMemo(() => {
  if (!debouncedSearch) return records;

  const term = debouncedSearch.toLowerCase();
  return records.filter(company =>
    company.name?.toLowerCase().includes(term) ||
    company.email?.toLowerCase().includes(term) ||
    company.phone?.includes(term) ||
    company.document?.includes(term)
  );
}, [records, debouncedSearch]);
```

---

### **Commit 3: Criar componente SearchBar inline**
**Estimativa:** 1.5 horas

**Arquivos:**
- `/frontend/src/components/CompaniesManager/index.js`

**Checklist:**
- [ ] Criar TextField com variant="outlined" (v4)
- [ ] Adicionar placeholder com i18n key temporária
- [ ] Configurar InputProps com startAdornment (SearchIcon)
- [ ] Configurar InputProps com endAdornment (ClearIcon) condicional
- [ ] Adicionar onChange handler para setSearchTerm
- [ ] Adicionar fullWidth e margin="dense"
- [ ] Testar visualmente que campo renderiza corretamente
- [ ] Testar que digitação atualiza estado

**Dependências:** Commit 1, Commit 2

**Código Sugerido:**
```javascript
// Linha 660 - Adicionar ANTES de <Grid xs={12} item> que contém CompanyForm
// (Criar novo Grid item para o SearchBar)
<Grid xs={12} item>
  <TextField
    placeholder="Buscar empresas..." // Temporário - será i18n no Commit 6
    type="search"
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    variant="outlined"
    fullWidth
    margin="dense"
    InputProps={{
      startAdornment: (
        <InputAdornment position="start">
          <SearchIcon />
        </InputAdornment>
      ),
      endAdornment: searchTerm && (
        <InputAdornment position="end">
          <IconButton
            onClick={() => setSearchTerm("")}
            edge="end"
            size="small"
          >
            <ClearIcon />
          </IconButton>
        </InputAdornment>
      )
    }}
  />
</Grid>
```

---

### **Commit 4: Integrar filteredRecords com CompaniesManagerGrid**
**Estimativa:** 30 minutos

**Arquivos:**
- `/frontend/src/components/CompaniesManager/index.js`

**Checklist:**
- [ ] Substituir prop `records` por `filteredRecords` em `<CompaniesManagerGrid />`
- [ ] Verificar que tabela atualiza ao digitar no SearchBar
- [ ] Testar que filtro funciona case-insensitive
- [ ] Testar que clear button limpa busca e mostra todos registros
- [ ] Testar edge cases: busca vazia, sem resultados, caracteres especiais

**Dependências:** Commit 2, Commit 3

**Código Sugerido:**
```javascript
// Linha 670 - Modificar linha existente
<CompaniesManagerGrid records={filteredRecords} onSelect={handleSelect} />
```

---

### **Commit 5: Adicionar feature flag check**
**Estimativa:** 45 minutos

**Arquivos:**
- `/frontend/src/components/CompaniesManager/index.js`
- `/frontend/.env.example` (criar entrada para documentação)

**Checklist:**
- [ ] Envolver Grid do SearchBar com condicional de feature flag
- [ ] Usar `process.env.REACT_APP_FEATURE_COMPANY_SEARCH !== 'false'`
- [ ] Adicionar comentário explicativo sobre feature flag
- [ ] Documentar variável em .env.example
- [ ] Testar que SearchBar desaparece quando flag=false
- [ ] Testar que filteredRecords ainda funciona (usa records quando SearchBar oculto)

**Dependências:** Commit 3

**Código Sugerido:**
```javascript
// Linha 660 - Envolver Grid do SearchBar
{process.env.REACT_APP_FEATURE_COMPANY_SEARCH !== 'false' && (
  <Grid xs={12} item>
    <TextField
      placeholder="Buscar empresas..."
      type="search"
      value={searchTerm}
      onChange={(e) => setSearchTerm(e.target.value)}
      variant="outlined"
      fullWidth
      margin="dense"
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <SearchIcon />
          </InputAdornment>
        ),
        endAdornment: searchTerm && (
          <InputAdornment position="end">
            <IconButton
              onClick={() => setSearchTerm("")}
              edge="end"
              size="small"
            >
              <ClearIcon />
            </IconButton>
          </InputAdornment>
        )
      }}
    />
  </Grid>
)}
```

**Arquivo: `/frontend/.env.example`**
```bash
# Feature Flags
REACT_APP_FEATURE_COMPANY_SEARCH=true # Habilita busca no CompaniesManager
```

---

### **Commit 6: Adicionar traduções i18n (5 idiomas)**
**Estimativa:** 1 hora

**Arquivos:**
- `/frontend/src/translate/languages/pt.js`
- `/frontend/src/translate/languages/en.js`
- `/frontend/src/translate/languages/es.js`
- `/frontend/src/translate/languages/tr.js`
- `/frontend/src/translate/languages/ar.js`
- `/frontend/src/components/CompaniesManager/index.js`

**Checklist:**
- [ ] Adicionar keys na seção `compaies.table` (seguindo padrão existente linha 2101)
- [ ] Criar keys: `search`, `searchPlaceholder`, `searchLabel`, `clearSearch`
- [ ] Traduzir para os 5 idiomas
- [ ] Substituir placeholder hardcoded por `i18n.t("compaies.table.searchPlaceholder")`
- [ ] Adicionar aria-label com `i18n.t("compaies.table.searchLabel")`
- [ ] Testar com cada idioma manualmente

**Dependências:** Commit 3

**Código Sugerido - Traduções:**

**pt.js (linha ~2130, após `no: "Não",`):**
```javascript
search: "Buscar",
searchPlaceholder: "Buscar empresas por nome, email ou telefone...",
searchLabel: "Campo de busca de empresas",
clearSearch: "Limpar busca",
```

**en.js:**
```javascript
search: "Search",
searchPlaceholder: "Search companies by name, email or phone...",
searchLabel: "Company search field",
clearSearch: "Clear search",
```

**es.js:**
```javascript
search: "Buscar",
searchPlaceholder: "Buscar empresas por nombre, email o teléfono...",
searchLabel: "Campo de búsqueda de empresas",
clearSearch: "Limpiar búsqueda",
```

**tr.js:**
```javascript
search: "Ara",
searchPlaceholder: "Şirketleri ad, e-posta veya telefona göre ara...",
searchLabel: "Şirket arama alanı",
clearSearch: "Aramayı temizle",
```

**ar.js:**
```javascript
search: "بحث",
searchPlaceholder: "البحث عن الشركات بالاسم أو البريد الإلكتروني أو الهاتف...",
searchLabel: "حقل البحث عن الشركات",
clearSearch: "مسح البحث",
```

**CompaniesManager/index.js (linha 660):**
```javascript
<TextField
  placeholder={i18n.t("compaies.table.searchPlaceholder")}
  type="search"
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
  variant="outlined"
  fullWidth
  margin="dense"
  InputProps={{
    startAdornment: (
      <InputAdornment position="start">
        <SearchIcon />
      </InputAdornment>
    ),
    endAdornment: searchTerm && (
      <InputAdornment position="end">
        <IconButton
          onClick={() => setSearchTerm("")}
          edge="end"
          size="small"
          aria-label={i18n.t("compaies.table.clearSearch")}
        >
          <ClearIcon />
        </IconButton>
      </InputAdornment>
    )
  }}
  inputProps={{
    "aria-label": i18n.t("compaies.table.searchLabel"),
  }}
/>
```

---

### **Commit 7: Adicionar acessibilidade (A11y)**
**Estimativa:** 1 hora

**Arquivos:**
- `/frontend/src/components/CompaniesManager/index.js`

**Checklist:**
- [ ] Adicionar aria-label no TextField (via inputProps)
- [ ] Adicionar aria-label no IconButton de clear
- [ ] Testar navegação por teclado: Tab para focar, Enter para limpar
- [ ] Testar com leitor de tela (VoiceOver/NVDA)
- [ ] Adicionar onKeyDown para Esc limpar busca
- [ ] Verificar contraste de cores (4.5:1 mínimo WCAG AA)
- [ ] Testar focus indicator visível

**Dependências:** Commit 6

**Código Sugerido:**
```javascript
// Linha 660 - Adicionar handlers de teclado
const handleSearchKeyDown = (e) => {
  if (e.key === 'Escape') {
    setSearchTerm("");
  }
};

// No TextField
<TextField
  placeholder={i18n.t("compaies.table.searchPlaceholder")}
  type="search"
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
  onKeyDown={handleSearchKeyDown}
  variant="outlined"
  fullWidth
  margin="dense"
  InputProps={{
    startAdornment: (
      <InputAdornment position="start">
        <SearchIcon aria-hidden="true" />
      </InputAdornment>
    ),
    endAdornment: searchTerm && (
      <InputAdornment position="end">
        <IconButton
          onClick={() => setSearchTerm("")}
          edge="end"
          size="small"
          aria-label={i18n.t("compaies.table.clearSearch")}
        >
          <ClearIcon />
        </IconButton>
      </InputAdornment>
    )
  }}
  inputProps={{
    "aria-label": i18n.t("compaies.table.searchLabel"),
    role: "searchbox",
  }}
/>
```

---

### **Commit 8: Testes unitários (Jest + RTL)**
**Estimativa:** 2 horas

**Arquivos:**
- `/frontend/src/components/CompaniesManager/CompaniesManager.test.js` (NOVO)

**Checklist:**
- [ ] Criar arquivo de teste
- [ ] Testar renderização do SearchBar (quando feature flag ativa)
- [ ] Testar que SearchBar não renderiza quando feature flag false
- [ ] Testar filtro por name, email, phone
- [ ] Testar debounce (usar jest.useFakeTimers)
- [ ] Testar clear button limpa input
- [ ] Testar tecla Esc limpa input
- [ ] Testar case-insensitive search
- [ ] Testar empty state (sem resultados)
- [ ] Atingir >80% code coverage na lógica de busca

**Dependências:** Commit 7

**Código Sugerido:**
```javascript
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CompaniesManager from './index';
import { i18n } from '../../translate/i18n';

// Mock do hook useCompanies
jest.mock('../../hooks/useCompanies', () => ({
  __esModule: true,
  default: () => ({
    list: jest.fn().mockResolvedValue([
      { id: 1, name: 'Empresa A', email: 'a@test.com', phone: '11999999999' },
      { id: 2, name: 'Empresa B', email: 'b@test.com', phone: '11888888888' },
    ]),
    save: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  }),
}));

// Mock do hook usePlans
jest.mock('../../hooks/usePlans', () => ({
  __esModule: true,
  default: () => ({
    list: jest.fn().mockResolvedValue([]),
  }),
}));

describe('CompaniesManager - SearchBar', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve renderizar SearchBar quando feature flag ativa', () => {
    process.env.REACT_APP_FEATURE_COMPANY_SEARCH = 'true';
    render(<CompaniesManager />);

    const searchInput = screen.getByPlaceholderText(
      i18n.t("compaies.table.searchPlaceholder")
    );
    expect(searchInput).toBeInTheDocument();
  });

  it('não deve renderizar SearchBar quando feature flag false', () => {
    process.env.REACT_APP_FEATURE_COMPANY_SEARCH = 'false';
    render(<CompaniesManager />);

    const searchInput = screen.queryByPlaceholderText(
      i18n.t("compaies.table.searchPlaceholder")
    );
    expect(searchInput).not.toBeInTheDocument();
  });

  it('deve filtrar empresas por nome', async () => {
    jest.useFakeTimers();
    render(<CompaniesManager />);

    await waitFor(() => {
      expect(screen.getByText('Empresa A')).toBeInTheDocument();
      expect(screen.getByText('Empresa B')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(
      i18n.t("compaies.table.searchPlaceholder")
    );

    userEvent.type(searchInput, 'Empresa A');
    jest.advanceTimersByTime(400); // Debounce

    await waitFor(() => {
      expect(screen.getByText('Empresa A')).toBeInTheDocument();
      expect(screen.queryByText('Empresa B')).not.toBeInTheDocument();
    });

    jest.useRealTimers();
  });

  it('deve ser case-insensitive', async () => {
    jest.useFakeTimers();
    render(<CompaniesManager />);

    await waitFor(() => {
      expect(screen.getByText('Empresa A')).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(
      i18n.t("compaies.table.searchPlaceholder")
    );

    userEvent.type(searchInput, 'empresa a');
    jest.advanceTimersByTime(400);

    await waitFor(() => {
      expect(screen.getByText('Empresa A')).toBeInTheDocument();
    });

    jest.useRealTimers();
  });

  it('deve limpar busca ao clicar no botão clear', async () => {
    render(<CompaniesManager />);

    const searchInput = screen.getByPlaceholderText(
      i18n.t("compaies.table.searchPlaceholder")
    );

    userEvent.type(searchInput, 'Empresa A');

    const clearButton = await screen.findByLabelText(
      i18n.t("compaies.table.clearSearch")
    );

    fireEvent.click(clearButton);

    expect(searchInput.value).toBe('');
  });

  it('deve limpar busca ao pressionar Esc', () => {
    render(<CompaniesManager />);

    const searchInput = screen.getByPlaceholderText(
      i18n.t("compaies.table.searchPlaceholder")
    );

    userEvent.type(searchInput, 'Empresa A');
    fireEvent.keyDown(searchInput, { key: 'Escape', code: 'Escape' });

    expect(searchInput.value).toBe('');
  });

  it('deve ter acessibilidade adequada', () => {
    render(<CompaniesManager />);

    const searchInput = screen.getByPlaceholderText(
      i18n.t("compaies.table.searchPlaceholder")
    );

    expect(searchInput).toHaveAttribute('aria-label', i18n.t("compaies.table.searchLabel"));
    expect(searchInput).toHaveAttribute('role', 'searchbox');
  });
});
```

---

## 3. Árvore de Componentes

```
SettingsCustom (Page)
  └── MainContainer (v4)
      ├── MainHeader (v4)
      │   └── Title (v4)
      └── Paper (v4)
          └── Tabs (v4)
              └── TabPanel (value="companies")
                  └── CompaniesManager
                      ├── Grid container
                      │   ├── Grid item (SearchBar) - NOVO - Feature Flag
                      │   │   └── TextField (v4)
                      │   │       ├── InputAdornment (start)
                      │   │       │   └── SearchIcon
                      │   │       └── InputAdornment (end) - Condicional
                      │   │           └── IconButton
                      │   │               └── ClearIcon
                      │   ├── Grid item (CompanyForm)
                      │   │   └── CompanyForm
                      │   └── Grid item (CompaniesManagerGrid)
                      │       └── CompaniesManagerGrid
                      └── ConfirmationModal
```

**Componentes Reutilizados:**
- `TextField` (Material-UI v4)
- `InputAdornment` (Material-UI v4)
- `IconButton` (Material-UI v4)
- `SearchIcon` (Material-UI Icons v4)
- `ClearIcon` (Material-UI Icons v4)
- `Grid` (Material-UI v4)

**Componentes Novos:**
Nenhum - reutiliza componentes existentes.

---

## 4. Estados do CompaniesManager

### **Estados Existentes (mantidos):**
```javascript
const [showConfirmDialog, setShowConfirmDialog] = useState(false);
const [loading, setLoading] = useState(false);
const [records, setRecords] = useState([]);
const [record, setRecord] = useState({ /* ... */ });
```

### **Estados Novos:**
```javascript
const [searchTerm, setSearchTerm] = useState("");
const [debouncedSearch] = useDebounce(searchTerm, 400);
```

### **Dados Derivados (useMemo):**
```javascript
const filteredRecords = useMemo(() => {
  if (!debouncedSearch) return records;

  const term = debouncedSearch.toLowerCase();
  return records.filter(company =>
    company.name?.toLowerCase().includes(term) ||
    company.email?.toLowerCase().includes(term) ||
    company.phone?.includes(term) ||
    company.document?.includes(term)
  );
}, [records, debouncedSearch]);
```

**Fluxo de Dados:**
1. Usuário digita no TextField → `setSearchTerm(value)`
2. `searchTerm` atualiza → trigger useDebounce
3. Após 400ms → `debouncedSearch` atualiza
4. `debouncedSearch` change → `useMemo` recalcula `filteredRecords`
5. `filteredRecords` passa para `CompaniesManagerGrid` → tabela re-renderiza

---

## 5. Hooks Utilizados

### **Hook Existente: useCompanies (NÃO MODIFICADO)**
**Localização:** `/frontend/src/hooks/useCompanies/index.js`

**Decisão:** Não modificar o hook. A busca será client-side usando `useMemo`.

**Razão:** O padrão de referência (`/pages/Companies/index.js`) usa filtro local com `useMemo` (linhas 115-125). Manter consistência com código existente.

```javascript
// Hook mantido sem modificações
const useCompanies = () => {
  const list = async (id) => {
    const { data } = await api.request({
      url: `/companies/list`,
      method: 'GET'
    });
    return data;
  }
  // ... outros métodos
}
```

### **Hook Novo: useDebounce (biblioteca)**
**Fonte:** `use-debounce` (já instalado - package.json linha 106)

**Uso:**
```javascript
import { useDebounce } from 'use-debounce';

const [searchTerm, setSearchTerm] = useState("");
const [debouncedSearch] = useDebounce(searchTerm, 400);
```

**Comportamento:**
- Recebe valor mutável (`searchTerm`)
- Retorna valor debounced após 400ms de inatividade
- Cancela debounce anterior se valor mudar antes de 400ms

### **Hook Existente: useMemo (React)**
**Uso:**
```javascript
const filteredRecords = useMemo(() => {
  if (!debouncedSearch) return records;

  const term = debouncedSearch.toLowerCase();
  return records.filter(company =>
    company.name?.toLowerCase().includes(term) ||
    company.email?.toLowerCase().includes(term) ||
    company.phone?.includes(term) ||
    company.document?.includes(term)
  );
}, [records, debouncedSearch]);
```

**Dependências:**
- `records`: array de empresas (vem de `list()`)
- `debouncedSearch`: termo de busca após debounce

**Performance:**
- Recalcula apenas quando `records` ou `debouncedSearch` mudam
- Evita re-filtrar em cada render

---

## 6. Estados UI (4 obrigatórios)

### **1. Happy Path (Busca com Resultados)**
**Descrição:** Usuário digita termo válido que encontra empresas.

**Exibição:**
- SearchBar visível com texto digitado
- ClearIcon visível no endAdornment
- Tabela CompaniesManagerGrid com registros filtrados
- Todos os campos da tabela renderizados normalmente

**Exemplo:**
- Input: "Empresa A"
- Resultado: Tabela com 1 linha mostrando "Empresa A"

---

### **2. Empty State (Busca Sem Resultados)**
**Descrição:** Usuário digita termo que não encontra nenhuma empresa.

**Exibição:**
- SearchBar visível com texto digitado
- ClearIcon visível
- Tabela CompaniesManagerGrid vazia (sem linhas no tbody)
- NÃO adicionar ilustração/mensagem extra (manter comportamento atual do grid vazio)

**Exemplo:**
- Input: "XYZ123"
- Resultado: Tabela com cabeçalho mas sem linhas

**Nota:** O CompaniesManagerGrid atual não tem empty state customizado. Manter este comportamento para não adicionar complexidade desnecessária.

---

### **3. Loading State (Carregando Empresas)**
**Descrição:** Dados sendo buscados da API.

**Exibição:**
- SearchBar visível mas disabled (durante loading inicial)
- Tabela mostra state de loading (já existe no código linha 570-575)
- Loading é controlado por estado `loading` existente

**Implementação:**
```javascript
<TextField
  placeholder={i18n.t("compaies.table.searchPlaceholder")}
  type="search"
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
  variant="outlined"
  fullWidth
  margin="dense"
  disabled={loading} // ADICIONAR
  // ... resto das props
/>
```

**Nota:** O loading é controlado pelo useEffect existente (linha 562-565) e função `loadPlans()` (linha 567-576).

---

### **4. Error State (Erro ao Carregar)**
**Descrição:** Erro na requisição API.

**Exibição:**
- SearchBar visível e habilitado
- Toast de erro exibido: `toast.error(i18n.t("settings.toasts.recordsLoadError"))` (já existe linha 573)
- Tabela vazia (records = [])

**Comportamento:**
- Usuário pode digitar no SearchBar (mas não há dados para filtrar)
- Erro é tratado no catch de `loadPlans()` (linha 572-574)

**Nota:** Não adicionar retry logic. Seguir padrão existente do projeto.

---

## 7. Data Fetching

### **Busca Server-Side: NÃO IMPLEMENTADA**
**Decisão:** Usar filtro client-side com `useMemo`.

**Razão:** Padrão estabelecido em `/pages/Companies/index.js` (linhas 115-125).

**Trade-off:**
- ✅ **Prós:**
  - Mais simples (sem modificar backend/hook)
  - Performance adequada para <1000 empresas
  - Consistente com código existente
  - Resposta instantânea (sem latência de rede)

- ❌ **Contras:**
  - Não escala para >1000 empresas
  - Busca apenas em registros já carregados (sem paginação)

**Migração Futura (se necessário):**
Se o número de empresas crescer muito, considerar:
1. Modificar `/backend/src/controllers/CompanyController.js` para aceitar `searchParam`
2. Adicionar índices no banco (name, email, phone)
3. Modificar `useCompanies.list()` para aceitar parâmetro
4. Substituir `useMemo` por debounced API call

---

### **Axios Pattern (Existente - NÃO MODIFICADO)**
```javascript
// Linha 567-576
const loadPlans = async () => {
  setLoading(true);
  try {
    const companyList = await list(); // list() vem de useCompanies()
    setRecords(companyList);
  } catch (e) {
    toast.error(i18n.t("settings.toasts.recordsLoadError"));
  }
  setLoading(false);
};
```

**Flow:**
1. `useEffect` (linha 562-565) chama `loadPlans()` no mount
2. `loadPlans()` chama `list()` de useCompanies
3. `list()` faz GET `/companies/list`
4. Resposta salva em `records`
5. `filteredRecords` (useMemo) reage a mudanças em `records`

---

## 8. Estratégia de Testes

### **Unit Tests (Jest + React Testing Library)**

**Arquivo:** `/frontend/src/components/CompaniesManager/CompaniesManager.test.js`

**Casos de Teste:**

1. **Renderização:**
   - [ ] SearchBar renderiza quando feature flag ativa
   - [ ] SearchBar NÃO renderiza quando feature flag false
   - [ ] Placeholder correto exibido
   - [ ] SearchIcon presente
   - [ ] ClearIcon aparece após digitar

2. **Funcionalidade de Busca:**
   - [ ] Filtro por name funciona
   - [ ] Filtro por email funciona
   - [ ] Filtro por phone funciona
   - [ ] Filtro por document funciona
   - [ ] Busca case-insensitive
   - [ ] Busca com múltiplos termos
   - [ ] Busca sem resultados (empty state)

3. **Debounce:**
   - [ ] Não busca imediatamente ao digitar
   - [ ] Busca após 400ms de inatividade
   - [ ] Cancela busca anterior se digitar novamente

4. **Interações:**
   - [ ] Botão clear limpa input
   - [ ] Tecla Esc limpa input
   - [ ] onChange atualiza estado
   - [ ] Disabled durante loading

5. **Acessibilidade:**
   - [ ] aria-label presente
   - [ ] role="searchbox"
   - [ ] Navegação por teclado funciona
   - [ ] Clear button tem aria-label

**Ferramentas:**
- Jest (test runner)
- React Testing Library (render, queries)
- @testing-library/user-event (interações realistas)
- jest.useFakeTimers() (testar debounce)

**Coverage Mínimo:** 80% em:
- Lógica de filtro (useMemo)
- Handlers de eventos (onChange, onClick, onKeyDown)
- Condicional de feature flag

---

### **E2E Tests (Playwright) - OPCIONAL**

**Arquivo:** `/frontend/e2e/companies-search.spec.js`

**Fluxo Crítico:**
```javascript
test('usuário busca empresa por nome', async ({ page }) => {
  // Login como super user
  await page.goto('/login');
  await page.fill('[name="email"]', 'super@test.com');
  await page.fill('[name="password"]', 'password');
  await page.click('button[type="submit"]');

  // Navegar para Settings → Empresas
  await page.goto('/settings');
  await page.click('button[value="companies"]');

  // Digitar busca
  await page.fill('[placeholder*="Buscar empresas"]', 'Empresa A');

  // Aguardar debounce
  await page.waitForTimeout(500);

  // Verificar resultado
  await expect(page.locator('table tbody tr')).toHaveCount(1);
  await expect(page.locator('table tbody')).toContainText('Empresa A');
});
```

**Nota:** E2E é opcional. Priorizar unit tests primeiro.

---

## 9. Acessibilidade (A11y - WCAG AA)

### **Checklist de Implementação:**

- [x] **Contraste de Cores:**
  - Texto do placeholder: verificar 4.5:1 mínimo
  - Ícones: verificar contraste adequado
  - Material-UI v4 default já atende WCAG AA

- [x] **ARIA Labels:**
  - `aria-label` no TextField via `inputProps`
  - `aria-label` no IconButton de clear
  - `aria-hidden="true"` no SearchIcon (decorativo)

- [x] **Roles Semânticos:**
  - `role="searchbox"` no input
  - Ícones com `aria-hidden` (não funcionais)

- [x] **Keyboard Navigation:**
  - Tab: foca no TextField
  - Type: digita normalmente
  - Esc: limpa busca (custom handler)
  - Tab: move para clear button (se visível)
  - Enter/Space: aciona clear button

- [x] **Focus Management:**
  - TextField tem focus indicator nativo do Material-UI
  - Clear button tem focus indicator
  - Outline visível (não removido)

- [x] **Screen Reader:**
  - Placeholder lido ao focar
  - aria-label lido ao focar
  - Clear button anuncia "Limpar busca" ao focar
  - Mudanças de estado (resultados) lidos via live region (implícito na tabela)

---

### **Testes de Acessibilidade:**

1. **VoiceOver (macOS):**
   ```bash
   Cmd + F5 # Ativar VoiceOver
   # Navegar até SearchBar e verificar anúncios
   ```

2. **NVDA (Windows):**
   ```
   - Iniciar NVDA
   - Tab até SearchBar
   - Verificar que lê "Campo de busca de empresas"
   ```

3. **axe DevTools (Browser Extension):**
   ```
   - Abrir Chrome DevTools
   - Tab "axe DevTools"
   - Scan página /settings?tab=companies
   - Verificar 0 violations
   ```

4. **Keyboard Only:**
   - Desconectar mouse
   - Tab para navegar
   - Verificar que todas funções acessíveis

---

### **Melhorias Futuras (Fora de Escopo):**
- [ ] Adicionar live region anunciando "X resultados encontrados"
- [ ] Highlight de termos buscados na tabela
- [ ] Autocomplete/sugestões
- [ ] Atalho de teclado global (Ctrl+K) para focar busca

---

## 10. i18n (5 idiomas)

### **Checklist de Implementação:**

- [x] **Português (pt.js):**
  ```javascript
  search: "Buscar",
  searchPlaceholder: "Buscar empresas por nome, email ou telefone...",
  searchLabel: "Campo de busca de empresas",
  clearSearch: "Limpar busca",
  ```

- [x] **Inglês (en.js):**
  ```javascript
  search: "Search",
  searchPlaceholder: "Search companies by name, email or phone...",
  searchLabel: "Company search field",
  clearSearch: "Clear search",
  ```

- [x] **Espanhol (es.js):**
  ```javascript
  search: "Buscar",
  searchPlaceholder: "Buscar empresas por nombre, email o teléfono...",
  searchLabel: "Campo de búsqueda de empresas",
  clearSearch: "Limpiar búsqueda",
  ```

- [x] **Turco (tr.js):**
  ```javascript
  search: "Ara",
  searchPlaceholder: "Şirketleri ad, e-posta veya telefona göre ara...",
  searchLabel: "Şirket arama alanı",
  clearSearch: "Aramayı temizle",
  ```

- [x] **Árabe (ar.js):**
  ```javascript
  search: "بحث",
  searchPlaceholder: "البحث عن الشركات بالاسم أو البريد الإلكتروني أو الهاتف...",
  searchLabel: "حقل البحث عن الشركات",
  clearSearch: "مسح البحث",
  ```

---

### **Localização das Traduções:**

**Arquivo:** `/frontend/src/translate/languages/pt.js`
**Seção:** `compaies.table` (linha ~2101)
**Posição:** Após `no: "Não",` (linha ~2130)

**Pattern:**
```javascript
compaies: {
  title: "Empresas",
  table: {
    // ... campos existentes ...
    no: "Não",
    // ADICIONAR AQUI:
    search: "...",
    searchPlaceholder: "...",
    searchLabel: "...",
    clearSearch: "...",
  }
}
```

---

### **Testes de i18n:**

1. **Mudança de Idioma Manual:**
   - Abrir /settings?tab=companies
   - Trocar idioma no perfil
   - Verificar que placeholder atualiza

2. **Verificação de Keys:**
   ```bash
   # Buscar keys não traduzidas
   grep -r "compaies.table.search" frontend/src/translate/languages/
   # Deve retornar 5 arquivos (pt, en, es, tr, ar)
   ```

3. **Fallback:**
   - Se key não existir, i18n retorna a key literal
   - Ex: "compaies.table.searchPlaceholder"
   - Fácil de detectar em testes visuais

---

## 11. Pontos de Integração

### **CompaniesManager/index.js**

**Linha 1-2:** Adicionar imports
```javascript
import React, { useState, useEffect, useMemo } from "react";
// ... outros imports ...
import { useDebounce } from 'use-debounce';
```

**Linha 2-17:** Atualizar imports Material-UI
```javascript
import {
  // ... imports existentes ...
  InputAdornment, // NOVO
} from "@material-ui/core";
```

**Linha 22-23:** Adicionar imports de ícones
```javascript
import { Edit as EditIcon } from "@material-ui/icons";
import SearchIcon from "@material-ui/icons/Search"; // NOVO
import ClearIcon from "@material-ui/icons/Clear"; // NOVO
```

**Linha 545:** Adicionar estados (após `const [loading, setLoading] = useState(false);`)
```javascript
const [searchTerm, setSearchTerm] = useState("");
const [debouncedSearch] = useDebounce(searchTerm, 400);
```

**Linha 561:** Adicionar useMemo (após useEffect, antes de loadPlans)
```javascript
const filteredRecords = useMemo(() => {
  if (!debouncedSearch) return records;
  const term = debouncedSearch.toLowerCase();
  return records.filter(company =>
    company.name?.toLowerCase().includes(term) ||
    company.email?.toLowerCase().includes(term) ||
    company.phone?.includes(term) ||
    company.document?.includes(term)
  );
}, [records, debouncedSearch]);
```

**Linha 660:** Adicionar Grid do SearchBar (ANTES de Grid do CompanyForm)
```javascript
{process.env.REACT_APP_FEATURE_COMPANY_SEARCH !== 'false' && (
  <Grid xs={12} item>
    {/* TextField SearchBar */}
  </Grid>
)}
```

**Linha 670:** Modificar prop de CompaniesManagerGrid
```javascript
<CompaniesManagerGrid records={filteredRecords} onSelect={handleSelect} />
```

---

### **Arquivos de Tradução**

**Arquivo:** `/frontend/src/translate/languages/pt.js`
**Linha:** ~2130 (após `no: "Não",`)

**Modificação:**
```javascript
compaies: {
  table: {
    // ... campos existentes ...
    no: "Não",
    search: "Buscar",
    searchPlaceholder: "Buscar empresas por nome, email ou telefone...",
    searchLabel: "Campo de busca de empresas",
    clearSearch: "Limpar busca",
  }
}
```

**Replicar para:**
- `/frontend/src/translate/languages/en.js`
- `/frontend/src/translate/languages/es.js`
- `/frontend/src/translate/languages/tr.js`
- `/frontend/src/translate/languages/ar.js`

---

### **.env.example**

**Arquivo:** `/frontend/.env.example`
**Adicionar:**
```bash
# Feature Flags
REACT_APP_FEATURE_COMPANY_SEARCH=true
```

---

## 12. Decisões de UX e Trade-offs

### **Decisão 1: Busca Local vs Server-Side**
**Escolha:** Busca local com `useMemo`

**Razão:**
- Padrão já estabelecido em `/pages/Companies/index.js`
- Simplicidade de implementação
- Performance adequada para <1000 empresas
- Evita modificar backend

**Trade-off:**
- ❌ Não escala para muitas empresas
- ✅ Resposta instantânea
- ✅ Menos complexidade

---

### **Decisão 2: Debounce de 400ms**
**Escolha:** 400ms

**Razão:**
- Balanceia responsividade e performance
- Evita recalcular useMemo a cada keystroke
- Padrão comum em UIs modernas (Google: 300-500ms)

**Trade-off:**
- ❌ Pequeno delay perceptível
- ✅ Melhor performance em listas grandes
- ✅ Reduz carga computacional

---

### **Decisão 3: Feature Flag**
**Escolha:** `process.env.REACT_APP_FEATURE_COMPANY_SEARCH !== 'false'`

**Razão:**
- Permite desabilitar feature em produção se houver bugs
- Facilita rollback sem deploy
- Default ativo (opt-out, não opt-in)

**Trade-off:**
- ❌ Adiciona condicional no código
- ✅ Controle granular de features
- ✅ Segurança para deploys

---

### **Decisão 4: Não Limpar Busca ao Trocar Tab**
**Escolha:** Manter `searchTerm` ao trocar tabs

**Razão:**
- Melhor UX: usuário não perde contexto
- Menos surpresas ao voltar para tab
- Consistente com apps modernos (Gmail, Slack)

**Trade-off:**
- ❌ Estado persiste entre navegações
- ✅ UX mais fluida
- ✅ Menos re-fetches

---

### **Decisão 5: Não Adicionar Empty State Customizado**
**Escolha:** Manter tabela vazia sem mensagem especial

**Razão:**
- Evitar complexidade adicional
- CompaniesManagerGrid não tem empty state atualmente
- Priorizar MVP funcional

**Trade-off:**
- ❌ UX menos polida (sem ilustração "sem resultados")
- ✅ Menos código para manter
- ✅ Lançamento mais rápido

**Melhoria Futura:**
Adicionar empty state em PR separada:
```javascript
{filteredRecords.length === 0 && debouncedSearch && (
  <Typography variant="body2" color="textSecondary" align="center">
    {i18n.t("compaies.table.noResults")}
  </Typography>
)}
```

---

### **Decisão 6: Filtrar por 4 Campos (name, email, phone, document)**
**Escolha:** Busca em múltiplos campos

**Razão:**
- Usuários não sabem qual campo exato
- Busca mais flexível e forgiving
- Padrão em apps modernos

**Trade-off:**
- ❌ Pode retornar muitos resultados
- ✅ Menos frustração do usuário
- ✅ Encontra o que precisa mais rápido

---

## 13. Riscos e Mitigações

### **Risco 1: Performance com Muitas Empresas**
**Descrição:** Filtro client-side pode ser lento com >1000 empresas.

**Probabilidade:** Média
**Impacto:** Alto

**Mitigação:**
- Usar `useMemo` para evitar re-filtrar em cada render
- Debounce de 400ms reduz frequência de filtros
- Se necessário (futuro): migrar para busca server-side

**Trigger para Migração:**
- Mais de 500 empresas no sistema
- Usuários reportam lag ao digitar

---

### **Risco 2: Conflitos com Material-UI v4/v5**
**Descrição:** Projeto usa v4 e v5 simultaneamente.

**Probabilidade:** Baixa
**Impacto:** Médio

**Mitigação:**
- Usar apenas componentes v4 (TextField, InputAdornment, IconButton)
- Seguir padrão de imports do arquivo (linhas 2-17)
- Testar visualmente estilos

---

### **Risco 3: Traduções Incorretas (Idiomas Não-Latinos)**
**Descrição:** Traduções em turco/árabe podem ter erros.

**Probabilidade:** Alta
**Impacto:** Baixo

**Mitigação:**
- Usar Google Translate como baseline
- Solicitar revisão de native speakers (se disponível)
- Fallback para inglês se tradução ruim

**Melhoria Futura:**
- Contratar serviço de tradução profissional

---

### **Risco 4: Feature Flag Não Funcionar**
**Descrição:** `process.env` undefined em build.

**Probabilidade:** Baixa
**Impacto:** Médio

**Mitigação:**
- Usar `!== 'false'` (não apenas truthy check)
- Default ativo se variável não existir
- Testar em dev e prod builds

**Teste:**
```bash
# Dev
REACT_APP_FEATURE_COMPANY_SEARCH=false npm start

# Prod
REACT_APP_FEATURE_COMPANY_SEARCH=false npm run build
```

---

### **Risco 5: Quebra de Testes Existentes**
**Descrição:** Mudanças podem quebrar testes de integração.

**Probabilidade:** Baixa
**Impacto:** Médio

**Mitigação:**
- Não modificar CompanyForm nem CompaniesManagerGrid
- Apenas adicionar Grid novo para SearchBar
- Passar `filteredRecords` em vez de `records` (API compatível)

**Checklist:**
- [ ] Rodar testes existentes antes de começar
- [ ] Rodar testes após cada commit
- [ ] Verificar coverage não diminuiu

---

## 14. Checklist Final de Qualidade

### **Funcionalidade:**
- [ ] SearchBar renderiza corretamente
- [ ] Busca filtra por name, email, phone, document
- [ ] Busca é case-insensitive
- [ ] Debounce de 400ms funciona
- [ ] Clear button limpa input
- [ ] Tecla Esc limpa input
- [ ] Feature flag funciona (on/off)
- [ ] Busca vazia mostra todos registros

### **UX:**
- [ ] Placeholder claro e descritivo
- [ ] SearchIcon visível
- [ ] ClearIcon aparece apenas quando há texto
- [ ] Loading state desabilita input
- [ ] Sem lag ao digitar
- [ ] Resultados atualizam suavemente

### **i18n:**
- [ ] Traduções em 5 idiomas
- [ ] Keys corretas em todos arquivos
- [ ] Placeholder traduzido
- [ ] Aria-labels traduzidos
- [ ] Testado com pelo menos 2 idiomas

### **A11y:**
- [ ] Contraste adequado (4.5:1)
- [ ] Aria-labels presentes
- [ ] Role="searchbox"
- [ ] Navegação por teclado funciona
- [ ] Focus indicators visíveis
- [ ] Testado com screen reader

### **Testes:**
- [ ] Unit tests escritos
- [ ] Coverage >80%
- [ ] Todos testes passam
- [ ] Edge cases cobertos
- [ ] Testes de acessibilidade incluídos

### **Código:**
- [ ] Sem warnings no console
- [ ] Sem erros no lint
- [ ] Código comentado (decisões não-óbvias)
- [ ] Imports organizados
- [ ] Nomes de variáveis claros

### **Performance:**
- [ ] useMemo otimiza filtro
- [ ] Debounce reduz recalculos
- [ ] Sem re-renders desnecessários
- [ ] Profiler mostra <16ms por render

---

## 15. Comandos Úteis

### **Desenvolvimento:**
```bash
# Instalar dependências (se necessário)
cd frontend && npm install

# Rodar em dev (com feature flag ativa)
REACT_APP_FEATURE_COMPANY_SEARCH=true npm start

# Rodar em dev (com feature flag inativa)
REACT_APP_FEATURE_COMPANY_SEARCH=false npm start

# Build de produção
npm run build
```

### **Testes:**
```bash
# Rodar todos testes
npm test

# Rodar testes específicos
npm test -- CompaniesManager

# Rodar com coverage
npm test -- --coverage --watchAll=false

# Rodar em watch mode
npm test -- --watch
```

### **Lint/Format:**
```bash
# Lint
npm run lint

# Format (se configurado)
npm run format
```

### **i18n:**
```bash
# Buscar keys de tradução
grep -r "compaies.table.search" frontend/src/translate/languages/

# Verificar se todas keys existem
node scripts/check-i18n.js # (se script existir)
```

---

## 16. Referências

### **Código de Referência:**
- `/frontend/src/pages/Companies/index.js` (linhas 304-316) - SearchBar pattern
- `/frontend/src/pages/Companies/index.js` (linhas 115-125) - useMemo filtro
- `/frontend/src/components/CompaniesManager/index.js` (existente) - Estrutura base

### **Bibliotecas:**
- Material-UI v4: https://v4.mui.com/
- use-debounce: https://github.com/xnimorz/use-debounce
- React Testing Library: https://testing-library.com/react

### **Padrões do Projeto:**
- i18n: `/frontend/src/translate/languages/pt.js`
- Hooks: `/frontend/src/hooks/useCompanies/index.js`
- Custom Hooks: 26 hooks existentes no projeto

### **Acessibilidade:**
- WCAG 2.1 AA: https://www.w3.org/WAI/WCAG21/quickref/
- ARIA Search: https://www.w3.org/TR/wai-aria-practices-1.1/#searchbox

---

## 17. Estimativas de Tempo

| Commit | Descrição | Tempo Estimado | Acumulado |
|--------|-----------|----------------|-----------|
| 1 | Adicionar imports e estado searchTerm | 30min | 30min |
| 2 | Implementar lógica de filtragem com useMemo | 1h | 1.5h |
| 3 | Criar componente SearchBar inline | 1.5h | 3h |
| 4 | Integrar filteredRecords com Grid | 30min | 3.5h |
| 5 | Adicionar feature flag check | 45min | 4.25h |
| 6 | Adicionar traduções i18n (5 idiomas) | 1h | 5.25h |
| 7 | Adicionar acessibilidade (A11y) | 1h | 6.25h |
| 8 | Testes unitários (Jest + RTL) | 2h | 8.25h |

**Total:** 8.25 horas (~1 dia de trabalho)

**Buffer para imprevistos:** +20% = **10 horas**

---

## 18. Critérios de Aceitação

### **Must Have (Obrigatório para Merge):**
- [x] SearchBar renderiza na tab Empresas
- [x] Busca filtra por name, email, phone, document
- [x] Debounce de 400ms funciona
- [x] Clear button funciona
- [x] Feature flag funciona
- [x] i18n em 5 idiomas
- [x] A11y WCAG AA atendido
- [x] Testes unitários >80% coverage
- [x] Zero warnings no console
- [x] Código passa no lint

### **Should Have (Desejável):**
- [ ] Empty state customizado (mensagem "sem resultados")
- [ ] Highlight de termos buscados na tabela
- [ ] Atalho de teclado (Ctrl+K) para focar busca
- [ ] Loading indicator no SearchBar durante busca

### **Could Have (Nice to Have):**
- [ ] Autocomplete com sugestões
- [ ] Busca avançada (filtros por campo)
- [ ] Salvar último termo buscado em localStorage
- [ ] Exportar resultados filtrados

### **Won't Have (Fora de Escopo):**
- [ ] Busca server-side (será client-side)
- [ ] Paginação de resultados
- [ ] Ordenação de colunas
- [ ] Filtros avançados (dropdown, date range)

---

## 19. Próximos Passos (Pós-Merge)

### **Fase 2 (Melhorias):**
1. **Empty State Customizado** (2h)
   - Adicionar ilustração "sem resultados"
   - Botão "Limpar busca" no empty state
   - Sugestões de busca

2. **Busca Server-Side** (6h)
   - Modificar backend para aceitar searchParam
   - Adicionar índices no banco
   - Implementar paginação

3. **Autocomplete** (4h)
   - Usar Material-UI Autocomplete
   - Carregar sugestões ao digitar
   - Cache de resultados

### **Fase 3 (Otimizações):**
1. **Performance Monitoring** (1h)
   - Adicionar métricas de busca
   - Monitorar tempo de resposta
   - Identificar gargalos

2. **A/B Testing** (2h)
   - Testar debounce 300ms vs 400ms
   - Testar busca server vs client
   - Analisar métricas de uso

---

## 20. Contatos e Suporte

**Dúvidas Técnicas:**
- Frontend Lead: [Nome]
- Backend Lead: [Nome]

**Revisão de Código:**
- Revisor Principal: [Nome]
- Revisor Secundário: [Nome]

**i18n/Traduções:**
- Revisor PT/ES: [Nome]
- Revisor EN: [Nome]
- Revisor TR/AR: [Serviço externo]

**Acessibilidade:**
- Especialista A11y: [Nome]
- Tester com Screen Reader: [Nome]

---

## 21. Changelog

| Data | Versão | Autor | Mudança |
|------|--------|-------|---------|
| 2025-10-13 | 1.0 | Claude Code | Criação inicial do plano |

---

**Fim do Plano de Implementação**

**Status:** ✅ Pronto para implementação

**Próximo Passo:** Criar branch `feature/search-companies` e iniciar Commit 1
