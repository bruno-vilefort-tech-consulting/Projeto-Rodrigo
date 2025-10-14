# 🔐 Sistema de Permissões (RBAC) - ChatIA Flow

> Role-Based Access Control para controle granular de acesso

**Localização:** `/frontend/src/rules.js` + `/components/Can/`
**Versão do Sistema:** 2.2.2v-26

---

## 📑 Índice

1. [Visão Geral](#visão-geral)
2. [Roles (Perfis)](#roles-perfis)
3. [Permissões](#permissões)
4. [Componente Can](#componente-can)
5. [Implementação](#implementação)
6. [Exemplos Práticos](#exemplos-práticos)

---

## 🎯 Visão Geral

### O que é RBAC?

**Role-Based Access Control (RBAC)** é um sistema de controle de acesso baseado em **perfis/papéis** (roles). Usuários recebem roles, e cada role tem permissões específicas.

### Arquitetura do Sistema

```
User
  ├─ profile: "user" | "admin"
  └─ AuthContext fornece role
       ↓
<Can role={user.profile} perform="action:permission">
  ├─ rules.js define permissões por role
  ├─ check() verifica se role tem permissão
  └─ Renderiza yes() ou no()
```

### Características

✅ **2 Roles** - user (padrão) e admin (completo)
✅ **10 Permissões Admin** - Controle granular
✅ **Componente Can** - Render condicional baseado em permissão
✅ **Static Permissions** - Permissões fixas por role
✅ **Integração Context** - Usa AuthContext.user.profile

---

## 👥 Roles (Perfis)

### 1. User (Atendente)

**Perfil:** `"user"`

**Acesso:**
- ✅ Dashboard (visualização básica)
- ✅ Tickets (apenas seus tickets)
- ✅ Contatos (visualizar e editar)
- ✅ Mensagens (enviar/receber)
- ✅ Filas (apenas as suas)
- ❌ Configurações do sistema
- ❌ Gerenciar usuários
- ❌ Deletar tickets/contatos
- ❌ Conexões WhatsApp
- ❌ Campanhas
- ❌ Flow Builder

**Código:**
```javascript
const rules = {
  user: {
    static: []  // Sem permissões especiais
  }
};
```

---

### 2. Admin (Administrador)

**Perfil:** `"admin"`

**Acesso:**
- ✅ **Tudo que User tem**
- ✅ Dashboard completo
- ✅ Todos os tickets (ver, editar, deletar)
- ✅ Gerenciar usuários
- ✅ Gerenciar filas
- ✅ Gerenciar tags
- ✅ Configurações do sistema
- ✅ Conexões WhatsApp
- ✅ Campanhas
- ✅ Flow Builder
- ✅ Relatórios
- ✅ Integrações

**Código:**
```javascript
const rules = {
  admin: {
    static: [
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
    ]
  }
};
```

---

## 🔑 Permissões

### Lista Completa de Permissões

| Permissão | Descrição | Onde é Usado |
|-----------|-----------|--------------|
| **dashboard:view** | Ver dashboard completo | Dashboard principal |
| **drawer-admin-items:view** | Ver itens admin no menu | MainListItems (menu lateral) |
| **tickets-manager:showall** | Ver todos os tickets | TicketsManager |
| **user-modal:editProfile** | Editar perfil de outros usuários | UserModal |
| **user-modal:editQueues** | Editar filas de outros usuários | UserModal |
| **ticket-options:deleteTicket** | Deletar tickets | TicketOptionsMenu |
| **contacts-page:deleteContact** | Deletar contatos | Contacts page |
| **connections-page:actionButtons** | Botões de ação em conexões | Connections page |
| **connections-page:addConnection** | Adicionar nova conexão WhatsApp | Connections page |
| **connections-page:editOrDeleteConnection** | Editar/deletar conexões | Connections page |
| **tickets-manager:closeAll** | Fechar todos tickets de uma vez | TicketsManager |

---

## 🧩 Componente Can

### Arquivo

**Localização:** `/frontend/src/components/Can/index.js`

### Código Completo

```javascript
import rules from "../../rules";

const check = (role, action, data) => {
  const permissions = rules[role];

  if (!permissions) {
    // role is not present in the rules
    return false;
  }

  const staticPermissions = permissions.static;

  if (staticPermissions && staticPermissions.includes(action)) {
    // static rule not provided for action
    return true;
  }

  const dynamicPermissions = permissions.dynamic;

  if (dynamicPermissions) {
    const permissionCondition = dynamicPermissions[action];
    if (!permissionCondition) {
      // dynamic rule not provided for action
      return false;
    }

    return permissionCondition(data);
  }
  return false;
};

const Can = ({ role, perform, data, yes, no }) =>
  check(role, perform, data) ? yes() : no();

Can.defaultProps = {
  yes: () => null,
  no: () => null,
  data: null,
};

export { Can };
```

### Props

| Prop | Tipo | Obrigatório | Descrição |
|------|------|-------------|-----------|
| **role** | `string` | ✅ | Perfil do usuário (`"user"` ou `"admin"`) |
| **perform** | `string` | ✅ | Permissão a verificar (ex: `"dashboard:view"`) |
| **data** | `any` | ❌ | Dados para permissões dinâmicas |
| **yes** | `function` | ❌ | Componente a renderizar se tiver permissão |
| **no** | `function` | ❌ | Componente a renderizar se não tiver permissão |

### Funcionamento

```
<Can role="admin" perform="dashboard:view">
  ↓
check("admin", "dashboard:view")
  ↓
rules.admin.static.includes("dashboard:view")
  ↓
true → renderiza yes()
false → renderiza no()
```

---

## 💻 Implementação

### 1. Uso Básico

```javascript
import { useContext } from "react";
import { AuthContext } from "../../context/Auth/AuthContext";
import { Can } from "../../components/Can";

const MyComponent = () => {
  const { user } = useContext(AuthContext);

  return (
    <div>
      <Can
        role={user.profile}
        perform="dashboard:view"
        yes={() => <FullDashboard />}
        no={() => <BasicDashboard />}
      />
    </div>
  );
};
```

### 2. Mostrar/Ocultar Botões

```javascript
<Can
  role={user.profile}
  perform="ticket-options:deleteTicket"
  yes={() => (
    <IconButton onClick={handleDelete}>
      <DeleteIcon />
    </IconButton>
  )}
/>
```

### 3. Menu Lateral Condicional

```javascript
// MainListItems.js
const MainListItems = () => {
  const { user } = useContext(AuthContext);

  return (
    <List>
      {/* Visível para todos */}
      <ListItem button component={Link} to="/">
        <ListItemIcon><DashboardIcon /></ListItemIcon>
        <ListItemText primary="Dashboard" />
      </ListItem>

      {/* Apenas para Admin */}
      <Can
        role={user.profile}
        perform="drawer-admin-items:view"
        yes={() => (
          <>
            <ListItem button component={Link} to="/users">
              <ListItemIcon><PeopleIcon /></ListItemIcon>
              <ListItemText primary="Usuários" />
            </ListItem>

            <ListItem button component={Link} to="/connections">
              <ListItemIcon><WhatsAppIcon /></ListItemIcon>
              <ListItemText primary="Conexões" />
            </ListItem>

            <ListItem button component={Link} to="/settings">
              <ListItemIcon><SettingsIcon /></ListItemIcon>
              <ListItemText primary="Configurações" />
            </ListItem>
          </>
        )}
      />
    </List>
  );
};
```

### 4. Página Protegida

```javascript
const Users = () => {
  const { user } = useContext(AuthContext);

  return (
    <MainContainer>
      <Can
        role={user.profile}
        perform="drawer-admin-items:view"
        yes={() => (
          <>
            <MainHeader>
              <Title>Usuários</Title>
              <Button onClick={handleAddUser}>+ Novo Usuário</Button>
            </MainHeader>
            <UsersList />
          </>
        )}
        no={() => (
          <ForbiddenPage />
        )}
      />
    </MainContainer>
  );
};
```

### 5. Botão de Ação Condicional

```javascript
const TicketOptionsMenu = ({ ticket }) => {
  const { user } = useContext(AuthContext);

  return (
    <Menu>
      <MenuItem onClick={handleEdit}>Editar</MenuItem>
      <MenuItem onClick={handleTransfer}>Transferir</MenuItem>

      <Can
        role={user.profile}
        perform="ticket-options:deleteTicket"
        yes={() => (
          <MenuItem onClick={handleDelete}>
            <DeleteIcon /> Deletar
          </MenuItem>
        )}
      />
    </Menu>
  );
};
```

---

## 📋 Exemplos Práticos

### Exemplo 1: Dashboard Dinâmico

**Cenário:** Mostrar métricas diferentes para User e Admin

```javascript
const Dashboard = () => {
  const { user } = useContext(AuthContext);

  return (
    <MainContainer>
      <MainHeader>
        <Title>Dashboard</Title>
      </MainHeader>

      <Grid container spacing={2}>
        {/* Métricas Básicas - Todos */}
        <Grid item xs={12} md={3}>
          <CardCounter
            title="Meus Tickets"
            value={myTicketsCount}
          />
        </Grid>

        <Grid item xs={12} md={3}>
          <CardCounter
            title="Tickets Abertos"
            value={openTicketsCount}
          />
        </Grid>

        {/* Métricas Avançadas - Apenas Admin */}
        <Can
          role={user.profile}
          perform="dashboard:view"
          yes={() => (
            <>
              <Grid item xs={12} md={3}>
                <CardCounter
                  title="Total Tickets (Todos)"
                  value={allTicketsCount}
                />
              </Grid>

              <Grid item xs={12} md={3}>
                <CardCounter
                  title="Tickets por Atendente"
                  value={ticketsByUser}
                />
              </Grid>

              <Grid item xs={12}>
                <PerformanceChart />
              </Grid>

              <Grid item xs={12}>
                <NpsChart />
              </Grid>
            </>
          )}
        />
      </Grid>
    </MainContainer>
  );
};
```

---

### Exemplo 2: Contatos com Permissões

```javascript
const Contacts = () => {
  const { user } = useContext(AuthContext);

  return (
    <MainContainer>
      <MainHeader>
        <Title>Contatos</Title>
        <Button onClick={handleAddContact}>+ Novo Contato</Button>
      </MainHeader>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Nome</TableCell>
            <TableCell>Telefone</TableCell>
            <TableCell>Email</TableCell>
            <TableCell>Ações</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {contacts.map(contact => (
            <TableRow key={contact.id}>
              <TableCell>{contact.name}</TableCell>
              <TableCell>{contact.number}</TableCell>
              <TableCell>{contact.email}</TableCell>
              <TableCell>
                <IconButton onClick={() => handleEdit(contact)}>
                  <EditIcon />
                </IconButton>

                <Can
                  role={user.profile}
                  perform="contacts-page:deleteContact"
                  yes={() => (
                    <IconButton onClick={() => handleDelete(contact.id)}>
                      <DeleteIcon />
                    </IconButton>
                  )}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </MainContainer>
  );
};
```

---

### Exemplo 3: Conexões WhatsApp

```javascript
const Connections = () => {
  const { user } = useContext(AuthContext);

  // Redirecionar se não for admin
  useEffect(() => {
    if (user.profile !== "admin") {
      toast.error("Sem permissão");
      history.push("/");
    }
  }, [user.profile]);

  return (
    <MainContainer>
      <Can
        role={user.profile}
        perform="connections-page:actionButtons"
        yes={() => (
          <>
            <MainHeader>
              <Title>Conexões WhatsApp</Title>
              <Can
                role={user.profile}
                perform="connections-page:addConnection"
                yes={() => (
                  <Button onClick={handleAddConnection}>
                    + Nova Conexão
                  </Button>
                )}
              />
            </MainHeader>

            <Table>
              {connections.map(conn => (
                <TableRow key={conn.id}>
                  <TableCell>{conn.name}</TableCell>
                  <TableCell>{conn.status}</TableCell>
                  <TableCell>
                    <Can
                      role={user.profile}
                      perform="connections-page:editOrDeleteConnection"
                      yes={() => (
                        <>
                          <IconButton onClick={() => handleEdit(conn)}>
                            <EditIcon />
                          </IconButton>
                          <IconButton onClick={() => handleDelete(conn.id)}>
                            <DeleteIcon />
                          </IconButton>
                        </>
                      )}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </Table>
          </>
        )}
        no={() => <ForbiddenPage />}
      />
    </MainContainer>
  );
};
```

---

### Exemplo 4: UserModal com Permissões

```javascript
const UserModal = ({ userId, open, onClose }) => {
  const { user: currentUser } = useContext(AuthContext);
  const [user, setUser] = useState({});

  const isSelf = currentUser.id === userId;
  const canEditOthers = currentUser.profile === "admin";

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>
        {isSelf ? "Meu Perfil" : "Editar Usuário"}
      </DialogTitle>
      <DialogContent>
        <TextField
          label="Nome"
          value={user.name}
          onChange={e => setUser({ ...user, name: e.target.value })}
          disabled={!isSelf && !canEditOthers}
        />

        <TextField
          label="Email"
          value={user.email}
          onChange={e => setUser({ ...user, email: e.target.value })}
          disabled={!isSelf && !canEditOthers}
        />

        {/* Apenas Admin pode editar perfil */}
        <Can
          role={currentUser.profile}
          perform="user-modal:editProfile"
          yes={() => (
            <FormControl>
              <InputLabel>Perfil</InputLabel>
              <Select
                value={user.profile}
                onChange={e => setUser({ ...user, profile: e.target.value })}
              >
                <MenuItem value="user">Atendente</MenuItem>
                <MenuItem value="admin">Administrador</MenuItem>
              </Select>
            </FormControl>
          )}
        />

        {/* Apenas Admin pode editar filas */}
        <Can
          role={currentUser.profile}
          perform="user-modal:editQueues"
          yes={() => (
            <QueueSelect
              selectedQueues={user.queues}
              onChange={queues => setUser({ ...user, queues })}
            />
          )}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancelar</Button>
        <Button onClick={handleSave}>Salvar</Button>
      </DialogActions>
    </Dialog>
  );
};
```

---

## 🔧 Estender o Sistema

### Adicionar Nova Permissão

**1. Adicionar em `rules.js`:**
```javascript
const rules = {
  admin: {
    static: [
      // ... permissões existentes
      "reports:view",         // Nova permissão
      "campaigns:create"      // Nova permissão
    ]
  }
};
```

**2. Usar no componente:**
```javascript
<Can
  role={user.profile}
  perform="reports:view"
  yes={() => <ReportsPage />}
  no={() => <ForbiddenPage />}
/>
```

### Adicionar Novo Role

**1. Adicionar em `rules.js`:**
```javascript
const rules = {
  user: { static: [] },
  admin: { static: [...] },

  supervisor: {  // Novo role
    static: [
      "dashboard:view",
      "tickets-manager:showall",
      "reports:view"
    ]
  }
};
```

**2. Backend deve retornar profile:**
```json
{
  "user": {
    "id": 1,
    "name": "João",
    "profile": "supervisor"
  }
}
```

### Permissões Dinâmicas

**1. Adicionar regra dinâmica:**
```javascript
const rules = {
  admin: {
    static: [...],

    dynamic: {
      "ticket:edit": (data) => {
        // Pode editar se é admin OU se é o próprio ticket
        return data.userId === data.currentUserId;
      },

      "ticket:transfer": (data) => {
        // Pode transferir apenas tickets das suas filas
        return data.userQueues.includes(data.ticket.queueId);
      }
    }
  }
};
```

**2. Usar com data:**
```javascript
<Can
  role={user.profile}
  perform="ticket:edit"
  data={{ userId: ticket.userId, currentUserId: user.id }}
  yes={() => <EditButton />}
/>
```

---

## 📚 Recursos Adicionais

### Documentos Relacionados

- [CONTEXTS.md](./CONTEXTS.md) - AuthContext
- [COMPONENTS.md](./COMPONENTS.md) - Componente Can
- [PAGES.md](./PAGES.md) - Páginas protegidas
- [ARCHITECTURE.md](./ARCHITECTURE.md) - Arquitetura geral

### Referências

- [RBAC Wikipedia](https://en.wikipedia.org/wiki/Role-based_access_control)
- [React Context API](https://react.dev/reference/react/useContext)

---

## 📊 Resumo

| Aspecto | Valor |
|---------|-------|
| **Roles** | 2 (user, admin) |
| **Permissões** | 10 permissões admin |
| **Componente** | `<Can />` |
| **Localização** | `rules.js` + `components/Can/` |
| **Tipo** | Static permissions |
| **Extensível** | ✅ Sim (adicionar roles/permissões) |

---

**Última Atualização:** 2025-10-12
**Versão do Sistema:** 2.2.2v-26
**Autor:** Bruno Vilefort
**Status:** ✅ Completo
