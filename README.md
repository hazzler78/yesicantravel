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

## Roadmap Notes (for collaborators)

- Expand safety data coverage beyond initial countries once the EU experience is solid.
- Iterate on the **map experience** (better clustering, safer‑route overlays).
- Add deeper safety reviews and community tips focused on women solo travellers.

If you’re working on UI, copy, or growth experiments (Facebook / Instagram), keep changes aligned with the **empowering, calm, safety‑led** brand described above.
