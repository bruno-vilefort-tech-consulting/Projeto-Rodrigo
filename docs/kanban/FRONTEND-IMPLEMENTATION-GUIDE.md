# Guia de Implementa\u00e7\u00e3o Frontend - Kanban V2

**Vers\u00e3o:** 1.0
**Data:** 2025-10-13
**Status:** PRONTO PARA IMPLEMENTA\u00c7\u00c3O

---

## \u00cdndice de Documenta\u00e7\u00e3o

Este guia organiza todos os documentos de planejamento frontend do Kanban V2.

### 1. Documentos Principais

| Documento | Descri\u00e7\u00e3o | Localiza\u00e7\u00e3o |
|-----------|-------------|---------------|
| **frontend-plan.md** | Plano detalhado de implementa\u00e7\u00e3o (PRINCIPAL) | `docs/kanban/frontend-plan.md` |
| **component-specs.md** | Especifica\u00e7\u00e3o de componentes React | `docs/kanban/component-specs.md` |
| **hooks-specs.md** | Especifica\u00e7\u00e3o de hooks customizados | `docs/kanban/hooks-specs.md` |
| **feature-flag-frontend.md** | Estrat\u00e9gia de feature flag | `docs/kanban/feature-flag-frontend.md` |

### 2. Documentos de Refer\u00eancia (Backend/Arquitetura)

| Documento | Descri\u00e7\u00e3o | Localiza\u00e7\u00e3o |
|-----------|-------------|---------------|
| **ADR-kanban-v2.md** | Decis\u00f5es arquiteturais | `docs/kanban/ADR-kanban-v2.md` |
| **architecture.md** | Arquitetura geral | `docs/kanban/architecture.md` |
| **openapi-kanban.yaml** | Especifica\u00e7\u00e3o de API | `docs/kanban/openapi-kanban.yaml` |
| **backend-implementation-status.md** | Status do backend | `docs/kanban/backend-implementation-status.md` |

---

## Vis\u00e3o Geral do Projeto

### Objetivo
Portar a funcionalidade Kanban completa com Drag-and-Drop da **vers\u00e3o refer\u00eancia** (chatia/chatia) para a **vers\u00e3o destino** (chatia monorepo), mantendo 100% de compatibilidade funcional.

### Stack Tecnol\u00f3gico
- **React:** 17.0.2
- **Material-UI:** v4 (layouts) + v5 (novos componentes)
- **DnD Library:** react-trello 2.2.11
- **Socket.IO Client:** 4.7.4
- **State Management:** Context API + useState
- **i18n:** 5 idiomas (pt, en, es, tr, ar)

### Arquitetura Frontend

```
frontend/
\u251c\u2500\u2500 src/
\u2502   \u251c\u2500\u2500 config/
\u2502   \u2502   \u2514\u2500\u2500 featureFlags.js (NOVO)
\u2502   \u251c\u2500\u2500 hooks/
\u2502   \u2502   \u251c\u2500\u2500 useKanbanTags/ (NOVO)
\u2502   \u2502   \u251c\u2500\u2500 useKanbanTickets/ (NOVO)
\u2502   \u2502   \u251c\u2500\u2500 useSocketKanban/ (NOVO)
\u2502   \u2502   \u2514\u2500\u2500 useMoveTicket/ (NOVO)
\u2502   \u251c\u2500\u2500 pages/
\u2502   \u2502   \u251c\u2500\u2500 Kanban/
\u2502   \u2502   \u2502   \u251c\u2500\u2500 index.js (V2 - NOVO)
\u2502   \u2502   \u2502   \u2514\u2500\u2500 KanbanLegacy.jsx (RENOMEAR)
\u2502   \u2502   \u2514\u2500\u2500 TagsKanban/
\u2502   \u2502       \u2514\u2500\u2500 index.js (PORTAR)
\u2502   \u251c\u2500\u2500 routes/
\u2502   \u2502   \u2514\u2500\u2500 index.js (ATUALIZAR)
\u2502   \u2514\u2500\u2500 translate/languages/
\u2502       \u251c\u2500\u2500 pt.json (ATUALIZAR)
\u2502       \u251c\u2500\u2500 en.json (ATUALIZAR)
\u2502       \u251c\u2500\u2500 es.json (ATUALIZAR)
\u2502       \u251c\u2500\u2500 tr.json (ATUALIZAR)
\u2502       \u2514\u2500\u2500 ar.json (ATUALIZAR)
\u251c\u2500\u2500 package.json (ATUALIZAR - react-trello)
\u2514\u2500\u2500 .env (ATUALIZAR - feature flag)
```

