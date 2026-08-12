import type { Metadata } from "next";
import Script from "next/script";
import { Suspense } from "react";
import { Fraunces, Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";
import Chatbot from "../components/Chatbot";
import AttributionBootstrap from "../components/AttributionBootstrap";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { textSizeBootstrapScript } from "@/components/layout/TextSizeControl";
import { currencyBootstrapScript } from "@/components/currency/CurrencyControl";

const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID ?? "948121024567031";
const CLARITY_PROJECT_ID = process.env.NEXT_PUBLIC_CLARITY_PROJECT_ID;

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  axes: ["SOFT", "WONK", "opsz"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://yesicantravel.com"),
  other: {
    "p:domain_verify": "3e1e4ae20aa959e7498943dfcd7a909e",
  },
  icons: {
    icon: [
      { url: "/logo.svg", type: "image/svg+xml" },
      { url: "/logo.png", type: "image/png" },
    ],
  },
  title: {
    default: "Yes I Can Travel – Safe solo travel stays for women in Europe",
    template: "%s | Yes I Can Travel",
  },
  description:
    "Safe solo travel stays for women in Europe & worldwide. Women-reviewed hotels with 24/7 reception, safety filters & expert tips. Book confidently and feel prepared.",
  openGraph: {
    type: "website",
    url: "https://yesicantravel.com/",
    siteName: "Yes I Can Travel",
    title: "Yes I Can Travel – Safe solo travel stays for women in Europe",
    description:
      "Safe solo travel stays for women in Europe & worldwide. Women-reviewed hotels with 24/7 reception, safety filters & expert tips. Book confidently and feel prepared.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Yes I Can Travel – Safe solo travel stays for women in Europe",
    description:
      "Safe solo travel stays for women in Europe & worldwide. Women-reviewed hotels with 24/7 reception, safety filters & expert tips. Book confidently and feel prepared.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth" data-scroll-behavior="smooth">
      <body className={`${inter.variable} ${fraunces.variable} flex min-h-screen flex-col`}>
        {/* Runs before the page paints so stored text-size / currency don't flash. */}
        <script dangerouslySetInnerHTML={{ __html: textSizeBootstrapScript }} />
        <script dangerouslySetInnerHTML={{ __html: currencyBootstrapScript }} />
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

        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-control focus:bg-ink focus:px-4 focus:py-2 focus:text-ink-inverse"
        >
          Skip to content
        </a>
        <SiteHeader />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter />
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
