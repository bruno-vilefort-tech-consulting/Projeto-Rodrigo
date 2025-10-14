# CHEATSHEET - Referência Rápida

Referência rápida para desenvolvimento no ChatIA Flow Frontend.

---

## 📦 Informações Gerais

```bash
# Versão
ChatIA Flow Frontend v2.2.2v-26

# Tecnologias Core
React 17.0.2
Material-UI v4.12.3 + v5.17.1 (dual version)
React Router v5.2.0
Socket.IO Client 4.7.4
Axios 1.6.8

# Diretório
/Users/brunovilefort/Desktop/chatia-final/chatia/frontend
```

## 📊 Métricas do Projeto

```
Páginas:        43
Componentes:    149
Hooks:          26
Contexts:       11
Rotas:          43+
Idiomas:        5 (pt, en, es, tr, ar)
```

---

## 🗂️ Estrutura de Diretórios

```
frontend/src/
├── components/          # 149 componentes reutilizáveis
├── pages/              # 43 páginas da aplicação
├── context/            # 11 React Contexts
├── hooks/              # 26 custom hooks
├── services/           # API (axios) e Socket.IO
├── layout/             # Layout principal (LoggedInLayout)
├── routes/             # React Router v5 configuração
├── translate/          # i18next (5 idiomas)
├── helpers/            # Funções utilitárias
├── rules.js            # RBAC rules (user, admin)
├── App.js              # Root component
└── index.js            # Entry point
```

---

## 🪝 Hooks Principais

### useAuth
```javascript
import useAuth from "../../hooks/useAuth.js";

const { user, isAuth, loading, handleLogin, handleLogout } = useAuth();

// Verificar autenticação
if (!isAuth) return <Redirect to="/login" />;

// Dados do usuário
console.log(user.name, user.email, user.profile, user.companyId);
```

### useTickets
```javascript
import useTickets from "../../hooks/useTickets";

const { tickets, loading, hasMore, count } = useTickets({
  searchParam: "João",
  status: "open",
  queueIds: [1, 2],
  showAll: false,
  withUnreadMessages: true
});
```

### useContacts
```javascript
import useContacts from "../../hooks/useContacts";

const { contacts, loading, hasMore } = useContacts({
  searchParam: "Maria",
  pageNumber: 1
});
```

### useWhatsApps
```javascript
import useWhatsApps from "../../hooks/useWhatsApps";

const { whatsApps, loading } = useWhatsApps();
// whatsApps = array de conexões WhatsApp
```

### useQueues
```javascript
import useQueues from "../../hooks/useQueues";

const { queues, loading } = useQueues();
// queues = array de filas de atendimento
```

### useSettings
```javascript
import useSettings from "../../hooks/useSettings";

const { settings, getPublicSetting, update } = useSettings();

// Obter setting público
const color = await getPublicSetting("primaryColorLight");

// Atualizar setting
await update({ key: "appName", value: "MeuApp" });
```

---

## 🌐 Contexts Principais

### AuthContext
```javascript
import { AuthContext } from "../../context/Auth/AuthContext";

const { user, isAuth, loading, socket, handleLogin, handleLogout } = useContext(AuthContext);

// Socket.IO connection
socket.on("connect", () => console.log("Connected"));
socket.on("ticket", data => console.log("Ticket updated:", data));
```

### TicketsContext
```javascript
import { TicketsContext } from "../../context/Tickets/TicketsContext";

const { currentTicket, setCurrentTicket } = useContext(TicketsContext);

// Definir ticket atual
setCurrentTicket({ id: 123, contact: {...}, messages: [...] });
```

### WhatsAppsContext
```javascript
import { WhatsAppsContext } from "../../context/WhatsApp/WhatsAppsContext";

const { whatsApps, loading } = useContext(WhatsAppsContext);
```

### ColorModeContext
```javascript
import ColorModeContext from "../../layout/themeContext";

const { colorMode } = useContext(ColorModeContext);

// Alternar tema
colorMode.toggleColorMode(); // light <-> dark

// Whitelabel
colorMode.setPrimaryColorLight("#FF0000");
colorMode.setAppName("MeuApp");
colorMode.setAppLogoLight("/logo.png");
```

---

## 🧩 Componentes Principais

### MainContainer + MainHeader
```javascript
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";

<MainContainer>
  <MainHeader>
    <Title>Minha Página</Title>
  </MainHeader>
  {/* Conteúdo */}
</MainContainer>
```

### BackdropLoading
```javascript
import { BackdropLoading } from "../../components/BackdropLoading";

{loading && <BackdropLoading />}
```

