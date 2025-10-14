# Especifica\u00e7\u00e3o de Hooks Customizados - Kanban V2

**Vers\u00e3o:** 1.0
**Data:** 2025-10-13

---

## \u00cdndice

1. [useKanbanTags](#1-usekanbantags)
2. [useKanbanTickets](#2-usekanbantickets)
3. [useSocketKanban](#3-usesocketkanban)
4. [useMoveTicket](#4-usemoveticket)

---

## 1. useKanbanTags

**Arquivo:** `frontend/src/hooks/useKanbanTags/index.js`

**Prop\u00f3sito:** Buscar tags configuradas como colunas Kanban (kanban=1).

### Assinatura

```typescript
function useKanbanTags(): {
  tags: Tag[];
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}
```

### Par\u00e2metros
Nenhum (usa AuthContext internamente).

### Retorno

| Campo | Tipo | Descri\u00e7\u00e3o |
|-------|------|-------------|
| `tags` | `Tag[]` | Array de tags com kanban=1 |
| `loading` | `boolean` | true durante fetch, false ap\u00f3s conclus\u00e3o |
| `error` | `Error \| null` | Erro caso fetch falhe |
| `refetch` | `() => void` | Fun\u00e7\u00e3o para refazer fetch manualmente |

### Interface Tag

```typescript
interface Tag {
  id: number;
  name: string;
  color: string; // HEX color
  kanban: number; // 1 = Kanban, 0 = Normal
  companyId: number;
  timeLane?: number | null;
  nextLaneId?: number | null;
  greetingMessageLane?: string | null;
  rollbackLaneId?: number | null;
  createdAt: string;
  updatedAt: string;
}
```

### Implementa\u00e7\u00e3o

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

### Exemplo de Uso

```javascript
import useKanbanTags from "../../hooks/useKanbanTags";

const Kanban = () => {
  const { tags, loading, error, refetch } = useKanbanTags();

  useEffect(() => {
    console.log("Tags carregadas:", tags);
  }, [tags]);

  if (loading) return <BackdropLoading />;
  if (error) return <ErrorState onRetry={refetch} />;

  return (
    <div>
      {tags.map(tag => (
        <div key={tag.id} style={{ backgroundColor: tag.color }}>
          {tag.name}
        </div>
      ))}
    </div>
  );
};
```

### Testes

```javascript
// __tests__/hooks/useKanbanTags.test.js
import { renderHook, waitFor } from '@testing-library/react';
import useKanbanTags from '../../hooks/useKanbanTags';
import api from '../../services/api';

jest.mock('../../services/api');

describe('useKanbanTags', () => {
  it('deve buscar tags com sucesso', async () => {
    api.get.mockResolvedValueOnce({
      data: { lista: [{ id: 1, name: "Tag 1", color: "#FF0000", kanban: 1 }] }
    });

    const { result } = renderHook(() => useKanbanTags());

    expect(result.current.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.tags).toHaveLength(1);
    expect(result.current.tags[0].name).toBe("Tag 1");
  });

  it('deve tratar erro', async () => {
    api.get.mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useKanbanTags());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.error).toBeTruthy();
    expect(result.current.tags).toHaveLength(0);
  });
});
```

---

## 2. useKanbanTickets

**Arquivo:** `frontend/src/hooks/useKanbanTickets/index.js`

**Prop\u00f3sito:** Buscar tickets para Kanban com filtros de data e fila.

### Assinatura

```typescript
function useKanbanTickets(
  queueIds: number[],
  startDate: string,
  endDate: string
): {
  tickets: Ticket[];
  loading: boolean;
  error: Error | null;
  refetch: () => void;
}
```

### Par\u00e2metros

| Par\u00e2metro | Tipo | Descri\u00e7\u00e3o |
|----------|------|-------------|
| `queueIds` | `number[]` | Array de IDs das filas do usu\u00e1rio (de AuthContext) |
| `startDate` | `string` | Data inicial no formato "yyyy-MM-dd" |
| `endDate` | `string` | Data final no formato "yyyy-MM-dd" |

### Retorno

| Campo | Tipo | Descri\u00e7\u00e3o |
|-------|------|-------------|
| `tickets` | `Ticket[]` | Array de tickets filtrados |
| `loading` | `boolean` | true durante fetch |
| `error` | `Error \| null` | Erro caso fetch falhe |
| `refetch` | `() => void` | Fun\u00e7\u00e3o para refazer fetch |

### Interface Ticket

```typescript
interface Ticket {
  id: number;
  uuid: string;
  status: "pending" | "open" | "closed";
  unreadMessages: number;
  companyId: number;
  queueId: number | null;
  userId: number | null;
  contactId: number;
  whatsappId: number | null;
  channel: "whatsapp" | "facebook" | "instagram";
  lastMessage: string;
  updatedAt: string;
  contact: Contact;
  queue?: Queue;
  user?: User;
  tags: Tag[];
  whatsapp?: Whatsapp;
}

interface Contact {
  id: number;
  name: string;
  number: string;
  email?: string;
  urlPicture?: string;
}

interface Queue {
  id: number;
  name: string;
  color: string;
}

interface User {
  id: number;
  name: string;
}

interface Whatsapp {
  name: string;
}
```

### Implementa\u00e7\u00e3o

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
  }, [user, JSON.stringify(queueIds), startDate, endDate]);

  return { tickets, loading, error, refetch: fetchTickets };
};

export default useKanbanTickets;
```

### Exemplo de Uso

```javascript
import { format } from "date-fns";
import useKanbanTickets from "../../hooks/useKanbanTickets";

const Kanban = () => {
  const { user } = useContext(AuthContext);
  const [startDate, setStartDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [endDate, setEndDate] = useState(format(new Date(), "yyyy-MM-dd"));

  const queueIds = user.queues.map(q => q.UserQueue.queueId);

  const { tickets, loading, error, refetch } = useKanbanTickets(queueIds, startDate, endDate);

  const handleSearch = () => {
    refetch(); // Refetch com novos filtros
  };

  return (
    <div>
      <TextField
        type="date"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
      />
      <TextField
        type="date"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
      />
      <Button onClick={handleSearch}>Buscar</Button>

      {loading ? <BackdropLoading /> : (
        <div>
          {tickets.map(ticket => (
            <div key={ticket.id}>{ticket.contact.name}</div>
          ))}
        </div>
      )}
    </div>
  );
};
```

---

## 3. useSocketKanban

**Arquivo:** `frontend/src/hooks/useSocketKanban/index.js`

**Prop\u00f3sito:** Conectar listeners Socket.IO para atualiza\u00e7\u00f5es real-time de tickets.

### Assinatura

```typescript
function useSocketKanban(
  socket: Socket,
  companyId: number,
  onUpdate: () => void
): void
```

### Par\u00e2metros

| Par\u00e2metro | Tipo | Descri\u00e7\u00e3o |
|----------|------|-------------|
| `socket` | `Socket` | Inst\u00e2ncia do Socket.IO (de AuthContext) |
| `companyId` | `number` | ID da empresa (de AuthContext) |
| `onUpdate` | `() => void` | Callback executado quando evento chega |

### Retorno
Nenhum (side effects apenas).

### Implementa\u00e7\u00e3o

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

### Exemplo de Uso

```javascript
import useSocketKanban from "../../hooks/useSocketKanban";

const Kanban = () => {
  const { user, socket } = useContext(AuthContext);
  const { refetch: refetchTickets } = useKanbanTickets(...);

  // Conectar Socket.IO
  useSocketKanban(socket, user.companyId, refetchTickets);

  return <Board ... />;
};
```

### Eventos Socket.IO

**Namespace:** `/workspace-{companyId}`

**Eventos Subscritos:**

1. **`company-{companyId}-ticket`**
   - Emitido: Ticket criado/atualizado/deletado
   - Payload: `{ action: "create"|"update"|"delete", ticket: {...} }`

2. **`company-{companyId}-appMessage`**
   - Emitido: Nova mensagem enviada/recebida
   - Payload: `{ action: "create", message: {...} }`

---

## 4. useMoveTicket

**Arquivo:** `frontend/src/hooks/useMoveTicket/index.js`

**Prop\u00f3sito:** Mover ticket entre lanes (tags) com l\u00f3gica de DELETE + PUT e rollback.

### Assinatura

```typescript
function useMoveTicket(): {
  moveTicket: (ticketId: number, oldTagId: string | null, newTagId: string | null) => Promise<void>;
  loading: boolean;
}
```

### Par\u00e2metros
Nenhum.

### Retorno

| Campo | Tipo | Descri\u00e7\u00e3o |
|-------|------|-------------|
| `moveTicket` | `(ticketId, oldTagId, newTagId) => Promise<void>` | Fun\u00e7\u00e3o para mover ticket |
| `loading` | `boolean` | true durante opera\u00e7\u00e3o de move |

### Fun\u00e7\u00e3o `moveTicket`

**Par\u00e2metros:**

| Par\u00e2metro | Tipo | Descri\u00e7\u00e3o |
|----------|------|-------------|
| `ticketId` | `number` | ID do ticket sendo movido |
| `oldTagId` | `string \| null` | ID da tag antiga (ou "lane0" ou null) |
| `newTagId` | `string \| null` | ID da tag nova (ou "lane0" ou null) |

**Fluxo:**

1. **Remover tag antiga** (se existir e n\u00e3o for "lane0"):
   ```
   DELETE /ticket-tags/{ticketId}
   ```

2. **Adicionar nova tag** (se n\u00e3o for "lane0"):
   ```
   PUT /ticket-tags/{ticketId}/{newTagId}
   ```

3. **Rollback em caso de erro:**
   - Tentar restaurar tag antiga
   - Exibir toast de erro

### Implementa\u00e7\u00e3o

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

### Exemplo de Uso

```javascript
import useMoveTicket from "../../hooks/useMoveTicket";

const Kanban = () => {
  const { moveTicket, loading: moveLoading } = useMoveTicket();

  const handleCardMove = async (cardId, sourceLaneId, targetLaneId) => {
    // cardId = ticketId (string)
    // sourceLaneId = oldTagId (string ou "lane0")
    // targetLaneId = newTagId (string ou "lane0")

    const ticketId = parseInt(cardId);
    const oldTagId = sourceLaneId === "lane0" ? null : sourceLaneId;
    const newTagId = targetLaneId === "lane0" ? null : targetLaneId;

    await moveTicket(ticketId, oldTagId, newTagId);
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

### Tratamento de Erros

**Cenário 1: DELETE falha**
- N\u00e3o executa PUT
- Exibe toast de erro
- Ticket permanece na lane original

**Cenário 2: PUT falha**
- DELETE j\u00e1 foi executado
- Tenta rollback (PUT com oldTagId)
- Se rollback sucesso: Toast "Erro - Rollback aplicado"
- Se rollback falha: Toast "Erro - Rollback falhou"

**Cenário 3: Socket.IO n\u00e3o emite evento**
- Frontend n\u00e3o atualiza automaticamente
- Usu\u00e1rio pode refazer fetch manualmente (bot\u00e3o "Buscar")

---

## Resumo de Hooks

| Hook | Par\u00e2metros | Retorno | Prop\u00f3sito |
|------|----------|---------|-----------|
| **useKanbanTags** | Nenhum | `{tags, loading, error, refetch}` | Buscar tags Kanban (kanban=1) |
| **useKanbanTickets** | `queueIds, startDate, endDate` | `{tickets, loading, error, refetch}` | Buscar tickets com filtros |
| **useSocketKanban** | `socket, companyId, onUpdate` | Nenhum | Conectar Socket.IO listeners |
| **useMoveTicket** | Nenhum | `{moveTicket, loading}` | Mover ticket entre tags (DnD) |

---

## Depend\u00eancias Comuns

Todos os hooks dependem de:

```javascript
// Contexts
import { AuthContext } from "../../context/Auth/AuthContext";

// API
import api from "../../services/api";

// Utils
import toastError from "../../errors/toastError";
import { toast } from "react-toastify";
import { i18n } from "../../translate/i18n";
```

---

## Conven\u00e7\u00f5es

1. **Naming:** Todos os hooks customizados come\u00e7am com "use"
2. **Return:** Sempre retornar objeto (n\u00e3o array) para clareza
3. **Loading:** Sempre incluir estado `loading`
4. **Error Handling:** Usar `toastError` + retornar `error`
5. **Cleanup:** Sempre fazer cleanup em `useEffect` (Socket.IO listeners)
6. **Multi-tenant:** Sempre usar `companyId` de `AuthContext`
7. **Refetch:** Expor fun\u00e7\u00e3o `refetch` para controle manual

---

**Documento Criado por:** Frontend Architecture Planner
**Data:** 2025-10-13
**Vers\u00e3o:** 1.0
