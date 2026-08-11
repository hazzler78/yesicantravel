import { NextRequest, NextResponse } from "next/server";
import { getHotel } from "@/lib/liteapi";

export async function GET(request: NextRequest) {
  const hotelId = request.nextUrl.searchParams.get("hotelId");
  if (!hotelId) {
    return NextResponse.json(
      { error: "hotelId is required" },
      { status: 400 }
    );
  }
  try {
    const data = await getHotel(hotelId);
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message },
      { status: 500 }
    );
  }
}
