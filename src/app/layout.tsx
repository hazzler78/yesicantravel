import type { Metadata } from "next";
import Script from "next/script";
import { Suspense } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import Chatbot from "../components/Chatbot";
import AttributionBootstrap from "../components/AttributionBootstrap";

const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "948121024567031";
const CLARITY_PROJECT_ID = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://yesicantravel.com"),
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
    "Safe solo travel stays for women in Europe & worldwide. Women-reviewed hotels with 24/7 reception, safety filters & expert tips. Book confidently and feel prepared.",
  openGraph: {
    type: "website",
    url: "/",
    siteName: "Yes I Can Travel",
    title: "Yes I Can Travel – Safe solo travel stays for women in Europe",
    description:
      "Safe solo travel stays for women in Europe & worldwide. Women-reviewed hotels with 24/7 reception, safety filters & expert tips. Book confidently and feel prepared.",
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
      "Safe solo travel stays for women in Europe & worldwide. Women-reviewed hotels with 24/7 reception, safety filters & expert tips. Book confidently and feel prepared.",
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

        <Script
          id="meta-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init', '${META_PIXEL_ID}');fbq('track', 'PageView');`,
          }}
        />

        {CLARITY_PROJECT_ID && (
          <Script
            id="ms-clarity"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window, document, "clarity", "script", "${CLARITY_PROJECT_ID}");`,
            }}
          />
        )}
        <noscript>
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            alt=""
            src={`https://www.facebook.com/tr?id=${META_PIXEL_ID}&ev=PageView&noscript=1`}
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
        <AttributionBootstrap />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
