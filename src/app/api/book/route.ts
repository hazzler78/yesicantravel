import { NextRequest, NextResponse } from "next/server";
import { book, LiteAPIError } from "@/lib/liteapi";
import { sendServerPurchaseEvent } from "@/lib/metaCapiServer";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prebookId, transactionId, paymentMethod, holder, guests, clientReference } = body;
    if (!prebookId || !holder || !guests?.length) {
      return NextResponse.json(
        { error: "prebookId, holder and guests are required" },
        { status: 400 }
      );
    }
    const { firstName, lastName, email, phone } = holder ?? {};
    if (!firstName || !lastName || !email || phone == null || String(phone).trim() === "") {
      return NextResponse.json(
        { error: "holder must include firstName, lastName, email, and phone" },
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
      holder: { firstName, lastName, email, phone: String(phone).trim() },
      guests,
      clientReference: typeof clientReference === "string" ? clientReference : undefined,
    });

    // Server-side Purchase so Meta still gets the conversion if the browser
    // never opens /confirmation (common after payment return).
    try {
      const booking = (data as { data?: Record<string, unknown> })?.data ?? data;
      const bookingObj = booking as {
        bookingId?: string;
        price?: number;
        currency?: string;
        hotel?: { hotelId?: string };
      };
      const bookingId = bookingObj.bookingId;
      const price = bookingObj.price;
      if (bookingId && typeof price === "number" && price > 0) {
        const forwarded = request.headers.get("x-forwarded-for");
        void sendServerPurchaseEvent(
          {
            bookingId,
            value: price,
            currency: bookingObj.currency ?? "EUR",
            hotelId: bookingObj.hotel?.hotelId,
            email,
            phone: String(phone).trim(),
          },
          {
            eventSourceUrl: request.headers.get("origin")
              ? `${request.headers.get("origin")}/checkout`
              : "https://yesicantravel.com/checkout",
            clientIp: forwarded?.split(",")[0]?.trim(),
            userAgent: request.headers.get("user-agent") ?? undefined,
          }
        );
      }
    } catch {
      // never fail the booking because of analytics
    }

    return NextResponse.json(data);
  } catch (e) {
    const err = e as LiteAPIError & Error;
    const message = err.message ?? "Booking failed";
    const payload: { error: string; code?: number; description?: string } = { error: message };
    if (err.name === "LiteAPIError" && (err.code != null || err.description)) {
      payload.code = err.code;
      payload.description = err.description;
    }
    return NextResponse.json(payload, { status: 500 });
  }
}
