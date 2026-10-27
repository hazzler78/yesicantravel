import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  daysAheadUntilCheckin,
  isCheckinWithinNearTermRetryWindow,
  runRatesSearchWithRetries,
  shouldRunDelayedThinRatesRetries,
  shouldRunImmediateThinRatesRetry,
  shouldShowFarDateThinNotice,
} from "./ratesSearchOrchestration";
import { countDistinctRateHotels } from "./ratesSearchReliability";

const geoBody = { latitude: 57.7, longitude: 11.9, radius: 20_000 };
const thinPayload = {
  data: [{ hotelId: "1" }, { hotelId: "2" }, { hotelId: "3" }],
};
const richPayload = {
  data: Array.from({ length: 12 }, (_, i) => ({ hotelId: `h${i}` })),
};

describe("daysAheadUntilCheckin", () => {
  it("counts calendar days until check-in", () => {
    assert.equal(daysAheadUntilCheckin("2026-11-10", "2026-10-27"), 14);
  });
});

describe("85-day retry window", () => {
  const today = "2026-10-27";
  const near = "2026-12-01";
  const far = "2027-02-01";

  it("treats stays within 85 days as near-term", () => {
    assert.equal(isCheckinWithinNearTermRetryWindow(near, today), true);
    assert.equal(isCheckinWithinNearTermRetryWindow(far, today), false);
  });

  it("uses immediate retry only for far thin geo searches", () => {
    assert.equal(shouldRunImmediateThinRatesRetry(thinPayload, geoBody, far, today), true);
    assert.equal(shouldRunImmediateThinRatesRetry(thinPayload, geoBody, near, today), false);
  });

  it("uses delayed retries only for near-term thin geo searches", () => {
    assert.equal(shouldRunDelayedThinRatesRetries(thinPayload, geoBody, near, today), true);
    assert.equal(shouldRunDelayedThinRatesRetries(thinPayload, geoBody, far, today), false);
  });

  it("skips retries for single-hotel searches", () => {
    assert.equal(
      shouldRunDelayedThinRatesRetries(thinPayload, { hotelIds: ["only-one"] }, near, today),
      false,
    );
    assert.equal(
      shouldRunImmediateThinRatesRetry(thinPayload, { hotelIds: ["only-one"] }, far, today),
      false,
    );
  });
});

describe("shouldShowFarDateThinNotice", () => {
  it("shows when far-date results are very thin", () => {
    assert.equal(shouldShowFarDateThinNotice("2027-02-01", 3, "2026-10-27"), true);
    assert.equal(shouldShowFarDateThinNotice("2027-02-01", 8, "2026-10-27"), false);
    assert.equal(shouldShowFarDateThinNotice("2026-12-01", 3, "2026-10-27"), false);
  });
});

describe("runRatesSearchWithRetries", () => {
  it("waits between delayed attempts and keeps the richest payload", async () => {
    const calls: number[] = [];
    let attempt = 0;
    const postRates = async () => {
      attempt += 1;
      calls.push(attempt);
      if (attempt === 1) return thinPayload;
      if (attempt === 2) return richPayload;
      return thinPayload;
    };
    const sleeps: number[] = [];
    const { data, meta } = await runRatesSearchWithRetries(
      { ...geoBody, checkin: "2026-12-01", checkout: "2026-12-03" },
      "2026-12-01",
      "2026-12-03",
      postRates,
      { sleep: async (ms) => { sleeps.push(ms); }, today: "2026-10-27" },
    );
    assert.equal(calls.length, 2);
    assert.deepEqual(sleeps, [2_000]);
    assert.equal(countDistinctRateHotels(data), 15);
    assert.equal(meta.initialCount, 3);
    assert.equal(meta.finalCount, 15);
    assert.equal(meta.delayedAttempts, 1);
    assert.equal(meta.usedImmediateRetry, false);
  });

  it("runs an immediate retry for far thin geo searches without sleeping", async () => {
    let attempt = 0;
    const postRates = async () => {
      attempt += 1;
      return attempt === 1 ? thinPayload : richPayload;
    };
    const sleeps: number[] = [];
    const { data, meta } = await runRatesSearchWithRetries(
      geoBody,
      "2027-02-01",
      "2027-02-03",
      postRates,
      { sleep: async (ms) => { sleeps.push(ms); }, today: "2026-10-27" },
    );
    assert.equal(sleeps.length, 0);
    assert.equal(meta.usedImmediateRetry, true);
    assert.equal(countDistinctRateHotels(data), 15);
  });
});
