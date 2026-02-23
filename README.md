## Lite API – Safer Stays for Women Travellers

A safety‑first booking experience designed for women travelling solo in Western & Central Europe.  
The product prioritises **reassurance, clarity, and control** so women feel that:
- **Someone capable has their back**, and
- **They themselves are capable and in control** of every decision.

Brand vibe: **empowering with a calming undertone** – soft, warm colours (coral, sand, ocean teal) with a confident accent (deep navy / plum).

---

## Product Focus

- **Regions (launch)**: Germany, France, Spain, Portugal, Netherlands, Italy, Austria, Sweden.  
- **Audience**: Women planning their first or early solo trips, mainly within Europe.
- **Default sort**: **Safest first** (safety & comfort > price by default).
- **Map experience**:
  - Clustered pins in dense city areas
  - Distance rings to key POIs (train stations, city centre)
  - Optional overlay for safer routes / well‑lit streets (where data available)

---

## Safety Model

**Non‑negotiable safety signals:**
- **24/7 staffed reception / support presence**
- **Well‑lit entrances and surrounding streets**
- **Neighbourhood safety information & tips** (beyond the hotel walls)

**Key filters (always visible in the main bar):**
- Budget / price range
- Star rating / quality
- Safety features (24/7 desk, lighting, women‑only areas, CCTV, etc.)
- Neighbourhood / location safety
- Free cancellation policy

Women‑only dorms / floors are available as a filter, but the core UX focuses on holistic safety, not just segregation.

---

## Trust, Payments & Accessibility

- **Currencies (v1)**: EUR, USD, GBP (later: SEK, CHF, AUD).  
- **Payments**: Stripe (cards, Apple Pay, Google Pay), PayPal.  
- **Refunds & cancellations**: rules are visible on **search → listing → checkout**.

Accessibility is built in from day one:
- Larger, adjustable text size
- High‑contrast mode
- Full keyboard navigation and screen‑reader‑friendly UI

---

## UX Principles

- **Safety and support first** on every screen.
- **Reduce unknowns**: clear safety data, neighbourhood context, and backup options.
- **Empowering tone**: women are not just protected, they are **prepared and capable**.

These principles should guide design, copy, and feature decisions.

---

## Tech & Development

This is a [Next.js](https://nextjs.org) app (App Router) bootstrapped with `create-next-app`.

### Local development

```bash
npm install
npm run dev
```

Then open `http://localhost:3000` in your browser.

Main entry for the marketing / booking experience is `app/page.tsx` (and related routes under `app/`).

---

## Before you drive traffic – booking readiness

To avoid sending visitors to a broken booking flow, run these checks first.

1. **Health endpoint**  
   Open or request:  
   `https://www.yesicantravel.com/api/health`  
   You should get **200** and `"ok": true` with `checks.apiKey` and `checks.liteApiReachable` true.  
   If you get 503 or `ok: false`, fix the reported checks (e.g. set `LITEAPI_KEY` in your deployment env) before promoting the site.

2. **One full test booking (sandbox)**  
   - Use **sandbox** (`LITEAPI_KEY` starting with `sand`) so no real charge is made.  
   - Do a full path: **Search** → pick a **hotel** → **Select & book** → fill guest details → pay (sandbox test card `4242 4242 4242 4242` if paying by card, or “Charge to account” if available).  
   - Confirm you reach the **“You’re all set!”** screen with a booking ID and that **View booking details** (confirmation page) works.

3. **HTTPS for payment**  
   Card payment (Stripe via LiteAPI) requires **HTTPS**. It will not load on `http://localhost`. For real traffic, the site must be served over HTTPS (e.g. Vercel/production).

4. **Optional**  
   - If you use both “Pay with card” and “Charge to account”, test both paths once.  
   - After deploy, hit `/api/health` from a simple uptime/monitoring check so you get alerted if the API key or LiteAPI becomes invalid.

**Map on results page**  
The results page map uses LiteAPI’s map widget and only runs when you search **by destination** (not by vibe). If the map stays blank, set `NEXT_PUBLIC_LITEAPI_WHITELABEL_DOMAIN` in Vercel to your LiteAPI whitelabel domain (e.g. from your LiteAPI dashboard; default is `whitelabel.nuitee.link`).

---

## Roadmap Notes (for collaborators)

- Expand safety data coverage beyond initial countries once the EU experience is solid.
- Iterate on the **map experience** (better clustering, safer‑route overlays).
- Add deeper safety reviews and community tips focused on women solo travellers.

If you’re working on UI, copy, or growth experiments (Facebook / Instagram), keep changes aligned with the **empowering, calm, safety‑led** brand described above.
