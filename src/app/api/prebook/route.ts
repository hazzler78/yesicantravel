import { NextRequest, NextResponse } from "next/server";
import { prebook, LiteAPIError } from "@/lib/liteapi";
import {
  normalizePrebookResponse,
  prebookPaymentFieldsMissing,
} from "@/lib/liteapiPrebookNormalize";
import {
  classifyPrebookFailure,
  prebookFailureUserMessage,
} from "@/lib/checkoutPrebookErrors";
import { recordCheckoutEvent } from "@/lib/checkoutTelemetry";

export async function POST(request: NextRequest) {
  let body: Record<string, unknown> = {};
  try {
    body = await request.json();
    const offerId = typeof body.offerId === "string" ? body.offerId : "";
    const usePaymentSdk = body.usePaymentSdk !== false;
    const correlationId =
      typeof body.correlationId === "string" ? body.correlationId.slice(0, 80) : undefined;
    if (!offerId) {
      return NextResponse.json(
        { error: "offerId is required" },
        { status: 400 }
      );
    }

    const raw = await prebook(offerId, usePaymentSdk);
    const normalized = normalizePrebookResponse(raw);
    const missing = prebookPaymentFieldsMissing(normalized.data, usePaymentSdk);
    if (missing) {
      const message =
        "Card payment could not be started for this reservation. Go back, refresh rates, and try again.";
      void recordCheckoutEvent({
        kind: "prebook_failed",
        correlationId,
        offerId,
        hotelId: typeof body.hotelId === "string" ? body.hotelId : undefined,
        prebookId: normalized.data.prebookId || undefined,
        errorMessage: missing,
      });
      return NextResponse.json({ error: message, code: missing }, { status: 502 });
    }

    void recordCheckoutEvent({
      kind: "prebook_ok",
      correlationId,
      prebookId: normalized.data.prebookId,
      transactionId: normalized.data.transactionId,
      offerId,
      hotelId: typeof body.hotelId === "string" ? body.hotelId : undefined,
      metadata: {
        usePaymentSdk,
        sandbox: normalized.data.sandbox,
      },
    });
    return NextResponse.json(normalized);
  } catch (e) {
    const err = e as LiteAPIError & Error;
    const correlationId =
      typeof body?.correlationId === "string" ? body.correlationId.slice(0, 80) : undefined;
    const kind = classifyPrebookFailure(err.message ?? "", err.code);
    const message = prebookFailureUserMessage(kind, err.message ?? "Prebook failed");
    const payload: {
      error: string;
      code?: number;
      description?: string;
      failureKind?: string;
    } = { error: message, failureKind: kind };
    if (err.name === "LiteAPIError" && (err.code != null || err.description)) {
      payload.code = err.code;
      payload.description = err.description;
    }
    void recordCheckoutEvent({
      kind: "prebook_failed",
      correlationId,
      offerId: typeof body?.offerId === "string" ? body.offerId : undefined,
      hotelId: typeof body?.hotelId === "string" ? body.hotelId : undefined,
      errorCode: payload.code,
      errorMessage: message,
      metadata: { failureKind: kind },
    });
    return NextResponse.json(payload, { status: 500 });
  }
}
