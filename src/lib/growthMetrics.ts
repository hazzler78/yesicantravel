import { prisma } from "@/lib/prisma";

/** 90-day lead goal — aligned with Cursor growth objective. */
export const GROWTH_GOAL = {
  targetLeads: 50,
  periodDays: 90,
  /** Goal tracking starts when infrastructure went live. */
  startDate: new Date("2026-09-02T00:00:00.000Z"),
} as const;

const SOCIAL_SOURCES = new Set(["instagram", "tiktok", "facebook", "pinterest"]);

export type WeeklyGrowthSnapshot = {
  weekStart: string;
  weekEnd: string;
  goal: typeof GROWTH_GOAL;
  daysElapsed: number;
  daysRemaining: number;
  signupsThisWeek: number;
  signupsInGoalPeriod: number;
  signupsRemaining: number;
  progressPercent: number;
  onPace: boolean;
  bioVisitsThisWeek: number;
  socialLandingsThisWeek: number;
  signupsBySource: Array<{ source: string; count: number }>;
};

function startOfUtcWeek(date = new Date()): Date {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  const day = d.getUTCDay();
  const diff = day === 0 ? 6 : day - 1;
  d.setUTCDate(d.getUTCDate() - diff);
  d.setUTCHours(0, 0, 0, 0);
  return d;
}

function endOfUtcWeek(weekStart: Date): Date {
  const end = new Date(weekStart);
  end.setUTCDate(end.getUTCDate() + 7);
  return end;
}

type PageVisitRow = {
  pageUrl: string | null;
  attribution: unknown;
  context: unknown;
};

function readAttributionSource(row: PageVisitRow): string | undefined {
  const attr = row.attribution as Record<string, unknown> | null;
  if (typeof attr?.source === "string") return attr.source.toLowerCase();
  const ctx = row.context as Record<string, unknown> | null;
  if (typeof ctx?.utmSource === "string") return ctx.utmSource.toLowerCase();
  return undefined;
}

function isBioVisit(row: PageVisitRow): boolean {
  const url = row.pageUrl ?? "";
  return url.includes("/bio");
}

function isSocialLanding(row: PageVisitRow): boolean {
  const source = readAttributionSource(row);
  if (source && SOCIAL_SOURCES.has(source)) return true;
  const attr = row.attribution as Record<string, unknown> | null;
  const medium = typeof attr?.medium === "string" ? attr.medium.toLowerCase() : "";
  return medium === "bio" || medium === "social" || medium === "reels";
}

export async function getWeeklyGrowthSnapshot(
  now = new Date()
): Promise<WeeklyGrowthSnapshot> {
  const weekStart = startOfUtcWeek(now);
  const weekEnd = endOfUtcWeek(weekStart);
  const goalEnd = new Date(GROWTH_GOAL.startDate);
  goalEnd.setUTCDate(goalEnd.getUTCDate() + GROWTH_GOAL.periodDays);

  const msElapsed = Math.max(0, now.getTime() - GROWTH_GOAL.startDate.getTime());
  const daysElapsed = Math.min(GROWTH_GOAL.periodDays, Math.floor(msElapsed / 86_400_000));
  const daysRemaining = Math.max(0, GROWTH_GOAL.periodDays - daysElapsed);

  const [
    signupsThisWeek,
    signupsInGoalPeriod,
    pageVisitsThisWeek,
    signupsBySourceRaw,
  ] = await Promise.all([
    prisma.leadProfile.count({
      where: { consentMarketing: true, createdAt: { gte: weekStart, lt: weekEnd } },
    }),
    prisma.leadProfile.count({
      where: { consentMarketing: true, createdAt: { gte: GROWTH_GOAL.startDate } },
    }),
    prisma.searchEvent.findMany({
      where: { mode: "page_visit", createdAt: { gte: weekStart, lt: weekEnd } },
      select: { pageUrl: true, attribution: true, context: true },
    }),
    prisma.leadProfile.groupBy({
      by: ["source"],
      where: {
        consentMarketing: true,
        createdAt: { gte: weekStart, lt: weekEnd },
        source: { not: null },
      },
      _count: { _all: true },
    }),
  ]);

  const signupsRemaining = Math.max(0, GROWTH_GOAL.targetLeads - signupsInGoalPeriod);
  const progressPercent = Math.min(
    100,
    Math.round((signupsInGoalPeriod / GROWTH_GOAL.targetLeads) * 100)
  );
  const expectedByNow =
    daysElapsed > 0 ? (GROWTH_GOAL.targetLeads / GROWTH_GOAL.periodDays) * daysElapsed : 0;

  return {
    weekStart: weekStart.toISOString().slice(0, 10),
    weekEnd: weekEnd.toISOString().slice(0, 10),
    goal: GROWTH_GOAL,
    daysElapsed,
    daysRemaining,
    signupsThisWeek,
    signupsInGoalPeriod,
    signupsRemaining,
    progressPercent,
    onPace: signupsInGoalPeriod >= expectedByNow * 0.85,
    bioVisitsThisWeek: pageVisitsThisWeek.filter(isBioVisit).length,
    socialLandingsThisWeek: pageVisitsThisWeek.filter(isSocialLanding).length,
    signupsBySource: signupsBySourceRaw
      .map((row) => ({
        source: row.source ?? "unknown",
        count: row._count._all,
      }))
      .sort((a, b) => b.count - a.count),
  };
}
