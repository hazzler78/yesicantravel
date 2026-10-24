"use client";

import { useId, useMemo, useState } from "react";
import { ImageOff } from "lucide-react";
import { shrinkHotelImageUrl } from "@/lib/hotelImages";

type RoomPhotoStripProps = {
  roomName: string;
  photos: string[];
  /** Hotel-level images when the room has no mapped photos. */
  fallbackPhotos?: string[];
};

function RoomPhotoImg({
  src,
  eager,
  onFailed,
}: {
  src: string;
  eager?: boolean;
  onFailed: () => void;
}) {
  const [loaded, setLoaded] = useState(false);
  const displaySrc = shrinkHotelImageUrl(src, "list");

  return (
    <div className="relative h-full w-full bg-surface-muted">
      {!loaded && (
        <div
          className="absolute inset-0 animate-pulse bg-surface-muted"
          aria-hidden
        />
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={displaySrc}
        alt=""
        loading={eager ? "eager" : "lazy"}
        decoding="async"
        className={`h-full w-full object-cover transition-opacity duration-300 ${
          loaded ? "opacity-100" : "opacity-0"
        }`}
        onLoad={() => setLoaded(true)}
        onError={onFailed}
      />
    </div>
  );
}

/**
 * Horizontal swipe strip for a single room's photos — matches the hotel
 * gallery pattern so visitors can check the actual room before reserving.
 */
export function RoomPhotoStrip({ roomName, photos, fallbackPhotos = [] }: RoomPhotoStripProps) {
  const labelId = useId();
  const [active, setActive] = useState(0);
  const [broken, setBroken] = useState<Set<string>>(() => new Set());

  const allSources = useMemo(() => {
    const merged = [...photos, ...fallbackPhotos];
    return merged.filter((url, index) => Boolean(url) && merged.indexOf(url) === index);
  }, [photos, fallbackPhotos]);

  const visible = allSources.filter((url) => !broken.has(url));

  const markBroken = (url: string) => {
    setBroken((prev) => {
      const next = new Set(prev);
      next.add(url);
      return next;
    });
  };

  if (visible.length === 0) {
    return (
      <div className="flex aspect-[4/3] w-full items-center justify-center bg-surface-muted text-ink-muted sm:aspect-auto sm:h-full sm:min-h-[9rem] sm:w-44">
        <ImageOff className="h-5 w-5" aria-hidden />
        <span className="sr-only">No photos for {roomName}</span>
      </div>
    );
  }

  if (visible.length === 1) {
    return (
      <div className="aspect-[4/3] w-full shrink-0 overflow-hidden sm:aspect-auto sm:h-full sm:min-h-[9rem] sm:w-44">
        <RoomPhotoImg src={visible[0]} eager onFailed={() => markBroken(visible[0])} />
      </div>
    );
  }

  return (
    <div className="w-full shrink-0 sm:w-52" aria-labelledby={labelId}>
      <p id={labelId} className="sr-only">
        Photos of {roomName}
      </p>
      <ul className="flex snap-x snap-mandatory gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {visible.map((url, index) => (
          <li key={`${url}-${index}`} className="snap-start shrink-0">
            <button
              type="button"
              onClick={() => setActive(index)}
              className="relative block h-44 w-[min(70vw,220px)] overflow-hidden rounded-none bg-surface-muted sm:h-36 sm:w-52"
              aria-current={index === active}
            >
              <RoomPhotoImg
                src={url}
                eager={index === 0}
                onFailed={() => markBroken(url)}
              />
              <span className="absolute bottom-2 right-2 rounded-control bg-ink/70 px-2 py-0.5 text-[0.6875rem] font-semibold text-ink-inverse">
                {index + 1}/{visible.length}
              </span>
              <span className="sr-only">
                Photo {index + 1} of {visible.length}
              </span>
            </button>
          </li>
        ))}
      </ul>
      <p className="mt-1.5 px-1 text-xs text-ink-muted sm:px-0">
        Swipe to see all {visible.length} room photos
      </p>
    </div>
  );
}
