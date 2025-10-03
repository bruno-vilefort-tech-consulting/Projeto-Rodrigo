# MULTIZAP - ANÁLISE ULTRA PROFUNDA DO FRONTEND

## ÍNDICE
1. [Informações Gerais](#informações-gerais)
2. [Arquitetura do Projeto](#arquitetura-do-projeto)
3. [Arquivos de Configuração](#arquivos-de-configuração)
4. [Sistema de Roteamento](#sistema-de-roteamento)
5. [Gerenciamento de Estado](#gerenciamento-de-estado)
6. [Serviços e Integrações](#serviços-e-integrações)
7. [Componentes Principais](#componentes-principais)
8. [Temas e Estilos](#temas-e-estilos)
9. [PWA e Service Workers](#pwa-e-service-workers)
10. [Internacionalização](#internacionalização)
11. [Hooks Customizados](#hooks-customizados)
12. [Utilitários e Helpers](#utilitários-e-helpers)
13. [Dependências Críticas](#dependências-críticas)
14. [Fluxo de Inicialização](#fluxo-de-inicialização)
15. [Segurança e Autenticação](#segurança-e-autenticação)
16. [Performance e Otimizações](#performance-e-otimizações)
17. [Script de Atualização](#script-de-atualização)

---

## INFORMAÇÕES GERAIS

### Identificação do Projeto
- **Nome:** Multizap (ChatIA Flow)
- **Versão Atual:** 2.2.2v-26
- **Sistema:** 2.0.0
- **Tipo:** Sistema de MultiAtendimento para WhatsApp
- **Tecnologia Base:** React 17.0.2
- **Build Tool:** CRACO (Create React App Configuration Override)
- **Linguagem:** JavaScript/TypeScript (configurado para aceitar ambos)

### Propósito
Sistema completo de atendimento multi-canal focado em WhatsApp, com funcionalidades de:
- Gestão de múltiplas conexões WhatsApp
- Sistema de tickets e atendimento
- Campanhas automatizadas
- FlowBuilder (construtor de fluxos automatizados)
- Dashboard e relatórios
- Sistema de agendamentos
- Integração com IA (OpenAI)
- Sistema de pagamentos/financeiro
- Multi-empresa (SaaS)
- Sistema Kanban
- Chat interno entre usuários

---

## ARQUITETURA DO PROJETO

### Estrutura de Diretórios
```
frontend/
├── public/                    # Arquivos estáticos públicos
│   ├── index.html            # HTML principal
│   ├── manifest.json         # Configuração PWA
│   ├── service-worker.js     # Service Worker customizado
│   ├── favicon.ico           # Ícones da aplicação
│   ├── logo-light.png        # Logo tema claro
│   ├── logo-dark.png         # Logo tema escuro
│   ├── flags/                # Bandeiras para seleção de idioma
│   └── theme/                # Recursos de tema (sol/lua)
│
├── src/
│   ├── App.js                # Componente raiz da aplicação
│   ├── index.js              # Entry point
│   ├── config.js             # Configurações centralizadas
│   ├── serviceWorker.js      # Registro do Service Worker
│   │
│   ├── components/           # 100+ componentes reutilizáveis
│   │   ├── MainContainer/
│   │   ├── MainHeader/
│   │   ├── WhatsAppModal/
│   │   ├── TicketListItem/
│   │   ├── Dashboard/
│   │   ├── FlowBuilder*/     # Componentes do construtor de fluxos
│   │   ├── Campaign*/        # Componentes de campanhas
│   │   └── [muitos outros...]
│   │
│   ├── context/              # Contexts da aplicação
│   │   ├── Auth/             # Autenticação e usuário
│   │   ├── Socket/           # WebSocket (Socket.io)
│   │   ├── Tickets/          # Estado de tickets
│   │   ├── WhatsApp/         # Conexões WhatsApp
│   │   ├── Currency/         # Moeda/Fuso horário
│   │   ├── ActiveMenuContext/
│   │   ├── EditingMessage/
│   │   ├── ForwarMessage/
│   │   ├── ProfileImage/
│   │   ├── QueuesSelected/
│   │   └── ReplyingMessage/
│   │
│   ├── hooks/                # 26 hooks customizados
│   │   ├── useAuth.js/
│   │   ├── useTickets/
│   │   ├── useContacts/
│   │   ├── useWhatsApps/
│   │   ├── useSettings/
│   │   ├── useCurrency/
│   │   ├── useTimezone.js
│   │   └── [outros...]
│   │
│   ├── layout/               # Componentes de layout
│   │   ├── index.js          # Layout principal (drawer + appbar)
│   │   ├── MainListItems.js  # Menu lateral
│   │   └── themeContext.js   # Contexto de tema
│   │
│   ├── pages/                # 40+ páginas da aplicação
│   │   ├── Login/
│   │   ├── Dashboard/
│   │   ├── Tickets/
│   │   ├── TicketsCustom/
│   │   ├── TicketsAdvanced/
│   │   ├── Connections/
│   │   ├── AllConnections/
│   │   ├── Contacts/
│   │   ├── Campaigns/
│   │   ├── FlowBuilder/
│   │   ├── Chat/
│   │   ├── Kanban/
│   │   ├── Companies/        # Multi-empresa
│   │   ├── Financeiro/       # Sistema financeiro
│   │   └── [muitas outras...]
│   │
│   ├── routes/               # Sistema de roteamento
│   │   ├── index.js          # Definição de rotas
│   │   └── Route.js          # Componente de rota customizado
│   │
│   ├── services/             # Serviços e APIs
│   │   ├── api.js            # Cliente Axios configurado
│   │   ├── socket.js         # Configuração Socket.io
│   │   ├── SocketWorker.js   # Worker para Socket
│   │   ├── CurrencyService.js
│   │   ├── TimezoneService.js
│   │   └── flowBuilder.js
│   │
│   ├── stores/               # Estado global (Zustand)
│   │   └── useNodeStorage.js
│   │
│   ├── translate/            # Sistema de tradução
│   │   ├── i18n.js
│   │   └── languages/
│   │       ├── pt.js         # Português
│   │       ├── en.js         # Inglês
│   │       ├── es.js         # Espanhol
│   │       ├── ar.js         # Árabe
│   │       └── tr.js         # Turco
│   │
│   ├── utils/                # Utilitários
│   │   ├── capitalize.js
│   │   ├── emojisArray.js
│   │   ├── FormatMask.js
│   │   ├── formatSerializedId.js
│   │   ├── formatToCurrency.js
│   │   ├── formatToHtmlFormat.js
│   │   └── sleep.js
│   │
│   ├── helpers/              # Funções auxiliares
│   │   └── contrastColor.js
│   │
│   ├── errors/               # Tratamento de erros
│   │   └── toastError.js
│   │
│   ├── assets/               # Recursos estáticos
│   │
│   └── styles/               # Estilos globais
│
├── .env                      # Variáveis de ambiente
├── package.json              # Dependências e scripts
├── tsconfig.json             # Configuração TypeScript
├── craco.config.js           # Configuração CRACO
├── config-overrides.js       # Overrides do Webpack
└── server.js                 # Servidor Express para build
```

---

## ARQUIVOS DE CONFIGURAÇÃO

### 1. package.json
**Localização:** `/package.json`

#### Informações Básicas
```json
{
  "name": "frontend",
  "version": "2.2.2v-26",
  "nomeEmpresa": "Sua empresa",
  "versionSystem": "2.0.0",
  "private": true
}
```

#### Scripts Disponíveis
```json
{
  "start": "craco start",               // Desenvolvimento
  "build": "NODE_OPTIONS='--max-old-space-size=4096' craco build",  // Build de produção (4GB RAM)
  "test": "craco test"                  // Testes
}
```

#### Dependências Principais (98 pacotes)

**Framework e Core:**
- `react@17.0.2` + `react-dom@17.0.2` - Framework base
- `react-scripts@5.0.1` - Scripts do Create React App
- `react-router-dom@5.2.0` - Roteamento
- `react-query@3.39.3` - Cache e gerenciamento de dados server-side

**UI Libraries:**
- `@material-ui/core@4.12.3` - UI principal
- `@mui/material@5.17.1` - Material UI v5 (convivendo com v4)
- `@material-ui/icons@4.11.3` - Ícones Material
- `@mui/icons-material@5.17.1` - Ícones MUI v5
- `lucide-react@0.475.0` - Ícones modernos
- `react-icons@4.7.1` - Biblioteca de ícones adicional

**Formulários e Validação:**
- `formik@2.2.0` - Gerenciamento de formulários
- `yup@0.32.8` - Validação de schemas
- `formik-material-ui@3.0.1` - Integração Formik + Material-UI

**Data/Hora:**
- `@date-io/date-fns@2.16.0` - Adaptador de datas
- `date-fns@2.16.1` - Manipulação de datas
- `moment@2.29.4` - Biblioteca de datas legada
- `@material-ui/pickers@3.3.10` - Date pickers
- `@mui/x-date-pickers@5.0.8` - Date pickers MUI v5

**Comunicação:**
- `axios@0.21.1` - Cliente HTTP
- `socket.io-client@4.7.4` - WebSocket real-time
- `@socket.io/admin-ui@0.5.1` - UI Admin para Socket.io

**Estado Global:**
- `zustand@4.4.1` - Gerenciamento de estado leve
- `context@4.0.0` - Context API nativo

**Charts e Visualizações:**
- `chart.js@3.9.1` - Biblioteca de gráficos
- `react-chartjs-2@4.3.1` - Integração React + Chart.js
- `chartjs-plugin-datalabels@2.1.0` - Plugin para labels
- `recharts@2.0.2` - Gráficos alternativos

**FlowBuilder:**
- `react-flow-renderer@10.3.17` - Versão antiga
- `reactflow@11.7.4` - Versão nova do Flow
- `react-trello@2.2.11` - Boards Kanban/Trello

**Mídia e Arquivos:**
- `compressorjs@1.2.1` - Compressão de imagens
- `react-dropzone@14.2.3` - Upload de arquivos
- `file-saver@2.0.5` - Download de arquivos
- `react-pdf@5.7.1` - Visualização de PDFs
- `react-player@2.13.0` - Player de vídeos
- `react-audio-player@0.17.0` - Player de áudio
- `mic-recorder-to-mp3@2.2.2` - Gravação de áudio
- `react-webcam@7.1.1` - Webcam
- `react-html5-camera-photo@1.5.11` - Câmera foto

**Utilitários:**
- `i18next@19.9.2` - Internacionalização
- `react-i18next@15.4.1` - Integração i18n com React
- `i18next-browser-languagedetector@6.0.1` - Detecção de idioma
- `react-toastify@6.0.9` - Notificações toast
- `react-copy-to-clipboard@5.1.0` - Copiar para área de transferência
- `emoji-mart@3.0.0` - Picker de emojis
- `emoji-regex@10.3.0` - Regex para emojis
- `qrcode.react@1.0.0` - Geração de QR Code
- `react-qr-code@2.0.11` - QR Code alternativo
- `uuid@8.3.2` - Geração de UUIDs
- `query-string@7.0.0` - Parse de query strings
- `use-debounce@7.0.0` - Debounce hook
- `use-sound@2.0.1` - Sons/Áudio

**Integrations:**
- `jssip@3.10` - VoIP/SIP (Softphone)
- `react-softphone@1.7.0` - Softphone React
- `gn-api-sdk-node@3.0.2` - Gerencianet (pagamentos)
- `react-facebook-login@4.1.1` - Login Facebook

**PWA e Notificações:**
- `react-onesignal@2.0.4` - OneSignal notificações

**Markdown e Formatação:**
- `markdown-to-jsx@7.1.0` - Renderização Markdown
- `react-input-mask@2.0.4` - Máscaras de input
- `react-number-format@4.6.4` - Formatação numérica

**Export/Import:**
- `react-csv@2.2.2` - Export CSV
- `xlsx@0.18.5` - Excel import/export
- `html2pdf.js@0.10.1` - Geração de PDFs

**Calendário:**
- `react-big-calendar@1.8.4` - Calendário completo

**Modais e Overlays:**
- `react-modal@3.16.1` - Modais
- `react-modal-image@2.5.0` - Modal de imagens
- `material-ui-popup-state@4.1.0` - Estado de popups

**Styling:**
- `styled-components@5.3.6` - CSS-in-JS
- `react-color@2.19.3` - Color pickers
- `material-ui-color@1.2.0` - Color picker Material

**Polyfills:**
- `buffer@6.0.3` - Buffer para navegador
- `path-browserify@1.0.1` - Path para navegador

**Outros:**
- `bootstrap@5.2.3` + `react-bootstrap@2.7.0` - Bootstrap
- `react-helmet@6.1.0` - Meta tags dinâmicas
- `react-favicon@2.0.3` - Favicon dinâmico
- `react-youtube@10.1.0` - Player YouTube
- `@sentry/node@9.11.0` - Error tracking (Sentry)

#### DevDependencies
```json
{
  "@craco/craco@7.1.0": "Override CRA config",
  "node-polyfill-webpack-plugin@4.1.0": "Polyfills Node.js",
  "react-app-rewired@2.2.1": "Override CRA alternativo",
  "typescript@5.5.3": "Suporte TypeScript",
  "pacote@21.0.0": "Package management"
}
```

### 2. .env
**Localização:** `/.env`

```bash
# Backend URL - URL do servidor backend
REACT_APP_BACKEND_URL=http://localhost:8080

# Configurações opcionais
REACT_APP_HOURS_CLOSE_TICKETS_AUTO=1       # Horas para fechar tickets automaticamente
REACT_APP_PRIMARY_COLOR=#10aa62            # Cor primária (tema claro)
REACT_APP_PRIMARY_DARK=#0d8b4f             # Cor primária (tema escuro)
REACT_APP_NUMBER_SUPPORT=""                # Número de suporte

# Configuração da porta do servidor
PORT=3000

# Debug - força carregamento do environment
GENERATE_SOURCEMAP=false                   # Desabilita sourcemaps em produção
```

**Variáveis Disponíveis:**
- `REACT_APP_BACKEND_URL` - URL do backend (obrigatório)
- `REACT_APP_HOURS_CLOSE_TICKETS_AUTO` - Auto-close de tickets
- `REACT_APP_PRIMARY_COLOR` - Cor tema claro
- `REACT_APP_PRIMARY_DARK` - Cor tema escuro
- `REACT_APP_NUMBER_SUPPORT` - WhatsApp de suporte
- `PORT` - Porta do servidor de desenvolvimento
- `GENERATE_SOURCEMAP` - Gerar sourcemaps

### 3. tsconfig.json
**Localização:** `/tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,                        // Permite arquivos .js
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,                         // Modo strict ativado
    "forceConsistentCasingInFileNames": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,                         // Não gera arquivos (CRA cuida disso)
    "jsx": "react"
  },
  "include": ["src"]
}
```

**Características:**
- **Suporte Híbrido:** JavaScript + TypeScript
- **Modo Strict:** Ativado para máxima segurança
- **Target ES5:** Compatibilidade máxima
- **JSX React:** Sintaxe React padrão

### 4. craco.config.js
**Localização:** `/craco.config.js`

```javascript
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");

module.exports = {
  webpack: {
    configure: (webpackConfig) => {
      // Polyfills para módulos Node.js no navegador
      webpackConfig.resolve.fallback = {
        ...webpackConfig.resolve.fallback,
        path: "path-browserify",
        buffer: "buffer"
      };

      // Permite imports sem extensão .js
      webpackConfig.module.rules.push({
        test: /\.m?js$/,
        resolve: {
          fullySpecified: false
        }
      });

      // Plugin de polyfills
      webpackConfig.plugins = [
        ...(webpackConfig.plugins || []),
        new NodePolyfillPlugin()
      ];

      return webpackConfig;
    }
  }
};
```

**Funcionalidades:**
- **Polyfills Node.js:** Buffer, Path, etc.
- **Imports Flexíveis:** Sem necessidade de extensões
- **Webpack Customizado:** Configurações avançadas

### 5. config-overrides.js
**Localização:** `/config-overrides.js`

```javascript
const webpack = require("webpack");

module.exports = function override(config) {
  config.resolve.fallback = {
    path: require.resolve("path-browserify"),
  };
  return config;
};
```

**Propósito:** Fallback alternativo para react-app-rewired

### 6. server.js
**Localização:** `/server.js`

```javascript
const express = require("express");
const path = require("path");
const app = express();

// Serve arquivos estáticos do build
app.use(express.static(path.join(__dirname, "build")));

// Fallback: qualquer rota retorna index.html (SPA)
app.get("/*", function (req, res) {
  res.sendFile(path.join(__dirname, "build", "index.html"));
});

// Configuração de porta
const PORT = Number(process.env.PORT) || 3001;
const HOST = process.env.HOST || "0.0.0.0";

app.listen(PORT, HOST, () => {
  console.log(`Frontend server running on http://${HOST}:${PORT}`);
});
```

**Características:**
- Servidor Express para servir o build
- SPA routing (todas rotas -> index.html)
- Configurável via ENV

---

## SISTEMA DE ROTEAMENTO

### Arquivo Principal: /src/routes/index.js

#### Estrutura de Providers
```javascript
<BrowserRouter>
  <AuthProvider>                    // Autenticação
    <CurrencyProvider>              // Moeda/Timezone
      <TicketsContextProvider>      // Estado de tickets
        <Switch>
          // Rotas públicas
          <Route path="/login" />
          <Route path="/signup" />
          <Route path="/forgot-password" />
          <Route path="/reset-password" />

          <WhatsAppsProvider>       // Contexto WhatsApp
            <LoggedInLayout>        // Layout com drawer/menu
              // Rotas privadas
            </LoggedInLayout>
          </WhatsAppsProvider>
        </Switch>
      </TicketsContextProvider>
    </CurrencyProvider>
  </AuthProvider>
</BrowserRouter>
```

#### Rotas Públicas
```javascript
/login                    - Página de login
/signup                   - Cadastro
/forgot-password          - Esqueci a senha
/reset-password           - Redefinir senha
```

#### Rotas Privadas (Autenticadas)
```javascript
// CORE
/                         - Dashboard principal
/tickets/:ticketId?       - Sistema de tickets (atendimento)

// CONEXÕES
/connections              - Conexões WhatsApp do usuário
/allConnections           - Todas conexões (admin)

// COMUNICAÇÃO
/chats/:id?               - Chat interno entre usuários
/messages-api             - API de mensagens

// CONTATOS
/contacts                 - Gestão de contatos
/contacts/import          - Importar contatos

// FILAS E ATENDIMENTO
/queues                   - Filas de atendimento
/queue-integration        - Integrações de filas
/tags                     - Tags/Etiquetas
/Kanban                   - Kanban de tickets
/TagsKanban               - Kanban por tags

// AUTOMAÇÃO
/flowbuilders             - Lista de fluxos
/flowbuilder/:id?         - Editor de fluxo
/quick-messages           - Mensagens rápidas
/schedules                - Agendamentos
/prompts                  - Prompts para IA

// CAMPANHAS (condicional: showCampaigns)
/campaigns                - Campanhas de envio
/campaign/:campaignId/report - Relatório de campanha
/campaigns-config         - Configurações de campanhas
/contact-lists            - Listas de contatos
/contact-lists/:contactListId/contacts - Contatos da lista
/phrase-lists             - Listas de frases

// ANÚNCIOS
/announcements            - Anúncios/Avisos

// GESTÃO
/users                    - Usuários
/companies                - Empresas (multi-tenant)
/settings                 - Configurações
/reports                  - Relatórios
/files                    - Arquivos

// FUNCIONALIDADES EXTRAS
/todolist                 - Lista de tarefas
/helps                    - Central de ajuda
/moments                  - Momentos/Stories dos usuários
/financeiro               - Sistema financeiro
```

### Componente de Rota: /src/routes/Route.js

```javascript
const Route = ({ component: Component, isPrivate = false, ...rest }) => {
  const { isAuth, loading } = useContext(AuthContext);

  // Não autenticado tentando acessar rota privada
  if (!isAuth && isPrivate) {
    return <Redirect to="/login" />;
  }

  // Autenticado tentando acessar rota pública
  if (isAuth && !isPrivate) {
    return <Redirect to="/" />;
  }

  return <RouterRoute {...rest} component={Component} />;
};
```

**Características:**
- **Proteção de Rotas:** isPrivate flag
- **Redirecionamentos Automáticos:** Login/Dashboard
- **Loading State:** BackdropLoading durante autenticação

### Sistema de Campanhas (Condicional)
```javascript
const [showCampaigns, setShowCampaigns] = useState(false);

useEffect(() => {
  const cshow = localStorage.getItem("cshow");
  if (cshow !== undefined) {
    setShowCampaigns(true);
  }
}, []);
```

**Ativação:** localStorage "cshow" deve existir

---

## GERENCIAMENTO DE ESTADO

### 1. Context API

#### AuthContext (`/src/context/Auth/AuthContext.js`)
```javascript
<AuthContext.Provider
  value={{
    loading,              // Estado de carregamento
    user,                 // Objeto do usuário logado
    isAuth,               // Boolean de autenticação
    handleLogin,          // Função de login
    handleLogout,         // Função de logout
    socket,               // Instância do Socket.io
    timezone,             // Timezone do usuário/empresa
    timezoneLoading,      // Loading do timezone
    loadTimezone,         // Carregar timezone
    reloadTimezone        // Recarregar timezone
  }}
>
```

**Responsabilidades:**
- Autenticação de usuários
- Gerenciamento de sessão
- Conexão WebSocket
- Timezone/Localização

#### SocketContext (`/src/context/Socket/SocketContext.js`)
```javascript
const socketManager = {
  currentSocket: null,
  currentToken: null,

  GetSocket: function() {
    const publicToken = localStorage.getItem("public-token");

    // Reconecta se o token mudou
    if (publicToken !== this.currentToken) {
      if (this.currentSocket) {
        this.currentSocket.disconnect();
      }

      this.currentSocket = openSocket(BACKEND_URL, {
        transports: ["websocket"],
        pingTimeout: 18000,
        pingInterval: 18000,
        query: publicToken ? { token: publicToken } : {}
      });
    }

    return this.currentSocket;
  },

  onConnect: function(callbackConnect) {
    if (this.currentSocket && this.currentSocket.connected) {
      callbackConnect();
    }
    this.currentSocket.on("connect", callbackConnect);
  }
};
```

**Características:**
- **Singleton Pattern:** Uma única conexão socket
- **Auto-reconexão:** Quando token muda
- **Transporte WebSocket:** Apenas websocket
- **Keepalive:** Ping a cada 18 segundos

#### TicketsContext (`/src/context/Tickets/TicketsContext.js`)
```javascript
<TicketsContext.Provider
  value={{
    currentTicket,        // Ticket atual { id, uuid, code }
    setCurrentTicket,     // Setter do ticket atual
    tabOpen,              // Aba aberta (open/pending/closed)
    setTabOpen            // Setter da aba
  }}
>
```

**Auto-navegação:**
```javascript
useEffect(() => {
  if (currentTicket.id !== null) {
    history.push(`/tickets/${currentTicket.uuid}`);
  }
}, [currentTicket]);
```

#### CurrencyContext (`/src/context/Currency/CurrencyContext.js`)
- Gerenciamento de moeda
- Formatação monetária
- Conversões

#### WhatsAppsContext (`/src/context/WhatsApp/WhatsAppsContext.js`)
- Estado das conexões WhatsApp
- Status de conexões
- Atualização em tempo real

#### Outros Contexts
- **ActiveMenuContext** - Menu ativo no sidebar
- **EditingMessage** - Mensagem sendo editada
- **ForwarMessage** - Mensagem sendo encaminhada
- **ProfileImage** - Imagem de perfil
- **QueuesSelected** - Filas selecionadas
- **ReplyingMessage** - Mensagem sendo respondida

### 2. Zustand Store

#### useNodeStorage (`/src/stores/useNodeStorage.js`)
```javascript
// Store para FlowBuilder
// Gerencia nós do construtor de fluxos
```

**Características:**
- Estado global leve
- Sem boilerplate
- Usado principalmente no FlowBuilder

### 3. React Query

**Cliente:**
```javascript
const queryClient = new QueryClient();

<QueryClientProvider client={queryClient}>
  {/* App */}
</QueryClientProvider>
```

**Uso:**
- Cache de requisições API
- Invalidação automática
- Refetch automático
- Estados loading/error

---

## SERVIÇOS E INTEGRAÇÕES

### 1. API Service (`/src/services/api.js`)

```javascript
const api = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL,
  withCredentials: true  // Envia cookies
});

// Sistema de cancelamento de requisições
let cancelTokenSource = CancelToken.source();

// Interceptor: adiciona cancel token
api.interceptors.request.use((config) => {
  if (!cancelTokenSource) {
    cancelTokenSource = CancelToken.source();
  }
  config.cancelToken = cancelTokenSource.token;
  return config;
});

// Interceptor: trata cancelamentos
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isCancel(error)) {
      console.log('Requisição cancelada:', error.message);
      return Promise.resolve(); // Não rejeita
    }
    return Promise.reject(error);
  }
);

// API aberta (sem autenticação)
export const openApi = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL
});
```

**Funções Exportadas:**
- `api` - Cliente autenticado principal
- `openApi` - Cliente sem autenticação
- `createCancelTokenSource()` - Cria novo cancel token
- `cancelAllRequests(message)` - Cancela todas requisições

**Características:**
- **withCredentials:** Envia cookies de sessão
- **Cancel Tokens:** Previne race conditions
- **Interceptores:** Request e Response
- **Duas instâncias:** Autenticada e pública

### 2. Socket Service (`/src/services/socket.js`)

```javascript
export function socketConnection(params) {
  let userId = "";
  let companyId = "";

  if (isObject(params)) {
    companyId = params?.user?.companyId;
    userId = params?.user?.id;
  }

  return SocketWorker(companyId, userId);
}
```

**SocketWorker.js:**
- Gerencia múltiplas conexões por empresa
- Workers isolados por companyId
- Reconexão automática

### 3. Currency Service (`/src/services/CurrencyService.js`)
- Formatação de valores monetários
- Conversão de moedas
- Localização de números

### 4. Timezone Service (`/src/services/TimezoneService.js`)
```javascript
// Detecção automática de timezone
// Conversão de datas
// Formatação localizada
```

### 5. FlowBuilder Service (`/src/services/flowBuilder.js`)
- APIs para FlowBuilder
- CRUD de nós e conexões
- Validação de fluxos

---

## COMPONENTES PRINCIPAIS

### Estrutura (100+ componentes)

#### Layout Core
1. **LoggedInLayout** (`/src/layout/index.js`) - 515 linhas
   - AppBar superior
   - Drawer lateral (menu)
   - Responsivo (desktop/mobile)
   - Tema claro/escuro
   - Avatar e perfil do usuário
   - Notificações
   - Controle de volume
   - Logo dinâmico

2. **MainListItems** (`/src/layout/MainListItems.js`) - 30KB
   - Menu lateral completo
   - Permissões por perfil
   - Ícones dinâmicos
   - Collapsed state

#### Dashboard
- **Dashboard/** - Dashboard principal
  - Gráficos de atendimento
  - Métricas em tempo real
  - Charts.js integration
  - Filtros por período

#### Tickets/Atendimento
- **Ticket/** - Componente de ticket individual
- **TicketListItem/** - Item da lista
- **TicketListItemCustom/** - Versão customizada
- **TicketsListCustom/** - Lista customizada
- **TicketAdvancedLayout/** - Layout avançado
- **TicketHeader/** - Cabeçalho do ticket
- **TicketInfo/** - Informações do ticket
- **TicketOptionsMenu/** - Menu de opções
- **MessagesList/** - Lista de mensagens
- **MessageInput/** - Input de mensagens
- **MessageOptionsMenu/** - Opções da mensagem
- **TransferTicketModalCustom/** - Modal de transferência

#### WhatsApp
- **WhatsAppModal/** - Modal de conexão WhatsApp (usuário)
- **WhatsAppModalAdmin/** - Modal admin
- **QrcodeModal/** - QR Code para conexão
- **ConnectionIcon/** - Ícone de status de conexão
- **CompanyWhatsapps/** - Conexões da empresa

#### FlowBuilder (10+ componentes)
- **FlowBuilderModal/** - Modal principal
- **FlowBuilderAddTextModal/** - Adicionar texto
- **FlowBuilderAddAudioModal/** - Adicionar áudio
- **FlowBuilderAddImgModal/** - Adicionar imagem
- **FlowBuilderAddVideoModal/** - Adicionar vídeo
- **FlowBuilderAddQuestionModal/** - Adicionar pergunta
- **FlowBuilderAddTicketModal/** - Criar ticket
- **FlowBuilderConditionModal/** - Condições
- **FlowBuilderRandomizerModal/** - Randomizador
- **FlowBuilderMenuModal/** - Menu de opções
- **FlowBuilderIntervalModal/** - Intervalos
- **FlowBuilderAddOpenAIModal/** - Integração OpenAI
- **FlowBuilderAddTypebotModal/** - Integração Typebot
- **FlowBuilderSingleBlockModal/** - Bloco único

#### Campanhas
- **CampaignModal/** - Modal de campanha
- **CampaignModalPhrase/** - Frases de campanha
- **CampaignsPhrase/** - Gerenciamento de frases

#### Contatos
- **ContactModal/** - Modal de contato
- **ContactDrawer/** - Drawer de informações
- **ContactForm/** - Formulário
- **ContactListDialog/** - Diálogo de listas
- **ContactImport/** - Importação
- **ContactImportWpModal/** - Importar do WhatsApp
- **ContactNotes/** - Notas de contato
- **ContactTag/** - Tags de contato
- **ContactSendModal/** - Enviar mensagem

#### Filtros
- **ContactsFilter/** - Filtro de contatos
- **ConnectionsFilter/** - Filtro de conexões
- **WhatsappsFilter/** - Filtro de WhatsApps
- **UsersFilter/** - Filtro de usuários
- **QueueFilter/** - Filtro de filas
- **TagsFilter/** - Filtro de tags
- **StatusFilter/** - Filtro de status
- **CreatedAtFilter/** - Filtro de data criação
- **UpdatedAtFilter/** - Filtro de data atualização
- **ParamsFilter/** - Filtros parametrizados

#### Modais Reutilizáveis
- **ConfirmationModal/** - Confirmação genérica
- **UserModal/** - Modal de usuário
- **CompaniesModal/** - Modal de empresas
- **QueueModal/** - Modal de fila
- **TagModal/** - Modal de tag
- **PromptModal/** - Modal de prompt
- **ScheduleModal/** - Modal de agendamento
- **MessageModal/** - Modal de mensagem
- **InformationModal/** - Modal informativo
- **ButtonModal/** - Modal de botões

#### Utilitários UI
- **MainContainer/** - Container principal
- **MainHeader/** - Cabeçalho
- **MainHeaderButtonsWrapper/** - Wrapper de botões
- **Title/** - Título de página
- **BackdropLoading/** - Loading de fundo
- **TableRowSkeleton/** - Skeleton de tabela
- **TicketHeaderSkeleton/** - Skeleton de header
- **TicketsListSkeleton/** - Skeleton de lista
- **WithSkeleton/** - HOC de skeleton

#### Preview e Mídia
- **AudioModal/** - Modal de áudio
- **VideoModal/** - Modal de vídeo
- **FileModal/** - Modal de arquivo
- **CameraModal/** - Modal de câmera
- **VcardPreview/** - Preview de vCard
- **LocationPreview/** - Preview de localização
- **ListPreview/** - Preview de lista
- **AdMetaPreview/** - Preview de anúncio Meta
- **ButtonPreview/** - Preview de botão
- **ModalImageCors/** - Imagem com CORS
- **ModalYoutubeCors/** - YouTube com CORS

#### Componentes de Input
- **Input/** - Input customizado
- **CurrencyInput/** - Input de moeda
- **MessageVariablesPicker/** - Picker de variáveis
- **MessageUploadMedias/** - Upload de mídias
- **ColorPicker/** - Picker de cores
- **ColorBoxModal/** - Modal de cor
- **AvatarUpload/** - Upload de avatar

#### Empresas/Multi-tenant
- **CompaniesManager/** - Gerenciador de empresas
- **CompaniesModal/** - Modal de empresa
- **CompanyWhatsapps/** - WhatsApps da empresa

#### Financeiro
- **CheckoutPage/** - Página de checkout
- **SubscriptionModal/** - Modal de assinatura
- **PlansManager/** - Gerenciador de planos

#### Permissões
- **Can/** - HOC de permissão
- **OnlyForSuperUser/** - Apenas super usuários
- **ForbiddenPage/** - Página de acesso negado

#### Notificações
- **NotificationsPopOver/** - Popover de notificações
- **NotificationsVolume/** - Controle de volume
- **AnnouncementsPopover/** - Popover de anúncios

#### Outros
- **UserLanguageSelector/** - Seletor de idioma
- **VersionControl/** - Controle de versão
- **DarkMode/** - Toggle dark mode
- **Softphone/** - Telefone VoIP
- **ChatBots/** - Gerenciamento de bots
- **Settings/** - Componente de configurações
- **HelpsManager/** - Gerenciador de ajuda
- **QuickMessagesTable/** - Tabela de mensagens rápidas
- **QuickMessageDialog/** - Diálogo de mensagem rápida
- **MomentsUser/** - Momentos do usuário

---

## TEMAS E ESTILOS

### Configuração de Tema (`/src/App.js`)

#### Estados de Tema
```javascript
const [mode, setMode] = useState(
  preferredTheme ? preferredTheme : prefersDarkMode ? "dark" : "light"
);
const [primaryColorLight, setPrimaryColorLight] = useState("#10aa62");
const [primaryColorDark, setPrimaryColorDark] = useState("#0d8b4f");
const [appLogoLight, setAppLogoLight] = useState("/logo-light.png");
const [appLogoDark, setAppLogoDark] = useState("/logo-dark.png");
const [appLogoFavicon, setAppLogoFavicon] = useState("/favicon.png");
const [appName, setAppName] = useState("ChatIA");
```

#### ColorModeContext
```javascript
const colorMode = useMemo(() => ({
  toggleColorMode: () => {
    setMode((prevMode) => {
      const newMode = prevMode === "light" ? "dark" : "light";
      window.localStorage.setItem("preferredTheme", newMode);
      return newMode;
    });
  },
  setPrimaryColorLight,
  setPrimaryColorDark,
  setAppLogoLight,
  setAppLogoDark,
  setAppLogoFavicon,
  setAppName,
  appLogoLight,
  appLogoDark,
  appLogoFavicon,
  appName,
  mode
}), [appLogoLight, appLogoDark, appLogoFavicon, appName, mode]);
```

#### Tema Material-UI
```javascript
const theme = createTheme({
  scrollbarStyles: {
    "&::-webkit-scrollbar": { width: "8px", height: "8px" },
    "&::-webkit-scrollbar-thumb": {
      boxShadow: "inset 0 0 6px rgba(0, 0, 0, 0.3)",
      backgroundColor: mode === "light" ? primaryColorLight : primaryColorDark
    }
  },
  scrollbarStylesSoft: {
    "&::-webkit-scrollbar": { width: "8px" },
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: mode === "light" ? "#F3F3F3" : "#333333"
    }
  },
  palette: {
    type: mode,
    primary: { main: mode === "light" ? primaryColorLight : primaryColorDark },
    textPrimary: mode === "light" ? primaryColorLight : primaryColorDark,
    borderPrimary: mode === "light" ? primaryColorLight : primaryColorDark,
    dark: { main: mode === "light" ? "#333333" : "#F3F3F3" },
    light: { main: mode === "light" ? "#F3F3F3" : "#333333" },
    fontColor: mode === "light" ? primaryColorLight : primaryColorDark,
    tabHeaderBackground: mode === "light" ? "#EEE" : "#666",
    optionsBackground: mode === "light" ? "#fafafa" : "#333",
    fancyBackground: mode === "light" ? "#fafafa" : "#333",
    total: mode === "light" ? "#fff" : "#222",
    messageIcons: mode === "light" ? "grey" : "#F3F3F3",
    inputBackground: mode === "light" ? "#FFFFFF" : "#333",
    barraSuperior: mode === "light" ? primaryColorLight : "#666"
  },
  mode,
  appLogoLight,
  appLogoDark,
  appLogoFavicon,
  appName,
  calculatedLogoDark: () => {
    if (appLogoDark === "/logo-dark.png" && appLogoLight !== "/logo-light.png") {
      return appLogoLight;
    }
    return appLogoDark;
  },
  calculatedLogoLight: () => {
    if (appLogoDark !== "/logo-dark.png" && appLogoLight === "/logo-light.png") {
      return appLogoDark;
    }
    return appLogoLight;
  }
}, ptBR);
```

#### Carregamento de Configurações
```javascript
useEffect(() => {
  getPublicSetting("primaryColorLight").then(color => {
    setPrimaryColorLight(color || "#0000FF");
  });

  getPublicSetting("primaryColorDark").then(color => {
    setPrimaryColorDark(color || "#39ACE7");
  });

  getPublicSetting("appLogoLight").then(file => {
    setAppLogoLight(file ? getBackendUrl() + "/public/" + file : "/logo-light.png");
  });

  getPublicSetting("appLogoDark").then(file => {
    setAppLogoDark(file ? getBackendUrl() + "/public/" + file : "/logo-dark.png");
  });

  getPublicSetting("appLogoFavicon").then(file => {
    setAppLogoFavicon(file ? getBackendUrl() + "/public/" + file : "/favicon.png");
  });

  getPublicSetting("appName").then(name => {
    setAppName(name || "ChatIA");
  });
}, []);
```

#### CSS Variable
```javascript
useEffect(() => {
  const root = document.documentElement;
  root.style.setProperty(
    "--primaryColor",
    mode === "light" ? primaryColorLight : primaryColorDark
  );
}, [primaryColorLight, primaryColorDark, mode]);
```

### Layout Responsivo (`/src/layout/index.js`)

#### Breakpoints
```javascript
const theme = useTheme();
const greaterThenSm = useMediaQuery(theme.breakpoints.up("sm")); // > 600px
```

#### Drawer Behavior
```javascript
// Desktop: Permanent drawer
// Mobile: Temporary drawer (overlay)
const [drawerVariant, setDrawerVariant] = useState("permanent");

useEffect(() => {
  if (document.body.offsetWidth < 600) {
    setDrawerVariant("temporary");
  } else {
    setDrawerVariant("permanent");
  }
}, [drawerOpen]);
```

#### Mobile Optimizations
- **Topbar Scroller:** Scroll horizontal em mobile para ícones
- **Compressed Icons:** Padding reduzido
- **Hidden Logo:** Logo oculto quando drawer fechado
- **Flex Wrap:** Sem quebra de linha nos ícones

---

## PWA E SERVICE WORKERS

### 1. Manifest (`/public/manifest.json`)

```json
{
  "short_name": "ChatIA Flow",
  "name": "ChatIA Flow",
  "icons": [
    {
      "src": "favicon.ico",
      "sizes": "64x64 32x32 24x24 16x16",
      "type": "image/x-icon"
    },
    {
      "src": "/android-chrome-192x192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/android-chrome-512x512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ],
  "start_url": ".",
  "display": "standalone",
  "theme_color": "#000000",
  "background_color": "#ffffff",
  "prefer_related_applications": false,
  "categories": ["business", "productivity"],
  "description": "Sistema de MultiAtendimento para WhatsApp",
  "orientation": "any",
  "scope": "/",
  "shortcuts": [
    {
      "name": "Iniciar atendimento",
      "short_name": "Atendimento",
      "description": "Iniciar novo atendimento",
      "url": "/atendimento"
    }
  ]
}
```

**Características:**
- **Display Standalone:** App fullscreen
- **Shortcuts:** Atalhos para funcionalidades
- **Maskable Icon:** Suporte a ícones adaptáveis
- **Categories:** Business e Productivity

### 2. Service Worker (`/public/service-worker.js`)

#### Cache Strategy
```javascript
const STATIC_CACHE = "mf-static-v1";
const RUNTIME_CACHE = "mf-runtime-v1";

const PRECACHE_URLS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/favicon.ico",
  "/android-chrome-192x192.png",
  "/android-chrome-512x512.png"
];
```

#### Install Event
```javascript
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});
```

#### Activate Event
```javascript
self.addEventListener("activate", event => {
  event.waitUntil((async () => {
    // Limpa caches antigos
    const cacheNames = await caches.keys();
    await Promise.all(
      cacheNames
        .filter(name => ![STATIC_CACHE, RUNTIME_CACHE].includes(name))
        .map(name => caches.delete(name))
    );
    await self.clients.claim();
  })());
});
```

#### Push Notifications
```javascript
self.addEventListener("push", event => {
  const payload = event.data.json();

  const title = payload.title || "ChatIA";
  const options = {
    body: payload.body || "",
    icon: payload.icon || "/android-chrome-192x192.png",
    badge: payload.badge || "/android-chrome-192x192.png",
    tag: payload.tag || "default-tag",
    data: { url: payload.url || "/", ...payload.data },
    sound: payload.sound || undefined,
    vibrate: payload.vibrate || [200, 100, 200],
    requireInteraction: true
  };

  // Broadcast para a aplicação
  if (broadcastChannel) {
    broadcastChannel.postMessage({ type: "PUSH_EVENT", payload });
  }

  event.waitUntil(self.registration.showNotification(title, options));
});
```

#### Notification Click
```javascript
self.addEventListener("notificationclick", event => {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || "/";
  event.waitUntil(focusOrOpen(urlToOpen));
});
```

#### Broadcast Channel
```javascript
let broadcastChannel;
try {
  broadcastChannel = new BroadcastChannel("pwa-events");
} catch (e) {
  console.error("Broadcast Channel não é suportado.");
}
```

### 3. Service Worker Registration (`/src/serviceWorker.js`)

```javascript
export function register() {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;

      navigator.serviceWorker.register(swUrl)
        .then((registration) => {
          console.log('Service worker registrado!', registration);
        })
        .catch((error) => {
          console.error('Erro no registro:', error);
        });
    });
  }
}

export function unregister() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.ready
      .then((registration) => {
        registration.unregister();
      });
  }
}
```

### 4. Install Prompt (`/src/App.js`)

```javascript
const [deferredPrompt, setDeferredPrompt] = useState(null);

useEffect(() => {
  const handleBeforeInstallPrompt = (e) => {
    e.preventDefault();
    setDeferredPrompt(e);

    // Mostra prompt após 2s
    setTimeout(() => {
      showInstallPrompt();
    }, 2000);
  };

  window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

  return () => {
    window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  };
}, []);

const showInstallPrompt = () => {
  if (deferredPrompt) {
    // Verifica se já está instalado
    if (!window.matchMedia('(display-mode: standalone)').matches) {
      deferredPrompt.prompt();

      deferredPrompt.userChoice.then((choiceResult) => {
        console.log(choiceResult.outcome === 'accepted'
          ? 'Usuário aceitou'
          : 'Usuário recusou');
        setDeferredPrompt(null);
      });
    }
  }
};
```

---

## INTERNACIONALIZAÇÃO

### Configuração (`/src/translate/i18n.js`)

```javascript
import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { messages } from "./languages";

i18n
  .use(LanguageDetector)
  .init({
    debug: false,
    fallbackLng: "pt",              // Idioma padrão
    defaultNS: ["translations"],
    ns: ["translations"],
    resources: messages,
    detection: {
      order: ["localStorage", "navigator", "htmlTag"],
      caches: ["localStorage"]
    }
  });

export { i18n };
```

### Idiomas Suportados

1. **Português (pt.js)** - 106KB - Principal
2. **Inglês (en.js)** - 102KB
3. **Espanhol (es.js)** - 109KB
4. **Árabe (ar.js)** - 89KB
5. **Turco (tr.js)** - 106KB

### Uso
```javascript
import { i18n } from "../translate/i18n";

// Em componentes
{i18n.t("mainDrawer.appBar.user.message")}

// Com React hooks
const { t } = useTranslation();
{t("common.save")}
```

### Seletor de Idioma
**Componente:** `UserLanguageSelector`
- Dropdown com bandeiras
- Persiste no localStorage
- Atualização instantânea

---

## HOOKS CUSTOMIZADOS

### 1. useAuth (`/src/hooks/useAuth.js/index.js`)
```javascript
{
  loading,              // Boolean
  user,                 // User object
  isAuth,               // Boolean
  handleLogin,          // Function(credentials)
  handleLogout,         // Function()
  socket,               // Socket instance
  timezone,             // Timezone object
  timezoneLoading,      // Boolean
  loadTimezone,         // Function()
  reloadTimezone        // Function()
}
```

### 2. useTickets (`/src/hooks/useTickets/`)
- Gerenciamento de tickets
- Filtros e paginação
- Atualização em tempo real

### 3. useContacts (`/src/hooks/useContacts/`)
- CRUD de contatos
- Importação/Exportação
- Busca e filtros

### 4. useWhatsApps (`/src/hooks/useWhatsApps/`)
- Gerenciamento de conexões
- Status de conexões
- QR Code

### 5. useSettings (`/src/hooks/useSettings/`)
```javascript
{
  get(key),             // Buscar configuração
  getPublicSetting(key), // Buscar config pública
  update(key, value)    // Atualizar
}
```

### 6. useCurrency (`/src/hooks/useCurrency/`)
- Formatação monetária
- Conversão de moedas
- Localização

### 7. useTimezone (`/src/hooks/useTimezone.js`)
- Detecção de timezone
- Conversão de datas
- Formatação localizada

### 8. useDate (`/src/hooks/useDate/`)
```javascript
{
  dateToClient(date),   // Date para timezone do cliente
  dateToServer(date),   // Date para timezone do servidor
  formatDate(date)      // Formatar data
}
```

### 9. useLocalStorage (`/src/hooks/useLocalStorage/`)
- Wrapper para localStorage
- Sincronização de estado
- Serialização automática

### 10. useMessages (`/src/hooks/useMessages/`)
- Gerenciamento de mensagens
- Scroll automático
- Carregamento paginado

### 11. useDashboard (`/src/hooks/useDashboard/`)
- Dados do dashboard
- Métricas em tempo real
- Filtros de período

### 12. useQueues (`/src/hooks/useQueues/`)
- Gerenciamento de filas
- Atribuição de tickets
- Estatísticas

### 13. useQuickMessages (`/src/hooks/useQuickMessages/`)
- Mensagens rápidas
- Atalhos
- Variáveis

### 14. useUsers (`/src/hooks/useUsers/`)
- CRUD de usuários
- Permissões
- Filtros

### 15. useCompanies (`/src/hooks/useCompanies/`)
- Multi-tenant
- CRUD de empresas
- Configurações por empresa

### 16. usePlans (`/src/hooks/usePlans/`)
- Planos de assinatura
- Limites e features
- Billing

### 17. useInvoices (`/src/hooks/useInvoices/`)
- Faturas
- Pagamentos
- Histórico

### 18. useContactLists (`/src/hooks/useContactLists/`)
- Listas de contatos
- Campanhas
- Segmentação

### 19. useContactListItems (`/src/hooks/useContactListItems/`)
- Itens de listas
- Importação em massa
- Validação

### 20. useHelps (`/src/hooks/useHelps/`)
- Central de ajuda
- Tutoriais
- FAQs

### 21. useQueueIntegrations (`/src/hooks/useQueueIntegrations/`)
- Integrações externas
- Webhooks
- APIs

### 22. useTicketNotes (`/src/hooks/useTicketNotes/`)
- Notas internas
- Histórico
- Colaboração

### 23. useUser (`/src/hooks/useUser/`)
- Dados do usuário atual
- Preferências
- Avatar

### 24. useUserMoments (`/src/hooks/useUserMoments/`)
- Momentos/Stories
- Mídia temporária
- Visualizações

### 25. useVersion (`/src/hooks/useVersion/`)
- Controle de versão
- Atualização automática
- Changelog

### 26. useWindowDimensions (`/src/hooks/useWindowDimensions/`)
- Dimensões da janela
- Responsividade
- Resize listener

---

## UTILITÁRIOS E HELPERS

### Utilitários (`/src/utils/`)

#### 1. capitalize.js
```javascript
// Capitaliza primeira letra
export default function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}
```

#### 2. emojisArray.js (20KB)
```javascript
// Array completo de emojis
// Categorizado
// Unicode completo
```

#### 3. FormatMask.js
```javascript
// Máscaras de input
// CPF, CNPJ, Telefone
// Customizáveis
```

#### 4. formatSerializedId.js
```javascript
// Formata IDs serializados
// Protocolo de tickets
// Padronização
```

#### 5. formatToCurrency.js
```javascript
// Formata valores para moeda
// Localização
// Símbolos de moeda
```

#### 6. formatToHtmlFormat.js
```javascript
// Converte texto para HTML
// Markdown básico
// Quebras de linha
```

#### 7. sleep.js
```javascript
export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
```

### Helpers (`/src/helpers/`)

#### contrastColor.js
```javascript
// Calcula cor de contraste
// WCAG compliance
// Acessibilidade
```

---

## DEPENDÊNCIAS CRÍTICAS

### Possíveis Problemas de Compatibilidade

#### 1. Axios 0.21.1 (CRÍTICO)
- **Versão Atual:** 0.21.1
- **Problema:** Versão muito antiga (2021)
- **Vulnerabilidades:** CVE conhecidas
- **Solução:** Atualizar para 1.6.x
- **Impacto:** ALTO - Biblioteca central

#### 2. Material-UI Dual Version
- **v4:** @material-ui/core@4.12.3
- **v5:** @mui/material@5.17.1
- **Problema:** Convivência de duas versões
- **Bundle Size:** Duplicado
- **Solução:** Migrar completamente para v5
- **Impacto:** MÉDIO - Performance

#### 3. React 17
- **Versão Atual:** 17.0.2
- **Latest:** 18.x
- **Novo:** Concurrent features, Automatic batching
- **Solução:** Planejar migração
- **Impacto:** MÉDIO - Features novas indisponíveis

#### 4. React Router 5
- **Versão Atual:** 5.2.0
- **Latest:** 6.x
- **Mudanças:** API completamente diferente
- **Solução:** Migração complexa
- **Impacto:** ALTO - Mudanças quebram compatibilidade

#### 5. Socket.io-client 4.7.4
- **Status:** Relativamente atualizado
- **Compatibilidade:** Verificar com backend
- **Impacto:** BAIXO

#### 6. React Scripts 5.0.1
- **Status:** Atualizado
- **Webpack:** v5
- **Impacto:** BAIXO

### Dependências Duplicadas/Conflitantes

```javascript
// Date Libraries (3)
"moment": "^2.29.4"              // 67KB
"date-fns": "^2.16.1"            // 14KB modular
"@date-io/date-fns": "^2.16.0"   // Adaptador

