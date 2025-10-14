# Índice de Contratos da API - ChatIA Flow

Documentação completa dos contratos da API de Companies do ChatIA Flow.

## Estrutura de Arquivos

```
docs/contracts/
├── INDEX.md                              # Este arquivo (índice visual)
├── README.md                             # Guia de uso e convenções (7.9KB)
│
├── companies-api-contract.md             # Documentação técnica completa (60KB)
│   ├── Seção 1: Autenticação e Autorização
│   ├── Seção 2: Endpoints da API (10 endpoints)
│   ├── Seção 3: Problema Atual (searchParam ignorado)
│   ├── Seção 4: Implementação Futura (server-side search)
│   ├── Seção 5: Multi-Tenant Security
│   ├── Seção 6: Performance e Escalabilidade
│   ├── Seção 7: Estratégia de Migração
│   ├── Seção 8: Validação e Sanitização
│   ├── Seção 9: Error Handling
│   ├── Seção 10: Observabilidade
│   ├── Seção 11: Checklist Multi-Tenant
│   ├── Seção 12: Referências e Anexos
│   ├── Seção 13: Diagrama de Sequência
│   └── Seção 14: Conclusão
│
├── companies-openapi.yaml                # Especificação OpenAPI 3.0 (26KB)
│   ├── Info e Servers
│   ├── Security Schemes (JWT Bearer)
│   ├── Paths (10 endpoints)
│   ├── Components (Schemas reutilizáveis)
│   └── Responses (Padrões de erro)
│
├── companies-postman-collection.json     # Collection Postman (21KB)
│   ├── Companies (8 requests)
│   ├── Plans (2 requests)
│   ├── Pre-request Scripts
│   ├── Test Scripts
│   └── Environment Variables
│
└── companies-api-summary.md              # Resumo executivo (8.4KB)
    ├── Visão Geral
    ├── Endpoints Principais
    ├── Segurança Multi-Tenant
    ├── Estado Atual vs. Futuro
    ├── Roadmap de Melhorias
    ├── Métricas de Qualidade
    ├── Riscos e Mitigações
    └── KPIs e Monitoramento
```

## Guia de Uso por Perfil

### Desenvolvedores Backend

**Objetivo:** Implementar/manter API de Companies

**Arquivos principais:**
1. `companies-api-contract.md` - Leitura completa
2. `companies-openapi.yaml` - Validação de schemas
3. `companies-postman-collection.json` - Testes manuais

**Workflow:**
```bash
# 1. Ler contrato
cat docs/contracts/companies-api-contract.md | less

# 2. Validar OpenAPI
openapi-generator-cli validate -i docs/contracts/companies-openapi.yaml

# 3. Importar collection no Postman
# File → Import → companies-postman-collection.json

# 4. Implementar endpoint seguindo contrato
# Código em: backend/src/controllers/CompanyController.ts
```

### Desenvolvedores Frontend

**Objetivo:** Integrar com API de Companies

**Arquivos principais:**
1. `companies-api-summary.md` - Visão geral rápida
2. `companies-api-contract.md` - Seções 2 (Endpoints) e 9 (Error Handling)
3. `companies-postman-collection.json` - Testar requisições

**Workflow:**
```bash
# 1. Entender endpoints disponíveis
grep "^###.*GET\|POST\|PUT\|DELETE" docs/contracts/companies-api-contract.md

# 2. Ver exemplos de request/response
# Abrir companies-api-contract.md na seção 2

# 3. Gerar cliente TypeScript (opcional)
openapi-generator-cli generate \
  -i docs/contracts/companies-openapi.yaml \
  -g typescript-axios \
  -o frontend/src/api/generated/companies

# 4. Usar no código
import { CompaniesApi } from './api/generated/companies';
```

### QA/Testers

**Objetivo:** Testar API de Companies

**Arquivos principais:**
1. `companies-postman-collection.json` - Collection completa
2. `companies-api-contract.md` - Seção 2 (Endpoints) e 11 (Checklist)
3. `companies-api-summary.md` - Métricas de qualidade

**Workflow:**
```bash
# 1. Importar collection no Postman
# File → Import → companies-postman-collection.json

# 2. Configurar variáveis
# - base_url: http://localhost:3000/api
# - token: <obter via /auth/login>
# - companyId: 123

# 3. Executar testes automatizados
# Collection Runner → Run

# 4. Validar checklist multi-tenant
# Ler seção 11 do companies-api-contract.md
```

### Product Managers / Stakeholders

**Objetivo:** Entender status e roadmap da API

**Arquivos principais:**
1. `companies-api-summary.md` - Leitura completa
2. `INDEX.md` - Este arquivo (visão geral)

