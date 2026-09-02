import { NextRequest, NextResponse } from "next/server";
import { LeadEventType } from "@prisma/client";
import { getAttributionFromRequest } from "@/lib/attribution";
import { logLeadEvent, upsertLeadProfile } from "@/lib/revenueAgent";
import { ensureSubscriberInNurtureGroups } from "@/lib/mailerlite";

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
      source,
    } = body as {
      email?: string;
      firstName?: string;
      lastName?: string;
      phone?: string;
      hotelId?: string;
      checkin?: string;
      checkout?: string;
      source?: "lead_magnet" | "booking" | "newsletter";
    };

    const isLeadMagnet = source === "lead_magnet";
    const campaignName = isLeadMagnet ? "solo_female_checklist" : "newsletter_signup";

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
      type: isLeadMagnet ? LeadEventType.lead_magnet_download : LeadEventType.newsletter_signup,
      eventName: isLeadMagnet ? "lead_magnet_download" : "newsletter_signup",
      leadProfileId: leadProfile?.id,
      pageUrl: isLeadMagnet ? "/lead-magnet" : undefined,
      metadata: {
        hotelId,
        checkin,
        checkout,
        source: source ?? "api_customer",
        utmSource: attribution.source,
        utmMedium: attribution.medium,
        utmCampaign: attribution.campaign,
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

    const mailerResult = await ensureSubscriberInNurtureGroups(email, {
      firstName: firstName?.trim(),
      campaignName,
      fields,
    });

    if (!mailerResult.ok) {
      return NextResponse.json(
        { saved: false, reason: mailerResult.reason ?? "MailerLite request failed" },
        { status: 200 }
      );
    }

    return NextResponse.json({ saved: true, groups: mailerResult.assignedGroups });
  } catch (e) {
    console.error("[customer]", e);
    return NextResponse.json(
      { saved: false, reason: "Server error" },
      { status: 200 }
    );
  }
}
