import type { Metadata } from "next";
import NewsletterForm from "@/components/NewsletterForm";
import { CommunityQuote } from "@/components/home/CommunityQuote";
import { HomeHero } from "@/components/home/HomeHero";
import { LeadMagnetHomeCta } from "@/components/home/LeadMagnetHomeCta";
import { PopularCitiesStrip } from "@/components/home/PopularCitiesStrip";
import { SafetySignals } from "@/components/home/SafetySignals";
import { TrendingEvents } from "@/components/home/TrendingEvents";

export const metadata: Metadata = {
  title: {
    absolute: "Yes I Can Travel – Safe stays for solo female travellers",
  },
  description:
    "Safety-first hotel search for women travelling alone. 24/7 reception filters, honest city guides, and a free solo safety checklist — Europe & worldwide.",
  alternates: {
    canonical: "https://yesicantravel.com/",
  },
  openGraph: {
    title: "Yes I Can Travel – Safe stays for solo female travellers",
    description:
      "Safety-first hotel search for women travelling alone. 24/7 reception, honest guides, free checklist.",
    url: "https://yesicantravel.com/",
  },
};

// Peak dates drop off the list the day after they end, so the page can't be
// built once and left to advertise a festival that finished months ago.
export const revalidate = 3600;

export default function HomePage() {
  return (
    <>
      <HomeHero />
      <LeadMagnetHomeCta />
      <PopularCitiesStrip />
      <SafetySignals />
      <TrendingEvents />
      <CommunityQuote />
      <NewsletterForm />
    </>
  );
}
