# 🔌 APIs e Serviços - ChatIA Flow

Documentação completa das APIs, serviços e integrações.

---

## Índice

- [API Service](#api-service)
- [Socket Service](#socket-service)
- [Endpoints Principais](#endpoints-principais)
- [Tratamento de Erros](#tratamento-de-erros)
- [Hooks de API](#hooks-de-api)

---

## API Service

**Localização:** `/src/services/api.js`

### Configuração Axios

```javascript
import axios from "axios";

const api = axios.create({
  baseURL: process.env.REACT_APP_BACKEND_URL || "http://localhost:8080",
  withCredentials: true, // Envia cookies (CSRF protection)
});

export default api;
```

### Interceptor de Request

Adiciona token JWT em todas as requisições:

```javascript
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${JSON.parse(token)}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);
```

### Interceptor de Response

Trata refresh token e logout automático:

```javascript
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Refresh token em 403 (token expirado)
    if (error?.response?.status === 403 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const { data } = await api.post("/auth/refresh_token");
        localStorage.setItem("token", JSON.stringify(data.token));
        api.defaults.headers.Authorization = `Bearer ${data.token}`;
        return api(originalRequest);
      } catch (err) {
        return Promise.reject(err);
      }
    }

    // Logout em 401 (não autorizado)
    if (error?.response?.status === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);
```

### Cancel Token

Para evitar race conditions durante logout:

```javascript
import { CancelToken } from "axios";

let cancelTokenSource;

export const createCancelTokenSource = () => {
  cancelTokenSource = CancelToken.source();
  return cancelTokenSource;
};

export const cancelAllRequests = (message = "Requests canceled") => {
  if (cancelTokenSource) {
    cancelTokenSource.cancel(message);
  }
};
```

**Uso no Logout:**
```javascript
const handleLogout = async () => {
  cancelAllRequests("Logout");
  await api.delete("/auth/logout");
  // ...
};
```

---

## Socket Service

**Localização:** `/src/services/socket.js`

### WebSocket Connection

```javascript
import io from "socket.io-client";

export function socketConnection(params) {
  const { user } = params;
  const companyId = user?.companyId;
  const userId = user?.id;

  const socket = io(process.env.REACT_APP_BACKEND_URL, {
    transports: ["websocket", "polling"],
    auth: {
      token: JSON.parse(localStorage.getItem("token"))
    },
    query: {
      companyId,
      userId
    }
  });

  return socket;
}
```

### Eventos Socket.IO

**Padrão de Nomenclatura:**
```
company-{companyId}-{evento}
```

**Eventos Principais:**

1. **Tickets:**
   ```javascript
   socket.on(`company-${companyId}-ticket`, (data) => {
     // data.action: "create" | "update" | "delete"
     // data.ticket: objeto do ticket
   });
   ```

2. **Mensagens:**
   ```javascript
   socket.on(`company-${companyId}-appMessage`, (data) => {
     // data.action: "create" | "update"
     // data.message: objeto da mensagem
     // data.ticket: ticket relacionado
   });
   ```

3. **Contatos:**
   ```javascript
   socket.on(`company-${companyId}-contact`, (data) => {
     // data.action: "create" | "update" | "delete"
     // data.contact: objeto do contato
   });
   ```

4. **Usuários:**
   ```javascript
   socket.on(`company-${companyId}-user`, (data) => {
     // data.action: "update" | "delete"
     // data.user: objeto do usuário
   });
   ```

5. **Autenticação Multi-Device:**
   ```javascript
   socket.on(`company-${companyId}-auth`, (data) => {
     if (data.user.id === currentUserId) {
       // Logout forçado (login em outro dispositivo)
       localStorage.clear();
       window.location.reload();
     }
   });
   ```

6. **Chat Interno:**
   ```javascript
   socket.on(`company-${companyId}-chat`, (data) => {
     // data.action: "new-message" | "update"
     // data.record: mensagem do chat
   });
   ```

7. **Timezone:**
   ```javascript
   socket.on(`company-${companyId}-timezone`, (data) => {
     // data.action: "update"
     // Recarregar timezone da empresa
   });
   ```

### Rooms (Salas)

**Entrar em sala de ticket:**
```javascript
socket.emit("joinChatBox", ticketId);
```

**Sair de sala:**
```javascript
socket.emit("leaveChatBox", ticketId);
```

**Uso:**
- Cada ticket tem uma sala
- Atendentes entram na sala ao abrir ticket
- Mensagens são enviadas apenas para membros da sala

---

## Endpoints Principais

### Autenticação

#### POST `/auth/login`

**Request:**
```json
{
  "email": "user@example.com",
  "password": "senha123"
}
```

**Response:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "João Silva",
    "email": "user@example.com",
    "profile": "admin",
    "companyId": 1,
    "company": {
      "id": 1,
      "name": "Empresa Teste",
      "dueDate": "2025-12-31"
    }
  }
}
```

#### POST `/auth/refresh_token`

**Response:**
```json
{
  "token": "new_jwt_token",
  "user": { /* dados do usuário */ }
}
```

#### DELETE `/auth/logout`

**Response:**
```json
{
  "message": "Logout realizado com sucesso"
}
```

#### GET `/auth/me`

**Response:**
```json
{
  "id": 1,
  "name": "João Silva",
  "email": "user@example.com",
  "profile": "admin",
  "companyId": 1
}
```

---

### Tickets

#### GET `/tickets`

**Query Params:**
```
?status=open&queueIds=1,2&withUnreadMessages=true&showAll=false
```

**Response:**
```json
{
  "tickets": [
    {
      "id": 1,
      "status": "open",
      "lastMessage": "Olá!",
      "unreadMessages": 3,
      "contact": {
        "id": 1,
        "name": "Cliente",
        "number": "5511999999999"
      },
      "queue": {
        "id": 1,
        "name": "Suporte",
        "color": "#9c27b0"
      },
      "user": {
        "id": 1,
        "name": "Atendente"
      }
    }
  ],
  "count": 10,
  "hasMore": false
}
```

#### GET `/tickets/u/:uuid`

**Response:**
```json
{
  "id": 1,
  "uuid": "abc123",
  "status": "open",
  "contact": { /* ... */ },
  "queue": { /* ... */ },
  "user": { /* ... */ }
}
```

#### PUT `/tickets/:ticketId`

**Request:**
```json
{
  "status": "closed",
  "userId": 2,
  "queueId": 3
}
```

#### DELETE `/tickets/:ticketId`

---

### Mensagens

#### GET `/messages/:ticketId`

**Query Params:**
```
?pageNumber=1
```

**Response:**
```json
{
  "messages": [
    {
      "id": 1,
      "body": "Olá!",
      "mediaType": "chat",
      "mediaUrl": null,
      "fromMe": false,
      "ack": 3,
      "read": true,
      "quotedMsg": null,
      "createdAt": "2025-01-10T10:00:00Z",
      "ticket": { /* ... */ },
      "contact": { /* ... */ }
    }
  ],
  "count": 50,
  "hasMore": true
}
```

#### POST `/messages/:ticketId`

**Request (texto):**
```json
{
  "body": "Mensagem de texto",
  "quotedMsg": { "id": 1 }, // opcional (reply)
  "isPrivate": false
}
```

**Request (mídia - FormData):**
```javascript
const formData = new FormData();
formData.append("body", "Legenda da imagem");
formData.append("fromMe", "true");
formData.append("medias", file);
formData.append("isPrivate", "false");

await api.post(`/messages/${ticketId}`, formData);
```

**Response:**
```json
{
  "id": 123,
  "body": "Mensagem enviada",
  "ack": 0,
  "createdAt": "2025-01-10T10:05:00Z"
}
```

#### PUT `/messages/edit/:messageId`

**Request:**
```json
{
  "body": "Mensagem editada"
}
```

#### DELETE `/messages/:messageId`

Marca mensagem como deletada (LGPD).

---

### Contatos

#### GET `/contacts`

**Query Params:**
```
?searchParam=João&pageNumber=1
```

**Response:**
```json
{
  "contacts": [
    {
      "id": 1,
      "name": "João Silva",
      "number": "5511999999999",
      "email": "joao@example.com",
      "profilePicUrl": "https://...",
      "tags": [
        { "id": 1, "name": "VIP", "color": "#f50057" }
      ]
    }
  ],
  "count": 100,
  "hasMore": true
}
```

#### POST `/contacts`

**Request:**
```json
{
  "name": "Novo Contato",
  "number": "5511888888888",
  "email": "contato@example.com"
}
```

#### PUT `/contacts/:contactId`

**Request:**
```json
{
  "name": "Nome Atualizado",
  "email": "novo@email.com"
}
```

#### DELETE `/contacts/:contactId`

---

### Usuários

#### GET `/users`

**Response:**
```json
{
  "users": [
    {
      "id": 1,
      "name": "Atendente",
      "email": "atendente@example.com",
      "profile": "user",
      "queues": [
        { "id": 1, "name": "Suporte" }
      ]
    }
  ]
}
```

#### POST `/users`

**Request:**
```json
{
  "name": "Novo Usuário",
  "email": "novo@example.com",
  "password": "senha123",
  "profile": "user",
  "queueIds": [1, 2]
}
```

#### PUT `/users/:userId`

#### DELETE `/users/:userId`

---

### Configurações

#### GET `/settings`

**Response:**
```json
[
  {
    "key": "primaryColorLight",
    "value": "#6B46C1"
  },
  {
    "key": "appName",
    "value": "ChatIA"
  }
]
```

#### POST `/settings`

**Request:**
```json
{
  "settings": [
    { "key": "primaryColorLight", "value": "#FF5722" },
    { "key": "appName", "value": "Meu Sistema" }
  ]
}
```

#### GET `/settings/public/:key`

**Response:**
```json
{
  "key": "appName",
  "value": "ChatIA"
}
```

---

### Outros Endpoints

#### GET `/version`

**Response:**
```json
{
  "version": "2.2.2v-26"
}
```

#### GET `/dashboard`

**Query Params:**
```
?startDate=2025-01-01&endDate=2025-01-31&userId=1&queueId=1
```

**Response:**
```json
{
  "counters": {
    "supportHappening": 10,
    "supportPending": 5,
    "supportFinished": 50,
    "newContacts": 8
  },
  "attendants": [
    {
      "id": 1,
      "name": "Atendente 1",
      "online": 5,
      "waiting": 2,
      "finished": 20
    }
  ]
}
```

#### GET `/chats`

Chat interno entre atendentes.

#### POST `/campaigns`

Criar campanhas de mensagens.

#### GET `/queue-integrations`

Listar integrações (Dialogflow, OpenAI, N8N, etc).

---

## Tratamento de Erros

### toastError

**Localização:** `/src/errors/toastError.js`

```javascript
import { toast } from "react-toastify";

const toastError = (err) => {
  const errorMsg = err.response?.data?.error || err.message || "Erro desconhecido";

  if (err.message === "Network Error") {
    toast.error("Erro de conexão com o servidor", {
      toastId: "network-error"
    });
    return;
  }

  toast.error(errorMsg, {
    toastId: errorMsg,
    autoClose: 3000,
    position: "top-center"
  });
};

export default toastError;
```

**Uso:**
```javascript
try {
  await api.post("/endpoint", data);
  toast.success("Sucesso!");
} catch (err) {
  toastError(err);
}
```

---

## Hooks de API

### useAuth

**Localização:** `/src/hooks/useAuth/index.js`

```javascript
import { useContext } from "react";
import { AuthContext } from "../../context/Auth/AuthContext";

const useAuth = () => {
  const context = useContext(AuthContext);
  return context;
};

export default useAuth;
```

**Retorna:**
```javascript
{
  user: object,
  isAuth: boolean,
  loading: boolean,
  handleLogin: (userData) => Promise,
  handleLogout: () => Promise,
  timezone: object
}
```

---

### useTickets

**Localização:** `/src/hooks/useTickets/index.js`

**Exemplo de uso:**
```javascript
const { tickets, loading } = useTickets({
  status: "open",
  showAll: false,
  queueIds: [1, 2]
});
```

---

### useContacts

**Localização:** `/src/hooks/useContacts/index.js`

**Exemplo de uso:**
```javascript
const {
  contacts,
  loading,
  hasMore,
  loadMore
} = useContacts({ searchParam: "João" });
```

---

### useMessages

**Localização:** `/src/hooks/useMessages/index.js`

**Exemplo de uso:**
```javascript
const {
  messages,
  loading,
  hasMore,
  loadMore
} = useMessages(ticketId);
```

---

## Boas Práticas

### 1. Sempre use try/catch

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

### 2. Use React Query para cache

```javascript
import { useQuery } from "react-query";

const { data, isLoading } = useQuery(
  ["contacts", searchParam],
  () => api.get("/contacts", { params: { searchParam } }),
  {
    staleTime: 5000,
    refetchOnWindowFocus: false
  }
);
```

### 3. Cancelar requisições no unmount

```javascript
useEffect(() => {
  const source = axios.CancelToken.source();

  const fetchData = async () => {
    try {
      const { data } = await api.get("/endpoint", {
        cancelToken: source.token
      });
      setData(data);
    } catch (err) {
      if (!axios.isCancel(err)) {
        toastError(err);
      }
    }
  };

  fetchData();

  return () => {
    source.cancel("Component unmounted");
  };
}, []);
```

### 4. Debounce em buscas

```javascript
import { useDebounce } from "use-debounce";

const [searchParam, setSearchParam] = useState("");
const [debouncedSearch] = useDebounce(searchParam, 500);

useEffect(() => {
  fetchData(debouncedSearch);
}, [debouncedSearch]);
```

---

## Diagrama de Fluxo

```
┌──────────┐
│Component │
└────┬─────┘
     │
     ▼
┌────────────┐
│Custom Hook │
└────┬───────┘
     │
     ▼
┌─────────────┐
│ API Service │ (axios)
└────┬────────┘
     │
     ▼ HTTP Request
┌─────────────┐
│   Backend   │
└────┬────────┘
     │
     ▼ Response
┌─────────────┐
│  Component  │ (atualiza estado)
└─────────────┘
     │
     ▼ (paralelo)
┌──────────────┐
│ Socket.IO    │ (real-time update)
└──────────────┘
```

---

**Endpoints Documentados:** 20+
**Eventos Socket.IO:** 10+
**Custom Hooks de API:** 15+
