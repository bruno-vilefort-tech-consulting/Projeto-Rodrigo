# Plano de Implementa\u00e7\u00e3o Frontend - Kanban V2 com DnD

**Vers\u00e3o:** 1.0
**Data:** 2025-10-13
**Autor:** Frontend Architecture Planner
**Status:** Pronto para Implementa\u00e7\u00e3o

---

## \u00cdndice

1. [Tarefas por Commit](#1-tarefas-por-commit)
2. [Rotas/P\u00e1ginas](#2-rotas-p\u00e1ginas)
3. [Componentes e Composi\u00e7\u00e3o](#3-componentes-e-composi\u00e7\u00e3o)
4. [Custom Hooks](#4-custom-hooks)
5. [Estados UI (4 obrigat\u00f3rios)](#5-estados-ui-4-obrigat\u00f3rios)
6. [Data Fetching](#6-data-fetching)
7. [Estrat\u00e9gia de Testes](#7-estrat\u00e9gia-de-testes)
8. [Acessibilidade (A11y)](#8-acessibilidade-a11y)
9. [i18n (5 idiomas)](#9-i18n-5-idiomas)

---

## 1. Tarefas por Commit

### Commit 1: Setup Inicial e Feature Flag

**Objetivo:** Preparar ambiente para Kanban V2 e criar sistema de feature flag.

**Arquivos:**
- `frontend/package.json` (atualizar)
- `frontend/src/config/featureFlags.js` (criar)
- `frontend/.env` (atualizar)
- `frontend/src/pages/Kanban/KanbanLegacy.jsx` (renomear Kanban atual)

**Checklist:**
- [ ] Instalar react-trello@2.2.11
- [ ] Criar arquivo `src/config/featureFlags.js`
- [ ] Adicionar `REACT_APP_FEATURE_KANBAN_V2=false` em `.env`
- [ ] Renomear `src/pages/Kanban/index.js` para `KanbanLegacy.jsx`
- [ ] Testar que Kanban Legacy continua funcionando
- [ ] Validar build sem erros

**Estimativa:** 1h

**Depend\u00eancias:** Nenhuma

---

### Commit 2: Hooks Customizados - Parte 1 (Tags e Tickets)

**Objetivo:** Criar hooks reutiliz\u00e1veis para data fetching de tags e tickets Kanban.

**Arquivos:**
- `frontend/src/hooks/useKanbanTags/index.js` (criar)
- `frontend/src/hooks/useKanbanTickets/index.js` (criar)

**Checklist:**
- [ ] Implementar `useKanbanTags` (GET /tag/kanban)
- [ ] Implementar `useKanbanTickets` (GET /ticket/kanban com filtros)
- [ ] Adicionar tratamento de erro (toastError)
- [ ] Adicionar estados de loading
- [ ] Implementar fun\u00e7\u00e3o refetch
- [ ] Testar hooks isoladamente com console.log
- [ ] Validar multi-tenant (companyId do AuthContext)

**Estimativa:** 2h

**Depend\u00eancias:** Commit 1

---

### Commit 3: Hooks Customizados - Parte 2 (Socket.IO e Movimenta\u00e7\u00e3o)

**Objetivo:** Criar hooks para real-time e DnD logic.

**Arquivos:**
- `frontend/src/hooks/useSocketKanban/index.js` (criar)
- `frontend/src/hooks/useMoveTicket/index.js` (criar)

**Checklist:**
- [ ] Implementar `useSocketKanban` com listeners
- [ ] Implementar `useMoveTicket` (DELETE + PUT /ticket-tags)
- [ ] Adicionar l\u00f3gica de rollback em caso de erro
- [ ] Testar listeners Socket.IO
- [ ] Validar eventos `company-{id}-ticket` e `company-{id}-appMessage`
- [ ] Testar cleanup (useEffect return)
- [ ] Validar toasts de sucesso/erro

**Estimativa:** 2h

**Depend\u00eancias:** Commit 2

---

### Commit 4: Componente Principal - Kanban V2

**Objetivo:** Criar p\u00e1gina principal do Kanban com react-trello Board.

**Arquivos:**
- `frontend/src/pages/Kanban/index.js` (criar vers\u00e3o V2)
- `frontend/src/pages/Kanban/styles.js` (criar)

**Checklist:**
- [ ] Importar react-trello Board
- [ ] Integrar todos os hooks criados
- [ ] Implementar fun\u00e7\u00e3o `popularCards` (transforma\u00e7\u00e3o de dados)
- [ ] Adicionar filtros de data (startDate/endDate)
- [ ] Implementar handler `handleCardMove`
- [ ] Adicionar bot\u00e3o "Adicionar Colunas" (RBAC)
- [ ] Estilizar com Material-UI v4
- [ ] Testar renderiza\u00e7\u00e3o de lanes
- [ ] Testar DnD entre lanes
- [ ] Validar 4 estados UI (loading, happy, empty, error)

**Estimativa:** 3h

**Depend\u00eancias:** Commit 3

---

### Commit 5: P\u00e1gina de Administra\u00e7\u00e3o de Tags

**Objetivo:** Reativar p\u00e1gina TagsKanban com CRUD completo.

**Arquivos:**
- `frontend/src/pages/TagsKanban/index.js` (substituir mensagem de manuten\u00e7\u00e3o)
- `frontend/src/components/TagModal/index.js` (verificar exist\u00eancia ou criar)

**Checklist:**
- [ ] Portar c\u00f3digo de TagsKanban da refer\u00eancia
- [ ] Implementar listagem de tags (GET /tags?kanban=1)
- [ ] Adicionar bot\u00e3o "Criar Tag"
- [ ] Integrar TagModal para create/edit
- [ ] Implementar delete com confirma\u00e7\u00e3o
- [ ] Adicionar Socket.IO listener para `company-{id}-tag`
- [ ] Adicionar bot\u00e3o "Voltar para Kanban"
- [ ] Testar CRUD completo
- [ ] Validar contador de tickets por tag
- [ ] Validar RBAC (apenas admin)

**Estimativa:** 2h

**Depend\u00eancias:** Commit 4

---

### Commit 6: Integra\u00e7\u00e3o de Feature Flag nas Rotas

**Objetivo:** Conectar feature flag nas rotas para alternar entre Legacy e V2.

**Arquivos:**
- `frontend/src/routes/index.js` (atualizar)

**Checklist:**
- [ ] Importar `FEATURES` de `config/featureFlags.js`
- [ ] Adicionar condicional para rota /kanban
- [ ] Adicionar condicional para rota /tagsKanban
- [ ] Testar com FEATURE_KANBAN_V2=false (deve carregar Legacy)
- [ ] Testar com FEATURE_KANBAN_V2=true (deve carregar V2)
- [ ] Validar redirecionamento se tentar acessar URL diretamente
- [ ] Testar hot-reload ao mudar .env

**Estimativa:** 1h

**Depend\u00eancias:** Commit 5

---

### Commit 7: Testes Unit\u00e1rios e Integra\u00e7\u00e3o

**Objetivo:** Garantir cobertura de testes para novos componentes.

**Arquivos:**
- `frontend/src/__tests__/hooks/useKanbanTags.test.js` (criar)
- `frontend/src/__tests__/hooks/useKanbanTickets.test.js` (criar)
- `frontend/src/__tests__/pages/Kanban.test.js` (criar)
- `frontend/src/__tests__/pages/TagsKanban.test.js` (criar)

**Checklist:**
- [ ] Testar hook `useKanbanTags` (mock API)
- [ ] Testar hook `useKanbanTickets` (mock API + filtros)
- [ ] Testar hook `useMoveTicket` (mock DELETE + PUT)
- [ ] Testar renderiza\u00e7\u00e3o de Kanban page
- [ ] Testar fun\u00e7\u00e3o `popularCards`
- [ ] Testar 4 estados UI (loading, happy, empty, error)
- [ ] Testar Socket.IO listeners (mock)
- [ ] Testar feature flag toggle
- [ ] Validar cobertura > 80%

**Estimativa:** 3h

**Depend\u00eancias:** Commit 6

---

### Commit 8: Acessibilidade, i18n e Documenta\u00e7\u00e3o

**Objetivo:** Finalizar A11y, internacionaliza\u00e7\u00e3o e documentar implementa\u00e7\u00e3o.

**Arquivos:**
- `frontend/src/translate/languages/pt.json` (atualizar)
- `frontend/src/translate/languages/en.json` (atualizar)
- `frontend/src/translate/languages/es.json` (atualizar)
- `frontend/README-kanban.md` (criar)

**Checklist:**
- [ ] Adicionar ARIA labels em \u00edcones e bot\u00f5es
- [ ] Testar navega\u00e7\u00e3o por teclado (Tab, Enter, Esc)
- [ ] Validar contraste de cores (WCAG AA 4.5:1)
- [ ] Adicionar focus indicators vis\u00edveis
- [ ] Criar chaves de tradu\u00e7\u00e3o (kanban.*, tagsKanban.*)
- [ ] Replicar tradu\u00e7\u00f5es para 5 idiomas (pt, en, es, tr, ar)
- [ ] Testar com idioma n\u00e3o-default (ex: en)
- [ ] Documentar instala\u00e7\u00e3o de react-trello
- [ ] Documentar uso de feature flag
- [ ] Criar guia de troubleshooting

**Estimativa:** 2h

**Depend\u00eancias:** Commit 7

---

## 2. Rotas/P\u00e1ginas

| Rota | P\u00e1gina | RBAC | Material-UI | Descri\u00e7\u00e3o |
|------|--------|------|-------------|-------------|
| `/kanban` | `Kanban/index.js` (V2) | `user` (todos) | v4 + v5 | Visualiza\u00e7\u00e3o Kanban com DnD |
| `/kanban` | `Kanban/KanbanLegacy.jsx` | `user` (todos) | v4 + v5 | Vers\u00e3o legacy (3 colunas fixas) |
| `/tagsKanban` | `TagsKanban/index.js` | `dashboard:view` (admin) | v4 | Admin de tags Kanban |

**Condicional de Rotas:**
```javascript
// frontend/src/routes/index.js
import { FEATURES } from '../config/featureFlags';
import Kanban from "../pages/Kanban";
import KanbanLegacy from "../pages/Kanban/KanbanLegacy";
import TagsKanban from "../pages/TagsKanban";

// Kanban V2 vs Legacy
{FEATURES.KANBAN_V2 ? (
  <Route exact path="/kanban" component={Kanban} isPrivate />
) : (
  <Route exact path="/kanban" component={KanbanLegacy} isPrivate />
)}

// TagsKanban (s\u00f3 dispon\u00edvel se V2 ativo)
{FEATURES.KANBAN_V2 && (
  <Route exact path="/tagsKanban" component={TagsKanban} isPrivate />
)}
```

---

## 3. Componentes e Composi\u00e7\u00e3o

### Hierarquia Visual (ASCII Tree)

```
Kanban (P\u00e1gina Principal)
\u251c\u2500\u2500 <div className={classes.root}>
\u2502   \u251c\u2500\u2500 FiltersSection
\u2502   \u2502   \u251c\u2500\u2500 TextField (v4) - startDate
\u2502   \u2502   \u251c\u2500\u2500 TextField (v4) - endDate
\u2502   \u2502   \u251c\u2500\u2500 Button (v4) - "Buscar"
\u2502   \u2502   \u2514\u2500\u2500 Can (RBAC)
\u2502   \u2502       \u2514\u2500\u2500 Button (v4) - "Adicionar Colunas"
\u2502   \u2502
\u2502   \u251c\u2500\u2500 BoardContainer
\u2502   \u2502   \u2514\u2500\u2500 Board (react-trello) - NOVO
\u2502   \u2502       \u251c\u2500\u2500 Lane 0 (Default - Sem Tag)
\u2502   \u2502       \u2502   \u251c\u2500\u2500 LaneHeader
\u2502   \u2502       \u2502   \u2502   \u251c\u2500\u2500 Typography - "Sem Etiqueta"
\u2502   \u2502       \u2502   \u2502   \u2514\u2500\u2500 Badge - contador
\u2502   \u2502       \u2502   \u2502
\u2502   \u2502       \u2502   \u2514\u2500\u2500 Cards[]
\u2502   \u2502       \u2502       \u251c\u2500\u2500 CardHeader
\u2502   \u2502       \u2502       \u2502   \u251c\u2500\u2500 IconChannel (WhatsApp/FB/IG)
\u2502   \u2502       \u2502       \u2502   \u2514\u2500\u2500 ContactName (Tooltip)
\u2502   \u2502       \u2502       \u2502
\u2502   \u2502       \u2502       \u251c\u2500\u2500 CardBody
\u2502   \u2502       \u2502       \u2502   \u251c\u2500\u2500 ContactNumber
\u2502   \u2502       \u2502       \u2502   \u251c\u2500\u2500 LastMessage (truncated)
\u2502   \u2502       \u2502       \u2502   \u2514\u2500\u2500 Timestamp (updatedAt)
\u2502   \u2502       \u2502       \u2502
\u2502   \u2502       \u2502       \u251c\u2500\u2500 CardFooter
\u2502   \u2502       \u2502       \u2502   \u251c\u2500\u2500 Badge - userName
\u2502   \u2502       \u2502       \u2502   \u2514\u2500\u2500 Button - "Ver Ticket"
\u2502   \u2502       \u2502       \u2502
\u2502   \u2502       \u2502       \u2514\u2500\u2500 [draggable: true]
\u2502   \u2502       \u2502
\u2502   \u2502       \u251c\u2500\u2500 Lanes 1..N (Tags Kanban)
\u2502   \u2502       \u2502   \u251c\u2500\u2500 LaneHeader (style: tag.color)
\u2502   \u2502       \u2502   \u2514\u2500\u2500 Cards[] (mesma estrutura)
\u2502   \u2502       \u2502
\u2502   \u2502       \u2514\u2500\u2500 onCardMoveAcrossLanes={handleCardMove}
\u2502   \u2502
\u2502   \u2514\u2500\u2500 SocketListeners (invisible)
\u2514\u2500\u2500 BackdropLoading (condicional)

TagsKanban (P\u00e1gina Admin)
\u251c\u2500\u2500 MainContainer (v4 - existente)
\u2502   \u251c\u2500\u2500 MainHeader (v4 - existente)
\u2502   \u2502   \u251c\u2500\u2500 Title (v4) - "Tags Kanban (N)"
\u2502   \u2502   \u2514\u2500\u2500 MainHeaderButtonsWrapper (v4)
\u2502   \u2502       \u251c\u2500\u2500 TextField - SearchBar
\u2502   \u2502       \u251c\u2500\u2500 Button - "Adicionar"
\u2502   \u2502       \u2514\u2500\u2500 Button - "Voltar para Kanban"
\u2502   \u2502
\u2502   \u251c\u2500\u2500 Paper (v4)
\u2502   \u2502   \u2514\u2500\u2500 Table (v4)
\u2502   \u2502       \u251c\u2500\u2500 TableHead
\u2502   \u2502       \u2502   \u2514\u2500\u2500 TableRow
\u2502   \u2502       \u2502       \u251c\u2500\u2500 TableCell - "Nome"
\u2502   \u2502       \u2502       \u251c\u2500\u2500 TableCell - "Tickets"
\u2502   \u2502       \u2502       \u2514\u2500\u2500 TableCell - "A\u00e7\u00f5es"
\u2502   \u2502       \u2502
\u2502   \u2502       \u2514\u2500\u2500 TableBody
\u2502   \u2502           \u251c\u2500\u2500 TableRow[] (tag)
\u2502   \u2502           \u2502   \u251c\u2500\u2500 Chip (tag.color) - tag.name
\u2502   \u2502           \u2502   \u251c\u2500\u2500 ticketCount
\u2502   \u2502           \u2502   \u2514\u2500\u2500 IconButtons (Edit, Delete)
\u2502   \u2502           \u2502
\u2502   \u2502           \u2514\u2500\u2500 TableRowSkeleton (loading)
\u2502   \u2502
\u2502   \u251c\u2500\u2500 TagModal (create/edit) - VERIFICAR EXIST\u00caNCIA
\u2502   \u2514\u2500\u2500 ConfirmationModal (delete)
\u2514\u2500\u2500 SocketListener (company-{id}-tag)
```

### Componentes Reutiliz\u00e1veis (Existentes)

**Do ChatIA Flow (j\u00e1 existem):**
- `MainContainer` (v4) - Layout padr\u00e3o
- `MainHeader` (v4) - Cabe\u00e7alho de p\u00e1gina
- `Title` (v4) - T\u00edtulo de se\u00e7\u00e3o
- `MainHeaderButtonsWrapper` (v4) - Container de bot\u00f5es
- `Can` (RBAC) - Controle de permiss\u00f5es
- `ConfirmationModal` (v4) - Modal de confirma\u00e7\u00e3o
- `TableRowSkeleton` (v4) - Loading skeleton
- `BackdropLoading` - Loading fullscreen

**Novos (a serem importados da refer\u00eancia):**
- `Board` (react-trello 2.2.11) - Componente principal de DnD

**Verificar exist\u00eancia:**
- `TagModal` - Modal de cria\u00e7\u00e3o/edi\u00e7\u00e3o de tags
  - Se n\u00e3o existir, portar de `chatia/chatia/frontend/src/components/TagModal`

---

## 4. Custom Hooks

### 4.1. useKanbanTags

**Localiza\u00e7\u00e3o:** `frontend/src/hooks/useKanbanTags/index.js`

**Prop\u00f3sito:** Buscar tags configuradas como colunas Kanban (kanban=1).

**Assinatura:**
```javascript
const useKanbanTags = () => {
  return {
    tags: Tag[],
    loading: boolean,
    error: Error | null,
    refetch: () => void
  }
}
```

**Implementa\u00e7\u00e3o:**
```javascript
import { useState, useEffect, useContext } from "react";
import api from "../../services/api";
import { AuthContext } from "../../context/Auth/AuthContext";
import toastError from "../../errors/toastError";

const useKanbanTags = () => {
  const { user } = useContext(AuthContext);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTags = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get("/tag/kanban");
      setTags(response.data.lista || []);
    } catch (err) {
      console.error("useKanbanTags error:", err);
      setError(err);
      toastError(err);
      setTags([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      fetchTags();
    }
  }, [user]);

  return { tags, loading, error, refetch: fetchTags };
};

export default useKanbanTags;
```

**Uso:**
```javascript
// Em /pages/Kanban/index.js
import useKanbanTags from "../../hooks/useKanbanTags";

const Kanban = () => {
  const { tags, loading: tagsLoading, refetch: refetchTags } = useKanbanTags();

  // tags ser\u00e1 usado em popularCards()
};
```

---

### 4.2. useKanbanTickets

**Localiza\u00e7\u00e3o:** `frontend/src/hooks/useKanbanTickets/index.js`

**Prop\u00f3sito:** Buscar tickets para Kanban com filtros de data e fila.

**Assinatura:**
```javascript
const useKanbanTickets = (queueIds, startDate, endDate) => {
  return {
    tickets: Ticket[],
    loading: boolean,
    error: Error | null,
    refetch: () => void
  }
}
```

**Par\u00e2metros:**
- `queueIds: number[]` - IDs das filas do usu\u00e1rio (de AuthContext)
- `startDate: string` - Data inicial (formato: "yyyy-MM-dd")
- `endDate: string` - Data final (formato: "yyyy-MM-dd")

**Implementa\u00e7\u00e3o:**
```javascript
import { useState, useEffect, useContext } from "react";
import api from "../../services/api";
import { AuthContext } from "../../context/Auth/AuthContext";
import toastError from "../../errors/toastError";

const useKanbanTickets = (queueIds, startDate, endDate) => {
  const { user } = useContext(AuthContext);
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data } = await api.get("/ticket/kanban", {
        params: {
          queueIds: JSON.stringify(queueIds),
          startDate: startDate,
          endDate: endDate,
        }
      });

      setTickets(data.tickets || []);
    } catch (err) {
      console.error("useKanbanTickets error:", err);
      setError(err);
      toastError(err);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user && queueIds.length > 0) {
      fetchTickets();
    }
  }, [user, queueIds, startDate, endDate]);

  return { tickets, loading, error, refetch: fetchTickets };
};

export default useKanbanTickets;
```

**Uso:**
```javascript
// Em /pages/Kanban/index.js
import useKanbanTickets from "../../hooks/useKanbanTickets";

const Kanban = () => {
  const { user } = useContext(AuthContext);
  const [startDate, setStartDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(format(new Date(), "yyyy-MM-dd"));

  const queueIds = user.queues.map(q => q.UserQueue.queueId);

  const { tickets, loading: ticketsLoading, refetch: refetchTickets } =
    useKanbanTickets(queueIds, startDate, endDate);
};
```

---

### 4.3. useSocketKanban

**Localiza\u00e7\u00e3o:** `frontend/src/hooks/useSocketKanban/index.js`

**Prop\u00f3sito:** Conectar listeners Socket.IO para atualiza\u00e7\u00f5es real-time de tickets.

**Assinatura:**
```javascript
const useSocketKanban = (socket, companyId, onUpdate) => {
  // Sem retorno (apenas side effects)
}
```

**Par\u00e2metros:**
- `socket: Socket` - Inst\u00e2ncia do Socket.IO (de AuthContext)
- `companyId: number` - ID da empresa (de AuthContext)
- `onUpdate: () => void` - Callback executado quando evento chega

**Implementa\u00e7\u00e3o:**
```javascript
import { useEffect } from "react";

const useSocketKanban = (socket, companyId, onUpdate) => {
  useEffect(() => {
    if (!socket || !companyId) return;

    const eventTicket = `company-${companyId}-ticket`;
    const eventAppMessage = `company-${companyId}-appMessage`;

    const handleUpdate = (data) => {
      if (data.action === "create" || data.action === "update" || data.action === "delete") {
        console.log(`[Socket] Kanban update received:`, data.action);
        onUpdate();
      }
    };

    socket.on(eventTicket, handleUpdate);
    socket.on(eventAppMessage, handleUpdate);

    return () => {
      socket.off(eventTicket, handleUpdate);
      socket.off(eventAppMessage, handleUpdate);
    };
  }, [socket, companyId, onUpdate]);
};

export default useSocketKanban;
```

**Uso:**
```javascript
// Em /pages/Kanban/index.js
import useSocketKanban from "../../hooks/useSocketKanban";

const Kanban = () => {
  const { user, socket } = useContext(AuthContext);
  const { refetch: refetchTickets } = useKanbanTickets(...);

  // Conectar Socket.IO
  useSocketKanban(socket, user.companyId, refetchTickets);
};
```

---

### 4.4. useMoveTicket

**Localiza\u00e7\u00e3o:** `frontend/src/hooks/useMoveTicket/index.js`

**Prop\u00f3sito:** Mover ticket entre lanes (tags) com l\u00f3gica de DELETE + PUT.

**Assinatura:**
```javascript
const useMoveTicket = () => {
  return {
    moveTicket: (ticketId, oldTagId, newTagId) => Promise<void>,
    loading: boolean
  }
}
```

**Par\u00e2metros da fun\u00e7\u00e3o `moveTicket`:**
- `ticketId: number` - ID do ticket sendo movido
- `oldTagId: number | null` - ID da tag antiga (null se veio de "Sem Tag")
- `newTagId: number | null` - ID da tag nova (null se vai para "Sem Tag")

**Implementa\u00e7\u00e3o:**
```javascript
import { useState } from "react";
import api from "../../services/api";
import { toast } from "react-toastify";
import { i18n } from "../../translate/i18n";

const useMoveTicket = () => {
  const [loading, setLoading] = useState(false);

  const moveTicket = async (ticketId, oldTagId, newTagId) => {
    try {
      setLoading(true);

      // Passo 1: Remover tag antiga (se existir)
      if (oldTagId !== null && oldTagId !== "lane0") {
        await api.delete(`/ticket-tags/${ticketId}`);
        toast.success(i18n.t("kanban.ticketTagRemoved"));
      }

      // Passo 2: Adicionar nova tag (se n\u00e3o for "Sem Tag")
      if (newTagId !== null && newTagId !== "lane0") {
        await api.put(`/ticket-tags/${ticketId}/${newTagId}`);
        toast.success(i18n.t("kanban.ticketTagAdded"));
      }

      // Socket.IO emitir\u00e1 evento automaticamente
      // Frontend receber\u00e1 via useSocketKanban e atualizar\u00e1

    } catch (err) {
      console.error("useMoveTicket error:", err);

      // Rollback: tentar restaurar tag antiga
      if (oldTagId !== null && oldTagId !== "lane0") {
        try {
          await api.put(`/ticket-tags/${ticketId}/${oldTagId}`);
          toast.error(i18n.t("kanban.ticketMoveError") + " - Rollback aplicado");
        } catch (rollbackErr) {
          console.error("Rollback failed:", rollbackErr);
          toast.error(i18n.t("kanban.ticketMoveError") + " - Rollback falhou");
        }
      } else {
        toast.error(i18n.t("kanban.ticketMoveError"));
      }
    } finally {
      setLoading(false);
    }
  };

  return { moveTicket, loading };
};

export default useMoveTicket;
```

**Uso:**
```javascript
// Em /pages/Kanban/index.js
import useMoveTicket from "../../hooks/useMoveTicket";

const Kanban = () => {
  const { moveTicket, loading: moveLoading } = useMoveTicket();

  const handleCardMove = async (cardId, sourceLaneId, targetLaneId) => {
    // cardId = ticketId
    // sourceLaneId = oldTagId (ou "lane0" se sem tag)
    // targetLaneId = newTagId (ou "lane0" se mover para sem tag)

    const oldTagId = sourceLaneId === "lane0" ? null : sourceLaneId;
    const newTagId = targetLaneId === "lane0" ? null : targetLaneId;

    await moveTicket(cardId, oldTagId, newTagId);
  };

  return (
    <Board
      data={file}
      onCardMoveAcrossLanes={handleCardMove}
      draggable={!moveLoading}
    />
  );
};
```

---

## 5. Estados UI (4 obrigat\u00f3rios)

### 5.1. Happy Path (Dados Carregados)

**Cen\u00e1rio:** Tags e tickets carregados com sucesso.

**Renderiza\u00e7\u00e3o:**
```javascript
// /pages/Kanban/index.js
const Kanban = () => {
  const { tags, loading: tagsLoading } = useKanbanTags();
  const { tickets, loading: ticketsLoading } = useKanbanTickets(...);

  const loading = tagsLoading || ticketsLoading;

  if (!loading && tags.length >= 0 && tickets.length >= 0) {
    return (
      <div className={classes.root}>
        {/* Filtros */}
        <FiltersSection />

        {/* Board */}
        <div className={classes.kanbanContainer}>
          <Board
            data={file}
            onCardMoveAcrossLanes={handleCardMove}
            style={{ backgroundColor: 'rgba(252, 252, 252, 0.03)' }}
          />
        </div>
      </div>
    );
  }
};
```

**Visual:**
- Lanes renderizadas com cores das tags
- Cards com informa\u00e7\u00f5es completas
- DnD funcional
- Contadores de tickets vis\u00edveis

---

### 5.2. Empty State (Sem Dados)

**Cen\u00e1rio 1:** Nenhuma tag Kanban criada (tags.length === 0)

**Renderiza\u00e7\u00e3o:**
```javascript
if (!loading && tags.length === 0) {
  return (
    <div className={classes.root}>
      <Paper className={classes.emptyStatePaper}>
        <Box textAlign="center" py={4}>
          <DashboardIcon style={{ fontSize: 80, color: "#ccc" }} />
          <Typography variant="h5" gutterBottom>
            {i18n.t("kanban.emptyStateTags")}
          </Typography>
          <Typography variant="body2" color="textSecondary" paragraph>
            {i18n.t("kanban.emptyStateTagsDescription")}
          </Typography>
          <Can role={user.profile} perform="dashboard:view" yes={() => (
            <Button
              variant="contained"
              color="primary"
              onClick={() => history.push('/tagsKanban')}
            >
              {i18n.t("kanban.createFirstTag")}
            </Button>
          )} />
        </Box>
      </Paper>
    </div>
  );
}
```

**Cen\u00e1rio 2:** Tags existem, mas nenhum ticket no per\u00edodo filtrado (tickets.length === 0)

**Renderiza\u00e7\u00e3o:**
```javascript
if (!loading && tags.length > 0 && tickets.length === 0) {
  return (
    <div className={classes.root}>
      <FiltersSection />

      <Paper className={classes.emptyStatePaper}>
        <Box textAlign="center" py={4}>
          <TicketIcon style={{ fontSize: 80, color: "#ccc" }} />
          <Typography variant="h5" gutterBottom>
            {i18n.t("kanban.emptyStateTickets")}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {i18n.t("kanban.emptyStateTicketsDescription")}
          </Typography>
        </Box>
      </Paper>
    </div>
  );
}
```

---

### 5.3. Loading State (Carregando)

**Cen\u00e1rio:** Dados sendo buscados (inicial ou refetch).

**Renderiza\u00e7\u00e3o:**
```javascript
import BackdropLoading from "../../components/BackdropLoading";

const Kanban = () => {
  const { tags, loading: tagsLoading } = useKanbanTags();
  const { tickets, loading: ticketsLoading } = useKanbanTickets(...);

  const loading = tagsLoading || ticketsLoading;

  if (loading) {
    return <BackdropLoading />;
  }

  // ... resto do componente
};
```

**Alternativa (Skeleton):**
```javascript
// Para loading parcial (ex: apenas tickets recarregando)
{ticketsLoading && (
  <Box display="flex" justifyContent="center" py={4}>
    <CircularProgress />
  </Box>
)}
```

---

### 5.4. Error State (Erro)

**Cen\u00e1rio:** Erro ao buscar tags ou tickets.

**Renderiza\u00e7\u00e3o:**
```javascript
const Kanban = () => {
  const { tags, loading: tagsLoading, error: tagsError, refetch: refetchTags } = useKanbanTags();
  const { tickets, loading: ticketsLoading, error: ticketsError, refetch: refetchTickets } = useKanbanTickets(...);

  const error = tagsError || ticketsError;

  if (error && !tagsLoading && !ticketsLoading) {
    return (
      <div className={classes.root}>
        <Paper className={classes.errorPaper}>
          <Box textAlign="center" py={4}>
            <ErrorIcon style={{ fontSize: 80, color: "#f44336" }} />
            <Typography variant="h5" gutterBottom>
              {i18n.t("kanban.errorTitle")}
            </Typography>
            <Typography variant="body2" color="textSecondary" paragraph>
              {i18n.t("kanban.errorDescription")}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                refetchTags();
                refetchTickets();
              }}
            >
              {i18n.t("kanban.retry")}
            </Button>
          </Box>
        </Paper>
      </div>
    );
  }

  // ... resto do componente
};
```

**Nota:** toastError j\u00e1 exibe notifica\u00e7\u00e3o autom\u00e1tica nos hooks, mas error state \u00e9 necess\u00e1rio para UI resiliente.

---

## 6. Data Fetching

### 6.1. Axios - Endpoints

**GET /tag/kanban**

**Request:**
```javascript
const response = await api.get("/tag/kanban");
```

**Response:**
```json
{
  "lista": [
    {
      "id": 1,
      "name": "Aguardando Atendimento",
      "color": "#FF6B6B",
      "kanban": 1,
      "companyId": 1,
      "timeLane": 3600,
      "nextLaneId": 2,
      "greetingMessageLane": "Ol\u00e1! Em que posso ajudar?",
      "rollbackLaneId": null,
      "createdAt": "2024-01-15T10:00:00.000Z",
      "updatedAt": "2024-01-15T10:00:00.000Z"
    }
  ]
}
```

---

**GET /ticket/kanban**

**Request:**
```javascript
const { data } = await api.get("/ticket/kanban", {
  params: {
    queueIds: JSON.stringify([1, 2, 3]),
    startDate: "2025-10-01",
    endDate: "2025-10-13"
  }
});
```

**Response:**
```json
{
  "tickets": [
    {
      "id": 123,
      "uuid": "abc-123",
      "status": "open",
      "unreadMessages": 2,
      "companyId": 1,
      "queueId": 1,
      "userId": 2,
      "contactId": 45,
      "whatsappId": 1,
      "channel": "whatsapp",
      "lastMessage": "\u00daltima mensagem...",
      "updatedAt": "2024-01-15T11:00:00.000Z",
      "contact": {
        "id": 45,
        "name": "Jo\u00e3o Silva",
        "number": "5511999999999"
      },
      "queue": {
        "id": 1,
        "name": "Suporte",
        "color": "#4CAF50"
      },
      "user": {
        "id": 2,
        "name": "Maria Santos"
      },
      "tags": [
        {
          "id": 1,
          "name": "Aguardando",
          "color": "#FF6B6B"
        }
      ],
      "whatsapp": {
        "name": "Principal"
      }
    }
  ],
  "count": 1,
  "hasMore": false
}
```

---

**PUT /ticket-tags/:ticketId/:tagId**

**Request:**
```javascript
await api.put(`/ticket-tags/123/2`);
```

**Response:**
```json
{
  "ticketId": 123,
  "tagId": 2,
  "createdAt": "2024-01-15T11:00:00.000Z",
  "updatedAt": "2024-01-15T11:00:00.000Z"
}
```

**Socket.IO Event (autom\u00e1tico):**
```json
{
  "action": "update",
  "ticket": {
    "id": 123,
    "tags": [
      {"id": 2, "name": "Em Atendimento", "color": "#4CAF50"}
    ]
  }
}
```

---

**DELETE /ticket-tags/:ticketId**

**Request:**
```javascript
await api.delete(`/ticket-tags/123`);
```

**Response:**
```json
{
  "message": "Ticket tags removed successfully."
}
```

**Socket.IO Event (autom\u00e1tico):**
```json
{
  "action": "update",
  "ticket": {
    "id": 123,
    "tags": []
  }
}
```

---

### 6.2. Socket.IO - Eventos

**Namespace:** `/workspace-{companyId}`

**Eventos Subscritos:**

1. **`company-{companyId}-ticket`**
   - Emitido quando: Ticket criado/atualizado/deletado
   - Payload: `{ action: "create"|"update"|"delete", ticket: {...} }`
   - A\u00e7\u00e3o: Refetch tickets

2. **`company-{companyId}-appMessage`**
   - Emitido quando: Nova mensagem enviada/recebida
   - Payload: `{ action: "create", message: {...} }`
   - A\u00e7\u00e3o: Refetch tickets (atualiza lastMessage e unreadMessages)

**Implementa\u00e7\u00e3o:**
```javascript
// Em /pages/Kanban/index.js
const { socket } = useContext(AuthContext);
const companyId = user.companyId;

useEffect(() => {
  if (!socket || !companyId) return;

  const eventTicket = `company-${companyId}-ticket`;
  const eventAppMessage = `company-${companyId}-appMessage`;

  const handleUpdate = (data) => {
    console.log(`[Socket] Event received:`, data);
    refetchTickets(); // Atualiza lista
  };

  socket.on(eventTicket, handleUpdate);
  socket.on(eventAppMessage, handleUpdate);

  return () => {
    socket.off(eventTicket, handleUpdate);
    socket.off(eventAppMessage, handleUpdate);
  };
}, [socket, companyId, refetchTickets]);
```

---

### 6.3. Transforma\u00e7\u00e3o de Dados - Fun\u00e7\u00e3o `popularCards`

**Prop\u00f3sito:** Transformar arrays `tags[]` e `tickets[]` na estrutura esperada pelo react-trello Board.

**Estrutura de Sa\u00edda:**
```typescript
{
  lanes: [
    {
      id: string,
      title: string,
      label: string, // contador
      style?: { backgroundColor: string, color: string },
      cards: [
        {
          id: string,
          title: ReactNode,
          label: string,
          description: ReactNode,
          draggable: boolean,
          href: string
        }
      ]
    }
  ]
}
```

**Implementa\u00e7\u00e3o Completa:**
```javascript
// Em /pages/Kanban/index.js
const popularCards = () => {
  // Lane 0: Tickets sem tag
  const ticketsSemTag = tickets.filter(ticket => ticket.tags.length === 0);

  const lane0 = {
    id: "lane0",
    title: i18n.t("tagsKanban.laneDefault"), // "Sem Etiqueta"
    label: ticketsSemTag.length.toString(),
    cards: ticketsSemTag.map(ticket => ({
      id: ticket.id.toString(),
      label: i18n.t("kanban.ticketNumber") + ticket.id.toString(),
      title: (
        <>
          <Tooltip title={ticket.whatsapp?.name}>
            {IconChannel(ticket.channel)}
          </Tooltip>
          {" "}
          {ticket.contact.name}
        </>
      ),
      description: (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>{ticket.contact.number}</span>
            <Typography
              className={Number(ticket.unreadMessages) > 0
                ? classes.lastMessageTimeUnread
                : classes.lastMessageTime}
              component="span"
              variant="body2"
            >
              {isSameDay(parseISO(ticket.updatedAt), new Date()) ? (
                <>{format(parseISO(ticket.updatedAt), "HH:mm")}</>
              ) : (
                <>{format(parseISO(ticket.updatedAt), "dd/MM/yyyy")}</>
              )}
            </Typography>
          </div>
          <div style={{ textAlign: 'left' }}>
            {ticket.lastMessage || " "}
          </div>
          <Button
            className={`${classes.button} ${classes.cardButton}`}
            onClick={() => handleCardClick(ticket.uuid)}
          >
            {i18n.t("kanban.viewTicket")}
          </Button>
          <span style={{ marginRight: '8px' }} />
          {ticket?.user && (
            <Badge
              style={{ backgroundColor: "#000000" }}
              className={classes.connectionTag}
            >
              {ticket.user.name.toUpperCase()}
            </Badge>
          )}
        </div>
      ),
      draggable: true,
      href: `/tickets/${ticket.uuid}`
    }))
  };

  // Lanes 1..N: Tags Kanban
  const lanesComTags = tags.map(tag => {
    const ticketsDaTag = tickets.filter(ticket =>
      ticket.tags.some(ticketTag => ticketTag.id === tag.id)
    );

    return {
      id: tag.id.toString(),
      title: tag.name,
      label: ticketsDaTag.length.toString(),
      style: {
        backgroundColor: tag.color,
        color: "white"
      },
      cards: ticketsDaTag.map(ticket => ({
        id: ticket.id.toString(),
        label: i18n.t("kanban.ticketNumber") + ticket.id.toString(),
        title: (
          <>
            <Tooltip title={ticket.whatsapp?.name}>
              {IconChannel(ticket.channel)}
            </Tooltip>
            {" "}
            {ticket.contact.name}
          </>
        ),
        description: (
          <div>
            <p>
              {ticket.contact.number}
              <br />
              {ticket.lastMessage || " "}
            </p>
            <Button
              className={`${classes.button} ${classes.cardButton}`}
              onClick={() => handleCardClick(ticket.uuid)}
            >
              {i18n.t("kanban.viewTicket")}
            </Button>
            <span style={{ marginRight: '8px' }} />
            <p>
              {ticket?.user && (
                <Badge
                  style={{ backgroundColor: "#000000" }}
                  className={classes.connectionTag}
                >
                  {ticket.user.name.toUpperCase()}
                </Badge>
              )}
            </p>
          </div>
        ),
        draggable: true,
        href: `/tickets/${ticket.uuid}`
      }))
    };
  });

  // Combina lanes
  const allLanes = [lane0, ...lanesComTags];

  setFile({ lanes: allLanes });
};

// Fun\u00e7\u00e3o auxiliar para \u00edcones de canal
const IconChannel = (channel) => {
  switch (channel) {
    case "facebook":
      return <Facebook style={{ color: "#3b5998", verticalAlign: "middle", fontSize: "16px" }} />;
    case "instagram":
      return <Instagram style={{ color: "#e1306c", verticalAlign: "middle", fontSize: "16px" }} />;
    case "whatsapp":
      return <WhatsApp style={{ color: "#25d366", verticalAlign: "middle", fontSize: "16px" }} />;
    default:
      return i18n.t("kanban.iconChannelError");
  }
};

// Executar quando tags ou tickets mudarem
useEffect(() => {
  if (tags.length > 0 || tickets.length > 0) {
    popularCards();
  }
}, [tags, tickets]);
```

---

## 7. Estrat\u00e9gia de Testes

### 7.1. Unit Tests (Jest + React Testing Library)

**Localiza\u00e7\u00e3o:** `frontend/src/__tests__/`

**Cobertura M\u00ednima:** 80%

#### Teste: useKanbanTags Hook

```javascript
// __tests__/hooks/useKanbanTags.test.js
import { renderHook, waitFor } from '@testing-library/react';
import useKanbanTags from '../../hooks/useKanbanTags';
import api from '../../services/api';
import { AuthContext } from '../../context/Auth/AuthContext';

jest.mock('../../services/api');

const wrapper = ({ children }) => (
  <AuthContext.Provider value={{ user: { companyId: 1 } }}>
    {children}
  </AuthContext.Provider>
);

describe('useKanbanTags', () => {
  it('deve buscar tags com sucesso', async () => {
    api.get.mockResolvedValueOnce({
      data: {
        lista: [
          { id: 1, name: "Tag 1", color: "#FF0000", kanban: 1 }
        ]
      }
    });

    const { result } = renderHook(() => useKanbanTags(), { wrapper });

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.tags).toHaveLength(1);
    expect(result.current.tags[0].name).toBe("Tag 1");
    expect(result.current.error).toBeNull();
  });

  it('deve tratar erro ao buscar tags', async () => {
    api.get.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useKanbanTags(), { wrapper });

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.tags).toHaveLength(0);
    expect(result.current.error).toBeTruthy();
  });
});
```

#### Teste: Kanban Page - 4 Estados UI

```javascript
// __tests__/pages/Kanban.test.js
import { render, screen, waitFor } from '@testing-library/react';
import Kanban from '../../pages/Kanban';
import api from '../../services/api';

jest.mock('../../services/api');
jest.mock('react-trello', () => ({
  __esModule: true,
  default: () => <div>Board Component</div>
}));

describe('Kanban Page - 4 Estados UI', () => {
  it('deve mostrar loading state inicialmente', () => {
    render(<Kanban />);
    expect(screen.getByTestId('backdrop-loading')).toBeInTheDocument();
  });

  it('deve mostrar happy path com dados', async () => {
    api.get.mockImplementation((url) => {
      if (url === '/tag/kanban') {
        return Promise.resolve({ data: { lista: [{ id: 1, name: "Tag 1", color: "#FF0000" }] } });
      }
      if (url === '/ticket/kanban') {
        return Promise.resolve({ data: { tickets: [{ id: 1, contact: { name: "Test" }, tags: [] }] } });
      }
    });

    render(<Kanban />);

    await waitFor(() => {
      expect(screen.getByText('Board Component')).toBeInTheDocument();
    });
  });

  it('deve mostrar empty state quando n\u00e3o h\u00e1 tags', async () => {
    api.get.mockImplementation((url) => {
      if (url === '/tag/kanban') {
        return Promise.resolve({ data: { lista: [] } });
      }
    });

    render(<Kanban />);

    await waitFor(() => {
      expect(screen.getByText(/nenhuma tag kanban criada/i)).toBeInTheDocument();
    });
  });

  it('deve mostrar error state ao falhar busca', async () => {
    api.get.mockRejectedValueOnce(new Error('API error'));

    render(<Kanban />);

    await waitFor(() => {
      expect(screen.getByText(/erro ao carregar/i)).toBeInTheDocument();
      expect(screen.getByText(/tentar novamente/i)).toBeInTheDocument();
    });
  });
});
```

#### Teste: Fun\u00e7\u00e3o popularCards

```javascript
// __tests__/utils/popularCards.test.js
import { popularCards } from '../../pages/Kanban/utils';

describe('popularCards', () => {
  it('deve criar lane padr\u00e3o para tickets sem tag', () => {
    const tags = [];
    const tickets = [
      { id: 1, tags: [], contact: { name: "Test" } }
    ];

    const result = popularCards(tags, tickets);

    expect(result.lanes).toHaveLength(1);
    expect(result.lanes[0].id).toBe("lane0");
    expect(result.lanes[0].cards).toHaveLength(1);
  });

  it('deve criar lanes para cada tag', () => {
    const tags = [
      { id: 1, name: "Tag 1", color: "#FF0000" },
      { id: 2, name: "Tag 2", color: "#00FF00" }
    ];
    const tickets = [
      { id: 1, tags: [{ id: 1 }], contact: { name: "Test 1" } },
      { id: 2, tags: [{ id: 2 }], contact: { name: "Test 2" } }
    ];

    const result = popularCards(tags, tickets);

    expect(result.lanes).toHaveLength(3); // lane0 + 2 tags
    expect(result.lanes[1].title).toBe("Tag 1");
    expect(result.lanes[2].title).toBe("Tag 2");
  });

  it('deve contar tickets corretamente por lane', () => {
    const tags = [{ id: 1, name: "Tag 1", color: "#FF0000" }];
    const tickets = [
      { id: 1, tags: [{ id: 1 }], contact: { name: "Test 1" } },
      { id: 2, tags: [{ id: 1 }], contact: { name: "Test 2" } },
      { id: 3, tags: [], contact: { name: "Test 3" } }
    ];

    const result = popularCards(tags, tickets);

    expect(result.lanes[0].label).toBe("1"); // lane0: 1 ticket
    expect(result.lanes[1].label).toBe("2"); // tag 1: 2 tickets
  });
});
```

---

### 7.2. E2E Tests (Playwright)

**Localiza\u00e7\u00e3o:** `e2e/kanban/`

#### Teste: Drag and Drop entre Lanes

```javascript
// e2e/kanban/dnd.spec.js
import { test, expect } from '@playwright/test';

test.describe('Kanban - Drag and Drop', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('[name="email"]', 'admin@test.com');
    await page.fill('[name="password"]', 'password');
    await page.click('button[type="submit"]');

    // Navegar para Kanban
    await page.goto('/kanban');
    await page.waitForLoadState('networkidle');
  });

  test('deve mover ticket da Lane 0 para Lane 1', async ({ page }) => {
    // Localizar card na Lane 0
    const card = page.locator('[data-lane-id="lane0"] [data-card-id="42"]').first();
    const targetLane = page.locator('[data-lane-id="1"]');

    // Executar drag
    await card.dragTo(targetLane);

    // Validar API call
    await page.waitForRequest(req =>
      req.url().includes('/ticket-tags/42/1') && req.method() === 'PUT'
    );

    // Validar UI update (card moveu)
    await expect(page.locator('[data-lane-id="1"] [data-card-id="42"]')).toBeVisible();
    await expect(page.locator('[data-lane-id="lane0"] [data-card-id="42"]')).not.toBeVisible();
  });

  test('deve exibir toast de sucesso ap\u00f3s mover ticket', async ({ page }) => {
    const card = page.locator('[data-lane-id="lane0"] [data-card-id="42"]').first();
    const targetLane = page.locator('[data-lane-id="1"]');

    await card.dragTo(targetLane);

    // Validar toast
    await expect(page.locator('.Toastify__toast--success')).toBeVisible();
    await expect(page.locator('.Toastify__toast--success')).toContainText(/ticket movido/i);
  });
});
```

#### Teste: Filtros de Data

```javascript
// e2e/kanban/filters.spec.js
import { test, expect } from '@playwright/test';

test.describe('Kanban - Filtros de Data', () => {
  test('deve filtrar tickets por per\u00edodo', async ({ page }) => {
    await page.goto('/kanban');

    // Definir datas
    await page.fill('[name="startDate"]', '2025-10-01');
    await page.fill('[name="endDate"]', '2025-10-13');

    // Clicar em Buscar
    await page.click('button:has-text("Buscar")');

    // Validar API call com params corretos
    await page.waitForRequest(req => {
      const url = new URL(req.url());
      return url.pathname.includes('/ticket/kanban') &&
             url.searchParams.get('startDate') === '2025-10-01' &&
             url.searchParams.get('endDate') === '2025-10-13';
    });

    // Validar Board recarregou
    await expect(page.locator('[data-testid="kanban-board"]')).toBeVisible();
  });
});
```

#### Teste: Real-time via Socket.IO

```javascript
// e2e/kanban/realtime.spec.js
import { test, expect } from '@playwright/test';

test.describe('Kanban - Real-time Socket.IO', () => {
  test('deve atualizar Board quando outro usu\u00e1rio move ticket', async ({ browser }) => {
    // Abrir 2 abas (simula 2 usu\u00e1rios)
    const context = await browser.newContext();
    const page1 = await context.newPage();
    const page2 = await context.newPage();

    // Login nas 2 abas
    await page1.goto('/login');
    await page1.fill('[name="email"]', 'user1@test.com');
    await page1.fill('[name="password"]', 'password');
    await page1.click('button[type="submit"]');

    await page2.goto('/login');
    await page2.fill('[name="email"]', 'user2@test.com');
    await page2.fill('[name="password"]', 'password');
    await page2.click('button[type="submit"]');

    // Ambas v\u00e3o para Kanban
    await page1.goto('/kanban');
    await page2.goto('/kanban');

    // User1 move ticket
    const card = page1.locator('[data-card-id="42"]').first();
    const targetLane = page1.locator('[data-lane-id="1"]');
    await card.dragTo(targetLane);

    // Validar que page2 atualizou automaticamente
    await page2.waitForTimeout(1000); // Socket.IO latency
    await expect(page2.locator('[data-lane-id="1"] [data-card-id="42"]')).toBeVisible();
  });
});
```

---

### 7.3. Testes de Multi-Tenant

```javascript
// e2e/kanban/multi-tenant.spec.js
import { test, expect } from '@playwright/test';

test.describe('Kanban - Isolamento Multi-Tenant', () => {
  test('deve isolar tickets por companyId', async ({ browser }) => {
    const context = await browser.newContext();

    // User da Company 1
    const page1 = await context.newPage();
    await page1.goto('/login');
    await page1.fill('[name="email"]', 'company1@test.com');
    await page1.fill('[name="password"]', 'password');
    await page1.click('button[type="submit"]');
    await page1.goto('/kanban');

    const tickets1 = await page1.locator('[data-testid="ticket-card"]').count();

    // User da Company 2
    const page2 = await context.newPage();
    await page2.goto('/login');
    await page2.fill('[name="email"]', 'company2@test.com');
    await page2.fill('[name="password"]', 'password');
    await page2.click('button[type="submit"]');
    await page2.goto('/kanban');

    const tickets2 = await page2.locator('[data-testid="ticket-card"]').count();

    // Validar que n\u00famero de tickets \u00e9 diferente (isola\u00e7\u00e3o)
    expect(tickets1).not.toBe(tickets2);

    // Validar que nenhum ticket da Company 1 aparece na Company 2
    const ticket1Id = await page1.locator('[data-card-id]').first().getAttribute('data-card-id');
    await expect(page2.locator(`[data-card-id="${ticket1Id}"]`)).not.toBeVisible();
  });
});
```

---

## 8. Acessibilidade (A11y)

### 8.1. Checklist WCAG AA

**Contraste de Cores:**
- [ ] Validar contraste m\u00ednimo 4.5:1 entre texto e background
- [ ] Testar com ferramenta: https://webaim.org/resources/contrastchecker/
- [ ] Cards com fundo escuro devem ter texto branco (#FFFFFF)
- [ ] Bot\u00f5es prim\u00e1rios: validar contraste do Material-UI theme

**ARIA Labels:**
```javascript
// Bot\u00f5es sem texto vis\u00edvel
<IconButton
  aria-label={i18n.t("kanban.addColumns")}
  onClick={handleAddConnectionClick}
>
  <AddIcon />
</IconButton>

// \u00cdcones de canal
<Tooltip title={ticket.whatsapp?.name}>
  <span role="img" aria-label={`Canal ${ticket.channel}`}>
    {IconChannel(ticket.channel)}
  </span>
</Tooltip>

// Cards dragg\u00e1veis
<div
  role="button"
  tabIndex={0}
  aria-label={`Ticket ${ticket.id} - ${ticket.contact.name}`}
  draggable
>
  {/* conte\u00fado do card */}
</div>
```

**Navega\u00e7\u00e3o por Teclado:**
- [ ] Tab: Navegar entre filtros, bot\u00f5es e cards
- [ ] Enter: Abrir ticket ao focar card
- [ ] Esc: Fechar modal (TagModal)
- [ ] Arrow Keys: Navegar entre cards dentro de uma lane (ideal, mas react-trello pode n\u00e3o suportar)

**Focus Indicators:**
```css
/* Em styles.js */
const useStyles = makeStyles(theme => ({
  cardButton: {
    "&:focus": {
      outline: "2px solid " + theme.palette.primary.main,
      outlineOffset: "2px"
    }
  },
  dateInput: {
    "& input:focus": {
      outline: "2px solid " + theme.palette.primary.main,
      outlineOffset: "2px"
    }
  }
}));
```

**Screen Reader:**
- [ ] Testar com NVDA (Windows) ou VoiceOver (macOS)
- [ ] Validar que contador de tickets \u00e9 anunciado: "Lane Aguardando, 5 tickets"
- [ ] Validar que a\u00e7\u00e3o de DnD \u00e9 anunciada: "Ticket movido de Aguardando para Em Atendimento"

---

### 8.2. Implementa\u00e7\u00e3o A11y no Board

**Anunciar DnD para Screen Readers:**
```javascript
// Em /pages/Kanban/index.js
const [announcement, setAnnouncement] = useState("");

const handleCardMove = async (cardId, sourceLaneId, targetLaneId) => {
  const sourceTag = tags.find(t => t.id.toString() === sourceLaneId) || { name: "Sem Etiqueta" };
  const targetTag = tags.find(t => t.id.toString() === targetLaneId) || { name: "Sem Etiqueta" };

  setAnnouncement(
    i18n.t("kanban.a11yMoving", {
      ticketId: cardId,
      from: sourceTag.name,
      to: targetTag.name
    })
  );

  await moveTicket(cardId, sourceLaneId, targetLaneId);

  setAnnouncement(
    i18n.t("kanban.a11yMoved", {
      ticketId: cardId,
      to: targetTag.name
    })
  );
};

return (
  <>
    {/* Live region para Screen Reader */}
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      style={{
        position: 'absolute',
        left: '-10000px',
        width: '1px',
        height: '1px',
        overflow: 'hidden'
      }}
    >
      {announcement}
    </div>

    {/* Board */}
    <Board ... />
  </>
);
```

**Chaves de Tradu\u00e7\u00e3o (i18n):**
```json
{
  "kanban": {
    "a11yMoving": "Movendo ticket {{ticketId}} de {{from}} para {{to}}",
    "a11yMoved": "Ticket {{ticketId}} movido para {{to}}",
    "addColumns": "Adicionar colunas Kanban"
  }
}
```

---

## 9. i18n (5 idiomas)

### 9.1. Estrutura de Tradu\u00e7\u00f5es

**Localiza\u00e7\u00e3o:** `frontend/src/translate/languages/`

**Arquivos a Atualizar:**
- `pt.json` (Portugu\u00eas - Brasil)
- `en.json` (Ingl\u00eas)
- `es.json` (Espanhol)
- `tr.json` (Turco)
- `ar.json` (\u00c1rabe)

---

### 9.2. Chaves de Tradu\u00e7\u00e3o - pt.json

```json
{
  "kanban": {
    "title": "Kanban",
    "subtitle": "Visualiza\u00e7\u00e3o de tickets em formato Kanban",
    "startDate": "Data In\u00edcio",
    "endDate": "Data Fim",
    "search": "Buscar",
    "addColumns": "Adicionar Colunas",
    "viewTicket": "Ver Ticket",
    "ticketNumber": "Ticket #",
    "iconChannelError": "Canal desconhecido",
    "ticketTagRemoved": "Etiqueta removida com sucesso",
    "ticketTagAdded": "Etiqueta adicionada com sucesso",
    "ticketMoveError": "Erro ao mover ticket",
    "emptyStateTags": "Nenhuma tag Kanban criada",
    "emptyStateTagsDescription": "Crie sua primeira tag Kanban para come\u00e7ar a organizar tickets",
    "createFirstTag": "Criar Primeira Tag",
    "emptyStateTickets": "Nenhum ticket encontrado",
    "emptyStateTicketsDescription": "Ajuste os filtros de data ou crie novos tickets",
    "errorTitle": "Erro ao carregar Kanban",
    "errorDescription": "Ocorreu um erro ao buscar dados. Tente novamente.",
    "retry": "Tentar Novamente",
    "a11yMoving": "Movendo ticket {{ticketId}} de {{from}} para {{to}}",
    "a11yMoved": "Ticket {{ticketId}} movido para {{to}}"
  },
  "tagsKanban": {
    "title": "Tags Kanban",
    "laneDefault": "Sem Etiqueta",
    "table": {
      "name": "Nome",
      "tickets": "Tickets",
      "actions": "A\u00e7\u00f5es"
    },
    "buttons": {
      "add": "Adicionar",
      "backToKanban": "Voltar para Kanban"
    },
    "confirmationModal": {
      "deleteTitle": "Excluir Tag Kanban",
      "deleteMessage": "Tem certeza que deseja excluir esta tag? Tickets associados n\u00e3o ser\u00e3o deletados."
    },
    "toasts": {
      "deleted": "Tag Kanban exclu\u00edda com sucesso"
    }
  }
}
```

---

### 9.3. Chaves de Tradu\u00e7\u00e3o - en.json

```json
{
  "kanban": {
    "title": "Kanban",
    "subtitle": "Ticket visualization in Kanban format",
    "startDate": "Start Date",
    "endDate": "End Date",
    "search": "Search",
    "addColumns": "Add Columns",
    "viewTicket": "View Ticket",
    "ticketNumber": "Ticket #",
    "iconChannelError": "Unknown channel",
    "ticketTagRemoved": "Tag removed successfully",
    "ticketTagAdded": "Tag added successfully",
    "ticketMoveError": "Error moving ticket",
    "emptyStateTags": "No Kanban tags created",
    "emptyStateTagsDescription": "Create your first Kanban tag to start organizing tickets",
    "createFirstTag": "Create First Tag",
    "emptyStateTickets": "No tickets found",
    "emptyStateTicketsDescription": "Adjust date filters or create new tickets",
    "errorTitle": "Error loading Kanban",
    "errorDescription": "An error occurred while fetching data. Please try again.",
    "retry": "Try Again",
    "a11yMoving": "Moving ticket {{ticketId}} from {{from}} to {{to}}",
    "a11yMoved": "Ticket {{ticketId}} moved to {{to}}"
  },
  "tagsKanban": {
    "title": "Kanban Tags",
    "laneDefault": "No Label",
    "table": {
      "name": "Name",
      "tickets": "Tickets",
      "actions": "Actions"
    },
    "buttons": {
      "add": "Add",
      "backToKanban": "Back to Kanban"
    },
    "confirmationModal": {
      "deleteTitle": "Delete Kanban Tag",
      "deleteMessage": "Are you sure you want to delete this tag? Associated tickets will not be deleted."
    },
    "toasts": {
      "deleted": "Kanban tag deleted successfully"
    }
  }
}
```

---

### 9.4. Chaves de Tradu\u00e7\u00e3o - es.json

```json
{
  "kanban": {
    "title": "Kanban",
    "subtitle": "Visualizaci\u00f3n de tickets en formato Kanban",
    "startDate": "Fecha Inicio",
    "endDate": "Fecha Fin",
    "search": "Buscar",
    "addColumns": "Agregar Columnas",
    "viewTicket": "Ver Ticket",
    "ticketNumber": "Ticket #",
    "iconChannelError": "Canal desconocido",
    "ticketTagRemoved": "Etiqueta eliminada con \u00e9xito",
    "ticketTagAdded": "Etiqueta agregada con \u00e9xito",
    "ticketMoveError": "Error al mover ticket",
    "emptyStateTags": "Ning\u00fana etiqueta Kanban creada",
    "emptyStateTagsDescription": "Crea tu primera etiqueta Kanban para comenzar a organizar tickets",
    "createFirstTag": "Crear Primera Etiqueta",
    "emptyStateTickets": "Ning\u00fan ticket encontrado",
    "emptyStateTicketsDescription": "Ajusta los filtros de fecha o crea nuevos tickets",
    "errorTitle": "Error al cargar Kanban",
    "errorDescription": "Ocurri\u00f3 un error al buscar datos. Int\u00e9ntalo de nuevo.",
    "retry": "Intentar Nuevamente",
    "a11yMoving": "Moviendo ticket {{ticketId}} de {{from}} a {{to}}",
    "a11yMoved": "Ticket {{ticketId}} movido a {{to}}"
  },
  "tagsKanban": {
    "title": "Etiquetas Kanban",
    "laneDefault": "Sin Etiqueta",
    "table": {
      "name": "Nombre",
      "tickets": "Tickets",
      "actions": "Acciones"
    },
    "buttons": {
      "add": "Agregar",
      "backToKanban": "Volver a Kanban"
    },
    "confirmationModal": {
      "deleteTitle": "Eliminar Etiqueta Kanban",
      "deleteMessage": "\u00bfEst\u00e1s seguro de que deseas eliminar esta etiqueta? Los tickets asociados no ser\u00e1n eliminados."
    },
    "toasts": {
      "deleted": "Etiqueta Kanban eliminada con \u00e9xito"
    }
  }
}
```

---

### 9.5. Uso de i18n nos Componentes

```javascript
// Em /pages/Kanban/index.js
import { i18n } from "../../translate/i18n";

const Kanban = () => {
  return (
    <div>
      <Typography variant="h4">
        {i18n.t("kanban.title")}
      </Typography>

      <TextField
        label={i18n.t("kanban.startDate")}
        type="date"
        value={startDate}
        onChange={handleStartDateChange}
      />

      <Button onClick={handleSearchClick}>
        {i18n.t("kanban.search")}
      </Button>

      <Button onClick={() => history.push('/tagsKanban')}>
        {i18n.t("kanban.addColumns")}
      </Button>
    </div>
  );
};
```

**Hook useTranslation (alternativa):**
```javascript
import { useTranslation } from "react-i18next";

const Kanban = () => {
  const { t } = useTranslation();

  return (
    <div>
      <Typography variant="h4">{t("kanban.title")}</Typography>
    </div>
  );
};
```

---

### 9.6. Checklist de i18n

**Valida\u00e7\u00e3o:**
- [ ] Todas as strings vis\u00edveis ao usu\u00e1rio est\u00e3o em arquivos de tradu\u00e7\u00e3o
- [ ] Chaves seguem padr\u00e3o: `kanban.*` e `tagsKanban.*`
- [ ] Tradu\u00e7\u00f5es replicadas para 5 idiomas (pt, en, es, tr, ar)
- [ ] Testar com idioma diferente do default:
  ```javascript
  // No navegador, localStorage
  localStorage.setItem('i18nextLng', 'en');
  // Recarregar p\u00e1gina
  ```
- [ ] Valida\u00e7\u00e3o visual: Nenhum texto hardcoded em ingl\u00eas/portugu\u00eas
- [ ] Toasts e mensagens de erro traduzidas
- [ ] ARIA labels traduzidos

**Nota:** Para turco (tr) e \u00e1rabe (ar), se n\u00e3o houver tradu\u00e7\u00e3o dispon\u00edvel, usar ingl\u00eas como fallback.

---

## Conclus\u00e3o

Este plano detalha todas as etapas necess\u00e1rias para implementar o Kanban V2 com Drag and Drop no frontend do ChatIA Flow. A implementa\u00e7\u00e3o deve seguir a ordem de commits especificada, garantindo que cada etapa seja testada antes de prosseguir.

**Pr\u00f3ximos Passos:**
1. Revisar e aprovar este plano
2. Implementar Commit 1 (Setup e Feature Flag)
3. Validar em ambiente dev com FEATURE_KANBAN_V2=true
4. Prosseguir sequencialmente at\u00e9 Commit 8
5. Deploy em staging para testes finais
6. Rollout gradual em produ\u00e7\u00e3o (10% → 50% → 100%)

**Estimativa Total:** 16h de implementa\u00e7\u00e3o + 4h de testes = 20h (~2.5 dias)

**Depend\u00eancias Cr\u00edticas:**
- Backend j\u00e1 completo e funcional \u2705
- react-trello 2.2.11 compat\u00edvel com React 17 \u2705
- Socket.IO Client 4.7.4 instalado \u2705
- AuthContext fornecendo user e socket \u2705

**Riscos Mitigados:**
- Feature flag permite rollback instant\u00e2neo
- C\u00f3digo portado da refer\u00eancia (testado em prod)
- 4 estados UI garantem UX resiliente
- Multi-tenant validado em todos os hooks
- Testes E2E cobrem cen\u00e1rios cr\u00edticos

---

**Documento Criado por:** Frontend Architecture Planner
**Data:** 2025-10-13
**Vers\u00e3o:** 1.0
**Status:** Pronto para Implementa\u00e7\u00e3o \u2705
