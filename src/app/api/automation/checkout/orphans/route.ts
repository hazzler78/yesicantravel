import { NextRequest, NextResponse } from "next/server";
import { isAutomationAdminAuthorized } from "@/lib/automationAuth";
import { prisma } from "@/lib/prisma";

/**
 * Lists recent prebooks that logged success but never reached book_ok (payment orphans / failures).
 * Auth: x-admin-token / REVENUE_AGENT_ADMIN_TOKEN (same as other automation routes).
 */
export async function GET(request: NextRequest) {
  if (!isAutomationAdminAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ error: "DATABASE_URL not configured" }, { status: 503 });
  }

  const limit = Math.min(100, Math.max(1, Number(request.nextUrl.searchParams.get("limit") ?? 50)));
  const sinceHours = Math.min(168, Math.max(1, Number(request.nextUrl.searchParams.get("hours") ?? 72)));
  const since = new Date(Date.now() - sinceHours * 60 * 60 * 1000);

  const orphanKinds = [
    "payment_return_orphan",
    "payment_return_guest_missing",
    "payment_return_failed",
    "prebook_ok",
    "book_failed",
  ];

  const events = await prisma.checkoutEvent.findMany({
    where: {
      createdAt: { gte: since },
      kind: { in: orphanKinds },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });

  const bookedPrebookIds = new Set(
    (
      await prisma.checkoutEvent.findMany({
        where: { kind: "book_ok", createdAt: { gte: since } },
        select: { prebookId: true },
      })
    )
      .map((r) => r.prebookId)
      .filter(Boolean) as string[]
  );

  const rows = events.filter((e) => {
    if (!e.prebookId) return true;
    if (e.kind === "book_ok") return false;
    if (e.kind === "prebook_ok" && bookedPrebookIds.has(e.prebookId)) return false;
    return true;
  });

  return NextResponse.json({
    since: since.toISOString(),
    count: rows.length,
    events: rows.map((e) => ({
      id: e.id,
      kind: e.kind,
      prebookId: e.prebookId,
      transactionId: e.transactionId,
      offerId: e.offerId,
      hotelId: e.hotelId,
      errorCode: e.errorCode,
      errorMessage: e.errorMessage,
      createdAt: e.createdAt.toISOString(),
    })),
  });
}
