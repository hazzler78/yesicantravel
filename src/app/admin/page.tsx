import Link from "next/link";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type AdminModule = {
  id: string;
  title: string;
  description: string;
  href: string;
  cta: string;
};

const modules: AdminModule[] = [
  {
    id: "search-analytics",
    title: "Search Analytics",
    description:
      "See what people search for, where results are empty, and when filters hide otherwise valid hotels.",
    href: "/admin/search-analytics",
    cta: "Open search dashboard",
  },
  {
    id: "revenue-agent",
    title: "Revenue Growth Agent",
    description: "Track monthly report, approval state, and recent automation job runs.",
    href: "/admin/revenue-agent",
    cta: "Open revenue dashboard",
  },
];

async function getQuickStats() {
  try {
    const [searchesTotal, emptySearches, searchesToday] = await Promise.all([
      prisma.searchEvent.count(),
      prisma.searchEvent.count({ where: { emptyReason: { not: null } } }),
      prisma.searchEvent.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        },
      }),
    ]);

    return {
      searchesTotal,
      emptySearches,
      searchesToday,
      emptyRate: searchesTotal > 0 ? (emptySearches / searchesTotal) * 100 : 0,
    };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2021") {
      return {
        searchesTotal: 0,
        emptySearches: 0,
        searchesToday: 0,
        emptyRate: 0,
      };
    }
    throw error;
  }
}

export default async function AdminHomePage() {
  const stats = await getQuickStats();

  return (
    <main className="mx-auto max-w-6xl px-6 py-10 text-[var(--navy)]">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      <p className="mt-2 text-sm text-[var(--navy-light)]">
        Central hub for operations dashboards. This page is intentionally modular so new admin widgets can be added
        without changing existing dashboards.
      </p>

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        <article className="rounded-xl border border-[var(--sand)] bg-white p-4">
          <p className="text-sm text-[var(--navy-light)]">Total Searches Logged</p>
          <p className="text-xl font-semibold">{stats.searchesTotal}</p>
        </article>
        <article className="rounded-xl border border-[var(--sand)] bg-white p-4">
          <p className="text-sm text-[var(--navy-light)]">Empty Search Events</p>
          <p className="text-xl font-semibold">{stats.emptySearches}</p>
        </article>
        <article className="rounded-xl border border-[var(--sand)] bg-white p-4">
          <p className="text-sm text-[var(--navy-light)]">Empty Search Rate</p>
          <p className="text-xl font-semibold">{stats.emptyRate.toFixed(1)}%</p>
          <p className="mt-1 text-xs text-[var(--navy-light)]">{stats.searchesToday} searches in the last 24h</p>
        </article>
      </section>

      <section className="mt-8 grid gap-4 md:grid-cols-2">
        {modules.map((module) => (
          <article key={module.id} className="rounded-xl border border-[var(--sand)] bg-white p-5">
            <h2 className="text-lg font-semibold">{module.title}</h2>
            <p className="mt-2 text-sm text-[var(--navy-light)]">{module.description}</p>
            <Link
              href={module.href}
              className="mt-4 inline-flex rounded-lg bg-[var(--ocean-teal)] px-4 py-2 text-sm font-semibold text-white"
            >
              {module.cta}
            </Link>
          </article>
        ))}
      </section>
    </main>
  );
}
