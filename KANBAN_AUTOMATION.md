# 🎯 Automação de Movimentação de Cards no Kanban

## 📋 Funcionalidade

Este sistema implementa a movimentação automática de cards (tickets) no kanban baseado no tempo de resposta do usuário. Quando o atendente envia uma mensagem e o cliente não responde dentro do tempo configurado, o ticket é movido automaticamente para a próxima coluna (lane).

## 🔧 Componentes Criados

### 1. **Migration: Campos de Timer**
**Arquivo**: `backend/src/database/migrations/20251015000000-add-lane-timer-fields-to-Tickets.ts`

Adiciona dois novos campos ao modelo `Ticket`:
- `laneTimerStartedAt`: Data/hora quando o timer foi iniciado (quando atendente enviou mensagem)
- `laneNextMoveAt`: Data/hora quando o ticket deve ser movido automaticamente

### 2. **Modelo Tag (Lane) - Campos Existentes**
**Arquivo**: `backend/src/models/Tag.ts`

Campos que já existiam e são usados pela automação:
- `timeLane`: Tempo em **minutos** para aguardar resposta do cliente
- `nextLaneId`: ID da próxima lane para onde mover o ticket automaticamente
- `greetingMessageLane`: Mensagem de saudação enviada ao mover para esta lane
- `rollbackLaneId`: ID da lane para onde mover se o cliente responder antes do tempo

### 3. **Serviços Criados**

#### `MoveTicketLaneService.ts`
Move um ticket de uma lane para outra, enviando mensagem de saudação se configurada.

#### `StartLaneTimerService.ts`
Inicia o timer quando o atendente envia uma mensagem. Calcula `laneNextMoveAt` baseado no `timeLane`.

#### `HandleCustomerResponseService.ts`
Cancela o timer e move para `rollbackLaneId` quando o cliente responde antes do tempo expirar.

#### `ProcessExpiredLaneTimersJob.ts`
Job executado a cada minuto que verifica tickets com timer expirado e os move automaticamente.

### 4. **Integração no CreateMessageService**
**Arquivo**: `backend/src/services/MessageServices/CreateMessageService.ts`

Adicionada lógica para:
- **Mensagem do atendente (fromMe: true)**: Inicia timer de lane
- **Mensagem do cliente (fromMe: false)**: Cancela timer e move para rollbackLaneId

### 5. **Cron Job**
**Arquivo**: `backend/src/server.ts`

Job executado a cada minuto (`* * * * *`) que processa timers expirados.

## 🎬 Como Funciona

### Cenário 1: Cliente NÃO responde (movimento para frente)

1. **Atendente envia mensagem** na página `/tickets`
2. Sistema verifica se o ticket está em uma lane kanban
3. Se a lane tem `timeLane` e `nextLaneId` configurados:
   - Inicia timer: `laneTimerStartedAt = agora`
   - Calcula quando mover: `laneNextMoveAt = agora + timeLane minutos`
4. **Cliente NÃO responde** dentro do tempo
5. Cron job detecta que `laneNextMoveAt <= agora`
6. **Move ticket para `nextLaneId`**
7. Envia `greetingMessageLane` se configurada

### Cenário 2: Cliente responde (rollback)

1. **Atendente envia mensagem**
2. Timer iniciado conforme Cenário 1
3. **Cliente RESPONDE** antes do tempo expirar
4. Sistema detecta mensagem do cliente (`fromMe: false`)
5. Se a lane tem `rollbackLaneId` configurado:
   - **Move ticket para `rollbackLaneId`**
   - Envia mensagem de saudação da lane de rollback
6. Se não tem `rollbackLaneId`:
   - Apenas cancela o timer (ticket permanece na lane atual)

## ⚙️ Configuração das Lanes

Para ativar a automação, configure os seguintes campos nas lanes (Tags com `kanban: 1`):

### Campos Obrigatórios para Movimento Automático:
- **`timeLane`**: Tempo em minutos (ex: 5, 30, 60, 1440 para 1 dia)
- **`nextLaneId`**: ID da lane para onde mover quando o tempo expirar

### Campos Opcionais:
- **`greetingMessageLane`**: Mensagem automática ao entrar nesta lane
- **`rollbackLaneId`**: Lane para onde mover se o cliente responder

## 📊 Exemplo de Configuração

### Lane 1: "Aguardando Resposta" (ID: 1)
```javascript
{
  name: "Aguardando Resposta",
  timeLane: 30, // 30 minutos
  nextLaneId: 2, // Mover para "Sem Resposta"
  greetingMessageLane: "Olá! Como posso ajudá-lo?",
  rollbackLaneId: 3 // Se responder, mover para "Em Atendimento"
}
```

### Lane 2: "Sem Resposta" (ID: 2)
```javascript
{
  name: "Sem Resposta",
  timeLane: 60, // 1 hora
  nextLaneId: 4, // Mover para "Finalizado"
  greetingMessageLane: "Notamos que você não respondeu. Podemos ajudar?",
  rollbackLaneId: 3 // Se responder, mover para "Em Atendimento"
}
```

### Lane 3: "Em Atendimento" (ID: 3)
```javascript
{
  name: "Em Atendimento",
  timeLane: null, // Não move automaticamente
  nextLaneId: null,
  greetingMessageLane: "Obrigado por responder! Vou ajudá-lo agora.",
  rollbackLaneId: null
}
```

## 🧪 Como Testar

### Pré-requisitos
1. **Rodar a migration**:
   ```bash
   cd backend
   npm run db:migrate
   ```

