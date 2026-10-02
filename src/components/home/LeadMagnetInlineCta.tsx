"use client";

import { ListChecks } from "lucide-react";
import LeadMagnetForm from "@/components/LeadMagnetForm";

type LeadMagnetInlineCtaProps = {
  /** Attribution path stored on the lead (e.g. /results, /hotel). */
  pagePath?: string;
  className?: string;
};

/** Compact inline capture — converts after hotels load or on hotel detail. */
export function LeadMagnetInlineCta({
  pagePath,
  className = "mt-8",
}: LeadMagnetInlineCtaProps) {
  return (
    <aside
      className={`rounded-card border border-teal/25 bg-teal-soft/30 p-4 sm:p-5 ${className}`}
    >
      <div className="flex gap-3">
        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-control bg-surface text-teal">
          <ListChecks className="h-4 w-4" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-display text-base font-semibold text-ink">
            Free solo safety checklist
          </p>
          <p className="mt-0.5 text-sm text-ink-muted">
            Reception hours, late arrival, and what to check before you book.
          </p>
          <LeadMagnetForm pagePath={pagePath} compact />
        </div>
      </div>
    </aside>
  );
}
