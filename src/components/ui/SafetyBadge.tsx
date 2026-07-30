type SafetyBadgeProps = {
  label: string;
  /** Free-cancellation style uses teal; facility signals use navy for quieter hierarchy. */
  tone?: "teal" | "navy";
};

export function SafetyBadge({ label, tone = "navy" }: SafetyBadgeProps) {
  const toneClass =
    tone === "teal"
      ? "bg-[var(--ocean-teal)]/10 text-[var(--ocean-teal)]"
      : "bg-[var(--sand)] text-[var(--navy)] ring-1 ring-[var(--navy)]/10";

  return (
    <span
      className={`inline-flex max-w-full items-center rounded-full px-2.5 py-1 text-xs font-medium leading-snug ${toneClass}`}
    >
      <span className="truncate">{label}</span>
    </span>
  );
}

type SafetyBadgeListProps = {
  badges: string[];
  freeCancellation?: boolean;
  max?: number;
};

/** Renders free-cancellation first, then facility-derived safety badges. */
export function SafetyBadgeList({
  badges,
  freeCancellation = false,
  max = 4,
}: SafetyBadgeListProps) {
  const facilityBadges = badges.slice(0, freeCancellation ? max - 1 : max);
  if (!freeCancellation && facilityBadges.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {freeCancellation && <SafetyBadge label="Free cancellation" tone="teal" />}
      {facilityBadges.map((label) => (
        <SafetyBadge key={label} label={label} />
      ))}
    </div>
  );
}
