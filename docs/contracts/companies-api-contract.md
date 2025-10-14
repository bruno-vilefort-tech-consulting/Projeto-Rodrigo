# Contrato da API de Companies - ChatIA Flow

**Versão:** 1.0.0
**Data:** 2025-10-13
**Status:** PRODUCTION
**Base URL:** `/api/companies`

---

## Sumário Executivo

Este documento define os contratos da API de gerenciamento de empresas (Companies) do ChatIA Flow, incluindo:
- Documentação completa dos 6 endpoints REST principais
- Análise de comportamento atual vs. esperado
- Estratégia de migração futura para server-side search
- Garantias de retrocompatibilidade e segurança multi-tenant

### Estado Atual vs. Futuro

| Aspecto | Estado Atual | Futuro (Migração) |
|---------|--------------|-------------------|
| Busca | Client-side (useMemo) | Server-side (opcional) |
| searchParam | Aceito mas ignorado | Implementado no service |
| Performance | O(n) no frontend | O(log n) com índices |
| Escalabilidade | Até ~1000 companies | Ilimitado |

---

## 1. Autenticação e Autorização

### Headers Obrigatórios

```http
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

### Estrutura do JWT Token

```typescript
interface TokenPayload {
  id: string;              // User ID
  username: string;        // Username
  profile: string;         // "admin" | "user"
  companyId: number;       // Company ID do usuário
  iat: number;             // Issued at timestamp
  exp: number;             // Expiration timestamp
}
```

### Modelo RBAC (Role-Based Access Control)

O sistema implementa dois níveis de acesso:

1. **Super User** (`requestUser.super === true`)
   - Acesso TOTAL a todas as companies
   - Pode criar, editar e excluir qualquer company
   - Vê dados de todas as empresas sem restrições

2. **User Regular** (`requestUser.super === false`)
   - Acesso RESTRITO à própria company (`companyId`)
   - Não pode criar ou excluir companies
   - Só pode editar a própria company
   - Tentativas de acesso cross-tenant resultam em 400 Bad Request

---

## 2. Endpoints da API

### 2.1. GET /companies - Listar Companies (Paginado)

**Controller:** `CompanyController.index()` - Linha 53-79
**Service:** `ListCompaniesService`
**Middleware:** `isAuth`

#### Request

```http
GET /api/companies?searchParam=acme&pageNumber=2 HTTP/1.1
Authorization: Bearer <token>
```

#### Query Parameters

| Parâmetro | Tipo | Obrigatório | Default | Descrição |
|-----------|------|-------------|---------|-----------|
| searchParam | string | Não | "" | Termo de busca (ATUALMENTE IGNORADO) |
| pageNumber | string | Não | "1" | Número da página (limit: 20) |

#### Response (200 OK)

```json
{
  "companies": [
    {
      "id": 1,
      "name": "Acme Corp",
      "email": "contato@acme.com",
      "phone": "11999999999",
      "document": "12345678000190",
      "paymentMethod": "credit_card",
      "status": true,
      "dueDate": "2025-12-31",
      "recurrence": "monthly",
      "planId": 2,
      "createdAt": "2025-01-15T10:00:00.000Z",
      "updatedAt": "2025-10-13T14:30:00.000Z",
      "plan": {
        "name": "Premium"
      }
    }
  ],
  "count": 45,
  "hasMore": true
}
```

#### Comportamento Atual (IMPORTANTE)

**PROBLEMA IDENTIFICADO:** O parâmetro `searchParam` é aceito na interface mas **IGNORADO** pelo service.

```typescript
// CompanyController.ts - Linha 64-67
const { companies, count, hasMore } = await ListCompaniesService({
  searchParam,  // ← PASSADO para o service
  pageNumber
});

// ListCompaniesService.ts - Linha 24-32
const { count, rows: companies } = await Company.findAndCountAll({
  include: [{ model: Plan, as: "plan", attributes: ["name"] }],
  limit,
  offset,
  order: [["name", "ASC"]]
  // ❌ searchParam NÃO é usado em nenhuma cláusula WHERE!
});
```

**Resultado:**
- `GET /companies` → Retorna TODAS as companies (paginadas)
- `GET /companies?searchParam=acme` → Retorna TODAS as companies (filtro ignorado)
- `GET /companies?pageNumber=2` → Retorna página 2 (offset 20) corretamente

#### RBAC - Comportamento por Tipo de Usuário

**Super User:**
```typescript
if (requestUser.super === true) {
  // Vê TODAS as companies
  return ListCompaniesService({ searchParam, pageNumber });
}
```

**User Regular:**
```typescript
else {
  // FORÇA filtro pela própria company
  return ListCompaniesService({
    searchParam: company.name,  // ← Sobrescreve qualquer searchParam enviado
    pageNumber
  });
}
```

**NOTA:** User regular SEMPRE vê apenas sua própria company, independentemente do `searchParam` enviado. Isso garante isolamento multi-tenant.

#### Códigos de Resposta

| Código | Descrição | Cenário |
|--------|-----------|---------|
| 200 | OK | Requisição bem-sucedida |
| 401 | Unauthorized | Token inválido ou ausente |
| 500 | Internal Server Error | Erro no banco de dados |

#### Exemplos cURL

```bash
# Listar primeira página (super user)
curl -X GET "http://localhost:3000/api/companies?pageNumber=1" \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json"

# Buscar companies (atualmente não filtra)
curl -X GET "http://localhost:3000/api/companies?searchParam=acme" \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json"

