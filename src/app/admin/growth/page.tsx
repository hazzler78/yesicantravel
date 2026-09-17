import Link from "next/link";
import { Prisma } from "@prisma/client";
import { getWeeklyGrowthSnapshot, GROWTH_GOAL } from "@/lib/growthMetrics";
import { getNurtureAutomationStatus } from "@/lib/mailerlite";
import { SOCIAL_BIO_URL, PINTEREST_PROFILE_URL } from "@/lib/reelsThisWeek";

export const dynamic = "force-dynamic";

export default async function GrowthDashboardPage() {
  let snapshot;
  let dbUnavailable = false;

  const [automation] = await Promise.all([getNurtureAutomationStatus()]);

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

  const blockers: Array<{ id: string; label: string; href: string; cta: string }> = [];
  if (!automation.enabled) {
    blockers.push({
      id: "automation",
      label: "MailerLite nurture automation is inactive — signups join the group but no emails send.",
      href: automation.dashboardUrl,
      cta: "Activate in MailerLite",
    });
  }
  if (snapshot && snapshot.bioVisitsThisWeek === 0 && snapshot.socialLandingsThisWeek === 0) {
    blockers.push({
      id: "bio",
      label: "No /bio or social UTM traffic this week — set Instagram/TikTok bio and post the carousel.",
      href: "/admin/post-now",
      cta: "Open post-now pack",
    });
  }
  if (snapshot && snapshot.signupsThisWeek === 0) {
    blockers.push({
      id: "reels",
      label: "Zero signups this week — post carousel/pins/Reels from the post-now pack.",
      href: "/admin/post-now",
      cta: "Open post-now pack",
    });
  }

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

      {blockers.length > 0 && (
        <section className="mt-6 rounded-xl border border-amber-300 bg-amber-50 p-5">
          <h2 className="text-lg font-semibold text-amber-950">Blockers (fix these first)</h2>
          <ul className="mt-3 space-y-3">
            {blockers.map((b) => (
              <li key={b.id} className="text-sm text-amber-950">
                <p>{b.label}</p>
                <a
                  href={b.href}
                  target={b.href.startsWith("http") ? "_blank" : undefined}
                  rel={b.href.startsWith("http") ? "noopener noreferrer" : undefined}
                  className="mt-1 inline-flex font-semibold text-[var(--ocean-teal)] underline-offset-2 hover:underline"
                >
                  {b.cta} →
                </a>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section className="mt-6 grid gap-4 sm:grid-cols-2">
        <article className="rounded-xl border border-[var(--sand)] bg-white p-4">
          <p className="text-sm text-[var(--navy-light)]">MailerLite nurture automation</p>
          <p
            className={`mt-1 text-lg font-semibold ${automation.enabled ? "text-emerald-700" : "text-amber-700"}`}
          >
            {automation.enabled ? "Active" : "Inactive — activate required"}
          </p>
          <p className="mt-1 text-xs text-[var(--navy-light)]">
            {automation.name ?? "Solo Safety Checklist Nurture"}
          </p>
        </article>
        <article className="rounded-xl border border-[var(--sand)] bg-white p-4">
          <p className="text-sm text-[var(--navy-light)]">Profile links</p>
          <p className="mt-2 text-xs font-semibold text-[var(--navy)]">IG / TikTok</p>
          <p className="break-all font-mono text-xs font-semibold">{SOCIAL_BIO_URL}</p>
          <p className="mt-2 text-xs font-semibold text-[var(--navy)]">Pinterest Website</p>
          <p className="break-all font-mono text-xs font-semibold">{PINTEREST_PROFILE_URL}</p>
          <p className="mt-1 text-xs text-[var(--navy-light)]">
            Do not use /bio on Pinterest — they reject link-hub / noindex pages.
          </p>
        </article>
      </section>

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

          <section className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
              <p className="text-sm text-[var(--navy-light)]">/bio checklist signups</p>
              <p className="text-2xl font-semibold">{snapshot.bioSignupsThisWeek}</p>
              <p className="mt-1 text-xs text-[var(--navy-light)]">Captured on the bio page</p>
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
              <li>Set IG/TikTok bio to {SOCIAL_BIO_URL}</li>
              <li>Set Pinterest Website to {PINTEREST_PROFILE_URL} (not /bio)</li>
              <li>Post no-film carousel or 3 Reels — Social playbook / post-now</li>
              <li>Upload Pinterest PNG pins with pin destination URLs</li>
              <li>Review /bio visits + bio checklist signups below</li>
              <li>
                Target: ~{Math.ceil(GROWTH_GOAL.targetLeads / 13)} signups/week to hit{" "}
                {GROWTH_GOAL.targetLeads} in 90 days
              </li>
            </ul>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/admin/post-now"
                className="rounded-lg bg-[var(--ocean-teal)] px-4 py-2 text-sm font-semibold text-white"
              >
                Post now
              </Link>
              <Link
                href="/admin/social-playbook"
                className="rounded-lg border border-[var(--sand)] px-4 py-2 text-sm font-semibold"
              >
                Social playbook
              </Link>
              <a
                href={automation.dashboardUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-lg border border-[var(--sand)] px-4 py-2 text-sm font-semibold"
              >
                MailerLite automation
              </a>
              <Link
                href="/bio"
                className="rounded-lg border border-[var(--sand)] px-4 py-2 text-sm font-semibold"
              >
                Preview /bio
              </Link>
            </div>
          </section>
        </>
      ) : null}
    </div>
  );
}
