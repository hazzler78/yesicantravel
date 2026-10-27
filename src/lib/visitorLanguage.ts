/** BCP 47 language code for UI copy (sv or en). */
export type VisitorUiLanguage = "sv" | "en";

/**
 * Prefer Swedish UI when the visitor's browser locale is Swedish (same signal as currency bootstrap).
 */
export function visitorUiLanguageFromNavigator(
  languages: readonly string[] | undefined,
  fallbackLanguage?: string,
): VisitorUiLanguage {
  const list =
    languages && languages.length > 0
      ? languages
      : fallbackLanguage
        ? [fallbackLanguage]
        : ["en"];

  for (const raw of list) {
    const tag = String(raw || "")
      .toLowerCase()
      .replace("_", "-");
    const parts = tag.split("-");
    const lang = parts[0];
    const region = parts[1] ?? "";
    if (lang === "sv" || region === "se") return "sv";
  }
  return "en";
}

export function visitorUiLanguageInBrowser(): VisitorUiLanguage {
  if (typeof navigator === "undefined") return "en";
  try {
    return visitorUiLanguageFromNavigator(
      navigator.languages?.length ? navigator.languages : undefined,
      navigator.language,
    );
  } catch {
    return "en";
  }
}
