import type { Metadata } from "next";
import { Check } from "lucide-react";
import LeadMagnetForm from "@/components/LeadMagnetForm";
import { Card } from "@/components/ui/Card";
import PageVisitTracker from "@/components/analytics/PageVisitTracker";
import { prisma } from "@/lib/prisma";

const BASE_URL = "https://yesicantravel.com";

export const metadata: Metadata = {
  title: "Free Solo Female Safety Checklist | Yes I Can Travel",
  description:
    "Free practical checklist for women travelling solo: hotel filters, arrival after dark, and pre-booking checks. No scare tactics — just clarity.",
  openGraph: {
    title: "Free Solo Female Safety Checklist",
    description:
      "Reception hours, map checks, and arriving after dark — a short checklist before you book.",
    url: `${BASE_URL}/lead-magnet`,
    type: "website",
    images: [
      {
        url: `${BASE_URL}/pins/pin-lead-magnet.png`,
        width: 1000,
        height: 1500,
        alt: "Free solo female safety checklist",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Solo Female Safety Checklist",
    description:
      "Reception hours, map checks, and arriving after dark — a short checklist before you book.",
    images: [`${BASE_URL}/pins/pin-lead-magnet.png`],
  },
  alternates: {
    canonical: `${BASE_URL}/lead-magnet`,
  },
};

export const dynamic = "force-dynamic";

const INCLUDES = [
  "Pre-arrival prep you can do in ten minutes",
  "What to look for in a hotel listing before you book",
  "Arriving after dark: transport and check-in",
];

const FAQS = [
  {
    question: "Is the solo female safety checklist really free?",
    answer:
      "Yes. Enter your email and you get instant access to the checklist on our site, plus optional follow-up tips. Unsubscribe any time.",
  },
  {
    question: "What is on the checklist?",
    answer:
      "Practical steps before you book (24/7 reception, map pin, free cancellation), first-night planning, and arriving after dark — without fear-based messaging.",
  },
  {
    question: "Who is this for?",
    answer:
      "Women planning a first or early solo trip in Europe (and beyond) who want clearer hotel signals before they book.",
  },
];

async function getLeadCount(): Promise<number | null> {
  try {
    return await prisma.leadProfile.count({ where: { consentMarketing: true } });
  } catch {
    return null;
  }
}

export default async function LeadMagnetPage() {
  const leadCount = await getLeadCount();

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };

  return (
    <div className="bg-canvas">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <PageVisitTracker path="/lead-magnet" />
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
          {leadCount !== null && leadCount > 0 && (
            <p className="mt-3 text-[0.8125rem] font-medium text-teal">
              Joined by {leadCount} traveller{leadCount === 1 ? "" : "s"} so far
            </p>
          )}
          <ul className="mt-6 space-y-2.5">
            {INCLUDES.map((item) => (
              <li key={item} className="flex items-start gap-2.5 text-[0.9375rem] text-ink">
                <Check className="mt-1 h-4 w-4 shrink-0 text-teal" aria-hidden />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <section className="mt-10">
            <h2 className="font-display text-lg font-semibold text-ink">Questions</h2>
            <dl className="mt-4 space-y-4">
              {FAQS.map((f) => (
                <div key={f.question}>
                  <dt className="font-semibold text-ink">{f.question}</dt>
                  <dd className="mt-1 text-[0.9375rem] text-ink-muted">{f.answer}</dd>
                </div>
              ))}
            </dl>
          </section>
        </div>

        <Card className="h-fit p-5">
          <h2 className="font-display text-lg font-semibold text-ink">Where should we send it?</h2>
          <p className="mt-1.5 text-[0.9375rem] text-ink-muted">
            Unlock the checklist instantly. Optional tips by email — unsubscribe any time.
          </p>
          <LeadMagnetForm />
        </Card>
      </div>
    </div>
  );
}
