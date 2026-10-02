/** Map known AI / assistant referrers to a stable lead source label. Client-safe. */
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
    return undefined;
  } catch {
    return undefined;
  }
}
