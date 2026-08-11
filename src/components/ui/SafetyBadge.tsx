import type { LucideIcon } from "lucide-react";
import {
  ArrowUpDown,
  CalendarCheck,
  CigaretteOff,
  Clock,
  Lamp,
  Lock,
  ShieldCheck,
  Wifi,
} from "lucide-react";

/** Keeps the badge iconography tied to the labels produced by deriveSafetyBadges. */
const BADGE_ICONS: Record<string, LucideIcon> = {
  "24/7 reception": Clock,
  "Security on site": ShieldCheck,
  "In-room safe": Lock,
  "Lift access": ArrowUpDown,
  "Well-lit entrance": Lamp,
  "Non-smoking property": CigaretteOff,
  "Free WiFi": Wifi,
};

type Tone = "neutral" | "positive";

type SafetyBadgeProps = {
  label: string;
  tone?: Tone;
  icon?: LucideIcon;
};

export function SafetyBadge({ label, tone = "neutral", icon }: SafetyBadgeProps) {
  const Icon = icon ?? BADGE_ICONS[label];
  const toneClass =
    tone === "positive"
      ? "bg-positive-soft text-positive"
      : "bg-surface-muted text-ink ring-1 ring-border";

  return (
    <span
      className={`inline-flex max-w-full items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium leading-snug ${toneClass}`}
    >
      {Icon && <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />}
      <span className="truncate">{label}</span>
    </span>
  );
}

type SafetyBadgeListProps = {
  badges: string[];
  freeCancellation?: boolean;
  max?: number;
  className?: string;
};

/** Renders free-cancellation first, then facility-derived safety badges. */
export function SafetyBadgeList({
  badges,
  freeCancellation = false,
  max = 4,
  className = "",
}: SafetyBadgeListProps) {
  const facilityBadges = badges.slice(0, freeCancellation ? max - 1 : max);
  if (!freeCancellation && facilityBadges.length === 0) return null;

  return (
    <div className={`flex flex-wrap items-center gap-1.5 ${className}`}>
      {freeCancellation && (
        <SafetyBadge label="Free cancellation" tone="positive" icon={CalendarCheck} />
      )}
      {facilityBadges.map((label) => (
        <SafetyBadge key={label} label={label} />
      ))}
    </div>
  );
}
