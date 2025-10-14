# TASK-03: Corrigir Erro ao Aceitar Contato em Fila (Race Conditions)

**Prioridade:** 🔴 Crítico (5)
**Tempo Estimado:** 16-18h (1-2 semanas)
**Categoria:** Backend
**Status:** [ ] Pendente
**Complexidade:** Alta
**Risco:** Alto (afeta operação crítica)

---

## 📋 Descrição do Problema

**Sintoma**: "Ao aceitar um contato em uma fila dá um erro e fica sem fila ou até fica com fila mas mostra um erro"

**Impacto**:
- 🔴 **CRÍTICO**: 100% dos atendentes afetados
- Tickets ficam órfãos (sem fila ou sem atendente)
- Atendimento completamente interrompido
- Perda de tickets e atendimentos
- Experiência ruim para cliente final

**Cenário Real**:
1. Agente A clica "Aceitar ticket 123"
2. Agente B clica "Aceitar ticket 123" (quase simultaneamente)
3. Ambos veem o ticket como disponível
4. Ambos executam atribuição
5. ❌ Último vence (Agente B), mas Agente A pensa que aceitou
6. ❌ Ticket fica em estado inconsistente
7. ❌ Possível duplicação de mensagens

---

## 🔍 Análise Técnica (Causa Raiz)

### 4 Vulnerabilidades Críticas Identificadas

#### 1. **Ausência de Pessimistic Lock**
**Arquivo:** `backend/src/services/TicketServices/UpdateTicketService.ts:139`
**Problema:** `ShowTicketService` faz SELECT simples sem `lock: t.LOCK.UPDATE`

```typescript
// ❌ VULNERÁVEL
let ticket = await ShowTicketService(ticketId, companyId); // SELECT sem FOR UPDATE
```

**Consequência:** Múltiplos agentes leem `userId=null` simultaneamente

#### 2. **Mutex Ineficaz (Falsa Segurança)**
**Arquivo:** `backend/src/controllers/TicketController.ts:343-351`
**Problema:** Usa `async-mutex` que é **in-memory** (não funciona em cluster PM2/Kubernetes)

```typescript
// ❌ FALSA SEGURANÇA
const mutex = new Mutex(); // Só funciona em single process!
const { ticket } = await mutex.runExclusive(async () => {
  return await UpdateTicketService({ ... });
});
```

**Consequência:** Em produção com múltiplas instâncias, não previne race condition

#### 3. **Socket.IO Emite ANTES do Commit**
**Arquivo:** `backend/src/services/TicketServices/UpdateTicketService.ts:738-741`
**Problema:** `io.emit()` chamado ANTES da transação commitar

```typescript
// ❌ EMITE ANTES DO COMMIT
await ticket.update({ status, userId, queueId });
io.emit('company-1-ticket', { action: 'update', ticket }); // Antes do commit!
```

**Consequência:** Frontend atualiza UI com dados inconsistentes se commit falhar

#### 4. **Validação de Queue sem companyId**
**Arquivo:** `backend/src/services/TicketServices/UpdateTicketService.ts:319`
**Problema:** Não valida se `queue.companyId === ticket.companyId`

```typescript
// ❌ SEM VALIDAÇÃO MULTI-TENANT
const queue = await Queue.findByPk(queueId); // Não filtra por companyId
```

**Risco:** Agente pode atribuir ticket para fila de outra empresa

---

## ✅ Solução Proposta

### Código de Correção Completo

**Arquivo:** `backend/src/services/TicketServices/UpdateTicketService.ts`

