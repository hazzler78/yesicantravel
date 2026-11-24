"use client";

import { useState } from "react";
import {
  CityCardPhoto,
  type CityCardPhotoProps,
} from "@/components/cities/CityCardPhoto";
import {
  DEFAULT_DISCOVERY_CARD_PHOTO,
  type CityPhoto,
} from "@/lib/cityPhotos";

type DiscoveryCardPhotoProps = Omit<CityCardPhotoProps, "src" | "alt"> & {
  photo: CityPhoto;
};

/**
 * City/event discovery card image with a local WebP fallback if the asset 404s
 * (avoids the browser broken-image icon).
 */
export function DiscoveryCardPhoto({
  photo,
  ...rest
}: DiscoveryCardPhotoProps) {
  const [active, setActive] = useState(photo);

  return (
    <CityCardPhoto
      {...rest}
      src={active.src}
      alt={active.alt}
      onError={() => {
        if (active.src !== DEFAULT_DISCOVERY_CARD_PHOTO.src) {
          setActive(DEFAULT_DISCOVERY_CARD_PHOTO);
        }
      }}
    />
  );
}