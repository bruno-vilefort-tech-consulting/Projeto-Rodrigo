/**
 * DocumentValidator.ts
 *
 * Helper para validação e normalização de documentos fiscais brasileiros (CPF e CNPJ).
 * Implementa os algoritmos oficiais da Receita Federal para validação de dígitos verificadores.
 *
 * @module DocumentValidator
 */

/**
 * Remove formatação de CPF/CNPJ (pontos, traços, barras, espaços)
 *
 * Converte strings vazias, undefined ou null para null.
 * Remove todos os caracteres de pontuação e espaços.
 * Se após limpeza o resultado for string vazia, retorna null.
 *
 * @param doc - Documento formatado (ex: "123.456.789-00" ou "12.345.678/0001-90")
 * @returns Documento sem formatação (ex: "12345678900") ou null se vazio
 *
 * @example
 * normalizeDocument("123.456.789-00") // "12345678900"
 * normalizeDocument("12.345.678/0001-90") // "12345678000190"
 * normalizeDocument("") // null
 * normalizeDocument("   ") // null
 * normalizeDocument(null) // null
 * normalizeDocument(undefined) // null
 */
export function normalizeDocument(doc: string | undefined | null): string | null {
  // Se vazio, undefined ou null → retornar null
  if (!doc || doc === undefined || doc === null) {
    return null;
  }

  // Trim e remover pontuação (/[.\-\/\s]/g)
  const normalized = doc.trim().replace(/[.\-\/\s]/g, '');

  // Se resultado vazio após limpeza → retornar null
  if (normalized === '') {
    return null;
  }

  return normalized;
}

/**
 * Valida CPF segundo algoritmo da Receita Federal
 *
 * Algoritmo:
 * 1. CPF deve ter exatamente 11 dígitos
 * 2. Rejeita CPFs conhecidos como inválidos (sequências repetidas: 000.000.000-00, 111.111.111-11, etc)
 * 3. Calcula primeiro dígito verificador (DV1):
 *    - Multiplica cada um dos 9 primeiros dígitos por (10, 9, 8, 7, 6, 5, 4, 3, 2)
 *    - Soma os resultados
 *    - DV1 = 11 - (soma % 11). Se DV1 > 9, DV1 = 0
 * 4. Calcula segundo dígito verificador (DV2):
 *    - Multiplica cada um dos 10 primeiros dígitos por (11, 10, 9, 8, 7, 6, 5, 4, 3, 2)
 *    - Soma os resultados
 *    - DV2 = 11 - (soma % 11). Se DV2 > 9, DV2 = 0
 * 5. Compara DV1 e DV2 calculados com os dígitos nas posições 9 e 10 do CPF
 *
 * Referência: https://www.receita.fazenda.gov.br/aplicacoes/atcta/cpf/funcoes.js
 *
 * @param cpf - CPF com 11 dígitos (sem formatação)
 * @returns true se válido, false se inválido
 *
 * @example
 * validateCPF("12345678909") // true (CPF válido)
 * validateCPF("12345678900") // false (dígito verificador inválido)
 * validateCPF("00000000000") // false (sequência repetida)
 * validateCPF("123") // false (comprimento inválido)
 */
export function validateCPF(cpf: string): boolean {
  // Remove caracteres não-numéricos (caso ainda existam)
  cpf = cpf.replace(/[^\d]/g, '');

  // Valida comprimento
  if (cpf.length !== 11) {
    return false;
  }

  // Rejeita CPFs conhecidos como inválidos (sequências repetidas)
  // 00000000000, 11111111111, ..., 99999999999
  if (/^(\d)\1{10}$/.test(cpf)) {
    return false;
  }

  // Calcula primeiro dígito verificador (DV1)
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cpf.charAt(i)) * (10 - i);
  }
  let digit1 = 11 - (sum % 11);
  if (digit1 > 9) {
    digit1 = 0;
  }

  // Valida primeiro dígito
  if (digit1 !== parseInt(cpf.charAt(9))) {
    return false;
  }

  // Calcula segundo dígito verificador (DV2)
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cpf.charAt(i)) * (11 - i);
  }
  let digit2 = 11 - (sum % 11);
  if (digit2 > 9) {
    digit2 = 0;
  }

  // Valida segundo dígito
  return digit2 === parseInt(cpf.charAt(10));
}

