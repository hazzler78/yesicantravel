/**
 * Shared Meta Purchase tracking helpers.
 * Always use a stable event_id (`purchase_${bookingId}`) so Pixel + CAPI dedupe.
 */

export function purchaseEventId(bookingId: string): string {
  return `purchase_${bookingId}`;
}

export type PurchasePayload = {
  bookingId: string;
  value: number;
  currency: string;
  hotelId?: string;
  email?: string;
  phone?: string;
};

export function purchaseCustomData(p: PurchasePayload): Record<string, unknown> {
  return {
    value: p.value,
    currency: p.currency,
    content_ids: p.hotelId ? [p.hotelId] : undefined,
    content_type: "product",
    order_id: p.bookingId,
  };
}
