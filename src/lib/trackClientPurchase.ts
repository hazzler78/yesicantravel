"use client";

import { fbqTrack } from "@/lib/metaPixel";
import { sendMetaCapiEvent } from "@/lib/metaCapi";
import {
  purchaseCustomData,
  purchaseEventId,
  type PurchasePayload,
} from "@/lib/metaPurchase";

const SENT_KEY_PREFIX = "meta_purchase_sent_";

/**
 * Client Purchase (Pixel + CAPI) with stable event_id dedupe.
 * Safe to call from checkout "done" and confirmation — Meta dedupes on event_id;
 * sessionStorage also prevents repeat fires in the same browser tab session.
 */
export function trackClientPurchase(
  purchase: PurchasePayload,
  opts?: { eventSourceUrl?: string }
): boolean {
  if (typeof window === "undefined") return false;
  if (!purchase.bookingId || !(purchase.value > 0) || !purchase.currency) return false;

  const sentKey = `${SENT_KEY_PREFIX}${purchase.bookingId}`;
  try {
    if (sessionStorage.getItem(sentKey) === "1") return false;
  } catch {
    // private mode / blocked storage — still fire; Meta event_id dedupes
  }

  const eventId = purchaseEventId(purchase.bookingId);
  const customData = purchaseCustomData(purchase);
  const eventSourceUrl = opts?.eventSourceUrl ?? window.location.href;

  fbqTrack("Purchase", customData, { eventId });
  void sendMetaCapiEvent({
    eventName: "Purchase",
    eventId,
    eventSourceUrl,
    customData,
    userData: {
      email: purchase.email,
      phone: purchase.phone,
    },
  });

  try {
    sessionStorage.setItem(sentKey, "1");
  } catch {
    // ignore
  }
  return true;
}
