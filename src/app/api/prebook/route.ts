import { NextRequest, NextResponse } from "next/server";
import { prebook, LiteAPIError } from "@/lib/liteapi";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { offerId, usePaymentSdk = true } = body;
    if (!offerId) {
      return NextResponse.json(
        { error: "offerId is required" },
        { status: 400 }
      );
    }
    const data = await prebook(offerId, usePaymentSdk);
    return NextResponse.json(data);
  } catch (e) {
    const err = e as LiteAPIError & Error;
    const payload: { error: string; code?: number; description?: string } = { error: err.message ?? "Prebook failed" };
    if (err.name === "LiteAPIError" && (err.code != null || err.description)) {
      payload.code = err.code;
      payload.description = err.description;
    }
    return NextResponse.json(payload, { status: 500 });
  }
}