// Recomendação: Migrar tudo para date-fns
```

```javascript
// Material-UI (duplicado)
"@material-ui/*": "4.x"          // Versão antiga
"@mui/*": "5.x"                  // Versão nova

// Recomendação: Migrar completamente para @mui
```

```javascript
// QR Code (2)
"qrcode.react": "^1.0.0"
"react-qr-code": "^2.0.11"

// Recomendação: Escolher uma
```

```javascript
// Modal (2)
"react-modal": "^3.16.1"
"react-modal-image": "^2.5.0"

// OK - Propósitos diferentes
```

---

## FLUXO DE INICIALIZAÇÃO

### 1. Entry Point (`/src/index.js`)
```javascript
// 1. Polyfills
import { Buffer } from "buffer";
window.Buffer = Buffer;

// 2. React
import React from "react";
import ReactDOM from "react-dom";

// 3. Styles
import CssBaseline from "@material-ui/core/CssBaseline";

// 4. Service Worker
import * as serviceworker from './serviceWorker';

// 5. App
import App from "./App";

// 6. Render
ReactDOM.render(
  <CssBaseline>
    <App />
  </CssBaseline>,
  document.getElementById("root"),
  () => {
    if (typeof window.finishProgress === 'function') {
      window.finishProgress();
    }
  }
);