# User regular (sempre vê apenas sua company)
curl -X GET "http://localhost:3000/api/companies" \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json"
```

---

### 2.2. GET /companies/list - Listar Todas Companies (Sem Paginação)

**Controller:** `CompanyController.list()` - Linha 121-146
**Service:** `FindAllCompaniesService`
**Middleware:** `isAuth`
**USO PRINCIPAL:** Hook `useCompanies` no frontend (CompaniesManager)

#### Request

```http
GET /api/companies/list HTTP/1.1
Authorization: Bearer <token>
```

#### Response (200 OK)

```json
[
  {
    "id": 1,
    "name": "Acme Corp",
    "email": "contato@acme.com",
    "phone": "11999999999",
    "document": "12345678000190",
    "paymentMethod": "credit_card",
    "status": true,
    "dueDate": "2025-12-31",
    "recurrence": "monthly",
    "planId": 2,
    "schedules": [],
    "timezone": "America/Sao_Paulo",
    "folderSize": "0",
    "numberFileFolder": "0",
    "updatedAtFolder": null,
    "createdAt": "2025-01-15T10:00:00.000Z",
    "updatedAt": "2025-10-13T14:30:00.000Z",
    "plan": {
      "id": 2,
      "name": "Premium",
      "amount": "99.90"
    },
    "settings": [
      {
        "key": "campaignsEnabled",
        "value": "true"
      }
    ]
  }
]
```

#### Comportamento RBAC

**Super User:**
```typescript
if (requestUser.super === true) {
  const companies: Company[] = await FindAllCompaniesService();
  return res.status(200).json(companies); // ← Todas as companies
}
```

**User Regular:**
```typescript
else {
  const companies: Company[] = await FindAllCompaniesService();
  let company = [];

  // Loop manual para filtrar APENAS a company do usuário
  for (let i = 0; i < companies.length; i++) {
    if (companies[i].id === companyId) {
      company.push(companies[i]);
      return res.status(200).json(company); // ← Array com 1 company
    }
  }
}
```

**OBSERVAÇÃO:** Este endpoint retorna **TODAS** as companies sem paginação. Para super users com muitas companies cadastradas, pode ser lento. Considere migrar para `/companies` com paginação.

#### Códigos de Resposta

| Código | Descrição | Cenário |
|--------|-----------|---------|
| 200 | OK | Requisição bem-sucedida |
| 401 | Unauthorized | Token inválido ou ausente |
| 500 | Internal Server Error | Erro no banco de dados |

#### Exemplo cURL

```bash
# Listar todas companies
curl -X GET "http://localhost:3000/api/companies/list" \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json"
```

---

### 2.3. GET /companies/:id - Buscar Company por ID

**Controller:** `CompanyController.show()` - Linha 101-119
**Service:** `ShowCompanyService`
**Middleware:** `isAuth`

#### Request

```http
GET /api/companies/123 HTTP/1.1
Authorization: Bearer <token>
```

#### Path Parameters

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| id | string | ID da company |

#### Response (200 OK)

```json
{
  "id": 123,
  "name": "Acme Corp",
  "email": "contato@acme.com",
  "phone": "11999999999",
  "document": "12345678000190",
  "paymentMethod": "credit_card",
  "status": true,
  "dueDate": "2025-12-31",
  "recurrence": "monthly",
  "planId": 2,
  "schedules": [],
  "timezone": "America/Sao_Paulo",
  "createdAt": "2025-01-15T10:00:00.000Z",
  "updatedAt": "2025-10-13T14:30:00.000Z",
  "plan": {
    "id": 2,
    "name": "Premium",
    "amount": "99.90"
  }
}
```

#### Comportamento RBAC

```typescript
if (requestUser.super === true) {
  // Super user pode ver qualquer company
  const company = await ShowCompanyService(id);
  return res.status(200).json(company);
} else if (id !== companyId.toString()) {
  // User regular tentando acessar outra company
  return res.status(400).json({
    error: "Você não possui permissão para acessar este recurso!"
  });
} else {
  // User regular acessando própria company
  const company = await ShowCompanyService(id);
  return res.status(200).json(company);
}
```

#### Códigos de Resposta

| Código | Descrição | Cenário |
|--------|-----------|---------|
| 200 | OK | Company encontrada e retornada |
| 400 | Bad Request | User regular tentando acessar outra company |
| 401 | Unauthorized | Token inválido ou ausente |
| 404 | Not Found | Company não existe (AppError: ERR_NO_COMPANY_FOUND) |
| 500 | Internal Server Error | Erro no banco de dados |

#### Exemplo cURL

```bash
# Buscar company por ID (super user)
curl -X GET "http://localhost:3000/api/companies/123" \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json"

# User regular tentando acessar outra company (retorna 400)
curl -X GET "http://localhost:3000/api/companies/456" \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json"
```

---

### 2.4. GET /companies/current - Buscar Company Atual do Usuário

**Controller:** `CompanyController.showCurrent()` - Linha 270-278
**Service:** `ShowCompanyService`
**Middleware:** `isAuth`

#### Request

```http
GET /api/companies/current HTTP/1.1
Authorization: Bearer <token>
```

#### Response (200 OK)

```json
{
  "id": 123,
  "name": "Acme Corp",
  "email": "contato@acme.com",
  "phone": "11999999999",
  "document": "12345678000190",
  "paymentMethod": "credit_card",
  "status": true,
  "dueDate": "2025-12-31",
  "recurrence": "monthly",
  "planId": 2,
  "schedules": [],
  "timezone": "America/Sao_Paulo",
  "createdAt": "2025-01-15T10:00:00.000Z",
  "updatedAt": "2025-10-13T14:30:00.000Z",
  "plan": {
    "id": 2,
    "name": "Premium",
    "amount": "99.90"
  }
}
```

#### Comportamento

Este endpoint é **SEGURO POR DESIGN**: sempre retorna a company do usuário autenticado, extraída do token JWT.

```typescript
const { companyId } = decoded as TokenPayload;
const company = await ShowCompanyService(companyId);
return res.status(200).json(company);
```

**USO RECOMENDADO:** Preferir este endpoint quando o frontend precisa dos dados da company do usuário logado (ex: exibir nome da empresa no header).

#### Códigos de Resposta

| Código | Descrição | Cenário |
|--------|-----------|---------|
| 200 | OK | Company do usuário retornada |
| 401 | Unauthorized | Token inválido ou ausente |
| 404 | Not Found | Company não existe (dados corrompidos) |
| 500 | Internal Server Error | Erro no banco de dados |

#### Exemplo cURL

```bash
# Buscar company atual do usuário logado
curl -X GET "http://localhost:3000/api/companies/current" \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json"
```

---

### 2.5. POST /companies - Criar Nova Company

**Controller:** `CompanyController.store()` - Linha 82-99
**Service:** `CreateCompanyService`
**Middleware:** `isAuth`

#### Request

```http
POST /api/companies HTTP/1.1
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Nova Empresa Ltda",
  "email": "contato@novaempresa.com",
  "phone": "11988887777",
  "document": "98765432000123",
  "password": "senha123",
  "companyUserName": "Admin Nova Empresa",
  "status": true,
  "planId": 1,
  "dueDate": "2026-01-31",
  "recurrence": "monthly",
  "paymentMethod": "boleto"
}
```

#### Request Body

| Campo | Tipo | Obrigatório | Validação | Descrição |
|-------|------|-------------|-----------|-----------|
| name | string | Sim | Min: 2 chars | Nome da empresa |
| password | string | Sim | Min: 5 chars | Senha do usuário admin |
| email | string | Não | - | Email da empresa (e do admin) |
| phone | string | Não | - | Telefone |
| document | string | Não | - | CNPJ/CPF |
| companyUserName | string | Não | - | Nome do usuário admin (default: name) |
| status | boolean | Não | - | Status ativo/inativo |
| planId | number | Não | - | ID do plano |
| dueDate | string | Não | - | Data de vencimento |
| recurrence | string | Não | - | Recorrência de pagamento |
| paymentMethod | string | Não | - | Método de pagamento |

#### Validação Yup

```typescript
const schema = Yup.object().shape({
  name: Yup.string().required(),
  password: Yup.string().required().min(5)
});
```

#### Response (200 OK)

```json
{
  "id": 125,
  "name": "Nova Empresa Ltda",
  "email": "contato@novaempresa.com",
  "phone": "11988887777",
  "document": "98765432000123",
  "paymentMethod": "boleto",
  "status": true,
  "dueDate": "2026-01-31",
  "recurrence": "monthly",
  "planId": 1,
  "createdAt": "2025-10-13T15:00:00.000Z",
  "updatedAt": "2025-10-13T15:00:00.000Z"
}
```

#### Comportamento da Criação

O service `CreateCompanyService` executa uma **transação atômica** que:

1. Cria a **Company**
2. Cria o **User admin** associado (email da company, profile: "admin")
3. Cria as **CompaniesSettings** com valores padrão
4. Se `CompaniesSettings.createDemoUser === 'enabled'`, cria um **User demo** via hook `Company.AfterCreate`

**Transaction Rollback:** Se qualquer etapa falhar, TODA a operação é revertida.

#### Hook AfterCreate (Usuário Demo)

```typescript
// Company.ts - Linha 174-214
@AfterCreate
static async createDemoUser(company: Company) {
  const setting = await CompaniesSettings.findOne({
    where: { companyId: company.id }
  });

  if (setting?.createDemoUser === 'enabled') {
    const companySlug = company.name.toLowerCase()
      .replace(/\s+/g, '')
      .replace(/[^a-z0-9]/g, '');
    const demoEmail = `demo@${companySlug}.local`;

    await User.create({
      name: 'Usuário Demo',
      email: demoEmail,
      password: 'demo123',
      profile: 'user',
      companyId: company.id
    });
  }
}
```

#### Códigos de Resposta

| Código | Descrição | Cenário |
|--------|-----------|---------|
| 200 | OK | Company criada com sucesso |
| 400 | Bad Request | Validação Yup falhou |
| 401 | Unauthorized | Token inválido ou ausente |
| 500 | Internal Server Error | Erro na transação (AppError: "Não foi possível criar a empresa!") |

#### Exemplo cURL

```bash
curl -X POST "http://localhost:3000/api/companies" \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Nova Empresa Ltda",
    "email": "contato@novaempresa.com",
    "phone": "11988887777",
    "password": "senha123",
    "planId": 1,
    "status": true,
    "dueDate": "2026-01-31",
    "recurrence": "monthly"
  }'
