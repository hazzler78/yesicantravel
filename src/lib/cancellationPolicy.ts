import type { VisitorUiLanguage } from "@/lib/visitorLanguage";
import { cancellationRateLabel, pickTrustUiLanguage } from "@/lib/trustUiCopy";

export type LiteApiCancellationPolicies = {
  refundableTag?: string | null;
  cancelPolicyInfos?: Array<{
    cancelTime?: string | null;
    timezone?: string | null;
  }> | null;
};

export function isRefundableRate(policies?: LiteApiCancellationPolicies | null): boolean {
  return policies?.refundableTag === "RFN";
}

function rawCancelTime(policies?: LiteApiCancellationPolicies | null): string | null {
  const infos = policies?.cancelPolicyInfos;
  if (!infos?.length) return null;
  for (const info of infos) {
    const value = info?.cancelTime?.trim();
    if (value) return value;
  }
  return null;
}

/**
 * Formats LiteAPI cancelTime for display. Keeps server strings when they are not ISO.
 */
export function formatCancellationDeadline(
  policies: LiteApiCancellationPolicies | null | undefined,
  lang?: VisitorUiLanguage,
): string | null {
  const raw = rawCancelTime(policies);
  if (!raw) return null;

  const uiLang = lang ?? pickTrustUiLanguage();
  const locale = uiLang === "sv" ? "sv-SE" : "en-GB";
  const timezone =
    policies?.cancelPolicyInfos?.find((i) => i?.timezone?.trim())?.timezone?.trim() ?? undefined;

  const iso = Date.parse(raw);
  if (!Number.isFinite(iso)) {
    return raw;
  }

  const formatter = new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short",
    ...(timezone ? { timeZone: timezone } : {}),
  });

  let formatted = formatter.format(new Date(iso));
  if (!timezone && /T\d{2}:\d{2}/.test(raw) && !/[zZ]|[+-]\d{2}:?\d{2}$/.test(raw)) {
    formatted += uiLang === "sv" ? " (lokal hotelltid)" : " (hotel local time)";
  } else if (timezone) {
    formatted += ` (${timezone})`;
  }
  return formatted;
}

export function describeRateCancellation(
  policies: LiteApiCancellationPolicies | null | undefined,
  lang?: VisitorUiLanguage,
): string | null {
  if (!policies?.refundableTag) return null;
  const refundable = isRefundableRate(policies);
  const deadline = refundable ? formatCancellationDeadline(policies, lang) : null;
  return cancellationRateLabel(refundable, deadline, lang);
}