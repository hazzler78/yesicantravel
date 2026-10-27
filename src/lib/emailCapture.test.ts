import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { preferredEmailCaptureKind } from "./emailCapture";

describe("preferredEmailCaptureKind", () => {
  it("prefers city-list when a city label is known", () => {
    assert.equal(preferredEmailCaptureKind("Sundet"), "city-list");
    assert.equal(preferredEmailCaptureKind("Milan, Italy"), "city-list");
  });

  it("falls back to checklist without a city", () => {
    assert.equal(preferredEmailCaptureKind(null), "checklist");
    assert.equal(preferredEmailCaptureKind(""), "checklist");
    assert.equal(preferredEmailCaptureKind("   "), "checklist");
  });
});
