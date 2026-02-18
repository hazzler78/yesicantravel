import { NextRequest, NextResponse } from "next/server";
import { searchPlaces } from "@/lib/liteapi";

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get("q");
  if (!q?.trim()) {
    return NextResponse.json({ data: [] }, { status: 200 });
  }
  try {
    const data = await searchPlaces(q);
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message },
      { status: 500 }
    );
  }
}
