# API Endpoints - Kanban

**Data:** 2025-10-13
**Versão:** 1.0
**Status:** ✅ DOCUMENTAÇÃO OFICIAL

---

## Sumário

1. [Introdução](#introdução)
2. [Autenticação](#autenticação)
3. [Endpoints](#endpoints)
   - [GET /tag/kanban](#get-tagkanban)
   - [GET /ticket/kanban](#get-ticketkanban)
   - [PUT /ticket-tags/:ticketId/:tagId](#put-ticket-tagsticketidtagid)
   - [DELETE /ticket-tags/:ticketId](#delete-ticket-tagsticketid)
4. [Fluxo Drag and Drop](#fluxo-drag-and-drop)
5. [Socket.IO Events](#socketio-events)
6. [Exemplos de Uso](#exemplos-de-uso)
7. [Códigos de Erro](#códigos-de-erro)
8. [FAQ](#faq)

---

## Introdução

Esta documentação descreve os endpoints da API Kanban do ChatIA Flow. Estes endpoints permitem:

- Listar colunas (tags) do Kanban
- Listar tickets filtrados por tags, datas, filas e usuários
- Mover tickets entre colunas (drag and drop)
- Receber atualizações em tempo real via Socket.IO

**Base URL:**
- Development: `http://localhost:8080`
- Production: `https://api.chatiaflow.com`

**Isolamento Multi-Tenant:**
Todos os recursos são isolados por empresa (`companyId`). O ID da empresa é extraído automaticamente do JWT token.

---

## Autenticação

Todos os endpoints requerem autenticação via JWT Bearer token.

### Header de Autenticação

```http
Authorization: Bearer <seu-jwt-token>
```

### Estrutura do Token JWT

O token deve conter os seguintes campos:

```json
{
  "id": "1",
  "username": "maria.santos",
  "profile": "admin",
  "companyId": 1,
  "iat": 1705320000,
  "exp": 1705406400
}
```

### Obter Token

```javascript
// Exemplo de login
const response = await fetch('http://localhost:8080/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'maria@example.com',
    password: 'senha123'
  })
});

const { token } = await response.json();
```

### Usar Token

```javascript
const response = await fetch('http://localhost:8080/tag/kanban', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

---

## Endpoints

### GET /tag/kanban

Lista todas as tags configuradas como colunas Kanban (kanban=1) da empresa.

#### Request

```http
GET /tag/kanban HTTP/1.1
Host: localhost:8080
Authorization: Bearer <token>
```

#### Response 200 OK

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
      "greetingMessageLane": "Olá! Em que posso ajudar?",
      "rollbackLaneId": null,
      "createdAt": "2024-01-15T10:00:00.000Z",
      "updatedAt": "2024-01-15T10:00:00.000Z"
    },
    {
      "id": 2,
      "name": "Em Atendimento",
      "color": "#4CAF50",
      "kanban": 1,
      "companyId": 1,
      "timeLane": 7200,
      "nextLaneId": 3,
      "greetingMessageLane": null,
      "rollbackLaneId": 1,
      "createdAt": "2024-01-15T10:05:00.000Z",
      "updatedAt": "2024-01-15T10:05:00.000Z"
    },
    {
      "id": 3,
      "name": "Aguardando Cliente",
      "color": "#FFA726",
      "kanban": 1,
      "companyId": 1,
      "timeLane": 86400,
      "nextLaneId": 4,
      "greetingMessageLane": null,
      "rollbackLaneId": 2,
      "createdAt": "2024-01-15T10:10:00.000Z",
      "updatedAt": "2024-01-15T10:10:00.000Z"
    },
    {
      "id": 4,
      "name": "Finalizado",
      "color": "#9E9E9E",
      "kanban": 1,
      "companyId": 1,
      "timeLane": null,
      "nextLaneId": null,
      "greetingMessageLane": "Obrigado pelo contato!",
      "rollbackLaneId": 3,
      "createdAt": "2024-01-15T10:15:00.000Z",
      "updatedAt": "2024-01-15T10:15:00.000Z"
    }
  ]
}
```

#### Campos da Tag

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | number | ID único da tag |
| `name` | string | Nome da coluna Kanban |
| `color` | string | Cor hexadecimal (#RRGGBB) |
| `kanban` | number | Flag Kanban (sempre 1 neste endpoint) |
| `companyId` | number | ID da empresa |
| `timeLane` | number \| null | Tempo SLA em segundos |
| `nextLaneId` | number \| null | ID da próxima lane (automação) |
| `greetingMessageLane` | string \| null | Mensagem ao entrar na lane |
| `rollbackLaneId` | number \| null | ID da lane para rollback |
| `createdAt` | string | Data de criação (ISO 8601) |
| `updatedAt` | string | Data de atualização (ISO 8601) |

#### Exemplo com cURL

```bash
curl -X GET "http://localhost:8080/tag/kanban" \
  -H "Authorization: Bearer <seu-token>"
```

#### Exemplo com Fetch

```javascript
const response = await fetch('http://localhost:8080/tag/kanban', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const { lista: tags } = await response.json();
console.log(`Encontradas ${tags.length} colunas Kanban`);
```

#### Exemplo com Axios

```javascript
import axios from 'axios';

const { data } = await axios.get('http://localhost:8080/tag/kanban', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const tags = data.lista;
```

---

### GET /ticket/kanban

Lista tickets filtrados para visualização Kanban.

#### Query Parameters

| Parâmetro | Tipo | Obrigatório | Descrição | Exemplo |
|-----------|------|-------------|-----------|---------|
| `searchParam` | string | Não | Busca em nome, número ou mensagens | `João Silva` |
| `pageNumber` | string | Não | Número da página (default: 1) | `1` |
| `dateStart` | string | Não | Data inicial (ISO 8601) | `2024-01-15T00:00:00.000Z` |
| `dateEnd` | string | Não | Data final (ISO 8601) | `2024-01-20T23:59:59.999Z` |
| `tags` | string | Não | Array JSON de IDs de tags | `[1,2]` |
| `queueIds` | string | Não | Array JSON de IDs de filas | `[1,2,3]` |
| `users` | string | Não | Array JSON de IDs de usuários | `[1,2]` |
| `showAll` | string | Não | Mostrar todos os tickets | `true` |
| `withUnreadMessages` | string | Não | Apenas tickets com mensagens não lidas | `true` |

#### Observações Importantes

- **Status Fixo:** Retorna apenas tickets com status `pending` ou `open`
- **Limite de Paginação:** 400 tickets por página
- **Filtro de Tags:** Lógica AND - ticket deve ter TODAS as tags especificadas
- **Ordenação:** Por `updatedAt` DESC (mais recentes primeiro)

#### Request

```http
GET /ticket/kanban?dateStart=2024-01-15T00:00:00.000Z&dateEnd=2024-01-20T23:59:59.999Z&tags=[1] HTTP/1.1
Host: localhost:8080
Authorization: Bearer <token>
```

#### Response 200 OK

```json
{
  "tickets": [
    {
      "id": 123,
      "status": "open",
      "unreadMessages": 2,
      "companyId": 1,
      "queueId": 1,
      "userId": 2,
      "contactId": 45,
      "whatsappId": 1,
      "createdAt": "2024-01-15T10:30:00.000Z",
      "updatedAt": "2024-01-15T11:00:00.000Z",
      "contact": {
        "id": 45,
        "name": "João Silva",
        "number": "5511999999999",
        "email": "joao@example.com",
        "companyId": 1,
        "urlPicture": "https://example.com/avatar.jpg"
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
        },
        {
          "id": 5,
          "name": "Urgente",
          "color": "#FF0000"
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

#### Campos do Ticket

| Campo | Tipo | Descrição |
|-------|------|-----------|
| `id` | number | ID único do ticket |
| `status` | string | Status (pending/open/closed) |
| `unreadMessages` | number | Mensagens não lidas |
| `companyId` | number | ID da empresa |
| `queueId` | number \| null | ID da fila |
| `userId` | number \| null | ID do usuário responsável |
| `contactId` | number | ID do contato |
| `whatsappId` | number \| null | ID da conexão WhatsApp |
| `createdAt` | string | Data de criação (ISO 8601) |
| `updatedAt` | string | Data de atualização (ISO 8601) |
| `contact` | object | Dados do contato |
| `queue` | object \| null | Dados da fila |
| `user` | object \| null | Dados do usuário |
| `tags` | array | Array de tags associadas |
| `whatsapp` | object \| null | Dados da conexão WhatsApp |

#### Exemplo com cURL

```bash
# Buscar tickets de uma tag específica
curl -X GET "http://localhost:8080/ticket/kanban?tags=[1]" \
  -H "Authorization: Bearer <seu-token>"

# Buscar tickets com filtro de data
curl -X GET "http://localhost:8080/ticket/kanban?dateStart=2024-01-15T00:00:00.000Z&dateEnd=2024-01-20T23:59:59.999Z" \
  -H "Authorization: Bearer <seu-token>"

# Buscar com múltiplos filtros
curl -X GET "http://localhost:8080/ticket/kanban?tags=[1,2]&queueIds=[1]&users=[2]" \
  -H "Authorization: Bearer <seu-token>"
```

#### Exemplo com Fetch

```javascript
// Buscar tickets de uma coluna Kanban
const tagId = 1;
const params = new URLSearchParams({
  tags: JSON.stringify([tagId]),
  pageNumber: '1'
});

const response = await fetch(`http://localhost:8080/ticket/kanban?${params}`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const { tickets, count, hasMore } = await response.json();
console.log(`${count} tickets encontrados`);
```

#### Exemplo com Axios

```javascript
import axios from 'axios';

// Buscar tickets com filtro de data
const { data } = await axios.get('http://localhost:8080/ticket/kanban', {
  params: {
    dateStart: '2024-01-15T00:00:00.000Z',
    dateEnd: '2024-01-20T23:59:59.999Z',
    tags: JSON.stringify([1]),
    pageNumber: '1'
  },
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const { tickets, count, hasMore } = data;
```

#### Exemplo React Hook

```typescript
import { useState, useEffect } from 'react';
import axios from 'axios';

interface UseKanbanTicketsParams {
  tagId: number;
  dateStart?: string;
  dateEnd?: string;
}

export const useKanbanTickets = ({ tagId, dateStart, dateEnd }: UseKanbanTicketsParams) => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');

        const params: any = {
          tags: JSON.stringify([tagId]),
          pageNumber: '1'
        };

        if (dateStart) params.dateStart = dateStart;
        if (dateEnd) params.dateEnd = dateEnd;

        const { data } = await axios.get('http://localhost:8080/ticket/kanban', {
          params,
          headers: { 'Authorization': `Bearer ${token}` }
        });

        setTickets(data.tickets);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTickets();
  }, [tagId, dateStart, dateEnd]);

  return { tickets, loading, error };
};

// Uso:
// const { tickets, loading } = useKanbanTickets({ tagId: 1 });
```

---

### PUT /ticket-tags/:ticketId/:tagId

Adiciona uma tag Kanban a um ticket.

#### Path Parameters

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `ticketId` | number | ID do ticket |
| `tagId` | number | ID da tag Kanban |

#### Request

```http
PUT /ticket-tags/123/2 HTTP/1.1
Host: localhost:8080
Authorization: Bearer <token>
```

#### Response 201 Created

```json
{
  "ticketId": 123,
  "tagId": 2,
  "createdAt": "2024-01-15T11:00:00.000Z",
  "updatedAt": "2024-01-15T11:00:00.000Z"
}
```

#### Socket.IO Event Emitido

Após a criação, um evento Socket.IO é emitido:

```json
{
  "action": "update",
  "ticket": {
    "id": 123,
    "status": "open",
    "tags": [
      {
        "id": 2,
        "name": "Em Atendimento",
        "color": "#4CAF50"
      }
    ],
    // ... demais campos do ticket
  }
}
```

**Namespace:** `/{companyId}`
**Evento:** `company-{companyId}-ticket`

#### Exemplo com cURL

```bash
curl -X PUT "http://localhost:8080/ticket-tags/123/2" \
  -H "Authorization: Bearer <seu-token>"
```

#### Exemplo com Fetch

```javascript
const ticketId = 123;
const tagId = 2;

const response = await fetch(`http://localhost:8080/ticket-tags/${ticketId}/${tagId}`, {
  method: 'PUT',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

if (response.ok) {
  const ticketTag = await response.json();
  console.log('Tag adicionada:', ticketTag);
}
```

#### Exemplo com Axios

```javascript
import axios from 'axios';

const ticketId = 123;
const tagId = 2;

try {
  const { data } = await axios.put(
    `http://localhost:8080/ticket-tags/${ticketId}/${tagId}`,
    {},
    {
      headers: { 'Authorization': `Bearer ${token}` }
    }
  );

  console.log('Tag adicionada:', data);
} catch (error) {
  console.error('Erro ao adicionar tag:', error.response?.data);
}
```

---

### DELETE /ticket-tags/:ticketId

Remove TODAS as tags Kanban (kanban=1) de um ticket.

#### Path Parameters

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| `ticketId` | number | ID do ticket |

#### Observações Importantes

- Remove apenas tags com `kanban=1`
- Tags de categorização (kanban=0) são preservadas
- Use case: Remover ticket de coluna antes de mover para outra

#### Request

```http
DELETE /ticket-tags/123 HTTP/1.1
Host: localhost:8080
Authorization: Bearer <token>
```

#### Response 200 OK

```json
{
  "message": "Ticket tags removed successfully."
}
```

#### Socket.IO Event Emitido

```json
{
  "action": "update",
  "ticket": {
    "id": 123,
    "status": "open",
    "tags": [], // Tags Kanban removidas
    // ... demais campos
  }
}
```

**Namespace:** `/{companyId}`
**Evento:** `company-{companyId}-ticket`

#### Exemplo com cURL

```bash
curl -X DELETE "http://localhost:8080/ticket-tags/123" \
  -H "Authorization: Bearer <seu-token>"
```

#### Exemplo com Fetch

```javascript
const ticketId = 123;

const response = await fetch(`http://localhost:8080/ticket-tags/${ticketId}`, {
  method: 'DELETE',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

if (response.ok) {
  const result = await response.json();
  console.log(result.message);
}
```

#### Exemplo com Axios

```javascript
import axios from 'axios';

const ticketId = 123;

try {
  const { data } = await axios.delete(
    `http://localhost:8080/ticket-tags/${ticketId}`,
    {
      headers: { 'Authorization': `Bearer ${token}` }
    }
  );

  console.log(data.message);
} catch (error) {
  console.error('Erro ao remover tags:', error.response?.data);
}
```

---

## Fluxo Drag and Drop

O fluxo completo de drag and drop envolve 3 etapas:

### 1. Usuário Arrasta Card

```javascript
// React DnD / react-beautiful-dnd
const onDragEnd = (result) => {
  if (!result.destination) return;

  const ticketId = result.draggableId;
  const oldTagId = parseInt(result.source.droppableId);
  const newTagId = parseInt(result.destination.droppableId);

  if (oldTagId === newTagId) return;

  // Iniciar operação de movimentação
  moveTicket(ticketId, oldTagId, newTagId);
};
```

### 2. Frontend Faz 2 Requests Sequenciais

```javascript
async function moveTicket(ticketId, oldTagId, newTagId) {
  const token = localStorage.getItem('token');

  try {
    // Passo 1: Remover tag antiga
    await axios.delete(`http://localhost:8080/ticket-tags/${ticketId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    try {
      // Passo 2: Adicionar nova tag
      await axios.put(
        `http://localhost:8080/ticket-tags/${ticketId}/${newTagId}`,
        {},
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      console.log(`Ticket ${ticketId} movido de coluna ${oldTagId} para ${newTagId}`);
    } catch (error) {
      // Rollback: Restaurar tag antiga
      console.error('Erro ao adicionar nova tag, fazendo rollback...');
      await axios.put(
        `http://localhost:8080/ticket-tags/${ticketId}/${oldTagId}`,
        {},
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      throw error;
    }
  } catch (error) {
    console.error('Erro ao mover ticket:', error);
    throw error;
  }
}
```

### 3. Backend Processa e Emite Socket.IO

**Request 1 - DELETE:**
```
1. Backend recebe DELETE /ticket-tags/123
2. Remove tags Kanban do ticket
3. Emite Socket.IO: { action: "update", ticket: {...} }
```

**Request 2 - PUT:**
```
1. Backend recebe PUT /ticket-tags/123/2
2. Adiciona nova tag ao ticket
3. Emite Socket.IO: { action: "update", ticket: {...} }
```

### 4. Outros Clientes Recebem Atualização

```javascript
// Socket.IO client
import io from 'socket.io-client';

const companyId = 1; // Obtido do JWT
const socket = io(`http://localhost:8080/${companyId}`, {
  auth: { token: localStorage.getItem('token') }
});

socket.on(`company-${companyId}-ticket`, (data) => {
  if (data.action === 'update') {
    console.log('Ticket atualizado:', data.ticket);
    // Atualizar UI
    updateTicketInState(data.ticket);
  }
});
```

### Exemplo Completo com React

```typescript
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

interface Ticket {
  id: number;
  contact: { name: string };
  tags: Array<{ id: number; name: string; color: string }>;
}

interface Tag {
  id: number;
  name: string;
  color: string;
}

export const KanbanBoard = () => {
  const [tags, setTags] = useState<Tag[]>([]);
  const [ticketsByTag, setTicketsByTag] = useState<Record<number, Ticket[]>>({});
  const token = localStorage.getItem('token');
  const companyId = 1; // Extraído do JWT

  // Buscar tags e tickets
  useEffect(() => {
    const fetchData = async () => {
      // Buscar colunas
      const { data: tagsData } = await axios.get('http://localhost:8080/tag/kanban', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setTags(tagsData.lista);

      // Buscar tickets de cada coluna
      const ticketsMap: Record<number, Ticket[]> = {};
      for (const tag of tagsData.lista) {
        const { data: ticketsData } = await axios.get('http://localhost:8080/ticket/kanban', {
          params: { tags: JSON.stringify([tag.id]) },
          headers: { 'Authorization': `Bearer ${token}` }
        });
        ticketsMap[tag.id] = ticketsData.tickets;
      }
      setTicketsByTag(ticketsMap);
    };

    fetchData();
  }, [token]);

  // Socket.IO para atualizações em tempo real
  useEffect(() => {
    const socket = io(`http://localhost:8080/${companyId}`, {
      auth: { token }
    });

    socket.on(`company-${companyId}-ticket`, (data) => {
      if (data.action === 'update') {
        // Recarregar tickets (ou atualizar de forma mais inteligente)
        console.log('Ticket atualizado via Socket.IO:', data.ticket);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [companyId, token]);

  // Drag and Drop
  const onDragEnd = async (result: any) => {
    if (!result.destination) return;

    const ticketId = parseInt(result.draggableId);
    const oldTagId = parseInt(result.source.droppableId);
    const newTagId = parseInt(result.destination.droppableId);

    if (oldTagId === newTagId) return;

    try {
      // Remover tag antiga
      await axios.delete(`http://localhost:8080/ticket-tags/${ticketId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      // Adicionar nova tag
      await axios.put(
        `http://localhost:8080/ticket-tags/${ticketId}/${newTagId}`,
        {},
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );

      // Atualizar estado local
      setTicketsByTag(prev => {
        const oldTickets = prev[oldTagId].filter(t => t.id !== ticketId);
        const movedTicket = prev[oldTagId].find(t => t.id === ticketId)!;
        const newTickets = [...prev[newTagId], movedTicket];

        return {
          ...prev,
          [oldTagId]: oldTickets,
          [newTagId]: newTickets
        };
      });
    } catch (error) {
      console.error('Erro ao mover ticket:', error);
      alert('Erro ao mover ticket. Recarregando...');
      window.location.reload();
    }
  };

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <div style={{ display: 'flex', gap: '16px' }}>
        {tags.map(tag => (
          <div key={tag.id} style={{ width: '300px' }}>
            <h3 style={{ backgroundColor: tag.color }}>{tag.name}</h3>
            <Droppable droppableId={String(tag.id)}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  style={{ minHeight: '400px' }}
                >
                  {ticketsByTag[tag.id]?.map((ticket, index) => (
                    <Draggable
                      key={ticket.id}
                      draggableId={String(ticket.id)}
                      index={index}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={{
                            padding: '16px',
                            margin: '8px 0',
                            backgroundColor: 'white',
                            border: '1px solid #ddd',
                            borderRadius: '4px',
                            ...provided.draggableProps.style
                          }}
                        >
                          {ticket.contact.name}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
};
```

---

## Socket.IO Events

### Conexão

```javascript
import io from 'socket.io-client';

const companyId = 1; // Extraído do JWT
const token = localStorage.getItem('token');

const socket = io(`http://localhost:8080/${companyId}`, {
  auth: { token }
});

socket.on('connect', () => {
  console.log('Conectado ao Socket.IO');
});

socket.on('disconnect', () => {
  console.log('Desconectado do Socket.IO');
});
```

### Eventos Emitidos pelo Backend

#### 1. company-{companyId}-ticket

Emitido quando um ticket é criado, atualizado ou deletado.

```javascript
socket.on(`company-${companyId}-ticket`, (data) => {
  console.log('Evento recebido:', data);

  switch (data.action) {
    case 'update':
      // Ticket foi atualizado (tags adicionadas/removidas)
      updateTicketInUI(data.ticket);
      break;

    case 'create':
      // Novo ticket criado
      addTicketToUI(data.ticket);
      break;

    case 'delete':
      // Ticket deletado
      removeTicketFromUI(data.ticketId);
      break;
  }
});
```

**Payload para action: "update":**
```json
{
  "action": "update",
  "ticket": {
    "id": 123,
    "status": "open",
    "tags": [
      {
        "id": 2,
        "name": "Em Atendimento",
        "color": "#4CAF50"
      }
    ],
    "contact": { ... },
    "queue": { ... },
    "user": { ... }
  }
}
```

**Payload para action: "delete":**
```json
{
  "action": "delete",
  "ticketId": 123
}
```

#### 2. company{companyId}-tag

Emitido quando tags são criadas, atualizadas ou deletadas.

```javascript
socket.on(`company${companyId}-tag`, (data) => {
  console.log('Tag event:', data);

  switch (data.action) {
    case 'create':
      // Nova tag criada
      addTagToUI(data.tag);
      break;

    case 'update':
      // Tag atualizada
      updateTagInUI(data.tag);
      break;

    case 'delete':
      // Tag deletada
      removeTagFromUI(data.tagId);
      break;
  }
});
```

### Namespace Isolation

Cada empresa tem seu próprio namespace:

- Empresa 1: `http://localhost:8080/1`
- Empresa 2: `http://localhost:8080/2`
- Empresa N: `http://localhost:8080/N`

Clientes só recebem eventos da própria empresa (multi-tenant isolation).

### Exemplo Hook React para Socket.IO

```typescript
import { useEffect } from 'react';
import io, { Socket } from 'socket.io-client';

export const useSocketIO = (companyId: number, onTicketUpdate: (ticket: any) => void) => {
  useEffect(() => {
    const token = localStorage.getItem('token');
    const socket: Socket = io(`http://localhost:8080/${companyId}`, {
      auth: { token }
    });

    socket.on('connect', () => {
      console.log('Socket.IO conectado');
    });

    socket.on(`company-${companyId}-ticket`, (data) => {
      if (data.action === 'update') {
        onTicketUpdate(data.ticket);
      }
    });

    socket.on('disconnect', () => {
      console.log('Socket.IO desconectado');
    });

    return () => {
      socket.disconnect();
    };
  }, [companyId, onTicketUpdate]);
};

// Uso:
// useSocketIO(1, (ticket) => {
//   console.log('Ticket atualizado:', ticket);
//   // Atualizar estado
// });
```

---

## Exemplos de Uso

### Cenário 1: Carregar Kanban Completo

```javascript
import axios from 'axios';

async function loadKanban() {
  const token = localStorage.getItem('token');

  // 1. Buscar colunas (tags)
  const { data: tagsData } = await axios.get('http://localhost:8080/tag/kanban', {
    headers: { 'Authorization': `Bearer ${token}` }
  });

  const tags = tagsData.lista;
  console.log(`${tags.length} colunas encontradas`);

  // 2. Buscar tickets de cada coluna
  const columns = await Promise.all(
    tags.map(async (tag) => {
      const { data: ticketsData } = await axios.get('http://localhost:8080/ticket/kanban', {
        params: { tags: JSON.stringify([tag.id]) },
        headers: { 'Authorization': `Bearer ${token}` }
      });

      return {
        tag,
        tickets: ticketsData.tickets,
        count: ticketsData.count
      };
    })
  );

  console.log('Kanban carregado:', columns);
  return columns;
}

// Uso:
loadKanban().then(columns => {
  columns.forEach(column => {
    console.log(`${column.tag.name}: ${column.count} tickets`);
  });
});
```

### Cenário 2: Filtrar Tickets por Data

```javascript
import axios from 'axios';

async function getTicketsByDateRange(startDate, endDate) {
  const token = localStorage.getItem('token');

  const { data } = await axios.get('http://localhost:8080/ticket/kanban', {
    params: {
      dateStart: startDate,
      dateEnd: endDate
    },
    headers: { 'Authorization': `Bearer ${token}` }
  });

  console.log(`${data.count} tickets encontrados no período`);
  return data.tickets;
}

// Uso:
getTicketsByDateRange(
  '2024-01-15T00:00:00.000Z',
  '2024-01-20T23:59:59.999Z'
).then(tickets => {
  console.log('Tickets:', tickets);
});
```

### Cenário 3: Mover Ticket Entre Colunas

```javascript
import axios from 'axios';

async function moveTicket(ticketId, oldTagId, newTagId) {
  const token = localStorage.getItem('token');

  try {
    // Remove tag antiga
    await axios.delete(`http://localhost:8080/ticket-tags/${ticketId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    // Adiciona nova tag
    await axios.put(
      `http://localhost:8080/ticket-tags/${ticketId}/${newTagId}`,
      {},
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );

    console.log(`Ticket ${ticketId} movido com sucesso`);
    return true;
  } catch (error) {
    console.error('Erro ao mover ticket:', error);

    // Rollback: restaurar tag antiga
    try {
      await axios.put(
        `http://localhost:8080/ticket-tags/${ticketId}/${oldTagId}`,
        {},
        {
          headers: { 'Authorization': `Bearer ${token}` }
        }
      );
      console.log('Rollback realizado');
    } catch (rollbackError) {
      console.error('Erro ao fazer rollback:', rollbackError);
    }

    return false;
  }
}

// Uso:
moveTicket(123, 1, 2); // Move ticket 123 da coluna 1 para coluna 2
```

### Cenário 4: Buscar Tickets de Múltiplas Tags

```javascript
import axios from 'axios';

async function getTicketsWithAllTags(tagIds) {
  const token = localStorage.getItem('token');

  const { data } = await axios.get('http://localhost:8080/ticket/kanban', {
    params: {
      tags: JSON.stringify(tagIds)
    },
    headers: { 'Authorization': `Bearer ${token}` }
  });

  console.log(`${data.count} tickets têm todas as tags: ${tagIds.join(', ')}`);
  return data.tickets;
}

// Uso:
getTicketsWithAllTags([1, 5]) // Tickets que têm tag 1 E tag 5
  .then(tickets => console.log('Tickets:', tickets));
```

---

## Códigos de Erro

### 400 Bad Request

Requisição inválida (parâmetros incorretos).

```json
{
  "error": "Invalid parameters"
}
```

**Causas comuns:**
- Parâmetros de data inválidos
- JSON malformado em `tags`, `queueIds`, `users`

### 401 Unauthorized

Token JWT ausente ou expirado.

```json
{
  "error": "ERR_SESSION_EXPIRED",
  "statusCode": 401
}
```

**Solução:** Fazer login novamente e obter novo token.

### 403 Forbidden

Token JWT inválido.

```json
{
  "error": "Invalid token. We'll try to assign a new one on next request",
  "statusCode": 403
}
```

**Solução:** Fazer login novamente.

### 404 Not Found

Recurso não encontrado.

```json
{
  "error": "Ticket not found"
}
```

**Causas comuns:**
- Ticket não existe
- Tag não existe
- Ticket pertence a outra empresa (multi-tenant isolation)

### 500 Internal Server Error

Erro interno do servidor.

```json
{
  "error": "Failed to store ticket tag."
}
```

**Solução:** Verificar logs do servidor. Entrar em contato com suporte se persistir.

---

## FAQ

### 1. Posso adicionar múltiplas tags Kanban a um ticket?

**Resposta:** Sim, tecnicamente é possível. Porém, o design do sistema assume que cada ticket tem UMA tag Kanban ativa por vez (representando a coluna atual). Tags adicionais devem usar `kanban=0` para categorização.

### 2. O que acontece se eu chamar DELETE sem chamar PUT depois?

**Resposta:** O ticket fica sem tag Kanban, o que significa que ele não aparecerá em nenhuma coluna. Isso é válido para casos onde você quer "arquivar" um ticket temporariamente.

### 3. A operação de mover card é atômica?

**Resposta:** Não, requer 2 requests (DELETE + PUT). Se o segundo request falhar, implemente rollback manual no frontend (PUT da tag antiga).

### 4. Posso filtrar tickets por múltiplas tags?

**Resposta:** Sim, use `tags=[1,2,3]`. A lógica é AND - o ticket deve ter TODAS as tags especificadas.

### 5. Qual o limite de tickets por página?

**Resposta:** 400 tickets por página. Use o campo `hasMore` para determinar se há mais páginas.

### 6. Como receber atualizações em tempo real?

**Resposta:** Conecte ao Socket.IO no namespace `/{companyId}` e escute o evento `company-{companyId}-ticket`.

### 7. As tags são isoladas por empresa?

**Resposta:** Sim, todas as tags e tickets são filtrados por `companyId` automaticamente. Não é possível acessar dados de outras empresas.

### 8. Posso criar tags via API?

**Resposta:** Esta documentação cobre apenas endpoints de leitura e associação. Para criar/atualizar/deletar tags, use os endpoints de CRUD de tags (não documentados aqui).

### 9. O que é o campo `timeLane` na tag?

**Resposta:** Representa o tempo de SLA em segundos. Por exemplo, `3600` = 1 hora. Use para alertas de tickets que ultrapassaram o tempo esperado na lane.

### 10. Como implementar paginação infinita?

**Resposta:** Use o campo `hasMore` e incremente `pageNumber`:

```javascript
let pageNumber = 1;
let allTickets = [];

while (true) {
  const { data } = await axios.get('http://localhost:8080/ticket/kanban', {
    params: { tags: JSON.stringify([1]), pageNumber: String(pageNumber) },
    headers: { 'Authorization': `Bearer ${token}` }
  });

  allTickets = [...allTickets, ...data.tickets];

  if (!data.hasMore) break;
  pageNumber++;
}

console.log(`Total de tickets: ${allTickets.length}`);
```

---

## Recursos Adicionais

- **Especificação OpenAPI:** `/docs/kanban/openapi-kanban.yaml`
- **Validação Backend:** `/docs/kanban/backend-validation.md`
- **Socket.IO Docs:** https://socket.io/docs/v4/
- **React Beautiful DnD:** https://github.com/atlassian/react-beautiful-dnd

---

**Documentação criada por:** Backend Planner (Claude Code)
**Data:** 2025-10-13
**Versão:** 1.0
