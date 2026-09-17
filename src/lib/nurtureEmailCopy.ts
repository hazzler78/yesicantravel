/**
 * Full copy for the MailerLite 4-email nurture sequence.
 * Day 0 / 2 / 5 / 9 — matches getDefaultNurtureSequence() in emailNurture.ts.
 */

export type NurtureEmailCopy = {
  day: number;
  subject: string;
  previewText: string;
  /** Plain paragraphs for MailerLite visual editor */
  bodyParagraphs: string[];
  ctaLabel: string;
  ctaUrl: string;
};

export const NURTURE_EMAILS: NurtureEmailCopy[] = [
  {
    day: 0,
    subject: "Your Solo Female Safety Checklist",
    previewText: "Practical steps before you book — not fear.",
    bodyParagraphs: [
      "Hi {{name|there}},",
      "You asked for the solo female safety checklist — here it is.",
      "Open it anytime: https://yesicantravel.com/checklist",
      "It covers what to check before you book, how to plan your first night, and arriving after dark — without the scare tactics.",
      "You're capable. This just reduces unknowns so you can travel with clarity.",
      "Reply if you have a destination in mind — we love hearing where you're headed.",
    ],
    ctaLabel: "Open your checklist",
    ctaUrl: "https://yesicantravel.com/checklist",
  },
  {
    day: 2,
    subject: "How to choose safer hotels with confidence",
    previewText: "Reception hours, map pins, and free cancellation — before price.",
    bodyParagraphs: [
      "Hi {{name|there}},",
      "Three filters that change how a stay feels when you arrive alone:",
      "1) 24/7 reception — especially if your flight lands late.",
      "2) The map pin — a pretty photo does not tell you about the alley at night.",
      "3) Free cancellation — plans change; flexibility buys peace of mind.",
      "On Yes I Can Travel, safest-first is the default sort — not cheapest.",
      "Browse cities when you're ready: https://yesicantravel.com/popular-cities",
    ],
    ctaLabel: "Explore safer stays",
    ctaUrl: "https://yesicantravel.com/popular-cities",
  },
  {
    day: 5,
    subject: "Top safe solo destinations this month",
    previewText: "Europe cities and peak dates with clear hotel signals.",
    bodyParagraphs: [
      "Hi {{name|there}},",
      "If you're picking a first (or next) solo destination, start with places where late metros, walkable centres, and 24/7 reception are easy to find.",
      "Popular starting points: Barcelona, Paris, Berlin, Amsterdam — compare live stays here: https://yesicantravel.com/popular-cities",
      "Heading to a festival or race? Peak dates with pre-filled search dates: https://yesicantravel.com/events",
      "Save this email and come back when dates firm up.",
    ],
    ctaLabel: "See peak dates",
    ctaUrl: "https://yesicantravel.com/events",
  },
  {
    day: 9,
    subject: "Ready to book? Here is your safety-first plan",
    previewText: "A short plan from search to confirmation.",
    bodyParagraphs: [
      "Hi {{name|there}},",
      "When you're ready to book, keep it simple:",
      "1) Pick city + dates → filter for reception / free cancellation.",
      "2) Open the map — check the last walk from metro or station.",
      "3) Book with a rate you can cancel if needed.",
      "Start here: https://yesicantravel.com/popular-cities",
      "You've got this. Travel confidently — on your terms.",
      "— Yes I Can Travel",
    ],
    ctaLabel: "Start your search",
    ctaUrl: "https://yesicantravel.com/popular-cities",
  },
];

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Simple branded HTML for MailerLite automation emails. */
export function nurtureEmailHtml(email: NurtureEmailCopy): string {
  const paragraphs = email.bodyParagraphs
    .map(
      (p) =>
        `<p style="margin:0 0 16px;font-size:16px;line-height:1.55;color:#1a2332;">${escapeHtml(p).replace(/\n/g, "<br/>")}</p>`
    )
    .join("");

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width"></head>
<body style="margin:0;padding:0;background:#f7f4ef;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f7f4ef;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" width="560" cellspacing="0" cellpadding="0" style="max-width:560px;width:100%;background:#ffffff;border-radius:12px;overflow:hidden;">
          <tr>
            <td style="padding:28px 28px 8px;background:#0d7377;">
              <p style="margin:0;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#d4f1f0;font-family:Georgia,serif;">Yes I Can Travel</p>
              <h1 style="margin:8px 0 0;font-size:22px;line-height:1.3;color:#ffffff;font-family:Georgia,serif;">${escapeHtml(email.subject)}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:28px;font-family:system-ui,-apple-system,Segoe UI,sans-serif;">
              ${paragraphs}
              <p style="margin:24px 0 0;">
                <a href="${escapeHtml(email.ctaUrl)}" style="display:inline-block;background:#e07a5f;color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;padding:14px 22px;border-radius:8px;">${escapeHtml(email.ctaLabel)}</a>
              </p>
              <p style="margin:28px 0 0;font-size:12px;line-height:1.5;color:#6b7280;">
                Travel confidently. Unsubscribe anytime via the link below.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
