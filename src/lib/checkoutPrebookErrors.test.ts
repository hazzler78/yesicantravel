import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { classifyPrebookFailure, prebookFailureRecoveryLabel } from "./checkoutPrebookErrors";

describe("checkoutPrebookErrors", () => {
  it("classifies stale offers", () => {
    assert.equal(classifyPrebookFailure("offer expired"), "stale_offer");
    assert.equal(prebookFailureRecoveryLabel("stale_offer"), "Refresh rates on stay page");
  });

  it("classifies price changes", () => {
    assert.equal(classifyPrebookFailure("price changed before prebook"), "price_changed");
  });
});
