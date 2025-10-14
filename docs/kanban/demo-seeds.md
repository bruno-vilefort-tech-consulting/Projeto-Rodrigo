# Seeds de Demonstração - Kanban

## Resumo

**Arquivo:** `/Users/brunovilefort/Desktop/chatia-final/chatia/backend/src/database/seeds/20251013000000-create-kanban-demo-tags.ts`

**Objetivo:** Criar tags Kanban de demonstração para facilitar testes e apresentações da funcionalidade.

**Status:** OPCIONAL (recomendado para desenvolvimento e demos)

---

## Descrição do Seed

### Tags Criadas

O seed cria 4 lanes Kanban padrão para a empresa de demonstração (`companyId = 1`):

| Lane | Nome | Cor | Ordem | Tempo | Descrição |
|------|------|-----|-------|-------|-----------|
| 1 | Novo | Azul (#3B82F6) | 0 | 0 min | Tickets recém-criados |
| 2 | Em Andamento | Amarelo (#F59E0B) | 1 | 30 min | Tickets sendo atendidos |
| 3 | Aguardando Cliente | Roxo (#8B5CF6) | 2 | 60 min | Aguardando resposta do cliente |
| 4 | Concluído | Verde (#10B981) | 3 | 0 min | Tickets finalizados |

### Fluxo Automático Configurado

```
┌─────────┐       ┌──────────────┐       ┌──────────────────┐       ┌───────────┐
│  Novo   │ ───>  │ Em Andamento │ ───>  │ Aguardando       │ ───>  │ Concluído │
│         │       │              │       │ Cliente          │       │           │
└─────────┘       └──────────────┘       └──────────────────┘       └───────────┘
    │                     ↑                        ↑                       ↑
    │                     │                        │                       │
    └─────────────────────┴────────────────────────┴───────────────────────┘
              rollbackLaneId (fluxo reverso se necessário)
```

**Campos Configurados:**

- **nextLaneId**: Próxima lane no fluxo sequencial
  - Novo → Em Andamento
  - Em Andamento → Aguardando Cliente
  - Aguardando Cliente → Concluído
  - Concluído → NULL (lane final)

- **rollbackLaneId**: Lane de retorno (se reabertura necessária)
  - Em Andamento → Novo
  - Aguardando Cliente → Em Andamento
  - Concluído → Em Andamento

- **timeLane**: Tempo para avanço automático
  - Novo: 0 min (manual)
  - Em Andamento: 30 min
  - Aguardando: 60 min
  - Concluído: 0 min (manual)

- **greetingMessageLane**: Mensagem automática ao entrar na lane
  - "Olá! Seu atendimento foi recebido..."
  - "Seu atendimento está em andamento..."
  - "Estamos aguardando seu retorno..."
  - "Seu atendimento foi concluído..."

---

## Como Executar o Seed

### Método 1: Via Sequelize CLI (Desenvolvimento)

```bash
# Navegar para diretório do backend
cd /Users/brunovilefort/Desktop/chatia-final/chatia/backend

# Executar seed específico
npx sequelize-cli db:seed --seed 20251013000000-create-kanban-demo-tags.ts

# Ou executar todos os seeds
npx sequelize-cli db:seed:all
```

**Output Esperado:**
```
🚀 Criando tags Kanban de demonstração para companyId=1...
✓ Tags Kanban criadas com sucesso!
✓ Fluxo de lanes configurado (nextLaneId e rollbackLaneId)
  Novo (1) → Em Andamento (2) → Aguardando (3) → Concluído (4)

╔════════════════════════════════════════════════════════════╗
║              TAGS KANBAN CRIADAS COM SUCESSO!              ║
╠════════════════════════════════════════════════════════════╣
║  Empresa: companyId = 1                                    ║
║  Lanes:                                                    ║
║    1. Novo (Azul)                                          ║
║    2. Em Andamento (Amarelo)                               ║
║    3. Aguardando Cliente (Roxo)                            ║
║    4. Concluído (Verde)                                    ║
║                                                            ║
║  Acesse: /kanban para visualizar o quadro!                 ║
╚════════════════════════════════════════════════════════════╝
```

### Método 2: Via npm Script (Recomendado)

```bash
# Adicionar script ao package.json
{
  "scripts": {
    "seed:kanban": "npx sequelize-cli db:seed --seed 20251013000000-create-kanban-demo-tags.ts"
  }
}

# Executar
npm run seed:kanban
```

### Método 3: Programaticamente (TypeScript)

```typescript
// src/database/seedRunner.ts
import { seedKanbanTags } from "./seeds/20251013000000-create-kanban-demo-tags";

async function runSeeds() {
  await seedKanbanTags.up(queryInterface);
  console.log("Seeds executados com sucesso!");
}

runSeeds();
```

---

## Idempotência (Segurança)

### O que é?

O seed é **idempotente**: pode ser executado múltiplas vezes sem duplicar dados.

### Como funciona?

**Verificações antes de inserir:**

1. **Empresa existe?**
   ```sql
   SELECT id FROM Companies WHERE id = 1
   ```
   - Se NÃO existe: pula criação (não gera erro)
   - Se existe: continua

2. **Já existem tags Kanban?**
   ```sql
   SELECT COUNT(*) FROM Tags WHERE companyId = 1 AND kanban IS NOT NULL
   ```
   - Se COUNT > 0: pula criação (não duplica)
   - Se COUNT = 0: cria tags

### Resultado

- **Primeira execução:** Cria 4 tags Kanban
- **Segunda execução:** Mensagem "Já existem X tags Kanban, pulando criação"
- **Terceira execução:** Mesma mensagem (sem efeitos colaterais)

**Seguro para:** Ambientes de desenvolvimento, CI/CD, testes automatizados

---

## Rollback (Reverter Seed)

### Como reverter?

```bash
# Reverter APENAS este seed
npx sequelize-cli db:seed:undo --seed 20251013000000-create-kanban-demo-tags.ts

# Reverter TODOS os seeds
npx sequelize-cli db:seed:undo:all
```

### O que é removido?

**Critério de remoção:**
```sql
DELETE FROM Tags
WHERE companyId = 1
  AND kanban IS NOT NULL
  AND name IN ('Novo', 'Em Andamento', 'Aguardando Cliente', 'Concluído');
```

**Segurança:**
- Remove APENAS tags criadas por este seed (nomes específicos)
- NÃO remove tags Kanban criadas manualmente por usuários
- NÃO remove tags de outras empresas (filtro `companyId = 1`)

**Efeitos Cascata:**
- `TicketTags` associados são removidos automaticamente via `ON DELETE CASCADE`
- `Tickets` NÃO são removidos (apenas perdem a tag)

---

## Customização do Seed

### Alterar Empresa de Demonstração

**Trocar `companyId = 1` por `companyId = X`:**

```typescript
// Linha 45-48 e outras referências
const companyExists = await queryInterface.rawSelect(
  "Companies",
  { where: { id: 2 } }, // <<<< Alterar aqui
  ["id"],
  { transaction: t }
);
```

**Buscar por:** `companyId: 1` no arquivo e substituir por ID desejado

### Alterar Cores das Lanes

```typescript
{
  name: "Novo",
  color: "#FF0000", // <<<< Vermelho ao invés de azul
  // ...
}
```

**Cores sugeridas:**
- Azul: `#3B82F6` (padrão "Novo")
- Verde: `#10B981` (padrão "Concluído")
- Amarelo: `#F59E0B` (padrão "Em Andamento")
- Roxo: `#8B5CF6` (padrão "Aguardando")
- Vermelho: `#EF4444` (urgente)
- Cinza: `#6B7280` (pausado)

### Adicionar Lane Extra

```typescript
{
  name: "Pausado",
  color: "#6B7280", // Cinza
  kanban: 2, // Inserir entre "Em Andamento" e "Aguardando"
  timeLane: 0, // Sem avanço automático
  nextLaneId: null, // Configurar manualmente após inserção
  greetingMessageLane: "Seu atendimento está temporariamente pausado.",
  rollbackLaneId: null,
  companyId: 1,
  createdAt: new Date(),
  updatedAt: new Date(),
}
```

**IMPORTANTE:** Atualizar ordem (`kanban`) das lanes seguintes!

### Alterar Mensagens de Greeting

```typescript
{
  name: "Novo",
  greetingMessageLane: "Bem-vindo! Sua solicitação foi registrada com sucesso.", // <<<< Customizar aqui
  // ...
}
```

**Variáveis disponíveis (se implementadas no backend):**
- `{{contactName}}` - Nome do cliente
- `{{ticketId}}` - Número do ticket
- `{{queueName}}` - Nome da fila

---

## Uso em Produção

### Cenário 1: Deploy Inicial (Primeira Empresa)

**Recomendação:** EXECUTAR seed para facilitar onboarding

```bash
# Após deploy
npm run seed:kanban
```

**Benefícios:**
- Empresa já vê funcionalidade configurada
- Reduz fricção no setup inicial
- Demonstra valor da feature imediatamente

### Cenário 2: Empresas Existentes

**Recomendação:** NÃO EXECUTAR automaticamente

**Motivos:**
- Empresas podem já ter configurado lanes próprias
- Seed duplicaria configurações
- Risco de confusão com tags existentes

**Alternativa:** Documentar no guia de onboarding como criar lanes manualmente

### Cenário 3: Multi-Tenant com Auto-Provisioning

**Recomendação:** Criar seed DINÂMICO para cada nova empresa

```typescript
// src/services/CompanyService.ts
async function createCompany(data) {
  const company = await Company.create(data);

  // Auto-criar lanes Kanban padrão
  await createDefaultKanbanLanes(company.id);

  return company;
}

async function createDefaultKanbanLanes(companyId: number) {
  const lanes = [
    { name: "Novo", color: "#3B82F6", kanban: 0, companyId },
    { name: "Em Andamento", color: "#F59E0B", kanban: 1, companyId },
    { name: "Aguardando", color: "#8B5CF6", kanban: 2, companyId },
    { name: "Concluído", color: "#10B981", kanban: 3, companyId },
  ];

  await Tag.bulkCreate(lanes);
  console.log(`✓ Lanes Kanban criadas para empresa ${companyId}`);
}
```

---

## Integração com Testes

### Jest/Mocha - Setup de Testes

```typescript
// tests/setup.ts
import { seedKanbanTags } from "../database/seeds/20251013000000-create-kanban-demo-tags";

beforeAll(async () => {
  await sequelize.sync({ force: true }); // Reset DB
  await seedKanbanTags.up(queryInterface); // Criar lanes
});

afterAll(async () => {
  await seedKanbanTags.down(queryInterface); // Limpar
  await sequelize.close();
});
```

### Cypress - E2E Tests

```typescript
// cypress/support/commands.ts
Cypress.Commands.add("seedKanbanTags", () => {
  cy.exec("npm run seed:kanban");
});

// cypress/e2e/kanban.cy.ts
describe("Kanban Board", () => {
  before(() => {
    cy.seedKanbanTags();
  });

  it("should display 4 lanes", () => {
    cy.visit("/kanban");
    cy.get(".kanban-lane").should("have.length", 4);
  });
});
```

---

## Troubleshooting

### Problema 1: "Company id=1 não existe"

**Causa:** Empresa padrão não foi criada

**Solução:**
```bash
# Executar seed de empresa primeiro
npx sequelize-cli db:seed --seed 20200904070003-create-default-company.ts

# Depois executar seed Kanban
npx sequelize-cli db:seed --seed 20251013000000-create-kanban-demo-tags.ts
```

### Problema 2: "Já existem X tags Kanban"

**Causa:** Seed já foi executado anteriormente

**Solução (se quiser recriar):**
```bash
# Reverter seed
npx sequelize-cli db:seed:undo --seed 20251013000000-create-kanban-demo-tags.ts

# Executar novamente
npx sequelize-cli db:seed --seed 20251013000000-create-kanban-demo-tags.ts
```

### Problema 3: "foreign key constraint fails"

**Causa:** Relacionamentos (nextLaneId, rollbackLaneId) apontam para IDs inexistentes

**Solução:** Verificar lógica de atualização de IDs após inserção:
```typescript
// Código deve buscar IDs reais após inserção
const tagsCreated = await queryInterface.sequelize.query(
  `SELECT id, name FROM Tags WHERE companyId = 1 AND kanban IS NOT NULL`
);
```

### Problema 4: Seed não aparece na listagem

**Causa:** Arquivo não está em `backend/src/database/seeds/`

**Solução:**
```bash
# Verificar localização
ls backend/src/database/seeds/20251013000000*

# Mover se necessário
mv arquivo.ts backend/src/database/seeds/
```

---

## Checklist de Validação

Após executar o seed, validar:

- [ ] **Tabela Tags possui 4 registros novos**
  ```sql
  SELECT name, color, kanban, companyId FROM Tags
  WHERE companyId = 1 AND kanban IS NOT NULL
  ORDER BY kanban;
  ```

- [ ] **Cores estão corretas**
  - Novo: Azul (#3B82F6)
  - Em Andamento: Amarelo (#F59E0B)
  - Aguardando: Roxo (#8B5CF6)
  - Concluído: Verde (#10B981)

- [ ] **Fluxo configurado (nextLaneId)**
  ```sql
  SELECT t1.name AS current_lane, t2.name AS next_lane
  FROM Tags t1
  LEFT JOIN Tags t2 ON t1.nextLaneId = t2.id
  WHERE t1.companyId = 1 AND t1.kanban IS NOT NULL
  ORDER BY t1.kanban;
  ```

- [ ] **Rollback configurado (rollbackLaneId)**
  ```sql
  SELECT t1.name AS current_lane, t2.name AS rollback_lane
  FROM Tags t1
  LEFT JOIN Tags t2 ON t1.rollbackLaneId = t2.id
  WHERE t1.companyId = 1 AND t1.kanban IS NOT NULL
  ORDER BY t1.kanban;
  ```

- [ ] **Interface Kanban exibe lanes**
  - Acessar: `http://localhost:3000/kanban`
  - Verificar 4 colunas visíveis
  - Testar drag-and-drop de tickets

---

## Próximos Passos

1. **Após criar lanes de demonstração:**
   - [ ] Criar alguns tickets de teste
   - [ ] Associar tickets às lanes via interface
   - [ ] Testar drag-and-drop entre lanes
   - [ ] Validar mensagens de greeting

2. **Para produção:**
   - [ ] Decidir se seed será executado automaticamente ou manualmente
   - [ ] Documentar processo de criação de lanes no guia de onboarding
   - [ ] Criar feature flag para habilitar/desabilitar Kanban por empresa

3. **Para personalização:**
   - [ ] Implementar interface para customizar cores das lanes
   - [ ] Permitir edição de mensagens de greeting via admin
   - [ ] Adicionar suporte a lanes ilimitadas (não apenas 4)

---

## Referências

- **Arquivo do Seed:** `/Users/brunovilefort/Desktop/chatia-final/chatia/backend/src/database/seeds/20251013000000-create-kanban-demo-tags.ts`
- **Schema de Tags:** `/Users/brunovilefort/Desktop/chatia-final/chatia/docs/kanban/database-schema.md`
- **Validação de Schema:** `/Users/brunovilefort/Desktop/chatia-final/chatia/docs/kanban/schema-validation.md`
- **Modelo Tag:** `/Users/brunovilefort/Desktop/chatia-final/chatia/backend/src/models/Tag.ts`

---

**Documento criado em:** 2025-10-13
**Autor:** db-schema-architect (Claude Code)
**Versão:** 1.0
**Status:** SEED CRIADO - Pronto para uso
