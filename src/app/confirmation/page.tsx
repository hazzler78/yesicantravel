"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

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
    main_photo?: string;
    address?: string;
    hotelDescription?: string;
    hotelFacilities?: string[];
    starRating?: number;
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

  if (!bookingId) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[var(--sand)] text-[var(--navy)]">
        <p className="text-[var(--coral)]">No booking ID provided.</p>
        <Link href="/" className="text-[var(--ocean-teal)] font-medium hover:underline">← Back to search</Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--sand)] text-[var(--navy)]">
      <div className="mx-auto max-w-2xl px-6 py-10">
        <Link href="/" className="mb-8 inline-block text-[var(--ocean-teal)] font-medium hover:underline">
          ← New search
        </Link>

        <div className="mb-8 rounded-xl border border-[var(--ocean-teal)]/30 bg-[var(--ocean-teal)]/10 p-6">
          <h1 className="mb-2 text-2xl font-bold text-[var(--ocean-teal)]">You&apos;re all set</h1>
          <p className="text-[var(--navy)]">
            Your booking reference: <strong>{booking?.bookingId ?? bookingId}</strong>
          </p>
          {booking?.hotelConfirmationCode && (
            <p className="mt-1 text-[var(--navy-light)]">
              Hotel confirmation: {booking.hotelConfirmationCode}
            </p>
          )}
          {booking?.status && (
            <p className="mt-1 text-[var(--navy-light)]">Status: {booking.status}</p>
          )}
        </div>

        {booking?.hotel && (
          <div className="overflow-hidden rounded-xl border border-[var(--navy)]/10 bg-white shadow-sm">
            <h2 className="border-b border-[var(--navy)]/10 p-4 text-xl font-semibold text-[var(--navy)]">Stay details</h2>
            <div className="p-6">
              <h3 className="text-lg font-semibold text-[var(--navy)]">{booking.hotel.name}</h3>
              {hotelDetail?.address && (
                <p className="mt-2 text-[var(--navy-light)]">{hotelDetail.address}</p>
              )}
              {booking.checkin && booking.checkout && (
                <p className="mt-2 text-[var(--navy)]">
                  Check-in: {booking.checkin} → Check-out: {booking.checkout}
                </p>
              )}
              {booking.price != null && (
                <p className="mt-2 font-semibold text-[var(--ocean-teal)]">
                  {booking.currency ?? "USD"} {booking.price.toFixed(2)} total
                </p>
              )}
              {booking.cancellationPolicies?.refundableTag && (
                <p className="mt-2 text-[var(--navy-light)]">
                  Cancellation: {booking.cancellationPolicies.refundableTag}
                  {booking.cancellationPolicies.cancelPolicyInfos?.[0]?.cancelTime && (
                    <> — Free cancellation until {booking.cancellationPolicies.cancelPolicyInfos[0].cancelTime}</>
                  )}
                </p>
              )}
              {hotelDetail?.main_photo && (
                <img
                  src={hotelDetail.main_photo}
                  alt={booking.hotel.name}
                  className="mt-4 h-48 w-full rounded-lg object-cover"
                />
              )}
              {hotelDetail?.hotelFacilities && hotelDetail.hotelFacilities.length > 0 && (
                <div className="mt-4">
                  <h4 className="text-base font-medium text-[var(--navy)]">Facilities</h4>
                  <p className="mt-1 text-[var(--navy-light)]">{hotelDetail.hotelFacilities.join(", ")}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function ConfirmationPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-[var(--sand)] text-[var(--navy-light)]">Loading...</div>}>
      <ConfirmationContent />
    </Suspense>
  );
}
