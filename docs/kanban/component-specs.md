# Especifica\u00e7\u00e3o de Componentes - Kanban V2

**Vers\u00e3o:** 1.0
**Data:** 2025-10-13
**Refer\u00eancia:** `/Users/brunovilefort/Desktop/chatia-final/chatia/chatia/frontend/src/pages/Kanban/index.js`

---

## 1. Kanban Page (Principal)

**Localiza\u00e7\u00e3o:** `frontend/src/pages/Kanban/index.js`

**Descri\u00e7\u00e3o:** P\u00e1gina principal do Kanban V2 com drag-and-drop usando react-trello.

### Props Interface
```typescript
// Nenhuma prop (p\u00e1gina top-level)
```

### State Management
```typescript
const [tags, setTags] = useState<Tag[]>([]);
const [tickets, setTickets] = useState<Ticket[]>([]);
const [file, setFile] = useState<BoardData>({ lanes: [] });
const [startDate, setStartDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
const [endDate, setEndDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
const [loading, setLoading] = useState<boolean>(true);
```

### Hooks Utilizados
```javascript
const { user, socket } = useContext(AuthContext);
const { tags, loading: tagsLoading, refetch: refetchTags } = useKanbanTags();
const { tickets, loading: ticketsLoading, refetch: refetchTickets } = useKanbanTickets(queueIds, startDate, endDate);
const { moveTicket, loading: moveLoading } = useMoveTicket();
useSocketKanban(socket, user.companyId, refetchTickets);
```

### Event Handlers
```javascript
handleStartDateChange(event): void
handleEndDateChange(event): void
handleSearchClick(): void
handleCardClick(uuid): void
handleCardMove(cardId, sourceLaneId, targetLaneId): Promise<void>
handleAddConnectionClick(): void
```

### Fun\u00e7\u00f5es Internas

#### popularCards()
**Prop\u00f3sito:** Transforma arrays de tags e tickets na estrutura Board do react-trello.

**Algoritmo:**
1. Filtrar tickets sem tag → Lane 0
2. Para cada tag, filtrar tickets com essa tag → Lane N
3. Transformar cada ticket em Card (com title, description, draggable)
4. Retornar estrutura `{ lanes: [...] }`

**Exemplo de Sa\u00edda:**
```javascript
{
  lanes: [
    {
      id: "lane0",
      title: "Sem Etiqueta",
      label: "5", // contador
      cards: [
        {
          id: "42",
          label: "Ticket #42",
          title: <><WhatsAppIcon /> Jo\u00e3o Silva</>,
          description: <div>...</div>,
          draggable: true,
          href: "/tickets/uuid-42"
        }
      ]
    },
    {
      id: "1", // tagId
      title: "Aguardando",
      label: "3",
      style: { backgroundColor: "#FF6B6B", color: "white" },
      cards: [...]
    }
  ]
}
```

#### IconChannel(channel)
**Prop\u00f3sito:** Retorna \u00edcone correspondente ao canal de comunica\u00e7\u00e3o.

**Mapeamento:**
- `"whatsapp"` → `<WhatsApp style={{ color: "#25d366" }} />`
- `"facebook"` → `<Facebook style={{ color: "#3b5998" }} />`
- `"instagram"` → `<Instagram style={{ color: "#e1306c" }} />`
- `default` → `i18n.t("kanban.iconChannelError")`

### Estrutura JSX
```jsx
<div className={classes.root}>
  {/* Filtros de Data */}
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <TextField label="Data In\u00edcio" type="date" value={startDate} onChange={handleStartDateChange} />
      <TextField label="Data Fim" type="date" value={endDate} onChange={handleEndDateChange} />
      <Button onClick={handleSearchClick}>Buscar</Button>
    </div>
    <Can role={user.profile} perform="dashboard:view">
      <Button onClick={handleAddConnectionClick}>Adicionar Colunas</Button>
    </Can>
  </div>

  {/* Board React-Trello */}
  <div className={classes.kanbanContainer}>
    <Board
      data={file}
      onCardMoveAcrossLanes={handleCardMove}
      style={{ backgroundColor: 'rgba(252, 252, 252, 0.03)' }}
    />
  </div>
</div>
```

