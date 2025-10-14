# TASK-03: Race Condition em Aceitação de Tickets - Resumo Executivo

## Problema Identificado

**Sintoma relatado**: "Ao aceitar um contato em uma fila dá um erro e fica sem fila ou até fica com fila mas mostra um erro"

**Root Cause**: Race condition no `UpdateTicketService` - múltiplos agentes podem aceitar simultaneamente o mesmo ticket devido à ausência de transações Sequelize com pessimistic locking.

---

## Diagrama do Problema Atual

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         CENÁRIO: Dois Agentes Aceitam Ticket 123            │
└─────────────────────────────────────────────────────────────────────────────┘

T0: Ticket 123 { status: "pending", userId: null, queueId: 5 }

T1: Agente A clica "Aceitar"              T1: Agente B clica "Aceitar"
    PUT /tickets/123                           PUT /tickets/123
    { userId: 10, status: "open" }             { userId: 20, status: "open" }
         │                                          │
         ├──────────────┬──────────────────────────┤
         ▼              ▼                          ▼
    ┌────────────────────────────────────────────────┐
    │   TicketController (Mutex in-memory)           │
    │   ⚠️ Mutex funciona apenas em SINGLE process   │
    │   Em produção (PM2/K8s) não previne race       │
    └────────────────────────────────────────────────┘
         │                                          │
         ▼                                          ▼
    ┌────────────────────────────────────────────────┐
    │         UpdateTicketService                    │
    │   ❌ SEM transação Sequelize                   │
    │   ❌ SEM pessimistic lock                      │
    └────────────────────────────────────────────────┘
         │                                          │
T2:      ▼                                          ▼
    SELECT * FROM tickets                  SELECT * FROM tickets
    WHERE id=123 AND companyId=1           WHERE id=123 AND companyId=1
         │                                          │
         ├──────────────┬──────────────────────────┤
         ▼              ▼                          ▼
    ┌────────────────────────────────────────────────┐
    │   Ambos leem:                                  │
    │   { status: "pending", userId: null }          │
    │   ✅ Nenhum detecta conflito                   │
    └────────────────────────────────────────────────┘
         │                                          │
T3:      ▼                                          ▼
    UPDATE tickets                         UPDATE tickets
    SET userId=10, status='open'           SET userId=20, status='open'
    WHERE id=123                           WHERE id=123
         │                                          │
T4:      ▼                                          ▼
    io.emit('company-1-ticket',            io.emit('company-1-ticket',
      { ticket: { userId: 10 } })            { ticket: { userId: 20 } })
         │                                          │
         ▼                                          ▼
    Frontend Agente A:                     Frontend Agente B:
    "Você aceitou o ticket!"               "Você aceitou o ticket!"
    (ticket com userId=10)                 (ticket com userId=20)

T5: Banco de dados: { userId: 20 } (último vence)
    ❌ Agente A pensa que aceitou, mas banco tem userId=20
    ❌ Dois agentes acreditam estar atendendo o mesmo cliente
    ❌ Possível duplicação de mensagens
```

---

## Arquitetura Atual (Vulnerável)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         FLUXO ATUAL (SEM TRANSAÇÃO)                         │
└─────────────────────────────────────────────────────────────────────────────┘

   Cliente                   Controller              Service              Database
      │                          │                       │                    │
      │  PUT /tickets/123        │                       │                    │
      ├─────────────────────────>│                       │                    │
      │                          │                       │                    │
      │                          │ Mutex.runExclusive()  │                    │
      │                          │ (in-memory)           │                    │
      │                          │   ⚠️ Não funciona     │                    │
      │                          │   multi-instance      │                    │
      │                          │                       │                    │
      │                          │ UpdateTicketService() │                    │
      │                          ├──────────────────────>│                    │
      │                          │                       │                    │
      │                          │                       │ SELECT * FROM...   │
      │                          │                       ├───────────────────>│
      │                          │                       │ (sem FOR UPDATE)   │
      │                          │                       │<───────────────────┤
      │                          │                       │ { userId: null }   │
      │                          │                       │                    │
      │                          │                       │ ❌ Gap aqui!       │
      │                          │                       │ Outro agente pode  │
      │                          │                       │ ler os mesmos      │
      │                          │                       │ dados              │
      │                          │                       │                    │
      │                          │                       │ UPDATE tickets...  │
      │                          │                       ├───────────────────>│
      │                          │                       │ SET userId=10      │
      │                          │                       │<───────────────────┤
      │                          │                       │ OK                 │
      │                          │                       │                    │
      │                          │                       │ ❌ Socket.IO emit  │
      │                          │                       │ ANTES do commit    │
      │                          │                       │                    │
      │                          │<──────────────────────┤                    │
      │<─────────────────────────┤ 200 OK                │                    │
      │                          │                       │                    │
```

