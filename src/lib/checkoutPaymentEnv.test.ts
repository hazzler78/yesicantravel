import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { resolveLiteApiPaymentPublicKey } from "./checkoutPaymentEnv";

describe("resolveLiteApiPaymentPublicKey", () => {
  it("prefers prebook sandbox flag", () => {
    assert.equal(resolveLiteApiPaymentPublicKey({ prebookSandbox: true }), "sandbox");
    assert.equal(resolveLiteApiPaymentPublicKey({ prebookSandbox: false }), "live");
  });

  it("defaults to live when sandbox unknown", () => {
    assert.equal(resolveLiteApiPaymentPublicKey({ configPaymentEnv: "sandbox" }), "sandbox");
    assert.equal(resolveLiteApiPaymentPublicKey({}), "live");
  });
});
