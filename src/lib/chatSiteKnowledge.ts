/**
 * Knowledge injected into the chat API so the assistant matches the live product.
 * When marketing or key UI copy changes, update this file (and keep page copy aligned).
 */

/** Current homepage hero + trust lines (English as shown on the site). */
export const HOMEPAGE_COPY_FOR_ASSISTANT = `
Homepage (/) — hero and trust copy visitors see (English):
- Eyebrow: "For women travelling solo"
- Headline: "The first place you can stay where you don't have to be on alert."
- Subhead: "Safer hotels picked for women travelling solo — 24/7 reception, well-lit streets, and real reviews by women who've stayed there."
- Trust badges: "Reviewed & rated by women travellers" and "24/7 staffed reception"
- Hero quote line: "Felt really safe — didn't have any problem, nor felt like I would." — from our community
- Lower trust section: same quote; attribution line "Solo female traveller, shared on r/solofemaletravel"; disclaimer about community-sourced quotes (no fabricated testimonials).
`.trim();

/** Product behaviour the assistant should describe accurately. */
export const SITE_FEATURES_FOR_ASSISTANT = `
Recent site behaviour (high level):
- Search defaults to 1 guest on the homepage (solo-friendly).
- Results filters no longer say "future versions will…" for women-only / neighbourhood filters.
- Hotel pages show description, facilities, AI guest sentiment (pros/cons), individual review snippets, and safety-style badges derived from listed facilities (not an on-site inspection).
- Checkout shows a short "you're booking" summary (photo, name, address, dates, guests) and optional phone with a note that it is for the hotel (e.g. late check-in).
- Microsoft Clarity may be enabled for session insights; funnel events also go to analytics (Search, HotelClick, CheckoutStart, PaymentSubmit, BookingSuccess).
- Booking codes: RFN = refundable/free cancellation; NRFN = non-refundable. Board names describe meals.
`.trim();

/** Language and translation behaviour. */
export const MULTILINGUAL_INSTRUCTIONS_FOR_ASSISTANT = `
LANGUAGE AND TRANSLATION:
- You will receive the visitor's browser locale (BCP 47, e.g. en-US, sv-SE, de-DE). Prefer replying in that language for short help, unless the visitor clearly writes in a different language—then match their message language.
- If they ask you to translate text (on the site, from a review, or pasted German/other language), give an accurate, faithful translation first, then a one-line gist if helpful. Do not invent dialogue: if a named person (e.g. "Eva") is not in the hotel review snippets or homepage copy you were given, say you don't see that exact comment in the data for this page and invite them to paste the text to translate.
- Guest reviews in the hotel context may be in German, French, Spanish, etc.—preserve meaning; translate to the visitor's language when they ask what someone said or for a translation.
- Keep answers short (1–3 sentences) unless they only asked for a translation—in that case the translation may be a short paragraph but stay concise.
`.trim();

export function buildSiteAndI18nSystemBlock(browserLocale: string): string {
  return [
    "SITE AND COPY (authoritative for questions about what the website says):",
    HOMEPAGE_COPY_FOR_ASSISTANT,
    "",
    SITE_FEATURES_FOR_ASSISTANT,
    "",
    `Visitor browser locale (hint for reply language): ${browserLocale || "en"}.`,
    "",
    MULTILINGUAL_INSTRUCTIONS_FOR_ASSISTANT,
  ].join("\n");
}
