# Bug Report: BUG-2025-10-14-001

## Informações Básicas

**ID:** BUG-2025-10-14-001
**Severidade:** MEDIUM 🟡
**Status:** FIXED ✅
**Reportado em:** 2025-10-14
**Resolvido em:** 2025-10-14
**Módulo:** Frontend - Kanban
**Tipo:** Navigation / Feature Flag (incorreta)

## Descrição

Na página `/kanban`, ao clicar no botão "Adicionar Colunas", o usuário era direcionado para a página `/tagsKanban` que não existia/não tinha conteúdo quando a feature flag `KANBAN_V2` estava desabilitada.

## Passos para Reproduzir

1. Acessar a aplicação ChatIA Flow
2. Navegar para `/kanban`
3. Clicar no botão "Adicionar Colunas" (localizado no header da página)
4. Observar que a navegação vai para `/tagsKanban`
5. A página aparece vazia ou retorna 404

## Comportamento Esperado

- O botão "Adicionar Colunas" deveria sempre estar visível
- A rota `/tagsKanban` deveria sempre estar disponível
- A funcionalidade de gerenciar colunas do Kanban é parte do sistema core

## Comportamento Atual (Antes da Correção)

- O botão "Adicionar Colunas" estava sempre visível
- Ao clicar, navegava para `/tagsKanban` sem verificar se a rota existe
- A rota `/tagsKanban` só era registrada quando `FEATURES.KANBAN_V2 === true`
- Quando a feature flag estava desabilitada, resultava em página 404/vazia

## Arquivos Afetados

1. **frontend/src/pages/Kanban/index.js**
   - Botão "Adicionar Colunas" (antes incorretamente condicionado por feature flag)

2. **frontend/src/routes/index.js:122-124**
   - Rota incorretamente condicionada por `FEATURES.KANBAN_V2`

3. **frontend/src/config/featureFlags.js:15**
   - Definição da feature flag `KANBAN_V2` (não deveria existir para esta funcionalidade)

## Análise Técnica

### Causa Raiz

A feature flag `KANBAN_V2` foi **incorretamente adicionada** para controlar uma funcionalidade que já era parte do sistema core (boilerplate original). A página `TagsKanban` foi criada no commit inicial do boilerplate e não é uma feature experimental.

### Código Problemático (ANTES)

```javascript
// frontend/src/routes/index.js:122-124
{FEATURES.KANBAN_V2 && (
  <Route exact path="/tagsKanban" component={TagsKanban} isPrivate />
)}
```

### Solução Correta (DEPOIS)

```javascript
// frontend/src/routes/index.js:122
<Route exact path="/tagsKanban" component={TagsKanban} isPrivate />
```

### Impacto

- **Usuários afetados:** Todos que tentam adicionar colunas no Kanban com feature flag desabilitada
- **Funcionalidades impactadas:** Gerenciamento de colunas/tags do Kanban
- **Camadas afetadas:** Frontend (routing e navegação)
- **Multi-tenant:** Não afeta isolamento
- **Dados corrompidos:** Não

## Solução Aplicada

### Correção Final

**Remover a feature flag** tanto da rota quanto do botão, deixando a funcionalidade sempre disponível.

**Mudanças realizadas:**

1. **frontend/src/routes/index.js:**
   - Removida condicional `{FEATURES.KANBAN_V2 && ...}`
   - Rota `/tagsKanban` agora sempre registrada

2. **frontend/src/pages/Kanban/index.js:**
   - Removido import de `FEATURES`
   - Botão "Adicionar Colunas" sempre visível (com RBAC mantido)

**Prós:**
- Funcionalidade sempre disponível como deveria ser
- Consistente com design original do sistema
- Remove feature flag desnecessária
- Mantém RBAC intacto

**Contras:**
- Nenhum (era a solução correta desde o início)

## Backward Compatibility

✅ 100% backward compatible
- Funcionalidade agora está sempre disponível
- Não quebra nenhuma funcionalidade existente
- RBAC continua funcionando normalmente

## Rollback Plan

### Como fazer rollback:
```bash
git revert <commit-hash-da-correção>
```

### Impactos do rollback:
- Botão volta a estar condicionado por feature flag
- Rota volta a estar condicionada por feature flag
- Usuários com flag desabilitada voltam a ver erro de navegação

### Tempo estimado: 2 minutos

## Lições Aprendidas

1. **Feature flags devem ser usadas apenas para features experimentais**, não para funcionalidades core
2. A página `TagsKanban` foi criada no boilerplate original e não deveria ter sido condicionada por feature flag
3. Sempre verificar o histórico de criação de um componente antes de adicionar feature flags

## Notas Adicionais

- A página `/tagsKanban` existe e está completa (frontend/src/pages/TagsKanban/index.js)
- Ela permite gerenciar tags/colunas do Kanban
- A funcionalidade faz parte do sistema core desde o início
- A feature flag `KANBAN_V2` pode ser removida do arquivo de configuração se não for usada em outro lugar
