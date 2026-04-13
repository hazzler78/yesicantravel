import { NextRequest, NextResponse } from "next/server";
import { isAutomationAdminAuthorized } from "@/lib/automationAuth";
import { generateScheduledDrafts } from "@/lib/agents/contentGenerator";

export async function POST(request: NextRequest) {
  if (!isAutomationAdminAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = (await request.json().catch(() => ({}))) as { limit?: number };
    const drafts = await generateScheduledDrafts(body.limit ?? 3);
    return NextResponse.json({ ok: true, created: drafts.length, drafts });
  } catch (error) {
    console.error("[automation/content/generate]", error);
    return NextResponse.json({ error: "Draft generation failed." }, { status: 500 });
  }
}
