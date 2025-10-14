# Fluxos de Busca de Empresas - ChatIA Flow

## Documentação Complementar

Este documento detalha os fluxos de interação da feature de busca de empresas, complementando a [ADR-2025-01-13-search-companies.md](./ADR-2025-01-13-search-companies.md).

---

## Fluxo 1: Happy Path - Busca Bem-Sucedida

### Descrição
Fluxo padrão onde super user digita termo de busca, sistema retorna resultados relevantes após debounce.

### Pré-condições
- Usuário autenticado como super admin (`super === true`)
- Navegador em `/settings` na tab "Empresas"
- Feature flag `FEATURE_COMPANY_SEARCH=enabled`
- Pelo menos uma empresa no banco que match o termo de busca

### Passos

#### 1. Renderização Inicial
```
[Frontend] CompaniesManager.useEffect()
  ↓
[Frontend] loadPlans("") - busca sem filtro
  ↓
[HTTP] GET /companies
  ↓
[Backend] CompanyController.index()
  ↓ (super === true)
[Backend] ListCompaniesService({ searchParam: "", pageNumber: "1" })
  ↓ (whereClause = {})
[Database] SELECT * FROM "Companies" ORDER BY name ASC LIMIT 20
  ↓
[Frontend] setRecords(companies) - exibe tabela com 20 empresas
```

**Estado da UI**:
- Campo de busca vazio
- Tabela mostra primeiras 20 empresas (ordenadas por nome)
- Loading indicator não visível

---

#### 2. Usuário Digita Termo de Busca
```
[User] Digita "Acme" no TextField
  ↓
[Frontend] onChange={(e) => setSearchTerm(e.target.value)}
  ↓
[State] searchTerm = "A"
  ↓ (40ms depois)
[State] searchTerm = "Ac"
  ↓ (40ms depois)
[State] searchTerm = "Acm"
  ↓ (40ms depois)
[State] searchTerm = "Acme"
  ↓
[use-debounce] Timer iniciado (400ms)
```

**Estado da UI**:
- Campo de busca mostra "Acme"
- Tabela ainda mostra resultados anteriores (sem filtro)
- Loading indicator NÃO está visível (debounce ainda não disparou)

**Observação Importante**: Durante a digitação (primeiros 400ms), nenhuma request é feita. Isso reduz carga no backend de ~10 requests (se usuário digitar 10 caracteres) para apenas 1 request.

---

#### 3. Debounce Completo - Request Disparada
```
[use-debounce] 400ms passados sem novas mudanças
  ↓
[State] debouncedSearchTerm = "Acme"
  ↓
[Frontend] useEffect(() => { loadPlans(debouncedSearchTerm) }, [debouncedSearchTerm])
  ↓
[Frontend] setLoading(true) - exibe loading indicator
  ↓
[HTTP] GET /companies?searchParam=Acme
  ↓
[Backend] CompanyController.index()
  ↓ (validação Yup)
[Yup] searchParam.trim().max(100).validate("Acme") ✓
  ↓
[Backend] ListCompaniesService({ searchParam: "Acme", pageNumber: "1" })
  ↓ (FEATURE_COMPANY_SEARCH=enabled)
[Service] whereClause = {
  [Op.or]: [
    { name: { [Op.iLike]: "%Acme%" } },
    { email: { [Op.iLike]: "%Acme%" } },
    { document: { [Op.iLike]: "%Acme%" } },
    { phone: { [Op.iLike]: "%Acme%" } }
  ]
}
  ↓
[Database] SELECT * FROM "Companies"
           WHERE (
             name ILIKE '%Acme%' OR
             email ILIKE '%Acme%' OR
             document ILIKE '%Acme%' OR
             phone ILIKE '%Acme%'
           )
           ORDER BY name ASC LIMIT 20
  ↓ (120ms query time)
[Database] Retorna 3 empresas
  ↓
[Backend] Response: { companies: [...3], count: 3, hasMore: false }
  ↓
[HTTP] 200 OK
  ↓
[Frontend] setRecords(data.companies)
[Frontend] setLoading(false)
```

**Estado da UI**:
- Campo de busca mostra "Acme"
- Tabela exibe 3 empresas filtradas
- Loading indicator desaparece
- Screen reader anuncia: "3 empresas encontradas" (via aria-live)

**Performance**:
- Tempo total: ~400ms (debounce) + ~120ms (query) + ~50ms (network) = **~570ms**
- Percepção do usuário: Instantâneo (< 1 segundo)

---

