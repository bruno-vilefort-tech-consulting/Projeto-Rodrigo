import {
  getCurrency,
  updateCurrency,
  formatCurrency,
  getSupportedCurrencies,
  getCurrencySymbol,
  getCurrencyCode,
  getCurrencyLocale,
  SUPPORTED_CURRENCIES,
  __resetCacheForTesting
} from "../CurrencyService";
import Setting from "../../models/Setting";
import AppError from "../../errors/AppError";

// Mock dos modelos
jest.mock("../../models/Setting");
jest.mock("../../models/User", () => ({
  __esModule: true,
  default: {
    findByPk: jest.fn()
  }
}));

const MockSetting = Setting as jest.Mocked<typeof Setting>;

// Mock do setTimeout para testes de cache
jest.useFakeTimers();

describe("CurrencyService", () => {
  beforeEach(() => {
    // Limpar mocks antes de cada teste
    jest.clearAllMocks();
    jest.clearAllTimers();

    // Reset do cache interno do módulo
    __resetCacheForTesting();
  });

  afterEach(() => {
    jest.clearAllTimers();
  });

  describe("getCurrency", () => {
    it("deve retornar BRL como padrão quando não há configuração", async () => {
      MockSetting.findOne.mockResolvedValue(null);

      const result = await getCurrency();

      expect(result).toEqual(SUPPORTED_CURRENCIES.BRL);
      expect(MockSetting.findOne).toHaveBeenCalledWith({
        where: { key: 'systemCurrency' }
      });
    });

    it("deve retornar moeda configurada quando existe", async () => {
      const mockSetting = {
        value: JSON.stringify(SUPPORTED_CURRENCIES.USD)
      };
      MockSetting.findOne.mockResolvedValue(mockSetting as any);

      const result = await getCurrency();

      expect(result).toEqual(SUPPORTED_CURRENCIES.USD);
    });

    it("deve usar BRL como fallback quando JSON é inválido", async () => {
      const mockSetting = {
        value: "json_inválido"
      };
      MockSetting.findOne.mockResolvedValue(mockSetting as any);

      // Mock do console.warn para não poluir os logs de teste
      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

      const result = await getCurrency();

      expect(result).toEqual(SUPPORTED_CURRENCIES.BRL);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Erro ao fazer parse da configuração de moeda')
      );

      consoleSpy.mockRestore();
    });

    it("deve usar BRL como fallback quando moeda não é mais suportada", async () => {
      const mockSetting = {
        value: JSON.stringify({ code: 'INVALID', symbol: '?', locale: 'xx-XX' })
      };
      MockSetting.findOne.mockResolvedValue(mockSetting as any);

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

      const result = await getCurrency();

      expect(result).toEqual(SUPPORTED_CURRENCIES.BRL);
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('Moeda INVALID não é mais suportada')
      );

      consoleSpy.mockRestore();
    });

    it("deve usar cache quando válido", async () => {
      // Primeira chamada para popular o cache
      MockSetting.findOne.mockResolvedValue({
        value: JSON.stringify(SUPPORTED_CURRENCIES.EUR)
      } as any);

      const result1 = await getCurrency();
      expect(result1).toEqual(SUPPORTED_CURRENCIES.EUR);
      expect(MockSetting.findOne).toHaveBeenCalledTimes(1);

      // Segunda chamada deve usar cache
      const result2 = await getCurrency();
      expect(result2).toEqual(SUPPORTED_CURRENCIES.EUR);
      expect(MockSetting.findOne).toHaveBeenCalledTimes(1); // Não deve chamar novamente
    });

    it("deve revalidar cache após expiração", async () => {
      // Primeira chamada
      MockSetting.findOne.mockResolvedValue({
        value: JSON.stringify(SUPPORTED_CURRENCIES.EUR)
      } as any);

      await getCurrency();
      expect(MockSetting.findOne).toHaveBeenCalledTimes(1);

      // Avançar tempo para expirar cache (5 minutos + 1ms)
      jest.advanceTimersByTime(5 * 60 * 1000 + 1);

      // Segunda chamada deve revalidar
      await getCurrency();
      expect(MockSetting.findOne).toHaveBeenCalledTimes(2);
    });

    it("deve retornar BRL em caso de erro no banco", async () => {
      MockSetting.findOne.mockRejectedValue(new Error("Erro de conexão"));

      const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

      const result = await getCurrency();

      expect(result).toEqual(SUPPORTED_CURRENCIES.BRL);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Erro ao buscar configuração de moeda:',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe("updateCurrency", () => {
    it("deve permitir atualização por super-admin", async () => {
      // Mock do User model
      const mockUser = { super: true };
      const UserModel = require("../../models/User").default;
      UserModel.findByPk.mockResolvedValue(mockUser);

      const mockSetting = {
        update: jest.fn().mockResolvedValue(true)
      } as any;
      MockSetting.findOrCreate.mockResolvedValue([mockSetting, true] as any);

      const currencyData = SUPPORTED_CURRENCIES.USD;
      const result = await updateCurrency({
        currencyData,
        userId: "user123"
      });

      expect(UserModel.findByPk).toHaveBeenCalledWith("user123");
      expect(MockSetting.findOrCreate).toHaveBeenCalledWith({
        where: { key: 'systemCurrency' },
        defaults: {
          key: 'systemCurrency',
          value: JSON.stringify(currencyData),
          companyId: null
        }
      });
      expect(mockSetting.update).toHaveBeenCalledWith({
        value: JSON.stringify(currencyData)
      });
      expect(result).toBe(mockSetting);
    });

    it("deve rejeitar atualização por usuário não super-admin", async () => {
      const mockUser = { super: false };
      const UserModel = require("../../models/User").default;
      UserModel.findByPk.mockResolvedValue(mockUser);

      const currencyData = SUPPORTED_CURRENCIES.USD;

      await expect(updateCurrency({
        currencyData,
        userId: "user123"
      })).rejects.toThrow(AppError);

      expect(MockSetting.findOrCreate).not.toHaveBeenCalled();
    });

    it("deve rejeitar atualização por usuário inexistente", async () => {
      const UserModel = require("../../models/User").default;
      UserModel.findByPk.mockResolvedValue(null);

      const currencyData = SUPPORTED_CURRENCIES.USD;

      await expect(updateCurrency({
        currencyData,
        userId: "user123"
      })).rejects.toThrow(AppError);

      expect(MockSetting.findOrCreate).not.toHaveBeenCalled();
    });

    it("deve rejeitar moeda não suportada", async () => {
      const mockUser = { super: true };
      const UserModel = require("../../models/User").default;
      UserModel.findByPk.mockResolvedValue(mockUser);

      const invalidCurrencyData = { code: 'INVALID', symbol: '?', locale: 'xx-XX' };

      await expect(updateCurrency({
        currencyData: invalidCurrencyData as any,
        userId: "user123"
      })).rejects.toThrow(AppError);

      expect(MockSetting.findOrCreate).not.toHaveBeenCalled();
    });

    it("deve limpar cache após atualização", async () => {
      const mockUser = { super: true };
      const UserModel = require("../../models/User").default;
      UserModel.findByPk.mockResolvedValue(mockUser);

      const mockSetting = {
        update: jest.fn().mockResolvedValue(true)
      } as any;
      MockSetting.findOrCreate.mockResolvedValue([mockSetting, true] as any);

      // Popular cache primeiro
      MockSetting.findOne.mockResolvedValue({
        value: JSON.stringify(SUPPORTED_CURRENCIES.BRL)
      } as any);
      await getCurrency();
      expect(MockSetting.findOne).toHaveBeenCalledTimes(1);

      // Atualizar moeda
      const currencyData = SUPPORTED_CURRENCIES.USD;
      await updateCurrency({
        currencyData,
        userId: "user123"
      });

      // Próxima chamada deve revalidar cache
      MockSetting.findOne.mockResolvedValue({
        value: JSON.stringify(SUPPORTED_CURRENCIES.USD)
      } as any);
      await getCurrency();
      expect(MockSetting.findOne).toHaveBeenCalledTimes(2);
    });
  });

  describe("formatCurrency", () => {
    it("deve formatar valor com moeda padrão", async () => {
      MockSetting.findOne.mockResolvedValue({
        value: JSON.stringify(SUPPORTED_CURRENCIES.BRL)
      } as any);

      const result = await formatCurrency(1234.56);

      expect(result).toBe("R$ 1.234,56");
    });

    it("deve formatar valor com moeda específica", async () => {
      const result = await formatCurrency(1234.56, SUPPORTED_CURRENCIES.USD);

      expect(result).toBe("$1,234.56");
    });

    it("deve usar fallback manual se Intl.NumberFormat falhar", async () => {
      // Mock do Intl.NumberFormat para simular falha
      const originalIntl = global.Intl;
      global.Intl = {
        ...originalIntl,
        NumberFormat: jest.fn(() => {
          throw new Error("Intl error");
        })
      } as any;

      const consoleSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});

      const result = await formatCurrency(1234.56, SUPPORTED_CURRENCIES.USD);

      expect(result).toBe("$ 1234.56");
      expect(consoleSpy).toHaveBeenCalledWith(
        'Erro na formatação da moeda, usando fallback:',
        expect.any(Error)
      );

      // Restore
      global.Intl = originalIntl;
      consoleSpy.mockRestore();
    });
  });

  describe("getSupportedCurrencies", () => {
    it("deve retornar lista de moedas suportadas", () => {
      const result = getSupportedCurrencies();

      expect(result).toEqual(Object.values(SUPPORTED_CURRENCIES));
      expect(result).toHaveLength(10); // Baseado nas moedas definidas no plano
      expect(result).toContainEqual(SUPPORTED_CURRENCIES.BRL);
      expect(result).toContainEqual(SUPPORTED_CURRENCIES.USD);
      expect(result).toContainEqual(SUPPORTED_CURRENCIES.EUR);
    });

    it("deve retornar array imutável", () => {
      const result1 = getSupportedCurrencies();
      const result2 = getSupportedCurrencies();

      expect(result1).not.toBe(result2); // Referências diferentes
      expect(result1).toEqual(result2); // Mas conteúdo igual
    });
  });

  describe("getCurrencySymbol", () => {
    it("deve retornar símbolo da moeda configurada", async () => {
      MockSetting.findOne.mockResolvedValue({
        value: JSON.stringify(SUPPORTED_CURRENCIES.EUR)
      } as any);

      const result = await getCurrencySymbol();

      expect(result).toBe("€");
    });

    it("deve retornar símbolo padrão (BRL) quando não configurado", async () => {
      MockSetting.findOne.mockResolvedValue(null);

      const result = await getCurrencySymbol();

      expect(result).toBe("R$");
    });
  });

  describe("getCurrencyCode", () => {
    it("deve retornar código da moeda configurada", async () => {
      MockSetting.findOne.mockResolvedValue({
        value: JSON.stringify(SUPPORTED_CURRENCIES.GBP)
      } as any);

      const result = await getCurrencyCode();

      expect(result).toBe("GBP");
    });

    it("deve retornar código padrão (BRL) quando não configurado", async () => {
      MockSetting.findOne.mockResolvedValue(null);

      const result = await getCurrencyCode();

      expect(result).toBe("BRL");
    });
  });

  describe("getCurrencyLocale", () => {
    it("deve retornar locale da moeda configurada", async () => {
      MockSetting.findOne.mockResolvedValue({
        value: JSON.stringify(SUPPORTED_CURRENCIES.JPY)
      } as any);

      const result = await getCurrencyLocale();

      expect(result).toBe("ja-JP");
    });

    it("deve retornar locale padrão (pt-BR) quando não configurado", async () => {
      MockSetting.findOne.mockResolvedValue(null);

      const result = await getCurrencyLocale();

      expect(result).toBe("pt-BR");
    });
  });

  describe("SUPPORTED_CURRENCIES", () => {
    it("deve ter todas as moedas definidas no plano", () => {
      const expectedCurrencies = [
        'BRL', 'USD', 'EUR', 'GBP', 'JPY', 'CNY', 'ARS', 'CLP', 'MXN', 'CAD'
      ];

      expectedCurrencies.forEach(code => {
        expect(SUPPORTED_CURRENCIES[code]).toBeDefined();
        expect(SUPPORTED_CURRENCIES[code].code).toBe(code);
        expect(SUPPORTED_CURRENCIES[code].symbol).toBeDefined();
        expect(SUPPORTED_CURRENCIES[code].locale).toBeDefined();
      });
    });

    it("deve ter estrutura consistente para cada moeda", () => {
      Object.values(SUPPORTED_CURRENCIES).forEach(currency => {
        expect(currency).toHaveProperty('code');
        expect(currency).toHaveProperty('symbol');
        expect(currency).toHaveProperty('locale');

        expect(typeof currency.code).toBe('string');
        expect(typeof currency.symbol).toBe('string');
        expect(typeof currency.locale).toBe('string');

        expect(currency.code.length).toBe(3); // ISO 4217
        expect(currency.locale).toMatch(/^[a-z]{2}-[A-Z]{2}$/); // formato pt-BR
      });
    });
  });

  describe("Cenários de integração", () => {
    it("deve manter consistência entre funções auxiliares", async () => {
      const currencyData = SUPPORTED_CURRENCIES.CAD;
      MockSetting.findOne.mockResolvedValue({
        value: JSON.stringify(currencyData)
      } as any);

      const [symbol, code, locale, fullData] = await Promise.all([
        getCurrencySymbol(),
        getCurrencyCode(),
        getCurrencyLocale(),
        getCurrency()
      ]);

      expect(symbol).toBe(currencyData.symbol);
      expect(code).toBe(currencyData.code);
      expect(locale).toBe(currencyData.locale);
      expect(fullData).toEqual(currencyData);
    });

    it("deve funcionar corretamente após múltiplas atualizações", async () => {
      const mockUser = { super: true };
      const UserModel = require("../../models/User").default;
      UserModel.findByPk.mockResolvedValue(mockUser);

      let mockSetting = {
        update: jest.fn().mockResolvedValue(true)
      } as any;
      MockSetting.findOrCreate.mockResolvedValue([mockSetting, true] as any);

      // Primeira atualização para USD
      await updateCurrency({
        currencyData: SUPPORTED_CURRENCIES.USD,
        userId: "user123"
      });

      MockSetting.findOne.mockResolvedValue({
        value: JSON.stringify(SUPPORTED_CURRENCIES.USD)
      } as any);

      let currency = await getCurrency();
      expect(currency).toEqual(SUPPORTED_CURRENCIES.USD);

      // Segunda atualização para EUR
      await updateCurrency({
        currencyData: SUPPORTED_CURRENCIES.EUR,
        userId: "user123"
      });

      MockSetting.findOne.mockResolvedValue({
        value: JSON.stringify(SUPPORTED_CURRENCIES.EUR)
      } as any);

      currency = await getCurrency();
      expect(currency).toEqual(SUPPORTED_CURRENCIES.EUR);
    });
  });
});