// 7. Register SW
serviceworker.register();
```

### 2. App Component (`/src/App.js`)

```javascript
// 1. Estado inicial
const [locale, setLocale] = useState();
const [mode, setMode] = useState(detectTheme());
const [primaryColorLight, setPrimaryColorLight] = useState("#065183");
// ... outros estados

// 2. Configuração de tema
const theme = createTheme({ /* ... */ });

// 3. Carregamento de configurações
useEffect(() => {
  // Settings do backend
  getPublicSetting("primaryColorLight").then(...);
  getPublicSetting("appName").then(...);
  // ...
}, []);

// 4. Detecção de idioma
useEffect(() => {
  const i18nlocale = localStorage.getItem("i18nextLng");
  if (browserLocale === "ptBR") {
    setLocale(ptBR);
  }
}, []);

// 5. Busca de versão
useEffect(() => {
  api.get("/version").then(response => {
    localStorage.setItem("frontendVersion", data.version);
  });
}, []);

// 6. PWA Install Prompt
useEffect(() => {
  window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
}, []);

// 7. Render
return (
  <Favicon url={appLogoFavicon} />
  <ColorModeContext.Provider value={{ colorMode }}>
    <ThemeProvider theme={theme}>
      <QueryClientProvider client={queryClient}>
        <ActiveMenuProvider>
          <Routes />
        </ActiveMenuProvider>
      </QueryClientProvider>
    </ThemeProvider>
  </ColorModeContext.Provider>
);
```

### 3. Routes Component (`/src/routes/index.js`)

```javascript
return (
  <BrowserRouter>
    <AuthProvider>
      <CurrencyProvider>
        <TicketsContextProvider>
          <Switch>
            // Rotas públicas
            <Route path="/login" component={Login} />

            <WhatsAppsProvider>
              <LoggedInLayout>
                // Rotas privadas
              </LoggedInLayout>
            </WhatsAppsProvider>
          </Switch>
        </TicketsContextProvider>
      </CurrencyProvider>
    </AuthProvider>
  </BrowserRouter>
);
```

### 4. LoggedInLayout (`/src/layout/index.js`)

```javascript
const LoggedInLayout = ({ children }) => {
  // 1. Hooks e contextos
  const { user, socket } = useContext(AuthContext);

  // 2. Estados locais
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [profileUrl, setProfileUrl] = useState(null);

  // 3. Configuração inicial
  useEffect(() => {
    // Drawer padrão do usuário
    if (user.defaultMenu === "closed") setDrawerOpen(false);

    // Tema padrão
    if (user.defaultTheme === "dark") {
      colorMode.toggleColorMode();
    }
  }, [user]);

  // 4. Socket listeners
  useEffect(() => {
    socket.on(`company-${companyId}-auth`, onCompanyAuth);
    socket.emit("userStatus");

    const interval = setInterval(() => {
      socket.emit("userStatus");
    }, 1000 * 60 * 5); // 5 minutos

    return () => {
      socket.off(`company-${companyId}-auth`);
      clearInterval(interval);
    };
  }, [socket]);

  // 5. Render
  return (
    <Drawer>...</Drawer>
    <AppBar>...</AppBar>
    <main>{children}</main>
  );
};
```

### Sequência Completa

```
1. index.html carrega
   ↓
