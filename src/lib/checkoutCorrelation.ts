/** Anonymous checkout funnel id — ties steps together without PII. */

const STORAGE_KEY = "yict_checkout_correlation";

export function createCheckoutCorrelationId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `chk-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

/** Stable id for this browser tab's checkout attempt (survives payment redirect). */
export function getCheckoutCorrelationId(): string {
  if (typeof window === "undefined") return "";
  try {
    const existing = sessionStorage.getItem(STORAGE_KEY);
    if (existing?.trim()) return existing.trim();
    const next = createCheckoutCorrelationId();
    sessionStorage.setItem(STORAGE_KEY, next);
    return next;
  } catch {
    return createCheckoutCorrelationId();
  }
}

export function resetCheckoutCorrelationId(): string {
  if (typeof window === "undefined") return "";
  const next = createCheckoutCorrelationId();
  try {
    sessionStorage.setItem(STORAGE_KEY, next);
  } catch {
    /* ignore */
  }
  return next;
}
