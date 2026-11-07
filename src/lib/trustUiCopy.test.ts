import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { checkInBadgeLabel } from "@/lib/trustUiCopy";

describe("trustUiCopy check-in", () => {
  it("uses caution copy for early cutoffs in English", () => {
    assert.match(
      checkInBadgeLabel("20:30", true, "en"),
      /arriving late\? Contact the hotel/i,
    );
  });

  it("uses Swedish caution copy when requested", () => {
    assert.match(
      checkInBadgeLabel("20:30", true, "sv"),
      /sent ankommande/i,
    );
  });

  it("keeps positive late copy", () => {
    assert.match(checkInBadgeLabel("23:00", false, "en"), /Check-in until 23:00/);
  });
});