2. **Reiniciar o backend** (se já estava rodando):
   ```bash
   # Se estiver com ts-node-dev, ele deve recarregar automaticamente
   # Se não, pare e inicie novamente
   npm run dev:server
   ```

### Teste 1: Movimento Automático (sem resposta do cliente)

1. **Configurar uma lane de teste**:
   - No banco de dados, edite uma tag kanban
   - Defina `timeLane = 1` (1 minuto para teste rápido)
   - Defina `nextLaneId` para outra lane
   - Opcional: Defina `greetingMessageLane`

2. **Mover um ticket para esta lane**:
   - Na página `/kanban`, arraste um ticket para a lane configurada

3. **Enviar mensagem do atendente**:
   - Abra o ticket em `/tickets/:uuid`
   - Envie uma mensagem qualquer

4. **Verificar logs** do backend (deveria aparecer):
   ```
   ⏰ [StartLaneTimer] Timer iniciado para ticket X:
   {
     lane: "Aguardando Resposta",
     timeLane: 1,
     startedAt: ...,
     moveAt: ...,
     nextLaneId: 2
   }
   ```

5. **Aguardar 1+ minutos**

6. **Verificar logs** após 1 minuto:
   ```
   ⏰ [ProcessExpiredLaneTimers] Encontrados 1 tickets com timer expirado
   🔄 [ProcessExpiredLaneTimers] Movendo ticket X da lane "..." para nextLaneId 2
   ✅ [MoveTicketLane] Ticket X movido para lane "..." (ID: 2)
   ✅ [ProcessExpiredLaneTimers] Ticket X movido com sucesso
   ```

7. **Verificar no frontend**:
   - Página `/kanban` deve mostrar o ticket na nova lane
   - Se `greetingMessageLane` está configurada, a mensagem foi enviada

### Teste 2: Rollback (cliente responde)

1. **Configurar lane com rollbackLaneId**:
   - Defina `timeLane = 5` (5 minutos)
   - Defina `nextLaneId` para uma lane
   - Defina `rollbackLaneId` para outra lane

2. **Mover ticket para a lane**

3. **Atendente envia mensagem**

4. **Cliente responde** (antes de 5 minutos):
   - Envie uma mensagem como se fosse o cliente (fromMe: false)
   - Pode simular recebendo mensagem via WhatsApp

5. **Verificar logs**:
   ```
   🔄 [HandleCustomerResponse] Cliente respondeu no ticket X, movendo para rollbackLaneId Y
   ✅ [MoveTicketLane] Ticket X movido para lane "..." (ID: Y)
   ```

6. **Verificar no frontend**:
   - Ticket deve estar na lane de rollback

### Teste 3: Lane sem timer (não move)

1. **Configurar lane sem timeLane ou nextLaneId**

2. **Mover ticket para esta lane**

3. **Atendente envia mensagem**

4. **Verificar logs**:
   ```
   ⏭️ [StartLaneTimer] Lane "..." não tem timer ou nextLaneId configurado, timer não iniciado
   ```

5. **Ticket permanece na mesma lane indefinidamente**

## 📝 Campos do Banco de Dados

### Tabela `Tickets` (novos campos):
```sql
ALTER TABLE "Tickets"
ADD COLUMN "laneTimerStartedAt" TIMESTAMP,
ADD COLUMN "laneNextMoveAt" TIMESTAMP;
```

### Tabela `Tags` (campos existentes):
```sql
-- Já existem, criados em migrations antigas:
timeLane INTEGER DEFAULT 0,
nextLaneId INTEGER,
greetingMessageLane TEXT,
rollbackLaneId INTEGER
```

## 🔍 Logs de Debug

Ao testar, procure pelos seguintes logs no terminal do backend:

- `⏰ [StartLaneTimer]`: Timer iniciado para um ticket
- `⏭️ [StartLaneTimer]`: Timer não iniciado (sem configuração)
- `🔄 [HandleCustomerResponse]`: Cliente respondeu, movendo para rollback
- `⏹️ [HandleCustomerResponse]`: Cliente respondeu, timer cancelado
- `⏰ [ProcessExpiredLaneTimers]`: Cron job executando
- `🔄 [ProcessExpiredLaneTimers]`: Movendo ticket expirado
- `✅ [MoveTicketLane]`: Ticket movido com sucesso
- `📨 [MoveTicketLane]`: Mensagem de saudação enviada

## ⚠️ Considerações Importantes

1. **Mensagens privadas** (`isPrivate: true`) NÃO iniciam/cancelam timers

2. **Mensagens importadas** (`ticketImported`) NÃO iniciam/cancelam timers

3. **Timer é cancelado** quando:
   - Cliente responde (se `rollbackLaneId` está configurado, move o ticket)
   - Ticket é movido manualmente para outra lane
   - Lane não tem `nextLaneId` configurado

4. **Cron roda a cada minuto**: Precisão mínima de 1 minuto

5. **Multi-tenant**: Todos os serviços validam `companyId`

6. **Socket.IO**: Mudanças de lane emitem eventos para atualizar o frontend em tempo real

## 🎉 Resultado Final

Com esta implementação:
- ✅ Cards movem automaticamente quando cliente não responde
- ✅ Cards voltam para lane anterior quando cliente responde
- ✅ Mensagens de saudação automáticas ao entrar em lanes
- ✅ Totalmente configurável por lane
- ✅ Logs detalhados para debug
- ✅ Atualização em tempo real via Socket.IO
- ✅ Multi-tenant seguro