#### 4. Usuário Refina Busca
```
[User] Adiciona " Corp" → "Acme Corp"
  ↓
[State] searchTerm = "Acme Corp"
  ↓
[use-debounce] Timer reiniciado (400ms)
  ↓ (400ms depois)
[State] debouncedSearchTerm = "Acme Corp"
  ↓
[Frontend] loadPlans("Acme Corp")
  ↓
[HTTP] GET /companies?searchParam=Acme Corp
  ↓
[Backend] ListCompaniesService({ searchParam: "Acme Corp", ... })
  ↓
[Database] WHERE name ILIKE '%Acme Corp%' OR ...
  ↓
[Database] Retorna 1 empresa
  ↓
[Frontend] Tabela atualizada para 1 empresa
```

**Estado da UI**:
- Campo de busca mostra "Acme Corp"
- Tabela exibe 1 empresa
- Screen reader anuncia: "1 empresa encontrada"

---

#### 5. Usuário Limpa Busca
```
[User] Clica no ícone "X" (ClearIcon)
  ↓
[Frontend] onClick={() => setSearchTerm("")}
  ↓
[State] searchTerm = ""
  ↓
[Frontend] searchInputRef.current?.focus() - retorna foco ao input
  ↓
[use-debounce] Timer reiniciado
  ↓ (400ms depois)
[State] debouncedSearchTerm = ""
  ↓
[Frontend] loadPlans("")
  ↓
[HTTP] GET /companies (sem searchParam)
  ↓
[Backend] ListCompaniesService({ searchParam: "", ... })
  ↓ (whereClause = {})
[Database] SELECT * FROM "Companies" ORDER BY name ASC LIMIT 20
  ↓
[Frontend] Tabela retorna ao estado inicial (primeiras 20 empresas)
```

**Estado da UI**:
- Campo de busca vazio
- Ícone "X" desaparece
- Foco no campo de busca (cursor piscando)
- Tabela mostra primeiras 20 empresas sem filtro

**Alternativa Keyboard**: Usuário pode pressionar `Esc` em vez de clicar no "X" - comportamento idêntico.

---

### Pós-condições
- Tabela exibe empresas filtradas ou todas (se busca limpa)
- Estado da aplicação consistente
- Nenhum efeito colateral (logs, etc.)

---

## Fluxo 2: Empty State - Busca Sem Resultados

### Descrição
Usuário busca termo que não existe em nenhuma empresa.

### Pré-condições
- Mesmas do Fluxo 1
- Termo de busca não match nenhuma empresa no banco

### Passos

#### 1-3. Mesmos do Happy Path
(Usuário digita, debounce, request disparada)

#### 4. Backend Retorna Lista Vazia
```
[Database] SELECT * FROM "Companies" WHERE ... - retorna 0 rows
  ↓
[Backend] Response: { companies: [], count: 0, hasMore: false }
  ↓
[HTTP] 200 OK
  ↓
[Frontend] setRecords([]) - array vazio
```

**Estado da UI**:
- Campo de busca mostra termo (ex: "XYZ Nonexistent")
- Tabela vazia (0 rows em `<TableBody>`)
- **Mensagem de empty state**: "Nenhuma empresa encontrada" (requer implementação adicional)
- Screen reader anuncia: "0 empresas encontradas"

---

### Implementação Sugerida de Empty State

**Frontend**: Adicionar condicional em `CompaniesManagerGrid`:

```jsx
// frontend/src/components/CompaniesManager/index.js
export function CompaniesManagerGrid(props) {
  const { records, onSelect } = props;
  const classes = useStyles();

  if (records.length === 0) {
    return (
      <Paper className={classes.tableContainer}>
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          p={4}
        >
          <BusinessIcon fontSize="large" color="disabled" />
          <Typography variant="h6" color="textSecondary" gutterBottom>
            {i18n.t("compaies.search.noResults.title")}
          </Typography>
          <Typography variant="body2" color="textSecondary">
            {i18n.t("compaies.search.noResults.description")}
          </Typography>
        </Box>
      </Paper>
    );
  }

  return (
    <Paper className={classes.tableContainer}>
      <Table>
        {/* Tabela normal */}
      </Table>
    </Paper>
  );
}
```

**i18n Translations**:
```json
{
  "compaies.search.noResults.title": "Nenhuma empresa encontrada",
  "compaies.search.noResults.description": "Tente buscar por outro termo ou limpe o filtro para ver todas as empresas."
}
```

---

### Pós-condições
- Usuário entende que busca não retornou resultados (não é erro)
- Pode limpar busca facilmente (botão "X" ou Esc)

---

## Fluxo 3: Error Handling - API Falha

### Descrição
Backend retorna erro (500, timeout, network error).

### Pré-condições
- Mesmas do Fluxo 1
- Backend com problema (down, banco offline, timeout, etc.)

### Passos