2. index.js executa
   ↓
3. Buffer polyfill
   ↓
4. React renderiza <App />
   ↓
5. Service Worker registra
   ↓
6. App.js inicializa
   ↓
7. Tema detectado/carregado
   ↓
8. Settings do backend carregados
   ↓
9. Idioma detectado
   ↓
10. Versão verificada
    ↓
11. PWA prompt configurado
    ↓
12. <Routes> renderiza
    ↓
13. AuthProvider inicializa
    ↓
14. Token verificado
    ↓
15. Socket conecta
    ↓
16. Timezone carregado
    ↓
17. CurrencyProvider inicializa
    ↓
18. TicketsContext inicializa
    ↓
19. Rota atual renderiza
    ↓
20. Se autenticado:
    ↓
21. WhatsAppsProvider inicializa
    ↓
22. LoggedInLayout renderiza
    ↓
23. Drawer/Menu carregam
    ↓
24. Socket listeners ativos
    ↓
25. Página renderizada
```

---

## SEGURANÇA E AUTENTICAÇÃO

### Sistema de Autenticação

#### 1. Token Storage
```javascript
// Token armazenado em localStorage
localStorage.setItem("public-token", token);

// Usado em:
// - Axios (withCredentials + headers)
// - Socket.io (query params)
```

#### 2. Protected Routes (`/src/routes/Route.js`)
```javascript
const Route = ({ isPrivate = false, ...rest }) => {
  const { isAuth, loading } = useContext(AuthContext);

  if (!isAuth && isPrivate) {
    return <Redirect to="/login" />;
  }

  if (isAuth && !isPrivate) {
    return <Redirect to="/" />;
  }

  return <RouterRoute {...rest} />;
};
```

#### 3. Axios Interceptors
```javascript
api.interceptors.request.use((config) => {
  // Token é enviado via cookies (withCredentials: true)
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Logout automático
      localStorage.clear();
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);
```

#### 4. Socket Authentication
```javascript
const socket = openSocket(BACKEND_URL, {
  query: { token: publicToken },
  transports: ["websocket"]
});
```

#### 5. Multi-Session Detection
```javascript
socket.on(`company-${companyId}-auth`, (data) => {
  if (data.user.id === +userId) {
    toastError("Sua conta foi acessada em outro computador.");
    setTimeout(() => {
      localStorage.clear();
      window.location.reload();
    }, 1000);
  }
});
```

### Permissões

#### 1. Component Level
```javascript
import Can from "../components/Can";

<Can
  role={user.profile}
  perform="tickets:view"
  yes={() => <TicketsList />}
  no={() => <ForbiddenPage />}
/>
```

#### 2. OnlyForSuperUser
```javascript
<OnlyForSuperUser>
  <AdminPanel />
</OnlyForSuperUser>
```

### Segurança de Dados

#### 1. XSS Prevention
- React escapa automaticamente
- DOMPurify em inputs ricos
- CSP headers (configurar no backend)

#### 2. CSRF
- Cookies SameSite
- CSRF tokens (backend)

#### 3. Sensitive Data
```javascript
// NÃO armazenar senhas no frontend
// NÃO logar tokens
// Limpar localStorage no logout
```

---

## PERFORMANCE E OTIMIZAÇÕES

### 1. Code Splitting
```javascript
// React.lazy para rotas
const Dashboard = React.lazy(() => import("./pages/Dashboard"));

<Suspense fallback={<BackdropLoading />}>
  <Dashboard />
</Suspense>
```

### 2. Build Optimization
```json
{
  "build": "NODE_OPTIONS='--max-old-space-size=4096' craco build"
}
```

**Características:**
- 4GB RAM alocados
- Source maps desabilitados (`GENERATE_SOURCEMAP=false`)
- Tree shaking automático
- Code splitting

### 3. Bundle Analysis
```bash
# Instalar
npm install --save-dev webpack-bundle-analyzer

# Adicionar ao craco.config.js
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

plugins: [
  new BundleAnalyzerPlugin()
]
```

### 4. React Query Cache
```javascript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,  // 5 minutos
      cacheTime: 10 * 60 * 1000,  // 10 minutos
      refetchOnWindowFocus: false
    }
  }
});
```

### 5. Memoization
```javascript
// useMemo para cálculos pesados
const theme = useMemo(() => createTheme({...}), [mode, colors]);