---

## Plano de Implementa\u00e7\u00e3o (8 Commits)

### Commit 1: Setup Inicial e Feature Flag (1h)
- Instalar react-trello@2.2.11
- Criar `config/featureFlags.js`
- Adicionar `REACT_APP_FEATURE_KANBAN_V2=false` em `.env`
- Renomear `Kanban/index.js` para `KanbanLegacy.jsx`

**Documenta\u00e7\u00e3o:** `frontend-plan.md` - Se\u00e7\u00e3o 1 (Commit 1)

---

### Commit 2: Hooks - Parte 1 (Tags e Tickets) (2h)
- Criar `hooks/useKanbanTags/index.js`
- Criar `hooks/useKanbanTickets/index.js`

**Documenta\u00e7\u00e3o:** `hooks-specs.md` - Se\u00e7\u00f5es 1 e 2

---

### Commit 3: Hooks - Parte 2 (Socket.IO e DnD) (2h)
- Criar `hooks/useSocketKanban/index.js`
- Criar `hooks/useMoveTicket/index.js`

**Documenta\u00e7\u00e3o:** `hooks-specs.md` - Se\u00e7\u00f5es 3 e 4

---

### Commit 4: Componente Principal - Kanban V2 (3h)
- Criar `pages/Kanban/index.js` (vers\u00e3o V2 com react-trello)
- Implementar fun\u00e7\u00e3o `popularCards`
- Adicionar filtros de data
- Integrar todos os hooks

**Documenta\u00e7\u00e3o:**
- `component-specs.md` - Se\u00e7\u00e3o 1
- `frontend-plan.md` - Se\u00e7\u00e3o 6 (Data Fetching)

---

### Commit 5: P\u00e1gina de Admin - TagsKanban (2h)
- Portar `pages/TagsKanban/index.js` da refer\u00eancia
- Implementar CRUD completo
- Adicionar Socket.IO listener para tags

**Documenta\u00e7\u00e3o:** `component-specs.md` - Se\u00e7\u00e3o 2

---

### Commit 6: Integra\u00e7\u00e3o de Feature Flag nas Rotas (1h)
- Atualizar `routes/index.js` com condicionais
- Testar toggle entre Legacy e V2

**Documenta\u00e7\u00e3o:** `feature-flag-frontend.md` - Se\u00e7\u00e3o 3

---

### Commit 7: Testes (3h)
- Unit tests (Jest + React Testing Library)
- E2E tests (Playwright)
- Multi-tenant tests

**Documenta\u00e7\u00e3o:** `frontend-plan.md` - Se\u00e7\u00e3o 7

---

### Commit 8: Acessibilidade, i18n e Documenta\u00e7\u00e3o (2h)
- Adicionar ARIA labels
- Criar chaves de tradu\u00e7\u00e3o (5 idiomas)
- Testar navega\u00e7\u00e3o por teclado

**Documenta\u00e7\u00e3o:** `frontend-plan.md` - Se\u00e7\u00f5es 8 e 9

---

## Roteiro de Implementa\u00e7\u00e3o Passo a Passo

### 1. Prepara\u00e7\u00e3o (5 minutos)

```bash
# 1. Navegar para o diret\u00f3rio do projeto
cd /Users/brunovilefort/Desktop/chatia-final/chatia/frontend

# 2. Criar branch de feature
git checkout -b feature/kanban-v2-frontend

# 3. Garantir que depend\u00eancias est\u00e3o instaladas
npm install
```

---

### 2. Executar Commits Sequencialmente

Para cada commit, seguir:

1. **Ler documenta\u00e7\u00e3o:** Revisar se\u00e7\u00e3o correspondente em `frontend-plan.md`
2. **Implementar:** Seguir checklist do commit
3. **Testar:** Validar funcionalidade localmente
4. **Commit:** Fazer commit com mensagem clara

**Exemplo (Commit 1):**

