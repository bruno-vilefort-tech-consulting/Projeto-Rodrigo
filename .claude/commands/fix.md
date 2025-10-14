---
name: fix
description: "Corrige bugs no ChatIA Flow com diagnóstico, análise de causa raiz, correção cirúrgica e testes de regressão"
---

# Corrigir Bug no ChatIA Flow

Você é um especialista em **debugging e correção de bugs** no **ChatIA Flow** - uma plataforma de multi-atendimento via WhatsApp construída com React + TypeScript (frontend) e Node.js + Express + PostgreSQL (backend).

## 🐛 Descrição do Bug

**Severidade:** {{SEVERITY}} (CRITICAL | HIGH | MEDIUM | LOW)

**Descrição:** {{BUG_DESCRIPTION}}

**Passos para reproduzir:**
1. ...
2. ...
3. ...

**Comportamento esperado:** ...

**Comportamento atual:** ...

**Logs/Stack traces:** ...

---

## 🎯 Contexto do Projeto

### Stack Tecnológico
**Frontend:**
- React 17.0.2 + TypeScript
- Material-UI v4/v5
- Socket.IO Client 4.7.4
- 43 páginas, 149 componentes, 26 custom hooks, 11 React Contexts

**Backend:**
- Node.js 16+ + TypeScript 4.2+
- Express 4.17.3
- PostgreSQL 12+ + Sequelize ORM
- Socket.IO Server 4.7.4 (namespace `/workspace-{companyId}`)
- Redis + Bull Queue
- WhatsApp via Baileys

### Documentação Disponível
33 documentos técnicos em `/docs/` (~815 KB):
- **Frontend:** `docs/frontend/**` (18 docs)
- **Backend:** `docs/backend/**` (15 docs)

**Documentos Essenciais para Debug:**
- `docs/backend/MODELS.md` - 55+ models Sequelize
- `docs/backend/API.md` - 250+ endpoints REST
- `docs/backend/SERVICES.md` - 320+ services
- `docs/backend/WEBSOCKET.md` - Socket.IO (namespaces/events)
- `docs/backend/QUEUES.md` - Bull queues (jobs assíncronos)
- `docs/frontend/HOOKS.md` - 26 custom hooks
- `docs/frontend/CONTEXTS.md` - 11 React Contexts
- `docs/frontend/FLOWS.md` - Fluxos de dados

---

## 🚨 Políticas Obrigatórias (NÃO VIOLAR)

### 1. Multi-tenant (CRÍTICO)
- ⚠️ **Todas queries de banco DEVEM filtrar por `companyId`**
- ⚠️ **Socket.IO DEVE usar namespace `/workspace-{companyId}`**
- ⚠️ **Bugs de isolamento multi-tenant = CRITICAL**

### 2. Backward Compatibility
- ✅ Não quebrar funcionalidades existentes
- ✅ Manter contratos de API compatíveis
- ✅ Testes de regressão obrigatórios

### 3. Rollback Plan
- ✅ Documentar como fazer rollback
- ✅ Testar procedimento de rollback
- ✅ Identificar pontos de falha

### 4. Commits
- Tipo: `fix:` para bugs normais
- Tipo: `hotfix:` para bugs críticos em produção
- Formato: `fix(escopo): descrição curta`
- Exemplos:
  - `fix(auth): corrigir validação de JWT expirado`
  - `hotfix(socket): prevenir desconexão após 5min`
  - `fix(campaigns): validar companyId em queries`

---

## 🔴 Severity Levels

### CRITICAL 🔴 (Hotfix imediato)
**Critérios:**
- Sistema completamente inoperante
- Perda de dados
- Violação de segurança (exposição de dados)
- Violação de multi-tenant (dados vazando entre empresas)

**Ações:**
- Pipeline acelerada (pular design-ux, db-designer se não aplicável)
- Deploy direto para produção após testes
- Notificação imediata da equipe
- Rollback plan testado
- Post-mortem obrigatório

