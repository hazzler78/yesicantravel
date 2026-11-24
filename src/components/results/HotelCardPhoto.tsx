"use client";

import { useEffect, useState } from "react";
import { Building2 } from "lucide-react";

type HotelCardPhotoProps = {
  src?: string;
  name: string;
};

/**
 * Partner CDN thumbnails occasionally 404; swap to a soft placeholder instead
 * of the browser broken-image icon.
 */
export function HotelCardPhoto({ src, name }: HotelCardPhotoProps) {
  const [activeSrc, setActiveSrc] = useState(src);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    setActiveSrc(src);
    setFailed(false);
  }, [src]);

  if (!activeSrc || failed) {
    return (
      <span className="flex h-full w-full flex-col items-center justify-center gap-2 bg-surface-muted px-3 text-center text-ink-muted">
        <Building2 className="h-7 w-7 opacity-70" aria-hidden />
        <span className="sr-only">No photo for {name}</span>
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={activeSrc}
      alt=""
      width={496}
      height={376}
      loading="lazy"
      decoding="async"
      sizes="(max-width: 640px) 100vw, 248px"
      className="h-full w-full object-cover"
      onError={() => setFailed(true)}
    />
  );
}