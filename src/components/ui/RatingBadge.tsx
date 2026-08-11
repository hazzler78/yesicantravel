import { Star } from "lucide-react";

type RatingBadgeProps = {
  rating: number;
  className?: string;
};

/** Ratings come through as either a guest score or a star count, so we show the raw value. */
export function RatingBadge({ rating, className = "" }: RatingBadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-control bg-teal-soft px-2 py-1 text-[0.8125rem] font-semibold text-teal ${className}`}
    >
      <Star className="h-3.5 w-3.5 fill-current" aria-hidden />
      <span className="tnum">{Number.isInteger(rating) ? rating : rating.toFixed(1)}</span>
    </span>
  );
}
