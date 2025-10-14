# 📚 Documentação Frontend - ChatIA Flow

> Documentação completa do frontend do sistema ChatIA Flow v2.2.2v-26

## 📋 Índice

### 1. [Visão Geral](#visão-geral)
### 2. [Arquitetura](#arquitetura)
### 3. [Tecnologias](#tecnologias)
### 4. [Estrutura do Projeto](#estrutura-do-projeto)
### 5. [Componentes](#componentes)
### 6. [Páginas e Rotas](#páginas-e-rotas)
### 7. [APIs e Serviços](#apis-e-serviços)
### 8. [Estado e Contextos](#estado-e-contextos)
### 9. [Real-time (WebSocket)](#real-time-websocket)
### 10. [Internacionalização](#internacionalização)
### 11. [Autenticação](#autenticação)
### 12. [Permissões (RBAC)](#permissões-rbac)
### 13. [Estilização e Tema](#estilização-e-tema)
### 14. [Guias de Desenvolvimento](#guias-de-desenvolvimento)

---

## Visão Geral

**ChatIA Flow** é um sistema completo de multi-atendimento via WhatsApp com funcionalidades avançadas:

- 🎯 Multi-atendimento em tempo real
- 💬 Suporte a múltiplos tipos de mídia
- 🤖 Flow Builder para automação
- 📊 Dashboard e relatórios
- 🌍 Suporte a 5 idiomas
- 🎨 Whitelabel (personalização completa)
- 📱 PWA (Progressive Web App)
- 🔐 Sistema de permissões (RBAC)
- 🔄 Sincronização real-time via Socket.IO

### Métricas do Projeto

| Métrica | Valor |
|---------|-------|
| Linhas de código JS | ~80.990 |
| Componentes | 151 |
| Páginas | 32 |
| Custom Hooks | 20 |
| Contextos | 10 |
| Idiomas suportados | 5 |
| Dependências | 111 |

### Stack Principal

- **Framework**: React 17.0.2
- **UI Library**: Material-UI v4 + v5
- **State Management**: Context API + Zustand + React Query
- **Real-time**: Socket.IO Client v4.7.4
- **HTTP Client**: Axios v1.6.8
- **Build Tool**: CRACO (Create React App Configuration Override)
- **i18n**: i18next + react-i18next
- **Forms**: Formik + Yup
- **Charts**: Chart.js + Recharts

---

## Arquitetura

### Padrões de Design

1. **Component-Based Architecture**
   - 151 componentes isolados e reutilizáveis
   - Separação clara entre componentes de apresentação e container
   - Composição sobre herança

2. **Context Pattern**
   - 10 contextos especializados para compartilhamento de estado
   - Evita prop drilling
   - Separação de responsabilidades

3. **Custom Hooks Pattern**
   - 20 hooks customizados para lógica reutilizável
   - Encapsulamento de lógica complexa
   - Fácil testabilidade

4. **Route Guard Pattern**
   - Proteção de rotas privadas
   - Redirecionamento automático
   - Validação de autenticação

5. **Permission-Based Rendering (RBAC)**
   - Componente `Can` para controle granular
   - Perfis: `admin` e `user`
   - Permissões específicas por funcionalidade

### Fluxo de Dados

```
┌─────────────┐
│   Usuario   │
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│   Components    │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│  Custom Hooks   │
└──────┬──────────┘
       │
       ▼
┌─────────────────┐
│   API Service   │◄────┐
└──────┬──────────┘     │
       │                │
       ▼                │
┌─────────────────┐     │
│    Backend      │     │
└──────┬──────────┘     │
       │                │
       ▼                │
┌─────────────────┐     │
│  Socket.IO      │─────┘
└─────────────────┘
       │
       ▼
┌─────────────────┐
│  State Update   │
└─────────────────┘
```

### Camadas da Aplicação

```
┌───────────────────────────────────────┐
│         Presentation Layer            │
│  (Pages, Components, UI Elements)     │
└───────────────┬───────────────────────┘
                │
┌───────────────▼───────────────────────┐
│         Business Logic Layer          │
│   (Custom Hooks, Contexts, Utils)     │
└───────────────┬───────────────────────┘
                │
┌───────────────▼───────────────────────┐
│         Data Access Layer             │
│     (API Service, Socket Service)     │
└───────────────────────────────────────┘
```

---

## Tecnologias

### Core

```json
{
  "react": "^17.0.2",
  "react-dom": "^17.0.2",
  "react-router-dom": "^5.2.0",
  "react-scripts": "^5.0.1"
}
```

### UI e Componentes

