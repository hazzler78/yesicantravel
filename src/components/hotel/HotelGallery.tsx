"use client";

import { useCallback, useEffect, useId, useState } from "react";
import { ChevronLeft, ChevronRight, ImageOff, Images, X } from "lucide-react";

type HotelGalleryProps = {
  name: string;
  images: string[];
};

/**
 * Photos belong at the top of the hotel page — visitors decide fit from the
 * pictures before reading facilities. Mobile gets a swipeable strip of every
 * photo; desktop keeps the familiar mosaic with a clear "all photos" entry.
 */
export function HotelGallery({ name, images }: HotelGalleryProps) {
  const labelId = useId();
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const openAt = useCallback((index: number) => {
    setLightboxIndex(index);
  }, []);

  const close = useCallback(() => setLightboxIndex(null), []);

  const showPrev = useCallback(() => {
    setLightboxIndex((current) => {
      if (current === null || images.length === 0) return current;
      return (current - 1 + images.length) % images.length;
    });
  }, [images.length]);

  const showNext = useCallback(() => {
    setLightboxIndex((current) => {
      if (current === null || images.length === 0) return current;
      return (current + 1) % images.length;
    });
  }, [images.length]);

  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
      if (event.key === "ArrowLeft") showPrev();
      if (event.key === "ArrowRight") showNext();
    };
    window.addEventListener("keydown", onKey);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = previousOverflow;
    };
  }, [lightboxIndex, close, showPrev, showNext]);

  if (images.length === 0) {
    return (
      <div className="flex h-56 items-center justify-center rounded-card border border-border bg-surface-muted text-ink-muted">
        <ImageOff className="h-6 w-6" aria-hidden />
        <span className="ml-2 text-[0.9375rem]">No photos provided</span>
      </div>
    );
  }

  const mosaic = images.slice(0, 5);
  const extraCount = Math.max(0, images.length - mosaic.length);

  return (
    <section aria-labelledby={labelId} className="space-y-3">
      <div className="flex items-end justify-between gap-3">
        <h2 id={labelId} className="font-display text-base font-semibold text-ink sm:text-lg">
          Photos
        </h2>
        <button
          type="button"
          onClick={() => openAt(0)}
          className="inline-flex items-center gap-1.5 text-[0.8125rem] font-semibold text-teal hover:text-teal-hover"
        >
          <Images className="h-3.5 w-3.5" aria-hidden />
          View all {images.length} photos
        </button>
      </div>

      {/* Mobile: every photo in a horizontal strip — next image peeks so swipe is obvious. */}
      <div className="-mx-4 max-sm:block sm:hidden">
        <ul className="flex snap-x snap-mandatory gap-2.5 overflow-x-auto px-4 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {images.map((url, index) => (
            <li key={`m-${url}-${index}`} className="snap-start shrink-0">
              <button
                type="button"
                onClick={() => openAt(index)}
                className="relative block h-52 w-[min(72vw,280px)] overflow-hidden rounded-card bg-surface-muted"
              >
                {/* Partner CDN images aren't configured as next/image remote hosts. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={index === 0 ? name : ""}
                  loading={index < 3 ? "eager" : "lazy"}
                  decoding="async"
                  className="h-full w-full object-cover"
                />
                <span className="absolute bottom-2 right-2 rounded-control bg-ink/70 px-2 py-0.5 text-[0.6875rem] font-semibold text-ink-inverse">
                  {index + 1}/{images.length}
                </span>
                <span className="sr-only">
                  Photo {index + 1} of {images.length}
                </span>
              </button>
            </li>
          ))}
        </ul>
        <p className="mt-2 px-4 text-xs text-ink-muted">
          Swipe for all {images.length} photos · tap to enlarge
        </p>
      </div>

      {/* Desktop mosaic */}
      <div className="relative hidden overflow-hidden rounded-card sm:block sm:h-[360px]">
        <div className="grid h-full gap-2 sm:grid-cols-4 sm:grid-rows-2">
          {mosaic.map((url, index) => (
            <button
              key={`d-${url}-${index}`}
              type="button"
              onClick={() => openAt(index)}
              className={`group relative overflow-hidden bg-surface-muted ${
                index === 0 ? "col-span-2 row-span-2" : ""
              }`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={index === 0 ? name : ""}
                loading={index === 0 ? "eager" : "lazy"}
                decoding="async"
                className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              />
              {index === mosaic.length - 1 && extraCount > 0 && (
                <span className="absolute inset-0 flex items-center justify-center bg-ink/55 text-[0.9375rem] font-semibold text-ink-inverse">
                  +{extraCount} more
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex flex-col bg-ink/92"
          role="dialog"
          aria-modal="true"
          aria-label={`${name} photos`}
        >
          <div className="flex items-center justify-between gap-3 px-4 py-3 text-ink-inverse">
            <p className="tnum text-[0.9375rem] font-medium">
              {lightboxIndex + 1} / {images.length}
            </p>
            <button
              type="button"
              onClick={close}
              className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-surface text-ink"
            >
              <X className="h-5 w-5" aria-hidden />
              <span className="sr-only">Close photos</span>
            </button>
          </div>

          <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 pb-6">
            {images.length > 1 && (
              <button
                type="button"
                onClick={showPrev}
                className="absolute left-3 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full bg-surface text-ink shadow-card sm:left-6"
              >
                <ChevronLeft className="h-5 w-5" aria-hidden />
                <span className="sr-only">Previous photo</span>
              </button>
            )}

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={images[lightboxIndex]}
              alt=""
              className="max-h-full max-w-5xl rounded-card object-contain"
            />

            {images.length > 1 && (
              <button
                type="button"
                onClick={showNext}
                className="absolute right-3 z-10 inline-flex h-11 w-11 items-center justify-center rounded-full bg-surface text-ink shadow-card sm:right-6"
              >
                <ChevronRight className="h-5 w-5" aria-hidden />
                <span className="sr-only">Next photo</span>
              </button>
            )}
          </div>

          {images.length > 1 && (
            <div className="border-t border-white/10 px-4 py-3">
              <ul className="mx-auto flex max-w-5xl gap-2 overflow-x-auto pb-1">
                {images.map((url, index) => (
                  <li key={`t-${url}-${index}`} className="shrink-0">
                    <button
                      type="button"
                      onClick={() => openAt(index)}
                      aria-current={index === lightboxIndex}
                      className={`block h-14 w-20 overflow-hidden rounded-control border-2 ${
                        index === lightboxIndex ? "border-white" : "border-transparent opacity-70"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={url} alt="" className="h-full w-full object-cover" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
