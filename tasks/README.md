# 🐛 ChatIA Flow v2.2.2v-26 - Tasks de Correção

**Status Geral:** 📋 0/14 Concluídas | ⏱️ 40h30min Total Estimado

---

## 📊 Visão Geral por Prioridade

| Prioridade | Quantidade | Tempo Total | Status |
|------------|-----------|-------------|--------|
| 🔴 **Crítica** | 4 | 14h | 0/4 ⬜️⬜️⬜️⬜️ |
| 🚨 **Emergência (Segurança)** | 1 | 16h | 0/1 ⬜️ |
| 🟠 **Alta** | 3 | 5h | 0/3 ⬜️⬜️⬜️ |
| 🟡 **Média** | 3 | 7h | 0/3 ⬜️⬜️⬜️ |
| 🟢 **Baixa** | 3 | 3h30min | 0/3 ⬜️⬜️⬜️ |

---

## 🔴 TASKS CRÍTICAS (Bloqueia produção)

### ✅ [TASK-01](./TASK-01-seletor-idioma-arabe.md) - Seletor de Idioma sem Árabe
- **Tempo:** 1h
- **Status:** [ ] Pendente
- **Arquivos:** `frontend/src/layout/index.js`, `frontend/public/flags/sa.png`
- **Resumo:** Adicionar idioma árabe ao seletor + corrigir espaçamento

### ✅ [TASK-03](./TASK-03-erro-aceitar-contato-fila.md) - Race Condition em Aceitar Ticket
- **Tempo:** 6h
- **Status:** [ ] Pendente
- **Arquivos:** `UpdateTicketService.ts`, `CreateTicketService.ts`, etc.
- **Resumo:** Corrigir 4 race conditions com transações e locks pessimistas

### ✅ [TASK-10](./TASK-10-whitelabel-nome-sistema.md) - WhiteLabel Reverting no Reload
- **Tempo:** 3h
- **Status:** [ ] Pendente
- **Arquivos:** `frontend/src/App.js`, `frontend/public/index.html`
- **Resumo:** Usar localStorage para cachear appName e evitar "ChatIA" temporário

### ✅ [TASK-14](./TASK-14-flowbuilder-dois-blocos-perguntas.md) - FlowBuilder Perde Variáveis
- **Tempo:** 4h
- **Status:** [ ] Pendente
- **Arquivos:** `wbotMessageListener.ts:4664-4704`
- **Resumo:** Corrigir navegação de nodes + merge de variáveis (não sobrescrever)

---

## 🚨 TASKS DE SEGURANÇA (Vulnerabilidade LGPD/GDPR)

### ✅ [TASK-09](./TASK-09-contatos-estranhos-SEGURANCA.md) - 19 Vazamentos Multi-Tenant
- **Tempo:** 16h
- **Status:** [ ] Pendente
- **Arquivos:** 19 services (ContactService, TicketService, TagService, etc.)
- **Resumo:** Adicionar validação `companyId` em 19 operações de leitura/escrita
- **⚠️ CRÍTICO:** Exposição de dados entre empresas diferentes

---

## 🟠 TASKS DE ALTA PRIORIDADE

### ✅ [TASK-02](./TASK-02-demo-user-creation.md) - Usuário Demo Não Criado
- **Tempo:** 2h
- **Status:** [ ] Pendente
- **Arquivos:** `backend/src/models/Company.ts`, `CompaniesSettings.ts`
- **Resumo:** Implementar hook AfterCreate para criar usuário demo automaticamente

### ✅ [TASK-11](./TASK-11-erros-tela-contatos.md) - 3 Erros na Tela de Contatos
- **Tempo:** 2h
- **Status:** [ ] Pendente
- **Arquivos:** `ContactController.ts`, `frontend/src/pages/Contacts/index.js`
- **Resumo:** Corrigir título coluna, traduções, e internal error 500

### ✅ [TASK-12](./TASK-12-kanban-automacao-coluna.md) - Erro Automação Kanban
- **Tempo:** 1h
- **Status:** [ ] Pendente
- **Arquivos:** `backend/src/services/KanbanService/MoveTicketToColumn.ts`
- **Resumo:** Adicionar validação companyId + transação em movimento de coluna

---

## 🟡 TASKS DE MÉDIA PRIORIDADE

### ✅ [TASK-04](./TASK-04-remover-aba-lista-arquivos.md) - Remover "Lista de Arquivos"
- **Tempo:** 45min
- **Status:** [ ] Pendente
- **Arquivos:** `frontend/src/layout/MainListItems.js`
- **Resumo:** Comentar/remover item obsoleto do menu lateral

### ✅ [TASK-06](./TASK-06-buscador-empresas-senha.md) - Buscador Empresas + Senha
- **Tempo:** 2h30min
- **Status:** [ ] Pendente
- **Arquivos:** `frontend/src/pages/Companies/index.js`, `CompanyModal/index.js`
- **Resumo:** Implementar busca funcional + toggle de visibilidade de senha

