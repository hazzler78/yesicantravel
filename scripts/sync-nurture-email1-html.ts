/**
 * Push day-0 nurture email HTML to MailerLite (automation email 1).
 * Usage: npx tsx scripts/sync-nurture-email1-html.ts
 */
import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { NURTURE_EMAILS, nurtureEmailHtml } from "../src/lib/nurtureEmailCopy";

const AUTOMATION_ID = "198834126848001911";
const EMAIL_ID = "198834127570470906";
const API = "https://connect.mailerlite.com/api";

async function main() {
  const apiKey = process.env.MAILERLITE_API_KEY?.trim();
  if (!apiKey) throw new Error("MAILERLITE_API_KEY not set");

  const html = nurtureEmailHtml(NURTURE_EMAILS[0]!);
  const res = await fetch(`${API}/automations/${AUTOMATION_ID}/emails/${EMAIL_ID}`, {
    method: "PUT",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({ content: html }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`MailerLite ${res.status}: ${JSON.stringify(body)}`);
  }
  console.log("Updated nurture email 1 HTML", { hasShare: html.includes("day0_share") });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
