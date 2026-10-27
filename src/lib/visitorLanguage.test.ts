import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { visitorUiLanguageFromNavigator } from "./visitorLanguage";

describe("visitorUiLanguageFromNavigator", () => {
  it("returns sv for Swedish locales", () => {
    assert.equal(visitorUiLanguageFromNavigator(["sv-SE"]), "sv");
    assert.equal(visitorUiLanguageFromNavigator(["en-US", "sv"]), "sv");
    assert.equal(visitorUiLanguageFromNavigator(["en-SE"]), "sv");
  });

  it("defaults to en for other locales", () => {
    assert.equal(visitorUiLanguageFromNavigator(["en-US"]), "en");
    assert.equal(visitorUiLanguageFromNavigator(["de-DE"]), "en");
    assert.equal(visitorUiLanguageFromNavigator(undefined, "en-GB"), "en");
  });
});
