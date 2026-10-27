import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  VISITOR_FEEDBACK_SNOOZE_MS,
  canShowVisitorFeedback,
} from "./visitorFeedback";

describe("canShowVisitorFeedback", () => {
  it("allows show when no snooze record exists", () => {
    assert.equal(canShowVisitorFeedback(1_000_000, null), true);
  });

  it("blocks show before snooze expires", () => {
    const until = 2_000_000;
    assert.equal(canShowVisitorFeedback(until - 1, { until }), false);
  });

  it("allows show after snooze expires", () => {
    const until = 2_000_000;
    assert.equal(canShowVisitorFeedback(until, { until }), true);
    assert.equal(canShowVisitorFeedback(until + 1, { until }), true);
  });

  it("uses a seven-day snooze window constant", () => {
    assert.equal(VISITOR_FEEDBACK_SNOOZE_MS, 7 * 24 * 60 * 60 * 1000);
  });
});
