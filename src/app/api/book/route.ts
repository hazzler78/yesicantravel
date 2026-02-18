import { NextRequest, NextResponse } from "next/server";
import { book } from "@/lib/liteapi";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { prebookId, transactionId, holder, guests } = body;
    if (!prebookId || !transactionId || !holder || !guests?.length) {
      return NextResponse.json(
        { error: "prebookId, transactionId, holder and guests are required" },
        { status: 400 }
      );
    }
    const data = await book({
      prebookId,
      transactionId,
      holder,
      guests,
    });
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json(
      { error: (e as Error).message },
      { status: 500 }
    );
  }
}
