import { useState, useCallback } from "react";
import api from "../../services/api";
import toastError from "../../errors/toastError";

const CURRENCIES = {
  BRL: { code: 'BRL', symbol: 'R$', locale: 'pt-BR', name: 'Real Brasileiro' },
  USD: { code: 'USD', symbol: '$', locale: 'en-US', name: 'Dólar Americano' },
  EUR: { code: 'EUR', symbol: '€', locale: 'de-DE', name: 'Euro' },
  GBP: { code: 'GBP', symbol: '£', locale: 'en-GB', name: 'Libra Esterlina' },
  JPY: { code: 'JPY', symbol: '¥', locale: 'ja-JP', name: 'Iene Japonês' },
  CNY: { code: 'CNY', symbol: '¥', locale: 'zh-CN', name: 'Yuan Chinês' },
  ARS: { code: 'ARS', symbol: '$', locale: 'es-AR', name: 'Peso Argentino' },
  CLP: { code: 'CLP', symbol: '$', locale: 'es-CL', name: 'Peso Chileno' },
  MXN: { code: 'MXN', symbol: '$', locale: 'es-MX', name: 'Peso Mexicano' },
  CAD: { code: 'CAD', symbol: 'C$', locale: 'en-CA', name: 'Dólar Canadense' }
};

const useCurrency = () => {
  const [currency, setCurrency] = useState(null);
  const [loading, setLoading] = useState(false);

  const getCurrency = useCallback(async () => {
    if (currency) {
      return currency;
    }

    setLoading(true);
    try {
      const { data } = await api.request({
        url: "/settings/currency",
        method: "GET",
      });

      const currencyData = data?.systemCurrency || CURRENCIES.BRL;
      setCurrency(currencyData);
      return currencyData;
    } catch (err) {
      console.warn("Error fetching currency, using default BRL:", err);
      setCurrency(CURRENCIES.BRL);
      return CURRENCIES.BRL;
    } finally {
      setLoading(false);
    }
  }, [currency]);

  const updateCurrency = async (currencyCode) => {
    if (!CURRENCIES[currencyCode]) {
      throw new Error(`Moeda não suportada: ${currencyCode}`);
    }

    setLoading(true);
    try {
      const currencyData = CURRENCIES[currencyCode];
      const { data } = await api.request({
        url: "/settings/currency",
        method: "PUT",
        data: { systemCurrency: currencyData },
      });

      setCurrency(currencyData);
      return currencyData;
    } catch (err) {
      toastError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (value, currencyData = null) => {
    const activeCurrency = currencyData || currency || CURRENCIES.BRL;

    if (typeof value === 'string') {
      value = parseFloat(value.replace(/[^\d.-]/g, ''));
    }

    if (isNaN(value)) {
      value = 0;
    }

    return new Intl.NumberFormat(activeCurrency.locale, {
      style: 'currency',
      currency: activeCurrency.code,
    }).format(value);
  };

  const getAvailableCurrencies = () => {
    return Object.values(CURRENCIES);
  };

  const clearCache = () => {
    setCurrency(null);
  };

  return {
    currency,
    loading,
    getCurrency,
    updateCurrency,
    formatCurrency,
    getAvailableCurrencies,
    clearCache,
  };
};

export default useCurrency;