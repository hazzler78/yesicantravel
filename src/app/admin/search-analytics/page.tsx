import Link from "next/link";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

function formatRelative(date: Date) {
  const diffMs = Date.now() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 1) return "just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHours = Math.floor(diffMin / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
}

async function getSearchDashboard(days: number) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

  try {
    const [totalSearches, emptySearches, apiNoResults, filteredOut, topQueries, topEmptyQueries, modeBreakdown, latest] =
      await Promise.all([
        prisma.searchEvent.count({ where: { createdAt: { gte: since } } }),
        prisma.searchEvent.count({ where: { createdAt: { gte: since }, emptyReason: { not: null } } }),
        prisma.searchEvent.count({ where: { createdAt: { gte: since }, emptyReason: "no_api_results" } }),
        prisma.searchEvent.count({ where: { createdAt: { gte: since }, emptyReason: "filtered_out" } }),
        prisma.searchEvent.groupBy({
          by: ["normalizedQuery"],
          where: { createdAt: { gte: since }, normalizedQuery: { not: null } },
          _count: { _all: true },
          orderBy: { _count: { normalizedQuery: "desc" } },
          take: 12,
        }),
        prisma.searchEvent.groupBy({
          by: ["normalizedQuery", "emptyReason"],
          where: {
            createdAt: { gte: since },
            normalizedQuery: { not: null },
            emptyReason: { not: null },
          },
          _count: { _all: true },
          orderBy: { _count: { normalizedQuery: "desc" } },
          take: 12,
        }),
        prisma.searchEvent.groupBy({
          by: ["mode"],
          where: { createdAt: { gte: since } },
          _count: { _all: true },
          orderBy: { _count: { mode: "desc" } },
        }),
        prisma.searchEvent.findMany({
          where: { createdAt: { gte: since } },
          orderBy: { createdAt: "desc" },
          take: 30,
          select: {
            id: true,
            createdAt: true,
            mode: true,
            placeId: true,
            aiSearch: true,
            normalizedQuery: true,
            emptyReason: true,
            apiRateCount: true,
            enrichedHotelCount: true,
            filteredHotelCount: true,
          },
        }),
      ]);

    return {
      since,
      totalSearches,
      emptySearches,
      apiNoResults,
      filteredOut,
      topQueries,
      topEmptyQueries,
      modeBreakdown,
      latest,
      emptyRate: totalSearches > 0 ? (emptySearches / totalSearches) * 100 : 0,
    };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2021") {
      return {
        since,
        totalSearches: 0,
        emptySearches: 0,
        apiNoResults: 0,
        filteredOut: 0,
        topQueries: [],
        topEmptyQueries: [],
        modeBreakdown: [],
        latest: [],
        emptyRate: 0,
      };
    }
    throw error;
  }
}