### Estilos (Material-UI v4)
```javascript
const useStyles = makeStyles(theme => ({
  root: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: theme.spacing(1),
  },
  kanbanContainer: {
    width: "100%",
    maxWidth: "1200px",
    margin: "0 auto",
  },
  connectionTag: {
    background: "green",
    color: "#FFF",
    marginRight: 1,
    padding: 1,
    fontWeight: 'bold',
    borderRadius: 3,
    fontSize: "0.6em",
  },
  lastMessageTime: {
    justifySelf: "flex-end",
    textAlign: "right",
    position: "relative",
    marginLeft: "auto",
    color: theme.palette.text.secondary,
  },
  lastMessageTimeUnread: {
    justifySelf: "flex-end",
    textAlign: "right",
    position: "relative",
    color: theme.palette.success.main,
    fontWeight: "bold",
    marginLeft: "auto"
  },
  cardButton: {
    marginRight: theme.spacing(1),
    color: theme.palette.common.white,
    backgroundColor: theme.palette.primary.main,
    "&:hover": {
      backgroundColor: theme.palette.primary.dark,
    },
  },
  dateInput: {
    marginRight: theme.spacing(2),
  },
}));
```

### 4 Estados UI

#### 1. Loading
```javascript
if (tagsLoading || ticketsLoading) {
  return <BackdropLoading />;
}
```

#### 2. Empty State (Sem Tags)
```javascript
if (!loading && tags.length === 0) {
  return (
    <EmptyStateContainer
      icon={<DashboardIcon />}
      title={i18n.t("kanban.emptyStateTags")}
      description={i18n.t("kanban.emptyStateTagsDescription")}
      actionButton={
        <Button onClick={() => history.push('/tagsKanban')}>
          {i18n.t("kanban.createFirstTag")}
        </Button>
      }
    />
  );
}
```

#### 3. Empty State (Sem Tickets)
```javascript
if (!loading && tags.length > 0 && tickets.length === 0) {
  return (
    <>
      <FiltersSection />
      <EmptyStateContainer
        icon={<TicketIcon />}
        title={i18n.t("kanban.emptyStateTickets")}
        description={i18n.t("kanban.emptyStateTicketsDescription")}
      />
    </>
  );
}
```

#### 4. Error State
```javascript
if (error) {
  return (
    <ErrorStateContainer
      error={error}
      onRetry={() => {
        refetchTags();
        refetchTickets();
      }}
    />
  );
}
```

### Depend\u00eancias
```javascript
import React, { useState, useEffect, useContext } from "react";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import { AuthContext } from "../../context/Auth/AuthContext";
import Board from 'react-trello';
import { toast } from "react-toastify";
import { i18n } from "../../translate/i18n";
import { useHistory } from 'react-router-dom';
import { Facebook, Instagram, WhatsApp } from "@material-ui/icons";
import { Badge, Tooltip, Typography, Button, TextField, Box } from "@material-ui/core";
import { format, isSameDay, parseISO } from "date-fns";
import { Can } from "../../components/Can";

// Hooks customizados
import useKanbanTags from "../../hooks/useKanbanTags";
import useKanbanTickets from "../../hooks/useKanbanTickets";
import useSocketKanban from "../../hooks/useSocketKanban";
import useMoveTicket from "../../hooks/useMoveTicket";
```

---

## 2. TagsKanban Page (Admin)

**Localiza\u00e7\u00e3o:** `frontend/src/pages/TagsKanban/index.js`

**Descri\u00e7\u00e3o:** P\u00e1gina de administra\u00e7\u00e3o de tags Kanban com CRUD completo.

### Props Interface
```typescript
// Nenhuma prop (p\u00e1gina top-level)
```

### State Management
```typescript
const [loading, setLoading] = useState<boolean>(false);
const [pageNumber, setPageNumber] = useState<number>(1);
const [hasMore, setHasMore] = useState<boolean>(false);
const [selectedTag, setSelectedTag] = useState<Tag | null>(null);
const [deletingTag, setDeletingTag] = useState<Tag | null>(null);
const [confirmModalOpen, setConfirmModalOpen] = useState<boolean>(false);
const [searchParam, setSearchParam] = useState<string>("");
const [tags, dispatch] = useReducer(reducer, []);
const [tagModalOpen, setTagModalOpen] = useState<boolean>(false);
```

### Reducer Actions
```typescript
type Action =
  | { type: "LOAD_TAGS"; payload: Tag[] }
  | { type: "UPDATE_TAGS"; payload: Tag }
  | { type: "DELETE_TAGS"; payload: number }
  | { type: "RESET" };

const reducer = (state: Tag[], action: Action): Tag[] => {
  switch (action.type) {
    case "LOAD_TAGS":
      // Merge tags, atualizando existentes ou adicionando novos
      // ...
    case "UPDATE_TAGS":
      // Atualiza tag existente ou adiciona nova
      // ...
    case "DELETE_TAGS":
      // Remove tag por ID
      // ...
    case "RESET":
      return [];
  }
};
```

