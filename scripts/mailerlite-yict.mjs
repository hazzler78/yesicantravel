#!/usr/bin/env node
/**
 * Yes I Can Travel MailerLite helper (REST API).
 *
 * Cursor cannot OAuth a second custom MailerLite MCP ("No sign-in link").
 * Elbespararen stays on the official MailerLite plugin; YICT uses this script
 * with secret MAILERLITE_YICT_API_KEY (or fallback MAILERLITE_API_KEY).
 *
 * Usage:
 *   node scripts/mailerlite-yict.mjs auth
 *   node scripts/mailerlite-yict.mjs subscribers
 *   node scripts/mailerlite-yict.mjs groups
 */
const API = "https://connect.mailerlite.com/api";
const key = process.env.MAILERLITE_YICT_API_KEY || process.env.MAILERLITE_API_KEY;

if (!key) {
  console.error(
    JSON.stringify({
      ok: false,
      error: "Missing MAILERLITE_YICT_API_KEY (or MAILERLITE_API_KEY)",
      hint: "Add the YICT MailerLite API token in Cursor Secrets / Cloud Agent secrets.",
    }),
  );
  process.exit(1);
}

const cmd = process.argv[2] || "auth";

async function api(path) {
  const res = await fetch(`${API}${path}`, {
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
  });
  const text = await res.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    body = { raw: text };
  }
  if (!res.ok) {
    console.error(JSON.stringify({ ok: false, status: res.status, body }, null, 2));
    process.exit(1);
  }
  return body;
}

const out = {};
switch (cmd) {
  case "auth": {
    // /subscribers?limit=1 proves the key; account email is not on this endpoint.
    const page = await api("/subscribers?limit=1");
    out.ok = true;
    out.account = "yict";
    out.via = "MAILERLITE_YICT_API_KEY or MAILERLITE_API_KEY";
    out.sampleSubscriberCountOnPage = Array.isArray(page?.data) ? page.data.length : 0;
    break;
  }
  case "subscribers": {
    const page = await api("/subscribers?limit=1");
    // Total is in meta/links depending on API version — also hit a count via filter-less list meta
    out.ok = true;
    out.account = "yict";
    out.meta = page?.meta ?? null;
    out.total = page?.meta?.total ?? page?.total ?? null;
    break;
  }
  case "groups": {
    const page = await api("/groups?limit=50");
    out.ok = true;
    out.account = "yict";
    out.groups = (page?.data ?? []).map((g) => ({
      id: g.id,
      name: g.name,
      active_count: g.active_count,
    }));
    break;
  }
  default:
    console.error(JSON.stringify({ ok: false, error: `Unknown command: ${cmd}` }));
    process.exit(1);
}

console.log(JSON.stringify(out, null, 2));
