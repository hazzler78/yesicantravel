import { track } from "@vercel/analytics";

/**
 * Canonical funnel event names. These are the 5 events we watch in Clarity + Vercel Analytics
 * to diagnose drop-off. Keep this list small and stable — dashboards depend on the exact spelling.
 */
export type FunnelEvent =
  | "Search"
  | "HotelClick"
  | "CheckoutStart"
  | "PaymentSubmit"
  | "BookingSuccess";

type ClarityFn = (...args: unknown[]) => void;

function getClarity(): ClarityFn | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as { clarity?: ClarityFn };
  return typeof w.clarity === "function" ? w.clarity : null;
}

/**
 * Emit a canonical funnel event to both Vercel Analytics and Microsoft Clarity (if loaded).
 * Clarity gets a custom `event` entry and a `set` tag so sessions can be filtered by funnel stage.
 */
export function trackFunnelEvent(
  name: FunnelEvent,
  data?: Record<string, string | number | boolean | null | undefined>,
) {
  const sanitized = data
    ? Object.fromEntries(
        Object.entries(data).filter(([, v]) => v !== undefined),
      )
    : undefined;

  try {
    track(name, sanitized as Record<string, string | number | boolean | null>);
  } catch {
    // Analytics never throws visibly; ignore.
  }

  const clarity = getClarity();
  if (clarity) {
    try {
      clarity("event", name);
      clarity("set", "funnel_stage", name);
    } catch {
      // Clarity may be blocked by ad blockers; don't surface errors.
    }
  }
}
