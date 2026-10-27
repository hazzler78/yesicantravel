import { Prisma } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";
import { checkFeedbackRateLimit, getClientIp } from "@/lib/feedbackRateLimit";
import { prisma } from "@/lib/prisma";
import {
  parseVisitorFeedbackBody,
  shortUserAgent,
} from "@/lib/visitorFeedbackValidation";

function isMissingTableError(error: unknown): boolean {
  return error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2021";
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request);
  const limit = checkFeedbackRateLimit(ip);
  if (!limit.allowed) {
    return NextResponse.json(
      { ok: false, error: "rate_limited" },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSec ?? 60) } },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  const parsed = parseVisitorFeedbackBody(body);
  if (!parsed.ok) {
    return NextResponse.json({ ok: false, error: parsed.error }, { status: 400 });
  }

  const data = parsed.data;
  const userAgent =
    data.userAgent ?? shortUserAgent(request.headers.get("user-agent"));

  if (!process.env.DATABASE_URL) {
    console.warn("[feedback] DATABASE_URL not configured — accepting without persist");
    return NextResponse.json({ ok: true, persisted: false }, { status: 202 });
  }

  try {
    const row = await prisma.visitorFeedback.create({
      data: {
        answer: data.answer,
        comment: data.comment,
        pageUrl: data.pageUrl,
        placeId: data.placeId,
        city: data.city,
        checkin: data.checkin,
        checkout: data.checkout,
        adults: data.adults,
        stayType: data.stayType,
        resultCount: data.resultCount,
        language: data.language,
        userAgent,
      },
    });
    return NextResponse.json({ ok: true, id: row.id, persisted: true }, { status: 200 });
  } catch (error) {
    if (isMissingTableError(error)) {
      console.error(
        "[feedback] VisitorFeedback table missing — apply prisma/migrations/20251027180000_visitor_feedback/migration.sql or prisma db push before deploy",
      );
      return NextResponse.json({ ok: true, persisted: false, reason: "table_missing" }, { status: 202 });
    }
    console.error("[feedback]", error);
    return NextResponse.json({ ok: true, persisted: false, reason: "server_error" }, { status: 202 });
  }
}
