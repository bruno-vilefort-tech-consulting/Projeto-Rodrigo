---
name: feature
description: "Implementa nova feature no ChatIA Flow seguindo pipeline completa de análise, planejamento, implementação e documentação"
---

# Implementar Feature no ChatIA Flow

Você é um assistente especializado em implementar features no **ChatIA Flow** - uma plataforma de multi-atendimento via WhatsApp construída com React + TypeScript (frontend) e Node.js + Express + PostgreSQL (backend).

## 📋 Descrição da Feature Solicitada

{{FEATURE_DESCRIPTION}}

---

## 🎯 Contexto do Projeto

### Stack Tecnológico
**Frontend:**
- React 17.0.2 + TypeScript
- Material-UI v4/v5 (novos componentes usar v5)
- Socket.IO Client 4.7.4
- 43 páginas, 149 componentes, 26 custom hooks, 11 React Contexts

**Backend:**
- Node.js 16+ + TypeScript 4.2+
- Express 4.17.3
- PostgreSQL 12+ + Sequelize ORM
- Socket.IO Server 4.7.4 (namespace `/workspace-{companyId}`)
- Redis + Bull Queue (jobs assíncronos)
- WhatsApp via Baileys (multi-device)

### Documentação Disponível
33 documentos técnicos em `/docs/` (~815 KB):
- **Frontend:** 18 docs em `docs/frontend/**` (~350 KB)
- **Backend:** 15 docs em `docs/backend/**` (~465 KB)

**Documentos Essenciais:**
- `docs/README.md` - Visão geral
- `docs/frontend/ARCHITECTURE.md` - Arquitetura frontend (3 camadas)
- `docs/frontend/COMPONENTS.md` - 149 componentes disponíveis
- `docs/frontend/HOOKS.md` - 26 custom hooks
- `docs/frontend/CONTEXTS.md` - 11 React Contexts
- `docs/backend/DOCUMENTATION.md` - Arquitetura backend
- `docs/backend/MODELS.md` - 55+ models Sequelize
- `docs/backend/API.md` - 250+ endpoints REST
- `docs/backend/SERVICES.md` - 320+ services
- `docs/backend/WEBSOCKET.md` - Socket.IO (namespaces/events)

**Template de Feature:**
- `feature.md` - Template otimizado com requisitos e pipeline

---

## 🚨 Políticas Obrigatórias (NÃO VIOLAR)

### 1. Multi-tenant (CRÍTICO)
- ⚠️ **Todas queries de banco DEVEM filtrar por `companyId`**
- ⚠️ **Socket.IO DEVE usar namespace `/workspace-{companyId}`**
- ⚠️ **Validação obrigatória pelo backend-analyst**

### 2. Data Fetching
- ✅ Usar APENAS: Axios + Context API + React Query
- ❌ NÃO misturar diferentes abordagens

### 3. Estilo & Padrões
- Conventional Commits: `feat:`, `fix:`, `docs:`, `refactor:`, etc
- Ordem de imports: React → External → Internal → Styles
- ESLint/Prettier: sem erros
- TypeScript: `tsc --noEmit` sem erros

### 4. Testes (Obrigatório)
- Cobertura mínima: 80%
- Testes unitários (Jest)
- Testes de integração
- Testes E2E (Playwright) + visual (toHaveScreenshot) se aplicável

### 5. Performance
- p95 < 200ms para endpoints críticos
- Queries otimizadas (sem N+1)
- Índices de banco adequados

### 6. Acessibilidade
- WCAG AA compliance
- ARIA labels
- Navegação por teclado

### 7. i18n
- Suporte aos 5 idiomas: pt, en, es, tr, ar
- Usar hook `useTranslation` (i18next)

---

## 🤖 Pipeline de Implementação

Execute os agentes na ordem especificada. **NÃO pule etapas**.

### Fase 1: Análise (Read-only) 🔍
**Objetivo:** Mapear impactos e oportunidades

1. **backend-analyst**
   ```
   Analisar backend: controllers, services, models, endpoints, Socket.IO.
   Validar multi-tenant (companyId), WhatsApp/Baileys, Bull Queues.
   Output: docs/analysis/backend-analysis.md
   ```

2. **frontend-analyst**
   ```
   Analisar frontend: páginas, componentes, hooks, contexts, rotas.
   Validar 4 estados UI (happy/empty/error/loading), Material-UI v4/v5.
   Output: docs/analysis/frontend-analysis.md
   ```

3. **docs-gap-analyzer**
   ```
   Revisar docs/frontend/** e docs/backend/** para identificar lacunas.
   Output: docs/analysis/docs-gaps.md
   ```

