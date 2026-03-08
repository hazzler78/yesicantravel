import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Payment env for the frontend. Sandbox from API responses (e.g. prebook/rates) is authoritative
 * when available; key prefix is a fallback when no response exists yet.
 */
export async function GET() {
  const key = process.env.LITEAPI_KEY ?? "";
  const isSandbox = key.startsWith("sand");
  return NextResponse.json({
    accountPaymentEnabled: isSandbox,
    paymentEnv: isSandbox ? "sandbox" : "live",
  });
}
