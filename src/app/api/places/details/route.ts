import { NextRequest, NextResponse } from "next/server";
import { getPlaceDetails } from "@/lib/liteapi";

export async function GET(request: NextRequest) {
  const placeId = request.nextUrl.searchParams.get("placeId");
  if (!placeId?.trim()) {
    return NextResponse.json({ error: "placeId required" }, { status: 400 });
  }
  try {
    const data = await getPlaceDetails(placeId.trim());
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message },
      { status: 500 }
    );
  }
}
