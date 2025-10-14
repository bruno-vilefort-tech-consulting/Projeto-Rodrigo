# ChatIA Flow - Frontend

> Sistema completo de multi-atendimento via WhatsApp com React

[![React](https://img.shields.io/badge/React-17.0.2-blue.svg)](https://reactjs.org/)
[![Material-UI](https://img.shields.io/badge/Material--UI-v4%20%2B%20v5-blue.svg)](https://mui.com/)
[![Socket.IO](https://img.shields.io/badge/Socket.IO-4.7.4-black.svg)](https://socket.io/)
[![License](https://img.shields.io/badge/License-Private-red.svg)]()

---

## 📚 Documentação Completa

### ⭐ [INDEX.md](./INDEX.md) - Índice Completo
**18 documentos** cobrindo ~95% do sistema (~350 KB, ~193 páginas A4)

### 📖 Documentos Principais

#### Fundamentos
- **[DOCUMENTATION.md](./DOCUMENTATION.md)** - Documentação legada (visão geral)
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** ⭐ **NOVO** - Arquitetura detalhada (3 camadas)
- **[PAGES.md](./PAGES.md)** ⭐ **NOVO** - Todas as 43 páginas documentadas
- **[COMPONENTS.md](./COMPONENTS.md)** - Todos os 149 componentes

#### Core
- **[HOOKS.md](./HOOKS.md)** ⭐ **NOVO** - 26 custom hooks
- **[CONTEXTS.md](./CONTEXTS.md)** ⭐ **NOVO** - 11 React Contexts
- **[ROUTING.md](./ROUTING.md)** ⭐ **NOVO** - Sistema de rotas completo
- **[STATE-MANAGEMENT.md](./STATE-MANAGEMENT.md)** ⭐ **NOVO** - Estratégias híbridas

#### Features
- **[FLOWBUILDER.md](./FLOWBUILDER.md)** ⭐ **NOVO** - Editor visual de fluxos (13 nós)
- **[CAMPAIGNS.md](./CAMPAIGNS.md)** ⭐ **NOVO** - Campanhas em massa

#### Segurança & Personalização
- **[PERMISSIONS.md](./PERMISSIONS.md)** ⭐ **NOVO** - Sistema RBAC
- **[PWA.md](./PWA.md)** ⭐ **NOVO** - Progressive Web App
- **[WHITELABEL.md](./WHITELABEL.md)** ⭐ **NOVO** - Personalização de marca

#### Desenvolvimento
- **[API.md](./API.md)** - APIs, serviços e Socket.IO
- **[FLOWS.md](./FLOWS.md)** - Fluxos de dados e exemplos
- **[DEVELOPMENT.md](./DEVELOPMENT.md)** - Guia completo de desenvolvimento
- **[CHEATSHEET.md](./CHEATSHEET.md)** ⭐ **NOVO** - Referência rápida

---

## 🚀 Quick Start

```bash
# Instalar dependências
npm install

# Configurar ambiente
cp .env.example .env
# Editar .env com suas configurações

# Executar em desenvolvimento
npm start

# Build para produção
npm run build

# Executar testes
npm test
```

---

## 📊 Visão Geral

### Características Principais

✅ **Multi-atendimento em tempo real** via WhatsApp
✅ **149 componentes React** modulares e reutilizáveis
✅ **43 páginas** completas
✅ **26 custom hooks** para lógica de negócio
✅ **11 React Contexts** para estado global
✅ **Socket.IO** para sincronização real-time
✅ **Flow Builder** visual com 13 tipos de nós
✅ **Campanhas em massa** com 5 mensagens rotativas
✅ **PWA** instalável no desktop/mobile
✅ **5 idiomas** (PT, EN, ES, TR, AR)
✅ **Whitelabel** completo (cores, logos, nome)
✅ **RBAC** - Sistema de permissões granular
✅ **Dark mode** e tema personalizável

### Stack Tecnológico

- **Framework:** React 17.0.2
- **UI Library:** Material-UI v4 + v5
- **State:** Context API + Zustand + React Query
- **Real-time:** Socket.IO Client 4.7.4
- **HTTP Client:** Axios 1.6.8
- **Build Tool:** CRACO
- **i18n:** i18next + react-i18next
- **Forms:** Formik + Yup
- **Charts:** Chart.js + Recharts

---

## 📁 Estrutura do Projeto

```
frontend/
├── docs/                    # 📚 18 Documentos (~350 KB)
│   ├── INDEX.md            # ⭐ Índice completo
│   ├── ARCHITECTURE.md     # ⭐ Arquitetura (3 camadas)
│   ├── PAGES.md            # ⭐ 43 páginas
│   ├── COMPONENTS.md       # 149 componentes
│   ├── HOOKS.md            # ⭐ 26 custom hooks
│   ├── CONTEXTS.md         # ⭐ 11 contexts
│   ├── ROUTING.md          # ⭐ Sistema de rotas
│   ├── STATE-MANAGEMENT.md # ⭐ Estratégias de estado
│   ├── FLOWBUILDER.md      # ⭐ Editor de fluxos
│   ├── CAMPAIGNS.md        # ⭐ Campanhas massa
│   ├── PERMISSIONS.md      # ⭐ RBAC
│   ├── PWA.md              # ⭐ Progressive Web App
│   ├── WHITELABEL.md       # ⭐ Personalização
│   ├── API.md              # APIs e Socket.IO
│   ├── FLOWS.md            # Fluxos e exemplos
│   ├── DEVELOPMENT.md      # Guia de desenvolvimento
│   └── CHEATSHEET.md       # ⭐ Referência rápida
│
├── public/                  # Arquivos estáticos
│   ├── index.html          # HTML principal
│   ├── manifest.json       # PWA manifest
│   └── service-worker.js   # Service worker
│
├── src/
│   ├── components/         # 149 componentes
│   ├── pages/              # 43 páginas
│   ├── context/            # 11 contexts
│   ├── hooks/              # 26 custom hooks
│   ├── services/           # API e Socket
│   ├── routes/             # React Router v5
│   ├── translate/          # i18n (5 idiomas)
│   ├── stores/             # Zustand (FlowBuilder)
│   ├── layout/             # Layouts e temas
│   ├── helpers/            # Utilitários
│   ├── rules.js            # RBAC rules
│   ├── App.js              # Componente raiz
│   └── index.js            # Entry point
│
├── DOCUMENTATION.md         # 📖 Documentação legada
├── package.json             # 111 dependências
├── craco.config.js
└── README.md               # Este arquivo
```

---

## 🎯 Funcionalidades

### Atendimento
- Multi-atendimento simultâneo
- Transferência entre atendentes
- Filas de atendimento
- Status: aberto, pendente, fechado

### Mensagens
- Texto com Markdown
- Imagens, vídeos, áudios
- Documentos, localização, vCard
- Reply, Forward, Edit, Delete
- Mensagens privadas
- Gravação de voz
- Quick answers

### Automação
- Flow Builder visual
- Integrações: Dialogflow, OpenAI, N8N, Typebot
- Campanhas em massa
- Agendamento de mensagens

### Gestão
- Dashboard e relatórios
- NPS (Net Promoter Score)
- Gestão de contatos e tags
- Kanban de tickets
- Chat interno entre atendentes

---

## 🔐 Autenticação e Segurança

- JWT Authentication com refresh token
- RBAC (Role-Based Access Control)
- XSS Protection
- CSRF Protection
- Input Validation (Yup)
- Multi-Device Auth

---

## 🌍 Internacionalização

Suporte a 5 idiomas com detecção automática:

- 🇧🇷 Português (Brasil)
- 🇺🇸 Inglês
- 🇪🇸 Espanhol
- 🇹🇷 Turco
- 🇸🇦 Árabe

---

## 📦 Build e Deploy

### Desenvolvimento
```bash
npm start
# Abre em http://localhost:3000
```

### Produção
```bash
npm run build
# Gera pasta build/

node server.js
# Serve a aplicação na porta 3000
```

### Docker
```bash
docker build -t chatia-frontend .
docker run -p 3000:3000 chatia-frontend
```

---

## 🧪 Testes

```bash
npm test
```

Suporte para:
- Unit tests (Jest)
- Component tests (React Testing Library)

---

## 📈 Métricas

| Métrica | Valor |
|---------|-------|
| Linhas de código | ~80.990 |
| Componentes | 149 |
| Páginas | 43 |
| Custom Hooks | 26 |
| Contextos | 11 |
| Rotas | 43+ |
| Idiomas | 5 |
| Dependências | 111 |
| Documentação | 18 docs (~350 KB) |
| Cobertura Docs | ~95% |

---

## 🛠️ Desenvolvimento

### Criar Novo Componente
```bash
mkdir src/components/MeuComponente
touch src/components/MeuComponente/index.js
```

### Criar Nova Página
```bash
mkdir src/pages/MinhaPagina
touch src/pages/MinhaPagina/index.js
# Adicionar rota em src/routes/index.js
```

### Criar Custom Hook
```bash
mkdir src/hooks/useMeuHook
touch src/hooks/useMeuHook/index.js
```

📖 **Ver [DEVELOPMENT.md](./docs/DEVELOPMENT.md) para guia completo**

---

## 🤝 Padrões de Código

- **Componentes:** PascalCase (`MeuComponente`)
- **Funções:** camelCase (`handleClick`)
- **Constantes:** UPPER_SNAKE_CASE (`API_URL`)
- **Commits:** Conventional Commits (`feat:`, `fix:`, `docs:`)
- **Estilos:** `makeStyles` do Material-UI
- **i18n:** Sempre usar `i18n.t("chave")`
- **Estado:** Context API ou hooks customizados
- **API:** Sempre usar `toastError` para erros

---

## 🔄 Real-time (Socket.IO)

Eventos principais:
- `company-{id}-ticket` - Atualizações de tickets
- `company-{id}-appMessage` - Novas mensagens
- `company-{id}-contact` - Atualizações de contatos
- `company-{id}-user` - Atualizações de usuários
- `company-{id}-auth` - Multi-device auth

📖 **Ver [API.md](./docs/API.md#socket-service) para detalhes**

---

## 📞 Suporte

- Email: suporte@chatia.com
- WhatsApp: Ver `REACT_APP_NUMBER_SUPPORT`

---

## 📄 Licença

Propriedade privada - Todos os direitos reservados.

---

## 🔗 Links Úteis

- [React Docs](https://reactjs.org/docs/getting-started.html)
- [Material-UI v4](https://v4.mui.com/)
- [Material-UI v5](https://mui.com/)
- [Socket.IO Client](https://socket.io/docs/v4/client-api/)
- [React Query](https://react-query.tanstack.com/)
- [i18next](https://www.i18next.com/)
- [Formik](https://formik.org/)
- [Yup](https://github.com/jquense/yup)

---

**Versão:** 2.2.2v-26
**Última Atualização:** 2025-10-12
**Node:** 16+
**npm:** 8+

---

## 🎯 Conquistas da Documentação

- ✅ **12 novos documentos** criados (~252 KB)
- ✅ **Cobertura de ~95%** do sistema
- ✅ **43 páginas** completamente documentadas
- ✅ **26 hooks** com exemplos práticos
- ✅ **11 contexts** com estruturas TypeScript
- ✅ **13 tipos de nós** do FlowBuilder
- ✅ **Sistema RBAC** completo
- ✅ **Whitelabel** detalhado (6 configurações)
- ✅ **PWA** com Service Worker
- ✅ **Cheatsheet** para referência rápida