### ConfirmationModal
```javascript
import ConfirmationModal from "../../components/ConfirmationModal";

<ConfirmationModal
  title="Confirmar Exclusão"
  open={confirmModalOpen}
  onClose={() => setConfirmModalOpen(false)}
  onConfirm={handleDelete}
>
  Tem certeza que deseja excluir?
</ConfirmationModal>
```

### Can (Permissões)
```javascript
import Can from "../../components/Can";

<Can
  role={user.profile}
  perform="dashboard:view"
  yes={() => <Dashboard />}
  no={() => <ForbiddenPage />}
/>
```

### Toasts
```javascript
import { toast } from "react-toastify";

toast.success("Operação realizada com sucesso!");
toast.error("Erro ao realizar operação");
toast.info("Informação importante");
toast.warning("Atenção!");
```

---

## 🌍 API - Principais Endpoints

### Tickets
```javascript
import api from "../../services/api";

// Listar tickets
const { data } = await api.get("/tickets", {
  params: { status: "open", queueIds: [1, 2] }
});

// Obter ticket
const { data: ticket } = await api.get(`/tickets/${ticketId}`);

// Atualizar ticket
await api.put(`/tickets/${ticketId}`, { status: "closed" });

// Criar ticket
await api.post("/tickets", { contactId, userId, queueId });
```

### Contacts
```javascript
// Listar contatos
const { data } = await api.get("/contacts", {
  params: { searchParam: "João", pageNumber: 1 }
});

// Obter contato
const { data: contact } = await api.get(`/contacts/${contactId}`);

// Criar contato
await api.post("/contacts", { name, number, email });

// Atualizar contato
await api.put(`/contacts/${contactId}`, { name, email });

// Deletar contato
await api.delete(`/contacts/${contactId}`);
```

### Messages
```javascript
// Enviar mensagem
await api.post(`/messages/${ticketId}`, {
  body: "Olá!",
  medias: [] // URLs de mídias
});

// Deletar mensagem
await api.delete(`/messages/${messageId}`);
```

### WhatsApp
```javascript
// Listar conexões
const { data: whatsapps } = await api.get("/whatsapp");

// Criar conexão
await api.post("/whatsapp", { name: "WhatsApp 1" });

// Deletar conexão
await api.delete(`/whatsapp/${whatsappId}`);

// Desconectar
await api.post(`/whatsapp/${whatsappId}/disconnect`);
```

### Settings
```javascript
// Obter setting público
const { data: value } = await api.get(`/settings/${key}`);

// Atualizar setting
await api.post("/settings", { key, value });

// Upload logo whitelabel
const formData = new FormData();
formData.append("typeArch", "logo");
formData.append("mode", "Light");
formData.append("file", file);
await api.post("/settings-whitelabel/logo", formData);
```

---

## 🛣️ Rotas Principais

```javascript
// Públicas
/login
/signup
/forgot-password
/reset-password/:token

// Privadas (requerem autenticação)
/                          # Dashboard
/tickets                   # Lista de tickets
/tickets/:ticketId         # Ticket específico
/contacts                  # Contatos
/users                     # Usuários (admin)
/connections               # Conexões WhatsApp (admin)
/queues                    # Filas (admin)
/quickAnswers              # Respostas rápidas
/tags                      # Tags
/settings                  # Configurações (admin)
/settingsCustom            # Configurações customizadas
/FlowBuilderConfig/:id     # Editor de fluxo
/campaigns                 # Campanhas (se habilitado)
```

---

## 🔐 Permissões (RBAC)

### Roles
```javascript
// 2 roles disponíveis:
"user"  // Usuário comum
"admin" // Administrador
```

### Admin Permissions
```javascript
const adminPermissions = [
  "dashboard:view",
  "drawer-admin-items:view",
  "tickets-manager:showall",
  "user-modal:editProfile",
  "user-modal:editQueues",
  "ticket-options:deleteTicket",
  "contacts-page:deleteContact",
  "connections-page:actionButtons",
  "connections-page:addConnection",
  "connections-page:editOrDeleteConnection",
  "tickets-manager:closeAll"
];
```

### Uso
```javascript
import Can from "../../components/Can";

<Can
  role={user.profile}
  perform="dashboard:view"
  yes={() => <DashboardContent />}
  no={() => <Typography>Sem permissão</Typography>}
/>
```

---

## 🎨 Whitelabel - Configuração Rápida

