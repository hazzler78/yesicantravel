import { NextRequest, NextResponse } from "next/server";
import { prebook, LiteAPIError, searchRates, collectOfferIdsFromRatesData } from "@/lib/liteapi";

const STALE_OFFER =
  "This rate is no longer available for these dates. Please go back to the hotel page, refresh, and choose a rate again.";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { offerId, usePaymentSdk = true, hotelId, checkin, checkout, adults } = body;
    if (!offerId) {
      return NextResponse.json(
        { error: "offerId is required" },
        { status: 400 }
      );
    }

    if (hotelId && checkin && checkout && adults != null && adults !== "") {
      try {
        const fresh = await searchRates({
          hotelIds: [hotelId],
          checkin,
          checkout,
          adults: Number(adults),
          maxRatesPerHotel: 50,
        });
        const knownIds = collectOfferIdsFromRatesData(fresh.data);
        if (!knownIds.has(offerId)) {
          return NextResponse.json({ error: STALE_OFFER }, { status: 409 });
        }
      } catch {
        /* rates refresh failed — still try prebook; LiteAPI validates there */
      }
    }

    const data = await prebook(offerId, usePaymentSdk);
    return NextResponse.json(data);
  } catch (e) {
    const err = e as LiteAPIError & Error;
    const raw = (err.message ?? "").toLowerCase();
    const availabilityLike =
      /no availability|not available|availability|sold out|no longer available|invalid offer|offer expired/.test(raw);
    const message = availabilityLike ? STALE_OFFER : (err.message ?? "Prebook failed");
    const payload: { error: string; code?: number; description?: string } = { error: message };
    if (err.name === "LiteAPIError" && (err.code != null || err.description)) {
      payload.code = err.code;
      payload.description = err.description;
    }
    return NextResponse.json(payload, { status: 500 });
  }
}
