import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Search results – Yes I Can Travel",
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
};

export default function ResultsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