```typescript
import { Transaction } from "sequelize";
import { sequelize } from "../../models";

const UpdateTicketService = async ({
  ticketData,
  ticketId,
  companyId
}: Request): Promise<Response> => {

  // ✅ TRANSAÇÃO COM ISOLATION LEVEL
  return await sequelize.transaction(
    { isolationLevel: Transaction.ISOLATION_LEVELS.READ_COMMITTED },
    async (t) => {
      try {
        const { status, userId, queueId, /* ... */ } = ticketData;

        // ========================================================================
        // ✅ MUDANÇA 1: PESSIMISTIC LOCK (SELECT FOR UPDATE)
        // ========================================================================
        let ticket = await Ticket.findOne({
          where: { id: ticketId, companyId },
          lock: t.LOCK.UPDATE, // 🔒 Trava linha até commit
          transaction: t,
          include: [
            Contact, User, Queue, Whatsapp, Company, Tag,
            QueueIntegrations, TicketTag
          ]
        });

        if (!ticket) {
          throw new AppError("ERR_NO_TICKET_FOUND", 404);
        }

        // ========================================================================
        // ✅ MUDANÇA 2: VALIDAÇÃO DE ESTADO (previne double-accept)
        // ========================================================================
        if (status === "open" && ticket.userId !== null && ticket.userId !== userId) {
          throw new AppError("ERR_TICKET_ALREADY_ACCEPTED", 409);
        }

        const oldStatus = ticket.status;
        const oldUserId = ticket.userId;

        // ========================================================================
        // ✅ MUDANÇA 3: VALIDAÇÃO DE QUEUE COM COMPANYID
        // ========================================================================
        let queue: Queue | null = null;
        if (!isNil(queueId)) {
          queue = await Queue.findOne({
            where: {
              id: queueId,
              companyId: ticket.companyId // ✅ Valida multi-tenant
            },
            transaction: t
          });

          if (!queue) {
            throw new AppError("ERR_UPDATE_TICKET_QUEUE_NOT_FOUND", 400);
          }
        }

        // ... TODA A LÓGICA DE NEGÓCIO ...
        // (fechamento, transferência, integrations, etc.)
        // IMPORTANTE: Todos os queries devem receber { transaction: t }

        // ========================================================================
        // ✅ MUDANÇA 4: UPDATE COM TRANSAÇÃO
        // ========================================================================
        await ticket.update(
          { status, queueId, userId, /* ... */ },
          { transaction: t }
        );

        await ticket.reload({ transaction: t });

        // ========================================================================
        // ✅ MUDANÇA 5: SOCKET.IO APÓS COMMIT (somente se sucesso)
        // ========================================================================
        await t.afterCommit(() => {
          const io = getIO();

          // Remover ticket da lista se mudou status/user
          if (ticket.status !== oldStatus || ticket.userId !== oldUserId) {
            io.of(String(companyId)).emit(`company-${companyId}-ticket`, {
              action: "delete",
              ticketId: ticket.id
            });
          }

          // Emitir update
          io.of(String(companyId)).emit(`company-${companyId}-ticket`, {
            action: "update",
            ticket
          });
        });

        return { ticket, oldStatus, oldUserId };

      } catch (err: any) {
        // ✅ Transação faz rollback automático
        console.log("erro ao atualizar o ticket", ticketId, "err:", err?.message);
        Sentry.captureException(err);

        if (err instanceof AppError) {
          throw err; // Preserva erros específicos
        }

        throw new AppError("ERR_UPDATE_TICKET", 500);
      }
    }
  );
};

export default UpdateTicketService;
```

### Remover Mutex do Controller

**Arquivo:** `backend/src/controllers/TicketController.ts`

```typescript
// ❌ REMOVER LINHAS 343-351
// import { Mutex } from "async-mutex"; // DELETAR
// const mutex = new Mutex(); // DELETAR

// ❌ REMOVER:
// const { ticket } = await mutex.runExclusive(async () => {
//   return await UpdateTicketService({ ... });
// });

// ✅ SUBSTITUIR POR:
const { ticket } = await UpdateTicketService({
  ticketData,
  ticketId,
  companyId
});
```

### Adicionar Mensagem de Erro

**Arquivo:** `backend/src/errors/messages.json`

```json
{
  "ERR_TICKET_ALREADY_ACCEPTED": "Este ticket já foi aceito por outro agente"
}
```

---

## 📂 Arquivos a Modificar

| Arquivo | Ação | Linhas | Prioridade |
|---------|------|--------|------------|
| `backend/src/services/TicketServices/UpdateTicketService.ts` | Adicionar transação + lock + validações | 91-750 | ⚠️ CRÍTICO |
| `backend/src/controllers/TicketController.ts` | Remover Mutex | 343-351 | ⚠️ CRÍTICO |
| `backend/src/errors/messages.json` | Adicionar ERR_TICKET_ALREADY_ACCEPTED | - | ⚠️ CRÍTICO |
| `package.json` (backend) | Remover dependência `async-mutex` | - | 🔹 Opcional |

---

## 🧪 Casos de Teste

### Teste 1: Aceitar Ticket com Sucesso
**Entrada:** Agente aceita ticket pending
**Esperado:** Ticket atribuído, status="open", Socket.IO emite
**Validação:** Verificar banco + logs

### Teste 2: Double-Accept (Race Condition)
**Entrada:** Agentes A e B clicam "Aceitar" simultaneamente
```javascript
Promise.all([
  acceptTicket(ticketId, agentA),
  acceptTicket(ticketId, agentB)
]);
```
**Esperado:**
- Agente A: 200 OK, ticket atribuído
- Agente B: 409 Conflict, "ERR_TICKET_ALREADY_ACCEPTED"
**Validação:** `ticket.userId === agentA.id`, agentB recebe erro

### Teste 3: Queue de Outra Empresa
**Entrada:** Atribuir ticket para queueId de outra empresa
**Esperado:** 400 Bad Request, "ERR_UPDATE_TICKET_QUEUE_NOT_FOUND"
**Validação:** Multi-tenant isolado

