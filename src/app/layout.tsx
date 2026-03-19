import type { Metadata } from "next";
import Script from "next/script";
import { Suspense } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import Chatbot from "../components/Chatbot";

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
  other: {
    "p:domain_verify": "3e1e4ae20aa959e7498943dfcd7a909e",
  },
  icons: {
    icon: "/logo.png",
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
    images: [
      {
        url: "/logo.png",
        width: 512,
        height: 512,
        alt: "Yes I Can Travel logo",
      },
    ],
  },
  alternates: {
    canonical: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "Yes I Can Travel – Safe solo travel stays for women in Europe",
    description:
      "Safety-first booking for women travelling solo in Western & Central Europe. Reassuring, clear, and empowering.",
    images: ["/logo.png"],
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
        <Script id="pinterest-tag" strategy="afterInteractive">
          {`!function(e){if(!window.pintrk){window.pintrk=function(){window.pintrk.queue.push(Array.prototype.slice.call(arguments))};var
n=window.pintrk;n.queue=[],n.version="3.0";var
t=document.createElement("script");t.async=!0,t.src=e;var
r=document.getElementsByTagName("script")[0];
r.parentNode.insertBefore(t,r)}}("https://s.pinimg.com/ct/core.js");
pintrk('load', '2612747651236');
pintrk('page');`}
        </Script>
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            alt=""
            src="https://ct.pinterest.com/v3/?event=init&tid=2612747651236&noscript=1"
          />
        </noscript>
        {children}
        <footer className="mt-16 border-t border-[var(--sand)] bg-[var(--background)]">
          <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-6 py-8 text-center text-sm text-[var(--navy-light)] md:flex-row md:text-left">
            <p className="font-medium text-[var(--navy)]">
              More solo travel safety tips on social
            </p>
            <div className="flex items-center gap-3">
              <a
                href="https://www.instagram.com/yes.i.can.travel"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Yes I Can Travel on Instagram"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[var(--navy)] text-[var(--sand)] shadow-sm transition-colors hover:bg-[var(--ocean-teal)]"
              >
                <span className="text-sm font-semibold">IG</span>
              </a>
              <a
                href="https://www.pinterest.com/yesicantravel"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Yes I Can Travel on Pinterest"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[var(--navy)] text-[var(--sand)] shadow-sm transition-colors hover:bg-[var(--ocean-teal)]"
              >
                <span className="text-sm font-semibold">P</span>
              </a>
              <a
                href="https://www.facebook.com/YesICanTravelTheWorld"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Yes I Can Travel on Facebook"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[var(--navy)] text-[var(--sand)] shadow-sm transition-colors hover:bg-[var(--ocean-teal)]"
              >
                <span className="text-sm font-semibold">f</span>
              </a>
              <a
                href="https://www.twitter.com/yesicantravel"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Yes I Can Travel on X"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[var(--navy)] text-[var(--sand)] shadow-sm transition-colors hover:bg-[var(--ocean-teal)]"
              >
                <span className="text-sm font-semibold">X</span>
              </a>
              <a
                href="https://www.tiktok.com/@yesicantravel"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Yes I Can Travel on TikTok"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-[var(--navy)] text-[var(--sand)] shadow-sm transition-colors hover:bg-[var(--ocean-teal)]"
              >
                <span className="text-sm font-semibold">Tt</span>
              </a>
            </div>
          </div>
        </footer>
        <Suspense fallback={null}>
          <Chatbot />
        </Suspense>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
