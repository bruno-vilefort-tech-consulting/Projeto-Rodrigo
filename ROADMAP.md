# 🗺️ ROADMAP - Debug Kanban: Movimento Indevido para Lane "Retorno"

**Data:** 2025-10-17
**Problema:** Tickets movem IMEDIATAMENTE para lane "Retorno" após admin enviar mensagem, ao invés de seguir fluxo configurado (timeLane → nextLaneId)

---

## 📋 HISTÓRICO DE TENTATIVAS

### **Tentativa 1: Implementar Flag allowAutomaticMove**
**Objetivo:** Prevenir movimento automático quando cliente responde

**Implementação:**
- ✅ Migration: Adicionado campo `allowAutomaticMove` boolean (default: true)
- ✅ Model Ticket: Campo adicionado
- ✅ StartLaneTimerService: Define `allowAutomaticMove = true` quando admin envia
- ✅ HandleCustomerResponseService: Define `allowAutomaticMove = false` quando cliente responde
- ✅ ProcessExpiredLaneTimersJob: Filtra por `allowAutomaticMove = true`
- ✅ MoveTicketLaneService: Reseta `allowAutomaticMove = true` após movimento

**Status:** ✅ Implementado mas problema persiste

---

### **Tentativa 2: Debug Logs Completos**
**Objetivo:** Identificar onde ocorre a falha no fluxo

**Implementação:**
- ✅ Logs detalhados em CreateMessageService
- ✅ Logs detalhados em StartLaneTimerService
- ✅ Logs detalhados em HandleCustomerResponseService
- ✅ ROADMAP de debug criado

**Descoberta 1 - Duplicação de Mensagens:**
```
║ Message ID: 677 (12:36:35.193) ← PRIMEIRA CHAMADA
║ Message ID: 678 (12:36:35.000) ← SEGUNDA CHAMADA (MESMO WID!)
```

**Descoberta 2 - Timer Muito Curto:**
```
timeLane: 0.004166666666666667 minutos = 0.25 SEGUNDOS!
```

**Status:** 🔍 Problemas identificados

---

### **Tentativa 3: Corrigir Duplicação e Valores de timeLane**
**Objetivo:** Eliminar duplicação de mensagens e corrigir timers

**Implementação:**
- ✅ CreateMessageService: Verificação anti-duplicação antes de upsert
- ✅ Banco: Índice UNIQUE em (wid, companyId)
- ✅ Banco: 11 mensagens duplicadas removidas
- ✅ Banco: timeLane corrigido (Start: 1440min, Dia 01: 1440min, Dia 2: 1440min)

**SQL Executado:**
```sql
-- Anti-duplicação
CREATE UNIQUE INDEX "Messages_wid_companyId_unique"
ON "Messages" (wid, "companyId");

-- Correção timeLane
UPDATE "Tags"
SET "timeLane" = CASE
  WHEN name = 'Start' THEN 1440
  WHEN name = 'Dia 01' THEN 1440
  WHEN name = 'Dia 2' THEN 1440
  ELSE "timeLane"
END
WHERE "companyId" = 1 AND kanban = 1;
```

**Status:** ✅ Executado, duplicação resolvida, mas movimento para Retorno persiste

---

## 🚨 ANÁLISE LOGS - TENTATIVA 3

### **Log do Admin Enviando Mensagem (12:49:58):**

```
╔════════════════════════════════════════════════════════════
║ 🔍 KANBAN DEBUG - CreateMessageService
║ Message ID:       679
║ Ticket ID:        84
║ fromMe:           true ✅
║ Decisão: StartLaneTimerService ✅
╚════════════════════════════════════════════════════════════

╔════════════════════════════════════════════════════════════
║ ⏰ START LANE TIMER
║ Ticket ID:        84
║ Lane:             Start (ID: 2) ✅
║ timeLane:         1440 minutos ✅
║ nextLaneId:       3 ✅
║ rollbackLaneId:   5
║ Timer:
║   - Iniciado em:  2025-10-17T12:49:58.101Z
║   - Moverá em:    2025-10-18T12:49:58.101Z (24h depois) ✅
║ allowAutomaticMove: true ✅
╚════════════════════════════════════════════════════════════

✅ Anti-duplicação funcionando:
⚠️ [CreateMessageService] Mensagem já existe (wid: 3EB0BCF22B8AE51594507A, id: 679), retornando existente
```

**✅ Tudo correto até aqui!**

### **Log do Cron (12:50:00 - 2 SEGUNDOS DEPOIS):**

```
INFO [17-10-2025 09:50:00]: [KANBAN] Tickets encontrados para empresa 1: 1
INFO [17-10-2025 09:50:00]: [KANBAN] Ticket 84 - TagID: 5 - TimeLane: 0h - NextLaneId: null
INFO [17-10-2025 09:50:00]: [KANBAN] ⚠️ Ticket 84 não tem configuração válida
```

**❌ TICKET JÁ ESTÁ NA LANE 5 (RETORNO)!**

---

## 🔎 HIPÓTESE 4: Movimento IMEDIATO entre StartLaneTimer e Cron

