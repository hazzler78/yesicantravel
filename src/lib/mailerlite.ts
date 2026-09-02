const MAILERLITE_API = "https://connect.mailerlite.com/api";

export type MailerLiteSubscriberFields = Record<string, string>;

export type UpsertSubscriberInput = {
  email: string;
  fields?: MailerLiteSubscriberFields;
  groups?: string[];
};

function getApiKey(): string | null {
  const key = process.env.MAILERLITE_API_KEY;
  return key?.trim() ? key.trim() : null;
}

/** Add or update a subscriber in MailerLite. Returns false when API key is unset. */
export async function upsertMailerLiteSubscriber(
  input: UpsertSubscriberInput
): Promise<{ ok: boolean; reason?: string }> {
  const apiKey = getApiKey();
  if (!apiKey) {
    return { ok: false, reason: "MAILERLITE_API_KEY not configured" };
  }

  const payload: {
    email: string;
    fields?: MailerLiteSubscriberFields;
    groups?: string[];
  } = {
    email: input.email.trim().toLowerCase(),
  };
  if (input.fields && Object.keys(input.fields).length > 0) {
    payload.fields = input.fields;
  }
  if (input.groups?.length) {
    payload.groups = input.groups.filter(Boolean);
  }

  const res = await fetch(`${MAILERLITE_API}/subscribers`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    console.error("[mailerlite] subscriber upsert failed:", res.status, err);
    return { ok: false, reason: `MailerLite ${res.status}` };
  }

  return { ok: true };
}

/** Group IDs to add on nurture signup — triggers MailerLite automation when configured. */
export function getNurtureGroupIds(): string[] {
  const ids: string[] = [];
  const nurture = process.env.MAILERLITE_NURTURE_GROUP_ID?.trim();
  const main = process.env.MAILERLITE_GROUP_ID?.trim();
  if (nurture) ids.push(nurture);
  if (main && main !== nurture) ids.push(main);
  return ids;
}

/**
 * Enrol a lead in the nurture sequence.
 * In MailerLite: create an automation on MAILERLITE_NURTURE_GROUP_ID with the 4-email sequence
 * defined in emailNurture.ts (day 0, 2, 5, 9).
 */
export async function enrollInNurtureSequence(
  email: string,
  options?: { firstName?: string; campaignName?: string }
): Promise<{ ok: boolean; reason?: string }> {
  const fields: MailerLiteSubscriberFields = {};
  if (options?.firstName?.trim()) {
    fields.name = options.firstName.trim();
  }
  if (options?.campaignName) {
    fields.nurture_campaign = options.campaignName;
  }

  return upsertMailerLiteSubscriber({
    email,
    fields: Object.keys(fields).length > 0 ? fields : undefined,
    groups: getNurtureGroupIds(),
  });
}
