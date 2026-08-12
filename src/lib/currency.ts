/**
 * Display / quote currency for stay prices.
 *
 * LiteAPI requotes in the requested currency — we never convert client-side.
 * Supported set matches product v1 (EUR/USD/GBP) plus SEK for Swedish visitors.
 */

export const CURRENCY_STORAGE_KEY = "yict_currency";
export const CURRENCY_COOKIE_NAME = "yict_currency";
export const CURRENCY_ATTRIBUTE = "data-currency";

export const SUPPORTED_CURRENCIES = ["EUR", "SEK", "GBP", "USD"] as const;

export type CurrencyCode = (typeof SUPPORTED_CURRENCIES)[number];

export const DEFAULT_CURRENCY: CurrencyCode = "EUR";

export const CURRENCY_OPTIONS: ReadonlyArray<{
  code: CurrencyCode;
  label: string;
  /** ISO 3166-1 alpha-2 passed to LiteAPI as guestNationality */
  guestNationality: string;
  /** Locale for number formatting when we want currency-native grouping */
  locale: string;
}> = [
  { code: "EUR", label: "Euro (€)", guestNationality: "DE", locale: "en-GB" },
  { code: "SEK", label: "Swedish krona (kr)", guestNationality: "SE", locale: "sv-SE" },
  { code: "GBP", label: "British pound (£)", guestNationality: "GB", locale: "en-GB" },
  { code: "USD", label: "US dollar ($)", guestNationality: "US", locale: "en-US" },
];

export function isCurrencyCode(value: string | null | undefined): value is CurrencyCode {
  return SUPPORTED_CURRENCIES.includes(value as CurrencyCode);
}

export function normalizeCurrency(value: string | null | undefined): CurrencyCode {
  const upper = value?.trim().toUpperCase();
  return isCurrencyCode(upper) ? upper : DEFAULT_CURRENCY;
}

export function guestNationalityForCurrency(currency: CurrencyCode): string {
  return CURRENCY_OPTIONS.find((o) => o.code === currency)?.guestNationality ?? "DE";
}

export function localeForCurrency(currency: CurrencyCode): string {
  return CURRENCY_OPTIONS.find((o) => o.code === currency)?.locale ?? "en-GB";
}

/**
 * Infer a sensible default from browser language / region / timezone.
 * Used only when the visitor has no stored preference yet.
 */
export function detectCurrency(input?: {
  languages?: readonly string[];
  timeZone?: string;
}): CurrencyCode {
  const languages = input?.languages?.length
    ? input.languages
    : typeof navigator !== "undefined"
      ? navigator.languages?.length
        ? navigator.languages
        : [navigator.language]
      : [];

  for (const raw of languages) {
    if (!raw) continue;
    const tag = raw.toLowerCase().replace("_", "-");
    const [lang, region] = tag.split("-");

    if (lang === "sv" || region === "se") return "SEK";
    if (region === "gb" || tag === "en-gb") return "GBP";
    if (region === "us" || tag === "en-us") return "USD";
    if (
      region === "de" ||
      region === "fr" ||
      region === "es" ||
      region === "it" ||
      region === "nl" ||
      region === "at" ||
      region === "pt" ||
      region === "ie" ||
      region === "fi" ||
      region === "be" ||
      lang === "de" ||
      lang === "fr" ||
      lang === "es" ||
      lang === "it" ||
      lang === "nl" ||
      lang === "pt"
    ) {
      return "EUR";
    }
  }

  const timeZone =
    input?.timeZone ??
    (typeof Intl !== "undefined"
      ? Intl.DateTimeFormat().resolvedOptions().timeZone
      : undefined);

  if (timeZone === "Europe/Stockholm") return "SEK";
  if (timeZone === "Europe/London") return "GBP";
  if (
    timeZone === "America/New_York" ||
    timeZone === "America/Chicago" ||
    timeZone === "America/Denver" ||
    timeZone === "America/Los_Angeles" ||
    timeZone === "America/Phoenix"
  ) {
    return "USD";
  }

  return DEFAULT_CURRENCY;
}

/** Read currency from a Cookie header value (server routes). */
export function currencyFromCookieHeader(cookieHeader: string | null): CurrencyCode | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${CURRENCY_COOKIE_NAME}=([^;]+)`));
  if (!match?.[1]) return null;
  try {
    return normalizeCurrency(decodeURIComponent(match[1]));
  } catch {
    return normalizeCurrency(match[1]);
  }
}

export function resolveRequestCurrency(options: {
  queryCurrency?: string | null;
  cookieHeader?: string | null;
  fallback?: CurrencyCode;
}): CurrencyCode {
  if (isCurrencyCode(options.queryCurrency?.trim().toUpperCase())) {
    return options.queryCurrency!.trim().toUpperCase() as CurrencyCode;
  }
  const fromCookie = currencyFromCookieHeader(options.cookieHeader ?? null);
  if (fromCookie) return fromCookie;
  return options.fallback ?? DEFAULT_CURRENCY;
}