**Material-UI (Dual Version):**
```json
{
  "@material-ui/core": "^4.12.3",
  "@material-ui/icons": "^4.11.3",
  "@material-ui/lab": "^4.0.0-alpha.61",
  "@mui/material": "^5.17.1",
  "@mui/icons-material": "^5.17.1"
}
```

**Outras UI Libraries:**
- `styled-components` - CSS-in-JS
- `react-bootstrap` - Bootstrap components
- `emoji-mart` - Emoji picker
- `lucide-react` - Ícones modernos
- `material-ui-color` - Color picker
- `react-color` - Color picker avançado

### State Management

```json
{
  "react-query": "^3.39.3",
  "zustand": "^4.4.1"
}
```

### Comunicação

```json
{
  "axios": "^1.6.8",
  "socket.io-client": "^4.7.4"
}
```

### Internacionalização

```json
{
  "i18next": "^19.9.2",
  "react-i18next": "^15.4.1",
  "i18next-browser-languagedetector": "^6.0.1"
}
```

### Mídia e Arquivos

```json
{
  "react-audio-player": "^0.17.0",
  "react-webcam": "^7.1.1",
  "react-html5-camera-photo": "^1.5.11",
  "mic-recorder-to-mp3": "^2.2.2",
  "react-dropzone": "^14.2.3",
  "compressorjs": "^1.2.1",
  "react-player": "^2.13.0",
  "react-youtube": "^10.1.0"
}
```

### Visualização de Dados

```json
{
  "chart.js": "^3.9.1",
  "react-chartjs-2": "^4.3.1",
  "chartjs-plugin-datalabels": "^2.1.0",
  "recharts": "^2.0.2"
}
```

### Formulários e Validação

```json
{
  "formik": "^2.2.0",
  "formik-material-ui": "^3.0.1",
  "yup": "^0.32.8",
  "react-input-mask": "^2.0.4"
}
```

### Flow Builder

```json
{
  "react-flow-renderer": "^10.3.17",
  "reactflow": "^11.7.4"
}
```

### Utilitários

```json
{
  "lodash": "^4.17.21",
  "date-fns": "^2.16.1",
  "moment": "^2.29.4",
  "moment-timezone": "^0.5.45",
  "uuid": "^8.3.2",
  "clsx": "^2.1.0",
  "use-debounce": "^7.0.0",
  "use-sound": "^2.0.1"
}
```

### Exportação

```json
{
  "react-csv": "^2.2.2",
  "xlsx": "^0.18.5",
  "html2pdf.js": "^0.10.1"
}
```

### Integrações

```json
{
  "jssip": "^3.10",
  "react-softphone": "^1.7.0",
  "react-onesignal": "^2.0.4",
  "@sentry/node": "^9.11.0"
}
```

### Build e Desenvolvimento

```json
{
  "@craco/craco": "^7.1.0",
  "typescript": "^5.5.3"
}
```

---

## Estrutura do Projeto

### Árvore de Diretórios

