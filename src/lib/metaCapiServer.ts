import crypto from "node:crypto";
import { purchaseCustomData, purchaseEventId, type PurchasePayload } from "@/lib/metaPurchase";

const META_GRAPH_VERSION = "v21.0";
const PIXEL_ID =
  process.env.META_PIXEL_ID ??
  process.env.NEXT_PUBLIC_META_PIXEL_ID ??
  "948121024567031";
const ACCESS_TOKEN = process.env.META_ACCESS_TOKEN;
const TEST_EVENT_CODE = process.env.META_TEST_EVENT_CODE;

function sha256(value: string): string {
  return crypto.createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

/**
 * Server-side Purchase via Conversions API.
 * Fires from /api/book so we still attribute when the browser never reaches /confirmation.
 * Returns quietly if META_ACCESS_TOKEN is unset (Pixel-only setups still work client-side).
 */
export async function sendServerPurchaseEvent(
  purchase: PurchasePayload,
  opts?: { eventSourceUrl?: string; clientIp?: string; userAgent?: string }
): Promise<{ ok: boolean; skipped?: boolean; error?: string }> {
  if (!ACCESS_TOKEN) {
    return { ok: false, skipped: true, error: "META_ACCESS_TOKEN missing" };
  }
  if (!purchase.bookingId || !(purchase.value > 0)) {
    return { ok: false, skipped: true, error: "bookingId/value required" };
  }

  const user_data: Record<string, unknown> = {
    client_ip_address: opts?.clientIp,
    client_user_agent: opts?.userAgent,
  };
  if (purchase.email) user_data.em = [sha256(purchase.email)];
  if (purchase.phone) {
    // Meta expects digits only before hash for phone.
    const digits = purchase.phone.replace(/\D/g, "");
    if (digits) user_data.ph = [sha256(digits)];
  }

  const payload: Record<string, unknown> = {
    data: [
      {
        event_name: "Purchase",
        event_time: Math.floor(Date.now() / 1000),
        action_source: "website",
        event_id: purchaseEventId(purchase.bookingId),
        event_source_url: opts?.eventSourceUrl || "https://yesicantravel.com/checkout",
        user_data,
        custom_data: purchaseCustomData(purchase),
      },
    ],
  };
  if (TEST_EVENT_CODE) payload.test_event_code = TEST_EVENT_CODE;

  try {
    const response = await fetch(
      `https://graph.facebook.com/${META_GRAPH_VERSION}/${PIXEL_ID}/events?access_token=${encodeURIComponent(ACCESS_TOKEN)}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );
    const result = await response.json();
    if (!response.ok) {
      console.error("[meta-capi-server] Purchase failed", result);
      return { ok: false, error: "Meta CAPI request failed" };
    }
    return { ok: true };
  } catch (error) {
    console.error("[meta-capi-server] Purchase error", error);
    return { ok: false, error: "Unexpected CAPI error" };
  }
}