#### 1-3. Mesmos do Happy Path
(Usuário digita, debounce, request disparada)

#### 4. Request Falha
```
[HTTP] GET /companies?searchParam=Test
  ↓
[Backend] Database connection timeout
  ↓
[Backend] throw new AppError("Database unavailable", 500)
  ↓
[HTTP] 500 Internal Server Error
  ↓
[Frontend] axios interceptor detecta erro
  ↓
[Frontend] catch (e) { toast.error(i18n.t("settings.toasts.recordsLoadError")) }
  ↓
[Frontend] setLoading(false)
```

**Estado da UI**:
- Campo de busca mostra termo digitado
- Tabela mantém resultados anteriores (ou vazia se primeira busca)
- Loading indicator desaparece
- **Toast de erro**: "Erro ao carregar empresas. Tente novamente." (vermelho, 5s)

---

### Cenários de Erro

#### Cenário A: Network Error (Backend Down)
```
[HTTP] GET /companies?searchParam=Test
  ↓
[Network] Connection refused (backend offline)
  ↓
[Frontend] catch (e) {
  if (e.code === 'ECONNREFUSED') {
    toast.error("Não foi possível conectar ao servidor");
  }
}
```

**UX**: Toast específico para network error.

---

#### Cenário B: Timeout (Query Lenta)
```
[HTTP] GET /companies?searchParam=Test
  ↓
[Backend] ListCompaniesService() - query demora 10s
  ↓
[Axios] timeout: 5000ms (configuração padrão)
  ↓
[HTTP] Request aborted
  ↓
[Frontend] catch (e) {
  if (e.code === 'ECONNABORTED') {
    toast.error("Operação demorou muito. Tente simplificar a busca.");
  }
}
```

**UX**: Sugere simplificar busca (menos caracteres).

---

#### Cenário C: Validação Yup Falha (Termo Muito Longo)
```
[HTTP] GET /companies?searchParam=<string com 150 caracteres>
  ↓
[Backend] Yup validation fails: "Search parameter must be at most 100 characters"
  ↓
[HTTP] 400 Bad Request
  ↓
[Frontend] catch (e) {
  toast.error(e.response.data.error);
}
```

**UX**: Toast com mensagem específica de validação.

**Prevenção**: Adicionar `maxLength={100}` no TextField do frontend:

```jsx
<TextField
  value={searchTerm}
  onChange={(e) => setSearchTerm(e.target.value)}
  inputProps={{ maxLength: 100 }}
  helperText={`${searchTerm.length}/100`}
/>
```

---

#### Cenário D: Feature Flag Desabilitada Durante Busca
```
[HTTP] GET /companies?searchParam=Test
  ↓
[Backend] FEATURE_COMPANY_SEARCH=disabled
  ↓
[Backend] whereClause = {} (ignora searchParam)
  ↓
[Backend] Retorna TODAS as empresas (primeiras 20)
  ↓
[Frontend] Recebe empresas não filtradas
```

**UX Inconsistente**: Usuário buscou "Test" mas recebeu todas as empresas.

**Solução**: Backend deve retornar status específico quando flag desabilitada:

```typescript
// backend/src/services/CompanyService/ListCompaniesService.ts
const isSearchEnabled = process.env.FEATURE_COMPANY_SEARCH === 'enabled';

if (searchParam && !isSearchEnabled) {
  throw new AppError("Search feature is currently disabled", 503);
}
```

**Frontend**: Captura 503 e esconde campo de busca:

```javascript
catch (e) {
  if (e.response?.status === 503) {
    setFeatureFlagEnabled(false); // Esconde campo
    toast.info("Busca temporariamente indisponível");
  }
}
```

---

### Recovery

**Retry Manual**: Usuário pode digitar novamente (debounce dispara nova request).

**Retry Automático** (opcional, não implementado no MVP):
```javascript
const loadPlansWithRetry = async (search = "", retries = 3) => {
  try {
    await loadPlans(search);
  } catch (e) {
    if (retries > 0 && e.response?.status >= 500) {
      setTimeout(() => loadPlansWithRetry(search, retries - 1), 2000);
      toast.info(`Tentando novamente... (${retries} tentativas restantes)`);
    } else {
      toast.error(i18n.t("settings.toasts.recordsLoadError"));
    }
  }
};
```

---

## Fluxo 4: Feature Flag Disabled

### Descrição
Feature flag desabilitada - campo de busca não renderiza.

### Pré-condições
- `FEATURE_COMPANY_SEARCH=disabled` no backend
- Frontend verifica flag (via context ou endpoint)

### Passos

