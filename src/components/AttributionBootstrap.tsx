"use client";

import { useEffect } from "react";

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

export default function AttributionBootstrap() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const payload = {
      source: params.get("utm_source") ?? undefined,
      medium: params.get("utm_medium") ?? undefined,
      campaign: params.get("utm_campaign") ?? undefined,
      utmTerm: params.get("utm_term") ?? undefined,
      utmContent: params.get("utm_content") ?? undefined,
      gclid: params.get("gclid") ?? undefined,
      fbclid: params.get("fbclid") ?? undefined,
      referrer: document.referrer || undefined,
      landingPage: window.location.href,
      capturedAt: new Date().toISOString(),
    };

    const hasAny = Object.values(payload).some(Boolean);
    if (!hasAny) return;

    const existingRaw = readCookie(COOKIE_NAME);
    if (existingRaw) {
      try {
        const existing = JSON.parse(existingRaw) as Record<string, unknown>;
        const merged = { ...payload, ...existing };
        document.cookie = `${COOKIE_NAME}=${encodeURIComponent(JSON.stringify(merged))};path=/;max-age=${TTL_SECONDS};samesite=lax`;
        return;
      } catch {
        // ignore and overwrite
      }
    }

    document.cookie = `${COOKIE_NAME}=${encodeURIComponent(JSON.stringify(payload))};path=/;max-age=${TTL_SECONDS};samesite=lax`;
  }, []);

  return null;
}
