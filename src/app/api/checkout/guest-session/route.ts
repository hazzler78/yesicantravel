import { NextRequest, NextResponse } from "next/server";
import {
  deleteCheckoutGuestSession,
  getCheckoutGuestSession,
  upsertCheckoutGuestSession,
} from "@/lib/checkoutTelemetry";

type Holder = { firstName: string; lastName: string; email: string; phone: string };

function parseHolder(raw: unknown): Holder | null {
  if (!raw || typeof raw !== "object") return null;
  const h = raw as Record<string, unknown>;
  const firstName = String(h.firstName ?? "").trim();
  const lastName = String(h.lastName ?? "").trim();
  const email = String(h.email ?? "").trim();
  const phone = String(h.phone ?? "").trim();
  if (!firstName || !lastName || !email || !phone) return null;
  return { firstName, lastName, email, phone };
}

export async function GET(request: NextRequest) {
  const prebookId = request.nextUrl.searchParams.get("prebookId")?.trim();
  if (!prebookId) {
    return NextResponse.json({ error: "prebookId is required" }, { status: 400 });
  }
  const row = await getCheckoutGuestSession(prebookId);
  if (!row) {
    return NextResponse.json({ data: null }, { status: 404 });
  }
  return NextResponse.json({
    data: {
      holder: row.holder,
      clientReference: row.clientReference,
      stayContext: row.stayContext,
    },
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const prebookId = String(body.prebookId ?? "").trim();
    const holder = parseHolder(body.holder);
    if (!prebookId || !holder) {
      return NextResponse.json(
        { error: "prebookId and holder (firstName, lastName, email, phone) are required" },
        { status: 400 }
      );
    }
    await upsertCheckoutGuestSession({
      prebookId,
      holder,
      clientReference: typeof body.clientReference === "string" ? body.clientReference : undefined,
      stayContext:
        body.stayContext && typeof body.stayContext === "object"
          ? (body.stayContext as Record<string, unknown>)
          : undefined,
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Failed to save guest session" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  const prebookId = request.nextUrl.searchParams.get("prebookId")?.trim();
  if (!prebookId) {
    return NextResponse.json({ error: "prebookId is required" }, { status: 400 });
  }
  await deleteCheckoutGuestSession(prebookId);
  return NextResponse.json({ ok: true });
}
