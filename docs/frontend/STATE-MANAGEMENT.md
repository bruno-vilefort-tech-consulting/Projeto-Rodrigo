# 🔄 Gerenciamento de Estado - ChatIA Flow

> Documentação completa sobre gerenciamento de estado no frontend

**Versão do Sistema:** 2.2.2v-26
**Última Atualização:** 2025-10-12

---

## 📑 Índice

1. [Visão Geral](#visão-geral)
2. [Arquitetura de Estado](#arquitetura-de-estado)
3. [Context API](#context-api)
4. [Custom Hooks](#custom-hooks)
5. [Estado Local vs Global](#estado-local-vs-global)
6. [Patterns e Best Practices](#patterns-e-best-practices)
7. [Fluxo de Dados](#fluxo-de-dados)
8. [Performance](#performance)
9. [Exemplos Práticos](#exemplos-práticos)

---

## 🎯 Visão Geral

### Estratégias de Gerenciamento

O ChatIA Flow utiliza uma **arquitetura híbrida** de gerenciamento de estado:

| Tipo | Tecnologia | Uso | Exemplos |
|------|-----------|-----|----------|
| **Global** | Context API | Estado compartilhado entre múltiplos componentes | Auth, Tickets, WhatsApp |
| **Server State** | Custom Hooks | Cache e sincronização com API | useTickets, useContacts |
| **Local** | useState | Estado específico de componente | Modals, forms, UI |
| **Computed** | useMemo | Valores derivados | Filtros, totalizações |
| **Effects** | useEffect | Side effects | Fetch, Socket.IO, localStorage |

### Stack Completo

```javascript
// Estado Global
- AuthContext          // Autenticação e usuário
- TicketsContext       // Tickets atuais
- WhatsAppsContext     // Conexões WhatsApp
- CurrencyContext      // Moeda e formatação

// Estado de Servidor (via hooks)
- useTickets()         // Lista de tickets
- useContacts()        // Lista de contatos
- useUsers()           // Lista de usuários
- useQueues()          // Filas de atendimento

// Estado Local (useState)
- Modal open/close
- Form values
- UI toggles
- Loading states
```

---

## 🏗️ Arquitetura de Estado

### Diagrama de Fluxo

```
┌─────────────────────────────────────────────────────────────┐
│                       Application Root                      │
│                         <App />                             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      Global Providers                       │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  <AuthProvider>         // Autenticação, Socket.IO   │  │
│  │    <CurrencyProvider>   // Formatação monetária      │  │
│  │      <TicketsContextProvider> // Tickets atuais      │  │
│  │        <WhatsAppsProvider>    // Conexões WhatsApp   │  │
│  │                                                        │  │
│  │          {children}  // Rotas da aplicação            │  │
│  │                                                        │  │
│  │        </WhatsAppsProvider>                           │  │
│  │      </TicketsContextProvider>                        │  │
│  │    </CurrencyProvider>                                │  │
│  │  </AuthProvider>                                      │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Page Components                         │
│  - Consomem Contexts via useContext()                      │
│  - Usam Custom Hooks para dados do servidor                │
│  - Gerenciam estado local com useState()                   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Child Components                         │
│  - Recebem props dos pais                                   │
│  - Podem acessar contexts quando necessário                 │
│  - Estado local para UI específica                          │
└─────────────────────────────────────────────────────────────┘
```

### Hierarquia de Providers

**Arquivo:** `/frontend/src/routes/index.js`

```javascript
const Routes = () => {
  return (
    <BrowserRouter>
      <AuthProvider>              {/* Nível 1: Autenticação */}
        <CurrencyProvider>        {/* Nível 2: Formatação */}
          <TicketsContextProvider> {/* Nível 3: Tickets */}
            <Switch>
              <WhatsAppsProvider>  {/* Nível 4: Dentro das rotas */}
                <LoggedInLayout>
                  {/* Rotas privadas */}
                </LoggedInLayout>
              </WhatsAppsProvider>
            </Switch>
          </TicketsContextProvider>
        </CurrencyProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};
```

**Por que essa ordem?**

1. **AuthProvider** primeiro → Autenticação necessária para tudo
2. **CurrencyProvider** → Formatação usada em toda aplicação
3. **TicketsContextProvider** → Tickets usados em múltiplas páginas
4. **WhatsAppsProvider** apenas em rotas privadas → Otimização

---

## 🌐 Context API

### 11 Contexts Principais

Ver [CONTEXTS.md](./CONTEXTS.md) para documentação completa de cada context.

| Context | Responsabilidade | Estado Gerenciado |
|---------|------------------|-------------------|
| **AuthContext** | Autenticação e sessão | user, isAuth, socket, timezone |
| **TicketsContext** | Ticket atual aberto | currentTicket, tabOpen |
| **WhatsAppsContext** | Conexões WhatsApp | whatsApps, loading |
| **CurrencyContext** | Formatação monetária | currency, formatCurrency() |
| **ReplyingMessageContext** | Resposta de mensagem | replyingMessage, setReplyingMessage |
| **ForwardMessageContext** | Encaminhar mensagem | forwardMessageModalOpen, message |
| **EditingMessageContext** | Editar mensagem | editingMessage, setEditingMessage |
| **ProfileImageContext** | Avatar do usuário | profileImage, updateProfileImage() |
| **QueuesSelectedContext** | Filas selecionadas | queuesSelected, setQueuesSelected |
| **AlertLinkContext** | Links de alerta | alertLink, setAlertLink |
| **TimeZoneContext** | Fuso horário | timezone, convertToTimezone() |

### Pattern: Criar um Context

```javascript
// 1. Criar o Context
import React, { createContext, useState, useEffect } from "react";

const MyContext = createContext();

// 2. Criar o Provider
const MyProvider = ({ children }) => {
  const [state, setState] = useState(initialValue);

  // 3. Métodos/Actions
  const updateState = (newValue) => {
    setState(newValue);
  };

  // 4. Side Effects
  useEffect(() => {
    // Lógica de efeito colateral
  }, [state]);

  // 5. Value do Provider
  return (
    <MyContext.Provider value={{ state, setState, updateState }}>
      {children}
    </MyContext.Provider>
  );
};

// 6. Exports
export { MyContext, MyProvider };
```

### Pattern: Consumir um Context

```javascript
// Opção 1: useContext Hook (Recomendado)
import { useContext } from "react";
import { AuthContext } from "../../context/Auth/AuthContext";

const MyComponent = () => {
  const { user, isAuth, handleLogout } = useContext(AuthContext);

  return (
    <div>
      {isAuth ? (
        <span>Olá, {user.name}!</span>
      ) : (
        <span>Não autenticado</span>
      )}
      <button onClick={handleLogout}>Sair</button>
    </div>
  );
};

// Opção 2: Consumer (Menos comum)
import { AuthContext } from "../../context/Auth/AuthContext";

const MyComponent = () => (
  <AuthContext.Consumer>
    {({ user, isAuth }) => (
      <div>{isAuth && <span>{user.name}</span>}</div>
    )}
  </AuthContext.Consumer>
);
```

---

## 🎣 Custom Hooks

### 26 Hooks Customizados

Ver [HOOKS.md](./HOOKS.md) para documentação completa de cada hook.

**Categorias:**

1. **Autenticação (1)**
   - useAuth

2. **Dados/API (18)**
   - useTickets, useContacts, useUsers, useQueues, useTags, useWhatsApps, etc.

3. **UI (2)**
   - useLocalStorage, useDate

4. **Utilitários (5)**
   - useSettings, useVersion, useLanguage, etc.

### Pattern: Custom Hook para API

```javascript
// hooks/useTickets/index.js
import { useState, useEffect, useContext } from "react";
import api from "../../services/api";
import { AuthContext } from "../../context/Auth/AuthContext";
import { SocketContext } from "../../context/Socket/SocketContext";
import toastError from "../../errors/toastError";

const useTickets = ({ searchParam, status, queueIds }) => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [count, setCount] = useState(0);

  const { user } = useContext(AuthContext);
  const { socket } = useContext(SocketContext);

  useEffect(() => {
    setLoading(true);

    const fetchTickets = async () => {
      try {
        const { data } = await api.get("/tickets", {
          params: { searchParam, status, queueIds }
        });

        setTickets(data.tickets);
        setHasMore(data.hasMore);
        setCount(data.count);
      } catch (err) {
        toastError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [searchParam, status, queueIds]);

  // Socket.IO para real-time
  useEffect(() => {
    const companyId = user.companyId;

    const onTicketUpdate = (data) => {
      if (data.action === "update") {
        setTickets(prev =>
          prev.map(t => t.id === data.ticket.id ? data.ticket : t)
        );
      }
      if (data.action === "create") {
        setTickets(prev => [data.ticket, ...prev]);
        setCount(prev => prev + 1);
      }
      if (data.action === "delete") {
        setTickets(prev => prev.filter(t => t.id !== data.ticketId));
        setCount(prev => prev - 1);
      }
    };

    socket.on(`company-${companyId}-ticket`, onTicketUpdate);

    return () => {
      socket.off(`company-${companyId}-ticket`, onTicketUpdate);
    };
  }, [socket, user.companyId]);

  return { tickets, loading, hasMore, count };
};

export default useTickets;
```

### Pattern: Custom Hook para localStorage

```javascript
// hooks/useLocalStorage/index.js
import { useState, useEffect } from "react";

const useLocalStorage = (key, initialValue) => {
  // State para armazenar valor
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  // Função para atualizar state e localStorage
  const setValue = (value) => {
    try {
      // Permitir value ser função
      const valueToStore = value instanceof Function
        ? value(storedValue)
        : value;

      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  // Sincronizar com outras tabs
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === key && e.newValue) {
        setStoredValue(JSON.parse(e.newValue));
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [key]);

  return [storedValue, setValue];
};

export default useLocalStorage;
```

---

## ⚖️ Estado Local vs Global

### Quando usar Estado Local (useState)

✅ **Use useState quando:**

- Estado é usado apenas por 1 componente
- Estado é UI específico (modal open/close, selected tab)
- Dados temporários (form values antes de submit)
- Performance crítica (evitar re-renders desnecessários)

**Exemplos:**

```javascript
// Modal
const [modalOpen, setModalOpen] = useState(false);

// Form
const [name, setName] = useState("");
const [email, setEmail] = useState("");

// UI Toggle
const [showDetails, setShowDetails] = useState(false);

// Loading
const [loading, setLoading] = useState(false);

// Selected Item
const [selectedId, setSelectedId] = useState(null);
```

### Quando usar Estado Global (Context)

✅ **Use Context quando:**

- Estado compartilhado entre múltiplos componentes
- Dados de autenticação/usuário
- Configurações globais (tema, idioma)
- Evitar prop drilling (passar props por muitos níveis)

**Exemplos:**

```javascript
// Autenticação - usado em toda aplicação
<AuthContext>
  user, isAuth, handleLogin, handleLogout
</AuthContext>

// Ticket atual - usado em múltiplos componentes
<TicketsContext>
  currentTicket, setCurrentTicket
</TicketsContext>

// Tema - usado em toda aplicação
<ThemeContext>
  theme, toggleTheme
</ThemeContext>
```

### Decisão Tree

```
Preciso gerenciar estado?
  │
  ├─ Usado apenas neste componente?
  │  └─ useState
  │
  ├─ Usado em múltiplos componentes próximos?
  │  └─ Lift state up + props
  │
  ├─ Usado em múltiplos componentes distantes?
  │  └─ Context API
  │
  ├─ Dados do servidor que precisam cache?
  │  └─ Custom Hook com useState/useEffect
  │
  └─ Dados em tempo real do servidor?
     └─ Custom Hook com Socket.IO
```

---

## 🎨 Patterns e Best Practices

### 1. Lifting State Up

**Quando:** Estado compartilhado entre componentes irmãos

```javascript
// ❌ RUIM - Estado duplicado
const ComponentA = () => {
  const [count, setCount] = useState(0);
  return <div>{count}</div>;
};

const ComponentB = () => {
  const [count, setCount] = useState(0);
  return <div>{count}</div>;
};

// ✅ BOM - Estado elevado ao pai
const ParentComponent = () => {
  const [count, setCount] = useState(0);

  return (
    <>
      <ComponentA count={count} setCount={setCount} />
      <ComponentB count={count} setCount={setCount} />
    </>
  );
};

const ComponentA = ({ count, setCount }) => (
  <div>
    {count}
    <button onClick={() => setCount(c => c + 1)}>+</button>
  </div>
);

const ComponentB = ({ count }) => <div>Total: {count}</div>;
```

### 2. State Reducer Pattern

**Quando:** Estado complexo com múltiplas ações

```javascript
// ❌ RUIM - Múltiplos setStates
const [tickets, setTickets] = useState([]);
const [loading, setLoading] = useState(false);
const [error, setError] = useState(null);

const addTicket = (ticket) => {
  setTickets(prev => [...prev, ticket]);
};

const removeTicket = (id) => {
  setTickets(prev => prev.filter(t => t.id !== id));
};

const updateTicket = (id, data) => {
  setTickets(prev => prev.map(t => t.id === id ? { ...t, ...data } : t));
};

// ✅ BOM - useReducer
const initialState = {
  tickets: [],
  loading: false,
  error: null
};

const reducer = (state, action) => {
  switch (action.type) {
    case "LOAD_TICKETS":
      return { ...state, tickets: action.payload, loading: false };

    case "ADD_TICKET":
      return { ...state, tickets: [...state.tickets, action.payload] };

    case "REMOVE_TICKET":
      return {
        ...state,
        tickets: state.tickets.filter(t => t.id !== action.payload)
      };

    case "UPDATE_TICKET":
      return {
        ...state,
        tickets: state.tickets.map(t =>
          t.id === action.payload.id ? action.payload : t
        )
      };

    case "SET_LOADING":
      return { ...state, loading: action.payload };

    case "SET_ERROR":
      return { ...state, error: action.payload };

    default:
      return state;
  }
};

const MyComponent = () => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const addTicket = (ticket) => {
    dispatch({ type: "ADD_TICKET", payload: ticket });
  };

  return <div>{state.tickets.length} tickets</div>;
};
```

### 3. Memoization

**Quando:** Evitar re-renders e cálculos desnecessários

```javascript
import { useMemo, useCallback } from "react";

const TicketsList = ({ tickets, filters }) => {
  // useMemo - Valores computados
  const filteredTickets = useMemo(() => {
    return tickets.filter(ticket => {
      if (filters.status && ticket.status !== filters.status) return false;
      if (filters.queue && ticket.queueId !== filters.queue) return false;
      return true;
    });
  }, [tickets, filters]);

  const ticketsCount = useMemo(() => {
    return {
      total: filteredTickets.length,
      open: filteredTickets.filter(t => t.status === "open").length,
      pending: filteredTickets.filter(t => t.status === "pending").length,
      closed: filteredTickets.filter(t => t.status === "closed").length
    };
  }, [filteredTickets]);

  // useCallback - Funções estáveis
  const handleTicketClick = useCallback((ticketId) => {
    console.log("Clicked:", ticketId);
  }, []);

  return (
    <div>
      <p>Total: {ticketsCount.total}</p>
      {filteredTickets.map(ticket => (
        <TicketItem
          key={ticket.id}
          ticket={ticket}
          onClick={handleTicketClick}
        />
      ))}
    </div>
  );
};
```

### 4. Lazy Initial State

**Quando:** Cálculo inicial custoso

```javascript
// ❌ RUIM - Executa toda vez que renderiza
const [state, setState] = useState(
  JSON.parse(localStorage.getItem("data")) || []
);

// ✅ BOM - Executa apenas uma vez
const [state, setState] = useState(() => {
  const saved = localStorage.getItem("data");
  return saved ? JSON.parse(saved) : [];
});
```

### 5. State Co-location

**Quando:** Manter estado próximo de onde é usado

```javascript
// ❌ RUIM - Estado no topo sem necessidade
const App = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({});

  return (
    <div>
      <Header />
      <Sidebar />
      <Content>
        <MyModal open={modalOpen} onClose={() => setModalOpen(false)} />
      </Content>
    </div>
  );
};

// ✅ BOM - Estado próximo do uso
const Content = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [formData, setFormData] = useState({});

  return (
    <div>
      <button onClick={() => setModalOpen(true)}>Abrir Modal</button>
      <MyModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        data={formData}
        setData={setFormData}
      />
    </div>
  );
};
```

---

## 🔄 Fluxo de Dados

### Fluxo Unidirecional

```
┌──────────────────────────────────────────────────────┐
│                    Parent Component                  │
│  const [data, setData] = useState([]);              │
│                                                       │
│  const handleUpdate = (id, newData) => {            │
│    setData(prev => prev.map(...));                  │
│  }                                                    │
└───────────────────┬──────────────────────────────────┘
                    │
                    │ Props Down ↓
                    │
        ┌───────────┴───────────┬───────────────┐
        │                       │               │
        ▼                       ▼               ▼
┌───────────────┐      ┌───────────────┐   ┌──────────────┐
│  Child A      │      │  Child B      │   │  Child C     │
│  {data}       │      │  {data}       │   │  {data}      │
│               │      │               │   │              │
│  <button      │      │  <button      │   │  <button     │
│   onClick={   │      │   onClick={   │   │   onClick={  │
│   handleUpdate│      │   handleUpdate│   │   handleUpdate
│   }/>         │      │   }/>         │   │   }/>        │
└───────────────┘      └───────────────┘   └──────────────┘
        │                       │               │
        └───────────┬───────────┴───────────────┘
                    │
                    │ Events Up ↑
                    │
                    ▼
┌──────────────────────────────────────────────────────┐
│         Parent handles event and updates state       │
└──────────────────────────────────────────────────────┘
```

### Exemplo Completo

```javascript
// Parent Component
const TicketsPage = () => {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);

  // Handlers que modificam estado
  const handleSelectTicket = (ticket) => {
    setSelectedTicket(ticket);
  };

  const handleUpdateTicket = (ticketId, updates) => {
    setTickets(prev =>
      prev.map(t => t.id === ticketId ? { ...t, ...updates } : t)
    );
  };

  const handleDeleteTicket = (ticketId) => {
    setTickets(prev => prev.filter(t => t.id !== ticketId));
    if (selectedTicket?.id === ticketId) {
      setSelectedTicket(null);
    }
  };

  return (
    <div>
      {/* Props down */}
      <TicketsList
        tickets={tickets}
        onSelectTicket={handleSelectTicket}
      />

      {selectedTicket && (
        <TicketDetail
          ticket={selectedTicket}
          onUpdate={handleUpdateTicket}
          onDelete={handleDeleteTicket}
        />
      )}
    </div>
  );
};

// Child Component
const TicketsList = ({ tickets, onSelectTicket }) => {
  return (
    <div>
      {tickets.map(ticket => (
        <div
          key={ticket.id}
          onClick={() => onSelectTicket(ticket)} // Event up
        >
          {ticket.contact.name}
        </div>
      ))}
    </div>
  );
};

const TicketDetail = ({ ticket, onUpdate, onDelete }) => {
  const handleStatusChange = (newStatus) => {
    onUpdate(ticket.id, { status: newStatus }); // Event up
  };

  return (
    <div>
      <h2>{ticket.contact.name}</h2>
      <button onClick={() => handleStatusChange("closed")}>
        Fechar
      </button>
      <button onClick={() => onDelete(ticket.id)}>
        Deletar
      </button>
    </div>
  );
};
```

---

## ⚡ Performance

### 1. React.memo

**Quando:** Evitar re-render de componente filho se props não mudaram

```javascript
import React, { memo } from "react";

// Componente re-renderiza toda vez que pai renderiza
const TicketItem = ({ ticket, onClick }) => {
  console.log("Rendering:", ticket.id);
  return <div onClick={() => onClick(ticket.id)}>{ticket.contact.name}</div>;
};

// Componente só re-renderiza se ticket ou onClick mudaram
const TicketItemMemo = memo(({ ticket, onClick }) => {
  console.log("Rendering:", ticket.id);
  return <div onClick={() => onClick(ticket.id)}>{ticket.contact.name}</div>;
});

// Custom comparison
const TicketItemCustom = memo(
  ({ ticket, onClick }) => {
    return <div onClick={() => onClick(ticket.id)}>{ticket.contact.name}</div>;
  },
  (prevProps, nextProps) => {
    // Retornar true = não re-renderizar
    return prevProps.ticket.id === nextProps.ticket.id &&
           prevProps.ticket.status === nextProps.ticket.status;
  }
);
```

### 2. useMemo

**Quando:** Evitar cálculos custosos em toda re-renderização

```javascript
const ExpensiveComponent = ({ tickets, filters }) => {
  // ❌ RUIM - Filtra e ordena toda vez que renderiza
  const sortedTickets = tickets
    .filter(t => t.status === filters.status)
    .sort((a, b) => b.updatedAt - a.updatedAt);

  // ✅ BOM - Só recalcula quando tickets ou filters mudam
  const sortedTickets = useMemo(() => {
    console.log("Recalculando tickets...");
    return tickets
      .filter(t => t.status === filters.status)
      .sort((a, b) => b.updatedAt - a.updatedAt);
  }, [tickets, filters]);

  return <div>{sortedTickets.length} tickets</div>;
};
```

### 3. useCallback

**Quando:** Estabilizar funções passadas como props

```javascript
const ParentComponent = () => {
  const [count, setCount] = useState(0);

  // ❌ RUIM - Nova função toda renderização
  const handleClick = (id) => {
    console.log("Clicked:", id);
  };

  // ✅ BOM - Mesma referência entre renderizações
  const handleClickMemo = useCallback((id) => {
    console.log("Clicked:", id);
  }, []);

  // Com dependências
  const handleUpdate = useCallback((id, newData) => {
    // Usa count do estado atual
    console.log("Count:", count);
    api.put(`/tickets/${id}`, { ...newData, count });
  }, [count]); // Recria quando count muda

  return (
    <div>
      <ChildComponent onClick={handleClickMemo} />
    </div>
  );
};

const ChildComponent = memo(({ onClick }) => {
  console.log("Child rendering");
  return <button onClick={() => onClick(123)}>Click</button>;
});
```

### 4. Code Splitting de Context

```javascript
// ❌ RUIM - Um context gigante
const AppContext = createContext();

const AppProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [tickets, setTickets] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [queues, setQueues] = useState([]);
  const [settings, setSettings] = useState({});
  // ... 20 estados diferentes

  return (
    <AppContext.Provider value={{ /* tudo */ }}>
      {children}
    </AppContext.Provider>
  );
};

// ✅ BOM - Contexts separados
const AuthContext = createContext();
const TicketsContext = createContext();
const ContactsContext = createContext();

// Componente só re-renderiza quando contexto que usa muda
```

---

## 💡 Exemplos Práticos

### Exemplo 1: Form com Estado Local

```javascript
const UserForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    profile: "user"
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const handleChange = (field) => (event) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value
    }));
    // Limpar erro do campo
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name) newErrors.name = "Nome obrigatório";
    if (!formData.email) newErrors.email = "Email obrigatório";
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    try {
      await onSubmit(formData);
      setFormData({ name: "", email: "", profile: "user" });
    } catch (err) {
      setErrors({ submit: err.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <TextField
        label="Nome"
        value={formData.name}
        onChange={handleChange("name")}
        error={!!errors.name}
        helperText={errors.name}
      />
      <TextField
        label="Email"
        value={formData.email}
        onChange={handleChange("email")}
        error={!!errors.email}
        helperText={errors.email}
      />
      <Button type="submit" disabled={loading}>
        {loading ? "Salvando..." : "Salvar"}
      </Button>
    </form>
  );
};
```

### Exemplo 2: Lista com Real-time

```javascript
const TicketsRealtime = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useContext(AuthContext);
  const { socket } = useContext(SocketContext);

  // Carregar inicial
  useEffect(() => {
    const fetchTickets = async () => {
      try {
        const { data } = await api.get("/tickets");
        setTickets(data.tickets);
      } catch (err) {
        toastError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, []);

  // Socket.IO real-time
  useEffect(() => {
    const companyId = user.companyId;

    const handleTicket = (data) => {
      if (data.action === "update") {
        setTickets(prev =>
          prev.map(t => t.id === data.ticket.id ? data.ticket : t)
        );
      }

      if (data.action === "create") {
        setTickets(prev => [data.ticket, ...prev]);
        toast.info(`Novo ticket: ${data.ticket.contact.name}`);
      }

      if (data.action === "delete") {
        setTickets(prev => prev.filter(t => t.id !== data.ticketId));
      }
    };

    socket.on(`company-${companyId}-ticket`, handleTicket);

    return () => {
      socket.off(`company-${companyId}-ticket`, handleTicket);
    };
  }, [socket, user.companyId]);

  if (loading) return <BackdropLoading />;

  return (
    <div>
      {tickets.map(ticket => (
        <TicketItem key={ticket.id} ticket={ticket} />
      ))}
    </div>
  );
};
```

### Exemplo 3: Context + Custom Hook

```javascript
// Context
const NotificationsContext = createContext();

const NotificationsProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const addNotification = (notification) => {
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
  };

  const markAsRead = (notificationId) => {
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  return (
    <NotificationsContext.Provider value={{
      notifications,
      unreadCount,
      addNotification,
      markAsRead,
      markAllAsRead
    }}>
      {children}
    </NotificationsContext.Provider>
  );
};

// Custom Hook
const useNotifications = () => {
  const context = useContext(NotificationsContext);

  if (!context) {
    throw new Error("useNotifications deve ser usado dentro de NotificationsProvider");
  }

  return context;
};

// Uso
const NotificationBell = () => {
  const { unreadCount, markAllAsRead } = useNotifications();

  return (
    <Badge badgeContent={unreadCount} color="error">
      <NotificationsIcon onClick={markAllAsRead} />
    </Badge>
  );
};
```

---

## 📚 Recursos Adicionais

### Documentos Relacionados

- [CONTEXTS.md](./CONTEXTS.md) - Todos os 11 contexts
- [HOOKS.md](./HOOKS.md) - Todos os 26 hooks
- [FLOWS.md](./FLOWS.md) - Fluxos de dados completos
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Arquitetura do sistema

### Links Externos

- [React Hooks](https://react.dev/reference/react)
- [Context API](https://react.dev/reference/react/useContext)
- [useState](https://react.dev/reference/react/useState)
- [useEffect](https://react.dev/reference/react/useEffect)
- [useReducer](https://react.dev/reference/react/useReducer)
- [useMemo](https://react.dev/reference/react/useMemo)
- [useCallback](https://react.dev/reference/react/useCallback)

---

**Última Atualização:** 2025-10-12
**Versão do Sistema:** 2.2.2v-26
**Autor:** Bruno Vilefort
**Status:** ✅ Completo
