# 🔍 ROADMAP: Debug Kanban - Movimento Automático para Lane "Retorno"

## 📋 Problema Reportado

**Sintoma:** Quando admin/atendente envia mensagem, o ticket vai direto para a lane de **RETORNO** ao invés de seguir o fluxo normal configurado (timeLane → nextLaneId).

**Comportamento Esperado:**
1. Admin envia mensagem → Timer inicia (`StartLaneTimerService`)
2. Aguarda tempo configurado (`timeLane`)
3. Move automaticamente para `nextLaneId`

**Comportamento Atual (BUG):**
1. Admin envia mensagem → Ticket vai direto para lane "Retorno" 🐛

---

## 🔎 Análise do Código

### ✅ Fluxo Normal Identificado

#### 1. MessageController.ts (linha 805)
```typescript
// Admin envia mensagem via interface
await SendWhatsAppMessage({ body, ticket, quotedMsg, vCard });
```

#### 2. SendWhatsAppMessage.ts (linhas 143, 219, 272)
```typescript
// Define fromMe: true para mensagens do atendente
const messageData = {
  fromMe: true,  // ✅ CORRETO
  // ...
};
await CreateMessageService({ messageData, companyId });
```

#### 3. CreateMessageService.ts (linha 152-164)
```typescript
// Lógica de decisão baseada em fromMe
if (message.fromMe) {
  // ✅ Mensagem do atendente -> Iniciar timer para nextLaneId
  await StartLaneTimerService({ ticketId, companyId });
} else {
  // ❌ Mensagem do cliente -> Mover para rollbackLaneId
  await HandleCustomerResponseService({ ticketId, companyId });
}
```

#### 4. HandleCustomerResponseService.ts (linha 60-68)
```typescript
// Se tem rollbackLaneId, move para lane "Retorno"
if (currentLane.rollbackLaneId) {
  await MoveTicketLaneService({
    ticketId,
    companyId,
    toLaneId: currentLane.rollbackLaneId,  // ← AQUI: Move para "Retorno"
    sendGreeting: true
  });
}
```

---

## 🧩 Hipóteses do Problema

### Hipótese 1: `fromMe` está vindo como `false` ⚠️
**Causa possível:**
- Algum middleware sobrescreve `fromMe`
- MessageData não está sendo propagado corretamente
- Há outro fluxo de envio que não passa por SendWhatsAppMessage

**Como testar:**
```typescript
// Adicionar log em CreateMessageService.ts (linha 152)
console.log(`🔍 [DEBUG] message.fromMe = ${message.fromMe}, ticketId = ${message.ticketId}`);
if (message.fromMe) {
  console.log(`✅ [DEBUG] Chamando StartLaneTimerService`);
  await StartLaneTimerService({...});
} else {
  console.log(`❌ [DEBUG] Chamando HandleCustomerResponseService (DEVERIA SER CLIENTE, NÃO ADMIN!)`);
  await HandleCustomerResponseService({...});
}
```

---

### Hipótese 2: Problema no fluxo de lane atual 🔄
**Causa possível:**
- Lane atual já tem `rollbackLaneId` configurado
- Ticket já está em estado inconsistente
- Há um timer ativo que está sendo cancelado incorretamente

**Como testar:**
```sql
-- Verificar configuração das lanes
SELECT id, name, kanban, timeLane, nextLaneId, rollbackLaneId
FROM "Tags"
WHERE kanban = 1 AND "companyId" = {YOUR_COMPANY_ID}
ORDER BY id;

-- Verificar estado do ticket
SELECT id, status, "laneTimerStartedAt", "laneNextMoveAt", "allowAutomaticMove"
FROM "Tickets"
WHERE id = {TICKET_ID};
```

---

### Hipótese 3: Condições de corrida (Race Condition) ⏱️
**Causa possível:**
- Cliente respondeu no exato momento que admin enviou
- Duas mensagens sendo processadas simultaneamente
- HandleCustomerResponseService executa antes de StartLaneTimerService

