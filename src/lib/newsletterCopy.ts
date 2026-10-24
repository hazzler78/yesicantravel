/**
 * Newsletter / email signup copy — edit here when Kund & Sälj supplies final text.
 */
export const newsletterCopy = {
  section: {
    title: "Travel tips & safer-stay deals",
    description:
      "Occasional emails with destination ideas, price drops on vetted stays, and practical solo travel notes. No spam — just useful context before you book.",
    emailPlaceholder: "you@example.com",
    submitLabel: "Subscribe",
    submitLoadingLabel: "Subscribing…",
    consent:
      "By subscribing you agree to receive marketing emails from Yes I Can Travel. Unsubscribe any time via the link in each email.",
  },
  compact: {
    title: "Get travel tips in your inbox",
    description: "Deals and safety-minded ideas for your next solo trip in Europe.",
    emailPlaceholder: "Email address",
    submitLabel: "Subscribe",
    submitLoadingLabel: "Subscribing…",
    consent:
      "Marketing emails from Yes I Can Travel. Unsubscribe any time.",
  },
  messages: {
    success: "You’re subscribed. Watch your inbox for travel tips and deals.",
    successAlready: "You’re already on the list — we’ll keep the good stuff coming.",
    errorEmail: "Please enter a valid email address.",
    errorConsent: "Please confirm you want to receive emails from us.",
    errorGeneric: "Couldn’t subscribe right now. Please try again in a moment.",
    errorUnavailable: "Sign-up is temporarily unavailable. Please try again later.",
  },
} as const;
