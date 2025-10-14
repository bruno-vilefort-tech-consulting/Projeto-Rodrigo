# Bug Report: BUG-2025-10-14-001

## Informações Básicas

**ID:** BUG-2025-10-14-001
**Severidade:** MEDIUM 🟡
**Status:** OPEN
**Reportado em:** 2025-10-14
**Módulo:** Frontend - Kanban
**Tipo:** Navigation / Feature Flag

## Descrição

Na página `/kanban`, ao clicar no botão "Adicionar Colunas", o usuário é direcionado para a página `/tagsKanban` que não existe ou não tem conteúdo.

## Passos para Reproduzir

1. Acessar a aplicação ChatIA Flow
2. Navegar para `/kanban`
3. Clicar no botão "Adicionar Colunas" (localizado no header da página)
4. Observar que a navegação vai para `/tagsKanban`
5. A página aparece vazia ou retorna 404

## Comportamento Esperado

- O botão "Adicionar Colunas" deveria ser exibido apenas quando a feature flag `KANBAN_V2` está habilitada
- OU a rota `/tagsKanban` deveria sempre estar disponível
- OU deveria haver validação antes da navegação

## Comportamento Atual

- O botão "Adicionar Colunas" está sempre visível
- Ao clicar, navega para `/tagsKanban` sem verificar se a rota existe
- A rota `/tagsKanban` só é registrada quando `FEATURES.KANBAN_V2 === true`
- Quando a feature flag está desabilitada, resulta em página 404/vazia

## Arquivos Afetados

1. **frontend/src/pages/Kanban/index.js:253**
   - Função: `handleAddConnectionClick()`
   - Problema: Navega sem verificar feature flag

2. **frontend/src/routes/index.js:122-124**
   - Rota condicionada por `FEATURES.KANBAN_V2`

3. **frontend/src/config/featureFlags.js:15**
   - Definição da feature flag `KANBAN_V2`

## Logs/Stack Traces

```
Não há erros no console.
A navegação acontece normalmente, mas a rota não está registrada.
```

## Ambiente

- Versão: v2.2.2v-26
- Browser: Todos
- Node: 16.20.0
- React: 17.0.2
- Feature Flag: `REACT_APP_FEATURE_KANBAN_V2` (pode estar undefined ou 'false')

## Análise Técnica

### Causa Raiz

Inconsistência entre UI (botão sempre visível) e rota (condicionada por feature flag).

### Código Problemático

```javascript
// frontend/src/pages/Kanban/index.js:252-254
const handleAddConnectionClick = () => {
  history.push('/tagsKanban');
};
```

```javascript
// frontend/src/routes/index.js:122-124
{FEATURES.KANBAN_V2 && (
  <Route exact path="/tagsKanban" component={TagsKanban} isPrivate />
)}
```

### Impacto

- **Usuários afetados:** Todos que tentam adicionar colunas no Kanban com feature flag desabilitada
- **Funcionalidades impactadas:** Gerenciamento de colunas/tags do Kanban
- **Camadas afetadas:** Frontend (routing e navegação)
- **Multi-tenant:** Não afeta isolamento
- **Dados corrompidos:** Não

## Soluções Propostas

### Opção 1: Condicionar o Botão (RECOMENDADA)
Mostrar o botão "Adicionar Colunas" apenas quando `FEATURES.KANBAN_V2` está habilitada.

**Prós:**
- Consistente com feature flag
- Não confunde o usuário
- Mínima alteração

**Contras:**
- Funcionalidade fica oculta quando flag desabilitada

### Opção 2: Remover Feature Flag
Remover a condicional da rota e sempre registrar `/tagsKanban`.

**Prós:**
- Funcionalidade sempre disponível
- Remove complexidade de feature flag

**Contras:**
- Pode não ser desejado se a feature ainda está em desenvolvimento

### Opção 3: Validação na Navegação
Adicionar validação antes de navegar.

**Prós:**
- Mais robusto
- Pode mostrar mensagem ao usuário

**Contras:**
- Mais complexo
- Ainda confunde usuário (botão visível mas não funciona)

## Prioridade

**MEDIUM** - Funcionalidade secundária quebrada, mas não afeta operação crítica do sistema.

## Notas Adicionais

- A página `/tagsKanban` existe e está completa (frontend/src/pages/TagsKanban/index.js)
- Ela permite gerenciar tags/colunas do Kanban
- O problema é puramente de roteamento e feature flag
