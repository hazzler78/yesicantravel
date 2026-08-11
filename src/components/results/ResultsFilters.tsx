"use client";

export type ResultsFilterState = {
  minRating: number | null;
  maxPrice: number | null;
  onlyFreeCancellation: boolean;
};

type ResultsFiltersProps = ResultsFilterState & {
  onChange: (patch: Partial<ResultsFilterState>) => void;
  onReset: () => void;
  isFiltered: boolean;
};

const RATING_OPTIONS: Array<{ value: number | null; label: string }> = [
  { value: null, label: "Any" },
  { value: 3, label: "3+" },
  { value: 4, label: "4+" },
  { value: 4.5, label: "4.5+" },
];

const PRICE_OPTIONS: Array<{ value: number | null; label: string }> = [
  { value: null, label: "Any" },
  { value: 150, label: "Up to 150" },
  { value: 250, label: "Up to 250" },
  { value: 400, label: "Up to 400" },
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
  onChange,
  onReset,
  isFiltered,
}: ResultsFiltersProps) {
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

      <PillGroup
        legend="Guest rating"
        options={RATING_OPTIONS}
        value={minRating}
        onSelect={(value) => onChange({ minRating: value })}
      />

      <PillGroup
        legend="Budget"
        hint="Total for the whole stay"
        options={PRICE_OPTIONS}
        value={maxPrice}
        onSelect={(value) => onChange({ maxPrice: value })}
      />

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
    </div>
  );
}
