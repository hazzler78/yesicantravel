import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { deriveStaySignals, LATE_CHECK_IN_CUTOFF_MINUTES } from "@/lib/staySignals";

describe("deriveStaySignals check-in end", () => {
  it("shows early cutoffs with caution flag", () => {
    const signals = deriveStaySignals({
      checkinCheckoutTimes: { checkin_end: "8:30 PM" },
    });
    assert.equal(signals.checkInEnd, "20:30");
    assert.equal(signals.checkInEarlyCutoff, true);
  });

  it("shows late cutoffs as positive signal", () => {
    const signals = deriveStaySignals({
      checkinCheckoutTimes: { checkin_end: "11:00 PM" },
    });
    assert.equal(signals.checkInEnd, "23:00");
    assert.equal(signals.checkInEarlyCutoff, false);
  });

  it("treats exactly 21:00 as late cutoff", () => {
    assert.equal(LATE_CHECK_IN_CUTOFF_MINUTES, 21 * 60);
    const signals = deriveStaySignals({
      checkinCheckoutTimes: { checkin_end: "9:00 PM" },
    });
    assert.equal(signals.checkInEnd, "21:00");
    assert.equal(signals.checkInEarlyCutoff, false);
  });

  it("omits check-in when end time is unknown", () => {
    const signals = deriveStaySignals({ checkinCheckoutTimes: {} });
    assert.equal(signals.checkInEnd, undefined);
    assert.equal(signals.checkInEarlyCutoff, false);
  });
});
