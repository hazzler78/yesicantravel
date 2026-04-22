# Conversion Audit — yesicantravel.com

_Prepared: 2026-04-22. Scope: 1000 paid-ad clicks → 0 bookings. Goal: identify what's actually broken and produce a prioritised fix plan._

---

## 1. Executive summary

**The single biggest reason bookings are zero: the site promises a safety-first product on the homepage, then fails to deliver it at every single step after the hero.** Ads pull in a cold, skeptical woman looking for "female-only rooms" and "verified safe stays." She lands on the hero, which looks credible. She clicks through to results and sees four generic filters — rating, budget, cancellation — and a line that literally reads "Future versions will let you filter by women-only options, neighbourhood safety and lighting." She clicks a hotel and sees a bare hotel name with a star rating and a rate button — no reviews, no safety badges, no women-traveller signals, no photos of rooms, no neighbourhood info, nothing that differentiates this from the raw LiteAPI response. She has zero reason not to open Booking.com in another tab, where she already has an account.

A secondary reason is lack of human trust signals: one recurring testimonial (same Sofia quote reused twice), no founder face, no press, no review count, no "women-only" anywhere in the product. And a tertiary reason is diagnostics: with only Meta Pixel + Vercel Analytics installed, there is no session recording (Clarity/Hotjar) to see *where* exactly visitors drop off — you're flying blind on a zero-conversion problem.

This is a **trust + message-match problem masquerading as a conversion problem**. Fixing it does not require rebuilding the site. It requires three things: (1) honour the homepage promises on the pages behind the hero, (2) add human trust signals (real faces, real reviews, real founder), and (3) install a session-recording tool so you can stop guessing.

---

## 2. Codebase map

**Stack**
- Next.js 16.1.6 (App Router), React 19, TypeScript, Tailwind v4.
- Prisma (Postgres) for lead/booking ingestion; sparsely used on the booking path.
- Hotel/booking data from LiteAPI (`src/lib/liteapi.ts`) with a payment wrapper SDK mounted on the checkout page.
- Analytics: Vercel Analytics + Speed Insights, Meta Pixel (client + CAPI), Pinterest tag. No GA4, no session recording (Clarity/Hotjar/PostHog), no A/B testing tool.
- Email capture: MailerLite via `src/components/NewsletterForm.tsx` and `LeadMagnetForm.tsx`.
- Chatbot: xAI (Grok) in `src/components/Chatbot.tsx` and `src/app/api/chat/route.ts`.

