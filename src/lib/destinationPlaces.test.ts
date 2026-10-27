import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  destinationPlaceSearchQueries,
  foldNordic,
  normalizeDestinationQuery,
  rankDestinationPlaces,
  type DestinationPlace,
} from "./destinationPlaces";

describe("normalizeDestinationQuery", () => {
  it("strips Swedish hotell i prefix", () => {
    assert.equal(normalizeDestinationQuery("hotell i Göteborg"), "Göteborg");
    assert.equal(normalizeDestinationQuery("hotell i Eidsvoll"), "Eidsvoll");
  });

  it("strips English hotels in prefix", () => {
    assert.equal(normalizeDestinationQuery("hotels in Gothenburg"), "Gothenburg");
  });

  it("strips bare hotell prefix", () => {
    assert.equal(normalizeDestinationQuery("hotell Göteborg"), "Göteborg");
  });

  it("preserves plain city names", () => {
    assert.equal(normalizeDestinationQuery("Göteborg"), "Göteborg");
    assert.equal(normalizeDestinationQuery("Eidsvoll"), "Eidsvoll");
    assert.equal(normalizeDestinationQuery("Eidsvoll, Norway"), "Eidsvoll, Norway");
  });
});

describe("foldNordic", () => {
  it("folds Scandinavian characters", () => {
    assert.equal(foldNordic("Göteborg").toLowerCase(), "goteborg");
    assert.equal(foldNordic("Eidsvoll").toLowerCase(), "eidsvoll");
  });
});

describe("destinationPlaceSearchQueries", () => {
  it("includes raw and normalized variants", () => {
    const queries = destinationPlaceSearchQueries("hotell i Göteborg");
    assert.ok(queries.includes("hotell i Göteborg"));
    assert.ok(queries.includes("Göteborg"));
  });

  it("adds stripped query when hotell i returns no LiteAPI hits alone", () => {
    const queries = destinationPlaceSearchQueries("hotell i Eidsvoll");
    assert.ok(queries.includes("Eidsvoll"));
  });
});

describe("rankDestinationPlaces", () => {
  const city: DestinationPlace = {
    placeId: "city",
    displayName: "Goteborg",
    formattedAddress: "Sweden",
    types: ["locality", "geocode", "political"],
  };
  const hotel: DestinationPlace = {
    placeId: "hotel",
    displayName: "SPAR HOTEL Gårda",
    formattedAddress: "Norra Kustbanegatan, Göteborg, Sweden",
    types: ["lodging", "establishment", "point_of_interest"],
  };
  const osloStreet: DestinationPlace = {
    placeId: "oslo",
    displayName: "Eidsvolls plass",
    formattedAddress: "Oslo, Norway",
    types: ["route", "geocode"],
  };
  const eidsvollTown: DestinationPlace = {
    placeId: "eidsvoll",
    displayName: "Eidsvoll",
    formattedAddress: "Norway",
    types: ["locality", "geocode", "political"],
  };

  it("ranks locality above lodging for the same search", () => {
    const ranked = rankDestinationPlaces([hotel, city]);
    assert.equal(ranked[0]?.placeId, "city");
  });

  it("ranks Eidsvoll town above Oslo street named Eidsvolls plass", () => {
    const ranked = rankDestinationPlaces([osloStreet, eidsvollTown]);
    assert.equal(ranked[0]?.placeId, "eidsvoll");
  });
});