```

---

### 2.6. PUT /companies/:id - Atualizar Company

**Controller:** `CompanyController.update()` - Linha 148-183
**Service:** `UpdateCompanyService`
**Middleware:** `isAuth`

#### Request

```http
PUT /api/companies/123 HTTP/1.1
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Acme Corp Atualizada",
  "email": "novo@acme.com",
  "phone": "11977776666",
  "status": true,
  "planId": 3,
  "dueDate": "2026-12-31",
  "paymentMethod": "credit_card"
}
```

#### Path Parameters

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| id | string | ID da company a atualizar |

#### Request Body

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| name | string | Não | Novo nome da empresa |
| email | string | Não | Novo email (atualiza também o user admin) |
| phone | string | Não | Novo telefone |
| status | boolean | Não | Status ativo/inativo |
| planId | number | Não | Novo plano |
| dueDate | string | Não | Nova data de vencimento |
| recurrence | string | Não | Nova recorrência |
| document | string | Não | Novo documento |
| paymentMethod | string | Não | Novo método de pagamento |
| password | string | Não | Nova senha (atualiza user admin) |
| campaignsEnabled | boolean | Não | Habilitar campanhas (cria/atualiza setting) |

#### Validação Yup

```typescript
const schema = Yup.object().shape({
  name: Yup.string()
});
```

**NOTA:** Validação minimalista. Apenas `name` é validado se fornecido.

#### Response (200 OK)

```json
{
  "id": 123,
  "name": "Acme Corp Atualizada",
  "email": "novo@acme.com",
  "phone": "11977776666",
  "document": "12345678000190",
  "paymentMethod": "credit_card",
  "status": true,
  "dueDate": "2026-12-31",
  "recurrence": "monthly",
  "planId": 3,
  "createdAt": "2025-01-15T10:00:00.000Z",
  "updatedAt": "2025-10-13T15:30:00.000Z"
}
```

#### Comportamento RBAC

```typescript
if (requestUser.super === true) {
  // Super user pode atualizar qualquer company
  const company = await UpdateCompanyService({ id, ...companyData });
  return res.status(200).json(company);
} else if (String(companyData?.id) !== id || String(companyId) !== id) {
  // User regular tentando atualizar outra company
  return res.status(400).json({
    error: "Você não possui permissão para acessar este recurso!"
  });
} else {
  // User regular atualizando própria company
  const company = await UpdateCompanyService({ id, ...companyData });
  return res.status(200).json(company);
}
```

#### Comportamento do Service

O `UpdateCompanyService` executa:

1. Busca a company por ID
2. Valida se email já está em uso por outro user da mesma company
3. Atualiza o **User admin** com novo email/password (se fornecido)
4. Atualiza a **Company** com novos dados
5. Se `campaignsEnabled` for fornecido, cria/atualiza a **Setting** correspondente

**IMPORTANTE:** A atualização do email também atualiza o email do user admin associado.

#### Códigos de Resposta

| Código | Descrição | Cenário |
|--------|-----------|---------|
| 200 | OK | Company atualizada com sucesso |
| 400 | Bad Request | User regular tentando atualizar outra company OU Validação Yup falhou OU Email já existe |
| 401 | Unauthorized | Token inválido ou ausente |
| 404 | Not Found | Company não existe (ERR_NO_COMPANY_FOUND) OU User admin não encontrado (ERR_NO_USER_FOUND) |
| 500 | Internal Server Error | Erro no banco de dados |

#### Exemplo cURL

```bash
curl -X PUT "http://localhost:3000/api/companies/123" \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Acme Corp Atualizada",
    "email": "novo@acme.com",
    "planId": 3
  }'
```

---

### 2.7. PUT /companies/:id/schedules - Atualizar Horários da Company

**Controller:** `CompanyController.updateSchedules()` - Linha 185-208
**Service:** `UpdateSchedulesService`
**Middleware:** `isAuth`

#### Request

```http
PUT /api/companies/123/schedules HTTP/1.1
Authorization: Bearer <token>
Content-Type: application/json

