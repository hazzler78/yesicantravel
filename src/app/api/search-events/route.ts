import { NextRequest, NextResponse } from "next/server";
import { recordSearchEvent } from "@/lib/searchAnalytics";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const event = await recordSearchEvent({
      ...body,
      referrer: body.referrer ?? request.headers.get("referer"),
      userAgent: body.userAgent ?? request.headers.get("user-agent"),
    });

    return NextResponse.json({ ok: true, id: event.id });
  } catch (e) {
    console.error("[search-events]", e);
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
