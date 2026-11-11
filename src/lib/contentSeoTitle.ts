/**
 * Document titles for blog and similar pages where seoTitle may already be a
 * complete SERP string (e.g. a question ending in "?").
 */
export function absoluteSeoTitle(rawTitle: string): { absolute: string } {
  const t = rawTitle.trim();
  if (t.includes("Yes I Can Travel")) {
    return { absolute: t };
  }
  if (t.endsWith("?")) {
    return { absolute: t };
  }
  return { absolute: `${t} | Yes I Can Travel` };
}

/** Open Graph / Twitter titles — never append brand when seoTitle is a full question. */
export function socialTitle(seoTitle: string | null, fallback: string): string {
  return (seoTitle ?? fallback).trim();
}
