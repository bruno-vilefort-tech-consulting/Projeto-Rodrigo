# ADR: Campo `document` Opcional com Validação Condicional

**Data**: 2025-10-13
**Status**: Proposta
**Deciders**: Equipe de Arquitetura ChatIA Flow
**Technical Story**: Tornar o campo `document` (CPF/CNPJ) opcional com validação condicional e suporte a múltiplos valores NULL

---

## Contexto e Problema

### Situação Atual

O sistema ChatIA Flow possui um campo `document` na tabela `Companies` que armazena CPF ou CNPJ das empresas cadastradas. Atualmente:

1. **Backend (Model)**: Campo definido como `string` com `defaultValue: ""` em `Company.ts:47`
2. **Backend (Migrations)**: Criado sem constraint UNIQUE na migration `20221227164300-add-colunms-document-and-paymentMethod-to-companies-table.ts`
3. **Backend (Services)**:
   - `CreateCompanyService.ts`: NÃO valida o campo `document` (apenas valida `name`)
   - `UpdateCompanyService.ts`: Aceita `document` mas não valida formato ou unicidade
4. **Backend (Controller)**: `CompanyController.ts:45` aceita `document` no tipo `CompanyData`, mas sem schema Yup
5. **Database (Índices)**: Migration `20251013140000-add-search-indexes-companies.ts` criou índice GIN trigram para busca textual no campo
6. **Frontend (Componentes)**:
   - `CompaniesManager/index.js:305-310`: Exibe campo sem validações, máscaras ou formatação
   - `CompaniesManager/index.js:669`: Carrega `document` ao selecionar empresa
   - `Companies/index.js:122`: Usa `document` em filtro de busca client-side
   - `CompaniesModal/index.js`: Não inclui campo `document` (modal simplificado)
7. **Frontend (Traduções)**: Existe `"CPF/CNPJ*"` em `pt.js:2952` mas não é usado no `CompaniesManager`

### Problemas Identificados

1. **Falta de validação**: Nenhuma validação de formato CPF/CNPJ no backend ou frontend
2. **Falta de normalização**: Campo aceita qualquer string (com pontuação ou vazio)
3. **Ausência de UNIQUE constraint**: Permite duplicatas, comprometendo integridade de dados fiscais
4. **UX inconsistente**: Campo sem máscara, sem indicação de opcional/obrigatório
5. **Busca frágil**: Busca textual não normalizada pode falhar com variações de formatação
6. **Strings vazias vs NULL**: `defaultValue: ""` cria inconsistência semântica (vazio deveria ser NULL)

### Requisitos da Feature

1. **Feature Flag**: `FEATURE_COMPANY_DOCUMENT_OPTIONAL` (boolean, padrão: `true`)
   - `true`: Campo opcional, validação condicional ativa
   - `false`: Comportamento atual (sem validações, retrocompatível)
2. **Validação condicional**: Quando informado, validar CPF OU CNPJ usando algoritmos da Receita Federal
3. **Normalização**: Remover `.`, `-`, `/` antes de salvar; converter vazio para `NULL`
4. **UNIQUE constraint**: Índice parcial PostgreSQL `WHERE document IS NOT NULL` (permite múltiplos NULL)
5. **Frontend UX**:
   - Máscaras condicionais: CPF (999.999.999-99) ou CNPJ (99.999.999/9999-99)
   - Label: "CPF/CNPJ (opcional)"
   - Exibição: Mostrar "Não informado" quando NULL
6. **Zero breaking changes**: Flag OFF preserva comportamento atual

---

## Análise de Impacto

### Backend

#### Models
**Arquivo**: `backend/src/models/Company.ts`
- **Linha 46-47**: Alterar `document` para `allowNull: true`, remover `defaultValue: ""`
- **Impacto**: Sequelize passará a aceitar `NULL` e não forçará string vazia
- **Breaking Change**: Não (código existente continua funcionando)

#### Migrations
**Arquivos a criar**:
1. `backend/src/database/migrations/20251013150000-normalize-company-documents.ts`
   - **Função**: Limpeza de dados (converter `''` para `NULL`, remover duplicatas)
   - **Dependências**: Requer análise manual de duplicatas antes de aplicar UNIQUE
   - **Rollback**: Restaurar strings vazias
2. `backend/src/database/migrations/20251013150001-add-unique-constraint-company-document.ts`
   - **Função**: Criar índice parcial `WHERE document IS NOT NULL`
   - **Impacto em performance**: Índice adicional ~2-5% do tamanho da tabela
   - **Rollback**: Drop index

**Arquivos a modificar**:
- Migration `20251013140000-add-search-indexes-companies.ts` já cobre índice de busca

#### Services
**Arquivo**: `backend/src/services/CompanyService/CreateCompanyService.ts`
- **Linha 39-43**: Expandir schema Yup para incluir validação condicional de `document`
- **Linha 62**: Normalizar `document` antes de `Company.create()`
- **Lógica**:
  ```typescript
  // Pseudo-código
  if (document && document.trim() !== '') {
    const normalized = normalizeDocument(document);
    const isValid = validateCPFOrCNPJ(normalized);
    if (!isValid) throw new AppError('ERR_INVALID_DOCUMENT');
    companyData.document = normalized;
  } else {
    companyData.document = null;
  }
  ```