```javascript
import { useContext } from "react";
import ColorModeContext from "../../layout/themeContext";

const { colorMode } = useContext(ColorModeContext);

// Definir cores
colorMode.setPrimaryColorLight("#FF6B00");
colorMode.setPrimaryColorDark("#FF8C00");

// Definir nome
colorMode.setAppName("MeuWhatsApp");

// Definir logos
colorMode.setAppLogoLight("https://example.com/logo-light.png");
colorMode.setAppLogoDark("https://example.com/logo-dark.png");
colorMode.setAppLogoFavicon("https://example.com/favicon.png");

// Alternar tema
colorMode.toggleColorMode(); // light <-> dark

// Acessar valores
console.log(colorMode.mode);        // "light" ou "dark"
console.log(colorMode.appName);     // "MeuWhatsApp"
console.log(colorMode.appLogoLight);
```

---

## 📱 Socket.IO - Eventos

### Conectar ao Socket
```javascript
import { useContext, useEffect } from "react";
import { AuthContext } from "../../context/Auth/AuthContext";

const { socket } = useContext(AuthContext);

useEffect(() => {
  if (!socket) return;

  const handleConnect = () => console.log("Socket conectado");
  const handleDisconnect = () => console.log("Socket desconectado");

  socket.on("connect", handleConnect);
  socket.on("disconnect", handleDisconnect);

  return () => {
    socket.off("connect", handleConnect);
    socket.off("disconnect", handleDisconnect);
  };
}, [socket]);
```

### Eventos Principais
```javascript
// Ticket atualizado
socket.on("ticket", data => {
  console.log("Ticket atualizado:", data.action, data.ticket);
  // action: "update", "delete", "create"
});

// Nova mensagem
socket.on("appMessage", data => {
  console.log("Nova mensagem:", data.action, data.message);
  // action: "create", "update"
});

// Contato atualizado
socket.on("contact", data => {
  console.log("Contato:", data.action, data.contact);
});

// WhatsApp status
socket.on("whatsappSession", data => {
  console.log("WhatsApp:", data.action, data.session);
});

// Campanha atualizada
socket.on("campaign", data => {
  console.log("Campanha:", data.action, data.record);
});
```

---

## 🤖 Flow Builder - Tipos de Nós

```javascript
// 13 tipos disponíveis:
"start"       // Nó inicial (verde)
"message"     // Mensagem de texto
"menu"        // Menu interativo (1-9 opções)
"interval"    // Delay (1-60 segundos)
"image"       // Enviar imagem
"audio"       // Enviar áudio
"video"       // Enviar vídeo
"question"    // Capturar resposta em variável
"ticket"      // Criar ticket e transferir
"typebot"     // Integração Typebot
"openai"      // ChatGPT (GPT-3.5/4)
"randomizer"  // A/B testing
"singleBlock" // Bloco múltiplo conteúdo
```

### Criar Fluxo
```javascript
const flow = {
  name: "Atendimento Principal",
  userId: user.id,
  nodes: [
    {
      id: "1",
      type: "start",
      data: { label: "Início" },
      position: { x: 0, y: 0 }
    },
    {
      id: "2",
      type: "message",
      data: {
        label: "Boas-vindas",
        message: "Olá! Como posso ajudar?"
      },
      position: { x: 0, y: 100 }
    }
  ],
  edges: [
    { id: "e1-2", source: "1", target: "2" }
  ]
};

await api.post("/flowbuilder", flow);
```

---

## 📢 Campanhas - Setup Rápido

```javascript
// Criar campanha
const campaign = {
  name: "Black Friday",
  status: "PROGRAMADA",
  scheduledAt: "2024-11-29T08:00:00",
  message1: "🔥 BLACK FRIDAY! 50% OFF",
  message2: "⚡ ÚLTIMAS HORAS! Não perca!",
  message3: "🎁 Oferta especial para você",
  message4: "💰 Economize agora",
  message5: "⏰ Tempo limitado!",
  mediaUrl: "https://example.com/banner.jpg",
  mediaType: "image",
  whatsappId: 1,
  contactListIds: [1, 2, 3]
};

await api.post("/campaigns", campaign);

// Status possíveis:
// "INATIVA", "PROGRAMADA", "EM_ANDAMENTO", "CANCELADA", "FINALIZADA"
```

### Monitorar Campanha
```javascript
socket.on("campaign", data => {
  if (data.action === "update") {
    const { validContacts, delivered, confirmed } = data.record;
    const progress = (delivered / validContacts) * 100;
    console.log(`Progresso: ${progress}%`);
  }
});
```

---

## 🧪 Snippets Úteis