// useCallback para funções
const handleClick = useCallback(() => {...}, [deps]);

// React.memo para componentes
export default React.memo(ComponentName);
```

### 6. Virtual Scrolling
```javascript
// Para listas longas (tickets, contatos)
import { FixedSizeList } from 'react-window';
```

### 7. Lazy Loading de Imagens
```javascript
// Loading lazy nativo
<img src={url} loading="lazy" />

// Ou react-lazyload
import LazyLoad from 'react-lazyload';

<LazyLoad height={200} offset={100}>
  <img src={url} />
</LazyLoad>
```

### 8. Debouncing
```javascript
import { useDebounce } from 'use-debounce';

const [value] = useDebounce(searchTerm, 500);

useEffect(() => {
  // Busca apenas após 500ms sem digitar
  api.get(`/contacts?search=${value}`);
}, [value]);
```

### 9. Socket Optimization
```javascript
// Listeners únicos
useEffect(() => {
  const handler = (data) => {...};
  socket.on("event", handler);

  return () => {
    socket.off("event", handler);  // Cleanup
  };
}, [socket]);
```

### 10. CSS Optimization
```javascript
// Material-UI tree shaking
import Button from '@material-ui/core/Button';
// Ao invés de:
// import { Button } from '@material-ui/core';

// Styled-components com babel plugin
```

---

## SCRIPT DE ATUALIZAÇÃO

### Script Automatizado de Atualização

```bash
#!/bin/bash
# update-frontend.sh
# Script de atualização segura do frontend Multizap

