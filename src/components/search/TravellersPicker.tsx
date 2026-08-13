"use client";

import { useEffect, useId, useRef, useState } from "react";
import { Minus, Plus, Users } from "lucide-react";
import {
  DEFAULT_CHILD_AGE,
  MAX_ADULTS,
  MAX_CHILD_AGE,
  MAX_CHILDREN,
  MIN_ADULTS,
  travellersSummary,
  type Party,
} from "@/lib/occupancy";

type TravellersPickerProps = {
  party: Party;
  onChange: (party: Party) => void;
  compact?: boolean;
  inputClass: string;
  labelClass: string;
};

function Stepper({
  id,
  label,
  value,
  min,
  max,
  onChange,
}: {
  id: string;
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (next: number) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <label htmlFor={id} className="text-[0.9375rem] font-medium text-ink">
        {label}
      </label>
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label={`Fewer ${label.toLowerCase()}`}
          disabled={value <= min}
          onClick={() => onChange(value - 1)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-ink disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Minus className="h-3.5 w-3.5" aria-hidden />
        </button>
        <span id={id} className="tnum w-5 text-center text-[0.9375rem] font-semibold text-ink">
          {value}
        </span>
        <button
          type="button"
          aria-label={`More ${label.toLowerCase()}`}
          disabled={value >= max}
          onClick={() => onChange(value + 1)}
          className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-ink disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Plus className="h-3.5 w-3.5" aria-hidden />
        </button>
      </div>
    </div>
  );
}

export function TravellersPicker({
  party,
  onChange,
  compact,
  inputClass,
  labelClass,
}: TravellersPickerProps) {
  const reactId = useId();
  const panelId = `${reactId}-panel`;
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const fieldPadding = compact ? "px-3 py-2" : "px-4 py-3";

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const setAdults = (adults: number) => onChange({ ...party, adults: Math.min(MAX_ADULTS, Math.max(MIN_ADULTS, adults)) });
  const setChildCount = (count: number) => {
    const next = party.childAges.slice(0, count);
    while (next.length < count) next.push(DEFAULT_CHILD_AGE);
    onChange({ ...party, childAges: next });
  };
  const setChildAge = (index: number, age: number) => {
    const next = [...party.childAges];
    next[index] = age;
    onChange({ ...party, childAges: next });
  };

  return (
    <div ref={rootRef} className={`relative min-w-0 border-b border-border md:w-56 md:border-b-0 md:border-r ${fieldPadding}`}>
      <label htmlFor={`${reactId}-travellers`} className={labelClass}>
        <Users className="h-3.5 w-3.5" aria-hidden />
        Travellers
      </label>
      <button
        type="button"
        id={`${reactId}-travellers`}
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((current) => !current)}
        className={`${inputClass} mt-1 cursor-pointer truncate text-left`}
      >
        {travellersSummary(party)}
      </button>

      {open && (
        <div
          id={panelId}
          role="dialog"
          aria-label="Adults and children"
          className="absolute left-0 right-0 top-full z-40 mt-1 w-[min(100%,20rem)] min-w-[16rem] rounded-card border border-border bg-surface p-4 shadow-pop md:right-auto"
        >
          <div className="space-y-3">
            <Stepper
              id={`${reactId}-adults`}
              label="Adults"
              value={party.adults}
              min={MIN_ADULTS}
              max={MAX_ADULTS}
              onChange={setAdults}
            />
            <Stepper
              id={`${reactId}-children`}
              label="Children"
              value={party.childAges.length}
              min={0}
              max={MAX_CHILDREN}
              onChange={setChildCount}
            />
          </div>

          {party.childAges.length > 0 && (
            <div className="mt-3 border-t border-border pt-3">
              <p className="text-xs text-ink-muted">
                Age at check-in. Hotels price children this way — 4 adults in one room is not the
                same as 2 adults and 2 children.
              </p>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {party.childAges.map((age, index) => (
                  <label key={index} className="block text-[0.8125rem] text-ink">
                    Child {index + 1}
                    <select
                      value={age}
                      onChange={(event) => setChildAge(index, Number(event.target.value))}
                      className="mt-1 w-full rounded-control border border-border bg-surface px-2 py-1.5 text-[0.8125rem]"
                    >
                      {Array.from({ length: MAX_CHILD_AGE + 1 }, (_, years) => (
                        <option key={years} value={years}>
                          {years === 0 ? "Under 1" : `${years}`}
                        </option>
                      ))}
                    </select>
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
