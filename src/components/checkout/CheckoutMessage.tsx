import { TriangleAlert } from "lucide-react";
import { SecondaryLink } from "@/components/ui/SecondaryButton";

type CheckoutMessageProps = {
  title: string;
  body: string;
  actionHref: string;
  actionLabel: string;
};

/** Shared dead-end screen for the checkout's missing-parameter and error states. */
export function CheckoutMessage({ title, body, actionHref, actionLabel }: CheckoutMessageProps) {
  return (
    <div className="mx-auto max-w-xl px-4 py-16 sm:px-6">
      <div className="rounded-card border border-border bg-surface p-8 text-center shadow-card">
        <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-coral-soft text-coral">
          <TriangleAlert className="h-5 w-5" aria-hidden />
        </span>
        <h1 className="mt-4 font-display text-xl font-semibold text-ink">{title}</h1>
        <p className="mx-auto mt-2 max-w-md text-[0.9375rem] text-ink-muted">{body}</p>
        <div className="mt-6 flex justify-center">
          <SecondaryLink href={actionHref}>{actionLabel}</SecondaryLink>
        </div>
      </div>
    </div>
  );
}