### Event Handlers
```javascript
handleOpenTagModal(): void
handleCloseTagModal(): void
handleSearch(event): void
handleEditTag(tag): void
handleDeleteTag(tagId): Promise<void>
loadMore(): void
handleScroll(e): void
handleReturnToKanban(): void
```

### Estrutura JSX
```jsx
<MainContainer>
  {/* Modal de Confirma\u00e7\u00e3o */}
  <ConfirmationModal
    title="Excluir Tag Kanban"
    open={confirmModalOpen}
    onClose={() => setConfirmModalOpen(false)}
    onConfirm={() => handleDeleteTag(deletingTag.id)}
  >
    {i18n.t("tagsKanban.confirmationModal.deleteMessage")}
  </ConfirmationModal>

  {/* Modal de Cria\u00e7\u00e3o/Edi\u00e7\u00e3o */}
  {tagModalOpen && (
    <TagModal
      open={tagModalOpen}
      onClose={handleCloseTagModal}
      tagId={selectedTag?.id}
      kanban={1}
    />
  )}

  {/* Header */}
  <MainHeader>
    <Title>Tags Kanban ({tags.length})</Title>
    <MainHeaderButtonsWrapper>
      <TextField
        placeholder="Buscar tag..."
        type="search"
        value={searchParam}
        onChange={handleSearch}
        InputProps={{
          startAdornment: <SearchIcon />
        }}
      />
      <Button onClick={handleOpenTagModal}>Adicionar</Button>
      <Button onClick={handleReturnToKanban}>Voltar para Kanban</Button>
    </MainHeaderButtonsWrapper>
  </MainHeader>

  {/* Tabela de Tags */}
  <Paper className={classes.mainPaper} onScroll={handleScroll}>
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell align="center">Nome</TableCell>
          <TableCell align="center">Tickets</TableCell>
          <TableCell align="center">A\u00e7\u00f5es</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {tags.map(tag => (
          <TableRow key={tag.id}>
            <TableCell align="center">
              <Chip
                style={{
                  backgroundColor: tag.color,
                  color: "white"
                }}
                label={tag.name}
                size="small"
              />
            </TableCell>
            <TableCell align="center">
              {tag.ticketTags?.length || 0}
            </TableCell>
            <TableCell align="center">
              <IconButton onClick={() => handleEditTag(tag)}>
                <EditIcon />
              </IconButton>
              <IconButton onClick={() => {
                setConfirmModalOpen(true);
                setDeletingTag(tag);
              }}>
                <DeleteOutlineIcon />
              </IconButton>
            </TableCell>
          </TableRow>
        ))}
        {loading && <TableRowSkeleton columns={3} />}
      </TableBody>
    </Table>
  </Paper>
</MainContainer>
```

### Socket.IO Listener
```javascript
useEffect(() => {
  const socket = /* obter do AuthContext */;

  const onTagsEvent = (data) => {
    if (data.action === "update" || data.action === "create") {
      dispatch({ type: "UPDATE_TAGS", payload: data.tag });
    }
    if (data.action === "delete") {
      dispatch({ type: "DELETE_TAGS", payload: data.tagId });
    }
  };

  socket.on(`company${user.companyId}-tag`, onTagsEvent);

  return () => {
    socket.off(`company${user.companyId}-tag`, onTagsEvent);
  };
}, [socket, user.companyId]);
```

### Estilos
```javascript
const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(1),
    overflowY: "scroll",
    ...theme.scrollbarStyles,
  },
}));
```

### Depend\u00eancias
```javascript
import React, { useState, useEffect, useReducer, useContext } from "react";
import { toast } from "react-toastify";
import { useHistory } from "react-router-dom";
import { makeStyles } from "@material-ui/core/styles";
import {
  Paper, Button, Table, TableBody, TableCell,
  TableHead, TableRow, IconButton, SearchIcon,
  TextField, InputAdornment, DeleteOutlineIcon,
  EditIcon, Chip
} from "@material-ui/core";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import TagModal from "../../components/TagModal";
import ConfirmationModal from "../../components/ConfirmationModal";
import toastError from "../../errors/toastError";
import { AuthContext } from "../../context/Auth/AuthContext";
```

---

## 3. Board Component (react-trello)

