# Plano de UX e Implementação Frontend - Campo `document` Opcional

**Feature**: Campo `document` (CPF/CNPJ) opcional com máscaras condicionais e validações
**Data**: 2025-10-13
**Stack**: React 17.0.2 + Material-UI v4 + Formik + Yup + react-input-mask
**ADR Base**: `docs/architecture/ADR-2025-10-13-companies-document-optional.md`
**Contratos API**: `docs/contracts/companies-document-api-plan.md`

---

## Índice

1. [Análise de Componentes Afetados](#1-análise-de-componentes-afetados)
2. [Decisões de UX](#2-decisões-de-ux)
3. [Arquitetura de Validação](#3-arquitetura-de-validação)
4. [Fluxos de UX Detalhados](#4-fluxos-de-ux-detalhados)
5. [Componentes a Criar/Modificar](#5-componentes-a-criarmodificar)
6. [Biblioteca de Máscara](#6-biblioteca-de-máscara)
7. [Checklist de Validação Frontend](#7-checklist-de-validação-frontend)
8. [Performance e Otimizações](#8-performance-e-otimizações)
9. [Acessibilidade (A11y)](#9-acessibilidade-a11y)
10. [Internacionalização (i18n)](#10-internacionalização-i18n)
11. [Plano de Implementação (Commits)](#11-plano-de-implementação-commits)

---

## 1. Análise de Componentes Afetados

### 1.1. CompaniesManager (IMPACTO: ALTO)

**Localização**: `/frontend/src/components/CompaniesManager/index.js`

**Componente Principal: CompanyForm** (linhas 76-438)

**Estado Atual**:
- **Linha 305-310**: Campo `document` existe, mas é um TextField simples sem máscaras nem validações:
  ```javascript
  <Field
    as={TextField}
    label={i18n.t("compaies.table.document")}
    name="document"
    variant="outlined"
    className={classes.fullWidth}
    margin="dense"
  />
  ```
- **Linha 83-94**: Estado inicial do formulário define `document: ""`
- **Linha 561**: Estado do componente principal também define `document: ""`
- **Linha 669**: Ao selecionar empresa para editar, carrega `document: data.document || ""`

**Mudanças Necessárias**:
1. Adicionar `react-input-mask` com máscara condicional (CPF ou CNPJ)
2. Implementar validação Yup no schema do Formik (atualmente não existe schema)
3. Adicionar helper text para mostrar erros de validação
4. Tratar NULL como string vazia no carregamento (`data.document || ""`)
5. Normalizar documento antes do submit (remover pontuação)

**Componente Secundário: CompaniesManagerGrid** (linhas 440-540)

**Estado Atual**:
- **Linha 440-540**: Tabela NÃO exibe coluna `document` (comentado ou ausente)
- Sem função de renderização para formatar documento

**Mudanças Necessárias**:
1. **Decisão de Produto**: Adicionar coluna `document` na tabela? (Recomendação: SIM, por motivos fiscais)
2. Se SIM:
   - Adicionar `<TableCell>` no header (linha ~504)
   - Adicionar `<TableCell>` no body com função de formatação (linha ~524)
   - Criar função `renderDocument(row)` para exibir:
     - NULL → "Não informado" (texto cinza)
     - Valor → Formatado com pontuação (CPF: 123.456.789-00, CNPJ: 12.345.678/0001-90)

**Busca Client-Side** (linhas 566-576)

**Estado Atual**:
- **Linha 573**: Filtro já inclui `document`:
  ```javascript
  company.document?.includes(term)
  ```
- Usa optional chaining, então trata NULL corretamente

**Mudanças Necessárias**:
- Testar se busca funciona com documento formatado (ex: usuário digita "123.456.789-00")
- Recomendação: Normalizar `term` antes de buscar:
  ```javascript
  const normalizedTerm = term.replace(/[.\-\/\s]/g, '');
  company.document?.includes(normalizedTerm)
  ```

---

### 1.2. CompaniesModal (IMPACTO: MÉDIO)

**Localização**: `/frontend/src/components/CompaniesModal/index.js`

**Estado Atual**:
- **Linha 66-77**: Schema Yup existe, valida `name`, `email`, `passwordDefault`
- **Linha 82-89**: Estado inicial define `name`, `email`, `passwordDefault`, `numberAttendants`, etc.
- **Linha 170-235**: Formulário exibe apenas 3 campos: `name`, `status`, `email`, `passwordDefault`
- **NÃO possui campo `document`** (modal simplificado)

**Decisão de Produto Crítica**:

**Opção A: NÃO adicionar campo `document` ao modal**
- **Prós**: Modal mantém simplicidade (apenas dados essenciais para criação rápida)
- **Contras**: Usuário não pode informar CPF/CNPJ ao criar empresa via modal (precisa editar depois em CompaniesManager)
- **Uso**: Modal é usado em `/pages/Companies/index.js` (linha 295-300) para criação rápida

**Opção B: ADICIONAR campo `document` ao modal** (RECOMENDADA)
- **Prós**: Usuário informa CPF/CNPJ no ato da criação, evita etapa extra
- **Contras**: Adiciona 1 campo ao modal (ainda simples)
- **Justificativa**: Dado fiscal é importante para emissão de notas, integração contábil

**Decisão**: **ADICIONAR campo `document` (Opção B)**

**Mudanças Necessárias**:
1. **Linha 66-77**: Adicionar validação Yup condicional para `document`:
   ```javascript
   document: Yup.string()
     .nullable()
     .transform((v, original) => (original === '' ? null : v))
     .test('cpf-cnpj', 'CPF/CNPJ inválido', (value) => {
       if (!value) return true; // Opcional
       return validateCPFOrCNPJ(value);
     })
   ```
2. **Linha 82-89**: Adicionar `document: ""` ao estado inicial
3. **Linha 170+**: Adicionar Field com InputMask após campo `email`:
   ```javascript
   <div className={classes.multFieldLine}>
     <Field name="document">
       {({ field, form }) => (
         <InputMask
           {...field}
           mask={getDocumentMask(field.value)}
           onChange={(e) => form.setFieldValue('document', e.target.value)}
         >
           {(inputProps) => (
             <TextField
               {...inputProps}
               label={i18n.t("compaies.form.documentLabel")}
               error={form.touched.document && Boolean(form.errors.document)}
               helperText={form.touched.document && form.errors.document}
               variant="outlined"
               margin="dense"
               fullWidth
             />
           )}
         </InputMask>
       )}
     </Field>
   </div>
   ```
4. **Linha 122-141**: Normalizar `document` antes de enviar para API:
   ```javascript
   const handleSaveCompany = async values => {
     const companyData = { ...values };

     // Normalizar documento (remover pontuação)
     if (companyData.document) {
       companyData.document = normalizeDocument(companyData.document);
     } else {
       companyData.document = null; // Converter vazio para null
     }

     // ... resto do código
   ```

---

### 1.3. Companies (Página de Listagem) (IMPACTO: BAIXO)

**Localização**: `/frontend/src/pages/Companies/index.js`

**Estado Atual**:
- **Linha 115-125**: Filtro client-side já inclui `document`:
  ```javascript
  company.document?.includes(term)
  ```
- **Linha 345**: Tabela exibe empresas filtradas (11 colunas, sem `document`)
- Usa optional chaining, então trata NULL corretamente

**Mudanças Necessárias**:
- **Mesma recomendação de normalização da busca** (como CompaniesManager)
- **Adicionar coluna `document` na tabela** (linha 327-340 header, linha 345-377 body)
- Reutilizar função `renderDocument(row)` criada para CompaniesManager

---

### 1.4. Traduções (5 idiomas) (IMPACTO: MÉDIO)

**Arquivos**:
- `/frontend/src/translate/languages/pt.js` (linha ~2134)
- `/frontend/src/translate/languages/en.js`
- `/frontend/src/translate/languages/es.js`
- `/frontend/src/translate/languages/tr.js`
- `/frontend/src/translate/languages/ar.js`

**Estado Atual**:
- **pt.js linha 2134**: Existe `document: "CNPJ/CPF"` (ordem invertida, sem indicação de opcional)
- Outras chaves relacionadas: `searchPlaceholder`, `clearSearch` (linhas 2146-2148)

**Chaves a Adicionar**:

```javascript
compaies: {
  form: {
    documentLabel: "CPF/CNPJ (opcional)",
    documentPlaceholder: "000.000.000-00 ou 00.000.000/0000-00",
    documentInvalid: "CPF/CNPJ inválido",
    documentDuplicate: "CPF/CNPJ já cadastrado no sistema",
    documentNotProvided: "Não informado",
    documentHelperText: "Informe CPF (11 dígitos) ou CNPJ (14 dígitos)"
  },
  table: {
    document: "CPF/CNPJ", // Atualizar de "CNPJ/CPF" para ordem CPF/CNPJ
  }
}
```

**Traduções para 5 idiomas**:

| Chave | pt | en | es | tr | ar |
|-------|----|----|----|----|-----|
| documentLabel | CPF/CNPJ (opcional) | Tax ID (optional) | CPF/CNPJ (opcional) | Vergi No (isteğe bağlı) | رقم الضريبة (اختياري) |
| documentPlaceholder | 000.000.000-00 ou 00.000.000/0000-00 | 000.000.000-00 or 00.000.000/0000-00 | 000.000.000-00 o 00.000.000/0000-00 | 000.000.000-00 veya 00.000.000/0000-00 | 000.000.000-00 أو 00.000.000/0000-00 |
| documentInvalid | CPF/CNPJ inválido | Invalid Tax ID | CPF/CNPJ inválido | Geçersiz Vergi No | رقم الضريبة غير صالح |
| documentDuplicate | CPF/CNPJ já cadastrado | Tax ID already registered | CPF/CNPJ ya registrado | Vergi No zaten kayıtlı | رقم الضريبة مسجل بالفعل |
| documentNotProvided | Não informado | Not provided | No informado | Belirtilmedi | غير محدد |
| documentHelperText | Informe CPF (11 dígitos) ou CNPJ (14 dígitos) | Enter CPF (11 digits) or CNPJ (14 digits) | Ingrese CPF (11 dígitos) o CNPJ (14 dígitos) | CPF (11 haneli) veya CNPJ (14 haneli) girin | أدخل CPF (11 رقمًا) أو CNPJ (14 رقمًا) |

---

## 2. Decisões de UX

### 2.1. Máscaras Condicionais

**Decisão**: Aplicar máscara automaticamente baseada no comprimento de dígitos digitados.

**Biblioteca**: `react-input-mask` v2.0.4 (já instalado no projeto)

**Comportamento**:
- **0-11 dígitos**: Máscara CPF `999.999.999-99`
- **12-14 dígitos**: Máscara CNPJ `99.999.999/9999-99`
- **Transição**: Ao digitar o 12º dígito, máscara muda automaticamente de CPF para CNPJ

**Implementação**:
```javascript
// Função auxiliar para determinar máscara
function getDocumentMask(value) {
  if (!value) return '999.999.999-99999'; // Máscara que suporta ambos
  const numbers = value.replace(/\D/g, '');

  if (numbers.length <= 11) {
    return '999.999.999-99'; // CPF (11 dígitos)
  }
  return '99.999.999/9999-99'; // CNPJ (14 dígitos)
}
```

**UX da Transição**:
- Usuário digita: `123456789012` (12 dígitos)
- Máscara atual: `123.456.789-01` (CPF)
- Ao digitar o 12º dígito: `2`
- Máscara muda para: `12.345.678/9012` (CNPJ)
- Cursor permanece no final (sem saltos)

**Máscara Flexível** (alternativa mais fluida):
```javascript
// Máscara que se adapta sem re-render
mask={(value) => {
  const numbers = value.replace(/\D/g, '');
  if (numbers.length <= 11) {
    return [/\d/, /\d/, /\d/, '.', /\d/, /\d/, /\d/, '.', /\d/, /\d/, /\d/, '-', /\d/, /\d/];
  }
  return [/\d/, /\d/, '.', /\d/, /\d/, /\d/, '.', /\d/, /\d/, /\d/, '/', /\d/, /\d/, /\d/, /\d/, '-', /\d/, /\d/];
}}
```

**Decisão Final**: Usar máscara string simples com lógica condicional, mais simples e compatível com react-input-mask v2.

---

### 2.2. Validação Frontend

**Decisão**: Validar apenas quando campo preenchido (não quando vazio, pois é opcional).

**Momento da Validação**:
1. **onBlur**: Validar ao sair do campo (UX imediato)
2. **onSubmit**: Validar novamente antes de enviar (garantia)

**Biblioteca**: Yup schema integrado ao Formik

**Comportamento**:
- Campo vazio: SEM erro (opcional)
- Campo preenchido com < 11 dígitos: SEM erro ainda (usuário ainda está digitando)
- Campo preenchido com 11 dígitos: Validar CPF ao sair (onBlur)
- Campo preenchido com 14 dígitos: Validar CNPJ ao sair (onBlur)
- Campo preenchido com 12-13 dígitos: Erro "Informe CPF (11 dígitos) ou CNPJ (14 dígitos)"

**Yup Schema**:
```javascript
import * as Yup from 'yup';
import { validateCPFOrCNPJ } from '../../utils/documentValidator';

const CompanySchema = Yup.object().shape({
  name: Yup.string()
    .min(2, i18n.t("compaies.form.nameMin"))
    .required(i18n.t("compaies.form.nameRequired")),
  email: Yup.string()
    .email(i18n.t("compaies.form.emailInvalid"))
    .required(i18n.t("compaies.form.emailRequired")),
  password: Yup.string()
    .min(5, i18n.t("compaies.form.passwordMin")),
  document: Yup.string()
    .nullable()
    .transform((value, originalValue) => {
      // Converter string vazia para null
      if (!originalValue || originalValue.trim() === '') return null;
      return value;
    })
    .test('cpf-cnpj-valid', i18n.t("compaies.form.documentInvalid"), function(value) {
      // Se vazio, é válido (campo opcional)
      if (!value) return true;

      // Validar CPF ou CNPJ
      return validateCPFOrCNPJ(value);
    })
});
```

---

### 2.3. Estados do Campo

**Estado 1: Empty (Vazio)**
- Aparência: Campo normal, sem borda colorida
- Placeholder: "000.000.000-00 ou 00.000.000/0000-00"
- Helper text: "Informe CPF (11 dígitos) ou CNPJ (14 dígitos)" (cinza, informativo)
- Validação: Nenhuma

**Estado 2: Typing (Digitando)**
- Aparência: Campo normal, máscara aplicada
- Validação: NÃO validar durante digitação (apenas onBlur)
- Feedback visual: Nenhum (evitar distrações)

**Estado 3: Valid (Válido após onBlur)**
- Aparência: Campo normal (sem borda verde para não poluir UI)
- Helper text: Nenhum ou "CPF/CNPJ válido" (opcional)
- Validação: Passou

**Estado 4: Invalid (Inválido após onBlur)**
- Aparência: Borda vermelha (`error={true}`)
- Helper text: Mensagem de erro em vermelho:
  - "CPF/CNPJ inválido" (formato incorreto ou dígito verificador errado)
  - "Informe CPF (11 dígitos) ou CNPJ (14 dígitos)" (comprimento incorreto)
- Validação: Falhou
- Submit: Bloqueado pelo Formik

**Estado 5: Duplicate (Duplicata - erro da API)**
- Aparência: Toast de erro (não no campo, pois erro vem do backend)
- Mensagem: "CPF/CNPJ já cadastrado no sistema" (toast vermelho)
- Comportamento: Campo permanece preenchido, usuário pode corrigir

---

### 2.4. Normalização no Submit

**Decisão**: Remover pontuação antes de enviar para API.

**Momento**: `onSubmit` do Formik (transformação antes da chamada API)

**Implementação em CompaniesManager**:
```javascript
const handleSubmit = async (data) => {
  // Normalizar documento (remover pontuação)
  if (data.document) {
    data.document = data.document.replace(/[.\-\/\s]/g, '');

    // Se resultou em string vazia após normalização, converter para null
    if (data.document === '') {
      data.document = null;
    }
  } else {
    // Garantir que vazio seja null, não undefined ou ""
    data.document = null;
  }

  // Validar dueDate
  if (data.dueDate === "" || moment(data.dueDate).isValid() === false) {
    data.dueDate = null;
  }

  onSubmit(data);
  setRecord({ ...initialValue, dueDate: "" });
};
```

**Resultado**:
- Usuário vê: "123.456.789-00" (formatado)
- API recebe: "12345678900" (normalizado)
- Banco salva: "12345678900" (normalizado)

---

### 2.5. Exibição na Lista/Tabela

**Decisão**: Exibir documento formatado (com pontuação) ou "Não informado" para NULL.

**Função Helper**:
```javascript
// CompaniesManager/index.js ou utils/documentFormatter.js
import { formatCPF, formatCNPJ } from '../../utils/documentFormatter';

const renderDocument = (row) => {
  if (!row.document) {
    return <i style={{ color: '#999' }}>{i18n.t("compaies.form.documentNotProvided")}</i>;
  }

  const normalized = row.document.replace(/\D/g, '');
  if (normalized.length === 11) {
    return formatCPF(normalized); // 123.456.789-00
  }
  if (normalized.length === 14) {
    return formatCNPJ(normalized); // 12.345.678/0001-90
  }

  // Fallback: retornar sem formatação se inválido (não deveria ocorrer)
  return row.document;
};
```

**Uso na Tabela**:
```javascript
<TableCell align="center">{renderDocument(row)}</TableCell>
```

---

### 2.6. Label do Campo

**Opção 1**: "CPF/CNPJ (opcional)" - mais explícito
**Opção 2**: "CPF/CNPJ" + placeholder "(opcional)" - mais limpo

**Decisão**: **Opção 1** - "CPF/CNPJ (opcional)"

**Justificativa**: Material-UI v4 não possui indicação visual nativa de campo opcional (v5 tem `optional` prop). Adicionar "(opcional)" no label é padrão de UX para indicar que campo pode ser deixado vazio.

---

### 2.7. Placeholder

**Texto**: "000.000.000-00 ou 00.000.000/0000-00"

**Idiomas** (ver tabela completa na seção 1.4)

**Alternativa mais curta**: "Ex: 123.456.789-00"
- **Prós**: Mais limpo, não repete formato da máscara
- **Contras**: Não deixa claro que aceita CNPJ também

**Decisão**: Usar formato completo "000.000.000-00 ou 00.000.000/0000-00" para clareza.

---

## 3. Arquitetura de Validação

### 3.1. Helper: documentValidator.js

**Localização**: `/frontend/src/utils/documentValidator.js`

**Código Completo**:

```javascript
/**
 * Validação de CPF e CNPJ
 * Baseado nos algoritmos da Receita Federal
 * Ref: https://www.receita.fazenda.gov.br/
 */

/**
 * Remove formatação de CPF/CNPJ
 * @param {string} doc - Documento com ou sem formatação
 * @returns {string|null} - Documento apenas com dígitos ou null
 */
export const normalizeDocument = (doc) => {
  if (!doc || typeof doc !== 'string') return null;
  const normalized = doc.replace(/[.\-\/\s]/g, '').trim();
  return normalized === '' ? null : normalized;
};

/**
 * Valida CPF (11 dígitos)
 * Algoritmo: https://www.receita.fazenda.gov.br/aplicacoes/atcta/cpf/funcoes.js
 * @param {string} cpf - CPF com ou sem formatação
 * @returns {boolean} - true se válido
 */
export const validateCPF = (cpf) => {
  cpf = normalizeDocument(cpf);

  // Validar comprimento
  if (!cpf || cpf.length !== 11) return false;

  // Rejeitar sequências repetidas (000.000.000-00, 111.111.111-11, etc)
  if (/^(\d)\1{10}$/.test(cpf)) return false;

  // Calcular primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let digit1 = 11 - (sum % 11);
  if (digit1 > 9) digit1 = 0;

  // Validar primeiro dígito
  if (digit1 !== parseInt(cpf.charAt(9))) return false;

  // Calcular segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i)) * (11 - i);
  }
  let digit2 = 11 - (sum % 11);
  if (digit2 > 9) digit2 = 0;

  // Validar segundo dígito
  return digit2 === parseInt(cpf.charAt(10));
};

/**
 * Valida CNPJ (14 dígitos)
 * Algoritmo: https://www.receita.fazenda.gov.br/aplicacoes/atcta/cnpj/funcoes.js
 * @param {string} cnpj - CNPJ com ou sem formatação
 * @returns {boolean} - true se válido
 */
export const validateCNPJ = (cnpj) => {
  cnpj = normalizeDocument(cnpj);

  // Validar comprimento
  if (!cnpj || cnpj.length !== 14) return false;

  // Rejeitar sequências repetidas (00.000.000/0000-00, 11.111.111/1111-11, etc)
  if (/^(\d)\1{13}$/.test(cnpj)) return false;

  // Calcular primeiro dígito verificador
  let sum = 0;
  let weight = 5;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cnpj.charAt(i)) * weight;
    weight = (weight === 2) ? 9 : weight - 1;
  }
  let digit1 = 11 - (sum % 11);
  if (digit1 > 9) digit1 = 0;

  // Validar primeiro dígito
  if (digit1 !== parseInt(cnpj.charAt(12))) return false;

  // Calcular segundo dígito verificador
  sum = 0;
  weight = 6;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cnpj.charAt(i)) * weight;
    weight = (weight === 2) ? 9 : weight - 1;
  }
  let digit2 = 11 - (sum % 11);
  if (digit2 > 9) digit2 = 0;

  // Validar segundo dígito
  return digit2 === parseInt(cnpj.charAt(13));
};

/**
 * Valida CPF OU CNPJ automaticamente baseado no comprimento
 * @param {string} doc - Documento com ou sem formatação
 * @returns {boolean} - true se válido ou vazio (opcional)
 */
export const validateCPFOrCNPJ = (doc) => {
  if (!doc) return true; // Campo opcional

  const normalized = normalizeDocument(doc);
  if (!normalized) return true; // String vazia após normalização = opcional

  if (normalized.length === 11) {
    return validateCPF(normalized);
  }

  if (normalized.length === 14) {
    return validateCNPJ(normalized);
  }

  // Comprimento inválido (não é CPF nem CNPJ)
  return false;
};
```

---

### 3.2. Helper: documentFormatter.js

**Localização**: `/frontend/src/utils/documentFormatter.js`

**Código Completo**:

```javascript
/**
 * Formatação de CPF e CNPJ para exibição
 */

import { normalizeDocument } from './documentValidator';
import { i18n } from '../translate/i18n';

/**
 * Formata CPF (11 dígitos) para 123.456.789-00
 * @param {string} cpf - CPF normalizado (apenas dígitos)
 * @returns {string} - CPF formatado
 */
export const formatCPF = (cpf) => {
  if (!cpf) return '';
  cpf = cpf.replace(/\D/g, ''); // Garantir apenas dígitos

  if (cpf.length !== 11) return cpf; // Retornar sem formatação se inválido

  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

/**
 * Formata CNPJ (14 dígitos) para 12.345.678/0001-90
 * @param {string} cnpj - CNPJ normalizado (apenas dígitos)
 * @returns {string} - CNPJ formatado
 */
export const formatCNPJ = (cnpj) => {
  if (!cnpj) return '';
  cnpj = cnpj.replace(/\D/g, ''); // Garantir apenas dígitos

  if (cnpj.length !== 14) return cnpj; // Retornar sem formatação se inválido

  return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
};

/**
 * Formata CPF OU CNPJ automaticamente para exibição
 * @param {string|null} doc - Documento normalizado ou null
 * @returns {string} - Documento formatado ou mensagem "Não informado"
 */
export const formatDocument = (doc) => {
  if (!doc) {
    return i18n.t("compaies.form.documentNotProvided"); // "Não informado"
  }

  const normalized = normalizeDocument(doc);
  if (!normalized) {
    return i18n.t("compaies.form.documentNotProvided");
  }

  if (normalized.length === 11) {
    return formatCPF(normalized);
  }

  if (normalized.length === 14) {
    return formatCNPJ(normalized);
  }

  // Retornar sem formatação se comprimento inválido (não deveria ocorrer em prod)
  return doc;
};

/**
 * Determina máscara condicional baseada no comprimento
 * Usado com react-input-mask
 * @param {string} value - Valor atual do campo
 * @returns {string} - Máscara CPF ou CNPJ
 */
export const getDocumentMask = (value) => {
  if (!value) return '999.999.999-99'; // CPF default

  const numbers = value.replace(/\D/g, '');

  if (numbers.length <= 11) {
    return '999.999.999-99'; // CPF (11 dígitos)
  }

  return '99.999.999/9999-99'; // CNPJ (14 dígitos)
};
```

---

### 3.3. Schema Yup no Formik (CompaniesManager)

**Localização**: `/frontend/src/components/CompaniesManager/index.js`

**Problema Atual**: CompanyForm NÃO usa validationSchema no Formik (linha 194).

**Solução**: Criar schema Yup e adicionar ao Formik:

```javascript
import * as Yup from 'yup';
import { validateCPFOrCNPJ } from '../../utils/documentValidator';

// Adicionar antes de CompanyForm (linha ~75)
const CompanyValidationSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, i18n.t("compaies.form.nameMin"))
    .required(i18n.t("compaies.form.nameRequired")),
  email: Yup.string()
    .email(i18n.t("compaies.form.emailInvalid"))
    .required(i18n.t("compaies.form.emailRequired")),
  planId: Yup.number()
    .required(i18n.t("compaies.form.planRequired")),
  password: Yup.string()
    .when('id', {
      is: (id) => !id, // Apenas obrigatório na criação
      then: Yup.string().min(5, i18n.t("compaies.form.passwordMin")).required(i18n.t("compaies.form.passwordRequired")),
      otherwise: Yup.string().min(5, i18n.t("compaies.form.passwordMin"))
    }),
  document: Yup.string()
    .nullable()
    .transform((value, originalValue) => {
      // Converter string vazia para null
      if (!originalValue || originalValue.trim() === '') return null;
      return value;
    })
    .test('cpf-cnpj-valid', i18n.t("compaies.form.documentInvalid"), function(value) {
      // Se vazio, é válido (campo opcional)
      if (!value) return true;

      // Validar CPF ou CNPJ
      return validateCPFOrCNPJ(value);
    })
});

// Modificar Formik (linha 194)
<Formik
  enableReinitialize
  className={classes.fullWidth}
  initialValues={record}
  validationSchema={CompanyValidationSchema} // ADICIONAR
  onSubmit={(values, { resetForm }) =>
    setTimeout(() => {
      handleSubmit(values);
      resetForm();
    }, 500)
  }
>
```

---

### 3.4. Schema Yup no CompaniesModal

**Localização**: `/frontend/src/components/CompaniesModal/index.js`

**Modificar schema existente** (linha 66-77):

```javascript
import { validateCPFOrCNPJ } from '../../utils/documentValidator';

const CompanySchema = Yup.object().shape({
  name: Yup.string()
    .min(2, "Too Short!")
    .max(50, "Too Long!")
    .required("Nome é obrigatório"),
  email: Yup.string()
    .email("Email é inválido")
    .required("E-mail é obrigatório"),
  passwordDefault: Yup.string()
    .required("Senha é obrigatória"),
  numberAttendants: Yup.number(),
  numberConections: Yup.number(),
  document: Yup.string() // ADICIONAR
    .nullable()
    .transform((value, originalValue) => {
      if (!originalValue || originalValue.trim() === '') return null;
      return value;
    })
    .test('cpf-cnpj-valid', 'CPF/CNPJ inválido', function(value) {
      if (!value) return true; // Opcional
      return validateCPFOrCNPJ(value);
    })
});
```

---

## 4. Fluxos de UX Detalhados

### 4.1. Fluxo 1: Criar Empresa SEM Documento

**Passo a Passo**:

1. **Usuário acessa** `/settings/companies` (CompaniesManager)
2. **Formulário vazio** exibido no topo da página
3. **Usuário preenche**:
   - Nome: "Empresa ABC Ltda"
   - Email: "contato@abc.com.br"
   - Plano: Seleciona "Plano Básico"
   - **NÃO preenche** campo "CPF/CNPJ (opcional)"
4. **Usuário clica** "Salvar"
5. **Formik valida**:
   - `name`: OK
   - `email`: OK
   - `planId`: OK
   - `document`: OK (vazio, mas opcional)
6. **handleSubmit** executa:
   ```javascript
   data.document = null; // Converter vazio para null
   ```
7. **API recebe** POST `/companies`:
   ```json
   {
     "name": "Empresa ABC Ltda",
     "email": "contato@abc.com.br",
     "planId": 1,
     "document": null
   }
   ```
8. **Backend valida**:
   - `document` é `null` → válido (opcional)
   - Salva no banco: `document = NULL`
9. **API responde** 201 Created:
   ```json
   {
     "id": 42,
     "name": "Empresa ABC Ltda",
     "email": "contato@abc.com.br",
     "document": null,
     "createdAt": "2025-10-13T15:30:00.000Z"
   }
   ```
10. **Frontend atualiza** lista de empresas
11. **Tabela exibe**:
    - Nome: "Empresa ABC Ltda"
    - Document: *"Não informado"* (texto cinza, itálico)
12. **Toast de sucesso**: "Operação realizada com sucesso"

---

### 4.2. Fluxo 2: Criar Empresa COM CPF Válido

**Passo a Passo**:

1. **Usuário preenche** nome, email, plano
2. **Usuário clica** no campo "CPF/CNPJ (opcional)"
3. **Placeholder** desaparece
4. **Usuário digita**: "1" → campo exibe "1"
5. **Usuário digita**: "12" → campo exibe "12"
6. **Usuário digita**: "123" → campo exibe "123"
7. **Máscara aplicada** automaticamente:
   - "123456" → "123.456"
   - "123456789" → "123.456.789"
   - "12345678900" → "123.456.789-00" (CPF completo)
8. **Usuário sai do campo** (onBlur)
9. **Validação executa**:
   - Normaliza: "123.456.789-00" → "12345678900"
   - Comprimento: 11 dígitos → é CPF
   - Algoritmo CPF: calcula dígitos verificadores
   - Se válido: SEM erro
   - Se inválido: Erro "CPF/CNPJ inválido" (borda vermelha + helper text)
10. **Assumindo CPF válido** (ex: "111.444.777-35")
11. **Usuário clica** "Salvar"
12. **Formik valida** novamente: OK
13. **handleSubmit normaliza**:
    ```javascript
    data.document = "11144477735"; // Remove pontuação
    ```
14. **API recebe**:
    ```json
    {
      "document": "11144477735"
    }
    ```
15. **Backend valida**:
    - Comprimento: 11 → CPF
    - Algoritmo: válido
    - UNIQUE constraint: não existe duplicata
16. **Banco salva**: `document = "11144477735"`
17. **API responde** 201 Created:
    ```json
    {
      "id": 43,
      "document": "11144477735"
    }
    ```
18. **Frontend atualiza** tabela
19. **Tabela exibe** (usando renderDocument):
    - Document: "111.444.777-35" (formatado)

---

### 4.3. Fluxo 3: Digitar CNPJ e Transição de Máscara

**Passo a Passo**:

1. **Usuário digita no campo** "CPF/CNPJ (opcional)":
   - "1" → "1"
   - "12" → "12"
   - "123" → "123"
   - "1234" → "123.4"
   - "12345" → "123.45"
   - "123456" → "123.456"
   - "1234567" → "123.456.7"
   - "12345678" → "123.456.78"
   - "123456789" → "123.456.789"
   - "1234567890" → "123.456.789-0"
   - "12345678901" → "123.456.789-01" (11 dígitos, CPF completo)
2. **Usuário continua digitando** (12º dígito):
   - "123456789012" → **TRANSIÇÃO DE MÁSCARA**
   - Máscara muda de CPF para CNPJ
   - Campo re-renderiza: "12.345.678/9012"
3. **Usuário continua**:
   - "1234567890123" → "12.345.678/9012-3"
   - "12345678901234" → "12.345.678/9012-34" (14 dígitos, CNPJ completo)
4. **Usuário sai do campo** (onBlur)
5. **Validação executa**:
   - Normaliza: "12.345.678/9012-34" → "12345678901234"
   - Comprimento: 14 dígitos → é CNPJ
   - Algoritmo CNPJ: calcula dígitos verificadores
   - Se válido: SEM erro
   - Se inválido: Erro "CPF/CNPJ inválido"
6. **Assumindo CNPJ válido** (ex: "11.222.333/0001-81")
7. **Resto do fluxo** igual ao Fluxo 2 (salvar, normalizar, exibir formatado)

**UX Crítica da Transição**:
- **Problema potencial**: Cursor pode pular ou campo pode "piscar" ao mudar máscara
- **Solução**: react-input-mask v2 lida com isso nativamente, mas testar manualmente
- **Fallback**: Usar máscara única flexível `999.999.999-99999` (menos elegante, mas sem transição)

---

### 4.4. Fluxo 4: Documento Inválido

**Passo a Passo**:

1. **Usuário digita** CPF inválido: "123.456.789-00"
2. **Usuário sai do campo** (onBlur)
3. **Validação executa**:
   - Normaliza: "12345678900"
   - Comprimento: 11 → CPF
   - Algoritmo CPF: calcula dígitos verificadores
   - Dígito esperado: "09" (exemplo)
   - Dígito informado: "00"
   - **Validação falha**
4. **Campo atualiza**:
   - Borda: vermelha (`error={true}`)
   - Helper text: "CPF/CNPJ inválido" (vermelho)
5. **Usuário tenta clicar** "Salvar"
6. **Formik bloqueia submit**:
   - Validação onSubmit falha
   - Focus retorna para campo com erro
7. **Toast de erro**: "Corrija os erros no formulário"
8. **Usuário corrige** para CPF válido: "111.444.777-35"
9. **Usuário sai do campo** (onBlur)
10. **Validação passa**:
    - Borda: normal
    - Helper text: desaparece
11. **Usuário clica** "Salvar" → sucesso

**Cenário 2: Comprimento Inválido (12-13 dígitos)**

1. **Usuário digita**: "12.345.678/901" (12 dígitos, CNPJ incompleto)
2. **Usuário sai do campo** (onBlur)
3. **Validação falha**: Comprimento não é 11 nem 14
4. **Helper text**: "Informe CPF (11 dígitos) ou CNPJ (14 dígitos)"
5. **Usuário completa**: "12.345.678/9012-34" (14 dígitos)
6. **Validação passa** (se CNPJ for válido)

---

### 4.5. Fluxo 5: Editar Empresa e Remover Documento

**Passo a Passo**:

1. **Usuário clica** ícone de editar em empresa com `document = "11144477735"`
2. **handleSelect** executa (linha 647-672):
   ```javascript
   setRecord({
     id: data.id,
     name: data.name,
     document: data.document || "", // "11144477735"
     // ...
   });
   ```
3. **Formik carrega** valores no formulário
4. **Campo "CPF/CNPJ (opcional)"** exibe:
   - Valor: "111.444.777-35" (formatado pela máscara)
5. **Usuário seleciona todo texto** (Ctrl+A ou Cmd+A)
6. **Usuário aperta** Delete ou Backspace
7. **Campo fica vazio**
8. **Validação onBlur**:
   - Campo vazio → válido (opcional)
   - SEM erro
9. **Usuário clica** "Salvar"
10. **handleSubmit normaliza**:
    ```javascript
    if (data.document) {
      // Campo está vazio: data.document === ""
    } else {
      data.document = null; // Converter para null
    }
    ```
11. **API recebe** PUT `/companies/42`:
    ```json
    {
      "document": null
    }
    ```
12. **Backend valida**:
    - `document` é `null` → válido
    - Atualiza no banco: `document = NULL`
13. **API responde** 200 OK:
    ```json
    {
      "id": 42,
      "document": null
    }
    ```
14. **Frontend atualiza** lista
15. **Tabela exibe**:
    - Document: *"Não informado"* (texto cinza)

---

### 4.6. Fluxo 6: Busca por Documento Formatado

**Cenário**: Usuário busca por CPF com pontuação

**Passo a Passo**:

1. **Usuário digita** na busca (CompaniesManager linha 678-708): "111.444.777-35"
2. **onChange** executa:
   ```javascript
   setSearchTerm("111.444.777-35")
   ```
3. **useMemo recalcula** filteredRecords (linha 566-576):
   ```javascript
   const term = "111.444.777-35".toLowerCase();
   company.document?.includes(term) // "11144477735".includes("111.444.777-35") → FALSE
   ```
4. **Problema**: Busca FALHA porque banco salva sem pontuação

**Solução 1: Normalizar termo de busca** (RECOMENDADO)

Modificar linha 573:
```javascript
const filteredRecords = useMemo(() => {
  if (!searchTerm) return records;

  const term = searchTerm.toLowerCase();
  const normalizedTerm = term.replace(/[.\-\/\s]/g, ''); // Remove pontuação

  return records.filter(company =>
    company.name?.toLowerCase().includes(term) ||
    company.email?.toLowerCase().includes(term) ||
    company.document?.includes(normalizedTerm) || // Usa termo normalizado
    company.phone?.includes(term)
  );
}, [records, searchTerm]);
```

**Solução 2: Backend normaliza busca** (ideal, mas requer mudança backend)

ListCompaniesService busca por documento normalizado via trigram index.

**Decisão**: Implementar **Solução 1** (frontend normaliza termo).

---

### 4.7. Fluxo 7: Erro de Duplicata (API 409 Conflict)

**Passo a Passo**:

1. **Empresa 1** já cadastrada com CPF "111.444.777-35"
2. **Usuário tenta criar** Empresa 2 com mesmo CPF
3. **Usuário preenche** formulário:
   - Nome: "Empresa XYZ"
   - CPF: "111.444.777-35"
4. **Validação frontend**: OK (CPF válido)
5. **Usuário clica** "Salvar"
6. **API recebe** POST `/companies`:
   ```json
   {
     "name": "Empresa XYZ",
     "document": "11144477735"
   }
   ```
7. **Backend valida**:
   - CPF válido: OK
   - UNIQUE constraint: **FALHA** (já existe)
8. **API responde** 409 Conflict:
   ```json
   {
     "error": "ERR_COMPANY_DOCUMENT_DUPLICATE",
     "message": "CPF/CNPJ já cadastrado no sistema"
   }
   ```
9. **Frontend catch** (CompaniesManager linha 605-609):
   ```javascript
   catch (e) {
     toast.error("Não foi possível realizar a operação. Verifique os dados e tente novamente!");
   }
   ```
10. **Toast exibe**: Erro genérico (não menciona duplicata)
11. **Problema**: Mensagem não é clara

**Solução: Melhorar tratamento de erro**

Modificar handleSubmit (linha 594-611):
```javascript
const handleSubmit = async (data) => {
  setLoading(true);

  // Normalizar documento
  if (data.document) {
    data.document = data.document.replace(/[.\-\/\s]/g, '');
    if (data.document === '') data.document = null;
  } else {
    data.document = null;
  }

  try {
    if (data.id !== undefined) {
      await update(data);
    } else {
      await save(data);
    }
    await loadPlans();
    handleCancel();
    toast.success(i18n.t("settings.toasts.operationSuccess"));
  } catch (e) {
    // Detectar erro de duplicata
    if (e.response?.data?.error === "ERR_COMPANY_DOCUMENT_DUPLICATE") {
      toast.error(i18n.t("compaies.form.documentDuplicate"));
    } else {
      toast.error(i18n.t("settings.toasts.companyOperationError"));
    }
  }
  setLoading(false);
};
```

---

## 5. Componentes a Criar/Modificar

### 5.1. Arquivos a CRIAR

#### A) Helpers de Validação

**1. `/frontend/src/utils/documentValidator.js`**
- Funções: `normalizeDocument()`, `validateCPF()`, `validateCNPJ()`, `validateCPFOrCNPJ()`
- Tamanho estimado: ~150 linhas
- Dependências: Nenhuma
- Ver código completo na seção 3.1

**2. `/frontend/src/utils/documentFormatter.js`**
- Funções: `formatCPF()`, `formatCNPJ()`, `formatDocument()`, `getDocumentMask()`
- Tamanho estimado: ~100 linhas
- Dependências: `documentValidator.js`, `i18n`
- Ver código completo na seção 3.2

#### B) Testes Unitários

**3. `/frontend/src/__tests__/utils/documentValidator.test.js`**
- Testes: CPF válido, CPF inválido, CNPJ válido, CNPJ inválido, edge cases
- Framework: Jest + React Testing Library
- Tamanho estimado: ~200 linhas

**Estrutura de Testes**:
```javascript
import { validateCPF, validateCNPJ, validateCPFOrCNPJ, normalizeDocument } from '../../utils/documentValidator';

describe('documentValidator', () => {
  describe('normalizeDocument', () => {
    it('deve remover pontuação de CPF', () => {
      expect(normalizeDocument('123.456.789-00')).toBe('12345678900');
    });

    it('deve remover pontuação de CNPJ', () => {
      expect(normalizeDocument('12.345.678/0001-90')).toBe('12345678000190');
    });

    it('deve retornar null para string vazia', () => {
      expect(normalizeDocument('')).toBeNull();
    });

    it('deve retornar null para null', () => {
      expect(normalizeDocument(null)).toBeNull();
    });
  });

  describe('validateCPF', () => {
    it('deve validar CPF válido', () => {
      expect(validateCPF('111.444.777-35')).toBe(true);
      expect(validateCPF('11144477735')).toBe(true);
    });

    it('deve rejeitar CPF inválido (dígito verificador errado)', () => {
      expect(validateCPF('123.456.789-00')).toBe(false);
    });

    it('deve rejeitar sequências repetidas', () => {
      expect(validateCPF('000.000.000-00')).toBe(false);
      expect(validateCPF('111.111.111-11')).toBe(false);
    });

    it('deve rejeitar comprimento incorreto', () => {
      expect(validateCPF('123.456.789')).toBe(false);
      expect(validateCPF('123.456.789-001')).toBe(false);
    });
  });

  describe('validateCNPJ', () => {
    it('deve validar CNPJ válido', () => {
      expect(validateCNPJ('11.222.333/0001-81')).toBe(true);
      expect(validateCNPJ('11222333000181')).toBe(true);
    });

    it('deve rejeitar CNPJ inválido', () => {
      expect(validateCNPJ('11.222.333/0001-00')).toBe(false);
    });

    it('deve rejeitar sequências repetidas', () => {
      expect(validateCNPJ('00.000.000/0000-00')).toBe(false);
    });
  });

  describe('validateCPFOrCNPJ', () => {
    it('deve retornar true para campo vazio (opcional)', () => {
      expect(validateCPFOrCNPJ('')).toBe(true);
      expect(validateCPFOrCNPJ(null)).toBe(true);
    });

    it('deve detectar e validar CPF', () => {
      expect(validateCPFOrCNPJ('111.444.777-35')).toBe(true);
      expect(validateCPFOrCNPJ('123.456.789-00')).toBe(false);
    });

    it('deve detectar e validar CNPJ', () => {
      expect(validateCPFOrCNPJ('11.222.333/0001-81')).toBe(true);
      expect(validateCPFOrCNPJ('11.222.333/0001-00')).toBe(false);
    });

    it('deve rejeitar comprimento inválido', () => {
      expect(validateCPFOrCNPJ('123456789012')).toBe(false); // 12 dígitos
    });
  });
});
```

**4. `/frontend/src/__tests__/utils/documentFormatter.test.js`**
- Testes: Formatação CPF, CNPJ, null, edge cases
- Tamanho estimado: ~100 linhas

---

### 5.2. Arquivos a MODIFICAR

#### A) CompaniesManager

**Arquivo**: `/frontend/src/components/CompaniesManager/index.js`

**Mudanças**:

**1. Importações** (adicionar no topo, após linha 34):
```javascript
import InputMask from 'react-input-mask';
import { validateCPFOrCNPJ, normalizeDocument } from '../../utils/documentValidator';
import { getDocumentMask, formatDocument } from '../../utils/documentFormatter';
import * as Yup from 'yup';
```

**2. Schema Yup** (adicionar antes de CompanyForm, linha ~75):
```javascript
const CompanyValidationSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, i18n.t("compaies.form.nameMin") || "Nome muito curto")
    .required(i18n.t("compaies.form.nameRequired") || "Nome é obrigatório"),
  email: Yup.string()
    .email(i18n.t("compaies.form.emailInvalid") || "Email inválido")
    .required(i18n.t("compaies.form.emailRequired") || "Email é obrigatório"),
  planId: Yup.number()
    .required(i18n.t("compaies.form.planRequired") || "Plano é obrigatório"),
  document: Yup.string()
    .nullable()
    .transform((value, originalValue) => {
      if (!originalValue || originalValue.trim() === '') return null;
      return value;
    })
    .test('cpf-cnpj-valid', i18n.t("compaies.form.documentInvalid") || "CPF/CNPJ inválido", function(value) {
      if (!value) return true;
      return validateCPFOrCNPJ(value);
    })
});
```

**3. Formik validationSchema** (linha 194, adicionar prop):
```javascript
<Formik
  enableReinitialize
  className={classes.fullWidth}
  initialValues={record}
  validationSchema={CompanyValidationSchema} // ADICIONAR
  onSubmit={(values, { resetForm }) =>
    setTimeout(() => {
      handleSubmit(values);
      resetForm();
    }, 500)
  }
>
```

**4. Campo document com máscara** (substituir linhas 302-311):
```javascript
<Grid xs={12} sm={6} md={2} item>
  <Field name="document">
    {({ field, form, meta }) => (
      <InputMask
        {...field}
        mask={getDocumentMask(field.value)}
        onChange={(e) => {
          form.setFieldValue('document', e.target.value);
        }}
        onBlur={(e) => {
          form.setFieldTouched('document', true);
          field.onBlur(e);
        }}
      >
        {(inputProps) => (
          <TextField
            {...inputProps}
            label={i18n.t("compaies.form.documentLabel")}
            placeholder={i18n.t("compaies.form.documentPlaceholder")}
            variant="outlined"
            className={classes.fullWidth}
            margin="dense"
            error={meta.touched && Boolean(meta.error)}
            helperText={
              meta.touched && meta.error
                ? meta.error
                : i18n.t("compaies.form.documentHelperText")
            }
            inputProps={{
              'aria-label': i18n.t("compaies.form.documentLabel"),
              'aria-invalid': meta.touched && Boolean(meta.error),
              'aria-describedby': meta.touched && meta.error ? 'document-error' : 'document-helper'
            }}
          />
        )}
      </InputMask>
    )}
  </Field>
</Grid>
```

**5. handleSubmit - normalização** (modificar linha 121-127):
```javascript
const handleSubmit = async (data) => {
  // Normalizar documento
  if (data.document) {
    data.document = normalizeDocument(data.document);
    if (!data.document) data.document = null;
  } else {
    data.document = null;
  }

  // Validar dueDate
  if (data.dueDate === "" || moment(data.dueDate).isValid() === false) {
    data.dueDate = null;
  }

  onSubmit(data);
  setRecord({ ...initialValue, dueDate: "" });
};
```

**6. CompaniesManagerGrid - adicionar coluna document** (linha ~504):
```javascript
// Header (adicionar após linha 513)
<TableCell align="center">{i18n.t("compaies.table.document")}</TableCell>

// Body (adicionar após linha 533, antes de lastLogin)
<TableCell align="center">{renderDocument(row)}</TableCell>
```

**7. Função renderDocument** (adicionar após linha 473, antes de rowStyle):
```javascript
const renderDocument = (row) => {
  if (!row.document) {
    return <i style={{ color: '#999' }}>{i18n.t("compaies.form.documentNotProvided")}</i>;
  }
  return formatDocument(row.document);
};
```

**8. Busca normalizada** (modificar linha 566-576):
```javascript
const filteredRecords = useMemo(() => {
  if (!searchTerm) return records;

  const term = searchTerm.toLowerCase();
  const normalizedTerm = normalizeDocument(searchTerm) || ''; // ADICIONAR

  return records.filter(company =>
    company.name?.toLowerCase().includes(term) ||
    company.email?.toLowerCase().includes(term) ||
    company.document?.includes(normalizedTerm) || // MODIFICAR
    company.phone?.includes(term)
  );
}, [records, searchTerm]);
```

---

#### B) CompaniesModal

**Arquivo**: `/frontend/src/components/CompaniesModal/index.js`

**Mudanças**:

**1. Importações** (adicionar após linha 32):
```javascript
import InputMask from 'react-input-mask';
import { validateCPFOrCNPJ, normalizeDocument } from '../../utils/documentValidator';
import { getDocumentMask } from '../../utils/documentFormatter';
```

**2. Schema Yup** (modificar linhas 66-77):
```javascript
const CompanySchema = Yup.object().shape({
  name: Yup.string()
    .min(2, "Too Short!")
    .max(50, "Too Long!")
    .required("Nome é obrigatório"),
  email: Yup.string()
    .email("Email é inválido")
    .required("E-mail é obrigatório"),
  passwordDefault: Yup.string()
    .required("Senha é obrigatória"),
  numberAttendants: Yup.number(),
  numberConections: Yup.number(),
  document: Yup.string() // ADICIONAR
    .nullable()
    .transform((value, originalValue) => {
      if (!originalValue || originalValue.trim() === '') return null;
      return value;
    })
    .test('cpf-cnpj-valid', 'CPF/CNPJ inválido', function(value) {
      if (!value) return true;
      return validateCPFOrCNPJ(value);
    })
});
```

**3. Estado inicial** (modificar linha 82-89):
```javascript
const initialState = {
  name: "",
  email: "",
  passwordDefault: "",
  numberAttendants: 1,
  numberConections: 1,
  status: false,
  document: "" // ADICIONAR
};
```

**4. Campo document** (adicionar após linha 208, antes do campo passwordDefault):
```javascript
<div className={classes.multFieldLine}>
  <Field name="document">
    {({ field, form, meta }) => (
      <InputMask
        {...field}
        mask={getDocumentMask(field.value)}
        onChange={(e) => form.setFieldValue('document', e.target.value)}
        onBlur={(e) => {
          form.setFieldTouched('document', true);
          field.onBlur(e);
        }}
      >
        {(inputProps) => (
          <TextField
            {...inputProps}
            label={i18n.t("compaies.form.documentLabel")}
            placeholder={i18n.t("compaies.form.documentPlaceholder")}
            variant="outlined"
            margin="dense"
            fullWidth
            error={meta.touched && Boolean(meta.error)}
            helperText={meta.touched && meta.error}
          />
        )}
      </InputMask>
    )}
  </Field>
</div>
```

**5. handleSaveCompany - normalização** (modificar linha 122-140):
```javascript
const handleSaveCompany = async values => {
  const companyData = { ...values };

  // Normalizar documento
  if (companyData.document) {
    companyData.document = normalizeDocument(companyData.document);
    if (!companyData.document) companyData.document = null;
  } else {
    companyData.document = null;
  }

  try {
    if (companyId) {
      if (companyData.passwordDefault === "") {
        delete companyData.passwordDefault;
      }
      await api.put(`/companies/${companyId}`, companyData);
    } else {
      await api.post("/companies", companyData);
    }
    toast.success(i18n.t("companyModal.success"));
  } catch (err) {
    // Tratar erro de duplicata
    if (err.response?.data?.error === "ERR_COMPANY_DOCUMENT_DUPLICATE") {
      toast.error(i18n.t("compaies.form.documentDuplicate"));
    } else {
      toastError(err);
    }
  }
  handleClose();
};
```

---

#### C) Companies (Página)

**Arquivo**: `/frontend/src/pages/Companies/index.js`

**Mudanças**:

**1. Importações** (adicionar):
```javascript
import { normalizeDocument } from '../../utils/documentValidator';
import { formatDocument } from '../../utils/documentFormatter';
```

**2. Busca normalizada** (modificar linha 115-125):
```javascript
const filteredCompanies = useMemo(() => {
  if (!searchParam) return companies;

  const term = searchParam.toLowerCase();
  const normalizedTerm = normalizeDocument(searchParam) || ''; // ADICIONAR

  return companies.filter(company =>
    company.name?.toLowerCase().includes(term) ||
    company.email?.toLowerCase().includes(term) ||
    company.document?.includes(normalizedTerm) || // MODIFICAR
    company.phone?.includes(term)
  );
}, [companies, searchParam]);
```

**3. Adicionar coluna document na tabela** (opcional):
- Header (linha ~329): `<TableCell align="center">{i18n.t("compaies.table.document")}</TableCell>`
- Body (linha ~346): `<TableCell align="center">{formatDocument(company.document)}</TableCell>`

---

#### D) Traduções (5 idiomas)

**Arquivos**:
- `/frontend/src/translate/languages/pt.js`
- `/frontend/src/translate/languages/en.js`
- `/frontend/src/translate/languages/es.js`
- `/frontend/src/translate/languages/tr.js`
- `/frontend/src/translate/languages/ar.js`

**Mudanças em pt.js** (linha ~2100, dentro de `compaies`):

```javascript
compaies: {
  form: { // ADICIONAR SEÇÃO
    documentLabel: "CPF/CNPJ (opcional)",
    documentPlaceholder: "000.000.000-00 ou 00.000.000/0000-00",
    documentInvalid: "CPF/CNPJ inválido",
    documentDuplicate: "CPF/CNPJ já cadastrado no sistema",
    documentNotProvided: "Não informado",
    documentHelperText: "Informe CPF (11 dígitos) ou CNPJ (14 dígitos)",
    nameMin: "Nome muito curto",
    nameRequired: "Nome é obrigatório",
    emailInvalid: "Email inválido",
    emailRequired: "Email é obrigatório",
    planRequired: "Plano é obrigatório",
  },
  table: {
    // ... campos existentes
    document: "CPF/CNPJ", // Atualizar de "CNPJ/CPF" para "CPF/CNPJ"
  },
  // ... restante
}
```

**Replicar para outros idiomas** (ver tabela completa na seção 1.4).

---

## 6. Biblioteca de Máscara

### 6.1. Análise de Opções

**Situação Atual**: `react-input-mask` v2.0.4 já está instalado no projeto.

**Decisão**: Usar `react-input-mask` existente (SEM adicionar nova dependência).

**Justificativa**:
1. Já instalado (~15KB gzipped)
2. Bem mantido (última atualização 2023)
3. Compatível com Material-UI v4
4. Suporta máscaras dinâmicas via prop `mask`

### 6.2. Implementação com react-input-mask

**Padrão de Uso**:
```javascript
import InputMask from 'react-input-mask';

<Field name="document">
  {({ field, form, meta }) => (
    <InputMask
      {...field}
      mask={getDocumentMask(field.value)} // Máscara condicional
      onChange={(e) => form.setFieldValue('document', e.target.value)}
      onBlur={(e) => {
        form.setFieldTouched('document', true);
        field.onBlur(e);
      }}
    >
      {(inputProps) => (
        <TextField
          {...inputProps}
          label="CPF/CNPJ (opcional)"
          variant="outlined"
          margin="dense"
          fullWidth
          error={meta.touched && Boolean(meta.error)}
          helperText={meta.touched && meta.error}
        />
      )}
    </InputMask>
  )}
</Field>
```

**Função getDocumentMask** (ver seção 3.2):
```javascript
export const getDocumentMask = (value) => {
  if (!value) return '999.999.999-99';
  const numbers = value.replace(/\D/g, '');
  if (numbers.length <= 11) return '999.999.999-99'; // CPF
  return '99.999.999/9999-99'; // CNPJ
};
```

### 6.3. Testes de Máscaras

**Casos de Teste**:
1. Campo vazio → Máscara CPF (default)
2. Digitar 1-11 dígitos → Máscara CPF
3. Digitar 12-14 dígitos → Máscara CNPJ
4. Apagar do 12º para 11º → Volta para CPF
5. Colar CPF completo → Aplica máscara CPF
6. Colar CNPJ completo → Aplica máscara CNPJ
7. Colar texto inválido → Filtra apenas dígitos

**Teste Manual**:
```
# CPF
Input: 11144477735
Output: 111.444.777-35

# CNPJ
Input: 11222333000181
Output: 11.222.333/0001-81

# Transição
Input: 123456789012
Step 1 (11 dígitos): 123.456.789-01 (CPF)
Step 2 (12 dígitos): 12.345.678/9012 (CNPJ)
```

---

## 7. Checklist de Validação Frontend

### 7.1. Validações de Campo

- [ ] Campo vazio não bloqueia submit
- [ ] Campo vazio não exibe erro
- [ ] Digitar 11 dígitos aplica máscara CPF
- [ ] Digitar 14 dígitos aplica máscara CNPJ
- [ ] Transição de máscara no 12º dígito é suave (sem flickering)
- [ ] CPF válido não mostra erro após onBlur
- [ ] CPF inválido (dígito verificador errado) mostra erro após onBlur
- [ ] CPF com sequência repetida (000.000.000-00) mostra erro
- [ ] CNPJ válido não mostra erro após onBlur
- [ ] CNPJ inválido (dígito verificador errado) mostra erro após onBlur
- [ ] CNPJ com sequência repetida mostra erro
- [ ] Comprimento incorreto (12-13 dígitos) mostra erro específico
- [ ] Limpar campo remove erro
- [ ] Erro desaparece ao corrigir documento

### 7.2. Submit e Normalização

- [ ] Submit normaliza documento (remove `.`, `-`, `/`, espaços)
- [ ] Submit converte string vazia para `null`
- [ ] API recebe documento normalizado (apenas dígitos ou null)
- [ ] Submit bloqueado se campo tem erro de validação
- [ ] Toast de erro exibido se submit falhar por validação

### 7.3. Exibição e Formatação

- [ ] Lista exibe "Não informado" (texto cinza itálico) para NULL
- [ ] Lista exibe CPF formatado (123.456.789-00) para valores salvos
- [ ] Lista exibe CNPJ formatado (12.345.678/0001-90) para valores salvos
- [ ] Coluna document visível na tabela (se decisão for adicionar)

### 7.4. Busca

- [ ] Busca por documento formatado funciona (ex: "123.456.789-00")
- [ ] Busca por documento sem formatação funciona (ex: "12345678900")
- [ ] Busca por documento parcial funciona (ex: "123456")
- [ ] Busca por empresa sem documento não falha (NULL tratado)

### 7.5. Edição

- [ ] Editar empresa carrega documento formatado no campo
- [ ] Editar empresa com document NULL carrega campo vazio
- [ ] Remover documento (limpar campo) salva como NULL
- [ ] Alterar documento valida novo valor
- [ ] Alterar documento não permite duplicata

### 7.6. Erros de API

- [ ] Erro de duplicata (409 Conflict) exibe toast específico
- [ ] Toast de erro de duplicata menciona "CPF/CNPJ já cadastrado"
- [ ] Outros erros de validação exibem toast genérico

### 7.7. Internacionalização

- [ ] Traduções funcionam em português (pt)
- [ ] Traduções funcionam em inglês (en)
- [ ] Traduções funcionam em espanhol (es)
- [ ] Traduções funcionam em turco (tr)
- [ ] Traduções funcionam em árabe (ar)
- [ ] Trocar idioma atualiza labels, placeholders e mensagens de erro

### 7.8. Acessibilidade

- [ ] Label associado ao input (htmlFor / id)
- [ ] `aria-label` presente no campo
- [ ] `aria-invalid` definido como true quando há erro
- [ ] `aria-describedby` aponta para helperText de erro
- [ ] Mensagens de erro anunciadas por screen readers
- [ ] Navegação por Tab funciona corretamente
- [ ] Enter no campo não submete formulário (apenas botão "Salvar")
- [ ] Foco visível no campo (outline)

### 7.9. UX e Performance

- [ ] Validação onBlur não causa lag perceptível (< 50ms)
- [ ] Máscara condicional muda sem delay
- [ ] Cursor não pula ao aplicar máscara
- [ ] Campo não pisca ao mudar de máscara CPF para CNPJ
- [ ] Loading spinner exibido durante submit
- [ ] Campo desabilitado durante loading

---

## 8. Performance e Otimizações

### 8.1. Validação de Documento

**Algoritmo**: Validação CPF/CNPJ envolve loops e cálculos de módulo 11.

**Tempo de execução**:
- CPF: ~1-2ms (9 iterações + 10 iterações)
- CNPJ: ~1-2ms (12 iterações + 13 iterações)
- **Total**: Imperceptível para usuário (< 50ms de budget para UX instantânea)

**Otimizações**:
1. **Não validar durante onChange**: Apenas onBlur e onSubmit (evita 10-20 validações desnecessárias)
2. **Early return**: Retornar true imediatamente se campo vazio (opcional)
3. **Regex para sequências repetidas**: ~0.1ms (mais rápido que loop)

### 8.2. Máscaras Condicionais

**Re-renders**: Trocar máscara de CPF para CNPJ causa re-render do InputMask.

**Impacto**:
- react-input-mask otimizado: ~5-10ms
- Material-UI TextField: ~10-20ms
- **Total**: ~15-30ms (imperceptível)

**Otimizações**:
1. **Máscara calculada uma vez**: `useMemo` em getDocumentMask (desnecessário, função é leve)
2. **Evitar re-renders do formulário**: Formik já otimizado com `enableReinitialize`

### 8.3. Busca Client-Side

**Complexidade**: O(n) onde n = número de empresas.

**Impacto**:
- 100 empresas: ~1ms
- 1.000 empresas: ~10ms
- 10.000 empresas: ~100ms (ainda OK)

**Otimizações**:
1. **useMemo**: Já implementado (linha 566-576)
2. **Debounce no onChange** (opcional): Evitar recalcular a cada tecla
   ```javascript
   const [searchTerm, setSearchTerm] = useState("");
   const debouncedSearchTerm = useDebounce(searchTerm, 300); // 300ms delay
   ```
3. **Lazy loading**: Se tabela > 10K empresas, considerar paginação backend

### 8.4. Bundle Size

**Dependências**:
- `react-input-mask` v2.0.4: ~15KB gzipped (já instalado, sem impacto)
- Novos arquivos:
  - `documentValidator.js`: ~5KB
  - `documentFormatter.js`: ~3KB
  - **Total novo**: ~8KB (0.8% de impacto em bundle médio de 1MB)

**Otimizações**:
- Tree-shaking: Webpack/Vite removem funções não usadas (já configurado)
- Code splitting: Componentes de empresas em chunk separado (já feito via React.lazy?)

---

## 9. Acessibilidade (A11y)

### 9.1. WCAG AA Compliance

**Requisitos**:
- Contraste mínimo 4.5:1 para texto normal
- Contraste mínimo 3:1 para texto grande (18pt+)
- Todos os controles interativos acessíveis via teclado
- Todos os elementos focáveis têm indicador visível
- Mensagens de erro anunciadas por screen readers

### 9.2. Implementação

**Label e Associação**:
```javascript
<TextField
  id="company-document"
  label={i18n.t("compaies.form.documentLabel")}
  name="document"
  inputProps={{
    'aria-label': i18n.t("compaies.form.documentLabel"),
    'aria-describedby': meta.touched && meta.error ? 'document-error' : 'document-helper'
  }}
/>
```

**Estados de Erro**:
```javascript
<TextField
  error={meta.touched && Boolean(meta.error)}
  helperText={
    meta.touched && meta.error
      ? <span id="document-error" role="alert">{meta.error}</span>
      : <span id="document-helper">{i18n.t("compaies.form.documentHelperText")}</span>
  }
  inputProps={{
    'aria-invalid': meta.touched && Boolean(meta.error),
    'aria-describedby': meta.touched && meta.error ? 'document-error' : 'document-helper'
  }}
/>
```

**Navegação por Teclado**:
- Tab: Move para próximo campo
- Shift+Tab: Move para campo anterior
- Enter no campo: NÃO submete formulário (apenas botão "Salvar")
- Esc: Limpa erro (se implementado)

**Foco Visível**:
Material-UI v4 já possui outline padrão, mas verificar se CSS global não sobrescreve:
```css
/* NÃO fazer isso */
input:focus { outline: none; }

/* Fazer isso */
input:focus {
  outline: 2px solid #1976d2; /* Cor primária Material-UI */
  outline-offset: 2px;
}
```

### 9.3. Testes de Acessibilidade

**Ferramentas**:
1. **axe DevTools** (extensão Chrome/Firefox): Detecta violações WCAG automaticamente
2. **NVDA** (Windows) ou **VoiceOver** (macOS): Testar com screen reader
3. **Keyboard-only navigation**: Desconectar mouse e navegar apenas com Tab/Enter

**Checklist**:
- [ ] axe DevTools não reporta erros no formulário
- [ ] Screen reader anuncia label "CPF/CNPJ (opcional)"
- [ ] Screen reader anuncia helper text "Informe CPF (11 dígitos) ou CNPJ (14 dígitos)"
- [ ] Screen reader anuncia erro "CPF/CNPJ inválido" quando validação falha
- [ ] Navegação por Tab segue ordem lógica (nome → email → documento → plano → ...)
- [ ] Enter no botão "Salvar" submete formulário
- [ ] Enter no campo "CPF/CNPJ" NÃO submete formulário

---

## 10. Internacionalização (i18n)

### 10.1. Chaves de Tradução

**Arquivo**: `/frontend/src/translate/languages/pt.js`

**Localização**: Dentro de `compaies` (linha ~2100)

**Estrutura**:
```javascript
export const messages = {
  pt: {
    translations: {
      compaies: {
        form: { // NOVA SEÇÃO
          documentLabel: "CPF/CNPJ (opcional)",
          documentPlaceholder: "000.000.000-00 ou 00.000.000/0000-00",
          documentInvalid: "CPF/CNPJ inválido",
          documentDuplicate: "CPF/CNPJ já cadastrado no sistema",
          documentNotProvided: "Não informado",
          documentHelperText: "Informe CPF (11 dígitos) ou CNPJ (14 dígitos)",
          nameMin: "Nome muito curto",
          nameRequired: "Nome é obrigatório",
          emailInvalid: "Email inválido",
          emailRequired: "Email é obrigatório",
          planRequired: "Plano é obrigatório",
        },
        table: {
          // ... campos existentes
          document: "CPF/CNPJ",
        },
        // ... restante
      }
    }
  }
};
```

### 10.2. Traduções Completas (5 Idiomas)

#### Português (pt)
```javascript
documentLabel: "CPF/CNPJ (opcional)",
documentPlaceholder: "000.000.000-00 ou 00.000.000/0000-00",
documentInvalid: "CPF/CNPJ inválido",
documentDuplicate: "CPF/CNPJ já cadastrado no sistema",
documentNotProvided: "Não informado",
documentHelperText: "Informe CPF (11 dígitos) ou CNPJ (14 dígitos)",
```

#### Inglês (en)
```javascript
documentLabel: "Tax ID (optional)",
documentPlaceholder: "000.000.000-00 or 00.000.000/0000-00",
documentInvalid: "Invalid Tax ID",
documentDuplicate: "Tax ID already registered",
documentNotProvided: "Not provided",
documentHelperText: "Enter CPF (11 digits) or CNPJ (14 digits)",
```

#### Espanhol (es)
```javascript
documentLabel: "CPF/CNPJ (opcional)",
documentPlaceholder: "000.000.000-00 o 00.000.000/0000-00",
documentInvalid: "CPF/CNPJ inválido",
documentDuplicate: "CPF/CNPJ ya registrado",
documentNotProvided: "No informado",
documentHelperText: "Ingrese CPF (11 dígitos) o CNPJ (14 dígitos)",
```

#### Turco (tr)
```javascript
documentLabel: "Vergi No (isteğe bağlı)",
documentPlaceholder: "000.000.000-00 veya 00.000.000/0000-00",
documentInvalid: "Geçersiz Vergi No",
documentDuplicate: "Vergi No zaten kayıtlı",
documentNotProvided: "Belirtilmedi",
documentHelperText: "CPF (11 haneli) veya CNPJ (14 haneli) girin",
```

#### Árabe (ar)
```javascript
documentLabel: "رقم الضريبة (اختياري)",
documentPlaceholder: "000.000.000-00 أو 00.000.000/0000-00",
documentInvalid: "رقم الضريبة غير صالح",
documentDuplicate: "رقم الضريبة مسجل بالفعل",
documentNotProvided: "غير محدد",
documentHelperText: "أدخل CPF (11 رقمًا) أو CNPJ (14 رقمًا)",
```

### 10.3. Uso no Código

**Importação**:
```javascript
import { i18n } from '../../translate/i18n';
```

**Uso em JSX**:
```javascript
<TextField
  label={i18n.t("compaies.form.documentLabel")}
  placeholder={i18n.t("compaies.form.documentPlaceholder")}
  helperText={i18n.t("compaies.form.documentHelperText")}
/>
```

**Uso em Validação**:
```javascript
Yup.string().test('cpf-cnpj', i18n.t("compaies.form.documentInvalid"), ...)
```

**Uso em Toast**:
```javascript
toast.error(i18n.t("compaies.form.documentDuplicate"));
```

### 10.4. Testes de Idioma

**Procedimento**:
1. Acessar `/settings/profile` ou equivalente
2. Trocar idioma para `en` (inglês)
3. Verificar que:
   - Label do campo muda para "Tax ID (optional)"
   - Placeholder muda para "000.000.000-00 or 00.000.000/0000-00"
   - Mensagem de erro muda para "Invalid Tax ID"
   - "Não informado" muda para "Not provided"
4. Repetir para `es`, `tr`, `ar`

---

## 11. Plano de Implementação (Commits)

### Commit 1: Criar Helpers de Validação e Formatação

**Arquivos**:
- Criar `/frontend/src/utils/documentValidator.js` (~150 linhas)
- Criar `/frontend/src/utils/documentFormatter.js` (~100 linhas)

**Checklist**:
- [ ] Implementar `normalizeDocument()`
- [ ] Implementar `validateCPF()` com algoritmo Receita Federal
- [ ] Implementar `validateCNPJ()` com algoritmo Receita Federal
- [ ] Implementar `validateCPFOrCNPJ()` (detecta tipo automaticamente)
- [ ] Implementar `formatCPF()` (123.456.789-00)
- [ ] Implementar `formatCNPJ()` (12.345.678/0001-90)
- [ ] Implementar `formatDocument()` (auto-detecta e formata ou "Não informado")
- [ ] Implementar `getDocumentMask()` (retorna máscara CPF ou CNPJ)
- [ ] Adicionar comentários JSDoc em todas as funções
- [ ] Testar manualmente com CPF/CNPJ válidos e inválidos

**Estimativa**: 2 horas

**Dependências**: Nenhuma

---

### Commit 2: Adicionar Traduções i18n (5 Idiomas)

**Arquivos**:
- Modificar `/frontend/src/translate/languages/pt.js`
- Modificar `/frontend/src/translate/languages/en.js`
- Modificar `/frontend/src/translate/languages/es.js`
- Modificar `/frontend/src/translate/languages/tr.js`
- Modificar `/frontend/src/translate/languages/ar.js`

**Checklist**:
- [ ] Adicionar seção `compaies.form` com 6 chaves em pt.js
- [ ] Adicionar traduções em en.js (inglês)
- [ ] Adicionar traduções em es.js (espanhol)
- [ ] Adicionar traduções em tr.js (turco)
- [ ] Adicionar traduções em ar.js (árabe)
- [ ] Atualizar `compaies.table.document` de "CNPJ/CPF" para "CPF/CNPJ"
- [ ] Testar que chaves não quebram build (syntax error)
- [ ] Testar troca de idioma no frontend

**Estimativa**: 1 hora

**Dependências**: Nenhuma

---

### Commit 3: Implementar Campo document em CompaniesManager com Máscara e Validação

**Arquivos**:
- Modificar `/frontend/src/components/CompaniesManager/index.js`

**Checklist**:
- [ ] Importar `InputMask`, `validateCPFOrCNPJ`, `normalizeDocument`, `getDocumentMask`, `Yup`
- [ ] Criar `CompanyValidationSchema` com validação de `document`
- [ ] Adicionar `validationSchema` ao Formik (linha 194)
- [ ] Substituir campo `document` (linha 302-311) por Field com InputMask
- [ ] Adicionar prop `mask={getDocumentMask(field.value)}`
- [ ] Adicionar `error` e `helperText` ao TextField
- [ ] Adicionar atributos ARIA (`aria-label`, `aria-invalid`, `aria-describedby`)
- [ ] Modificar `handleSubmit` para normalizar documento antes de enviar
- [ ] Testar campo vazio (não bloqueia submit)
- [ ] Testar CPF válido (sem erro)
- [ ] Testar CPF inválido (mostra erro)
- [ ] Testar CNPJ válido (sem erro)
- [ ] Testar transição de máscara CPF → CNPJ

**Estimativa**: 3 horas

**Dependências**: Commit 1, Commit 2

---

### Commit 4: Adicionar Coluna document na Tabela e Renderização Formatada

**Arquivos**:
- Modificar `/frontend/src/components/CompaniesManager/index.js` (CompaniesManagerGrid)

**Checklist**:
- [ ] Importar `formatDocument` de `documentFormatter.js`
- [ ] Criar função `renderDocument(row)` (exibe formatado ou "Não informado")
- [ ] Adicionar `<TableCell>` no header (linha ~504)
- [ ] Adicionar `<TableCell>` no body com `{renderDocument(row)}` (linha ~524)
- [ ] Testar exibição de CPF formatado na tabela
- [ ] Testar exibição de CNPJ formatado na tabela
- [ ] Testar exibição de "Não informado" (texto cinza) para NULL

**Estimativa**: 1 hora

**Dependências**: Commit 1, Commit 3

---

### Commit 5: Normalizar Busca Client-Side para Aceitar Documento Formatado

**Arquivos**:
- Modificar `/frontend/src/components/CompaniesManager/index.js`
- Modificar `/frontend/src/pages/Companies/index.js`

**Checklist**:
- [ ] Importar `normalizeDocument` em ambos os arquivos
- [ ] Modificar `filteredRecords` (CompaniesManager linha 566-576)
- [ ] Adicionar `const normalizedTerm = normalizeDocument(searchTerm) || ''`
- [ ] Modificar filtro: `company.document?.includes(normalizedTerm)`
- [ ] Replicar mudança em Companies/index.js (linha 115-125)
- [ ] Testar busca por "123.456.789-00" (formatado)
- [ ] Testar busca por "12345678900" (sem formatação)
- [ ] Testar busca por "123456" (parcial)
- [ ] Testar que empresas sem documento (NULL) não causam erro

**Estimativa**: 1 hora

**Dependências**: Commit 1, Commit 3

---

### Commit 6: Implementar Campo document em CompaniesModal

**Arquivos**:
- Modificar `/frontend/src/components/CompaniesModal/index.js`

**Checklist**:
- [ ] Importar `InputMask`, `validateCPFOrCNPJ`, `normalizeDocument`, `getDocumentMask`
- [ ] Adicionar `document: ""` ao estado inicial (linha 82-89)
- [ ] Adicionar validação de `document` ao `CompanySchema` (linha 66-77)
- [ ] Adicionar Field com InputMask após campo `email` (linha 208)
- [ ] Modificar `handleSaveCompany` para normalizar documento (linha 122-140)
- [ ] Adicionar tratamento de erro de duplicata (toast específico)
- [ ] Testar criação de empresa COM documento via modal
- [ ] Testar criação de empresa SEM documento via modal
- [ ] Testar erro de duplicata (toast correto)

**Estimativa**: 2 horas

**Dependências**: Commit 1, Commit 2

---

### Commit 7: Escrever Testes Unitários para Validação e Formatação

**Arquivos**:
- Criar `/frontend/src/__tests__/utils/documentValidator.test.js`
- Criar `/frontend/src/__tests__/utils/documentFormatter.test.js`

**Checklist**:
- [ ] Criar arquivo de testes para `documentValidator.js`
- [ ] Testar `normalizeDocument()` (remove pontuação, retorna null para vazio)
- [ ] Testar `validateCPF()` (válido, inválido, sequências repetidas)
- [ ] Testar `validateCNPJ()` (válido, inválido, sequências repetidas)
- [ ] Testar `validateCPFOrCNPJ()` (detecção automática, campo opcional)
- [ ] Criar arquivo de testes para `documentFormatter.js`
- [ ] Testar `formatCPF()` (11 dígitos → 123.456.789-00)
- [ ] Testar `formatCNPJ()` (14 dígitos → 12.345.678/0001-90)
- [ ] Testar `formatDocument()` (auto-detecta, formata, "Não informado" para NULL)
- [ ] Testar `getDocumentMask()` (retorna máscara CPF ou CNPJ)
- [ ] Executar `npm test` e garantir 100% de cobertura nos helpers
- [ ] Corrigir falhas, se houver

**Estimativa**: 3 horas

**Dependências**: Commit 1

---

### Commit 8: Adicionar Coluna document em Companies (Página de Listagem) - Opcional

**Arquivos**:
- Modificar `/frontend/src/pages/Companies/index.js`

**Checklist**:
- [ ] Importar `formatDocument` de `documentFormatter.js`
- [ ] Adicionar `<TableCell>` no header (linha ~329)
- [ ] Adicionar `<TableCell>` no body com `{formatDocument(company.document)}`
- [ ] Testar exibição de documento formatado na página Companies
- [ ] Testar que coluna não quebra layout da tabela

**Estimativa**: 30 minutos

**Dependências**: Commit 1, Commit 4

**Nota**: Este commit é OPCIONAL. Decidir com produto se página Companies deve exibir coluna document (CompaniesManager já exibe).

---

## Resumo do Plano

**Total de Commits**: 8 (7 obrigatórios + 1 opcional)
**Estimativa Total**: 13,5 horas (~2 dias de desenvolvimento)

**Ordem de Execução**:
1. Commit 1 (Helpers) → Base para todos
2. Commit 2 (Traduções) → Independente, pode ser paralelo
3. Commit 3 (CompaniesManager campo) → Depende de 1 e 2
4. Commit 4 (CompaniesManager tabela) → Depende de 1 e 3
5. Commit 5 (Busca normalizada) → Depende de 1 e 3
6. Commit 6 (CompaniesModal) → Depende de 1 e 2
7. Commit 7 (Testes) → Depende de 1 (pode ser paralelo com 3-6)
8. Commit 8 (Companies página) → Opcional, depende de 1 e 4

**Testes Manuais Críticos** (após Commit 6):
- Criar empresa sem documento → Salva NULL
- Criar empresa com CPF válido → Salva normalizado
- Criar empresa com CPF inválido → Erro
- Criar empresa com CNPJ válido → Salva normalizado
- Transição de máscara CPF → CNPJ → Suave
- Editar empresa e remover documento → Salva NULL
- Buscar por documento formatado → Encontra
- Duplicata → Toast "CPF/CNPJ já cadastrado"

**Aprovação**: Após Commit 6, demo para produto/QA antes de merge.

---

**Fim do Plano de UX e Implementação Frontend**