- **Impacto**: Adiciona ~50ms de overhead por criação (validação algorítmica)

**Arquivo**: `backend/src/services/CompanyService/UpdateCompanyService.ts`
- **Linha 69-79**: Adicionar mesma lógica de normalização e validação
- **Edge case**: Se `document` existente é NULL e update envia `""`, converter para NULL
- **Impacto**: Mesma latência de validação

#### Helpers
**Arquivos a criar**:
1. `backend/src/helpers/DocumentValidator.ts`
   - **Funções**:
     - `normalizeDocument(doc: string): string` - Remove pontuação
     - `validateCPF(cpf: string): boolean` - Algoritmo Receita Federal
     - `validateCNPJ(cnpj: string): boolean` - Algoritmo Receita Federal
     - `validateCPFOrCNPJ(doc: string): boolean` - Detecta tipo e valida
   - **Testes**: Cobertura 100% com casos edge (todos zeros, sequências repetidas)
   - **Referência**: [Algoritmos oficiais Receita Federal](https://www.receita.fazenda.gov.br/)

#### Controllers
**Arquivo**: `backend/src/controllers/CompanyController.ts`
- **Linha 97-106**: Adicionar validação Yup no endpoint `store`:
  ```typescript
  const schema = Yup.object().shape({
    name: Yup.string().required(),
    password: Yup.string().required().min(5),
    document: Yup.string().nullable().transform((v) => v || null)
  });
  ```
- **Linha 167-175**: Adicionar validação Yup no endpoint `update` (mesma lógica)
- **Impacto**: Validação prévia antes de chegar ao service (fail-fast)

### Frontend

#### Componentes
**Arquivo**: `frontend/src/components/CompaniesManager/index.js`
- **Linha 83-94**: Adicionar `document: ""` ao estado inicial
- **Linha 305-310**: Modificar campo `document`:
  - Adicionar `InputMask` do `react-input-mask`
  - Máscara condicional baseada em comprimento (CPF 11 dígitos, CNPJ 14)
  - Label: `i18n.t("compaies.table.documentOptional")`
  - Adicionar helper text com validação em tempo real
- **Linha 551-563**: Já possui `document: ""` no estado
- **Linha 573**: Filtro de busca já inclui `document` (sem mudanças)
- **Linha 669**: Ao carregar empresa, tratar NULL: `document: data.document || ""`
- **Impacto**: Adiciona dependência `react-input-mask` (~15KB gzipped)

**Arquivo**: `frontend/src/components/CompaniesManager/index.js` (Grid)
- **Linha 440-540**: Adicionar coluna `document` na tabela (opcional)
- **Função helper**: `renderDocument(row)` - Exibir formatado ou "Não informado"

**Arquivo**: `frontend/src/components/CompaniesModal/index.js`
- **Linha 66-77**: Adicionar validação Yup condicional:
  ```javascript
  document: Yup.string()
    .nullable()
    .test('cpf-cnpj', 'CPF/CNPJ inválido', (value) => {
      if (!value) return true; // Opcional
      const normalized = normalizeDocument(value);
      return validateCPFOrCNPJ(normalized);
    })
  ```
- **Linha 82-89**: Adicionar `document: ""` ao estado inicial
- **Linha 170+**: Adicionar Field com InputMask (após campo `email`)
- **Impacto**: Modal mantém simplicidade, adiciona apenas 1 campo

#### Hooks
**Arquivo**: `frontend/src/hooks/useCompanies/index.js`
- **Linha 5-11**: Função `save` já envia `data` completo (sem mudanças)
- **Linha 38-45**: Função `update` já envia `data` completo (sem mudanças)
- **Observação**: Normalização no frontend é opcional (backend garante integridade)

#### Helpers/Utils
**Arquivos a criar**:
1. `frontend/src/utils/documentValidator.js`
   - **Funções**: Mesmas do backend (normalizeDocument, validateCPF, validateCNPJ, validateCPFOrCNPJ)
   - **Propósito**: Validação client-side em tempo real (UX)
   - **DRY**: Duplicação justificada (frontend/backend isolados)
2. `frontend/src/utils/documentMask.js`
   - **Função**: `getDocumentMask(value: string): string` - Retorna máscara CPF ou CNPJ baseado em comprimento
   - **Integração**: Usado com `react-input-mask`

#### Traduções
**Arquivos a modificar**:
1. `frontend/src/translate/languages/pt.js`
   - **Linha 196**: Já existe `document: "CPF/CNPJ:"`
   - **Adicionar**:
     - `documentOptional: "CPF/CNPJ (opcional)"`
     - `documentNotInformed: "Não informado"`
     - `documentInvalid: "CPF/CNPJ inválido"`
     - `documentDuplicate: "CPF/CNPJ já cadastrado"`
2. Replicar para `en.js`, `es.js`, `tr.js`, `ar.js` (traduções correspondentes)

### Database

#### Schema Changes
**Tabela**: `Companies`
- **Campo**: `document`
  - **Antes**: `VARCHAR(255) DEFAULT ''`
  - **Depois**: `VARCHAR(255) DEFAULT NULL`
  - **Constraint**: `UNIQUE (document) WHERE document IS NOT NULL` (índice parcial)
  - **Índice existente**: `idx_companies_document_trgm` (GIN trigram) mantido para busca

#### Data Migration
**Script de limpeza** (parte da migration `20251013150000-normalize-company-documents.ts`):
```sql
-- 1. Converter strings vazias para NULL
UPDATE "Companies" SET document = NULL WHERE document = '' OR document IS NULL OR trim(document) = '';

-- 2. Identificar duplicatas (antes do UNIQUE)
SELECT document, COUNT(*) as count
FROM "Companies"
WHERE document IS NOT NULL
GROUP BY document
HAVING COUNT(*) > 1;

-- 3. Estratégia para duplicatas (manual ou automática):
--    Opção A: Manter mais antiga, nullificar outras
--    Opção B: Manter com lastLogin mais recente
--    Opção C: Rejeitar migration e exigir correção manual
```

#### Performance Impact
- **Índice UNIQUE parcial**: ~2-5% do tamanho da tabela (estimado: 1MB para 10K empresas)
- **Índice GIN trigram existente**: Sem alterações
- **Query performance**:
  - INSERT/UPDATE com validação: +2-5ms (constraint check)
  - SELECT por document: ~0.1ms (índice UNIQUE otimiza busca)

### Busca

#### Backend Search
**Arquivo**: `backend/src/services/CompanyService/ListCompaniesService.ts`
- **Presumido** (não analisado): Busca usa índice GIN trigram
- **Mudança necessária**: Garantir que busca funcione com NULL:
  ```sql
  WHERE document IS NOT NULL AND document ILIKE '%search%'
  ```

#### Frontend Search
**Arquivo**: `frontend/src/components/CompaniesManager/index.js`
- **Linha 566-576**: Filtro client-side já inclui `document`
- **Linha 573**: `company.document?.includes(term)` já trata NULL com optional chaining
- **Impacto**: Sem mudanças necessárias

**Arquivo**: `frontend/src/pages/Companies/index.js`
- **Linha 115-125**: Filtro client-side já inclui `document`
- **Linha 122**: `company.document?.includes(term)` já trata NULL com optional chaining
- **Impacto**: Sem mudanças necessárias

---

## Decisões

### Decisão 1: Validação Backend e Frontend (Dual Validation)

**Escolha**: Implementar validação CPF/CNPJ em ambos backend (obrigatória) e frontend (UX)

**Alternativas consideradas**:
1. **Apenas Backend**
   - **Prós**: Single source of truth, menos código duplicado
   - **Contras**: UX ruim (usuário só descobre erro após submit), aumenta latência percebida
2. **Apenas Frontend**
   - **Prós**: Feedback instantâneo, sem overhead backend
   - **Contras**: Vulnerável a bypass (Postman/curl), não garante integridade
3. **Dual Validation (escolhida)**
   - **Prós**: Melhor UX (feedback imediato) + segurança (backend valida sempre)
   - **Contras**: Código duplicado, precisa manter sincronia entre validações

**Justificativa**: Dados fiscais (CPF/CNPJ) são críticos e não podem ser bypassados. Validação frontend melhora UX sem comprometer segurança.

**Trade-offs**:
- **Manutenibilidade**: Requer manter 2 implementações (TypeScript backend, JavaScript frontend)
- **Consistência**: Testes devem garantir que ambas implementações retornem resultados idênticos
- **Performance**: Validação frontend é instantânea, backend adiciona ~50ms mas é imperceptível

---

### Decisão 2: Normalização Dual (Frontend e Backend)

**Escolha**: Normalizar documento em ambos frontend (UX) e backend (persistência)

**Alternativas consideradas**:
1. **Apenas Frontend**
   - **Prós**: Reduz carga backend, usuário vê resultado final
   - **Contras**: API pode receber dados não-normalizados via Postman
2. **Apenas Backend**
   - **Prós**: Single source of truth, garante integridade
   - **Contras**: Usuário vê "999.999.999-99" mas banco salva "99999999999" (confusão)
3. **Dual Normalization (escolhida)**
   - **Prós**: Frontend normaliza para UX, backend garante que dados sempre sejam consistentes
   - **Contras**: Código duplicado, porém simples (apenas regex)

**Justificativa**: Backend deve ser defensivo e nunca confiar em dados do cliente. Frontend normaliza para melhor UX.

**Implementação**:
```typescript
// Backend e Frontend (lógica idêntica)
function normalizeDocument(doc: string): string {
  return doc.replace(/[.\-\/\s]/g, '');
}
```

**Trade-offs**:
- **Duplicação**: Regex simples, baixo custo de manutenção
- **Segurança**: Backend protegido contra bypass
- **UX**: Usuário vê documento formatado durante digitação e persistido sem pontuação

---

### Decisão 3: UNIQUE Constraint Parcial (WHERE document IS NOT NULL)

**Escolha**: Usar índice UNIQUE parcial do PostgreSQL para permitir múltiplos NULL

**Alternativas consideradas**:
1. **UNIQUE total (sem filtro)**
   - **Prós**: Sintaxe simples
   - **Contras**: PostgreSQL rejeita múltiplos NULL (apenas 1 empresa sem documento permitida)
2. **Sem UNIQUE**
   - **Prós**: Sem restrições
   - **Contras**: Permite duplicatas, comprometendo integridade fiscal
3. **UNIQUE parcial `WHERE document IS NOT NULL` (escolhida)**
   - **Prós**: Permite infinitos NULL (opcional), rejeita duplicatas não-NULL
   - **Contras**: Requer PostgreSQL 7.2+ (ChatIA Flow usa 12+, OK)

**Justificativa**: Índice parcial é a solução padrão PostgreSQL para campos UNIQUE opcionais. Alinha-se ao requisito de campo opcional.

**SQL**:
```sql
CREATE UNIQUE INDEX idx_companies_document_unique
ON "Companies" (document)
WHERE document IS NOT NULL;
```

**Trade-offs**:
- **Portabilidade**: Funcionalidade específica PostgreSQL (não portável para MySQL/SQLite)
- **Performance**: Índice adicional (~2-5% da tabela), mas otimiza queries de busca
- **Integridade**: Garante que empresas com documento informado não sejam duplicadas

---

### Decisão 4: Máscaras Condicionais Automáticas

**Escolha**: Usar `react-input-mask` com máscara condicional baseada em comprimento

**Alternativas consideradas**:
1. **Duas inputs separadas (CPF ou CNPJ)**
   - **Prós**: Validação mais clara
   - **Contras**: UX ruim (usuário precisa escolher tipo antes de digitar)
2. **Máscara única genérica (99.999.999/9999-99)**
   - **Prós**: Simples
   - **Contras**: Confunde usuário (formato não corresponde a CPF ou CNPJ)
3. **Máscara condicional automática (escolhida)**
   - **Prós**: UX fluida (máscara muda automaticamente de CPF para CNPJ ao digitar)
   - **Contras**: Requer lógica de detecção de tipo

**Justificativa**: Detecção automática (11 dígitos = CPF, 14 dígitos = CNPJ) é padrão em sistemas brasileiros.

**Implementação**:
```javascript
// frontend/src/utils/documentMask.js
export function getDocumentMask(value) {
  const numbers = value.replace(/\D/g, '');
  if (numbers.length <= 11) {
    return '999.999.999-999'; // CPF (11 dígitos)
  }
  return '99.999.999/9999-99'; // CNPJ (14 dígitos)
}
```

**Trade-offs**:
- **Complexidade**: Lógica adicional, mas reutilizável
- **UX**: Melhor experiência (usuário não precisa escolher tipo)
- **Dependência**: `react-input-mask` (~15KB gzipped, já usado no projeto?)

---

### Decisão 5: Feature Flag para Compatibilidade

**Escolha**: Criar variável de ambiente `FEATURE_COMPANY_DOCUMENT_OPTIONAL` (default: `true`)

**Alternativas consideradas**:
1. **Sem feature flag (sempre ativo)**
   - **Prós**: Menos código condicional
   - **Contras**: Impossível reverter rapidamente em caso de bug crítico
2. **Feature flag apenas frontend**
   - **Prós**: Usuário não vê campo, mas backend aceita
   - **Contras**: Inconsistência (backend valida mas frontend não mostra)
3. **Feature flag full-stack (escolhida)**
   - **Prós**: Rollback total (frontend e backend), zero breaking changes quando OFF
   - **Contras**: Código condicional em múltiplos lugares

**Justificativa**: Feature flags são padrão para features críticas. Permite rollback sem deploy.

**Implementação**:
```typescript
// Backend
const isDocumentOptional = process.env.FEATURE_COMPANY_DOCUMENT_OPTIONAL === 'true';

// Frontend
const isDocumentOptional = process.env.REACT_APP_FEATURE_COMPANY_DOCUMENT_OPTIONAL !== 'false';
```

**Comportamento**:
- **Flag ON (default)**: Validação ativa, campo opcional, UNIQUE constraint aplicado
- **Flag OFF**: Sem validações, campo aceita qualquer string, UNIQUE constraint ignorado (via código, não DB)

**Trade-offs**:
- **Complexidade**: Código condicional, requer testes em ambos os modos
- **Segurança**: Permite rollback rápido sem downtime
- **Migração**: Feature flag pode ser removida após 2-3 releases estáveis

---

### Decisão 6: Conversão de String Vazia para NULL

**Escolha**: Converter `""` para `NULL` tanto no backend quanto na migration

**Alternativas consideradas**:
1. **Manter string vazia**
   - **Prós**: Sem mudanças no comportamento atual
   - **Contras**: Semanticamente incorreto (vazio !== não informado)
2. **NULL apenas para novos registros**
   - **Prós**: Não altera dados históricos
   - **Contras**: Inconsistência (registros antigos com `""`, novos com `NULL`)
3. **Converter tudo para NULL (escolhida)**
   - **Prós**: Consistência, semântica correta, permite UNIQUE parcial
   - **Contras**: Mudança em dados existentes (requer migration)

**Justificativa**: `NULL` é o valor SQL correto para "não informado". String vazia é um hack.

**Migration**:
```typescript
// backend/src/database/migrations/20251013150000-normalize-company-documents.ts
await queryInterface.sequelize.query(`
  UPDATE "Companies"
  SET document = NULL
  WHERE document = '' OR document IS NULL OR trim(document) = '';
`);
```

**Trade-offs**:
- **Semântica**: NULL é mais correto que `""`
- **UNIQUE constraint**: Só funciona com NULL (não com `""`)
- **Rollback**: Migration pode restaurar `""` se necessário

---

## Estratégia de Implementação

### Fase 1: Backend Helpers e Validações
1. Criar `backend/src/helpers/DocumentValidator.ts`
   - Implementar `normalizeDocument()`, `validateCPF()`, `validateCNPJ()`, `validateCPFOrCNPJ()`
   - Escrever testes unitários com Jest (cobertura 100%)
   - Casos de teste: CPF válido, CPF inválido, CNPJ válido, CNPJ inválido, todos zeros, sequências repetidas
2. Modificar `backend/src/services/CompanyService/CreateCompanyService.ts`
   - Importar helpers de validação
   - Adicionar validação condicional no schema Yup
   - Normalizar `document` antes de `Company.create()`
   - Testes de integração: criar empresa com CPF válido, CNPJ válido, documento vazio, documento inválido
3. Modificar `backend/src/services/CompanyService/UpdateCompanyService.ts`
   - Mesma lógica de validação e normalização
   - Testes de integração: atualizar documento, remover documento (NULL), rejeitar duplicata

### Fase 2: Database Migrations
4. Criar `backend/src/database/migrations/20251013150000-normalize-company-documents.ts`
   - Converter `""` para `NULL`
   - Identificar duplicatas (query SELECT)
   - **IMPORTANTE**: Revisar manualmente duplicatas antes de aplicar UNIQUE
   - Testar rollback: restaurar `""` para registros originalmente vazios
5. Criar `backend/src/database/migrations/20251013150001-add-unique-constraint-company-document.ts`
   - Criar índice parcial UNIQUE `WHERE document IS NOT NULL`
   - Testar inserção de duplicata (deve rejeitar)
   - Testar inserção de múltiplos NULL (deve aceitar)
   - Rollback: `DROP INDEX idx_companies_document_unique`

### Fase 3: Backend Controllers
6. Modificar `backend/src/controllers/CompanyController.ts`
   - Adicionar validação Yup no endpoint `store` (linha 97-106)
   - Adicionar validação Yup no endpoint `update` (linha 167-175)
   - Testes de integração: POST/PUT com documento válido, inválido, vazio

### Fase 4: Frontend Helpers
7. Criar `frontend/src/utils/documentValidator.js`
   - Portar lógica do backend para JavaScript
   - Escrever testes unitários com Jest (cobertura 100%)
8. Criar `frontend/src/utils/documentMask.js`
   - Implementar `getDocumentMask(value)` (retorna máscara CPF ou CNPJ)

### Fase 5: Frontend Componentes
9. Modificar `frontend/src/components/CompaniesManager/index.js`
   - Adicionar `react-input-mask` ao campo `document` (linha 305-310)
   - Implementar máscara condicional com `getDocumentMask()`
   - Adicionar validação em tempo real (onChange)
   - Adicionar helper text com mensagem de erro
   - Atualizar label: `i18n.t("compaies.table.documentOptional")`
   - Tratar NULL ao carregar empresa: `document: data.document || ""`
10. Modificar `frontend/src/components/CompaniesModal/index.js`
    - Adicionar campo `document` ao estado inicial (linha 82-89)
    - Adicionar Field com InputMask após campo `email`
    - Adicionar validação Yup condicional (linha 66-77)

### Fase 6: Frontend Traduções
11. Modificar traduções (pt.js, en.js, es.js, tr.js, ar.js)
    - Adicionar `documentOptional: "CPF/CNPJ (opcional)"`
    - Adicionar `documentNotInformed: "Não informado"`
    - Adicionar `documentInvalid: "CPF/CNPJ inválido"`
    - Adicionar `documentDuplicate: "CPF/CNPJ já cadastrado"`

### Fase 7: Feature Flag e Configuração
12. Modificar `.env.example`
    - Adicionar `FEATURE_COMPANY_DOCUMENT_OPTIONAL=true`
    - Adicionar `REACT_APP_FEATURE_COMPANY_DOCUMENT_OPTIONAL=enabled`
13. Documentar feature flag em `docs/features/FEATURE_FLAGS.md` (criar se não existir)

### Fase 8: Testes End-to-End
14. Escrever testes E2E com Playwright
    - Criar empresa com CPF válido
    - Criar empresa com CNPJ válido
    - Criar empresa sem documento (NULL)
    - Tentar criar empresa com CPF inválido (rejeitar)
    - Tentar criar empresa com documento duplicado (rejeitar)
    - Buscar empresa por documento (com e sem pontuação)
    - Alternar feature flag ON/OFF e verificar comportamento

### Fase 9: Deploy e Monitoramento
15. Deploy em staging
    - Aplicar migrations
    - Testar todos os cenários críticos
    - Validar performance (latência INSERT/UPDATE)
16. Deploy em produção
    - Blue-green deployment com feature flag OFF inicialmente
    - Ativar feature flag gradualmente (10% -> 50% -> 100%)
    - Monitorar erros de validação (logs, Sentry)
    - Monitorar performance (latência p95, p99)

---

## Consequências

### Positivas
- **Integridade de dados**: UNIQUE constraint previne duplicatas fiscais
- **UX aprimorada**: Máscaras automáticas e validação em tempo real
- **Segurança**: Validação backend impede bypass
- **Flexibilidade**: Campo opcional permite cadastro sem documento
- **Busca robusta**: Normalização permite busca por documento sem pontuação
- **Rollback seguro**: Feature flag permite reverter sem deploy
- **Padrão fiscal**: Algoritmos de validação seguem Receita Federal

### Negativas
- **Complexidade**: Código condicional devido à feature flag
- **Duplicação**: Validação e normalização em frontend e backend
- **Dependência**: `react-input-mask` adiciona ~15KB ao bundle
- **Migration arriscada**: Limpeza de duplicatas pode exigir intervenção manual
- **Overhead**: Validação adiciona ~50ms por criação/atualização

### Riscos

#### Risco 1: Duplicatas Existentes Bloqueiam Migration
- **Probabilidade**: Média (depende de dados históricos)
- **Impacto**: Alto (migration falha, deploy bloqueado)
- **Mitigação**:
  1. Executar query de detecção de duplicatas ANTES da migration
  2. Se duplicatas existirem, gerar relatório CSV para revisão manual
  3. Estratégia de resolução: Manter registro com `lastLogin` mais recente, nullificar outros
  4. Alternativa: Migration com flag `--skip-unique` (aplica depois de limpeza)

#### Risco 2: Performance Degradation em Tabelas Grandes
- **Probabilidade**: Baixa (índice otimizado)
- **Impacto**: Médio (latência INSERT/UPDATE aumenta)
- **Mitigação**:
  1. Testar migration em cópia de produção com dados reais
  2. Monitorar query time com `EXPLAIN ANALYZE` antes e depois
  3. Se latência > 100ms, considerar índice HASH ao invés de B-tree
  4. Índice UNIQUE parcial é mais eficiente que UNIQUE total

#### Risco 3: Feature Flag Desabilitado Gera Inconsistência
- **Probabilidade**: Baixa (flag default ON)
- **Impacto**: Médio (dados inválidos se flag OFF)
- **Mitigação**:
  1. Documentar que flag OFF não remove UNIQUE constraint (DB continua protegido)
  2. Backend sempre normaliza, mesmo com flag OFF (defesa em profundidade)
  3. Testes automatizados validam ambos os modos (ON e OFF)

#### Risco 4: Algoritmos de Validação CPF/CNPJ Incorretos
- **Probabilidade**: Baixa (algoritmos bem documentados)
- **Impacto**: Alto (rejeita documentos válidos ou aceita inválidos)
- **Mitigação**:
  1. Usar bibliotecas testadas (ex: `@fnando/cpf`, `@fnando/cnpj`)
  2. Alternativa: Implementar manualmente com testes extensivos
  3. Validar contra base de dados da Receita Federal (casos de teste reais)
  4. Permitir override manual para edge cases (campo `documentOverride`?)

---

## Mapa de Arquivos

### A Modificar

#### Backend
- `backend/src/models/Company.ts` (linha 46-47)
  - Adicionar `allowNull: true`, remover `defaultValue: ""`
- `backend/src/services/CompanyService/CreateCompanyService.ts` (linhas 39-43, 62)
  - Adicionar validação Yup condicional e normalização
- `backend/src/services/CompanyService/UpdateCompanyService.ts` (linhas 69-79)
  - Adicionar validação Yup condicional e normalização
- `backend/src/controllers/CompanyController.ts` (linhas 97-106, 167-175)
  - Adicionar schema Yup com validação de `document`

#### Frontend
- `frontend/src/components/CompaniesManager/index.js` (linhas 305-310, 551-563, 669)
  - Adicionar InputMask, validação em tempo real, tratar NULL
- `frontend/src/components/CompaniesModal/index.js` (linhas 66-77, 82-89, 170+)
  - Adicionar campo `document` com validação Yup e InputMask
- `frontend/src/translate/languages/pt.js` (adicionar após linha 196)
  - Adicionar traduções: `documentOptional`, `documentNotInformed`, `documentInvalid`, `documentDuplicate`
- `frontend/src/translate/languages/en.js` (mesma região)
- `frontend/src/translate/languages/es.js` (mesma região)
- `frontend/src/translate/languages/tr.js` (mesma região)
- `frontend/src/translate/languages/ar.js` (mesma região)

#### Configuração
- `.env.example` (adicionar após linha 38)
  - Adicionar `FEATURE_COMPANY_DOCUMENT_OPTIONAL=true`
  - Adicionar `REACT_APP_FEATURE_COMPANY_DOCUMENT_OPTIONAL=enabled`

### A Criar

#### Backend
- `backend/src/helpers/DocumentValidator.ts`
  - Funções: `normalizeDocument()`, `validateCPF()`, `validateCNPJ()`, `validateCPFOrCNPJ()`
- `backend/src/database/migrations/20251013150000-normalize-company-documents.ts`
  - Converter `""` para `NULL`, detectar duplicatas
- `backend/src/database/migrations/20251013150001-add-unique-constraint-company-document.ts`
  - Criar índice UNIQUE parcial `WHERE document IS NOT NULL`
- `backend/src/__tests__/helpers/DocumentValidator.test.ts`
  - Testes unitários: CPF válido, CPF inválido, CNPJ válido, CNPJ inválido, edge cases

#### Frontend
- `frontend/src/utils/documentValidator.js`
  - Portar lógica de validação do backend para JavaScript
- `frontend/src/utils/documentMask.js`
  - Função `getDocumentMask(value)` para máscaras condicionais
- `frontend/src/__tests__/utils/documentValidator.test.js`
  - Testes unitários: mesmos casos do backend
- `frontend/src/__tests__/utils/documentMask.test.js`
  - Testes: máscara CPF, máscara CNPJ, transição automática

#### Testes E2E
- `frontend/tests/e2e/companies-document.spec.js`
  - Testes Playwright: criar/editar empresa com CPF/CNPJ válido/inválido, duplicata, busca

#### Documentação
- `docs/features/FEATURE_FLAGS.md`
  - Documentar `FEATURE_COMPANY_DOCUMENT_OPTIONAL` e comportamento ON/OFF
- `docs/api/COMPANIES_API.md` (criar ou atualizar)
  - Documentar contrato API: campo `document` opcional, formato, validações
- `docs/database/MIGRATIONS.md` (atualizar se existir)
  - Documentar migrations `20251013150000` e `20251013150001`

---

## Rollback Strategy

### Rollback Completo (Emergencial)

**Cenário**: Bug crítico descoberto em produção

**Ações**:
1. **Desabilitar feature flag via ambiente** (sem deploy):
   ```bash
   # Backend
   export FEATURE_COMPANY_DOCUMENT_OPTIONAL=false

   # Frontend
   export REACT_APP_FEATURE_COMPANY_DOCUMENT_OPTIONAL=false

   # Restart services
   pm2 restart backend frontend
   ```
2. **Comportamento com flag OFF**:
   - Backend aceita qualquer string em `document` (sem validações)
   - Frontend não exibe máscaras ou validações
   - UNIQUE constraint permanece ativo (protege contra duplicatas)
3. **Tempo de rollback**: ~1 minuto (restart de serviços)

### Rollback de Migrations (Persistência)

**Cenário**: UNIQUE constraint causou problema

**Ações**:
1. Reverter migration UNIQUE:
   ```bash
   cd backend
   npm run sequelize db:migrate:undo
   ```
2. Reverter migration de normalização:
   ```bash
   npm run sequelize db:migrate:undo
   ```
3. **Nota**: Rollback restaura `""` para registros originalmente vazios (via backup)

**Tempo de rollback**: ~5-10 minutos (depende do tamanho da tabela)

### Rollback de Código (Deploy Anterior)

**Cenário**: Problema não resolvível com feature flag

**Ações**:
1. Deploy do commit anterior:
   ```bash
   git revert HEAD
   git push origin main
   # CI/CD deploys automaticamente
   ```
2. Reverter migrations (ver acima)

**Tempo de rollback**: ~10-20 minutos (pipeline CI/CD completo)

### Estratégia de Prevenção

1. **Canary deployment**: Ativar feature flag em 10% do tráfego inicialmente
2. **Monitoring**: Alertas automáticos se taxa de erro > 1% em validações de `document`
3. **Circuit breaker**: Se erro rate > 5%, feature flag desabilita automaticamente
4. **Backup pré-migration**: Dump da tabela `Companies` antes de aplicar migrations

---

## Validação

### Checklist Pré-Deploy

#### Backend
- [ ] `DocumentValidator.ts` criado com testes unitários (cobertura 100%)
- [ ] `CreateCompanyService.ts` valida e normaliza `document`
- [ ] `UpdateCompanyService.ts` valida e normaliza `document`
- [ ] `CompanyController.ts` possui schema Yup com validação de `document`
- [ ] Migrations `20251013150000` e `20251013150001` criadas e testadas
- [ ] Rollback de migrations testado em ambiente de dev
- [ ] Testes de integração: criar/atualizar empresa com CPF/CNPJ válido/inválido
- [ ] Testes de integração: UNIQUE constraint rejeita duplicatas
- [ ] Testes de integração: UNIQUE constraint aceita múltiplos NULL

#### Frontend
- [ ] `documentValidator.js` criado com testes unitários (cobertura 100%)
- [ ] `documentMask.js` criado com testes unitários
- [ ] `CompaniesManager/index.js` possui campo com InputMask e validação
- [ ] `CompaniesModal/index.js` possui campo com InputMask e validação
- [ ] Traduções adicionadas em pt, en, es, tr, ar
- [ ] Testes E2E: criar empresa com CPF/CNPJ válido/inválido
- [ ] Testes E2E: buscar empresa por documento (com e sem pontuação)

#### Configuração
- [ ] `.env.example` atualizado com feature flags
- [ ] `docs/features/FEATURE_FLAGS.md` documentado
- [ ] `docs/api/COMPANIES_API.md` atualizado com contrato API
- [ ] Monitoramento configurado (Sentry, logs, métricas)

#### Testes Multi-Tenant
- [ ] Validar que `companyId` é sempre filtrado em queries de `document`
- [ ] Testar isolamento: Empresa A não pode criar `document` duplicado de Empresa B (mas pode usar NULL)
- [ ] Testar Socket.IO: Evento `company-{id}-update` notifica apenas workspace correto

#### Performance
- [ ] Latência INSERT/UPDATE < 100ms em tabela com 10K+ registros
- [ ] Query EXPLAIN ANALYZE confirma uso de índice UNIQUE
- [ ] Índice GIN trigram continua eficiente para busca textual
- [ ] Bundle frontend não aumentou > 20KB (verificar `react-input-mask`)

---

## Referências

### Algoritmos de Validação
- [Receita Federal - Validação CPF](https://www.receita.fazenda.gov.br/aplicacoes/atcta/cpf/funcoes.js)
- [Receita Federal - Validação CNPJ](https://www.receita.fazenda.gov.br/aplicacoes/atcta/cnpj/funcoes.js)
- [Wikipedia - Dígito Verificador](https://pt.wikipedia.org/wiki/Dígito_verificador)

### PostgreSQL
- [Partial Indexes](https://www.postgresql.org/docs/current/indexes-partial.html)
- [UNIQUE Constraint with NULL](https://www.postgresql.org/docs/current/ddl-constraints.html#DDL-CONSTRAINTS-UNIQUE-CONSTRAINTS)

### Bibliotecas
- [react-input-mask](https://github.com/sanniassin/react-input-mask) - Máscaras condicionais
- [@fnando/cpf](https://github.com/fnando/cpf) - Validação CPF (alternativa)
- [@fnando/cnpj](https://github.com/fnando/cnpj) - Validação CNPJ (alternativa)

### Padrões de Projeto
- [Feature Flags Best Practices](https://martinfowler.com/articles/feature-toggles.html)
- [Database Migration Strategies](https://www.martinfowler.com/articles/evodb.html)
- [Dual Validation Pattern](https://owasp.org/www-project-proactive-controls/v3/en/c5-validate-inputs)

---

## Aprovação

**Status**: Aguardando revisão
**Revisores**: Equipe Backend, Equipe Frontend, DBA, Product Owner
**Data de aprovação esperada**: 2025-10-15
**Data de implementação prevista**: 2025-10-20 a 2025-10-27 (Sprint 42)

---

## Histórico de Revisões

| Data | Versão | Autor | Mudanças |
|------|--------|-------|----------|
| 2025-10-13 | 1.0 | Arquiteto ChatIA Flow | Versão inicial da ADR |

---

**Assinatura Digital**: SHA256:a1b2c3d4e5f6...

---

## Apêndice A: Algoritmo de Validação CPF

```typescript
/**
 * Valida CPF usando algoritmo da Receita Federal
 * Baseado em: https://www.receita.fazenda.gov.br/aplicacoes/atcta/cpf/funcoes.js
 */
export function validateCPF(cpf: string): boolean {
  // Remove pontuação
  cpf = cpf.replace(/[^\d]/g, '');

  // Valida comprimento
  if (cpf.length !== 11) return false;

  // Rejeita sequências repetidas (000.000.000-00, 111.111.111-11, etc)
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  // Calcula primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let digit1 = 11 - (sum % 11);
  if (digit1 > 9) digit1 = 0;

  // Valida primeiro dígito
  if (digit1 !== parseInt(cpf.charAt(9))) return false;

  // Calcula segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i)) * (11 - i);
  }
  let digit2 = 11 - (sum % 11);
  if (digit2 > 9) digit2 = 0;

  // Valida segundo dígito
  return digit2 === parseInt(cpf.charAt(10));
}
```

## Apêndice B: Algoritmo de Validação CNPJ

```typescript
/**
 * Valida CNPJ usando algoritmo da Receita Federal
 * Baseado em: https://www.receita.fazenda.gov.br/aplicacoes/atcta/cnpj/funcoes.js
 */
export function validateCNPJ(cnpj: string): boolean {
  // Remove pontuação
  cnpj = cnpj.replace(/[^\d]/g, '');

  // Valida comprimento
  if (cnpj.length !== 14) return false;

  // Rejeita sequências repetidas (00.000.000/0000-00, 11.111.111/1111-11, etc)
  if (/^(\d)\1{13}$/.test(cnpj)) return false;

  // Calcula primeiro dígito verificador
  let sum = 0;
  let weight = 5;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cnpj.charAt(i)) * weight;
    weight = (weight === 2) ? 9 : weight - 1;
  }
  let digit1 = 11 - (sum % 11);
  if (digit1 > 9) digit1 = 0;

  // Valida primeiro dígito
  if (digit1 !== parseInt(cnpj.charAt(12))) return false;

  // Calcula segundo dígito verificador
  sum = 0;
  weight = 6;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cnpj.charAt(i)) * weight;
    weight = (weight === 2) ? 9 : weight - 1;
  }
  let digit2 = 11 - (sum % 11);
  if (digit2 > 9) digit2 = 0;

  // Valida segundo dígito
  return digit2 === parseInt(cnpj.charAt(13));
}
```

## Apêndice C: Casos de Teste

### CPF Válidos
- `111.444.777-35` (válido)
- `123.456.789-09` (válido)
- `000.000.001-91` (válido - edge case)

### CPF Inválidos
- `000.000.000-00` (sequência repetida)
- `111.111.111-11` (sequência repetida)
- `123.456.789-00` (dígito verificador errado)
- `12345678901` (válido mas sem formatação - deve ser aceito após normalização)

### CNPJ Válidos
- `11.222.333/0001-81` (válido)
- `00.000.000/0001-91` (válido - edge case)

### CNPJ Inválidos
- `00.000.000/0000-00` (sequência repetida)
- `11.111.111/1111-11` (sequência repetida)
- `11.222.333/0001-00` (dígito verificador errado)

---

**Fim do documento**
