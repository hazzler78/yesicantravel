import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  describeRateCancellation,
  formatCancellationDeadline,
  isRefundableRate,
} from "@/lib/cancellationPolicy";

describe("cancellationPolicy", () => {
  it("detects refundable tags", () => {
    assert.equal(isRefundableRate({ refundableTag: "RFN" }), true);
    assert.equal(isRefundableRate({ refundableTag: "NRFN" }), false);
  });

  it("formats non-refundable copy", () => {
    assert.equal(
      describeRateCancellation({ refundableTag: "NRFN" }, "en"),
      "Non-refundable",
    );
    assert.equal(
      describeRateCancellation({ refundableTag: "NRFN" }, "sv"),
      "Ej återbetalningsbar",
    );
  });

  it("includes deadline for refundable rates when present", () => {
    const text = describeRateCancellation(
      {
        refundableTag: "RFN",
        cancelPolicyInfos: [{ cancelTime: "2026-08-01T18:00:00" }],
      },
      "en",
    );
    assert.match(text ?? "", /Free cancellation until/i);
    assert.match(text ?? "", /Aug/);
  });

  it("keeps raw cancelTime when not ISO", () => {
    const formatted = formatCancellationDeadline(
      { cancelPolicyInfos: [{ cancelTime: "1 day before arrival" }] },
      "en",
    );
    assert.equal(formatted, "1 day before arrival");
  });
});