```bash
# Ler documenta\u00e7\u00e3o
cat docs/kanban/frontend-plan.md | grep -A 50 "Commit 1"

# Implementar
npm install react-trello@2.2.11
mkdir -p src/config
touch src/config/featureFlags.js
# (editar arquivo conforme especifica\u00e7\u00e3o)

echo "REACT_APP_FEATURE_KANBAN_V2=false" >> .env

mv src/pages/Kanban/index.js src/pages/Kanban/KanbanLegacy.jsx

# Testar
npm start
# Validar que Kanban Legacy ainda funciona

# Commit
git add .
git commit -m "feat(kanban): Setup inicial e feature flag

- Instala react-trello@2.2.11
- Cria config/featureFlags.js
- Adiciona REACT_APP_FEATURE_KANBAN_V2 em .env
- Renomeia Kanban/index.js para KanbanLegacy.jsx

Estimativa: 1h
"
```

---

### 3. Valida\u00e7\u00e3o Intermedi\u00e1ria (Ap\u00f3s cada 2 commits)

```bash
# Ap\u00f3s Commit 2
npm test -- --testPathPattern="useKanban"

# Ap\u00f3s Commit 4
npm start
# Testar manualmente Board renderizando

# Ap\u00f3s Commit 6
# Testar feature flag toggle
echo "REACT_APP_FEATURE_KANBAN_V2=true" > .env
npm start
# Validar Kanban V2 ativo

echo "REACT_APP_FEATURE_KANBAN_V2=false" > .env
npm start
# Validar Kanban Legacy ativo
```

---

### 4. Valida\u00e7\u00e3o Final (Ap\u00f3s Commit 8)

**Checklist Completo:**

```bash
# 1. Build sem erros
npm run build

# 2. Testes passando
npm test

# 3. E2E passando (se configurado)
npm run test:e2e

# 4. Feature flag funcional
# (testar ambos estados)

# 5. DnD funcional
# (mover ticket entre lanes)

# 6. Socket.IO real-time
# (abrir 2 abas, mover em uma, ver atualizar na outra)

# 7. Multi-tenant
# (logar com 2 empresas diferentes, validar isolamento)

# 8. i18n
# (testar com idioma diferente)

# 9. A11y
# (navegar com Tab, validar ARIA labels)
```

---

## Depend\u00eancias e Pr\u00e9-requisitos

### Backend (J\u00e1 Completo)
- Endpoints `/tag/kanban` e `/ticket/kanban` funcionais
- Socket.IO namespace `/workspace-{companyId}` ativo
- Multi-tenant isolation validado

### Frontend (Existentes)
- AuthContext fornecendo `user` e `socket`
- Componentes reutiliz\u00e1veis (Can, BackdropLoading, etc.)
- Sistema de rotas com `isPrivate`
- i18n configurado para 5 idiomas

### Novas Depend\u00eancias
- `react-trello@2.2.11` (instalar via npm)

---

## Testes

### Unit Tests
**Localiza\u00e7\u00e3o:** `frontend/src/__tests__/`

```bash
# Executar todos os testes
npm test

# Executar apenas testes de hooks Kanban
npm test -- --testPathPattern="useKanban"

# Executar com coverage
npm test -- --coverage
```

**Cobertura M\u00ednima:** 80%

### E2E Tests
**Localiza\u00e7\u00e3o:** `e2e/kanban/`

```bash
# Executar E2E (Playwright)
npm run test:e2e

# Executar apenas testes Kanban
npm run test:e2e -- --grep "Kanban"
```

**Cen\u00e1rios Cr\u00edticos:**
- DnD entre lanes
- Filtros de data
- Real-time Socket.IO
- Multi-tenant isolation

---

## Troubleshooting

### Problema: react-trello n\u00e3o renderiza

**Solu\u00e7\u00e3o:**
```javascript
// Verificar estrutura de dados
console.log(file);
// Deve ter formato: { lanes: [ { id, title, cards: [] } ] }
```

### Problema: Socket.IO n\u00e3o conecta

**Solu\u00e7\u00e3o:**
```javascript
// Verificar namespace
console.log(socket.nsp); // Deve ser "/workspace-{companyId}"

// Verificar eventos
socket.on('connect', () => console.log('Socket conectado'));
socket.on('disconnect', () => console.log('Socket desconectado'));
```

### Problema: Feature flag n\u00e3o alterna

