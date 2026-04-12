import { permanentRedirect } from "next/navigation";

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function firstParam(v: string | string[] | undefined): string {
  if (v === undefined) return "";
  return (Array.isArray(v) ? v[0] : v) ?? "";
}

/**
 * Legacy hotel deep links from the pre-events flow (e.g. /hotels/lp1ab1f?...).
 * Permanent redirect to /results with equivalent search params so old bookmarks and
 * external links keep working and stop returning 404 + noindex.
 */
export default async function LegacyHotelsRedirect({ searchParams }: Props) {
  const sp = await searchParams;

  const placeId = firstParam(sp.placeId).trim();
  const checkin = firstParam(sp.checkin).trim();
  const checkout = firstParam(sp.checkout).trim();
  const adults = firstParam(sp.adults).trim() || "2";
  let name = firstParam(sp.name).trim();
  try {
    name = decodeURIComponent(name);
  } catch {
    // keep raw name
  }

  if (!checkin || !checkout) {
    permanentRedirect("/");
  }

  const qs = new URLSearchParams({
    checkin,
    checkout,
    adults,
  });

  if (placeId) {
    qs.set("placeId", placeId);
  } else if (name) {
    qs.set("aiSearch", `central safe hotel ${name} well-lit`);
  } else {
    permanentRedirect("/");
  }

  permanentRedirect(`/results?${qs.toString()}`);
}
