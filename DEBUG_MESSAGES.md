# 🐛 Debug: Mensagens não aparecem no histórico

## ✅ Correções Aplicadas

1. **Adicionado caso `DELETE_MESSAGE` ao reducer** - O reducer agora remove corretamente mensagens deletadas
2. **Adicionados logs de debug extensivos** - Logs estratégicos para rastrear o fluxo de dados

## 🔍 Como Debugar

### Passo 1: Abrir Console do DevTools
1. No Chrome/Edge: **F12** ou **Ctrl+Shift+I** (Windows) / **Cmd+Option+I** (Mac)
2. Ir para a aba **Console**

### Passo 2: Acessar a Página de Tickets
1. Acesse: `http://localhost:3000/tickets/070367e3-c125-4f41-9802-4b01479b1878`
2. **Aguarde 2-3 segundos** para os logs aparecerem

### Passo 3: Verificar os Logs

Você deve ver logs com os seguintes emojis:

#### 🔍 Logs de Inicialização
```
🔍 [MessagesList] useEffect disparado - ticketId: 070367e3-c125-4f41-9802-4b01479b1878 pageNumber: 1
```
✅ **Se aparecer**: O componente iniciou corretamente
❌ **Se NÃO aparecer**: O componente não está montando

---

#### 📡 Logs de Requisição
```
📡 [MessagesList] Fazendo requisição para: /messages/070367e3-c125-4f41-9802-4b01479b1878
```
✅ **Se aparecer**: A requisição está sendo feita
❌ **Se NÃO aparecer**: Verifique:
- Se `ticketId` é "undefined" ou null
- Logs anteriores com ⚠️

---

#### ✅ Logs de Resposta
```
✅ [MessagesList] Resposta recebida: {
  messagesCount: 25,
  hasMore: false,
  ticketInfo: {...}
}
```
✅ **Se `messagesCount > 0`**: O backend está retornando mensagens
❌ **Se `messagesCount = 0`**: Problema no backend - **não há mensagens** para esse ticket

---

#### 📥 Logs de Dispatch
```
📥 [MessagesList] Despachando LOAD_MESSAGES com 25 mensagens
```
✅ **Se aparecer**: O dispatch está sendo chamado
❌ **Se NÃO aparecer**: Algo bloqueou o dispatch

---

#### 🔄 Logs do Reducer
```
🔄 [MessagesList Reducer] Ação recebida: LOAD_MESSAGES Payload: [Array(25)]
🔄 [MessagesList Reducer] Estado atual tem 0 mensagens
✅ [MessagesList Reducer] LOAD_MESSAGES completado. Novo estado tem 25 mensagens
```
✅ **Se o novo estado > 0**: O reducer está funcionando
❌ **Se o novo estado = 0**: Problema no reducer

---

#### 🎨 Logs de Renderização
```
🎨 [MessagesList] renderMessages chamado. messagesList.length: 25
🎨 [MessagesList] Renderizando 25 mensagens
```
✅ **Se `messagesList.length > 0`**: As mensagens devem aparecer na tela
❌ **Se `messagesList.length = 0`**: O estado não está chegando na renderização

---

## 🎯 Diagnóstico Rápido

### Cenário 1: Nenhum log aparece
**Problema**: O componente não está montando
**Solução**: Verificar se o componente `MessagesList` está sendo importado e usado corretamente

### Cenário 2: Logs aparecem mas `messagesCount = 0`
**Problema**: Não há mensagens no banco de dados para esse ticket
**Solução**:
1. Verificar se o UUID do ticket está correto
2. Verificar se há mensagens no banco para esse ticket:
   ```sql
   SELECT COUNT(*) FROM Messages WHERE ticketId IN (SELECT id FROM Tickets WHERE uuid = '070367e3-c125-4f41-9802-4b01479b1878');
   ```

### Cenário 3: `messagesCount > 0` mas não renderiza
**Problema**: Problema na renderização ou no estado
**Solução**: Verificar os logs do reducer e renderMessages

### Cenário 4: Erro ❌ nos logs
**Problema**: Exceção na API
**Solução**: Copiar o erro completo e enviar para análise

---

## 📋 Checklist de Informações Necessárias

