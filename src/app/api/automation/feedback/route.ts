import { NextRequest, NextResponse } from "next/server";
import { isAutomationAdminAuthorized } from "@/lib/automationAuth";
import { prisma } from "@/lib/prisma";

/**
 * Lists recent anonymous visitor feedback from /results.
 * Auth: x-admin-token / REVENUE_AGENT_ADMIN_TOKEN (same as other automation routes).
 */
export async function GET(request: NextRequest) {
  if (!isAutomationAdminAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "DATABASE_URL not configured" }, { status: 503 });
  }

  const limit = Math.min(200, Math.max(1, Number(request.nextUrl.searchParams.get("limit") ?? 50)));
  const sinceHours = Math.min(720, Math.max(1, Number(request.nextUrl.searchParams.get("hours") ?? 168)));
  const since = new Date(Date.now() - sinceHours * 60 * 60 * 1000);

  const rows = await prisma.visitorFeedback.findMany({
    where: { createdAt: { gte: since } },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  return NextResponse.json({
    since: since.toISOString(),
    count: rows.length,
    feedback: rows.map((row) => ({
      id: row.id,
      answer: row.answer,
      comment: row.comment,
      pageUrl: row.pageUrl,
      placeId: row.placeId,
      city: row.city,
      checkin: row.checkin,
      checkout: row.checkout,
      adults: row.adults,
      stayType: row.stayType,
      resultCount: row.resultCount,
      language: row.language,
      userAgent: row.userAgent,
      createdAt: row.createdAt.toISOString(),
    })),
  });
}
