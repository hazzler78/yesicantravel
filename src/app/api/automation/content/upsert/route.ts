import { ContentStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { isAutomationAdminAuthorized } from "@/lib/automationAuth";
import { prisma } from "@/lib/prisma";

type UpsertContentPayload = {
  slug?: string;
  title?: string;
  excerpt?: string;
  bodyMarkdown?: string;
  seoTitle?: string;
  seoDescription?: string;
  targetKeyword?: string;
  destination?: string;
  publish?: boolean;
};

export async function POST(request: NextRequest) {
  if (!isAutomationAdminAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as UpsertContentPayload;

    if (!body.slug || !body.title || !body.bodyMarkdown) {
      return NextResponse.json(
        { error: "slug, title, and bodyMarkdown are required." },
        { status: 400 }
      );
    }

    const publishNow = body.publish ?? true;
    const now = new Date();

    const post = await prisma.contentItem.upsert({
      where: { slug: body.slug },
      create: {
        slug: body.slug,
        title: body.title,
        excerpt: body.excerpt,
        bodyMarkdown: body.bodyMarkdown,
        seoTitle: body.seoTitle,
        seoDescription: body.seoDescription,
        targetKeyword: body.targetKeyword,
        destination: body.destination,
        status: publishNow ? ContentStatus.published : ContentStatus.review,
        publishedAt: publishNow ? now : null,
        // Marks manual editorial ownership to avoid accidental workflow confusion.
        draftSource: "manual-seo-override",
      },
      update: {
        title: body.title,
        excerpt: body.excerpt,
        bodyMarkdown: body.bodyMarkdown,
        seoTitle: body.seoTitle,
        seoDescription: body.seoDescription,
        targetKeyword: body.targetKeyword,
        destination: body.destination,
        status: publishNow ? ContentStatus.published : undefined,
        publishedAt: publishNow ? now : undefined,
        draftSource: "manual-seo-override",
      },
      select: {
        id: true,
        slug: true,
        title: true,
        status: true,
        publishedAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ ok: true, post });
  } catch (error) {
    console.error("[automation/content/upsert]", error);
    return NextResponse.json({ error: "Content upsert failed." }, { status: 500 });
  }
}
