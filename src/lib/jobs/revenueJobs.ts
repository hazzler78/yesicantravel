import { JobStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { buildMonthlyReport, monthKey, proposeAdBudget, validateAdExecutionApproval } from "@/lib/revenueAgent";
import { seedKeywordTargets } from "@/lib/agents/keywordResearch";
import { generateScheduledDrafts } from "@/lib/agents/contentGenerator";

async function startRun(jobName: string, runKey?: string) {
  return prisma.jobRun.create({
    data: { jobName, runKey, status: JobStatus.running, context: { startedBy: "scheduler" } },
  });
}

async function finishRun(id: string, status: JobStatus, errorMessage?: string, context?: Record<string, unknown>) {
  await prisma.jobRun.update({
    where: { id },
    data: {
      status,
      finishedAt: new Date(),
      errorMessage,
      context: context ?? undefined,
    },
  });
}

export async function runMonthlyRevenueCycle(periodMonth = monthKey()) {
  const keywordRun = await startRun("keyword_seed", periodMonth);
  try {
    const seeded = await seedKeywordTargets();
    await finishRun(keywordRun.id, JobStatus.succeeded, undefined, { seeded: seeded.length });
  } catch (error) {
    await finishRun(keywordRun.id, JobStatus.failed, (error as Error).message);
    throw error;
  }

  const draftRun = await startRun("content_draft_generation", periodMonth);
  try {
    const drafts = await generateScheduledDrafts(4);
    await finishRun(draftRun.id, JobStatus.succeeded, undefined, { created: drafts.length });
  } catch (error) {
    await finishRun(draftRun.id, JobStatus.failed, (error as Error).message);
    throw error;
  }

  const reportRun = await startRun("monthly_report", periodMonth);
  try {
    const report = await buildMonthlyReport(periodMonth);
    await finishRun(reportRun.id, JobStatus.succeeded, undefined, { reportId: report.id });
  } catch (error) {
    await finishRun(reportRun.id, JobStatus.failed, (error as Error).message);
    throw error;
  }

  const budgetRun = await startRun("ad_budget_proposal", periodMonth);
  try {
    const budget = await proposeAdBudget(periodMonth);
    await finishRun(budgetRun.id, JobStatus.succeeded, undefined, {
      adBudgetCycleId: budget.cycle.id,
      approvalRequestId: budget.approval.id,
    });
    return budget;
  } catch (error) {
    await finishRun(budgetRun.id, JobStatus.failed, (error as Error).message);
    throw error;
  }
}

export async function executeApprovedAds(periodMonth = monthKey()) {
  const run = await startRun("ads_execute", periodMonth);
  try {
    const approval = await validateAdExecutionApproval(periodMonth);
    if (!approval.allowed) {
      await finishRun(run.id, JobStatus.blocked, approval.reason, { periodMonth });
      return { ok: false, reason: approval.reason };
    }

    await finishRun(run.id, JobStatus.succeeded, undefined, {
      periodMonth,
      execution: "stubbed_campaign_sync",
    });
    return { ok: true, reason: "Approved and executed." };
  } catch (error) {
    await finishRun(run.id, JobStatus.failed, (error as Error).message);
    throw error;
  }
}
