/**
 * Testes unitários para DocumentValidator
 *
 * Valida os algoritmos de normalização e validação de CPF/CNPJ
 * conforme especificações da Receita Federal.
 */

import {
  normalizeDocument,
  validateCPF,
  validateCNPJ,
  validateCPFOrCNPJ
} from '../DocumentValidator';

describe('DocumentValidator', () => {
  describe('normalizeDocument', () => {
    it('deve remover pontuação de CPF formatado', () => {
      expect(normalizeDocument('123.456.789-09')).toBe('12345678909');
    });

    it('deve remover pontuação de CNPJ formatado', () => {
      expect(normalizeDocument('11.222.333/0001-81')).toBe('11222333000181');
    });

    it('deve remover espaços de documento', () => {
      expect(normalizeDocument('123 456 789 09')).toBe('12345678909');
    });

    it('deve converter string vazia para null', () => {
      expect(normalizeDocument('')).toBeNull();
    });

    it('deve converter espaços em branco para null', () => {
      expect(normalizeDocument('   ')).toBeNull();
    });

    it('deve converter undefined para null', () => {
      expect(normalizeDocument(undefined)).toBeNull();
    });

    it('deve converter null para null', () => {
      expect(normalizeDocument(null)).toBeNull();
    });

    it('deve fazer trim de espaços antes e depois', () => {
      expect(normalizeDocument('  123.456.789-09  ')).toBe('12345678909');
    });

    it('deve ser idempotente (normalizar 2x = 1x)', () => {
      const once = normalizeDocument('123.456.789-09');
      const twice = normalizeDocument(once!);
      expect(once).toBe(twice);
    });

    it('deve remover todos os caracteres especiais (. - / espaços)', () => {
      expect(normalizeDocument('12.345.678/0001-90')).toBe('12345678000190');
    });
  });

  describe('validateCPF', () => {
    // CPFs VÁLIDOS (calculados com algoritmo correto)
    it('deve validar CPF válido: 11144477735', () => {
      expect(validateCPF('11144477735')).toBe(true);
    });

    it('deve validar CPF válido: 12345678909', () => {
      expect(validateCPF('12345678909')).toBe(true);
    });

    it('deve validar CPF válido: 00000000191', () => {
      expect(validateCPF('00000000191')).toBe(true);
    });

    it('deve validar CPF válido: 52998224725', () => {
      expect(validateCPF('52998224725')).toBe(true);
    });

    // CPFs INVÁLIDOS - Dígito verificador errado
    it('deve rejeitar CPF inválido: 12345678900', () => {
      expect(validateCPF('12345678900')).toBe(false);
    });

    it('deve rejeitar CPF inválido: 11144477734', () => {
      expect(validateCPF('11144477734')).toBe(false);
    });

    // CPFs INVÁLIDOS - Sequências repetidas
    it('deve rejeitar CPF com todos zeros: 00000000000', () => {
      expect(validateCPF('00000000000')).toBe(false);
    });

    it('deve rejeitar CPF com sequência repetida: 11111111111', () => {
      expect(validateCPF('11111111111')).toBe(false);
    });

    it('deve rejeitar CPF com sequência repetida: 22222222222', () => {
      expect(validateCPF('22222222222')).toBe(false);
    });

    it('deve rejeitar CPF com sequência repetida: 99999999999', () => {
      expect(validateCPF('99999999999')).toBe(false);
    });

    // CPFs INVÁLIDOS - Comprimento inválido
    it('deve rejeitar CPF com comprimento menor: 123', () => {
      expect(validateCPF('123')).toBe(false);
    });

    it('deve rejeitar CPF com comprimento maior: 123456789090', () => {
      expect(validateCPF('123456789090')).toBe(false);
    });

    it('deve rejeitar CPF vazio', () => {
      expect(validateCPF('')).toBe(false);
    });

    // CPF com formatação (deve funcionar após normalização interna)
    it('deve validar CPF formatado após normalização interna: 111.444.777-35', () => {
      expect(validateCPF('111.444.777-35')).toBe(true);
    });
  });

  describe('validateCNPJ', () => {
    // CNPJs VÁLIDOS (calculados com algoritmo correto)
    it('deve validar CNPJ válido: 11222333000181', () => {
      expect(validateCNPJ('11222333000181')).toBe(true);
    });

    it('deve validar CNPJ válido: 11444777000161', () => {
      expect(validateCNPJ('11444777000161')).toBe(true);
    });

    it('deve validar CNPJ válido: 00000000000191', () => {
      expect(validateCNPJ('00000000000191')).toBe(true);
    });

    it('deve validar CNPJ válido: 34028316000103', () => {
      expect(validateCNPJ('34028316000103')).toBe(true);
    });

    // CNPJs INVÁLIDOS - Dígito verificador errado
    it('deve rejeitar CNPJ inválido: 11222333000180', () => {
      expect(validateCNPJ('11222333000180')).toBe(false);
    });

    it('deve rejeitar CNPJ inválido: 12345678000190', () => {
      expect(validateCNPJ('12345678000190')).toBe(false);
    });

    // CNPJs INVÁLIDOS - Sequências repetidas
    it('deve rejeitar CNPJ com todos zeros: 00000000000000', () => {
      expect(validateCNPJ('00000000000000')).toBe(false);
    });

    it('deve rejeitar CNPJ com sequência repetida: 11111111111111', () => {
      expect(validateCNPJ('11111111111111')).toBe(false);
    });

    it('deve rejeitar CNPJ com sequência repetida: 99999999999999', () => {
      expect(validateCNPJ('99999999999999')).toBe(false);
    });

    // CNPJs INVÁLIDOS - Comprimento inválido
    it('deve rejeitar CNPJ com comprimento menor: 123', () => {
      expect(validateCNPJ('123')).toBe(false);
    });

    it('deve rejeitar CNPJ com comprimento maior: 112223330001811', () => {
      expect(validateCNPJ('112223330001811')).toBe(false);
    });

    it('deve rejeitar CNPJ vazio', () => {
      expect(validateCNPJ('')).toBe(false);
    });

    // CNPJ com formatação (deve funcionar após normalização interna)
    it('deve validar CNPJ formatado após normalização interna: 11.222.333/0001-81', () => {
      expect(validateCNPJ('11.222.333/0001-81')).toBe(true);
    });
  });

  describe('validateCPFOrCNPJ', () => {
    // CPFs VÁLIDOS (11 dígitos)
    it('deve validar CPF válido: 11144477735', () => {
      expect(validateCPFOrCNPJ('11144477735')).toBe(true);
    });

    it('deve validar CPF válido: 12345678909', () => {
      expect(validateCPFOrCNPJ('12345678909')).toBe(true);
    });

    it('deve validar CPF válido: 52998224725', () => {
      expect(validateCPFOrCNPJ('52998224725')).toBe(true);
    });

    // CNPJs VÁLIDOS (14 dígitos)
    it('deve validar CNPJ válido: 11222333000181', () => {
      expect(validateCPFOrCNPJ('11222333000181')).toBe(true);
    });

    it('deve validar CNPJ válido: 11444777000161', () => {
      expect(validateCPFOrCNPJ('11444777000161')).toBe(true);
    });

    it('deve validar CNPJ válido: 34028316000103', () => {
      expect(validateCPFOrCNPJ('34028316000103')).toBe(true);
    });

    // Documentos INVÁLIDOS
    it('deve rejeitar CPF inválido: 12345678900', () => {
      expect(validateCPFOrCNPJ('12345678900')).toBe(false);
    });

    it('deve rejeitar CNPJ inválido: 11222333000180', () => {
      expect(validateCPFOrCNPJ('11222333000180')).toBe(false);
    });

    it('deve rejeitar CPF com sequência repetida: 11111111111', () => {
      expect(validateCPFOrCNPJ('11111111111')).toBe(false);
    });

    it('deve rejeitar CNPJ com sequência repetida: 00000000000000', () => {
      expect(validateCPFOrCNPJ('00000000000000')).toBe(false);
    });

    // Campo opcional (null, undefined, vazio)
    it('deve aceitar null (campo opcional)', () => {
      expect(validateCPFOrCNPJ(null)).toBe(true);
    });

    it('deve aceitar undefined (campo opcional)', () => {
      expect(validateCPFOrCNPJ(undefined)).toBe(true);
    });

    it('deve aceitar string vazia (campo opcional)', () => {
      expect(validateCPFOrCNPJ('')).toBe(true);
    });

    it('deve aceitar espaços em branco (campo opcional)', () => {
      expect(validateCPFOrCNPJ('   ')).toBe(true);
    });

    // Comprimento inválido (não é CPF nem CNPJ)
    it('deve rejeitar documento com comprimento inválido: 123', () => {
      expect(validateCPFOrCNPJ('123')).toBe(false);
    });

    it('deve rejeitar documento com 12 dígitos (não é CPF nem CNPJ)', () => {
      expect(validateCPFOrCNPJ('123456789012')).toBe(false);
    });

    it('deve rejeitar documento com 13 dígitos (não é CPF nem CNPJ)', () => {
      expect(validateCPFOrCNPJ('1234567890123')).toBe(false);
    });

    // Documentos formatados (normalização defensiva)
    it('deve validar CPF formatado: 111.444.777-35', () => {
      expect(validateCPFOrCNPJ('111.444.777-35')).toBe(true);
    });

    it('deve validar CNPJ formatado: 11.222.333/0001-81', () => {
      expect(validateCPFOrCNPJ('11.222.333/0001-81')).toBe(true);
    });

    // Edge cases
    it('deve validar CPF edge case: 00000000191', () => {
      expect(validateCPFOrCNPJ('00000000191')).toBe(true);
    });

    it('deve validar CNPJ edge case: 00000000000191', () => {
      expect(validateCPFOrCNPJ('00000000000191')).toBe(true);
    });
  });

  describe('Integração: normalizeDocument + validateCPFOrCNPJ', () => {
    it('deve normalizar e validar CPF formatado', () => {
      const normalized = normalizeDocument('111.444.777-35');
      expect(normalized).toBe('11144477735');
      expect(validateCPFOrCNPJ(normalized)).toBe(true);
    });

    it('deve normalizar e validar CNPJ formatado', () => {
      const normalized = normalizeDocument('11.222.333/0001-81');
      expect(normalized).toBe('11222333000181');
      expect(validateCPFOrCNPJ(normalized)).toBe(true);
    });

    it('deve normalizar string vazia e validar como opcional', () => {
      const normalized = normalizeDocument('');
      expect(normalized).toBeNull();
      expect(validateCPFOrCNPJ(normalized)).toBe(true);
    });

    it('deve normalizar espaços e validar como opcional', () => {
      const normalized = normalizeDocument('   ');
      expect(normalized).toBeNull();
      expect(validateCPFOrCNPJ(normalized)).toBe(true);
    });
  });
});
