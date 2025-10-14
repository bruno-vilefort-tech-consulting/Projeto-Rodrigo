/**
 * Testes unitários para documentFormatter.js
 */

import {
  formatCPF,
  formatCNPJ,
  formatDocument,
  getDocumentMask
} from '../../utils/documentFormatter';

// Mock do i18n para testes
jest.mock('../../translate/i18n', () => ({
  i18n: {
    t: (key) => {
      const translations = {
        'compaies.form.documentNotProvided': 'Não informado'
      };
      return translations[key] || key;
    }
  }
}));

describe('documentFormatter', () => {
  describe('formatCPF', () => {
    it('deve formatar CPF corretamente: 11144477735', () => {
      expect(formatCPF('11144477735')).toBe('111.444.777-35');
    });

    it('deve formatar CPF corretamente: 52998224725', () => {
      expect(formatCPF('52998224725')).toBe('529.982.247-25');
    });

    it('deve formatar CPF corretamente: 00000000000', () => {
      expect(formatCPF('00000000000')).toBe('000.000.000-00');
    });

    it('deve retornar o valor original se comprimento diferente de 11', () => {
      expect(formatCPF('1234567890')).toBe('1234567890');
    });

    it('deve retornar o valor original se comprimento maior que 11', () => {
      expect(formatCPF('123456789012')).toBe('123456789012');
    });

    it('deve retornar null para entrada null', () => {
      expect(formatCPF(null)).toBe(null);
    });

    it('deve retornar undefined para entrada undefined', () => {
      expect(formatCPF(undefined)).toBe(undefined);
    });

    it('deve retornar string vazia para entrada vazia', () => {
      expect(formatCPF('')).toBe('');
    });
  });

  describe('formatCNPJ', () => {
    it('deve formatar CNPJ corretamente: 11222333000181', () => {
      expect(formatCNPJ('11222333000181')).toBe('11.222.333/0001-81');
    });

    it('deve formatar CNPJ corretamente: 34028316000103', () => {
      expect(formatCNPJ('34028316000103')).toBe('34.028.316/0001-03');
    });

    it('deve formatar CNPJ corretamente: 00000000000000', () => {
      expect(formatCNPJ('00000000000000')).toBe('00.000.000/0000-00');
    });

    it('deve retornar o valor original se comprimento diferente de 14', () => {
      expect(formatCNPJ('1122233300018')).toBe('1122233300018');
    });

    it('deve retornar o valor original se comprimento maior que 14', () => {
      expect(formatCNPJ('112223330001811')).toBe('112223330001811');
    });

    it('deve retornar null para entrada null', () => {
      expect(formatCNPJ(null)).toBe(null);
    });

    it('deve retornar undefined para entrada undefined', () => {
      expect(formatCNPJ(undefined)).toBe(undefined);
    });

    it('deve retornar string vazia para entrada vazia', () => {
      expect(formatCNPJ('')).toBe('');
    });
  });

  describe('formatDocument', () => {
    it('deve formatar CPF automaticamente', () => {
      expect(formatDocument('11144477735')).toBe('111.444.777-35');
    });

    it('deve formatar CNPJ automaticamente', () => {
      expect(formatDocument('11222333000181')).toBe('11.222.333/0001-81');
    });

    it('deve retornar "Não informado" para null', () => {
      expect(formatDocument(null)).toBe('Não informado');
    });

    it('deve retornar "Não informado" para undefined', () => {
      expect(formatDocument(undefined)).toBe('Não informado');
    });

    it('deve retornar "Não informado" para string vazia', () => {
      expect(formatDocument('')).toBe('Não informado');
    });

    it('deve retornar documento sem formatação se comprimento inválido', () => {
      expect(formatDocument('123456')).toBe('123456');
    });

    it('deve formatar CPF já formatado (normalizar primeiro)', () => {
      // Nota: Esta função espera entrada normalizada
      // Se receber formatado, normaliza primeiro
      expect(formatDocument('111.444.777-35')).toBe('111.444.777-35');
    });

    it('deve formatar CNPJ já formatado (normalizar primeiro)', () => {
      // Nota: Esta função espera entrada normalizada
      // Se receber formatado, normaliza primeiro
      expect(formatDocument('11.222.333/0001-81')).toBe('11.222.333/0001-81');
    });
  });

  describe('getDocumentMask', () => {
    it('deve retornar máscara CPF para valores vazios (default)', () => {
      expect(getDocumentMask('')).toBe('999.999.999-99');
    });

    it('deve retornar máscara CPF para undefined (default)', () => {
      expect(getDocumentMask(undefined)).toBe('999.999.999-99');
    });

    it('deve retornar máscara CPF para null (default)', () => {
      expect(getDocumentMask(null)).toBe('999.999.999-99');
    });

    it('deve retornar máscara CPF para valores com 1-11 dígitos', () => {
      expect(getDocumentMask('1')).toBe('999.999.999-99');
      expect(getDocumentMask('12')).toBe('999.999.999-99');
      expect(getDocumentMask('123')).toBe('999.999.999-99');
      expect(getDocumentMask('12345678901')).toBe('999.999.999-99');
    });

    it('deve retornar máscara CPF para valores formatados com 1-11 dígitos', () => {
      expect(getDocumentMask('111.444')).toBe('999.999.999-99');
      expect(getDocumentMask('111.444.777-3')).toBe('999.999.999-99');
    });

    it('deve retornar máscara CNPJ para valores com 12+ dígitos', () => {
      expect(getDocumentMask('123456789012')).toBe('99.999.999/9999-99');
      expect(getDocumentMask('1234567890123')).toBe('99.999.999/9999-99');
      expect(getDocumentMask('12345678901234')).toBe('99.999.999/9999-99');
    });

    it('deve retornar máscara CNPJ para valores formatados com 12+ dígitos', () => {
      // '11.222.333/00' = 11 dígitos -> CPF
      expect(getDocumentMask('11.222.333/00')).toBe('999.999.999-99');
      // '11.222.333/0001-8' = 13 dígitos -> CNPJ
      expect(getDocumentMask('11.222.333/0001-8')).toBe('99.999.999/9999-99');
    });

    it('deve transicionar de CPF para CNPJ no 12º dígito', () => {
      // 11 dígitos: CPF
      expect(getDocumentMask('12345678901')).toBe('999.999.999-99');
      // 12 dígitos: CNPJ
      expect(getDocumentMask('123456789012')).toBe('99.999.999/9999-99');
    });

    it('deve ignorar caracteres não numéricos na contagem', () => {
      expect(getDocumentMask('111.444.777-')).toBe('999.999.999-99'); // 9 dígitos = CPF
      expect(getDocumentMask('11.222.333/0001-')).toBe('99.999.999/9999-99'); // 12 dígitos = CNPJ
    });
  });
});