### Teste 4: Socket.IO Após Commit
**Entrada:** Forçar erro após `ticket.update()`
**Esperado:** Socket.IO NÃO emite, rollback executado
**Validação:** Listener não recebe evento

### Teste 5: Rollback em Caso de Erro
**Entrada:** Ticket não existe (404)
**Esperado:** Nenhuma mudança no banco, transação revertida
**Validação:** Query logs mostram ROLLBACK

---

## ✓ Critérios de Aceitação

- [ ] **AC1:** Agente aceita ticket sem erros (status="open", userId atribuído)
- [ ] **AC2:** Dois agentes não conseguem aceitar mesmo ticket (409 para o segundo)
- [ ] **AC3:** Socket.IO só emite após commit bem-sucedido
- [ ] **AC4:** Validação de Queue com companyId previne atribuição cross-tenant
- [ ] **AC5:** Rollback automático em caso de erro (nenhuma mudança no banco)
- [ ] **AC6:** Logs estruturados registram tentativas de aceitar (winston/pino)
- [ ] **AC7:** Mutex removido do controller (import deletado)
- [ ] **AC8:** Mensagem "ERR_TICKET_ALREADY_ACCEPTED" aparece no frontend
- [ ] **AC9:** Performance aceitável (transação < 500ms em 95% dos casos)
- [ ] **AC10:** Nenhum deadlock detectado em 1000 requisições concorrentes

---

## 📊 Estimativa Detalhada

| Fase | Atividade | Tempo | Detalhes |
|------|-----------|-------|----------|
| **Fase 1** | Adicionar transação + lock | 4h | Modificar UpdateTicketService |
| **Fase 1** | Validações (companyId, estado) | 2h | Adicionar checks de segurança |
| **Fase 1** | Mover Socket.IO para afterCommit | 1h | Refatorar emissão de eventos |
| **Fase 1** | Remover Mutex do controller | 30min | Deletar linhas + import |
| **Fase 1** | Adicionar mensagem de erro | 30min | Atualizar messages.json + frontend |
| **Fase 2** | Testes unitários (5 cenários) | 4h | Jest + Factories |
| **Fase 2** | Testes integração (race condition) | 4h | Promise.all + Socket.IO |
| **Fase 2** | Testes manuais (E2E) | 2h | Simular 2 agentes clicando |
| **Fase 3** | Code review | 2h | 2 revisores seniores |
| **Fase 3** | Deploy staging + testes | 1h | Validação em ambiente real |
| **Fase 3** | Deploy produção + monitoramento | 1h | Logs + métricas |
| **TOTAL** | | **22h** | **~3 dias úteis (full-time)** |

**Estimativa com margem de segurança:** **16-18 horas** (2-3 dias)

---

## 🚨 Riscos e Mitigações

| Risco | Impacto | Probabilidade | Mitigação |
|-------|---------|---------------|-----------|
| **Deadlock** entre transações concorrentes | Alto | Baixa | Timeout 10s, logs detalhados, retry exponencial |
| **Performance** degradada (lock contention) | Médio | Média | Índices otimizados, monitorar tempo de transação |
| **Frontend** não trata erro 409 | Baixo | Média | Adicionar tratamento em `handleAcceptTicket()` |
| **Logs** com dados sensíveis | Médio | Baixa | Não logar senhas, usar redaction do winston |

---

## 📚 Referências

- **Análise Completa:** `docs/analysis/backend-analysis.md` (1,500+ linhas)
- **Resumo Executivo:** `docs/analysis/TASK-03-race-condition-summary.md`
- **Relatório Consolidado:** `docs/analysis/CRITICAL-TASKS-EXECUTIVE-REPORT.md`
- **Sequelize Transactions:** https://sequelize.org/docs/v6/other-topics/transactions/
- **Pessimistic Locking:** https://sequelize.org/docs/v6/other-topics/transactions/#locks
- **Race Condition Pattern:** https://en.wikipedia.org/wiki/Race_condition

---

## 🎯 Resumo Executivo

| Aspecto | Detalhes |
|---------|----------|
| **Problema** | 4 race conditions permitem double-accept de tickets |
| **Causa Raiz** | Sem transação Sequelize + sem lock pessimístico + mutex ineficaz |
| **Solução** | Transação com `LOCK.UPDATE` + validações + Socket.IO após commit |
| **Arquivos** | 1 service (UpdateTicketService) + 1 controller (TicketController) |
| **Risco** | Alto (afeta core business) |
| **Impacto** | 100% dos atendentes (operação crítica) |
| **Tempo** | 16-18h (2-3 dias full-time) |
| **Prioridade** | 🔴 Crítica (5) - Deploy urgente |

---

**Prompt Gerado por:** Claude Code - Análise Ultradetalhada
**Data:** 2025-10-12
**Baseado em:** backend-analyst + TASK-03-race-condition-summary.md
