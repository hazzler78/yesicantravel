import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { pickResultsThinSearchCopy, shouldShowFarDateThinNotice } from "./resultsThinSearchUi";

describe("pickResultsThinSearchCopy", () => {
  it("returns Swedish copy for SEK or sv browsers", () => {
    const sv = pickResultsThinSearchCopy({ currency: "SEK", languages: ["en-US"] });
    assert.match(sv.fetchingMore, /hämtar/i);
    assert.equal(sv.searchAgain, "Sök igen");

    const en = pickResultsThinSearchCopy({ currency: "EUR", languages: ["en-GB"] });
    assert.match(en.fetchingMore, /Fetching/i);
    assert.equal(en.searchAgain, "Search again");
  });
});

describe("far-date notice condition", () => {
  it("re-exports orchestration far-date rule", () => {
    assert.equal(shouldShowFarDateThinNotice("2027-02-01", 2, "2026-10-27"), true);
    assert.equal(shouldShowFarDateThinNotice("2026-12-01", 2, "2026-10-27"), false);
  });
});