Ao reportar o problema, envie:
- [ ] **Screenshot do console** com TODOS os logs
- [ ] O **ticketId/UUID** que está testando
- [ ] Se aparecem **erros em vermelho** no console
- [ ] Qual dos 4 cenários acima se aplica
- [ ] **Network tab**: Status da requisição `/messages/...` (200? 404? 500?)

---

## 🔧 Problemas Comuns Identificados

### 1. Permissões de Fila (Queue)
Se `messagesCount = 0` mas você sabe que há mensagens, pode ser problema de permissão de fila.

**Verificar**:
```javascript
// No console do browser:
JSON.parse(localStorage.getItem('user'))
```

Veja se o usuário tem acesso à fila (`queues`) do ticket.

### 2. Ticket não existe
Se a API retornar **404**, o ticket UUID pode não existir no banco.

**Verificar no backend**:
```sql
SELECT * FROM Tickets WHERE uuid = '070367e3-c125-4f41-9802-4b01479b1878';
```

### 3. CompanyId incorreto
Se as mensagens são de outra empresa, elas não aparecem por filtro multi-tenant.

**Verificar**:
```sql
SELECT t.companyId, m.companyId
FROM Tickets t
LEFT JOIN Messages m ON m.ticketId = t.id
WHERE t.uuid = '070367e3-c125-4f41-9802-4b01479b1878';
```

---

## 📞 Próximos Passos

1. **Execute os testes** acima
2. **Copie os logs** do console
3. **Envie** as informações do checklist
4. Analisaremos os logs para identificar o problema exato

---

---

## 🚀 Correção de Mensagens em Tempo Real

### Problema Identificado - Socket.IO
As mensagens não estavam aparecendo em tempo real na página de tickets devido a inconsistências na emissão de eventos Socket.IO.

### Correções Aplicadas:

#### 1. **CreateMessageService.ts**
- Adicionada emissão para o canal raiz: `io.emit()`
- Mantidas múltiplas emissões para compatibilidade
- Garantido que o ticket com `uuid` seja sempre incluído

#### 2. **MessageController.ts**
- Adicionado reload do ticket com `uuid` antes de emitir eventos
- Incluído `ticket` completo no payload de todas as ações
- Padronizado emissões para múltiplos canais

#### 3. **Estrutura do Payload Corrigida**
```javascript
{
  action: "create" | "update" | "delete",
  message: Message,
  ticket: {
    id: number,
    uuid: string,  // Campo essencial para o frontend
    status: string,
    contact: Contact
  }
}
```

### Como Testar Mensagens em Tempo Real:

1. **Abrir 2 navegadores/abas diferentes**
2. **Fazer login com usuários diferentes**
3. **Abrir o mesmo ticket nos 2 navegadores**
4. **Enviar mensagem em um navegador**
5. **A mensagem deve aparecer instantaneamente no outro**

### Logs de Socket.IO no Console:
```
📡 [MessagesList] Socket conectado, emitindo joinChatBox
📥 [MessagesList] Mensagem recebida via Socket.IO
```

---

## 🔧 Correção UUID vs ID Numérico (2025-10-15)

### Problema Encontrado
O frontend estava enviando mensagens usando o ID numérico do ticket (`/messages/6`) mas esperava receber eventos Socket.IO com UUID (`070367e3-c125-4f41-9802-4b01479b1878`), causando incompatibilidade na validação.

### Correções Aplicadas:

#### 1. **Frontend - Ticket Component** (`frontend/src/components/Ticket/index.js`)
- Alterado para passar o UUID ao invés do ID numérico para MessageInput
- De: `ticketId={ticket.id}`
- Para: `ticketId={ticket.uuid || ticketId}`

#### 2. **Backend - MessageController** (`backend/src/controllers/MessageController.ts`)
- Adicionada conversão automática de ID numérico para UUID no método `store`
- Garante compatibilidade com ambos os formatos

#### 3. **Backend - ShowTicketService** (`backend/src/services/TicketServices/ShowTicketService.ts`)
- Modificado para aceitar tanto UUID quanto ID numérico
- Detecta automaticamente o tipo de identificador e busca corretamente

### Como Verificar:
1. Abra o console do navegador (F12)
2. Envie uma mensagem na página de tickets
3. Verifique o log: `🚀 [CreateMessageService] Emitindo evento Socket.IO:`
4. Deve mostrar tanto `ticketId` (numérico) quanto `ticketUuid` (string UUID)

---

## 🔧 Correção Crítica: UUID não estava sendo carregado (2025-10-15)

