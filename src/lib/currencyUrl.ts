import { applyCurrency, useCurrency } from "@/components/currency/CurrencyControl";
import { isCurrencyCode, type CurrencyCode } from "@/lib/currency";
import { useEffect } from "react";
import type { ReadonlyURLSearchParams } from "next/navigation";
type AppRouter = {
  replace: (href: string, options?: { scroll?: boolean }) => void;
};

/** Read ?currency= from a query string or full search (with or without leading ?). */
export function currencyFromQueryString(search: string): CurrencyCode | null {
  const normalized = search.startsWith("?") ? search.slice(1) : search;
  const value = new URLSearchParams(normalized).get("currency");
  if (!value) return null;
  const upper = value.trim().toUpperCase();
  return isCurrencyCode(upper) ? upper : null;
}

/**
 * Keeps `?currency=` and the header selector in sync on results/hotel URLs.
 * Invalid params are ignored (cookie / bootstrap behaviour unchanged).
 */
export function useCurrencyQuerySync(
  searchParams: ReadonlyURLSearchParams,
  pathname: string,
  router: AppRouter,
) {
  const currency = useCurrency();
  const paramRaw = searchParams.get("currency");

  useEffect(() => {
    if (!paramRaw) return;
    const upper = paramRaw.trim().toUpperCase();
    if (!isCurrencyCode(upper)) return;
    if (upper !== currency) applyCurrency(upper);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only follow URL navigation, not header changes
  }, [paramRaw]);

  useEffect(() => {
    if (!isCurrencyCode(currency)) return;
    const param = paramRaw?.trim().toUpperCase();
    if (param === currency) return;
    const next = new URLSearchParams(searchParams.toString());
    next.set("currency", currency);
    router.replace(`${pathname}?${next.toString()}`, { scroll: false });
  }, [currency, paramRaw, pathname, router, searchParams]);
}
