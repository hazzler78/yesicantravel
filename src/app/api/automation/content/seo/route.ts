import { NextRequest, NextResponse } from "next/server";
import { isAutomationAdminAuthorized } from "@/lib/automationAuth";
import { prisma } from "@/lib/prisma";

type SeoPatch = {
  slug?: string;
  seoTitle?: string;
  seoDescription?: string;
  targetKeyword?: string;
  title?: string;
};

/**
 * Update SEO fields only — avoids re-uploading bodyMarkdown for CTR retunes.
 */
export async function POST(request: NextRequest) {
  if (!isAutomationAdminAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as SeoPatch;
    if (!body.slug || !body.seoTitle) {
      return NextResponse.json({ error: "slug and seoTitle are required." }, { status: 400 });
    }

    const post = await prisma.contentItem.update({
      where: { slug: body.slug },
      data: {
        seoTitle: body.seoTitle,
        ...(body.seoDescription !== undefined ? { seoDescription: body.seoDescription } : {}),
        ...(body.targetKeyword !== undefined ? { targetKeyword: body.targetKeyword } : {}),
        ...(body.title !== undefined ? { title: body.title } : {}),
      },
      select: { id: true, slug: true, seoTitle: true, seoDescription: true, updatedAt: true },
    });

    return NextResponse.json({ ok: true, post });
  } catch (error) {
    console.error("[automation/content/seo]", error);
    return NextResponse.json({ error: "SEO update failed." }, { status: 500 });
  }
}
