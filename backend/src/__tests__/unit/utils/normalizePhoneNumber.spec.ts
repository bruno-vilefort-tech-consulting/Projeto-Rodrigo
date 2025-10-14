import { normalizePhoneNumber } from '../../../utils/normalizePhoneNumber';

describe('normalizePhoneNumber', () => {
  describe('Brazilian numbers (BR)', () => {
    it('should normalize number with country code and parentheses', () => {
      const result = normalizePhoneNumber('+55 (11) 99999-9999');
      expect(result).toBe('+5511999999999');
    });

    it('should normalize number without country code', () => {
      const result = normalizePhoneNumber('11 99999-9999');
      expect(result).toBe('+5511999999999');
    });

    it('should normalize number with spaces and hyphens', () => {
      const result = normalizePhoneNumber('11 9 9999-9999');
      expect(result).toBe('+5511999999999');
    });

    it('should normalize number with only digits (11 digits)', () => {
      const result = normalizePhoneNumber('11999999999');
      expect(result).toBe('+5511999999999');
    });

    it('should normalize number with country code 55 without +', () => {
      const result = normalizePhoneNumber('5511999999999');
      expect(result).toBe('+5511999999999');
    });

    it('should normalize landline number (10 digits)', () => {
      const result = normalizePhoneNumber('1133334444');
      expect(result).toBe('+551133334444');
    });

    it('should normalize number with special characters', () => {
      const result = normalizePhoneNumber('+55 (21) 98765-4321');
      expect(result).toBe('+5521987654321');
    });
  });

  describe('International numbers', () => {
    it('should normalize US number', () => {
      const result = normalizePhoneNumber('+1 (555) 123-4567', 'US');
      expect(result).toBe('+15551234567');
    });

    it('should normalize UK number', () => {
      const result = normalizePhoneNumber('+44 20 7946 0958', 'GB');
      expect(result).toBe('+442079460958');
    });

    it('should normalize Argentina number', () => {
      const result = normalizePhoneNumber('+54 9 11 1234-5678', 'AR');
      expect(result).toBe('+5491112345678');
    });
  });

  describe('Edge cases', () => {
    it('should return null for empty string', () => {
      const result = normalizePhoneNumber('');
      expect(result).toBeNull();
    });

    it('should return null for null input', () => {
      const result = normalizePhoneNumber(null as any);
      expect(result).toBeNull();
    });

    it('should return null for invalid number (too short)', () => {
      const result = normalizePhoneNumber('123');
      expect(result).toBeNull();
    });

    it('should return null for invalid characters only', () => {
      const result = normalizePhoneNumber('abc-def-ghij');
      expect(result).toBeNull();
    });

    it('should handle number with only + sign', () => {
      const result = normalizePhoneNumber('+');
      expect(result).toBeNull();
    });

    it('should normalize number with extra spaces', () => {
      const result = normalizePhoneNumber('  11  99999  9999  ');
      expect(result).toBe('+5511999999999');
    });

    it('should normalize number with dots as separators', () => {
      const result = normalizePhoneNumber('11.99999.9999');
      expect(result).toBe('+5511999999999');
    });
  });

  describe('Duplicate detection scenarios', () => {
    it('should normalize different formats to same E.164', () => {
      const formats = [
        '+55 11 99999-9999',
        '(11) 99999-9999',
        '11 99999 9999',
        '5511999999999',
        '+5511999999999'
      ];

      const results = formats.map(f => normalizePhoneNumber(f));
      const unique = new Set(results);

      expect(unique.size).toBe(1);
      expect(Array.from(unique)[0]).toBe('+5511999999999');
    });
  });

  describe('WhatsApp roster format', () => {
    it('should normalize number from WhatsApp roster format (without @s.whatsapp.net)', () => {
      const result = normalizePhoneNumber('5511999999999');
      expect(result).toBe('+5511999999999');
    });

    it('should handle number with country code already normalized', () => {
      const result = normalizePhoneNumber('+5511999999999');
      expect(result).toBe('+5511999999999');
    });
  });

  describe('Excel import format', () => {
    it('should normalize number from Excel with formatting', () => {
      const result = normalizePhoneNumber('(011) 99999-9999');
      expect(result).toBe('+5511999999999');
    });

    it('should normalize number from Excel with leading zero', () => {
      const result = normalizePhoneNumber('011999999999');
      expect(result).toBe('+5511999999999');
    });
  });

  describe('Performance', () => {
    it('should normalize 1000 numbers in less than 1 second', () => {
      const start = Date.now();

      for (let i = 0; i < 1000; i++) {
        normalizePhoneNumber('11999999999');
      }

      const duration = Date.now() - start;
      expect(duration).toBeLessThan(1000);
    });
  });
});
