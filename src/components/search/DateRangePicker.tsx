"use client";

import { useEffect, useId, useMemo, useState, useRef } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";

type DateRangePickerProps = {
  checkin: string;
  checkout: string;
  minDate: string;
  maxDate: string;
  onChange: (next: { checkin: string; checkout: string }) => void;
  compact?: boolean;
  inputClass: string;
  labelClass: string;
};

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"] as const;

function parseIso(iso: string) {
  // Noon avoids DST / timezone day-shift when formatting local calendars.
  return new Date(`${iso}T12:00:00`);
}

function toIso(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addMonths(date: Date, count: number) {
  const next = new Date(date);
  next.setMonth(next.getMonth() + count);
  return next;
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1, 12);
}

function daysInMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

/** Monday = 0 … Sunday = 6 (Europe-first calendars). */
function mondayIndex(date: Date) {
  return (date.getDay() + 6) % 7;
}

function formatShort(iso: string) {
  return parseIso(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

function formatMonthTitle(date: Date) {
  return date.toLocaleDateString("en-GB", { month: "long", year: "numeric" });
}

function nightsBetween(checkin: string, checkout: string) {
  const ms = parseIso(checkout).getTime() - parseIso(checkin).getTime();
  return Math.max(0, Math.round(ms / 86_400_000));
}

function buildMonthCells(month: Date) {
  const first = startOfMonth(month);
  const total = daysInMonth(month);
  const leading = mondayIndex(first);
  const cells: Array<{ iso: string; inMonth: boolean } | null> = [];

  for (let i = 0; i < leading; i++) cells.push(null);
  for (let day = 1; day <= total; day++) {
    const date = new Date(month.getFullYear(), month.getMonth(), day, 12);
    cells.push({ iso: toIso(date), inMonth: true });
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export function DateRangePicker({
  checkin,
  checkout,
  minDate,
  maxDate,
  onChange,
  compact,
  inputClass,
  labelClass,
}: DateRangePickerProps) {
  const reactId = useId();
  const panelId = `${reactId}-panel`;
  const [open, setOpen] = useState(false);
  // While picking: null = next click is check-in; set = next click is check-out.
  const [draftCheckin, setDraftCheckin] = useState<string | null>(null);
  const [hoverDate, setHoverDate] = useState<string | null>(null);
  const [visibleMonth, setVisibleMonth] = useState(() =>
    startOfMonth(checkin ? parseIso(checkin) : new Date())
  );
  const rootRef = useRef<HTMLDivElement>(null);
  const fieldPadding = compact ? "px-3 py-2" : "px-4 py-3";

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
        setDraftCheckin(null);
        setHoverDate(null);
      }
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        setDraftCheckin(null);
        setHoverDate(null);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const openPicker = () => {
    setVisibleMonth(startOfMonth(checkin ? parseIso(checkin) : parseIso(minDate)));
    setDraftCheckin(null);
    setHoverDate(null);
    setOpen((current) => !current);
  };

  const selectingCheckout = draftCheckin != null;
  const previewCheckout =
    selectingCheckout && hoverDate && hoverDate > draftCheckin! ? hoverDate : null;

  const rangeStart = selectingCheckout ? draftCheckin! : checkin;
  const rangeEnd = selectingCheckout ? previewCheckout ?? "" : checkout;

  const helperText = selectingCheckout
    ? "Now pick your check-out"
    : checkin && checkout
      ? `${nightsBetween(checkin, checkout)} night${nightsBetween(checkin, checkout) === 1 ? "" : "s"} · tap a date to change`
      : "Pick check-in, then check-out";

  const summary =
    checkin && checkout
      ? `${formatShort(checkin)} – ${formatShort(checkout)}`
      : "Add dates";

  const months = useMemo(() => [visibleMonth, addMonths(visibleMonth, 1)], [visibleMonth]);

  const canGoPrev = addMonths(visibleMonth, -1) >= startOfMonth(parseIso(minDate));
  const canGoNext = addMonths(visibleMonth, 1) <= startOfMonth(parseIso(maxDate));

  const selectDay = (iso: string) => {
    if (iso < minDate || iso > maxDate) return;

    if (!selectingCheckout) {
      setDraftCheckin(iso);
      setHoverDate(null);
      return;
    }

    // Second click: same day or earlier restarts check-in; later completes the stay.
    if (iso <= draftCheckin!) {
      setDraftCheckin(iso);
      setHoverDate(null);
      return;
    }

    onChange({ checkin: draftCheckin!, checkout: iso });
    setDraftCheckin(null);
    setHoverDate(null);
    setOpen(false);
  };

  const dayClass = (iso: string) => {
    const disabled = iso < minDate || iso > maxDate;
    const isStart = rangeStart === iso;
    const isEnd = rangeEnd === iso;
    const inRange =
      Boolean(rangeStart) &&
      Boolean(rangeEnd) &&
      iso > rangeStart &&
      iso < rangeEnd;
    const isToday = iso === toIso(new Date());

    if (disabled) {
      return "cursor-not-allowed text-ink-muted/35";
    }
    if (isStart || isEnd) {
      return "bg-teal text-white hover:bg-teal-hover";
    }
    if (inRange) {
      return "bg-teal-soft text-teal hover:bg-teal/15";
    }
    if (isToday) {
      return "ring-1 ring-inset ring-teal/40 text-ink hover:bg-surface-muted";
    }
    return "text-ink hover:bg-surface-muted";
  };

  const renderMonth = (month: Date, showWeekdays: boolean) => {
    const cells = buildMonthCells(month);
    return (
      <div className="min-w-0 flex-1">
        <p className="mb-2 text-center text-[0.875rem] font-semibold text-ink">
          {formatMonthTitle(month)}
        </p>
        {showWeekdays && (
          <div className="mb-1 grid grid-cols-7 gap-0.5">
            {WEEKDAYS.map((day) => (
              <span
                key={day}
                className="py-1 text-center text-[0.6875rem] font-semibold uppercase tracking-wide text-ink-muted"
              >
                {day}
              </span>
            ))}
          </div>
        )}
        <div className="grid grid-cols-7 gap-0.5" role="grid" aria-label={formatMonthTitle(month)}>
          {cells.map((cell, index) => {
            if (!cell) {
              return <span key={`empty-${index}`} className="h-10" aria-hidden />;
            }
            const disabled = cell.iso < minDate || cell.iso > maxDate;
            const label = parseIso(cell.iso).toLocaleDateString("en-GB", {
              weekday: "long",
              day: "numeric",
              month: "long",
              year: "numeric",
            });
            return (
              <button
                key={cell.iso}
                type="button"
                disabled={disabled}
                aria-label={label}
                aria-pressed={rangeStart === cell.iso || rangeEnd === cell.iso}
                onMouseEnter={() => {
                  if (selectingCheckout && !disabled) setHoverDate(cell.iso);
                }}
                onMouseLeave={() => setHoverDate(null)}
                onClick={() => selectDay(cell.iso)}
                className={`inline-flex h-10 w-full items-center justify-center rounded-full text-[0.875rem] font-medium transition-colors ${dayClass(cell.iso)}`}
              >
                {parseIso(cell.iso).getDate()}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div
      ref={rootRef}
      className={`relative min-w-0 border-b border-border md:w-52 md:border-b-0 md:border-r ${fieldPadding}`}
    >
      <label htmlFor={`${reactId}-dates`} className={labelClass}>
        <CalendarDays className="h-3.5 w-3.5" aria-hidden />
        Dates
      </label>
      <button
        type="button"
        id={`${reactId}-dates`}
        aria-expanded={open}
        aria-haspopup="dialog"
        aria-controls={panelId}
        onClick={openPicker}
        className={`${inputClass} mt-1 cursor-pointer truncate text-left`}
      >
        {summary}
      </button>

      {open && (
        <div
          id={panelId}
          role="dialog"
          aria-label="Choose check-in and check-out"
          className="absolute left-0 right-0 top-full z-40 mt-1 w-[min(100vw-2rem,36rem)] min-w-[18rem] rounded-card border border-border bg-surface p-3 shadow-pop sm:p-4 md:left-auto md:right-0"
        >
          <div className="mb-3 flex items-center justify-between gap-2">
            <button
              type="button"
              aria-label="Previous month"
              disabled={!canGoPrev}
              onClick={() => setVisibleMonth((current) => addMonths(current, -1))}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-ink disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" aria-hidden />
            </button>
            <p className="min-w-0 flex-1 text-center text-[0.8125rem] font-medium text-ink-muted">
              {helperText}
            </p>
            <button
              type="button"
              aria-label="Next month"
              disabled={!canGoNext}
              onClick={() => setVisibleMonth((current) => addMonths(current, 1))}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-border text-ink disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight className="h-4 w-4" aria-hidden />
            </button>
          </div>

          <div className="flex flex-col gap-4 md:flex-row md:gap-5">
            {renderMonth(months[0], true)}
            <div className="hidden md:block md:min-w-0 md:flex-1">{renderMonth(months[1], true)}</div>
          </div>

          {selectingCheckout && (
            <p className="mt-3 text-center text-[0.75rem] text-ink-muted">
              Check-in {formatShort(draftCheckin!)} — tap a later date for check-out
            </p>
          )}
        </div>
      )}
    </div>
  );
}