**Solu\u00e7\u00e3o:**
```bash
# React requer restart ap\u00f3s mudar .env
Ctrl+C
npm start
```

**Mais troubleshooting:** `feature-flag-frontend.md` - Se\u00e7\u00e3o 7

---

## Pr\u00f3ximos Passos Ap\u00f3s Implementa\u00e7\u00e3o

### 1. Code Review
- Revisar todos os commits
- Validar ades\u00e3o \u00e0s especifica\u00e7\u00f5es
- Testar localmente

### 2. Deploy em Staging
```bash
# Build com flag desabilitada
REACT_APP_FEATURE_KANBAN_V2=false npm run build

# Deploy
# (seguir processo espec\u00edfico do projeto)

# Habilitar em staging
REACT_APP_FEATURE_KANBAN_V2=true npm run build
```

### 3. Testes em Staging
- DnD entre lanes
- Socket.IO real-time
- Filtros de data
- Multi-tenant (2+ empresas)
- Performance (< 2s load time)

### 4. Rollout Gradual
- **Semana 1:** 10% (companies piloto)
- **Semana 2:** 50%
- **Semana 3:** 100%
- **Semana 4:** Monitoramento
- **Semana 5:** Remover legacy

**Detalhes:** `feature-flag-frontend.md` - Se\u00e7\u00e3o 5

---

## Recursos \u00dateis

### Documenta\u00e7\u00e3o Externa
- [react-trello Docs](https://github.com/rcdexta/react-trello)
- [Material-UI v4 Docs](https://v4.mui.com/)
- [Socket.IO Client Docs](https://socket.io/docs/v4/client-api/)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Playwright Docs](https://playwright.dev/)

### Arquivos de Refer\u00eancia (C\u00f3digo Existente)
- `/Users/brunovilefort/Desktop/chatia-final/chatia/chatia/frontend/src/pages/Kanban/index.js`
- `/Users/brunovilefort/Desktop/chatia-final/chatia/chatia/frontend/src/pages/TagsKanban/index.js`

### Comandos \u00dateis

```bash
# Instalar depend\u00eancias
npm install

# Iniciar dev server
npm start

# Build produ\u00e7\u00e3o
npm run build

# Executar testes
npm test

# Executar testes E2E
npm run test:e2e

# Verificar feature flag
cat .env | grep FEATURE_KANBAN_V2

# Alternar feature flag
echo "REACT_APP_FEATURE_KANBAN_V2=true" > .env
```

---

## Estimativas

| Fase | Tarefas | Estimativa |
|------|---------|-----------|
| **Setup** | Commit 1 | 1h |
| **Hooks** | Commits 2-3 | 4h |
| **Componentes** | Commits 4-5 | 5h |
| **Feature Flag** | Commit 6 | 1h |
| **Testes** | Commit 7 | 3h |
| **A11y + i18n** | Commit 8 | 2h |
| **Total Implementa\u00e7\u00e3o** | | **16h** |
| **Code Review** | | 2h |
| **Testes em Staging** | | 2h |
| **Total** | | **20h (~2.5 dias)** |

---

## Contatos e Suporte

**Documenta\u00e7\u00e3o Criada por:** Frontend Architecture Planner (Claude Code)
**Data de Cria\u00e7\u00e3o:** 2025-10-13

**Para d\u00favidas:**
1. Revisar documenta\u00e7\u00e3o correspondente
2. Verificar c\u00f3digo de refer\u00eancia
3. Consultar troubleshooting
4. Abrir issue no reposit\u00f3rio

---

## Status de Documenta\u00e7\u00e3o

| Documento | Status | Cobertura |
|-----------|--------|-----------|
| frontend-plan.md | COMPLETO | 100% |
| component-specs.md | COMPLETO | 100% |
| hooks-specs.md | COMPLETO | 100% |
| feature-flag-frontend.md | COMPLETO | 100% |
| FRONTEND-IMPLEMENTATION-GUIDE.md | COMPLETO | 100% |

**Todos os documentos est\u00e3o prontos para implementa\u00e7\u00e3o!**

---

**\u00daLTIMA ATUALIZA\u00c7\u00c3O:** 2025-10-13
**VERS\u00c3O:** 1.0
**STATUS:** PRONTO PARA IMPLEMENTA\u00c7\u00c3O
