"use client";

import { useState } from "react";
import {
  AI_SOLO_PROMPT,
  aiSoloPromptForCity,
  chatgptPrefillUrl,
} from "@/lib/aiSharePrompt";

type AskChatGptCtaProps = {
  className?: string;
  /** Compact one-liner for bio / inline CTAs */
  compact?: boolean;
  /** When set, prefill prompt targets this city (destination / blog conversion). */
  city?: string;
  citySlug?: string;
};

/**
 * Recreate the only verified lead path (ChatGPT → checklist).
 * Opens ChatGPT with our URLs prefilled; also copy for other assistants.
 */
export function AskChatGptCta({
  className = "",
  compact = false,
  city,
  citySlug,
}: AskChatGptCtaProps) {
  const [copied, setCopied] = useState(false);
  const prompt =
    city && citySlug ? aiSoloPromptForCity(city, citySlug) : AI_SOLO_PROMPT;
  const guideHint = city ? `${city} guide` : "London guide";

  const copyPrompt = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  };

  if (compact) {
    return (
      <div className={`flex flex-wrap gap-2 ${className}`}>
        <a
          href={chatgptPrefillUrl(prompt)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-[40px] items-center justify-center rounded-control border border-teal/40 bg-surface px-3 text-sm font-semibold text-teal hover:bg-teal-soft/40"
        >
          Ask ChatGPT
        </a>
        <button
          type="button"
          onClick={copyPrompt}
          className="inline-flex min-h-[40px] items-center justify-center rounded-control border border-border bg-surface px-3 text-sm font-semibold text-ink-muted hover:bg-surface-muted"
        >
          {copied ? "Prompt copied" : "Copy AI prompt"}
        </button>
      </div>
    );
  }

  return (
    <aside
      className={`rounded-card border border-teal/20 bg-surface p-4 ${className}`}
      aria-label="Ask ChatGPT for safer solo stays"
    >
      <p className="font-display text-base font-semibold text-ink">
        Planning with ChatGPT?
      </p>
      <p className="mt-1 text-[0.8125rem] text-ink-muted">
        Our only verified signup came that way. Open ChatGPT with the checklist + {guideHint}{" "}
        already in the prompt — or copy it for Claude / Perplexity.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <a
          href={chatgptPrefillUrl(prompt)}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-[44px] items-center justify-center rounded-control bg-teal px-4 text-sm font-semibold text-ink-inverse hover:bg-teal/90"
        >
          Ask ChatGPT (prefilled)
        </a>
        <button
          type="button"
          onClick={copyPrompt}
          className="inline-flex min-h-[44px] items-center justify-center rounded-control border border-teal/40 bg-surface px-4 text-sm font-semibold text-teal hover:bg-teal-soft/40"
        >
          {copied ? "Prompt copied" : "Copy prompt"}
        </button>
      </div>
    </aside>
  );
}