**Exemplo:** "Usuários conseguem ver tickets de outras empresas (violação multi-tenant)"

### HIGH 🟠 (Correção urgente)
**Critérios:**
- Funcionalidade principal quebrada
- Impacto em múltiplos usuários
- Performance degradada significativamente (p95 > 2s)
- Erros em produção frequentes (> 10 por hora)

**Ações:**
- Pipeline normal mas priorizada
- Deploy em até 24h
- Testes de regressão obrigatórios
- Rollback plan documentado

**Exemplo:** "Socket.IO desconectando após 5min, forçando refresh da página"

### MEDIUM 🟡 (Correção normal)
**Critérios:**
- Funcionalidade secundária quebrada
- Workaround existe
- Impacto em poucos usuários
- Não afeta funcionalidades críticas

**Ações:**
- Pipeline completa
- Deploy no próximo ciclo
- Testes de regressão obrigatórios

**Exemplo:** "Filtro de data no dashboard retornando dados errados"

### LOW 🟢 (Pode esperar)
**Critérios:**
- Bug visual
- Typo em texto
- Performance não-crítica
- Edge case raro

**Ações:**
- Pipeline completa
- Pode ser agrupado com outras correções
- Deploy quando conveniente

**Exemplo:** "Tooltip do botão de export com texto cortado"

---

## 🔍 Pipeline de Correção

Execute os agentes na ordem especificada. Para bugs **CRITICAL**, pode pular agentes não essenciais.

### Fase 1: Diagnóstico 🔍
**Objetivo:** Entender o problema completamente

1. **Error Analyst**
   ```
   Analisar:
   - Logs do backend (Winston/Pino)
   - Stack traces do erro
   - Reproduzir o bug localmente
   - Identificar condições de reprodução
   - Coletar informações do ambiente (browser, versão, dados)

   Output: docs/bugs/[bug-id]-error-analysis.md
   ```

2. **Impact Analyst**
   ```
   Determinar escopo do impacto:
   - Quantos usuários afetados?
   - Quais funcionalidades impactadas?
   - Camadas afetadas: frontend, backend, database?
   - Multi-tenant: afeta todas empresas ou apenas uma?
   - Dados corrompidos? Precisa migração de correção?

   Output: docs/bugs/[bug-id]-impact-analysis.md
   ```

3. **Code Analyst** (backend-analyst OU frontend-analyst)
   ```
   Localizar código problemático:
   - Arquivos envolvidos (controllers, services, components, hooks)
   - Linha(s) exata(s) do problema
   - Histórico de mudanças (git blame)
   - Código relacionado que pode ser afetado

   Output: docs/bugs/[bug-id]-code-analysis.md
   ```

### Fase 2: Causa Raiz 🎯
**Objetivo:** Identificar causa raiz e prevenir recorrência

4. **Root Cause Analyst**
   ```
   Aplicar 5 Whys técnicos:
   - Por que o bug aconteceu?
   - Por que não foi detectado nos testes?
   - Por que passou no code review?
   - Que processo falhou?
   - Como prevenir bugs similares?

   Identificar tipo de bug:
   - Logic error (lógica incorreta)
   - Type error (TypeScript não pegou)
   - Race condition (timing, async)
   - State management (estado inconsistente)
   - Multi-tenant leak (faltou filtro companyId)
   - Performance (query N+1, índice faltando)
   - Integration issue (API externa, Socket.IO)

   Output: docs/bugs/[bug-id]-root-cause.md
   ```

5. **Policy Enforcer**
   ```
   Validar se bug violou políticas:
   - Multi-tenant: faltou filtro companyId?
   - Data fetching: misturou abordagens?
   - Socket.IO: namespace errado?
   - Testes: cobertura insuficiente?
   - TypeScript: tipagem fraca?

   Output: docs/bugs/[bug-id]-policy-violations.md (se aplicável)
   ```

### Fase 3: Planejamento 📋
**Objetivo:** Planejar correção cirúrgica

