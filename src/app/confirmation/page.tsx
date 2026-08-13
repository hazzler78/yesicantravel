"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { track } from "@vercel/analytics";
import { CalendarDays, Check, MapPin } from "lucide-react";
import { fbqTrack, generateMetaEventId } from "@/lib/metaPixel";
import { sendMetaCapiEvent } from "@/lib/metaCapi";
import { pinterestTrack } from "@/lib/pinterest";
import { formatStayTotal } from "@/lib/formatStayPrice";
import { BookingSuccess } from "@/components/checkout/BookingSuccess";
import { CheckoutMessage } from "@/components/checkout/CheckoutMessage";
import { Card } from "@/components/ui/Card";
import { SecondaryLink } from "@/components/ui/SecondaryButton";
import { HotelLocationCard } from "@/components/HotelLocationCard";

interface Booking {
  bookingId?: string;
  status?: string;
  hotelConfirmationCode?: string;
  checkin?: string;
  checkout?: string;
  price?: number;
  currency?: string;
  hotel?: { hotelId?: string; name?: string };
  cancellationPolicies?: {
    refundableTag?: string;
    cancelPolicyInfos?: Array<{ cancelTime?: string }>;
  };
}

function ConfirmationContent() {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("bookingId");
  const [booking, setBooking] = useState<Booking | null>(null);
  const [hotelDetail, setHotelDetail] = useState<{
    name?: string;
    main_photo?: string;
    address?: string;
    city?: string;
    hotelDescription?: string;
    hotelFacilities?: string[];
    starRating?: number;
    location?: { latitude?: number; longitude?: number };
  } | null>(null);

  useEffect(() => {
    if (!bookingId) return;
    const stored = sessionStorage.getItem(`liteapi_booking_${bookingId}`);
    if (stored) {
      try {
        const b = JSON.parse(stored) as Booking;
        setBooking(b);
        if (b.hotel?.hotelId) {
          fetch(`/api/hotel?hotelId=${encodeURIComponent(b.hotel.hotelId)}`)
            .then((r) => r.json())
            .then((j) => setHotelDetail(j.data))
            .catch(() => {});
        }
      } catch {
        setBooking({ bookingId });
      }
    } else {
      setBooking({ bookingId });
    }
  }, [bookingId]);

  useEffect(() => {
    if (bookingId) {
      track("booking_confirmation_view", { bookingId });
    }
  }, [bookingId]);

  useEffect(() => {
    if (booking && booking.price != null) {
      const purchaseEventId =
        booking.bookingId != null
          ? `purchase_${booking.bookingId}`
          : generateMetaEventId("purchase");
      const purchaseData = {
        value: booking.price,
        currency: booking.currency ?? "USD",
        content_ids: booking.hotel?.hotelId ? [booking.hotel.hotelId] : undefined,
        content_type: "product",
      };
      fbqTrack("Purchase", purchaseData, { eventId: purchaseEventId });
      void sendMetaCapiEvent({
        eventName: "Purchase",
        eventId: purchaseEventId,
        eventSourceUrl: window.location.href,
        customData: purchaseData,
      });
      pinterestTrack("checkout", {
        event_id: booking.bookingId ?? bookingId ?? undefined,
        value: booking.price,
        currency: booking.currency ?? "USD",
        order_quantity: 1,
      });
      fetch("/api/automation/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "event",
          event: {
            type: "booking_completed",
            eventName: "confirmation_purchase",
            eventId: purchaseEventId,
            pageUrl: window.location.href,
            metadata: {
              bookingId: booking.bookingId ?? bookingId ?? undefined,
              value: booking.price,
              currency: booking.currency ?? "USD",
            },
          },
        }),
      }).catch(() => {});
    }
  }, [booking]);

  if (!bookingId) {
    return (
      <CheckoutMessage
        title="No booking reference"
        body="We need a booking reference to look up your reservation. Check the link in your confirmation email."
        actionHref="/"
        actionLabel="Back to search"
      />
    );
  }

  const refundable = booking?.cancellationPolicies?.refundableTag === "RFN";
  const cancelBy = booking?.cancellationPolicies?.cancelPolicyInfos?.[0]?.cancelTime;

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <BookingSuccess
        bookingId={booking?.bookingId ?? bookingId}
        hotelConfirmationCode={booking?.hotelConfirmationCode}
        actions={<SecondaryLink href="/">Plan another trip</SecondaryLink>}
      >
        {booking?.hotel && (
          <div className="mt-6 border-t border-border pt-6">
            <h2 className="font-display text-base font-semibold text-ink">Your stay</h2>

            <div className="mt-3 flex gap-4">
              {hotelDetail?.main_photo && (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={hotelDetail.main_photo}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="h-24 w-24 shrink-0 rounded-control object-cover"
                />
              )}
              <div className="min-w-0">
                <p className="font-display text-lg font-semibold text-ink">{booking.hotel.name}</p>
                {hotelDetail?.address && (
                  <p className="mt-1 flex items-start gap-1.5 text-[0.9375rem] text-ink-muted">
                    <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
                    {hotelDetail.address}
                  </p>
                )}
                {booking.checkin && booking.checkout && (
                  <p className="tnum mt-1.5 flex items-center gap-1.5 text-[0.9375rem] text-ink">
                    <CalendarDays className="h-3.5 w-3.5 shrink-0 text-ink-muted" aria-hidden />
                    {booking.checkin} – {booking.checkout}
                  </p>
                )}
              </div>
            </div>

            <dl className="mt-5 grid gap-3 sm:grid-cols-2">
              {booking.price != null && (
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.08em] text-ink-muted">
                    Total paid
                  </dt>
                  <dd className="tnum mt-1 font-display text-lg font-semibold text-ink">
                    {formatStayTotal(booking.price, booking.currency ?? "EUR")}
                  </dd>
                </div>
              )}
              {booking.cancellationPolicies?.refundableTag && (
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.08em] text-ink-muted">
                    Cancellation
                  </dt>
                  <dd className="mt-1 text-[0.9375rem] text-ink">
                    {refundable ? "Free cancellation" : "Non-refundable"}
                    {refundable && cancelBy && <> until {cancelBy}</>}
                  </dd>
                </div>
              )}
            </dl>

            {hotelDetail?.hotelFacilities && hotelDetail.hotelFacilities.length > 0 && (
              <div className="mt-5">
                <h3 className="text-xs font-semibold uppercase tracking-[0.08em] text-ink-muted">
                  Facilities
                </h3>
                <ul className="mt-2 grid gap-x-6 gap-y-1.5 text-[0.9375rem] text-ink sm:grid-cols-2">
                  {hotelDetail.hotelFacilities.slice(0, 12).map((facility) => (
                    <li key={facility} className="flex items-start gap-2">
                      <Check className="mt-1 h-3.5 w-3.5 shrink-0 text-teal" aria-hidden />
                      <span>{facility}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </BookingSuccess>

      {hotelDetail && (hotelDetail.address || hotelDetail.location) && (
        <div className="mt-4">
          <HotelLocationCard
            name={hotelDetail.name ?? booking?.hotel?.name ?? "Your stay"}
            address={hotelDetail.address}
            city={hotelDetail.city}
            location={hotelDetail.location ?? hotelDetail}
          />
        </div>
      )}

      <Card className="mt-4 p-5">
        <h2 className="font-display text-base font-semibold text-ink">Before you travel</h2>
        <ul className="mt-2 space-y-1.5 text-[0.9375rem] text-ink-muted">
          <li>Save the booking reference — the property will ask for it at check-in.</li>
          <li>Message the hotel directly if you&apos;ll arrive late; most desks want a heads-up.</li>
          <li>Check the cancellation terms above before changing your plans.</li>
        </ul>
      </Card>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
          <div className="h-64 animate-pulse rounded-card bg-surface-muted" />
        </div>
      }
    >
      <ConfirmationContent />
    </Suspense>
  );
}
