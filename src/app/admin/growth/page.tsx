import Link from "next/link";
import { Prisma } from "@prisma/client";
import { getWeeklyGrowthSnapshot, GROWTH_GOAL } from "@/lib/growthMetrics";

export const dynamic = "force-dynamic";

export default async function GrowthDashboardPage() {
  let snapshot;
  let dbUnavailable = false;

  try {
    snapshot = await getWeeklyGrowthSnapshot();
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2021") {
      dbUnavailable = true;
    } else {
      throw error;
    }
  }

  const goalEnd = new Date(GROWTH_GOAL.startDate);
  goalEnd.setUTCDate(goalEnd.getUTCDate() + GROWTH_GOAL.periodDays);

  return (
    <div className="mx-auto max-w-4xl px-6 py-10 text-[var(--navy)]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--ocean-teal)]">
            90-day growth goal
          </p>
          <h1 className="mt-1 text-3xl font-bold">Weekly lead metrics</h1>
          <p className="mt-2 text-sm text-[var(--navy-light)]">
            Target: {GROWTH_GOAL.targetLeads} email leads via lead magnet, /bio, and 3 Reels/week.
            Every signup should land in MailerLite nurture and trigger automation.
          </p>
        </div>
        <Link
          href="/admin"
          className="rounded-lg border border-[var(--sand)] px-4 py-2 text-sm font-semibold text-[var(--navy)]"
        >
          ← Admin home
        </Link>
      </div>

      {dbUnavailable ? (
        <p className="mt-8 rounded-xl border border-[var(--sand)] bg-white p-4 text-sm text-[var(--navy-light)]">
          Database not available in this environment. Set DATABASE_URL to see live metrics.
        </p>
      ) : snapshot ? (
        <>
          <section className="mt-8 rounded-xl border border-[var(--sand)] bg-white p-5">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-sm text-[var(--navy-light)]">Progress toward {GROWTH_GOAL.targetLeads}</p>
                <p className="text-4xl font-bold">{snapshot.signupsInGoalPeriod}</p>
                <p className="mt-1 text-sm text-[var(--navy-light)]">
                  {snapshot.signupsRemaining} remaining · day {snapshot.daysElapsed} of{" "}
                  {GROWTH_GOAL.periodDays}
                </p>
              </div>
              <div className="text-right">
                <p
                  className={`text-sm font-semibold ${snapshot.onPace ? "text-emerald-700" : "text-amber-700"}`}
                >
                  {snapshot.onPace ? "On pace" : "Behind pace"}
                </p>
                <p className="text-2xl font-semibold">{snapshot.progressPercent}%</p>
              </div>
            </div>
            <div className="mt-4 h-3 overflow-hidden rounded-full bg-[var(--sand)]">
              <div
                className="h-full rounded-full bg-[var(--ocean-teal)] transition-all"
                style={{ width: `${snapshot.progressPercent}%` }}
              />
            </div>
            <p className="mt-3 text-xs text-[var(--navy-light)]">
              Goal period: {GROWTH_GOAL.startDate.toISOString().slice(0, 10)} →{" "}
              {goalEnd.toISOString().slice(0, 10)}
            </p>
          </section>

          <section className="mt-6 grid gap-4 md:grid-cols-3">
            <article className="rounded-xl border border-[var(--sand)] bg-white p-4">
              <p className="text-sm text-[var(--navy-light)]">Signups this week</p>
              <p className="text-2xl font-semibold">{snapshot.signupsThisWeek}</p>
              <p className="mt-1 text-xs text-[var(--navy-light)]">
                Week {snapshot.weekStart} → {snapshot.weekEnd}
              </p>
            </article>
            <article className="rounded-xl border border-[var(--sand)] bg-white p-4">
              <p className="text-sm text-[var(--navy-light)]">/bio visits this week</p>
              <p className="text-2xl font-semibold">{snapshot.bioVisitsThisWeek}</p>
              <p className="mt-1 text-xs text-[var(--navy-light)]">Link-in-bio traffic</p>
            </article>
            <article className="rounded-xl border border-[var(--sand)] bg-white p-4">
              <p className="text-sm text-[var(--navy-light)]">Social landings this week</p>
              <p className="text-2xl font-semibold">{snapshot.socialLandingsThisWeek}</p>
              <p className="mt-1 text-xs text-[var(--navy-light)]">UTM-tagged clicks from social</p>
            </article>
          </section>

          {snapshot.signupsBySource.length > 0 && (
            <section className="mt-6 rounded-xl border border-[var(--sand)] bg-white p-5">
              <h2 className="text-lg font-semibold">Signups by source (this week)</h2>
              <ul className="mt-3 space-y-2">
                {snapshot.signupsBySource.map((row) => (
                  <li
                    key={row.source}
                    className="flex items-center justify-between text-sm"
                  >
                    <span className="capitalize text-[var(--navy-light)]">{row.source}</span>
                    <span className="font-semibold">{row.count}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="mt-8 rounded-xl border border-dashed border-[var(--sand)] bg-white/60 p-5">
            <h2 className="text-lg font-semibold">Weekly checklist</h2>
            <ul className="mt-3 space-y-2 text-sm text-[var(--navy-light)]">
              <li>Post 3 core videos (TikTok + Reels) — use templates in Social playbook</li>
              <li>Update bio link to yesicantravel.com/bio</li>
              <li>Check MailerLite: new signups in nurture group + automation running</li>
              <li>Review GA4 Realtime + Clarity for drop-off on /lead-magnet</li>
              <li>Target: ~{Math.ceil(GROWTH_GOAL.targetLeads / 13)} signups/week to hit 50 in 90 days</li>
            </ul>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/admin/social-playbook"
                className="rounded-lg bg-[var(--ocean-teal)] px-4 py-2 text-sm font-semibold text-white"
              >
                Social playbook
              </Link>
              <Link
                href="/bio"
                className="rounded-lg border border-[var(--sand)] px-4 py-2 text-sm font-semibold"
              >
                Preview /bio
              </Link>
              <Link
                href="/lead-magnet"
                className="rounded-lg border border-[var(--sand)] px-4 py-2 text-sm font-semibold"
              >
                Preview lead magnet
              </Link>
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}
