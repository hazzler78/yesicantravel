"use client";

import { useEffect } from "react";
import { sourceFromReferrer } from "@/lib/attributionSource";

const COOKIE_NAME = "yict_attr_v1";
const TTL_SECONDS = 60 * 60 * 24 * 90;

function readCookie(name: string): string | null {
  const key = `${name}=`;
  const value = document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(key));
  return value ? decodeURIComponent(value.slice(key.length)) : null;
}

/** First-touch: keep existing values; fill empty fields from the new payload. */
function mergeFirstTouch(
  incoming: Record<string, unknown>,
  existing: Record<string, unknown>
): Record<string, unknown> {
  const merged = { ...incoming, ...existing };
  for (const [key, value] of Object.entries(incoming)) {
    if ((merged[key] === undefined || merged[key] === null || merged[key] === "") && value) {
      merged[key] = value;
    }
  }
  return merged;
}

export default function AttributionBootstrap() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const referrer = document.referrer || undefined;
    const refSource = sourceFromReferrer(referrer);
    const isAi =
      refSource?.includes("chatgpt") ||
      refSource?.includes("perplexity") ||
      refSource?.includes("gemini") ||
      refSource?.includes("copilot") ||
      refSource?.includes("claude") ||
      refSource?.includes("you.com");

    const payload: Record<string, unknown> = {
      source: params.get("utm_source") ?? refSource ?? undefined,
      medium:
        params.get("utm_medium") ??
        (isAi ? "ai_referral" : refSource ? "social" : undefined),
      campaign: params.get("utm_campaign") ?? undefined,
      utmTerm: params.get("utm_term") ?? undefined,
      utmContent: params.get("utm_content") ?? undefined,
      gclid: params.get("gclid") ?? undefined,
      fbclid: params.get("fbclid") ?? undefined,
      referrer,
      landingPage: window.location.href,
      capturedAt: new Date().toISOString(),
    };

    const hasAny = Object.values(payload).some(Boolean);
    if (!hasAny) return;

    const existingRaw = readCookie(COOKIE_NAME);
    let toStore = payload;
    if (existingRaw) {
      try {
        const existing = JSON.parse(existingRaw) as Record<string, unknown>;
        toStore = mergeFirstTouch(payload, existing);
      } catch {
        // overwrite corrupt cookie
      }
    }

    document.cookie = `${COOKIE_NAME}=${encodeURIComponent(JSON.stringify(toStore))};path=/;max-age=${TTL_SECONDS};samesite=lax`;

    void fetch("/api/analytics/page", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: window.location.pathname }),
      keepalive: true,
    });
  }, []);

  return null;
}