**Como testar:**
```typescript
// Adicionar timestamp nos logs
console.log(`⏰ [${new Date().toISOString()}] message.fromMe = ${message.fromMe}`);
```

---

### Hipótese 4: Mensagem privada sendo tratada como cliente 📝
**Causa possível:**
- `isPrivate` está ativo e sobrescrevendo lógica
- Há condição especial para mensagens privadas

**Como testar:**
```typescript
// Verificar em CreateMessageService.ts
console.log(`🔍 [DEBUG] isPrivate = ${message.isPrivate}, fromMe = ${message.fromMe}`);
```

---

## 🛠️ Plano de Debug (Passo a Passo)

### Passo 1: Adicionar Logs de Debug 📝

**Arquivo:** `backend/src/services/MessageServices/CreateMessageService.ts`

```typescript
// LINHA 149 - ADICIONAR ANTES DO IF
console.log(`
╔════════════════════════════════════════════════════════════
║ 🔍 KANBAN DEBUG - CreateMessageService
╠════════════════════════════════════════════════════════════
║ Timestamp:        ${new Date().toISOString()}
║ Message ID:       ${message.id}
║ Ticket ID:        ${message.ticketId}
║ Company ID:       ${companyId}
║ fromMe:           ${message.fromMe}
║ isPrivate:        ${message.isPrivate}
║ ticketImported:   ${messageData?.ticketImported}
║
║ Decisão: ${message.fromMe ? 'StartLaneTimerService ✅' : 'HandleCustomerResponseService ❌'}
╚════════════════════════════════════════════════════════════
`);
```

---

### Passo 2: Adicionar Logs em HandleCustomerResponseService 🔄

**Arquivo:** `backend/src/services/TicketServices/HandleCustomerResponseService.ts`

```typescript
// LINHA 59 - ADICIONAR ANTES DO IF
console.log(`
╔════════════════════════════════════════════════════════════
║ 🔄 HANDLE CUSTOMER RESPONSE
╠════════════════════════════════════════════════════════════
║ Ticket ID:        ${ticketId}
║ Current Lane:     ${currentLane.name} (ID: ${currentLane.id})
║ rollbackLaneId:   ${currentLane.rollbackLaneId || 'NÃO CONFIGURADO'}
║
║ Ação: ${currentLane.rollbackLaneId ? `Mover para rollbackLane ${currentLane.rollbackLaneId}` : 'Apenas cancelar timer'}
╚════════════════════════════════════════════════════════════
`);
```

---

### Passo 3: Adicionar Logs em StartLaneTimerService ⏰

**Arquivo:** `backend/src/services/TicketServices/StartLaneTimerService.ts`

```typescript
// LINHA 64 - JÁ EXISTE, MAS MELHORAR
console.log(`
╔════════════════════════════════════════════════════════════
║ ⏰ START LANE TIMER
╠════════════════════════════════════════════════════════════
║ Ticket ID:        ${ticketId}
║ Lane:             ${currentLane.name} (ID: ${currentLane.id})
║ timeLane:         ${currentLane.timeLane} minutos
║ nextLaneId:       ${currentLane.nextLaneId}
║
║ Timer:
║   - Iniciado em:  ${now.toISOString()}
║   - Moverá em:    ${moveAt.toISOString()}
║
║ allowAutomaticMove: true ✅
╚════════════════════════════════════════════════════════════
`);
```

---

### Passo 4: Reiniciar Backend e Testar 🔄

```bash
# 1. Reiniciar backend
cd /Users/brunovilefort/Desktop/chatia-final/chatia/backend
npm run dev

# 2. Abrir logs em outra aba do terminal
tail -f /Users/brunovilefort/Desktop/chatia-final/chatia/backend/logs/*.log | grep -E "KANBAN DEBUG|HANDLE CUSTOMER|START LANE"

# 3. Reproduzir o problema:
#    a) Criar ticket ou usar existente
#    b) Mover para uma lane com timeLane e nextLaneId configurados
#    c) ADMIN envia mensagem
#    d) Observar os logs
```

