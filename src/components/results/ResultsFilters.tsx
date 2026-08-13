"use client";

import { useMemo } from "react";
import type { LucideIcon } from "lucide-react";
import { DoorOpen, ShieldCheck, TrainFront, Venus } from "lucide-react";
import type { StayFilterId } from "@/lib/staySignals";
import { NEAR_TRANSIT_KM } from "@/lib/staySignals";
import type { CurrencyCode } from "@/lib/currency";
import { formatStayTotal } from "@/lib/formatStayPrice";
import { budgetCapsFromStayTotals } from "@/lib/budgetFilter";

export type ResultsFilterState = {
  minRating: number | null;
  maxPrice: number | null;
  onlyFreeCancellation: boolean;
  signals: StayFilterId[];
};

type ResultsFiltersProps = ResultsFilterState & {
  /** How many of the currently listed stays match each signal. */
  signalCounts: Record<StayFilterId, number>;
  onChange: (patch: Partial<ResultsFilterState>) => void;
  onReset: () => void;
  isFiltered: boolean;
  currency: CurrencyCode;
  nights: number;
  /** Stay totals in `currency`, used to pick budget steps that match this search. */
  stayPrices: number[];
};

const RATING_OPTIONS: Array<{ value: number | null; label: string }> = [
  { value: null, label: "Any" },
  { value: 7, label: "7+" },
  { value: 8, label: "8+" },
  { value: 9, label: "9+" },
];

const SIGNAL_OPTIONS: Array<{
  id: StayFilterId;
  label: string;
  hint: string;
  Icon: LucideIcon;
}> = [
  {
    id: "nearTransit",
    label: "Short walk to a station",
    hint: `Under ${NEAR_TRANSIT_KM * 1000} m to a train, metro or bus station`,
    Icon: TrainFront,
  },
  {
    id: "securityOnSite",
    label: "24-hour security",
    hint: "A staffed security presence, not only cameras",
    Icon: ShieldCheck,
  },
  {
    id: "privateCheckIn",
    label: "Private check-in",
    hint: "Check in away from a shared lobby desk",
    Icon: DoorOpen,
  },
  {
    id: "womenOnlyRoom",
    label: "Women-only room",
    hint: "Rare — few properties publish this",
    Icon: Venus,
  },
];

function PillGroup<T extends number | null>({
  legend,
  hint,
  options,
  value,
  onSelect,
}: {
  legend: string;
  hint?: string;
  options: Array<{ value: T; label: string }>;
  value: T;
  onSelect: (value: T) => void;
}) {
  return (
    <fieldset>
      <legend className="text-[0.8125rem] font-semibold text-ink">{legend}</legend>
      {hint && <p className="mt-0.5 text-xs text-ink-muted">{hint}</p>}
      <div className="mt-2 flex flex-wrap gap-1.5">
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <button
              key={String(option.value)}
              type="button"
              aria-pressed={selected}
              onClick={() => onSelect(option.value)}
              className={`min-h-[34px] rounded-full border px-3 text-[0.8125rem] font-medium transition-colors ${
                selected
                  ? "border-teal bg-teal-soft text-teal"
                  : "border-border text-ink-muted hover:border-border-strong hover:text-ink"
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}

export function ResultsFilters({
  minRating,
  maxPrice,
  onlyFreeCancellation,
  signals,
  signalCounts,
  onChange,
  onReset,
  isFiltered,
  currency,
  nights,
  stayPrices,
}: ResultsFiltersProps) {
  const priceOptions = useMemo(() => {
    const caps = budgetCapsFromStayTotals(stayPrices, currency);
    const values = maxPrice != null && !caps.includes(maxPrice) ? [...caps, maxPrice].sort((a, b) => a - b) : caps;
    return [
      { value: null, label: "Any" },
      ...values.map((value) => ({
        value,
        label: `Up to ${formatStayTotal(value, currency)}`,
      })),
    ];
  }, [stayPrices, currency, maxPrice]);

  const toggleSignal = (id: StayFilterId) => {
    onChange({
      signals: signals.includes(id) ? signals.filter((s) => s !== id) : [...signals, id],
    });
  };

  return (
    <div className="space-y-5 rounded-card border border-border bg-surface p-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-display text-base font-semibold text-ink">Filters</h2>
        {isFiltered && (
          <button
            type="button"
            onClick={onReset}
            className="text-[0.8125rem] font-medium text-teal underline-offset-4 hover:underline"
          >
            Clear all
          </button>
        )}
      </div>

      <fieldset className="border-t border-border pt-4">
        <legend className="text-[0.8125rem] font-semibold text-ink">Safety and access</legend>
        <p className="mt-0.5 text-xs text-ink-muted">
          Counts show how many of these stays publish each one.
        </p>
        <ul className="mt-2.5 space-y-2.5">
          {SIGNAL_OPTIONS.map(({ id, label, hint, Icon }) => {
            const count = signalCounts[id] ?? 0;
            const checked = signals.includes(id);
            const unavailable = count === 0 && !checked;
            return (
              <li key={id}>
                <label
                  className={`flex items-start gap-2.5 ${
                    unavailable ? "cursor-not-allowed opacity-55" : "cursor-pointer"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={unavailable}
                    onChange={() => toggleSignal(id)}
                    className="mt-0.5 h-4 w-4 shrink-0 rounded border-border-strong text-teal focus:ring-teal/30 disabled:cursor-not-allowed"
                  />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-1.5 text-[0.8125rem] font-semibold text-ink">
                      <Icon className="h-3.5 w-3.5 shrink-0 text-ink-muted" aria-hidden />
                      {label}
                      <span className="tnum ml-auto pl-2 font-normal text-ink-muted">{count}</span>
                    </span>
                    <span className="mt-0.5 block text-xs text-ink-muted">{hint}</span>
                  </span>
                </label>
              </li>
            );
          })}
        </ul>
      </fieldset>

      <div className="border-t border-border pt-4">
        <PillGroup
          legend="Guest rating"
          hint="Out of 10, from verified stays"
          options={RATING_OPTIONS}
          value={minRating}
          onSelect={(value) => onChange({ minRating: value })}
        />
      </div>

      <div className="border-t border-border pt-4">
        <PillGroup
          legend="Budget"
          hint={`Whole stay · ${nights} ${nights === 1 ? "night" : "nights"} · ${currency}`}
          options={priceOptions}
          value={maxPrice}
          onSelect={(value) => onChange({ maxPrice: value })}
        />
      </div>

      <div className="border-t border-border pt-4">
        <label className="flex cursor-pointer items-start gap-2.5">
          <input
            type="checkbox"
            checked={onlyFreeCancellation}
            onChange={(event) => onChange({ onlyFreeCancellation: event.target.checked })}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-border-strong text-teal focus:ring-teal/30"
          />
          <span>
            <span className="block text-[0.8125rem] font-semibold text-ink">
              Free cancellation only
            </span>
            <span className="mt-0.5 block text-xs text-ink-muted">
              Keeps your options open if plans change.
            </span>
          </span>
        </label>
      </div>

      <p className="border-t border-border pt-4 text-xs leading-relaxed text-ink-muted">
        These come from what each property publishes, not from our own inspection. Women-only
        floors and dorms are rarely listed at all, so that filter is often empty.
      </p>
    </div>
  );
}
