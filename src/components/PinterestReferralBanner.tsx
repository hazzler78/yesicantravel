"use client";

import { useEffect, useState } from "react";

const ATTRIBUTION_COOKIE = "yict_attr_v1";

/**
 * Soft welcome when someone arrives from Pinterest (primary owned social
 * channel we can publish to without mobile login).
 */
export function PinterestReferralBanner() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      if (params.get("utm_source")?.toLowerCase() === "pinterest") {
        setShow(true);
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
      if ((parsed.source ?? "").toLowerCase().includes("pinterest")) {
        setShow(true);
      }
    } catch {
      // ignore
    }
  }, []);

  if (!show) return null;

  return (
    <p className="mb-4 rounded-control border border-coral/30 bg-coral-soft/40 px-3 py-2 text-[0.8125rem] text-ink">
      Welcome from Pinterest — the free checklist below is the fastest way to get the
      practical steps before you book.
    </p>
  );
}
