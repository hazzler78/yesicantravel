import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const maxDuration = 10;

/**
 * GET /api/health
 *
 * Use this before driving traffic to confirm the booking pipeline is ready:
 * - LITEAPI_KEY is set and valid
 * - LiteAPI (search) is reachable
 *
 * Returns 200 with { ok, checks } when ready; 503 when something is wrong.
 * You can call this from a browser, curl, or a simple uptime check.
 */
export async function GET() {
  const checks: Record<string, boolean | string> = {};
  let ok = true;

  const apiKey = process.env.LITEAPI_KEY ?? "";
  checks.apiKey = !!apiKey && apiKey.length > 0;
  if (!checks.apiKey) ok = false;

  if (checks.apiKey) {
    try {
      const res = await fetch(
        "https://api.liteapi.travel/v3.0/data/places?textQuery=Paris",
        {
          headers: {
            "X-API-Key": apiKey,
            accept: "application/json",
          },
        }
      );
      checks.liteApiReachable = res.ok;
      if (!res.ok) {
        ok = false;
        checks.liteApiStatus = res.status;
      }
    } catch (e) {
      checks.liteApiReachable = false;
      checks.liteApiError = (e as Error).message;
      ok = false;
    }
  }

  const status = ok ? 200 : 503;
  return NextResponse.json(
    {
      ok,
      message: ok
        ? "Booking pipeline checks passed."
        : "One or more checks failed. See checks.",
      checks,
    },
    { status }
  );
}
