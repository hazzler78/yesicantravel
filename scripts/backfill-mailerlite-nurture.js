/**
 * Backfill MailerLite subscribers into the nurture group.
 * Usage:
 *   node scripts/backfill-mailerlite-nurture.js           # all active without nurture group
 *   node scripts/backfill-mailerlite-nurture.js user@mail.com
 *
 * Requires: MAILERLITE_API_KEY, MAILERLITE_NURTURE_GROUP_ID (optional MAILERLITE_GROUP_ID)
 */

const API = "https://connect.mailerlite.com/api";

function getApiKey() {
  const key = process.env.MAILERLITE_API_KEY;
  return key?.trim() ? key.trim() : null;
}

function getGroupIds() {
  const ids = [];
  const nurture = process.env.MAILERLITE_NURTURE_GROUP_ID?.trim();
  const main = process.env.MAILERLITE_GROUP_ID?.trim();
  if (nurture) ids.push(nurture);
  if (main && main !== nurture) ids.push(main);
  return ids;
}

async function apiFetch(path, options = {}) {
  const apiKey = getApiKey();
  if (!apiKey) throw new Error("MAILERLITE_API_KEY not set");

  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${apiKey}`,
      ...(options.headers || {}),
    },
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`MailerLite ${res.status}: ${JSON.stringify(body)}`);
  }
  return body;
}

async function listActiveSubscribers(limit = 100) {
  const url = new URL(`${API}/subscribers`);
  url.searchParams.set("filter[status]", "active");
  url.searchParams.set("limit", String(limit));
  const json = await apiFetch(`/subscribers?${url.searchParams.toString()}`);
  return json.data ?? [];
}

async function findSubscriber(email) {
  const params = new URLSearchParams();
  params.set("filter[status]", "active");
  params.set("filter[email]", email.trim().toLowerCase());
  const json = await apiFetch(`/subscribers?${params.toString()}`);
  return json.data?.[0] ?? null;
}

async function assignToGroup(subscriberId, groupId) {
  await apiFetch(`/subscribers/${subscriberId}/groups/${groupId}`, { method: "POST" });
}

function subscriberMissingGroups(subscriber, groupIds) {
  const existing = new Set((subscriber.groups ?? []).map((g) => g.id));
  return groupIds.filter((id) => !existing.has(id));
}

async function backfillSubscriber(subscriber, groupIds) {
  const missing = subscriberMissingGroups(subscriber, groupIds);
  if (missing.length === 0) {
    console.log(`  skip ${subscriber.email} — already in all groups`);
    return { email: subscriber.email, assigned: [] };
  }

  for (const groupId of missing) {
    await assignToGroup(subscriber.id, groupId);
    console.log(`  assigned ${subscriber.email} → group ${groupId}`);
  }
  return { email: subscriber.email, assigned: missing };
}

async function main() {
  const groupIds = getGroupIds();
  if (groupIds.length === 0) {
    console.error("Set MAILERLITE_NURTURE_GROUP_ID (and optionally MAILERLITE_GROUP_ID)");
    process.exit(1);
  }

  const emailArg = process.argv[2];
  let subscribers;

  if (emailArg) {
    const sub = await findSubscriber(emailArg);
    if (!sub) {
      console.error(`No active subscriber found for ${emailArg}`);
      process.exit(1);
    }
    subscribers = [sub];
  } else {
    subscribers = await listActiveSubscribers(100);
  }

  console.log(`Processing ${subscribers.length} subscriber(s), target groups: ${groupIds.join(", ")}`);

  const results = [];
  for (const sub of subscribers) {
    results.push(await backfillSubscriber(sub, groupIds));
  }

  const assignedCount = results.filter((r) => r.assigned.length > 0).length;
  console.log(`Done. ${assignedCount} subscriber(s) updated.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