set -e  # Parar em erros

echo "=========================================="
echo "MULTIZAP FRONTEND - SCRIPT DE ATUALIZAÇÃO"
echo "=========================================="
echo ""

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Funções
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 1. Verificar se está no diretório correto
if [ ! -f "package.json" ]; then
    log_error "package.json não encontrado. Execute o script no diretório frontend/"
    exit 1
fi

log_info "Diretório verificado ✓"

# 2. Criar backup
BACKUP_DIR="../backups/frontend_$(date +%Y%m%d_%H%M%S)"
log_info "Criando backup em $BACKUP_DIR"
mkdir -p "$BACKUP_DIR"
cp -r . "$BACKUP_DIR/"
log_info "Backup criado ✓"

# 3. Backup do .env
if [ -f ".env" ]; then
    cp .env .env.backup
    log_info ".env backup criado ✓"
fi

# 4. Git status
if [ -d ".git" ]; then
    log_info "Status do Git:"
    git status --short
fi

# 5. Limpar caches
log_info "Limpando caches..."
rm -rf node_modules
rm -rf build
rm -f package-lock.json
log_info "Caches limpos ✓"

# 6. Atualizar dependências críticas
log_info "Atualizando dependências críticas..."

# Axios (CRÍTICO - vulnerabilidade)
npm install axios@latest

