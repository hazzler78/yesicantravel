import { notFound } from "next/navigation";
import Link from "next/link";
import ReactMarkdown from "react-markdown";
import { ContentStatus } from "@prisma/client";
import LeadMagnetForm from "@/components/LeadMagnetForm";
import { AskChatGptCta } from "@/components/AskChatGptCta";
import { ShareButton } from "@/components/ShareButton";
import { Card } from "@/components/ui/Card";
import { PrimaryLink } from "@/components/ui/PrimaryButton";
import { SecondaryLink } from "@/components/ui/SecondaryButton";
import { prisma } from "@/lib/prisma";
import { BLOG_TO_DESTINATION_SLUG } from "@/lib/relatedGuides";
import { getDestinationBySlug } from "@/data/destinations";
import { ogImageForPath } from "@/lib/readyPins";

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

  const title = post.seoTitle ?? post.title;
  const description = post.seoDescription ?? post.excerpt ?? "";
  const canonical = `https://yesicantravel.com/blog/${post.slug}`;
  const ogImage = ogImageForPath(`/blog/${post.slug}`);
  const absoluteTitle = title.includes("Yes I Can Travel")
    ? title
    : `${title} | Yes I Can Travel`;

  return {
    title: { absolute: absoluteTitle },
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      url: canonical,
      type: "article",
      ...(ogImage
        ? {
            images: [
              {
                url: ogImage,
                width: 1000,
                height: 1500,
                alt: post.title,
              },
            ],
          }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(ogImage ? { images: [ogImage] } : {}),
    },
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

  const destinationSlug = BLOG_TO_DESTINATION_SLUG[post.slug];
  const destination = destinationSlug
    ? getDestinationBySlug(destinationSlug)
    : undefined;
  const destinationFaqs = destination?.faqs;
  const faqJsonLd =
    destinationFaqs && destinationFaqs.length > 0
      ? {
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: destinationFaqs.map((f) => ({
            "@type": "Question",
            name: f.question,
            acceptedAnswer: { "@type": "Answer", text: f.answer },
          })),
        }
      : null;

  return (
    <div className="bg-canvas">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      {faqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
      )}
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

          {/* Mobile: capture before the scroll — desktop uses sticky sidebar */}
          <Card className="mt-6 p-5 lg:hidden">
            <h2 className="font-display text-base font-semibold text-ink">
              Get the safety checklist
            </h2>
            <p className="mt-1.5 text-[0.9375rem] text-ink-muted">
              Free — reception hours, arrival after dark, what to check before you book.
            </p>
            <LeadMagnetForm pagePath={`/blog/${post.slug}`} compact />
            {destination && (
              <div className="mt-3">
                <AskChatGptCta
                  compact
                  city={destination.city}
                  citySlug={destination.slug}
                />
              </div>
            )}
          </Card>

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

        <aside className="hidden space-y-4 lg:block lg:sticky lg:top-24 lg:self-start">
          <Card className="p-5">
            <h2 className="font-display text-base font-semibold text-ink">
              Get the safety checklist
            </h2>
            <p className="mt-1.5 text-[0.9375rem] text-ink-muted">
              A practical checklist for vetting hotels and planning arrivals.
            </p>
            <LeadMagnetForm pagePath={`/blog/${post.slug}`} compact />
            {destination && (
              <div className="mt-3">
                <AskChatGptCta
                  compact
                  city={destination.city}
                  citySlug={destination.slug}
                />
              </div>
            )}
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
