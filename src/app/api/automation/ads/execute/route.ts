import { NextRequest, NextResponse } from "next/server";
import { isAutomationAdminAuthorized } from "@/lib/automationAuth";
import { executeApprovedAds } from "@/lib/jobs/revenueJobs";
import { monthKey } from "@/lib/revenueAgent";

export async function POST(request: NextRequest) {
  if (!isAutomationAdminAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = (await request.json().catch(() => ({}))) as { periodMonth?: string };
    const periodMonth = body.periodMonth ?? monthKey();
    const result = await executeApprovedAds(periodMonth);

    if (!result.ok) {
      return NextResponse.json(
        {
          ok: false,
          periodMonth,
          blocked: true,
          reason: result.reason,
        },
        { status: 409 }
      );
    }

    return NextResponse.json({ ok: true, periodMonth, result });
  } catch (error) {
    console.error("[automation/ads/execute]", error);
    return NextResponse.json({ error: "Ad execution failed." }, { status: 500 });
  }
}
