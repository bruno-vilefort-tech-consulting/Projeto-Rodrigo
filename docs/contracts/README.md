# Contratos da API - ChatIA Flow

Este diretório contém a documentação completa dos contratos da API do ChatIA Flow, garantindo comunicação clara entre frontend e backend.

## Estrutura

```
contracts/
├── README.md                         # Este arquivo
├── companies-api-contract.md         # Documentação detalhada da API de Companies
├── companies-openapi.yaml            # Especificação OpenAPI 3.0 para Companies
└── integration-plan.md               # [Futuro] Plano de integração geral
```

## Arquivos Disponíveis

### 1. companies-api-contract.md

Documentação técnica completa da API de Companies, incluindo:

- **Endpoints:** Todos os 6 endpoints REST principais + auxiliares
- **Request/Response:** Schemas detalhados com exemplos
- **Autenticação:** JWT Bearer Token e RBAC
- **Multi-Tenant:** Estratégias de isolamento e segurança
- **Problema Atual:** Análise do searchParam ignorado
- **Migração Futura:** Plano de 4 horas para server-side search
- **Performance:** Índices, otimizações e escalabilidade
- **Testes:** Exemplos de testes unitários e de integração
- **Error Handling:** Códigos HTTP e estruturas de erro
- **Observabilidade:** Logging, métricas e monitoramento

**Público-alvo:** Desenvolvedores backend/frontend, QA, DevOps

**Como usar:**
```bash
# Ler documentação
cd docs/contracts
cat companies-api-contract.md

# Buscar seção específica
grep -A 20 "GET /companies" companies-api-contract.md
```

### 2. companies-openapi.yaml

Especificação OpenAPI 3.0 para a API de Companies, compatível com ferramentas como:
- Swagger UI
- Postman
- Insomnia
- Redoc
- Stoplight

**Como usar:**

#### Visualizar no Swagger UI

```bash
# Opção 1: Docker
docker run -p 8080:8080 \
  -e SWAGGER_JSON=/foo/companies-openapi.yaml \
  -v $(pwd)/docs/contracts:/foo \
  swaggerapi/swagger-ui

# Abrir http://localhost:8080

# Opção 2: Swagger Editor online
# Acessar https://editor.swagger.io/
# Importar companies-openapi.yaml
```

#### Importar no Postman

1. Abrir Postman
2. File → Import
3. Selecionar `companies-openapi.yaml`
4. Criar collection "ChatIA Flow - Companies API"
5. Configurar variáveis:
   - `base_url`: `http://localhost:3000/api`
   - `token`: `<seu_jwt_token>`
   - `companyId`: `123`

#### Gerar Cliente TypeScript

```bash
# Instalar openapi-generator-cli
npm install -g @openapitools/openapi-generator-cli

# Gerar client TypeScript
openapi-generator-cli generate \
  -i docs/contracts/companies-openapi.yaml \
  -g typescript-axios \
  -o frontend/src/api/generated/companies

# Usar no frontend
import { CompaniesApi } from './api/generated/companies';

const api = new CompaniesApi();
const companies = await api.listCompanies({ pageNumber: "1" });
```

#### Gerar Mock Server

```bash
# Instalar prism (API Mock Server)
npm install -g @stoplight/prism-cli

# Iniciar mock server
prism mock docs/contracts/companies-openapi.yaml -p 4010

# Testar
curl http://localhost:4010/companies
```

#### Validar Requisições

```bash
# Validar spec
openapi-generator-cli validate -i docs/contracts/companies-openapi.yaml

# Validar requests com prism
prism proxy docs/contracts/companies-openapi.yaml \
  http://localhost:3000/api \
  -p 4010
```

## Convenções de Documentação

### Formato

- **Markdown:** Para documentação detalhada e narrativa
- **OpenAPI:** Para especificações técnicas e automação

### Versionamento

Seguir Semantic Versioning (SemVer):

- **MAJOR:** Mudanças incompatíveis (breaking changes)
- **MINOR:** Adição de funcionalidades (retrocompatível)
- **PATCH:** Correções de bugs (retrocompatível)

Exemplo:
```markdown
**Versão:** 1.0.0
**Data:** 2025-10-13
```

### Estrutura de Documentação

Cada contrato deve incluir:

1. **Sumário Executivo:** Visão geral em 2-3 parágrafos
2. **Autenticação:** Como autenticar requisições
3. **Endpoints:** Lista completa de rotas
4. **Request/Response:** Schemas detalhados
5. **Códigos HTTP:** Tabela de códigos de resposta
6. **Exemplos cURL:** Exemplos práticos
7. **Testes:** Casos de teste sugeridos
8. **Migração:** Plano de mudanças futuras
9. **Referências:** Links para código e docs relacionados

