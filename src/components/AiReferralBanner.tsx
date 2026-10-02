"use client";

import { useEffect, useState } from "react";
import { sourceFromReferrer } from "@/lib/attributionSource";

const ATTRIBUTION_COOKIE = "yict_attr_v1";

/**
 * Soft welcome when someone arrives via ChatGPT / other AI assistants —
 * the only proven external lead path so far.
 */
export function AiReferralBanner() {
  const [label, setLabel] = useState<string | null>(null);

  useEffect(() => {
    try {
      const raw = document.cookie
        .split(";")
        .map((p) => p.trim())
        .find((p) => p.startsWith(`${ATTRIBUTION_COOKIE}=`));
      if (raw) {
        const parsed = JSON.parse(
          decodeURIComponent(raw.slice(ATTRIBUTION_COOKIE.length + 1))
        ) as {
          source?: string;
          medium?: string;
        };
        const source = (parsed.source ?? "").toLowerCase();
        if (
          source.includes("chatgpt") ||
          source.includes("openai") ||
          source.includes("perplexity") ||
          source.includes("claude") ||
          source.includes("gemini") ||
          source.includes("copilot") ||
          parsed.medium === "ai_referral"
        ) {
          if (source.includes("chatgpt") || source.includes("openai")) {
            setLabel("ChatGPT");
          } else if (source.includes("perplexity")) {
            setLabel("Perplexity");
          } else if (source.includes("claude")) {
            setLabel("Claude");
          } else if (source.includes("gemini")) {
            setLabel("Gemini");
          } else if (source.includes("copilot")) {
            setLabel("Copilot");
          } else {
            setLabel("your AI assistant");
          }
          return;
        }
      }

      // Cookie may not be written yet on first paint — fall back to document.referrer
      const fromRef = sourceFromReferrer(document.referrer);
      if (fromRef) {
        if (fromRef.includes("chatgpt")) setLabel("ChatGPT");
        else if (fromRef.includes("perplexity")) setLabel("Perplexity");
        else if (fromRef.includes("claude")) setLabel("Claude");
        else if (fromRef.includes("gemini")) setLabel("Gemini");
        else if (fromRef.includes("copilot")) setLabel("Copilot");
        else setLabel("your AI assistant");
      }
    } catch {
      // ignore corrupt cookie
    }
  }, []);

  if (!label) return null;

  return (
    <p className="mb-4 rounded-control border border-teal/30 bg-teal-soft/50 px-3 py-2 text-[0.8125rem] text-ink">
      Welcome from {label} — grab the free checklist first, then pick a city with 24/7 reception
      stays. You control the filters.
    </p>
  );
}
