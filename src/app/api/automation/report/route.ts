import { NextRequest, NextResponse } from "next/server";
import { isAutomationAdminAuthorized } from "@/lib/automationAuth";
import { prisma } from "@/lib/prisma";
import { buildMonthlyReport, monthKey } from "@/lib/revenueAgent";

export async function GET(request: NextRequest) {
  if (!isAutomationAdminAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const periodMonth = request.nextUrl.searchParams.get("periodMonth") ?? monthKey();
  const report = await prisma.monthlyReport.findUnique({ where: { periodMonth } });
  return NextResponse.json({ ok: true, periodMonth, report });
}

export async function POST(request: NextRequest) {
  if (!isAutomationAdminAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = (await request.json().catch(() => ({}))) as { periodMonth?: string };
    const periodMonth = body.periodMonth ?? monthKey();
    const report = await buildMonthlyReport(periodMonth);
    return NextResponse.json({ ok: true, report });
  } catch (error) {
    console.error("[automation/report]", error);
    return NextResponse.json({ error: "Report generation failed." }, { status: 500 });
  }
}