---

### Passo 5: Verificar Banco de Dados 💾

```sql
-- 1. Verificar estado do ticket ANTES de enviar mensagem
SELECT
  t.id,
  t.status,
  t."laneTimerStartedAt",
  t."laneNextMoveAt",
  t."allowAutomaticMove",
  tag.id as lane_id,
  tag.name as lane_name,
  tag.timeLane,
  tag.nextLaneId,
  tag.rollbackLaneId
FROM "Tickets" t
LEFT JOIN "TicketTags" tt ON tt."ticketId" = t.id
LEFT JOIN "Tags" tag ON tag.id = tt."tagId" AND tag.kanban = 1
WHERE t.id = {TICKET_ID};

-- 2. Verificar mensagens do ticket
SELECT
  id,
  body,
  "fromMe",
  "isPrivate",
  "createdAt"
FROM "Messages"
WHERE "ticketId" = {TICKET_ID}
ORDER BY "createdAt" DESC
LIMIT 10;

-- 3. Verificar estado do ticket DEPOIS de enviar mensagem
-- (executar o SELECT 1 novamente)
```

---

## 🎯 Cenários de Teste

### Teste 1: Fluxo Normal (Admin → Timer → Auto-move)
```
1. ✅ Configurar lane:
   - timeLane: 1 minuto
   - nextLaneId: ID da próxima lane
   - rollbackLaneId: VAZIO ou NULL

2. ✅ Mover ticket para essa lane

3. ✅ ADMIN envia mensagem

4. ✅ Verificar logs:
   - Deve mostrar "fromMe: true"
   - Deve chamar StartLaneTimerService
   - allowAutomaticMove deve ser true

5. ✅ Aguardar 1+ minuto

6. ✅ Verificar:
   - Ticket deve estar na nextLaneId
   - Logs do ProcessExpiredLaneTimersJob
```

### Teste 2: Fluxo com Cliente Respondendo
```
1. ✅ Configurar lane:
   - timeLane: 2 minutos
   - nextLaneId: ID da próxima lane
   - rollbackLaneId: ID da lane "Retorno"

2. ✅ Mover ticket para essa lane

3. ✅ ADMIN envia mensagem
   - Logs devem mostrar fromMe: true
   - StartLaneTimerService deve ser chamado

4. ✅ CLIENTE responde (antes dos 2 min)
   - Logs devem mostrar fromMe: false
   - HandleCustomerResponseService deve ser chamado
   - Deve mover para rollbackLaneId

5. ✅ Aguardar 2+ minutos

6. ✅ Verificar:
   - Ticket deve PERMANECER em rollbackLaneId
   - allowAutomaticMove deve ser false
   - Cron NÃO deve mover
```

### Teste 3: Mensagem Privada
```
1. ✅ ADMIN envia mensagem privada (isPrivate = true)

2. ✅ Verificar logs:
   - fromMe deve ser true
   - isPrivate deve ser true
   - Deve pular automação (linha 150: !message.isPrivate)

3. ✅ Ticket NÃO deve mover
```

---

## 🚨 Checklist de Problemas Conhecidos

- [ ] **fromMe está como false quando deveria ser true**
  - Verificar MessageController.ts linha 805-827
  - Verificar SendWhatsAppMessage.ts linhas 143, 219, 272
  - Verificar se há outro endpoint sendo usado

- [ ] **Lane está com rollbackLaneId configurado incorretamente**
  - Verificar configuração das Tags no banco
  - Validar no frontend /tagsKanban

- [ ] **Ticket está com timer ativo de sessão anterior**
  - Limpar laneTimerStartedAt e laneNextMoveAt
  - Resetar allowAutomaticMove para true

