import { localeForCurrency, isCurrencyCode, DEFAULT_CURRENCY } from "@/lib/currency";

/** Formats a stay total for display (taxes/fees typically included in LiteAPI retail total). */
export function formatStayTotal(amount: number, currency: string): string {
  const code = currency?.length === 3 ? currency.toUpperCase() : DEFAULT_CURRENCY;
  try {
    return new Intl.NumberFormat(isCurrencyCode(code) ? localeForCurrency(code) : undefined, {
      style: "currency",
      currency: code,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${code} ${amount.toFixed(2)}`;
  }
}
