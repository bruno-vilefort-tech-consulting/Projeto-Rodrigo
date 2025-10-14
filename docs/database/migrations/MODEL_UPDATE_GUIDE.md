# Guia de Atualização: Model Company.ts

**Data**: 2025-10-13
**Relacionado a**: Migrations `20251013170000` e `20251013170001`
**Status**: Action Required após migrations

---

## Objetivo

Após executar as migrations que normalizam o campo `document` e aplicam UNIQUE constraint parcial, o model Sequelize `Company.ts` DEVE ser atualizado para refletir as mudanças no schema do banco de dados.

---

## Mudança Necessária

### Arquivo

`/Users/brunovilefort/Desktop/chatia-final/chatia/backend/src/models/Company.ts`

### Localização

**Linhas 46-47** (aproximadamente)

### Código Atual (ANTES)

```typescript
@Column({ defaultValue: "" })
document: string;
```

### Código Atualizado (DEPOIS)

```typescript
@Column({
  type: DataTypes.STRING(255),
  allowNull: true,
  defaultValue: null
})
document: string | null;
```

---

## Explicação das Mudanças

### 1. `type: DataTypes.STRING(255)`

**Adicionado explicitamente para documentação**
- Antes: Tipo inferido pelo Sequelize (STRING por padrão)
- Depois: Explicitamente documentado com tamanho máximo
- **Motivo**: Melhor documentação e consistência com outros campos

### 2. `allowNull: true`

**Mudança CRÍTICA**
- Antes: `allowNull` não especificado (default: false, mas não validado)
- Depois: `allowNull: true` explicitamente configurado
- **Motivo**: Campo `document` é OPCIONAL. Empresas podem não ter CPF/CNPJ informado.
- **Impacto**: Sequelize agora aceita `NULL` sem erros de validação

### 3. `defaultValue: null`

**Mudança de comportamento**
- Antes: `defaultValue: ""`
- Depois: `defaultValue: null`
- **Motivo**: `NULL` é semanticamente correto para "não informado". String vazia (`""`) é um hack.
- **Impacto**: Novos registros sem `document` terão `NULL` ao invés de `""`

### 4. `document: string | null`

**Mudança de tipo TypeScript**
- Antes: `document: string`
- Depois: `document: string | null`
- **Motivo**: TypeScript agora sabe que `document` pode ser `null`, ativando verificações de null-safety
- **Impacto**: Código TypeScript que acessa `company.document` agora requer null checks:
  ```typescript
  // Antes (unsafe)
  const doc = company.document.trim(); // Pode quebrar se null

  // Depois (safe)
  const doc = company.document?.trim() ?? '';
  ```

---

## Impacto no Código Existente

### Backend Services

Código existente que manipula `document` pode precisar de ajustes:

#### CreateCompanyService.ts

```typescript
// Antes
const company = await Company.create({
  name,
  email,
  document: data.document || '' // String vazia como fallback
});

// Depois (recomendado)
const company = await Company.create({
  name,
  email,
  document: data.document || null // NULL como fallback
});
```

#### UpdateCompanyService.ts

```typescript
// Antes
companyData.document = document || '';

// Depois (recomendado)
companyData.document = document || null;
```

### Queries Sequelize

Queries que filtram por `document` vazio devem ser atualizadas:

```typescript
// Antes (buscar empresas sem documento)
const companies = await Company.findAll({
  where: { document: '' }
});

// Depois
const companies = await Company.findAll({
  where: { document: null }
});
```

### Frontend (se aplicável)

Se o frontend recebe o campo `document` da API:

```javascript
// Antes
const documentDisplay = company.document || 'Não informado';

// Depois (mesmo comportamento, mas mais explícito)
const documentDisplay = company.document ?? 'Não informado';
```

---

## Compatibilidade com Migrations

### Timeline de Mudanças

1. **Antes das Migrations**:
   - Model: `document: string`, `defaultValue: ""`
   - Database: `document VARCHAR(255) DEFAULT ''`
   - Comportamento: Strings vazias são salvos como `''`

2. **Após Migration 1** (normalize):
   - Model: Ainda não atualizado (mas tolerante)
   - Database: Strings vazias convertidos para `NULL`
   - Comportamento: Registros existentes têm `NULL`, novos ainda podem criar `''`

3. **Após Migration 2** (UNIQUE):
   - Model: Ainda não atualizado
   - Database: UNIQUE constraint ativo (permite múltiplos NULL)
   - Comportamento: `''` e `NULL` coexistem (inconsistente)

4. **Após atualização do Model** (este guia):
   - Model: `document: string | null`, `defaultValue: null`
   - Database: UNIQUE constraint ativo
   - Comportamento: Apenas `NULL` para valores vazios (consistente)

**IMPORTANTE**: Atualizar o model APÓS as migrations garante que:
- Migrations executam sem conflitos de validação do Sequelize
- Novos registros seguem o padrão correto (`NULL` ao invés de `''`)

---

## Testes Necessários

Após atualizar o model, execute:

### 1. Testes Unitários do Model

```bash
npm test -- Company.test.ts
```

Adicionar testes específicos:

