# TASK-12: Corrigir Erro no Kanban ao Automatizar Retorno de Coluna

**Prioridade:** 🟠 Alta (4)
**Tempo Estimado:** 4h
**Categoria:** Backend
**Status:** [ ] Pendente

---

## 📋 Problema

"No kanban ao automatizar e pedir para voltar para uma coluna, dá erro"

**Cenário:**
1. Criar automação: "Se X acontecer, mover para coluna Y"
2. Ticket está na coluna Z
3. Automação tenta mover de volta para coluna Y
4. ❌ Erro ocorre

---

## 🔍 Hipóteses

1. **Validação cíclica**: Sistema impede mover para coluna "anterior"
2. **Foreign key**: coluna Y não existe mais
3. **Estado inválido**: Ticket não pode voltar para status "pending"
4. **Race condition**: Múltiplas automações executando

---

## ✅ Solução

**Arquivo:** `backend/src/services/KanbanService/MoveTicketService.ts` (ou similar)

```typescript
const MoveTicketToColumn = async ({
  ticketId,
  columnId,
  companyId
}: Request) => {
  return await sequelize.transaction(async (t) => {
    // 1. Validar coluna existe e pertence à empresa
    const column = await KanbanColumn.findOne({
      where: { id: columnId, companyId },
      transaction: t
    });

    if (!column) {
      throw new AppError("ERR_COLUMN_NOT_FOUND", 404);
    }

    // 2. Buscar ticket com lock
    const ticket = await Ticket.findOne({
      where: { id: ticketId, companyId },
      lock: t.LOCK.UPDATE,
      transaction: t
    });

    if (!ticket) {
      throw new AppError("ERR_TICKET_NOT_FOUND", 404);
    }

    // 3. Atualizar coluna (permitir voltar)
    ticket.kanbanColumnId = columnId;
    await ticket.save({ transaction: t });

    // 4. Socket.IO após commit
    await t.afterCommit(() => {
      io.emit(`kanban-${companyId}`, {
        action: 'update',
        ticket
      });
    });

    return ticket;
  });
};
```

---

## 📂 Arquivos a Investigar

| Arquivo | Verificar |
|---------|-----------|
| `backend/src/services/KanbanService/` | Lógica de movimentação |
| `backend/src/models/Ticket.ts` | Validações de coluna |
| `backend/src/services/AutomationService/` | Execução de automações |

---

## ✓ Critérios de Aceitação

- [ ] Automação pode mover ticket para coluna anterior sem erro
- [ ] Validação de companyId em coluna
- [ ] Transação garante atomicidade
- [ ] Socket.IO notifica mudança

---

**Tempo:** 4h (investigação + correção + testes)
