/** Map known AI / assistant / social referrers to a stable lead source label. Client-safe. */
export function sourceFromReferrer(referrer?: string | null): string | undefined {
  if (!referrer) return undefined;
  try {
    const host = new URL(referrer).hostname.replace(/^www\./, "").toLowerCase();
    if (host === "chatgpt.com" || host.endsWith(".chatgpt.com") || host.includes("openai.com")) {
      return "chatgpt.com";
    }
    if (host.includes("perplexity.ai")) return "perplexity.ai";
    if (host.includes("gemini.google") || host.includes("bard.google")) return "gemini";
    if (host.includes("copilot.microsoft")) return "copilot";
    if (host.includes("claude.ai") || host.includes("anthropic.com")) return "claude.ai";
    if (host.includes("you.com")) return "you.com";
    // Instagram in-app browser uses l.instagram.com
    if (host.includes("instagram.com")) return "instagram";
    if (host.includes("tiktok.com")) return "tiktok";
    if (host.includes("facebook.com") || host.includes("fb.com") || host.includes("m.facebook.com")) {
      return "facebook";
    }
    if (host.includes("pinterest.com") || host.includes("pin.it")) return "pinterest";
    return undefined;
  } catch {
    return undefined;
  }
}
