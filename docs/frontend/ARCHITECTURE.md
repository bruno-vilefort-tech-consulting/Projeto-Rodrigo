# 🏗️ Arquitetura do Frontend - ChatIA Flow

> Documentação completa da arquitetura e estrutura do frontend

**Versão do Sistema:** 2.2.2v-26
**Última Atualização:** 2025-10-12

---

## 📑 Índice

1. [Visão Geral](#visão-geral)
2. [Estrutura de Diretórios](#estrutura-de-diretórios)
3. [Camadas da Aplicação](#camadas-da-aplicação)
4. [Stack Tecnológico](#stack-tecnológico)
5. [Fluxo de Dados](#fluxo-de-dados)
6. [Padrões Arquiteturais](#padrões-arquiteturais)
7. [Módulos e Responsabilidades](#módulos-e-responsabilidades)
8. [Decisões de Design](#decisões-de-design)

---

## 🎯 Visão Geral

### Características Principais

O ChatIA Flow é uma **Single Page Application (SPA)** construída com React 17.0.2, seguindo uma **arquitetura de componentes modular** com gerenciamento de estado híbrido.

| Característica | Valor |
|---------------|-------|
| **Arquivos TypeScript/JavaScript** | 353 arquivos |
| **Diretórios** | 249 diretórios |
| **Linhas de Código** | ~80.990 linhas |
| **Componentes** | 149 componentes |
| **Páginas** | 43 páginas |
| **Custom Hooks** | 26 hooks |
| **Contexts** | 11 contexts |
| **Dependências** | 111 pacotes |

### Princípios Arquiteturais

1. **Component-Based Architecture** - Componentes reutilizáveis e isolados
2. **Separation of Concerns** - Separação clara entre UI, lógica e dados
3. **Single Responsibility** - Cada módulo tem uma única responsabilidade
4. **DRY (Don't Repeat Yourself)** - Custom hooks e componentes reutilizáveis
5. **Progressive Enhancement** - PWA com Service Worker
6. **Real-time First** - Socket.IO para sincronização em tempo real

### Modelo de Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                        Presentation Layer                    │
│  ┌────────────────────────────────────────────────────────┐ │
│  │     43 Pages (Dashboard, Tickets, Contacts, etc.)     │ │
│  │     149 Components (Modal, Form, List, etc.)          │ │
│  └────────────────────────────────────────────────────────┘ │
└───────────────────────┬─────────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────────┐
│                       Business Logic Layer                   │
│  ┌────────────────────────────────────────────────────────┐ │
│  │     26 Custom Hooks (useTickets, useContacts, etc.)   │ │
│  │     11 Contexts (Auth, Tickets, WhatsApp, etc.)       │ │
│  │     Utils & Helpers                                    │ │
│  └────────────────────────────────────────────────────────┘ │
└───────────────────────┬─────────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────────┐
│                       Data Access Layer                      │
│  ┌────────────────────────────────────────────────────────┐ │
│  │     Services (API, Socket.IO, Currency, Timezone)     │ │
│  │     Axios Client (HTTP)                                │ │
│  │     Socket.IO Client (WebSocket)                       │ │
│  └────────────────────────────────────────────────────────┘ │
└───────────────────────┬─────────────────────────────────────┘
                        │
┌───────────────────────▼─────────────────────────────────────┐
│                        External APIs                         │
│       Backend REST API │ Socket.IO Server │ CDN              │
└─────────────────────────────────────────────────────────────┘
```

---

## 📂 Estrutura de Diretórios

### Estrutura Completa

```
frontend/src/
├── 📄 index.js                   # Entry point da aplicação
├── 📄 App.js                     # Componente raiz
├── 📄 serviceWorker.js           # PWA Service Worker
├── 📄 config.js                  # Configurações gerais
├── 📄 rules.js                   # Regras de negócio
│
├── 📁 assets/                    # Arquivos estáticos (50+ assets)
│   ├── images/                   # Imagens, logos, ícones
│   └── sounds/                   # Notificações sonoras
│
├── 📁 components/                # 149 componentes React
│   ├── MessagesList/
│   ├── MessageInput/
│   ├── Ticket/
│   ├── ContactDrawer/
│   └── ... (145 mais)
│
├── 📁 pages/                     # 43 páginas
│   ├── Dashboard/
│   ├── Tickets/
│   ├── Contacts/
│   ├── Users/
│   └── ... (39 mais)
│
├── 📁 context/                   # 11 React Contexts
│   ├── Auth/
│   ├── Tickets/
│   ├── WhatsApp/
│   └── ... (8 mais)
│
├── 📁 hooks/                     # 26 Custom Hooks
│   ├── useAuth.js/
│   ├── useTickets/
│   ├── useContacts/
│   └── ... (23 mais)
│
├── 📁 services/                  # Serviços de integração
│   ├── api.js                    # Axios client
│   ├── socket.js                 # Socket.IO client
│   ├── CurrencyService.js        # Formatação monetária
│   ├── TimezoneService.js        # Fuso horário
│   └── flowBuilder.js            # Flow builder utils
│
├── 📁 routes/                    # Sistema de rotas
│   ├── index.js                  # Definição de rotas
│   └── Route.js                  # Route Guard
│
├── 📁 layout/                    # Layouts da aplicação
│   ├── index.js                  # LoggedInLayout
│   ├── MainListItems.js          # Menu lateral
│   └── themeContext.js           # Tema dark/light
│
├── 📁 translate/                 # Internacionalização (i18n)
│   ├── i18n.js                   # Configuração
│   └── languages/                # 5 idiomas (pt, en, es, tr, ar)
│
├── 📁 styles/                    # Estilos globais
│   ├── global.css
│   └── styles.js
│
├── 📁 utils/                     # Utilitários
│   ├── formatToCurrency.js
│   ├── formatSerializedId.js
│   └── ... (6 mais)
│
├── 📁 helpers/                   # Funções auxiliares
│   └── contrastColor.js
│
├── 📁 errors/                    # Tratamento de erros
│   └── toastError.js
│
└── 📁 stores/                    # Zustand stores
    └── useNodeStorage.js         # FlowBuilder state
```

### Métricas por Diretório

| Diretório | Arquivos | Propósito |
|-----------|----------|-----------|
| `/components` | 149 | Componentes React reutilizáveis |
| `/pages` | 43 | Páginas da aplicação |
| `/hooks` | 26 | Custom hooks |
| `/context` | 11 | React Contexts |
| `/services` | 7 | Integração com backend |
| `/translate/languages` | 5 | Arquivos de tradução |
| `/routes` | 2 | Sistema de rotas |
| `/utils` | 8 | Funções utilitárias |
| `/assets` | 50+ | Imagens, sons, etc |

---

## 🧱 Camadas da Aplicação

### 1. Presentation Layer (UI)

**Responsabilidade:** Renderização visual e interação com usuário

**Componentes:**

- **Pages (43)** - Páginas completas da aplicação
- **Components (149)** - Componentes reutilizáveis

**Tecnologias:**

- React 17.0.2
- Material-UI v4 + v5
- CSS-in-JS (makeStyles, styled-components)

**Exemplo:**

```javascript
// pages/Dashboard/index.js
const Dashboard = () => {
  const { user } = useContext(AuthContext);
  const { tickets, loading } = useTickets({ status: "open" });

  return (
    <MainContainer>
      <MainHeader>
        <Title>Dashboard</Title>
      </MainHeader>

      {loading ? (
        <BackdropLoading />
      ) : (
        <TicketsList tickets={tickets} />
      )}
    </MainContainer>
  );
};
```

### 2. Business Logic Layer

**Responsabilidade:** Lógica de negócio, validações, computações

**Componentes:**

- **Custom Hooks (26)** - Lógica reutilizável
- **Contexts (11)** - Estado global
- **Utils** - Funções auxiliares
- **Validators** - Schemas Yup

**Tecnologias:**

- React Hooks
- Context API
- Yup (validação)
- Formik (forms)

**Exemplo:**

```javascript
// hooks/useTickets/index.js
const useTickets = ({ searchParam, status, queueIds }) => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const { socket } = useContext(AuthContext);

  useEffect(() => {
    // Fetch inicial
    fetchTickets();

    // Socket.IO real-time
    socket.on("ticket", handleTicketUpdate);

    return () => socket.off("ticket", handleTicketUpdate);
  }, [searchParam, status, queueIds]);

  return { tickets, loading };
};
```

### 3. Data Access Layer

**Responsabilidade:** Comunicação com backend

**Componentes:**

- **API Service** - Axios client
- **Socket Service** - Socket.IO client
- **Currency Service** - Formatação monetária
- **Timezone Service** - Conversão de fuso horário

**Tecnologias:**

- Axios 1.6.8
- Socket.IO Client 4.7.4
- Moment.js / date-fns

**Exemplo:**

```javascript
// services/api.js
import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL,
  withCredentials: true
});

// Request interceptor
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${JSON.parse(token)}`;
    }
    return config;
  },
  error => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  response => response,
  async error => {
    if (error.response?.status === 401) {
      localStorage.clear();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
```

---

## 🛠️ Stack Tecnológico

### Core

| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| **React** | 17.0.2 | Framework UI |
| **React Router** | 5.2.0 | Roteamento |
| **Material-UI v4** | 4.12.3 | Biblioteca UI principal |
| **Material-UI v5** | 5.17.1 | Componentes modernos |
| **Socket.IO Client** | 4.7.4 | Real-time WebSocket |
| **Axios** | 1.6.8 | Cliente HTTP |
| **React Query** | 3.39.3 | Cache de dados |
| **Zustand** | 4.4.1 | State management (FlowBuilder) |

### UI & Styling

| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| **@material-ui/core** | 4.12.3 | Componentes UI base |
| **@mui/material** | 5.17.1 | Componentes UI modernos |
| **styled-components** | 5.3.6 | CSS-in-JS |
| **clsx** | 2.1.0 | Concatenação de classes |
| **react-color** | 2.19.3 | Color picker |
| **emoji-mart** | 3.0.0 | Emoji picker |
| **lucide-react** | 0.475.0 | Ícones modernos |

### Forms & Validation

| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| **Formik** | 2.2.0 | Gerenciamento de forms |
| **Yup** | 0.32.8 | Validação de schemas |
| **formik-material-ui** | 3.0.1 | Integração Formik + MUI |
| **react-input-mask** | 2.0.4 | Máscaras de input |

### Charts & Visualization

| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| **Chart.js** | 3.9.1 | Gráficos |
| **react-chartjs-2** | 4.3.1 | Wrapper React Chart.js |
| **Recharts** | 2.0.2 | Gráficos alternativos |
| **react-flow-renderer** | 10.3.17 | Flow Builder visual |

### Media & Files

| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| **compressorjs** | 1.2.1 | Compressão de imagens |
| **react-webcam** | 7.1.1 | Captura de webcam |
| **react-audio-player** | 0.17.0 | Player de áudio |
| **react-player** | 2.13.0 | Player de vídeo |
| **mic-recorder-to-mp3** | 2.2.2 | Gravação de áudio |
| **file-saver** | 2.0.5 | Download de arquivos |
| **xlsx** | 0.18.5 | Exportação Excel |

### Internationalization

| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| **i18next** | 19.9.2 | Framework i18n |
| **react-i18next** | 15.4.1 | Integração React |
| **i18next-browser-languagedetector** | 6.0.1 | Detecção de idioma |

### Utilities

| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| **lodash** | 4.17.21 | Funções utilitárias |
| **date-fns** | 2.16.1 | Manipulação de datas |
| **moment** | 2.29.4 | Datas e timezone |
| **uuid** | 8.3.2 | Geração de IDs únicos |
| **query-string** | 7.0.0 | Parse de query params |
| **use-debounce** | 7.0.0 | Debouncing |

### Build Tools

| Tecnologia | Versão | Propósito |
|------------|--------|-----------|
| **react-scripts** | 5.0.1 | Scripts CRA |
| **@craco/craco** | 7.1.0 | Override webpack |
| **TypeScript** | 5.5.3 | Tipagem estática |

---

## 🔄 Fluxo de Dados

### Fluxo Completo End-to-End

```
┌──────────────────────────────────────────────────────────────┐
│                         User Action                          │
│        (Click button, Submit form, Type message)             │
└───────────────────────┬──────────────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────────────┐
│                    Component Handler                         │
│       const handleSubmit = async (data) => { ... }          │
└───────────────────────┬──────────────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────────────┐
│                    Custom Hook / Context                     │
│        useTickets() → handleCreateTicket()                   │
│        AuthContext → handleLogin()                           │
└───────────────────────┬──────────────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────────────┐
│                      API Service                             │
│      api.post("/tickets", data)                              │
│      socket.emit("ticket:create", data)                      │
└───────────────────────┬──────────────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────────────┐
│                       Backend API                            │
│        REST API │ Socket.IO Server                           │
└───────────────────────┬──────────────────────────────────────┘
                        │
                        ▼
┌──────────────────────────────────────────────────────────────┐
│                    Database Operation                        │
│        PostgreSQL │ Redis │ File Storage                     │
└───────────────────────┬──────────────────────────────────────┘
                        │
    ┌───────────────────┴───────────────────┐
    │                                       │
    ▼ HTTP Response                         ▼ Socket.IO Broadcast
┌─────────────────────┐              ┌─────────────────────────┐
│  Response Handler   │              │  Socket Event Handler   │
│  .then(response)    │              │  socket.on("ticket")    │
└─────────┬───────────┘              └──────────┬──────────────┘
          │                                     │
          └──────────────┬──────────────────────┘
                         │
                         ▼
            ┌────────────────────────┐
            │    Update State        │
            │  setTickets([...])     │
            │  Context.dispatch()    │
            └────────────┬───────────┘
                         │
                         ▼
            ┌────────────────────────┐
            │    Re-render UI        │
            │  React reconciliation  │
            └────────────────────────┘
```

### Exemplo Prático: Enviar Mensagem

**1. Usuário digita mensagem e clica "Enviar"**

```javascript
// components/MessageInput/index.js
const MessageInput = ({ ticketId }) => {
  const [message, setMessage] = useState("");

  const handleSendMessage = async () => {
    try {
      await api.post(`/messages/${ticketId}`, {
        body: message,
        fromMe: true
      });
      setMessage(""); // Limpar input
    } catch (err) {
      toastError(err);
    }
  };

  return (
    <TextField
      value={message}
      onChange={e => setMessage(e.target.value)}
      onKeyPress={e => e.key === "Enter" && handleSendMessage()}
    />
  );
};
```

**2. API Service envia para backend**

```javascript
// services/api.js
const response = await api.post(`/messages/${ticketId}`, data);
// POST http://localhost:8080/messages/123
```

**3. Backend processa e retorna resposta HTTP**

```json
{
  "id": 456,
  "ticketId": 123,
  "body": "Olá!",
  "fromMe": true,
  "createdAt": "2025-10-12T10:30:00Z"
}
```

**4. Backend também envia via Socket.IO para todos clientes**

```javascript
// Backend emite evento
io.to(`company-${companyId}`).emit("appMessage", {
  action: "create",
  message: messageData
});
```

**5. Frontend recebe via Socket.IO e atualiza estado**

```javascript
// hooks/useMessages/index.js
useEffect(() => {
  const handleMessage = (data) => {
    if (data.action === "create") {
      setMessages(prev => [...prev, data.message]);
      // Scroll to bottom
      scrollToBottom();
    }
  };

  socket.on(`company-${companyId}-appMessage`, handleMessage);

  return () => socket.off(`company-${companyId}-appMessage`, handleMessage);
}, []);
```

**6. React re-renderiza componente com nova mensagem**

```javascript
// components/MessagesList/index.js
return (
  <div>
    {messages.map(msg => (
      <MessageItem key={msg.id} message={msg} />
    ))}
  </div>
);
```

---

## 🎨 Padrões Arquiteturais

### 1. Component Composition

```javascript
// ✅ BOM - Composição de componentes
<MainContainer>
  <MainHeader>
    <Title>Tickets</Title>
    <MainHeaderButtonsWrapper>
      <Button onClick={handleNew}>Novo</Button>
    </MainHeaderButtonsWrapper>
  </MainHeader>

  <TicketsManagerTabs>
    <Tab label="Abertos" />
    <Tab label="Pendentes" />
  </TicketsManagerTabs>

  <TicketsList tickets={tickets} />
</MainContainer>
```

### 2. Container/Presentational Pattern

```javascript
// Container (lógica)
const TicketsContainer = () => {
  const { tickets, loading } = useTickets({ status: "open" });

  if (loading) return <BackdropLoading />;

  return <TicketsList tickets={tickets} />;
};

// Presentational (UI pura)
const TicketsList = ({ tickets }) => (
  <div>
    {tickets.map(ticket => (
      <TicketItem key={ticket.id} ticket={ticket} />
    ))}
  </div>
);
```

### 3. Custom Hook Pattern

```javascript
// Encapsular lógica complexa em hook reutilizável
const useTicketFilter = (tickets) => {
  const [filters, setFilters] = useState({});

  const filteredTickets = useMemo(() => {
    return tickets.filter(ticket => {
      if (filters.status && ticket.status !== filters.status) return false;
      if (filters.queue && ticket.queueId !== filters.queue) return false;
      return true;
    });
  }, [tickets, filters]);

  return { filteredTickets, filters, setFilters };
};
```

### 4. Provider Pattern

```javascript
// Providers aninhados no root
<BrowserRouter>
  <AuthProvider>
    <CurrencyProvider>
      <TicketsContextProvider>
        <WhatsAppsProvider>
          {/* App */}
        </WhatsAppsProvider>
      </TicketsContextProvider>
    </CurrencyProvider>
  </AuthProvider>
</BrowserRouter>
```

### 5. Render Props Pattern

```javascript
<Can
  role={user.profile}
  perform="tickets:delete"
  yes={() => <DeleteButton onClick={handleDelete} />}
  no={() => <Tooltip title="Sem permissão" />}
/>
```

### 6. Higher-Order Component (HOC)

```javascript
// Layout HOC
const withLayout = (Component) => {
  return (props) => (
    <LoggedInLayout>
      <Component {...props} />
    </LoggedInLayout>
  );
};

export default withLayout(Dashboard);
```

---

## 📦 Módulos e Responsabilidades

### `/components` - Componentes React (149)

**Responsabilidade:** Componentes reutilizáveis de UI

**Categorias:**

- **Modais** (35) - UserModal, ContactModal, TicketModal, etc.
- **Tickets** (15) - Ticket, TicketHeader, TicketsList, etc.
- **Mensagens** (8) - MessagesList, MessageInput, MessageOptionsMenu
- **Contatos** (10) - ContactDrawer, ContactModal, ContactForm
- **UI Base** (20) - BackdropLoading, MainContainer, Title, Can
- **Filters** (12) - QueueFilter, StatusFilter, TagsFilter
- **FlowBuilder** (18) - Modais específicos do Flow Builder
- **Outros** (31) - Charts, Forms, Previews, etc.

### `/pages` - Páginas (43)

**Responsabilidade:** Páginas completas da aplicação

**Categorias:**

- **Públicas** (4) - Login, Signup, ForgotPassword, ResetPassword
- **Main** (10) - Dashboard, Tickets, Contacts, Users, etc.
- **Admin** (18) - Settings, Queues, Tags, Reports, etc.
- **Features** (11) - FlowBuilder, Campaigns, Kanban, Chat, etc.

### `/context` - React Contexts (11)

**Responsabilidade:** Estado global compartilhado

**Principais:**

- **AuthContext** - Autenticação, usuário, socket
- **TicketsContext** - Ticket atual aberto
- **WhatsAppsContext** - Conexões WhatsApp
- **CurrencyContext** - Formatação monetária

### `/hooks` - Custom Hooks (26)

**Responsabilidade:** Lógica reutilizável e integração com API

**Categorias:**

- **Auth** (1) - useAuth
- **Data/API** (18) - useTickets, useContacts, useUsers, etc.
- **UI** (2) - useLocalStorage, useDate
- **Utils** (5) - useSettings, useVersion, etc.

### `/services` - Serviços (7)

**Responsabilidade:** Integração com backend e APIs externas

**Principais:**

- **api.js** - Cliente Axios HTTP
- **socket.js** - Cliente Socket.IO WebSocket
- **CurrencyService.js** - Formatação monetária
- **TimezoneService.js** - Conversão de fuso horário
- **flowBuilder.js** - Utils do Flow Builder

### `/routes` - Rotas (2)

**Responsabilidade:** Definição e proteção de rotas

- **index.js** - Todas as 43 rotas
- **Route.js** - Route Guard (proteção de rotas)

### `/translate` - i18n (5 idiomas)

**Responsabilidade:** Internacionalização

**Idiomas suportados:**

- pt.js - Português (Brasil)
- en.js - Inglês
- es.js - Espanhol
- tr.js - Turco
- ar.js - Árabe

---

## 💡 Decisões de Design

### 1. Por que React 17 ao invés de 18?

**Decisão:** Manter React 17.0.2

**Motivos:**

- Compatibilidade com Material-UI v4 (biblioteca principal)
- Evitar breaking changes em projeto grande
- React 17 é estável e suficiente para necessidades atuais

### 2. Por que Material-UI v4 + v5 ao mesmo tempo?

**Decisão:** Usar ambas versões simultaneamente

**Motivos:**

- Migração gradual de v4 para v5
- Novos componentes usam v5
- Componentes legados usam v4
- Evitar reescrever 149 componentes de uma vez

```javascript
// v4
import { Button } from "@material-ui/core";

// v5
import { Button } from "@mui/material";
```

### 3. Por que Context API ao invés de Redux?

**Decisão:** Context API + Custom Hooks

**Motivos:**

- Menos boilerplate
- Melhor para TypeScript
- Suficiente para escala atual
- React Query para cache de servidor

### 4. Por que Socket.IO ao invés de WebSockets nativos?

**Decisão:** Socket.IO Client 4.7.4

**Motivos:**

- Fallback automático (polling → WebSocket)
- Reconexão automática
- Rooms e namespaces
- Compatibilidade cross-browser

### 5. Por que CRACO ao invés de Eject?

**Decisão:** CRACO para override do Webpack

**Motivos:**

- Não precisa ejetar Create React App
- Adicionar polyfills Node.js (crypto, stream, buffer)
- Manter atualizações do react-scripts

### 6. Por que PWA?

**Decisão:** Progressive Web App com Service Worker

**Motivos:**

- Instalável no desktop/mobile
- Funciona offline (cache)
- Notificações push
- Performance melhorada

### 7. Por que múltiplos idiomas?

**Decisão:** Suporte a 5 idiomas com i18next

**Motivos:**

- Expansão internacional
- Detecção automática de idioma do navegador
- Fácil adicionar novos idiomas
- Mercado global de atendimento

### 8. Por que Formik + Yup?

**Decisão:** Formik para forms, Yup para validação

**Motivos:**

- Melhor DX (Developer Experience)
- Validação declarativa
- Integração com Material-UI
- Menos código boilerplate

---

## 📊 Diagrama de Dependências

```
┌─────────────────────────────────────────────────────────────┐
│                          App.js                             │
└───────────────────────┬─────────────────────────────────────┘
                        │
        ┌───────────────┼───────────────┐
        │               │               │
        ▼               ▼               ▼
┌───────────┐  ┌────────────────┐  ┌────────────┐
│  Routes   │  │   Contexts     │  │   Theme    │
│  (43)     │  │   (11)         │  │   System   │
└─────┬─────┘  └──────┬─────────┘  └─────┬──────┘
      │               │                   │
      ▼               ▼                   ▼
┌──────────────────────────────────────────────┐
│            Pages (43)                        │
└───────────────────┬──────────────────────────┘
                    │
        ┌───────────┼───────────┐
        │           │           │
        ▼           ▼           ▼
┌─────────────┐ ┌─────────┐ ┌──────────┐
│ Components  │ │  Hooks  │ │ Services │
│   (149)     │ │  (26)   │ │   (7)    │
└─────────────┘ └────┬────┘ └────┬─────┘
                     │           │
                     └─────┬─────┘
                           │
                           ▼
                    ┌──────────────┐
                    │  Backend API │
                    └──────────────┘
```

---

## 🔧 Build & Deploy

### Development

```bash
npm start
# → Roda em http://localhost:3000
# → Hot reload habilitado
# → Source maps
```

### Production Build

```bash
npm run build
# → Gera pasta build/
# → Minificação
# → Tree shaking
# → Code splitting
# → ~2.5 MB gzipped
```

### Otimizações de Build

- **Code Splitting** - Chunks por rota
- **Tree Shaking** - Remove código não usado
- **Minification** - Terser para JS, cssnano para CSS
- **Compression** - Gzip + Brotli
- **Asset Optimization** - Imagens otimizadas
- **Bundle Analysis** - source-map-explorer

---

## 📚 Recursos Adicionais

### Documentos Relacionados

- [COMPONENTS.md](./COMPONENTS.md) - Todos os 149 componentes
- [PAGES.md](./PAGES.md) - Todas as 43 páginas
- [HOOKS.md](./HOOKS.md) - Todos os 26 hooks
- [CONTEXTS.md](./CONTEXTS.md) - Todos os 11 contexts
- [ROUTING.md](./ROUTING.md) - Sistema de rotas
- [STATE-MANAGEMENT.md](./STATE-MANAGEMENT.md) - Gerenciamento de estado
- [API.md](./API.md) - APIs e serviços

---

**Última Atualização:** 2025-10-12
**Versão do Sistema:** 2.2.2v-26
**Autor:** Bruno Vilefort
**Status:** ✅ Completo
