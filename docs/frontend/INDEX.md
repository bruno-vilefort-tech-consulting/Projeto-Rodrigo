# 📑 Índice da Documentação - ChatIA Flow Frontend

Navegação completa por toda a documentação do projeto. **18 documentos** cobrindo todos os aspectos do sistema.

---

## 🚀 Início Rápido

**Novo no projeto?** Comece aqui:
1. [README.md](../README.md) - Visão geral e quick start
2. [CHEATSHEET.md](./CHEATSHEET.md) - Referência rápida
3. [ARCHITECTURE.md](./ARCHITECTURE.md) - Arquitetura completa
4. [DEVELOPMENT.md](./DEVELOPMENT.md) - Setup e padrões

---

## 📖 Fundamentos

### 1. [README.md](../README.md) - 6.7 KB
**Início Rápido e Visão Geral**

- Visão geral do projeto
- Quick start guide
- Stack tecnológico principal
- Estrutura de diretórios resumida
- Links úteis

**Útil para:** Primeira visão do projeto

---

### 2. [DOCUMENTATION.md](../DOCUMENTATION.md) - 18 KB
**Documentação Completa Legada**

- Visão geral detalhada do sistema
- Arquitetura inicial
- Todas as tecnologias
- Estrutura de diretórios completa
- Funcionalidades principais
- Configurações gerais

**Útil para:** Contexto histórico e visão geral

---

### 3. [ARCHITECTURE.md](./ARCHITECTURE.md) - 25 KB ⭐ **NOVO**
**Arquitetura Detalhada do Sistema**

- Arquitetura completa (3 camadas)
- 353 arquivos, ~80.990 linhas de código
- 149 componentes, 43 páginas, 26 hooks, 11 contexts
- Stack tecnológico detalhado
- 111 dependências documentadas
- Estrutura de diretórios completa
- Design decisions e justificativas

**Útil para:** Entender o sistema completamente

---

## 🧩 Core - Elementos Fundamentais

### 4. [PAGES.md](./PAGES.md) - 22 KB ⭐ **NOVO**
**Todas as 43 Páginas Documentadas**

**Páginas por categoria:**
- Públicas (4): Login, Signup, ForgotPassword, ResetPassword
- Gerenciamento (3): Companies, Subscription, Financeiro
- Principais (10): Dashboard, Tickets, Contacts, Users, etc.
- Administração (26): Settings, Queues, Tags, Reports, etc.

**Para cada página:**
- Localização e rota
- Descrição e funcionalidades
- Componentes utilizados
- Permissões necessárias
- Layout visual (ASCII art)
- Exemplo de código

**Útil para:** Entender todas as telas do sistema

---

### 5. [COMPONENTS.md](./COMPONENTS.md) - 17 KB
**149 Componentes Reutilizáveis**

**Categorias:**
- Mensagens (MessagesList, MessageInput, MessageOptionsMenu)
- Tickets (Ticket, TicketHeader, TicketsList, TicketsManager)
- Contatos (ContactDrawer, ContactModal)
- UI (MainContainer, MainHeader, Title, BackdropLoading)
- Modals (UserModal, QueueModal, QuickMessageModal)
- Layout (MainListItems, NotificationsPopOver)
- Especializados (Audio, MarkdownWrapper, Charts)
- Permissões (Can)

**Útil para:** Reutilizar e criar componentes

---

### 6. [HOOKS.md](./HOOKS.md) - 18 KB ⭐ **NOVO**
**26 Custom Hooks Documentados**

**Categorias:**
- Autenticação (1): useAuth
- Data/API (18): useTickets, useContacts, useUsers, useQueues, etc.
- UI (2): useLocalStorage, useDate
- Utilitários (4): useSettings, useVersion, etc.

**Para cada hook:**
- Parâmetros (TypeScript-style)
- Retorno e tipos
- Exemplo de uso completo
- Integração com Socket.IO
- Best practices

**Útil para:** Usar hooks existentes e criar novos

---

### 7. [CONTEXTS.md](./CONTEXTS.md) - 12 KB ⭐ **NOVO**
**11 React Contexts Documentados**

**Contexts principais:**
- AuthContext - Autenticação e Socket.IO
- TicketsContext - Estado do ticket atual
- WhatsAppsContext - Conexões WhatsApp
- CurrencyContext - Formatação de moeda
- E mais 7 contexts especializados

**Para cada context:**
- Estrutura de estado (TypeScript-style)
- Actions/Methods disponíveis
- Setup do Provider
- Exemplos de consumo
- Integração com Socket.IO

**Útil para:** Gerenciar estado global

