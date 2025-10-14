# 🪝 Custom Hooks - ChatIA Flow

Documentação completa de todos os **25 hooks customizados** do sistema.

---

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Hooks de Autenticação](#hooks-de-autenticação)
- [Hooks de Dados](#hooks-de-dados)
- [Hooks de UI](#hooks-de-ui)
- [Hooks Utilitários](#hooks-utilitários)
- [Tabela Completa](#tabela-completa-de-hooks)

---

## Visão Geral

O sistema utiliza **25 custom hooks** para encapsular lógica reutilizável, gerenciar estado e integrar com APIs.

### Categorias

| Categoria | Quantidade | Descrição |
|-----------|------------|-----------|
| 🔐 Autenticação | 1 | Auth, user, timezone |
| 📊 Dados/API | 18 | Tickets, contatos, mensagens, etc |
| 🎨 UI | 2 | Dimensões, localStorage |
| 🛠️ Utilitários | 4 | Data, moeda, versão |

---

## Hooks de Autenticação

### useAuth

**Localização:** `/src/hooks/useAuth.js`

**Descrição:** Hook principal de autenticação. Acessa o `AuthContext`.

**Retorno:**
```typescript
{
  user: User | null,
  isAuth: boolean,
  loading: boolean,
  handleLogin: (userData: LoginData) => Promise<void>,
  handleLogout: () => Promise<void>,
  getCurrentUserInfo: () => Promise<User>,
  socket: Socket | null,
  timezone: Timezone | null
}
```

**Tipos:**
```typescript
interface User {
  id: number;
  name: string;
  email: string;
  profile: "admin" | "user";
  companyId: number;
  company: Company;
  super?: boolean;
  showDashboard?: "enabled" | "disabled";
  allowRealTime?: "enabled" | "disabled";
  allowConnections?: "enabled" | "disabled";
  queues?: Queue[];
  whatsapps?: WhatsApp[];
}

interface LoginData {
  email: string;
  password: string;
}
```

**Exemplo de uso:**
```javascript
import useAuth from "../../hooks/useAuth";

const MyComponent = () => {
  const { user, isAuth, handleLogout } = useAuth();

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

**Funcionalidades:**
- ✅ Login/Logout
- ✅ Verificação de autenticação
- ✅ Refresh de token automático
- ✅ Conexão Socket.IO
- ✅ Carregamento de timezone
- ✅ Verificação de vencimento

**Veja também:** [AuthContext](./CONTEXTS.md#authcontext)

---

## Hooks de Dados

### useTickets

**Localização:** `/src/hooks/useTickets/index.js`

**Descrição:** Gerencia listagem de tickets com paginação e filtros.

**Parâmetros:**
```typescript
interface UseTicketsParams {
  searchParam?: string;
  pageNumber?: number;
  status?: "open" | "pending" | "closed";
  date?: Date;
  showAll?: boolean;
  queueIds?: number[];
  withUnreadMessages?: boolean;
  isNotAssignedUser?: boolean;
  includeNotQueueDefined?: boolean;
}
```

**Retorno:**
```typescript
{
  tickets: Ticket[];
  loading: boolean;
  hasMore: boolean;
  count: number;
}
```

**Exemplo de uso:**
```javascript
import useTickets from "../../hooks/useTickets";

const TicketsList = () => {
  const { tickets, loading, hasMore, count } = useTickets({
    status: "open",
    showAll: false,
    queueIds: [1, 2],
    withUnreadMessages: true
  });

  if (loading) return <Skeleton />;

  return (
    <div>
      <h3>Tickets abertos ({count})</h3>
      {tickets.map(ticket => (
        <TicketListItem key={ticket.id} ticket={ticket} />
      ))}
      {hasMore && <Button onClick={loadMore}>Carregar mais</Button>}
    </div>
  );
};
```

**Sincronização:** Atualiza em tempo real via Socket.IO

---

### useContacts

**Localização:** `/src/hooks/useContacts/index.js`

**Descrição:** Gerencia listagem de contatos com busca e paginação.

**Parâmetros:**
```typescript
interface UseContactsParams {
  searchParam?: string;
  pageNumber?: number;
}
```

**Retorno:**
```typescript
{
  contacts: Contact[];
  loading: boolean;
  hasMore: boolean;
  count: number;
}
```

**Exemplo de uso:**
```javascript
import useContacts from "../../hooks/useContacts";
import { useDebounce } from "use-debounce";

const ContactsPage = () => {
  const [searchParam, setSearchParam] = useState("");
  const [debouncedSearch] = useDebounce(searchParam, 500);

  const { contacts, loading } = useContacts({
    searchParam: debouncedSearch,
    pageNumber: 1
  });

  return (
    <div>
      <TextField
        placeholder="Buscar contato..."
        value={searchParam}
        onChange={(e) => setSearchParam(e.target.value)}
      />
      {contacts.map(contact => (
        <ContactCard key={contact.id} contact={contact} />
      ))}
    </div>
  );
};
```

---

### useMessages

**Localização:** `/src/hooks/useMessages/index.js`

**Descrição:** Gerencia mensagens de um ticket com paginação infinita.

**Parâmetros:**
```typescript
interface UseMessagesParams {
  ticketId: number;
  pageNumber?: number;
}
```

**Retorno:**
```typescript
{
  messages: Message[];
  loading: boolean;
  hasMore: boolean;
  loadMore: () => void;
}
```

**Exemplo de uso:**
```javascript
import useMessages from "../../hooks/useMessages";

const MessagesList = ({ ticketId }) => {
  const { messages, loading, hasMore, loadMore } = useMessages({
    ticketId,
    pageNumber: 1
  });

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div>
      {hasMore && (
        <Button onClick={loadMore}>Carregar mensagens antigas</Button>
      )}
      {messages.map(msg => (
        <MessageBubble key={msg.id} message={msg} />
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
};
```

**Sincronização:** Socket.IO event `company-{id}-appMessage`

---

### useQueues

**Localização:** `/src/hooks/useQueues/index.js`

**Descrição:** Gerencia filas de atendimento.

**Retorno:**
```typescript
{
  queues: Queue[];
  loading: boolean;
  find: (id: number) => Queue | undefined;
}
```

**Exemplo de uso:**
```javascript
import useQueues from "../../hooks/useQueues";

const QueueSelect = () => {
  const { queues, loading } = useQueues();

  if (loading) return <Skeleton />;

  return (
    <Select>
      {queues.map(queue => (
        <MenuItem key={queue.id} value={queue.id}>
          <Chip
            label={queue.name}
            style={{ backgroundColor: queue.color }}
          />
        </MenuItem>
      ))}
    </Select>
  );
};
```

---

### useUsers

**Localização:** `/src/hooks/useUsers/index.js`

**Descrição:** Gerencia usuários da empresa.

**Retorno:**
```typescript
{
  users: User[];
  loading: boolean;
}
```

**Exemplo de uso:**
```javascript
import useUsers from "../../hooks/useUsers";

const UserSelect = () => {
  const { users, loading } = useUsers();

  return (
    <Select>
      {users.map(user => (
        <MenuItem key={user.id} value={user.id}>
          <Avatar src={user.profileImage} />
          {user.name}
        </MenuItem>
      ))}
    </Select>
  );
};
```

---

### useSettings

**Localização:** `/src/hooks/useSettings/index.js`

**Descrição:** Gerencia configurações do sistema.

**Retorno:**
```typescript
{
  settings: Settings[];
  loading: boolean;
  getSettingValue: (key: string) => string | null;
  updateSettings: (settings: Settings[]) => Promise<void>;
}
```

**Configurações principais:**
```javascript
const settingKeys = {
  primaryColorLight: "primaryColorLight",
  primaryColorDark: "primaryColorDark",
  appName: "appName",
  appLogoLight: "appLogoLight",
  appLogoDark: "appLogoDark",
  appFavicon: "appFavicon",
  userCreation: "userCreation", // "enabled" | "disabled"
  // ... mais configurações
};
```

**Exemplo de uso:**
```javascript
import useSettings from "../../hooks/useSettings";

const SettingsPage = () => {
  const { settings, getSettingValue, updateSettings } = useSettings();
  const [appName, setAppName] = useState("");

  useEffect(() => {
    setAppName(getSettingValue("appName") || "ChatIA");
  }, [settings]);

  const handleSave = async () => {
    await updateSettings([
      { key: "appName", value: appName }
    ]);
    toast.success("Configurações salvas!");
  };

  return (
    <div>
      <TextField
        label="Nome do Sistema"
        value={appName}
        onChange={(e) => setAppName(e.target.value)}
      />
      <Button onClick={handleSave}>Salvar</Button>
    </div>
  );
};
```

---

### useQuickMessages

**Localização:** `/src/hooks/useQuickMessages/index.js`

**Descrição:** Gerencia respostas rápidas.

**Retorno:**
```typescript
{
  quickMessages: QuickMessage[];
  loading: boolean;
  find: (shortcut: string) => QuickMessage | undefined;
  search: (query: string) => QuickMessage[];
}
```

**Exemplo de uso:**
```javascript
import useQuickMessages from "../../hooks/useQuickMessages";

const MessageInput = () => {
  const { quickMessages, find } = useQuickMessages();
  const [message, setMessage] = useState("");

  const handleKeyDown = (e) => {
    if (e.key === "/" && message === "") {
      // Abrir autocomplete
      showAutocomplete(quickMessages);
    }
  };

  const selectQuickMessage = (shortcut) => {
    const qm = find(shortcut);
    if (qm) {
      const processedMessage = qm.message
        .replace("{{nome}}", contact.name)
        .replace("{{protocolo}}", ticket.protocol);
      setMessage(processedMessage);
    }
  };

  return (
    <TextField
      value={message}
      onChange={(e) => setMessage(e.target.value)}
      onKeyDown={handleKeyDown}
    />
  );
};
```

---

### useDashboard

**Localização:** `/src/hooks/useDashboard/index.js`

**Descrição:** Gerencia dados do dashboard.

**Parâmetros:**
```typescript
interface UseDashboardParams {
  startDate?: Date;
  endDate?: Date;
  userId?: number;
  queueId?: number;
}
```

**Retorno:**
```typescript
{
  counters: {
    supportHappening: number;
    supportPending: number;
    supportFinished: number;
    newContacts: number;
  };
  attendants: {
    id: number;
    name: string;
    online: number;
    waiting: number;
    finished: number;
  }[];
  loading: boolean;
}
```

**Exemplo de uso:**
```javascript
import useDashboard from "../../hooks/useDashboard";

const Dashboard = () => {
  const [dateRange, setDateRange] = useState({
    startDate: startOfMonth(new Date()),
    endDate: endOfMonth(new Date())
  });

  const { counters, attendants, loading } = useDashboard(dateRange);

  return (
    <div>
      <Grid container spacing={2}>
        <Grid item xs={3}>
          <Card>
            <CardContent>
              <Typography>Em atendimento</Typography>
              <Typography variant="h3">
                {counters.supportHappening}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        {/* ... mais cards */}
      </Grid>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Atendente</TableCell>
            <TableCell>Online</TableCell>
            <TableCell>Aguardando</TableCell>
            <TableCell>Finalizados</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {attendants.map(att => (
            <TableRow key={att.id}>
              <TableCell>{att.name}</TableCell>
              <TableCell>{att.online}</TableCell>
              <TableCell>{att.waiting}</TableCell>
              <TableCell>{att.finished}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
```

---

### useWhatsApps

**Localização:** `/src/hooks/useWhatsApps/index.js`

**Descrição:** Gerencia conexões WhatsApp.

**Retorno:**
```typescript
{
  whatsApps: WhatsApp[];
  loading: boolean;
}
```

**WhatsApp interface:**
```typescript
interface WhatsApp {
  id: number;
  name: string;
  status: "CONNECTED" | "qrcode" | "PAIRING" | "DISCONNECTED" | "TIMEOUT" | "OPENING";
  qrcode?: string;
  phone?: string;
  battery?: number;
  plugged?: boolean;
  isDefault: boolean;
  retries?: number;
}
```

**Exemplo de uso:**
```javascript
import useWhatsApps from "../../hooks/useWhatsApps";

const ConnectionsPage = () => {
  const { whatsApps, loading } = useWhatsApps();

  return (
    <Grid container spacing={2}>
      {whatsApps.map(whatsapp => (
        <Grid item xs={12} md={4} key={whatsapp.id}>
          <Card>
            <CardContent>
              <ConnectionIcon status={whatsapp.status} />
              <Typography>{whatsapp.name}</Typography>
              <Typography variant="caption">
                {whatsapp.phone}
              </Typography>
              {whatsapp.status === "qrcode" && (
                <QRCode value={whatsapp.qrcode} />
              )}
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
};
```

**Sincronização:** Socket.IO event `company-{id}-whatsapp` e `company-{id}-whatsappSession`

---

### useHelps

**Localização:** `/src/hooks/useHelps/index.js`

**Descrição:** Gerencia artigos de ajuda.

**Retorno:**
```typescript
{
  list: () => Promise<Help[]>;
  save: (data: HelpData) => Promise<Help>;
  update: (id: number, data: HelpData) => Promise<Help>;
  remove: (id: number) => Promise<void>;
}
```

**Exemplo de uso:**
```javascript
import useHelps from "../../hooks/useHelps";

const HelpsPage = () => {
  const { list, save, update, remove } = useHelps();
  const [helps, setHelps] = useState([]);

  useEffect(() => {
    loadHelps();
  }, []);

  const loadHelps = async () => {
    const data = await list();
    setHelps(data);
  };

  const handleSave = async (helpData) => {
    if (helpData.id) {
      await update(helpData.id, helpData);
    } else {
      await save(helpData);
    }
    loadHelps();
  };

  return (
    <div>
      <Button onClick={() => setModalOpen(true)}>Novo Artigo</Button>
      {helps.map(help => (
        <HelpCard
          key={help.id}
          help={help}
          onEdit={() => handleEdit(help)}
          onDelete={() => remove(help.id)}
        />
      ))}
    </div>
  );
};
```

---

### usePlans

**Localização:** `/src/hooks/usePlans/index.js`

**Descrição:** Gerencia planos de assinatura.

**Retorno:**
```typescript
{
  list: () => Promise<Plan[]>;
  getPlanCompany: (companyId?: number) => Promise<{ plan: Plan }>;
}
```

**Plan interface:**
```typescript
interface Plan {
  id: number;
  name: string;
  users: number;
  connections: number;
  queues: number;
  amount: number;
  useCampaigns: boolean;
  useKanban: boolean;
  useOpenAi: boolean;
  useIntegrations: boolean;
  useSchedules: boolean;
  useInternalChat: boolean;
  useExternalApi: boolean;
}
```

**Exemplo de uso:**
```javascript
import usePlans from "../../hooks/usePlans";

const SubscriptionPage = () => {
  const { list, getPlanCompany } = usePlans();
  const [plans, setPlans] = useState([]);
  const [currentPlan, setCurrentPlan] = useState(null);

  useEffect(() => {
    loadPlans();
    loadCurrentPlan();
  }, []);

  const loadPlans = async () => {
    const data = await list();
    setPlans(data);
  };

  const loadCurrentPlan = async () => {
    const { plan } = await getPlanCompany();
    setCurrentPlan(plan);
  };

  return (
    <div>
      <h2>Plano Atual: {currentPlan?.name}</h2>
      <h3>Disponíveis para Upgrade:</h3>
      <Grid container spacing={2}>
        {plans.map(plan => (
          <Grid item xs={12} md={4} key={plan.id}>
            <PlanCard
              plan={plan}
              current={plan.id === currentPlan?.id}
            />
          </Grid>
        ))}
      </Grid>
    </div>
  );
};
```

---

### useCompanies

**Localização:** `/src/hooks/useCompanies/index.js`

**Descrição:** Gerencia empresas (super admin).

**Retorno:**
```typescript
{
  list: () => Promise<Company[]>;
  save: (data: CompanyData) => Promise<Company>;
  update: (id: number, data: CompanyData) => Promise<Company>;
  remove: (id: number) => Promise<void>;
  findById: (id: number) => Promise<Company>;
}
```

**Exemplo de uso:**
```javascript
import useCompanies from "../../hooks/useCompanies";

const CompaniesPage = () => {
  const { list, save, update, remove } = useCompanies();
  const [companies, setCompanies] = useState([]);

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    const data = await list();
    setCompanies(data);
  };

  return (
    <Table>
      <TableBody>
        {companies.map(company => (
          <TableRow key={company.id}>
            <TableCell>{company.name}</TableCell>
            <TableCell>{company.email}</TableCell>
            <TableCell>{company.plan.name}</TableCell>
            <TableCell>
              {format(new Date(company.dueDate), "dd/MM/yyyy")}
            </TableCell>
            <TableCell>
              <IconButton onClick={() => handleEdit(company)}>
                <EditIcon />
              </IconButton>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
```

---

### useContactLists

**Localização:** `/src/hooks/useContactLists/index.js`

**Descrição:** Gerencia listas de contatos para campanhas.

**Retorno:**
```typescript
{
  list: (params?: { searchParam?: string }) => Promise<ContactList[]>;
  save: (data: ContactListData) => Promise<ContactList>;
  update: (id: number, data: ContactListData) => Promise<ContactList>;
  remove: (id: number) => Promise<void>;
}
```

**Exemplo de uso:**
```javascript
import useContactLists from "../../hooks/useContactLists";

const ContactListsPage = () => {
  const { list, save, update, remove } = useContactLists();
  const [contactLists, setContactLists] = useState([]);

  useEffect(() => {
    loadLists();
  }, []);

  const loadLists = async () => {
    const data = await list();
    setContactLists(data);
  };

  const handleCreate = async (name) => {
    await save({ name });
    loadLists();
    toast.success("Lista criada!");
  };

  return (
    <div>
      <Button onClick={() => setModalOpen(true)}>Nova Lista</Button>
      {contactLists.map(list => (
        <Card key={list.id}>
          <CardContent>
            <Typography variant="h6">{list.name}</Typography>
            <Typography variant="caption">
              {list.contactsCount} contatos
            </Typography>
            <Button onClick={() => navigate(`/contact-lists/${list.id}/contacts`)}>
              Gerenciar
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};
```

---

### useContactListItems

**Localização:** `/src/hooks/useContactListItems/index.js`

**Descrição:** Gerencia contatos de uma lista específica.

**Retorno:**
```typescript
{
  list: (contactListId: number, params?: { searchParam?: string }) => Promise<ContactListItem[]>;
  save: (contactListId: number, data: ContactListItemData) => Promise<ContactListItem>;
  update: (contactListItemId: number, data: ContactListItemData) => Promise<ContactListItem>;
  remove: (contactListItemId: number) => Promise<void>;
}
```

---

### useQueueIntegrations

**Localização:** `/src/hooks/useQueueIntegrations/index.js`

**Descrição:** Gerencia integrações de filas.

**Retorno:**
```typescript
{
  list: () => Promise<QueueIntegration[]>;
  save: (data: QueueIntegrationData) => Promise<QueueIntegration>;
  update: (id: number, data: QueueIntegrationData) => Promise<QueueIntegration>;
  remove: (id: number) => Promise<void>;
}
```

**Tipos de integração:**
- `dialogflow`
- `n8n`
- `webhook`
- `openai`
- `typebot`

---

### useTicketNotes

**Localização:** `/src/hooks/useTicketNotes/index.js`

**Descrição:** Gerencia notas de tickets.

**Retorno:**
```typescript
{
  list: (ticketId: number) => Promise<TicketNote[]>;
  save: (ticketId: number, note: string) => Promise<TicketNote>;
  remove: (noteId: number) => Promise<void>;
}
```

---

### useInvoices

**Localização:** `/src/hooks/useInvoices/index.js`

**Descrição:** Gerencia faturas e pagamentos.

**Retorno:**
```typescript
{
  list: () => Promise<Invoice[]>;
  findById: (id: number) => Promise<Invoice>;
  downloadPdf: (id: number) => Promise<Blob>;
}
```

**Exemplo de uso:**
```javascript
import useInvoices from "../../hooks/useInvoices";

const FinanceiroPage = () => {
  const { list, downloadPdf } = useInvoices();
  const [invoices, setInvoices] = useState([]);

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    const data = await list();
    setInvoices(data);
  };

  const handleDownload = async (invoiceId) => {
    const blob = await downloadPdf(invoiceId);
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `fatura-${invoiceId}.pdf`;
    link.click();
  };

  return (
    <Table>
      <TableBody>
        {invoices.map(invoice => (
          <TableRow key={invoice.id}>
            <TableCell>{invoice.period}</TableCell>
            <TableCell>{invoice.amount}</TableCell>
            <TableCell>{invoice.status}</TableCell>
            <TableCell>
              <IconButton onClick={() => handleDownload(invoice.id)}>
                <DownloadIcon />
              </IconButton>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
```

---

### useUser

**Localização:** `/src/hooks/useUser/index.js`

**Descrição:** Gerencia perfil do usuário logado.

**Retorno:**
```typescript
{
  user: User | null;
  loading: boolean;
  updateProfile: (data: Partial<User>) => Promise<void>;
}
```

**Exemplo de uso:**
```javascript
import useUser from "../../hooks/useUser";

const ProfilePage = () => {
  const { user, updateProfile } = useUser();
  const [name, setName] = useState(user?.name || "");

  const handleSave = async () => {
    await updateProfile({ name });
    toast.success("Perfil atualizado!");
  };

  return (
    <div>
      <TextField
        label="Nome"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />
      <Button onClick={handleSave}>Salvar</Button>
    </div>
  );
};
```

---

### useUserMoments

**Localização:** `/src/hooks/useUserMoments/index.js`

**Descrição:** Gerencia "momentos" ou status do usuário.

**Retorno:**
```typescript
{
  moments: UserMoment[];
  currentMoment: UserMoment | null;
  setMoment: (momentId: number) => Promise<void>;
}
```

**Momentos exemplo:**
- 🟢 Disponível
- 🟡 Ausente
- 🔴 Ocupado
- ⚫ Invisível

---

### useVersion

**Localização:** `/src/hooks/useVersion/index.js`

**Descrição:** Obtém versão do sistema.

**Retorno:**
```typescript
{
  version: string;
  loading: boolean;
}
```

**Exemplo de uso:**
```javascript
import useVersion from "../../hooks/useVersion";

const Footer = () => {
  const { version } = useVersion();

  return (
    <footer>
      <Typography variant="caption">
        ChatIA Flow v{version}
      </Typography>
    </footer>
  );
};
```

---

## Hooks de UI

### useLocalStorage

**Localização:** `/src/hooks/useLocalStorage/index.js`

**Descrição:** Hook para gerenciar localStorage com React state.

**Assinatura:**
```typescript
function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((val: T) => T)) => void]
```

**Exemplo de uso:**
```javascript
import useLocalStorage from "../../hooks/useLocalStorage";

const MyComponent = () => {
  const [theme, setTheme] = useLocalStorage("theme", "light");

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <Button onClick={toggleTheme}>
      Tema: {theme}
    </Button>
  );
};
```

**Funcionalidades:**
- ✅ Sincroniza com localStorage
- ✅ Aceita função updater
- ✅ Tipo seguro (com TypeScript)
- ✅ Serialização automática (JSON)

---

### useWindowDimensions

**Localização:** `/src/hooks/useWindowDimensions/index.js`

**Descrição:** Obtém dimensões da janela e atualiza em resize.

**Retorno:**
```typescript
{
  width: number;
  height: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
}
```

**Exemplo de uso:**
```javascript
import useWindowDimensions from "../../hooks/useWindowDimensions";

const ResponsiveComponent = () => {
  const { isMobile, isDesktop, width } = useWindowDimensions();

  if (isMobile) {
    return <MobileLayout />;
  }

  if (isDesktop) {
    return <DesktopLayout />;
  }

  return <TabletLayout />;
};
```

**Breakpoints:**
```javascript
{
  isMobile: width < 768,
  isTablet: width >= 768 && width < 1024,
  isDesktop: width >= 1024
}
```

---

## Hooks Utilitários

### useDate

**Localização:** `/src/hooks/useDate/index.js`

**Descrição:** Formatação de datas com timezone da empresa.

**Retorno:**
```typescript
{
  timezone: Timezone;
  datetimeToClient: (datetime: Date | string) => Date;
  dateToClient: (date: Date | string) => string;
  dateToTimezone: (date: Date | string) => string;
}
```

**Exemplo de uso:**
```javascript
import useDate from "../../hooks/useDate";

const MessageItem = ({ message }) => {
  const { datetimeToClient } = useDate();

  const messageDate = datetimeToClient(message.createdAt);

  return (
    <div>
      <Typography>{message.body}</Typography>
      <Typography variant="caption">
        {format(messageDate, "HH:mm")}
      </Typography>
    </div>
  );
};
```

**Funcionalidades:**
- ✅ Converte UTC para timezone da empresa
- ✅ Formatação consistente
- ✅ Suporte a moment-timezone

---

### useTimezone

**Localização:** `/src/hooks/useTimezone.js`

**Descrição:** Acessa informações de timezone.

**Retorno:**
```typescript
{
  timezone: {
    id: number;
    name: string;
    offset: string;
  } | null;
}
```

**Exemplo de uso:**
```javascript
import useTimezone from "../../hooks/useTimezone";

const TimezoneDisplay = () => {
  const { timezone } = useTimezone();

  return (
    <div>
      <Typography>
        Timezone: {timezone?.name} ({timezone?.offset})
      </Typography>
    </div>
  );
};
```

---

### useCurrency

**Localização:** `/src/hooks/useCurrency/index.js`

**Descrição:** Acessa o `CurrencyContext` para formatação de moeda.

**Retorno:**
```typescript
{
  currency: string; // "BRL", "USD", etc
  format: (value: number) => string;
}
```

**Exemplo de uso:**
```javascript
import useCurrency from "../../hooks/useCurrency";

const PriceDisplay = ({ value }) => {
  const { format } = useCurrency();

  return (
    <Typography variant="h4">
      {format(value)}
    </Typography>
  );
};

// Resultado: R$ 297,00 (se currency = "BRL")
```

---

## Tabela Completa de Hooks

| # | Hook | Categoria | Descrição Resumida |
|---|------|-----------|-------------------|
| 1 | useAuth | 🔐 Auth | Autenticação e usuário logado |
| 2 | useTickets | 📊 Dados | Lista de tickets com filtros |
| 3 | useContacts | 📊 Dados | Lista de contatos |
| 4 | useMessages | 📊 Dados | Mensagens de um ticket |
| 5 | useQueues | 📊 Dados | Filas de atendimento |
| 6 | useUsers | 📊 Dados | Usuários da empresa |
| 7 | useSettings | 📊 Dados | Configurações do sistema |
| 8 | useQuickMessages | 📊 Dados | Respostas rápidas |
| 9 | useDashboard | 📊 Dados | Dados do dashboard |
| 10 | useWhatsApps | 📊 Dados | Conexões WhatsApp |
| 11 | useHelps | 📊 Dados | Artigos de ajuda |
| 12 | usePlans | 📊 Dados | Planos de assinatura |
| 13 | useCompanies | 📊 Dados | Empresas (super admin) |
| 14 | useContactLists | 📊 Dados | Listas de contatos |
| 15 | useContactListItems | 📊 Dados | Itens de lista de contatos |
| 16 | useQueueIntegrations | 📊 Dados | Integrações de filas |
| 17 | useTicketNotes | 📊 Dados | Notas de tickets |
| 18 | useInvoices | 📊 Dados | Faturas e pagamentos |
| 19 | useUser | 📊 Dados | Perfil do usuário |
| 20 | useUserMoments | 📊 Dados | Status/momentos do usuário |
| 21 | useVersion | 🛠️ Util | Versão do sistema |
| 22 | useLocalStorage | 🎨 UI | localStorage com state |
| 23 | useWindowDimensions | 🎨 UI | Dimensões da janela |
| 24 | useDate | 🛠️ Util | Formatação de data com timezone |
| 25 | useTimezone | 🛠️ Util | Informações de timezone |
| 26 | useCurrency | 🛠️ Util | Formatação de moeda |

---

## Padrões de Criação

### Template de Custom Hook

```javascript
// /src/hooks/useMeuHook/index.js
import { useState, useEffect } from "react";
import api from "../../services/api";
import toastError from "../../errors/toastError";

const useMeuHook = (params) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, [params]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/meu-endpoint", { params });
      setData(data);
    } catch (err) {
      toastError(err);
    } finally {
      setLoading(false);
    }
  };

  const create = async (newData) => {
    try {
      const { data: created } = await api.post("/meu-endpoint", newData);
      setData([...data, created]);
      return created;
    } catch (err) {
      toastError(err);
    }
  };

  const update = async (id, updatedData) => {
    try {
      const { data: updated } = await api.put(`/meu-endpoint/${id}`, updatedData);
      setData(data.map(item => item.id === id ? updated : item));
      return updated;
    } catch (err) {
      toastError(err);
    }
  };

  const remove = async (id) => {
    try {
      await api.delete(`/meu-endpoint/${id}`);
      setData(data.filter(item => item.id !== id));
    } catch (err) {
      toastError(err);
    }
  };

  return {
    data,
    loading,
    create,
    update,
    remove,
    refetch: fetchData
  };
};

export default useMeuHook;
```

### Boas Práticas

1. **Sempre use try/catch:**
   ```javascript
   try {
     const response = await api.get("/endpoint");
   } catch (err) {
     toastError(err);
   }
   ```

2. **Sempre use `toastError` para erros:**
   ```javascript
   import toastError from "../../errors/toastError";
   // ...
   toastError(err);
   ```

3. **Loading states:**
   ```javascript
   const [loading, setLoading] = useState(false);

   const fetchData = async () => {
     setLoading(true);
     try {
       // ...
     } finally {
       setLoading(false);
     }
   };
   ```

4. **Cancelar requisições no unmount:**
   ```javascript
   useEffect(() => {
     const source = axios.CancelToken.source();

     const fetchData = async () => {
       try {
         const { data } = await api.get("/endpoint", {
           cancelToken: source.token
         });
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

5. **Retornar objeto com métodos e dados:**
   ```javascript
   return {
     data,
     loading,
     hasMore,
     create,
     update,
     remove,
     refetch
   };
   ```

---

## Veja Também

- [CONTEXTS.md](./CONTEXTS.md) - Contexts React
- [STATE-MANAGEMENT.md](./STATE-MANAGEMENT.md) - Gerenciamento de estado
- [API.md](./API.md) - APIs e serviços
- [DEVELOPMENT.md](./DEVELOPMENT.md) - Guia de desenvolvimento

---

**Total de Hooks:** 26
**Última Atualização:** 2025-10-12
**Versão do Documento:** 1.0.0
