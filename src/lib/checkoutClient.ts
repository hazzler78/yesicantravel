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

export function logCheckoutEventClient(input: {
  kind: Extract<
    CheckoutEventKind,
    "payment_return_failed" | "payment_return_orphan" | "payment_return_guest_missing"
  >;
  prebookId?: string;
  transactionId?: string;
  offerId?: string;
  hotelId?: string;
  errorMessage?: string;
}): void {
  fetch("/api/checkout/event", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  }).catch(() => {});
}
