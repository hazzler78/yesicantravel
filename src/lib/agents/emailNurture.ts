import { prisma } from "@/lib/prisma";

export function getDefaultNurtureSequence() {
  return [
    {
      day: 0,
      subject: "Your Solo Female Safety Checklist",
      goal: "Deliver lead magnet and establish trust.",
    },
    {
      day: 2,
      subject: "How to choose safer hotels with confidence",
      goal: "Educate and move reader to search flow.",
    },
    {
      day: 5,
      subject: "Top safe solo destinations this month",
      goal: "Drive destination page and blog engagement.",
    },
    {
      day: 9,
      subject: "Ready to book? Here is your safety-first plan",
      goal: "Booking CTA with social proof and reassurance.",
    },
  ];
}

export async function queueNurtureEvent(email: string, campaignName = "lead_magnet_welcome") {
  const lead = await prisma.leadProfile.findUnique({ where: { email: email.trim().toLowerCase() } });
  if (!lead) return null;

  return prisma.emailEvent.create({
    data: {
      eventType: "nurture_queued",
      campaignName,
      metadata: {
        sequence: getDefaultNurtureSequence(),
      },
      leadProfileId: lead.id,
    },
  });
}