# React (aguardar aprovação para v18)
# npm install react@latest react-dom@latest

# Material-UI (migração gradual)
# Manter v4 e v5 por enquanto
npm install @mui/material@latest @mui/icons-material@latest @emotion/react@latest @emotion/styled@latest

# Socket.io-client
npm install socket.io-client@latest

# React Query
npm install react-query@latest

# Date-fns (substituir moment gradualmente)
npm install date-fns@latest @date-io/date-fns@latest

# Outras dependências importantes
npm install formik@latest yup@latest
npm install react-toastify@latest
npm install i18next@latest react-i18next@latest

log_info "Dependências críticas atualizadas ✓"

# 7. Instalar dependências
log_info "Instalando todas as dependências..."
npm install
log_info "Dependências instaladas ✓"

# 8. Audit e fix
log_info "Verificando vulnerabilidades..."
npm audit
log_info "Aplicando correções automáticas..."
npm audit fix
log_info "Audit concluído ✓"

# 9. Verificar duplicatas
log_info "Verificando pacotes duplicados..."
npm dedupe
log_info "Dedupe concluído ✓"

# 10. Build de teste
log_info "Executando build de teste..."
if npm run build; then
    log_info "Build bem-sucedido ✓"
else
    log_error "Build falhou! Restaurando backup..."
    rm -rf node_modules package-lock.json
    cp -r "$BACKUP_DIR/node_modules" .
    cp "$BACKUP_DIR/package-lock.json" .
    log_error "Backup restaurado. Verifique os erros acima."
    exit 1