**Localiza\u00e7\u00e3o:** `node_modules/react-trello` (biblioteca externa)

**Descri\u00e7\u00e3o:** Componente de terceiros que fornece funcionalidade de Kanban com DnD.

### Props Interface
```typescript
interface BoardProps {
  data: BoardData;
  onCardMoveAcrossLanes?: (cardId: string, sourceLaneId: string, targetLaneId: string) => void;
  style?: React.CSSProperties;
  draggable?: boolean;
  editable?: boolean;
  canAddLanes?: boolean;
  hideCardDeleteIcon?: boolean;
  cardDraggable?: boolean;
  laneDraggable?: boolean;
}

interface BoardData {
  lanes: Lane[];
}

interface Lane {
  id: string;
  title: string;
  label?: string;
  style?: React.CSSProperties;
  cards: Card[];
}

interface Card {
  id: string;
  title: React.ReactNode;
  label?: string;
  description: React.ReactNode;
  draggable?: boolean;
  href?: string;
}
```

### Configura\u00e7\u00e3o Recomendada
```jsx
<Board
  data={file}
  onCardMoveAcrossLanes={handleCardMove}
  style={{ backgroundColor: 'rgba(252, 252, 252, 0.03)' }}
  draggable={true}
  editable={false}
  canAddLanes={false}
  hideCardDeleteIcon={true}
  cardDraggable={true}
  laneDraggable={false}
/>
```

**Justificativa:**
- `draggable={true}`: Habilita DnD
- `editable={false}`: Previne edi\u00e7\u00e3o inline (usamos modais)
- `canAddLanes={false}`: Lanes s\u00e3o gerenciadas via TagsKanban
- `hideCardDeleteIcon={true}`: Delete deve ser feito na p\u00e1gina do ticket
- `cardDraggable={true}`: Cards podem ser movidos
- `laneDraggable={false}`: Lanes s\u00e3o fixas (ordem definida por tags)

### Limita\u00e7\u00f5es Conhecidas
1. **A11y Limitada:** react-trello n\u00e3o tem ARIA labels nativos
   - **Mitiga\u00e7\u00e3o:** Adicionar live region para Screen Readers (ver se\u00e7\u00e3o A11y)
2. **Performance:** Renderiza todas as lanes/cards (sem virtualiza\u00e7\u00e3o)
   - **Mitiga\u00e7\u00e3o:** Backend limita 400 tickets
3. **TypeScript:** Sem tipos nativos
   - **Mitiga\u00e7\u00e3o:** Criar interfaces customizadas (acima)

---

## 4. TagModal Component

**Localiza\u00e7\u00e3o:** `frontend/src/components/TagModal/index.js` (verificar exist\u00eancia)

**Descri\u00e7\u00e3o:** Modal para criar/editar tags Kanban.

### Props Interface
```typescript
interface TagModalProps {
  open: boolean;
  onClose: () => void;
  tagId?: number | null;
  kanban: number; // 1 = tag Kanban, 0 = tag normal
}
```

### Campos do Formul\u00e1rio (Formik)
```typescript
interface TagFormValues {
  name: string;
  color: string; // HEX color
  kanban: number; // 0 ou 1
  timeLane?: number | null;
  nextLaneId?: number | null;
  greetingMessageLane?: string | null;
  rollbackLaneId?: number | null;
}
```

### Valida\u00e7\u00e3o (Yup)
```javascript
const schema = Yup.object().shape({
  name: Yup.string()
    .min(2, "Nome muito curto")
    .max(50, "Nome muito longo")
    .required("Nome \u00e9 obrigat\u00f3rio"),
  color: Yup.string()
    .matches(/^#[0-9A-Fa-f]{6}$/, "Cor inv\u00e1lida")
    .required("Cor \u00e9 obrigat\u00f3ria"),
  kanban: Yup.number()
    .oneOf([0, 1], "Kanban deve ser 0 ou 1")
    .required()
});
```

