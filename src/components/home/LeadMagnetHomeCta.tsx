import Link from "next/link";
import { ListChecks } from "lucide-react";
import LeadMagnetForm from "@/components/LeadMagnetForm";

type LeadMagnetHomeCtaProps = {
  /** Omit outer section padding when nested inside another page container */
  embedded?: boolean;
};

/**
 * Primary conversion block for the 90-day growth goal.
 * Inline form removes the extra click to /lead-magnet on high-traffic pages.
 */
export function LeadMagnetHomeCta({ embedded = false }: LeadMagnetHomeCtaProps) {
  const inner = (
    <div className="rounded-card border border-teal/25 bg-teal-soft/40 p-5 sm:p-6">
      <div className="flex gap-3">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-control bg-surface text-teal shadow-card">
          <ListChecks className="h-5 w-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-lg font-semibold text-ink sm:text-xl">
            Free solo travel safety checklist
          </h2>
          <p className="mt-1 text-[0.9375rem] text-ink-muted">
            Reception hours, arrival after dark, and what to check before you book —
            short enough to actually use. Instant access + email tips.
          </p>
          <LeadMagnetForm />
          <p className="mt-3 text-[0.8125rem] text-ink-muted">
            Prefer a dedicated page?{" "}
            <Link href="/lead-magnet" className="font-medium text-teal hover:underline">
              Open the checklist landing
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  );

  if (embedded) {
    return <div className="mt-10">{inner}</div>;
  }

  return (
    <section className="bg-canvas">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 md:py-12">{inner}</div>
    </section>
  );
}
