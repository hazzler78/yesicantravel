import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  DEFAULT_DISCOVERY_CARD_PHOTO,
  getCityPhotoByCityName,
  resolveDiscoveryCardPhoto,
} from "./cityPhotos";

describe("resolveDiscoveryCardPhoto", () => {
  it("resolves winter market cities by name", () => {
    for (const city of ["Prague", "Strasbourg", "Edinburgh", "Vienna"]) {
      const photo = resolveDiscoveryCardPhoto({ city });
      assert.notEqual(photo.src, DEFAULT_DISCOVERY_CARD_PHOTO.src, city);
    }
  });

  it("resolves from event slug prefix", () => {
    const photo = resolveDiscoveryCardPhoto({
      eventSlug: "prague-christmas-markets-2026",
    });
    assert.equal(photo.src, getCityPhotoByCityName("Prague")?.src);
  });

  it("uses parent city from Ferropolis (near Berlin)", () => {
    const photo = resolveDiscoveryCardPhoto({ city: "Ferropolis (near Berlin)" });
    assert.equal(photo.src, getCityPhotoByCityName("Berlin")?.src);
  });

  it("falls back to atmosphere evening when unknown", () => {
    const photo = resolveDiscoveryCardPhoto({ city: "Indio" });
    assert.equal(photo.src, DEFAULT_DISCOVERY_CARD_PHOTO.src);
  });
});