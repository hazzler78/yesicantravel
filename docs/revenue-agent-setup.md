# Revenue Growth Agent Setup

## Environment variables
- `DATABASE_URL`: Postgres connection string for Prisma.
- `REVENUE_AGENT_CRON_SECRET`: shared secret for scheduler endpoints (`x-cron-secret` header).
- `REVENUE_AGENT_ADMIN_TOKEN`: required token for admin automation APIs (`x-admin-token` header).
- `MAILERLITE_API_KEY`: existing MailerLite API token.
- `MAILERLITE_GROUP_ID`: optional subscriber group.
- `MAILERLITE_SAVE_INTERESTS=1`: optional enrichment from checkout context.

## Vercel env setup
Add the variables from `.env.example` to Vercel Project Settings -> Environment Variables.

Recommended scope:
- **Production + Preview + Development**:
  - `DATABASE_URL`
  - `REVENUE_AGENT_CRON_SECRET`
  - `REVENUE_AGENT_ADMIN_TOKEN`
  - `LITEAPI_KEY`
  - `LITEAPI_KEY_SANDBOX`
  - `MAILERLITE_API_KEY`
  - `MAILERLITE_GROUP_ID`
  - `MAILERLITE_SAVE_INTERESTS`
  - `XAI_API_KEY`
  - `XAI_MODEL`
  - `META_PIXEL_ID`
  - `META_ACCESS_TOKEN`
  - `META_TEST_EVENT_CODE` (optional)
- **Public (`NEXT_PUBLIC_`) vars**:
  - `NEXT_PUBLIC_META_PIXEL_ID`
  - `NEXT_PUBLIC_LITEAPI_WHITELABEL_DOMAIN`

After adding in Vercel, redeploy once so all serverless functions pick up the new values.

## Initialize schema
```bash
npm run prisma:generate
npm run prisma:push
```

## Monthly cycle endpoints
- Generate report + ad proposal: `POST /api/automation/jobs/run` with `{ "mode": "monthly" }`
- Attempt ad execution (guarded): `POST /api/automation/ads/execute`
- Update approval: `POST /api/automation/approval` with `decision=approve` and `approvalText=YES`

## Dashboard
- Open `/admin/revenue-agent` to review report, approvals, and recent job runs.

## Guardrail
- Ads are blocked unless the latest ad approval request is `approved` and `approvalText` equals `YES` exactly.
