# TASK-14: Corrigir FlowBuilder - Dois Blocos de Perguntas Não Funcionam

**Prioridade:** 🔴 Crítico (5)
**Tempo Estimado:** 6h
**Categoria:** Full-stack (Backend primário)
**Status:** [ ] Pendente
**Complexidade:** Média
**Risco:** Alto (core feature)

---

## 📋 Descrição do Problema

**Sintoma**: "No flowbuilder quando usamos dois blocos de perguntas o sistema não funciona"

**Impacto**:
- 100% dos usuários do FlowBuilder (funcionalidade principal)
- Casos de uso críticos quebrados:
  - ❌ Qualificação de Leads (Nome, Email, Telefone, Interesse)
  - ❌ Pesquisas NPS (Nota 1-10 + Feedback textual)
  - ❌ Formulários de Cadastro (CPF, Data, Endereço, CEP)
  - ❌ Coleta de Feedback Multi-Etapa

**Comportamento Atual vs. Esperado:**

```
Flow criado: START → Pergunta1("Nome?") → Pergunta2("Email?") → Message("Olá {nome}, email: {email}")

❌ ATUAL (COM BUG):
1. Bot: "Nome?"
2. User: "João" → Salva: { nome: "João" }
3. Bot: "Email?"
4. User: "joao@email.com" → Salva: { email: "joao@email.com" } ← PERDE 'nome'!
5. Bot: "Olá , email: joao@email.com" ← Falta o nome!

✅ ESPERADO (APÓS CORREÇÃO):
1. Bot: "Nome?"
2. User: "João" → Salva: { nome: "João" }
3. Bot: "Email?"
4. User: "joao@email.com" → Salva: { nome: "João", email: "joao@email.com" } ← Mantém ambos!
5. Bot: "Olá João, email: joao@email.com" ← Tudo OK!
```

---

## 🔍 Análise Técnica (Causa Raiz)

### 2 Bugs Críticos Identificados

#### Bug 1: Navegação Incorreta Entre Nodes

**Arquivo:** `backend/src/services/WbotServices/wbotMessageListener.ts`
**Linha:** 4669

**Código Atual (❌ ERRADO):**
```typescript
const nodeIndex = nodes.findIndex(node => node.id === nodeSelected.id);
const lastFlowId = nodes[nodeIndex + 1].id; // ❌ Assume que próximo node é nodeIndex+1
```

**Problema:** Usa índice do array para navegar. Se nodes estão desordenados no array, navega para node errado.

**Código Correto (✅):**
```typescript
const nextConnection = connections.find(conn => conn.source === nodeSelected.id);
const lastFlowId = nextConnection?.target; // ✅ Usa connections (edges) para navegar
```

#### Bug 2: Sobrescrita de Variáveis

**Arquivo:** `backend/src/services/WbotServices/wbotMessageListener.ts`
**Linhas:** 4672-4676

**Código Atual (❌ ERRADO):**
```typescript
await ticket.update({
  dataWebhook: {
    variables: {
      [answerKey]: body  // ❌ SOBRESCREVE TUDO! Perde variáveis anteriores
    }
  }
});
```

**Problema:** Cria objeto novo em vez de fazer merge com variáveis existentes.

**Código Correto (✅):**
```typescript
const oldDataWebhook = ticket.dataWebhook || {};
const oldVariables = oldDataWebhook.variables || {};

await ticket.update({
  dataWebhook: {
    ...oldDataWebhook,          // ✅ Mantém dataWebhook anterior
    variables: {
      ...oldVariables,          // ✅ Mantém variáveis anteriores
      [answerKey]: body         // ✅ Adiciona nova variável
    }
  }
});
```

---

## ✅ Solução Proposta

### Código de Correção Completo

**Arquivo:** `backend/src/services/WbotServices/wbotMessageListener.ts`
**Linhas:** 4664-4704

