"use client";

import { useState } from "react";
import { ImageOff, X } from "lucide-react";

type HotelGalleryProps = {
  name: string;
  images: string[];
};

/**
 * One large image plus a four-up grid, the layout every booking site uses
 * because it shows the room, the bathroom and the street in one glance.
 */
export function HotelGallery({ name, images }: HotelGalleryProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const visible = images.slice(0, 5);

  if (visible.length === 0) {
    return (
      <div className="flex h-56 items-center justify-center rounded-card border border-border bg-surface-muted text-ink-muted">
        <ImageOff className="h-6 w-6" aria-hidden />
        <span className="ml-2 text-[0.9375rem]">No photos provided</span>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-2 overflow-hidden rounded-card sm:h-[340px] sm:grid-cols-4 sm:grid-rows-2">
        {visible.map((url, index) => (
          <button
            key={`${url}-${index}`}
            type="button"
            onClick={() => setLightboxIndex(index)}
            className={`group relative overflow-hidden bg-surface-muted ${
              index === 0
                ? "col-span-2 row-span-2 aspect-[4/3] sm:aspect-auto"
                : "hidden sm:block"
            }`}
          >
            {/* Partner CDN images aren't configured as next/image remote hosts. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={url}
              alt={index === 0 ? name : ""}
              loading={index === 0 ? "eager" : "lazy"}
              decoding="async"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
            />
            {index === 4 && images.length > 5 && (
              <span className="absolute inset-0 flex items-center justify-center bg-ink/55 text-[0.9375rem] font-semibold text-ink-inverse">
                +{images.length - 5} photos
              </span>
            )}
          </button>
        ))}
      </div>

      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/90 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={`${name} photos`}
          onClick={() => setLightboxIndex(null)}
        >
          <button
            type="button"
            onClick={() => setLightboxIndex(null)}
            className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full bg-surface text-ink"
          >
            <X className="h-5 w-5" aria-hidden />
            <span className="sr-only">Close photos</span>
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={images[lightboxIndex]}
            alt=""
            className="max-h-full max-w-5xl rounded-card object-contain"
          />
        </div>
      )}
    </>
  );
}
