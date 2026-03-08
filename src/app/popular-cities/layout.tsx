import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Popular Safe Cities – Yes I Can Travel",
  description:
    "Explore safer stays in Paris, Berlin, Amsterdam, Barcelona, Milan and London. Stays reviewed by women travellers, 24/7 reception, well-lit areas.",
};

export default function PopularCitiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
