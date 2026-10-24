import { NextRequest, NextResponse } from "next/server";
import {
  assignSubscriberToGroup,
  findMailerLiteSubscriber,
  upsertMailerLiteSubscriber,
} from "@/lib/mailerlite";
import { formatNewsletterCityName } from "@/lib/newsletterCopy";
import { checkSubscribeRateLimit, getClientIp } from "@/lib/subscribeRateLimit";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type SubscribeBody = {
  email?: string;
  consent?: boolean;
  city?: string;
  pageUrl?: string;
  /** Honeypot — must stay empty for humans */
  company?: string;
};

function getMainGroupId(): string | null {
  const id = process.env.MAILERLITE_GROUP_ID?.trim();
  return id || null;
}

export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const rate = checkSubscribeRateLimit(ip);
    if (!rate.allowed) {
      return NextResponse.json(
        { ok: false, error: "Too many attempts. Please wait a few minutes and try again." },
        {
          status: 429,
          headers: rate.retryAfterSec
            ? { "Retry-After": String(rate.retryAfterSec) }
            : undefined,
        }
      );
    }

    const body = (await request.json()) as SubscribeBody;

    if (typeof body.company === "string" && body.company.trim().length > 0) {
      return NextResponse.json({ ok: true, alreadySubscribed: false });
    }

    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    if (!email || !EMAIL_RE.test(email)) {
      return NextResponse.json({ ok: false, error: "Valid email is required" }, { status: 400 });
    }

    if (body.consent !== true) {
      return NextResponse.json({ ok: false, error: "Consent is required" }, { status: 400 });
    }

    const apiKey = process.env.MAILERLITE_API_KEY?.trim();
    if (!apiKey) {
      console.warn("[subscribe] MAILERLITE_API_KEY is not configured — signup skipped");
      return NextResponse.json(
        { ok: false, error: "Signup is temporarily unavailable" },
        { status: 503 }
      );
    }

    const groupId = getMainGroupId();
    if (!groupId) {
      console.warn("[subscribe] MAILERLITE_GROUP_ID is not configured — signup skipped");
      return NextResponse.json(
        { ok: false, error: "Signup is temporarily unavailable" },
        { status: 503 }
      );
    }

    const existing = await findMailerLiteSubscriber(email);
    const alreadyInMain = existing?.groups?.some((g) => g.id === groupId) ?? false;

    const fields: Record<string, string> = {
      nurture_campaign: "newsletter_signup",
    };
    const city = formatNewsletterCityName(
      typeof body.city === "string" ? body.city : undefined
    );
    if (city) {
      fields.city = city.slice(0, 100);
    }

    const upsert = await upsertMailerLiteSubscriber({
      email,
      fields,
      groups: [groupId],
    });

    if (!upsert.ok) {
      return NextResponse.json(
        { ok: false, error: "Could not add you to our list. Please try again." },
        { status: 502 }
      );
    }

    if (existing?.id && !alreadyInMain) {
      await assignSubscriberToGroup(existing.id, groupId);
    }

    const nurtureId = process.env.MAILERLITE_NURTURE_GROUP_ID?.trim();
    if (nurtureId && nurtureId !== groupId && existing?.id) {
      const inNurture = existing.groups?.some((g) => g.id === nurtureId);
      if (!inNurture) {
        await assignSubscriberToGroup(existing.id, nurtureId);
      }
    } else if (nurtureId && nurtureId !== groupId && !existing?.id) {
      await upsertMailerLiteSubscriber({
        email,
        groups: [nurtureId],
      });
    }

    return NextResponse.json({
      ok: true,
      alreadySubscribed: Boolean(existing && alreadyInMain),
    });
  } catch (error) {
    console.error("[subscribe]", error);
    return NextResponse.json({ ok: false, error: "Server error" }, { status: 500 });
  }
}