fi

# 11. Limpar build de teste
rm -rf build
log_info "Build de teste limpo ✓"

# 12. Verificar .env
if [ -f ".env.backup" ]; then
    log_info "Comparando .env..."
    if diff .env .env.backup > /dev/null; then
        log_info ".env inalterado ✓"
    else
        log_warn ".env foi modificado! Verifique as alterações."
    fi
fi

# 13. Resumo
echo ""
echo "=========================================="
echo "ATUALIZAÇÃO CONCLUÍDA COM SUCESSO!"
echo "=========================================="
echo ""
log_info "Backup disponível em: $BACKUP_DIR"
log_info "Próximos passos:"
echo "  1. Revisar as mudanças: git diff package.json"
echo "  2. Testar localmente: npm start"
echo "  3. Build de produção: npm run build"
echo "  4. Commit: git add . && git commit -m 'chore: update dependencies'"
echo ""
log_warn "IMPORTANTE: Teste todas as funcionalidades antes de deploy!"
echo ""

# 14. Mostrar versões atualizadas
log_info "Versões principais:"
npm list --depth=0 | grep -E "(react|axios|@mui|socket.io-client|react-query)"

echo ""
log_info "Script finalizado ✓"
```

### Uso do Script

```bash
# 1. Dar permissão de execução
chmod +x update-frontend.sh

# 2. Executar
./update-frontend.sh

# 3. Testar
npm start

# 4. Build de produção
npm run build

# 5. Deploy
# (copiar build/ para servidor)
```

### Checklist Pós-Atualização

```markdown
## Checklist de Testes

### Funcionalidades Core
- [ ] Login/Logout
- [ ] Dashboard carrega
- [ ] Conexões WhatsApp
- [ ] QR Code geração
- [ ] Tickets listam
- [ ] Abrir ticket
- [ ] Enviar mensagem
- [ ] Receber mensagem (WebSocket)
- [ ] Upload de arquivo
- [ ] Áudio funciona

### Temas e UI
- [ ] Tema claro
- [ ] Tema escuro
- [ ] Troca de tema
- [ ] Menu lateral
- [ ] Responsivo mobile
- [ ] Ícones corretos
- [ ] Cores customizadas

### Campanhas
- [ ] Criar campanha
- [ ] FlowBuilder
- [ ] Agendamento
- [ ] Relatórios

### Multi-empresa
- [ ] Trocar empresa
- [ ] Configurações por empresa
- [ ] Isolamento de dados

### Integrações
- [ ] Socket.io conecta
- [ ] Notificações
- [ ] PWA instala
- [ ] Service Worker

### Performance
- [ ] Bundle size aceitável
- [ ] Carregamento rápido
- [ ] Sem memory leaks
- [ ] Console sem erros
```

---

## TROUBLESHOOTING

### Problemas Comuns

#### 1. Build Falha (Out of Memory)
```bash
# Aumentar memória
NODE_OPTIONS='--max-old-space-size=8192' npm run build

# Ou adicionar ao package.json
"build": "NODE_OPTIONS='--max-old-space-size=8192' craco build"
```

#### 2. Socket Não Conecta
```javascript
// Verificar:
1. REACT_APP_BACKEND_URL no .env
2. Token no localStorage
3. Backend rodando
4. CORS configurado no backend
5. Porta correta

// Debug:
socket.on("connect", () => console.log("Conectado!"));
socket.on("connect_error", (err) => console.error("Erro:", err));
```

#### 3. Material-UI Conflitos
```bash
# Remover node_modules
rm -rf node_modules package-lock.json

# Instalar novamente
npm install

# Se persistir, fixar versões no package.json
"@material-ui/core": "4.12.3",
"@mui/material": "5.17.1"
```

#### 4. Axios Timeout
```javascript
// Aumentar timeout
const api = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL,
  timeout: 30000  // 30 segundos
});
```

#### 5. PWA Não Atualiza
```javascript
// Forçar atualização do Service Worker
navigator.serviceWorker.getRegistrations().then(registrations => {
  registrations.forEach(reg => reg.unregister());
});

// Limpar cache
caches.keys().then(names => {
  names.forEach(name => caches.delete(name));
});

// Recarregar
location.reload(true);
```

#### 6. Tema Não Carrega
```javascript
// Verificar:
1. Settings no backend
2. Permissões da API
3. Cache do navegador
4. localStorage

// Limpar localStorage
localStorage.clear();
```

---

## MANUTENÇÃO RECOMENDADA

### Semanal
- [ ] `npm audit` - Verificar vulnerabilidades
- [ ] Revisar logs de erro (Sentry se configurado)
- [ ] Monitorar performance

### Mensal
- [ ] Atualizar dependências patch (`npm update`)
- [ ] Revisar bundle size
- [ ] Limpar caches antigos
- [ ] Backup do código

### Trimestral
- [ ] Atualizar dependências minor
- [ ] Revisar e refatorar código duplicado
- [ ] Otimizar imagens e assets
- [ ] Atualizar documentação

### Anual
- [ ] Planejar migração para versões major
- [ ] Revisar arquitetura
- [ ] Atualizar stack tecnológico
- [ ] Code review completo

---

## NOTAS FINAIS

### Pontos de Atenção

1. **Axios 0.21.1** - URGENTE atualizar
2. **Material-UI Dual** - Planejar migração completa para v5
3. **React 17** - Avaliar migração para 18
4. **React Router 5** - Migração complexa para v6
5. **Moment.js** - Substituir por date-fns

### Melhorias Sugeridas

1. **TypeScript Completo** - Migrar todo código para TS
2. **Testes** - Implementar Jest + React Testing Library
3. **Storybook** - Documentar componentes
4. **CI/CD** - GitHub Actions ou similar
5. **Monitoring** - Sentry, LogRocket, etc.
6. **Acessibilidade** - WCAG 2.1 AA compliance
7. **SEO** - React Helmet + meta tags
8. **Analytics** - Google Analytics, Mixpanel, etc.

### Arquitetura Futura

```
frontend/
├── src/
│   ├── features/          # Feature-based structure
│   │   ├── auth/
│   │   ├── tickets/
│   │   ├── campaigns/
│   │   └── ...
│   ├── shared/            # Código compartilhado
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── utils/
│   │   └── types/
│   └── core/              # Core da aplicação
│       ├── config/
│       ├── services/
│       └── store/
```

---

**Documento criado em:** 2025-10-01
**Versão do Sistema:** 2.2.2v-26
**Última atualização:** 2025-10-01

**Mantenedor:** Claude (Anthropic)
**Propósito:** Documentação técnica completa para manutenção e evolução do frontend Multizap
