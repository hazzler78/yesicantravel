type RatingBadgeProps = {
  /** Guest score on a 10-point scale. */
  rating: number;
  reviewCount?: number;
  className?: string;
};

function ratingWord(rating: number) {
  if (rating >= 9) return "Exceptional";
  if (rating >= 8) return "Very good";
  if (rating >= 7) return "Good";
  return "Guest score";
}

/** Guest scores come from the property's review feed on a 10-point scale. */
export function RatingBadge({ rating, reviewCount, className = "" }: RatingBadgeProps) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      <span className="tnum inline-flex min-w-[2.5rem] items-center justify-center rounded-control bg-teal px-1.5 py-1 text-[0.8125rem] font-semibold text-white">
        {rating.toFixed(1)}
      </span>
      <span className="text-[0.8125rem] leading-tight text-ink-muted">
        <span className="block font-semibold text-ink">{ratingWord(rating)}</span>
        {reviewCount != null && reviewCount > 0 && (
          <span className="tnum block">{reviewCount.toLocaleString("en-GB")} reviews</span>
        )}
      </span>
    </span>
  );
}