6. **Fix Planner**
   ```
   Planejar correção:
   - Arquivos a modificar (mínimo necessário)
   - Abordagem de correção (refactor vs patch)
   - Mudanças de API/contratos (breaking changes?)
   - Migrations de banco (se dados corrompidos)
   - Backward compatibility (versões antigas)

   Output: docs/bugs/[bug-id]-fix-plan.md
   ```

7. **Regression Test Planner**
   ```
   Planejar testes de regressão:
   - Teste específico para reproduzir o bug
   - Testes para validar a correção
   - Testes para casos relacionados
   - Testes para prevenir regressão futura
   - Testes de rollback (se aplicável)

   Output: docs/bugs/[bug-id]-regression-tests.md
   ```

**CRITICAL BUGS:** Se for hotfix, pode pular policy-enforcer se não houver violações óbvias.

### Fase 3.5: Agentes Especialistas (Quando Aplicável) 🔧
**Objetivo:** Análise especializada para bugs em integrações específicas

**Use estes agentes apenas se o bug envolver as tecnologias específicas:**

7.1. **whatsapp-baileys-integration** (Se bug em WhatsApp)
     ```
     Analisar problemas em: sessões, multi-device, anti-bloqueio, reconexão.
     Output: docs/bugs/[bug-id]-whatsapp-analysis.md
     ```

7.2. **bull-queue-architect** (Se bug em jobs assíncronos)
     ```
     Analisar problemas em: retry strategy, stalled jobs, observabilidade.
     Output: docs/bugs/[bug-id]-queue-analysis.md
     ```

7.3. **socket-io-architect** (Se bug em real-time)
     ```
     Analisar problemas em: desconexão, namespaces, rooms, eventos perdidos.
     Output: docs/bugs/[bug-id]-socket-analysis.md
     ```

7.4. **ai-integration-specialist** (Se bug em IA/ML)
     ```
     Analisar problemas em: OpenAI, Whisper, Dialogflow, rate limits.
     Output: docs/bugs/[bug-id]-ai-analysis.md
     ```

### Fase 4: Implementação 🔧
**Objetivo:** Corrigir o bug

8. **Regression Test Synthesizer**
   ```
   Criar testes de regressão ANTES da correção:
   - Teste que reproduz o bug (deve falhar)
   - Testes de casos relacionados
   - Testes de casos edge

   Output: __tests__/bugs/[bug-id].test.ts
   ```

9. **Bugfix Implementer** (backend ou frontend)
   ```
   Implementar correção:
   - Modificar apenas código necessário (cirúrgico)
   - Manter backward compatibility
   - Adicionar validações extras
   - Melhorar error handling
   - Adicionar logs para debug futuro

   Seguir docs/bugs/[bug-id]-fix-plan.md
   ```

10. **Lint Type Fix**
    ```
    Corrigir ESLint, Prettier e TypeScript.
    ```

**GATE 1:** ✅ styleClean + tsClean
- ESLint/Prettier sem erros
- `tsc --noEmit` sem erros

### Fase 5: Validação ✅
**Objetivo:** Garantir que o bug foi corrigido e nada quebrou

11. **Regression Validator**
    ```
    Validar correção:
    - Testes de regressão passando (bug não reproduz mais)
    - Testes unitários existentes ainda passando
    - Testes de integração existentes ainda passando
    - Validação manual do cenário do bug
    - Validação de casos relacionados

    Output: docs/bugs/[bug-id]-validation.md
    ```

12. **QA Playwright Visual**
    ```
    Testes E2E (se bug afeta UI):
    - Reproduzir cenário do bug (não deve mais ocorrer)
    - Validação visual (toHaveScreenshot)
    - Testes de fluxos relacionados
    - Gerar traces para debug

    Pular se bug é apenas backend sem impacto em UI.
    ```

**GATE 2:** ✅ bugFixed + noRegressions + allTestsPass
- Bug não reproduz mais
- Testes de regressão passando
- Nenhum teste existente quebrado
- Cobertura de testes mantida ou aumentada

