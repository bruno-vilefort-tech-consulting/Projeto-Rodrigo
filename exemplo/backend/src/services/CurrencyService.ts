import Setting from "../models/Setting";
import AppError from "../errors/AppError";

// Interface para dados de moeda
interface CurrencyData {
  code: string;
  symbol: string;
  locale: string;
}

// Interface para atualização de moeda (apenas super-admin)
interface UpdateCurrencyRequest {
  currencyData: CurrencyData;
  userId: string;
}

// Moedas suportadas pelo sistema
export const SUPPORTED_CURRENCIES = {
  BRL: { code: 'BRL', symbol: 'R$', locale: 'pt-BR' },
  USD: { code: 'USD', symbol: '$', locale: 'en-US' },
  EUR: { code: 'EUR', symbol: '€', locale: 'de-DE' },
  GBP: { code: 'GBP', symbol: '£', locale: 'en-GB' },
  JPY: { code: 'JPY', symbol: '¥', locale: 'ja-JP' },
  CNY: { code: 'CNY', symbol: '¥', locale: 'zh-CN' },
  ARS: { code: 'ARS', symbol: '$', locale: 'es-AR' },
  CLP: { code: 'CLP', symbol: '$', locale: 'es-CL' },
  MXN: { code: 'MXN', symbol: '$', locale: 'es-MX' },
  CAD: { code: 'CAD', symbol: 'C$', locale: 'en-CA' }
};

// Cache para evitar múltiplas consultas ao banco
let currencyCache: CurrencyData | null = null;
let cacheExpiry: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

/**
 * Obtém a configuração de moeda do sistema
 * @returns CurrencyData - Dados da moeda configurada
 */
export const getCurrency = async (): Promise<CurrencyData> => {
  // Verificar cache válido
  if (currencyCache && Date.now() < cacheExpiry) {
    return currencyCache;
  }

  try {
    const setting = await Setting.findOne({
      where: {
        key: 'systemCurrency'
      }
    });

    let currencyData: CurrencyData;

    if (setting && setting.value) {
      try {
        currencyData = JSON.parse(setting.value);

        // Validar se a moeda ainda é suportada
        if (!SUPPORTED_CURRENCIES[currencyData.code]) {
          console.warn(`Moeda ${currencyData.code} não é mais suportada, usando BRL como fallback`);
          currencyData = SUPPORTED_CURRENCIES.BRL;
        }
      } catch (parseError) {
        console.warn('Erro ao fazer parse da configuração de moeda, usando BRL como fallback:', parseError);
        currencyData = SUPPORTED_CURRENCIES.BRL;
      }
    } else {
      // Usar BRL como padrão se configuração não existe
      currencyData = SUPPORTED_CURRENCIES.BRL;
    }

    // Atualizar cache
    currencyCache = currencyData;
    cacheExpiry = Date.now() + CACHE_DURATION;

    return currencyData;
  } catch (error) {
    console.error('Erro ao buscar configuração de moeda:', error);
    // Em caso de erro, retornar BRL como fallback
    return SUPPORTED_CURRENCIES.BRL;
  }
};

/**
 * Atualiza a configuração de moeda do sistema (apenas super-admin)
 * @param currencyData - Dados da nova moeda
 * @param userId - ID do usuário (deve ser super-admin)
 * @returns Setting - Configuração atualizada
 */
export const updateCurrency = async ({
  currencyData,
  userId
}: UpdateCurrencyRequest): Promise<Setting> => {
  // Importar User aqui para evitar dependência circular
  const User = (await import("../models/User")).default;

  // Verificar se usuário é super-admin
  const user = await User.findByPk(userId);
  if (!user || !user.super) {
    throw new AppError("ERR_NO_PERMISSION_CURRENCY", 403);
  }

  // Validar se a moeda é suportada
  if (!SUPPORTED_CURRENCIES[currencyData.code]) {
    throw new AppError("ERR_UNSUPPORTED_CURRENCY", 400);
  }

  // Obter dados completos da moeda suportada
  const validCurrencyData = SUPPORTED_CURRENCIES[currencyData.code];

  const [setting] = await Setting.findOrCreate({
    where: {
      key: 'systemCurrency'
    },
    defaults: {
      key: 'systemCurrency',
      value: JSON.stringify(validCurrencyData),
      companyId: null // Configuração global
    }
  });

  // Atualizar valor se já existia
  await setting.update({
    value: JSON.stringify(validCurrencyData)
  });

  // Limpar cache
  currencyCache = null;
  cacheExpiry = 0;

  return setting;
};

/**
 * Formata um valor monetário com a moeda configurada
 * @param value - Valor numérico a ser formatado
 * @param currency - Dados da moeda (opcional, usa configuração atual se não fornecida)
 * @returns string - Valor formatado
 */
export const formatCurrency = async (
  value: number,
  currency?: CurrencyData
): Promise<string> => {
  const currencyData = currency || await getCurrency();

  try {
    return new Intl.NumberFormat(currencyData.locale, {
      style: 'currency',
      currency: currencyData.code,
      minimumFractionDigits: 2
    }).format(value);
  } catch (error) {
    console.warn('Erro na formatação da moeda, usando fallback:', error);
    // Fallback manual se Intl.NumberFormat falhar
    return `${currencyData.symbol} ${value.toFixed(2)}`;
  }
};

/**
 * Retorna lista de moedas suportadas pelo sistema
 * @returns Array<CurrencyData> - Lista de moedas disponíveis
 */
export const getSupportedCurrencies = (): CurrencyData[] => {
  return Object.values(SUPPORTED_CURRENCIES);
};

/**
 * Obtém apenas o símbolo da moeda configurada
 * @returns string - Símbolo da moeda (ex: "R$", "$", "€")
 */
export const getCurrencySymbol = async (): Promise<string> => {
  const currency = await getCurrency();
  return currency.symbol;
};

/**
 * Obtém apenas o código da moeda configurada
 * @returns string - Código da moeda (ex: "BRL", "USD", "EUR")
 */
export const getCurrencyCode = async (): Promise<string> => {
  const currency = await getCurrency();
  return currency.code;
};

/**
 * Obtém apenas o locale da moeda configurada
 * @returns string - Locale da moeda (ex: "pt-BR", "en-US", "de-DE")
 */
export const getCurrencyLocale = async (): Promise<string> => {
  const currency = await getCurrency();
  return currency.locale;
};

/**
 * APENAS PARA TESTES - Reset do cache interno
 * Esta função deve ser usada apenas em ambiente de teste
 */
export const __resetCacheForTesting = (): void => {
  if (process.env.NODE_ENV !== 'test') {
    console.warn('__resetCacheForTesting só deve ser usado em testes');
    return;
  }
  currencyCache = null;
  cacheExpiry = 0;
};

export default {
  getCurrency,
  updateCurrency,
  formatCurrency,
  getSupportedCurrencies,
  getCurrencySymbol,
  getCurrencyCode,
  getCurrencyLocale,
  SUPPORTED_CURRENCIES,
  __resetCacheForTesting
};