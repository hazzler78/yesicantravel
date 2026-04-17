import { ContentStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { isAutomationAdminAuthorized } from "@/lib/automationAuth";
import { prisma } from "@/lib/prisma";

type ArchivePayload = {
  slug?: string;
  titleExact?: string;
};

export async function POST(request: NextRequest) {
  if (!isAutomationAdminAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = (await request.json()) as ArchivePayload;

    let slug = body.slug?.trim();
    if (!slug && body.titleExact?.trim()) {
      const matches = await prisma.contentItem.findMany({
        where: {
          title: body.titleExact.trim(),
          status: ContentStatus.published,
        },
        select: { id: true, slug: true, title: true },
        take: 2,
      });

      if (matches.length === 0) {
        return NextResponse.json(
          { error: "No published post found for titleExact." },
          { status: 404 }
        );
      }
      if (matches.length > 1) {
        return NextResponse.json(
          {
            error: "Multiple published posts matched titleExact. Please archive by slug.",
            matches,
          },
          { status: 409 }
        );
      }
      slug = matches[0].slug;
    }

    if (!slug) {
      return NextResponse.json(
        { error: "Provide slug or titleExact." },
        { status: 400 }
      );
    }

    const archived = await prisma.contentItem.update({
      where: { slug },
      data: {
        status: ContentStatus.archived,
        draftSource: "manual-seo-archive",
      },
      select: {
        id: true,
        slug: true,
        title: true,
        status: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({ ok: true, archived });
  } catch (error) {
    console.error("[automation/content/archive]", error);
    return NextResponse.json({ error: "Archive failed." }, { status: 500 });
  }
}
