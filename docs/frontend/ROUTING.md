# 🗺️ Sistema de Roteamento - ChatIA Flow

> Documentação completa do sistema de rotas e navegação

**Localização:** `/frontend/src/routes/`
**Biblioteca:** React Router v5 (react-router-dom)
**Versão do Sistema:** 2.2.2v-26

---

## 📑 Índice

1. [Visão Geral](#visão-geral)
2. [Estrutura de Arquivos](#estrutura-de-arquivos)
3. [Route Guard (Proteção de Rotas)](#route-guard)
4. [Todas as Rotas](#todas-as-rotas)
5. [Navegação Programática](#navegação-programática)
6. [Padrões de URL](#padrões-de-url)
7. [Layout System](#layout-system)
8. [Exemplos Práticos](#exemplos-práticos)
9. [Boas Práticas](#boas-práticas)

---

## 🎯 Visão Geral

### Características do Sistema de Rotas

- **React Router v5** - BrowserRouter, Switch, Route
- **Route Guard** - Proteção de rotas privadas/públicas
- **43+ rotas** definidas
- **Rotas dinâmicas** com parâmetros (`:id`, `:ticketId`)
- **Rotas condicionais** - Campaigns habilitado via localStorage
- **Layout aninhado** - LoggedInLayout para rotas privadas
- **Navegação responsiva** - Drawer lateral + AppBar superior
- **Multi-device detection** - Via Socket.IO

### Providers Principais

```javascript
<BrowserRouter>
  <AuthProvider>
    <CurrencyProvider>
      <TicketsContextProvider>
        <WhatsAppsProvider>
          {/* Rotas aqui */}
        </WhatsAppsProvider>
      </TicketsContextProvider>
    </CurrencyProvider>
  </AuthProvider>
</BrowserRouter>
```

---

## 📂 Estrutura de Arquivos

```
frontend/src/routes/
├── index.js           # Arquivo principal de rotas
└── Route.js           # Componente Route Guard customizado
```

### `index.js` - Arquivo Principal

```javascript
import React from "react";
import { BrowserRouter, Switch } from "react-router-dom";
import Route from "./Route";
import LoggedInLayout from "../layout";

const Routes = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Switch>
          {/* Rotas públicas */}
          <Route exact path="/login" component={Login} />

          {/* Rotas privadas dentro do Layout */}
          <LoggedInLayout>
            <Route exact path="/" component={Dashboard} isPrivate />
          </LoggedInLayout>
        </Switch>
      </AuthProvider>
    </BrowserRouter>
  );
};
```

**Responsabilidades:**
- ✅ Define todas as rotas da aplicação
- ✅ Configura providers de contexto
- ✅ Separa rotas públicas/privadas
- ✅ Gerencia rotas condicionais (Campaigns)

---

## 🔐 Route Guard

### Componente `Route.js`

**Localização:** `/frontend/src/routes/Route.js`

```javascript
import React, { useContext } from "react";
import { Route as RouterRoute, Redirect } from "react-router-dom";
import { AuthContext } from "../context/Auth/AuthContext";
import BackdropLoading from "../components/BackdropLoading";

const Route = ({ component: Component, isPrivate = false, ...rest }) => {
  const { isAuth, loading } = useContext(AuthContext);

  // Não autenticado tentando acessar rota privada
  if (!isAuth && isPrivate) {
    return (
      <>
        {loading && <BackdropLoading />}
        <Redirect to={{ pathname: "/login", state: { from: rest.location } }} />
      </>
    );
  }

  // Autenticado tentando acessar rota pública (login/signup)
  if (isAuth && !isPrivate) {
    return (
      <>
        {loading && <BackdropLoading />}
        <Redirect to={{ pathname: "/", state: { from: rest.location } }} />
      </>
    );
  }

  // Renderizar rota normalmente
  return (
    <>
      {loading && <BackdropLoading />}
      <RouterRoute {...rest} component={Component} />
    </>
  );
};

export default Route;
```

### Lógica de Proteção

| Cenário | isAuth | isPrivate | Ação |
|---------|--------|-----------|------|
| Visitante → Dashboard | `false` | `true` | ❌ Redirecionar para `/login` |
| Visitante → Login | `false` | `false` | ✅ Permitir acesso |
| Logado → Dashboard | `true` | `true` | ✅ Permitir acesso |
| Logado → Login | `true` | `false` | ❌ Redirecionar para `/` |

### Recursos

- **Redirect com state** - Preserva origem da navegação (`from`)
- **BackdropLoading** - Mostra loader durante verificação
- **Context Integration** - Usa AuthContext para verificar autenticação

---

## 🗺️ Todas as Rotas

### 📄 Rotas Públicas (4)

| Rota | Componente | Descrição |
|------|------------|-----------|
| `/login` | `Login` | Página de login |
| `/signup` | `Signup` | Cadastro de nova empresa |
| `/forgot-password` | `ForgotPassword` | Recuperação de senha |
| `/reset-password` | `ResetPassword` | Redefinir senha com token |

**Código:**
```javascript
<Route exact path="/login" component={Login} />
<Route exact path="/signup" component={Signup} />
<Route exact path="/forgot-password" component={ForgotPassword} />
<Route exact path="/reset-password" component={ResetPassword} />
```

---

### 🏠 Rotas Principais (10)

Rotas envolvidas pelo `LoggedInLayout` (drawer + appbar).

| Rota | Componente | Descrição | Permissão |
|------|------------|-----------|-----------|
| `/` | `Dashboard` | Dashboard principal | Todos |
| `/tickets/:ticketId?` | `TicketResponsiveContainer` | Atendimento | Todos |
| `/contacts` | `Contacts` | Gestão de contatos | Todos |
| `/contacts/import` | `ContactImportPage` | Importar contatos | Admin |
| `/users` | `Users` | Gestão de usuários | Admin |
| `/settings` | `SettingsCustom` | Configurações | Admin |
| `/queues` | `Queues` | Filas de atendimento | Admin |
| `/connections` | `Connections` | Conexões WhatsApp | Admin |
| `/financeiro` | `Financeiro` | Sistema financeiro | Admin |
| `/companies` | `Companies` | Gestão de empresas | Super Admin |

**Código:**
```javascript
<LoggedInLayout>
  <Route exact path="/" component={Dashboard} isPrivate />
  <Route exact path="/tickets/:ticketId?" component={TicketResponsiveContainer} isPrivate />
  <Route exact path="/contacts" component={Contacts} isPrivate />
  <Route exact path="/users" component={Users} isPrivate />
  {/* ... */}
</LoggedInLayout>
```

---

### ⚙️ Rotas de Administração (18)

| Rota | Componente | Descrição |
|------|------------|-----------|
| `/quick-messages` | `QuickMessages` | Respostas rápidas |
| `/todolist` | `ToDoList` | Lista de tarefas |
| `/schedules` | `Schedules` | Agendamentos de mensagens |
| `/tags` | `Tags` | Tags de tickets |
| `/helps` | `Helps` | Central de ajuda |
| `/messages-api` | `MessagesAPI` | API de mensagens |
| `/reports` | `Reports` | Relatórios |
| `/queue-integration` | `QueueIntegration` | Integrações de fila |
| `/announcements` | `Annoucements` | Anúncios internos |
| `/phrase-lists` | `CampaignsPhrase` | Frases para campanhas |
| `/chats/:id?` | `Chat` | Chat interno entre atendentes |
| `/files` | `Files` | Gestão de arquivos |
| `/moments` | `ChatMoments` | Momentos do chat |
| `/Kanban` | `Kanban` | Quadro Kanban |
| `/TagsKanban` | `TagsKanban` | Tags do Kanban |
| `/prompts` | `Prompts` | Prompts de IA |
| `/allConnections` | `AllConnections` | Todas as conexões |
| `/flowbuilders` | `FlowBuilder` | Lista de flows |
| `/flowbuilder/:id?` | `FlowBuilderConfig` | Editor de flow |

**Código:**
```javascript
<Route exact path="/quick-messages" component={QuickMessages} isPrivate />
<Route exact path="/schedules" component={Schedules} isPrivate />
<Route exact path="/Kanban" component={Kanban} isPrivate />
<Route exact path="/chats/:id?" component={Chat} isPrivate />
<Route exact path="/flowbuilder/:id?" component={FlowBuilderConfig} isPrivate />
```

---

### 📢 Rotas Condicionais - Campanhas (5)

Estas rotas só aparecem se `localStorage.getItem("cshow")` estiver definido.

| Rota | Componente | Descrição |
|------|------------|-----------|
| `/contact-lists` | `ContactLists` | Listas de contatos |
| `/contact-lists/:contactListId/contacts` | `ContactListItems` | Contatos da lista |
| `/campaigns` | `Campaigns` | Campanhas de envio em massa |
| `/campaign/:campaignId/report` | `CampaignReport` | Relatório da campanha |
| `/campaigns-config` | `CampaignsConfig` | Configuração de campanhas |

**Código:**
```javascript
const [showCampaigns, setShowCampaigns] = useState(false);

useEffect(() => {
  const cshow = localStorage.getItem("cshow");
  if (cshow !== undefined) {
    setShowCampaigns(true);
  }
}, []);

// Renderização condicional
{showCampaigns && (
  <>
    <Route exact path="/contact-lists" component={ContactLists} isPrivate />
    <Route exact path="/campaigns" component={Campaigns} isPrivate />
    {/* ... */}
  </>
)}
```

**Como habilitar:**
```javascript
// No console do navegador ou via código
localStorage.setItem("cshow", "true");
window.location.reload();
```

---

## 🧭 Navegação Programática

### Hooks do React Router v5

```javascript
import { useHistory, useLocation, useParams, useRouteMatch } from "react-router-dom";

function MeuComponente() {
  const history = useHistory();
  const location = useLocation();
  const params = useParams();
  const match = useRouteMatch();

  // Navegar para outra página
  const handleNavigate = () => {
    history.push("/dashboard");
  };

  // Navegar com state
  const handleNavigateWithState = () => {
    history.push({
      pathname: "/tickets/123",
      state: { from: "dashboard" }
    });
  };

  // Voltar
  const handleBack = () => {
    history.goBack();
  };

  // Replace (não adiciona ao histórico)
  const handleReplace = () => {
    history.replace("/login");
  };

  // Acessar parâmetros da URL
  const { ticketId } = useParams(); // /tickets/:ticketId

  // Acessar query params
  const queryParams = new URLSearchParams(location.search);
  const status = queryParams.get("status"); // /tickets?status=open

  // Acessar state passado via navigate
  const fromPage = location.state?.from;

  return (
    <div>
      <button onClick={handleNavigate}>Ir para Dashboard</button>
      <button onClick={handleBack}>Voltar</button>
      <p>Ticket ID: {ticketId}</p>
      <p>Status: {status}</p>
    </div>
  );
}
```

### Exemplos Práticos

#### 1. Abrir ticket específico

```javascript
import { useHistory } from "react-router-dom";

const TicketsList = () => {
  const history = useHistory();

  const handleOpenTicket = (ticketId) => {
    history.push(`/tickets/${ticketId}`);
  };

  return (
    <div>
      {tickets.map(ticket => (
        <div onClick={() => handleOpenTicket(ticket.id)}>
          {ticket.contact.name}
        </div>
      ))}
    </div>
  );
};
```

#### 2. Navegar após criar recurso

```javascript
const handleSaveUser = async (userData) => {
  try {
    const { data } = await api.post("/users", userData);
    toast.success("Usuário criado!");
    history.push("/users"); // Volta para lista
  } catch (err) {
    toastError(err);
  }
};
```

#### 3. Redirecionar após logout

```javascript
const handleLogout = async () => {
  try {
    await api.post("/auth/logout");
    localStorage.clear();
    history.replace("/login"); // Replace para não poder voltar
  } catch (err) {
    toastError(err);
  }
};
```

#### 4. Preservar estado ao navegar

```javascript
// Página de origem
history.push({
  pathname: "/contacts",
  state: {
    from: "tickets",
    selectedQueue: queueId,
    scrollPosition: window.scrollY
  }
});

// Página de destino
const location = useLocation();
const { from, selectedQueue, scrollPosition } = location.state || {};

useEffect(() => {
  if (scrollPosition) {
    window.scrollTo(0, scrollPosition);
  }
}, []);
```

---

## 🔗 Padrões de URL

### Rotas com Parâmetros Opcionais

```javascript
// Definição
<Route exact path="/tickets/:ticketId?" component={TicketResponsiveContainer} isPrivate />

// URLs válidas:
// /tickets          → ticketId = undefined
// /tickets/123      → ticketId = "123"
```

**Uso no componente:**
```javascript
import { useParams } from "react-router-dom";

const TicketResponsiveContainer = () => {
  const { ticketId } = useParams();

  useEffect(() => {
    if (ticketId) {
      // Carregar ticket específico
      loadTicket(ticketId);
    } else {
      // Mostrar lista ou placeholder
    }
  }, [ticketId]);
};
```

### Rotas Aninhadas

```javascript
// Definição
<Route
  exact
  path="/contact-lists/:contactListId/contacts"
  component={ContactListItems}
  isPrivate
/>

// URL: /contact-lists/5/contacts
const { contactListId } = useParams(); // "5"
```

### Query Parameters

```javascript
// URL: /tickets?status=open&queue=1

const location = useLocation();
const params = new URLSearchParams(location.search);

const status = params.get("status");   // "open"
const queueId = params.get("queue");    // "1"

// Atualizar query params mantendo URL
const updateFilters = (newStatus) => {
  params.set("status", newStatus);
  history.push({ search: params.toString() });
};
```

---

## 🎨 Layout System

### `LoggedInLayout` Component

**Localização:** `/frontend/src/layout/index.js`

```javascript
const LoggedInLayout = ({ children }) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const { user, handleLogout } = useContext(AuthContext);

  return (
    <div className={classes.root}>
      {/* Drawer lateral - Menu de navegação */}
      <Drawer
        variant={drawerVariant}
        open={drawerOpen}
      >
        <MainListItems collapsed={!drawerOpen} />
      </Drawer>

      {/* AppBar superior - Notificações, perfil, etc */}
      <AppBar position="fixed">
        <Toolbar>
          <IconButton onClick={() => setDrawerOpen(!drawerOpen)}>
            <MenuIcon />
          </IconButton>

          <Typography>Olá, {user.name}</Typography>

          <NotificationsPopOver />
          <ChatPopover />
          <Avatar onClick={handleMenu} />
        </Toolbar>
      </AppBar>

      {/* Conteúdo principal - Rotas renderizadas aqui */}
      <main className={classes.content}>
        {children}
      </main>
    </div>
  );
};
```

### Estrutura Visual

```
┌────────────────────────────────────────────────────────┐
│ AppBar (fixo topo)                                     │
│ ┌──────┐ ChatIA │ Notif Chat Avatar                   │
└────────────────────────────────────────────────────────┘
┌──────────┬─────────────────────────────────────────────┐
│  Drawer  │                                             │
│  (240px) │                                             │
│          │                                             │
│ 📊 Dash  │         Conteúdo da Rota                   │
│ 🎫 Tick  │         (children)                          │
│ 👥 Cont  │                                             │
│ ⚙️  Sett │                                             │
│          │                                             │
│          │                                             │
└──────────┴─────────────────────────────────────────────┘
```

### Comportamento Responsivo

**Desktop (> 600px):**
- Drawer permanente (sempre visível)
- Largura: 240px
- AppBar com margem left de 240px

**Mobile (< 600px):**
- Drawer temporário (overlay)
- Abre/fecha com botão
- AppBar full-width
- Swipe to close

**Código:**
```javascript
useEffect(() => {
  if (document.body.offsetWidth < 600) {
    setDrawerVariant("temporary");
  } else {
    setDrawerVariant("permanent");
  }
}, []);
```

### MainListItems - Menu de Navegação

**Localização:** `/frontend/src/layout/MainListItems.js`

```javascript
import { Link as RouterLink } from "react-router-dom";
import { ListItem, ListItemIcon, ListItemText } from "@material-ui/core";

const MainListItems = ({ collapsed }) => {
  const { user } = useContext(AuthContext);

  return (
    <List>
      {/* Dashboard */}
      <ListItem button component={RouterLink} to="/">
        <ListItemIcon><DashboardIcon /></ListItemIcon>
        {!collapsed && <ListItemText primary="Dashboard" />}
      </ListItem>

      {/* Tickets */}
      <ListItem button component={RouterLink} to="/tickets">
        <ListItemIcon><WhatsAppIcon /></ListItemIcon>
        {!collapsed && <ListItemText primary="Tickets" />}
      </ListItem>

      {/* Apenas Admin */}
      {user.profile === "admin" && (
        <ListItem button component={RouterLink} to="/users">
          <ListItemIcon><PeopleIcon /></ListItemIcon>
          {!collapsed && <ListItemText primary="Usuários" />}
        </ListItem>
      )}
    </List>
  );
};
```

---

## 💡 Exemplos Práticos

### 1. Criar Nova Rota Privada

**Passo 1:** Criar página
```javascript
// src/pages/MyNewPage/index.js
import React from "react";
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";

const MyNewPage = () => {
  return (
    <MainContainer>
      <MainHeader>
        <Title>Minha Nova Página</Title>
      </MainHeader>
      <div>
        {/* Conteúdo */}
      </div>
    </MainContainer>
  );
};

export default MyNewPage;
```

**Passo 2:** Adicionar rota em `routes/index.js`
```javascript
import MyNewPage from "../pages/MyNewPage";

// Dentro do <LoggedInLayout>
<Route exact path="/my-new-page" component={MyNewPage} isPrivate />
```

**Passo 3:** Adicionar no menu em `layout/MainListItems.js`
```javascript
<ListItem button component={RouterLink} to="/my-new-page">
  <ListItemIcon><NewIcon /></ListItemIcon>
  <ListItemText primary="Minha Página" />
</ListItem>
```

### 2. Rota com Permissão

```javascript
// Componente que verifica permissão
import Can from "../../components/Can";

const MyProtectedPage = () => {
  return (
    <MainContainer>
      <Can
        role={user.profile}
        perform="my-page:view"
        yes={() => (
          <div>Conteúdo protegido</div>
        )}
        no={() => (
          <div>Você não tem permissão</div>
        )}
      />
    </MainContainer>
  );
};
```

### 3. Rota com Loading

```javascript
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import BackdropLoading from "../../components/BackdropLoading";

const TicketDetail = () => {
  const { ticketId } = useParams();
  const [loading, setLoading] = useState(true);
  const [ticket, setTicket] = useState(null);

  useEffect(() => {
    const loadTicket = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/tickets/${ticketId}`);
        setTicket(data);
      } catch (err) {
        toastError(err);
      } finally {
        setLoading(false);
      }
    };

    if (ticketId) {
      loadTicket();
    }
  }, [ticketId]);

  if (loading) return <BackdropLoading />;
  if (!ticket) return <div>Ticket não encontrado</div>;

  return <div>{ticket.contact.name}</div>;
};
```

### 4. Breadcrumbs

```javascript
import { useLocation, Link as RouterLink } from "react-router-dom";
import { Breadcrumbs, Link, Typography } from "@material-ui/core";

const BreadcrumbsNav = () => {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter(x => x);

  return (
    <Breadcrumbs>
      <Link component={RouterLink} to="/">
        Home
      </Link>
      {pathnames.map((value, index) => {
        const to = `/${pathnames.slice(0, index + 1).join("/")}`;
        const isLast = index === pathnames.length - 1;

        return isLast ? (
          <Typography key={to}>{value}</Typography>
        ) : (
          <Link component={RouterLink} to={to} key={to}>
            {value}
          </Link>
        );
      })}
    </Breadcrumbs>
  );
};
```

---

## ✅ Boas Práticas

### 1. Organização de Rotas

```javascript
// ✅ BOM - Agrupado por tipo
<Switch>
  {/* Públicas */}
  <Route exact path="/login" component={Login} />
  <Route exact path="/signup" component={Signup} />

  {/* Privadas */}
  <LoggedInLayout>
    {/* Principais */}
    <Route exact path="/" component={Dashboard} isPrivate />
    <Route exact path="/tickets/:id?" component={Tickets} isPrivate />

    {/* Admin */}
    <Route exact path="/users" component={Users} isPrivate />
  </LoggedInLayout>
</Switch>

// ❌ RUIM - Desorganizado
<Switch>
  <Route path="/login" component={Login} />
  <Route path="/users" component={Users} isPrivate />
  <Route path="/" component={Dashboard} isPrivate />
  <Route path="/signup" component={Signup} />
</Switch>
```

### 2. Sempre use `exact`

```javascript
// ✅ BOM
<Route exact path="/tickets" component={TicketsList} isPrivate />
<Route exact path="/tickets/:id" component={TicketDetail} isPrivate />

// ❌ RUIM - Sem exact, /tickets/123 vai renderizar TicketsList
<Route path="/tickets" component={TicketsList} isPrivate />
<Route path="/tickets/:id" component={TicketDetail} isPrivate />
```

### 3. Navegação com botão "Voltar"

```javascript
import { useHistory } from "react-router-dom";
import { IconButton } from "@material-ui/core";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";

const PageWithBack = () => {
  const history = useHistory();

  return (
    <MainContainer>
      <MainHeader>
        <IconButton onClick={() => history.goBack()}>
          <ArrowBackIcon />
        </IconButton>
        <Title>Detalhes</Title>
      </MainHeader>
    </MainContainer>
  );
};
```

### 4. Prevenir navegação não salva

```javascript
import { Prompt } from "react-router-dom";

const FormPage = () => {
  const [hasChanges, setHasChanges] = useState(false);

  return (
    <>
      <Prompt
        when={hasChanges}
        message="Você tem alterações não salvas. Deseja sair mesmo assim?"
      />
      <form onChange={() => setHasChanges(true)}>
        {/* ... */}
      </form>
    </>
  );
};
```

### 5. Lazy Loading de Rotas

```javascript
import { lazy, Suspense } from "react";
import BackdropLoading from "../components/BackdropLoading";

const Dashboard = lazy(() => import("../pages/Dashboard"));
const Users = lazy(() => import("../pages/Users"));

const Routes = () => (
  <Suspense fallback={<BackdropLoading />}>
    <Switch>
      <Route exact path="/" component={Dashboard} isPrivate />
      <Route exact path="/users" component={Users} isPrivate />
    </Switch>
  </Suspense>
);
```

### 6. 404 - Página Não Encontrada

```javascript
import NotFound from "../pages/NotFound";

<Switch>
  {/* Todas as rotas */}
  <Route exact path="/" component={Dashboard} isPrivate />
  <Route exact path="/tickets" component={Tickets} isPrivate />

  {/* 404 - sempre por último */}
  <Route component={NotFound} />
</Switch>
```

---

## 📊 Resumo das Rotas

| Tipo | Quantidade | Proteção |
|------|-----------|----------|
| Públicas | 4 | Sem autenticação |
| Privadas Principais | 10 | Requer autenticação |
| Privadas Admin | 18 | Requer autenticação |
| Condicionais (Campaigns) | 5 | Requer autenticação + flag |
| **TOTAL** | **43** | - |

---

## 🔍 Troubleshooting

### Problema: Rota não encontrada

```javascript
// Verificar:
// 1. Rota está definida em routes/index.js?
// 2. Está usando exact?
// 3. Está dentro do Switch?
// 4. Importou o componente corretamente?
```

### Problema: Redirect infinito

```javascript
// Causa: Route Guard mal configurado
// Verificar lógica em Route.js

// ✅ BOM
if (!isAuth && isPrivate) {
  return <Redirect to="/login" />;
}

// ❌ RUIM - Sempre redireciona
return <Redirect to="/login" />;
```

### Problema: Parâmetros undefined

```javascript
// URL: /tickets/123
// Definição: <Route path="/tickets/:ticketId" />

const { ticketId } = useParams();
// ✅ ticketId = "123"

// Definição: <Route path="/tickets/:id" />
const { ticketId } = useParams();
// ❌ ticketId = undefined (nome diferente!)

// Solução: usar mesmo nome
const { id } = useParams();
// ✅ id = "123"
```

---

## 📚 Recursos Adicionais

### Documentos Relacionados

- [PAGES.md](./PAGES.md) - Todas as 43 páginas
- [CONTEXTS.md](./CONTEXTS.md) - AuthContext e outros
- [DEVELOPMENT.md](./DEVELOPMENT.md) - Guia de desenvolvimento
- [FLOWS.md](./FLOWS.md) - Fluxos de autenticação e navegação

### Links Externos

- [React Router v5 Docs](https://v5.reactrouter.com/)
- [React Router API Reference](https://v5.reactrouter.com/web/api)
- [Material-UI Navigation](https://v4.mui.com/components/breadcrumbs/)

---

**Última Atualização:** 2025-10-12
**Versão do Sistema:** 2.2.2v-26
**Autor:** Bruno Vilefort
**Status:** ✅ Completo
