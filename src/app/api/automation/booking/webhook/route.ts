import { NextRequest, NextResponse } from "next/server";
import { getAttributionFromRequest } from "@/lib/attribution";
import { upsertLeadProfile, upsertBookingWithRevenue } from "@/lib/revenueAgent";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      bookingId?: string;
      status?: string;
      email?: string;
      hotelId?: string;
      hotelName?: string;
      checkin?: string;
      checkout?: string;
      price?: number;
      currency?: string;
      commissionRate?: number;
    };

    if (!body.bookingId || body.price == null) {
      return NextResponse.json({ error: "bookingId and price are required." }, { status: 400 });
    }

    const attribution = await getAttributionFromRequest();
    const lead = body.email ? await upsertLeadProfile({ email: body.email }, attribution) : null;
    const booking = await upsertBookingWithRevenue({
      bookingId: body.bookingId,
      status: body.status ?? "confirmed",
      hotelId: body.hotelId,
      hotelName: body.hotelName,
      checkin: body.checkin,
      checkout: body.checkout,
      grossRevenue: body.price,
      currency: body.currency ?? "EUR",
      commissionRate: body.commissionRate,
      leadProfileId: lead?.id,
      attribution,
    });

    return NextResponse.json({ ok: true, booking });
  } catch (error) {
    console.error("[automation/booking/webhook]", error);
    return NextResponse.json({ error: "Webhook ingest failed." }, { status: 500 });
  }
}
