# 🔄 Contexts - ChatIA Flow

Documentação completa dos **11 React Contexts** do sistema.

---

## 📋 Índice

- [Visão Geral](#visão-geral)
- [AuthContext](#authcontext)
- [TicketsContext](#ticketscontext)
- [WhatsAppsContext](#whatsappscontext)
- [SocketContext](#socketcontext)
- [ReplyingMessageContext](#replyingmessagecontext)
- [ForwardMessageContext](#forwardmessagecontext)
- [EditingMessageContext](#editingmessagecontext)
- [CurrencyContext](#currencycontext)
- [QueuesSelectedContext](#queuesselectedcontext)
- [ProfileImageContext](#profileimagecontext)
- [ActiveMenuContext](#activemenucontext)
- [Tabela Completa](#tabela-completa-de-contexts)

---

## Visão Geral

O sistema utiliza **11 React Contexts** para gerenciar estado global e compartilhar dados entre componentes.

| Context | Responsabilidade | Escopo |
|---------|-----------------|--------|
| 🔐 AuthContext | Autenticação, usuário, timezone | Global (App) |
| 🎫 TicketsContext | Lista de tickets e filtros | Global (App) |
| 📱 WhatsAppsContext | Conexões WhatsApp | Global (App) |
| 🔌 SocketContext | Conexão Socket.IO | Global (App) |
| 💬 ReplyingMessageContext | Mensagem sendo respondida | Ticket específico |
| ↗️ ForwardMessageContext | Mensagens sendo encaminhadas | Ticket específico |
| ✏️ EditingMessageContext | Mensagem sendo editada | Ticket específico |
| 💰 CurrencyContext | Moeda da empresa | Global (App) |
| 🔀 QueuesSelectedContext | Filas selecionadas (filtro) | Tickets Manager |
| 🖼️ ProfileImageContext | Imagem de perfil do usuário | Global (App) |
| 📍 ActiveMenuContext | Item ativo do menu | Global (App) |

---

## AuthContext

**Localização:** `/src/context/Auth/AuthContext.js`

**Responsabilidade:** Gerenciar autenticação, usuário logado, timezone e socket.

### Estado Gerenciado

```typescript
interface AuthState {
  user: User | null;
  isAuth: boolean;
  loading: boolean;
  socket: Socket | null;
  timezone: Timezone | null;
}
```

### Ações/Métodos

```typescript
{
  handleLogin: (userData: LoginData) => Promise<void>;
  handleLogout: () => Promise<void>;
  getCurrentUserInfo: () => Promise<User>;
  setUser: (user: User) => void;
}
```

### Provider

```jsx
// Envolve toda a aplicação
<AuthProvider>
  <App />
</AuthProvider>
```

### Como Consumir

```javascript
import { useContext } from "react";
import { AuthContext } from "../../context/Auth/AuthContext";

const MyComponent = () => {
  const { user, isAuth, handleLogout } = useContext(AuthContext);

  if (!isAuth) {
    return <Redirect to="/login" />;
  }

  return (
    <div>
      <h1>Olá, {user.name}!</h1>
      <Button onClick={handleLogout}>Sair</Button>
    </div>
  );
};
```

**Ou usando hook:**
```javascript
import useAuth from "../../hooks/useAuth";

const MyComponent = () => {
  const { user, isAuth } = useAuth();
  // ...
};
```

### Fluxo de Login

```
1. User preenche formulário
2. handleLogin(email, password)
3. POST /auth/login
4. Salvar token no localStorage
5. setUser(userData)
6. Conectar Socket.IO
7. Carregar timezone
8. Redirect para /tickets
```

### Fluxo de Logout

```
1. handleLogout()
2. Cancelar todas requisições (axios cancel token)
3. DELETE /auth/logout
4. Desconectar Socket.IO
5. Limpar localStorage
6. setUser(null), setIsAuth(false)
7. Redirect para /login
```

### Socket Integration

O `AuthContext` é responsável por:
- Criar conexão Socket.IO após login
- Passar socket para componentes via context
- Desconectar socket no logout
- Reconectar em caso de desconexão

---

## TicketsContext

**Localização:** `/src/context/Tickets/TicketsContext.js`

**Responsabilidade:** Gerenciar lista de tickets com filtros e sincronização real-time.

### Estado Gerenciado

```typescript
interface TicketsState {
  tickets: Ticket[];
  loading: boolean;
}
```

### Ações (Reducer)

```typescript
type TicketsAction =
  | { type: "LOAD_TICKETS"; payload: Ticket[] }
  | { type: "UPDATE_TICKET"; payload: Ticket }
  | { type: "DELETE_TICKET"; payload: number }
  | { type: "RESET_TICKETS" };
```

### Reducer Logic

```javascript
const reducer = (state, action) => {
  switch (action.type) {
    case "LOAD_TICKETS":
      return { ...state, tickets: action.payload, loading: false };

    case "UPDATE_TICKET": {
      const ticket = action.payload;
      const ticketIndex = state.tickets.findIndex(t => t.id === ticket.id);

      if (ticketIndex !== -1) {
        state.tickets[ticketIndex] = ticket;
        return { ...state, tickets: [...state.tickets] };
      }

      return { ...state, tickets: [ticket, ...state.tickets] };
    }

    case "DELETE_TICKET": {
      const ticketId = action.payload;
      return {
        ...state,
        tickets: state.tickets.filter(t => t.id !== ticketId)
      };
    }

    case "RESET_TICKETS":
      return { ...state, tickets: [] };

    default:
      return state;
  }
};
```

### Provider

```jsx
<TicketsContextProvider>
  <TicketsManager />
</TicketsContextProvider>
```

### Como Consumir

```javascript
import { useContext, useReducer } from "react";
import { TicketsContext } from "../../context/Tickets/TicketsContext";

const TicketsList = () => {
  const { tickets, dispatch } = useContext(TicketsContext);

  useEffect(() => {
    // Carregar tickets
    fetchTickets().then(data => {
      dispatch({ type: "LOAD_TICKETS", payload: data });
    });
  }, []);

  return (
    <div>
      {tickets.map(ticket => (
        <TicketListItem key={ticket.id} ticket={ticket} />
      ))}
    </div>
  );
};
```

### Sincronização Socket.IO

```javascript
useEffect(() => {
  if (!socket) return;

  const handleTicket = (data) => {
    if (data.action === "create") {
      dispatch({ type: "UPDATE_TICKET", payload: data.ticket });
    }
    if (data.action === "update") {
      dispatch({ type: "UPDATE_TICKET", payload: data.ticket });
    }
    if (data.action === "delete") {
      dispatch({ type: "DELETE_TICKET", payload: data.ticketId });
    }
  };

  socket.on(`company-${user.companyId}-ticket`, handleTicket);

  return () => {
    socket.off(`company-${user.companyId}-ticket`, handleTicket);
  };
}, [socket, user]);
```

---

## WhatsAppsContext

**Localização:** `/src/context/WhatsApp/WhatsAppsContext.js`

**Responsabilidade:** Gerenciar conexões WhatsApp e sincronizar status.

### Estado Gerenciado

```typescript
interface WhatsAppsState {
  whatsApps: WhatsApp[];
  loading: boolean;
}
```

### Ações

```typescript
type WhatsAppsAction =
  | { type: "LOAD_WHATSAPPS"; payload: WhatsApp[] }
  | { type: "UPDATE_WHATSAPP"; payload: WhatsApp }
  | { type: "DELETE_WHATSAPP"; payload: number }
  | { type: "UPDATE_SESSION"; payload: { id: number; session: Session } };
```

### Provider

```jsx
<WhatsAppsProvider>
  <LoggedInLayout />
</WhatsAppsProvider>
```

### Como Consumir

```javascript
import { useContext } from "react";
import { WhatsAppsContext } from "../../context/WhatsApp/WhatsAppsContext";

const ConnectionsPage = () => {
  const { whatsApps, loading } = useContext(WhatsAppsContext);

  return (
    <Grid container spacing={2}>
      {whatsApps.map(whatsapp => (
        <Grid item xs={12} md={4} key={whatsapp.id}>
          <WhatsAppCard whatsapp={whatsapp} />
        </Grid>
      ))}
    </Grid>
  );
};
```

### Status Possíveis

- `CONNECTED` - Conectado ✅
- `qrcode` - Aguardando QR Code 📱
- `PAIRING` - Pareando 🔄
- `DISCONNECTED` - Desconectado ❌
- `TIMEOUT` - Timeout ⏱️
- `OPENING` - Abrindo conexão 🔓

---

## SocketContext

**Localização:** `/src/context/Socket/SocketContext.js`

**Responsabilidade:** Fornecer conexão Socket.IO para toda a aplicação.

### Estado Gerenciado

```typescript
interface SocketState {
  socket: Socket | null;
}
```

### Provider

```jsx
<SocketContextProvider>
  <App />
</SocketContextProvider>
```

### Como Consumir

```javascript
import { useContext } from "react";
import { SocketContext } from "../../context/Socket/SocketContext";

const RealtimeComponent = () => {
  const { socket } = useContext(SocketContext);

  useEffect(() => {
    if (!socket) return;

    socket.on("meu-evento", handleMeuEvento);

    return () => {
      socket.off("meu-evento", handleMeuEvento);
    };
  }, [socket]);

  return <div>...</div>;
};
```

**Nota:** Geralmente o socket é acessado via `AuthContext` que já o disponibiliza.

---

## ReplyingMessageContext

**Localização:** `/src/context/ReplyingMessage/ReplyingMessageContext.js`

**Responsabilidade:** Gerenciar mensagem sendo respondida (reply/quote).

### Estado Gerenciado

```typescript
interface ReplyingMessageState {
  replyingMessage: Message | null;
}
```

### Ações

```typescript
{
  setReplyingMessage: (message: Message | null) => void;
}
```

### Provider

```jsx
// Geralmente no nível do Ticket
<ReplyingMessageProvider>
  <Ticket />
</ReplyingMessageProvider>
```

### Como Consumir

```javascript
import { useContext } from "react";
import { ReplyingMessageContext } from "../../context/ReplyingMessage/ReplyingMessageContext";

const MessageOptionsMenu = ({ message }) => {
  const { setReplyingMessage } = useContext(ReplyingMessageContext);

  const handleReply = () => {
    setReplyingMessage(message);
  };

  return (
    <MenuItem onClick={handleReply}>
      <ReplyIcon /> Responder
    </MenuItem>
  );
};

// No MessageInput:
const MessageInput = () => {
  const { replyingMessage, setReplyingMessage } = useContext(ReplyingMessageContext);

  const handleSend = async () => {
    const data = {
      body: message,
      quotedMsg: replyingMessage // Envia como reply
    };

    await api.post(`/messages/${ticketId}`, data);
    setReplyingMessage(null); // Limpa após enviar
  };

  return (
    <div>
      {replyingMessage && (
        <ReplyPreview
          message={replyingMessage}
          onClose={() => setReplyingMessage(null)}
        />
      )}
      <TextField onKeyPress={handleKeyPress} />
    </div>
  );
};
```

---

## ForwardMessageContext

**Localização:** `/src/context/ForwarMessage/ForwardMessageContext.js`

**Responsabilidade:** Gerenciar mensagens sendo encaminhadas.

### Estado Gerenciado

```typescript
interface ForwardMessageState {
  forwardMessageModalOpen: boolean;
  selectedMessages: Message[];
}
```

### Ações

```typescript
{
  setForwardMessageModalOpen: (open: boolean) => void;
  setSelectedMessages: (messages: Message[]) => void;
  showSelectMessageCheckbox: boolean;
  setShowSelectMessageCheckbox: (show: boolean) => void;
}
```

### Como Consumir

```javascript
import { useContext } from "react";
import { ForwardMessageContext } from "../../context/ForwarMessage/ForwardMessageContext";

const MessageOptionsMenu = ({ message }) => {
  const {
    setForwardMessageModalOpen,
    setSelectedMessages
  } = useContext(ForwardMessageContext);

  const handleForward = () => {
    setSelectedMessages([message]);
    setForwardMessageModalOpen(true);
  };

  return (
    <MenuItem onClick={handleForward}>
      <ForwardIcon /> Encaminhar
    </MenuItem>
  );
};
```

### Seleção Múltipla

```javascript
const MessagesList = () => {
  const {
    showSelectMessageCheckbox,
    selectedMessages,
    setSelectedMessages
  } = useContext(ForwardMessageContext);

  const toggleSelectMessage = (message) => {
    if (selectedMessages.includes(message)) {
      setSelectedMessages(selectedMessages.filter(m => m.id !== message.id));
    } else {
      setSelectedMessages([...selectedMessages, message]);
    }
  };

  return (
    <div>
      {messages.map(msg => (
        <MessageBubble
          key={msg.id}
          message={msg}
          showCheckbox={showSelectMessageCheckbox}
          isSelected={selectedMessages.includes(msg)}
          onToggleSelect={() => toggleSelectMessage(msg)}
        />
      ))}
    </div>
  );
};
```

---

## EditingMessageContext

**Localização:** `/src/context/EditingMessage/EditingMessageContext.js`

**Responsabilidade:** Gerenciar mensagem sendo editada.

### Estado Gerenciado

```typescript
interface EditingMessageState {
  editingMessage: Message | null;
}
```

### Ações

```typescript
{
  setEditingMessage: (message: Message | null) => void;
}
```

### Como Consumir

```javascript
import { useContext } from "react";
import { EditingMessageContext } from "../../context/EditingMessage/EditingMessageContext";

const MessageOptionsMenu = ({ message }) => {
  const { setEditingMessage } = useContext(EditingMessageContext);

  const handleEdit = () => {
    setEditingMessage(message);
  };

  return (
    <MenuItem onClick={handleEdit} disabled={!message.fromMe || message.mediaType !== "chat"}>
      <EditIcon /> Editar
    </MenuItem>
  );
};

// No MessageInput:
const MessageInput = () => {
  const { editingMessage, setEditingMessage } = useContext(EditingMessageContext);

  useEffect(() => {
    if (editingMessage) {
      setInputMessage(editingMessage.body);
    }
  }, [editingMessage]);

  const handleSendOrEdit = async () => {
    if (editingMessage) {
      // Editar mensagem existente
      await api.put(`/messages/edit/${editingMessage.id}`, {
        body: inputMessage
      });
      setEditingMessage(null);
    } else {
      // Enviar nova mensagem
      await api.post(`/messages/${ticketId}`, { body: inputMessage });
    }
    setInputMessage("");
  };

  return (
    <div>
      {editingMessage && (
        <EditingPreview
          message={editingMessage}
          onCancel={() => setEditingMessage(null)}
        />
      )}
      <TextField value={inputMessage} />
      <Button onClick={handleSendOrEdit}>
        {editingMessage ? "Salvar" : "Enviar"}
      </Button>
    </div>
  );
};
```

---

## CurrencyContext

**Localização:** `/src/context/Currency/CurrencyContext.js`

**Responsabilidade:** Fornecer moeda e formatação de valores monetários.

### Estado Gerenciado

```typescript
interface CurrencyState {
  currency: string; // "BRL", "USD", "EUR", etc
  symbol: string; // "R$", "$", "€", etc
}
```

### Ações

```typescript
{
  setCurrency: (currency: string) => void;
  format: (value: number) => string;
}
```

### Provider

```jsx
<CurrencyProvider>
  <App />
</CurrencyProvider>
```

### Como Consumir

```javascript
import { useContext } from "react";
import { CurrencyContext } from "../../context/Currency/CurrencyContext";

const PriceDisplay = ({ value }) => {
  const { format } = useContext(CurrencyContext);

  return (
    <Typography variant="h4">
      {format(value)}
    </Typography>
  );
};

// Resultado:
// R$ 297,00 (se currency = "BRL")
// $297.00 (se currency = "USD")
```

**Ou usando hook:**
```javascript
import useCurrency from "../../hooks/useCurrency";

const PriceDisplay = ({ value }) => {
  const { format } = useCurrency();
  return <Typography>{format(value)}</Typography>;
};
```

---

## QueuesSelectedContext

**Localização:** `/src/context/QueuesSelected/QueuesSelectedContext.js`

**Responsabilidade:** Gerenciar filas selecionadas para filtro de tickets.

### Estado Gerenciado

```typescript
interface QueuesSelectedState {
  selectedQueueIds: number[];
}
```

### Ações

```typescript
{
  setSelectedQueueIds: (ids: number[]) => void;
}
```

### Como Consumir

```javascript
import { useContext } from "react";
import { QueuesSelectedContext } from "../../context/QueuesSelected/QueuesSelectedContext";

const QueueFilter = () => {
  const { selectedQueueIds, setSelectedQueueIds } = useContext(QueuesSelectedContext);

  const handleToggleQueue = (queueId) => {
    if (selectedQueueIds.includes(queueId)) {
      setSelectedQueueIds(selectedQueueIds.filter(id => id !== queueId));
    } else {
      setSelectedQueueIds([...selectedQueueIds, queueId]);
    }
  };

  return (
    <div>
      {queues.map(queue => (
        <Checkbox
          key={queue.id}
          checked={selectedQueueIds.includes(queue.id)}
          onChange={() => handleToggleQueue(queue.id)}
          label={queue.name}
        />
      ))}
    </div>
  );
};

// Usar no hook useTickets:
const { tickets } = useTickets({
  queueIds: selectedQueueIds
});
```

---

## ProfileImageContext

**Localização:** `/src/context/ProfileImage/ProfileImageContext.js`

**Responsabilidade:** Gerenciar imagem de perfil do usuário logado (cache/atualização).

### Estado Gerenciado

```typescript
interface ProfileImageState {
  profileImage: string | null;
}
```

### Ações

```typescript
{
  setProfileImage: (imageUrl: string) => void;
  refreshProfileImage: () => Promise<void>;
}
```

### Como Consumir

```javascript
import { useContext } from "react";
import { ProfileImageContext } from "../../context/ProfileImage/ProfileImageContext";

const UserAvatar = () => {
  const { profileImage } = useContext(ProfileImageContext);

  return (
    <Avatar src={profileImage || "/default-avatar.png"} />
  );
};

// Atualizar após upload:
const ProfileSettings = () => {
  const { setProfileImage } = useContext(ProfileImageContext);

  const handleUpload = async (file) => {
    const formData = new FormData();
    formData.append("file", file);

    const { data } = await api.post("/users/profile-image", formData);
    setProfileImage(data.profileImageUrl);
    toast.success("Foto atualizada!");
  };

  return (
    <AvatarUpload onUpload={handleUpload} />
  );
};
```

---

## ActiveMenuContext

**Localização:** `/src/context/ActiveMenuContext/index.js`

**Responsabilidade:** Controlar qual item do menu está ativo (highlight).

### Estado Gerenciado

```typescript
interface ActiveMenuState {
  activeMenu: string; // path da rota ativa
}
```

### Ações

```typescript
{
  setActiveMenu: (path: string) => void;
}
```

### Provider

```jsx
<ActiveMenuProvider>
  <Layout />
</ActiveMenuProvider>
```

### Como Consumir

```javascript
import { useActiveMenu } from "../../context/ActiveMenuContext";
import { useLocation } from "react-router-dom";

const MainListItems = () => {
  const { activeMenu, setActiveMenu } = useActiveMenu();
  const location = useLocation();

  useEffect(() => {
    setActiveMenu(location.pathname);
  }, [location, setActiveMenu]);

  return (
    <List>
      <ListItemLink
        to="/tickets"
        primary="Atendimentos"
        active={activeMenu === "/tickets"}
      />
      <ListItemLink
        to="/contacts"
        primary="Contatos"
        active={activeMenu === "/contacts"}
      />
    </List>
  );
};
```

---

## Tabela Completa de Contexts

| # | Context | Escopo | Estado Principal | Uso Principal |
|---|---------|--------|------------------|---------------|
| 1 | AuthContext | Global | user, isAuth, socket, timezone | Autenticação e dados do usuário |
| 2 | TicketsContext | Global | tickets | Lista de tickets com sync real-time |
| 3 | WhatsAppsContext | Global | whatsApps | Conexões WhatsApp |
| 4 | SocketContext | Global | socket | Conexão Socket.IO |
| 5 | ReplyingMessageContext | Ticket | replyingMessage | Reply/Quote de mensagem |
| 6 | ForwardMessageContext | Ticket | selectedMessages, modalOpen | Encaminhar mensagens |
| 7 | EditingMessageContext | Ticket | editingMessage | Editar mensagem |
| 8 | CurrencyContext | Global | currency, format | Formatação de moeda |
| 9 | QueuesSelectedContext | TicketsManager | selectedQueueIds | Filtro de filas |
| 10 | ProfileImageContext | Global | profileImage | Imagem de perfil do user |
| 11 | ActiveMenuContext | Layout | activeMenu | Highlight do menu |

---

## Padrões de Criação

### Template de Context

```javascript
// /src/context/MeuContext/MeuContext.js
import React, { createContext, useState, useContext } from "react";

const MeuContext = createContext();

export const MeuProvider = ({ children }) => {
  const [state, setState] = useState(initialState);

  const action1 = (param) => {
    // Lógica
    setState(newState);
  };

  const action2 = async (param) => {
    // Lógica async
    const data = await api.get("/endpoint");
    setState(data);
  };

  return (
    <MeuContext.Provider
      value={{
        state,
        action1,
        action2
      }}
    >
      {children}
    </MeuContext.Provider>
  );
};

export const useMeuContext = () => {
  const context = useContext(MeuContext);
  if (!context) {
    throw new Error("useMeuContext must be used within MeuProvider");
  }
  return context;
};

export default MeuContext;
```

### Context com Reducer

```javascript
import React, { createContext, useReducer } from "react";

const initialState = {
  items: [],
  loading: false
};

const reducer = (state, action) => {
  switch (action.type) {
    case "SET_ITEMS":
      return { ...state, items: action.payload, loading: false };
    case "ADD_ITEM":
      return { ...state, items: [...state.items, action.payload] };
    case "UPDATE_ITEM":
      return {
        ...state,
        items: state.items.map(item =>
          item.id === action.payload.id ? action.payload : item
        )
      };
    case "DELETE_ITEM":
      return {
        ...state,
        items: state.items.filter(item => item.id !== action.payload)
      };
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    default:
      return state;
  }
};

export const MeuContextProvider = ({ children }) => {
  const [state, dispatch] = useReducer(reducer, initialState);

  return (
    <MeuContext.Provider value={{ ...state, dispatch }}>
      {children}
    </MeuContext.Provider>
  );
};
```

---

## Boas Práticas

### 1. Sempre validar context dentro de Provider

```javascript
export const useMeuContext = () => {
  const context = useContext(MeuContext);
  if (!context) {
    throw new Error("useMeuContext must be used within MeuProvider");
  }
  return context;
};
```

### 2. Separar lógica complexa em custom hook

```javascript
// hook que consome o context
export const useMeuContextLogic = () => {
  const { state, dispatch } = useContext(MeuContext);

  const complexAction = useCallback(async (param) => {
    // Lógica complexa
    const data = await fetchData(param);
    dispatch({ type: "SET_DATA", payload: data });
  }, [dispatch]);

  return {
    state,
    complexAction
  };
};
```

### 3. Memoizar valores do Provider

```javascript
import { useMemo } from "react";

export const MeuProvider = ({ children }) => {
  const [state, setState] = useState(initialState);

  const value = useMemo(
    () => ({
      state,
      setState,
      action1,
      action2
    }),
    [state]
  );

  return (
    <MeuContext.Provider value={value}>
      {children}
    </MeuContext.Provider>
  );
};
```

### 4. Limpar listeners no unmount

```javascript
useEffect(() => {
  if (!socket) return;

  socket.on("evento", handleEvento);

  return () => {
    socket.off("evento", handleEvento);
  };
}, [socket]);
```

---

## Veja Também

- [HOOKS.md](./HOOKS.md) - Custom hooks que consomem contexts
- [STATE-MANAGEMENT.md](./STATE-MANAGEMENT.md) - Visão geral de gerenciamento de estado
- [DEVELOPMENT.md](./DEVELOPMENT.md) - Guia de desenvolvimento

---

**Total de Contexts:** 11
**Última Atualização:** 2025-10-12
**Versão do Documento:** 1.0.0
