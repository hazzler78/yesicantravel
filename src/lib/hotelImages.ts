/**
 * Partner hotel CDNs often return multi‑hundred‑KB originals. List cards only
 * need ~250–500px wide images; prefer API thumbnails, then rewrite known URL
 * patterns to a smaller variant.
 */

export type HotelImageSource = {
  main_photo?: string | null;
  thumbnail?: string | null;
  hotelImages?: Array<{
    url?: string | null;
    thumbnailUrl?: string | null;
    defaultImage?: boolean;
  }> | null;
};

export type HotelImageSize = "list" | "gallery" | "full";

const SIZE_PX: Record<HotelImageSize, number> = {
  list: 480,
  gallery: 800,
  full: 1200,
};

/** Pick the best URL for a results-list thumbnail. */
export function pickListHotelPhoto(hotel: HotelImageSource): string | undefined {
  const fromImages = hotel.hotelImages?.find((img) => img.thumbnailUrl || img.url);
  const raw =
    hotel.thumbnail ||
    fromImages?.thumbnailUrl ||
    hotel.main_photo ||
    hotel.hotelImages?.find((img) => img.defaultImage)?.url ||
    hotel.hotelImages?.[0]?.url ||
    undefined;
  return raw ? shrinkHotelImageUrl(raw, "list") : undefined;
}

/** Dedupe and shrink gallery URLs; prefer full for lightbox sharpness. */
export function galleryHotelPhotos(hotel: HotelImageSource, size: HotelImageSize = "gallery"): string[] {
  const raw: string[] = [];
  if (hotel.main_photo) raw.push(hotel.main_photo);
  for (const img of hotel.hotelImages ?? []) {
    if (img?.url) raw.push(img.url);
  }
  return raw
    .filter((url, index, all) => Boolean(url) && all.indexOf(url) === index)
    .map((url) => shrinkHotelImageUrl(url, size));
}

/**
 * Rewrite known CDN URLs to a smaller derivative. Unknown hosts are returned
 * unchanged — better a large image than a broken one.
 */
export function shrinkHotelImageUrl(url: string, size: HotelImageSize = "list"): string {
  const max = SIZE_PX[size];
  try {
    const parsed = new URL(url);
    const host = parsed.hostname;

    // Booking CDN: .../max1200/... → .../max480/...
    if (host.includes("bstatic.com")) {
      parsed.pathname = parsed.pathname.replace(/\/max\d+\//i, `/max${max}/`);
      return parsed.toString();
    }

    // Expedia / travelapi letter suffixes: _z (largest) → _y/_b/_t
    if (host.includes("travelapi.com") || host.includes("expedia.com")) {
      const suffix = size === "list" ? "y" : size === "gallery" ? "z" : "z";
      parsed.pathname = parsed.pathname.replace(/_[a-z](?=\.(jpg|jpeg|webp|png)$)/i, `_${suffix}`);
      return parsed.toString();
    }

    // Snaphotel large room shots → smaller room folder when present
    if (host.includes("snaphotelapi.com") && size === "list") {
      parsed.pathname = parsed.pathname.replace("/rooms-large-pictures/", "/rooms-pictures/");
      return parsed.toString();
    }

    return url;
  } catch {
    return url;
  }
}