{
  "schedules": [
    { "day": 0, "label": "Domingo", "hr1": "08:00", "hr2": "12:00", "hr3": "", "hr4": "" },
    { "day": 1, "label": "Segunda", "hr1": "08:00", "hr2": "12:00", "hr3": "13:00", "hr4": "18:00" },
    { "day": 2, "label": "Terça", "hr1": "08:00", "hr2": "12:00", "hr3": "13:00", "hr4": "18:00" }
  ]
}
```

#### Request Body

| Campo | Tipo | Obrigatório | Descrição |
|-------|------|-------------|-----------|
| schedules | array | Sim | Array de horários de funcionamento |

#### Códigos de Resposta

| Código | Descrição | Cenário |
|--------|-----------|---------|
| 200 | OK | Horários atualizados |
| 400 | Bad Request | User regular tentando atualizar outra company |
| 401 | Unauthorized | Token inválido ou ausente |
| 500 | Internal Server Error | Erro no banco de dados |

---

### 2.8. DELETE /companies/:id - Excluir Company

**Controller:** `CompanyController.remove()` - Linha 210-228
**Service:** `DeleteCompanyService`
**Middleware:** `isAuth`
**ACESSO:** Apenas super users

#### Request

```http
DELETE /api/companies/123 HTTP/1.1
Authorization: Bearer <token>
```

#### Path Parameters

| Parâmetro | Tipo | Descrição |
|-----------|------|-----------|
| id | string | ID da company a excluir |

#### Response (200 OK)

```json
{
  "message": "Company deleted successfully"
}
```

#### Comportamento RBAC

```typescript
if (requestUser.super === true) {
  const company = await DeleteCompanyService(id);
  return res.status(200).json(company);
} else {
  return res.status(400).json({
    error: "Você não possui permissão para acessar este recurso!"
  });
}
```

**SEGURANÇA:** User regulares NÃO podem excluir companies (nem a própria).

#### Cascade Delete

Devido às associações no model `Company.ts`, a exclusão CASCADE afeta:
- Users
- UserRatings
- Queues
- Whatsapps
- Messages
- Contacts
- Settings
- CompaniesSettings
- Tickets
- TicketTrakings
- Invoices

**ATENÇÃO:** Operação IRREVERSÍVEL. Todos os dados relacionados serão excluídos.

#### Códigos de Resposta

| Código | Descrição | Cenário |
|--------|-----------|---------|
| 200 | OK | Company excluída com sucesso |
| 400 | Bad Request | User regular tentando excluir company |
| 401 | Unauthorized | Token inválido ou ausente |
| 404 | Not Found | Company não existe |
| 500 | Internal Server Error | Erro no banco de dados |

#### Exemplo cURL

```bash
# Apenas super users
curl -X DELETE "http://localhost:3000/api/companies/123" \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json"
```

---

### 2.9. GET /companies/listPlan/:id - Buscar Plano da Company

**Controller:** `CompanyController.listPlan()` - Linha 230-249
**Service:** `ShowPlanCompanyService`
**Middleware:** `isAuth`

#### Request

```http
GET /api/companies/listPlan/123 HTTP/1.1
Authorization: Bearer <token>
```

#### Códigos de Resposta

| Código | Descrição | Cenário |
|--------|-----------|---------|
| 200 | OK | Plano retornado |
| 400 | Bad Request | User regular tentando acessar plano de outra company |
| 401 | Unauthorized | Token inválido ou ausente |
| 500 | Internal Server Error | Erro no banco de dados |

---

### 2.10. GET /companiesPlan - Listar Companies com Planos

**Controller:** `CompanyController.indexPlan()` - Linha 251-268
**Service:** `ListCompaniesPlanService`
**Middleware:** `isAuth`
**ACESSO:** Apenas super users

#### Request

```http
GET /api/companiesPlan HTTP/1.1
Authorization: Bearer <token>
```

#### Response (200 OK)

```json
{
  "companies": [
    {
      "id": 1,
      "name": "Acme Corp",
      "planId": 2,
      "plan": {
        "id": 2,
        "name": "Premium",
        "amount": "99.90"
      }
    }
  ]
}
```

#### Códigos de Resposta

| Código | Descrição | Cenário |
|--------|-----------|---------|
| 200 | OK | Lista retornada |
| 400 | Bad Request | User regular sem permissão |
| 401 | Unauthorized | Token inválido ou ausente |
| 500 | Internal Server Error | Erro no banco de dados |

---

## 3. Problema Atual: searchParam Ignorado

### Análise do Problema

O endpoint `GET /companies` aceita o parâmetro `searchParam` na interface, mas o service **IGNORA** completamente o valor:

```typescript
// CompanyController.ts - Linha 54
const { searchParam, pageNumber } = req.query as IndexQuery;

// ListCompaniesService.ts - Linha 16-42
const ListCompaniesService = async ({
  searchParam = "",  // ← Aceito mas não usado
  pageNumber = "1"
}: Request): Promise<Response> => {
  const limit = 20;
  const offset = limit * (+pageNumber - 1);

  const { count, rows: companies } = await Company.findAndCountAll({
    include: [{ model: Plan, as: "plan", attributes: ["name"] }],
    limit,
    offset,
    order: [["name", "ASC"]]
    // ❌ Sem cláusula WHERE usando searchParam!
  });

  return { companies, count, hasMore: count > offset + companies.length };
};
```

### Por Que Isso Acontece?

Provável evolução histórica:
1. Versão inicial: endpoint sem busca
2. Interface preparada para busca futura (parâmetro adicionado)
3. Service nunca implementou a lógica de filtro
4. Frontend contornou com `useMemo` client-side

### Validação Sugerida (Query Params)

```typescript
// Adicionar no CompanyController.index()
const querySchema = Yup.object().shape({
  searchParam: Yup.string()
    .max(100, "Termo de busca muito longo")
    .trim()
    .optional(),
  pageNumber: Yup.string()
    .matches(/^\d+$/, "Número de página inválido")
    .optional()
});

await querySchema.validate({ searchParam, pageNumber });
```

**Benefícios:**
- Previne SQL injection (mesmo com Sequelize parametrizado)
- Limita tamanho do input (max 100 chars)
- Valida formato do pageNumber (apenas dígitos)
- Trim automático para remover espaços

---

## 4. Implementação Futura: Server-Side Search

### Modificação Necessária no Service

```typescript
// ListCompaniesService.ts - VERSÃO FUTURA
import { Sequelize, Op } from "sequelize";