### Estado Atual vs. Futuro

Documentar sempre dois estados:

- **ESTADO ATUAL (É):** Como a API funciona hoje
- **ESTADO FUTURO (DEVERIA SER):** Como funcionará após migração

Exemplo:
```markdown
| Aspecto | Estado Atual | Futuro (Migração) |
|---------|--------------|-------------------|
| Busca | Client-side (useMemo) | Server-side (opcional) |
| searchParam | Aceito mas ignorado | Implementado no service |
```

### Retrocompatibilidade

Toda mudança DEVE garantir retrocompatibilidade:

```markdown
**GARANTIA:** Se `searchParam` for vazio, omitido ou `undefined`,
o comportamento é **IDÊNTICO** ao atual.
```

### Multi-Tenant

Documentar explicitamente as garantias de isolamento:

```markdown
**SEGURANÇA MULTI-TENANT:**
- User regular NUNCA vê dados de outra company
- Tentativas de acesso cross-tenant retornam 400 Bad Request
- RBAC em 2 camadas: controller + service
```

## Workflow de Atualização

### 1. Propor Mudança

```bash
# Criar branch
git checkout -b docs/update-companies-contract

# Atualizar documentação
vim docs/contracts/companies-api-contract.md

# Atualizar OpenAPI
vim docs/contracts/companies-openapi.yaml
```

### 2. Revisar

- Verificar retrocompatibilidade
- Validar OpenAPI spec
- Testar exemplos cURL
- Revisar com equipe

### 3. Aprovar e Merge

```bash
# Commit
git add docs/contracts/
git commit -m "docs: update companies contract to v1.1.0"

# Push e criar PR
git push origin docs/update-companies-contract
gh pr create --title "docs: update companies contract to v1.1.0"
```

### 4. Comunicar

- Notificar equipe de frontend
- Atualizar Slack #api-changes
- Criar entry no CHANGELOG.md

## Ferramentas Recomendadas

### Visualização

- **Swagger UI:** https://swagger.io/tools/swagger-ui/
- **Redoc:** https://redocly.com/
- **Stoplight:** https://stoplight.io/

### Validação

- **OpenAPI Generator:** https://openapi-generator.tech/
- **Prism Mock Server:** https://stoplight.io/open-source/prism

### Testes

- **Postman:** Importar collection via OpenAPI
- **Insomnia:** Importar spec e testar endpoints
- **curl:** Exemplos prontos na documentação

### Geração de Código

```bash
# Cliente TypeScript
openapi-generator-cli generate -g typescript-axios

# Cliente JavaScript
openapi-generator-cli generate -g javascript

# Documentação HTML
openapi-generator-cli generate -g html2
```

## Checklist de Qualidade

Antes de publicar um contrato, verificar:

- [ ] Todos os endpoints documentados
- [ ] Request/Response schemas completos
- [ ] Exemplos cURL funcionais
- [ ] Códigos HTTP documentados
- [ ] Autenticação explicada
- [ ] RBAC descrito (super vs. regular)
- [ ] Multi-tenant garantido
- [ ] Retrocompatibilidade garantida
- [ ] OpenAPI spec válida (`openapi-generator-cli validate`)
- [ ] Exemplos testados manualmente
- [ ] Migração futura planejada
- [ ] Observabilidade definida
- [ ] Performance analisada
- [ ] Testes sugeridos

## Próximos Contratos a Documentar

Prioridade:

1. **Users API** - Gerenciamento de usuários
2. **Tickets API** - Sistema de tickets (core do ChatIA)
3. **Whatsapp API** - Integração com WhatsApp
4. **Queues API** - Gerenciamento de filas
5. **Messages API** - Envio e recebimento de mensagens
6. **Contacts API** - Gerenciamento de contatos
7. **Settings API** - Configurações gerais
8. **Auth API** - Login, logout, refresh token

## Referências

- [OpenAPI 3.0 Specification](https://swagger.io/specification/)
- [REST API Best Practices](https://restfulapi.net/)
- [HTTP Status Codes](https://httpstatuses.com/)
- [JWT Authentication](https://jwt.io/introduction)
- [Semantic Versioning](https://semver.org/)

## Suporte

Dúvidas sobre contratos da API:

- **Slack:** #api-docs
- **Email:** dev@chatiaflow.com
- **Docs:** `docs/contracts/`
- **Issues:** GitHub Issues com tag `documentation`
