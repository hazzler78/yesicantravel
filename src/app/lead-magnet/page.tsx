import { Check } from "lucide-react";
import LeadMagnetForm from "@/components/LeadMagnetForm";
import { Card } from "@/components/ui/Card";

export const metadata = {
  title: "Solo Female Safety Checklist",
  description: "Free checklist to help women plan safer solo stays with confidence.",
  alternates: {
    canonical: "https://yesicantravel.com/lead-magnet",
  },
};

const INCLUDES = [
  "Pre-arrival prep you can do in ten minutes",
  "What to look for in a hotel listing before you book",
  "Arriving after dark: transport and check-in",
];

export default function LeadMagnetPage() {
  return (
    <div className="bg-canvas">
      <div className="mx-auto grid max-w-4xl gap-8 px-4 py-10 sm:px-6 md:py-14 lg:grid-cols-[1fr_360px]">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-teal">
            Free download
          </p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink md:text-4xl">
            The solo female safety checklist
          </h1>
          <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink-muted md:text-base">
            The same checklist we use when deciding whether a property is worth recommending.
            Practical, specific, and short enough to actually use before a trip.
          </p>
          <ul className="mt-6 space-y-2.5">
            {INCLUDES.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-[0.9375rem] text-ink">
                <Check className="mt-1 h-4 w-4 shrink-0 text-teal" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <Card className="h-fit p-5">
          <h2 className="font-display text-lg font-semibold text-ink">Where should we send it?</h2>
          <p className="mt-1.5 text-[0.9375rem] text-ink-muted">
            One email with the checklist. Unsubscribe any time.
          </p>
          <LeadMagnetForm />
        </Card>
      </div>
    </div>
  );
}