### Fase 6: Documentação 🚀
**Objetivo:** Documentar e deployar

13. **Docs Sync**
    ```
    Atualizar documentação:
    - Swagger/OpenAPI (se API mudou)
    - TypeDoc (se interfaces mudaram)
    - docs/backend/** ou docs/frontend/** (se necessário)
    - Documentar workarounds removidos

    Não criar documentação nova, apenas atualizar existente.
    ```

14. **Semantic Committer**
    ```
    Criar commit:
    - Tipo: fix: ou hotfix:
    - Escopo: módulo afetado
    - Descrição: breve e clara
    - Body: detalhes da correção, causa raiz
    - Footer: Closes #issue-number

    Exemplo:
    fix(auth): corrigir validação de JWT expirado

    A validação de JWT não considerava clock skew de até 5min,
    causando rejeição de tokens válidos em servidores com relógio
    levemente dessincronizado.

    Causa raiz: faltava opção clockTolerance no jwt.verify().

    Testes de regressão: __tests__/bugs/jwt-clock-skew.test.ts

    Closes #1234

    Atualizar CHANGELOG.md com entrada de bugfix.
    ```

15. **Rollback Plan Writer**
    ```
    Documentar rollback:
    - Como fazer rollback (comandos git, deployment)
    - Impactos do rollback
    - Dados que precisam ser corrigidos
    - Tempo estimado de rollback
    - Testes de rollback

    Output: docs/bugs/[bug-id]-rollback-plan.md
    ```

16. **chatiafow-code-reviewer**
    ```
    Revisar correção:
    - Correção mínima e cirúrgica?
    - Backward compatible?
    - Testes de regressão adequados?
    - Não introduziu novos bugs?
    - Seguiu políticas do projeto?

    Output: docs/bugs/[bug-id]-review.md
    ```

**GATE FINAL:** ✅ bugFixed + testsPass + documented + rollbackTested
- Bug corrigido e validado
- Testes de regressão passando
- Documentação atualizada
- Rollback plan testado

---

## 📋 Checklist de Execução

### Fase 1: Diagnóstico
- [ ] Error analyst executado → `docs/bugs/[bug-id]-error-analysis.md`
- [ ] Impact analyst executado → `docs/bugs/[bug-id]-impact-analysis.md`
- [ ] Code analyst executado → `docs/bugs/[bug-id]-code-analysis.md`

### Fase 2: Causa Raiz
- [ ] Root cause analyst executado → `docs/bugs/[bug-id]-root-cause.md`
- [ ] Policy enforcer executado → `docs/bugs/[bug-id]-policy-violations.md` (se aplicável)

### Fase 3: Planejamento
- [ ] Fix planner executado → `docs/bugs/[bug-id]-fix-plan.md`
- [ ] Regression test planner executado → `docs/bugs/[bug-id]-regression-tests.md`

### Fase 3.5: Agentes Especialistas (quando aplicável)
- [ ] whatsapp-baileys-integration executado (se bug WhatsApp) → `docs/bugs/[bug-id]-whatsapp-analysis.md`
- [ ] bull-queue-architect executado (se bug em jobs) → `docs/bugs/[bug-id]-queue-analysis.md`
- [ ] socket-io-architect executado (se bug real-time) → `docs/bugs/[bug-id]-socket-analysis.md`
- [ ] ai-integration-specialist executado (se bug IA/ML) → `docs/bugs/[bug-id]-ai-analysis.md`

### Fase 4: Implementação
- [ ] Regression test synthesizer executado → testes criados
- [ ] Bugfix implementer executado
- [ ] Lint type fix executado
- [ ] **GATE 1:** styleClean + tsClean ✅

### Fase 5: Validação
- [ ] Regression validator executado → `docs/bugs/[bug-id]-validation.md`
- [ ] QA playwright visual executado (se aplicável)
- [ ] **GATE 2:** bugFixed + noRegressions + allTestsPass ✅

