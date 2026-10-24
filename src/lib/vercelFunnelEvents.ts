import { track } from "@vercel/analytics";
import { formatNewsletterCityName } from "@/lib/newsletterCopy";

type VercelEventProps = Record<string, string | number | boolean | null>;

export type NewsletterPlacement = "home" | "destinations" | "blog" | "results" | "other";

function sanitizeProps(props: Record<string, unknown>): VercelEventProps {
  const out: VercelEventProps = {};
  for (const [key, value] of Object.entries(props)) {
    if (value === undefined) continue;
    if (
      typeof value === "string" ||
      typeof value === "number" ||
      typeof value === "boolean" ||
      value === null
    ) {
      out[key] = value;
    }
  }
  return out;
}

/** Fire a Vercel Web Analytics custom event (snake_case names, no PII). */
export function trackVercelFunnelEvent(
  name: string,
  props?: Record<string, unknown>
): void {
  try {
    if (props && Object.keys(props).length > 0) {
      track(name, sanitizeProps(props));
    } else {
      track(name);
    }
  } catch {
    // Analytics must never interrupt the UI.
  }
}

/** Coarse nightly/total price band for funnel reporting (no exact amounts). */
export function priceBucket(amount?: number): string | undefined {
  if (amount == null || !Number.isFinite(amount) || amount <= 0) return undefined;
  if (amount < 75) return "under_75";
  if (amount < 150) return "75_149";
  if (amount < 300) return "150_299";
  return "300_plus";
}

export function searchSubmittedCityLabel(
  mode: "destination" | "vibe",
  destination: string,
  vibe: string,
  trackingCity?: string
): string {
  if (trackingCity?.trim()) return trackingCity.trim().slice(0, 80);
  if (mode === "destination") {
    const city = formatNewsletterCityName(destination) ?? destination.trim();
    return city.slice(0, 80) || "unknown";
  }
  const query = vibe.trim();
  return query ? query.slice(0, 80) : "vibe_search";
}

export function inferNewsletterPlacement(
  pagePath: string,
  variant: "section" | "compact" | "inline"
): NewsletterPlacement {
  if (pagePath === "/" || variant === "section") return "home";
  if (pagePath.startsWith("/destinations")) return "destinations";
  if (pagePath.startsWith("/blog")) return "blog";
  if (pagePath === "/results" || pagePath.startsWith("/results")) return "results";
  return "other";
}