```
frontend/
├── public/                          # Arquivos estáticos
│   ├── index.html                  # HTML principal com splash screen
│   ├── manifest.json               # PWA manifest
│   ├── service-worker.js          # Service worker
│   ├── flags/                     # Bandeiras de países (i18n)
│   │   ├── br.png
│   │   ├── us.png
│   │   ├── es.png
│   │   ├── tr.png
│   │   └── sa.png
│   └── theme/                     # Ícones de tema
│       ├── sol.png
│       └── lua.png
├── src/
│   ├── App.js                     # Componente raiz
│   ├── index.js                   # Entry point
│   ├── rules.js                   # Regras de permissão (RBAC)
│   │
│   ├── assets/                    # Recursos estáticos
│   │   ├── images/
│   │   ├── sounds/
│   │   └── videos/
│   │
│   ├── components/               # 151 Componentes React
│   │   ├── Audio/
│   │   ├── BackdropLoading/
│   │   ├── Can/                 # Componente de permissões
│   │   ├── ChatEnd/
│   │   ├── ContactDrawer/
│   │   ├── ContactModal/
│   │   ├── MainContainer/
│   │   ├── MainHeader/
│   │   ├── MessageInput/        # Input de mensagens
│   │   ├── MessagesList/        # Lista de mensagens
│   │   ├── Ticket/              # Container de atendimento
│   │   ├── TicketsList/
│   │   ├── UserModal/
│   │   └── ... (147 outros)
│   │
│   ├── context/                  # 10 Contexts React
│   │   ├── Auth/                # AuthContext
│   │   ├── Tickets/             # TicketsContext
│   │   ├── WhatsApp/            # WhatsAppsContext
│   │   ├── ReplyMessage/
│   │   ├── ForwardMessage/
│   │   ├── EditingMessage/
│   │   ├── Socket/
│   │   ├── Currency/
│   │   ├── ProfileImage/
│   │   └── QueuesSelected/
│   │
│   ├── errors/                   # Tratamento de erros
│   │   └── toastError.js
│   │
│   ├── helpers/                  # Funções auxiliares
│   │   └── contrastColor.js
│   │
│   ├── hooks/                    # 20 Custom Hooks
│   │   ├── useAuth/
│   │   ├── useTickets/
│   │   ├── useContacts/
│   │   ├── useMessages/
│   │   ├── useQueues/
│   │   ├── useDashboard/
│   │   ├── useSettings/
│   │   ├── useWhatsApps/
│   │   ├── useLocalStorage/
│   │   ├── useDate/             # Formatação com timezone
│   │   ├── usePlans/
│   │   └── ... (10 outros)
│   │
│   ├── layout/                   # Layouts principais
│   │   ├── MainListItems.js     # Menu lateral
│   │   └── index.js
│   │
│   ├── pages/                    # 32 Páginas
│   │   ├── Dashboard/
│   │   ├── Login/
│   │   ├── Signup/
│   │   ├── Tickets/
│   │   ├── Contacts/
│   │   ├── Users/
│   │   ├── Queues/
│   │   ├── Settings/
│   │   ├── FlowBuilder/
│   │   ├── Campaigns/
│   │   ├── Chat/
│   │   ├── Kanban/
│   │   └── ... (20 outras)
│   │
│   ├── routes/                   # Configuração de rotas
│   │   ├── index.js             # Definição de rotas
│   │   └── Route.js             # Route Guard
│   │
│   ├── services/                 # Serviços de API e Socket
│   │   ├── api.js               # Axios instance
│   │   ├── socket.js            # Socket.IO connection
│   │   └── TimezoneService.js
│   │
│   ├── stores/                   # State management (Zustand)
│   │   └── useNodeStorage.js    # Store para FlowBuilder
│   │
│   ├── styles/                   # Estilos globais
│   │   └── global.css
│   │
│   ├── translate/                # Sistema i18n
│   │   ├── i18n.js              # Configuração
│   │   └── languages/           # Traduções
│   │       ├── index.js
│   │       ├── pt.js
│   │       ├── en.js
│   │       ├── es.js
│   │       ├── tr.js
│   │       └── ar.js
│   │
│   └── utils/                    # Utilitários gerais
│       ├── capitalize.js
│       ├── formatSerializedId.js
│       ├── formatToCurrency.js
│       ├── formatToHtmlFormat.js
│       ├── FormatMask.js
│       ├── emojisArray.js
│       └── sleep.js
│
├── config-overrides.js           # Webpack overrides (deprecated)
├── craco.config.js               # CRACO configuration
├── package.json                   # Dependências
├── tsconfig.json                  # TypeScript config
└── server.js                      # Express server (produção)
```

### Arquivos de Configuração

#### package.json
Define dependências, scripts e metadados do projeto.

**Scripts principais:**
```json
{
  "start": "craco start",
  "build": "craco build",
  "test": "craco test"
}
```

#### craco.config.js
Configuração de build customizada (webpack overrides).

**Principais configurações:**
- Polyfills para Node.js core modules
- Desabilita ESLint durante build
- Ignora warnings de source-map
- Desabilita type checking do TypeScript

#### tsconfig.json
Configuração TypeScript com suporte parcial.

#### .env (variáveis de ambiente)
```bash
REACT_APP_BACKEND_URL=http://localhost:8080
REACT_APP_FACEBOOK_APP_ID=your_app_id
REACT_APP_NAME_SYSTEM=ChatIA
REACT_APP_NUMBER_SUPPORT=5511999999999
REACT_APP_HOURS_CLOSE_TICKETS_AUTO=9999
REACT_APP_PRIMARY_COLOR=#6B46C1
REACT_APP_PRIMARY_DARK=#4C1D95
```

---

## 📚 Documentação Detalhada

Para informações específicas, consulte os documentos dedicados:

- **[COMPONENTS.md](./docs/COMPONENTS.md)** - Documentação completa de componentes
- **[PAGES.md](./docs/PAGES.md)** - Todas as páginas e rotas
- **[API.md](./docs/API.md)** - APIs, serviços e endpoints
- **[STATE.md](./docs/STATE.md)** - Gerenciamento de estado e contextos
- **[REALTIME.md](./docs/REALTIME.md)** - WebSocket e sincronização real-time
- **[I18N.md](./docs/I18N.md)** - Internacionalização
- **[AUTH.md](./docs/AUTH.md)** - Autenticação e permissões
- **[STYLING.md](./docs/STYLING.md)** - Estilização e temas
- **[DEVELOPMENT.md](./docs/DEVELOPMENT.md)** - Guia de desenvolvimento

---

## 🚀 Quick Start