export default async function SearchAnalyticsPage({
  searchParams,
}: {
  searchParams: Promise<{ days?: string }>;
}) {
  const { days: rawDays } = await searchParams;
  const days = Math.max(1, Math.min(90, Number(rawDays ?? "7") || 7));
  const data = await getSearchDashboard(days);

  return (
    <main className="mx-auto max-w-7xl px-6 py-10 text-[var(--navy)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold">Search Analytics</h1>
          <p className="mt-2 text-sm text-[var(--navy-light)]">
            What people searched for, where results failed, and where filters hid viable hotel results.
          </p>
        </div>
        <div className="flex gap-2">
          {[7, 14, 30].map((windowDays) => (
            <Link
              key={windowDays}
              href={`/admin/search-analytics?days=${windowDays}`}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium ${
                windowDays === days
                  ? "bg-[var(--ocean-teal)] text-white"
                  : "border border-[var(--sand)] bg-white text-[var(--navy-light)]"
              }`}
            >
              {windowDays}d
            </Link>
          ))}
          <Link
            href="/admin"
            className="rounded-lg border border-[var(--sand)] bg-white px-3 py-1.5 text-sm font-medium text-[var(--navy-light)]"
          >
            Back to admin
          </Link>
        </div>
      </div>

      <section className="mt-6 grid gap-4 md:grid-cols-4">
        <article className="rounded-xl border border-[var(--sand)] bg-white p-4">
          <p className="text-sm text-[var(--navy-light)]">Searches ({days}d)</p>
          <p className="text-2xl font-semibold">{data.totalSearches}</p>
        </article>
        <article className="rounded-xl border border-[var(--sand)] bg-white p-4">
          <p className="text-sm text-[var(--navy-light)]">Empty Results</p>
          <p className="text-2xl font-semibold">{data.emptySearches}</p>
        </article>
        <article className="rounded-xl border border-[var(--sand)] bg-white p-4">
          <p className="text-sm text-[var(--navy-light)]">Empty Rate</p>
          <p className="text-2xl font-semibold">{data.emptyRate.toFixed(1)}%</p>
        </article>
        <article className="rounded-xl border border-[var(--sand)] bg-white p-4">
          <p className="text-sm text-[var(--navy-light)]">API Empty / Filtered Out</p>
          <p className="text-2xl font-semibold">
            {data.apiNoResults} / {data.filteredOut}
          </p>
        </article>
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-3">
        <article className="rounded-xl border border-[var(--sand)] bg-white p-5 lg:col-span-1">
          <h2 className="text-lg font-semibold">Mode breakdown</h2>
          <div className="mt-3 space-y-2 text-sm">
            {data.modeBreakdown.map((row) => (
              <div key={row.mode} className="flex items-center justify-between rounded border border-[var(--sand)]/70 px-3 py-2">
                <span className="capitalize">{row.mode}</span>
                <strong>{row._count._all}</strong>
              </div>
            ))}
            {data.modeBreakdown.length === 0 && <p className="text-[var(--navy-light)]">No data yet.</p>}
          </div>
        </article>

        <article className="rounded-xl border border-[var(--sand)] bg-white p-5 lg:col-span-2">
          <h2 className="text-lg font-semibold">Top searches</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-[var(--navy-light)]">
                <tr>
                  <th className="pb-2">Query</th>
                  <th className="pb-2">Count</th>
                </tr>
              </thead>
              <tbody>
                {data.topQueries.map((row) => (
                  <tr key={`${row.normalizedQuery ?? "unknown"}-${row._count._all}`} className="border-t border-[var(--sand)]/70">
                    <td className="py-2">{row.normalizedQuery ?? "(none)"}</td>
                    <td className="py-2">{row._count._all}</td>
                  </tr>
                ))}
                {data.topQueries.length === 0 && (
                  <tr>
                    <td className="py-2 text-[var(--navy-light)]" colSpan={2}>
                      No searches in this period.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </article>
      </section>

      <section className="mt-6 grid gap-4 lg:grid-cols-2">
        <article className="rounded-xl border border-[var(--sand)] bg-white p-5">
          <h2 className="text-lg font-semibold">Top empty queries</h2>
          <div className="mt-3 overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="text-[var(--navy-light)]">
                <tr>
                  <th className="pb-2">Query</th>
                  <th className="pb-2">Reason</th>
                  <th className="pb-2">Count</th>
                </tr>
              </thead>
              <tbody>
                {data.topEmptyQueries.map((row) => (
                  <tr
                    key={`${row.normalizedQuery ?? "unknown"}-${row.emptyReason ?? "none"}-${row._count._all}`}
                    className="border-t border-[var(--sand)]/70"
                  >
                    <td className="py-2">{row.normalizedQuery ?? "(none)"}</td>
                    <td className="py-2">{row.emptyReason ?? "-"}</td>
                    <td className="py-2">{row._count._all}</td>
                  </tr>
                ))}
                {data.topEmptyQueries.length === 0 && (
                  <tr>
                    <td className="py-2 text-[var(--navy-light)]" colSpan={3}>
                      No empty searches in this period.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </article>

        <article className="rounded-xl border border-[var(--sand)] bg-white p-5">
          <h2 className="text-lg font-semibold">Recent searches</h2>
          <div className="mt-3 space-y-2 text-sm">
            {data.latest.map((event) => (
              <div key={event.id} className="rounded border border-[var(--sand)]/70 px-3 py-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium">
                    {event.normalizedQuery ?? event.aiSearch ?? event.placeId ?? "(unknown search)"}
                  </p>
                  <p className="text-xs text-[var(--navy-light)]">{formatRelative(event.createdAt)}</p>
                </div>
                <p className="mt-1 text-xs text-[var(--navy-light)]">
                  mode: {event.mode} | rates: {event.apiRateCount} | enriched: {event.enrichedHotelCount} | shown:{" "}
                  {event.filteredHotelCount}
                  {event.emptyReason ? ` | emptyReason: ${event.emptyReason}` : ""}
                </p>
              </div>
            ))}
            {data.latest.length === 0 && <p className="text-[var(--navy-light)]">No recent searches.</p>}
          </div>
        </article>
      </section>
    </main>
  );
}
