import Link from "next/link";
import { ContentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Solo Travel Safety Blog",
  description: "SEO guides and destination safety content for women traveling solo.",
  alternates: {
    canonical: "https://yesicantravel.com/blog",
  },
};

export default async function BlogIndexPage() {
  let posts: Array<{
    id: string;
    slug: string;
    title: string;
    excerpt: string | null;
  }> = [];
  let dbUnavailable = false;
  try {
    posts = await prisma.contentItem.findMany({
      where: { status: ContentStatus.published },
      orderBy: { publishedAt: "desc" },
      take: 100,
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
      },
    });
  } catch {
    dbUnavailable = true;
  }

  return (
    <div className="bg-canvas">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 md:py-14">
        <header className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-teal">Guides</p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink md:text-4xl">
            Solo travel, city by city
          </h1>
          <p className="mt-3 text-[0.9375rem] text-ink-muted md:text-base">
            Practical destination guides and booking tips for women travelling on their own.
          </p>
        </header>

        <div className="mt-8 space-y-3">
          {dbUnavailable && (
            <p className="rounded-card border border-border bg-coral-soft p-4 text-[0.9375rem] text-ink">
              Guides are temporarily unavailable while we restore the data connection.
            </p>
          )}
          {!dbUnavailable && posts.length === 0 && (
            <p className="rounded-card border border-border bg-surface p-6 text-[0.9375rem] text-ink-muted">
              No published guides yet — the first ones are on the way.
            </p>
          )}
          {posts.map((post) => (
            <article
              key={post.id}
              className="rounded-card border border-border bg-surface p-5 shadow-card transition-colors hover:border-border-strong"
            >
              <h2 className="font-display text-xl font-semibold text-ink">
                <Link className="hover:text-teal" href={`/blog/${post.slug}`}>
                  {post.title}
                </Link>
              </h2>
              {post.excerpt && (
                <p className="mt-2 text-[0.9375rem] leading-relaxed text-ink-muted">
                  {post.excerpt}
                </p>
              )}
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
