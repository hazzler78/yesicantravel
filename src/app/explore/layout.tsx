import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Explore stays on the map",
  description:
    "Pan and zoom the map to discover hotels, hostels, guest houses and apartments around Europe — then see live prices for your dates.",
};

export default function ExploreLayout({ children }: { children: React.ReactNode }) {
  return children;
}
