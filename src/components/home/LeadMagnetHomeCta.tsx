import Link from "next/link";
import { ListChecks } from "lucide-react";
import LeadMagnetForm from "@/components/LeadMagnetForm";
import { AiReferralBanner } from "@/components/AiReferralBanner";
import { AskChatGptCta } from "@/components/AskChatGptCta";

type LeadMagnetHomeCtaProps = {
  /** Omit outer section padding when nested inside another page container */
  embedded?: boolean;
  /** City name for destination pages — raises relevance + conversion intent */
  city?: string;
  /** Analytics path override (defaults to /lead-magnet or inferred) */
  pagePath?: string;
};

/**
 * Primary conversion block for the 10-lead growth sprint.
 * Inline form removes the extra click to /lead-magnet on high-traffic pages.
 */
export function LeadMagnetHomeCta({
  embedded = false,
  city,
  pagePath,
}: LeadMagnetHomeCtaProps) {
  const headline = city
    ? `Free ${city} solo safety checklist`
    : "Free solo travel safety checklist";
  const supporting = city
    ? `Reception hours, arrival after dark, and what to check before you book in ${city} — short enough to actually use. Instant access + email tips.`
    : "Reception hours, arrival after dark, and what to check before you book — short enough to actually use. Instant access + email tips.";

  const inner = (
    <div className="rounded-card border border-teal/25 bg-teal-soft/40 p-5 sm:p-6">
      <div className="flex gap-3">
        <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-control bg-surface text-teal shadow-card">
          <ListChecks className="h-5 w-5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <AiReferralBanner />
          <h2 className="font-display text-lg font-semibold text-ink sm:text-xl">
            {headline}
          </h2>
          <p className="mt-1 text-[0.9375rem] text-ink-muted">{supporting}</p>
          <LeadMagnetForm compact pagePath={pagePath} />
          {!embedded && (
            <div className="mt-4">
              <AskChatGptCta compact />
            </div>
          )}
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