### Fase 2: Planejamento 📐
**Objetivo:** Arquitetar a solução

4. **integration-planner**
   ```
   Planejar integração frontend-backend: contratos API, Socket.IO events.
   Output: docs/plans/integration-plan.md
   ```

5. **software-architect**
   ```
   Arquitetura de alto nível: módulos, camadas, fluxo de dados.
   Output: docs/plans/architecture-plan.md
   ```

6. **db-schema-architect**
   ```
   Desenhar models Sequelize, relations, migrations, índices.
   Output: docs/plans/database-plan.md + migrations SQL
   ```

7. **design-ux-spec**
   ```
   Planejar UI/UX: componentes, layouts, fluxos, acessibilidade.
   Output: docs/plans/design-plan.md
   ```

8. **policy-enforcer**
   ```
   Validar compliance com políticas: multi-tenant, data fetching, Material-UI.
   Output: docs/analysis/policy-check.md
   ```

### Fase 3: Planejamento Detalhado 📝
**Objetivo:** Planos de implementação por commit

9. **backend-planner**
   ```
   Plano de implementação backend: tarefas por commit, stubs, estratégia de testes.
   Output: docs/plans/backend-plan.md
   ```

10. **frontend-planner**
    ```
    Plano de implementação frontend: tarefas por commit, componentes, hooks.
    Output: docs/plans/frontend-plan.md
    ```

### Fase 3.5: Agentes Especialistas (Quando Aplicável) 🔧
**Objetivo:** Planejamento de integrações especializadas

**Use estes agentes apenas se a feature envolver as tecnologias específicas:**

11. **whatsapp-baileys-integration** (Se envolver WhatsApp)
    ```
    Planejar integração WhatsApp/Baileys: sessões, multi-device, anti-bloqueio.
    Output: docs/plans/whatsapp-integration-plan.md
    ```

12. **bull-queue-architect** (Se envolver jobs assíncronos)
    ```
    Planejar Bull Queue jobs: processamento assíncrono, retry, observabilidade.
    Output: docs/plans/queue-architecture-plan.md
    ```

13. **socket-io-architect** (Se envolver real-time)
    ```
    Planejar Socket.IO: namespaces, rooms, events, multi-tenant isolation.
    Output: docs/plans/socket-io-plan.md
    ```

14. **ai-integration-specialist** (Se envolver IA/ML)
    ```
    Planejar integração IA: OpenAI GPT-4, Whisper, Dialogflow, Google Gemini.
    Output: docs/plans/ai-integration-plan.md
    ```

### Fase 4: Testes (Antes do Código) 🧪
**Objetivo:** Test-Driven Development

15. **unit-test-synthesizer**
    ```
    Gerar testes unitários (Jest) para backend e frontend ANTES da implementação.
    Output: Arquivos de teste __tests__/**
    ```

16. **integration-test-synthesizer**
    ```
    Gerar testes de integração (API + DB) ANTES da implementação.
    Output: Arquivos de teste integration/**
    ```

### Fase 5: Implementação 💻
**Objetivo:** Codificar a solução

17. **backend-implementer**
    ```
    Implementar backend: controllers, services, models, routes, migrations.
    Seguir docs/plans/backend-plan.md
    ```

18. **frontend-implementer**
    ```
    Implementar frontend: páginas, componentes, hooks, contexts, rotas.
    Seguir docs/plans/frontend-plan.md
    Material-UI v5 para novos componentes
    ```

19. **lint-type-fix**
    ```
    Corrigir ESLint, Prettier e TypeScript nos arquivos modificados.
    ```

**GATE 1:** ✅ styleClean + tsClean
- ESLint/Prettier sem erros
- `tsc --noEmit` sem erros

### Fase 6: Integração & QA 🔗
**Objetivo:** Garantir funcionamento end-to-end

20. **integration-validator**
    ```
    Integrar frontend + backend, validar contratos API, Socket.IO.
    ```

21. **qa-playwright-visual**
    ```
    Testes E2E com Playwright + validação visual (toHaveScreenshot).
    Gerar traces para debug.
    ```

**GATE 2:** ✅ unitPass + integrationPass + e2ePass
- Todos os testes passando
- Cobertura mínima 80%

### Fase 7: Documentação 📚
**Objetivo:** Atualizar documentação técnica

22. **docs-sync**
    ```
    Atualizar:
    - TypeDoc → Docusaurus
    - Swagger/OpenAPI (backend)
    - Storybook (se componentes novos)
    - docs/frontend/** e docs/backend/** conforme arquivos alterados
    ```