#### 1. Frontend Consulta Feature Flags
```
[Frontend] App.useEffect() - init
  ↓
[HTTP] GET /settings/features (endpoint hipotético)
  ↓
[Backend] Response: { FEATURE_COMPANY_SEARCH: "disabled", ... }
  ↓
[Frontend] SettingsContext.setFeatures({ FEATURE_COMPANY_SEARCH: false })
```

**Alternativa**: Flag hardcoded no `.env` do frontend (menos flexível):
```javascript
// frontend/.env
REACT_APP_FEATURE_COMPANY_SEARCH=enabled
```

---

#### 2. CompaniesManager Não Renderiza Campo
```
[Frontend] CompaniesManager.render()
  ↓
[Context] const { features } = useSettings();
  ↓
[Conditional] {features?.FEATURE_COMPANY_SEARCH === 'enabled' && (
  <Grid xs={12} item>
    <TextField /* busca */ />
  </Grid>
)}
  ↓
[Result] Campo de busca NÃO aparece no DOM
```

**Estado da UI**:
- Interface idêntica à versão anterior (sem feature)
- Tabela mostra primeiras 20 empresas
- Usuário não percebe que feature existe (graceful degradation)

---

#### 3. Garantia de Rollback Completo

**Backend**: Mesmo que frontend envie `searchParam`, backend ignora:
```typescript
// backend/src/services/CompanyService/ListCompaniesService.ts
const isSearchEnabled = process.env.FEATURE_COMPANY_SEARCH === 'enabled';

const whereClause = (searchParam && isSearchEnabled)
  ? { /* filtro */ }
  : {}; // Ignora searchParam se flag disabled
```

**Resultado**: Zero breaking changes - sistema funciona como antes da feature.

---

## Fluxo 5: Race Condition Mitigado

### Descrição
Usuário digita rapidamente, múltiplas requests em paralelo - apenas última deve aplicar resultados.

### Cenário Problemático (Sem Mitigação)

#### Passos
```
[User] Digita "A" → espera 400ms
  ↓
[HTTP] GET /companies?searchParam=A (Request 1 - iniciada em t=0)
  ↓
[User] Digita "B" rapidamente (antes de Request 1 retornar)
  ↓ (400ms depois)
[HTTP] GET /companies?searchParam=AB (Request 2 - iniciada em t=100ms)
  ↓
[Backend] Request 2 retorna em 50ms (t=150ms)
  ↓
[Frontend] setRecords(resultsAB) - tabela mostra resultados de "AB"
  ↓
[Backend] Request 1 retorna em 200ms (t=200ms) - mais lenta!
  ↓
[Frontend] setRecords(resultsA) - tabela SOBRESCREVE com resultados de "A"
```

**Bug**: Usuário buscou "AB" mas tabela mostra resultados de "A" (race condition).

---

### Solução 1: AbortController (Recomendado)

**Implementação**:
```javascript
// frontend/src/components/CompaniesManager/index.js
const abortControllerRef = useRef(null);

const loadPlans = async (search = "") => {
  // Cancelar request anterior (se ainda pendente)
  if (abortControllerRef.current) {
    abortControllerRef.current.abort();
  }

  // Criar novo controller para esta request
  abortControllerRef.current = new AbortController();

  setLoading(true);
  try {
    const params = search ? { searchParam: search } : {};
    const { data } = await api.get("/companies", {
      params,
      signal: abortControllerRef.current.signal
    });
    setRecords(data.companies);
  } catch (e) {
    if (e.name === 'AbortError') {
      // Request cancelada - ignorar silenciosamente
      console.log('Request aborted (superseded by newer search)');
    } else {
      toast.error(i18n.t("settings.toasts.recordsLoadError"));
    }
  } finally {
    setLoading(false);
  }
};
```

**Fluxo Corrigido**:
```
[User] Digita "A" → espera 400ms
  ↓
[HTTP] GET /companies?searchParam=A (Request 1 + AbortController 1)
  ↓
[User] Digita "B" rapidamente
  ↓ (400ms depois)
[Frontend] abortControllerRef.current.abort() - cancela Request 1
  ↓
[HTTP] Request 1 abortada (never completes)
  ↓
[HTTP] GET /companies?searchParam=AB (Request 2 + AbortController 2)
  ↓
[Backend] Request 2 retorna
  ↓
[Frontend] setRecords(resultsAB) - tabela mostra "AB" (correto!)
```

**Vantagem**: Request antiga é cancelada na rede (economiza banda e CPU do backend).

---

### Solução 2: Request ID (Alternativa)