---

## Arquitetura Proposta (Segura)

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      FLUXO PROPOSTO (COM TRANSAÇÃO + LOCK)                  │
└─────────────────────────────────────────────────────────────────────────────┘

   Cliente                   Controller              Service              Database
      │                          │                       │                    │
      │  PUT /tickets/123        │                       │                    │
      ├─────────────────────────>│                       │                    │
      │                          │                       │                    │
      │                          │ ✅ Mutex removido     │                    │
      │                          │ (confia em DB lock)   │                    │
      │                          │                       │                    │
      │                          │ UpdateTicketService() │                    │
      │                          ├──────────────────────>│                    │
      │                          │                       │                    │
      │                          │                       │ BEGIN TRANSACTION  │
      │                          │                       ├───────────────────>│
      │                          │                       │<───────────────────┤
      │                          │                       │                    │
      │                          │                       │ SELECT * FROM...   │
      │                          │                       │ FOR UPDATE         │
      │                          │                       ├───────────────────>│
      │                          │                       │ 🔒 Row locked      │
      │                          │                       │<───────────────────┤
      │                          │                       │ { userId: null }   │
      │                          │                       │                    │
      │                          │                       │ ✅ Validação:      │
      │                          │                       │ if (userId != null)│
      │                          │                       │   throw 409        │
      │                          │                       │                    │
      │                          │                       │ UPDATE tickets...  │
      │                          │                       ├───────────────────>│
      │                          │                       │ SET userId=10      │
      │                          │                       │<───────────────────┤
      │                          │                       │                    │
      │                          │                       │ COMMIT             │
      │                          │                       ├───────────────────>│
      │                          │                       │<───────────────────┤
      │                          │                       │ 🔓 Row unlocked    │
      │                          │                       │                    │
      │                          │                       │ ✅ afterCommit()   │
      │                          │                       │ Socket.IO emit     │
      │                          │                       │ (apenas se commit  │
      │                          │                       │  foi sucesso)      │
      │                          │                       │                    │
      │                          │<──────────────────────┤                    │
      │<─────────────────────────┤ 200 OK                │                    │
      │                          │                       │                    │

   ┌──────────────────────────────────────────────────────────────────────────┐
   │ Se Agente B tentar aceitar simultaneamente:                              │
   │                                                                           │
   │   1. Aguarda lock ser liberado (fica bloqueado em SELECT FOR UPDATE)     │
   │   2. Quando adquire lock, lê ticket com { userId: 10 }                   │
   │   3. Validação detecta: userId != null                                   │
   │   4. Lança AppError("ERR_TICKET_ALREADY_ACCEPTED", 409)                  │
   │   5. Frontend recebe erro claro: "Ticket já aceito por outro agente"     │
   └──────────────────────────────────────────────────────────────────────────┘