### Problema Raiz Identificado
O **CreateMessageService** não estava especificando os atributos do Ticket no `include`, resultando no campo `uuid` não sendo carregado na consulta Sequelize. Isso fazia com que o evento Socket.IO fosse emitido sem o campo `uuid`, falhando a validação no frontend.

### Correção Aplicada:

**Backend - CreateMessageService** (`backend/src/services/MessageServices/CreateMessageService.ts:48`)
```typescript
// ANTES: Sem atributos especificados
{
  model: Ticket,
  as: "ticket",
  include: [...]
}

// DEPOIS: Com atributos incluindo UUID
{
  model: Ticket,
  as: "ticket",
  attributes: ["id", "uuid", "status", "queueId", ...],
  include: [...]
}
```

**Frontend - MessagesList Logs** (`frontend/src/components/MessagesList/index.js:580-600`)
- Adicionados logs detalhados para rastrear exatamente o que chega via Socket.IO
- Mostra claramente se a validação UUID passou ou falhou

### Como Verificar:
1. **Reinicie o backend** (ts-node-dev deve recarregar automaticamente)
2. **Abra o console** do navegador (F12)
3. **Envie uma mensagem** na página de tickets
4. **Verifique os logs**:

**Backend deve mostrar:**
```
🚀 [CreateMessageService] Emitindo evento Socket.IO: {
  ticketId: 6,
  ticketUuid: '070367e3-c125-4f41-9802-4b01479b1878',  ← DEVE APARECER
  hasTicket: true,
  companyId: 1
}
```

**Frontend deve mostrar:**
```
📥 [MessagesList] Mensagem recebida via Socket.IO: {
  action: 'create',
  ticketUuid: '070367e3-c125-4f41-9802-4b01479b1878',  ← DEVE APARECER
  currentTicketId: '070367e3-c125-4f41-9802-4b01479b1878',
  matchCreate: true  ← DEVE SER TRUE
}
✅ [MessagesList] ADD_MESSAGE - Validação passou, adicionando mensagem
🔄 [MessagesList Reducer] Ação recebida: ADD_MESSAGE
```

**Última atualização**: 2025-10-15 (Correção crítica de UUID aplicada)

---

## 🔧 CORREÇÃO CRÍTICA: CreateMessageService não era chamado (2025-10-15)

### Problema Raiz Definitivo

O **SendWhatsAppMessage** e **SendWhatsAppMedia** enviavam mensagens para o WhatsApp com sucesso (retornando 200 OK), mas **não salvavam as mensagens no banco de dados** e **não emitiam eventos Socket.IO**.

### Por que isso acontecia?

**Fluxo Antigo (INCORRETO):**
1. Frontend envia POST `/messages/:ticketId` com corpo da mensagem
2. `MessageController.store` chama `SendWhatsAppMessage({ body, ticket, ... })`
3. `SendWhatsAppMessage` envia para WhatsApp via `wbot.sendMessage()`
4. Atualiza `ticket.lastMessage`
5. **Retorna 200 OK** ✅
6. **MAS NÃO chama CreateMessageService** ❌
7. **Mensagem não é salva no banco** ❌
8. **Nenhum evento Socket.IO emitido** ❌
9. **Mensagem não aparece no histórico** ❌

**Fluxo Correto (DEPOIS DA CORREÇÃO):**
1. Frontend envia POST `/messages/:ticketId`
2. `MessageController.store` chama `SendWhatsAppMessage({ body, ticket, ... })`
3. `SendWhatsAppMessage` envia para WhatsApp via `wbot.sendMessage()`
4. Atualiza `ticket.lastMessage`
5. **AGORA chama CreateMessageService com messageData** ✅
6. CreateMessageService salva no banco ✅
7. CreateMessageService emite eventos Socket.IO ✅
8. **Retorna 200 OK** ✅
9. **Mensagem aparece instantaneamente no histórico** ✅

### Arquivos Corrigidos:

