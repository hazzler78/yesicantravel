import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Booking confirmation – Yes I Can Travel",
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
};

export default function ConfirmationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