### Instalação

```bash
cd frontend
npm install
```

### Desenvolvimento

```bash
npm start
# Abre em http://localhost:3000
```

### Build para Produção

```bash
npm run build
# Gera pasta build/
```

### Executar Produção (Express)

```bash
node server.js
# Serve a pasta build/ na porta 3000
```

---

## 🎯 Funcionalidades Principais

### 1. Multi-Atendimento
- Atendimento simultâneo de múltiplos tickets
- Transferência entre atendentes
- Filas de atendimento
- Status: aberto, pendente, fechado

### 2. Mensagens
- Texto com Markdown
- Imagens, vídeos, áudios
- Documentos
- Localização
- Contatos (vCard)
- Links YouTube
- Preview de anúncios Meta
- Gravação de voz
- Mensagens privadas (não enviadas ao cliente)
- Reply, Forward, Edit, Delete
- Assinatura de mensagem
- Quick answers (respostas rápidas)

### 3. Flow Builder
- Editor visual de fluxos
- Múltiplos tipos de nós
- Automação de conversas
- Integrações (Dialogflow, OpenAI, N8N, Typebot)

### 4. Campanhas
- Envio em massa
- Agendamento
- Segmentação por listas
- Relatórios de envio

### 5. Dashboard e Relatórios
- Estatísticas em tempo real
- Gráficos de performance
- NPS (Net Promoter Score)
- Exportação para Excel

### 6. Integrações
- WhatsApp (múltiplas conexões)
- Dialogflow
- ChatGPT/OpenAI
- N8N
- Typebot
- Webhooks
- Bling
- Asaas
- Siprov
- Mikweb

### 7. PWA
- Instalável no desktop/mobile
- Notificações push
- Offline capable
- Service Worker

### 8. Whitelabel
- Cores personalizáveis
- Logos customizáveis
- Nome do sistema configurável

---

## 🔐 Segurança

- **JWT Authentication** com refresh token
- **RBAC** (Role-Based Access Control)
- **XSS Protection** (sanitização de HTML)
- **CSRF Protection** (withCredentials)
- **Input Validation** (Formik + Yup)
- **Rate Limiting** (client-side debouncing)
- **Multi-Device Auth** (logout automático em dispositivos duplicados)

---

## 🌍 Suporte a Idiomas

- 🇧🇷 Português (Brasil)
- 🇺🇸 Inglês
- 🇪🇸 Espanhol
- 🇹🇷 Turco
- 🇸🇦 Árabe

Detecção automática baseada em navegador + localStorage.

---

## 📱 Responsividade

- Mobile-first design
- Breakpoints Material-UI (xs, sm, md, lg, xl)
- Safe areas para iPhone (notch)
- Componentes adaptáveis

---

## 🧪 Testes

```bash
npm test
```

Suporte para:
- Unit tests (Jest)
- Component tests (React Testing Library)

---

## 🐛 Debug

### Logs
O sistema utiliza console.log/error em desenvolvimento.

### Sentry
Integração com Sentry para monitoramento de erros em produção.

### React DevTools
Suporte completo para React DevTools e React Query DevTools.

---

## 📦 Build e Deploy

### Variáveis de Ambiente

**Desenvolvimento:**
Criar arquivo `.env` na raiz do frontend.

**Produção (Docker):**
Variáveis injetadas via `window.ENV` no `index.html`.

### Docker

```dockerfile
# Build
FROM node:16 as build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Production
FROM node:16-alpine
WORKDIR /app
COPY --from=build /app/build ./build
COPY server.js .
CMD ["node", "server.js"]
```

---

## 🤝 Contribuindo

### Criar Novo Componente

1. Criar pasta em `/src/components/NomeComponente/`
2. Criar `index.js`
3. Usar hooks e contexts quando necessário
4. Adicionar tradução em `/translate/languages/`
5. Documentar props e uso

### Criar Nova Página

1. Criar pasta em `/src/pages/NomePagina/`
2. Criar `index.js`
3. Adicionar rota em `/routes/index.js`
4. Adicionar item no menu (se necessário) em `/layout/MainListItems.js`
5. Adicionar tradução

### Criar Custom Hook

1. Criar pasta em `/src/hooks/useNome/`
2. Criar `index.js`
3. Encapsular lógica reutilizável
4. Exportar hook

---

## 📄 Licença

Propriedade privada - Todos os direitos reservados.

---

## 📞 Suporte

Para dúvidas e suporte:
- Email: suporte@chatia.com
- WhatsApp: Ver configuração `REACT_APP_NUMBER_SUPPORT`

---

**Versão da Documentação:** 1.0.0
**Última Atualização:** 2025-10-11
**Versão do Sistema:** 2.2.2v-26
