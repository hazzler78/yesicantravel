import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildRatesRetryBody,
  countDistinctRateHotels,
  mergeRatesPayloads,
  preferRicherRatesPayload,
  RATES_THIN_RESULT_THRESHOLD,
  shouldPersistResultsListCache,
  shouldRetryThinRatesSearch,
} from "./ratesSearchReliability";

describe("countDistinctRateHotels", () => {
  it("counts unique ids across data and hotels", () => {
    const count = countDistinctRateHotels({
      data: [{ hotelId: "a" }, { hotelId: "b" }],
      hotels: [{ id: "b" }, { id: "c" }],
    });
    assert.equal(count, 3);
  });
});

describe("preferRicherRatesPayload", () => {
  it("returns the payload with more hotels", () => {
    const thin = { data: [{ hotelId: "1" }, { hotelId: "2" }] };
    const rich = { data: Array.from({ length: 12 }, (_, i) => ({ hotelId: `h${i}` })) };
    assert.equal(preferRicherRatesPayload(thin, rich), rich);
  });
});

describe("mergeRatesPayloads", () => {
  it("unions hotels from both payloads", () => {
    const merged = mergeRatesPayloads(
      { data: [{ hotelId: "a" }], hotels: [{ id: "a" }] },
      { data: [{ hotelId: "b" }], hotels: [{ id: "b" }] },
    );
    assert.equal(countDistinctRateHotels(merged), 2);
  });
});

describe("shouldRetryThinRatesSearch", () => {
  it("retries geo searches below threshold", () => {
    const payload = { data: [{ hotelId: "1" }, { hotelId: "2" }, { hotelId: "3" }] };
    assert.equal(
      shouldRetryThinRatesSearch(payload, { latitude: 59.9, longitude: 10.7, radius: 20_000 }),
      true,
    );
    assert.equal(
      shouldRetryThinRatesSearch({ data: [] }, { latitude: 59.9, longitude: 10.7, radius: 20_000 }),
      true,
    );
  });

  it("does not retry hotel-id scoped searches", () => {
    const payload = { data: [{ hotelId: "1" }] };
    assert.equal(shouldRetryThinRatesSearch(payload, { hotelIds: ["1"] }), false);
  });

  it("does not retry when already above threshold", () => {
    const payload = {
      data: Array.from({ length: RATES_THIN_RESULT_THRESHOLD }, (_, i) => ({ hotelId: `h${i}` })),
    };
    assert.equal(
      shouldRetryThinRatesSearch(payload, { latitude: 59.9, longitude: 10.7, radius: 20_000 }),
      false,
    );
  });
});

describe("buildRatesRetryBody", () => {
  it("nudges geo params and increases timeout", () => {
    const retry = buildRatesRetryBody({
      latitude: 59.9139,
      longitude: 10.7522,
      radius: 20_000,
      placeId: "ChIJ-test",
      timeout: 12,
    });
    assert.equal(retry.timeout, 18);
    assert.ok(retry.latitude > 59.9139);
    assert.equal(retry.radius, 20_750);
    assert.equal(retry.placeId, undefined);
  });
});

describe("shouldPersistResultsListCache", () => {
  it("skips caching very thin lists", () => {
    assert.equal(shouldPersistResultsListCache(3), false);
    assert.equal(shouldPersistResultsListCache(10), true);
  });
});
