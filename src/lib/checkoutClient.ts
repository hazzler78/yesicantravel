import type { CheckoutGuestPayload, CheckoutStayContext } from "@/lib/checkoutGuestPersistence";
import type { CheckoutEventKind } from "@/lib/checkoutTelemetry";

export async function persistCheckoutGuestToServer(
  prebookId: string,
  holder: CheckoutGuestPayload,
  stayContext?: CheckoutStayContext
): Promise<void> {
  try {
    await fetch("/api/checkout/guest-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prebookId,
        holder,
        clientReference: stayContext?.clientReference,
        stayContext,
      }),
    });
  } catch {
    /* best-effort */
  }
}

export async function fetchCheckoutGuestFromServer(
  prebookId: string
): Promise<{ holder: CheckoutGuestPayload; clientReference?: string } | null> {
  try {
    const res = await fetch(`/api/checkout/guest-session?prebookId=${encodeURIComponent(prebookId)}`);
    if (!res.ok) return null;
    const json = (await res.json()) as {
      data?: { holder?: CheckoutGuestPayload; clientReference?: string | null };
    };
    const holder = json.data?.holder;
    if (!holder?.email || !holder.firstName) return null;
    return {
      holder,
      clientReference: json.data?.clientReference ?? undefined,
    };
  } catch {
    return null;
  }
}

type ClientCheckoutLogKind = Extract<
  CheckoutEventKind,
  | "payment_return_failed"
  | "payment_return_orphan"
  | "payment_return_guest_missing"
  | "checkout_view"
  | "checkout_guest_submit"
  | "checkout_payment_view"
  | "checkout_payment_sdk_init"
  | "checkout_payment_sdk_failed"
  | "checkout_payment_return"
  | "checkout_book_attempt"
>;

export function logCheckoutEventClient(input: {
  kind: ClientCheckoutLogKind;
  correlationId?: string;
  prebookId?: string;
  transactionId?: string;
  offerId?: string;
  hotelId?: string;
  errorCode?: number;
  errorMessage?: string;
  metadata?: Record<string, unknown>;
}): void {
  fetch("/api/checkout/event", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  }).catch(() => {});
}