**Implementação**:
```javascript
const requestIdRef = useRef(0);

const loadPlans = async (search = "") => {
  const currentRequestId = ++requestIdRef.current;

  setLoading(true);
  try {
    const { data } = await api.get("/companies", {
      params: search ? { searchParam: search } : {}
    });

    // Apenas aplicar resultados se esta ainda é a última request
    if (currentRequestId === requestIdRef.current) {
      setRecords(data.companies);
    } else {
      console.log(`Discarding stale results (request ${currentRequestId} superseded by ${requestIdRef.current})`);
    }
  } catch (e) {
    if (currentRequestId === requestIdRef.current) {
      toast.error(i18n.t("settings.toasts.recordsLoadError"));
    }
  } finally {
    setLoading(false);
  }
};
```

**Desvantagem**: Request antiga ainda completa no backend (desperdiça recursos).

**Recomendação**: Usar **Solução 1 (AbortController)** - mais eficiente.

---

## Fluxo 6: Multi-Tenant Security Validation

### Descrição
Garantir que usuário não-super não pode burlar busca para ver outras empresas.

### Cenário de Ataque

#### Tentativa de Ataque
```
[Attacker] Usuário regular (super === false, companyId = 42)
  ↓
[Attacker] Modifica request manualmente (Postman/curl):
           GET /companies?searchParam=CompetitorCompany
  ↓
[HTTP] Headers: { Authorization: "Bearer <tokenRegularUser>" }
```

#### Backend Defesa
```
[Backend] CompanyController.index()
  ↓
[Auth] verify(token) → { id, profile, companyId: 42, super: false }
  ↓
[Controller] if (requestUser.super === true) {
               // Busca com searchParam
             } else {
               // FORÇA busca pela própria empresa
               searchParam = company.name; // Sobrescreve!
             }
  ↓
[Backend] ListCompaniesService({ searchParam: "MyOwnCompany", ... })
  ↓
[Backend] Response: { companies: [<apenas empresa 42>], count: 1 }
```

**Resultado**: Ataque falha - usuário só vê própria empresa (isolamento preservado).

---

### Teste de Segurança Obrigatório

**E2E Test**:
```javascript
// backend/src/controllers/__tests__/CompanyController.security.spec.ts
describe('CompanyController - Multi-tenant Isolation', () => {
  it('non-super user cannot search other companies via searchParam manipulation', async () => {
    // Setup: Criar 2 empresas
    const company1 = await factory.create('Company', { name: 'Company A' });
    const company2 = await factory.create('Company', { name: 'Company B' });

    // Setup: Usuário regular da Company A
    const user = await factory.create('User', {
      companyId: company1.id,
      super: false
    });
    const token = generateToken(user);

    // Attack: Tentar buscar Company B
    const response = await request(app)
      .get('/companies')
      .query({ searchParam: 'Company B' })
      .set('Authorization', `Bearer ${token}`);

    // Assertion: Deve retornar APENAS Company A
    expect(response.status).toBe(200);
    expect(response.body.companies).toHaveLength(1);
    expect(response.body.companies[0].id).toBe(company1.id);
    expect(response.body.companies[0].name).toBe('Company A');

    // Assertion: NÃO deve retornar Company B
    const companyIds = response.body.companies.map(c => c.id);
    expect(companyIds).not.toContain(company2.id);
  });

  it('super user CAN search across all companies', async () => {
    const company1 = await factory.create('Company', { name: 'Company A' });
    const company2 = await factory.create('Company', { name: 'Company B' });

    const superUser = await factory.create('User', {
      companyId: company1.id,
      super: true
    });
    const token = generateToken(superUser);

    const response = await request(app)
      .get('/companies')
      .query({ searchParam: 'Company' }) // Match ambas
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.companies.length).toBeGreaterThanOrEqual(2);

    const companyIds = response.body.companies.map(c => c.id);
    expect(companyIds).toContain(company1.id);
    expect(companyIds).toContain(company2.id);
  });
});
```

---

## Fluxo 7: Performance Monitoring

### Descrição
Monitorar performance de queries e alertar se ultrapassar threshold.

### Backend Logging

**Implementação**:
```typescript
// backend/src/services/CompanyService/ListCompaniesService.ts
import logger from "../../utils/logger";

const ListCompaniesService = async ({
  searchParam = "",
  pageNumber = "1"
}: Request): Promise<Response> => {
  const startTime = Date.now();

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

  const { count, rows: companies } = await Company.findAndCountAll({
    where: whereClause,
    include: [{ model: Plan, as: "plan", attributes: ["name"] }],
    limit: 20,
    offset: 20 * (+pageNumber - 1),
    order: [["name", "ASC"]]
  });

  const duration = Date.now() - startTime;

  // Log performance
  if (duration > 500) {
    logger.warn({
      message: 'Slow company search query detected',
      duration,
      searchParam,
      hasSearchParam: !!searchParam,
      resultCount: count,
      pageNumber,
      threshold: 500
    });
  } else {
    logger.info({
      message: 'Company search executed',
      duration,
      searchParam: searchParam ? '<redacted>' : null, // Não logar PII
      resultCount: count
    });
  }

  const hasMore = count > 20 * +pageNumber;

  return { companies, count, hasMore };
};
```

