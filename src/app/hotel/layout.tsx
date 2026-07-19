import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Hotel details – Yes I Can Travel",
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
};

export default function HotelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
