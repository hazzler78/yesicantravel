import type { Metadata } from "next";
import { Suspense } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import Script from "next/script";
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

const metaPixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;

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
        {metaPixelId && (
          <Script
            id="meta-pixel"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '${metaPixelId}');
                fbq('track', 'PageView');
              `,
            }}
          />
        )}
        {children}
        <Suspense fallback={null}>
          <Chatbot />
        </Suspense>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