---

## 🛣️ Roteamento e Estado

### 8. [ROUTING.md](./ROUTING.md) - 20 KB ⭐ **NOVO**
**Sistema de Roteamento Completo**

- React Router v5 configuração
- 43+ rotas documentadas
- Rotas públicas vs privadas
- Route Guards (proteção)
- LoggedInLayout (drawer + appbar)
- Rotas condicionais (Campaigns)
- Navegação programática
- Redirecionamentos

**Útil para:** Entender e criar rotas

---

### 9. [STATE-MANAGEMENT.md](./STATE-MANAGEMENT.md) - 18 KB ⭐ **NOVO**
**Gerenciamento de Estado Híbrido**

**Estratégias:**
- Estado Global (Context API - 11 contexts)
- Estado Servidor (Custom Hooks + Socket.IO)
- Estado Local (useState)
- Estado Computado (useMemo)

**Patterns documentados:**
- Lifting State Up
- useReducer patterns
- Memoization strategies
- State co-location
- Decision tree para escolher estratégia

**Útil para:** Decidir onde colocar estado

---

## 🎯 Features Principais

### 10. [FLOWBUILDER.md](./FLOWBUILDER.md) - 35 KB ⭐ **NOVO**
**Sistema Visual Flow Builder**

- Editor visual com react-flow-renderer 10.3.17
- **13 tipos de nós:**
  1. Start Node (entry point)
  2. Message Node (texto com variáveis)
  3. Menu Node (opções 1-9)
  4. Interval Node (delays 1-60s)
  5. Image, Audio, Video Nodes
  6. Question Node (captura variáveis)
  7. Ticket Node (cria tickets)
  8. Typebot Node (integração)
  9. OpenAI Node (GPT-3.5/4)
  10. Randomizer Node (A/B testing)
  11. Single Block Node (multi-conteúdo)

**Zustand store:**
- useNodeStorage (node, connect, action)

**Integrações:**
- Typebot, OpenAI, N8N, Dialogflow

**Útil para:** Criar e editar fluxos automatizados

---

### 11. [CAMPAIGNS.md](./CAMPAIGNS.md) - 32 KB ⭐ **NOVO**
**Sistema de Campanhas de Massa**

**Features principais:**
- 5 mensagens rotativas (evita bloqueio)
- Confirmação de leitura automática
- Anexos de mídia (imagem, vídeo, documento, áudio)
- Agendamento com date/time picker
- Criação automática de tickets
- Pause/Resume
- Relatórios em tempo real

**Estados da campanha:**
```
INATIVA → PROGRAMADA → EM_ANDAMENTO → FINALIZADA
                ↓            ↓
           CANCELADA    (cancel/restart)
```

**Métricas:**
- validContacts, delivered, confirmationRequested, confirmed

**Útil para:** Criar e gerenciar campanhas

---

## 🔒 Segurança e Personalização

### 12. [PERMISSIONS.md](./PERMISSIONS.md) - 15 KB ⭐ **NOVO**
**Sistema RBAC (Role-Based Access Control)**

**2 Roles:**
- **user** - Usuário comum (sem permissões especiais)
- **admin** - Administrador (10 permissões)

**Admin Permissions:**
- dashboard:view
- drawer-admin-items:view
- tickets-manager:showall
- user-modal:editProfile
- user-modal:editQueues
- ticket-options:deleteTicket
- contacts-page:deleteContact
- connections-page:* (3 permissões)
- tickets-manager:closeAll

**Componente Can:**
```javascript
<Can
  role={user.profile}
  perform="dashboard:view"
  yes={() => <Dashboard />}
  no={() => <ForbiddenPage />}
/>
```

**Útil para:** Controlar acesso a recursos

---

### 13. [PWA.md](./PWA.md) - 18 KB ⭐ **NOVO**
**Progressive Web App**

**Features:**
- Service Worker (cache, offline)
- Push Notifications (BroadcastChannel)
- Manifest.json (instalável)
- Cache strategies (static + runtime)
- Offline capabilities
- App shortcuts (Android)

**Status:** Desabilitado por padrão
```javascript
// src/index.js:23
serviceworker.unregister(); // Mudar para .register()
```

**Útil para:** Habilitar PWA e notificações

---

### 14. [WHITELABEL.md](./WHITELABEL.md) - 25 KB ⭐ **NOVO**
**Sistema de Personalização de Marca**

**6 Configurações:**
1. **primaryColorLight** - Cor tema claro
2. **primaryColorDark** - Cor tema escuro
3. **appName** - Nome do sistema
4. **appLogoLight** - Logo tema claro
5. **appLogoDark** - Logo tema escuro
6. **appLogoFavicon** - Favicon

