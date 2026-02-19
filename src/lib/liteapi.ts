const LITEAPI_KEY = process.env.LITEAPI_KEY!;
const API_BASE = "https://api.liteapi.travel/v3.0";
const BOOK_BASE = "https://book.liteapi.travel/v3.0";

const defaultHeaders = {
  "X-API-Key": LITEAPI_KEY,
  accept: "application/json",
  "content-type": "application/json",
};

export async function searchPlaces(query: string) {
  const res = await fetch(
    `${API_BASE}/data/places?textQuery=${encodeURIComponent(query)}`,
    { headers: { "X-API-Key": LITEAPI_KEY, accept: "application/json" } }
  );
  if (!res.ok) throw new Error(`Places search failed: ${res.status}`);
  return res.json();
}

export async function searchRates(params: {
  placeId?: string;
  hotelIds?: string[];
  aiSearch?: string;
  checkin: string;
  checkout: string;
  adults: number;
  currency?: string;
  guestNationality?: string;
  maxRatesPerHotel?: number;
}) {
  const body: Record<string, unknown> = {
    occupancies: [{ adults: params.adults }],
    currency: params.currency ?? "EUR",
    guestNationality: params.guestNationality ?? "US",
    checkin: params.checkin,
    checkout: params.checkout,
    roomMapping: true,
    maxRatesPerHotel: params.maxRatesPerHotel ?? 1,
    includeHotelData: true,
  };
  if (params.placeId) body.placeId = params.placeId;
  if (params.hotelIds && params.hotelIds.length) body.hotelIds = params.hotelIds;
  if (params.aiSearch) body.aiSearch = params.aiSearch;

  const res = await fetch(`${API_BASE}/hotels/rates`, {
    method: "POST",
    headers: defaultHeaders,
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Rates search failed: ${res.status}`);
  return res.json();
}

export async function prebook(offerId: string, usePaymentSdk = true) {
  const res = await fetch(`${BOOK_BASE}/rates/prebook`, {
    method: "POST",
    headers: defaultHeaders,
    body: JSON.stringify({ usePaymentSdk, offerId }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message ?? `Prebook failed: ${res.status}`);
  return data;
}

export type BookPayment =
  | { method: "TRANSACTION_ID"; transactionId: string }
  | { method: "ACC_CREDIT_CARD" };

export async function book(params: {
  prebookId: string;
  payment: BookPayment;
  holder: { firstName: string; lastName: string; email: string; phone?: string };
  guests: Array<{ occupancyNumber: number; firstName: string; lastName: string; email: string }>;
}) {
  const res = await fetch(`${BOOK_BASE}/rates/book`, {
    method: "POST",
    headers: defaultHeaders,
    body: JSON.stringify({
      prebookId: params.prebookId,
      holder: params.holder,
      payment:
        params.payment.method === "TRANSACTION_ID"
          ? { method: "TRANSACTION_ID", transactionId: params.payment.transactionId }
          : { method: "ACC_CREDIT_CARD" },
      guests: params.guests,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error?.message ?? `Book failed: ${res.status}`);
  return data;
}

export async function getHotel(hotelId: string) {
  const res = await fetch(
    `${API_BASE}/data/hotel?hotelId=${encodeURIComponent(hotelId)}&timeout=4`,
    { headers: { "X-API-Key": LITEAPI_KEY, accept: "application/json" } }
  );
  if (!res.ok) throw new Error(`Hotel fetch failed: ${res.status}`);
  return res.json();
}
