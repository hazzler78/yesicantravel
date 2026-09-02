"use client";

import { useCallback, useState } from "react";
import { Share2, Check } from "lucide-react";
import { buildSocialUrl } from "@/lib/socialUtm";

type ShareButtonProps = {
  title: string;
  path: string;
  campaign: string;
  className?: string;
};

export function ShareButton({ title, path, campaign, className = "" }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const shareUrl =
    typeof window !== "undefined"
      ? new URL(
          buildSocialUrl(path, {
            source: "share",
            medium: "social",
            campaign,
          }),
          window.location.origin
        ).toString()
      : `https://yesicantravel.com${path}`;

  const handleShare = useCallback(async () => {
    if (typeof navigator !== "undefined" && typeof navigator.share === "function") {
      try {
        await navigator.share({ title, url: shareUrl });
        return;
      } catch {
        // User cancelled or share failed — fall through to copy.
      }
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable.
    }
  }, [shareUrl, title]);

  const Icon = copied ? Check : Share2;
  const label = copied ? "Link copied" : "Share";

  return (
    <button
      type="button"
      onClick={() => void handleShare()}
      className={`inline-flex min-h-[40px] items-center gap-2 rounded-control border border-border bg-surface px-3 text-[0.8125rem] font-medium text-ink-muted transition-colors hover:border-teal hover:text-teal ${className}`}
      aria-label={`Share: ${title}`}
    >
      <Icon className="h-4 w-4 shrink-0" aria-hidden />
      {label}
    </button>
  );
}