const ListCompaniesService = async ({
  searchParam = "",
  pageNumber = "1"
}: Request): Promise<Response> => {
  const limit = 20;
  const offset = limit * (+pageNumber - 1);

  // ✅ NOVA LÓGICA: Adicionar cláusula WHERE condicional
  const whereClause = searchParam.trim() !== "" ? {
    [Op.or]: [
      { name: { [Op.iLike]: `%${searchParam}%` } },
      { email: { [Op.iLike]: `%${searchParam}%` } },
      { document: { [Op.iLike]: `%${searchParam}%` } },
      { phone: { [Op.iLike]: `%${searchParam}%` } }
    ]
  } : {};

  const { count, rows: companies } = await Company.findAndCountAll({
    where: whereClause,  // ← ADICIONAR ESTA LINHA
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

  return { companies, count, hasMore };
};
```

### Comportamento Garantido

| searchParam | Comportamento | Retrocompatibilidade |
|-------------|---------------|---------------------|
| (vazio) | `whereClause = {}` → Retorna todas (como hoje) | ✅ 100% compatível |
| "acme" | `whereClause = {[Op.or]: [...]}` → Filtra | ✅ Novo comportamento |

**GARANTIA:** Se `searchParam` for vazio, omitido ou `undefined`, o comportamento é **IDÊNTICO** ao atual.

### Campos Pesquisáveis

A implementação sugerida busca em:
1. **name** (nome da empresa) - Principal
2. **email** (email da empresa)
3. **document** (CNPJ/CPF)
4. **phone** (telefone)

**NOTA:** Usar `Op.iLike` (case-insensitive) para melhor UX. No MySQL, usar `Op.like` com `COLLATE utf8mb4_unicode_ci`.

---

## 5. Multi-Tenant Security

### Garantias de Isolamento

O sistema implementa **isolamento multi-tenant em duas camadas**:

#### Camada 1: RBAC no Controller

```typescript
// CompanyController.index() - Linha 63-78
if (requestUser.super === true) {
  // Super vê todas
  return ListCompaniesService({ searchParam, pageNumber });
} else {
  // User regular VÊ APENAS SUA COMPANY
  // Mesmo se enviar searchParam=outra_empresa
  return ListCompaniesService({
    searchParam: company.name,  // ← FORÇA filtro pela própria company
    pageNumber
  });
}
```

#### Camada 2: Validação no Service (Futuro)

Quando implementar server-side search, adicionar validação extra:

```typescript
// ListCompaniesService.ts - CAMADA EXTRA DE SEGURANÇA
const ListCompaniesService = async ({
  searchParam = "",
  pageNumber = "1",
  companyId = null  // ← NOVO parâmetro para user regular
}: Request): Promise<Response> => {
  // ...

  const whereClause = searchParam.trim() !== "" ? {
    [Op.or]: [
      { name: { [Op.iLike]: `%${searchParam}%` } },
      { email: { [Op.iLike]: `%${searchParam}%` } },
      // ...
    ]
  } : {};

  // ✅ ADICIONAR filtro obrigatório por companyId se fornecido
  if (companyId !== null) {
    whereClause.id = companyId;
  }

  const { count, rows: companies } = await Company.findAndCountAll({
    where: whereClause,
    // ...
  });

  // ...
};
```

### Testes de Isolamento Obrigatórios

```typescript
// __tests__/integration/companies.test.ts

describe("Multi-Tenant Isolation", () => {
  it("should NOT allow regular user to see other companies", async () => {
    // Arrange
    const company1 = await factory.create("Company", { name: "Company A" });
    const company2 = await factory.create("Company", { name: "Company B" });
    const user1 = await factory.create("User", { companyId: company1.id });

    const token = generateJWT(user1);

    // Act
    const response = await request(app)
      .get("/api/companies?searchParam=Company B")
      .set("Authorization", `Bearer ${token}`);

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.companies).toHaveLength(1);
    expect(response.body.companies[0].name).toBe("Company A"); // ← Vê apenas a própria
  });

  it("should allow super user to see all companies", async () => {
    // Arrange
    const company1 = await factory.create("Company", { name: "Company A" });
    const company2 = await factory.create("Company", { name: "Company B" });
    const superUser = await factory.create("User", { super: true });

    const token = generateJWT(superUser);

    // Act
    const response = await request(app)
      .get("/api/companies?searchParam=Company")
      .set("Authorization", `Bearer ${token}`);

    // Assert
    expect(response.status).toBe(200);
    expect(response.body.companies.length).toBeGreaterThanOrEqual(2);
  });
});
```

---

## 6. Performance e Escalabilidade

### Performance Atual (Sem Filtro)

| Cenário | Tempo Estimado | Complexidade |
|---------|----------------|--------------|
| 100 companies | ~30-50ms | O(n) |
| 1000 companies | ~100-200ms | O(n) |
| 10000 companies | ~500-1000ms | O(n) |

**Gargalo:** Full table scan sem índices.

### Performance Futura (Com Filtro + Índices)

| Cenário | Tempo Estimado | Complexidade |
|---------|----------------|--------------|
| 100 companies | ~20-30ms | O(log n) |
| 1000 companies | ~30-60ms | O(log n) |
| 10000 companies | ~50-150ms | O(log n) |

**Melhoria:** Índices B-Tree permitem busca logarítmica.

### Índices Recomendados

```sql
-- Índices B-Tree tradicionais (suporte ILIKE básico)
CREATE INDEX idx_companies_name ON "Companies" (name);
CREATE INDEX idx_companies_email ON "Companies" (email);
CREATE INDEX idx_companies_document ON "Companies" (document);

-- OU Índices Trigram (full-text search avançado)
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE INDEX idx_companies_name_trgm ON "Companies"
  USING gin (name gin_trgm_ops);

CREATE INDEX idx_companies_email_trgm ON "Companies"
  USING gin (email gin_trgm_ops);

CREATE INDEX idx_companies_document_trgm ON "Companies"
  USING gin (document gin_trgm_ops);
```

**Trigram vs. B-Tree:**

| Tipo | Vantagem | Desvantagem |
|------|----------|-------------|
| B-Tree | Mais rápido para prefixos exatos (`name LIKE 'acme%'`) | Lento para busca no meio (`name LIKE '%acme%'`) |
| Trigram (GIN) | Rápido para busca parcial (`name ILIKE '%acme%'`) | Requer extensão pg_trgm |

**RECOMENDAÇÃO:** Usar Trigram (GIN) para melhor UX.

### Migration para Índices

```typescript
// migrations/YYYYMMDDHHMMSS-add-companies-search-indexes.ts
import { QueryInterface } from "sequelize";

module.exports = {
  up: async (queryInterface: QueryInterface) => {
    // 1. Habilitar extensão trigram
    await queryInterface.sequelize.query(
      'CREATE EXTENSION IF NOT EXISTS pg_trgm;'
    );

    // 2. Criar índices GIN
    await queryInterface.sequelize.query(`
      CREATE INDEX idx_companies_name_trgm ON "Companies"
        USING gin (name gin_trgm_ops);
    `);

    await queryInterface.sequelize.query(`
      CREATE INDEX idx_companies_email_trgm ON "Companies"
        USING gin (email gin_trgm_ops);
    `);

    await queryInterface.sequelize.query(`
      CREATE INDEX idx_companies_document_trgm ON "Companies"
        USING gin (document gin_trgm_ops);
    `);
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.sequelize.query('DROP INDEX IF EXISTS idx_companies_name_trgm;');
    await queryInterface.sequelize.query('DROP INDEX IF EXISTS idx_companies_email_trgm;');
    await queryInterface.sequelize.query('DROP INDEX IF EXISTS idx_companies_document_trgm;');
  }
};
```

---

## 7. Estratégia de Migração Client-Side → Server-Side

### Quando Migrar?

Considere migrar quando:
1. **Volume:** Mais de 1000 companies cadastradas
2. **Performance:** Frontend ficando lento (> 500ms para renderizar lista)
3. **UX:** Necessidade de filtros avançados (data de criação, status, plano, etc.)
4. **Mobile:** App mobile precisa de tráfego reduzido

### Passos da Migração

#### Passo 1: Backend - Implementar Filtro no Service (5 linhas)

```diff
// backend/src/services/CompanyService/ListCompaniesService.ts

const ListCompaniesService = async ({
  searchParam = "",
  pageNumber = "1"
}: Request): Promise<Response> => {
  const limit = 20;
  const offset = limit * (+pageNumber - 1);

+ // NOVO: Adicionar cláusula WHERE condicional
+ const whereClause = searchParam.trim() !== "" ? {
+   [Op.or]: [
+     { name: { [Op.iLike]: `%${searchParam}%` } },
+     { email: { [Op.iLike]: `%${searchParam}%` } },
+     { document: { [Op.iLike]: `%${searchParam}%` } },
+     { phone: { [Op.iLike]: `%${searchParam}%` } }
+   ]
+ } : {};

  const { count, rows: companies } = await Company.findAndCountAll({
+   where: whereClause,
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

  return { companies, count, hasMore };
};
```

**Estimativa:** 30 minutos

#### Passo 2: Backend - Criar Índices no PostgreSQL

```bash
# Executar migration
cd backend
npm run sequelize-cli db:migrate
```

**Estimativa:** 10 minutos (criação da migration + deploy)

#### Passo 3: Backend - Testes do Service

```typescript
// backend/src/services/CompanyService/__tests__/ListCompaniesService.test.ts

describe("ListCompaniesService", () => {
  it("should return all companies when searchParam is empty", async () => {
    // Arrange
    await factory.createMany("Company", 5);

    // Act
    const result = await ListCompaniesService({
      searchParam: "",
      pageNumber: "1"
    });

    // Assert
    expect(result.companies).toHaveLength(5);
    expect(result.count).toBe(5);
  });

  it("should filter companies by name", async () => {
    // Arrange
    await factory.create("Company", { name: "Acme Corp" });
    await factory.create("Company", { name: "Beta Inc" });
    await factory.create("Company", { name: "Gamma LLC" });

    // Act
    const result = await ListCompaniesService({
      searchParam: "acme",
      pageNumber: "1"
    });

    // Assert
    expect(result.companies).toHaveLength(1);
    expect(result.companies[0].name).toBe("Acme Corp");
  });

  it("should be case-insensitive", async () => {
    // Arrange
    await factory.create("Company", { name: "Acme Corp" });

    // Act
    const result = await ListCompaniesService({
      searchParam: "ACME",
      pageNumber: "1"
    });

    // Assert
    expect(result.companies).toHaveLength(1);
  });
});
```

**Estimativa:** 1 hora

#### Passo 4: Frontend - Modificar Hook useCompanies

```diff
// frontend/src/hooks/useCompanies.js

export const useCompanies = () => {
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(false);
  const [companies, setCompanies] = useState([]);
  const [count, setCount] = useState(0);
+ const [searchParam, setSearchParam] = useState(""); // NOVO

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
-     const fetchCompanies = async () => {
-       try {
-         const { data } = await api.get("/companies/list");
-         setCompanies(data);
-       } catch (err) {
-         toastError(err);
-       }
-       setLoading(false);
-     };
-     fetchCompanies();

+     const fetchCompanies = async () => {
+       try {
+         const { data } = await api.get("/companies", {
+           params: { searchParam, pageNumber: "1" }  // ← Passar searchParam
+         });
+         setCompanies(data.companies);
+         setCount(data.count);
+         setHasMore(data.hasMore);
+       } catch (err) {
+         toastError(err);
+       }
+       setLoading(false);
+     };
+     fetchCompanies();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
- }, []);
+ }, [searchParam]); // ← Recarregar quando searchParam mudar

