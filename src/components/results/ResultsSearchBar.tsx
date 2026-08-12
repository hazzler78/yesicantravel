"use client";

import { useEffect, useState } from "react";
import { ChevronUp, Pencil, Search } from "lucide-react";
import { SearchBar, type SearchBarProps } from "@/components/search/SearchBar";

type ResultsSearchBarProps = SearchBarProps & {
  /** One-line description of the current search, shown while collapsed. */
  summary: string;
};

/** Enough movement to read as intent, not as momentum jitter on a touch screen. */
const COLLAPSE_AFTER_PX = 40;

/**
 * On a phone the full search bar is five stacked fields, which is most of the
 * screen — fine on the homepage where searching is the job, in the way on
 * results where it isn't. So it collapses to a single summary row that can be
 * tapped open, and closes itself again as soon as you scroll down.
 */
export function ResultsSearchBar({ summary, ...searchBarProps }: ResultsSearchBarProps) {
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (!expanded) return;
    // Measured from where the form was opened. Comparing against the previous
    // scroll event instead would never accumulate past the threshold.
    const openedAtY = window.scrollY;
    const onScroll = () => {
      if (Math.abs(window.scrollY - openedAtY) > COLLAPSE_AFTER_PX) setExpanded(false);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [expanded]);

  return (
    <div>
      {!expanded && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          aria-expanded={false}
          className="flex w-full items-center gap-3 rounded-card border border-border bg-surface px-3 py-2.5 text-left shadow-card md:hidden"
        >
          <Search className="h-4 w-4 shrink-0 text-ink-muted" aria-hidden />
          <span className="min-w-0 flex-1 truncate text-[0.9375rem] font-medium text-ink">
            {summary}
          </span>
          <span className="inline-flex shrink-0 items-center gap-1 text-[0.8125rem] font-semibold text-teal">
            <Pencil className="h-3.5 w-3.5" aria-hidden />
            Edit
          </span>
        </button>
      )}

      {/* Kept mounted so a half-typed destination survives collapsing. */}
      <div className={expanded ? "block" : "hidden md:block"}>
        <SearchBar {...searchBarProps} onSubmitted={() => setExpanded(false)} />
        {expanded && (
          <button
            type="button"
            onClick={() => setExpanded(false)}
            className="mt-2 inline-flex items-center gap-1.5 text-[0.8125rem] font-medium text-ink-muted underline-offset-4 hover:text-ink hover:underline md:hidden"
          >
            <ChevronUp className="h-3.5 w-3.5" aria-hidden />
            Hide search
          </button>
        )}
      </div>
    </div>
  );
}