**Workflow:**
```bash
# 1. Ler resumo executivo
cat docs/contracts/companies-api-summary.md

# 2. Verificar roadmap
# Seção "Roadmap de Melhorias"

# 3. Avaliar riscos
# Seção "Riscos e Mitigações"

# 4. Monitorar KPIs
# Seção "KPIs e Monitoramento"
```

### DevOps / SRE

**Objetivo:** Monitorar e escalar API

**Arquivos principais:**
1. `companies-api-summary.md` - Seções de métricas e KPIs
2. `companies-api-contract.md` - Seções 6 (Performance) e 10 (Observabilidade)

**Workflow:**
```bash
# 1. Verificar métricas de performance
# companies-api-summary.md → Performance

# 2. Implementar índices PostgreSQL
# companies-api-contract.md → Seção 6

# 3. Configurar alertas
# companies-api-summary.md → Alertas

# 4. Monitorar logs
tail -f /var/log/chatia/backend.log | grep "companies"
```

## Atalhos Rápidos

### Ver todos os endpoints

```bash
grep -E "^### \d+\.\d+\. (GET|POST|PUT|DELETE)" docs/contracts/companies-api-contract.md
```

**Saída:**
```
### 2.1. GET /companies - Listar Companies (Paginado)
### 2.2. GET /companies/list - Listar Todas Companies (Sem Paginação)
### 2.3. GET /companies/:id - Buscar Company por ID
### 2.4. GET /companies/current - Buscar Company Atual do Usuário
### 2.5. POST /companies - Criar Nova Company
### 2.6. PUT /companies/:id - Atualizar Company
### 2.7. PUT /companies/:id/schedules - Atualizar Horários da Company
### 2.8. DELETE /companies/:id - Excluir Company
### 2.9. GET /companies/listPlan/:id - Buscar Plano da Company
### 2.10. GET /companiesPlan - Listar Companies com Planos
```

### Ver exemplos cURL

```bash
grep -A 10 "curl -X" docs/contracts/companies-api-contract.md
```

### Ver códigos HTTP

```bash
grep -E "^\| \d{3} \|" docs/contracts/companies-api-contract.md
```

### Ver schemas de request

```bash
grep -A 20 "#### Request Body" docs/contracts/companies-api-contract.md
```

## Ferramentas Úteis

### Swagger UI (Visualizar OpenAPI)

```bash
docker run -p 8080:8080 \
  -e SWAGGER_JSON=/foo/companies-openapi.yaml \
  -v $(pwd)/docs/contracts:/foo \
  swaggerapi/swagger-ui

# Abrir: http://localhost:8080
```

### Prism Mock Server

```bash
npm install -g @stoplight/prism-cli

prism mock docs/contracts/companies-openapi.yaml -p 4010

# Testar: curl http://localhost:4010/companies
```

### OpenAPI Validator

```bash
npm install -g @openapitools/openapi-generator-cli

openapi-generator-cli validate -i docs/contracts/companies-openapi.yaml
```

### Newman (Postman CLI)

```bash
npm install -g newman

newman run docs/contracts/companies-postman-collection.json \
  --environment env.json \
  --reporters cli,html
```

## Convenções de Nomenclatura

### Arquivos

- `{entity}-api-contract.md` - Documentação detalhada
- `{entity}-openapi.yaml` - Especificação OpenAPI
- `{entity}-postman-collection.json` - Collection Postman
- `{entity}-api-summary.md` - Resumo executivo

### Branches

- `docs/update-{entity}-contract` - Atualização de contrato
- `docs/new-{entity}-contract` - Novo contrato

### Commits

- `docs: add {entity} contract` - Novo contrato
- `docs: update {entity} contract to v{version}` - Atualização
- `docs: fix typo in {entity} contract` - Correção

## Status dos Contratos

| API | Status | Versão | Última Atualização |
|-----|--------|--------|--------------------|
| Companies | ✅ Completo | 1.0.0 | 2025-10-13 |
| Users | 🚧 Pendente | - | - |
| Tickets | 🚧 Pendente | - | - |
| Whatsapp | 🚧 Pendente | - | - |
| Queues | 🚧 Pendente | - | - |
| Messages | 🚧 Pendente | - | - |
| Contacts | 🚧 Pendente | - | - |
| Settings | 🚧 Pendente | - | - |
| Auth | 🚧 Pendente | - | - |

## Próximos Passos

1. [ ] Criar contrato da API de Users
2. [ ] Criar contrato da API de Tickets
3. [ ] Criar contrato da API de Whatsapp
4. [ ] Implementar testes automatizados baseados nos contratos
5. [ ] Configurar CI/CD para validar contratos no PR
6. [ ] Gerar documentação HTML com Redoc

## Contato

- **Slack:** #api-docs
- **Email:** dev@chatiaflow.com
- **Issues:** GitHub Issues (tag: `documentation`)

---

**Última Atualização:** 2025-10-13
**Versão do Índice:** 1.0.0
