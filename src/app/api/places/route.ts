import { NextRequest, NextResponse } from "next/server";
import { resolveDestinationPlaces } from "@/lib/destinationPlaces";
import { searchPlaces } from "@/lib/liteapi";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q");
  if (!q?.trim()) {
    return NextResponse.json({ data: [] }, { status: 200 });
  }
  try {
    const places = await resolveDestinationPlaces(q, async (textQuery) => {
      const payload = await searchPlaces(textQuery);
      return { data: payload.data ?? [] };
    });
    return NextResponse.json({ data: places });
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message },
      { status: 500 }
    );
  }
}