**ColorModeContext:**
```javascript
colorMode.setPrimaryColorLight("#FF0000");
colorMode.setAppName("MeuApp");
colorMode.setAppLogoLight("/logo.png");
```

**Upload de logos:**
```
POST /settings-whitelabel/logo
FormData: { typeArch, mode, file }
```

**Acesso:** Apenas super users

**Útil para:** Customizar identidade visual

---

## 🛠️ Desenvolvimento

### 15. [API.md](./API.md) - 14 KB
**APIs, Serviços e Integrações**

**Conteúdo:**
- API Service (Axios)
  - Configuração e interceptors
  - Cancel Token
- Socket Service (Socket.IO)
  - WebSocket connection
  - Eventos principais (ticket, appMessage, contact)
  - Rooms (Salas)
- Endpoints Principais
  - Auth: /auth/login, /auth/signup
  - Tickets: GET/POST/PUT/DELETE /tickets
  - Messages: POST /messages/:ticketId
  - Contacts: CRUD completo
  - Settings: GET /settings/:key
- Tratamento de Erros
- Hooks de API

**Útil para:** Integrar com backend e real-time

---

### 16. [FLOWS.md](./FLOWS.md) - 25 KB
**Fluxos de Dados e Exemplos Práticos**

**Fluxos documentados:**
- Autenticação (login → JWT → Socket.IO)
- Mensagens (envio, recebimento, real-time)
- Tickets (criação, atualização, notificações)
- Upload (seleção, preview, compressão, envio)
- Real-time (diagramas Socket.IO)

**Exemplos práticos:**
- Modal CRUD completo (Formik + Yup)
- Página com lista e filtros
- Custom hook com Socket.IO
- Infinite scroll
- Debounced search

**Útil para:** Implementar features complexas

---

### 17. [DEVELOPMENT.md](./DEVELOPMENT.md) - 18 KB
**Guia Completo de Desenvolvimento**

**Conteúdo:**
- Setup Inicial (Node, npm, env)
- Criar Novos Recursos
  - Novo componente
  - Nova página
  - Custom hook
  - Tradução i18next
- Padrões de Código
  - Estrutura de componente
  - Nomenclatura (PascalCase, camelCase)
  - Organização de imports
  - Estilos (makeStyles)
  - Handlers (handle*)
- Debugging (React DevTools, breakpoints)
- Performance (memoization, code splitting)
- Build e Deploy
- Troubleshooting

**Útil para:** Onboarding e padrões

---

## 📝 Referência Rápida

### 18. [CHEATSHEET.md](./CHEATSHEET.md) - 12 KB ⭐ **NOVO**
**Referência Rápida Completa**

**Conteúdo:**
- Informações gerais (versões, métricas)
- Estrutura de diretórios
- Hooks principais (uso rápido)
- Contexts principais (uso rápido)
- Componentes principais (import paths)
- API endpoints (principais)
- Rotas (públicas e privadas)
- Permissões RBAC
- Whitelabel (configuração rápida)
- FlowBuilder (13 node types)
- Campanhas (setup rápido)
- Socket.IO eventos
- Snippets úteis (código pronto)
- Troubleshooting rápido
- Comandos do terminal

**Útil para:** Consulta rápida diária

---

## 📊 Estatísticas da Documentação

| Documento | Tamanho | Páginas (A4) | Status |
|-----------|---------|--------------|--------|
| README.md | 6.7 KB | ~3 | ✅ |
| DOCUMENTATION.md | 18 KB | ~10 | ✅ |
| COMPONENTS.md | 17 KB | ~9 | ✅ |
| API.md | 14 KB | ~7 | ✅ |
| DEVELOPMENT.md | 18 KB | ~10 | ✅ |
| FLOWS.md | 25 KB | ~14 | ✅ |
| **PAGES.md** | **22 KB** | **~12** | ⭐ **NOVO** |
| **HOOKS.md** | **18 KB** | **~10** | ⭐ **NOVO** |
| **CONTEXTS.md** | **12 KB** | **~7** | ⭐ **NOVO** |
| **ROUTING.md** | **20 KB** | **~11** | ⭐ **NOVO** |
| **STATE-MANAGEMENT.md** | **18 KB** | **~10** | ⭐ **NOVO** |
| **ARCHITECTURE.md** | **25 KB** | **~14** | ⭐ **NOVO** |
| **FLOWBUILDER.md** | **35 KB** | **~19** | ⭐ **NOVO** |
| **CAMPAIGNS.md** | **32 KB** | **~18** | ⭐ **NOVO** |
| **PERMISSIONS.md** | **15 KB** | **~8** | ⭐ **NOVO** |
| **PWA.md** | **18 KB** | **~10** | ⭐ **NOVO** |
| **WHITELABEL.md** | **25 KB** | **~14** | ⭐ **NOVO** |
| **CHEATSHEET.md** | **12 KB** | **~7** | ⭐ **NOVO** |
| **TOTAL** | **~350 KB** | **~193 páginas** | **18 docs** |

