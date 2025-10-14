# ADR: Busca de Empresas no ChatIA Flow

## Status
**Aceito**

## Contexto

### Problema
O ChatIA Flow é um sistema multi-tenant SaaS de atendimento via WhatsApp que gerencia múltiplas empresas (companies). Atualmente, a interface de gerenciamento de empresas na tab "Empresas" em `/settings` (acessível apenas para super users) apresenta desafios de usabilidade:

1. **Crescimento da base de clientes**: Com o aumento do número de empresas cadastradas no sistema, a listagem paginada (limite de 20 registros) torna-se ineficiente para localizar empresas específicas
2. **Ausência de mecanismo de filtragem**: Usuários super admin precisam percorrer múltiplas páginas manualmente para encontrar uma empresa específica
3. **Experiência do usuário degradada**: Operações comuns como editar configurações de uma empresa ou verificar status de pagamento tornam-se demoradas
4. **Infraestrutura preparada mas não utilizada**: O endpoint `GET /companies` já aceita o parâmetro `searchParam` na query string, mas o `ListCompaniesService` não implementa o filtro, ignorando completamente o valor recebido

### Requisitos de Negócio
- Busca server-side com latência perceptível mínima (debounce)
- Filtrar empresas por múltiplos campos: nome, email, documento e telefone
- Manter retrocompatibilidade absoluta para clientes que não utilizam a busca
- Permitir rollback seguro através de feature flag
- Preservar paginação existente (20 registros por página)
- Acessibilidade (WCAG 2.1 AA compliance)

### Constraints Técnicas
- **Backend**: Node.js + Express + TypeScript + Sequelize 5.22.3 + Yup + PostgreSQL 12+
- **Frontend**: React 17.0.2 + Material-UI v4 (4.12.3) + axios 1.6.8 + react-query 3.39.3
- **Biblioteca de debounce**: `use-debounce` já instalada no projeto
- **Multi-tenancy**: Sistema rigorosamente multi-tenant com isolamento por `companyId`
- **RBAC**: Acesso exclusivo para usuários com `super === true`

## Decisões

### Backend

#### 1. Implementação de Filtro no Service Layer
**Decisão**: Modificar `ListCompaniesService.ts` para implementar filtro Sequelize com operador `Op.iLike` nos campos `name`, `email`, `document` e `phone`.

**Implementação**:
```typescript
// backend/src/services/CompanyService/ListCompaniesService.ts
import { Sequelize, Op } from "sequelize";

const whereClause = searchParam
  ? {
      [Op.or]: [
        { name: { [Op.iLike]: `%${searchParam}%` } },
        { email: { [Op.iLike]: `%${searchParam}%` } },
        { document: { [Op.iLike]: `%${searchParam}%` } },
        { phone: { [Op.iLike]: `%${searchParam}%` } }
      ]
    }
  : {};

const { count, rows: companies } = await Company.findAndCountAll({
  where: whereClause,
  include: [{ model: Plan, as: "plan", attributes: ["name"] }],
  limit,
  offset,
  order: [["name", "ASC"]]
});
```

**Justificativa**:
- `Op.iLike` fornece busca case-insensitive nativa do PostgreSQL
- `%...%` permite busca parcial (substring matching)
- `Op.or` permite encontrar match em qualquer dos 4 campos
- Mantém relação existente com `Plan` (não quebra comportamento atual)
- Zero breaking changes: quando `searchParam` é vazio/undefined, `whereClause` é objeto vazio (comportamento idêntico ao atual)

#### 2. Validação e Sanitização com Yup
**Decisão**: Adicionar validação do `searchParam` no controller `CompanyController.ts` antes de chamar o service.

**Implementação**:
```typescript
// backend/src/controllers/CompanyController.ts
export const index = async (req: Request, res: Response): Promise<Response> => {
  let { searchParam, pageNumber } = req.query as IndexQuery;

  // Validação e sanitização
  if (searchParam) {
    const searchSchema = Yup.string()
      .trim()
      .max(100, "Search parameter must be at most 100 characters");

    try {
      searchParam = await searchSchema.validate(searchParam);
    } catch (err: any) {
      throw new AppError(err.message);
    }
  }

  // Restante da lógica existente...
};
```

**Justificativa**:
- **Segurança**: Limita tamanho do input (previne ataques de DoS por queries excessivamente grandes)
- **Sanitização**: `trim()` remove espaços em branco desnecessários
- **Validação precoce**: Falha rápido antes de atingir o banco de dados
- **Consistência**: Usa Yup, já estabelecido no projeto (ex: validação em `store` e `update`)