- [ ] **Mensagem sendo duplicada/reprocessada**
  - Verificar logs de CreateMessageService duplicados
  - Verificar se Socket.IO está emitindo múltiplas vezes

- [ ] **Condição de corrida entre mensagens**
  - Verificar timestamp nos logs
  - Validar ordem de execução

---

## 🔧 Correções Possíveis (Após Identificar Problema)

### Correção 1: Se fromMe está incorreto
```typescript
// Em SendWhatsAppMessage.ts ou MessageController.ts
// Garantir que SEMPRE seja true para admin
const messageData = {
  // ...
  fromMe: true,  // ← Forçar explicitamente
  // ...
};
```

### Correção 2: Se é problema de condição
```typescript
// Em CreateMessageService.ts
// Adicionar mutex ou lock para evitar race condition
import { Mutex } from 'async-mutex';
const kanbanMutex = new Mutex();

await kanbanMutex.runExclusive(async () => {
  if (message.fromMe) {
    await StartLaneTimerService({...});
  } else {
    await HandleCustomerResponseService({...});
  }
});
```

### Correção 3: Se é problema de configuração de lane
```sql
-- Resetar rollbackLaneId de lanes que não deveriam ter
UPDATE "Tags"
SET "rollbackLaneId" = NULL
WHERE kanban = 1
  AND name NOT LIKE '%Retorno%'
  AND name NOT LIKE '%Aguardando%';
```

---

## 📊 Métricas de Sucesso

### Debug Concluído Quando:
- [ ] Logs mostram claramente o fluxo da mensagem
- [ ] fromMe está correto (true para admin, false para cliente)
- [ ] StartLaneTimerService é chamado quando admin envia
- [ ] HandleCustomerResponseService é chamado APENAS quando cliente responde
- [ ] Tickets movem corretamente para nextLaneId após tempo expirar
- [ ] Tickets movem para rollbackLaneId APENAS quando cliente responde

### Sistema Funcionando Quando:
- [ ] Admin envia → Timer inicia → Auto-move para nextLaneId ✅
- [ ] Cliente responde → Move para rollbackLaneId → Bloqueia auto-move ✅
- [ ] allowAutomaticMove funciona corretamente ✅
- [ ] Sem duplicação de eventos ✅
- [ ] Sem race conditions ✅

---

## 📞 Próximos Passos

1. **EXECUTAR:** Adicionar logs de debug conforme Passo 1-3
2. **REINICIAR:** Backend com `npm run dev`
3. **TESTAR:** Reproduzir problema com admin enviando mensagem
4. **ANALISAR:** Logs gerados
5. **IDENTIFICAR:** Qual hipótese é a correta
6. **CORRIGIR:** Aplicar correção apropriada
7. **VALIDAR:** Executar Testes 1, 2 e 3
8. **DOCUMENTAR:** Atualizar este ROADMAP com solução encontrada

---

## 📝 Notas de Desenvolvimento

**Data:** 2025-10-17
**Versão:** 1.0
**Status:** 🔍 Debug em andamento

**Última atualização:** Análise de código concluída, logs de debug definidos, aguardando execução dos testes.

---

## 🆘 Suporte

Se após seguir este ROADMAP o problema persistir, verifique:

1. **Versão do Node.js:** Node 22.13.1
2. **Versão do Baileys:** @whiskeysockets/baileys
3. **Logs do Backend:** `/Users/brunovilefort/Desktop/chatia-final/chatia/backend/logs/`
4. **Configuração do Cron:** `backend/src/server.ts` linha 85-91

**Comandos úteis:**
```bash
# Ver logs em tempo real
tail -f backend/logs/*.log | grep -E "KANBAN|LANE|fromMe"

# Verificar processo do cron
ps aux | grep "ProcessExpiredLaneTimers"

# Verificar estado do banco
psql -h localhost -U chatia -d chatia -c "SELECT COUNT(*) FROM \"Tickets\" WHERE \"laneTimerStartedAt\" IS NOT NULL;"
```
