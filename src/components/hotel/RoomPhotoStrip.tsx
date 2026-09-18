"use client";

import { useId, useState } from "react";
import { ImageOff } from "lucide-react";

type RoomPhotoStripProps = {
  roomName: string;
  photos: string[];
};

/**
 * Horizontal swipe strip for a single room's photos — matches the hotel
 * gallery pattern so visitors can check the actual room before reserving.
 */
export function RoomPhotoStrip({ roomName, photos }: RoomPhotoStripProps) {
  const labelId = useId();
  const [active, setActive] = useState(0);

  if (photos.length === 0) {
    return (
      <div className="flex aspect-[4/3] w-full items-center justify-center bg-surface-muted text-ink-muted sm:aspect-auto sm:h-full sm:min-h-[9rem] sm:w-44">
        <ImageOff className="h-5 w-5" aria-hidden />
        <span className="sr-only">No photos for {roomName}</span>
      </div>
    );
  }

  if (photos.length === 1) {
    return (
      <div className="aspect-[4/3] w-full shrink-0 bg-surface-muted sm:aspect-auto sm:w-44">
        {/* Partner CDN images aren't configured as next/image remote hosts. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photos[0]}
          alt=""
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  return (
    <div className="w-full shrink-0 sm:w-52" aria-labelledby={labelId}>
      <p id={labelId} className="sr-only">
        Photos of {roomName}
      </p>
      <ul className="flex snap-x snap-mandatory gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {photos.map((url, index) => (
          <li key={`${url}-${index}`} className="snap-start shrink-0">
            <button
              type="button"
              onClick={() => setActive(index)}
              className="relative block h-44 w-[min(70vw,220px)] overflow-hidden rounded-none bg-surface-muted sm:h-36 sm:w-52"
              aria-current={index === active}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt=""
                loading={index === 0 ? "eager" : "lazy"}
                decoding="async"
                className="h-full w-full object-cover"
              />
              <span className="absolute bottom-2 right-2 rounded-control bg-ink/70 px-2 py-0.5 text-[0.6875rem] font-semibold text-ink-inverse">
                {index + 1}/{photos.length}
              </span>
              <span className="sr-only">
                Photo {index + 1} of {photos.length}
              </span>
            </button>
          </li>
        ))}
      </ul>
      <p className="mt-1.5 px-1 text-xs text-ink-muted sm:px-0">
        Swipe to see all {photos.length} room photos
      </p>
    </div>
  );
}
