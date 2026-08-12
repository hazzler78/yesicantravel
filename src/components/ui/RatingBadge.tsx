type RatingBadgeProps = {
  /** Guest score on a 10-point scale. */
  rating: number;
  reviewCount?: number;
  className?: string;
};

/**
 * A weak score must not be dressed up in the same approving colour as a strong
 * one — this audience is deciding whether to trust the place, not skimming.
 */
function ratingTone(rating: number) {
  if (rating >= 8) return { word: rating >= 9 ? "Exceptional" : "Very good", chip: "bg-teal text-white" };
  if (rating >= 7) return { word: "Good", chip: "bg-teal/75 text-white" };
  if (rating >= 6) return { word: "Mixed reviews", chip: "bg-surface-muted text-ink ring-1 ring-border" };
  return { word: "Poorly rated", chip: "bg-coral-soft text-coral ring-1 ring-coral/30" };
}

export function RatingBadge({ rating, reviewCount, className = "" }: RatingBadgeProps) {
  const { word, chip } = ratingTone(rating);

  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span
        className={`tnum inline-flex min-w-[2.5rem] items-center justify-center rounded-control px-1.5 py-1 text-[0.8125rem] font-semibold ${chip}`}
      >
        {rating.toFixed(1)}
      </span>
      <span className="text-[0.8125rem] leading-tight text-ink-muted">
        <span className="block font-semibold text-ink">{word}</span>
        {reviewCount != null && reviewCount > 0 && (
          <span className="tnum block">{reviewCount.toLocaleString("en-GB")} reviews</span>
        )}
      </span>
    </span>
  );
}