```

---

## Mudanças Necessárias

### 1. Adicionar Transação Sequelize com Pessimistic Lock

**Arquivo**: `backend/src/services/TicketServices/UpdateTicketService.ts`

**Antes (linhas 91-139)**:
```typescript
const UpdateTicketService = async ({
  ticketData,
  ticketId,
  companyId
}: Request): Promise<Response> => {
  try {
    // ... validações

    let ticket = await ShowTicketService(ticketId, companyId); // ❌ SEM LOCK
    // ... lógica de negócio
    await ticket.update({ status, queueId, userId }); // ❌ SEM TRANSAÇÃO
```

**Depois**:
```typescript
const UpdateTicketService = async ({
  ticketData,
  ticketId,
  companyId
}: Request): Promise<Response> => {
  return await sequelize.transaction(async (t) => { // ✅ TRANSAÇÃO
    try {
      // ... validações

      let ticket = await Ticket.findOne({
        where: { id: ticketId, companyId },
        lock: t.LOCK.UPDATE, // ✅ PESSIMISTIC LOCK (SELECT FOR UPDATE)
        transaction: t
      });

      if (!ticket) {
        throw new AppError("ERR_NO_TICKET_FOUND", 404);
      }

      // ✅ VALIDAÇÃO DE ESTADO
      if (status === "open" && ticket.userId !== null && ticket.userId !== userId) {
        throw new AppError("ERR_TICKET_ALREADY_ACCEPTED", 409);
      }

      // ... lógica de negócio

      await ticket.update(
        { status, queueId, userId },
        { transaction: t } // ✅ PROPAGA TRANSAÇÃO
      );

      // ✅ SOCKET.IO APÓS COMMIT
      await t.afterCommit(() => {
        io.emit('company-1-ticket', { action: 'update', ticket });
      });

      return { ticket, oldStatus, oldUserId };
    } catch (err) {
      // Transação faz rollback automático
      throw err;
    }
  });
};
```

---

### 2. Remover Mutex do Controller

**Arquivo**: `backend/src/controllers/TicketController.ts`

**Antes (linhas 343-351)**:
```typescript
const mutex = new Mutex(); // ❌ REMOVER
const { ticket } = await mutex.runExclusive(async () => {
  const result = await UpdateTicketService({
    ticketData,
    ticketId,
    companyId
  });
  return result;
});
```

**Depois**:
```typescript
const { ticket } = await UpdateTicketService({
  ticketData,
  ticketId,
  companyId
});
```

---

### 3. Validar Queue pertence à CompanyId

**Arquivo**: `backend/src/services/TicketServices/UpdateTicketService.ts:318-325`

**Antes**:
```typescript
if (!isNil(queueId)) {
  queue = await Queue.findByPk(queueId); // ❌ NÃO VALIDA COMPANYID
  if (!queue) {
    throw new AppError("ERR_UPDATE_TICKET_QUEUE_NOT_FOUND", 400);
  }
}
```

**Depois**:
```typescript
if (!isNil(queueId)) {
  queue = await Queue.findOne({ // ✅ VALIDA COMPANYID
    where: { id: queueId, companyId: ticket.companyId },
    transaction: t
  });
  if (!queue) {
    throw new AppError("ERR_UPDATE_TICKET_QUEUE_NOT_FOUND", 400);
  }
}
```

---

## Checklist de Implementação

### Fase 1: Correção Crítica (1 semana)

- [ ] **1.1** Adicionar transação Sequelize em `UpdateTicketService`
  - [ ] Importar `sequelize` e `Transaction`
  - [ ] Envolver todo código dentro de `sequelize.transaction()`
  - [ ] Adicionar `lock: t.LOCK.UPDATE` no `Ticket.findOne()`
  - [ ] Propagar `{ transaction: t }` para todos os queries Sequelize
- [ ] **1.2** Adicionar validação de estado
  - [ ] Verificar `if (ticket.userId !== null)` antes de atualizar
  - [ ] Lançar `AppError("ERR_TICKET_ALREADY_ACCEPTED", 409)`
- [ ] **1.3** Mover Socket.IO para `afterCommit`
  - [ ] Substituir `io.emit()` por `t.afterCommit(() => io.emit())`
- [ ] **1.4** Validar Queue com companyId
  - [ ] Alterar `Queue.findByPk()` para `Queue.findOne({ where: { id, companyId } })`
- [ ] **1.5** Remover Mutex do Controller
  - [ ] Remover `new Mutex()` e `mutex.runExclusive()`
  - [ ] Remover import `async-mutex`
- [ ] **1.6** Adicionar mensagem de erro
  - [ ] Adicionar `"ERR_TICKET_ALREADY_ACCEPTED"` em `backend/src/errors/messages.json`

### Fase 2: Testes (3-4 dias)

- [ ] **2.1** Criar testes unitários
  - [ ] Teste: Aceitar ticket com sucesso
  - [ ] Teste: Rejeitar ticket já aceito (409)
  - [ ] Teste: Validar queueId pertence à companyId
  - [ ] Teste: Socket.IO emite após commit
  - [ ] Teste: Rollback em caso de erro
- [ ] **2.2** Criar testes de integração
  - [ ] Teste: Dois agentes aceitam mesmo ticket (Promise.all)
  - [ ] Teste: Aceitar + transferir concorrentemente
  - [ ] Teste: Socket.IO não emite se commit falhar
- [ ] **2.3** Testes manuais
  - [ ] Simular dois agentes clicando "Aceitar" simultaneamente
  - [ ] Verificar mensagem de erro clara no frontend
  - [ ] Verificar logs no Sentry/console

### Fase 3: Deploy e Monitoramento (2-3 dias)

- [ ] **3.1** Deploy em staging
  - [ ] Rodar migration de índices (se criado)
  - [ ] Deploy do backend
  - [ ] Testes de fumaça
- [ ] **3.2** Configurar monitoramento
  - [ ] Adicionar métrica `ticket_update_conflicts_total` (Prometheus)
  - [ ] Adicionar log estruturado em `UpdateTicketService`
  - [ ] Configurar alerta se conflitos > 5%
- [ ] **3.3** Deploy em produção
  - [ ] Monitorar logs por 24h
  - [ ] Verificar taxa de erro 409
  - [ ] Coletar feedback de usuários

### Fase 4: Melhorias Futuras (backlog)

- [ ] **4.1** Refatorar em services menores
  - [ ] Criar `AcceptTicketService`
  - [ ] Criar `TransferTicketService`
  - [ ] Criar `CloseTicketService`
- [ ] **4.2** Adicionar RBAC
  - [ ] Validar se userId tem acesso à queueId
- [ ] **4.3** Adicionar enum para status
  - [ ] Criar `enum TicketStatus`
  - [ ] Adicionar validação no modelo
- [ ] **4.4** Circuit breaker para Socket.IO
- [ ] **4.5** Idempotency key

---

## Riscos e Mitigações

| Risco | Probabilidade | Impacto | Mitigação |
|-------|---------------|---------|-----------|
| Deadlock entre múltiplas transações | Baixa | Alto | Usar timeout de transação (10s), logs detalhados, retry com exponential backoff |
| Performance degradada (lock contention) | Média | Médio | Monitorar tempo de transação, adicionar índices, otimizar queries dentro da transação |
| Socket.IO não emite após commit (bug) | Baixa | Alto | Testes de integração robustos, monitoramento de eventos emitidos |
| Frontend não trata erro 409 | Média | Baixo | Adicionar tratamento de erro no frontend, exibir mensagem clara ao usuário |
| Migration de índices trava tabela | Baixa | Médio | Usar `concurrently: true` (PostgreSQL), agendar para horário de baixo tráfego |

---

## Estimativa de Esforço

| Fase | Tarefas | Esforço (horas) | Prazo |
|------|---------|-----------------|-------|
| **Fase 1**: Correção crítica | 1.1 a 1.6 | 12-16h | 3-4 dias úteis |
| **Fase 2**: Testes | 2.1 a 2.3 | 8-12h | 2-3 dias úteis |
| **Fase 3**: Deploy | 3.1 a 3.3 | 4-6h | 1-2 dias úteis |
| **TOTAL** | - | **24-34h** | **1-2 semanas** |

**Recomendação**: Alocar 1 desenvolvedor backend full-time por 1 semana para implementar e testar.

---

## Referências

- **Análise completa**: `docs/analysis/backend-analysis.md`
- **Arquivos afetados**:
  - `backend/src/services/TicketServices/UpdateTicketService.ts` (667 linhas - principal)
  - `backend/src/controllers/TicketController.ts` (linha 335-354)
  - `backend/src/services/TicketServices/ShowTicketService.ts` (criar variante com transaction)
- **Documentação Sequelize**:
  - Transactions: https://sequelize.org/docs/v5/manual/transactions
  - Locking: https://sequelize.org/docs/v5/manual/transactions#locking
- **Padrões de concorrência**:
  - Pessimistic Locking: https://en.wikipedia.org/wiki/Lock_(database)#Pessimistic_locking
  - Race Condition: https://en.wikipedia.org/wiki/Race_condition

---

**Conclusão**: Race condition identificada e solução proposta com código completo. Implementação estimada em 1-2 semanas com testes e deploy.
