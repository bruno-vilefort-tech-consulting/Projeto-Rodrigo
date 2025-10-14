# 🛠️ Guia de Desenvolvimento - ChatIA Flow

Guia completo para desenvolvedores que trabalharão no projeto.

---

## Índice

- [Setup Inicial](#setup-inicial)
- [Estrutura de Desenvolvimento](#estrutura-de-desenvolvimento)
- [Criar Novos Recursos](#criar-novos-recursos)
- [Padrões de Código](#padrões-de-código)
- [Debugging](#debugging)
- [Performance](#performance)
- [Testes](#testes)
- [Build e Deploy](#build-e-deploy)

---

## Setup Inicial

### Pré-requisitos

- Node.js 16+
- npm ou yarn
- Git

### Instalação

```bash
# Clone o repositório
git clone <repo-url>
cd chatia/frontend

# Instale as dependências
npm install

# Configure variáveis de ambiente
cp .env.example .env

# Edite .env com suas configurações
nano .env
```

### Variáveis de Ambiente (.env)

```bash
# URL do backend
REACT_APP_BACKEND_URL=http://localhost:8080

# Facebook App ID (opcional)
REACT_APP_FACEBOOK_APP_ID=

# Nome do sistema
REACT_APP_NAME_SYSTEM=ChatIA

# Número de suporte
REACT_APP_NUMBER_SUPPORT=5511999999999

# Horas para fechar tickets automaticamente
REACT_APP_HOURS_CLOSE_TICKETS_AUTO=9999

# Cores do tema
REACT_APP_PRIMARY_COLOR=#6B46C1
REACT_APP_PRIMARY_DARK=#4C1D95
```

### Executar em Desenvolvimento

```bash
npm start
```

Abre em http://localhost:3000

### Build para Produção

```bash
npm run build
```

Gera pasta `build/` com arquivos otimizados.

---

## Estrutura de Desenvolvimento

### Fluxo de Trabalho

1. **Criar branch:**
   ```bash
   git checkout -b feature/nome-da-feature
   ```

2. **Desenvolver:**
   - Criar/modificar componentes
   - Adicionar traduções
   - Testar localmente

3. **Commit:**
   ```bash
   git add .
   git commit -m "feat: descrição da feature"
   ```

4. **Push e PR:**
   ```bash
   git push origin feature/nome-da-feature
   # Criar Pull Request no GitHub
   ```

### Convenção de Commits

Usar [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - Nova funcionalidade
- `fix:` - Correção de bug
- `docs:` - Documentação
- `style:` - Formatação (não afeta código)
- `refactor:` - Refatoração
- `test:` - Testes
- `chore:` - Tarefas de manutenção

**Exemplos:**
```bash
git commit -m "feat: adicionar filtro por tags no dashboard"
git commit -m "fix: corrigir scroll infinito em MessagesList"
git commit -m "docs: atualizar documentação de componentes"
```

---

## Criar Novos Recursos

### 1. Criar Novo Componente

#### Passo 1: Criar estrutura

```bash
mkdir src/components/MeuComponente
touch src/components/MeuComponente/index.js
```

#### Passo 2: Implementar componente

```jsx
// src/components/MeuComponente/index.js
import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Paper, Typography, Button } from "@material-ui/core";
import { i18n } from "../../translate/i18n";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
    backgroundColor: theme.palette.background.paper,
  },
  title: {
    marginBottom: theme.spacing(2),
    color: theme.palette.primary.main,
  },
}));

const MeuComponente = ({ prop1, prop2, onAction }) => {
  const classes = useStyles();
  const [state, setState] = useState(null);

  useEffect(() => {
    // Lógica de efeito
  }, [prop1]);

  const handleClick = () => {
    onAction?.();
  };

  return (
    <Paper className={classes.root}>
      <Typography variant="h6" className={classes.title}>
        {i18n.t("meuComponente.titulo")}
      </Typography>
      <Button variant="contained" color="primary" onClick={handleClick}>
        {i18n.t("buttons.action")}
      </Button>
    </Paper>
  );
};

export default MeuComponente;
```

#### Passo 3: Adicionar tradução

```javascript
// src/translate/languages/pt.js
export const messages = {
  pt: {
    translations: {
      meuComponente: {
        titulo: "Meu Componente",
      },
      // ...
    }
  }
};
```

#### Passo 4: Usar o componente

```jsx
import MeuComponente from "../../components/MeuComponente";

<MeuComponente
  prop1="valor"
  prop2={123}
  onAction={() => console.log("Ação!")}
/>
```

---

### 2. Criar Nova Página

#### Passo 1: Criar estrutura

```bash
mkdir src/pages/MinhaPagina
touch src/pages/MinhaPagina/index.js
```

#### Passo 2: Implementar página

```jsx
// src/pages/MinhaPagina/index.js
import React, { useState, useEffect } from "react";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  IconButton,
} from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import { Edit as EditIcon, Delete as DeleteIcon } from "@material-ui/icons";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";
import TableRowSkeleton from "../../components/TableRowSkeleton";

import api from "../../services/api";
import toastError from "../../errors/toastError";
import { toast } from "react-toastify";
import { i18n } from "../../translate/i18n";

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(1),
    overflowY: "scroll",
    ...theme.scrollbarStyles,
  },
}));

const MinhaPagina = () => {
  const classes = useStyles();

  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/my-endpoint");
      setRecords(data);
    } catch (err) {
      toastError(err);
    }
    setLoading(false);
  };

  const handleOpenModal = (record = null) => {
    setSelectedRecord(record);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedRecord(null);
    setModalOpen(false);
    fetchRecords();
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/my-endpoint/${id}`);
      toast.success(i18n.t("minhaPagina.toasts.deleted"));
      fetchRecords();
    } catch (err) {
      toastError(err);
    }
  };

  return (
    <MainContainer>
      <MainHeader>
        <Title>{i18n.t("minhaPagina.title")}</Title>
        <MainHeaderButtonsWrapper>
          <Button
            variant="contained"
            color="primary"
            onClick={() => handleOpenModal()}
          >
            {i18n.t("minhaPagina.buttons.add")}
          </Button>
        </MainHeaderButtonsWrapper>
      </MainHeader>

      <Paper className={classes.mainPaper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell align="center">ID</TableCell>
              <TableCell>{i18n.t("minhaPagina.table.name")}</TableCell>
              <TableCell align="center">
                {i18n.t("minhaPagina.table.actions")}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRowSkeleton columns={3} />
            ) : (
              records.map((record) => (
                <TableRow key={record.id}>
                  <TableCell align="center">{record.id}</TableCell>
                  <TableCell>{record.name}</TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => handleOpenModal(record)}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(record.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Paper>

      {/* Modal aqui */}
    </MainContainer>
  );
};

export default MinhaPagina;
```

#### Passo 3: Adicionar rota

```javascript
// src/routes/index.js
import MinhaPagina from "../pages/MinhaPagina";

// Dentro do Switch:
<Route exact path="/minha-pagina" component={MinhaPagina} isPrivate />
```

#### Passo 4: Adicionar no menu (opcional)

```javascript
// src/layout/MainListItems.js
import { MyIcon } from "@material-ui/icons";

<ListItemLink
  to="/minha-pagina"
  primary={i18n.t("mainDrawer.listItems.minhaPagina")}
  icon={<MyIcon />}
/>
```

---

### 3. Criar Custom Hook

```javascript
// src/hooks/useMeuDado/index.js
import { useState, useEffect } from "react";
import api from "../../services/api";
import toastError from "../../errors/toastError";

const useMeuDado = (params) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    fetchData();
  }, [params]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/my-endpoint", { params });
      setData(data.records);
      setHasMore(data.hasMore);
    } catch (err) {
      toastError(err);
    }
    setLoading(false);
  };

  const create = async (newData) => {
    try {
      const { data: created } = await api.post("/my-endpoint", newData);
      setData([...data, created]);
      return created;
    } catch (err) {
      toastError(err);
    }
  };

  const update = async (id, updatedData) => {
    try {
      const { data: updated } = await api.put(`/my-endpoint/${id}`, updatedData);
      setData(data.map((item) => (item.id === id ? updated : item)));
      return updated;
    } catch (err) {
      toastError(err);
    }
  };

  const remove = async (id) => {
    try {
      await api.delete(`/my-endpoint/${id}`);
      setData(data.filter((item) => item.id !== id));
    } catch (err) {
      toastError(err);
    }
  };

  return {
    data,
    loading,
    hasMore,
    create,
    update,
    remove,
    refetch: fetchData,
  };
};

export default useMeuDado;
```

**Uso:**
```javascript
const { data, loading, create, update, remove } = useMeuDado({ search: "teste" });
```

---

### 4. Adicionar Nova Tradução

```javascript
// src/translate/languages/pt.js
export const messages = {
  pt: {
    translations: {
      minhaPagina: {
        title: "Minha Página",
        table: {
          name: "Nome",
          actions: "Ações",
        },
        buttons: {
          add: "Adicionar",
        },
        toasts: {
          deleted: "Registro deletado com sucesso!",
          saved: "Registro salvo com sucesso!",
        },
      },
    },
  },
};

// Repetir para en.js, es.js, tr.js, ar.js
```

---

## Padrões de Código

### 1. Estrutura de Componente

```jsx
// Imports
import React, { useState, useEffect, useContext } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { Paper } from "@material-ui/core";

// Contexts
import { AuthContext } from "../../context/Auth/AuthContext";

// Components
import MeuComponente from "../../components/MeuComponente";

// Services
import api from "../../services/api";
import toastError from "../../errors/toastError";

// i18n
import { i18n } from "../../translate/i18n";

// Styles
const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
  },
}));