```typescript
describe('Company Model - document field', () => {
  it('should allow null document', async () => {
    const company = await Company.create({
      name: 'Test Company',
      email: 'test@example.com',
      document: null
    });
    expect(company.document).toBeNull();
  });

  it('should default to null when document not provided', async () => {
    const company = await Company.create({
      name: 'Test Company 2',
      email: 'test2@example.com'
      // document não fornecido
    });
    expect(company.document).toBeNull();
  });

  it('should accept valid document string', async () => {
    const company = await Company.create({
      name: 'Test Company 3',
      email: 'test3@example.com',
      document: '12345678900'
    });
    expect(company.document).toBe('12345678900');
  });

  it('should reject duplicate documents', async () => {
    await Company.create({
      name: 'Company A',
      email: 'a@example.com',
      document: '11111111111'
    });

    await expect(
      Company.create({
        name: 'Company B',
        email: 'b@example.com',
        document: '11111111111'
      })
    ).rejects.toThrow(/unique constraint/i);
  });
});
```

### 2. Testes de Integração

```bash
npm test -- CreateCompanyService.test.ts
npm test -- UpdateCompanyService.test.ts
```

Validar que:
- Criar empresa sem documento funciona (document = null)
- Criar empresa com documento único funciona
- Criar empresa com documento duplicado retorna erro apropriado

### 3. Testes End-to-End

```bash
npm run test:e2e -- companies
```

Validar fluxo completo via API.

---

## Checklist de Atualização

- [ ] Backup do arquivo `Company.ts` criado
- [ ] Model atualizado conforme especificação acima
- [ ] TypeScript compila sem erros (`npm run build`)
- [ ] Testes unitários do model passando
- [ ] Testes de integração dos services passando
- [ ] Código que manipula `document` revisado para null-safety
- [ ] Queries que filtram por `document = ''` atualizadas para `document = null`
- [ ] Frontend atualizado para tratar `null` (se aplicável)
- [ ] Testes E2E passando
- [ ] Deploy em staging e validação manual

---

## Rollback (se necessário)

Se a atualização do model causar problemas:

### Reverter Model

```typescript
// Voltar para versão anterior
@Column({ defaultValue: "" })
document: string;
```

### Reverter Migrations

```bash
npm run sequelize db:migrate:undo
npm run sequelize db:migrate:undo
```

**IMPORTANTE**: Rollback do model sem rollback das migrations causará inconsistência:
- Database terá valores `NULL`
- Model esperará strings vazias `""`
- Podem ocorrer erros de validação

**Recomendação**: Se precisar reverter model, reverta também as migrations.

---

## Exemplo Completo de Atualização

### Arquivo: `backend/src/models/Company.ts`

```typescript
import {
  Table,
  Column,
  CreatedAt,
  UpdatedAt,
  Model,
  PrimaryKey,
  AutoIncrement,
  ForeignKey,
  BelongsTo,
  DataType,
  HasMany,
  AfterCreate
} from "sequelize-typescript";
import Contact from "./Contact";
import Message from "./Message";
import Plan from "./Plan";
import Queue from "./Queue";
import Setting from "./Setting";
import Ticket from "./Ticket";
import TicketTraking from "./TicketTraking";
import User from "./User";
import UserRating from "./UserRating";
import Whatsapp from "./Whatsapp";
import CompaniesSettings from "./CompaniesSettings";
import Invoices from "./Invoices";
import logger from "../utils/logger";

@Table
class Company extends Model<Company> {
  @PrimaryKey
  @AutoIncrement
  @Column
  id: number;

  @Column
  name: string;

  @Column
  phone: string;

  @Column
  email: string;

  // ========================================
  // CAMPO ATUALIZADO (após migrations)
  // ========================================
  @Column({
    type: DataTypes.STRING(255),
    allowNull: true,
    defaultValue: null,
    comment: "CPF ou CNPJ da empresa (opcional). UNIQUE quando não NULL (índice idx_companies_document_unique)."
  })
  document: string | null;
  // ========================================

  @Column({ defaultValue: "" })
  paymentMethod: string;

  @Column
  lastLogin: Date;

  @Column
  status: boolean;

  @Column
  dueDate: string;

  @Column
  recurrence: string;

  @Column({
    type: DataType.JSONB
  })
  schedules: [];

  @Column({
    allowNull: true,
    comment: "Company specific timezone (e.g., America/Sao_Paulo, America/New_York)"
  })
  timezone: string;

  @ForeignKey(() => Plan)
  @Column
  planId: number;

  @BelongsTo(() => Plan)
  plan: Plan;

  @CreatedAt
  createdAt: Date;

  @UpdatedAt
  updatedAt: Date;

  @Column
  folderSize: string;

  @Column
  numberFileFolder: string;

  @Column
  updatedAtFolder: string;

  @HasMany(() => User, {
    onUpdate: "CASCADE",
    onDelete: "CASCADE",
    hooks: true
  })
  users: User[];

  // ... restante do model inalterado
}

export default Company;
```

---

## Suporte

Em caso de dúvidas ou problemas durante a atualização:

1. Consultar documentação completa: `docs/database/migrations/COMPANIES_DOCUMENT_UNIQUE.md`
2. Executar script de teste: `backend/src/database/migrations/scripts/test-document-unique.sql`
3. Revisar ADR: `docs/architecture/ADR-2025-10-13-companies-document-optional.md`
4. Contatar: Database Architect ou Backend Lead

---

**Fim do Guia**
