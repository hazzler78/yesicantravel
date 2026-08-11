"use client";

import { useEffect, useState } from "react";

export const TEXT_SIZE_STORAGE_KEY = "yict_text_size";

const OPTIONS = [
  { value: "default", label: "A", title: "Default text size", className: "text-[0.8125rem]" },
  { value: "large", label: "A", title: "Larger text", className: "text-[0.9375rem]" },
  { value: "xlarge", label: "A", title: "Largest text", className: "text-[1.0625rem]" },
] as const;

type TextSize = (typeof OPTIONS)[number]["value"];

function isTextSize(value: string | undefined): value is TextSize {
  return value === "default" || value === "large" || value === "xlarge";
}

/**
 * Reader-controlled text scaling. The base stylesheet stays at 16px so the
 * layout keeps a normal density, and anyone who wants bigger type opts in here.
 */
export function TextSizeControl({ className = "" }: { className?: string }) {
  // Null until we've read what the bootstrap script applied, so the first
  // effect pass never clobbers a stored preference.
  const [size, setSize] = useState<TextSize | null>(null);

  useEffect(() => {
    const root = document.documentElement;
    if (size === null) {
      const current = root.dataset.textSize;
      setSize(isTextSize(current) ? current : "default");
      return;
    }
    if (size === "default") {
      delete root.dataset.textSize;
    } else {
      root.dataset.textSize = size;
    }
    try {
      window.localStorage.setItem(TEXT_SIZE_STORAGE_KEY, size);
    } catch {
      // Private-mode browsers block storage; the choice just won't persist.
    }
  }, [size]);

  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <span className="text-xs font-medium text-ink-muted">Text</span>
      <div
        className="flex items-center rounded-control border border-border bg-surface p-0.5"
        role="group"
        aria-label="Text size"
      >
        {OPTIONS.map((option) => (
          <button
            key={option.value}
            type="button"
            title={option.title}
            aria-label={option.title}
            aria-pressed={size === option.value}
            onClick={() => setSize(option.value)}
            className={`flex h-7 w-7 items-center justify-center rounded-[0.375rem] font-semibold leading-none transition-colors ${option.className} ${
              size === option.value
                ? "bg-ink text-ink-inverse"
                : "text-ink-muted hover:bg-surface-muted hover:text-ink"
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/** Applies the stored preference before first paint so text doesn't resize on load. */
export const textSizeBootstrapScript = `(function(){try{var v=localStorage.getItem("${TEXT_SIZE_STORAGE_KEY}");if(v==="large"||v==="xlarge"){document.documentElement.dataset.textSize=v;}}catch(e){}})();`;