// Component
const MeuComponente = ({ prop1, prop2 }) => {
  // Styles
  const classes = useStyles();

  // Contexts
  const { user } = useContext(AuthContext);

  // State
  const [state, setState] = useState(null);

  // Effects
  useEffect(() => {
    // ...
  }, []);

  // Handlers
  const handleClick = () => {
    // ...
  };

  // Render
  return (
    <Paper className={classes.root}>
      {/* JSX */}
    </Paper>
  );
};

export default MeuComponente;
```

### 2. Nomenclatura

**Componentes:**
- PascalCase: `MeuComponente`, `UserModal`

**Funções/Variáveis:**
- camelCase: `handleClick`, `fetchData`, `isLoading`

**Constantes:**
- UPPER_SNAKE_CASE: `API_URL`, `MAX_RETRIES`

**Arquivos:**
- Componentes: PascalCase (`MeuComponente/index.js`)
- Outros: camelCase (`toastError.js`, `useAuth.js`)

### 3. Organização de Imports

```javascript
// 1. React e libs externas
import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";

// 2. Material-UI components
import { Paper, Button } from "@material-ui/core";

// 3. Contexts
import { AuthContext } from "../../context/Auth/AuthContext";

// 4. Components locais
import MeuComponente from "../../components/MeuComponente";

