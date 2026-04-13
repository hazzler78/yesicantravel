import { NextRequest, NextResponse } from "next/server";
import { isAutomationAdminAuthorized } from "@/lib/automationAuth";
import { executeApprovedAds, runMonthlyRevenueCycle } from "@/lib/jobs/revenueJobs";
import { monthKey } from "@/lib/revenueAgent";

export async function POST(request: NextRequest) {
  if (!isAutomationAdminAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json().catch(() => ({}))) as {
      mode?: "monthly" | "ads_execute";
      periodMonth?: string;
    };
    const mode = body.mode ?? "monthly";
    const periodMonth = body.periodMonth ?? monthKey();

    if (mode === "monthly") {
      const result = await runMonthlyRevenueCycle(periodMonth);
      return NextResponse.json({ ok: true, mode, periodMonth, result });
    }

    const result = await executeApprovedAds(periodMonth);
    return NextResponse.json({ ok: result.ok, mode, periodMonth, result });
  } catch (error) {
    console.error("[automation/jobs/run]", error);
    return NextResponse.json({ error: "Job execution failed." }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  if (!isAutomationAdminAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const mode = (request.nextUrl.searchParams.get("mode") as "monthly" | "ads_execute" | null) ?? "monthly";
    const periodMonth = request.nextUrl.searchParams.get("periodMonth") ?? monthKey();
    if (mode === "monthly") {
      const result = await runMonthlyRevenueCycle(periodMonth);
      return NextResponse.json({ ok: true, mode, periodMonth, result });
    }
    const result = await executeApprovedAds(periodMonth);
    return NextResponse.json({ ok: result.ok, mode, periodMonth, result });
  } catch (error) {
    console.error("[automation/jobs/run][GET]", error);
    return NextResponse.json({ error: "Job execution failed." }, { status: 500 });
  }
}
