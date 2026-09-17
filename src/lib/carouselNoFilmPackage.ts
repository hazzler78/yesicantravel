/**
 * No-camera Instagram carousel — post when filming Reels is blocked.
 * 7 slides → Canva or IG native carousel → link sticker to /bio.
 */

import { SOCIAL_BIO_URL } from "@/lib/reelsThisWeek";

export const CAROUSEL_NO_FILM_PACKAGE = {
  id: "carousel-3-things-before-book",
  platformNote: "Instagram carousel (no video). Add link sticker → bio on last slide.",
  bioMustBe: SOCIAL_BIO_URL,
  canvaSize: "1080×1350 (4:5) or 1080×1080",
  slides: [
    {
      slide: 1,
      headline: "3 things I never skip\nas a solo woman",
      sub: "Save this before you book",
    },
    {
      slide: 2,
      headline: "1 · Reception hours",
      sub: "Will someone be at the desk when you arrive?",
    },
    {
      slide: 3,
      headline: "2 · Map pin truth",
      sub: "Does the pin match a lit, walkable street?",
    },
    {
      slide: 4,
      headline: "3 · Free cancellation",
      sub: "Plans change. Flexibility = calm.",
    },
    {
      slide: 5,
      headline: "We sort safest first",
      sub: "Not cheapest. Not most popular.",
    },
    {
      slide: 6,
      headline: "Free checklist",
      sub: "Reception · arrival after dark · what to check",
    },
    {
      slide: 7,
      headline: "Link in bio",
      sub: SOCIAL_BIO_URL.replace("https://", ""),
    },
  ],
  caption: `Save this before your next solo trip.

Reception hours · map pin truth · free cancellation.

Free checklist → link in bio.

#solofemaletravel #travelsafely #womensolotravel #europetravel #yesicantravel`,
  firstComment: `Checklist: ${SOCIAL_BIO_URL}`,
} as const;