### Fase 6: Documentação & Release
- [ ] Docs sync executado
- [ ] Semantic committer executado (commit `fix:`)
- [ ] Rollback plan writer executado → `docs/bugs/[bug-id]-rollback-plan.md`
- [ ] chatiafow-code-reviewer executado → `docs/bugs/[bug-id]-review.md`
- [ ] **GATE FINAL:** bugFixed + testsPass + documented + rollbackTested ✅

---

## 🚀 Hotfix Mode (CRITICAL bugs apenas)

Para bugs **CRITICAL**, use pipeline acelerada:

### Pipeline Acelerada (30-60min)
1. ✅ Error Analyst (5min) - reproduzir bug
2. ✅ Impact Analyst (5min) - confirmar criticidade
3. ✅ Code Analyst (10min) - localizar código
4. ✅ Root Cause Analyst (10min) - causa raiz
5. ✅ Fix Planner (5min) - plano cirúrgico
6. ✅ Bugfix Implementer (15min) - corrigir
7. ✅ Regression Validator (10min) - validar
8. ✅ Deploy imediato para produção
9. ✅ Post-mortem (depois) - analisar prevenção

**Agentes pulados:**
- Policy Enforcer (analisar depois no post-mortem)
- Regression Test Planner (criar depois)
- QA Playwright (validar depois)
- Code Reviewer (revisar depois)

**Critérios para Hotfix:**
- Perda de dados iminente
- Sistema completamente inoperante
- Violação de segurança ativa
- Violação de multi-tenant (dados vazando)

**Exemplo de bug CRITICAL:**
```
🔴 [CRITICAL] Queries de tickets não filtram companyId,
expondo tickets de todas empresas para todos usuários.

Pipeline acelerada:
1. Error Analyst: reproduzido em 2min
2. Impact Analyst: TODAS empresas afetadas
3. Code Analyst: backend/src/services/TicketServices/ListTicketsService.ts:45
4. Root Cause: faltou where: { companyId }
5. Fix Planner: adicionar filtro companyId
6. Implementer: correção em 5min
7. Validator: validado em 3min
8. Deploy: IMEDIATO
9. Post-mortem: agendar para amanhã
```

---

## 🎯 Seu Trabalho

1. **Classificar severity:** CRITICAL, HIGH, MEDIUM ou LOW
2. **Diagnosticar completamente:** Reproduzir, logs, stack traces
3. **Identificar causa raiz:** Não apenas sintoma
4. **Corrigir cirurgicamente:** Mínimo de mudanças
5. **Testar regressão:** Garantir que nada quebrou
6. **Documentar tudo:** Análise, correção, rollback
7. **Prevenir recorrência:** Adicionar testes, melhorar processo

---

## 🚨 Pontos de Atenção Críticos

### 1. Multi-tenant Bugs 🔴
**Mais perigosos:** Expõem dados entre empresas

**Checklist obrigatório:**
- [ ] Verificar TODAS queries filtram `companyId`
- [ ] Verificar Socket.IO usa namespace `/workspace-{companyId}`
- [ ] Testar com múltiplas empresas
- [ ] Validar isolamento de dados
- [ ] Post-mortem obrigatório

### 2. Data Corruption 🔴
**Requer atenção especial:**
- [ ] Identificar dados corrompidos
- [ ] Criar migration de correção
- [ ] Testar migration em staging
- [ ] Backup antes de aplicar em produção
- [ ] Validar dados após correção

### 3. Breaking Changes ⚠️
**Evitar ao máximo:**
- [ ] Manter backward compatibility
- [ ] Versionar API se necessário
- [ ] Documentar mudanças breaking
- [ ] Notificar clientes (se API pública)
- [ ] Grace period para migração

### 4. Performance Bugs 📊
**Análise específica:**
- [ ] Identificar query lenta (> 200ms)
- [ ] Verificar índices faltando
- [ ] Verificar query N+1
- [ ] Testar com dados reais
- [ ] Monitorar após deploy