---

### Alertas e Dashboards

**Recomendações**:

#### 1. Metrics (Prometheus/Grafana)
```javascript
// backend/src/metrics.js
const promClient = require('prom-client');

const companySearchDuration = new promClient.Histogram({
  name: 'company_search_duration_ms',
  help: 'Duration of company search queries in milliseconds',
  labelNames: ['has_search_param', 'result_count_bucket'],
  buckets: [50, 100, 200, 500, 1000, 2000, 5000]
});

// No service:
companySearchDuration.observe(
  {
    has_search_param: !!searchParam,
    result_count_bucket: count < 10 ? '0-10' : count < 50 ? '10-50' : '50+'
  },
  duration
);
```

**Dashboard**: Grafana com alertas se P95 > 1000ms.

---

#### 2. Error Tracking (Sentry)
```javascript
// backend/src/services/CompanyService/ListCompaniesService.ts
if (duration > 2000) {
  Sentry.captureMessage('Company search query exceeds 2s', {
    level: 'warning',
    extra: { duration, searchParam, count }
  });
}
```

---

#### 3. Database Query Analysis
```sql
-- PostgreSQL: Analisar query plan
EXPLAIN ANALYZE
SELECT * FROM "Companies"
WHERE (
  name ILIKE '%test%' OR
  email ILIKE '%test%' OR
  document ILIKE '%test%' OR
  phone ILIKE '%test%'
)
ORDER BY name ASC LIMIT 20;

-- Verificar se índices são usados:
-- "Seq Scan" = BAD (full table scan)
-- "Index Scan" ou "Bitmap Index Scan" = GOOD
```

**Action**: Se ver "Seq Scan" em tabela com 10k+ registros, criar índices trigram.

---

## Anexo: Mensagens de i18n

### Português (pt-BR)
```json
{
  "compaies.search.placeholder": "Buscar por nome, email, documento ou telefone",
  "compaies.search.ariaLabel": "Campo de busca de empresas. Digite para filtrar empresas por nome, email, documento ou telefone",
  "compaies.search.loading": "Buscando empresas...",
  "compaies.search.results": "{count} empresa(s) encontrada(s)",
  "compaies.search.noResults.title": "Nenhuma empresa encontrada",
  "compaies.search.noResults.description": "Tente buscar por outro termo ou limpe o filtro para ver todas as empresas.",
  "compaies.search.helperText": "{length}/100 caracteres"
}
```

### Inglês (en)
```json
{
  "compaies.search.placeholder": "Search by name, email, document or phone",
  "compaies.search.ariaLabel": "Company search field. Type to filter companies by name, email, document or phone",
  "compaies.search.loading": "Searching companies...",
  "compaies.search.results": "{count} company(ies) found",
  "compaies.search.noResults.title": "No companies found",
  "compaies.search.noResults.description": "Try searching for another term or clear the filter to see all companies.",
  "compaies.search.helperText": "{length}/100 characters"
}
```

### Espanhol (es)
```json
{
  "compaies.search.placeholder": "Buscar por nombre, correo, documento o teléfono",
  "compaies.search.ariaLabel": "Campo de búsqueda de empresas. Escriba para filtrar empresas por nombre, correo, documento o teléfono",
  "compaies.search.loading": "Buscando empresas...",
  "compaies.search.results": "{count} empresa(s) encontrada(s)",
  "compaies.search.noResults.title": "No se encontraron empresas",
  "compaies.search.noResults.description": "Intente buscar otro término o limpie el filtro para ver todas las empresas.",
  "compaies.search.helperText": "{length}/100 caracteres"
}
```

### Turco (tr)
```json
{
  "compaies.search.placeholder": "İsim, e-posta, belge veya telefona göre ara",
  "compaies.search.ariaLabel": "Şirket arama alanı. İsim, e-posta, belge veya telefona göre şirketleri filtrelemek için yazın",
  "compaies.search.loading": "Şirketler aranıyor...",
  "compaies.search.results": "{count} şirket bulundu",
  "compaies.search.noResults.title": "Şirket bulunamadı",
  "compaies.search.noResults.description": "Başka bir terim aramayı deneyin veya tüm şirketleri görmek için filtreyi temizleyin.",
  "compaies.search.helperText": "{length}/100 karakter"
}
```

