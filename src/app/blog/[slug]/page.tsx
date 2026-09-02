import { notFound } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { ContentStatus } from "@prisma/client";
import LeadMagnetForm from "@/components/LeadMagnetForm";
import { ShareButton } from "@/components/ShareButton";
import { Card } from "@/components/ui/Card";
import { PrimaryLink } from "@/components/ui/PrimaryButton";
import { SecondaryLink } from "@/components/ui/SecondaryButton";
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
    alternates: { canonical: `https://yesicantravel.com/blog/${post.slug}` },
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
        slug: string;
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
        slug: true,
      },
    });
  } catch {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <p className="rounded-card border border-border bg-coral-soft p-5 text-[0.9375rem] text-ink">
          This guide is temporarily unavailable while we restore the data connection.
        </p>
      </div>
    );
  }
  if (!post || post.status !== ContentStatus.published) notFound();

  const canonicalUrl = `https://yesicantravel.com/blog/${post.slug}`;
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt ?? undefined,
    url: canonicalUrl,
    publisher: {
      "@type": "Organization",
      name: "Yes I Can Travel",
      url: "https://yesicantravel.com",
    },
  };

  return (
    <div className="bg-canvas">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:py-14">
        <article className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-teal">
            Solo travel safety guide
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold leading-tight tracking-tight text-ink sm:text-4xl">
            {post.title}
          </h1>
          {post.excerpt && (
            <p className="mt-4 text-base leading-relaxed text-ink-muted">{post.excerpt}</p>
          )}

          <div className="mt-5">
            <ShareButton
              title={post.title}
              path={`/blog/${post.slug}`}
              campaign={`blog_${post.slug}`}
            />
          </div>

          <div className="mt-8">
            <ReactMarkdown
              components={{
                h2: ({ children }) => (
                  <h2 className="mt-9 font-display text-2xl font-semibold tracking-tight text-ink">
                    {children}
                  </h2>
                ),
                h3: ({ children }) => (
                  <h3 className="mt-6 font-display text-lg font-semibold text-ink">{children}</h3>
                ),
                p: ({ children }) => (
                  <p className="mt-4 text-[1.0625rem] leading-[1.75] text-ink">{children}</p>
                ),
                ul: ({ children }) => (
                  <ul className="mt-4 list-disc space-y-2 pl-6 text-[1.0625rem] leading-[1.75] text-ink">
                    {children}
                  </ul>
                ),
                ol: ({ children }) => (
                  <ol className="mt-4 list-decimal space-y-2 pl-6 text-[1.0625rem] leading-[1.75] text-ink">
                    {children}
                  </ol>
                ),
                li: ({ children }) => <li>{children}</li>,
                a: ({ children, href }) => (
                  <a href={href} className="text-teal underline underline-offset-4">
                    {children}
                  </a>
                ),
              }}
            >
              {post.bodyMarkdown}
            </ReactMarkdown>
          </div>

          <Card className="mt-10 p-5">
            <h2 className="font-display text-lg font-semibold text-ink">
              Ready to look at actual rooms?
            </h2>
            <p className="mt-1.5 text-[0.9375rem] text-ink-muted">
              Search stays with reception hours, location and cancellation terms shown up front.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <PrimaryLink href="/" variant="coral" size="md" fullWidth={false}>
                Start a search
              </PrimaryLink>
              <SecondaryLink href="/lead-magnet">Get the free checklist</SecondaryLink>
            </div>
          </Card>
        </article>

        <aside className="space-y-4">
          <Card className="p-5">
            <h2 className="font-display text-base font-semibold text-ink">
              Get the safety checklist
            </h2>
            <p className="mt-1.5 text-[0.9375rem] text-ink-muted">
              A practical checklist for vetting hotels and planning arrivals.
            </p>
            <LeadMagnetForm />
          </Card>
          <Card className="p-5">
            <h2 className="font-display text-base font-semibold text-ink">Explore next</h2>
            <ul className="mt-3 space-y-2 text-[0.9375rem]">
              <li>
                <Link href="/blog" className="text-teal underline-offset-4 hover:underline">
                  All guides
                </Link>
              </li>
              <li>
                <Link href="/popular-cities" className="text-teal underline-offset-4 hover:underline">
                  Popular cities
                </Link>
              </li>
              <li>
                <Link href="/" className="text-teal underline-offset-4 hover:underline">
                  Search stays
                </Link>
              </li>
            </ul>
          </Card>
        </aside>
      </div>
    </div>
  );
}
