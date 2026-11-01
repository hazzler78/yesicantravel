/**
 * Privacy boundary for Plausible.
 *
 * Page URLs on checkout include offer, prebook and transaction ids. Those stay
 * in the browser: we strip them before the event leaves, and we only attach
 * low-cardinality props (city, step, currency) — never guest details.
 *
 * Plausible goal names to create (same spelling):
 * Search, HotelClick, book_clicked, rate_selected, CheckoutStart,
 * Entered Guest Details, PaymentFormShown, payment_submitted,
 * BookingSuccess (revenue), Booking Abandoned, newsletter_signup, checklist_signup,
 * search_submitted, hotel_viewed.
 * Automatic: Outbound Link: Click, File Download, Form: Submission.
 */

export const PLAUSIBLE_EVENT_PATH = "/yict/collect";

export const DEFAULT_PLAUSIBLE_DOMAIN = "yesicantravel.com";

const CANONICAL_HOSTS = new Set([
  "yesicantravel.com",
  "www.yesicantravel.com",
  "yesicantravel.vercel.app",
]);

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1"]);

/** Query keys that can identify a guest or a payment session. */
const SENSITIVE_QUERY =
  /^(email|e-mail|phone|tel|token|secret|secretkey|client_secret|payment_intent|prebookid|transactionid|offerid|redirect_status|totalamount|aisearch|firstname|lastname|name|holder)$/i;

const AUTOMATIC_EVENTS = new Set([
  "pageview",
  "engagement",
  "Outbound Link: Click",
  "File Download",
  "Form: Submission",
]);

/** Incoming prop key → stable Plausible prop name. */
const ALLOWED_PROPS: Record<string, string> = {
  source: "source",
  city: "city",
  currency: "currency",
  paymentMethod: "payment_method",
  payment_method: "payment_method",
  step: "step",
  mode: "search_mode",
  search_mode: "search_mode",
  price_bucket: "price_bucket",
  placement: "placement",
  has_dates: "has_dates",
  hasPlaceId: "has_place",
  hasVibeQuery: "has_vibe",
  guests: "guests",
  adults: "adults",
  children: "children",
  rooms: "rooms",
  refundable: "refundable",
  page: "page",
  reason: "reason",
};

const MAX_PROP_LENGTH = 80;
const MAX_QUERY_VALUE_LENGTH = 120;

export type PlausiblePropValue = string | number | boolean;

export type PlausibleProps = Record<string, PlausiblePropValue>;

export type PlausibleRevenue = {
  amount: number;
  currency: string;
};

export type PlausiblePayload = {
  n: string;
  u: string;
  d: string;
  r?: string | null;
  p?: PlausibleProps;
  $?: PlausibleRevenue;
  i?: boolean;
};

export function plausibleSiteDomain(): string {
  const configured = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN?.trim();
  return configured || DEFAULT_PLAUSIBLE_DOMAIN;
}

export function isPlausibleDisabled(): boolean {
  if (process.env.NEXT_PUBLIC_PLAUSIBLE_DISABLED === "1") return true;
  return plausibleSiteDomain().toLowerCase() === "off";
}

export function capturePlausibleOnLocalhost(): boolean {
  return process.env.NEXT_PUBLIC_PLAUSIBLE_CAPTURE_LOCALHOST === "1";
}

export function isTrackedHostname(hostname: string, captureLocalhost: boolean): boolean {
  const host = hostname.toLowerCase();
  if (CANONICAL_HOSTS.has(host)) return true;
  const domain = plausibleSiteDomain().toLowerCase();
  if (host === domain || host === `www.${domain}`) return true;
  return captureLocalhost && LOCAL_HOSTS.has(host);
}

export function isIgnoredAnalyticsPath(pathname: string): boolean {
  return pathname === "/admin" || pathname.startsWith("/admin/") || pathname.startsWith("/api/");
}

export function redactAnalyticsUrl(input: URL): string {
  const url = new URL(input.href);
  url.hash = "";
  const kept = new URLSearchParams();
  url.searchParams.forEach((value, key) => {
    if (SENSITIVE_QUERY.test(key)) return;
    if (value.includes("@")) return;
    if (value.length > MAX_QUERY_VALUE_LENGTH) return;
    kept.append(key, value);
  });
  const query = kept.toString();
  url.search = query ? `?${query}` : "";
  return url.toString();
}

