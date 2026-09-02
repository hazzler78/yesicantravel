import { prisma } from "@/lib/prisma";
import { enrollInNurtureSequence } from "@/lib/mailerlite";

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

export async function queueNurtureEvent(
  email: string,
  campaignName = "lead_magnet_welcome",
  options?: { firstName?: string }
) {
  const normalized = email.trim().toLowerCase();
  const lead = await prisma.leadProfile.findUnique({ where: { email: normalized } });

  const mailerLite = await enrollInNurtureSequence(normalized, {
    firstName: options?.firstName,
    campaignName,
  });

  if (!lead) {
    return {
      queued: false,
      mailerLite,
      reason: "lead_not_found",
    };
  }

  const event = await prisma.emailEvent.create({
    data: {
      eventType: "nurture_queued",
      campaignName,
      metadata: {
        sequence: getDefaultNurtureSequence(),
        mailerLite,
      },
      leadProfileId: lead.id,
    },
  });

  return { queued: true, event, mailerLite };
}
