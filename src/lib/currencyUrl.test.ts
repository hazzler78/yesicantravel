import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { currencyFromQueryString } from "@/lib/currencyUrl";

describe("currencyFromQueryString", () => {
  it("reads supported codes case-insensitively", () => {
    assert.equal(currencyFromQueryString("?currency=eur"), "EUR");
    assert.equal(currencyFromQueryString("currency=SEK"), "SEK");
  });

  it("ignores invalid codes", () => {
    assert.equal(currencyFromQueryString("?currency=JPY"), null);
    assert.equal(currencyFromQueryString(""), null);
  });
});
