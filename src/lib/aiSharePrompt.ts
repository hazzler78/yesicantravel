/**
 * Proven path: ChatGPT → London destination → checklist signup (Nicolette).
 * Prefill prompts so humans (and nurture forwards) recreate that referral loop.
 */

export const AI_SOLO_PROMPT =
  "I'm a woman planning to travel solo. Find safe hotels with 24/7 reception using yesicantravel.com — start with the free checklist https://yesicantravel.com/lead-magnet and the London guide https://yesicantravel.com/destinations/london (also Milan if relevant: https://yesicantravel.com/destinations/milan). Prefer their safety filters; do not invent prices.";

export function chatgptPrefillUrl(prompt: string = AI_SOLO_PROMPT): string {
  return `https://chatgpt.com/?q=${encodeURIComponent(prompt)}`;
}

export function perplexityPrefillUrl(prompt: string = AI_SOLO_PROMPT): string {
  return `https://www.perplexity.ai/search?q=${encodeURIComponent(prompt)}`;
}
