import { NextRequest, NextResponse } from "next/server";
import { queueNurtureEvent } from "@/lib/agents/emailNurture";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as { email?: string; campaignName?: string };
    if (!body.email) return NextResponse.json({ error: "email is required." }, { status: 400 });

    const event = await queueNurtureEvent(body.email, body.campaignName);
    return NextResponse.json({ ok: true, queued: Boolean(event), event });
  } catch (error) {
    console.error("[automation/email/nurture]", error);
    return NextResponse.json({ error: "Nurture queue failed." }, { status: 500 });
  }
}
