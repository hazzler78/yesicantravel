import Link from "next/link";
import { ArrowRight, ListChecks } from "lucide-react";

/** Soft CTA toward the lead magnet — primary conversion for the 90-day growth goal. */
export function LeadMagnetHomeCta() {
  return (
    <section className="bg-canvas">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 md:py-12">
        <div className="flex flex-col gap-4 rounded-card border border-teal/25 bg-teal-soft/40 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
          <div className="flex gap-3">
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-control bg-surface text-teal shadow-card">
              <ListChecks className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <h2 className="font-display text-lg font-semibold text-ink sm:text-xl">
                Free solo travel safety checklist
              </h2>
              <p className="mt-1 text-[0.9375rem] text-ink-muted">
                Reception hours, arrival after dark, and what to check before you book —
                short enough to actually use.
              </p>
            </div>
          </div>
          <Link
            href="/lead-magnet"
            className="inline-flex min-h-[44px] shrink-0 items-center justify-center gap-2 rounded-control bg-coral px-4 text-[0.9375rem] font-semibold text-white hover:bg-coral-hover"
          >
            Get the checklist
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </div>
    </section>
  );
}
