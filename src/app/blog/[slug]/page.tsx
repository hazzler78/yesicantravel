import { notFound } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { ContentStatus } from "@prisma/client";
import LeadMagnetForm from "@/components/LeadMagnetForm";
import { prisma } from "@/lib/prisma";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let post: { slug: string; seoTitle: string | null; title: string; seoDescription: string | null; excerpt: string | null } | null = null;
  try {
    post = await prisma.contentItem.findUnique({
      where: { slug },
      select: {
        slug: true,
        seoTitle: true,
        title: true,
        seoDescription: true,
        excerpt: true,
      },
    });
  } catch {
    return {
      title: "Solo Travel Safety Blog",
      description: "Blog post temporarily unavailable.",
    };
  }
  if (!post) return {};

  return {
    title: post.seoTitle ?? post.title,
    description: post.seoDescription ?? post.excerpt ?? "",
    alternates: { canonical: `/blog/${post.slug}` },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  let post:
    | {
        title: string;
        excerpt: string | null;
        bodyMarkdown: string;
        status: ContentStatus;
      }
    | null = null;
  try {
    post = await prisma.contentItem.findUnique({
      where: { slug },
      select: {
        title: true,
        excerpt: true,
        bodyMarkdown: true,
        status: true,
      },
    });
  } catch {
    return (
      <main className="mx-auto max-w-3xl px-6 py-10 text-[var(--navy)]">
        <p className="text-[var(--coral)]">
          This blog post is temporarily unavailable while data connection is being restored.
        </p>
      </main>
    );
  }
  if (!post || post.status !== ContentStatus.published) notFound();

  return (
    <main className="min-h-screen bg-[var(--sand)] text-[var(--navy)]">
      <div className="border-b border-[var(--sand)] bg-white/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="text-lg font-semibold text-[var(--navy)]">
            Yes I Can Travel
          </Link>
          <nav className="flex items-center gap-4 text-sm font-medium text-[var(--navy-light)]">
            <Link href="/" className="hover:text-[var(--ocean-teal)]">Home</Link>
            <Link href="/blog" className="hover:text-[var(--ocean-teal)]">Blog</Link>
            <Link href="/lead-magnet" className="hover:text-[var(--ocean-teal)]">Free checklist</Link>
          </nav>
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl gap-8 px-6 py-10 lg:grid-cols-[1fr_320px]">
        <article className="rounded-2xl border border-[var(--sand)] bg-white p-6 shadow-sm sm:p-8">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-[var(--ocean-teal)]">
            Solo travel safety guide
          </p>
          <h1 className="text-3xl font-bold leading-tight sm:text-4xl">{post.title}</h1>
          {post.excerpt && <p className="mt-4 text-base text-[var(--navy-light)]">{post.excerpt}</p>}

          <div className="mt-8 space-y-4">
            <ReactMarkdown
              components={{
                h2: ({ children }) => (
                  <h2 className="mt-8 text-2xl font-semibold text-[var(--navy)]">{children}</h2>
                ),
                p: ({ children }) => (
                  <p className="text-[15px] leading-7 text-[var(--navy)]/90">{children}</p>
                ),
                ul: ({ children }) => (
                  <ul className="list-disc space-y-1 pl-6 text-[15px] leading-7 text-[var(--navy)]/90">{children}</ul>
                ),
                ol: ({ children }) => (
                  <ol className="list-decimal space-y-1 pl-6 text-[15px] leading-7 text-[var(--navy)]/90">{children}</ol>
                ),
                li: ({ children }) => <li>{children}</li>,
              }}
            >
              {post.bodyMarkdown}
            </ReactMarkdown>
          </div>

          <div className="mt-10 rounded-xl border border-[var(--ocean-teal)]/30 bg-[var(--ocean-teal)]/10 p-5">
            <h3 className="text-lg font-semibold">Ready to find a safer stay?</h3>
            <p className="mt-1 text-sm text-[var(--navy-light)]">
              Compare safety-first hotel options and use confidence filters built for solo women travelers.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                href="/"
                className="rounded-lg bg-[var(--ocean-teal)] px-4 py-2 text-sm font-semibold text-white"
              >
                Start search
              </Link>
              <Link
                href="/lead-magnet"
                className="rounded-lg border border-[var(--ocean-teal)] px-4 py-2 text-sm font-semibold text-[var(--ocean-teal)]"
              >
                Get free checklist
              </Link>
            </div>
          </div>
        </article>

        <aside className="space-y-4">
          <div className="rounded-2xl border border-[var(--sand)] bg-white p-5 shadow-sm">
            <h3 className="text-base font-semibold">Get the safety checklist</h3>
            <p className="mt-1 text-sm text-[var(--navy-light)]">
              Free practical checklist for choosing safer hotels and arrivals.
            </p>
            <LeadMagnetForm />
          </div>
          <div className="rounded-2xl border border-[var(--sand)] bg-white p-5 shadow-sm">
            <h3 className="text-base font-semibold">Explore next</h3>
            <div className="mt-3 flex flex-col gap-2 text-sm">
              <Link href="/blog" className="text-[var(--ocean-teal)] hover:underline">All guides</Link>
              <Link href="/popular-cities" className="text-[var(--ocean-teal)] hover:underline">Popular safe cities</Link>
              <Link href="/" className="text-[var(--ocean-teal)] hover:underline">Search stays</Link>
            </div>
          </div>
        </aside>
      </div>
    </main>
  );
}
