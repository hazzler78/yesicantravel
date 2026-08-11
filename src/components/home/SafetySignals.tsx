import { CalendarCheck, MapPinned, ShieldCheck } from "lucide-react";
import { Card, SectionHeading } from "@/components/ui/Card";

const SIGNALS = [
  {
    Icon: ShieldCheck,
    title: "The details properties bury",
    body: "Reception hours, lifts, in-room safes, on-site security and non-smoking floors are pulled out of the facilities list and shown on the result itself, so you don't have to open six tabs.",
  },
  {
    Icon: MapPinned,
    title: "Where it actually is",
    body: "Every search comes with a map, because a hotel that looks central in photos can be a twenty-minute walk from the last metro. You decide what's close enough.",
  },
  {
    Icon: CalendarCheck,
    title: "What it costs to change your mind",
    body: "Free-cancellation rates are labelled before you click through, and the full stay total — taxes and fees included — is shown before checkout, not after.",
  },
];

export function SafetySignals() {
  return (
    <section className="bg-surface-muted">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 md:py-16">
        <SectionHeading
          eyebrow="How this is different"
          title="Less guesswork, not more promises"
          description="We can't inspect every hotel, and we won't pretend to. What we can do is surface the information that decides whether a place feels right for a woman arriving alone at 11pm."
        />

        <div className="grid gap-4 md:grid-cols-3">
          {SIGNALS.map(({ Icon, title, body }) => (
            <Card key={title} className="p-5">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-control bg-teal-soft text-teal">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <h3 className="mt-4 font-display text-lg font-semibold text-ink">{title}</h3>
              <p className="mt-2 text-[0.9375rem] leading-relaxed text-ink-muted">{body}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
