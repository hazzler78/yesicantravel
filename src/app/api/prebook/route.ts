import { NextRequest, NextResponse } from "next/server";
import { prebook } from "@/lib/liteapi";

export async function POST(request: NextRequest) {
  try {
    const { offerId } = await request.json();
    if (!offerId) {
      return NextResponse.json(
        { error: "offerId is required" },
        { status: 400 }
      );
    }
    const data = await prebook(offerId);
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message },
      { status: 500 }
    );
  }
}
