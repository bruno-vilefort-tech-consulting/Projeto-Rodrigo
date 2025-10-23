/**
 * Formatação e máscara de documentos brasileiros (CPF e CNPJ)
 */

import { normalizeDocument } from './documentValidator';
import { i18n } from '../translate/i18n';

/**
 * Formata CPF para exibição: 12345678900 → 123.456.789-00
 * @param {string} cpf - CPF com 11 dígitos
 * @returns {string} CPF formatado ou o valor original
 */
export const formatCPF = (cpf) => {
  if (!cpf || cpf.length !== 11) return cpf;
  return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
};

/**
 * Formata CNPJ para exibição: 12345678000190 → 12.345.678/0001-90
 * @param {string} cnpj - CNPJ com 14 dígitos
 * @returns {string} CNPJ formatado ou o valor original
 */
export const formatCNPJ = (cnpj) => {
  if (!cnpj || cnpj.length !== 14) return cnpj;
  return cnpj.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5');
};

/**
 * Formata documento automaticamente (CPF ou CNPJ) para exibição
 * @param {string|null|undefined} doc - Documento normalizado
 * @returns {string} Documento formatado ou "Não informado"
 */
export const formatDocument = (doc) => {
  if (!doc) return i18n.t('compaies.form.documentNotProvided');

  const normalized = normalizeDocument(doc);
  if (!normalized) return i18n.t('compaies.form.documentNotProvided');

  if (normalized.length === 11) return formatCPF(normalized);
  if (normalized.length === 14) return formatCNPJ(normalized);

  return doc; // Retornar sem formatação se inválido
};

/**
 * Retorna máscara condicional para InputMask baseada no valor
 * @param {string|undefined} value - Valor atual do campo
 * @returns {string} Máscara ("999.999.999-99" ou "99.999.999/9999-99")
 */
export const getDocumentMask = (value) => {
  if (!value) return '999.999.999-99'; // CPF default

  const digits = value.replace(/\D/g, '');
  // 0-11 dígitos: CPF, 12-14 dígitos: CNPJ
  return digits.length >= 12 ? '99.999.999/9999-99' : '999.999.999-99';
};
