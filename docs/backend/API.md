# 🔌 API Reference - ChatIA Backend

Documentação completa dos endpoints REST (200+ rotas).

---

## Índice

- [Autenticação](#autenticação)
- [Tickets](#tickets)
- [Mensagens](#mensagens)
- [Contatos](#contatos)
- [Usuários](#usuários)
- [WhatsApp](#whatsapp)
- [Filas](#filas)
- [Campanhas](#campanhas)
- [Flow Builder](#flow-builder)
- [Configurações](#configurações)

---

## Base URL

```
http://localhost:8080
```

## Autenticação

Todas as rotas (exceto login) requerem header:
```
Authorization: Bearer <token>
```

---

## Autenticação

### POST /auth/login

Login no sistema.

**Request:**
```json
{
  "email": "admin@chatia.com",
  "password": "senha123"
}
```

**Response 200:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIs...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIs...",
  "user": {
    "id": 1,
    "name": "Admin",
    "email": "admin@chatia.com",
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

**Errors:**
- 401: Credenciais inválidas
- 403: Assinatura vencida

---

### POST /auth/refresh

Atualizar access token.

**Request:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIs..."
}
```

**Response 200:**
```json
{
  "token": "new_access_token",
  "refreshToken": "new_refresh_token"
}
```

---

### DELETE /auth/logout

Fazer logout e invalidar tokens.

**Headers:**
```
Authorization: Bearer <token>
```

**Response 200:**
```json
{
  "message": "Logout realizado com sucesso"
}
```

---

### GET /auth/me

Obter dados do usuário autenticado.

**Response 200:**
```json
{
  "id": 1,
  "name": "Admin",
  "email": "admin@chatia.com",
  "profile": "admin",
  "companyId": 1,
  "queues": [...]
}
```

---

## Tickets

### GET /tickets

Listar tickets.

**Query Params:**
```
?status=open              # "open" | "pending" | "closed"
&queueIds=1,2,3          # IDs das filas
&withUnreadMessages=true # Apenas com não lidas
&showAll=false           # Todos ou só do usuário
&pageNumber=1            # Página
&searchParam=João        # Busca por nome/número
&date=2025-01-10         # Filtrar por data
```

**Response 200:**
```json
{
  "tickets": [
    {
      "id": 1,
      "uuid": "abc-123",
      "status": "open",
      "unreadMessages": 3,
      "lastMessage": "Olá, preciso de ajuda",
      "contact": {
        "id": 1,
        "name": "João Silva",
        "number": "5511999999999",
        "profilePicUrl": "https://..."
      },
      "queue": {
        "id": 1,
        "name": "Suporte",
        "color": "#9c27b0"
      },
      "user": {
        "id": 1,
        "name": "Atendente"
      },
      "whatsapp": {
        "id": 1,
        "name": "Conexão 1"
      },
      "tags": [
        { "id": 1, "name": "Urgente", "color": "#f44336" }
      ],
      "createdAt": "2025-01-10T10:00:00Z",
      "updatedAt": "2025-01-10T11:00:00Z"
    }
  ],
  "count": 50,
  "hasMore": true
}
```

---

### POST /tickets

Criar novo ticket.

**Request:**
```json
{
  "contactId": 1,
  "userId": 1,
  "queueId": 1,
  "whatsappId": 1,
  "status": "open"
}
```

**Response 200:**
```json
{
  "id": 1,
  "uuid": "abc-123",
  "status": "open",
  "contactId": 1,
  "userId": 1,
  "queueId": 1,
  "whatsappId": 1
}
```

---

### GET /tickets/:ticketId

Obter detalhes do ticket.

**Response 200:**
```json
{
  "id": 1,
  "uuid": "abc-123",
  "status": "open",
  "contact": { /* ... */ },
  "user": { /* ... */ },
  "queue": { /* ... */ },
  "whatsapp": { /* ... */ },
  "tags": [ /* ... */ ]
}
```

---

### PUT /tickets/:ticketId

Atualizar ticket.

**Request:**
```json
{
  "status": "closed",
  "userId": 2,
  "queueId": 3
}
```

**Response 200:**
```json
{
  "id": 1,
  "status": "closed",
  "userId": 2,
  "queueId": 3
}
```

---

### DELETE /tickets/:ticketId

Deletar ticket.

**Response 200:**
```json
{
  "message": "Ticket deletado com sucesso"
}
```

---

## Mensagens

### GET /messages/:ticketId

Listar mensagens do ticket.

**Query Params:**
```
?pageNumber=1
```

**Response 200:**
```json
{
  "messages": [
    {
      "id": 1,
      "body": "Olá, como posso ajudar?",
      "mediaType": "chat",
      "mediaUrl": null,
      "fromMe": true,
      "ack": 3,
      "read": true,
      "timestamp": 1704888000,
      "quotedMsg": null,
      "contact": {
        "id": 1,
        "name": "João"
      },
      "createdAt": "2025-01-10T10:00:00Z"
    }
  ],
  "count": 100,
  "hasMore": true
}
```

---

### POST /messages/:ticketId

Enviar mensagem.

**Request (texto):**
```json
{
  "body": "Mensagem de texto",
  "quotedMsgId": 1,
  "fromMe": true
}
```

**Request (mídia - FormData):**
```
body: "Legenda da imagem"
medias: [File]
fromMe: true
```

**Response 200:**
```json
{
  "id": 1,
  "body": "Mensagem enviada",
  "ack": 0,
  "fromMe": true,
  "ticketId": 1,
  "createdAt": "2025-01-10T10:05:00Z"
}
```

---

### PUT /messages/:messageId

Editar mensagem.

**Request:**
```json
{
  "body": "Mensagem editada"
}
```

**Response 200:**
```json
{
  "id": 1,
  "body": "Mensagem editada",
  "edited": true
}
```

---

### DELETE /messages/:messageId

Deletar mensagem (LGPD).

**Response 200:**
```json
{
  "message": "Mensagem deletada"
}
```

---

## Contatos

### GET /contacts

Listar contatos.

**Query Params:**
```
?searchParam=João
&pageNumber=1
```

**Response 200:**
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
        { "id": 1, "name": "VIP" }
      ],
      "extraInfo": [
        { "name": "CPF", "value": "123.456.789-00" }
      ],
      "wallets": [
        { "id": 1, "name": "Carteira Principal" }
      ]
    }
  ],
  "count": 100,
  "hasMore": true
}
```

---

### POST /contacts

Criar contato.

**Request:**
```json
{
  "name": "João Silva",
  "number": "5511999999999",
  "email": "joao@example.com",
  "extraInfo": [
    { "name": "CPF", "value": "123.456.789-00" }
  ]
}
```

**Response 200:**
```json
{
  "id": 1,
  "name": "João Silva",
  "number": "5511999999999"
}
```

---

### PUT /contacts/:contactId

Atualizar contato.

**Request:**
```json
{
  "name": "João Silva Atualizado",
  "email": "novo@email.com"
}
```

---

### DELETE /contacts/:contactId

Deletar contato.

---

### POST /contacts/import

Importar contatos (Excel/CSV).

**Request (FormData):**
```
file: [File]
```

**Response 200:**
```json
{
  "imported": 150,
  "errors": []
}
```

---

## Usuários

### GET /users

Listar usuários.

**Response 200:**
```json
{
  "users": [
    {
      "id": 1,
      "name": "Admin",
      "email": "admin@chatia.com",
      "profile": "admin",
      "queues": [
        { "id": 1, "name": "Suporte" }
      ],
      "whatsapps": [
        { "id": 1, "name": "Conexão 1" }
      ]
    }
  ]
}
```

---

### POST /users

Criar usuário.

**Request:**
```json
{
  "name": "Novo Usuário",
  "email": "user@chatia.com",
  "password": "senha123",
  "profile": "user",
  "queueIds": [1, 2],
  "whatsappIds": [1]
}
```

---

### PUT /users/:userId

Atualizar usuário.

---

### DELETE /users/:userId

Deletar usuário.

---

## WhatsApp

### GET /whatsapp

Listar conexões WhatsApp.

**Response 200:**
```json
{
  "whatsapps": [
    {
      "id": 1,
      "name": "Conexão 1",
      "status": "CONNECTED",
      "qrcode": null,
      "battery": "90",
      "plugged": true,
      "number": "5511999999999",
      "session": "session-1"
    }
  ]
}
```

---

### POST /whatsapp

Criar conexão WhatsApp.

**Request:**
```json
{
  "name": "Conexão 2",
  "queueIds": [1, 2]
}
```

---

### POST /whatsapp/:whatsappId/start-session

Iniciar sessão WhatsApp.

**Response 200:**
```json
{
  "qrcode": "data:image/png;base64,...",
  "status": "OPENING"
}
```

---

### DELETE /whatsapp/:whatsappId

Deletar conexão.

---

## Filas

### GET /queue

Listar filas.

**Response 200:**
```json
{
  "queues": [
    {
      "id": 1,
      "name": "Suporte",
      "color": "#9c27b0",
      "greetingMessage": "Bem-vindo ao suporte!",
      "schedules": [
        {
          "weekday": 1,
          "startTime": "08:00",
          "endTime": "18:00"
        }
      ],
      "chatbots": [ /* ... */ ],
      "queueIntegrations": [ /* ... */ ]
    }
  ]
}
```

---

### POST /queue

Criar fila.

**Request:**
```json
{
  "name": "Vendas",
  "color": "#4caf50",
  "greetingMessage": "Olá! Seja bem-vindo ao setor de vendas",
  "schedules": [
    {
      "weekday": 1,
      "startTime": "08:00",
      "endTime": "18:00"
    }
  ]
}
```

---

## Campanhas

### GET /campaigns

Listar campanhas.

**Response 200:**
```json
{
  "campaigns": [
    {
      "id": 1,
      "name": "Black Friday",
      "status": "completed",
      "message": "Aproveite nossas ofertas!",
      "mediaPath": "/media/campaign1.jpg",
      "scheduledAt": "2025-01-15T10:00:00Z",
      "contactList": {
        "id": 1,
        "name": "Clientes VIP"
      },
      "whatsapp": {
        "id": 1,
        "name": "Conexão 1"
      },
      "shippings": [
        {
          "id": 1,
          "status": "sent",
          "contactId": 1
        }
      ]
    }
  ]
}
```

---

### POST /campaigns

Criar campanha.

**Request:**
```json
{
  "name": "Promoção Janeiro",
  "message": "Texto da campanha",
  "mediaPath": "/media/promo.jpg",
  "scheduledAt": "2025-01-20T10:00:00Z",
  "contactListId": 1,
  "whatsappId": 1,
  "openTicket": false
}
```

---

### GET /campaigns/:campaignId/report

Relatório da campanha.

**Response 200:**
```json
{
  "total": 1000,
  "sent": 950,
  "pending": 50,
  "error": 0,
  "delivered": 920,
  "read": 850
}
```

---

## Flow Builder

### GET /flowbuilder

Listar flows.

**Response 200:**
```json
{
  "flows": [
    {
      "id": 1,
      "name": "Atendimento Inicial",
      "flow": {
        "nodes": [ /* React Flow nodes */ ],
        "edges": [ /* React Flow edges */ ]
      }
    }
  ]
}
```

---

### POST /flowbuilder

Criar flow.

**Request:**
```json
{
  "name": "Novo Flow",
  "flow": {
    "nodes": [],
    "edges": []
  }
}
```

---

### POST /flowbuilder/import

Importar flow (JSON/ZIP).

**Request (FormData):**
```
file: [File]
```

---

### GET /flowbuilder/:id/export

Exportar flow.

**Response:** ZIP file

---

## Configurações

### GET /settings

Listar configurações.

**Response 200:**
```json
{
  "settings": [
    {
      "key": "primaryColorLight",
      "value": "#6B46C1"
    },
    {
      "key": "appName",
      "value": "ChatIA"
    }
  ]
}
```

---

### POST /settings

Salvar configurações.

**Request:**
```json
{
  "settings": [
    { "key": "primaryColorLight", "value": "#FF5722" }
  ]
}
```

---

### GET /settings/public/:key

Obter configuração pública (sem auth).

**Response 200:**
```json
{
  "key": "appName",
  "value": "ChatIA"
}
```

---

## Dashboard

### GET /dashboard

Obter dados do dashboard.

**Query Params:**
```
?startDate=2025-01-01
&endDate=2025-01-31
&userId=1
&queueId=1
```

**Response 200:**
```json
{
  "counters": {
    "supportHappening": 10,
    "supportPending": 5,
    "supportFinished": 50,
    "leads": 8
  },
  "attendants": [
    {
      "id": 1,
      "name": "Atendente 1",
      "online": 5,
      "waiting": 2,
      "finished": 20
    }
  ],
  "nps": {
    "score": 8.5,
    "promoters": 70,
    "passives": 20,
    "detractors": 10
  }
}
```

---

## Códigos de Status HTTP

- **200** OK - Sucesso
- **201** Created - Criado com sucesso
- **400** Bad Request - Dados inválidos
- **401** Unauthorized - Não autenticado
- **403** Forbidden - Token inválido ou expirado
- **404** Not Found - Recurso não encontrado
- **409** Conflict - Conflito (ex: email duplicado)
- **500** Internal Server Error - Erro no servidor

---

## Rate Limiting

Limite de requisições por IP:
- 100 requests / 15 minutos (padrão)
- 1000 requests / hora (autenticado)

Headers de resposta:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1704892800
```

---

## Webhooks

### POST /webhooks/:type

Receber webhooks de integrações.

**Tipos:**
- `dialogflow`
- `n8n`
- `typebot`
- `asaas`
- `mercadopago`

---

## Paginação

Padrão de paginação:
```
?pageNumber=1  // Página (começa em 1)
```

Response headers:
```
X-Total-Count: 500
X-Has-More: true
```

---

## Exemplos de Uso

### cURL

```bash
# Login
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@chatia.com","password":"senha123"}'

# Listar tickets
curl -X GET http://localhost:8080/tickets?status=open \
  -H "Authorization: Bearer <token>"

# Enviar mensagem
curl -X POST http://localhost:8080/messages/1 \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"body":"Olá!","fromMe":true}'
```

### JavaScript (Axios)

```javascript
const api = axios.create({
  baseURL: 'http://localhost:8080',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

// Listar tickets
const { data } = await api.get('/tickets', {
  params: { status: 'open' }
});

// Enviar mensagem
await api.post(`/messages/${ticketId}`, {
  body: 'Olá!',
  fromMe: true
});
```

---

---

## Tags

### GET /tags

Listar tags.

**Response 200:**
```json
{
  "tags": [
    {
      "id": 1,
      "name": "Urgente",
      "color": "#f44336",
      "kanban": 1,
      "timeLane": 3600,
      "nextLaneId": 2,
      "rollbackLaneId": null,
      "greetingMessageLane": "Ticket movido para urgente"
    }
  ]
}
```

---

### POST /tags

Criar tag.

**Request:**
```json
{
  "name": "VIP",
  "color": "#ffc107",
  "kanban": 2,
  "timeLane": 7200,
  "greetingMessageLane": "Cliente VIP identificado"
}
```

---

### PUT /tags/:id

Atualizar tag.

---

### DELETE /tags/:id

Deletar tag.

---

## Mensagens Rápidas

### GET /quick-messages

Listar mensagens rápidas.

**Response 200:**
```json
{
  "quickMessages": [
    {
      "id": 1,
      "shortcut": "/oi",
      "message": "Olá! Como posso ajudar?",
      "mediaPath": null,
      "userId": 1,
      "companyId": 1
    }
  ]
}
```

---

### POST /quick-messages

Criar mensagem rápida.

**Request (FormData):**
```
shortcut: /bemvindo
message: Bem-vindo ao nosso atendimento!
medias: [File] (opcional)
```

---

### PUT /quick-messages/:id

Atualizar mensagem rápida.

---

### DELETE /quick-messages/:id

Deletar mensagem rápida.

---

## Mensagens Agendadas

### GET /scheduled-messages

Listar mensagens agendadas.

**Query Params:**
```
?status=pending  # "pending" | "sent" | "error"
```

**Response 200:**
```json
{
  "scheduledMessages": [
    {
      "id": 1,
      "data_mensagem_programada": "2025-01-15T10:00:00Z",
      "mensagem": "Lembrete de pagamento",
      "mediaPath": null,
      "status": "pending",
      "contact": {
        "id": 1,
        "name": "João Silva"
      },
      "whatsapp": {
        "id": 1,
        "name": "Conexão 1"
      }
    }
  ]
}
```

---

### POST /scheduled-messages

Criar mensagem agendada.

**Request:**
```json
{
  "contactId": 1,
  "whatsappId": 1,
  "data_mensagem_programada": "2025-01-20T14:00:00Z",
  "mensagem": "Sua consulta é amanhã às 10h",
  "mediaPath": "/media/reminder.jpg"
}
```

---

### PUT /scheduled-messages/:id

Atualizar mensagem agendada.

---

### DELETE /scheduled-messages/:id

Cancelar mensagem agendada.

---

## Avisos (Announcements)

### GET /announcements

Listar avisos.

**Response 200:**
```json
{
  "announcements": [
    {
      "id": 1,
      "priority": 1,
      "title": "Manutenção Programada",
      "text": "Sistema ficará indisponível das 2h às 4h",
      "mediaPath": "http://backend/public/announcements/img.jpg",
      "mediaName": "img.jpg",
      "status": true,
      "createdAt": "2025-01-10T10:00:00Z"
    }
  ]
}
```

---

### POST /announcements

Criar aviso.

**Request (FormData):**
```
priority: 1
title: Novo Recurso
text: Temos uma nova funcionalidade!
status: true
medias: [File]
```

---

### PUT /announcements/:id

Atualizar aviso.

---

### DELETE /announcements/:id

Deletar aviso.

---

## Chat Interno

### GET /chats

Listar chats.

**Response 200:**
```json
{
  "chats": [
    {
      "id": 1,
      "title": "Equipe de Vendas",
      "ownerId": 1,
      "users": [
        {
          "id": 1,
          "userId": 1,
          "user": {
            "id": 1,
            "name": "Admin"
          },
          "unreads": 3
        }
      ],
      "messages": [
        {
          "id": 1,
          "message": "Olá equipe!",
          "mediaPath": null,
          "sender": {
            "id": 1,
            "name": "Admin"
          },
          "createdAt": "2025-01-10T10:00:00Z"
        }
      ]
    }
  ]
}
```

---

### POST /chats

Criar chat.

**Request:**
```json
{
  "title": "Novo Chat",
  "userIds": [1, 2, 3]
}
```

---

### POST /chats/:chatId/messages

Enviar mensagem no chat.

**Request (FormData):**
```
message: Olá!
medias: [File]
```

---

### PUT /chats/:chatId/read

Marcar mensagens como lidas.

---

### DELETE /chats/:id

Deletar chat.

---

## Notas de Ticket

### GET /tickets/:ticketId/notes

Listar notas do ticket.

**Response 200:**
```json
{
  "notes": [
    {
      "id": 1,
      "note": "Cliente solicitou desconto de 10%",
      "userId": 1,
      "user": {
        "id": 1,
        "name": "Atendente"
      },
      "createdAt": "2025-01-10T10:00:00Z"
    }
  ]
}
```

---

### POST /tickets/:ticketId/notes

Criar nota.

**Request:**
```json
{
  "note": "Cliente confirmou entrega para amanhã"
}
```

---

### DELETE /tickets/:ticketId/notes/:noteId

Deletar nota.

---

## Listas de Contatos

### GET /contact-lists

Listar listas de contatos.

**Response 200:**
```json
{
  "contactLists": [
    {
      "id": 1,
      "name": "Clientes VIP",
      "contactsCount": 150,
      "createdAt": "2025-01-10T10:00:00Z"
    }
  ]
}
```

---

### POST /contact-lists

Criar lista.

**Request:**
```json
{
  "name": "Clientes Inativos"
}
```

---

### GET /contact-lists/:listId/contacts

Listar contatos da lista.

**Response 200:**
```json
{
  "contacts": [
    {
      "id": 1,
      "contactId": 1,
      "contact": {
        "id": 1,
        "name": "João Silva",
        "number": "5511999999999"
      }
    }
  ],
  "count": 50
}
```

---

### POST /contact-lists/:listId/contacts

Adicionar contato à lista.

**Request:**
```json
{
  "contactId": 1
}
```

---

### DELETE /contact-lists/:listId/contacts/:contactId

Remover contato da lista.

---

### POST /contact-lists/import

Importar lista (Excel/CSV).

**Request (FormData):**
```
file: [File]
name: Nome da Lista
```

---

## Prompts de IA

### GET /prompts

Listar prompts.

**Response 200:**
```json
{
  "prompts": [
    {
      "id": 1,
      "name": "Atendente Virtual",
      "prompt": "Você é um assistente prestativo...",
      "apiKey": "sk-***",
      "maxTokens": 500,
      "temperature": 0.7,
      "maxMessages": 10,
      "queueId": 1
    }
  ]
}
```

---

### POST /prompts

Criar prompt.

**Request:**
```json
{
  "name": "Suporte Técnico",
  "prompt": "Você é um especialista em tecnologia...",
  "apiKey": "sk-1234567890",
  "maxTokens": 1000,
  "temperature": 0.5,
  "maxMessages": 20,
  "queueId": 1
}
```

---

### PUT /prompts/:id

Atualizar prompt.

---

### DELETE /prompts/:id

Deletar prompt.

---

## Integrações de Filas

### GET /queue-integrations

Listar integrações.

**Response 200:**
```json
{
  "integrations": [
    {
      "id": 1,
      "type": "dialogflow",
      "name": "Dialogflow Bot",
      "projectName": "my-project-id",
      "language": "pt-BR",
      "queueId": 1
    },
    {
      "id": 2,
      "type": "n8n",
      "name": "N8N Webhook",
      "urlN8N": "https://n8n.example.com/webhook/abc",
      "queueId": 2
    },
    {
      "id": 3,
      "type": "typebot",
      "name": "Typebot Flow",
      "typebotUrl": "https://typebot.io",
      "typebotSlug": "my-bot",
      "typebotExpires": "3600",
      "typebotKeywordFinish": "sair",
      "typebotKeywordRestart": "reiniciar",
      "queueId": 3
    }
  ]
}
```

---

### POST /queue-integrations

Criar integração.

**Request (Dialogflow):**
```json
{
  "type": "dialogflow",
  "name": "Bot Atendimento",
  "projectName": "chatbot-project",
  "jsonContent": "{...}", // Credentials JSON
  "language": "pt-BR",
  "queueId": 1
}
```

**Request (N8N):**
```json
{
  "type": "n8n",
  "name": "Automação N8N",
  "urlN8N": "https://n8n.example.com/webhook/xyz",
  "queueId": 2
}
```

**Request (Typebot):**
```json
{
  "type": "typebot",
  "name": "Typebot Assistant",
  "typebotUrl": "https://typebot.io",
  "typebotSlug": "customer-service",
  "typebotExpires": "7200",
  "typebotKeywordFinish": "exit",
  "typebotKeywordRestart": "restart",
  "typebotRestartMessage": "Bot reiniciado!",
  "typebotDelayMessage": 1000,
  "queueId": 3
}
```

---

### PUT /queue-integrations/:id

Atualizar integração.

---

### DELETE /queue-integrations/:id

Deletar integração.

---

## Chatbots

### GET /chatbots

Listar chatbots.

**Response 200:**
```json
{
  "chatbots": [
    {
      "id": 1,
      "name": "Opção 1",
      "color": "#9c27b0",
      "greetingMessage": "Digite 1 para vendas",
      "queueId": 1,
      "optQueueId": 2,
      "optUserId": null,
      "optFileId": null
    }
  ]
}
```

---

### POST /chatbots

Criar opção de chatbot.

**Request:**
```json
{
  "name": "Opção Suporte",
  "color": "#2196f3",
  "greetingMessage": "Digite 2 para suporte",
  "queueId": 1,
  "optQueueId": 3,
  "optUserId": null,
  "optFileId": 1
}
```

---

### PUT /chatbots/:id

Atualizar chatbot.

---

### DELETE /chatbots/:id

Deletar chatbot.

---

## Planos

### GET /plans

Listar planos.

**Response 200:**
```json
{
  "plans": [
    {
      "id": 1,
      "name": "Básico",
      "users": 5,
      "connections": 2,
      "queues": 3,
      "value": 99.90,
      "amount": 10,
      "useWhatsapp": true,
      "useFacebook": false,
      "useInstagram": false,
      "useCampaigns": true,
      "useSchedules": true,
      "useInternalChat": true,
      "useExternalApi": false,
      "useKanban": true,
      "useOpenAi": false,
      "useIntegrations": true
    }
  ]
}
```

---

### POST /plans

Criar plano (apenas super).

**Request:**
```json
{
  "name": "Premium",
  "users": 20,
  "connections": 10,
  "queues": 10,
  "value": 299.90,
  "amount": 100,
  "useWhatsapp": true,
  "useFacebook": true,
  "useInstagram": true,
  "useCampaigns": true,
  "useSchedules": true,
  "useInternalChat": true,
  "useExternalApi": true,
  "useKanban": true,
  "useOpenAi": true,
  "useIntegrations": true
}
```

---

### PUT /plans/:id

Atualizar plano.

---

### DELETE /plans/:id

Deletar plano.

---

## Configurações da Empresa

### GET /companies/:companyId/settings

Obter configurações.

**Response 200:**
```json
{
  "settings": {
    "id": 1,
    "hoursCloseTicketsAuto": "24",
    "chatBotType": "text",
    "acceptCallWhatsapp": "enabled",
    "userRating": "enabled",
    "scheduleType": "queue",
    "acceptAudioMessageContact": "enabled",
    "sendSignMessage": "enabled",
    "sendGreetingAccepted": "enabled",
    "SettingsTransfTicket": "enabled",
    "sendMsgTransfTicket": "enabled",
    "sendGreetingMessageOneQueues": "enabled",
    "lgpdDeleteMessage": "enabled",
    "lgpdHideNumber": "enabled",
    "lgpdConsent": "enabled",
    "lgpdLink": "https://example.com/privacidade",
    "lgpdMessage": "Ao continuar você aceita nossa política de privacidade"
  }
}
```

---

### PUT /companies/:companyId/settings

Atualizar configurações.

**Request:**
```json
{
  "hoursCloseTicketsAuto": "48",
  "chatBotType": "button",
  "userRating": "enabled",
  "lgpdConsent": "enabled"
}
```

---

## Relatórios

### GET /reports/tickets

Relatório de tickets.

**Query Params:**
```
?startDate=2025-01-01
&endDate=2025-01-31
&userId=1
&queueId=1
&status=closed
```

**Response 200:**
```json
{
  "report": {
    "total": 150,
    "open": 10,
    "pending": 5,
    "closed": 135,
    "averageWaitTime": 320,
    "averageServiceTime": 1200,
    "byUser": [
      {
        "userId": 1,
        "userName": "Atendente 1",
        "total": 50,
        "closed": 45
      }
    ],
    "byQueue": [
      {
        "queueId": 1,
        "queueName": "Suporte",
        "total": 80
      }
    ],
    "byDay": [
      {
        "date": "2025-01-10",
        "total": 15
      }
    ]
  }
}
```

---

### GET /reports/messages

Relatório de mensagens.

**Query Params:**
```
?startDate=2025-01-01
&endDate=2025-01-31
&userId=1
```

**Response 200:**
```json
{
  "report": {
    "totalMessages": 5000,
    "sentMessages": 2500,
    "receivedMessages": 2500,
    "byMediaType": {
      "chat": 3500,
      "image": 800,
      "audio": 400,
      "video": 200,
      "document": 100
    },
    "byUser": [
      {
        "userId": 1,
        "userName": "Atendente 1",
        "total": 1000
      }
    ]
  }
}
```

---

### GET /reports/campaigns

Relatório de campanhas.

**Query Params:**
```
?startDate=2025-01-01
&endDate=2025-01-31
```

**Response 200:**
```json
{
  "campaigns": [
    {
      "id": 1,
      "name": "Black Friday",
      "sent": 1000,
      "delivered": 950,
      "read": 800,
      "error": 50,
      "successRate": "95%",
      "readRate": "80%"
    }
  ],
  "totals": {
    "campaigns": 5,
    "totalSent": 5000,
    "totalDelivered": 4750,
    "totalRead": 3800
  }
}
```

---

## Webhooks

### POST /webhooks/dialogflow

Receber webhook do Dialogflow.

**Request:**
```json
{
  "queryResult": {
    "fulfillmentText": "Resposta do bot",
    "intent": {
      "displayName": "greeting"
    }
  },
  "session": "projects/my-project/sessions/abc123"
}
```

---

### POST /webhooks/n8n

Receber webhook do N8N.

**Request:**
```json
{
  "ticketId": 1,
  "action": "update",
  "data": {
    "status": "closed"
  }
}
```

---

### POST /webhooks/typebot

Receber webhook do Typebot.

**Request:**
```json
{
  "sessionId": "abc123",
  "message": "Resposta do bot",
  "variables": {
    "name": "João",
    "email": "joao@example.com"
  }
}
```

---

### POST /webhooks/asaas

Webhook de pagamento Asaas.

**Request:**
```json
{
  "event": "PAYMENT_CONFIRMED",
  "payment": {
    "id": "pay_123",
    "status": "CONFIRMED",
    "value": 99.90,
    "customer": "cus_123"
  }
}
```

---

## API Externa (Integração)

### POST /api/messages/send

Enviar mensagem via API (requer token de WhatsApp).

**Headers:**
```
Authorization: Bearer <whatsapp_token>
```

**Request:**
```json
{
  "number": "5511999999999",
  "body": "Olá! Sua mensagem aqui.",
  "mediaUrl": "https://example.com/image.jpg"
}
```

**Response 200:**
```json
{
  "message": {
    "id": 1,
    "ack": 0,
    "body": "Olá! Sua mensagem aqui.",
    "mediaUrl": "https://example.com/image.jpg",
    "timestamp": 1704888000
  }
}
```

**Errors:**
- 401: Token inválido
- 404: Número não encontrado
- 500: Erro ao enviar

---

### GET /api/contacts/:number

Buscar contato por número.

**Headers:**
```
Authorization: Bearer <whatsapp_token>
```

**Response 200:**
```json
{
  "contact": {
    "id": 1,
    "name": "João Silva",
    "number": "5511999999999",
    "email": "joao@example.com",
    "profilePicUrl": "https://..."
  }
}
```

---

### POST /api/contacts

Criar contato via API.

**Headers:**
```
Authorization: Bearer <whatsapp_token>
```

**Request:**
```json
{
  "name": "Maria Santos",
  "number": "5511888888888",
  "email": "maria@example.com",
  "extraInfo": [
    { "name": "CPF", "value": "123.456.789-00" }
  ]
}
```

---

## Avançado: Filtros e Ordenação

### Filtros Complexos

**AND Condition:**
```
GET /tickets?status=open&queueId=1&userId=2
```

**OR Condition:**
```
GET /tickets?status=open,pending
```

**Date Range:**
```
GET /tickets?startDate=2025-01-01&endDate=2025-01-31
```

**Like Search:**
```
GET /contacts?searchParam=João
```

**Greater Than / Less Than:**
```
GET /tickets?unreadMessages[gte]=5
```

### Ordenação

**Single Field:**
```
GET /tickets?orderBy=createdAt&order=DESC
```

**Multiple Fields:**
```
GET /tickets?orderBy=status,updatedAt&order=ASC,DESC
```

### Paginação

**Offset-based:**
```
GET /tickets?pageNumber=1&pageSize=20
```

**Cursor-based:**
```
GET /tickets?cursor=100&limit=20
```

**Response Headers:**
```
X-Total-Count: 500
X-Page-Number: 1
X-Page-Size: 20
X-Has-More: true
```

---

## Avançado: Operações em Lote

### POST /tickets/bulk

Atualizar múltiplos tickets.

**Request:**
```json
{
  "ticketIds": [1, 2, 3, 4, 5],
  "data": {
    "status": "closed",
    "queueId": 3
  }
}
```

**Response 200:**
```json
{
  "updated": 5,
  "errors": []
}
```

---

### POST /contacts/bulk-import

Importar contatos em massa.

**Request (FormData):**
```
file: [CSV File]
```

**CSV Format:**
```
name,number,email
João Silva,5511999999999,joao@example.com
Maria Santos,5511888888888,maria@example.com
```

**Response 200:**
```json
{
  "imported": 150,
  "errors": [
    {
      "line": 5,
      "error": "Número inválido"
    }
  ]
}
```

---

### DELETE /messages/bulk

Deletar múltiplas mensagens.

**Request:**
```json
{
  "messageIds": [1, 2, 3, 4, 5]
}
```

---

## Avançado: Error Handling

### Estrutura de Erro Padrão

```json
{
  "error": "ERR_INVALID_CREDENTIALS",
  "message": "Email ou senha incorretos",
  "statusCode": 401,
  "timestamp": "2025-01-10T10:00:00Z",
  "path": "/auth/login"
}
```

### Códigos de Erro Customizados

| Código | Status | Descrição |
|--------|--------|-----------|
| ERR_SESSION_EXPIRED | 401 | Token expirado |
| ERR_INVALID_CREDENTIALS | 401 | Credenciais inválidas |
| ERR_NO_PERMISSION | 403 | Sem permissão |
| ERR_NOT_FOUND | 404 | Recurso não encontrado |
| ERR_DUPLICATE_ENTRY | 409 | Entrada duplicada |
| ERR_VALIDATION_ERROR | 400 | Erro de validação |
| ERR_OUT_OF_HOURS | 401 | Fora do horário |
| ERR_WAPP_NOT_CONNECTED | 503 | WhatsApp desconectado |
| ERR_SENDING_MESSAGE | 500 | Erro ao enviar mensagem |

### Erro com Detalhes de Validação

```json
{
  "error": "ERR_VALIDATION_ERROR",
  "message": "Dados inválidos",
  "statusCode": 400,
  "details": [
    {
      "field": "email",
      "message": "Email é obrigatório"
    },
    {
      "field": "password",
      "message": "Senha deve ter no mínimo 6 caracteres"
    }
  ]
}
```

---

## Avançado: Autenticação e Segurança

### Refresh Token Flow

```javascript
// 1. Login
const { data } = await api.post('/auth/login', {
  email: 'user@example.com',
  password: '123456'
});

localStorage.setItem('token', data.token);

// 2. Request com token
api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;

// 3. Interceptor para auto-refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const { data } = await api.post('/auth/refresh');
        localStorage.setItem('token', data.token);
        api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
        originalRequest.headers['Authorization'] = `Bearer ${data.token}`;
        return api(originalRequest);
      } catch (err) {
        // Redirect to login
        window.location.href = '/login';
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);
```

### API Token (WhatsApp Integration)

**Obter Token:**
```
GET /whatsapp/:whatsappId/token
```

**Response:**
```json
{
  "token": "wapp_1234567890abcdef"
}
```

**Uso:**
```bash
curl -X POST http://localhost:8080/api/messages/send \
  -H "Authorization: Bearer wapp_1234567890abcdef" \
  -H "Content-Type: application/json" \
  -d '{
    "number": "5511999999999",
    "body": "Mensagem via API"
  }'
```

---

## Avançado: WebSocket Events

### Conectar ao WebSocket

```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:8080', {
  auth: {
    token: localStorage.getItem('token')
  },
  query: {
    companyId: 1
  }
});

socket.on('connect', () => {
  console.log('Conectado!');
});
```

### Events

**ticket:**
```javascript
socket.on('ticket', (data) => {
  console.log('Ticket event:', data);
  // {
  //   action: 'create' | 'update' | 'delete',
  //   ticket: { ... }
  // }
});
```

**message:**
```javascript
socket.on('message', (data) => {
  console.log('Message event:', data);
  // {
  //   action: 'create' | 'update',
  //   message: { ... }
  // }
});
```

**contact:**
```javascript
socket.on('contact', (data) => {
  console.log('Contact event:', data);
  // {
  //   action: 'create' | 'update',
  //   contact: { ... }
  // }
});
```

**whatsapp:**
```javascript
socket.on('whatsapp', (data) => {
  console.log('WhatsApp event:', data);
  // {
  //   action: 'update',
  //   whatsapp: { status: 'CONNECTED', battery: '90%', ... }
  // }
});
```

**chat:**
```javascript
socket.on('chat', (data) => {
  console.log('Chat event:', data);
  // {
  //   action: 'create' | 'update',
  //   chat: { ... }
  // }
});
```

---

## Avançado: Cache e Performance

### ETags

**Request:**
```
GET /tickets
If-None-Match: "abc123"
```

**Response 304 (Not Modified):**
```
ETag: "abc123"
```

**Response 200 (Modified):**
```
ETag: "def456"
{
  "tickets": [...]
}
```

### Compression

**Request:**
```
Accept-Encoding: gzip, deflate, br
```

**Response:**
```
Content-Encoding: gzip
```

### Partial Response

**Request:**
```
GET /tickets?fields=id,status,contact.name
```

**Response:**
```json
{
  "tickets": [
    {
      "id": 1,
      "status": "open",
      "contact": {
        "name": "João Silva"
      }
    }
  ]
}
```

---

## Avançado: Versionamento de API

### URL Versioning

```
GET /api/v1/tickets
GET /api/v2/tickets
```

### Header Versioning

```
GET /tickets
Accept: application/vnd.chatia.v2+json
```

### Response com Versão

```json
{
  "apiVersion": "v1",
  "data": { ... }
}
```

---

## Avançado: Idempotência

### Idempotency Keys

**Request:**
```
POST /tickets
Idempotency-Key: unique-key-123

{
  "contactId": 1,
  "status": "open"
}
```

**Comportamento:**
- 1ª requisição: Cria ticket normalmente
- 2ª requisição com mesmo key: Retorna mesmo ticket (não cria duplicado)

---

## Avançado: CORS

### Configuração

```javascript
// Backend
const corsOptions = {
  origin: [
    'http://localhost:3000',
    'https://app.chatia.com'
  ],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
```

### Preflight Request

```
OPTIONS /tickets
Origin: http://localhost:3000
Access-Control-Request-Method: POST
Access-Control-Request-Headers: Authorization
```

**Response:**
```
Access-Control-Allow-Origin: http://localhost:3000
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Headers: Authorization, Content-Type
Access-Control-Allow-Credentials: true
```

---

## Testing

### cURL Examples

```bash
# Login
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@chatia.com","password":"123456"}'

# Get tickets
curl -X GET http://localhost:8080/tickets?status=open \
  -H "Authorization: Bearer <token>"

# Create ticket
curl -X POST http://localhost:8080/tickets \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "contactId": 1,
    "userId": 1,
    "queueId": 1,
    "status": "open"
  }'

# Upload file
curl -X POST http://localhost:8080/messages/1 \
  -H "Authorization: Bearer <token>" \
  -F "body=Segue anexo" \
  -F "medias=@/path/to/file.pdf"
```

### Postman Collection

```json
{
  "info": {
    "name": "ChatIA API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "auth": {
    "type": "bearer",
    "bearer": [
      {
        "key": "token",
        "value": "{{token}}",
        "type": "string"
      }
    ]
  },
  "event": [
    {
      "listen": "prerequest",
      "script": {
        "exec": [
          "// Auto refresh token",
          "if (!pm.globals.get('token')) {",
          "  pm.sendRequest({",
          "    url: 'http://localhost:8080/auth/login',",
          "    method: 'POST',",
          "    body: {",
          "      mode: 'application/json',",
          "      raw: JSON.stringify({",
          "        email: 'admin@chatia.com',",
          "        password: '123456'",
          "      })",
          "    }",
          "  }, (err, res) => {",
          "    pm.globals.set('token', res.json().token);",
          "  });",
          "}"
        ]
      }
    }
  ]
}
```

---

**Total de Endpoints:** 250+
**Versão da API:** v1.0
**Última Atualização:** 2025-10-12
**Documentação Completa:** ✅
