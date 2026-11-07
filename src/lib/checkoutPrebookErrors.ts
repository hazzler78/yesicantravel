export type PrebookFailureKind =
  | "stale_offer"
  | "price_changed"
  | "payment_unavailable"
  | "unknown";

const STALE_OFFER_PATTERN =
  /no availability|not available|availability|sold out|no longer available|invalid offer|offer expired|rate is no longer/i;

const PRICE_CHANGED_PATTERN = /price chang|amount chang|rate chang|mismatch/i;

export function classifyPrebookFailure(message: string, code?: number): PrebookFailureKind {
  const raw = message.toLowerCase();
  if (STALE_OFFER_PATTERN.test(raw)) return "stale_offer";
  if (PRICE_CHANGED_PATTERN.test(raw)) return "price_changed";
  if (code === 4002 || /payment.*not.*enabled|sdk|stripe/i.test(raw)) {
    return "payment_unavailable";
  }
  return "unknown";
}

export function prebookFailureUserMessage(kind: PrebookFailureKind, fallback?: string): string {
  switch (kind) {
    case "stale_offer":
      return (
        "That room rate is no longer available for your dates. " +
        "Go back to the stay page, refresh rates, and choose another room."
      );
    case "price_changed":
      return (
        "The price for this room changed since you selected it. " +
        "Go back to the stay page, check the updated total, and book again."
      );
    case "payment_unavailable":
      return (
        "Card payment could not be started for this rate. " +
        "Try again in a moment, or contact support if it keeps happening."
      );
    default:
      return fallback?.trim() || "We could not reserve this room. Please go back and try another rate.";
  }
}

export function prebookFailureRecoveryLabel(kind: PrebookFailureKind): string {
  if (kind === "stale_offer" || kind === "price_changed") return "Refresh rates on stay page";
  return "Back to the stay";
}