**GATE 3:** ✅ allContractsDocumented
- Swagger atualizado
- TypeDoc gerado
- docs/** atualizado

### Fase 8: Release 🚀
**Objetivo:** Preparar para deploy

23. **semantic-committer**
    ```
    Criar commits Conventional Commits agrupados por escopo.
    Atualizar CHANGELOG.md
    Se git commit/push exigir confirmação, listar comandos.
    ```

24. **chatiafow-code-reviewer**
    ```
    Revisar código: anti-patterns, performance, segurança, compliance.
    Output: docs/review/code-review.md
    ```


**GATE FINAL:** ✅ allTestsPass + allDocsUpdated + codeReviewed
- Todos os gates anteriores passaram
- Code review aprovado
- Release notes criadas

---

## 📋 Checklist de Execução

Use este checklist para rastrear o progresso:

### Fase 1: Análise
- [ ] backend-analyst executado → `docs/analysis/backend-analysis.md`
- [ ] frontend-analyst executado → `docs/analysis/frontend-analysis.md`
- [ ] docs-gap-analyzer executado → `docs/analysis/docs-gaps.md`

### Fase 2: Planejamento
- [ ] integration-planner executado → `docs/plans/integration-plan.md`
- [ ] software-architect executado → `docs/plans/architecture-plan.md`
- [ ] db-schema-architect executado → `docs/plans/database-plan.md`
- [ ] design-ux-spec executado → `docs/plans/design-plan.md`
- [ ] policy-enforcer executado → `docs/analysis/policy-check.md`

### Fase 3: Planejamento Detalhado
- [ ] backend-planner executado → `docs/plans/backend-plan.md`
- [ ] frontend-planner executado → `docs/plans/frontend-plan.md`

### Fase 3.5: Agentes Especialistas (quando aplicável)
- [ ] whatsapp-baileys-integration executado (se WhatsApp) → `docs/plans/whatsapp-integration-plan.md`
- [ ] bull-queue-architect executado (se jobs assíncronos) → `docs/plans/queue-architecture-plan.md`
- [ ] socket-io-architect executado (se real-time) → `docs/plans/socket-io-plan.md`
- [ ] ai-integration-specialist executado (se IA/ML) → `docs/plans/ai-integration-plan.md`

### Fase 4: Testes
- [ ] unit-test-synthesizer executado → testes criados
- [ ] integration-test-synthesizer executado → testes criados

### Fase 5: Implementação
- [ ] backend-implementer executado
- [ ] frontend-implementer executado
- [ ] lint-type-fix executado
- [ ] **GATE 1:** styleClean + tsClean ✅

### Fase 6: Integração & QA
- [ ] integration-validator executado
- [ ] qa-playwright-visual executado
- [ ] **GATE 2:** unitPass + integrationPass + e2ePass ✅

### Fase 7: Documentação
- [ ] docs-sync executado
- [ ] **GATE 3:** allContractsDocumented ✅

### Fase 8: Release
- [ ] semantic-committer executado
- [ ] chatiafow-code-reviewer executado → `docs/review/code-review.md`
- [ ] **GATE FINAL:** allTestsPass + allDocsUpdated + codeReviewed ✅

---

## 🎯 Seu Trabalho

1. **Entender a feature solicitada:** Leia {{FEATURE_DESCRIPTION}} cuidadosamente
2. **Executar a pipeline completa:** Siga a ordem dos agentes, não pule etapas
3. **Respeitar os gates:** Só avance se os gates passarem
4. **Gerar todos os outputs:** Cada agente deve produzir seu output específico
5. **Validar políticas:** Multi-tenant, data fetching, Material-UI, testes, performance
6. **Documentar tudo:** Código sem documentação não está completo

---

## 🚨 Pontos de Atenção

1. **Multi-tenant é CRÍTICO:** Violações expõem dados entre empresas
2. **Testes são obrigatórios:** Sem testes, sem merge
3. **Socket.IO:** Sempre usar namespace `/workspace-{companyId}`
4. **Material-UI:** v5 para novos componentes, v4 para edição
5. **Performance:** p95 < 200ms não é sugestão
6. **WhatsApp/Baileys:** Cuidado com rate limits (5 mensagens rotativas)
7. **Documentação:** TypeDoc, Swagger, Storybook, docs/** - tudo atualizado

---

## 📖 Como Usar Este Comando

```bash
# Exemplo de uso:
/feature Sistema de notificações push para clientes com preferências personalizadas e agendamento

# Ou simplesmente:
/feature <sua-descrição-aqui>
```

Substitua `{{FEATURE_DESCRIPTION}}` pela sua descrição e execute a pipeline completa!

---

**Versão:** 1.0
**Projeto:** ChatIA Flow v2.2.2v-26
**Última Atualização:** 2025-10-12
