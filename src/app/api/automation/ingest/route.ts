import { LeadEventType } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { getAttributionFromRequest } from "@/lib/attribution";
import { logLeadEvent, upsertBookingWithRevenue, upsertLeadProfile } from "@/lib/revenueAgent";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      kind: "lead" | "booking" | "event";
      lead?: { email: string; firstName?: string; lastName?: string; phone?: string; consentMarketing?: boolean };
      booking?: {
        bookingId: string;
        status: string;
        hotelId?: string;
        hotelName?: string;
        checkin?: string;
        checkout?: string;
        grossRevenue: number;
        currency?: string;
        commissionRate?: number;
        leadEmail?: string;
      };
      event?: {
        type: LeadEventType;
        eventName: string;
        eventId?: string;
        pageUrl?: string;
        contentSlug?: string;
        leadEmail?: string;
        metadata?: Record<string, unknown>;
      };
    };

    const attribution = await getAttributionFromRequest();

    if (body.kind === "lead" && body.lead) {
      const lead = await upsertLeadProfile(body.lead, attribution);
      await logLeadEvent({
        type: LeadEventType.newsletter_signup,
        eventName: "newsletter_signup",
        leadProfileId: lead?.id,
        metadata: { source: "signup_form" },
      });
      return NextResponse.json({ ok: true, leadId: lead?.id });
    }

    if (body.kind === "booking" && body.booking) {
      let leadProfileId: string | undefined;
      if (body.booking.leadEmail) {
        const lead = await upsertLeadProfile({ email: body.booking.leadEmail }, attribution);
        leadProfileId = lead?.id;
      }

      const booking = await upsertBookingWithRevenue({
        bookingId: body.booking.bookingId,
        status: body.booking.status,
        hotelId: body.booking.hotelId,
        hotelName: body.booking.hotelName,
        checkin: body.booking.checkin,
        checkout: body.booking.checkout,
        grossRevenue: body.booking.grossRevenue,
        currency: body.booking.currency,
        commissionRate: body.booking.commissionRate,
        leadProfileId,
        attribution,
      });

      await logLeadEvent({
        type: LeadEventType.booking_completed,
        eventName: "booking_completed",
        leadProfileId,
        metadata: { bookingId: booking.bookingId },
      });

      return NextResponse.json({ ok: true, bookingId: booking.bookingId });
    }

    if (body.kind === "event" && body.event) {
      let leadProfileId: string | undefined;
      if (body.event.leadEmail) {
        const lead = await upsertLeadProfile({ email: body.event.leadEmail }, attribution);
        leadProfileId = lead?.id;
      }
      await logLeadEvent({
        type: body.event.type,
        eventName: body.event.eventName,
        eventId: body.event.eventId,
        pageUrl: body.event.pageUrl,
        contentSlug: body.event.contentSlug,
        leadProfileId,
        metadata: body.event.metadata,
      });
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  } catch (error) {
    console.error("[automation/ingest]", error);
    return NextResponse.json({ error: "Ingest failed." }, { status: 500 });
  }
}
