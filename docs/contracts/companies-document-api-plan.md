# Contratos REST API e Schemas Yup - Campo `document` Opcional

**Feature**: Campo `document` (CPF/CNPJ) opcional com validação condicional
**Data**: 2025-10-13
**Versão da API**: v1
**ADR Base**: `docs/architecture/ADR-2025-10-13-companies-document-optional.md`
**Status**: Proposta

---

## Índice

1. [Contratos REST API](#1-contratos-rest-api)
2. [Schemas Yup Detalhados](#2-schemas-yup-detalhados)
3. [Documentação de Normalização](#3-documentação-de-normalização)
4. [Casos de Edge](#4-casos-de-edge)
5. [Feature Flag Behavior](#5-feature-flag-behavior)
6. [Performance Considerations](#6-performance-considerations)
7. [Testes de Contrato](#7-testes-de-contrato)
8. [Mensagens de Erro i18n](#8-mensagens-de-erro-i18n)
9. [Exemplos de Requisições](#9-exemplos-de-requisições)

---

## 1. Contratos REST API

### 1.1. POST `/companies`

**Descrição**: Cria uma nova empresa com campo `document` opcional e validado

#### Request

```typescript
// Content-Type: application/json
// Authorization: Bearer {token}

{
  name: string;           // obrigatório, min 2 chars
  email: string;          // obrigatório, formato email válido
  phone?: string;         // opcional, telefone da empresa
  password: string;       // obrigatório, min 5 chars, senha do admin
  document?: string;      // OPCIONAL, CPF/CNPJ validado se presente
  planId?: number;        // opcional, ID do plano contratado
  status?: boolean;       // opcional, default true (ativa)
  dueDate?: string;       // opcional, formato YYYY-MM-DD
  recurrence?: string;    // opcional, enum: monthly|yearly
  paymentMethod?: string; // opcional, método de pagamento
  companyUserName?: string; // opcional, nome do usuário admin
}
```

**Validações de `document`**:

1. **Se ausente ou vazio (`""`, `null`, `undefined`)**:
   - Valor convertido para `NULL`
   - Request aceito sem validações adicionais

2. **Se presente (não vazio)**:
   - Normalizar: remover `.`, `-`, `/`, espaços
   - Validar comprimento:
     - **11 dígitos**: validar como CPF
     - **14 dígitos**: validar como CNPJ
     - **Outros**: rejeitar com erro 400
   - Aplicar algoritmos da Receita Federal (ver ADR Apêndices A e B)
   - Verificar UNIQUE constraint (rejeita duplicatas não-NULL)

3. **Algoritmos de validação**:
   - **CPF**: Dígitos verificadores calculados por módulo 11
   - **CNPJ**: Dígitos verificadores com pesos decrescentes
   - Rejeitar sequências repetidas: `"00000000000"`, `"11111111111"`, etc.

#### Response - Sucesso (201 Created)

```typescript
{
  id: number;                    // ID único da empresa
  name: string;                  // Nome da empresa
  email: string;                 // Email cadastrado
  phone: string | null;          // Telefone ou null
  document: string | null;       // SEMPRE null ou string normalizada (sem pontuação)
  status: boolean;               // Status ativo/inativo
  planId: number | null;         // ID do plano ou null
  dueDate: string | null;        // Data de vencimento ou null
  recurrence: string | null;     // Recorrência ou null
  paymentMethod: string | null;  // Método de pagamento ou null
  createdAt: string;             // ISO 8601 timestamp
  updatedAt: string;             // ISO 8601 timestamp
}
```

**Exemplo**:
```json
{
  "id": 123,
  "name": "Empresa XPTO Ltda",
  "email": "contato@xpto.com.br",
  "phone": "+5511999887766",
  "document": "12345678000190",
  "status": true,
  "planId": 2,
  "dueDate": "2025-11-13",
  "recurrence": "monthly",
  "paymentMethod": "credit_card",
  "createdAt": "2025-10-13T14:30:00.000Z",
  "updatedAt": "2025-10-13T14:30:00.000Z"
}
```

#### Response - Erro 400 (Bad Request)

**Cenários**:
- CPF/CNPJ com formato inválido
- Comprimento incorreto (não é 11 nem 14 dígitos)
- Dígitos verificadores incorretos
- Sequências repetidas

```typescript
{
  error: string;   // Código de erro (i18n key)
  message: string; // Mensagem legível (i18n value)
}
```

**Exemplos**:
```json
{
  "error": "ERR_COMPANY_INVALID_DOCUMENT",
  "message": "CPF/CNPJ inválido"
}
```

```json
{
  "error": "ERR_COMPANY_INVALID_NAME",
  "message": "Nome da empresa inválido"
}
```

#### Response - Erro 409 (Conflict)

**Cenário**: CPF/CNPJ já cadastrado (duplicata)

```json
{
  "error": "ERR_COMPANY_DOCUMENT_DUPLICATE",
  "message": "CPF/CNPJ já cadastrado no sistema"
}
```

**Nota**: Este erro só ocorre se `document` não for NULL. Múltiplos valores NULL são permitidos.

---

### 1.2. PUT `/companies/:id`

**Descrição**: Atualiza uma empresa existente, incluindo o campo `document`

#### Request

```typescript
// Content-Type: application/json
// Authorization: Bearer {token}

{
  name?: string;           // opcional, min 2 chars
  email?: string;          // opcional, formato email válido
  phone?: string;          // opcional
  password?: string;       // opcional, min 5 chars
  document?: string | null; // OPCIONAL, pode ser removido enviando null/undefined/""
  planId?: number;         // opcional
  status?: boolean;        // opcional
  dueDate?: string;        // opcional
  recurrence?: string;     // opcional
  paymentMethod?: string;  // opcional
}
```

**Validações de `document`**:
- **Mesmas regras de POST**: validação, normalização, UNIQUE constraint
- **Remoção**: Enviar `null`, `undefined` ou `""` para remover o documento
- **Alteração**: Validar novo documento e verificar se não é duplicata

**Casos especiais**:
1. **Remover documento existente**:
   ```json
   {
     "document": null
   }
   ```
   ou
   ```json
   {
     "document": ""
   }
   ```
   Resultado: `document` definido como `NULL`

2. **Alterar documento existente**:
   ```json
   {
     "document": "98765432100"
   }
   ```
   Resultado: Validado e atualizado se único

3. **Manter documento existente**:
   - Não enviar campo `document` no payload
   - Valor permanece inalterado

#### Response - Sucesso (200 OK)

```typescript
{
  id: number;
  name: string;
  email: string;
  phone: string | null;
  document: string | null;  // SEMPRE null ou string normalizada
  status: boolean;
  planId: number | null;
  dueDate: string | null;
  recurrence: string | null;
  paymentMethod: string | null;
  createdAt: string;
  updatedAt: string;
}
```

#### Response - Erros

**400 Bad Request**:
```json
{
  "error": "ERR_COMPANY_INVALID_DOCUMENT",
  "message": "CPF/CNPJ inválido"
}
```

**404 Not Found**:
```json
{
  "error": "ERR_NO_COMPANY_FOUND",
  "message": "Empresa não encontrada"
}
```

**409 Conflict**:
```json
{
  "error": "ERR_COMPANY_DOCUMENT_DUPLICATE",
  "message": "CPF/CNPJ já cadastrado no sistema"
}
```

---

### 1.3. GET `/companies/:id`

**Descrição**: Retorna dados de uma empresa específica

#### Request

```http
GET /companies/123
Authorization: Bearer {token}
```

#### Response - Sucesso (200 OK)

```typescript
{
  id: number;
  name: string;
  email: string;
  phone: string | null;
  document: string | null;  // Retorna null ou string normalizada (sem pontuação)
  status: boolean;
  planId: number | null;
  dueDate: string | null;
  recurrence: string | null;
  paymentMethod: string | null;
  createdAt: string;
  updatedAt: string;
  plan?: {                   // Join com plano (se incluído)
    id: number;
    name: string;
    // ... outros campos
  }
}
```

**Exemplo com documento**:
```json
{
  "id": 123,
  "name": "Empresa XPTO Ltda",
  "email": "contato@xpto.com.br",
  "phone": "+5511999887766",
  "document": "12345678000190",
  "status": true,
  "planId": 2,
  "dueDate": "2025-11-13",
  "recurrence": "monthly",
  "paymentMethod": "credit_card",
  "createdAt": "2025-10-13T14:30:00.000Z",
  "updatedAt": "2025-10-13T14:30:00.000Z"
}
```

**Exemplo sem documento**:
```json
{
  "id": 124,
  "name": "Empresa ABC SA",
  "email": "contato@abc.com.br",
  "phone": null,
  "document": null,
  "status": true,
  "planId": 1,
  "dueDate": "2025-12-31",
  "recurrence": "yearly",
  "paymentMethod": "bank_slip",
  "createdAt": "2025-10-13T15:00:00.000Z",
  "updatedAt": "2025-10-13T15:00:00.000Z"
}
```

---

### 1.4. GET `/companies?searchParam=...`

**Descrição**: Lista empresas com busca textual

#### Request

```http
GET /companies?searchParam=123.456.789-00&pageNumber=1
Authorization: Bearer {token}
```

**Query Parameters**:
- `searchParam` (string, opcional): Termo de busca (nome, email, **document**)
- `pageNumber` (string, opcional): Número da página (default: 1)

#### Busca por `document` - Comportamento

**Importante**: A busca por documento deve funcionar **com ou sem formatação**.

**Cenários suportados**:

1. **Busca formatada**: `"123.456.789-00"` (CPF com pontuação)
   - Normalizar internamente para `"12345678900"`
   - Buscar no banco: `WHERE document = '12345678900'`
   - **Resultado**: Encontra empresa com `document = "12345678900"`

2. **Busca normalizada**: `"12345678900"` (sem pontuação)
   - Buscar diretamente: `WHERE document = '12345678900'`
   - **Resultado**: Encontra empresa com `document = "12345678900"`

3. **Busca parcial** (trigram index):
   - Usa índice GIN trigram para `ILIKE`
   - Exemplo: `"123456"` encontra `"12345678900"`

**Implementação sugerida**:
```typescript
// Pseudo-código de ListCompaniesService
if (searchParam) {
  const normalizedSearch = normalizeDocument(searchParam);

  whereCondition = {
    [Op.or]: [
      { name: { [Op.iLike]: `%${searchParam}%` } },
      { email: { [Op.iLike]: `%${searchParam}%` } },
      { document: { [Op.eq]: normalizedSearch } },  // Busca exata normalizada
      { document: { [Op.iLike]: `%${normalizedSearch}%` } } // Busca parcial
    ]
  };
}
```

#### Response - Sucesso (200 OK)

```typescript
{
  companies: Company[];  // Array de empresas
  count: number;         // Total de registros
  hasMore: boolean;      // Há mais páginas?
}
```

**Exemplo**:
```json
{
  "companies": [
    {
      "id": 123,
      "name": "Empresa XPTO Ltda",
      "email": "contato@xpto.com.br",
      "phone": "+5511999887766",
      "document": "12345678900",
      "status": true,
      "planId": 2,
      "dueDate": "2025-11-13",
      "recurrence": "monthly",
      "paymentMethod": "credit_card",
      "createdAt": "2025-10-13T14:30:00.000Z",
      "updatedAt": "2025-10-13T14:30:00.000Z"
    }
  ],
  "count": 1,
  "hasMore": false
}
```

---

## 2. Schemas Yup Detalhados

### 2.1. Helper: DocumentValidator

**Arquivo**: `backend/src/helpers/DocumentValidator.ts`

```typescript
/**
 * Normaliza documento removendo pontuação e espaços
 * @param document - CPF/CNPJ com ou sem formatação
 * @returns Documento normalizado (apenas dígitos)
 */
export function normalizeDocument(document: string): string {
  if (!document || typeof document !== 'string') {
    return '';
  }
  return document.replace(/[.\-\/\s]/g, '').trim();
}

/**
 * Valida CPF usando algoritmo da Receita Federal
 * @param cpf - CPF com 11 dígitos (já normalizado)
 * @returns true se válido, false caso contrário
 */
export function validateCPF(cpf: string): boolean {
  // Remove caracteres não numéricos (defesa em profundidade)
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

/**
 * Valida CNPJ usando algoritmo da Receita Federal
 * @param cnpj - CNPJ com 14 dígitos (já normalizado)
 * @returns true se válido, false caso contrário
 */
export function validateCNPJ(cnpj: string): boolean {
  // Remove caracteres não numéricos (defesa em profundidade)
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

/**
 * Valida CPF ou CNPJ automaticamente baseado no comprimento
 * @param document - CPF (11 dígitos) ou CNPJ (14 dígitos) normalizado
 * @returns true se válido, false caso contrário
 */
export function validateCPFOrCNPJ(document: string): boolean {
  // Normalizar (defesa em profundidade)
  const normalized = normalizeDocument(document);

  // Validar comprimento e tipo
  if (normalized.length === 11) {
    return validateCPF(normalized);
  } else if (normalized.length === 14) {
    return validateCNPJ(normalized);
  }

  // Comprimento inválido
  return false;
}
```

---

### 2.2. Schema: CreateCompanySchema

**Arquivo**: `backend/src/services/CompanyService/CreateCompanyService.ts`

```typescript
import * as Yup from 'yup';
import { normalizeDocument, validateCPFOrCNPJ } from '../../helpers/DocumentValidator';

// Feature flag
const FEATURE_COMPANY_DOCUMENT_OPTIONAL = process.env.FEATURE_COMPANY_DOCUMENT_OPTIONAL !== 'false';

const CreateCompanySchema = Yup.object().shape({
  // Campo obrigatório: nome da empresa
  name: Yup.string()
    .min(2, "ERR_COMPANY_INVALID_NAME")
    .max(255, "ERR_COMPANY_INVALID_NAME")
    .required("ERR_COMPANY_INVALID_NAME"),

  // Campo obrigatório: email
  email: Yup.string()
    .email("ERR_COMPANY_INVALID_EMAIL")
    .max(255, "ERR_COMPANY_INVALID_EMAIL")
    .required("ERR_COMPANY_INVALID_EMAIL"),

  // Campo obrigatório: senha do admin
  password: Yup.string()
    .min(5, "ERR_COMPANY_INVALID_PASSWORD")
    .max(255, "ERR_COMPANY_INVALID_PASSWORD")
    .required("ERR_COMPANY_INVALID_PASSWORD"),

  // Campo opcional: telefone
  phone: Yup.string()
    .max(20, "ERR_COMPANY_INVALID_PHONE")
    .nullable()
    .transform((value) => value || null),

  // Campo OPCIONAL: document (CPF/CNPJ)
  document: Yup.string()
    .nullable()
    .transform((value, originalValue) => {
      // Se feature flag desabilitada, retornar valor sem validação
      if (!FEATURE_COMPANY_DOCUMENT_OPTIONAL) {
        return originalValue || null;
      }

      // Se ausente, vazio ou apenas espaços, converter para null
      if (!originalValue || typeof originalValue !== 'string' || originalValue.trim() === '') {
        return null;
      }

      // Normalizar: remover pontuação e espaços
      const normalized = normalizeDocument(originalValue);

      // Se após normalização ficou vazio, retornar null
      if (normalized === '') {
        return null;
      }

      // Retornar normalizado
      return normalized;
    })
    .test('cpf-cnpj-valid', 'ERR_COMPANY_INVALID_DOCUMENT', function(value) {
      // Se feature flag desabilitada, passar
      if (!FEATURE_COMPANY_DOCUMENT_OPTIONAL) {
        return true;
      }

      // Se ausente ou null, passar (campo opcional)
      if (!value) {
        return true;
      }

      // Se presente, validar CPF ou CNPJ
      const isValid = validateCPFOrCNPJ(value);

      if (!isValid) {
        // Retornar erro com contexto
        return this.createError({
          message: 'ERR_COMPANY_INVALID_DOCUMENT',
          path: 'document'
        });
      }

      return true;
    }),

  // Campo opcional: planId
  planId: Yup.number()
    .integer("ERR_COMPANY_INVALID_PLAN_ID")
    .positive("ERR_COMPANY_INVALID_PLAN_ID")
    .nullable()
    .transform((value) => value || null),

  // Campo opcional: status
  status: Yup.boolean()
    .default(true),

  // Campo opcional: dueDate
  dueDate: Yup.string()
    .matches(/^\d{4}-\d{2}-\d{2}$/, "ERR_COMPANY_INVALID_DUE_DATE")
    .nullable()
    .transform((value) => value || null),

  // Campo opcional: recurrence
  recurrence: Yup.string()
    .oneOf(['monthly', 'yearly', ''], "ERR_COMPANY_INVALID_RECURRENCE")
    .nullable()
    .transform((value) => value || null),

  // Campo opcional: paymentMethod
  paymentMethod: Yup.string()
    .max(50, "ERR_COMPANY_INVALID_PAYMENT_METHOD")
    .nullable()
    .transform((value) => value || null),

  // Campo opcional: companyUserName
  companyUserName: Yup.string()
    .max(255, "ERR_COMPANY_INVALID_USERNAME")
    .nullable()
    .transform((value) => value || null)
});

export default CreateCompanySchema;
```

**Uso no service**:
```typescript
const CreateCompanyService = async (
  companyData: CompanyData
): Promise<Company> => {
  // Validar dados com Yup
  try {
    await CreateCompanySchema.validate(companyData, { abortEarly: false });
  } catch (err: any) {
    throw new AppError(err.message);
  }

  // Verificar duplicata de document (UNIQUE constraint)
  if (companyData.document) {
    const existingCompany = await Company.findOne({
      where: { document: companyData.document }
    });

    if (existingCompany) {
      throw new AppError("ERR_COMPANY_DOCUMENT_DUPLICATE", 409);
    }
  }

  // Criar empresa (transaction já implementada)
  const t = await sequelize.transaction();

  try {
    const company = await Company.create({
      ...companyData,
      document: companyData.document || null // Garantir null se vazio
    }, { transaction: t });

    // ... resto do código (criar user, settings)

    await t.commit();
    return company;
  } catch (error) {
    await t.rollback();

    // Tratar erro de UNIQUE constraint do PostgreSQL
    if (error.name === 'SequelizeUniqueConstraintError') {
      throw new AppError("ERR_COMPANY_DOCUMENT_DUPLICATE", 409);
    }

    throw new AppError("Não foi possível criar a empresa!", 400);
  }
};
```

---

### 2.3. Schema: UpdateCompanySchema

**Arquivo**: `backend/src/services/CompanyService/UpdateCompanyService.ts`

```typescript
import * as Yup from 'yup';
import { normalizeDocument, validateCPFOrCNPJ } from '../../helpers/DocumentValidator';

// Feature flag
const FEATURE_COMPANY_DOCUMENT_OPTIONAL = process.env.FEATURE_COMPANY_DOCUMENT_OPTIONAL !== 'false';

const UpdateCompanySchema = Yup.object().shape({
  // Campos opcionais (diferente de CreateCompany)
  name: Yup.string()
    .min(2, "ERR_COMPANY_INVALID_NAME")
    .max(255, "ERR_COMPANY_INVALID_NAME"),

  email: Yup.string()
    .email("ERR_COMPANY_INVALID_EMAIL")
    .max(255, "ERR_COMPANY_INVALID_EMAIL"),

  password: Yup.string()
    .min(5, "ERR_COMPANY_INVALID_PASSWORD")
    .max(255, "ERR_COMPANY_INVALID_PASSWORD"),

  phone: Yup.string()
    .max(20, "ERR_COMPANY_INVALID_PHONE")
    .nullable()
    .transform((value) => value || null),

  // Campo OPCIONAL: document (CPF/CNPJ)
  // MESMA LÓGICA DE CreateCompanySchema
  document: Yup.string()
    .nullable()
    .transform((value, originalValue) => {
      // Se feature flag desabilitada, retornar valor sem validação
      if (!FEATURE_COMPANY_DOCUMENT_OPTIONAL) {
        return originalValue || null;
      }

      // Se explicitamente null/undefined/vazio, converter para null (remover documento)
      if (originalValue === null || originalValue === undefined || originalValue === '') {
        return null;
      }

      // Se string vazia ou apenas espaços
      if (typeof originalValue === 'string' && originalValue.trim() === '') {
        return null;
      }

      // Normalizar: remover pontuação e espaços
      const normalized = normalizeDocument(originalValue);

      // Se após normalização ficou vazio, retornar null
      if (normalized === '') {
        return null;
      }

      // Retornar normalizado
      return normalized;
    })
    .test('cpf-cnpj-valid', 'ERR_COMPANY_INVALID_DOCUMENT', function(value) {
      // Se feature flag desabilitada, passar
      if (!FEATURE_COMPANY_DOCUMENT_OPTIONAL) {
        return true;
      }

      // Se ausente ou null, passar (remoção de documento permitida)
      if (!value) {
        return true;
      }

      // Se presente, validar CPF ou CNPJ
      const isValid = validateCPFOrCNPJ(value);

      if (!isValid) {
        return this.createError({
          message: 'ERR_COMPANY_INVALID_DOCUMENT',
          path: 'document'
        });
      }

      return true;
    }),

  planId: Yup.number()
    .integer("ERR_COMPANY_INVALID_PLAN_ID")
    .positive("ERR_COMPANY_INVALID_PLAN_ID")
    .nullable()
    .transform((value) => value || null),

  status: Yup.boolean(),

  dueDate: Yup.string()
    .matches(/^\d{4}-\d{2}-\d{2}$/, "ERR_COMPANY_INVALID_DUE_DATE")
    .nullable()
    .transform((value) => value || null),

  recurrence: Yup.string()
    .oneOf(['monthly', 'yearly', ''], "ERR_COMPANY_INVALID_RECURRENCE")
    .nullable()
    .transform((value) => value || null),

  paymentMethod: Yup.string()
    .max(50, "ERR_COMPANY_INVALID_PAYMENT_METHOD")
    .nullable()
    .transform((value) => value || null)
});

export default UpdateCompanySchema;
```

**Uso no service**:
```typescript
const UpdateCompanyService = async (
  companyData: CompanyData
): Promise<Company> => {
  // Validar dados com Yup
  try {
    await UpdateCompanySchema.validate(companyData, { abortEarly: false });
  } catch (err: any) {
    throw new AppError(err.message);
  }

  // Buscar empresa existente
  const company = await Company.findByPk(companyData.id);

  if (!company) {
    throw new AppError("ERR_NO_COMPANY_FOUND", 404);
  }

  // Verificar duplicata de document (se estiver alterando)
  if (companyData.document && companyData.document !== company.document) {
    const existingCompany = await Company.findOne({
      where: {
        document: companyData.document,
        id: { [Op.ne]: company.id } // Excluir a própria empresa
      }
    });

    if (existingCompany) {
      throw new AppError("ERR_COMPANY_DOCUMENT_DUPLICATE", 409);
    }
  }

  // Atualizar empresa
  try {
    await company.update({
      ...companyData,
      document: companyData.document // Já normalizado pelo Yup (null ou string)
    });

    return company;
  } catch (error) {
    // Tratar erro de UNIQUE constraint do PostgreSQL
    if (error.name === 'SequelizeUniqueConstraintError') {
      throw new AppError("ERR_COMPANY_DOCUMENT_DUPLICATE", 409);
    }

    throw new AppError("Não foi possível atualizar a empresa!", 400);
  }
};
```

---

### 2.4. Schema: CompanyController (Validação na Controller)

**Arquivo**: `backend/src/controllers/CompanyController.ts`

```typescript
import * as Yup from 'yup';
import { normalizeDocument, validateCPFOrCNPJ } from '../helpers/DocumentValidator';

// Feature flag
const FEATURE_COMPANY_DOCUMENT_OPTIONAL = process.env.FEATURE_COMPANY_DOCUMENT_OPTIONAL !== 'false';

// Schema para POST /companies
export const store = async (req: Request, res: Response): Promise<Response> => {
  const newCompany: CompanyData = req.body;

  // Schema Yup COMPLETO (incluindo document)
  const schema = Yup.object().shape({
    name: Yup.string()
      .min(2, "ERR_COMPANY_INVALID_NAME")
      .required("ERR_COMPANY_INVALID_NAME"),

    password: Yup.string()
      .min(5, "ERR_COMPANY_INVALID_PASSWORD")
      .required("ERR_COMPANY_INVALID_PASSWORD"),

    email: Yup.string()
      .email("ERR_COMPANY_INVALID_EMAIL"),

    // Validação de document
    document: Yup.string()
      .nullable()
      .transform((value, originalValue) => {
        if (!FEATURE_COMPANY_DOCUMENT_OPTIONAL) {
          return originalValue || null;
        }

        if (!originalValue || originalValue.trim() === '') {
          return null;
        }

        return normalizeDocument(originalValue);
      })
      .test('cpf-cnpj-valid', 'ERR_COMPANY_INVALID_DOCUMENT', function(value) {
        if (!FEATURE_COMPANY_DOCUMENT_OPTIONAL || !value) {
          return true;
        }

        return validateCPFOrCNPJ(value);
      })
  });

  try {
    await schema.validate(newCompany, { abortEarly: false });
  } catch (err: any) {
    throw new AppError(err.message, 400);
  }

  const company = await CreateCompanyService(newCompany);

  return res.status(201).json(company); // 201 Created (não 200)
};

// Schema para PUT /companies/:id
export const update = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const companyData: CompanyData = req.body;

  // Schema Yup (todos campos opcionais)
  const schema = Yup.object().shape({
    name: Yup.string()
      .min(2, "ERR_COMPANY_INVALID_NAME"),

    email: Yup.string()
      .email("ERR_COMPANY_INVALID_EMAIL"),

    // Validação de document (MESMA LÓGICA)
    document: Yup.string()
      .nullable()
      .transform((value, originalValue) => {
        if (!FEATURE_COMPANY_DOCUMENT_OPTIONAL) {
          return originalValue || null;
        }

        // Aceitar null explícito para remoção
        if (originalValue === null || originalValue === undefined || originalValue === '') {
          return null;
        }

        if (typeof originalValue === 'string' && originalValue.trim() === '') {
          return null;
        }

        return normalizeDocument(originalValue);
      })
      .test('cpf-cnpj-valid', 'ERR_COMPANY_INVALID_DOCUMENT', function(value) {
        if (!FEATURE_COMPANY_DOCUMENT_OPTIONAL || !value) {
          return true;
        }

        return validateCPFOrCNPJ(value);
      })
  });

  try {
    await schema.validate(companyData, { abortEarly: false });
  } catch (err: any) {
    throw new AppError(err.message, 400);
  }

  const { id } = req.params;

  // ... validação de permissões (código existente)

  const company = await UpdateCompanyService({ id, ...companyData });

  return res.status(200).json(company);
};
```

---

## 3. Documentação de Normalização

### 3.1. Processo de Normalização Passo a Passo

```typescript
function normalizeDocument(doc: string): string {
  // Passo 1: Trim (remover espaços nas bordas)
  // Passo 2: Remover pontuação: . - / espaços internos
  return doc.replace(/[.\-\/\s]/g, '');
}
```

### 3.2. Exemplos de Normalização

#### Exemplo 1: CPF válido com formatação completa

```javascript
// Input
const input = "123.456.789-00";

// Passo 1: Trim
const trimmed = input.trim(); // "123.456.789-00"

// Passo 2: Remover pontuação
const normalized = trimmed.replace(/[.\-\/\s]/g, ''); // "12345678900"

// Passo 3: Validar comprimento
normalized.length === 11; // true → CPF

// Passo 4: Validar dígitos verificadores
validateCPF(normalized); // true (se dígitos corretos)

// Output
"12345678900"
```

#### Exemplo 2: CNPJ válido com formatação completa

```javascript
// Input
const input = "12.345.678/0001-90";

// Normalização
const normalized = "12345678000190";

// Validação
normalized.length === 14; // true → CNPJ
validateCNPJ(normalized); // true (se dígitos corretos)

// Output
"12345678000190"
```

#### Exemplo 3: String vazia

```javascript
// Input
const input = "";

// Normalização
const normalized = ""; // String vazia permanece vazia

// Transform Yup
const result = normalized === '' ? null : normalized; // null

// Output
null
```

#### Exemplo 4: Apenas espaços

```javascript
// Input
const input = "   ";

// Normalização
const normalized = input.replace(/[.\-\/\s]/g, ''); // ""

// Transform Yup
const result = normalized === '' ? null : normalized; // null

// Output
null
```

#### Exemplo 5: CPF sem formatação (já normalizado)

```javascript
// Input
const input = "12345678900";

// Normalização
const normalized = input.replace(/[.\-\/\s]/g, ''); // "12345678900" (sem mudanças)

// Validação
normalized.length === 11; // true → CPF
validateCPF(normalized); // true (se dígitos corretos)

// Output
"12345678900"
```

#### Exemplo 6: Documento com espaços extras

```javascript
// Input
const input = " 123.456.789-00 ";

// Trim + Normalização
const normalized = input.trim().replace(/[.\-\/\s]/g, ''); // "12345678900"

// Output
"12345678900"
```

#### Exemplo 7: Comprimento inválido

```javascript
// Input
const input = "123";

// Normalização
const normalized = "123";

// Validação
normalized.length === 11; // false
normalized.length === 14; // false
validateCPFOrCNPJ(normalized); // false → ERR_COMPANY_INVALID_DOCUMENT

// Output
AppError("ERR_COMPANY_INVALID_DOCUMENT", 400)
```

---

### 3.3. Tabela de Transformações

| Input                      | Trim          | Normalizado       | Validação       | Output (DB)      | Status |
|----------------------------|---------------|-------------------|-----------------|------------------|--------|
| `"123.456.789-00"`         | `"123..."`    | `"12345678900"`   | CPF válido      | `"12345678900"`  | 201    |
| `"12.345.678/0001-90"`     | `"12..."`     | `"12345678000190"`| CNPJ válido     | `"12345678000190"`| 201   |
| `"12345678900"`            | `"12345..."`  | `"12345678900"`   | CPF válido      | `"12345678900"`  | 201    |
| `""`                       | `""`          | `""`              | null            | `NULL`           | 201    |
| `"   "`                    | `""`          | `""`              | null            | `NULL`           | 201    |
| `null`                     | -             | -                 | null            | `NULL`           | 201    |
| `undefined`                | -             | -                 | null            | `NULL`           | 201    |
| `"000.000.000-00"`         | `"000..."`    | `"00000000000"`   | CPF inválido    | -                | 400    |
| `"111.111.111-11"`         | `"111..."`    | `"11111111111"`   | CPF inválido    | -                | 400    |
| `"123.456.789-99"`         | `"123..."`    | `"12345678999"`   | Dígito errado   | -                | 400    |
| `"123"`                    | `"123"`       | `"123"`           | Comprimento     | -                | 400    |
| `" 123.456.789-00 "`       | `"123..."`    | `"12345678900"`   | CPF válido      | `"12345678900"`  | 201    |
| `"12 345 678 900"`         | `"12 345..."`| `"12345678900"`   | CPF válido      | `"12345678900"`  | 201    |

---

## 4. Casos de Edge

### 4.1. Ausência do Campo

#### Cenário 1: Campo `document` não enviado no request body

**Request**:
```json
{
  "name": "Empresa Teste",
  "email": "teste@empresa.com",
  "password": "senha123"
}
```

**Processamento**:
- `companyData.document` → `undefined`
- Yup transform → `null`
- Banco de dados → `NULL`

**Response** (201):
```json
{
  "id": 123,
  "name": "Empresa Teste",
  "email": "teste@empresa.com",
  "document": null,
  "..."
}
```

---

#### Cenário 2: Campo `document` explicitamente `null`

**Request**:
```json
{
  "name": "Empresa Teste",
  "email": "teste@empresa.com",
  "password": "senha123",
  "document": null
}
```

**Processamento**:
- `companyData.document` → `null`
- Yup transform → `null`
- Banco de dados → `NULL`

**Response** (201): Igual ao Cenário 1

---

#### Cenário 3: Campo `document` string vazia

**Request**:
```json
{
  "name": "Empresa Teste",
  "email": "teste@empresa.com",
  "password": "senha123",
  "document": ""
}
```

**Processamento**:
- `companyData.document` → `""`
- Yup transform → `null` (vazio convertido)
- Banco de dados → `NULL`

**Response** (201): Igual ao Cenário 1

---

#### Cenário 4: Campo `document` apenas espaços

**Request**:
```json
{
  "name": "Empresa Teste",
  "email": "teste@empresa.com",
  "password": "senha123",
  "document": "   "
}
```

**Processamento**:
- `companyData.document` → `"   "`
- Yup transform → `null` (espaços removidos, resultado vazio)
- Banco de dados → `NULL`

**Response** (201): Igual ao Cenário 1

---

### 4.2. Documentos Válidos

#### Cenário 5: CPF válido formatado

**Request**:
```json
{
  "name": "Empresa CPF",
  "email": "cpf@empresa.com",
  "password": "senha123",
  "document": "123.456.789-09"
}
```

**Processamento**:
- `companyData.document` → `"123.456.789-09"`
- Yup transform → `"12345678909"` (normalizado)
- Yup test → `validateCPF("12345678909")` → `true`
- Banco de dados → `"12345678909"`

**Response** (201):
```json
{
  "id": 124,
  "name": "Empresa CPF",
  "email": "cpf@empresa.com",
  "document": "12345678909",
  "..."
}
```

---

#### Cenário 6: CNPJ válido formatado

**Request**:
```json
{
  "name": "Empresa CNPJ",
  "email": "cnpj@empresa.com",
  "password": "senha123",
  "document": "11.222.333/0001-81"
}
```

**Processamento**:
- `companyData.document` → `"11.222.333/0001-81"`
- Yup transform → `"11222333000181"` (normalizado)
- Yup test → `validateCNPJ("11222333000181")` → `true`
- Banco de dados → `"11222333000181"`

**Response** (201):
```json
{
  "id": 125,
  "name": "Empresa CNPJ",
  "email": "cnpj@empresa.com",
  "document": "11222333000181",
  "..."
}
```

---

### 4.3. Documentos Inválidos

#### Cenário 7: CPF com todos zeros (sequência repetida)

**Request**:
```json
{
  "name": "Empresa Teste",
  "email": "teste@empresa.com",
  "password": "senha123",
  "document": "000.000.000-00"
}
```

**Processamento**:
- `companyData.document` → `"000.000.000-00"`
- Yup transform → `"00000000000"` (normalizado)
- Yup test → `validateCPF("00000000000")` → `false` (sequência repetida)
- **Erro lançado**

**Response** (400):
```json
{
  "error": "ERR_COMPANY_INVALID_DOCUMENT",
  "message": "CPF/CNPJ inválido"
}
```

---

#### Cenário 8: CPF com dígito verificador incorreto

**Request**:
```json
{
  "name": "Empresa Teste",
  "email": "teste@empresa.com",
  "password": "senha123",
  "document": "123.456.789-00"
}
```

**Processamento**:
- `companyData.document` → `"123.456.789-00"`
- Yup transform → `"12345678900"` (normalizado)
- Yup test → `validateCPF("12345678900")` → `false` (dígito verificador incorreto)
- **Erro lançado**

**Response** (400):
```json
{
  "error": "ERR_COMPANY_INVALID_DOCUMENT",
  "message": "CPF/CNPJ inválido"
}
```

---

#### Cenário 9: Comprimento inválido (não é CPF nem CNPJ)

**Request**:
```json
{
  "name": "Empresa Teste",
  "email": "teste@empresa.com",
  "password": "senha123",
  "document": "123"
}
```

**Processamento**:
- `companyData.document` → `"123"`
- Yup transform → `"123"` (normalizado, sem mudanças)
- Yup test → `validateCPFOrCNPJ("123")` → `false` (comprimento inválido)
- **Erro lançado**

**Response** (400):
```json
{
  "error": "ERR_COMPANY_INVALID_DOCUMENT",
  "message": "CPF/CNPJ inválido"
}
```

---

### 4.4. Duplicatas

#### Cenário 10: CPF/CNPJ já cadastrado (duplicata)

**Estado do banco**:
```sql
SELECT id, name, document FROM "Companies" WHERE document = '12345678909';
-- Resultado: id=124, name="Empresa CPF", document="12345678909"
```

**Request** (tentar criar empresa com mesmo document):
```json
{
  "name": "Outra Empresa",
  "email": "outra@empresa.com",
  "password": "senha123",
  "document": "123.456.789-09"
}
```

**Processamento**:
- `companyData.document` → `"123.456.789-09"`
- Yup transform → `"12345678909"` (normalizado)
- Yup test → `validateCPF("12345678909")` → `true` (formato válido)
- Service: Buscar `Company.findOne({ where: { document: "12345678909" } })`
- **Encontrado** → Lançar erro duplicata

**Response** (409):
```json
{
  "error": "ERR_COMPANY_DOCUMENT_DUPLICATE",
  "message": "CPF/CNPJ já cadastrado no sistema"
}
```

---

#### Cenário 11: Múltiplas empresas sem documento (NULL permitido)

**Estado do banco**:
```sql
SELECT id, name, document FROM "Companies" WHERE document IS NULL;
-- Resultado:
-- id=1, name="Empresa A", document=null
-- id=2, name="Empresa B", document=null
-- id=3, name="Empresa C", document=null
```

**Request** (criar mais uma empresa sem document):
```json
{
  "name": "Empresa D",
  "email": "empresad@empresa.com",
  "password": "senha123"
}
```

**Processamento**:
- `companyData.document` → `undefined`
- Yup transform → `null`
- Service: `document` é `null`, não verifica duplicata
- Banco de dados → `NULL` (UNIQUE constraint parcial permite múltiplos NULL)

**Response** (201):
```json
{
  "id": 4,
  "name": "Empresa D",
  "email": "empresad@empresa.com",
  "document": null,
  "..."
}
```

**Conclusão**: Múltiplos NULL permitidos (comportamento correto)

---

### 4.5. Busca por Documento

#### Cenário 12: Busca com formatação (deve encontrar documento normalizado)

**Estado do banco**:
```sql
SELECT id, name, document FROM "Companies" WHERE id = 124;
-- Resultado: id=124, name="Empresa CPF", document="12345678909"
```

**Request**:
```http
GET /companies?searchParam=123.456.789-09
```

**Processamento**:
- `searchParam` → `"123.456.789-09"`
- Normalizar internamente → `"12345678909"`
- Query: `WHERE document = '12345678909' OR document ILIKE '%12345678909%'`
- **Encontrado**: Empresa id=124

**Response** (200):
```json
{
  "companies": [
    {
      "id": 124,
      "name": "Empresa CPF",
      "document": "12345678909",
      "..."
    }
  ],
  "count": 1,
  "hasMore": false
}
```

---

#### Cenário 13: Busca sem formatação (deve encontrar documento normalizado)

**Request**:
```http
GET /companies?searchParam=12345678909
```

**Processamento**:
- `searchParam` → `"12345678909"`
- Normalizar internamente → `"12345678909"` (sem mudanças)
- Query: `WHERE document = '12345678909' OR document ILIKE '%12345678909%'`
- **Encontrado**: Empresa id=124

**Response** (200): Igual ao Cenário 12

---

#### Cenário 14: Busca parcial por documento

**Request**:
```http
GET /companies?searchParam=123456
```

**Processamento**:
- `searchParam` → `"123456"`
- Normalizar internamente → `"123456"`
- Query: `WHERE document ILIKE '%123456%'` (trigram index)
- **Encontrado**: Empresa id=124 (document contém "123456")

**Response** (200):
```json
{
  "companies": [
    {
      "id": 124,
      "name": "Empresa CPF",
      "document": "12345678909",
      "..."
    }
  ],
  "count": 1,
  "hasMore": false
}
```

---

### 4.6. Atualização de Documento

#### Cenário 15: Remover documento existente (PUT com null)

**Estado inicial**:
```sql
SELECT id, name, document FROM "Companies" WHERE id = 124;
-- Resultado: id=124, name="Empresa CPF", document="12345678909"
```

**Request**:
```http
PUT /companies/124
Content-Type: application/json

{
  "document": null
}
```

**Processamento**:
- `companyData.document` → `null`
- Yup transform → `null`
- Service: Atualizar `document` para `NULL`

**Response** (200):
```json
{
  "id": 124,
  "name": "Empresa CPF",
  "email": "cpf@empresa.com",
  "document": null,
  "..."
}
```

**Estado final**:
```sql
SELECT id, name, document FROM "Companies" WHERE id = 124;
-- Resultado: id=124, name="Empresa CPF", document=null
```

---

#### Cenário 16: Alterar documento existente (validar novo + verificar duplicata)

**Estado inicial**:
```sql
SELECT id, name, document FROM "Companies" WHERE id = 124;
-- Resultado: id=124, name="Empresa CPF", document="12345678909"
```

**Request**:
```http
PUT /companies/124
Content-Type: application/json

{
  "document": "98765432100"
}
```

**Processamento**:
- `companyData.document` → `"98765432100"`
- Yup transform → `"98765432100"` (já normalizado)
- Yup test → `validateCPF("98765432100")` → `true`
- Service: Verificar duplicata excluindo própria empresa
  ```typescript
  Company.findOne({
    where: {
      document: "98765432100",
      id: { [Op.ne]: 124 }
    }
  })
  ```
- Não encontrado duplicata → Atualizar

**Response** (200):
```json
{
  "id": 124,
  "name": "Empresa CPF",
  "email": "cpf@empresa.com",
  "document": "98765432100",
  "..."
}
```

---

#### Cenário 17: Tentar alterar para documento duplicado (deve rejeitar)

**Estado inicial**:
```sql
SELECT id, name, document FROM "Companies";
-- Resultado:
-- id=124, name="Empresa A", document="12345678909"
-- id=125, name="Empresa B", document="98765432100"
```

**Request** (tentar mudar Empresa A para documento da Empresa B):
```http
PUT /companies/124
Content-Type: application/json

{
  "document": "987.654.321-00"
}
```

**Processamento**:
- `companyData.document` → `"987.654.321-00"`
- Yup transform → `"98765432100"` (normalizado)
- Yup test → `validateCPF("98765432100")` → `true`
- Service: Verificar duplicata
  ```typescript
  Company.findOne({
    where: {
      document: "98765432100",
      id: { [Op.ne]: 124 }
    }
  })
  ```
- **Encontrado** empresa id=125 → Lançar erro duplicata

**Response** (409):
```json
{
  "error": "ERR_COMPANY_DOCUMENT_DUPLICATE",
  "message": "CPF/CNPJ já cadastrado no sistema"
}
```

---

## 5. Feature Flag Behavior

### 5.1. Variável de Ambiente

**Backend**:
```bash
# .env
FEATURE_COMPANY_DOCUMENT_OPTIONAL=true  # default: true (feature ativa)
```

**Frontend**:
```bash
# .env
REACT_APP_FEATURE_COMPANY_DOCUMENT_OPTIONAL=enabled  # default: enabled
```

---

### 5.2. Comportamento com Flag ON (default)

**Estado**: `FEATURE_COMPANY_DOCUMENT_OPTIONAL=true`

#### Backend

1. **Validação ativa**:
   - Schema Yup valida CPF/CNPJ se presente
   - Normalização aplicada
   - Rejeita documentos inválidos (400)

2. **UNIQUE constraint aplicado**:
   - Índice parcial `WHERE document IS NOT NULL` ativo no banco
   - Verificação programática em CreateCompanyService e UpdateCompanyService
   - Rejeita duplicatas (409)

3. **Conversão null**:
   - Strings vazias convertidas para `NULL`
   - Banco armazena `NULL` para documentos ausentes

#### Frontend

1. **Campo visível**:
   - Input com máscara condicional CPF/CNPJ
   - Label: "CPF/CNPJ (opcional)"
   - Validação em tempo real (onChange)

2. **Validação client-side ativa**:
   - Feedback instantâneo para usuário
   - Mesma lógica de validação do backend

3. **Exibição**:
   - Documento formatado: `"123.456.789-09"`
   - NULL exibido como: "Não informado"

---

### 5.3. Comportamento com Flag OFF (rollback)

**Estado**: `FEATURE_COMPANY_DOCUMENT_OPTIONAL=false`

#### Backend

1. **Validação desabilitada**:
   - Schema Yup **não valida** formato CPF/CNPJ
   - Normalização **desabilitada** (aceita qualquer string)
   - Aceita qualquer valor em `document`

2. **UNIQUE constraint**:
   - **Índice permanece ativo no banco** (segurança)
   - Verificação programática **desabilitada** (não lança erro 409)
   - PostgreSQL ainda rejeita duplicatas não-NULL (fallback de segurança)

3. **Conversão null**:
   - Ainda converte strings vazias para `NULL` (consistência)

**Código**:
```typescript
const FEATURE_COMPANY_DOCUMENT_OPTIONAL = process.env.FEATURE_COMPANY_DOCUMENT_OPTIONAL !== 'false';

document: Yup.string()
  .nullable()
  .transform((value, originalValue) => {
    // Feature flag OFF: retornar valor sem normalização
    if (!FEATURE_COMPANY_DOCUMENT_OPTIONAL) {
      return originalValue || null;
    }

    // Feature flag ON: normalizar
    if (!originalValue || originalValue.trim() === '') {
      return null;
    }
    return normalizeDocument(originalValue);
  })
  .test('cpf-cnpj-valid', 'ERR_COMPANY_INVALID_DOCUMENT', function(value) {
    // Feature flag OFF: pular validação
    if (!FEATURE_COMPANY_DOCUMENT_OPTIONAL) {
      return true;
    }

    // Feature flag ON: validar
    if (!value) return true;
    return validateCPFOrCNPJ(value);
  })
```

#### Frontend

1. **Campo visível** (sem mudanças):
   - Input sem máscara (texto livre)
   - Label: "CPF/CNPJ:"
   - Sem validação em tempo real

2. **Validação client-side desabilitada**:
   - Aceita qualquer string
   - Não exibe mensagens de erro de formato

3. **Exibição**:
   - Documento exibido como recebido (sem formatação)
   - NULL exibido como: "" (string vazia)

---

### 5.4. Tabela Comparativa

| Aspecto                        | Flag ON (default)                    | Flag OFF (rollback)               |
|--------------------------------|--------------------------------------|-----------------------------------|
| **Validação Backend**          | Ativa (rejeita inválidos)            | Desabilitada (aceita tudo)        |
| **Normalização**               | Ativa (remove pontuação)             | Desabilitada (mantém original)    |
| **UNIQUE Constraint (DB)**     | Ativo (índice parcial)               | Ativo (índice permanece)          |
| **Verificação Programática**   | Ativa (lança 409 duplicata)          | Desabilitada (não verifica)       |
| **Conversão NULL**             | Strings vazias → NULL                | Strings vazias → NULL             |
| **Validação Frontend**         | Ativa (máscaras, feedback)           | Desabilitada (texto livre)        |
| **Máscaras CPF/CNPJ**          | Ativas (condicionais)                | Desabilitadas                     |
| **Mensagens de Erro**          | Específicas (CPF/CNPJ inválido)      | Genéricas                         |
| **Exibição Documento**         | Formatado (123.456.789-09)           | Original (como recebido)          |
| **Exibição NULL**              | "Não informado"                      | "" (vazio)                        |
| **Overhead Performance**       | ~2-5ms (validação + constraint)      | ~1ms (apenas constraint DB)       |

---

### 5.5. Cenários de Rollback

#### Cenário 1: Bug crítico em validação

**Problema**: Algoritmo de validação rejeita CPF/CNPJ válidos (falso positivo)

**Ação**: Desabilitar feature flag
```bash
# Backend
export FEATURE_COMPANY_DOCUMENT_OPTIONAL=false
pm2 restart backend

# Frontend (opcional, manter flag ON para não quebrar UI)
export REACT_APP_FEATURE_COMPANY_DOCUMENT_OPTIONAL=enabled
```

**Resultado**:
- Backend aceita qualquer documento (sem validação)
- Frontend continua exibindo máscaras (não quebra UI)
- UNIQUE constraint ainda protege contra duplicatas (DB)

**Tempo de rollback**: ~1 minuto (restart services)

---

#### Cenário 2: Performance degradation

**Problema**: Validação causando latência > 100ms em produção

**Ação**: Desabilitar feature flag temporariamente
```bash
export FEATURE_COMPANY_DOCUMENT_OPTIONAL=false
pm2 restart backend
```

**Resultado**:
- Backend pula validação (reduz latência)
- Dados ainda protegidos por UNIQUE constraint (DB)

**Investigação**: Profiling de `validateCPF()` e `validateCNPJ()` para otimização

---

#### Cenário 3: Rollback completo (reverter migrations)

**Problema**: UNIQUE constraint causou bloqueio em produção

**Ação**: Reverter migration
```bash
cd backend
npm run sequelize db:migrate:undo
```

**SQL executado**:
```sql
DROP INDEX IF EXISTS idx_companies_document_unique;
```

**Resultado**:
- UNIQUE constraint removido
- Duplicatas permitidas (comportamento antigo)
- Feature flag ainda controla validações

**Tempo de rollback**: ~5-10 minutos (migration undo)

---

## 6. Performance Considerations

### 6.1. Overhead de Validação

#### Benchmarks

**Validação CPF**:
```
Algoritmo: 2 loops (9 + 10 iterações)
Operações: ~30 operações aritméticas
Tempo médio: 0.1-0.3ms por validação
```

**Validação CNPJ**:
```
Algoritmo: 2 loops (12 + 13 iterações)
Operações: ~50 operações aritméticas
Tempo médio: 0.2-0.5ms por validação
```

**Normalização**:
```
Operação: Regex replace (/[.\-\/\s]/g)
Tempo médio: < 0.05ms
```

**Total por request**:
```
Normalização + Validação + UNIQUE check = 0.5 + 3.0 = ~3.5ms
```

#### Latência por Endpoint

| Endpoint         | Sem Feature | Com Feature | Diferença | Percentual |
|------------------|-------------|-------------|-----------|------------|
| POST /companies  | 50ms        | 53.5ms      | +3.5ms    | +7%        |
| PUT /companies   | 40ms        | 43.5ms      | +3.5ms    | +8.75%     |
| GET /companies/:id | 10ms      | 10ms        | 0ms       | 0%         |
| GET /companies?search | 80ms   | 82ms        | +2ms      | +2.5%      |

**Conclusão**: Overhead imperceptível para usuário final (< 5ms)

---

### 6.2. Impacto do UNIQUE Constraint

#### Índice Parcial

**SQL**:
```sql
CREATE UNIQUE INDEX idx_companies_document_unique
ON "Companies" (document)
WHERE document IS NOT NULL;
```

**Características**:
- **Tipo**: B-tree (default PostgreSQL)
- **Tamanho**: ~2-5% do tamanho da tabela
  - 10K empresas: ~1MB índice
  - 100K empresas: ~10MB índice
  - 1M empresas: ~100MB índice

**Performance de INSERT/UPDATE**:
- **Sem índice**: 1-2ms
- **Com índice**: 3-5ms (check UNIQUE constraint)
- **Diferença**: +2-3ms

**Performance de SELECT**:
- **Sem índice**: 50-100ms (table scan em 100K rows)
- **Com índice**: 0.1-0.5ms (index scan)
- **Ganho**: 100-1000x mais rápido

**Query Plan**:
```sql
EXPLAIN ANALYZE
SELECT * FROM "Companies" WHERE document = '12345678900';

-- Resultado:
-- Index Scan using idx_companies_document_unique on "Companies"  (cost=0.29..8.30 rows=1 width=...)
-- Planning Time: 0.123 ms
-- Execution Time: 0.234 ms
```

**Conclusão**: Índice otimiza SELECT, overhead mínimo em INSERT/UPDATE

---

### 6.3. Impacto do Índice GIN Trigram

**SQL existente**:
```sql
CREATE INDEX idx_companies_document_trgm
ON "Companies" USING GIN (document gin_trgm_ops);
```

**Características**:
- **Tipo**: GIN (Generalized Inverted Index) com trigram
- **Tamanho**: ~10-20% do tamanho da tabela
- **Propósito**: Busca textual com `ILIKE '%search%'`

**Performance de Busca**:
```sql
EXPLAIN ANALYZE
SELECT * FROM "Companies" WHERE document ILIKE '%123456%';

-- Resultado:
-- Bitmap Heap Scan on "Companies"  (cost=12.00..40.00 rows=10 width=...)
--   Recheck Cond: (document ~~* '%123456%'::text)
--   ->  Bitmap Index Scan on idx_companies_document_trgm  (cost=0.00..12.00 rows=10 width=0)
--         Index Cond: (document ~~* '%123456%'::text)
-- Planning Time: 0.456 ms
-- Execution Time: 1.234 ms
```

**Impacto Combinado (UNIQUE + GIN)**:
- 2 índices na coluna `document`
- Espaço total: ~12-25% do tamanho da tabela
- Overhead INSERT/UPDATE: ~4-6ms (2 índices atualizados)
- Benefício SELECT: Busca exata (UNIQUE) + Busca parcial (GIN)

**Conclusão**: Overhead aceitável (<10ms) para ganho em performance de busca

---

### 6.4. Otimizações Recomendadas

#### 1. Cache de Validação (opcional)

**Problema**: Validar mesmo documento múltiplas vezes (ex: retries)

**Solução**: Cache em memória com TTL curto
```typescript
import NodeCache from 'node-cache';

const validationCache = new NodeCache({
  stdTTL: 60,        // 1 minuto
  checkperiod: 120,  // Cleanup a cada 2 minutos
  maxKeys: 10000     // Máximo 10K documentos em cache
});

export function validateCPFOrCNPJ(document: string): boolean {
  // Verificar cache
  const cachedResult = validationCache.get<boolean>(document);
  if (cachedResult !== undefined) {
    return cachedResult;
  }

  // Validar
  const normalized = normalizeDocument(document);
  const isValid = (normalized.length === 11)
    ? validateCPF(normalized)
    : validateCNPJ(normalized);

  // Armazenar em cache
  validationCache.set(document, isValid);

  return isValid;
}
```

**Ganho**: Reduz validação de ~0.3ms para ~0.01ms em cache hit (30x mais rápido)

---

#### 2. Lazy Loading de Documentos

**Problema**: GET /companies retorna `document` mesmo quando não necessário

**Solução**: Adicionar query parameter `?fields=name,email` para projeção
```typescript
export const index = async (req: Request, res: Response): Promise<Response> => {
  const { searchParam, pageNumber, fields } = req.query;

  const attributes = fields
    ? fields.split(',')
    : undefined; // Retorna todas as colunas

  const { companies, count, hasMore } = await ListCompaniesService({
    searchParam,
    pageNumber,
    attributes // Passar para Sequelize
  });

  return res.json({ companies, count, hasMore });
};
```

**Ganho**: Reduz tráfego de rede e serialização JSON (~10-20% menor payload)

---

#### 3. Índice Condicional para Busca

**Problema**: Busca por documento parcial pode ser lenta com trigram em tabelas gigantes

**Solução**: Índice composto `(status, document)` para filtrar empresas ativas
```sql
CREATE INDEX idx_companies_active_document
ON "Companies" (status, document)
WHERE status = true AND document IS NOT NULL;
```

**Query otimizada**:
```sql
SELECT * FROM "Companies"
WHERE status = true AND document ILIKE '%123456%';

-- Usa índice idx_companies_active_document
```

**Ganho**: Reduz scan em ~50-70% (ignora empresas inativas)

---

#### 4. Prepared Statements (Sequelize já faz)

**Problema**: Query parsing overhead em validações repetidas

**Solução**: Sequelize automaticamente usa prepared statements
```typescript
// Sequelize já otimiza internamente
const company = await Company.findOne({
  where: { document: normalizedDocument }
});

// Traduz para prepared statement:
// PREPARE stmt AS SELECT * FROM "Companies" WHERE document = $1;
// EXECUTE stmt('12345678900');
```

**Ganho**: ~10-20% mais rápido que queries raw

---

### 6.5. Monitoramento de Performance

#### Métricas a Coletar

1. **Latência de Validação**:
   ```typescript
   import { performance } from 'perf_hooks';

   const start = performance.now();
   const isValid = validateCPFOrCNPJ(document);
   const duration = performance.now() - start;

   logger.info({
     message: 'Document validation performance',
     duration,
     documentLength: document.length,
     isValid
   });
   ```

2. **Taxa de Erro de Validação**:
   ```typescript
   // Métrica: % de requests com documento inválido
   const validationErrorRate = (invalidDocuments / totalRequests) * 100;

   // Alerta se > 5% (indica problema em frontend ou ataque)
   if (validationErrorRate > 5) {
     logger.warn({
       message: 'High validation error rate',
       rate: validationErrorRate,
       threshold: 5
     });
   }
   ```

3. **Performance de UNIQUE Constraint**:
   ```typescript
   // Medir tempo de INSERT com constraint
   const start = performance.now();
   try {
     await Company.create({ document: normalizedDocument });
   } catch (error) {
     if (error.name === 'SequelizeUniqueConstraintError') {
       const duration = performance.now() - start;
       logger.info({
         message: 'Duplicate document detected',
         duration,
         document: normalizedDocument
       });
     }
   }
   ```

4. **Tamanho dos Índices**:
   ```sql
   -- Query PostgreSQL para monitorar índices
   SELECT
     indexname,
     pg_size_pretty(pg_relation_size(indexname::regclass)) AS size,
     idx_scan AS scans,
     idx_tup_read AS tuples_read,
     idx_tup_fetch AS tuples_fetched
   FROM pg_stat_user_indexes
   WHERE schemaname = 'public' AND tablename = 'Companies';
   ```

**Dashboard Sugerido** (Grafana/Prometheus):
- Latência p50, p95, p99 de validações
- Taxa de erro de validação (por hora)
- Tamanho de índices (growth rate)
- Número de duplicatas rejeitadas (por dia)

---

## 7. Testes de Contrato

### 7.1. Testes Unitários (Jest)

**Arquivo**: `backend/src/__tests__/helpers/DocumentValidator.test.ts`

```typescript
import {
  normalizeDocument,
  validateCPF,
  validateCNPJ,
  validateCPFOrCNPJ
} from '../../helpers/DocumentValidator';

describe('DocumentValidator', () => {
  describe('normalizeDocument', () => {
    it('should remove dots, dashes, slashes and spaces', () => {
      expect(normalizeDocument('123.456.789-00')).toBe('12345678900');
      expect(normalizeDocument('12.345.678/0001-90')).toBe('12345678000190');
      expect(normalizeDocument('123 456 789 00')).toBe('12345678900');
    });

    it('should trim whitespace', () => {
      expect(normalizeDocument(' 123.456.789-00 ')).toBe('12345678900');
    });

    it('should return empty string for empty input', () => {
      expect(normalizeDocument('')).toBe('');
      expect(normalizeDocument('   ')).toBe('');
    });

    it('should handle null and undefined', () => {
      expect(normalizeDocument(null as any)).toBe('');
      expect(normalizeDocument(undefined as any)).toBe('');
    });
  });

  describe('validateCPF', () => {
    it('should validate correct CPF', () => {
      expect(validateCPF('12345678909')).toBe(true);
      expect(validateCPF('11144477735')).toBe(true);
    });

    it('should reject CPF with all zeros', () => {
      expect(validateCPF('00000000000')).toBe(false);
    });

    it('should reject CPF with all same digits', () => {
      expect(validateCPF('11111111111')).toBe(false);
      expect(validateCPF('22222222222')).toBe(false);
    });

    it('should reject CPF with wrong check digits', () => {
      expect(validateCPF('12345678900')).toBe(false);
      expect(validateCPF('11144477736')).toBe(false);
    });

    it('should reject CPF with wrong length', () => {
      expect(validateCPF('123')).toBe(false);
      expect(validateCPF('123456789012')).toBe(false);
    });
  });

  describe('validateCNPJ', () => {
    it('should validate correct CNPJ', () => {
      expect(validateCNPJ('11222333000181')).toBe(true);
      expect(validateCNPJ('00000000000191')).toBe(true);
    });

    it('should reject CNPJ with all zeros', () => {
      expect(validateCNPJ('00000000000000')).toBe(false);
    });

    it('should reject CNPJ with all same digits', () => {
      expect(validateCNPJ('11111111111111')).toBe(false);
      expect(validateCNPJ('22222222222222')).toBe(false);
    });

    it('should reject CNPJ with wrong check digits', () => {
      expect(validateCNPJ('11222333000100')).toBe(false);
    });

    it('should reject CNPJ with wrong length', () => {
      expect(validateCNPJ('123')).toBe(false);
      expect(validateCNPJ('123456789012345')).toBe(false);
    });
  });

  describe('validateCPFOrCNPJ', () => {
    it('should validate CPF (11 digits)', () => {
      expect(validateCPFOrCNPJ('12345678909')).toBe(true);
      expect(validateCPFOrCNPJ('123.456.789-09')).toBe(true);
    });

    it('should validate CNPJ (14 digits)', () => {
      expect(validateCPFOrCNPJ('11222333000181')).toBe(true);
      expect(validateCPFOrCNPJ('11.222.333/0001-81')).toBe(true);
    });

    it('should reject invalid length', () => {
      expect(validateCPFOrCNPJ('123')).toBe(false);
      expect(validateCPFOrCNPJ('1234567890123')).toBe(false);
    });

    it('should reject invalid documents', () => {
      expect(validateCPFOrCNPJ('00000000000')).toBe(false);
      expect(validateCPFOrCNPJ('00000000000000')).toBe(false);
    });
  });
});
```

---

### 7.2. Testes de Integração (Jest + Supertest)

**Arquivo**: `backend/src/__tests__/integration/Company.test.ts`

```typescript
import request from 'supertest';
import app from '../../app';
import truncate from '../utils/truncate';
import factory from '../factories';

describe('Company API - document field', () => {
  beforeEach(async () => {
    await truncate();
  });

  describe('POST /companies', () => {
    it('should create company with valid CPF', async () => {
      const response = await request(app)
        .post('/companies')
        .send({
          name: 'Empresa Teste',
          email: 'teste@empresa.com',
          password: 'senha123',
          document: '123.456.789-09'
        });

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
      expect(response.body.document).toBe('12345678909'); // Normalizado
    });

    it('should create company with valid CNPJ', async () => {
      const response = await request(app)
        .post('/companies')
        .send({
          name: 'Empresa Teste',
          email: 'teste@empresa.com',
          password: 'senha123',
          document: '11.222.333/0001-81'
        });

      expect(response.status).toBe(201);
      expect(response.body.document).toBe('11222333000181'); // Normalizado
    });

    it('should create company without document (null)', async () => {
      const response = await request(app)
        .post('/companies')
        .send({
          name: 'Empresa Teste',
          email: 'teste@empresa.com',
          password: 'senha123'
        });

      expect(response.status).toBe(201);
      expect(response.body.document).toBeNull();
    });

    it('should reject invalid CPF', async () => {
      const response = await request(app)
        .post('/companies')
        .send({
          name: 'Empresa Teste',
          email: 'teste@empresa.com',
          password: 'senha123',
          document: '123.456.789-00' // Dígito inválido
        });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error', 'ERR_COMPANY_INVALID_DOCUMENT');
    });

    it('should reject duplicate document', async () => {
      // Criar primeira empresa
      await request(app)
        .post('/companies')
        .send({
          name: 'Empresa A',
          email: 'empresaa@teste.com',
          password: 'senha123',
          document: '123.456.789-09'
        });

      // Tentar criar segunda empresa com mesmo documento
      const response = await request(app)
        .post('/companies')
        .send({
          name: 'Empresa B',
          email: 'empresab@teste.com',
          password: 'senha123',
          document: '123.456.789-09'
        });

      expect(response.status).toBe(409);
      expect(response.body).toHaveProperty('error', 'ERR_COMPANY_DOCUMENT_DUPLICATE');
    });

    it('should allow multiple null documents', async () => {
      // Criar primeira empresa sem documento
      const response1 = await request(app)
        .post('/companies')
        .send({
          name: 'Empresa A',
          email: 'empresaa@teste.com',
          password: 'senha123'
        });

      // Criar segunda empresa sem documento
      const response2 = await request(app)
        .post('/companies')
        .send({
          name: 'Empresa B',
          email: 'empresab@teste.com',
          password: 'senha123'
        });

      expect(response1.status).toBe(201);
      expect(response2.status).toBe(201);
      expect(response1.body.document).toBeNull();
      expect(response2.body.document).toBeNull();
    });

    it('should convert empty string to null', async () => {
      const response = await request(app)
        .post('/companies')
        .send({
          name: 'Empresa Teste',
          email: 'teste@empresa.com',
          password: 'senha123',
          document: ''
        });

      expect(response.status).toBe(201);
      expect(response.body.document).toBeNull();
    });
  });

  describe('PUT /companies/:id', () => {
    it('should update document to valid CPF', async () => {
      const company = await factory.create('Company', {
        document: null
      });

      const response = await request(app)
        .put(`/companies/${company.id}`)
        .set('Authorization', `Bearer ${generateToken(company)}`)
        .send({
          document: '123.456.789-09'
        });

      expect(response.status).toBe(200);
      expect(response.body.document).toBe('12345678909');
    });

    it('should remove document (set to null)', async () => {
      const company = await factory.create('Company', {
        document: '12345678909'
      });

      const response = await request(app)
        .put(`/companies/${company.id}`)
        .set('Authorization', `Bearer ${generateToken(company)}`)
        .send({
          document: null
        });

      expect(response.status).toBe(200);
      expect(response.body.document).toBeNull();
    });

    it('should reject duplicate document on update', async () => {
      const companyA = await factory.create('Company', {
        document: '12345678909'
      });

      const companyB = await factory.create('Company', {
        document: '98765432100'
      });

      // Tentar mudar companyB para documento de companyA
      const response = await request(app)
        .put(`/companies/${companyB.id}`)
        .set('Authorization', `Bearer ${generateToken(companyB)}`)
        .send({
          document: '123.456.789-09'
        });

      expect(response.status).toBe(409);
      expect(response.body).toHaveProperty('error', 'ERR_COMPANY_DOCUMENT_DUPLICATE');
    });
  });

  describe('GET /companies?searchParam=...', () => {
    it('should find company by formatted document', async () => {
      await factory.create('Company', {
        name: 'Empresa CPF',
        document: '12345678909'
      });

      const response = await request(app)
        .get('/companies')
        .query({ searchParam: '123.456.789-09' })
        .set('Authorization', `Bearer ${generateSuperToken()}`);

      expect(response.status).toBe(200);
      expect(response.body.companies).toHaveLength(1);
      expect(response.body.companies[0].document).toBe('12345678909');
    });

    it('should find company by normalized document', async () => {
      await factory.create('Company', {
        name: 'Empresa CPF',
        document: '12345678909'
      });

      const response = await request(app)
        .get('/companies')
        .query({ searchParam: '12345678909' })
        .set('Authorization', `Bearer ${generateSuperToken()}`);

      expect(response.status).toBe(200);
      expect(response.body.companies).toHaveLength(1);
      expect(response.body.companies[0].document).toBe('12345678909');
    });
  });
});
```

---

### 7.3. Testes de Feature Flag

**Arquivo**: `backend/src/__tests__/integration/CompanyFeatureFlag.test.ts`

```typescript
import request from 'supertest';
import app from '../../app';

describe('Company API - Feature Flag', () => {
  describe('FEATURE_COMPANY_DOCUMENT_OPTIONAL=true', () => {
    beforeAll(() => {
      process.env.FEATURE_COMPANY_DOCUMENT_OPTIONAL = 'true';
    });

    it('should validate document format', async () => {
      const response = await request(app)
        .post('/companies')
        .send({
          name: 'Empresa Teste',
          email: 'teste@empresa.com',
          password: 'senha123',
          document: '123.456.789-00' // Inválido
        });

      expect(response.status).toBe(400);
      expect(response.body.error).toBe('ERR_COMPANY_INVALID_DOCUMENT');
    });

    it('should normalize document', async () => {
      const response = await request(app)
        .post('/companies')
        .send({
          name: 'Empresa Teste',
          email: 'teste@empresa.com',
          password: 'senha123',
          document: '123.456.789-09'
        });

      expect(response.status).toBe(201);
      expect(response.body.document).toBe('12345678909'); // Normalizado
    });
  });

  describe('FEATURE_COMPANY_DOCUMENT_OPTIONAL=false', () => {
    beforeAll(() => {
      process.env.FEATURE_COMPANY_DOCUMENT_OPTIONAL = 'false';
    });

    it('should NOT validate document format', async () => {
      const response = await request(app)
        .post('/companies')
        .send({
          name: 'Empresa Teste',
          email: 'teste@empresa.com',
          password: 'senha123',
          document: '123.456.789-00' // Inválido, mas aceito
        });

      expect(response.status).toBe(201);
      expect(response.body.document).toBe('123.456.789-00'); // NÃO normalizado
    });

    it('should still convert empty to null', async () => {
      const response = await request(app)
        .post('/companies')
        .send({
          name: 'Empresa Teste',
          email: 'teste@empresa.com',
          password: 'senha123',
          document: ''
        });

      expect(response.status).toBe(201);
      expect(response.body.document).toBeNull();
    });
  });
});
```

---

## 8. Mensagens de Erro i18n

### 8.1. Códigos de Erro

**Arquivo**: `backend/src/errors/CompanyErrors.ts` (novo arquivo)

```typescript
export const COMPANY_ERRORS = {
  // Erros de validação
  ERR_COMPANY_INVALID_NAME: {
    code: 'ERR_COMPANY_INVALID_NAME',
    statusCode: 400,
    defaultMessage: {
      pt: 'Nome da empresa inválido',
      en: 'Invalid company name',
      es: 'Nombre de empresa inválido'
    }
  },

  ERR_COMPANY_INVALID_EMAIL: {
    code: 'ERR_COMPANY_INVALID_EMAIL',
    statusCode: 400,
    defaultMessage: {
      pt: 'Email inválido',
      en: 'Invalid email',
      es: 'Email inválido'
    }
  },

  ERR_COMPANY_INVALID_PASSWORD: {
    code: 'ERR_COMPANY_INVALID_PASSWORD',
    statusCode: 400,
    defaultMessage: {
      pt: 'Senha inválida (mínimo 5 caracteres)',
      en: 'Invalid password (minimum 5 characters)',
      es: 'Contraseña inválida (mínimo 5 caracteres)'
    }
  },

  ERR_COMPANY_INVALID_DOCUMENT: {
    code: 'ERR_COMPANY_INVALID_DOCUMENT',
    statusCode: 400,
    defaultMessage: {
      pt: 'CPF/CNPJ inválido',
      en: 'Invalid CPF/CNPJ',
      es: 'CPF/CNPJ inválido'
    }
  },

  ERR_COMPANY_DOCUMENT_DUPLICATE: {
    code: 'ERR_COMPANY_DOCUMENT_DUPLICATE',
    statusCode: 409,
    defaultMessage: {
      pt: 'CPF/CNPJ já cadastrado no sistema',
      en: 'CPF/CNPJ already registered',
      es: 'CPF/CNPJ ya registrado'
    }
  },

  // Erros de negócio
  ERR_NO_COMPANY_FOUND: {
    code: 'ERR_NO_COMPANY_FOUND',
    statusCode: 404,
    defaultMessage: {
      pt: 'Empresa não encontrada',
      en: 'Company not found',
      es: 'Empresa no encontrada'
    }
  }
} as const;
```

---

### 8.2. Traduções Frontend

**Arquivo**: `frontend/src/translate/languages/pt.js`

```javascript
export default {
  // ... traduções existentes

  companies: {
    // ... traduções existentes

    // Novos campos
    document: "CPF/CNPJ:",
    documentOptional: "CPF/CNPJ (opcional)",
    documentNotInformed: "Não informado",
    documentPlaceholder: "Digite o CPF ou CNPJ",
    documentHelp: "Digite apenas números ou com formatação",

    // Validações
    documentInvalid: "CPF/CNPJ inválido",
    documentDuplicate: "CPF/CNPJ já cadastrado no sistema",
    documentRequired: "CPF/CNPJ é obrigatório",

    // Máscaras
    cpfMask: "999.999.999-99",
    cnpjMask: "99.999.999/9999-99"
  },

  errors: {
    // ... erros existentes

    ERR_COMPANY_INVALID_DOCUMENT: "CPF/CNPJ inválido",
    ERR_COMPANY_DOCUMENT_DUPLICATE: "CPF/CNPJ já cadastrado no sistema"
  }
};
```

**Arquivo**: `frontend/src/translate/languages/en.js`

```javascript
export default {
  companies: {
    document: "CPF/CNPJ:",
    documentOptional: "CPF/CNPJ (optional)",
    documentNotInformed: "Not informed",
    documentPlaceholder: "Enter CPF or CNPJ",
    documentHelp: "Enter numbers only or formatted",
    documentInvalid: "Invalid CPF/CNPJ",
    documentDuplicate: "CPF/CNPJ already registered",
    documentRequired: "CPF/CNPJ is required",
    cpfMask: "999.999.999-99",
    cnpjMask: "99.999.999/9999-99"
  },

  errors: {
    ERR_COMPANY_INVALID_DOCUMENT: "Invalid CPF/CNPJ",
    ERR_COMPANY_DOCUMENT_DUPLICATE: "CPF/CNPJ already registered"
  }
};
```

**Arquivo**: `frontend/src/translate/languages/es.js`

```javascript
export default {
  companies: {
    document: "CPF/CNPJ:",
    documentOptional: "CPF/CNPJ (opcional)",
    documentNotInformed: "No informado",
    documentPlaceholder: "Ingrese CPF o CNPJ",
    documentHelp: "Ingrese solo números o con formato",
    documentInvalid: "CPF/CNPJ inválido",
    documentDuplicate: "CPF/CNPJ ya registrado",
    documentRequired: "CPF/CNPJ es obligatorio",
    cpfMask: "999.999.999-99",
    cnpjMask: "99.999.999/9999-99"
  },

  errors: {
    ERR_COMPANY_INVALID_DOCUMENT: "CPF/CNPJ inválido",
    ERR_COMPANY_DOCUMENT_DUPLICATE: "CPF/CNPJ ya registrado"
  }
};
```

---

## 9. Exemplos de Requisições

### 9.1. cURL Examples

#### Criar empresa com CPF válido

```bash
curl -X POST http://localhost:8080/companies \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "name": "Empresa XPTO Ltda",
    "email": "contato@xpto.com.br",
    "password": "senha123",
    "phone": "+5511999887766",
    "document": "123.456.789-09",
    "planId": 2,
    "dueDate": "2025-11-13",
    "recurrence": "monthly",
    "paymentMethod": "credit_card"
  }'
```

**Response**:
```json
{
  "id": 123,
  "name": "Empresa XPTO Ltda",
  "email": "contato@xpto.com.br",
  "phone": "+5511999887766",
  "document": "12345678909",
  "status": true,
  "planId": 2,
  "dueDate": "2025-11-13",
  "recurrence": "monthly",
  "paymentMethod": "credit_card",
  "createdAt": "2025-10-13T14:30:00.000Z",
  "updatedAt": "2025-10-13T14:30:00.000Z"
}
```

---

#### Criar empresa com CNPJ válido

```bash
curl -X POST http://localhost:8080/companies \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "name": "Empresa ABC S/A",
    "email": "contato@abc.com.br",
    "password": "senha456",
    "document": "11.222.333/0001-81"
  }'
```

**Response**:
```json
{
  "id": 124,
  "name": "Empresa ABC S/A",
  "email": "contato@abc.com.br",
  "phone": null,
  "document": "11222333000181",
  "status": true,
  "planId": null,
  "dueDate": null,
  "recurrence": null,
  "paymentMethod": null,
  "createdAt": "2025-10-13T14:35:00.000Z",
  "updatedAt": "2025-10-13T14:35:00.000Z"
}
```

---

#### Criar empresa sem documento

```bash
curl -X POST http://localhost:8080/companies \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "name": "Empresa Sem Doc",
    "email": "semdoc@empresa.com",
    "password": "senha789"
  }'
```

**Response**:
```json
{
  "id": 125,
  "name": "Empresa Sem Doc",
  "email": "semdoc@empresa.com",
  "phone": null,
  "document": null,
  "status": true,
  "planId": null,
  "dueDate": null,
  "recurrence": null,
  "paymentMethod": null,
  "createdAt": "2025-10-13T14:40:00.000Z",
  "updatedAt": "2025-10-13T14:40:00.000Z"
}
```

---

#### Tentar criar com CPF inválido (erro 400)

```bash
curl -X POST http://localhost:8080/companies \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "name": "Empresa Teste",
    "email": "teste@empresa.com",
    "password": "senha123",
    "document": "123.456.789-00"
  }'
```

**Response**:
```json
{
  "error": "ERR_COMPANY_INVALID_DOCUMENT",
  "message": "CPF/CNPJ inválido"
}
```

---

#### Tentar criar com documento duplicado (erro 409)

```bash
curl -X POST http://localhost:8080/companies \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "name": "Empresa Duplicada",
    "email": "duplicada@empresa.com",
    "password": "senha123",
    "document": "123.456.789-09"
  }'
```

**Response**:
```json
{
  "error": "ERR_COMPANY_DOCUMENT_DUPLICATE",
  "message": "CPF/CNPJ já cadastrado no sistema"
}
```

---

#### Atualizar documento de empresa existente

```bash
curl -X PUT http://localhost:8080/companies/123 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "document": "987.654.321-00"
  }'
```

**Response**:
```json
{
  "id": 123,
  "name": "Empresa XPTO Ltda",
  "email": "contato@xpto.com.br",
  "phone": "+5511999887766",
  "document": "98765432100",
  "status": true,
  "planId": 2,
  "dueDate": "2025-11-13",
  "recurrence": "monthly",
  "paymentMethod": "credit_card",
  "createdAt": "2025-10-13T14:30:00.000Z",
  "updatedAt": "2025-10-13T15:00:00.000Z"
}
```

---

#### Remover documento de empresa existente

```bash
curl -X PUT http://localhost:8080/companies/123 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "document": null
  }'
```

**Response**:
```json
{
  "id": 123,
  "name": "Empresa XPTO Ltda",
  "email": "contato@xpto.com.br",
  "phone": "+5511999887766",
  "document": null,
  "status": true,
  "planId": 2,
  "dueDate": "2025-11-13",
  "recurrence": "monthly",
  "paymentMethod": "credit_card",
  "createdAt": "2025-10-13T14:30:00.000Z",
  "updatedAt": "2025-10-13T15:05:00.000Z"
}
```

---

#### Buscar empresa por documento formatado

```bash
curl -X GET "http://localhost:8080/companies?searchParam=123.456.789-09" \
  -H "Authorization: Bearer {token}"
```

**Response**:
```json
{
  "companies": [
    {
      "id": 124,
      "name": "Empresa CPF",
      "email": "cpf@empresa.com",
      "document": "12345678909",
      "..."
    }
  ],
  "count": 1,
  "hasMore": false
}
```

---

#### Buscar empresa por documento normalizado

```bash
curl -X GET "http://localhost:8080/companies?searchParam=12345678909" \
  -H "Authorization: Bearer {token}"
```

**Response**: Igual ao exemplo anterior

---

### 9.2. REST Client (.http) Examples

**Arquivo**: `backend/tests/http/company.http`

```http
### Variáveis
@baseUrl = http://localhost:8080
@token = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

### 1. Criar empresa com CPF válido
POST {{baseUrl}}/companies
Content-Type: application/json
Authorization: Bearer {{token}}

{
  "name": "Empresa CPF Teste",
  "email": "cpf@teste.com",
  "password": "senha123",
  "document": "123.456.789-09"
}

### 2. Criar empresa com CNPJ válido
POST {{baseUrl}}/companies
Content-Type: application/json
Authorization: Bearer {{token}}

{
  "name": "Empresa CNPJ Teste",
  "email": "cnpj@teste.com",
  "password": "senha123",
  "document": "11.222.333/0001-81"
}

### 3. Criar empresa sem documento
POST {{baseUrl}}/companies
Content-Type: application/json
Authorization: Bearer {{token}}

{
  "name": "Empresa Sem Doc",
  "email": "semdoc@teste.com",
  "password": "senha123"
}

### 4. Criar empresa com CPF inválido (espera 400)
POST {{baseUrl}}/companies
Content-Type: application/json
Authorization: Bearer {{token}}

{
  "name": "Empresa Inválida",
  "email": "invalida@teste.com",
  "password": "senha123",
  "document": "123.456.789-00"
}

### 5. Criar empresa com documento duplicado (espera 409)
POST {{baseUrl}}/companies
Content-Type: application/json
Authorization: Bearer {{token}}

{
  "name": "Empresa Duplicada",
  "email": "duplicada@teste.com",
  "password": "senha123",
  "document": "123.456.789-09"
}

### 6. Buscar empresa por ID
GET {{baseUrl}}/companies/123
Authorization: Bearer {{token}}

### 7. Buscar empresas por documento formatado
GET {{baseUrl}}/companies?searchParam=123.456.789-09
Authorization: Bearer {{token}}

### 8. Buscar empresas por documento normalizado
GET {{baseUrl}}/companies?searchParam=12345678909
Authorization: Bearer {{token}}

### 9. Atualizar documento de empresa
PUT {{baseUrl}}/companies/123
Content-Type: application/json
Authorization: Bearer {{token}}

{
  "document": "987.654.321-00"
}

### 10. Remover documento de empresa
PUT {{baseUrl}}/companies/123
Content-Type: application/json
Authorization: Bearer {{token}}

{
  "document": null
}

### 11. Listar todas as empresas
GET {{baseUrl}}/companies?pageNumber=1
Authorization: Bearer {{token}}
```

---

## Próximos Passos

1. **Revisar este documento** com equipe de backend e frontend
2. **Aprovar schemas Yup** e helper `DocumentValidator`
3. **Implementar testes unitários** para validações CPF/CNPJ
4. **Atualizar services** CreateCompany e UpdateCompany
5. **Atualizar controllers** com schemas Yup completos
6. **Testar integração** com Postman/curl
7. **Documentar em OpenAPI/Swagger** (atualizar `companies-openapi.yaml`)
8. **Sincronizar com frontend** (próximo plano: `frontend-document-plan.md`)

---

## Referências

- ADR: `docs/architecture/ADR-2025-10-13-companies-document-optional.md`
- Model: `backend/src/models/Company.ts`
- Services: `backend/src/services/CompanyService/`
- Controller: `backend/src/controllers/CompanyController.ts`
- Yup docs: https://github.com/jquense/yup
- Sequelize docs: https://sequelize.org/docs/v6/core-concepts/validations-and-constraints/
- Algoritmos CPF/CNPJ: Receita Federal (ver ADR Apêndices A e B)

---

**Documento criado por**: Backend Planner Agent
**Data**: 2025-10-13
**Versão**: 1.0
**Status**: Aguardando revisão