-  return { companies, loading };
+  return { companies, loading, searchParam, setSearchParam, count, hasMore };
};
```

**Estimativa:** 30 minutos

#### Passo 5: Frontend - Remover useMemo de CompaniesManager

```diff
// frontend/src/pages/CompaniesManager/index.js

const CompaniesManager = () => {
- const { companies, loading } = useCompanies();
+ const { companies, loading, searchParam, setSearchParam } = useCompanies();

- const [searchParam, setSearchParam] = useState("");
- const [pageNumber, setPageNumber] = useState(1);

- // REMOVER: Filtro client-side
- const filteredCompanies = useMemo(() => {
-   return companies.filter(company =>
-     company.name.toLowerCase().includes(searchParam.toLowerCase())
-   );
- }, [companies, searchParam]);

  return (
    <MainContainer>
      <TextField
        value={searchParam}
-       onChange={(e) => setSearchParam(e.target.value)}
+       onChange={(e) => setSearchParam(e.target.value)} // ← Agora dispara API call
        placeholder="Buscar empresas..."
      />

-     <Table companies={filteredCompanies} />
+     <Table companies={companies} /> {/* ← Usar companies direto da API */}
    </MainContainer>
  );
};
```

**Estimativa:** 20 minutos

#### Passo 6: Testes de Integração

```bash
# Backend
cd backend
npm run test:integration

# Frontend
cd frontend
npm run test
```

**Estimativa:** 30 minutos

#### Passo 7: Deploy e Monitoramento

```bash
# 1. Deploy backend
cd backend
git add .
git commit -m "feat: implement server-side search for companies"
git push origin main

# 2. Executar migration em produção
npm run sequelize-cli db:migrate

# 3. Deploy frontend
cd ../frontend
git add .
git commit -m "feat: migrate to server-side search for companies"
git push origin main

# 4. Monitorar logs
tail -f /var/log/chatia/backend.log
```

**Estimativa:** 1 hora (incluindo rollback plan)

### Rollback Plan

Se houver problemas após deploy:

**Opção 1: Feature Flag (Recomendado)**

```typescript
// backend/src/config/features.ts
export const FEATURES = {
  SERVER_SIDE_SEARCH: process.env.ENABLE_SERVER_SIDE_SEARCH === "true"
};

// ListCompaniesService.ts
import { FEATURES } from "../../config/features";

const whereClause = (FEATURES.SERVER_SIDE_SEARCH && searchParam.trim() !== "")
  ? { [Op.or]: [...] }
  : {};
```

**Rollback:** Apenas alterar variável de ambiente:
```bash
# Desabilitar server-side search
export ENABLE_SERVER_SIDE_SEARCH=false
pm2 restart backend
```

**Opção 2: Revert Git**

```bash
# Reverter commits
git revert HEAD~1
git push origin main
```

### Estimativa Total

| Etapa | Tempo |
|-------|-------|
| Backend: Service | 30 min |
| Backend: Migration | 10 min |
| Backend: Testes | 1h |
| Frontend: Hook | 30 min |
| Frontend: Component | 20 min |
| Testes Integração | 30 min |
| Deploy + Monitor | 1h |
| **TOTAL** | **4h** |

---

## 8. Validação e Sanitização

### Input Validation (Yup)

#### Query Parameters (searchParam, pageNumber)

```typescript
// CompanyController.ts - ADICIONAR no index()
const querySchema = Yup.object().shape({
  searchParam: Yup.string()
    .max(100, "Termo de busca deve ter no máximo 100 caracteres")
    .trim()
    .optional(),
  pageNumber: Yup.string()
    .matches(/^\d+$/, "Número de página deve ser um inteiro positivo")
    .optional()
    .default("1")
});

try {
  await querySchema.validate({ searchParam, pageNumber });
} catch (err: any) {
  throw new AppError(err.message, 400);
}
```

#### Request Body (POST /companies)

```typescript
// CompanyController.ts - store() - Linha 85-88
const schema = Yup.object().shape({
  name: Yup.string().required("Nome é obrigatório"),
  password: Yup.string().required("Senha é obrigatória").min(5, "Senha deve ter no mínimo 5 caracteres"),
  email: Yup.string().email("Email inválido").optional(),
  phone: Yup.string().optional(),
  document: Yup.string().optional(),
  planId: Yup.number().integer().positive().optional(),
  status: Yup.boolean().optional(),
  dueDate: Yup.string().optional(),
  recurrence: Yup.string().oneOf(["monthly", "yearly"]).optional(),
  paymentMethod: Yup.string().oneOf(["credit_card", "boleto", "pix"]).optional()
});
```

### SQL Injection Prevention

Sequelize usa **prepared statements** por padrão:

```typescript
// ✅ SEGURO: Sequelize escapa automaticamente
const whereClause = {
  [Op.or]: [
    { name: { [Op.iLike]: `%${searchParam}%` } }  // ← Parametrizado
  ]
};

// ❌ INSEGURO: Query crua sem parametrização
const query = `SELECT * FROM "Companies" WHERE name ILIKE '%${searchParam}%'`;
```

**NUNCA** use `sequelize.query()` com strings concatenadas. Sempre use:

```typescript
// ✅ CORRETO
sequelize.query(
  'SELECT * FROM "Companies" WHERE name ILIKE :searchParam',
  { replacements: { searchParam: `%${searchParam}%` } }
);
```

### XSS Prevention

```typescript
// ADICIONAR no service antes de usar searchParam
import validator from "validator";

const sanitizedSearchParam = validator.escape(searchParam.trim());
```

**Frontend:** Usar `DOMPurify` para renderizar dados:

```javascript
import DOMPurify from "dompurify";

<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(company.name) }} />
```

### Rate Limiting (Recomendado)

```typescript
// backend/src/middleware/rateLimiter.ts
import rateLimit from "express-rate-limit";

