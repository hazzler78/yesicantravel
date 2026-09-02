import { NextRequest, NextResponse } from "next/server";
import { queueNurtureEvent } from "@/lib/agents/emailNurture";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as {
      email?: string;
      campaignName?: string;
      firstName?: string;
    };
    if (!body.email) return NextResponse.json({ error: "email is required." }, { status: 400 });

    const result = await queueNurtureEvent(body.email, body.campaignName, {
      firstName: body.firstName,
    });
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    console.error("[automation/email/nurture]", error);
    return NextResponse.json({ error: "Nurture queue failed." }, { status: 500 });
  }
}
