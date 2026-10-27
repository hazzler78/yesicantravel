import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseVisitorFeedbackBody } from "./visitorFeedbackValidation";

describe("parseVisitorFeedbackBody", () => {
  it("rejects missing answer", () => {
    const result = parseVisitorFeedbackBody({ pageUrl: "https://example.com/results" });
    assert.equal(result.ok, false);
  });

  it("rejects invalid answer", () => {
    const result = parseVisitorFeedbackBody({
      answer: "maybe",
      pageUrl: "https://example.com/results",
    });
    assert.equal(result.ok, false);
  });

  it("requires pageUrl", () => {
    const result = parseVisitorFeedbackBody({ answer: "yes" });
    assert.equal(result.ok, false);
  });

  it("accepts a minimal valid payload", () => {
    const result = parseVisitorFeedbackBody({
      answer: "no",
      pageUrl: "https://yesicantravel.com/results?placeId=abc",
    });
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.data.answer, "no");
      assert.equal(result.data.pageUrl, "https://yesicantravel.com/results?placeId=abc");
    }
  });

  it("rejects comments longer than 500 characters", () => {
    const result = parseVisitorFeedbackBody({
      answer: "yes",
      pageUrl: "https://example.com",
      comment: "x".repeat(501),
    });
    assert.equal(result.ok, false);
  });

  it("trims and keeps optional search context fields", () => {
    const result = parseVisitorFeedbackBody({
      answer: "yes",
      pageUrl: "https://example.com",
      city: " Berlin ",
      placeId: "pid-1",
      checkin: "2026-06-01",
      checkout: "2026-06-03",
      adults: 2,
      stayType: "hotel",
      resultCount: 12,
      language: "sv",
    });
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.data.city, "Berlin");
      assert.equal(result.data.adults, 2);
      assert.equal(result.data.resultCount, 12);
      assert.equal(result.data.language, "sv");
    }
  });
});