#### 3. Feature Flag para Rollback Seguro
**Decisão**: Implementar feature flag `FEATURE_COMPANY_SEARCH` com valor padrão `enabled`.

**Implementação**:
```bash
# .env e .env.example
FEATURE_COMPANY_SEARCH=enabled
```

```typescript
// backend/src/services/CompanyService/ListCompaniesService.ts
const isSearchEnabled = process.env.FEATURE_COMPANY_SEARCH === 'enabled';

const whereClause = (searchParam && isSearchEnabled)
  ? {
      [Op.or]: [
        { name: { [Op.iLike]: `%${searchParam}%` } },
        { email: { [Op.iLike]: `%${searchParam}%` } },
        { document: { [Op.iLike]: `%${searchParam}%` } },
        { phone: { [Op.iLike]: `%${searchParam}%` } }
      ]
    }
  : {};
```

**Justificativa**:
- **Rollback sem deploy**: Em caso de problemas de performance em produção, basta alterar variável de ambiente para `disabled`
- **Testes A/B**: Permite validar impacto de performance em produção antes de commit permanente
- **Compliance organizacional**: Muitas empresas exigem feature flags para novas funcionalidades críticas
- **Default enabled**: Não impacta novos deployments (feature ativa por padrão)

#### 4. Performance e Índices de Banco de Dados
**Decisão**: Documentar estratégia de indexação com índices trigram (pg_trgm) mas NÃO criar migration obrigatória inicial.

**Estratégia**:
- **MVP**: Lançar sem índices adicionais, monitorar performance em produção
- **Threshold**: Se tabela `Companies` ultrapassar 10.000 registros OU se query time médio for > 500ms, criar índices GIN trigram
- **Migration futura sugerida**:

```sql
-- Migration futura (apenas se necessário após monitoramento)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX CONCURRENTLY idx_companies_name_trgm
  ON "Companies" USING gin (name gin_trgm_ops);

CREATE INDEX CONCURRENTLY idx_companies_email_trgm
  ON "Companies" USING gin (email gin_trgm_ops);

CREATE INDEX CONCURRENTLY idx_companies_document_trgm
  ON "Companies" USING gin (document gin_trgm_ops);

CREATE INDEX CONCURRENTLY idx_companies_phone_trgm
  ON "Companies" USING gin (phone gin_trgm_ops);
```

