import { ContentStatus } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { isAutomationAdminAuthorized } from "@/lib/automationAuth";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  if (!isAutomationAdminAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = (await request.json()) as { contentId?: string; approvalText?: string };
    if (!body.contentId) return NextResponse.json({ error: "contentId is required." }, { status: 400 });
    if ((body.approvalText ?? "").trim().toUpperCase() !== "YES") {
      return NextResponse.json({ error: 'Publishing requires approvalText "YES".' }, { status: 400 });
    }

    const post = await prisma.contentItem.update({
      where: { id: body.contentId },
      data: {
        status: ContentStatus.published,
        publishedAt: new Date(),
      },
    });

    return NextResponse.json({ ok: true, post });
  } catch (error) {
    console.error("[automation/content/publish]", error);
    return NextResponse.json({ error: "Publish failed." }, { status: 500 });
  }
}
