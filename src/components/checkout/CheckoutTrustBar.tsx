import { CreditCard, Lock, ShieldCheck } from "lucide-react";

const POINTS = [
  { Icon: Lock, label: "Encrypted checkout" },
  { Icon: ShieldCheck, label: "Card details go straight to Stripe — we never see or store them" },
  { Icon: CreditCard, label: "Visa, Mastercard, Amex, Apple Pay and Google Pay" },
];

/**
 * Named payment brands in plain text rather than hand-drawn imitations of
 * their logos, which read as less trustworthy than no logos at all.
 */
export function CheckoutTrustBar() {
  return (
    <ul className="mb-5 flex flex-col gap-2 rounded-card border border-border bg-surface px-4 py-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-5">
      {POINTS.map(({ Icon, label }) => (
        <li key={label} className="flex items-start gap-2 text-[0.8125rem] text-ink-muted">
          <Icon className="mt-0.5 h-4 w-4 shrink-0 text-teal" aria-hidden />
          {label}
        </li>
      ))}
    </ul>
  );
}