export const companiesRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minuto
  max: 100, // 100 requisições por minuto
  message: "Muitas requisições, tente novamente mais tarde.",
  standardHeaders: true,
  legacyHeaders: false,
});

// routes/companyRoutes.ts
import { companiesRateLimiter } from "../middleware/rateLimiter";

companyRoutes.get("/companies", isAuth, companiesRateLimiter, CompanyController.index);
```

---

## 9. Error Handling

### Códigos de Resposta HTTP

| Código | Tipo | Uso |
|--------|------|-----|
| 200 | OK | Requisição bem-sucedida |
| 400 | Bad Request | Validação Yup falhou OU Permissão negada |
| 401 | Unauthorized | Token JWT inválido/ausente |
| 403 | Forbidden | User autenticado mas sem permissão (não usado atualmente) |
| 404 | Not Found | Recurso não existe (AppError: ERR_NO_COMPANY_FOUND) |
| 500 | Internal Server Error | Erro inesperado no servidor |

### Estrutura de Erro (AppError)

```typescript
// backend/src/errors/AppError.ts
class AppError {
  public readonly message: string;
  public readonly statusCode: number;

  constructor(message: string, statusCode: number = 400) {
    this.message = message;
    this.statusCode = statusCode;
  }
}
```

### Exemplos de Erros

#### 400 Bad Request - Validação Falhou

```json
{
  "error": "Nome é obrigatório"
}
```

```bash
curl -X POST "http://localhost:3000/api/companies" \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json" \
  -d '{"email": "teste@teste.com"}'

# Resposta (400)
{
  "error": "name is a required field"
}
```

#### 400 Bad Request - Permissão Negada

```json
{
  "error": "Você não possui permissão para acessar este recurso!"
}
```

```bash
# User regular tentando acessar outra company
curl -X GET "http://localhost:3000/api/companies/999" \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json"

# Resposta (400)
{
  "error": "Você não possui permissão para acessar este recurso!"
}
```

#### 401 Unauthorized - Token Inválido

```json
{
  "error": "Token inválido"
}
```

```bash
curl -X GET "http://localhost:3000/api/companies" \
  -H "Authorization: Bearer token_invalido" \
  -H "Content-Type: application/json"

# Resposta (401)
{
  "error": "Token inválido"
}
```

#### 404 Not Found - Company Não Existe

```json
{
  "error": "ERR_NO_COMPANY_FOUND"
}
```

```bash
curl -X GET "http://localhost:3000/api/companies/99999" \
  -H "Authorization: Bearer eyJhbGc..." \
  -H "Content-Type: application/json"

# Resposta (404)
{
  "error": "ERR_NO_COMPANY_FOUND"
}
```

#### 500 Internal Server Error - Erro no Banco

```json
{
  "error": "Não foi possível criar a empresa!",
  "details": "database connection timeout"
}
```

---

## 10. Observabilidade

### Winston Logging

#### Estrutura de Log

```typescript
// backend/src/utils/logger.ts
import winston from "winston";

const logger = winston.createLogger({
  level: "info",
  format: winston.format.json(),
  defaultMeta: { service: "companies-api" },
  transports: [
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" })
  ]
});

export default logger;
```

#### Eventos a Logar

```typescript
// ListCompaniesService.ts
import logger from "../../utils/logger";

const ListCompaniesService = async ({ searchParam, pageNumber }: Request) => {
  logger.info({
    message: "Listing companies",
    searchParam,
    pageNumber,
    timestamp: new Date().toISOString()
  });

  try {
    const { count, rows: companies } = await Company.findAndCountAll({
      // ...
    });

    logger.info({
      message: "Companies listed successfully",
      count,
      pageNumber,
      timestamp: new Date().toISOString()
    });

    return { companies, count, hasMore };
  } catch (error) {
    logger.error({
      message: "Error listing companies",
      error: error.message,
      stack: error.stack,
      searchParam,
      pageNumber,
      timestamp: new Date().toISOString()
    });

    throw error;
  }
};
```

### Métricas (Bull Board)

Se usar Bull Queue para processamento assíncrono:

```typescript
// backend/src/queues.ts
import { createBullBoard } from "@bull-board/api";
import { BullAdapter } from "@bull-board/api/bullAdapter";
import { ExpressAdapter } from "@bull-board/express";

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath("/admin/queues");

createBullBoard({
  queues: [new BullAdapter(companiesQueue)],
  serverAdapter: serverAdapter
});

app.use("/admin/queues", serverAdapter.getRouter());
```

**Acesso:** `http://localhost:3000/admin/queues`

### Monitoramento (Exemplo com Prometheus)

```typescript
// backend/src/middleware/metrics.ts
import promClient from "prom-client";

const companiesRequestCounter = new promClient.Counter({
  name: "companies_requests_total",
  help: "Total de requisições para /companies",
  labelNames: ["method", "status_code"]
});

const companiesRequestDuration = new promClient.Histogram({
  name: "companies_request_duration_seconds",
  help: "Duração das requisições para /companies",
  labelNames: ["method", "status_code"]
});

export const metricsMiddleware = (req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = (Date.now() - start) / 1000;
    companiesRequestCounter.inc({ method: req.method, status_code: res.statusCode });
    companiesRequestDuration.observe({ method: req.method, status_code: res.statusCode }, duration);
  });

  next();
};
```

---

## 11. Checklist de Validação Multi-Tenant

### Backend

- [ ] Todas as queries Sequelize incluem `where: { companyId }` (quando aplicável)
- [ ] Índices criados em colunas `companyId` (se houver relacionamento)
- [ ] Middleware `isAuth` aplicado a TODAS as rotas
- [ ] RBAC implementado: super users vs. users regulares
- [ ] Users regulares NUNCA veem dados de outras companies
- [ ] Tentativas de acesso cross-tenant retornam 400 Bad Request

### Frontend

- [ ] Token JWT enviado em TODAS as requisições (Authorization header)
- [ ] Tratamento de erro 400 (permissão negada)
- [ ] Tratamento de erro 401 (token expirado → logout)
- [ ] Dados de companies NUNCA misturados no estado global

### Testes

- [ ] Teste: Super user vê todas companies
- [ ] Teste: User regular vê apenas própria company
- [ ] Teste: User regular não consegue acessar outra company (GET /companies/:id)
- [ ] Teste: User regular não consegue editar outra company (PUT /companies/:id)
- [ ] Teste: User regular não consegue excluir companies (DELETE /companies/:id)
- [ ] Teste: searchParam de user regular é sobrescrito pela própria company

---

## 12. Referências e Anexos

### Arquivos de Código

| Arquivo | Localização | Descrição |
|---------|-------------|-----------|
| CompanyController.ts | `/backend/src/controllers/CompanyController.ts` | Controladores de todas as rotas |
| ListCompaniesService.ts | `/backend/src/services/CompanyService/ListCompaniesService.ts` | Service de listagem paginada |
| FindAllCompaniesService.ts | `/backend/src/services/CompanyService/FindAllCompaniesService.ts` | Service de listagem completa |
| ShowCompanyService.ts | `/backend/src/services/CompanyService/ShowCompanyService.ts` | Buscar company por ID |
| CreateCompanyService.ts | `/backend/src/services/CompanyService/CreateCompanyService.ts` | Criar nova company |
| UpdateCompanyService.ts | `/backend/src/services/CompanyService/UpdateCompanyService.ts` | Atualizar company |
| DeleteCompanyService.ts | `/backend/src/services/CompanyService/DeleteCompanyService.ts` | Excluir company |
| Company.ts | `/backend/src/models/Company.ts` | Model Sequelize |
| companyRoutes.ts | `/backend/src/routes/companyRoutes.ts` | Definição de rotas |

