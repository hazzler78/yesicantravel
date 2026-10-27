import { NextRequest, NextResponse } from "next/server";
import { recordCheckoutEvent, type CheckoutEventKind } from "@/lib/checkoutTelemetry";

const CLIENT_KINDS: CheckoutEventKind[] = [
  "payment_return_failed",
  "payment_return_orphan",
  "payment_return_guest_missing",
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const kind = body.kind as CheckoutEventKind;
    if (!CLIENT_KINDS.includes(kind)) {
      return NextResponse.json({ error: "Invalid event kind" }, { status: 400 });
    }
    await recordCheckoutEvent({
      kind,
      prebookId: typeof body.prebookId === "string" ? body.prebookId : undefined,
      transactionId: typeof body.transactionId === "string" ? body.transactionId : undefined,
      offerId: typeof body.offerId === "string" ? body.offerId : undefined,
      hotelId: typeof body.hotelId === "string" ? body.hotelId : undefined,
      errorMessage: typeof body.errorMessage === "string" ? body.errorMessage : undefined,
      metadata:
        body.metadata && typeof body.metadata === "object"
          ? (body.metadata as Record<string, unknown>)
          : undefined,
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to record event" }, { status: 500 });
  }
}