function canonicalPageUrl(input: URL): string {
  const url = new URL(redactAnalyticsUrl(input));
  const host = url.hostname.toLowerCase();
  if (CANONICAL_HOSTS.has(host) || host === plausibleSiteDomain().toLowerCase() || host === `www.${plausibleSiteDomain().toLowerCase()}`) {
    url.protocol = "https:";
    url.hostname = plausibleSiteDomain();
    url.port = "";
  }
  return url.toString();
}

function looksLikeEmail(value: string): boolean {
  const valueWithoutUrl = value.trim();
  if (/[/?\s]/.test(valueWithoutUrl)) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valueWithoutUrl);
}

function clampProp(value: PlausiblePropValue): PlausiblePropValue | undefined {
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed || looksLikeEmail(trimmed)) return undefined;
    return trimmed.slice(0, MAX_PROP_LENGTH);
  }
  if (typeof value === "number") {
    if (!Number.isFinite(value)) return undefined;
    return value;
  }
  if (typeof value === "boolean") return value;
  return undefined;
}

export function sanitizePlausibleProps(
  data?: Record<string, unknown> | null,
): PlausibleProps | undefined {
  if (!data) return undefined;
  const props: PlausibleProps = {};
  for (const [key, raw] of Object.entries(data)) {
    const target = ALLOWED_PROPS[key];
    if (!target) continue;
    if (raw === undefined || raw === null) continue;
    if (typeof raw !== "string" && typeof raw !== "number" && typeof raw !== "boolean") continue;
    const value = clampProp(raw);
    if (value === undefined) continue;
    props[target] = value;
  }
  return Object.keys(props).length > 0 ? props : undefined;
}

function redactAutomaticProps(props: PlausibleProps): PlausibleProps | undefined {
  const next: PlausibleProps = {};
  for (const [key, raw] of Object.entries(props)) {
    if (typeof raw === "string" && looksLikeEmail(raw)) continue;
    if (typeof raw === "string" && /^https?:\/\//i.test(raw)) {
      try {
        next[key] = redactAnalyticsUrl(new URL(raw)).slice(0, 300);
        continue;
      } catch {
        next[key] = raw.split("?")[0].slice(0, 300);
        continue;
      }
    }
    const value = clampProp(raw);
    if (value !== undefined) next[key] = value;
  }
  return Object.keys(next).length > 0 ? next : undefined;
}

const CURRENCY_CODE = /^[A-Z]{3}$/;

export function takePlausibleRevenue(
  data?: Record<string, unknown> | null,
): { props: Record<string, unknown> | undefined; revenue?: PlausibleRevenue } {
  if (!data) return { props: undefined };
  const { revenueAmount, ...rest } = data;
  const currency = rest.currency;
  if (
    typeof revenueAmount === "number" &&
    Number.isFinite(revenueAmount) &&
    revenueAmount > 0 &&
    revenueAmount < 100_000 &&
    typeof currency === "string" &&
    CURRENCY_CODE.test(currency.trim().toUpperCase())
  ) {
    return {
      props: rest,
      revenue: {
        amount: Math.round(revenueAmount * 100) / 100,
        currency: currency.trim().toUpperCase(),
      },
    };
  }
  return { props: rest };
}

export function sanitizePlausiblePayload(
  payload: PlausiblePayload,
  options: { captureLocalhost: boolean; domain: string },
): PlausiblePayload | null {
  let page: URL;
  try {
    page = new URL(payload.u);
  } catch {
    return null;
  }
  if (!isTrackedHostname(page.hostname, options.captureLocalhost)) return null;
  if (isIgnoredAnalyticsPath(page.pathname)) return null;

  const next: PlausiblePayload = {
    ...payload,
    u: canonicalPageUrl(page),
    d: options.domain,
  };

  if (typeof payload.r === "string" && payload.r) {
    try {
      next.r = redactAnalyticsUrl(new URL(payload.r));
    } catch {
      next.r = payload.r.split("?")[0];
    }
  }

  if (payload.p) {
    const props = AUTOMATIC_EVENTS.has(payload.n)
      ? redactAutomaticProps(payload.p)
      : sanitizePlausibleProps(payload.p);
    if (props) next.p = props;
    else delete next.p;
  }

  return next;
}