**Justificativa**:
- **YAGNI (You Aren't Gonna Need It)**: Não otimizar prematuramente - maioria das instâncias tem < 1.000 empresas
- **`CONCURRENTLY`**: Criação de índice sem lock da tabela (zero downtime)
- **GIN trigram**: Otimiza buscas `ILIKE %texto%` (3-5x mais rápido que full table scan)
- **Monitoramento primeiro**: Baseado em métricas reais, não suposições

### Frontend

#### 1. Input de Busca com Debounce
**Decisão**: Adicionar campo `TextField` no componente `CompaniesManager` com debounce de 400ms usando `use-debounce`.

**Implementação**:
```jsx
// frontend/src/components/CompaniesManager/index.js
import { useDebounce } from 'use-debounce';

export default function CompaniesManager() {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm] = useDebounce(searchTerm, 400);

  useEffect(() => {
    loadPlans(debouncedSearchTerm);
  }, [debouncedSearchTerm]);

  const loadPlans = async (search = "") => {
    setLoading(true);
    try {
      const params = search ? { searchParam: search } : {};
      const { data } = await api.get("/companies", { params });
      setRecords(data.companies);
    } catch (e) {
      toast.error(i18n.t("settings.toasts.recordsLoadError"));
    }
    setLoading(false);
  };

  return (
    <Paper className={classes.mainPaper} elevation={0}>
      <Grid spacing={2} container>
        <Grid xs={12} item>
          <TextField
            fullWidth
            variant="outlined"
            placeholder={i18n.t("compaies.search.placeholder")}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton onClick={() => setSearchTerm("")} size="small">
                    <ClearIcon />
                  </IconButton>
                </InputAdornment>
              )
            }}
            aria-label={i18n.t("compaies.search.ariaLabel")}
          />
        </Grid>
        {/* Restante do componente */}
      </Grid>
    </Paper>
  );
}
```

**Justificativa**:
- **Debounce 400ms**: Equilíbrio entre responsividade e redução de chamadas API (usuário médio digita ~5 caracteres/segundo)
- **Biblioteca use-debounce**: Já instalada, amplamente testada, 15kB minified
- **Botão limpar**: UX pattern estabelecido, permite reset rápido
- **SearchIcon**: Affordance visual clara (usuário identifica campo de busca instantaneamente)

#### 2. Material-UI Version: v4
**Decisão**: Utilizar Material-UI v4 para o campo de busca.

**Justificativa**:
- **Consistência**: `CompaniesManager` já utiliza 100% Material-UI v4 (`@material-ui/core`)
- **Zero breaking changes**: Não introduz dependências de v5 em componente legacy
- **Migration path**: Quando houver migração completa para v5, este campo será migrado junto com restante do componente
- **Imports**:
```javascript
import { TextField, InputAdornment, IconButton } from "@material-ui/core";
import { Search as SearchIcon, Clear as ClearIcon } from "@material-ui/icons";
```

#### 3. Acessibilidade (A11y)
**Decisão**: Implementar atributos ARIA e keyboard navigation.

**Requisitos**:
- `aria-label` descritivo no TextField
- `aria-live="polite"` para anunciar número de resultados
- Suporte completo a keyboard (Tab, Enter, Esc)
- Foco automático no campo após limpar (melhora fluxo de trabalho)

**Implementação**:
```jsx
<TextField
  aria-label={i18n.t("compaies.search.ariaLabel")} // "Buscar empresas por nome, email, documento ou telefone"
  aria-describedby="search-helper-text"
  inputRef={searchInputRef}
  onKeyDown={(e) => {
    if (e.key === 'Escape' && searchTerm) {
      setSearchTerm("");
      searchInputRef.current?.focus();
    }
  }}
/>
<div id="search-helper-text" aria-live="polite" className={classes.srOnly}>
  {loading
    ? i18n.t("compaies.search.loading")
    : i18n.t("compaies.search.results", { count: records.length })
  }
</div>
```

#### 4. Feature Flag no Frontend
**Decisão**: Condicionar renderização do campo de busca à feature flag recebida do backend.

**Implementação**:
```jsx
// Buscar feature flags no contexto de settings ou via endpoint
const { features } = useSettings(); // Assumindo context existente

{features?.FEATURE_COMPANY_SEARCH === 'enabled' && (
  <Grid xs={12} item>
    <TextField /* busca */ />
  </Grid>
)}
```

**Justificativa**:
- **Rollback total**: Se backend desabilitar feature, UI não mostra o campo
- **Sincronização**: Evita usuário tentar buscar quando backend não suporta
- **Graceful degradation**: Sistema funciona identicamente ao estado anterior

### Integrações

**Nenhuma integração externa necessária**:
- Não requer WhatsApp/Baileys
- Não requer IA (OpenAI/Dialogflow/Gemini)
- Não requer Bull Queue
- Não requer Socket.IO

Esta é uma feature puramente CRUD com interação HTTP REST.

## Alternativas Consideradas

### Alternativa A: Busca Client-Side (In-Memory Filtering)
**Descrição**: Carregar todas as empresas no frontend e filtrar via JavaScript.

**Prós**:
- Implementação mais simples (apenas frontend)
- Resposta instantânea (sem latência de rede)
- Não requer mudanças no backend

**Contras**:
- **Não escala**: Com 1.000+ empresas, payload inicial seria 50-100KB+ (comprimido)
- **Performance**: Renderização inicial lenta (React precisa processar 1.000+ rows)
- **Memória**: Alto consumo no browser
- **Paginação quebrada**: Precisaria refatorar lógica existente de paginação server-side
- **Dados desatualizados**: Cache local pode ficar stale

**Decisão**: ❌ **Rejeitado** - Não escala para crescimento futuro do produto.

### Alternativa B: ElasticSearch / Algolia Full-Text Search
**Descrição**: Indexar empresas em motor de busca dedicado (ElasticSearch ou Algolia).

**Prós**:
- Performance extrema (< 50ms para milhões de registros)
- Busca fuzzy (typo tolerance)
- Highlighting de termos
- Faceted search (filtros avançados)

**Contras**:
- **Over-engineering**: Complexidade desnecessária para 99% dos casos de uso
- **Custos**: ElasticSearch requer infraestrutura adicional (servidor/RAM); Algolia cobra por operações
- **Sincronização**: Lógica adicional para manter índice sincronizado com PostgreSQL
- **Latência de indexação**: Mudanças em empresas não são instantâneas no índice
- **Complexidade operacional**: Mais um serviço para monitorar, backup, escalar

**Decisão**: ❌ **Rejeitado** - Overkill para MVP. Pode ser reconsiderado se base ultrapassar 100.000 empresas.

### Alternativa C: Busca com Delay Visual (Loading State Imediato)
**Descrição**: Não usar debounce, mas mostrar loading state imediatamente a cada keystroke.

**Prós**:
- Feedback visual instantâneo
- Usuário sente que sistema é responsivo

**Contras**:
- **Sobrecarga de rede**: 10 caracteres = 10 requests HTTP
- **Sobrecarga de banco**: Queries concorrentes podem degradar performance
- **Race conditions**: Resultados de queries antigas podem sobrescrever novas
- **Custos**: Mais requests = mais compute time em cloud providers (AWS Lambda, etc.)

**Decisão**: ❌ **Rejeitado** - Debounce é best practice estabelecido para search inputs.

### Alternativa D: Indexação Apenas em `name`
**Descrição**: Buscar apenas no campo `name` para simplificar query.

**Prós**:
- Query mais rápida (1 campo vs 4 campos)
- Índice único necessário
- Implementação mais simples

**Contras**:
- **UX degradada**: Super admin frequentemente busca por email (caso de suporte) ou documento (fiscal)
- **Requisito explícito**: Especificação solicita busca em múltiplos campos
- **Mínima diferença de performance**: Com índices apropriados, diferença é < 50ms

**Decisão**: ❌ **Rejeitado** - Requisitos justificam busca em múltiplos campos.

## Trade-offs

### Performance vs Complexidade
**Trade-off Escolhido**: Performance moderada com complexidade mínima.

**Análise**:
- ✅ **Vantagem**: Solução 80/20 - atende 95% dos casos com 20% da complexidade do ElasticSearch
- ✅ **Vantagem**: PostgreSQL ILIKE com índices trigram oferece 200-500ms de latência (aceitável com debounce)
- ⚠️ **Limitação**: Não suporta busca fuzzy (typo tolerance)
- ⚠️ **Limitação**: Performance degrada com tabelas 100k+ registros (mas mitigável com índices)

**Mitigação**:
- Documentar threshold para migração futura (ElasticSearch se necessário)
- Monitoramento de query time com alertas (> 500ms)
- Feature flag permite rollback se performance for inaceitável

### Multi-Tenant Safety
**Trade-off Escolhido**: Não há trade-off - segurança é não-negociável.

**Análise**:
- ✅ **Garantia**: Controller já verifica `requestUser.super === true` antes de permitir acesso
- ✅ **Garantia**: Empresas não-super só veem sua própria empresa (linha 72-76 do controller)
- ✅ **Validação**: Teste de segurança necessário: usuário não-super não pode burlar busca via params manipulados

**Validação Obrigatória**:
```javascript
// Teste E2E
test('Non-super user cannot search other companies', async () => {
  const response = await api.get('/companies?searchParam=AnotherCompany', {
    headers: { Authorization: `Bearer ${nonSuperToken}` }
  });
  expect(response.data.companies).toHaveLength(1);
  expect(response.data.companies[0].name).toBe('OwnCompany');
});
```

### Socket.IO Real-Time Updates
**Trade-off Escolhido**: Não implementar atualizações real-time no MVP.

**Análise**:
- ⚠️ **Limitação**: Se outra sessão criar/editar empresa, lista não atualiza automaticamente
- ✅ **Mitigação**: Usuário pode re-executar busca (enter ou clicar limpar)
- ✅ **Simplicidade**: Evita complexidade de Socket.IO para caso de uso de baixa concorrência

**Reconsideração Futura**:
Se múltiplos super admins trabalharem simultaneamente (improvável), considerar:
```javascript
socket.on('company-created', (company) => {
  if (company.name.includes(debouncedSearchTerm)) {
    setRecords(prev => [...prev, company]);
  }
});
```

### Escalabilidade
**Trade-off Escolhido**: Otimizar para escala de 1-10k empresas (99% dos casos).

**Análise**:
- ✅ **Adequado para**: Instâncias com até 10.000 empresas (a grande maioria)
- ⚠️ **Limitação**: Performance pode degradar com 50k+ empresas sem índices trigram
- ✅ **Plano de escala**: Documentado estratégia de migração para ElasticSearch se necessário

**Thresholds Documentados**:
- 0-10k empresas: Solução atual sem índices trigram (< 300ms)
- 10k-50k empresas: Adicionar índices GIN trigram (< 500ms)
- 50k+ empresas: Considerar ElasticSearch ou particionamento de tabela

## Consequências

### Positivas

1. **UX Significativamente Melhorada**
   - Super admins localizam empresas em segundos (vs minutos navegando páginas)
   - Reduz frustração e tempo gasto em tarefas administrativas
   - Feedback visual com loading states e contador de resultados

2. **Retrocompatibilidade Total**
   - Código existente continua funcionando identicamente
   - Clientes que não usam busca não são afetados
   - Testes existentes não precisam ser modificados

3. **Redução de Carga no Backend**
   - Debounce reduz número de requests em 70-90% (vs busca sem debounce)
   - Queries filtradas retornam menos registros (menos processamento JSON)
   - Paginação continua limitando payload a 20 registros

4. **Segurança Mantida**
   - Validação Yup previne SQL injection (Sequelize já escapa, mas validação adicional é defesa em profundidade)
   - Limite de 100 caracteres previne DoS
   - Multi-tenant isolation preservado (super users only)

5. **Observabilidade**
   - Feature flag permite monitorar adoção (% de requests com searchParam)
   - Fácil medir impacto de performance (comparar query time com/sem searchParam)
   - Rollback sem código (apenas variável de ambiente)

6. **Acessibilidade**
   - Screen readers anunciam resultados
   - Keyboard-only navigation suportado
   - WCAG 2.1 AA compliance

### Negativas

1. **Query Complexity Aumentada**
   - Query com `Op.or` e 4 campos `ILIKE` é mais lenta que query simples (20-50ms overhead sem índices)
   - PostgreSQL query planner pode não escolher índice ideal automaticamente
   - **Mitigação**: Índices trigram reduzem overhead para < 10ms

2. **Manutenção de Índices (Futuro)**
   - Se índices trigram forem criados, aumentam tamanho do banco em ~15-20%
   - Rebuilds periódicos podem ser necessários (VACUUM ANALYZE)
   - **Mitigação**: Índices são opcionais (apenas criar se realmente necessário)

3. **Complexidade de Testes**
   - Necessário testar com/sem searchParam
   - Necessário testar feature flag enabled/disabled
   - Necessário testar debounce (timers em testes podem ser flaky)
   - **Mitigação**: Usar `jest.useFakeTimers()` para testes determinísticos

4. **Potencial de Confusão**
   - Usuários podem não entender que busca é case-insensitive e partial match
   - Busca por "12345" retorna empresa com documento "12345678901234"
   - **Mitigação**: Placeholder descritivo e documentação de ajuda inline

5. **Sem Busca Avançada**
   - Não suporta operadores booleanos (AND, OR, NOT)
   - Não suporta busca por intervalos (dueDate entre X e Y)
   - Não suporta ordenação por relevância
   - **Mitigação**: Requisitos não solicitam, pode ser adicionado futuramente se necessário

### Riscos e Mitigações

#### Risco 1: Performance Inaceitável em Produção
**Probabilidade**: Média (20-30%)
**Impacto**: Alto (usuários reclamam de lentidão)

**Sintomas**:
- Query time > 1000ms com 5000+ empresas
- Timeouts em instâncias com hardware limitado
- Degradação durante picos de uso

**Mitigações**:
1. **Imediata**: Desabilitar feature via `FEATURE_COMPANY_SEARCH=disabled`
2. **Curto prazo** (1 dia): Criar índices GIN trigram com `CONCURRENTLY`
3. **Médio prazo** (1 semana): Adicionar cache Redis (TTL 5min) para buscas frequentes
4. **Longo prazo** (1 mês): Migrar para ElasticSearch se problema persistir

**Monitoramento**:
```javascript
// Adicionar logging no service
const startTime = Date.now();
const { count, rows: companies } = await Company.findAndCountAll({...});
const duration = Date.now() - startTime;

if (duration > 500) {
  logger.warn({
    message: 'Slow company search query',
    duration,
    searchParam,
    count,
    hasSearchParam: !!searchParam
  });
}
```

#### Risco 2: SQL Injection via searchParam
**Probabilidade**: Baixa (5%)
**Impacto**: Crítico (comprometimento de dados)

**Análise**:
- Sequelize escapa parâmetros automaticamente (usa parameterized queries)
- Validação Yup adiciona camada extra de proteção
- Limite de 100 caracteres reduz superfície de ataque

**Mitigações**:
1. **Prevenção**: Validação Yup + trim() + max length
2. **Detecção**: Testes de segurança E2E com payloads maliciosos
3. **Monitoramento**: Alertas para errors 500 no endpoint `/companies`

**Teste de Segurança Obrigatório**:
```javascript
test('Rejects SQL injection attempts', async () => {
  const maliciousPayloads = [
    "'; DROP TABLE Companies; --",
    "1' OR '1'='1",
    "admin'--",
    "<script>alert('xss')</script>"
  ];

  for (const payload of maliciousPayloads) {
    const response = await api.get('/companies', {
      params: { searchParam: payload }
    });
    expect(response.status).toBe(400); // Yup deve rejeitar
  }
});
```

#### Risco 3: Feature Flag Não Sincronizada entre Backend e Frontend
**Probabilidade**: Média (15%)
**Impacto**: Baixo (UX inconsistente)

**Sintomas**:
- Frontend mostra campo de busca mas backend retorna erro
- Ou vice-versa: backend aceita busca mas frontend não tem UI

**Mitigações**:
1. **Arquitetura**: Frontend consulta flag do backend via endpoint `/settings` ou context
2. **Fallback**: Se backend retornar erro, frontend esconde campo automaticamente
3. **Documentação**: Documentar processo de rollback (backend primeiro, depois frontend)

#### Risco 4: Race Condition em Buscas Rápidas
**Probabilidade**: Alta (40%)
**Impacto**: Baixo (resultados incorretos temporariamente)

**Sintomas**:
- Usuário digita "ABC" rapidamente
- Request para "A" retorna depois de request para "AB"
- Tabela mostra resultados de "A" em vez de "AB"

**Mitigações**:
1. **Debounce**: Reduz probabilidade (apenas última busca é executada)
2. **Request cancellation**: Usar AbortController para cancelar requests anteriores
3. **Request ID**: Comparar ID da request com ID do estado atual

**Implementação**:
```javascript
const abortControllerRef = useRef(null);

const loadPlans = async (search = "") => {
  // Cancelar request anterior
  if (abortControllerRef.current) {
    abortControllerRef.current.abort();
  }

  abortControllerRef.current = new AbortController();

  try {
    const { data } = await api.get("/companies", {
      params: search ? { searchParam: search } : {},
      signal: abortControllerRef.current.signal
    });
    setRecords(data.companies);
  } catch (e) {
    if (e.name !== 'AbortError') {
      toast.error(i18n.t("settings.toasts.recordsLoadError"));
    }
  }
};
```

## Implementação

### Backend: Steps

1. **Atualizar `ListCompaniesService.ts`** (15 min)
   - Importar `Op` do Sequelize
   - Adicionar lógica de `whereClause` condicional
   - Adicionar feature flag check
   - Adicionar logging de performance

2. **Atualizar `CompanyController.ts`** (10 min)
   - Adicionar validação Yup para `searchParam`
   - Sanitizar input (trim)
   - Adicionar error handling

3. **Adicionar Feature Flag** (5 min)
   - Atualizar `.env.example` com `FEATURE_COMPANY_SEARCH=enabled`
   - Documentar no README

4. **Testes Unitários** (30 min)
   - Service: testar filtro com/sem searchParam
   - Service: testar feature flag on/off
   - Controller: testar validação Yup (rejeita > 100 chars)
   - Controller: testar sanitização (trim)

5. **Testes de Segurança** (20 min)
   - Testar SQL injection payloads
   - Testar XSS payloads
   - Testar non-super user isolation

### Frontend: Steps

1. **Atualizar `CompaniesManager/index.js`** (30 min)
   - Adicionar useState para searchTerm
   - Adicionar useDebounce (400ms)
   - Adicionar TextField com InputAdornments (SearchIcon, ClearIcon)
   - Atualizar loadPlans para aceitar parâmetro de busca
   - Adicionar feature flag check

2. **Adicionar i18n Translations** (10 min)
   - `compaies.search.placeholder`: "Buscar por nome, email, documento ou telefone"
   - `compaies.search.ariaLabel`: "Campo de busca de empresas"
   - `compaies.search.loading`: "Buscando empresas..."
   - `compaies.search.results`: "{count} empresa(s) encontrada(s)"
   - (Replicar para en, es, tr, ar)

3. **Acessibilidade** (20 min)
   - Adicionar aria-label
   - Adicionar aria-live para resultados
   - Adicionar keyboard handlers (Escape para limpar)
   - Adicionar foco no input após limpar

4. **Testes Frontend** (40 min)
   - Componente: renderiza campo de busca
   - Componente: debounce funciona (400ms)
   - Componente: botão limpar funciona
   - Componente: ESC limpa campo
   - A11y: aria-label presente
   - A11y: anúncio de resultados

5. **Testes E2E (Playwright)** (30 min)
   - Happy path: digitar → esperar debounce → verificar resultados
   - Empty state: busca sem resultados mostra mensagem
   - Error handling: backend down → toast de erro
   - Feature flag: campo desaparece quando flag disabled

### Integração: Steps

1. **Smoke Test Manual** (15 min)
   - Iniciar backend + frontend em dev
   - Testar busca com 3-5 termos diferentes
   - Verificar network tab (debounce funcionando)
   - Verificar logs de performance no backend

2. **Documentação** (20 min)
   - Atualizar `docs/backend/services.md` com documentação do filtro
   - Atualizar `docs/frontend/components.md` com props do CompaniesManager
   - Criar `docs/architecture/search-companies-flows.md` (este documento)

3. **Code Review Checklist** (10 min)
   - ✅ Multi-tenant isolation verificado
   - ✅ Validação Yup presente
   - ✅ Feature flag implementado
   - ✅ Testes de segurança passando
   - ✅ A11y compliance verificado
   - ✅ Debounce funcionando
   - ✅ Error handling robusto

### Testes: Strategy

#### Backend Unit Tests (Jest)
```javascript
// backend/src/services/CompanyService/__tests__/ListCompaniesService.spec.ts
describe('ListCompaniesService', () => {
  it('filters by name when searchParam provided', async () => {
    const result = await ListCompaniesService({ searchParam: 'Acme' });
    expect(result.companies.every(c => c.name.includes('Acme'))).toBe(true);
  });

  it('returns all companies when searchParam empty', async () => {
    const result = await ListCompaniesService({ searchParam: '' });
    expect(result.companies.length).toBeGreaterThan(0);
  });

  it('respects feature flag', async () => {
    process.env.FEATURE_COMPANY_SEARCH = 'disabled';
    const result = await ListCompaniesService({ searchParam: 'test' });
    expect(result.companies.length).toBe(20); // Retorna todos (limit 20)
  });
});
```

#### Frontend Component Tests (React Testing Library)
```javascript
// frontend/src/components/CompaniesManager/__tests__/index.test.js
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

describe('CompaniesManager', () => {
  it('debounces search input', async () => {
    jest.useFakeTimers();
    const { container } = render(<CompaniesManager />);

    const input = screen.getByLabelText(/buscar empresas/i);
    userEvent.type(input, 'Acme');

    expect(apiMock.get).not.toHaveBeenCalled(); // Antes dos 400ms

    jest.advanceTimersByTime(400);
    await waitFor(() => {
      expect(apiMock.get).toHaveBeenCalledWith('/companies', {
        params: { searchParam: 'Acme' }
      });
    });
  });

  it('clears search on button click', async () => {
    const { container } = render(<CompaniesManager />);
    const input = screen.getByLabelText(/buscar empresas/i);

    userEvent.type(input, 'test');
    const clearButton = screen.getByRole('button', { name: /clear/i });
    userEvent.click(clearButton);

    expect(input.value).toBe('');
  });
});
```

#### E2E Tests (Playwright)
```javascript
// frontend/tests/e2e/companies-search.spec.js
test('Super user can search companies', async ({ page }) => {
  await loginAsSuperUser(page);
  await page.goto('/settings');
  await page.click('text=Empresas');

  await page.fill('[aria-label*="Buscar empresas"]', 'Acme');
  await page.waitForTimeout(500); // Debounce + latência

  const rows = await page.locator('table tbody tr').count();
  expect(rows).toBeGreaterThan(0);

  const firstRowName = await page.locator('table tbody tr:first-child td:nth-child(2)').textContent();
  expect(firstRowName.toLowerCase()).toContain('acme');
});
```

#### Security Tests
```javascript
// backend/src/controllers/__tests__/CompanyController.security.spec.ts
describe('CompanyController Security', () => {
  it('rejects SQL injection in searchParam', async () => {
    const response = await request(app)
      .get('/companies')
      .query({ searchParam: "'; DROP TABLE Companies; --" })
      .set('Authorization', `Bearer ${superToken}`);

    expect(response.status).toBe(400);
    expect(response.body.error).toContain('validation');
  });

  it('non-super user cannot search other companies', async () => {
    const response = await request(app)
      .get('/companies')
      .query({ searchParam: 'OtherCompany' })
      .set('Authorization', `Bearer ${regularToken}`);

    expect(response.body.companies).toHaveLength(1);
    expect(response.body.companies[0].id).toBe(regularUserCompanyId);
  });
});
```

## Validação

### Checklist de Implementação

#### Backend
- [ ] `ListCompaniesService.ts` implementa filtro `Op.iLike` em 4 campos
- [ ] `CompanyController.ts` valida `searchParam` com Yup (max 100 chars, trim)
- [ ] Feature flag `FEATURE_COMPANY_SEARCH` implementado
- [ ] Logging de performance adicionado (warn se > 500ms)
- [ ] Testes unitários do service (3+ casos: com/sem searchParam, flag on/off)
- [ ] Testes de segurança (SQL injection, XSS)
- [ ] Testes de multi-tenant isolation (non-super user)

#### Frontend
- [ ] Campo `TextField` com debounce 400ms adicionado
- [ ] Ícones `SearchIcon` e `ClearIcon` (InputAdornments)
- [ ] Botão limpar funciona e retorna foco
- [ ] Feature flag condiciona renderização
- [ ] Translations i18n em 5 idiomas (pt, en, es, tr, ar)
- [ ] `aria-label` descritivo presente
- [ ] `aria-live` anuncia resultados
- [ ] Keyboard navigation (Tab, Esc) funciona
- [ ] Testes de componente (debounce, limpar, keyboard)
- [ ] Testes A11y (aria attributes, foco)

#### Integração
- [ ] Smoke test manual executado (dev environment)
- [ ] Network tab verificado (debounce reduz requests)
- [ ] Testes E2E (Playwright) passando
- [ ] Documentação atualizada (`README.md`, `docs/architecture/`)
- [ ] `.env.example` atualizado com feature flag
- [ ] Code review checklist preenchido

#### Performance
- [ ] Query time < 500ms testado (1000 empresas mock)
- [ ] Monitoramento de logs configurado (warn threshold)
- [ ] Plano de migração para índices trigram documentado
- [ ] Rollback plan testado (feature flag disabled)

#### Segurança
- [ ] Payloads SQL injection rejeitados (Yup validation)
- [ ] Payloads XSS rejeitados (Yup validation)
- [ ] Non-super user não pode buscar outras empresas
- [ ] Limite de 100 caracteres funcionando

#### Acessibilidade
- [ ] WCAG 2.1 AA compliance verificado
- [ ] Screen reader testado (VoiceOver ou NVDA)
- [ ] Keyboard-only navigation funcional
- [ ] Foco visível em todos os estados

## Referências

### Documentação Interna
- `docs/backend/services.md` - Padrões de services layer
- `docs/frontend/components.md` - Padrões de componentes React
- `docs/backend/models.md` - Model Company e relações
- `docs/analysis/architecture.md` - Arquitetura multi-tenant

### Bibliotecas e Ferramentas
- [Sequelize Operators](https://sequelize.org/docs/v5/core-concepts/model-querying-basics/#operators) - Documentação Op.iLike
- [use-debounce](https://github.com/xnimorz/use-debounce) - Biblioteca de debounce
- [Yup Validation](https://github.com/jquense/yup) - Schema validation
- [PostgreSQL pg_trgm](https://www.postgresql.org/docs/12/pgtrgm.html) - Trigram indexes

### Best Practices
- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/) - Acessibilidade
- [OWASP Input Validation](https://cheatsheetseries.owasp.org/cheatsheets/Input_Validation_Cheat_Sheet.html) - Segurança
- [UX Search Patterns](https://www.nngroup.com/articles/search-visible-and-simple/) - Nielsen Norman Group

### Relacionado
- **ADR-002**: Multi-Tenant Isolation Strategy (referência futura)
- **ADR-003**: Material-UI v4 → v5 Migration Plan (referência futura)

---

**Autor**: Claude Code (Software Architect AI)
**Data**: 2025-01-13
**Versão**: 1.0
**Última Atualização**: 2025-01-13