/**
 * Valida CNPJ segundo algoritmo da Receita Federal
 *
 * Algoritmo:
 * 1. CNPJ deve ter exatamente 14 dígitos
 * 2. Rejeita CNPJs conhecidos como inválidos (sequências repetidas: 00.000.000/0000-00, 11.111.111/1111-11, etc)
 * 3. Calcula primeiro dígito verificador (DV1):
 *    - Multiplica cada um dos 12 primeiros dígitos pelos pesos: [5,4,3,2,9,8,7,6,5,4,3,2]
 *    - Peso inicia em 5, decrementa até 2, depois reinicia em 9 e decrementa até 2
 *    - Soma os resultados
 *    - DV1 = 11 - (soma % 11). Se DV1 > 9, DV1 = 0
 * 4. Calcula segundo dígito verificador (DV2):
 *    - Multiplica cada um dos 13 primeiros dígitos pelos pesos: [6,5,4,3,2,9,8,7,6,5,4,3,2]
 *    - Peso inicia em 6, decrementa até 2, depois reinicia em 9 e decrementa até 2
 *    - Soma os resultados
 *    - DV2 = 11 - (soma % 11). Se DV2 > 9, DV2 = 0
 * 5. Compara DV1 e DV2 calculados com os dígitos nas posições 12 e 13 do CNPJ
 *
 * Referência: https://www.receita.fazenda.gov.br/aplicacoes/atcta/cnpj/funcoes.js
 *
 * @param cnpj - CNPJ com 14 dígitos (sem formatação)
 * @returns true se válido, false se inválido
 *
 * @example
 * validateCNPJ("11222333000181") // true (CNPJ válido)
 * validateCNPJ("12345678000190") // false (dígito verificador inválido)
 * validateCNPJ("00000000000000") // false (sequência repetida)
 * validateCNPJ("123") // false (comprimento inválido)
 */
export function validateCNPJ(cnpj: string): boolean {
  // Remove caracteres não-numéricos (caso ainda existam)
  cnpj = cnpj.replace(/[^\d]/g, '');

  // Valida comprimento
  if (cnpj.length !== 14) {
    return false;
  }

  // Rejeita CNPJs conhecidos como inválidos (sequências repetidas)
  // 00000000000000, 11111111111111, ..., 99999999999999
  if (/^(\d)\1{13}$/.test(cnpj)) {
    return false;
  }

  // Calcula primeiro dígito verificador (DV1)
  // Pesos: [5,4,3,2,9,8,7,6,5,4,3,2]
  let sum = 0;
  let weight = 5;
  for (let i = 0; i < 12; i++) {
    sum += parseInt(cnpj.charAt(i)) * weight;
    weight = (weight === 2) ? 9 : weight - 1;
  }
  let digit1 = 11 - (sum % 11);
  if (digit1 > 9) {
    digit1 = 0;
  }

  // Valida primeiro dígito
  if (digit1 !== parseInt(cnpj.charAt(12))) {
    return false;
  }

  // Calcula segundo dígito verificador (DV2)
  // Pesos: [6,5,4,3,2,9,8,7,6,5,4,3,2]
  sum = 0;
  weight = 6;
  for (let i = 0; i < 13; i++) {
    sum += parseInt(cnpj.charAt(i)) * weight;
    weight = (weight === 2) ? 9 : weight - 1;
  }
  let digit2 = 11 - (sum % 11);
  if (digit2 > 9) {
    digit2 = 0;
  }

  // Valida segundo dígito
  return digit2 === parseInt(cnpj.charAt(13));
}

/**
 * Valida CPF OU CNPJ automaticamente (detecta pelo comprimento)
 *
 * Comportamento:
 * - Se null, undefined ou string vazia → retorna true (campo opcional)
 * - Se 11 dígitos → valida como CPF
 * - Se 14 dígitos → valida como CNPJ
 * - Outros comprimentos → retorna false
 *
 * Esta função é idempotente: normalizar antes de validar garante que documentos
 * formatados sejam tratados corretamente.
 *
 * @param doc - Documento sem formatação (já normalizado)
 * @returns true se CPF válido OU CNPJ válido OU campo vazio (opcional), false caso contrário
 *
 * @example
 * validateCPFOrCNPJ("12345678909") // true (CPF válido)
 * validateCPFOrCNPJ("11222333000181") // true (CNPJ válido)
 * validateCPFOrCNPJ(null) // true (campo opcional)
 * validateCPFOrCNPJ(undefined) // true (campo opcional)
 * validateCPFOrCNPJ("") // true (campo opcional)
 * validateCPFOrCNPJ("123") // false (comprimento inválido)
 * validateCPFOrCNPJ("12345678900") // false (CPF inválido)
 */
export function validateCPFOrCNPJ(doc: string | null | undefined): boolean {
  // Se null/undefined/vazio → retornar true (campo opcional)
  if (!doc || doc === null || doc === undefined || doc.trim() === '') {
    return true;
  }

  // Remove caracteres não-numéricos (normalização defensiva)
  const normalized = doc.replace(/[^\d]/g, '');

  // Se vazio após normalização → retornar true (campo opcional)
  if (normalized === '') {
    return true;
  }

  // Detecta tipo por comprimento e valida
  if (normalized.length === 11) {
    return validateCPF(normalized);
  } else if (normalized.length === 14) {
    return validateCNPJ(normalized);
  } else {
    // Comprimento inválido (não é CPF nem CNPJ)
    return false;
  }
}
