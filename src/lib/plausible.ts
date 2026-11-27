import { init, track } from "@plausible-analytics/tracker";
import {
  capturePlausibleOnLocalhost,
  isPlausibleDisabled,
  PLAUSIBLE_EVENT_PATH,
  plausibleSiteDomain,
  sanitizePlausiblePayload,
  sanitizePlausibleProps,
  takePlausibleRevenue,
  type PlausiblePayload,
} from "@/lib/plausiblePrivacy";

let started = false;

/** Idempotent. Safe to call from effects and from the first custom event. */
export function startPlausible(): void {
  if (started || typeof window === "undefined") return;
  if (isPlausibleDisabled()) return;
  started = true;
  try {
    const domain = plausibleSiteDomain();
    const captureLocalhost = capturePlausibleOnLocalhost();
    init({
      domain,
      endpoint: PLAUSIBLE_EVENT_PATH,
      captureOnLocalhost: captureLocalhost,
      outboundLinks: true,
      fileDownloads: true,
      formSubmissions: true,
      logging: process.env.NODE_ENV !== "production",
      transformRequest: (payload) =>
        sanitizePlausiblePayload(payload as PlausiblePayload, {
          captureLocalhost,
          domain,
        }),
    });
  } catch {
    // A failed init should not stick, so a later event can retry.
    started = false;
  }
}

/**
 * Custom event. Props are allow-listed; guest fields never leave the browser.
 * `revenueAmount` + `currency` become Plausible revenue and are not stored as props.
 */
export function trackPlausibleEvent(
  name: string,
  data?: Record<string, unknown>,
  options?: { interactive?: boolean },
): void {
  if (typeof window === "undefined" || isPlausibleDisabled()) return;
  startPlausible();
  try {
    const { props: rest, revenue } = takePlausibleRevenue(data);
    const props = sanitizePlausibleProps(rest);
    track(name, {
      ...(props ? { props } : {}),
      ...(revenue ? { revenue } : {}),
      ...(options?.interactive === false ? { interactive: false } : {}),
    });
  } catch {
    // Analytics must never interrupt booking.
  }
}
