"use client";

import { useEffect, useState } from "react";

const ATTRIBUTION_COOKIE = "yict_attr_v1";

/**
 * Welcome banner for Instagram (and TikTok) landings — Vercel analytics shows
 * l.instagram.com referrers but zero checklist signups from that path yet.
 */
export function SocialReferralBanner() {
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const utm = (params.get("utm_source") ?? "").toLowerCase();
      if (utm === "instagram" || utm === "tiktok" || utm === "facebook") {
        setLabel(utm === "tiktok" ? "TikTok" : utm === "facebook" ? "Facebook" : "Instagram");
        return;
      }

      const ref = document.referrer.toLowerCase();
      if (ref.includes("instagram.com") || ref.includes("l.instagram.com")) {
        setLabel("Instagram");
        return;
      }
      if (ref.includes("tiktok.com")) {
        setLabel("TikTok");
        return;
      }

      const raw = document.cookie
        .split(";")
        .map((p) => p.trim())
        .find((p) => p.startsWith(`${ATTRIBUTION_COOKIE}=`));
      if (!raw) return;
      const parsed = JSON.parse(
        decodeURIComponent(raw.slice(ATTRIBUTION_COOKIE.length + 1))
      ) as { source?: string };
      const source = (parsed.source ?? "").toLowerCase();
      if (source.includes("instagram")) setLabel("Instagram");
      else if (source.includes("tiktok")) setLabel("TikTok");
      else if (source.includes("facebook")) setLabel("Facebook");
    } catch {
      // ignore
    }
  }, []);

  if (!label) return null;

  return (
    <p className="mb-4 rounded-control border border-coral/30 bg-coral-soft/40 px-3 py-2 text-[0.8125rem] text-ink">
      Welcome from {label} — email below unlocks the free checklist instantly. You control
      unsubscribe anytime.
    </p>
  );
}