### Árabe (ar)
```json
{
  "compaies.search.placeholder": "البحث بالاسم أو البريد الإلكتروني أو المستند أو الهاتف",
  "compaies.search.ariaLabel": "حقل البحث عن الشركات. اكتب لتصفية الشركات حسب الاسم أو البريد الإلكتروني أو المستند أو الهاتف",
  "compaies.search.loading": "جارٍ البحث عن الشركات...",
  "compaies.search.results": "تم العثور على {count} شركة (شركات)",
  "compaies.search.noResults.title": "لم يتم العثور على شركات",
  "compaies.search.noResults.description": "حاول البحث عن مصطلح آخر أو امسح الفلتر لرؤية جميع الشركات.",
  "compaies.search.helperText": "{length}/100 حرف"
}
```

---

## Anexo: Snippets de Código

### Frontend: Componente Completo com Todas as Features

```jsx
// frontend/src/components/CompaniesManager/index.js
import React, { useState, useEffect, useRef } from "react";
import {
  makeStyles,
  Paper,
  Grid,
  TextField,
  InputAdornment,
  IconButton,
  Typography,
  Box
} from "@material-ui/core";
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  Business as BusinessIcon
} from "@material-ui/icons";
import { useDebounce } from 'use-debounce';
import { toast } from "react-toastify";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import useCompanies from "../../hooks/useCompanies";
import { CompanyForm, CompaniesManagerGrid } from "./components"; // Extraídos

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    width: "100%",
    flex: 1,
  },
  searchField: {
    marginBottom: theme.spacing(2)
  },
  srOnly: {
    position: 'absolute',
    left: '-10000px',
    width: '1px',
    height: '1px',
    overflow: 'hidden'
  }
}));

export default function CompaniesManager() {
  const classes = useStyles();
  const { save, update, remove } = useCompanies();

  // Estados
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm] = useDebounce(searchTerm, 400);
  const [loading, setLoading] = useState(false);
  const [records, setRecords] = useState([]);
  const [record, setRecord] = useState({
    name: "",
    email: "",
    phone: "",
    planId: "",
    status: true,
    dueDate: "",
    recurrence: "",
    password: "",
    document: "",
    paymentMethod: ""
  });
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [featureFlagEnabled, setFeatureFlagEnabled] = useState(true);

  // Refs
  const searchInputRef = useRef(null);
  const abortControllerRef = useRef(null);

  // Carregar empresas inicialmente
  useEffect(() => {
    loadCompanies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Recarregar ao mudar busca debounced
  useEffect(() => {
    loadCompanies(debouncedSearchTerm);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchTerm]);

  const loadCompanies = async (search = "") => {
    // Cancelar request anterior
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setLoading(true);

    try {
      const params = search ? { searchParam: search } : {};
      const { data } = await api.get("/companies", {
        params,
        signal: abortControllerRef.current.signal
      });

      setRecords(data.companies);
    } catch (e) {
      if (e.name === 'AbortError') {
        // Request cancelada - ignorar
        console.log('Search request aborted');
      } else if (e.response?.status === 503) {
        // Feature flag desabilitada
        setFeatureFlagEnabled(false);
        toast.info(i18n.t("compaies.search.featureDisabled"));
      } else {
        toast.error(i18n.t("settings.toasts.recordsLoadError"));
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (data) => {
    setLoading(true);
    try {
      if (data.id !== undefined) {
        await update(data);
      } else {
        await save(data);
      }
      await loadCompanies(debouncedSearchTerm);
      handleCancel();
      toast.success(i18n.t("settings.toasts.operationSuccess"));
    } catch (e) {
      toast.error(i18n.t("settings.toasts.companyOperationError"));
    }
    setLoading(false);
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await remove(record.id);
      await loadCompanies(debouncedSearchTerm);
      handleCancel();
      toast.success(i18n.t("settings.toasts.operationSuccess"));
    } catch (e) {
      toast.error(i18n.t("settings.toasts.operationDeleteError"));
    }
    setLoading(false);
  };

  const handleOpenDeleteDialog = () => {
    setShowConfirmDialog(true);
  };

  const handleCancel = () => {
    setRecord({
      name: "",
      email: "",
      phone: "",
      planId: "",
      status: true,
      dueDate: "",
      recurrence: "",
      password: "",
      document: "",
      paymentMethod: ""
    });
  };

  const handleSelect = (data) => {
    setRecord({
      id: data.id,
      name: data.name || "",
      phone: data.phone || "",
      email: data.email || "",
      planId: data.planId || "",
      status: data.status === false ? false : true,
      dueDate: data.dueDate || "",
      recurrence: data.recurrence || "",
      password: "",
      document: data.document || "",
      paymentMethod: data.paymentMethod || "",
    });
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    searchInputRef.current?.focus();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape' && searchTerm) {
      handleClearSearch();
    }
  };

  return (
    <Paper className={classes.mainPaper} elevation={0}>
      <Grid spacing={2} container>
        {/* Campo de busca (condicional à feature flag) */}
        {featureFlagEnabled && (
          <Grid xs={12} item>
            <TextField
              fullWidth
              variant="outlined"
              placeholder={i18n.t("compaies.search.placeholder")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={handleKeyDown}
              inputRef={searchInputRef}
              className={classes.searchField}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleClearSearch}
                      size="small"
                      aria-label={i18n.t("compaies.search.clearButton")}
                    >
                      <ClearIcon />
                    </IconButton>
                  </InputAdornment>
                )
              }}
              inputProps={{
                maxLength: 100,
                'aria-label': i18n.t("compaies.search.ariaLabel"),
                'aria-describedby': 'search-results-count'
              }}
              helperText={i18n.t("compaies.search.helperText", { length: searchTerm.length })}
            />
            {/* Screen reader announcement */}
            <div id="search-results-count" aria-live="polite" className={classes.srOnly}>
              {loading
                ? i18n.t("compaies.search.loading")
                : i18n.t("compaies.search.results", { count: records.length })
              }
            </div>
          </Grid>
        )}

        {/* Formulário de empresa */}
        <Grid xs={12} item>
          <CompanyForm
            initialValue={record}
            onDelete={handleOpenDeleteDialog}
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            loading={loading}
          />
        </Grid>

        {/* Grid de empresas */}
        <Grid xs={12} item>
          <CompaniesManagerGrid records={records} onSelect={handleSelect} />
        </Grid>
      </Grid>

      {/* Modal de confirmação de delete */}
      <ConfirmationModal
        title={i18n.t("settings.modals.deleteTitle")}
        open={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
        onConfirm={() => handleDelete()}
      >
        {i18n.t("settings.modals.deleteConfirmation")}
      </ConfirmationModal>
    </Paper>
  );
}
```

