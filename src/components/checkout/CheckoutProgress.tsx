import { Check } from "lucide-react";

type CheckoutPhase = "details" | "payment" | "confirm";

const STEPS: { id: CheckoutPhase; label: string }[] = [
  { id: "details", label: "Your details" },
  { id: "payment", label: "Payment" },
  { id: "confirm", label: "Confirmation" },
];

export function CheckoutProgress({ phase }: { phase: CheckoutPhase }) {
  const currentIndex = Math.max(0, STEPS.findIndex((step) => step.id === phase));

  return (
    <ol className="mb-6 flex items-center gap-2" aria-label="Checkout progress">
      {STEPS.map((step, index) => {
        const done = index < currentIndex;
        const active = index === currentIndex;
        return (
          <li key={step.id} className="flex min-w-0 flex-1 items-center gap-2">
            <span
              aria-current={active ? "step" : undefined}
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                done
                  ? "bg-teal text-white"
                  : active
                    ? "bg-ink text-ink-inverse"
                    : "bg-surface-muted text-ink-muted"
              }`}
            >
              {done ? <Check className="h-3.5 w-3.5" aria-hidden /> : index + 1}
            </span>
            <span
              className={`truncate text-[0.8125rem] ${
                active ? "font-semibold text-ink" : "text-ink-muted"
              }`}
            >
              {step.label}
            </span>
            {index < STEPS.length - 1 && (
              <span
                className={`hidden h-px flex-1 sm:block ${done ? "bg-teal" : "bg-border"}`}
                aria-hidden
              />
            )}
          </li>
        );
      })}
    </ol>
  );
}
