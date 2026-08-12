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
