import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  normalizePrebookResponse,
  prebookPaymentFieldsMissing,
} from "./liteapiPrebookNormalize";

describe("normalizePrebookResponse", () => {
  it("reads nested data fields", () => {
    const out = normalizePrebookResponse({
      data: {
        prebookId: "pb-1",
        transactionId: "tx-1",
        secretKey: "sk-1",
        sandbox: true,
      },
    });
    assert.equal(out.data.prebookId, "pb-1");
    assert.equal(out.data.sandbox, true);
  });

  it("detects missing SDK fields", () => {
    assert.equal(
      prebookPaymentFieldsMissing({ prebookId: "pb", transactionId: "", secretKey: "" }, true),
      "prebook_missing_transaction_id"
    );
    assert.equal(prebookPaymentFieldsMissing({ prebookId: "pb", transactionId: "tx" }, true), "prebook_missing_secret_key");
    assert.equal(prebookPaymentFieldsMissing({ prebookId: "pb" }, false), null);
  });
});
