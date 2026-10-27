import { NextRequest, NextResponse } from "next/server";
import { prebook, LiteAPIError } from "@/lib/liteapi";
import { recordCheckoutEvent } from "@/lib/checkoutTelemetry";

const STALE_OFFER =
  "This rate is no longer available for these dates. Please go back to the hotel page, refresh, and choose a rate again.";

export async function POST(request: NextRequest) {
  let body: Record<string, unknown> = {};
  try {
    body = await request.json();
    const offerId = typeof body.offerId === "string" ? body.offerId : "";
    const usePaymentSdk = body.usePaymentSdk !== false;
    if (!offerId) {
      return NextResponse.json(
        { error: "offerId is required" },
        { status: 400 }
      );
    }

    const data = await prebook(offerId, usePaymentSdk);
    const prebookId = (data as { data?: { prebookId?: string } })?.data?.prebookId;
    const transactionId = (data as { data?: { transactionId?: string } })?.data?.transactionId;
    void recordCheckoutEvent({
      kind: "prebook_ok",
      prebookId,
      transactionId,
      offerId,
      hotelId: typeof body.hotelId === "string" ? body.hotelId : undefined,
    });
    return NextResponse.json(data);
  } catch (e) {
    const err = e as LiteAPIError & Error;
    const raw = (err.message ?? "").toLowerCase();
    const availabilityLike =
      /no availability|not available|availability|sold out|no longer available|invalid offer|offer expired/.test(raw);
    const message = availabilityLike ? STALE_OFFER : (err.message ?? "Prebook failed");
    const payload: { error: string; code?: number; description?: string } = { error: message };
    if (err.name === "LiteAPIError" && (err.code != null || err.description)) {
      payload.code = err.code;
      payload.description = err.description;
    }
    void recordCheckoutEvent({
      kind: "prebook_failed",
      offerId: typeof body?.offerId === "string" ? body.offerId : undefined,
      hotelId: typeof body?.hotelId === "string" ? body.hotelId : undefined,
      errorCode: payload.code,
      errorMessage: message,
    });
    return NextResponse.json(payload, { status: 500 });
  }
}
