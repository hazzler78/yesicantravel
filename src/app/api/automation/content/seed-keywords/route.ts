import { NextRequest, NextResponse } from "next/server";
import { seedKeywordTargets } from "@/lib/agents/keywordResearch";
import { isAutomationAdminAuthorized } from "@/lib/automationAuth";

export async function POST(request: NextRequest) {
  if (!isAutomationAdminAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const rows = await seedKeywordTargets();
    return NextResponse.json({ ok: true, seeded: rows.length, rows });
  } catch (error) {
    console.error("[automation/content/seed-keywords]", error);
    return NextResponse.json({ error: "Keyword seeding failed." }, { status: 500 });
  }
}
