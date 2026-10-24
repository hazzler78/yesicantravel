/**
 * Newsletter / email signup copy — city-aware strings for EmailSignupBox.
 */
export const newsletterCopy = {
  body:
    "Get 3 hotels we'd pick for a solo stay, with reception hours, distance to the metro and cancellation terms checked for you.",
  emailPlaceholder: "Your email",
  submitLabel: "Send me the list",
  submitLoadingLabel: "Sending…",
  finePrint: "No spam. One email, then occasional travel tips. Unsubscribe anytime.",
  messages: {
    errorEmail: "Please enter a valid email address.",
    errorGeneric: "Couldn’t subscribe right now. Please try again in a moment.",
    errorUnavailable: "Sign-up is temporarily unavailable. Please try again later.",
  },
} as const;

/** First segment of a place label (e.g. "Milan, Italy" → "Milan"). */
export function formatNewsletterCityName(raw?: string | null): string | undefined {
  if (!raw?.trim()) return undefined;
  const first = raw.trim().split(",")[0]?.trim();
  return first || undefined;
}

export type NewsletterDisplayCopy = {
  title: string;
  description: string;
  emailPlaceholder: string;
  submitLabel: string;
  submitLoadingLabel: string;
  finePrint: string;
  success: string;
  successAlready: string;
};

export function getNewsletterCopy(city?: string | null): NewsletterDisplayCopy {
  const cityName = formatNewsletterCityName(city);
  const hasCity = Boolean(cityName);

  return {
    title: hasCity ? `Travelling to ${cityName} alone?` : "Travelling alone?",
    description: newsletterCopy.body,
    emailPlaceholder: newsletterCopy.emailPlaceholder,
    submitLabel: newsletterCopy.submitLabel,
    submitLoadingLabel: newsletterCopy.submitLoadingLabel,
    finePrint: newsletterCopy.finePrint,
    success: hasCity
      ? `Check your inbox, your ${cityName} list is on its way.`
      : "Check your inbox, your list is on its way.",
    successAlready: hasCity
      ? `Check your inbox, your ${cityName} list is on its way.`
      : "Check your inbox, your list is on its way.",
  };
}
