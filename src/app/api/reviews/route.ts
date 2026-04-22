import { NextRequest, NextResponse } from "next/server";
import { getHotelReviews } from "@/lib/liteapi";

export async function GET(request: NextRequest) {
  const hotelId = request.nextUrl.searchParams.get("hotelId");
  if (!hotelId) {
    return NextResponse.json(
      { error: "hotelId is required" },
      { status: 400 },
    );
  }

  const limitParam = request.nextUrl.searchParams.get("limit");
  const limit = limitParam ? Math.max(1, Math.min(50, Number(limitParam) || 20)) : 20;
  const getSentiment = request.nextUrl.searchParams.get("getSentiment") !== "false";

  try {
    const data = await getHotelReviews(hotelId, { getSentiment, limit, timeout: 4 });
    // Cache at the edge for 10 min; stale-while-revalidate 1h. Reviews don't change minute-to-minute.
    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=600, stale-while-revalidate=3600",
      },
    });
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message },
      { status: 500 },
    );
  }
}
