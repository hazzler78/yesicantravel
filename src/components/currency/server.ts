import { DEFAULT_CURRENCY, type CurrencyCode } from "@/lib/currency";

/** Set in root layout from the visitor's currency cookie so SSR matches hydration. */
let ssrCurrencySnapshot: CurrencyCode = DEFAULT_CURRENCY;

export function setSsrCurrencySnapshot(currency: CurrencyCode) {
  ssrCurrencySnapshot = currency;
}

export function getSsrCurrencySnapshot(): CurrencyCode {
  return ssrCurrencySnapshot;
}