### Formik + Yup Validation
```javascript
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { TextField } from "formik-material-ui";

const schema = Yup.object().shape({
  name: Yup.string().required("Obrigatório"),
  email: Yup.string().email("E-mail inválido").required("Obrigatório"),
});

<Formik
  initialValues={{ name: "", email: "" }}
  validationSchema={schema}
  onSubmit={async (values) => {
    await api.post("/endpoint", values);
  }}
>
  {({ isSubmitting }) => (
    <Form>
      <Field component={TextField} name="name" label="Nome" fullWidth />
      <Field component={TextField} name="email" label="E-mail" fullWidth />
      <Button type="submit" disabled={isSubmitting}>
        Salvar
      </Button>
    </Form>
  )}
</Formik>
```

### Modal com Confirmation
```javascript
const [modalOpen, setModalOpen] = useState(false);
const [selectedItem, setSelectedItem] = useState(null);

const handleDelete = async () => {
  try {
    await api.delete(`/items/${selectedItem.id}`);
    toast.success("Item deletado com sucesso!");
    setModalOpen(false);
  } catch (err) {
    toast.error("Erro ao deletar item");
  }
};

<IconButton onClick={() => {
  setSelectedItem(item);
  setModalOpen(true);
}}>
  <DeleteIcon />
</IconButton>

<ConfirmationModal
  title="Confirmar Exclusão"
  open={modalOpen}
  onClose={() => setModalOpen(false)}
  onConfirm={handleDelete}
>
  Tem certeza que deseja excluir {selectedItem?.name}?
</ConfirmationModal>
```

### Infinite Scroll
```javascript
import { useState, useEffect, useRef } from "react";

const [pageNumber, setPageNumber] = useState(1);
const [hasMore, setHasMore] = useState(true);
const scrollRef = useRef();

const handleScroll = () => {
  const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
  if (scrollTop + clientHeight >= scrollHeight - 100 && hasMore && !loading) {
    setPageNumber(prev => prev + 1);
  }
};

useEffect(() => {
  const ref = scrollRef.current;
  ref.addEventListener("scroll", handleScroll);
  return () => ref.removeEventListener("scroll", handleScroll);
}, [hasMore, loading]);

<div ref={scrollRef} style={{ height: "100%", overflow: "auto" }}>
  {items.map(item => <ItemCard key={item.id} item={item} />)}
  {loading && <CircularProgress />}
</div>
```

### Debounced Search
```javascript
import { useState, useEffect } from "react";

const [searchParam, setSearchParam] = useState("");
const [debouncedSearch, setDebouncedSearch] = useState("");

useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedSearch(searchParam);
  }, 500);

  return () => clearTimeout(timer);
}, [searchParam]);

useEffect(() => {
  if (debouncedSearch) {
    // Buscar com searchParam debounced
    fetchData(debouncedSearch);
  }
}, [debouncedSearch]);

<TextField
  placeholder="Buscar..."
  value={searchParam}
  onChange={(e) => setSearchParam(e.target.value)}
/>
```

### Upload de Arquivo
```javascript
const [uploading, setUploading] = useState(false);

const handleFileUpload = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append("file", file);

  setUploading(true);
  try {
    const { data } = await api.post("/upload", formData, {
      onUploadProgress: (event) => {
        const progress = Math.round((event.loaded * 100) / event.total);
        console.log(`Upload: ${progress}%`);
      },
    });
    toast.success("Arquivo enviado com sucesso!");
    return data.url;
  } catch (err) {
    toast.error("Erro ao enviar arquivo");
  } finally {
    setUploading(false);
  }
};

<input
  type="file"
  onChange={handleFileUpload}
  style={{ display: "none" }}
  ref={fileInputRef}
/>
<Button onClick={() => fileInputRef.current.click()} disabled={uploading}>
  {uploading ? "Enviando..." : "Selecionar Arquivo"}
</Button>
```

---

## 🐛 Troubleshooting Rápido

### Socket não Conecta
```javascript
// Verificar autenticação
const { socket, isAuth } = useContext(AuthContext);

if (!isAuth) {
  console.error("Não autenticado");
}

// Verificar URL do backend
console.log("Backend URL:", process.env.REACT_APP_BACKEND_URL);

// Forçar reconexão
socket.disconnect();
socket.connect();
```

### Tema não Atualiza
```javascript
// Verificar localStorage
console.log("Theme:", localStorage.getItem("preferredTheme"));
console.log("Primary Color:", localStorage.getItem("primaryColorLight"));

// Forçar recarga do tema
window.location.reload();
```

