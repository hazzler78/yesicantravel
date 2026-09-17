import { NextRequest, NextResponse } from "next/server";
import { getAttributionFromRequest } from "@/lib/attribution";
import { prisma } from "@/lib/prisma";

type PageVisitBody = {
  path?: string;
  sessionId?: string;
};

/** Funnel pages we always persist (even without UTM) so checkout traffic is queryable in DB. */
function isFunnelPath(path: string): boolean {
  return (
    path === "/" ||
    path === "/bio" ||
    path === "/checkout" ||
    path === "/confirmation" ||
    path === "/results" ||
    path.startsWith("/hotel/") ||
    path.startsWith("/destinations/") ||
    path.startsWith("/events/")
  );
}

/** Log page visits for social/UTM landings + key funnel paths (checkout included). */
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as PageVisitBody;
    const path = body.path?.trim();
    if (!path || !path.startsWith("/")) {
      return NextResponse.json({ ok: false, reason: "invalid_path" }, { status: 400 });
    }

    const attribution = await getAttributionFromRequest();
    const referrer = attribution.referrer;
    const userAgent = request.headers.get("user-agent") ?? undefined;

    const hasSocialSignal =
      Boolean(attribution.source) ||
      Boolean(attribution.medium) ||
      Boolean(attribution.campaign) ||
      path === "/bio";

    if (!hasSocialSignal && !isFunnelPath(path)) {
      return NextResponse.json({ ok: true, skipped: true });
    }

    await prisma.searchEvent.create({
      data: {
        mode: "page_visit",
        pageUrl: path,
        referrer,
        userAgent,
        sessionId: body.sessionId?.trim() || undefined,
        attribution: attribution as object,
        context: {
          utmSource: attribution.source,
          utmMedium: attribution.medium,
          utmCampaign: attribution.campaign,
          landingPage: attribution.landingPage,
          funnel: isFunnelPath(path),
        },
      },
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("[analytics/page]", error);
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
