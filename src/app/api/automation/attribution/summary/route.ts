import { NextRequest, NextResponse } from "next/server";
import { AttributionModel } from "@prisma/client";
import { isAutomationAdminAuthorized } from "@/lib/automationAuth";
import { prisma } from "@/lib/prisma";
import { monthKey } from "@/lib/revenueAgent";

function calcWeightedRevenue(grossRevenue: number, touches: number, model: AttributionModel) {
  if (touches <= 1) return [grossRevenue];
  if (model === AttributionModel.first_touch) return [grossRevenue, ...Array(touches - 1).fill(0)];
  if (model === AttributionModel.last_touch) return [...Array(touches - 1).fill(0), grossRevenue];

  const middleCount = Math.max(0, touches - 2);
  const first = grossRevenue * 0.4;
  const last = grossRevenue * 0.4;
  const middle = middleCount > 0 ? (grossRevenue * 0.2) / middleCount : 0;
  return [first, ...Array(middleCount).fill(middle), last];
}

export async function GET(request: NextRequest) {
  if (!isAutomationAdminAuthorized(request)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const periodMonth = request.nextUrl.searchParams.get("periodMonth") ?? monthKey();
    const model = (request.nextUrl.searchParams.get("model") as AttributionModel | null) ?? AttributionModel.position_based;
    const bookings = await prisma.bookingEvent.findMany({
      where: { createdAt: { gte: new Date(`${periodMonth}-01T00:00:00.000Z`) } },
      include: { touches: { orderBy: { touchedAt: "asc" } } },
    });

    const byChannel: Record<string, { bookings: number; revenue: number }> = {};
    for (const booking of bookings) {
      if (!booking.touches.length) {
        byChannel.unknown ??= { bookings: 0, revenue: 0 };
        byChannel.unknown.bookings += 1;
        byChannel.unknown.revenue += booking.grossRevenue;
        continue;
      }
      const weighted = calcWeightedRevenue(booking.grossRevenue, booking.touches.length, model);
      booking.touches.forEach((touch, idx) => {
        const key = touch.channel || "unknown";
        byChannel[key] ??= { bookings: 0, revenue: 0 };
        byChannel[key].bookings += 1;
        byChannel[key].revenue += Number(weighted[idx].toFixed(2));
      });
    }

    return NextResponse.json({
      ok: true,
      periodMonth,
      model,
      channels: byChannel,
    });
  } catch (error) {
    console.error("[automation/attribution/summary]", error);
    return NextResponse.json({ error: "Attribution summary failed." }, { status: 500 });
  }
}
