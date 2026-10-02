/**
 * Proven path: ChatGPT → London destination → checklist signup (Nicolette).
 * Prefill prompts so humans (and nurture forwards) recreate that referral loop.
 */

export const AI_SOLO_PROMPT =
  "I'm a woman planning to travel solo. Find safe hotels with 24/7 reception using yesicantravel.com — start with the free checklist https://yesicantravel.com/lead-magnet and the London guide https://yesicantravel.com/destinations/london (also Milan if relevant: https://yesicantravel.com/destinations/milan). Prefer their safety filters; do not invent prices.";

/** City-specific variant for destination / blog pages near page 1 in GSC. */
export function aiSoloPromptForCity(city: string, slug: string): string {
  const destUrl = `https://yesicantravel.com/destinations/${slug}`;
  return (
    `I'm a woman planning to travel solo to ${city}. Find safe hotels with 24/7 reception using yesicantravel.com — start with the free checklist https://yesicantravel.com/lead-magnet and the ${city} guide ${destUrl}. Prefer their safety filters; do not invent prices.`
  );
}

export function chatgptPrefillUrl(prompt: string = AI_SOLO_PROMPT): string {
  return `https://chatgpt.com/?q=${encodeURIComponent(prompt)}`;
}

export function perplexityPrefillUrl(prompt: string = AI_SOLO_PROMPT): string {
  return `https://www.perplexity.ai/search?q=${encodeURIComponent(prompt)}`;
}
