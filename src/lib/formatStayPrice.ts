import { localeForCurrency, isCurrencyCode, DEFAULT_CURRENCY } from "@/lib/currency";

function formatCurrency(
  amount: number,
  currency: string,
  fractionDigits: { min: number; max: number }
): string {
  const code = currency?.length === 3 ? currency.toUpperCase() : DEFAULT_CURRENCY;
  try {
    return new Intl.NumberFormat(isCurrencyCode(code) ? localeForCurrency(code) : undefined, {
      style: "currency",
      currency: code,
      // Both must be set. Currency style defaults minimumFractionDigits to 2
      // (öre/cents), which would ignore a lone maximumFractionDigits: 0.
      minimumFractionDigits: fractionDigits.min,
      maximumFractionDigits: fractionDigits.max,
    }).format(amount);
  } catch {
    return fractionDigits.max === 0 ? `${code} ${Math.round(amount)}` : `${code} ${amount.toFixed(2)}`;
  }
}

/**
 * Exact stay total from LiteAPI. Whole amounts render without ,00 / .00;
 * real cents/öre stay visible so checkout never disagrees with the charge.
 */
export function formatStayTotal(amount: number, currency: string): string {
  const whole = Math.abs(amount - Math.round(amount)) < 0.005;
  return whole
    ? formatCurrency(Math.round(amount), currency, { min: 0, max: 0 })
    : formatCurrency(amount, currency, { min: 2, max: 2 });
}

/**
 * Marketing "from" price (homepage city cards, event badges). Whole units only.
 * Ceils for display so a headline is never lower than a bookable rate.
 * Does not change the number sent to prebook/book.
 */
export function formatHeadlinePrice(amount: number, currency: string): string {
  return formatCurrency(Math.ceil(amount), currency, { min: 0, max: 0 });
}
