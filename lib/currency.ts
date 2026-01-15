/**
 * Utilidades de conversión de moneda para transferencias internacionales
 */

// Tipo de cambio fijo: 1 USD = 20 MXN
export const USD_TO_MXN_RATE = 20;

/**
 * Convierte USD a MXN
 */
export function usdToMxn(usdAmount: number): number {
  return Math.round(usdAmount * USD_TO_MXN_RATE * 100) / 100;
}

/**
 * Convierte MXN a USD
 */
export function mxnToUsd(mxnAmount: number): number {
  return Math.round((mxnAmount / USD_TO_MXN_RATE) * 100) / 100;
}

/**
 * Formatea un monto según la moneda
 */
export function formatCurrency(amount: number, currency: 'USD' | 'MXN'): string {
  if (currency === 'MXN') {
    return `$${amount.toFixed(2)} MXN`;
  }
  return `$${amount.toFixed(2)}`;
}

/**
 * Obtiene el símbolo de moneda
 */
export function getCurrencySymbol(currency: 'USD' | 'MXN'): string {
  return currency === 'MXN' ? 'MXN' : 'USD';
}

/**
 * Convierte el monto del regalo según el país
 * Para MX: muestra en MXN (USD * 20)
 * Para EC: muestra en USD
 */
export function getDisplayAmount(usdAmount: number, country: 'EC' | 'MX'): {
  amount: number;
  currency: 'USD' | 'MXN';
  formatted: string;
} {
  if (country === 'MX') {
    const mxnAmount = usdToMxn(usdAmount);
    return {
      amount: mxnAmount,
      currency: 'MXN',
      formatted: formatCurrency(mxnAmount, 'MXN')
    };
  }
  
  return {
    amount: usdAmount,
    currency: 'USD',
    formatted: formatCurrency(usdAmount, 'USD')
  };
}

/**
 * Convierte el monto ingresado a USD para guardar en DB
 * Si es MX, convierte de MXN a USD
 * Si es EC, mantiene USD
 */
export function convertToUsd(amount: number, country: 'EC' | 'MX'): number {
  if (country === 'MX') {
    return mxnToUsd(amount);
  }
  return amount;
}
