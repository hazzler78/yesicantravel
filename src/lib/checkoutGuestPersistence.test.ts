import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { guestStorageKey, isGuestRecordFresh } from "./checkoutGuestPersistence";
import {
  parsePaymentRedirectStatus,
  paymentRedirectIndicatesFailure,
  shouldAttemptBookingAfterPaymentReturn,
} from "./checkoutPaymentReturn";

describe("checkoutPaymentReturn", () => {
  it("parses redirect_status values", () => {
    assert.equal(parsePaymentRedirectStatus("succeeded"), "succeeded");
    assert.equal(parsePaymentRedirectStatus("failed"), "failed");
    assert.equal(parsePaymentRedirectStatus(null), "absent");
    assert.equal(parsePaymentRedirectStatus("weird"), "unknown");
  });

  it("blocks booking when payment failed", () => {
    const result = shouldAttemptBookingAfterPaymentReturn("tx-1", "failed");
    assert.equal(result.attempt, false);
    assert.equal(result.reason, "redirect_status_failed");
  });

  it("allows booking when succeeded or absent", () => {
    assert.equal(shouldAttemptBookingAfterPaymentReturn("tx-1", "succeeded").attempt, true);
    assert.equal(shouldAttemptBookingAfterPaymentReturn("tx-1", "absent").attempt, true);
  });

  it("detects failure status", () => {
    assert.equal(paymentRedirectIndicatesFailure("failed"), true);
    assert.equal(paymentRedirectIndicatesFailure("succeeded"), false);
  });
});

describe("checkoutGuestPersistence keys", () => {
  it("builds stable localStorage keys", () => {
    assert.equal(guestStorageKey("pb-123"), "liteapi_checkout_guest_pb-123");
  });

  it("checks guest TTL", () => {
    const now = Date.now();
    assert.equal(isGuestRecordFresh(now - 1000), true);
    assert.equal(isGuestRecordFresh(now - 49 * 60 * 60 * 1000), false);
  });
});
