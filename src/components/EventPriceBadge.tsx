import { FromPriceBadge } from "@/components/FromPriceBadge";

interface EventPriceBadgeProps {
  slug: string;
  eventShortName: string;
  venueNotes?: string;
}

export default function EventPriceBadge({ slug, eventShortName, venueNotes }: EventPriceBadgeProps) {
  return (
    <FromPriceBadge
      endpoint={`/api/events/${encodeURIComponent(slug)}/min-price`}
      detail={`during ${eventShortName}${venueNotes ? ` · near ${venueNotes}` : ""}`}
    />
  );
}
