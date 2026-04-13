import { notFound } from "next/navigation";
import ReactMarkdown from "react-markdown";
import { ContentStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await prisma.contentItem.findUnique({ where: { slug } });
  if (!post) return {};

  return {
    title: post.seoTitle ?? post.title,
    description: post.seoDescription ?? post.excerpt ?? "",
    alternates: { canonical: `/blog/${post.slug}` },
  };
}

export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await prisma.contentItem.findUnique({ where: { slug } });
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
