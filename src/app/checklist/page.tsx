import type { Metadata } from "next";
import Link from "next/link";
import { Check, MapPin, Moon, Shield } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { PrimaryLink } from "@/components/ui/PrimaryButton";

export const metadata: Metadata = {
  title: "Solo Female Safety Checklist",
  description:
    "Practical checklist for women planning safer solo stays — reception, lighting, arrival, and booking filters.",
  robots: { index: false, follow: false },
  alternates: {
    canonical: "https://yesicantravel.com/checklist",
  },
};

const SECTIONS = [
  {
    Icon: Shield,
    title: "Before you book",
    items: [
      "Filter for 24/7 staffed reception if you arrive after 22:00",
      "Prefer free cancellation until at least 24 hours before check-in",
      "Check the map pin — not just the neighbourhood name in the listing",
      "Scan recent reviews for late check-in, solo women, and street lighting",
      "Note the full stay total (taxes and fees) before you commit",
    ],
  },
  {
    Icon: MapPin,
    title: "Location & first night",
    items: [
      "Save the hotel address and a pin offline before you leave Wi‑Fi",
      "Plan the last leg from airport/station in daylight if you can",
      "Identify the nearest metro/bus stop and a backup ride option",
      "Know the reception phone number before you travel",
      "Share your itinerary with one trusted person",
    ],
  },
  {
    Icon: Moon,
    title: "Arriving after dark",
    items: [
      "Confirm reception is open at your ETA (call ahead if unsure)",
      "Use a well-lit drop-off — ask the driver to wait until you're inside",
      "Keep headphones out and bag zippers closed on the final walk",
      "If something feels off at the entrance, go to a busy café and reassess",
      "Do a quick room check: lock, peephole/chain, windows, safe",
    ],
  },
];

export default function ChecklistPage() {
  return (
    <div className="bg-canvas">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 md:py-14">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-teal">
          Your unlock
        </p>
        <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-ink md:text-4xl">
          Solo female safety checklist
        </h1>
        <p className="mt-3 text-[0.9375rem] leading-relaxed text-ink-muted md:text-base">
          Practical steps — not fear. Use this before you book and again the day you travel.
          You decide what feels right for your trip.
        </p>

        <div className="mt-8 space-y-4">
          {SECTIONS.map(({ Icon, title, items }) => (
            <Card key={title} className="p-5">
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-control bg-teal-soft text-teal">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <h2 className="font-display text-lg font-semibold text-ink">{title}</h2>
              </div>
              <ul className="mt-4 space-y-2.5">
                {items.map((item) => (
                  <li key={item} className="flex items-start gap-2.5 text-[0.9375rem] text-ink">
                    <Check className="mt-1 h-4 w-4 shrink-0 text-teal" aria-hidden />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>

        <Card className="mt-8 border-teal/30 bg-teal-soft/40 p-5">
          <h2 className="font-display text-lg font-semibold text-ink">
            Ready to compare safer stays?
          </h2>
          <p className="mt-2 text-[0.9375rem] text-ink-muted">
            Search with safest-first sorting, reception hours, and free cancellation labels —
            then book when it feels right.
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <PrimaryLink href="/popular-cities" variant="coral" size="md">
              Explore cities
            </PrimaryLink>
            <Link
              href="/events"
              className="inline-flex items-center rounded-control border border-border px-4 py-2 text-sm font-semibold text-ink hover:border-teal/40"
            >
              Peak dates &amp; events
            </Link>
          </div>
        </Card>
      </div>
    </div>
  );
}
