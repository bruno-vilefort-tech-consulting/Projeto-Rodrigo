# 🔄 Fluxos de Dados e Exemplos - ChatIA Flow

Documentação de fluxos de dados, diagramas e exemplos práticos.

---

## Índice

- [Fluxo de Autenticação](#fluxo-de-autenticação)
- [Fluxo de Mensagens](#fluxo-de-mensagens)
- [Fluxo de Tickets](#fluxo-de-tickets)
- [Fluxo de Upload](#fluxo-de-upload)
- [Fluxo Real-time](#fluxo-real-time)
- [Exemplos Práticos](#exemplos-práticos)

---

## Fluxo de Autenticação

### Diagrama

```
┌─────────────┐
│ Login Form  │
└──────┬──────┘
       │ 1. handleLogin(email, password)
       ▼
┌─────────────────────┐
│ AuthContext         │
└──────┬──────────────┘
       │ 2. POST /auth/login
       ▼
┌─────────────────────┐
│ Backend API         │
└──────┬──────────────┘
       │ 3. Validar credenciais
       │ 4. Verificar vencimento
       │ 5. Gerar JWT token
       ▼
┌─────────────────────┐
│ Response            │
│ { token, user }     │
└──────┬──────────────┘
       │ 6. setUser(user)
       │ 7. setIsAuth(true)
       │ 8. localStorage.setItem("token")
       ▼
┌─────────────────────┐
│ Socket Connection   │
└──────┬──────────────┘
       │ 9. socketConnection({ user })
       ▼
┌─────────────────────┐
│ Redirect /tickets   │
└─────────────────────┘
```

### Código

```javascript
// AuthContext.js
const handleLogin = async (userData) => {
  setLoading(true);

  try {
    // 1. Login
    const { data } = await api.post("/auth/login", userData);

    // 2. Verificar vencimento
    const dueDate = data.user.company.dueDate;
    const isExpired = moment().isAfter(moment(dueDate));

    if (isExpired) {
      toast.error("Assinatura vencida");
      history.push("/financeiro-aberto");
      return;
    }

    // 3. Salvar token
    localStorage.setItem("token", JSON.stringify(data.token));

    // 4. Atualizar header
    api.defaults.headers.Authorization = `Bearer ${data.token}`;

    // 5. Atualizar estado
    setUser(data.user);
    setIsAuth(true);

    // 6. Conectar socket
    const socket = socketConnection({ user: data.user });
    setSocket(socket);

    // 7. Carregar timezone
    await loadTimezone();

    // 8. Redirecionar
    history.push("/tickets");
    toast.success("Login realizado com sucesso!");
  } catch (err) {
    toastError(err);
  } finally {
    setLoading(false);
  }
};
```

---

## Fluxo de Mensagens

### Diagrama de Envio

```
┌──────────────┐
│ MessageInput │
└──────┬───────┘
       │ 1. User digita mensagem
       │ 2. handleSendMessage()
       ▼
┌──────────────────┐
│ Validações       │
│ - Texto não vazio│
│ - Ticket aberto  │
└──────┬───────────┘
       │ 3. Preparar payload
       ▼
┌──────────────────┐
│ POST /messages/  │
│ :ticketId        │
└──────┬───────────┘
       │ 4. Backend processa
       │ 5. Salva no DB
       │ 6. Envia para WhatsApp
       ▼
┌──────────────────┐
│ Socket emit:     │
│ appMessage       │
└──────┬───────────┘
       │ 7. Broadcast para rooms
       ▼
┌──────────────────┐
│ Frontend recebe  │
│ socket event     │
└──────┬───────────┘
       │ 8. dispatch ADD_MESSAGE
       │ 9. setMessages([...messages, newMsg])
       ▼
┌──────────────────┐
│ MessagesList     │
│ re-render        │
└──────┬───────────┘
       │ 10. scrollToBottom()
       ▼
┌──────────────────┐
│ Mensagem exibida │
└──────────────────┘
```

### Código de Envio

```javascript
// MessageInput.js
const handleSendMessage = async () => {
  if (!inputMessage.trim()) return;

  const message = {
    read: 1,
    fromMe: true,
    mediaUrl: "",
    body: signMessage ? `*${user.name}:*\n${inputMessage}` : inputMessage,
    quotedMsg: replyingMessage,
  };

  try {
    await api.post(`/messages/${ticketId}`, message);
    setInputMessage("");
    setReplyingMessage(null);
  } catch (err) {
    toastError(err);
  }
};
```

### Código de Recebimento

```javascript
// MessagesList.js
useEffect(() => {
  if (!socket) return;

  socket.on(`company-${user.companyId}-appMessage`, (data) => {
    if (data.action === "create" && data.ticket.id === ticketId) {
      setMessages((prev) => [...prev, data.message]);
      scrollToBottom();
    }

    if (data.action === "update") {
      setMessages((prev) =>
        prev.map((msg) => (msg.id === data.message.id ? data.message : msg))
      );
    }
  });

  return () => {
    socket.off(`company-${user.companyId}-appMessage`);
  };
}, [socket, ticketId]);
```

---

## Fluxo de Tickets

### Diagrama de Criação

```
┌──────────────┐
│ WhatsApp     │
│ Novo contato │
│ envia msg    │
└──────┬───────┘
       │
       ▼
┌──────────────┐
│ Backend      │
│ - Cria contato
│ - Cria ticket│
└──────┬───────┘
       │
       ▼
┌──────────────────┐
│ Socket emit:     │
│ company-X-ticket │
│ action: "create" │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ Frontend recebe  │
│ (TicketsManager) │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ dispatch         │
│ ADD_TICKET       │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ setTickets()     │
│ Badge +1         │
└──────┬───────────┘
       │
       ▼
┌──────────────────┐
│ Notificação      │
│ - Toast          │
│ - Sound          │
│ - Push (OneSignal)│
└──────────────────┘
```

### Código

```javascript
// TicketsManager.js
useEffect(() => {
  if (!socket) return;

  socket.on(`company-${user.companyId}-ticket`, (data) => {
    if (data.action === "create") {
      dispatch({ type: "ADD_TICKET", payload: data.ticket });

      // Notificação
      toast.info(`Novo ticket: ${data.ticket.contact.name}`);
      playNotificationSound();
    }

    if (data.action === "update") {
      dispatch({ type: "UPDATE_TICKET", payload: data.ticket });
    }

    if (data.action === "delete") {
      dispatch({ type: "DELETE_TICKET", payload: data.ticketId });
    }
  });

  return () => {
    socket.off(`company-${user.companyId}-ticket`);
  };
}, [socket]);
```

---

## Fluxo de Upload

### Diagrama

```
┌──────────────┐
│ User seleciona│
│ arquivo      │
└──────┬───────┘
       │ 1. <input type="file" />
       │    ou Drag & Drop
       │    ou Paste
       ▼
┌──────────────┐
│ handleChange │
│ Medias       │
└──────┬───────┘
       │ 2. Criar preview
       │ 3. setMediasUpload([files])
       ▼
┌──────────────────┐
│ MessageUpload    │
│ MediasModal      │
└──────┬───────────┘
       │ 4. User adiciona caption
       │ 5. handleUploadMedia()
       ▼
┌──────────────────┐
│ Comprimir        │
│ (se imagem)      │
└──────┬───────────┘
       │ 6. FormData
       ▼
┌──────────────────┐
│ POST /messages/  │
│ :ticketId        │
│ FormData {       │
│   medias: File,  │
│   body: caption  │
│ }                │
└──────┬───────────┘
       │ 7. Backend:
       │    - Salva arquivo
       │    - Gera mediaUrl
       │    - Cria message
       ▼
┌──────────────────┐
│ Socket emit      │
│ appMessage       │
└──────┬───────────┘
       │ 8. Frontend recebe
       │ 9. Exibe mídia
       ▼
┌──────────────────┐
│ MessagesList     │
│ <ModalImage />   │
│ <AudioModal />   │
│ <VideoPlayer />  │
└──────────────────┘
```

### Código

```javascript
// MessageInput.js
const handleChangeMedias = (e) => {
  if (!e.target.files) return;

  const files = Array.from(e.target.files);
  const mediasList = files.map((file) => ({
    file,
    preview: URL.createObjectURL(file),
    caption: "",
  }));

  setMediasUpload(mediasList);
};

const handleUploadMedia = async () => {
  setLoading(true);

  for (const media of mediasUpload) {
    const formData = new FormData();
    formData.append("fromMe", "true");
    formData.append("body", media.caption || " ");
    formData.append("medias", media.file);

    try {
      await api.post(`/messages/${ticketId}`, formData);
    } catch (err) {
      toastError(err);
    }
  }

  setMediasUpload([]);
  setLoading(false);
};
```

---

## Fluxo Real-time

### Diagrama Completo

```
┌─────────────────────────────────────────────────┐
│                  Backend                        │
└────┬──────────┬─────────┬──────────┬───────────┘
     │          │         │          │
     │ Ticket   │ Message │ Contact  │ User
     │ Created  │ Created │ Updated  │ Updated
     ▼          ▼         ▼          ▼
┌────────────────────────────────────────────────┐
│            Socket.IO Server                    │
│  socket.emit(`company-${id}-${event}`, data)  │
└────┬──────────┬─────────┬──────────┬──────────┘
     │          │         │          │
     │ Broadcast to rooms/connections│
     ▼          ▼         ▼          ▼
┌────────────────────────────────────────────────┐
│            Socket.IO Client                    │
│  socket.on(`company-${id}-${event}`)          │
└────┬──────────┬─────────┬──────────┬──────────┘
     │          │         │          │
     ▼          ▼         ▼          ▼
┌──────┐  ┌─────────┐  ┌────────┐  ┌──────┐
│Tickets│  │Messages │  │Contacts│  │Users │
│Manager│  │List     │  │Page    │  │Page  │
└───┬───┘  └────┬────┘  └───┬────┘  └───┬──┘
    │           │           │           │
    ▼           ▼           ▼           ▼
┌──────────────────────────────────────────────┐
│         State Update (Context/Hooks)         │
└──────────────────────────────────────────────┘
    │
    ▼
┌──────────────────────────────────────────────┐
│              UI Re-render                    │
└──────────────────────────────────────────────┘
```

### Código de Setup

```javascript
// AuthContext.js
useEffect(() => {
  if (user && user.companyId) {
    const io = socketConnection({ user });
    setSocket(io);

    // Listeners globais
    io.on(`company-${user.companyId}-auth`, handleAuthEvent);
    io.on(`company-${user.companyId}-timezone`, handleTimezoneEvent);

    return () => {
      io.off(`company-${user.companyId}-auth`);
      io.off(`company-${user.companyId}-timezone`);
      io.disconnect();
    };
  }
}, [user]);
```

---

## Exemplos Práticos

### Exemplo 1: Criar Modal de CRUD

```javascript
// UserModal.js
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from "@material-ui/core";
import { Formik, Form, Field } from "formik";
import * as Yup from "yup";
import { toast } from "react-toastify";

import api from "../../services/api";
import toastError from "../../errors/toastError";
import { i18n } from "../../translate/i18n";

const UserSchema = Yup.object().shape({
  name: Yup.string().required("Nome obrigatório"),
  email: Yup.string().email("Email inválido").required("Email obrigatório"),
  password: Yup.string().min(6, "Mínimo 6 caracteres"),
});

const UserModal = ({ open, onClose, userId, onSave }) => {
  const [initialValues, setInitialValues] = useState({
    name: "",
    email: "",
    password: "",
  });

  useEffect(() => {
    if (userId) {
      fetchUser();
    } else {
      setInitialValues({
        name: "",
        email: "",
        password: "",
      });
    }
  }, [userId, open]);

  const fetchUser = async () => {
    try {
      const { data } = await api.get(`/users/${userId}`);
      setInitialValues({
        name: data.name,
        email: data.email,
        password: "",
      });
    } catch (err) {
      toastError(err);
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (userId) {
        await api.put(`/users/${userId}`, values);
        toast.success("Usuário atualizado!");
      } else {
        await api.post("/users", values);
        toast.success("Usuário criado!");
      }
      onSave?.();
      onClose();
    } catch (err) {
      toastError(err);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {userId ? i18n.t("userModal.title.edit") : i18n.t("userModal.title.add")}
      </DialogTitle>
      <Formik
        initialValues={initialValues}
        enableReinitialize
        validationSchema={UserSchema}
        onSubmit={handleSubmit}
      >
        {({ errors, touched, isSubmitting }) => (
          <Form>
            <DialogContent>
              <Field
                as={TextField}
                name="name"
                label={i18n.t("userModal.form.name")}
                fullWidth
                margin="dense"
                error={touched.name && Boolean(errors.name)}
                helperText={touched.name && errors.name}
              />
              <Field
                as={TextField}
                name="email"
                label={i18n.t("userModal.form.email")}
                type="email"
                fullWidth
                margin="dense"
                error={touched.email && Boolean(errors.email)}
                helperText={touched.email && errors.email}
              />
              <Field
                as={TextField}
                name="password"
                label={i18n.t("userModal.form.password")}
                type="password"
                fullWidth
                margin="dense"
                error={touched.password && Boolean(errors.password)}
                helperText={touched.password && errors.password}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={onClose} color="secondary">
                {i18n.t("userModal.buttons.cancel")}
              </Button>
              <Button type="submit" color="primary" disabled={isSubmitting}>
                {i18n.t("userModal.buttons.save")}
              </Button>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
};

export default UserModal;
```

### Exemplo 2: Página com Lista e Filtros

```javascript
// ContactsPage.js
import React, { useState, useEffect, useReducer } from "react";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  IconButton,
  TextField,
  InputAdornment,
} from "@material-ui/core";
import { Search, Edit, Delete } from "@material-ui/icons";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import ContactModal from "../../components/ContactModal";
import ConfirmationModal from "../../components/ConfirmationModal";

import api from "../../services/api";
import toastError from "../../errors/toastError";
import { toast } from "react-toastify";
import { i18n } from "../../translate/i18n";
import { useDebounce } from "use-debounce";

const reducer = (state, action) => {
  switch (action.type) {
    case "LOAD_CONTACTS":
      return { ...state, contacts: action.payload, loading: false };
    case "UPDATE_CONTACT":
      return {
        ...state,
        contacts: state.contacts.map((c) =>
          c.id === action.payload.id ? action.payload : c
        ),
      };
    case "DELETE_CONTACT":
      return {
        ...state,
        contacts: state.contacts.filter((c) => c.id !== action.payload),
      };
    default:
      return state;
  }
};

const ContactsPage = () => {
  const [state, dispatch] = useReducer(reducer, {
    contacts: [],
    loading: true,
  });
  const [searchParam, setSearchParam] = useState("");
  const [debouncedSearch] = useDebounce(searchParam, 500);
  const [selectedContact, setSelectedContact] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [contactToDelete, setContactToDelete] = useState(null);

  useEffect(() => {
    fetchContacts();
  }, [debouncedSearch]);

  const fetchContacts = async () => {
    try {
      const { data } = await api.get("/contacts", {
        params: { searchParam: debouncedSearch },
      });
      dispatch({ type: "LOAD_CONTACTS", payload: data.contacts });
    } catch (err) {
      toastError(err);
    }
  };

  const handleOpenModal = (contact = null) => {
    setSelectedContact(contact);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedContact(null);
    setModalOpen(false);
  };

  const handleSaveContact = () => {
    fetchContacts();
    handleCloseModal();
  };

  const handleDeleteContact = async () => {
    try {
      await api.delete(`/contacts/${contactToDelete.id}`);
      dispatch({ type: "DELETE_CONTACT", payload: contactToDelete.id });
      toast.success(i18n.t("contacts.toasts.deleted"));
      setConfirmOpen(false);
    } catch (err) {
      toastError(err);
    }
  };

  return (
    <MainContainer>
      <MainHeader>
        <Title>{i18n.t("contacts.title")}</Title>
      </MainHeader>

      <Paper>
        <TextField
          placeholder={i18n.t("contacts.searchPlaceholder")}
          value={searchParam}
          onChange={(e) => setSearchParam(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
          fullWidth
          margin="dense"
        />

        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{i18n.t("contacts.table.name")}</TableCell>
              <TableCell>{i18n.t("contacts.table.number")}</TableCell>
              <TableCell>{i18n.t("contacts.table.email")}</TableCell>
              <TableCell align="center">
                {i18n.t("contacts.table.actions")}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {state.contacts.map((contact) => (
              <TableRow key={contact.id}>
                <TableCell>{contact.name}</TableCell>
                <TableCell>{contact.number}</TableCell>
                <TableCell>{contact.email}</TableCell>
                <TableCell align="center">
                  <IconButton
                    size="small"
                    onClick={() => handleOpenModal(contact)}
                  >
                    <Edit />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() => {
                      setContactToDelete(contact);
                      setConfirmOpen(true);
                    }}
                  >
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      <ContactModal
        open={modalOpen}
        onClose={handleCloseModal}
        contactId={selectedContact?.id}
        onSave={handleSaveContact}
      />

      <ConfirmationModal
        title={i18n.t("contacts.confirmationModal.deleteTitle")}
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleDeleteContact}
      >
        {i18n.t("contacts.confirmationModal.deleteMessage")}
      </ConfirmationModal>
    </MainContainer>
  );
};

export default ContactsPage;
```

### Exemplo 3: Custom Hook com Socket.IO

```javascript
// useTicketsSocket.js
import { useEffect, useContext, useReducer } from "react";
import { AuthContext } from "../../context/Auth/AuthContext";
import { SocketContext } from "../../context/Socket/SocketContext";
import { toast } from "react-toastify";
import useSound from "use-sound";
import notificationSound from "../../assets/sound.mp3";

const reducer = (state, action) => {
  switch (action.type) {
    case "SET_TICKETS":
      return { ...state, tickets: action.payload };
    case "ADD_TICKET":
      return { ...state, tickets: [action.payload, ...state.tickets] };
    case "UPDATE_TICKET":
      return {
        ...state,
        tickets: state.tickets.map((t) =>
          t.id === action.payload.id ? action.payload : t
        ),
      };
    case "DELETE_TICKET":
      return {
        ...state,
        tickets: state.tickets.filter((t) => t.id !== action.payload),
      };
    default:
      return state;
  }
};

const useTicketsSocket = (status = "open") => {
  const { user } = useContext(AuthContext);
  const { socket } = useContext(SocketContext);
  const [state, dispatch] = useReducer(reducer, { tickets: [] });
  const [play] = useSound(notificationSound);

  useEffect(() => {
    if (!socket) return;

    const handleTicket = (data) => {
      if (data.action === "create") {
        dispatch({ type: "ADD_TICKET", payload: data.ticket });
        toast.info(`Novo ticket: ${data.ticket.contact.name}`);
        play();
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
  }, [socket, user, play]);

  return state;
};

export default useTicketsSocket;
```

---

## Boas Práticas

### 1. Sempre limpar listeners do Socket.IO

```javascript
useEffect(() => {
  socket.on("event", handler);

  return () => {
    socket.off("event", handler);
  };
}, [socket]);
```

### 2. Use reducer para lógica complexa de estado

```javascript
const [state, dispatch] = useReducer(reducer, initialState);
```

### 3. Debounce em buscas

```javascript
const [debouncedSearch] = useDebounce(searchParam, 500);
```

### 4. Validação com Yup

```javascript
const schema = Yup.object().shape({
  email: Yup.string().email().required(),
  password: Yup.string().min(6).required(),
});
```

---

**Total de Fluxos Documentados:** 5
**Exemplos Práticos:** 3
**Última Atualização:** 2025-10-11
