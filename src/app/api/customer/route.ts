import { NextRequest, NextResponse } from "next/server";

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

    const apiKey = process.env.MAILERLITE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { saved: false, reason: "MailerLite not configured" },
        { status: 200 }
      );
    }

    const fields: Record<string, string> = {
      name: (firstName ?? "").trim() || "—",
      last_name: (lastName ?? "").trim() || "—",
    };
    if (phone && String(phone).trim()) fields.phone = String(phone).trim();
    // For interest-based suggestions: create custom fields in MailerLite (Subscribers → Fields):
    // last_hotel_id, last_checkin, last_checkout. Then set MAILERLITE_SAVE_INTERESTS=1
    if (process.env.MAILERLITE_SAVE_INTERESTS === "1") {
      if (hotelId && String(hotelId).trim()) fields.last_hotel_id = String(hotelId).trim();
      if (checkin && String(checkin).trim()) fields.last_checkin = String(checkin).trim();
      if (checkout && String(checkout).trim()) fields.last_checkout = String(checkout).trim();
    }

    const groupId = process.env.MAILERLITE_GROUP_ID;
    const payload: { email: string; fields: Record<string, string>; groups?: string[] } = {
      email: email.trim().toLowerCase(),
      fields,
    };
    if (groupId && groupId.trim()) payload.groups = [groupId.trim()];

    const res = await fetch("https://connect.mailerlite.com/api/subscribers", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error("[customer] MailerLite error:", res.status, err);
      return NextResponse.json(
        { saved: false, reason: "MailerLite request failed" },
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
