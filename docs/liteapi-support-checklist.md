# LiteAPI support – checklist for confirmation

Use this when emailing or chatting with LiteAPI support to confirm configuration and behaviour.

---

## 1. API key and environment

- We use **one API key** in the `X-API-Key` header for both:
  - Search: `https://api.liteapi.travel/v3.0`
  - Booking: `https://book.liteapi.travel/v3.0`
- Confirm: one key for both is correct (no separate “book” key).

---

## 2. Sandbox vs production

- We treat the environment as **sandbox** when the API response includes `sandbox: true` (e.g. prebook, rates). We use key prefix `sand...` only as a fallback before we have a response.
- Confirm: is our **production** key enabled for live payments, and is `sandbox: true` in responses the right way to detect sandbox?

---

## 3. Payment SDK and domain whitelisting

- We call prebook with `usePaymentSdk: true`, then load `payment-wrapper.liteapi.travel/dist/liteAPIPayment.js` and pass the `secretKey` from the prebook response.
- Confirm: do we need to **whitelist our production domain** (e.g. `yesicantravel.com`) for Stripe/card payments? If yes, is it already whitelisted?

---

## 4. Prebook → Book flow

- **Prebook:** we send `offerId` and `usePaymentSdk`.
- **Book:** we send `prebookId`, `holder` (firstName, lastName, email, phone), `guests` (occupancyNumber, firstName, lastName, email), and `payment` either as `TRANSACTION_ID` + `transactionId` (from Payment SDK) or `ACC_CREDIT_CARD`. We also send **`clientReference`** as a client-defined idempotency key to prevent duplicate bookings.
- Confirm: any other required fields or validations we might be missing?

---

## 5. Rates request

- We send to `POST /hotels/rates`: one of `placeId` / `hotelIds` / `aiSearch`, plus `occupancies`, `checkin`, `checkout`, `currency`, `guestNationality`, `roomMapping`, `maxRatesPerHotel`, `includeHotelData`.
- Confirm: this request shape is correct and complete for our use case.

---

## 6. Map / whitelabel (if we use LiteAPI’s map widget)

- We use place details from `/data/places/:placeId` for our map. If we switch to LiteAPI’s map widget: do we need `NEXT_PUBLIC_LITEAPI_WHITELABEL_DOMAIN` set to a value from the LiteAPI dashboard? Is the default `whitelabel.nuitee.link` correct for our account?

---

## 7. Health / monitoring

- We use `GET /data/places?textQuery=Paris` as a liveness check. We are aware this endpoint is billed (e.g. ~$0.01/request) and we do not poll at high frequency.
- Confirm: is there a **dedicated health endpoint** we should use instead, or is our usage acceptable for low-frequency checks?

---

## 8. Errors

- We log and surface `error.code`, `error.description`, and `error.message` from LiteAPI error responses. For support tickets, should we also capture and send a request ID header (e.g. `x-amzn-RequestId`) when present?