### Estrutura JSX
```jsx
<Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
  <DialogTitle>
    {tagId ? "Editar Tag Kanban" : "Criar Tag Kanban"}
  </DialogTitle>
  <DialogContent>
    <Formik
      initialValues={initialValues}
      validationSchema={schema}
      onSubmit={handleSubmit}
    >
      {({ values, errors, touched, handleChange, handleSubmit }) => (
        <Form>
          <TextField
            label="Nome"
            name="name"
            value={values.name}
            onChange={handleChange}
            error={touched.name && Boolean(errors.name)}
            helperText={touched.name && errors.name}
            fullWidth
            margin="normal"
          />
          <ColorPicker
            label="Cor"
            name="color"
            value={values.color}
            onChange={(color) => handleChange({ target: { name: 'color', value: color } })}
          />
          <FormControlLabel
            control={
              <Switch
                checked={values.kanban === 1}
                onChange={(e) => handleChange({
                  target: { name: 'kanban', value: e.target.checked ? 1 : 0 }
                })}
              />
            }
            label="Tag Kanban"
          />
        </Form>
      )}
    </Formik>
  </DialogContent>
  <DialogActions>
    <Button onClick={onClose}>Cancelar</Button>
    <Button onClick={handleSubmit} color="primary">
      {tagId ? "Salvar" : "Criar"}
    </Button>
  </DialogActions>
</Dialog>
```

### API Calls
```javascript
// Create
const handleSubmit = async (values) => {
  try {
    await api.post("/tags", values);
    toast.success("Tag criada com sucesso");
    onClose();
  } catch (err) {
    toastError(err);
  }
};

// Update
const handleSubmit = async (values) => {
  try {
    await api.put(`/tags/${tagId}`, values);
    toast.success("Tag atualizada com sucesso");
    onClose();
  } catch (err) {
    toastError(err);
  }
};
```

**Nota:** Verificar se TagModal j\u00e1 existe no projeto. Se n\u00e3o existir, portar de:
```
/Users/brunovilefort/Desktop/chatia-final/chatia/chatia/frontend/src/components/TagModal/index.js
```

---

## 5. Componentes Reutiliz\u00e1veis (Existentes)

### Can (RBAC)
```typescript
interface CanProps {
  role: string; // user.profile
  perform: string; // "dashboard:view", "ticket:edit", etc
  yes?: () => React.ReactNode;
  no?: () => React.ReactNode;
}

// Uso
<Can
  role={user.profile}
  perform="dashboard:view"
  yes={() => <Button>Admin Only</Button>}
/>
```

### BackdropLoading
```typescript
interface BackdropLoadingProps {
  // Nenhuma prop
}

// Uso
{loading && <BackdropLoading />}
```

### TableRowSkeleton
```typescript
interface TableRowSkeletonProps {
  columns: number; // N\u00famero de colunas para renderizar skeleton
}

// Uso
{loading && <TableRowSkeleton columns={3} />}
```

### ConfirmationModal
```typescript
interface ConfirmationModalProps {
  title: string;
  open: boolean;
  onClose: (value: boolean) => void;
  onConfirm: () => void;
  children: React.ReactNode; // Mensagem de confirma\u00e7\u00e3o
}

// Uso
<ConfirmationModal
  title="Excluir Tag"
  open={confirmModalOpen}
  onClose={setConfirmModalOpen}
  onConfirm={() => handleDelete(tagId)}
>
  Tem certeza que deseja excluir esta tag?
</ConfirmationModal>
```

---

## Resumo de Componentes

| Componente | Localiza\u00e7\u00e3o | Status | Tipo |
|------------|-------------|--------|------|
| **Kanban** | `pages/Kanban/index.js` | A CRIAR (V2) | Page |
| **KanbanLegacy** | `pages/Kanban/KanbanLegacy.jsx` | RENOMEAR (atual) | Page |
| **TagsKanban** | `pages/TagsKanban/index.js` | PORTAR (refer\u00eancia) | Page |
| **Board** | `node_modules/react-trello` | INSTALAR | External |
| **TagModal** | `components/TagModal/index.js` | VERIFICAR/PORTAR | Modal |
| **Can** | `components/Can/index.js` | EXISTE \u2705 | RBAC |
| **BackdropLoading** | `components/BackdropLoading/index.js` | EXISTE \u2705 | Loading |
| **TableRowSkeleton** | `components/TableRowSkeleton/index.js` | EXISTE \u2705 | Loading |
| **ConfirmationModal** | `components/ConfirmationModal/index.js` | EXISTE \u2705 | Modal |
| **MainContainer** | `components/MainContainer/index.js` | EXISTE \u2705 | Layout (v4) |
| **MainHeader** | `components/MainHeader/index.js` | EXISTE \u2705 | Layout (v4) |
| **Title** | `components/Title/index.js` | EXISTE \u2705 | Layout (v4) |

---

**Documento Criado por:** Frontend Architecture Planner
**Data:** 2025-10-13
**Vers\u00e3o:** 1.0
