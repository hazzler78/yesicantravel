import { NextRequest, NextResponse } from "next/server";
import { isAutomationAdminAuthorized } from "@/lib/automationAuth";
import { monthKey, proposeAdBudget } from "@/lib/revenueAgent";

export async function POST(request: NextRequest) {
  if (!isAutomationAdminAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = (await request.json().catch(() => ({}))) as {
      periodMonth?: string;
      allocationPercent?: number;
    };
    const periodMonth = body.periodMonth ?? monthKey();
    const allocationPercent = body.allocationPercent ?? 0.2;
    const proposal = await proposeAdBudget(periodMonth, allocationPercent);

    return NextResponse.json({
      ok: true,
      periodMonth,
      allocationPercent,
      cycle: proposal.cycle,
      approvalRequest: proposal.approval,
      recommendation: {
        googleAdsBudgetShare: 0.6,
        metaAdsBudgetShare: 0.4,
        objective: "high_intent_solo_female_booking",
      },
    });
  } catch (error) {
    console.error("[automation/ads/proposal]", error);
    return NextResponse.json({ error: "Ad proposal failed." }, { status: 500 });
  }
}
