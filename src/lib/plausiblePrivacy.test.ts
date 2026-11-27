import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  isIgnoredAnalyticsPath,
  isTrackedHostname,
  redactAnalyticsUrl,
  sanitizePlausiblePayload,
  sanitizePlausibleProps,
  takePlausibleRevenue,
} from "./plausiblePrivacy";

const OPTIONS = { captureLocalhost: false, domain: "yesicantravel.com" };

describe("redactAnalyticsUrl", () => {
  it("drops payment and guest identifiers and keeps trip context", () => {
    const url = new URL(
      "https://yesicantravel.com/checkout?hotelId=lp1&offerId=off_1&prebookId=pb_1&transactionId=tx_1&checkin=2026-06-01&checkout=2026-06-04&adults=1&email=ada@example.com&totalAmount=240&utm_source=instagram",
    );
    const redacted = new URL(redactAnalyticsUrl(url));
    assert.equal(redacted.searchParams.get("offerId"), null);
    assert.equal(redacted.searchParams.get("prebookId"), null);
    assert.equal(redacted.searchParams.get("transactionId"), null);
    assert.equal(redacted.searchParams.get("email"), null);
    assert.equal(redacted.searchParams.get("totalAmount"), null);
    assert.equal(redacted.searchParams.get("checkin"), "2026-06-01");
    assert.equal(redacted.searchParams.get("adults"), "1");
    assert.equal(redacted.searchParams.get("hotelId"), "lp1");
    assert.equal(redacted.searchParams.get("utm_source"), "instagram");
    assert.equal(redacted.hash, "");
  });
});

describe("sanitizePlausiblePayload", () => {
  it("canonicalizes www and vercel hosts onto the production domain", () => {
    const result = sanitizePlausiblePayload(
      {
        n: "pageview",
        u: "https://www.yesicantravel.com/results?checkin=2026-07-01",
        d: "ignored.example",
      },
      OPTIONS,
    );
    assert.equal(result?.d, "yesicantravel.com");
    assert.equal(result?.u, "https://yesicantravel.com/results?checkin=2026-07-01");
  });

  it("drops admin, preview deploys, and unknown hosts", () => {
    assert.equal(
      sanitizePlausiblePayload(
        { n: "pageview", u: "https://yesicantravel.com/admin/search-analytics", d: "yesicantravel.com" },
        OPTIONS,
      ),
      null,
    );
    assert.equal(
      sanitizePlausiblePayload(
        { n: "pageview", u: "https://liteapi5-git-preview.vercel.app/", d: "yesicantravel.com" },
        OPTIONS,
      ),
      null,
    );
    assert.equal(
      sanitizePlausiblePayload(
        { n: "pageview", u: "http://localhost:3000/", d: "yesicantravel.com" },
        OPTIONS,
      ),
      null,
    );
    const local = sanitizePlausiblePayload(
      { n: "pageview", u: "http://localhost:3000/results", d: "yesicantravel.com" },
      { captureLocalhost: true, domain: "yesicantravel.com" },
    );
    assert.equal(local?.u, "http://localhost:3000/results");
  });

  it("strips guest props from custom events and keeps the funnel dimensions", () => {
    const result = sanitizePlausiblePayload(
      {
        n: "CheckoutStart",
        u: "https://yesicantravel.com/checkout?prebookId=secret",
        d: "yesicantravel.com",
        r: "https://evil.example/in?email=ada@example.com&utm_medium=social",
        p: {
          hotelId: "lp1",
          email: "ada@example.com",
          bookingId: "bk_1",
          city: "Lisbon",
          paymentMethod: "card",
          adults: 1,
        },
      },
      OPTIONS,
    );
    assert.deepEqual(result?.p, {
      city: "Lisbon",
      payment_method: "card",
      adults: 1,
    });
    assert.equal(result?.u.includes("prebookId"), false);
    assert.equal(new URL(String(result?.r)).searchParams.get("email"), null);
    assert.equal(new URL(String(result?.r)).searchParams.get("utm_medium"), "social");
  });

  it("keeps outbound link targets after stripping sensitive query keys", () => {
    const result = sanitizePlausiblePayload(
      {
        n: "Outbound Link: Click",
        u: "https://yesicantravel.com/hotel/lp1",
        d: "yesicantravel.com",
        p: { url: "https://maps.google.com/?q=hotel&email=ada@example.com" },
      },
      OPTIONS,
    );
    assert.equal(result?.p?.url, "https://maps.google.com/?q=hotel");
  });
});

describe("sanitizePlausibleProps", () => {
  it("drops addresses and over-long free text", () => {
    const props = sanitizePlausibleProps({
      city: "  Paris  ",
      page: "/destinations/paris",
      source: "hero",
      note: "ignore me",
      guests: "ada@example.com",
    });
    assert.deepEqual(props, {
      city: "Paris",
      page: "/destinations/paris",
      source: "hero",
    });
    assert.equal(sanitizePlausibleProps({ reason: "no_rooms" })?.reason, "no_rooms");
  });
});

describe("takePlausibleRevenue", () => {
  it("lifts a sane amount into revenue and leaves currency on the props", () => {
    const result = takePlausibleRevenue({
      currency: "eur",
      revenueAmount: 189.2,
      paymentMethod: "card",
    });
    assert.deepEqual(result.revenue, { amount: 189.2, currency: "EUR" });
    assert.equal(result.props && "revenueAmount" in result.props, false);
  });

  it("ignores missing or absurd amounts", () => {
    assert.equal(takePlausibleRevenue({ currency: "EUR", revenueAmount: 0 }).revenue, undefined);
    assert.equal(takePlausibleRevenue({ currency: "EUR", revenueAmount: 250_000 }).revenue, undefined);
    assert.equal(takePlausibleRevenue({ currency: "euros", revenueAmount: 10 }).revenue, undefined);
  });
});

describe("host and path gates", () => {
  it("tracks the public site and ignores the admin tools", () => {
    assert.equal(isTrackedHostname("yesicantravel.com", false), true);
    assert.equal(isTrackedHostname("preview-abc.vercel.app", false), false);
    assert.equal(isTrackedHostname("localhost", false), false);
    assert.equal(isTrackedHostname("localhost", true), true);
    assert.equal(isIgnoredAnalyticsPath("/admin"), true);
    assert.equal(isIgnoredAnalyticsPath("/admin/social-playbook"), true);
    assert.equal(isIgnoredAnalyticsPath("/results"), false);
  });
});