**Cobertura:** ~95% do sistema documentado

---

## 🗺️ Mapa de Navegação por Necessidade

### Estou começando
→ [README.md](../README.md) + [CHEATSHEET.md](./CHEATSHEET.md) + [ARCHITECTURE.md](./ARCHITECTURE.md)

### Preciso entender uma página específica
→ [PAGES.md](./PAGES.md) - Todas as 43 páginas documentadas

### Preciso usar/criar um componente
→ [COMPONENTS.md](./COMPONENTS.md) - 149 componentes

### Preciso usar/criar um hook
→ [HOOKS.md](./HOOKS.md) - 26 custom hooks

### Preciso usar um context
→ [CONTEXTS.md](./CONTEXTS.md) - 11 contexts

### Preciso entender/criar rotas
→ [ROUTING.md](./ROUTING.md) - Sistema completo

### Preciso gerenciar estado
→ [STATE-MANAGEMENT.md](./STATE-MANAGEMENT.md) - Estratégias híbridas

### Preciso criar/editar fluxos
→ [FLOWBUILDER.md](./FLOWBUILDER.md) - 13 tipos de nós

### Preciso criar campanhas
→ [CAMPAIGNS.md](./CAMPAIGNS.md) - Sistema de massa

### Preciso controlar permissões
→ [PERMISSIONS.md](./PERMISSIONS.md) - RBAC

### Preciso habilitar PWA
→ [PWA.md](./PWA.md) - Service Worker e notificações

### Preciso customizar marca
→ [WHITELABEL.md](./WHITELABEL.md) - Cores, logos, nome

### Preciso integrar com backend
→ [API.md](./API.md) - Axios + Socket.IO

### Preciso implementar feature
→ [FLOWS.md](./FLOWS.md) - Fluxos e exemplos

### Preciso seguir padrões
→ [DEVELOPMENT.md](./DEVELOPMENT.md) - Setup e convenções

### Preciso consulta rápida
→ [CHEATSHEET.md](./CHEATSHEET.md) - Referência rápida

---

## 🔍 Busca Rápida por Assunto

