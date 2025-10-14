# Companies API - Quick Start Guide

Guia rápido de 5 minutos para começar a usar a API de Companies do ChatIA Flow.

## 1. Obter Token JWT

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@chatiaflow.com",
    "password": "admin123"
  }'

# Resposta
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "name": "Admin",
    "email": "admin@chatiaflow.com",
    "profile": "admin",
    "companyId": 1,
    "super": true
  }
}

# Copiar o token para usar nas próximas requisições
export TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

## 2. Listar Companies

```bash
# Primeira página (limite: 20)
curl -X GET "http://localhost:3000/api/companies?pageNumber=1" \
  -H "Authorization: Bearer $TOKEN"

# Resposta
{
  "companies": [
    {
      "id": 1,
      "name": "Acme Corp",
      "email": "contato@acme.com",
      "status": true,
      "planId": 2,
      "plan": { "name": "Premium" }
    }
  ],
  "count": 45,
  "hasMore": true
}
```

## 3. Buscar Company Específica

```bash
# Por ID
curl -X GET "http://localhost:3000/api/companies/1" \
  -H "Authorization: Bearer $TOKEN"

# Company do usuário logado (recomendado)
curl -X GET "http://localhost:3000/api/companies/current" \
  -H "Authorization: Bearer $TOKEN"
```

## 4. Criar Nova Company

```bash
curl -X POST "http://localhost:3000/api/companies" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Nova Empresa Ltda",
    "email": "contato@novaempresa.com",
    "password": "senha123",
    "planId": 1,
    "status": true
  }'

# Resposta
{
  "id": 125,
  "name": "Nova Empresa Ltda",
  "email": "contato@novaempresa.com",
  "status": true,
  "planId": 1,
  "createdAt": "2025-10-13T15:00:00.000Z"
}
```

## 5. Atualizar Company

```bash
curl -X PUT "http://localhost:3000/api/companies/125" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Nova Empresa Atualizada",
    "email": "novo@empresa.com",
    "planId": 2
  }'
```

## 6. Excluir Company (Super Only)

```bash
curl -X DELETE "http://localhost:3000/api/companies/125" \
  -H "Authorization: Bearer $TOKEN"

# Resposta
{
  "message": "Company deleted successfully"
}
```

## Códigos HTTP

| Código | Significado | Ação |
|--------|-------------|------|
| 200 | OK | Sucesso |
| 400 | Bad Request | Verificar dados enviados |
| 401 | Unauthorized | Token inválido → fazer login novamente |
| 404 | Not Found | Company não existe |
| 500 | Server Error | Reportar erro ao time backend |

## RBAC - Controle de Acesso

### Super User (super: true)

```javascript
// Pode acessar TODAS as companies
GET /companies → [Company1, Company2, Company3, ...]
GET /companies/999 → Company999 (qualquer company)
PUT /companies/999 → OK
DELETE /companies/999 → OK
```

### User Regular (super: false)

```javascript
// Pode acessar APENAS SUA company
GET /companies → [MinhaCompany] (apenas 1)
GET /companies/123 → 200 OK (se 123 = sua company)
GET /companies/456 → 400 Bad Request (se 456 ≠ sua company)
PUT /companies/123 → 200 OK (se 123 = sua company)
DELETE /companies/123 → 400 Bad Request (users regulares não podem excluir)
```

## Importar no Postman

```bash
# 1. Baixar collection
curl -o companies.postman.json \
  https://raw.githubusercontent.com/your-repo/chatia/main/docs/contracts/companies-postman-collection.json

# 2. Importar no Postman
# File → Import → companies.postman.json

# 3. Configurar variáveis
# - base_url: http://localhost:3000/api
# - token: <seu_token_aqui>
# - companyId: 1
```

## Erros Comuns

### 401 Unauthorized

```bash
# Problema: Token inválido ou expirado
# Solução: Fazer login novamente

curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "seu@email.com", "password": "senha"}'
```

### 400 Bad Request (Validação)

```bash
# Problema: Dados obrigatórios faltando
# Resposta:
{
  "error": "name is a required field"
}

# Solução: Adicionar campo obrigatório
curl -X POST http://localhost:3000/api/companies \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Empresa",     # ✅ Obrigatório
    "password": "senha123" # ✅ Obrigatório
  }'
```

### 400 Bad Request (Permissão)

```bash
# Problema: User regular tentando acessar outra company
# Resposta:
{
  "error": "Você não possui permissão para acessar este recurso!"
}

# Solução: Acessar apenas SUA company
curl -X GET "http://localhost:3000/api/companies/current" \
  -H "Authorization: Bearer $TOKEN"
```

## Frontend - Exemplo React

```javascript
// hooks/useCompanies.js
import { useEffect, useState } from 'react';
import api from '../services/api';

export const useCompanies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchCompanies = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/companies/list');
        setCompanies(data);
      } catch (err) {
        console.error('Error fetching companies:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  return { companies, loading };
};

// components/CompaniesTable.jsx
import { useCompanies } from '../hooks/useCompanies';

const CompaniesTable = () => {
  const { companies, loading } = useCompanies();

  if (loading) return <div>Loading...</div>;

  return (
    <table>
      <thead>
        <tr>
          <th>ID</th>
          <th>Nome</th>
          <th>Email</th>
          <th>Status</th>
          <th>Plano</th>
        </tr>
      </thead>
      <tbody>
        {companies.map(company => (
          <tr key={company.id}>
            <td>{company.id}</td>
            <td>{company.name}</td>
            <td>{company.email}</td>
            <td>{company.status ? '✅ Ativo' : '❌ Inativo'}</td>
            <td>{company.plan?.name}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
```

## Próximos Passos

1. **Ler documentação completa:** `docs/contracts/companies-api-contract.md`
2. **Ver exemplos OpenAPI:** `docs/contracts/companies-openapi.yaml`
3. **Testar no Postman:** Importar `companies-postman-collection.json`
4. **Entender segurança:** Seção "Multi-Tenant Security" na documentação

## Links Úteis

- Documentação completa: `/docs/contracts/companies-api-contract.md`
- Resumo executivo: `/docs/contracts/companies-api-summary.md`
- OpenAPI Spec: `/docs/contracts/companies-openapi.yaml`
- Postman Collection: `/docs/contracts/companies-postman-collection.json`
- Código Backend: `/backend/src/controllers/CompanyController.ts`

## Suporte

- Slack: #api-companies
- Email: dev@chatiaflow.com
- Issues: GitHub (tag: `api-companies`)

---

**Tempo de leitura:** 5 minutos
**Última atualização:** 2025-10-13