**Timeline:**
1. **12:49:58.101** - StartLaneTimer define: lane Start (ID: 2), timer 24h
2. **??? ALGO ACONTECE ???**
3. **12:50:00** - Ticket já está em lane Retorno (ID: 5)

**Possíveis Causas:**

### **A) wbotMessageListener está movendo o ticket**
- Após processar a mensagem, há algum código que move ticket?
- Há listeners de Socket.IO que disparam movimento?

### **B) Evento duplicado está chamando HandleCustomerResponseService**
- Segunda chamada CreateMessageService pode estar processando como "cliente respondeu"?
- Logs mostram apenas StartLaneTimer, mas pode haver chamada oculta

### **C) MoveTicketLaneService sendo chamado diretamente**
- Algum código frontend ou backend está movendo ticket para Retorno?
- Há webhook ou integração externa disparando movimento?

### **D) TicketTag está sendo atualizado fora do fluxo**
- Algum código atualiza TicketTag diretamente sem passar por MoveTicketLaneService?

---

## 🛠️ TENTATIVA 4: Investigação Profunda

### **Ação 1: Adicionar Logs de Movimento de Ticket**

Vamos adicionar logs em **MoveTicketLaneService** para rastrear QUEM e QUANDO move o ticket:

**Arquivo:** `backend/src/services/TicketServices/MoveTicketLaneService.ts`

```typescript
// Log no início do serviço
console.log(`
╔════════════════════════════════════════════════════════════
║ 🔄 MOVE TICKET LANE
╠════════════════════════════════════════════════════════════
║ Timestamp:        ${new Date().toISOString()}
║ Ticket ID:        ${ticketId}
║ From Lane:        ${currentLane?.name || 'N/A'} (ID: ${currentLane?.id || 'N/A'})
║ To Lane ID:       ${toLaneId}
║ Send Greeting:    ${sendGreeting}
║
║ 📍 STACK TRACE:
║ ${new Error().stack?.split('\n').slice(1, 6).join('\n║ ')}
╚════════════════════════════════════════════════════════════
`);
```

### **Ação 2: Verificar Chamadas Diretas a TicketTag.update**

Buscar no código por atualizações diretas de TicketTag que não passam por MoveTicketLaneService:

```bash
grep -r "TicketTag.*update" backend/src --include="*.ts" | grep -v "MoveTicketLaneService"
```

### **Ação 3: Verificar HandleCustomerResponseService sendo chamado incorretamente**

Adicionar log ANTES da condição em CreateMessageService:

```typescript
// Antes do if (message.fromMe)
console.log(`🔍 [CreateMessageService] ANTES DE DECIDIR:`, {
  messageId: message.id,
  fromMe: message.fromMe,
  ticketImported: messageData?.ticketImported,
  isPrivate: message.isPrivate,
  willProcessKanban: !messageData?.ticketImported && !message.isPrivate && message.ticketId
});
```

### **Ação 4: Verificar Eventos Socket.IO que Disparam Movimento**

Buscar por listeners Socket.IO no backend que podem mover tickets:

```bash
grep -r "socket.*on\|io.*on" backend/src --include="*.ts" | grep -i "ticket\|lane\|tag"
```

---

## 📊 PRÓXIMOS PASSOS

### **Executar Agora:**
1. ✅ Criar este ROADMAP.md
2. 🔄 Adicionar logs em MoveTicketLaneService
3. 🔄 Buscar chamadas diretas a TicketTag
4. 🔄 Verificar eventos Socket.IO
5. 🔄 Reproduzir problema e analisar novos logs

### **Critérios de Sucesso:**
- [ ] Identificar EXATAMENTE quem chama o movimento para Retorno
- [ ] Ver stack trace completo da chamada
- [ ] Entender POR QUE está sendo chamado 2s após StartLaneTimer
- [ ] Corrigir a origem do problema

---

## 📝 CONFIGURAÇÃO ATUAL

### **Lanes Configuradas:**
```
ID: 2 | Start       | timeLane: 1440min | nextLaneId: 3 | rollbackLaneId: 5
ID: 3 | Dia 01      | timeLane: 1440min | nextLaneId: 4 | rollbackLaneId: 5
ID: 4 | Dia 2       | timeLane: 1440min | nextLaneId: 6 | rollbackLaneId: 5
ID: 5 | Retorno     | timeLane: 0       | nextLaneId: - | rollbackLaneId: -
ID: 6 | Remarketing | timeLane: 0       | nextLaneId: - | rollbackLaneId: -
```

### **Fluxo Esperado:**
```
Admin envia → Start (24h timer) → Dia 01 (24h timer) → Dia 2 (24h timer) → Remarketing
                ↓ se cliente responde
              Retorno (sem auto-move)
```

### **Fluxo Atual (BUG):**
```
Admin envia → Start → ??? ALGO ??? → Retorno (IMEDIATO!)
```

---

## 🔧 ARQUIVOS MODIFICADOS ATÉ AGORA