```typescript
// Contexto: Processar resposta de pergunta (Question node)
// Localização: Dentro de handleFlowExecution() ou similar

// ========================================================================
// ✅ CORREÇÃO BUG 1: Navegação por connections
// ========================================================================
const nextConnection = connections.find(
  conn => conn.source === nodeSelected.id
);

if (!nextConnection) {
  // Flow terminado, nenhum próximo node
  const oldDataWebhook = ticket.dataWebhook || {};
  const oldVariables = oldDataWebhook.variables || {};

  await ticket.update({
    status: "closed",
    dataWebhook: {
      ...oldDataWebhook,
      flowCompleted: true,
      variables: {
        ...oldVariables,
        [answerKey]: body // Última resposta
      }
    }
  });

  console.log(`[FLOW] Flow completed for ticket ${ticket.id}`);
  return;
}

const lastFlowId = nextConnection.target; // ✅ Node correto

// ========================================================================
// ✅ CORREÇÃO BUG 2: Merge de variáveis
// ========================================================================
const oldDataWebhook = ticket.dataWebhook || {};
const oldVariables = oldDataWebhook.variables || {};

await ticket.update({
  dataWebhook: {
    ...oldDataWebhook,                    // ✅ Preserva dados anteriores
    lastFlowId,
    flowWebhook: nodeSelected.data?.id,
    variables: {
      ...oldVariables,                     // ✅ Preserva variáveis anteriores
      [answerKey]: body                    // ✅ Adiciona nova variável
    }
  }
});

console.log(`[FLOW] Variables saved:`, {
  ...oldVariables,
  [answerKey]: body
}); // ✅ Log para debug

// Continuar para próximo node (enviar próxima pergunta ou message)
const nextNode = nodes.find(n => n.id === lastFlowId);
if (nextNode && nextNode.type === 'question') {
  // Enviar próxima pergunta
  await sendMessage(ticket.contact, nextNode.data.question);
}
```

---

## 📂 Arquivos a Modificar

| Arquivo | Ação | Linha(s) | Prioridade |
|---------|------|----------|------------|
| `backend/src/services/WbotServices/wbotMessageListener.ts` | Corrigir navegação + merge de variáveis | 4664-4704 | ⚠️ CRÍTICO |
| `frontend/src/pages/FlowBuilderConfig/index.js` | Validar answerKey duplicado (opcional) | - | 🔹 Melhoria |

---

## 🧪 Casos de Teste

### Teste 1: 2 Perguntas Sequenciais
**Entrada:** Flow: Pergunta1 → Pergunta2 → Message
**Respostas:** "João", "joao@email.com"
**Esperado:**
- `ticket.dataWebhook.variables = { nome: "João", email: "joao@email.com" }`
- Message interpolada: "Olá João, email: joao@email.com"

### Teste 2: 3 Perguntas Sequenciais
**Entrada:** Flow: Pergunta1 → Pergunta2 → Pergunta3 → Message
**Respostas:** "João", "joao@email.com", "11999999999"
**Esperado:**
- `variables = { nome: "João", email: "joao@email.com", telefone: "11999999999" }`

### Teste 3: Perguntas Intercaladas com Messages
**Entrada:** Flow: Pergunta1 → Message("Aguarde") → Pergunta2 → Message
**Esperado:** Ambas respostas salvas

### Teste 4: Flow Sem Próximo Node
**Entrada:** Flow termina em Pergunta (sem edges saindo)
**Esperado:**
- Ticket fechado (status="closed")
- `dataWebhook.flowCompleted = true`

### Teste 5: Nodes Desordenados no Array
**Entrada:** `nodes = [node3, node1, node2]` (fora de ordem)
**Esperado:** Navegação correta via connections (não afetada pela ordem do array)

---

## ✓ Critérios de Aceitação

- [ ] **AC1:** Flow com 2 perguntas captura ambas respostas
- [ ] **AC2:** Variables preservadas: `{ nome: "João", email: "joao@email.com" }`
- [ ] **AC3:** Message interpola corretamente: "Olá João, email: joao@email.com"
- [ ] **AC4:** Flow com 3+ perguntas funciona
- [ ] **AC5:** Perguntas intercaladas com messages funcionam
- [ ] **AC6:** Navegação via connections (não afetada por ordem do array)
- [ ] **AC7:** Flow sem próximo node fecha ticket gracefully
- [ ] **AC8:** Logs mostram variables sendo salvas incrementalmente

---

## 📊 Estimativa Detalhada

| Atividade | Tempo | Detalhes |
|-----------|-------|----------|
| Implementar correção Bug 1 (navegação) | 1h | Substituir índice por connections |
| Implementar correção Bug 2 (merge) | 1h | Spread operator + validações |
| Adicionar validação flow terminado | 30min | if (!nextConnection) |
| Adicionar logs de debug | 30min | console.log estruturado |
| Testes com 2 perguntas | 1h | Manual + validar banco |
| Testes com 3+ perguntas | 1h | Casos complexos |
| Testes com perguntas intercaladas | 30min | Messages entre perguntas |
| Code review | 30min | 1 revisor |
| **TOTAL** | **6h** | **~1 dia útil** |

---

## 📚 Referências

- **Análise Completa:** `docs/analysis/TASK-14-flowbuilder-sequential-questions-analysis.md` (68.5KB)
- **Relatório Consolidado:** `docs/analysis/CRITICAL-TASKS-EXECUTIVE-REPORT.md`

---

**Prompt Gerado por:** Claude Code
**Data:** 2025-10-12
