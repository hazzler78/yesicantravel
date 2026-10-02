import { cookies, headers } from "next/headers";
import { sourceFromReferrer } from "@/lib/attributionSource";

export type AttributionSnapshot = {
  source?: string;
  medium?: string;
  campaign?: string;
  utmTerm?: string;
  utmContent?: string;
  gclid?: string;
  fbclid?: string;
  referrer?: string;
  landingPage?: string;
};

export const ATTRIBUTION_COOKIE = "yict_attr_v1";

export { sourceFromReferrer };

export function enrichAttribution(snapshot: AttributionSnapshot): AttributionSnapshot {
  const fromRef = sourceFromReferrer(snapshot.referrer);
  return {
    ...snapshot,
    source: snapshot.source || fromRef,
    medium: snapshot.medium || (fromRef ? "ai_referral" : undefined),
  };
}

export function parseAttributionCookie(raw: string | undefined): AttributionSnapshot {
  if (!raw) return {};
  try {
    return JSON.parse(decodeURIComponent(raw)) as AttributionSnapshot;
  } catch {
    return {};
  }
}

export async function getAttributionFromRequest(): Promise<AttributionSnapshot> {
  const cookieStore = await cookies();
  const headerStore = await headers();
  const raw = cookieStore.get(ATTRIBUTION_COOKIE)?.value;
  const parsed = parseAttributionCookie(raw);
  const referrer = parsed.referrer ?? headerStore.get("referer") ?? undefined;

  return enrichAttribution({
    ...parsed,
    referrer,
  });
}
