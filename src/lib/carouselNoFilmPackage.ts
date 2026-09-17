/**
 * Ready-to-upload Instagram carousel (no video).
 * PNGs in /public/carousel — download all 7, upload as IG carousel, link sticker → bio.
 */

import { SOCIAL_BIO_URL } from "@/lib/reelsThisWeek";

const ORIGIN = "https://yesicantravel.com";

export type ReadyCarouselSlide = {
  id: string;
  filePath: string;
  publicUrl: string;
  headline: string;
  sub: string;
};

export const READY_CAROUSEL_SLIDES: ReadyCarouselSlide[] = [
  {
    id: "01-hook",
    filePath: "/carousel/carousel-01-hook.png",
    publicUrl: `${ORIGIN}/carousel/carousel-01-hook.png`,
    headline: "3 things I never skip as a solo woman",
    sub: "Save this before you book",
  },
  {
    id: "02-reception",
    filePath: "/carousel/carousel-02-reception.png",
    publicUrl: `${ORIGIN}/carousel/carousel-02-reception.png`,
    headline: "1 · Reception hours",
    sub: "Will someone be at the desk when you arrive?",
  },
  {
    id: "03-map",
    filePath: "/carousel/carousel-03-map.png",
    publicUrl: `${ORIGIN}/carousel/carousel-03-map.png`,
    headline: "2 · Map pin truth",
    sub: "Does the pin match a lit, walkable street?",
  },
  {
    id: "04-cancel",
    filePath: "/carousel/carousel-04-cancel.png",
    publicUrl: `${ORIGIN}/carousel/carousel-04-cancel.png`,
    headline: "3 · Free cancellation",
    sub: "Plans change. Flexibility = calm.",
  },
  {
    id: "05-sort",
    filePath: "/carousel/carousel-05-sort.png",
    publicUrl: `${ORIGIN}/carousel/carousel-05-sort.png`,
    headline: "We sort safest first",
    sub: "Not cheapest. Not most popular.",
  },
  {
    id: "06-checklist",
    filePath: "/carousel/carousel-06-checklist.png",
    publicUrl: `${ORIGIN}/carousel/carousel-06-checklist.png`,
    headline: "Free checklist",
    sub: "Reception · arrival after dark · what to check",
  },
  {
    id: "07-cta",
    filePath: "/carousel/carousel-07-cta.png",
    publicUrl: `${ORIGIN}/carousel/carousel-07-cta.png`,
    headline: "Link in bio",
    sub: "yesicantravel.com/bio",
  },
];

export const CAROUSEL_NO_FILM_PACKAGE = {
  id: "carousel-3-things-before-book",
  platformNote: "Instagram carousel — download the 7 PNGs below, no Canva needed.",
  bioMustBe: SOCIAL_BIO_URL,
  canvaSize: "1080×1350 (already exported)",
  slides: READY_CAROUSEL_SLIDES.map((s, i) => ({
    slide: i + 1,
    headline: s.headline,
    sub: s.sub,
  })),
  caption: `Save this before your next solo trip.

Reception hours · map pin truth · free cancellation.

Free checklist → link in bio.

#solofemaletravel #travelsafely #womensolotravel #europetravel #yesicantravel`,
  firstComment: `Checklist: ${SOCIAL_BIO_URL}`,
} as const;