### Build Falha
```bash
# Limpar cache
rm -rf node_modules package-lock.json
npm install

# Verificar versões do Node
node -v  # Recomendado: v16.x ou v18.x
npm -v

# Build
npm run build
```

### Infinite Loop no useEffect
```javascript
// ❌ ERRADO - falta dependências
useEffect(() => {
  fetchData();
}, []);

// ✅ CORRETO - todas as dependências
useEffect(() => {
  fetchData(searchParam, pageNumber);
}, [searchParam, pageNumber]);

// ✅ CORRETO - desabilitar warning (use com cuidado)
useEffect(() => {
  fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []);
```

### Axios Interceptor para Token
```javascript
// services/api.js
import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado - redirecionar para login
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
```

---

## 💻 Comandos do Terminal

```bash
# Desenvolvimento
npm start                    # Iniciar dev server (porta 3000)
npm run build               # Build de produção
npm test                    # Rodar testes

# Linting
npm run lint                # Verificar código
npm run lint:fix            # Corrigir automaticamente

# Instalação
npm install                 # Instalar dependências
npm install <package>       # Instalar pacote específico

# Docker
docker build -t chatia-frontend .
docker run -p 3000:3000 chatia-frontend

# Variáveis de Ambiente
REACT_APP_BACKEND_URL=http://localhost:8080
REACT_APP_HOURS_CLOSE_TICKETS_AUTO=24
REACT_APP_PRIMARY_COLOR=#065183
```

---

## 📝 Convenções de Código

### Naming
```javascript
// Componentes: PascalCase
const MyComponent = () => {};

// Hooks: camelCase com prefixo "use"
const useMyHook = () => {};

// Funções: camelCase
const handleClick = () => {};

// Constantes: UPPER_SNAKE_CASE
const API_BASE_URL = "http://localhost:8080";

// Variáveis: camelCase
const userName = "João";
```

### Imports Order
```javascript
// 1. React
import React, { useState, useEffect } from "react";

// 2. External libraries
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";

// 3. Material-UI
import { Button, TextField, Dialog } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

// 4. Internal modules
import api from "../../services/api";
import { AuthContext } from "../../context/Auth/AuthContext";
import useAuth from "../../hooks/useAuth.js";

// 5. Components
import MainContainer from "../../components/MainContainer";
import Title from "../../components/Title";

// 6. Styles
import "./styles.css";
```

### Component Structure
```javascript
import React, { useState, useEffect, useContext } from "react";

// 1. Imports

// 2. Styled Components / makeStyles
const useStyles = makeStyles((theme) => ({
  root: { ... }
}));

// 3. Component
const MyComponent = ({ prop1, prop2 }) => {
  // 3.1. Hooks
  const classes = useStyles();
  const [state, setState] = useState(initialValue);
  const context = useContext(MyContext);

  // 3.2. Effects
  useEffect(() => {
    // effect
  }, [dependencies]);

  // 3.3. Handlers
  const handleClick = () => {
    // handler logic
  };

  // 3.4. Render
  return (
    <div className={classes.root}>
      {/* JSX */}
    </div>
  );
};

export default MyComponent;
```

---

## 🔗 Links Rápidos

### Documentação Completa
- [INDEX.md](./INDEX.md) - Índice geral
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Arquitetura completa
- [PAGES.md](./PAGES.md) - Todas as 43 páginas
- [COMPONENTS.md](./COMPONENTS.md) - 149 componentes
- [HOOKS.md](./HOOKS.md) - 26 hooks customizados
- [CONTEXTS.md](./CONTEXTS.md) - 11 contexts
- [ROUTING.md](./ROUTING.md) - Sistema de rotas
- [STATE-MANAGEMENT.md](./STATE-MANAGEMENT.md) - Gerenciamento de estado
- [FLOWBUILDER.md](./FLOWBUILDER.md) - Editor de fluxos
- [CAMPAIGNS.md](./CAMPAIGNS.md) - Sistema de campanhas
- [PERMISSIONS.md](./PERMISSIONS.md) - RBAC
- [PWA.md](./PWA.md) - Progressive Web App
- [WHITELABEL.md](./WHITELABEL.md) - Personalização de marca

### External Resources
- [React Docs](https://react.dev/)
- [Material-UI v4](https://v4.mui.com/)
- [React Router v5](https://v5.reactrouter.com/)
- [Formik](https://formik.org/)
- [Socket.IO Client](https://socket.io/docs/v4/client-api/)
- [i18next](https://www.i18next.com/)

---

**Última Atualização:** 2025-10-12
**Versão do Documento:** 1.0.0
