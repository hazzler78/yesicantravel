"use client";

import Link from "next/link";
import { ListChecks } from "lucide-react";

/** Compact lead magnet nudge for client pages (e.g. /results). */
export function LeadMagnetInlineCta() {
  return (
    <aside className="rounded-card border border-teal/25 bg-teal-soft/40 px-4 py-3.5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2.5">
          <ListChecks className="mt-0.5 h-5 w-5 shrink-0 text-teal" aria-hidden />
          <div>
            <p className="text-[0.9375rem] font-semibold text-ink">
              Free solo travel safety checklist
            </p>
            <p className="mt-0.5 text-[0.8125rem] text-ink-muted">
              Reception hours, map checks, and arriving after dark — before you book.
            </p>
          </div>
        </div>
        <Link
          href="/lead-magnet"
          className="inline-flex min-h-[40px] shrink-0 items-center justify-center rounded-control bg-coral px-3.5 text-[0.875rem] font-semibold text-white hover:bg-coral-hover"
        >
          Get the checklist
        </Link>
      </div>
    </aside>
  );
}