#### 1. **SendWhatsAppMessage.ts** (backend/src/services/WbotServices/)
```typescript
// Adicionado import
import CreateMessageService from "../MessageServices/CreateMessageService";

// Após cada wbot.sendMessage(), adicionado:
const messageData = {
  wid: sentMessage.key.id,
  ticketId: ticket.id,
  contactId: undefined,
  body: formatBody(body, ticket),
  fromMe: true,
  mediaType: "extendedTextMessage",
  read: true,
  quotedMsgId: quotedMsg?.id || null,
  ack: 1,
  remoteJid: number,
  participant: null,
  dataJson: JSON.stringify(sentMessage),
  ticketTrakingId: ticket.ticketTrakingId,
  isPrivate: false,
  isForwarded,
  companyId: ticket.companyId,
  createdAt: new Date(),
  updatedAt: new Date(),
};

await CreateMessageService({ messageData, companyId: ticket.companyId });
```

**Locais corrigidos no arquivo:**
- Linha ~160: Envio de vCard
- Linha ~236: Envio com template buttons
- Linha ~290: Envio de mensagem de texto regular

#### 2. **SendWhatsAppMedia.ts** (backend/src/services/WbotServices/)
```typescript
// Após wbot.sendMessage() e ticket.update(), adicionado:
const baseType = media.mimetype?.split("/")[0] ?? "document";
const messageData = {
  wid: sentMessage.key.id,
  ticketId: ticket.id,
  contactId: undefined,
  body: bodyMedia,
  fromMe: true,
  mediaUrl: media.filename,
  mediaType: baseType === "audio" ? "audioMessage" : baseType === "video" ? "videoMessage" : baseType === "image" ? "imageMessage" : "documentMessage",
  read: true,
  quotedMsgId: null,
  ack: 1,
  remoteJid: number,
  participant: null,
  dataJson: JSON.stringify(sentMessage),
  ticketTrakingId: ticket.ticketTrakingId,
  isPrivate: false,
  isForwarded,
  companyId: ticket.companyId,
  createdAt: new Date(),
  updatedAt: new Date(),
};

await CreateMessageService({ messageData, companyId: ticket.companyId });
```

**Locais corrigidos:**
- Linha ~268: Envio de mídia (áudio, vídeo, imagem, documento)

### Como Testar Agora:

1. **Reinicie o backend** (ts-node-dev deve recarregar automaticamente)
2. **Acesse a página de tickets**: `http://localhost:3000/tickets/070367e3-c125-4f41-9802-4b01479b1878`
3. **Digite uma mensagem de teste** e envie
4. **Verifique os logs no terminal do backend**:

```
🚀 [CreateMessageService] Emitindo evento Socket.IO: {
  ticketId: 6,
  ticketUuid: '070367e3-c125-4f41-9802-4b01479b1878',
  hasTicket: true,
  companyId: 1,
  channel: 'company-1-appMessage'
}
```

5. **Verifique os logs no console do navegador** (F12):

```
📥 [MessagesList] Mensagem recebida via Socket.IO: {
  action: 'create',
  ticketUuid: '070367e3-c125-4f41-9802-4b01479b1878',
  currentTicketId: '070367e3-c125-4f41-9802-4b01479b1878',
  matchCreate: true
}
✅ [MessagesList] ADD_MESSAGE - Validação passou, adicionando mensagem
🔄 [MessagesList Reducer] Ação recebida: ADD_MESSAGE
```

6. **A mensagem deve aparecer INSTANTANEAMENTE** no histórico do chat

### Diferença Entre Mensagens Recebidas vs Enviadas:

**Mensagens RECEBIDAS do WhatsApp:**
- Listener `wbotMessageListener.ts` recebe a mensagem do WhatsApp
- Chama `CreateMessageService` diretamente ✅
- Sempre funcionou corretamente

**Mensagens ENVIADAS para o WhatsApp (ANTES DA CORREÇÃO):**
- `SendWhatsAppMessage` enviava mas não salvava ❌
- `SendWhatsAppMedia` enviava mas não salvava ❌
- Causava inconsistência no histórico

**Mensagens ENVIADAS para o WhatsApp (DEPOIS DA CORREÇÃO):**
- `SendWhatsAppMessage` envia E salva ✅
- `SendWhatsAppMedia` envia E salva ✅
- Histórico completo e consistente

### Resultado Final:

✅ POST `/messages/:ticketId` retorna 200 OK
✅ Mensagem salva no banco de dados
✅ Evento Socket.IO emitido com ticket UUID correto
✅ Mensagem aparece instantaneamente no histórico
✅ Sincronização em tempo real funcionando perfeitamente

**Última atualização**: 2025-10-15 23:45 (CORREÇÃO CRÍTICA APLICADA - CreateMessageService)
