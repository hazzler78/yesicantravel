import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hotel details – Yes I Can Travel",
  // Rates change by the hour and the descriptions come from the same partner
  // feed as every other booking site, so these shouldn't be indexed. They stay
  // crawlable and followable so links out of them still count.
  robots: {
    index: false,
    follow: true,
    googleBot: { index: false, follow: true },
  },
};

export default function HotelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
