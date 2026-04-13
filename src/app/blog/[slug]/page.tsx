import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { ContentStatus } from "@prisma/client";
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
    <main className="mx-auto max-w-3xl px-6 py-10 text-[var(--navy)]">
      <article>
        <h1 className="text-3xl font-bold">{post.title}</h1>
        {post.excerpt && <p className="mt-3 text-[var(--navy-light)]">{post.excerpt}</p>}
        <div className="prose prose-slate mt-8 max-w-none">
          <ReactMarkdown>{post.bodyMarkdown}</ReactMarkdown>
        </div>
      </article>
    </main>
  );
}
