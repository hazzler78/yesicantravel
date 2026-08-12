import type { Metadata } from "next";
import NewsletterForm from "@/components/NewsletterForm";
import { CommunityQuote } from "@/components/home/CommunityQuote";
import { HomeHero } from "@/components/home/HomeHero";
import { PopularCitiesStrip } from "@/components/home/PopularCitiesStrip";
import { SafetySignals } from "@/components/home/SafetySignals";
import { TrendingEvents } from "@/components/home/TrendingEvents";

export const metadata: Metadata = {
  alternates: {
    canonical: "https://yesicantravel.com/",
  },
};

// Peak dates drop off the list the day after they end, so the page can't be
// built once and left to advertise a festival that finished months ago.
export const revalidate = 3600;

export default function HomePage() {
  return (
    <>
      <HomeHero />
      <PopularCitiesStrip />
      <SafetySignals />
      <TrendingEvents />
      <CommunityQuote />
      <NewsletterForm />
    </>
  );
}
