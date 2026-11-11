import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { getDestinationBySlug } from "@/data/destinations";
import { getPlaceIdForDestinationSlug } from "@/data/popularCities";
import { SAFEST_CITIES_DESTINATION_SLUGS } from "@/lib/relatedGuides";
import { getDefaultStayWindow } from "@/lib/stayDates";

type SafestCitiesSearchCtaProps = {
  className?: string;
};

/**
 * Prefilled /results links for each city on the safest-cities listicle.
 */
export function SafestCitiesSearchCta({ className = "" }: SafestCitiesSearchCtaProps) {
  const stay = getDefaultStayWindow();

  return (
    <Card className={`p-5 sm:p-6 ${className}`}>
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-teal">
        Search stays
      </p>
      <h2 className="mt-2 font-display text-lg font-semibold text-ink sm:text-xl">
        Open a pre-filled search for each city
      </h2>
      <p className="mt-1.5 text-[0.9375rem] text-ink-muted">
        Two-night stay, one adult, safest-first sort — change dates on the results page.
      </p>
      <ul className="mt-4 space-y-2">
        {SAFEST_CITIES_DESTINATION_SLUGS.map((slug) => {
          const dest = getDestinationBySlug(slug);
          if (!dest) return null;
          const placeId = getPlaceIdForDestinationSlug(slug);
          const params = new URLSearchParams({
            checkin: stay.checkin,
            checkout: stay.checkout,
            adults: "1",
          });
          if (placeId) {
            params.set("placeId", placeId);
          } else if (dest.aiSearch) {
            params.set("aiSearch", dest.aiSearch);
          }
          return (
            <li key={slug}>
              <Link
                href={`/results?${params.toString()}`}
                className="text-teal underline underline-offset-4 hover:text-teal/90"
              >
                Search safer stays in {dest.city}
              </Link>
              <span className="text-ink-muted">
                {" "}
                ·{" "}
                <Link
                  href={`/destinations/${slug}`}
                  className="text-ink-muted underline underline-offset-4 hover:text-ink"
                >
                  area guide
                </Link>
              </span>
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