### ✅ [TASK-13](./TASK-13-recuperar-senha-smtp.md) - Recuperar Senha + SMTP
- **Tempo:** 4h
- **Status:** [ ] Pendente
- **Arquivos:** `ForgotPassword/index.js`, `SendResetPasswordEmail.ts`, `.env`
- **Resumo:** Corrigir tela de recuperação + configurar nodemailer com SMTP

---

## 🟢 TASKS DE BAIXA PRIORIDADE

### ✅ [TASK-05](./TASK-05-titulo-empresas.md) - Título "Empresas"
- **Tempo:** 30min
- **Status:** [ ] Pendente
- **Arquivos:** `frontend/src/translate/languages/*.js` (5 idiomas)
- **Resumo:** Alterar "Cadastrar empresa" → "Empresas" em todas as traduções

### ✅ [TASK-07](./TASK-07-icone-senha-usuarios.md) - Ícone Olho na Senha (Usuários)
- **Tempo:** 45min
- **Status:** [ ] Pendente
- **Arquivos:** `frontend/src/components/UserModal/index.js`
- **Resumo:** Adicionar toggle de visibilidade no campo senha do modal de usuários

### ✅ [TASK-08](./TASK-08-configuracoes-planos.md) - Ocultar "Público" + Renomear "Talk.ia"
- **Tempo:** 1h30min
- **Status:** [ ] Pendente
- **Arquivos:** `Plans/index.js`, `translate/languages/*.js`
- **Resumo:** Ocultar campo "Público" + renomear "Talk.ia" para "Prompts"

---

## 📅 Timeline Sugerido

### Sprint 1 (5 dias) - SEGURANÇA + CRÍTICAS
```
Dia 1-2: TASK-09 (Segurança - 16h)
Dia 3: TASK-03 (Race Conditions - 6h)
Dia 4: TASK-14 (FlowBuilder - 4h) + TASK-10 (WhiteLabel - 3h)
Dia 5: TASK-01 (Idioma Árabe - 1h)
```

### Sprint 2 (3 dias) - ALTA + MÉDIA PRIORIDADE
```
Dia 1: TASK-02 (Demo User - 2h) + TASK-11 (Contatos - 2h) + TASK-12 (Kanban - 1h)
Dia 2: TASK-13 (SMTP - 4h) + TASK-06 (Empresas - 2h30min)
Dia 3: TASK-04 (Remover Menu - 45min)
```

### Sprint 3 (1 dia) - BAIXA PRIORIDADE
```
Dia 1: TASK-05 (Título - 30min) + TASK-07 (Senha Usuários - 45min) + TASK-08 (Planos - 1h30min)
```

**Total:** ~9 dias úteis (2 semanas com testes)

---

## 🎯 Ordem de Implementação Recomendada

Ver [IMPLEMENTATION-ORDER.md](./IMPLEMENTATION-ORDER.md) para sequência detalhada com dependências.

**Ordem Sugerida:**
1. 🚨 TASK-09 (EMERGÊNCIA - Bloqueio LGPD)
2. 🔴 TASK-03 (Race Conditions críticas)
3. 🔴 TASK-14 (FlowBuilder - feature principal)
4. 🔴 TASK-10 (WhiteLabel - primeira impressão)
5. 🟠 TASK-02, 11, 12 (Alta prioridade)
6. 🟡 TASK-04, 06, 13 (Média prioridade)
7. 🟢 TASK-05, 07, 08, 01 (Baixa prioridade)

---

## 📂 Estrutura dos Arquivos de Task

Cada arquivo `.md` contém:
- **Problema:** Descrição clara do bug
- **Solução:** Código completo pronto para copy-paste
- **Arquivos a Modificar:** Lista com paths exatos
- **Critérios de Aceitação:** Checklist de validação
- **Casos de Teste:** Passo-a-passo para testar
- **Tempo Estimado:** Horas necessárias

---

## 🔗 Links Úteis

- [Análise Backend](../docs/analysis/backend-analysis.md)
- [Relatório Executivo](../docs/analysis/CRITICAL-TASKS-EXECUTIVE-REPORT.md)
- [Auditoria de Segurança](../docs/analysis/SECURITY-AUDIT-CONTACT-LEAK.md)
- [Análise Race Conditions](../docs/analysis/TASK-03-race-condition-summary.md)

---

## ✅ Como Usar Este Diretório

1. **Escolha a task** pela prioridade (recomendado: TASK-09 primeiro)
2. **Abra o arquivo .md** correspondente
3. **Copie o código da solução** diretamente para os arquivos indicados
4. **Execute os casos de teste** descritos no arquivo
5. **Marque como concluída** atualizando o status aqui no README

---

## 📝 Atualizar Status

Quando concluir uma task, atualize a linha correspondente:

```diff
- **Status:** [ ] Pendente
+ **Status:** [x] Concluída em 2025-10-15
```

E atualize os contadores no topo do documento.

---

**Última Atualização:** 2025-10-12
**Versão do Sistema:** ChatIA Flow v2.2.2v-26
**Squad:** Disponível para implementação