---

### Backend: Service Completo com Logging

```typescript
// backend/src/services/CompanyService/ListCompaniesService.ts
import { Sequelize, Op } from "sequelize";
import Company from "../../models/Company";
import Plan from "../../models/Plan";
import logger from "../../utils/logger";

interface Request {
  searchParam?: string;
  pageNumber?: string;
}

interface Response {
  companies: Company[];
  count: number;
  hasMore: boolean;
}

const ListCompaniesService = async ({
  searchParam = "",
  pageNumber = "1"
}: Request): Promise<Response> => {
  const startTime = Date.now();

  const limit = 20;
  const offset = limit * (+pageNumber - 1);

  // Feature flag check
  const isSearchEnabled = process.env.FEATURE_COMPANY_SEARCH === 'enabled';

  // Se searchParam fornecido mas feature disabled, lançar erro
  if (searchParam && !isSearchEnabled) {
    logger.warn({
      message: 'Search attempted but feature flag disabled',
      searchParam: '<redacted>'
    });
    throw new Error('Search feature is currently disabled');
  }

  // Construir where clause condicional
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

  const { count, rows: companies } = await Company.findAndCountAll({
    where: whereClause,
    include: [{
      model: Plan,
      as: "plan",
      attributes: ["name"]
    }],
    limit,
    offset,
    order: [["name", "ASC"]]
  });

  const hasMore = count > offset + companies.length;

  // Performance logging
  const duration = Date.now() - startTime;

  if (duration > 500) {
    logger.warn({
      message: 'Slow company search query',
      duration,
      hasSearchParam: !!searchParam,
      resultCount: count,
      pageNumber,
      threshold: 500
    });
  } else {
    logger.info({
      message: 'Company search executed',
      duration,
      hasSearchParam: !!searchParam,
      resultCount: count
    });
  }

  return {
    companies,
    count,
    hasMore
  };
};

export default ListCompaniesService;
```

---

## Conclusão

Este documento detalhou todos os fluxos de interação da feature de busca de empresas, incluindo:

1. **Happy Path**: Fluxo ideal de busca
2. **Empty State**: Busca sem resultados
3. **Error Handling**: Tratamento de erros (network, timeout, validação)
4. **Feature Flag**: Desabilitação da feature
5. **Race Condition**: Mitigação com AbortController
6. **Security**: Validação multi-tenant
7. **Performance**: Monitoramento e logging

Para implementação completa, consulte também:
- [ADR-2025-01-13-search-companies.md](./ADR-2025-01-13-search-companies.md) - Decisões arquiteturais
- `docs/backend/services.md` - Padrões de services
- `docs/frontend/components.md` - Padrões de componentes

---

**Última Atualização**: 2025-01-13
**Autor**: Claude Code (Software Architect AI)