// 5. Services e utils
import api from "../../services/api";
import { formatDate } from "../../utils/formatDate";

// 6. i18n
import { i18n } from "../../translate/i18n";
```

### 4. Estado e Props

**Use destructuring:**
```javascript
// Bom
const { name, email } = user;

// Evite
const name = user.name;
const email = user.email;
```

**PropTypes (opcional mas recomendado):**
```javascript
import PropTypes from "prop-types";

MeuComponente.propTypes = {
  prop1: PropTypes.string.isRequired,
  prop2: PropTypes.number,
  onAction: PropTypes.func,
};

MeuComponente.defaultProps = {
  prop2: 0,
  onAction: () => {},
};
```

### 5. Estilos

**Sempre use `makeStyles`:**
```javascript
const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
    backgroundColor: theme.palette.background.paper,
  },
  button: {
    marginTop: theme.spacing(1),
    color: theme.palette.primary.main,
  },
}));
```

**Use theme para:**
- Spacing: `theme.spacing(1)` = 8px
- Colors: `theme.palette.primary.main`
- Breakpoints: `theme.breakpoints.up("md")`
- Scrollbar: `...theme.scrollbarStyles`

### 6. Handlers

**Nomenclatura:**
```javascript
const handleClick = () => {};
const handleSubmit = async (data) => {};
const handleInputChange = (e) => {};
```

**Async/await com try/catch:**
```javascript
const handleSubmit = async (data) => {
  try {
    await api.post("/endpoint", data);
    toast.success("Sucesso!");
  } catch (err) {
    toastError(err);
  }
};
```

---

## Debugging

### 1. React DevTools

Instalar extensão:
- [Chrome](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi)
- [Firefox](https://addons.mozilla.org/en-US/firefox/addon/react-devtools/)

### 2. Console Logs

```javascript
console.log("Debug:", { variable1, variable2 });
console.error("Erro:", error);
console.table(arrayOfObjects);
```

### 3. Breakpoints

```javascript
debugger; // Pausa execução no DevTools
```

### 4. React Query DevTools

```jsx
import { ReactQueryDevtools } from "react-query/devtools";

