import { NextRequest, NextResponse } from "next/server";
import { book } from "@/lib/liteapi";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prebookId, transactionId, paymentMethod, holder, guests } = body;
    if (!prebookId || !holder || !guests?.length) {
      return NextResponse.json(
        { error: "prebookId, holder and guests are required" },
        { status: 400 }
      );
    }
    const payment =
      paymentMethod === "ACC_CREDIT_CARD"
        ? { method: "ACC_CREDIT_CARD" as const }
        : transactionId
          ? { method: "TRANSACTION_ID" as const, transactionId }
          : null;
    if (!payment) {
      return NextResponse.json(
        { error: "Either transactionId (for User Payment) or paymentMethod ACC_CREDIT_CARD is required" },
        { status: 400 }
      );
    }
    const data = await book({
      prebookId,
      payment,
      holder,
      guests,
    });
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message },
      { status: 500 }
    );
  }
}