### Páginas
- Login → [PAGES.md#login](./PAGES.md#login)
- Dashboard → [PAGES.md#dashboard](./PAGES.md#dashboard)
- Tickets → [PAGES.md#tickets](./PAGES.md#tickets)
- Contacts → [PAGES.md#contacts](./PAGES.md#contacts)
- Settings → [PAGES.md#settings](./PAGES.md#settings)

### Componentes
- MessagesList → [COMPONENTS.md#messageslist](./COMPONENTS.md#messageslist)
- Ticket → [COMPONENTS.md#ticket](./COMPONENTS.md#ticket)
- Can → [COMPONENTS.md#can](./COMPONENTS.md#can)

### Hooks
- useAuth → [HOOKS.md#useauth](./HOOKS.md#useauth)
- useTickets → [HOOKS.md#usetickets](./HOOKS.md#usetickets)
- useContacts → [HOOKS.md#usecontacts](./HOOKS.md#usecontacts)

### Contexts
- AuthContext → [CONTEXTS.md#authcontext](./CONTEXTS.md#authcontext)
- TicketsContext → [CONTEXTS.md#ticketscontext](./CONTEXTS.md#ticketscontext)

### APIs
- Endpoints → [API.md#endpoints-principais](./API.md#endpoints-principais)
- Socket.IO → [API.md#socket-service](./API.md#socket-service)

### Desenvolvimento
- Criar Componente → [DEVELOPMENT.md#criar-novo-componente](./DEVELOPMENT.md#1-criar-novo-componente)
- Padrões → [DEVELOPMENT.md#padrões-de-código](./DEVELOPMENT.md#padrões-de-código)

---

## 💡 Guias de Leitura por Perfil

### 👨‍💻 Desenvolvedor Novo (Primeiro Dia)
1. [README.md](../README.md) - Visão geral (10 min)
2. [CHEATSHEET.md](./CHEATSHEET.md) - Referência rápida (15 min)
3. [ARCHITECTURE.md](./ARCHITECTURE.md) - Entender arquitetura (30 min)
4. [DEVELOPMENT.md](./DEVELOPMENT.md) - Setup ambiente (30 min)
5. [PAGES.md](./PAGES.md) - Conhecer todas as telas (20 min)

**Tempo total:** ~2 horas

### 👨‍💻 Desenvolvedor Experiente (Primeira Semana)
1. [ARCHITECTURE.md](./ARCHITECTURE.md) - Arquitetura completa
2. [STATE-MANAGEMENT.md](./STATE-MANAGEMENT.md) - Estratégias de estado
3. [HOOKS.md](./HOOKS.md) + [CONTEXTS.md](./CONTEXTS.md) - Core do sistema
4. [API.md](./API.md) + [FLOWS.md](./FLOWS.md) - Integrações
5. [CHEATSHEET.md](./CHEATSHEET.md) - Referência diária

**Foco:** Produtividade rápida

### 👨‍💼 Tech Lead / Arquiteto
1. [ARCHITECTURE.md](./ARCHITECTURE.md) - Visão completa do sistema
2. [STATE-MANAGEMENT.md](./STATE-MANAGEMENT.md) - Decisões de arquitetura
3. [ROUTING.md](./ROUTING.md) + [PERMISSIONS.md](./PERMISSIONS.md) - Segurança
4. [FLOWBUILDER.md](./FLOWBUILDER.md) + [CAMPAIGNS.md](./CAMPAIGNS.md) - Features principais
5. Todos os outros para code review

**Foco:** Qualidade e arquitetura

### 🎨 Product Owner / Designer
1. [README.md](../README.md) - Entender o produto
2. [PAGES.md](./PAGES.md) - Todas as telas do sistema
3. [FLOWBUILDER.md](./FLOWBUILDER.md) - Editor visual de fluxos
4. [CAMPAIGNS.md](./CAMPAIGNS.md) - Campanhas de massa
5. [WHITELABEL.md](./WHITELABEL.md) - Personalização

**Foco:** Features e UX

---

## 🔄 Manutenção da Documentação

### Quando Atualizar Cada Documento

**PAGES.md:**
- Ao criar nova página
- Ao modificar layout de página existente

**COMPONENTS.md:**
- Ao criar novo componente
- Ao modificar props importantes

**HOOKS.md:**
- Ao criar novo hook
- Ao modificar parâmetros/retorno

**CONTEXTS.md:**
- Ao criar novo context
- Ao modificar estrutura de estado

**ROUTING.md:**
- Ao adicionar nova rota
- Ao modificar Route Guards

**STATE-MANAGEMENT.md:**
- Ao adicionar nova estratégia de estado
- Ao refatorar gerenciamento existente

**FLOWBUILDER.md:**
- Ao adicionar novo tipo de nó
- Ao adicionar nova integração

**CAMPAIGNS.md:**
- Ao modificar fluxo de campanha
- Ao adicionar nova feature

**PERMISSIONS.md:**
- Ao adicionar nova permissão
- Ao criar novo role

**PWA.md:**
- Ao habilitar PWA
- Ao modificar Service Worker

**WHITELABEL.md:**
- Ao adicionar nova configuração
- Ao modificar sistema de tema

**API.md:**
- Ao adicionar novo endpoint
- Ao adicionar evento Socket.IO

**FLOWS.md:**
- Ao criar novo fluxo importante
- Ao modificar fluxo existente

**DEVELOPMENT.md:**
- Ao mudar ferramentas
- Ao adicionar novos padrões

**CHEATSHEET.md:**
- Ao adicionar snippet útil
- Mensalmente (revisão geral)

**ARCHITECTURE.md:**
- Ao fazer mudanças arquiteturais
- Trimestralmente (revisão de métricas)

### Como Atualizar

1. Editar arquivo correspondente
2. Atualizar data de "Última Atualização"
3. Atualizar estatísticas se necessário
4. Commit: `docs: update [DOCUMENTO] - [motivo]`

---

## 📞 Contato e Suporte

**Dúvidas sobre a documentação:**
- Email: suporte@chatia.com
- WhatsApp: Ver configuração no sistema

**Contribuir com a documentação:**
- Seguir padrões estabelecidos
- Criar PR com as mudanças
- Explicar o que foi alterado/adicionado

---

**Última Atualização:** 2025-10-12
**Versão da Documentação:** 2.0.0
**Versão do Sistema:** 2.2.2v-26
**Total de Documentos:** 18
**Cobertura:** ~95%