<QueryClientProvider client={queryClient}>
  <App />
  <ReactQueryDevtools initialIsOpen={false} />
</QueryClientProvider>
```

### 5. Network Tab

- Abrir DevTools → Network
- Filtrar por XHR
- Verificar requests/responses

---

## Performance

### 1. Memoization

**useMemo:**
```javascript
const expensiveValue = useMemo(() => {
  return computeExpensiveValue(a, b);
}, [a, b]);
```

**useCallback:**
```javascript
const handleClick = useCallback(() => {
  doSomething(a, b);
}, [a, b]);
```

**React.memo:**
```javascript
const MeuComponente = React.memo(({ prop1, prop2 }) => {
  return <div>{prop1}</div>;
});
```

### 2. Code Splitting

```javascript
const MinhaPagina = React.lazy(() => import("./pages/MinhaPagina"));

<Suspense fallback={<BackdropLoading />}>
  <MinhaPagina />
</Suspense>
```

### 3. Debouncing

```javascript
import { useDebounce } from "use-debounce";

const [searchParam, setSearchParam] = useState("");
const [debouncedSearch] = useDebounce(searchParam, 500);

useEffect(() => {
  fetchData(debouncedSearch);
}, [debouncedSearch]);
```

### 4. Evitar Re-renders

```javascript
// Ruim
<Component onClick={() => handleClick(id)} />

// Bom
const handleClick = useCallback(() => {
  doSomething(id);
}, [id]);

<Component onClick={handleClick} />
```

---

## Testes

### Executar Testes

```bash
npm test
```

### Criar Teste de Componente

```javascript
// MeuComponente.test.js
import { render, screen, fireEvent } from "@testing-library/react";
import MeuComponente from "./index";

describe("MeuComponente", () => {
  it("renderiza corretamente", () => {
    render(<MeuComponente prop1="teste" />);
    expect(screen.getByText("teste")).toBeInTheDocument();
  });

  it("chama callback ao clicar", () => {
    const handleClick = jest.fn();
    render(<MeuComponente onClick={handleClick} />);

    fireEvent.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

---

## Build e Deploy

### Build Local

```bash
npm run build
```

### Testar Build Localmente

```bash
# Servir pasta build/
npx serve -s build -p 3000
```

### Deploy (Docker)

```dockerfile
# Dockerfile
FROM node:16 as build

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM node:16-alpine
WORKDIR /app
COPY --from=build /app/build ./build
COPY server.js .
EXPOSE 3000
CMD ["node", "server.js"]
```

```bash
# Build e run
docker build -t chatia-frontend .
docker run -p 3000:3000 chatia-frontend
```

---

## Troubleshooting

### Problema: "Module not found"

**Solução:**
```bash
rm -rf node_modules package-lock.json
npm install
```

### Problema: "Port 3000 already in use"

**Solução:**
```bash
# Mudar porta
PORT=3001 npm start

# Ou matar processo
lsof -ti:3000 | xargs kill -9
```

### Problema: Erro de CORS

**Solução:**
Verificar `withCredentials: true` no axios e configuração CORS no backend.

### Problema: Build muito grande

**Solução:**
Analisar bundle:
```bash
npm run build
npx source-map-explorer build/static/js/*.js
```

---

## Recursos Úteis

- [React Docs](https://reactjs.org/docs/getting-started.html)
- [Material-UI Docs](https://v4.mui.com/)
- [React Query Docs](https://react-query.tanstack.com/)
- [Socket.IO Docs](https://socket.io/docs/v4/)
- [i18next Docs](https://www.i18next.com/)

---

**Última Atualização:** 2025-10-11
