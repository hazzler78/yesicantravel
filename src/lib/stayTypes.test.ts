import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseStayType, STAY_TYPE_ORDER, STAY_TYPES } from "./stayTypes";

describe("parseStayType", () => {
  it("maps legacy budget query param to all", () => {
    assert.equal(parseStayType("budget"), "all");
  });

  it("accepts known stay types", () => {
    assert.equal(parseStayType("hotels"), "hotels");
    assert.equal(parseStayType("apartments"), "apartments");
    assert.equal(parseStayType("all"), "all");
  });

  it("maps unknown values to all", () => {
    assert.equal(parseStayType("hostel"), "all");
    assert.equal(parseStayType(undefined), "all");
    assert.equal(parseStayType(null), "all");
  });
});

describe("STAY_TYPE_ORDER", () => {
  it("has no budget stay type", () => {
    assert.equal(STAY_TYPE_ORDER.includes("budget" as never), false);
    assert.deepEqual(STAY_TYPE_ORDER, ["all", "hotels", "apartments"]);
  });

  it("only lists defined stay types", () => {
    for (const id of STAY_TYPE_ORDER) {
      assert.ok(STAY_TYPES[id], `missing STAY_TYPES entry for ${id}`);
    }
  });
});
