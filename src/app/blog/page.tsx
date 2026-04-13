import Link from "next/link";
import { ContentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Solo Travel Safety Blog",
  description: "SEO guides and destination safety content for women traveling solo.",
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
    <main className="mx-auto max-w-4xl px-6 py-10 text-[var(--navy)]">
      <h1 className="text-3xl font-bold">Solo Travel Safety Blog</h1>
      <p className="mt-3 text-[var(--navy-light)]">
        Practical destination guides and booking-safe tips for women traveling solo.
      </p>

      <div className="mt-8 space-y-4">
        {dbUnavailable && (
          <p className="text-sm text-[var(--coral)]">
            Blog is temporarily unavailable while data connection is being restored.
          </p>
        )}
        {posts.length === 0 && <p className="text-sm text-[var(--navy-light)]">No published guides yet.</p>}
        {posts.map((post) => (
          <article key={post.id} className="rounded-xl border border-[var(--sand)] bg-white p-5 shadow-sm">
            <h2 className="text-xl font-semibold">
              <Link className="hover:underline" href={`/blog/${post.slug}`}>
                {post.title}
              </Link>
            </h2>
            {post.excerpt && <p className="mt-2 text-sm text-[var(--navy-light)]">{post.excerpt}</p>}
          </article>
        ))}
      </div>
    </main>
  );
}
