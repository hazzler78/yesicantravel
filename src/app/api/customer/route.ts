import { NextRequest, NextResponse } from "next/server";
import { LeadEventType } from "@prisma/client";
import { getAttributionFromRequest } from "@/lib/attribution";
import { logLeadEvent, upsertLeadProfile } from "@/lib/revenueAgent";
import { upsertMailerLiteSubscriber } from "@/lib/mailerlite";

/**
 * Save customer to MailerLite after a successful booking.
 * Use segments/groups in MailerLite to suggest hotels by interest (e.g. by last destination).
 * Requires: MAILERLITE_API_KEY. Optional: MAILERLITE_GROUP_ID (add subscriber to this group).
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      email,
      firstName,
      lastName,
      phone,
      hotelId,
      checkin,
      checkout,
    } = body as {
      email?: string;
      firstName?: string;
      lastName?: string;
      phone?: string;
      hotelId?: string;
      checkin?: string;
      checkout?: string;
    };

    if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Valid email is required" }, { status: 400 });
    }

    const attribution = await getAttributionFromRequest();
    const leadProfile = await upsertLeadProfile(
      {
        email,
        firstName,
        lastName,
        phone,
        consentMarketing: true,
      },
      attribution
    );
    await logLeadEvent({
      type: LeadEventType.newsletter_signup,
      eventName: "newsletter_signup",
      leadProfileId: leadProfile?.id,
      metadata: {
        hotelId,
        checkin,
        checkout,
        source: "api_customer",
      },
    });

    const apiKey = process.env.MAILERLITE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { saved: true, reason: "Lead stored, MailerLite not configured" },
        { status: 200 }
      );
    }

    const fields: Record<string, string> = {
      name: (firstName ?? "").trim() || "—",
      last_name: (lastName ?? "").trim() || "—",
    };
    if (phone && String(phone).trim()) fields.phone = String(phone).trim();
    if (process.env.MAILERLITE_SAVE_INTERESTS === "1") {
      if (hotelId && String(hotelId).trim()) fields.last_hotel_id = String(hotelId).trim();
      if (checkin && String(checkin).trim()) fields.last_checkin = String(checkin).trim();
      if (checkout && String(checkout).trim()) fields.last_checkout = String(checkout).trim();
    }

    const groupId = process.env.MAILERLITE_GROUP_ID;
    const groups: string[] = [];
    if (groupId?.trim()) groups.push(groupId.trim());
    const nurtureGroup = process.env.MAILERLITE_NURTURE_GROUP_ID?.trim();
    if (nurtureGroup && !groups.includes(nurtureGroup)) groups.push(nurtureGroup);

    const mailerResult = await upsertMailerLiteSubscriber({
      email,
      fields,
      groups: groups.length > 0 ? groups : undefined,
    });

    if (!mailerResult.ok) {
      return NextResponse.json(
        { saved: false, reason: mailerResult.reason ?? "MailerLite request failed" },
        { status: 200 }
      );
    }

    return NextResponse.json({ saved: true });
  } catch (e) {
    console.error("[customer]", e);
    return NextResponse.json(
      { saved: false, reason: "Server error" },
      { status: 200 }
    );
  }
}