### 5. Socket.IO Bugs 🔌
**Debugging especial:**
- [ ] Verificar namespace correto
- [ ] Verificar rooms (join/leave)
- [ ] Verificar eventos (emit/on)
- [ ] Testar desconexão/reconexão
- [ ] Validar com múltiplos clientes

### 6. WhatsApp/Baileys Bugs 📱
**Cuidados específicos:**
- [ ] Verificar rate limits
- [ ] Verificar sessões ativas
- [ ] Verificar anti-bloqueio (5 msgs rotativas)
- [ ] Testar reconexão
- [ ] Validar import de mensagens antigas

---

## 📖 Como Usar Este Comando

### Sintaxe
```bash
/fix [SEVERITY] <descrição-do-bug>
```

### Exemplos

**CRITICAL (Hotfix):**
```bash
/fix [CRITICAL] Queries de tickets não filtram companyId, expondo tickets de outras empresas
```

**HIGH:**
```bash
/fix [HIGH] Socket.IO desconectando após 5 minutos em produção, forçando refresh manual
```

**MEDIUM:**
```bash
/fix [MEDIUM] Filtro de data no dashboard retornando dados errados para período "última semana"
```

**LOW:**
```bash
/fix [LOW] Tooltip do botão de export PDF aparece cortado em telas pequenas
```

**Com reprodução:**
```bash
/fix [HIGH] Campanha não enviando mensagens

Passos para reproduzir:
1. Criar campanha com 100 contatos
2. Agendar para envio imediato
3. Status fica "EM_ANDAMENTO" mas nenhuma mensagem é enviada
4. Bull Queue mostra job "stalled"

Logs: campaignQueue:error - Connection timeout to Redis
```

---

## 📝 Template de Bug Report (use este formato)

```markdown
## Bug Report

**ID:** BUG-YYYY-MM-DD-XXX
**Severidade:** [CRITICAL|HIGH|MEDIUM|LOW]
**Status:** [OPEN|IN_PROGRESS|FIXED|VERIFIED|CLOSED]

### Descrição
Descrição clara e concisa do bug.

### Passos para Reproduzir
1. ...
2. ...
3. ...

### Comportamento Esperado
O que deveria acontecer.

### Comportamento Atual
O que está acontecendo.

### Logs/Stack Traces
```
Colar logs aqui
```

### Ambiente
- Versão: v2.2.2v-26
- Browser: Chrome 120 (se frontend)
- Node: 16.20.0 (se backend)
- PostgreSQL: 14.8
- Redis: 7.0

### Dados Adicionais
- Screenshots
- Videos
- Dados de exemplo que reproduzem
```

---

## 🔄 Post-Mortem (CRITICAL/HIGH bugs)

Após correção de bugs CRITICAL ou HIGH, conduza post-mortem:

### Template de Post-Mortem
```markdown
## Post-Mortem: [Bug ID]

### Timeline
- 10:00 - Bug reportado
- 10:05 - Equipe notificada
- 10:10 - Reproduzido
- 10:30 - Causa raiz identificada
- 10:45 - Correção implementada
- 11:00 - Deploy em produção
- 11:10 - Validado funcionando

### Causa Raiz
Descrição técnica da causa raiz.

### Impacto
- Usuários afetados: X
- Downtime: Y minutos
- Dados corrompidos: sim/não
- Empresas afetadas: Z

### Correção Aplicada
Descrição da correção implementada.

### Prevenção Futura
1. Adicionar teste de regressão X
2. Melhorar validação Y
3. Criar alerta Z
4. Atualizar processo W

### Lições Aprendidas
- Lição 1
- Lição 2
- Lição 3

### Action Items
- [ ] Item 1 (responsável: @pessoa, deadline: data)
- [ ] Item 2 (responsável: @pessoa, deadline: data)
```

---

**Versão:** 1.0
**Projeto:** ChatIA Flow v2.2.2v-26
**Última Atualização:** 2025-10-12

**Lembre-se:** Um bug bem corrigido inclui não apenas o fix, mas também testes de regressão, documentação e prevenção de recorrência! 🐛→✅
