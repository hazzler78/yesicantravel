import { JobStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { isAutomationAdminAuthorized } from "@/lib/automationAuth";
import { prisma } from "@/lib/prisma";
import { buildMonthlyReport, monthKey } from "@/lib/revenueAgent";

export async function POST(request: NextRequest) {
  if (!isAutomationAdminAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const periodMonth = (await request.json().catch(() => ({} as { periodMonth?: string }))).periodMonth ?? monthKey();
  const run = await prisma.jobRun.create({
    data: { jobName: "monthly_report_send", runKey: periodMonth, status: JobStatus.running },
  });

  try {
    const report = await buildMonthlyReport(periodMonth);
    await prisma.monthlyReport.update({
      where: { id: report.id },
      data: { sentAt: new Date() },
    });
    await prisma.jobRun.update({
      where: { id: run.id },
      data: { status: JobStatus.succeeded, finishedAt: new Date() },
    });

    return NextResponse.json({
      ok: true,
      message: "Monthly report generated and marked as sent.",
      periodMonth,
      report,
    });
  } catch (error) {
    await prisma.jobRun.update({
      where: { id: run.id },
      data: {
        status: JobStatus.failed,
        finishedAt: new Date(),
        errorMessage: (error as Error).message,
      },
    });
    return NextResponse.json({ error: "Report send failed." }, { status: 500 });
  }
}
