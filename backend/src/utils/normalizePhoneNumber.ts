import { parsePhoneNumber, isValidPhoneNumber } from 'libphonenumber-js';
import logger from './logger';

/**
 * Normaliza um número de telefone para o formato E.164 padrão
 *
 * @param rawNumber - Número de telefone em qualquer formato
 * @param defaultCountry - Código do país padrão (default: 'BR')
 * @returns Número normalizado em E.164 (ex: +5511999999999) ou null se inválido
 *
 * @example
 * normalizePhoneNumber('(11) 99999-9999') // '+5511999999999'
 * normalizePhoneNumber('11 999999999') // '+5511999999999'
 * normalizePhoneNumber('+55 11 99999-9999') // '+5511999999999'
 */
export const normalizePhoneNumber = (rawNumber: string, defaultCountry: string = 'BR'): string | null => {
  if (!rawNumber) return null;

  try {
    // Remover espaços e caracteres especiais, mantendo apenas dígitos e +
    let cleaned = rawNumber.replace(/\s+/g, '').replace(/[^\d+]/g, '');

    // Se não começa com +, adicionar
    if (!cleaned.startsWith('+')) {
      // Caso especial: números BR sem código de país
      // Se tiver 10-11 dígitos, assumir Brasil (+55)
      if (/^\d{10,11}$/.test(cleaned)) {
        cleaned = '+55' + cleaned;
      } else {
        cleaned = '+' + cleaned;
      }
    }

    // Validar com libphonenumber-js
    if (isValidPhoneNumber(cleaned, defaultCountry as any)) {
      const parsed = parsePhoneNumber(cleaned, defaultCountry as any);
      return parsed.number; // Retorna E.164 puro (ex: +5511999999999)
    }

    // Fallback: Tentar sem código de país
    const withoutPlus = cleaned.replace(/^\+/, '');
    if (isValidPhoneNumber('+55' + withoutPlus, 'BR')) {
      const parsed = parsePhoneNumber('+55' + withoutPlus, 'BR');
      return parsed.number;
    }

    logger.warn({ rawNumber, cleaned }, 'Failed to normalize phone number');
    return null;
  } catch (error) {
    logger.error({ error, rawNumber }, 'Error normalizing phone number');
    return null;
  }
};
