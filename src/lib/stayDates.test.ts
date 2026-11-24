import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  addDays,
  getDefaultStayWindow,
  getFridaySundayStayWindow,
  getWeekendStayWindowInRange,
} from "./stayDates";

describe("getFridaySundayStayWindow", () => {
  it("returns a Friday check-in with Sunday checkout", () => {
    const stay = getFridaySundayStayWindow("2026-11-24");
    assert.equal(new Date(stay.checkin + "T12:00:00Z").getUTCDay(), 5);
    assert.equal(stay.nights, 2);
    assert.equal(stay.checkout, addDays(stay.checkin, 2));
    assert.ok(stay.checkin > "2026-11-24");
  });
});

describe("getWeekendStayWindowInRange", () => {
  it("picks a weekend inside the Prague Christmas market window", () => {
    const stay = getWeekendStayWindowInRange("2026-11-28", "2027-01-06", "2026-11-24");
    assert.ok(stay);
    assert.equal(new Date(stay.checkin + "T12:00:00Z").getUTCDay(), 5);
    assert.ok(stay.checkin >= "2026-11-28");
    assert.ok(stay.checkout <= "2027-01-06");
  });

  it("returns null for past seasons", () => {
    const stay = getWeekendStayWindowInRange("2025-01-01", "2025-01-07", "2026-11-24");
    assert.equal(stay, null);
  });
});

describe("getDefaultStayWindow", () => {
  it("matches Friday–Sunday shape", () => {
    const stay = getDefaultStayWindow("2026-11-24");
    assert.deepEqual(stay, getFridaySundayStayWindow("2026-11-24"));
  });
});