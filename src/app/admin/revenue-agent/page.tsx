import Link from "next/link";
import RevenueAgentActionPanel from "@/components/admin/RevenueAgentActionPanel";
import { prisma } from "@/lib/prisma";
import { monthKey } from "@/lib/revenueAgent";

async function getData(periodMonth: string) {
  const [report, cycle, approval, jobs] = await Promise.all([
    prisma.monthlyReport.findUnique({ where: { periodMonth } }),
    prisma.adBudgetCycle.findUnique({ where: { periodMonth } }),
    prisma.approvalRequest.findFirst({
      where: { periodMonth, requestType: "ads_budget" },
      orderBy: { requestedAt: "desc" },
    }),
    prisma.jobRun.findMany({ orderBy: { startedAt: "desc" }, take: 10 }),
  ]);

  return { report, cycle, approval, jobs };
}

export default async function RevenueAgentAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ periodMonth?: string }>;
}) {
  const { periodMonth: rawPeriod } = await searchParams;
  const periodMonth = rawPeriod ?? monthKey();
  const { report, cycle, approval, jobs } = await getData(periodMonth);

  return (
    <main className="mx-auto max-w-5xl px-6 py-10 text-[var(--navy)]">
      <h1 className="text-3xl font-bold">Revenue Growth Agent</h1>
      <p className="mt-2 text-sm text-[var(--navy-light)]">
        Monthly cycle view for content, leads, bookings, revenue, and approval-gated ad reinvestment.
      </p>

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        <article className="rounded-xl border border-[var(--sand)] bg-white p-4">
          <p className="text-sm text-[var(--navy-light)]">Period</p>
          <p className="text-xl font-semibold">{periodMonth}</p>
        </article>
        <article className="rounded-xl border border-[var(--sand)] bg-white p-4">
          <p className="text-sm text-[var(--navy-light)]">Commission Revenue</p>
          <p className="text-xl font-semibold">€{(report?.commissionRevenue ?? 0).toFixed(2)}</p>
        </article>
        <article className="rounded-xl border border-[var(--sand)] bg-white p-4">
          <p className="text-sm text-[var(--navy-light)]">Proposed Ad Budget</p>
          <p className="text-xl font-semibold">€{(cycle?.proposedBudget ?? 0).toFixed(2)}</p>
        </article>
      </section>

      <section className="mt-6 rounded-xl border border-[var(--sand)] bg-white p-5">
        <h2 className="text-lg font-semibold">Approval status</h2>
        <p className="mt-2 text-sm">
          Current: <strong>{approval?.status ?? "none"}</strong>
        </p>
        <p className="mt-2 text-sm text-[var(--navy-light)]">
          Ads cannot execute unless approval text is exactly <strong>YES</strong>.
        </p>
        <div className="mt-4 flex gap-3">
          <Link
            className="rounded-lg bg-[var(--ocean-teal)] px-4 py-2 text-sm font-semibold text-white"
            href={`/api/automation/report?periodMonth=${periodMonth}`}
          >
            View raw report JSON
          </Link>
        </div>
      </section>

      <RevenueAgentActionPanel periodMonth={periodMonth} approvalRequestId={approval?.id} />

      <section className="mt-6 rounded-xl border border-[var(--sand)] bg-white p-5">
        <h2 className="text-lg font-semibold">Recent job runs</h2>
        <div className="mt-3 space-y-2 text-sm">
          {jobs.map((job) => (
            <div key={job.id} className="rounded border border-[var(--sand)]/70 px-3 py-2">
              <p>
                <strong>{job.jobName}</strong> - {job.status}
              </p>
              <p className="text-[var(--navy-light)]">{new Date(job.startedAt).toLocaleString()}</p>
            </div>
          ))}
          {jobs.length === 0 && <p className="text-[var(--navy-light)]">No job runs yet.</p>}
        </div>
      </section>
    </main>
  );
}
