type CheckoutPhase = "details" | "payment" | "confirm";

const STEPS: { id: CheckoutPhase; label: string }[] = [
  { id: "details", label: "Your details" },
  { id: "payment", label: "Payment" },
  { id: "confirm", label: "Confirmation" },
];

export function CheckoutProgress({ phase }: { phase: CheckoutPhase }) {
  const idx = STEPS.findIndex((s) => s.id === phase);
  const current = idx >= 0 ? idx + 1 : 1;
  const pct = (current / STEPS.length) * 100;

  return (
    <div className="mb-8">
      <p className="mb-2 text-center text-sm font-medium text-[var(--navy-light)]">
        Step {current} of {STEPS.length}
      </p>
      <div className="mb-3 h-2 overflow-hidden rounded-full bg-[var(--navy)]/10">
        <div
          className="h-full rounded-full bg-[var(--ocean-teal)] transition-[width] duration-300 ease-out"
          style={{ width: `${Math.min(100, Math.max(0, pct))}%` }}
        />
      </div>
      <div className="flex justify-between gap-1 text-[11px] font-medium text-[var(--navy-light)] sm:text-xs">
        {STEPS.map((s, i) => (
          <span
            key={s.id}
            className={`min-w-0 flex-1 text-center leading-tight ${
              i <= idx ? "font-semibold text-[var(--ocean-teal)]" : ""
            }`}
          >
            {s.label}
          </span>
        ))}
      </div>
    </div>
  );
}
