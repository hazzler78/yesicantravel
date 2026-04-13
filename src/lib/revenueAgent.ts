import { ApprovalStatus, ContentStatus, LeadEventType, Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { AttributionSnapshot } from "@/lib/attribution";

type LeadInput = {
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  consentMarketing?: boolean;
};

export async function upsertLeadProfile(input: LeadInput, attribution: AttributionSnapshot) {
  const email = input.email.trim().toLowerCase();
  if (!email) return null;
  return prisma.leadProfile.upsert({
    where: { email },
    create: {
      email,
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phone,
      consentMarketing: Boolean(input.consentMarketing),
      source: attribution.source,
      medium: attribution.medium,
      campaign: attribution.campaign,
      utmTerm: attribution.utmTerm,
      utmContent: attribution.utmContent,
      gclid: attribution.gclid,
      fbclid: attribution.fbclid,
      firstReferrer: attribution.referrer,
      lastReferrer: attribution.referrer,
    },
    update: {
      firstName: input.firstName ?? undefined,
      lastName: input.lastName ?? undefined,
      phone: input.phone ?? undefined,
      consentMarketing: input.consentMarketing ?? undefined,
      source: attribution.source ?? undefined,
      medium: attribution.medium ?? undefined,
      campaign: attribution.campaign ?? undefined,
      utmTerm: attribution.utmTerm ?? undefined,
      utmContent: attribution.utmContent ?? undefined,
      gclid: attribution.gclid ?? undefined,
      fbclid: attribution.fbclid ?? undefined,
      lastReferrer: attribution.referrer ?? undefined,
    },
  });
}

export async function logLeadEvent(params: {
  type: LeadEventType;
  eventName: string;
  eventId?: string;
  pageUrl?: string;
  leadProfileId?: string;
  contentSlug?: string;
  metadata?: Prisma.InputJsonValue;
}) {
  const contentItem = params.contentSlug
    ? await prisma.contentItem.findUnique({ where: { slug: params.contentSlug } })
    : null;

  await prisma.leadEvent.create({
    data: {
      type: params.type,
      eventName: params.eventName,
      eventId: params.eventId,
      pageUrl: params.pageUrl,
      leadProfileId: params.leadProfileId,
      contentItemId: contentItem?.id,
      metadata: params.metadata ?? undefined,
    },
  });
}

export function monthKey(date = new Date()): string {
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}`;
}

export async function upsertBookingWithRevenue(params: {
  bookingId: string;
  status: string;
  hotelId?: string;
  hotelName?: string;
  checkin?: string;
  checkout?: string;
  grossRevenue: number;
  currency?: string;
  commissionRate?: number;
  leadProfileId?: string;
  attribution?: AttributionSnapshot;
}) {
  const commissionRate = params.commissionRate ?? 0.12;
  const estimatedCommission = Number((params.grossRevenue * commissionRate).toFixed(2));

  const booking = await prisma.bookingEvent.upsert({
    where: { bookingId: params.bookingId },
    create: {
      bookingId: params.bookingId,
      status: params.status,
      hotelId: params.hotelId,
      hotelName: params.hotelName,
      checkin: params.checkin ? new Date(params.checkin) : undefined,
      checkout: params.checkout ? new Date(params.checkout) : undefined,
      grossRevenue: params.grossRevenue,
      currency: params.currency ?? "EUR",
      estimatedCommission,
      leadProfileId: params.leadProfileId,
    },
    update: {
      status: params.status,
      hotelId: params.hotelId ?? undefined,
      hotelName: params.hotelName ?? undefined,
      grossRevenue: params.grossRevenue,
      currency: params.currency ?? "EUR",
      estimatedCommission,
      leadProfileId: params.leadProfileId ?? undefined,
    },
  });

  const periodMonth = monthKey();
  await prisma.revenueLedger.upsert({
    where: { id: `${booking.id}:${periodMonth}` },
    create: {
      id: `${booking.id}:${periodMonth}`,
      bookingEventId: booking.id,
      periodMonth,
      grossRevenue: params.grossRevenue,
      commission: estimatedCommission,
      netRevenue: estimatedCommission,
    },
    update: {
      grossRevenue: params.grossRevenue,
      commission: estimatedCommission,
      netRevenue: estimatedCommission,
    },
  });

  if (params.attribution && params.leadProfileId) {
    await prisma.attributionTouch.create({
      data: {
        channel: params.attribution.medium ?? "unknown",
        source: params.attribution.source,
        medium: params.attribution.medium,
        campaign: params.attribution.campaign,
        touchWeight: 1,
        leadProfileId: params.leadProfileId,
        bookingEventId: booking.id,
        metadata: params.attribution as Prisma.InputJsonValue,
      },
    });
  }

  return booking;
}

export async function buildMonthlyReport(periodMonth: string) {
  const [contentPublished, leadsCaptured, bookings, revenue] = await Promise.all([
    prisma.contentItem.count({ where: { status: ContentStatus.published } }),
    prisma.leadProfile.count(),
    prisma.bookingEvent.count(),
    prisma.revenueLedger.aggregate({
      where: { periodMonth },
      _sum: { grossRevenue: true, commission: true, adSpend: true, netRevenue: true },
    }),
  ]);

  const commissionRevenue = revenue._sum.commission ?? 0;
  const adSpend = revenue._sum.adSpend ?? 0;
  const roi = adSpend > 0 ? Number((((commissionRevenue - adSpend) / adSpend) * 100).toFixed(2)) : null;

  return prisma.monthlyReport.upsert({
    where: { periodMonth },
    create: {
      periodMonth,
      contentPublished,
      leadsCaptured,
      bookingsInfluenced: bookings,
      grossRevenue: revenue._sum.grossRevenue ?? 0,
      commissionRevenue,
      adSpend,
      roi: roi ?? undefined,
      reportJson: {
        generatedAt: new Date().toISOString(),
        notes: "Auto-generated by revenue growth agent",
      },
    },
    update: {
      contentPublished,
      leadsCaptured,
      bookingsInfluenced: bookings,
      grossRevenue: revenue._sum.grossRevenue ?? 0,
      commissionRevenue,
      adSpend,
      roi: roi ?? undefined,
      reportJson: {
        generatedAt: new Date().toISOString(),
        notes: "Auto-generated by revenue growth agent",
      },
    },
  });
}

export async function proposeAdBudget(periodMonth: string, allocationPercent = 0.2) {
  const report = await prisma.monthlyReport.findUnique({ where: { periodMonth } });
  const commissionRevenue = report?.commissionRevenue ?? 0;
  const proposedBudget = Number((commissionRevenue * allocationPercent).toFixed(2));

  const cycle = await prisma.adBudgetCycle.upsert({
    where: { periodMonth },
    create: {
      periodMonth,
      commissionRevenue,
      allocationPercent,
      proposedBudget,
      status: ApprovalStatus.pending,
    },
    update: {
      commissionRevenue,
      allocationPercent,
      proposedBudget,
    },
  });

  const approval = await prisma.approvalRequest.create({
    data: {
      requestType: "ads_budget",
      periodMonth,
      status: ApprovalStatus.pending,
      requestedData: {
        proposedBudget,
        commissionRevenue,
        allocationPercent,
      },
      adBudgetCycleId: cycle.id,
    },
  });

  return { cycle, approval };
}

export async function validateAdExecutionApproval(periodMonth: string) {
  const latest = await prisma.approvalRequest.findFirst({
    where: { periodMonth, requestType: "ads_budget" },
    orderBy: { requestedAt: "desc" },
  });

  if (!latest) return { allowed: false, reason: "No approval request exists." };
  if (latest.status !== ApprovalStatus.approved) {
    return { allowed: false, reason: "Ad budget has not been approved." };
  }
  if ((latest.approvalText ?? "").trim().toUpperCase() !== "YES") {
    return { allowed: false, reason: "Approval text must be exact YES." };
  }

  return { allowed: true, reason: "Approved" };
}
