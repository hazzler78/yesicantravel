import crypto from "node:crypto";
import { NextRequest, NextResponse } from "next/server";

const META_GRAPH_VERSION = "v21.0";
const PIXEL_ID = process.env.META_PIXEL_ID ?? "948121024567031";
const ACCESS_TOKEN = process.env.META_ACCESS_TOKEN;
const TEST_EVENT_CODE = process.env.META_TEST_EVENT_CODE;

function sha256(value: string): string {
  return crypto.createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

export async function POST(request: NextRequest) {
  if (!ACCESS_TOKEN) {
    return NextResponse.json(
      { error: "META_ACCESS_TOKEN is missing in environment." },
      { status: 500 }
    );
  }

  try {
    const body = await request.json();
    const eventName = String(body?.eventName ?? "");
    const eventId = String(body?.eventId ?? "");
    if (!eventName || !eventId) {
      return NextResponse.json(
        { error: "eventName and eventId are required." },
        { status: 400 }
      );
    }

    const userDataInput = (body?.userData ?? {}) as {
      email?: string;
      phone?: string;
      fbp?: string;
      fbc?: string;
    };

    const user_data: Record<string, unknown> = {
      client_ip_address:
        request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? undefined,
      client_user_agent: request.headers.get("user-agent") ?? undefined,
      fbp: userDataInput.fbp,
      fbc: userDataInput.fbc,
    };
    if (userDataInput.email) user_data.em = [sha256(userDataInput.email)];
    if (userDataInput.phone) user_data.ph = [sha256(userDataInput.phone)];

    const payload: Record<string, unknown> = {
      data: [
        {
          event_name: eventName,
          event_time: Math.floor(Date.now() / 1000),
          action_source: "website",
          event_id: eventId,
          event_source_url:
            body?.eventSourceUrl ||
            request.headers.get("origin") ||
            "https://www.yesicantravel.com",
          user_data,
          custom_data: body?.customData ?? {},
        },
      ],
    };

    if (TEST_EVENT_CODE) payload.test_event_code = TEST_EVENT_CODE;

    const response = await fetch(
      `https://graph.facebook.com/${META_GRAPH_VERSION}/${PIXEL_ID}/events?access_token=${encodeURIComponent(
        ACCESS_TOKEN
      )}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    const result = await response.json();
    if (!response.ok) {
      return NextResponse.json(
        { error: "Meta CAPI request failed.", details: result },
        { status: 502 }
      );
    }

    return NextResponse.json({ ok: true, result });
  } catch (error) {
    return NextResponse.json(
      { error: "Unexpected CAPI server error." },
      { status: 500 }
    );
  }
}

