import { ApprovalStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { isAutomationAdminAuthorized } from "@/lib/automationAuth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  if (!isAutomationAdminAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = (await request.json()) as {
      approvalRequestId: string;
      decision: "approve" | "reject";
      approvalText?: string;
      note?: string;
    };

    if (!body.approvalRequestId || !body.decision) {
      return NextResponse.json({ error: "approvalRequestId and decision are required." }, { status: 400 });
    }

    const requestRow = await prisma.approvalRequest.findUnique({
      where: { id: body.approvalRequestId },
      include: { adBudgetCycle: true },
    });
    if (!requestRow) {
      return NextResponse.json({ error: "Approval request not found." }, { status: 404 });
    }

    const isApprove = body.decision === "approve";
    const status = isApprove ? ApprovalStatus.approved : ApprovalStatus.rejected;

    if (isApprove && (body.approvalText ?? "").trim().toUpperCase() !== "YES") {
      return NextResponse.json(
        { error: 'Approval rejected: approvalText must be exact "YES".' },
        { status: 400 }
      );
    }

    const updated = await prisma.approvalRequest.update({
      where: { id: body.approvalRequestId },
      data: {
        status,
        approvalText: body.approvalText,
        resolvedAt: new Date(),
        responseData: { note: body.note ?? null },
      },
    });

    if (requestRow.adBudgetCycleId) {
      const proposed = requestRow.adBudgetCycle?.proposedBudget ?? 0;
      await prisma.adBudgetCycle.update({
        where: { id: requestRow.adBudgetCycleId },
        data: {
          status,
          approvedBudget: isApprove ? proposed : 0,
          notes: body.note ?? undefined,
        },
      });
    }

    return NextResponse.json({ ok: true, request: updated });
  } catch (error) {
    console.error("[automation/approval]", error);
    return NextResponse.json({ error: "Approval update failed." }, { status: 500 });
  }
}