**Key pages (the funnel)**
| Step | Route | File | Type |
|---|---|---|---|
| 1. Landing | `/` | `src/app/page.tsx` (534 lines) | Client component with hero + search form + trust section + trending events + newsletter |
| 2. Search results | `/results` | `src/app/results/page.tsx` (563 lines) | Client component. Filters: rating, budget, free cancellation only. Default sort: rating desc. Map via Leaflet. |
| 3. Property detail | `/hotel/[hotelId]` | `src/app/hotel/[hotelId]/page.tsx` (331 lines) | Client component. Name + address + star rating + list of rates. **No reviews, no facilities, no safety info, no neighbourhood info, no map.** |
| 4. Checkout | `/checkout` | `src/app/checkout/page.tsx` (811 lines) | Client component. 4 required fields (first/last/email/**phone**). Card payment via LiteAPI payment wrapper (Stripe under the hood). No hotel summary/photo on this page. |
| 5. Confirmation | `/confirmation?bookingId=…` | `src/app/confirmation/page.tsx` (196 lines) | Shows booking id + hotel name + dates + total. |

**Content pages**: `/events/[slug]` (event landers generated from `src/data/events.ts`), `/destinations/[slug]` (legacy), `/popular-cities`, `/blog` and `/blog/[slug]`, `/lead-magnet`. `/hotels/[id]` is a legacy permanent redirect to `/results`.

**Styling / brand tokens** live in `src/app/globals.css` (lines 1–52). Palette variables (`--coral`, `--sand`, `--ocean-teal`, `--navy`, `--plum`) match the brand.

**Live site check**: `https://www.yesicantravel.com/api/health` returns `{"ok":true, checks:{apiKey:true, liteApiReachable:true}}` — so the booking pipeline is not technically broken. `LITEAPI_KEY` in `.env.local` is a `prod_` key, so payments will be real (not sandbox) in production. Good.

---

## 3. Gap matrix — research signals vs. site reality

| # | Research signal (weight) | Addressed on site? | Where it would live | Effort |
|---|---|---|---|---|
| Pain 1 | Safety / harassment (10) | **Partial.** Generic "safety-first" copy in hero and `TrustSection` (`page.tsx:41–95`); no harassment-specific reassurance, no incident handling promise. | `page.tsx` hero + a new "Safety promise" block; hotel detail page safety section. | M |
| Pain 2 | Loneliness / social isolation (9) | **No.** No "solo-community" signals, no "women-friendly vibe" badges, no solo-traveller content surfaced on results. | `results/page.tsx` hotel card badge; `/about`; lead-magnet. | M |
| Pain 3 | Poor hostel cleanliness (8) | **No.** No cleanliness/review score surfaced on results or hotel pages. `getHotelReviews` exists (`liteapi.ts:142`) but is only used by the chatbot (`api/chat/route.ts:124`). | `hotel/[hotelId]/page.tsx` — surface review score + cleanliness breakdown. | M |
| Pain 4 | Privacy / noise in shared spaces (8) | **No.** Not surfaced. | Results filter: "private room / private bath"; hotel detail amenities list. | S |
| Pain 5 | Unsafe neighbourhoods (7) | **Partial.** Events pages have good neighbourhood guides (`events/[slug]/page.tsx:244–271`), but the normal `/results` → `/hotel` flow does not expose neighbourhood data at all. | `hotel/[hotelId]/page.tsx` — add neighbourhood card. | L |
| Pain 6 | Cliques / exclusion (6) | **No.** | Content only — blog/about. | S |
| Pain 7 | High cost, no female-only (6) | **No.** No female-only filter, no price alerts. | Results filter + badge. | M |
| Pain 8 | Age mismatch (5) | **No.** | Content. | S |
| Want 1 | Female-only dorms / floors (10) | **No.** Literally absent from the product. Results page admits it: `results/page.tsx:400` — "Future versions will let you filter by women-only options". | Results filter + hotel badge. Data plumbing likely needed if LiteAPI doesn't expose it natively. | L |
| Want 2 | Private rooms (9) | **Partial.** LiteAPI rates may be private rooms but there's no "private room" badge or filter. | Results filter; hotel room cards. | S |
| Want 3 | Social hostels with activities (9) | **No.** | Content + hotel detail facilities. | M |
| Want 4 | Safe walkable neighbourhoods (8) | **Partial** (events only). | Hotel detail neighbourhood card. | L |
| Want 5 | Clean, comfortable, pest-free (8) | **No.** | Surface review scores / cleanliness rating on results and hotel pages. | M |
| Want 6 | Hotel with 24/7 staff (7) | **Promised, not delivered.** Claimed in hero + TrustSection, but no filter exists and no badge is shown on hotel cards or the hotel detail page. | Results filter + card badge; hotel detail header badge. | M |
| Want 7 | Age-appropriate inclusive vibes (6) | **No.** | Content + optional filter. | S |
| Want 8 | Helpful, professional staff (6) | **No.** | Surface review "staff" sub-score on hotel page. | S |
| Want 9 | Modern amenities (WiFi, lockers, keycard) (5) | **No.** Amenities not shown at all on hotel detail. | Hotel detail facilities list (LiteAPI returns this in `hotelFacilities`; confirmation page already reads it). | S |
| Want 10 | Value for money, no hidden fees (5) | **Partial.** Checkout form quoted price has a "Including all taxes, fees and cleaning fee" line (`checkout/page.tsx:621–624`). But results card price uses a "total stay" label without that guarantee (`results/page.tsx:498–501`). | Unify price-transparency copy across results / hotel / checkout. | S |

**Score: the product delivers on ~1.5 of the top 10 desired features.** That is the conversion gap.

---

## 4. Ranked findings

Ranking is by (expected conversion impact) ÷ (effort). Ship top-5 first.

### #1. The hotel detail page is a deal-breaker — no reviews, no safety signals, no trust
- **Finding:** `hotel/[hotelId]/page.tsx` shows only: one photo, hotel name, address, star rating, a "Secure booking via trusted provider" pill, and a list of rate buttons. No reviews, no review score, no facilities list, no neighbourhood info, no map, no room photos beyond a single per-room thumbnail, no women-specific badges, no cancellation details inline, no "24/7 reception" even when the data supports it.
- **Evidence:** `src/app/hotel/[hotelId]/page.tsx:225–250` (header) and `:253–318` (rooms + rates). Reviews function exists (`src/lib/liteapi.ts:142`) and is used by the chatbot (`src/app/api/chat/route.ts:124`) but **not surfaced on this page**. LiteAPI already returns `hotelFacilities` (used on `/confirmation`) and `hotelDescription` — both discarded here.
- **Why it matters:** Pain points #1 / #3 / #5 and desired features #5 / #6 / #9 all converge at this page. A woman asked to hand over a credit card and phone number to a hotel she has never heard of, with zero visible reviews and zero safety detail, has no reason to proceed. Booking.com would show 400+ reviews, photos, amenities, neighbourhood info. Competing from this page is impossible.
- **Recommended fix:** Add to the hotel detail page: (a) review score + count + top pros/cons from `getHotelReviews` with `getSentiment: true`, (b) facilities list from `hotelFacilities`, (c) short `hotelDescription` block, (d) a small Leaflet map of hotel location, (e) a safety-signal band showing which of [24/7 reception, lift, non-smoking, lockers/safe, private bathroom] the facilities include, derived from `hotelFacilities`, (f) all room photos in a gallery (currently only `photos[0]`), (g) cancellation policy expanded in plain English.
- **Impact:** High  **Effort:** M (reviews + facilities are 1 API call + rendering; ~half a day)

### #2. Homepage promises filters the results page doesn't have
- **Finding:** Hero + TrustSection tell the visitor they can "Filter for 24/7 staffed reception, women-friendly reviews, well-lit streets and safer neighbourhoods." The actual `/results` filter sidebar offers: minimum rating, max price, free cancellation. That's it. The code even admits it in user-facing copy.
- **Evidence:** Promise — `src/app/page.tsx:68–71`. Reality — `src/app/results/page.tsx:343–402`, specifically the admission at line 400: *"Future versions will let you filter by women-only options, neighbourhood safety and lighting."*
- **Why it matters:** The #1 desired feature in the research (female-only dorms, weight 10) is missing and the site is self-admitting it right where the purchase intent peaks. This is a classic message-match break — users who came in on an ad that said "safe female-only stays" get a generic filter set and a "coming soon" note. They bounce.
- **Recommended fix:** Short-term — remove the "future versions" admission and ship three filters immediately: (a) "24/7 reception" (derivable from `hotelFacilities` string match), (b) "Private bathroom", (c) "Highly rated for cleanliness" (derivable from review sentiment). Longer-term — build a proper facet layer.
- **Impact:** High  **Effort:** S (delete one sentence; ship three `hotelFacilities.includes(...)` filters)

### #3. No reviews surfaced anywhere on the booking path
- **Finding:** LiteAPI exposes reviews with AI sentiment. The app fetches them only for the chatbot. Users never see them.
- **Evidence:** `src/lib/liteapi.ts:142–157` defines `getHotelReviews`. The only call site is `src/app/api/chat/route.ts:124` (chatbot context). Neither `results/page.tsx` nor `hotel/[hotelId]/page.tsx` imports it.
- **Why it matters:** Every competitor (Booking, Expedia, Airbnb) leads with reviews. Without them, the site looks like a scammy affiliate page. Reviews also directly address research pains 3 (dirty hostels), 5 (unsafe neighbourhoods), 9 (staff issues).
- **Recommended fix:** Add a `/api/reviews?hotelId=` route that wraps `getHotelReviews({ getSentiment: true, limit: 20 })` and render on the hotel page — review score, count, AI summary pros/cons, 3–5 recent verbatim reviews.
- **Impact:** High  **Effort:** M

### #4. Checkout never shows what the user is buying
- **Finding:** On the checkout page (`/checkout?offerId=…`), the user sees "Your price" (total), a scarcity pill ("Limited rooms available at this price"), and four mandatory form fields. There is **no hotel name, no hotel photo, no address, no dates, no room name** rendered anywhere on the page. The only reference to the hotel is a "Back to hotels" link.
- **Evidence:** `src/app/checkout/page.tsx:598–748` (the form step). The hotelName is read *after* booking (`:343, :509`) for ingestion, never rendered for the user.
- **Why it matters:** A user at a payment form who can't see what they're paying for will abandon. This is Checkout UX 101 and it's completely missing. It also makes the "Limited rooms available at this price" scarcity pill feel untrustworthy, because the user has zero anchor for *what* they're supposedly locking in.
- **Recommended fix:** At the top of the checkout form, render a compact stay summary card: photo (small), hotel name, address, check-in/out dates, adults, room name, cancellation tag, total. Pass `hotelName`, `roomName`, `refundableTag`, `mainPhoto` via URL params from the hotel page's `handleBook` (or store in sessionStorage).
- **Impact:** High  **Effort:** S

### #5. No session recording / heatmap — you can't debug a 0-conversion funnel blind
- **Finding:** Analytics installed: Vercel Analytics, Vercel Speed Insights, Meta Pixel (+ CAPI), Pinterest. No GA4, no Clarity, no Hotjar, no PostHog, no session replay.
- **Evidence:** `src/app/layout.tsx:75–108, 170–171` — only Pinterest and Meta Pixel scripts. `package.json:13–26` — only `@vercel/analytics` and `@vercel/speed-insights`. Grep for `gtag|clarity|posthog|hotjar` returns nothing outside the layout's Pixel block.
- **Why it matters:** With 1000 ad clicks and 0 conversions, you have zero visibility on *where* users drop. Is it the hero? The results page? The hotel page? The first form field? You are flying blind. Install Microsoft Clarity (free) today — one script tag — and within 24h you'll have heatmaps and session recordings that will point to the real culprit better than any audit can.
- **Recommended fix:** Add Clarity to `src/app/layout.tsx` (one `<Script>` tag, free). Add GA4 at the same time for baseline conversion funnels.
- **Impact:** High (diagnostic multiplier — every future fix becomes data-driven)  **Effort:** S (<30 min)

### #6. Testimonials look manufactured; no founder face, no press, no review count
- **Finding:** The entire site's social proof is one testimonial quote — "Sofia, 29, Spain" — reused in two places on the homepage. No founder photo, no team, no press mentions, no review count on trending city cards, no Trustpilot, no verified-review badge.
- **Evidence:** `src/app/page.tsx:300–302` (hero) and `:88–91` (TrustSection). Same quote, different location.
- **Why it matters:** Research pain #10 (scams, misleading photos, unreliable bookings) is a live concern. A woman deciding between a known brand (Booking.com) and an unknown new site she just met via an ad needs human proof. One manufactured-sounding quote does the opposite of that.
- **Recommended fix:** (a) Replace the hero quote with a real quote from a real customer (or from the Reddit research, attributed as "Reddit, r/solofemaletravel" — honest and validated). (b) Add a 2-sentence founder intro with a real photo ("Hi, I'm [name]. I built this after [specific moment]. Here's our story →"). (c) Link to an `/about` page. (d) Show review counts from LiteAPI on results cards ("★ 4.5 · 284 reviews").
- **Impact:** High  **Effort:** M (the founder intro + about page is the real work)

### #7. Phone number required at checkout — silent conversion killer
- **Finding:** The guest form requires first name, last name, email, **and mobile phone** — all `required`. Phone placeholder uses a Swedish format (`+46 70 123 45 67`). For a cold ad user who has been on the site for 60 seconds, being asked for a phone is a hard ask.
- **Evidence:** `src/app/checkout/page.tsx:722–738` (phone field with `required`), validation at `:401–404`.
- **Why it matters:** Every extra required field on a first-time checkout costs conversions. LiteAPI's guest payload can accept a blank or default phone in many cases; when it's strictly required, ask with a very clear reason ("The hotel may need to reach you — e.g. for late check-in"), and fall back to a country-specific placeholder based on the user's locale.
- **Recommended fix:** Make phone optional at first, and only require it if LiteAPI returns a "phone required" error for the specific hotel. Add an inline explanation. Remove the Swedish-specific placeholder; detect locale or use `+1` / `+44` / `+49`.
- **Impact:** Medium  **Effort:** S

### #8. Default guest count is 2 on a solo-travel product
- **Finding:** The search form defaults to 2 travellers.
- **Evidence:** `src/app/page.tsx:142` — `const [guests, setGuests] = useState(2);`.
- **Why it matters:** This platform explicitly targets women travelling solo. Defaulting to 2 guests is a message-mismatch and also reduces price visibility (2× room cost shown). The results price displayed is also likely higher than Booking.com's "1 adult" default, which makes you look expensive in a side-by-side check.
- **Recommended fix:** Change default to 1. One-line change.
- **Impact:** Medium  **Effort:** S (1 minute)

### #9. Hero copy is generic; doesn't use any of the validated research language
- **Finding:** Current hero: *"Safer solo stays worldwide"* / *"Safer places to stay, picked for women travelling solo."* / *"Safety-first stays across the world—so you can feel prepared, supported, and in control on every trip."* That's competent, calm brand copy. But it doesn't carry any of the emotional hooks the research surfaced. The research has phrases that are *known to resonate* with this audience because they literally said them.
- **Evidence:** `src/app/page.tsx:276–302` (hero text block).
- **Why it matters:** This is paid traffic. The cost of a weak hero is linear in ad spend. Three variants using validated language are in §5 below.
- **Recommended fix:** See §5. Run a 2-week A/B test between current hero and one of the three proposed variants.
- **Impact:** Medium–High  **Effort:** S (copy change + A/B flag)

### #10. Result cards don't match the "safest first" brand promise
- **Finding:** Results cards display: photo, name, address, rating star, "Free cancellation" pill, price. No safety badges (24/7, lift, neighbourhood rating), no review count, no "women traveller rated" marker. The default sort is rating desc, which the UI labels "By rating" — not "Safest first" as the README and `.cursorrules` specify.
- **Evidence:** `src/app/results/page.tsx:455–541` (cards). Sort label at `:318`.
- **Why it matters:** Every hotel card looks like every other booking site's. There's no visual signal that this is a safety-first product. The filter sidebar promises it; the cards don't deliver.
- **Recommended fix:** (a) Rename sort label from "By rating" to "Safest first" to match the brand. (b) Add a compact safety chip row under the name: derive 2–3 badges from `hotelFacilities` (e.g. "24/7 reception", "Lift", "Non-smoking", "In-room safe"). (c) Add review count next to the star.
- **Impact:** Medium  **Effort:** S

### #11. Vibe-search results can be map-less and rating-less
- **Finding:** For `aiSearch` queries, only the first 20 hotels are enriched with details, and many may lack lat/lng or rating — producing a broken-feeling page. Map falls back to a hand-drawn bounding box from hotel coords if `placeDetails` is missing.
- **Evidence:** `src/app/results/page.tsx:102–149` (vibe branch), `:258–277` (map fallback), `:412–421` (map empty states). Empty-state copy leaks implementation: "Map will appear when stays include location data or when you search by destination."
- **Why it matters:** Vibe search is the mode more likely to be used by people who don't know a specific city — exactly the ad-traffic persona. Showing them a broken map with an implementation-leak message is a trust hit.
- **Recommended fix:** Always resolve at least a city-level placeId for aiSearch queries (use a cheap `searchPlaces` call on the extracted city name server-side) so the map always loads. Rewrite the empty-state copy in user language.
- **Impact:** Medium  **Effort:** M

### #12. Placeholder-looking "Safe stays from €89/night" price on trending cities
- **Finding:** Trending city mini-cards fall back to the hard-coded string `"Safe stays from €89/night"` when live price data is missing.
- **Evidence:** `src/app/page.tsx:483` — `const priceLabel = priceStr ? ... : "Safe stays from €89/night";`.
- **Why it matters:** Many users will see the same €89 across all cities and correctly intuit it's a placeholder. That breaks trust. Better to hide the price than to fake it.
- **Recommended fix:** If `priceInfo?.minPrice` is null, show nothing (or "See safe stays →") rather than a fake anchor.
- **Impact:** Low–Medium  **Effort:** S

### #13. `guestNationality` hardcoded to "US"; `currency` fixed to EUR
- **Finding:** LiteAPI rate searches always send `guestNationality: "US"` and `currency: "EUR"` unless a client overrides. Neither does. Displayed prices then sometimes fall back to USD on the hotel detail page when LiteAPI returns a different currency per-rate.
- **Evidence:** `src/lib/liteapi.ts:67–68`. Display fallback: `src/app/hotel/[hotelId]/page.tsx:273, 295–296` (`currency: "USD"` default, then `{currency} {amount.toFixed(2)}` with no locale formatting).
- **Why it matters:** (a) Some hotels apply different taxes depending on guest nationality, meaning a UK/DE user sees a slightly wrong price they'll fail to reconcile. (b) Currency fallback flips €/$ mid-funnel — enormous trust hit.
- **Recommended fix:** Detect user country from `Accept-Language` or a lightweight IP lookup; set `guestNationality` accordingly. Pick a single display currency per session and lock it through the funnel. Format with `Intl.NumberFormat`.
- **Impact:** Medium (for non-US users; likely most of your EU traffic)  **Effort:** M

### #14. Sticky mobile CTA competes with the primary CTA
- **Finding:** On mobile a sticky "See Safe Cities" pill hovers bottom-right, linking to `/popular-cities`. It competes with the primary "Find Your Safe Solo Stay Now" search CTA and with the chatbot's "Ask about your stay" button, which also floats bottom-right.
- **Evidence:** `src/app/page.tsx:523–530` (sticky CTA). Chatbot: `src/components/Chatbot.tsx:202–212` (also fixed bottom-right).
- **Why it matters:** Two overlapping bottom-right floating elements on mobile is a usability smell. Tap-targets collide. The user is being pulled in three directions at once (search form, popular cities, chatbot).
- **Recommended fix:** Keep only one floating element on mobile. Either drop the "See Safe Cities" sticky or move it to bottom-left — and coordinate spacing with the chatbot.
- **Impact:** Medium  **Effort:** S

### #15. Hero image is generic / not "women-first"
- **Finding:** Hero background is a stock-feeling empty balcony at golden hour. No woman, no face, no obvious safety cue.
- **Evidence:** `src/app/page.tsx:244–251`, image at `/public/Beautiful_empty_cozy_hotel_balcony_at_soft_golden.png`.
- **Why it matters:** Ad visitors decide in 2–3 seconds. An empty balcony says "travel blog." A woman standing confidently with her roller bag in a well-lit hotel lobby (or a well-lit city street) says "this is for me."
- **Recommended fix:** Replace with an image featuring a real solo female traveller in a clearly safe context (well-lit entrance, hotel lobby with staff, daylight walkable street). Do not use a staged-stock image.
- **Impact:** Medium  **Effort:** S (asset swap — but hire a photographer if budget allows; stock is the issue)

### #16. The "Women-only / female-only" feature is not anywhere in the product
- **Finding:** The #1 desired feature in the research (weight 10) does not exist as a filter, badge, page, or ad-lander anywhere.
- **Evidence:** Grep across the repo for `women.?only|female.?only` yields one match — the "future versions" admission in `results/page.tsx:400`.
- **Why it matters:** This is the single strongest differentiator vs. Booking.com. Without it, the wedge argument for this brand collapses.
- **Recommended fix:** Confirm whether LiteAPI exposes any female-dorm / female-floor metadata. If not, start with a curated list: hand-pick 50 hotels known to offer female floors (e.g. Premier Inn "Hub by Premier Inn", Generator Hostels' female dorms, specific boutique hotels), tag them in a local JSON, and build a landing page at `/women-only` that filters results to just these hotels. Not perfect, but honest and deliverable in a week.
- **Impact:** High (long-term wedge)  **Effort:** L

### #17. Trust chips on hotel page are weak and mixed
- **Finding:** Hotel detail header shows three chips: `★ {star} overall rating`, `Free cancellation options available`, and `Secure booking via trusted provider`. The third is vague and reads like a disclaimer.
- **Evidence:** `src/app/hotel/[hotelId]/page.tsx:234–249`.
- **Why it matters:** "Secure booking via trusted provider" is not a trust signal — it's a hedge. Replace with concrete, verifiable statements.
- **Recommended fix:** Replace with: "Free cancellation up to 48h", "24/7 staffed reception" (if in facilities), "Verified by [n] guests", "Stripe-secured payment".
- **Impact:** Medium  **Effort:** S

### #18. `CheckoutTrustBar` badges look homemade
- **Finding:** The checkout trust bar has inline-styled "VISA", "Mastercard", and "SSL secure" badges rendered as colored spans — not the official logos.
- **Evidence:** `src/components/checkout/CheckoutTrustBar.tsx:11–22`.
- **Why it matters:** On a payment screen, imitation logos look *less* trustworthy than no logos at all. Users notice.
- **Recommended fix:** Use official SVG logos (Visa, Mastercard, Amex, Apple Pay, Google Pay, Stripe) from each brand's brand-assets page.
- **Impact:** Low–Medium  **Effort:** S

### #19. Scarcity pill at checkout is generic and always on
- **Finding:** "Limited rooms available at this price — book now to lock this rate." is hard-coded and always shown.
- **Evidence:** `src/app/checkout/page.tsx:627–629`.
- **Why it matters:** Fake urgency is a known conversion anti-pattern among sophisticated users (which your audience is — they're comparing with Booking). If it's not based on real inventory, remove it.
- **Recommended fix:** Either drive it from LiteAPI availability data (if the rate is last few rooms) or remove it. Trust > fake urgency.
- **Impact:** Low–Medium  **Effort:** S

### #20. Footer icons are letters, not logos
- **Finding:** Social icons are styled letter glyphs ("IG", "P", "f", "X", "Tt") not real platform icons.
- **Evidence:** `src/app/layout.tsx:117–163`.
- **Why it matters:** Small but cumulative polish — everything a skeptical first-time visitor sees signals "this is a real brand" or "this is a side project." Install `lucide-react` properly (already in brand rules) and use the real icons.
- **Impact:** Low  **Effort:** S

### What's good — don't break these
- The hero structure itself (trust badges + form + scannable trending) is sound. The problem is the language and the downstream delivery, not the layout.
- The events pages (`/events/[slug]`) are genuinely strong — neighbourhood guides, FAQs, JSON-LD schema, dated-event framing. This is the blueprint for what the rest of the site should look like.
- Meta CAPI is wired with event dedup ids (`src/app/page.tsx:198–210`, `checkout/page.tsx:195–216`) — good, keep it.
- The design system variables and accessibility basics (focus rings, 18px base font) are solid.
- `/api/health` returning 200 `ok: true` — the booking pipeline itself works technically.

---

## 5. Hero rewrite proposals

Each variant swaps the headline + subhead + primary CTA + the trust line directly under the badges. Keep the two existing trust badges (✓ reviewed & rated by women, ⏱ 24/7 staffed reception) — they're fine.

### Variant A — Lead with the feeling the research validated most
> **Headline:** The first place you can stay where you don't have to be on alert.
>
> **Subheadline:** Safer hotels picked for women travelling solo — 24/7 reception, well-lit streets, real reviews by women who've stayed there.
>
> **Primary CTA:** Find a safer stay
>
> **Trust line:** *"Felt really safe, didn't have any problem nor felt like I would."* — from our community

**Why:** The research's strongest validated feeling is "constantly on alert" (appears in 3+ verbatim quotes). Naming the exact pain state and flipping it is a known-to-work framework ("From/To"). The trust line uses a genuine Reddit quote (from the attached `report.md`, line 141) — honest, specific, and emotionally credible.

### Variant B — Specific, concrete, less emotional
> **Headline:** Safer hotels. Women-reviewed. 24/7 staffed.
>
> **Subheadline:** Stop refreshing Booking hoping a listing is safe. Search hotels pre-filtered for 24/7 reception, well-lit areas, and women-traveller reviews.
>
> **Primary CTA:** See safer stays
>
> **Trust line:** Reviewed by women travellers · 24/7 reception required · Free cancellation

**Why:** A harder, more utilitarian variant. Directly names the competitor and the user's current behaviour ("refreshing Booking hoping"). Leans on specificity over emotion. Good for older / more pragmatic segments.

### Variant C — Community + empowerment
> **Headline:** You're not the only woman travelling solo.
>
> **Subheadline:** Join women using Yes I Can Travel to find hotels with 24/7 reception, safer neighbourhoods, and reviews from women who've been there.
>
> **Primary CTA:** Find my next stay
>
> **Trust line:** Reviewed, rated, and tested by women travellers — because you deserve to stop second-guessing your hotel.

**Why:** Research pain #2 (loneliness, weight 9) is nearly as strong as safety. A "you're not alone" angle addresses both the functional (safety) and the emotional (community) need in one move. This is the variant most likely to pull in the 30+ demographic that the research identifies as underserved (pain #8).

**Recommendation:** Ship Variant A first. It most directly pattern-matches the validated language. Hold B and C as test arms once you can measure (post §4-#5 Clarity install).

---

## 6. Quick-win checklist — 7-day plan

If you can only ship 5–10 things this week, do these. They are in order.

1. **Day 1 — Install Microsoft Clarity.** One `<Script>` in `src/app/layout.tsx`. Free. Enables session recording and heatmaps. Everything else is easier once this exists. *(Finding #5)*
2. **Day 1 — Change default guest count from 2 to 1.** One-line change at `src/app/page.tsx:142`. *(Finding #8)*
3. **Day 1 — Delete the "Future versions will let you filter…" sentence.** `src/app/results/page.tsx:399–401`. Reads as an apology. *(Finding #2)*
4. **Day 2 — Render a stay-summary card at the top of `/checkout`.** Hotel name + photo + address + dates + room name + total. Pass via URL or sessionStorage from `hotel/[hotelId]/handleBook`. *(Finding #4)*
5. **Day 2 — Make the phone field optional** on the checkout form (or add a clear "why we ask" microcopy). *(Finding #7)*
6. **Day 3 — Add reviews to the hotel detail page.** `/api/reviews?hotelId=…` wrapping `getHotelReviews({ getSentiment: true, limit: 20 })`. Render review score + count + AI pros/cons + 3 verbatim reviews. *(Finding #1, #3)*
7. **Day 3 — Add facilities list + 24/7 badge to the hotel detail page.** LiteAPI already returns `hotelFacilities`; the confirmation page uses it. *(Finding #1, #17)*
8. **Day 4 — Ship the three "fake" filters using `hotelFacilities.includes(...)` matching:** 24/7 reception, Private bathroom, Lift/elevator. *(Finding #2, #10)*
9. **Day 5 — Ship Hero Variant A** (from §5) behind a simple random flag. Also replace "Sofia, 29" testimonial with a real Reddit quote attributed to the research. *(Findings #6, #9)*
10. **Day 6–7 — Build a minimal `/about` page** with a real founder photo and a 3-paragraph story ("why this exists, who it's for, what makes it different"). Link from the footer and from the hero's trust line. *(Finding #6)*

After this week, you'll know from Clarity exactly where people are dropping off, and at that point you can prioritise the larger-effort items (female-only curated list, neighbourhood-aware map, full reviews-driven sort) with real data.

---

## 7. Open questions

1. **Ad targeting & landing pages.** Are the 1000 paid-ad visitors landing on `/` or on a specific page like `/events/milan-paralympics-2026`? Message-match is different for each. (If ads promise "safe stays in Paris" and they land on `/`, that's its own problem.)
2. **Meta Pixel data.** Do you see `Search`, `InitiateCheckout`, or `AddPaymentInfo` events firing at all, or is the drop-off at `PageView → Search`? That would localise the problem to the hero.
3. **LiteAPI payment-wrapper domain verification.** `checkout/page.tsx:766–772` shows an error path specifically mentioning that "LiteAPI may need to verify your domain (yesicantravel.com)" for Stripe. Has that been confirmed completed for production? If Stripe is rejecting the payment form silently on some sessions, that would directly explain zero bookings.
4. **Does LiteAPI expose female-only / women-only metadata** in `hotelFacilities` or elsewhere? If yes, the biggest product-differentiator becomes a weekend of work. If no, the curated-list approach (Finding #16) is the right stopgap.
5. **Real customer testimonials.** Do you have any real bookings / users from before this data point, even from manual booking outside the site? Real quotes are massively more valuable than manufactured ones.
6. **Ad copy and creative.** What are the current ads *saying* and *showing*? If ads say "female-only rooms" and the landing page doesn't offer female-only anywhere, that's a policy-level message-match break, not a site bug.
7. **Geo / currency of the 1000 visitors.** If most are EU/UK, the hardcoded `guestNationality: "US"` and mixed EUR/USD behaviour (Finding #13) may be producing wrong prices and silent user confusion.
8. **Mobile vs desktop split.** Paid traffic tends mobile-first. Some issues (Finding #14, sticky CTA collision) only bite on mobile.
9. **"Searched but didn't book" lead capture.** Is there any email capture on the search or results path for users who aren't ready? Right now the newsletter only shows after a full homepage scroll.
10. **Budget for a real photoshoot.** Finding #15 is easy to swap but the new image matters; a real shoot of a real solo female traveller would carry the hero.

---

_End of audit. Do not ship fixes yet — pick which of the ranked findings you want to do and I'll scope each._
