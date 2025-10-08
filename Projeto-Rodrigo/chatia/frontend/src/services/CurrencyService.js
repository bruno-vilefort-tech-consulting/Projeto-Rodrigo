import api from './api';

let currencyCache = null;
let cacheExpiry = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

export const getCurrency = async () => {
  // Verificar cache válido
  if (currencyCache && Date.now() < cacheExpiry) {
    return currencyCache;
  }

  try {
    const { data } = await api.get('/settings/currency');

    // Atualizar cache
    currencyCache = data;
    cacheExpiry = Date.now() + CACHE_DURATION;

    return data;
  } catch (error) {
    console.error('Error fetching currency:', error);
    // Fallback para BRL em caso de erro
    const fallback = { code: 'BRL', symbol: 'R$', locale: 'pt-BR' };
    currencyCache = fallback;
    cacheExpiry = Date.now() + CACHE_DURATION;
    return fallback;
  }
};

export const clearCurrencyCache = () => {
  currencyCache = null;
  cacheExpiry = 0;
};