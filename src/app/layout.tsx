import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.yesicantravel.com"),
  icons: {
    icon: "/logo.jpg",
  },
  title: {
    default: "Yes I Can Travel – Safe solo travel stays for women in Europe",
    template: "%s | Yes I Can Travel",
  },
  description:
    "Yes I Can Travel is a safety-first booking platform for women travelling solo in Western & Central Europe. Compare safer places to stay, filter by safety features, and book with confidence.",
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Yes I Can Travel",
    title: "Yes I Can Travel – Safe solo travel stays for women in Europe",
    description:
      "Find safer hotels and stays across Europe, with filters for 24/7 staffed reception, well-lit areas, neighbourhood safety info and more—designed for women travelling solo.",
  },
  alternates: {
    canonical: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "Yes I Can Travel – Safe solo travel stays for women in Europe",
    description:
      "Safety-first booking for women travelling solo in Western & Central Europe. Reassuring, clear, and empowering.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen`}
      >
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
