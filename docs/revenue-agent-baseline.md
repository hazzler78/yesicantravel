# Revenue Agent Baseline KPI Audit

## Existing Integration Baseline
- App stack: Next.js App Router + React + TypeScript + Tailwind.
- Booking provider: LiteAPI via `/api/rates`, `/api/prebook`, `/api/book`.
- Email capture: MailerLite through `/api/customer`.
- Tracking channels: Vercel Analytics, Meta Pixel + CAPI, Pinterest.

## Existing Measurable Events
- Site and funnel events: `search_submit`, `Viewed Checkout`, `Entered Guest Details`, `Payment Attempt`, `booking_complete`, `booking_confirmation_view`.
- Paid-signal events: Meta (`Search`, `InitiateCheckout`, `AddPaymentInfo`, `Purchase`) and Pinterest (`lead`, `checkout`).

## Current Gaps Before This Work
- No first-party attribution ledger joining touchpoints to revenue.
- No persistent commission/revenue reporting tables.
- No monthly ad reinvestment workflow with explicit YES approval gate.
- No scheduler for recurring growth operations.

## Baseline KPI Definitions
- Leads captured: distinct emails captured by newsletter or checkout.
- Influenced bookings: bookings linked to at least one attribution touch.
- Commission revenue: sum of estimated or actual commission from bookings.
- Paid ROI: `(commission_revenue - ad_spend) / ad_spend` for approved ad cycles.
