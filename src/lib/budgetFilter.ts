import type { CurrencyCode } from "@/lib/currency";

/**
 * Stay-total caps used before live rates arrive, and when the list is too
 * tight to derive useful steps. Scaled per currency so "150" is never treated
 * as kronor.
 *
 * These are filter thresholds, not FX conversions of hotel prices.
 */
export const FALLBACK_BUDGET_CAPS: Record<CurrencyCode, readonly [number, number, number]> = {
  EUR: [150, 250, 400],
  USD: [160, 280, 450],
  GBP: [130, 220, 350],
  SEK: [1800, 2800, 4500],
};

export function niceBudgetAmount(amount: number, currency: CurrencyCode): number {
  if (!Number.isFinite(amount) || amount <= 0) return 0;
  let step: number;
  if (currency === "SEK") {
    step = amount >= 10_000 ? 500 : amount >= 2_000 ? 100 : 50;
  } else {
    step = amount >= 500 ? 50 : amount >= 100 ? 25 : 10;
  }
  return Math.max(step, Math.round(amount / step) * step);
}

/**
 * Build up-to caps from the stay totals currently on the page, so a week in
 * kronor and a weekend in euros both get meaningful steps. Falls back to the
 * currency presets when there isn't enough spread.
 */
export function budgetCapsFromStayTotals(prices: number[], currency: CurrencyCode): number[] {
  const sorted = prices.filter((price) => Number.isFinite(price) && price > 0).sort((a, b) => a - b);
  if (sorted.length === 0) return [...FALLBACK_BUDGET_CAPS[currency]];

  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  if (max <= min * 1.12) {
    const cap = niceBudgetAmount(min + (max - min) * 0.5, currency);
    return cap > min && cap < max ? [cap] : [...FALLBACK_BUDGET_CAPS[currency]];
  }

  const at = (fraction: number) =>
    sorted[Math.min(sorted.length - 1, Math.max(0, Math.round(fraction * (sorted.length - 1))))];

  const caps: number[] = [];
  for (const sample of [at(0.35), at(0.55), at(0.75)]) {
    const rounded = niceBudgetAmount(sample, currency);
    if (rounded <= min || rounded >= max) continue;
    if (caps.some((cap) => Math.abs(cap - rounded) / rounded < 0.1)) continue;
    caps.push(rounded);
  }

  return caps.length > 0 ? caps : [...FALLBACK_BUDGET_CAPS[currency]];
}
