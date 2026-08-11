# AGENTS.md

## Cursor Cloud specific instructions

This repo is a **single Next.js 16 app** (App Router + Turbopack, React 19, TypeScript, Tailwind v4) with **Prisma (PostgreSQL)**. It is the "Yes I Can Travel" safety-first hotel search/booking site (hotel data via LiteAPI, AI chat via xAI).

### Running / commands
- Dev server: `npm run dev` (serves on `http://localhost:3000`). This is what to run for development.
- Lint: `npm run lint`.
- Build (prod): `npm run build` (runs `prisma generate && next build`). Start built app with `npm start`.
- The update script already runs `npm install` and `npx prisma generate` on VM startup, so the Prisma client is generated before you start. If you change `prisma/schema.prisma`, re-run `npx prisma generate` (the running `next dev` process does not regenerate the client on its own).

### Secrets / environment variables (set via the Secrets panel)
These are NOT set by default; the app boots and builds without them, but the external-API features degrade until they are provided:
- `LITEAPI_KEY` — required for the core booking pipeline. Without it: `/api/rates` returns **401** (no hotel results on `/results`), `/api/places` autocomplete **500s** on partial/short queries, the homepage "trending" min-price calls **500**, and `/api/health` reports `apiKey:false`. Use a **sandbox** key (starts with `sand`) for safe test bookings; the app treats the env as sandbox based on the key prefix / API responses.
- `DATABASE_URL` — Postgres URL for Prisma-backed features (blog/content, leads, automation, revenue/attribution analytics). The app and `next build` still succeed without it (Prisma errors during static generation are caught), but those routes error at request time.
- `XAI_API_KEY` (optional `XAI_MODEL`) — the "Atlas" chat assistant (`/api/chat`).
- `MAILERLITE_API_KEY` (+ related `MAILERLITE_*`) — newsletter/lead capture.
- `REVENUE_AGENT_ADMIN_TOKEN` / `REVENUE_AGENT_CRON_SECRET` — auth for `/api/automation/*` routes and cron jobs.
- Meta/analytics vars (`NEXT_PUBLIC_META_PIXEL_ID`, `META_ACCESS_TOKEN`, `NEXT_PUBLIC_CLARITY_PROJECT_ID`, etc.) are optional and have safe defaults / no-op when unset.

### Non-obvious gotchas
- `npm run lint` currently reports **pre-existing** errors/warnings (e.g. `react-hooks/set-state-in-effect`, `@next/next/no-img-element`) that live in the repo source, not caused by the environment. Don't treat them as setup failures.
- Card payment (Stripe via LiteAPI) requires **HTTPS** and will not load over `http://localhost` — see the "Before you drive traffic – booking readiness" section in `README.md` for the full sandbox test-booking checklist.
- Standard content workflows (adding events/destinations) are documented in `README.md`; prefer that over duplicating here.