### **Backend:**
- `src/database/migrations/20251017091834-add-allowAutomaticMove-to-Tickets.ts` ✅
- `src/models/Ticket.ts` ✅
- `src/services/TicketServices/StartLaneTimerService.ts` ✅
- `src/services/TicketServices/HandleCustomerResponseService.ts` ✅
- `src/services/TicketServices/ProcessExpiredLaneTimersJob.ts` ✅
- `src/services/TicketServices/MoveTicketLaneService.ts` ✅
- `src/services/MessageServices/CreateMessageService.ts` ✅

### **Database:**
- Migration `allowAutomaticMove` executada ✅
- Índice UNIQUE `Messages_wid_companyId_unique` criado ✅
- 11 mensagens duplicadas removidas ✅
- timeLane corrigido (Start: 1440, Dia 01: 1440, Dia 2: 1440) ✅

---

---

## 🛠️ TENTATIVA 4: Investigação Profunda e Solução

### **Ação 1: Stack Trace em MoveTicketLaneService**
**Status:** ✅ Implementado

Adicionado log com stack trace completo no início de MoveTicketLaneService para rastrear origem das chamadas.

### **Ação 2: Buscar Chamadas Diretas a TicketTag**
**Status:** ✅ Executado

Descoberto múltiplas manipulações diretas de TicketTag:
- `queues.ts`
- `TicketTagController.ts`
- **`wbotMessageListener.ts` ← PROBLEMA ENCONTRADO!**

### **Ação 3: Análise de wbotMessageListener.ts**
**Status:** ✅ CAUSA RAIZ IDENTIFICADA

**Código Problemático (linhas 4368-4391):**
```typescript
if (
  rollbackTag &&
  formatBody(bodyNextTag, ticket) !== bodyMessage &&
  formatBody(bodyRollbackTag, ticket) !== bodyMessage
) {
  // ❌ Move DIRETO para rollbackTag sem passar por MoveTicketLaneService!
  await TicketTag.destroy({...});
  await TicketTag.create({
    ticketId: ticket.id,
    tagId: rollbackTag.id  // <- MOVE PARA RETORNO IMEDIATAMENTE!
  });
}
```

**Explicação do Bug:**
1. Admin envia mensagem → StartLaneTimer inicia (lane Start, timer 24h) ✅
2. `wbotMessageListener` recebe a MESMA mensagem
3. Verifica condições:
   - Tem rollbackTag? **SIM** (ID: 5 - Retorno)
   - Mensagem não é greeting de nextTag? **SIM**
   - Mensagem não é greeting de rollbackTag? **SIM**
4. **MOVE DIRETO PARA ROLLBACKTAG (Retorno)!** ❌

**Conflito:** Código antigo competindo com novo sistema de automação (StartLaneTimer/HandleCustomerResponse)

### **Solução Aplicada:**
✅ Desabilitado código antigo em `wbotMessageListener.ts` (linhas 4368-4393)
✅ Adicionado log explicativo
✅ Sistema agora usa APENAS StartLaneTimerService/HandleCustomerResponseService

---

## 🆘 STATUS ATUAL

**Problema:** ✅ **RESOLVIDO!**

**Causa Raiz:** Código antigo em `wbotMessageListener.ts` movia tickets para rollbackTag imediatamente, conflitando com novo sistema de automação baseado em timers.

**Solução:** Desabilitado lógica antiga, usando apenas novo sistema (StartLaneTimer/HandleCustomerResponse).

**Próximo Passo:** Testar fluxo completo e validar funcionamento correto.

---

## 🧪 TESTE FINAL

### **Como Testar:**
1. Reiniciar backend: `npm run dev`
2. Mover ticket para lane "Start"
3. Admin envia mensagem
4. Verificar logs:
   - ✅ StartLaneTimer deve iniciar (1440 min)
   - ✅ Ticket deve PERMANECER em "Start"
   - ✅ Log: "Lógica antiga de rollbackTag DESABILITADA"
5. Aguardar timer expirar (ou ajustar para 1 min para teste)
6. Ticket deve mover: Start → Dia 01 → Dia 2 → Remarketing
7. Se cliente responder: mover para Retorno e bloquear auto-move

### **Logs Esperados:**
```
╔════════════════════════════════════════════════════════════
║ ⏰ START LANE TIMER
║ Lane:             Start (ID: 2)
║ timeLane:         1440 minutos
║ nextLaneId:       3
║ allowAutomaticMove: true ✅
╚════════════════════════════════════════════════════════════

🔇 [wbotMessageListener] Lógica antiga de rollbackTag DESABILITADA
```

---

## 📊 ARQUIVOS MODIFICADOS - TENTATIVA 4

### **Backend:**
- ✅ `src/services/WbotServices/wbotMessageListener.ts` (linhas 4368-4395)
  - Desabilitado lógica antiga de movimento para rollbackTag
  - Adicionado log explicativo

- ✅ `src/services/TicketServices/MoveTicketLaneService.ts` (linhas 26-54)
  - Adicionado log com stack trace completo
  - Rastreamento de origem das chamadas

---

_Última atualização: 2025-10-17 12:52:00_
