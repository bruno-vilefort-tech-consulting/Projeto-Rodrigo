/**
 * Validação de documentos brasileiros (CPF e CNPJ)
 * Implementa algoritmos completos da Receita Federal
 */

/**
 * Remove formatação de CPF/CNPJ
 * @param {string|null|undefined} doc - Documento formatado
 * @returns {string|null} Documento normalizado ou null
 */
export const normalizeDocument = (doc) => {
  if (!doc) return null;
  const normalized = doc.replace(/[.\-\/\s]/g, '').trim();
  return normalized === '' ? null : normalized;
};

/**
 * Valida CPF segundo algoritmo da Receita Federal
 * @param {string} cpf - CPF com 11 dígitos (sem formatação)
 * @returns {boolean} true se válido
 */
export const validateCPF = (cpf) => {
  // Verificar comprimento
  if (!cpf || cpf.length !== 11) return false;

  // Rejeitar sequências conhecidas (todos os dígitos iguais)
  const knownInvalidSequences = [
    '00000000000', '11111111111', '22222222222', '33333333333',
    '44444444444', '55555555555', '66666666666', '77777777777',
    '88888888888', '99999999999'
  ];

  if (knownInvalidSequences.includes(cpf)) return false;

  // Validar apenas se todos os caracteres são dígitos
  if (!/^\d+$/.test(cpf)) return false;

  // Calcular primeiro dígito verificador (DV1)
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let remainder = sum % 11;
  const dv1 = remainder < 2 ? 0 : 11 - remainder;

  // Verificar DV1
  if (parseInt(cpf.charAt(9)) !== dv1) return false;

  // Calcular segundo dígito verificador (DV2)
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i)) * (11 - i);
  }
  remainder = sum % 11;
  const dv2 = remainder < 2 ? 0 : 11 - remainder;

  // Verificar DV2
  return parseInt(cpf.charAt(10)) === dv2;
};

/**
 * Valida CNPJ segundo algoritmo da Receita Federal
 * @param {string} cnpj - CNPJ com 14 dígitos (sem formatação)
 * @returns {boolean} true se válido
 */
export const validateCNPJ = (cnpj) => {
  // Verificar comprimento
  if (!cnpj || cnpj.length !== 14) return false;

  // Rejeitar sequências conhecidas (todos os dígitos iguais)
  const knownInvalidSequences = [
    '00000000000000', '11111111111111', '22222222222222', '33333333333333',
    '44444444444444', '55555555555555', '66666666666666', '77777777777777',
    '88888888888888', '99999999999999'
  ];

  if (knownInvalidSequences.includes(cnpj)) return false;

  // Validar apenas se todos os caracteres são dígitos
  if (!/^\d+$/.test(cnpj)) return false;

  // Calcular primeiro dígito verificador (DV1)
  const weights1 = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  let sum = 0;

  for (let i = 0; i < 12; i++) {
    sum += parseInt(cnpj.charAt(i)) * weights1[i];
  }

  let remainder = sum % 11;
  const dv1 = remainder < 2 ? 0 : 11 - remainder;

  // Verificar DV1
  if (parseInt(cnpj.charAt(12)) !== dv1) return false;

  // Calcular segundo dígito verificador (DV2)
  const weights2 = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
  sum = 0;

  for (let i = 0; i < 13; i++) {
    sum += parseInt(cnpj.charAt(i)) * weights2[i];
  }

  remainder = sum % 11;
  const dv2 = remainder < 2 ? 0 : 11 - remainder;

  // Verificar DV2
  return parseInt(cnpj.charAt(13)) === dv2;
};

/**
 * Valida CPF OU CNPJ automaticamente
 * @param {string|null|undefined} doc - Documento
 * @returns {boolean} true se válido ou vazio (opcional)
 */
export const validateCPFOrCNPJ = (doc) => {
  if (!doc) return true; // Campo opcional

  const normalized = normalizeDocument(doc);
  if (!normalized) return true;

  if (normalized.length === 11) return validateCPF(normalized);
  if (normalized.length === 14) return validateCNPJ(normalized);

  return false; // Comprimento inválido
};
