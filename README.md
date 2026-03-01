## Yes I Can Travel – Safer Stays for Women Travellers

A safety‑first booking experience designed for women travelling solo—worldwide.  
The product prioritises **reassurance, clarity, and control** so women feel that:
- **Someone capable has their back**, and
- **They themselves are capable and in control** of every decision.

Brand vibe: **empowering with a calming undertone** – soft, warm colours (coral, sand, ocean teal) with a confident accent (deep navy / plum).

---

## Product Focus

- **Coverage**: Worldwide (strong presence in Europe, e.g. Germany, France, Spain, Portugal, Netherlands, Italy, Austria, Sweden—and beyond).  
- **Audience**: Women planning their first or early solo trips, anywhere in the world.
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

### Event destination pages (add more anytime)

Event-driven landing pages live at **`/destinations/[slug]`** (e.g. `/destinations/milan`). Data is in **`src/data/destinations.ts`**.

**To add a new destination:** add one object to the `destinations` array with these fields:

| Field | Purpose |
|-------|--------|
| `slug` | URL segment, lowercase, hyphenated (e.g. `milan`, `key-west`) |
| `city` | Display name (e.g. `Milan`, `Key West`) |
| `country` | Display name (e.g. `Italy`, `Florida`) |
| `headline` | Main H1 text before the date (e.g. `Witness Paralympic History`) |
| `subheadline` | Short paragraph under the hero; mention event and pre-filled dates |
| `eventDateRange` | Bold date range (e.g. `March 6–15, 2026`) – shown in H1, “Why now?” and CTA |
| `eventShortName` | Short event label for badge/CTA (e.g. `Paralympic Winter Games`, `Spring Break`) |
| `whyDemand` | “Why now?” body copy |
| `events` | One-line event summary (e.g. `Paralympic Winter Games, 6–15 March 2026`) |
| `metaTitle` | SEO title (include city, event and year) |
| `metaDescription` | SEO description (~150 chars, safety + event) |
| `aiSearch` | Vibe query for results (e.g. `central safe hotel Milan near venues well-lit`) |
| `checkin` | ISO date for pre-filled search (e.g. `2026-03-06`) |
| `checkout` | ISO date for pre-filled search (e.g. `2026-03-16`) |

The sitemap includes all destinations automatically. Keep the **empowering, safety-first** tone; no fear-based copy.

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

## Brand & Social (Yes I Can Travel)

- **Brand promise**: “Travel can be safe, empowering, and realistic for women travelling solo—worldwide.”
- **Tone**: Empowering, calm, practical; avoid fear‑based or sensational messaging about safety.
- **Visuals**: Soft, warm colours (coral, sand, ocean teal) with a confident accent (deep navy / plum); real‑feeling travel imagery over stocky “perfect” shots.
- **Primary audience**: Women planning their first or early solo trips, globally.

When creating or updating **Facebook / Instagram**:
- Use the name `Yes I Can Travel` and keep the profile photo, colours, and messaging aligned with this README.
- Prioritise content that helps women **feel prepared and in control** (checklists, local tips, itineraries) over generic inspirational quotes.
- Avoid over‑promising on safety; be clear about what the product can and cannot guarantee.

Coordinate any big marketing pushes (ads, influencers, campaigns) with the **“Before you drive traffic – booking readiness”** checklist above so visitors land on a working, trustworthy booking flow.

---

## Roadmap Notes (for collaborators)

- Expand safety data coverage beyond initial countries once the EU experience is solid.
- Iterate on the **map experience** (better clustering, safer‑route overlays).
- Add deeper safety reviews and community tips focused on women solo travellers.

If you’re working on UI, copy, or growth experiments (Facebook / Instagram), keep changes aligned with the **empowering, calm, safety‑led** brand described above.

---

## Atlas – AI-assistent för hemsidan

**Atlas** är den AI som hjälper till med Yes I Can Travel-hemsidan. Ställ frågor tydligt och specifikt, t.ex. *"Atlas, hur fungerar chatbotens API?"* eller *"Atlas, uppdatera copy på landningssidan."*

**Du kan fråga Atlas om:**
- **Tekniska detaljer** – kod, Next.js, API:er (LiteAPI, chat/xAI), deployment, miljövariabler.
- **Innehåll och copy** – texter, formuleringar, README, beskrivningar.
- **Design och UX** – layout, färger, tillgänglighet, flöden.
- **Ändringar på hemsidan** – nya funktioner, buggfixar, refaktorering.

**Statistik (trafik, konvertering):** Atlas har inte direkt åtkomst till live-analys (t.ex. Vercel Analytics eller Google Analytics). För siffror som konverteringsgrad eller besökare – kolla i er analytics-panel eller klistra in siffrorna i chatten; då kan Atlas hjälpa till att tolka eller planera utifrån dem.
