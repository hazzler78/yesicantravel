"use client";

import { useSyncExternalStore } from "react";

export const TEXT_SIZE_STORAGE_KEY = "yict_text_size";
const TEXT_SIZE_ATTRIBUTE = "data-text-size";

const OPTIONS = [
  { value: "default", label: "A", title: "Default text size", className: "text-[0.8125rem]" },
  { value: "large", label: "A", title: "Larger text", className: "text-[0.9375rem]" },
  { value: "xlarge", label: "A", title: "Largest text", className: "text-[1.0625rem]" },
] as const;

type TextSize = (typeof OPTIONS)[number]["value"];

function isTextSize(value: string | null | undefined): value is TextSize {
  return value === "default" || value === "large" || value === "xlarge";
}

/** The document element is the source of truth; the bootstrap script sets it before paint. */
function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: [TEXT_SIZE_ATTRIBUTE],
  });
  return () => observer.disconnect();
}

function getSnapshot(): TextSize {
  const value = document.documentElement.getAttribute(TEXT_SIZE_ATTRIBUTE);
  return isTextSize(value) ? value : "default";
}

function getServerSnapshot(): TextSize {
  return "default";
}

function applyTextSize(next: TextSize) {
  const root = document.documentElement;
  if (next === "default") {
    root.removeAttribute(TEXT_SIZE_ATTRIBUTE);
  } else {
    root.setAttribute(TEXT_SIZE_ATTRIBUTE, next);
  }
  try {
    window.localStorage.setItem(TEXT_SIZE_STORAGE_KEY, next);
  } catch {
    // Private-mode browsers block storage; the choice just won't persist.
  }
}

/**
 * Reader-controlled text scaling. The base stylesheet stays at 16px so the
 * layout keeps a normal density, and anyone who wants bigger type opts in here.
 */
export function TextSizeControl({ className = "" }: { className?: string }) {
  const size = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

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
            onClick={() => applyTextSize(option.value)}
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
export const textSizeBootstrapScript = `(function(){try{var v=localStorage.getItem("${TEXT_SIZE_STORAGE_KEY}");if(v==="large"||v==="xlarge"){document.documentElement.setAttribute("${TEXT_SIZE_ATTRIBUTE}",v);}}catch(e){}})();`;
