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

type MailerLiteSubscriber = {
  id: string;
  email: string;
  groups?: Array<{ id: string; name?: string }>;
};

/** Find a subscriber by email (returns null if not found). */
export async function findMailerLiteSubscriber(
  email: string
): Promise<MailerLiteSubscriber | null> {
  const apiKey = getApiKey();
  if (!apiKey) return null;

  const url = new URL(`${MAILERLITE_API}/subscribers`);
  url.searchParams.set("filter[status]", "active");
  url.searchParams.set("filter[email]", email.trim().toLowerCase());

  const res = await fetch(url.toString(), {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
  });
  if (!res.ok) return null;

  const json = (await res.json()) as { data?: MailerLiteSubscriber[] };
  return json.data?.[0] ?? null;
}

/** Assign an existing subscriber to a group (reliable for backfill). */
export async function assignSubscriberToGroup(
  subscriberId: string,
  groupId: string
): Promise<{ ok: boolean; reason?: string }> {
  const apiKey = getApiKey();
  if (!apiKey) {
    return { ok: false, reason: "MAILERLITE_API_KEY not configured" };
  }

  const res = await fetch(
    `${MAILERLITE_API}/subscribers/${subscriberId}/groups/${groupId}`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
    }
  );

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    console.error("[mailerlite] assign group failed:", res.status, err);
    return { ok: false, reason: `MailerLite ${res.status}` };
  }

  return { ok: true };
}

/** List active subscribers (paginated, first page up to limit). */
export async function listActiveSubscribers(
  limit = 100
): Promise<MailerLiteSubscriber[]> {
  const apiKey = getApiKey();
  if (!apiKey) return [];

  const url = new URL(`${MAILERLITE_API}/subscribers`);
  url.searchParams.set("filter[status]", "active");
  url.searchParams.set("limit", String(limit));

  const res = await fetch(url.toString(), {
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
  });
  if (!res.ok) return [];

  const json = (await res.json()) as { data?: MailerLiteSubscriber[] };
  return json.data ?? [];
}

/** Ensure subscriber is in all nurture/main groups (upsert + explicit assign). */
export async function ensureSubscriberInNurtureGroups(
  email: string,
  options?: {
    firstName?: string;
    campaignName?: string;
    fields?: MailerLiteSubscriberFields;
  }
): Promise<{ ok: boolean; reason?: string; assignedGroups?: string[] }> {
  const groupIds = getNurtureGroupIds();
  if (groupIds.length === 0) {
    return { ok: false, reason: "No MAILERLITE_NURTURE_GROUP_ID or MAILERLITE_GROUP_ID set" };
  }

  const fields: MailerLiteSubscriberFields = { ...(options?.fields ?? {}) };
  if (options?.firstName?.trim() && !fields.name) {
    fields.name = options.firstName.trim();
  }
  if (options?.campaignName) {
    fields.nurture_campaign = options.campaignName;
  }

  const upsert = await upsertMailerLiteSubscriber({
    email,
    fields: Object.keys(fields).length > 0 ? fields : undefined,
    groups: groupIds,
  });
  if (!upsert.ok) return upsert;

  const subscriber = await findMailerLiteSubscriber(email);
  if (!subscriber?.id) {
    return { ok: true, reason: "Upserted but subscriber id not found for assign", assignedGroups: groupIds };
  }

  const assigned: string[] = [];
  for (const groupId of groupIds) {
    const alreadyIn = subscriber.groups?.some((g) => g.id === groupId);
    if (alreadyIn) {
      assigned.push(groupId);
      continue;
    }
    const result = await assignSubscriberToGroup(subscriber.id, groupId);
    if (result.ok) assigned.push(groupId);
  }

  return { ok: true, assignedGroups: assigned };
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
