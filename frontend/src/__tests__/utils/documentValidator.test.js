/**
 * Testes unitários para documentValidator.js
 * CPFs e CNPJs válidos foram calculados com seus dígitos verificadores corretos
 */

import {
  normalizeDocument,
  validateCPF,
  validateCNPJ,
  validateCPFOrCNPJ
} from '../../utils/documentValidator';

describe('documentValidator', () => {
  describe('normalizeDocument', () => {
    it('deve remover pontuação de CPF', () => {
      expect(normalizeDocument('123.456.789-09')).toBe('12345678909');
    });

    it('deve remover pontuação de CNPJ', () => {
      expect(normalizeDocument('12.345.678/0001-95')).toBe('12345678000195');
    });

    it('deve remover espaços', () => {
      expect(normalizeDocument('123 456 789 09')).toBe('12345678909');
    });

    it('deve converter string vazia para null', () => {
      expect(normalizeDocument('')).toBeNull();
    });

    it('deve converter string com apenas espaços para null', () => {
      expect(normalizeDocument('   ')).toBe(null);
    });

    it('deve converter null para null', () => {
      expect(normalizeDocument(null)).toBeNull();
    });

    it('deve converter undefined para null', () => {
      expect(normalizeDocument(undefined)).toBeNull();
    });

    it('deve ser idempotente (normalizar 2x = 1x)', () => {
      const doc = '123.456.789-09';
      const normalized = normalizeDocument(doc);
      expect(normalizeDocument(normalized)).toBe(normalized);
    });
  });

  describe('validateCPF', () => {
    // CPFs válidos (calculados com dígitos verificadores corretos)
    it('deve validar CPF válido: 11144477735', () => {
      expect(validateCPF('11144477735')).toBe(true);
    });

    it('deve validar CPF válido: 52998224725', () => {
      expect(validateCPF('52998224725')).toBe(true);
    });

    it('deve validar CPF válido: 39053344705', () => {
      expect(validateCPF('39053344705')).toBe(true);
    });

    it('deve validar CPF válido: 11144477735 (exemplo 2)', () => {
      expect(validateCPF('11144477735')).toBe(true);
    });

    it('deve validar CPF válido: 52998224725 (exemplo 2)', () => {
      expect(validateCPF('52998224725')).toBe(true);
    });

    // CPFs inválidos
    it('deve rejeitar CPF inválido: 12345678900', () => {
      expect(validateCPF('12345678900')).toBe(false);
    });

    it('deve rejeitar CPF com todos zeros', () => {
      expect(validateCPF('00000000000')).toBe(false);
    });

    it('deve rejeitar CPF com todos uns', () => {
      expect(validateCPF('11111111111')).toBe(false);
    });

    it('deve rejeitar CPF com todos dois', () => {
      expect(validateCPF('22222222222')).toBe(false);
    });

    it('deve rejeitar CPF com todos três', () => {
      expect(validateCPF('33333333333')).toBe(false);
    });

    it('deve rejeitar CPF com todos quatro', () => {
      expect(validateCPF('44444444444')).toBe(false);
    });

    it('deve rejeitar CPF com todos cinco', () => {
      expect(validateCPF('55555555555')).toBe(false);
    });

    it('deve rejeitar CPF com todos seis', () => {
      expect(validateCPF('66666666666')).toBe(false);
    });

    it('deve rejeitar CPF com todos sete', () => {
      expect(validateCPF('77777777777')).toBe(false);
    });

    it('deve rejeitar CPF com todos oito', () => {
      expect(validateCPF('88888888888')).toBe(false);
    });

    it('deve rejeitar CPF com todos nove', () => {
      expect(validateCPF('99999999999')).toBe(false);
    });

    it('deve rejeitar CPF com comprimento menor que 11', () => {
      expect(validateCPF('1234567890')).toBe(false);
    });

    it('deve rejeitar CPF com comprimento maior que 11', () => {
      expect(validateCPF('123456789012')).toBe(false);
    });

    it('deve rejeitar CPF vazio', () => {
      expect(validateCPF('')).toBe(false);
    });

    it('deve rejeitar CPF null', () => {
      expect(validateCPF(null)).toBe(false);
    });

    it('deve rejeitar CPF undefined', () => {
      expect(validateCPF(undefined)).toBe(false);
    });

    it('deve rejeitar CPF com caracteres não numéricos', () => {
      expect(validateCPF('111.444.777-35')).toBe(false);
    });

    it('deve rejeitar CPF com letras', () => {
      expect(validateCPF('1114447773A')).toBe(false);
    });

    it('deve rejeitar CPF com DV1 incorreto', () => {
      expect(validateCPF('11144477745')).toBe(false);
    });

    it('deve rejeitar CPF com DV2 incorreto', () => {
      expect(validateCPF('11144477736')).toBe(false);
    });
  });

  describe('validateCNPJ', () => {
    // CNPJs válidos (calculados com dígitos verificadores corretos)
    it('deve validar CNPJ válido: 11222333000181', () => {
      expect(validateCNPJ('11222333000181')).toBe(true);
    });

    it('deve validar CNPJ válido: 34028316000103', () => {
      expect(validateCNPJ('34028316000103')).toBe(true);
    });

    it('deve validar CNPJ válido: 06990590000123', () => {
      expect(validateCNPJ('06990590000123')).toBe(true);
    });

    it('deve validar CNPJ válido: 11444777000161', () => {
      expect(validateCNPJ('11444777000161')).toBe(true);
    });

    it('deve validar CNPJ válido: 00000000000191', () => {
      expect(validateCNPJ('00000000000191')).toBe(true);
    });

    // CNPJs inválidos
    it('deve rejeitar CNPJ inválido: 12345678000190', () => {
      expect(validateCNPJ('12345678000190')).toBe(false);
    });

    it('deve rejeitar CNPJ com todos zeros', () => {
      expect(validateCNPJ('00000000000000')).toBe(false);
    });

    it('deve rejeitar CNPJ com todos uns', () => {
      expect(validateCNPJ('11111111111111')).toBe(false);
    });

    it('deve rejeitar CNPJ com todos dois', () => {
      expect(validateCNPJ('22222222222222')).toBe(false);
    });

    it('deve rejeitar CNPJ com todos três', () => {
      expect(validateCNPJ('33333333333333')).toBe(false);
    });

    it('deve rejeitar CNPJ com todos quatro', () => {
      expect(validateCNPJ('44444444444444')).toBe(false);
    });

    it('deve rejeitar CNPJ com todos cinco', () => {
      expect(validateCNPJ('55555555555555')).toBe(false);
    });

    it('deve rejeitar CNPJ com todos seis', () => {
      expect(validateCNPJ('66666666666666')).toBe(false);
    });

    it('deve rejeitar CNPJ com todos sete', () => {
      expect(validateCNPJ('77777777777777')).toBe(false);
    });

    it('deve rejeitar CNPJ com todos oito', () => {
      expect(validateCNPJ('88888888888888')).toBe(false);
    });

    it('deve rejeitar CNPJ com todos nove', () => {
      expect(validateCNPJ('99999999999999')).toBe(false);
    });

    it('deve rejeitar CNPJ com comprimento menor que 14', () => {
      expect(validateCNPJ('1122233300018')).toBe(false);
    });

    it('deve rejeitar CNPJ com comprimento maior que 14', () => {
      expect(validateCNPJ('112223330001811')).toBe(false);
    });

    it('deve rejeitar CNPJ vazio', () => {
      expect(validateCNPJ('')).toBe(false);
    });

    it('deve rejeitar CNPJ null', () => {
      expect(validateCNPJ(null)).toBe(false);
    });

    it('deve rejeitar CNPJ undefined', () => {
      expect(validateCNPJ(undefined)).toBe(false);
    });

    it('deve rejeitar CNPJ com caracteres não numéricos', () => {
      expect(validateCNPJ('11.222.333/0001-81')).toBe(false);
    });

    it('deve rejeitar CNPJ com letras', () => {
      expect(validateCNPJ('1122233300018A')).toBe(false);
    });

    it('deve rejeitar CNPJ com DV1 incorreto', () => {
      expect(validateCNPJ('11222333000191')).toBe(false);
    });

    it('deve rejeitar CNPJ com DV2 incorreto', () => {
      expect(validateCNPJ('11222333000182')).toBe(false);
    });
  });

  describe('validateCPFOrCNPJ', () => {
    // CPFs válidos
    it('deve validar CPF válido normalizado', () => {
      expect(validateCPFOrCNPJ('11144477735')).toBe(true);
    });

    it('deve validar CPF válido formatado', () => {
      expect(validateCPFOrCNPJ('111.444.777-35')).toBe(true);
    });

    it('deve validar CPF válido: 52998224725', () => {
      expect(validateCPFOrCNPJ('52998224725')).toBe(true);
    });

    // CNPJs válidos
    it('deve validar CNPJ válido normalizado', () => {
      expect(validateCPFOrCNPJ('11222333000181')).toBe(true);
    });

    it('deve validar CNPJ válido formatado', () => {
      expect(validateCPFOrCNPJ('11.222.333/0001-81')).toBe(true);
    });

    it('deve validar CNPJ válido: 34028316000103', () => {
      expect(validateCPFOrCNPJ('34028316000103')).toBe(true);
    });

    // Valores opcionais (aceitam null/undefined)
    it('deve aceitar null (opcional)', () => {
      expect(validateCPFOrCNPJ(null)).toBe(true);
    });

    it('deve aceitar undefined (opcional)', () => {
      expect(validateCPFOrCNPJ(undefined)).toBe(true);
    });

    it('deve aceitar string vazia (opcional)', () => {
      expect(validateCPFOrCNPJ('')).toBe(true);
    });

    it('deve aceitar string com apenas espaços (opcional)', () => {
      expect(validateCPFOrCNPJ('   ')).toBe(true);
    });

    // Valores inválidos
    it('deve rejeitar CPF inválido', () => {
      expect(validateCPFOrCNPJ('12345678900')).toBe(false);
    });

    it('deve rejeitar CNPJ inválido', () => {
      expect(validateCPFOrCNPJ('12345678000190')).toBe(false);
    });

    it('deve rejeitar comprimento inválido (12 dígitos)', () => {
      expect(validateCPFOrCNPJ('123456789012')).toBe(false);
    });

    it('deve rejeitar comprimento inválido (10 dígitos)', () => {
      expect(validateCPFOrCNPJ('1234567890')).toBe(false);
    });

    it('deve rejeitar comprimento inválido (15 dígitos)', () => {
      expect(validateCPFOrCNPJ('123456789012345')).toBe(false);
    });

    it('deve rejeitar CPF com todos zeros', () => {
      expect(validateCPFOrCNPJ('00000000000')).toBe(false);
    });

    it('deve rejeitar CNPJ com todos zeros', () => {
      expect(validateCPFOrCNPJ('00000000000000')).toBe(false);
    });
  });
});