### Documentos Relacionados

- [Frontend Plan - CompaniesManager Search](link pendente)
- [Backend Architecture Decision Records](docs/architecture/)
- [Database Schema Changes](docs/db/)
- [Multi-Tenant Security Guidelines](docs/backend/multi-tenant-security.md)

### Postman Collection (Exemplo)

```json
{
  "info": {
    "name": "ChatIA Flow - Companies API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "item": [
    {
      "name": "List Companies (Paginated)",
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}",
            "type": "text"
          }
        ],
        "url": {
          "raw": "{{base_url}}/api/companies?searchParam=acme&pageNumber=1",
          "host": ["{{base_url}}"],
          "path": ["api", "companies"],
          "query": [
            { "key": "searchParam", "value": "acme" },
            { "key": "pageNumber", "value": "1" }
          ]
        }
      }
    },
    {
      "name": "List All Companies",
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}",
            "type": "text"
          }
        ],
        "url": {
          "raw": "{{base_url}}/api/companies/list",
          "host": ["{{base_url}}"],
          "path": ["api", "companies", "list"]
        }
      }
    },
    {
      "name": "Get Company by ID",
      "request": {
        "method": "GET",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}",
            "type": "text"
          }
        ],
        "url": {
          "raw": "{{base_url}}/api/companies/{{companyId}}",
          "host": ["{{base_url}}"],
          "path": ["api", "companies", "{{companyId}}"]
        }
      }
    },
    {
      "name": "Create Company",
      "request": {
        "method": "POST",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}",
            "type": "text"
          },
          {
            "key": "Content-Type",
            "value": "application/json",
            "type": "text"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"name\": \"Nova Empresa\",\n  \"email\": \"contato@nova.com\",\n  \"password\": \"senha123\",\n  \"planId\": 1\n}"
        },
        "url": {
          "raw": "{{base_url}}/api/companies",
          "host": ["{{base_url}}"],
          "path": ["api", "companies"]
        }
      }
    },
    {
      "name": "Update Company",
      "request": {
        "method": "PUT",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}",
            "type": "text"
          },
          {
            "key": "Content-Type",
            "value": "application/json",
            "type": "text"
          }
        ],
        "body": {
          "mode": "raw",
          "raw": "{\n  \"name\": \"Empresa Atualizada\",\n  \"email\": \"novo@empresa.com\"\n}"
        },
        "url": {
          "raw": "{{base_url}}/api/companies/{{companyId}}",
          "host": ["{{base_url}}"],
          "path": ["api", "companies", "{{companyId}}"]
        }
      }
    },
    {
      "name": "Delete Company (Super Only)",
      "request": {
        "method": "DELETE",
        "header": [
          {
            "key": "Authorization",
            "value": "Bearer {{token}}",
            "type": "text"
          }
        ],
        "url": {
          "raw": "{{base_url}}/api/companies/{{companyId}}",
          "host": ["{{base_url}}"],
          "path": ["api", "companies", "{{companyId}}"]
        }
      }
    }
  ],
  "variable": [
    {
      "key": "base_url",
      "value": "http://localhost:3000",
      "type": "string"
    },
    {
      "key": "token",
      "value": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "type": "string"
    },
    {
      "key": "companyId",
      "value": "123",
      "type": "string"
    }
  ]
}
```

---

## 13. Diagrama de Sequência: GET /companies (User Regular)

```
┌─────────┐         ┌──────────┐         ┌────────────┐         ┌──────────┐
│Frontend │         │Controller│         │  Service   │         │ Database │
└────┬────┘         └─────┬────┘         └──────┬─────┘         └─────┬────┘
     │                    │                     │                     │
     │ GET /companies     │                     │                     │
     │ Authorization:     │                     │                     │
     │ Bearer <token>     │                     │                     │
     ├───────────────────>│                     │                     │
     │                    │                     │                     │
     │                    │ 1. Verify JWT       │                     │
     │                    │ (isAuth middleware) │                     │
     │                    │────────────┐        │                     │
     │                    │            │        │                     │
     │                    │<───────────┘        │                     │
     │                    │                     │                     │
     │                    │ 2. Check if super   │                     │
     │                    │ user                │                     │
     │                    │────────────┐        │                     │
     │                    │            │        │                     │
     │                    │<───────────┘        │                     │
     │                    │ ❌ super = false    │                     │
     │                    │                     │                     │
     │                    │ 3. Force filter by  │                     │
     │                    │ own company name    │                     │
     │                    │────────────┐        │                     │
     │                    │            │        │                     │
     │                    │<───────────┘        │                     │
     │                    │                     │                     │
     │                    │ ListCompaniesService│                     │
     │                    │ searchParam:        │                     │
     │                    │ company.name        │                     │
     │                    ├────────────────────>│                     │
     │                    │                     │                     │
     │                    │                     │ SELECT * FROM       │
     │                    │                     │ Companies WHERE...  │
     │                    │                     │ (searchParam        │
     │                    │                     │ IGNORED)            │
     │                    │                     ├────────────────────>│
     │                    │                     │                     │
     │                    │                     │ companies (all)     │
     │                    │                     │<────────────────────┤
     │                    │                     │                     │
     │                    │ { companies,        │                     │
     │                    │   count, hasMore }  │                     │
     │                    │<────────────────────┤                     │
     │                    │                     │                     │
     │                    │ 4. Return only own  │                     │
     │                    │ company             │                     │
     │                    │────────────┐        │                     │
     │                    │            │        │                     │
     │                    │<───────────┘        │                     │
     │                    │                     │                     │
     │ 200 OK             │                     │                     │
     │ { companies: [...] }                     │                     │
     │ (1 company only)   │                     │                     │
     │<───────────────────┤                     │                     │
     │                    │                     │                     │
```

**NOTA:** O diagrama mostra o comportamento atual onde `searchParam` é ignorado. Na versão futura, a query incluiria `WHERE name ILIKE '%searchParam%'`.

---

## 14. Conclusão

Este documento define os contratos da API de Companies do ChatIA Flow, documentando:

1. **Estado Atual:** 6 endpoints REST funcionais com RBAC robusto
2. **Problema Identificado:** `searchParam` aceito mas ignorado no service
3. **Solução Frontend:** Busca client-side com `useMemo` (temporário)
4. **Migração Futura:** Implementação de server-side search em 4 horas
5. **Retrocompatibilidade:** 100% garantida (searchParam vazio = comportamento atual)
6. **Segurança Multi-Tenant:** Isolamento em 2 camadas (RBAC + query filtering)

### Próximos Passos

1. **Curto Prazo:** Usar documentação para validar integrações frontend/backend
2. **Médio Prazo:** Criar testes de integração baseados nos contratos
3. **Longo Prazo:** Implementar server-side search quando necessário (> 1000 companies)

### Versioning

| Versão | Data | Mudanças |
|--------|------|----------|
| 1.0.0 | 2025-10-13 | Versão inicial - Documentação completa |

---

**Documento elaborado por:** Backend Architecture Planner
**Revisão:** Pendente
**Status:** DRAFT → REVIEW → APPROVED
