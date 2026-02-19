import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const key = process.env.LITEAPI_KEY ?? "";
  const isSandbox = key.startsWith("sand");
  return NextResponse.json({
    accountPaymentEnabled: isSandbox,
    paymentEnv: isSandbox ? "sandbox" : "live",
  });
}
