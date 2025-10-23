/* eslint-disable new-cap */
import { getCurrency } from '../services/CurrencyService';

export default async function formatToCurrency(value) {
  try {
    const currency = await getCurrency();
    return Intl.NumberFormat(currency.locale, {
      style: 'currency',
      currency: currency.code,
    }).format(value);
  } catch (error) {
    // Fallback para BRL se houver erro
    return Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value);
  }
}
