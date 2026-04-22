"use client";

import { useCallback, useEffect, useState, useRef, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Script from "next/script";
import Link from "next/link";
import { track } from "@vercel/analytics";
import { fbqTrack, generateMetaEventId } from "@/lib/metaPixel";
import { sendMetaCapiEvent } from "@/lib/metaCapi";
import { pinterestTrack } from "@/lib/pinterest";
import { trackFunnelEvent } from "@/lib/funnelEvents";
import { CheckoutTrustBar } from "@/components/checkout/CheckoutTrustBar";
import { CheckoutProgress } from "@/components/checkout/CheckoutProgress";
import { formatStayTotal } from "@/lib/formatStayPrice";

const STORAGE_KEY = "liteapi_checkout_guest";
const CLIENT_REF_KEY = "liteapi_checkout_client_ref";
const CHECKOUT_COMPLETED_KEY = "liteapi_checkout_completed";

function PaymentFormInit({
  secretKey,
  publicKey,
  prebookId,
  transactionId,
  offerId,
  hotelId,
  checkin,
  checkout,
  adults,
}: {
  secretKey: string;
  publicKey: "sandbox" | "live";
  prebookId: string;
  transactionId: string;
  offerId: string;
  hotelId: string;
  checkin: string;
  checkout: string;
  adults: string;
}) {
  const initialized = useRef(false);
  useEffect(() => {
    if (initialized.current) return;
    const w = window as unknown as { LiteAPIPayment?: new (c: object) => { handlePayment: () => void } };
    if (!w.LiteAPIPayment) return;
    initialized.current = true;
    const returnUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}${window.location.pathname}?offerId=${offerId}&hotelId=${hotelId}&checkin=${checkin}&checkout=${checkout}&adults=${adults}&prebookId=${prebookId}&transactionId=${transactionId}`
        : "";
    const payment = new w.LiteAPIPayment({
      publicKey,
      secretKey,
      returnUrl,
      targetElement: "#payment-form",
      appearance: { theme: "flat" },
      options: { business: { name: "Safer Stays" } },
    });
    payment.handlePayment();
  }, [secretKey, publicKey, prebookId, transactionId, offerId, hotelId, checkin, checkout, adults]);
  return null;
}

function CheckoutContent() {
  const searchParams = useSearchParams();
  const offerId = searchParams.get("offerId");
  const hotelId = searchParams.get("hotelId");
  const checkin = searchParams.get("checkin");
  const checkout = searchParams.get("checkout");
  const adults = searchParams.get("adults") ?? "2";
  const placeId = searchParams.get("placeId");
  const aiSearch = searchParams.get("aiSearch");
  const prebookId = searchParams.get("prebookId");
  const transactionId = searchParams.get("transactionId");
  const totalAmountRaw = searchParams.get("totalAmount");
  const totalCurrencyParam = searchParams.get("totalCurrency");
  const quotedTotal =
    totalAmountRaw != null && totalCurrencyParam
      ? { amount: Number(totalAmountRaw), currency: totalCurrencyParam }
      : null;
  const quotedTotalValid =
    quotedTotal != null && Number.isFinite(quotedTotal.amount) && quotedTotal.amount > 0;

  const backToHotelsHref = useMemo(() => {
    if (!checkin || !checkout || !hotelId) return "/";
    if (placeId || aiSearch) {
      const q = new URLSearchParams({
        checkin,
        checkout,
        adults,
      });
      if (placeId) q.set("placeId", placeId);
      if (aiSearch) q.set("aiSearch", aiSearch);
      return `/results?${q}`;
    }
    return `/hotel/${hotelId}?checkin=${checkin}&checkout=${checkout}&adults=${adults}`;
  }, [placeId, aiSearch, checkin, checkout, adults, hotelId]);

  const [step, setStep] = useState<"form" | "payment" | "booking" | "done" | "error">("form");
  const [paymentConfig, setPaymentConfig] = useState<{
    accountPaymentEnabled: boolean;
    paymentEnv: "sandbox" | "live";
  } | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<"account" | "card">("card");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [stayInfo, setStayInfo] = useState<{
    name?: string;
    address?: string;
    mainPhoto?: string;
  } | null>(null);
  const [prebookData, setPrebookData] = useState<{
    prebookId: string;
    transactionId: string;
    secretKey: string;
    sandbox?: boolean;
  } | null>(null);
  const [booking, setBooking] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [paymentLoadFailed, setPaymentLoadFailed] = useState(false);

  const progressPhase =
    step === "form" ? "details" : step === "payment" ? "payment" : step === "booking" ? "confirm" : "details";

  const guestDetailsEnteredRef = useRef(false);

  const trackGuestDetailsEntered = useCallback(() => {
    if (guestDetailsEnteredRef.current || !hotelId || !offerId) return;
    guestDetailsEnteredRef.current = true;
    track("Entered Guest Details", { hotelId, offerId, checkin, checkout, adults });
  }, [hotelId, offerId, checkin, checkout, adults]);

  const saveCustomerForSuggestions = useCallback(
    (payload: { email: string; firstName: string; lastName: string; phone?: string; hotelId?: string; checkin?: string; checkout?: string }) => {
      fetch("/api/customer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }).catch(() => {});
    },
    []
  );

  const ingestBookingRevenue = useCallback(
    (payload: {
      bookingId?: string;
      status?: string;
      hotelName?: string;
      grossRevenue?: number;
      currency?: string;
      leadEmail?: string;
    }) => {
      if (!payload.bookingId) return;
      fetch("/api/automation/ingest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "booking",
          booking: {
            bookingId: payload.bookingId,
            status: payload.status ?? "confirmed",
            hotelId: hotelId ?? undefined,
            hotelName: payload.hotelName,
            checkin: checkin ?? undefined,
            checkout: checkout ?? undefined,
            grossRevenue: payload.grossRevenue ?? 0,
            currency: payload.currency ?? "EUR",
            leadEmail: payload.leadEmail,
          },
        }),
      }).catch(() => {});
    },
    [hotelId, checkin, checkout]
  );

  useEffect(() => {
    fetch("/api/config")
      .then((r) => r.json())
      .then((c) => {
        setPaymentConfig({
          accountPaymentEnabled: c.accountPaymentEnabled ?? false,
          paymentEnv: c.paymentEnv ?? "sandbox",
        });
        if (c.accountPaymentEnabled) setPaymentMethod("account");
      })
      .catch(() => setPaymentConfig({ accountPaymentEnabled: false, paymentEnv: "sandbox" }));
  }, []);

  // Fetch hotel basics so the user sees exactly what they're booking on this page.
  // Missing this context is a known abandonment driver at payment forms.
  useEffect(() => {
    if (!hotelId) return;
    let cancelled = false;
    fetch(`/api/hotel?hotelId=${encodeURIComponent(hotelId)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (cancelled || !j) return;
        const d = (j.data ?? j) as {
          name?: string;
          address?: string;
          main_photo?: string;
          hotelImages?: Array<{ url?: string }>;
        };
        setStayInfo({
          name: d.name,
          address: d.address,
          mainPhoto: d.main_photo ?? d.hotelImages?.[0]?.url,
        });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [hotelId]);

  const nights = useMemo(() => {
    if (!checkin || !checkout) return 0;
    const start = new Date(checkin).getTime();
    const end = new Date(checkout).getTime();
    if (!Number.isFinite(start) || !Number.isFinite(end)) return 0;
    return Math.max(0, Math.round((end - start) / 86_400_000));
  }, [checkin, checkout]);

  useEffect(() => {
    if (offerId && hotelId && checkin && checkout && step === "form") {
      sessionStorage.removeItem(CHECKOUT_COMPLETED_KEY);
      trackFunnelEvent("CheckoutStart", {
        hotelId,
        offerId,
        checkin,
        checkout,
        adults,
      });
      const eventId = generateMetaEventId("checkout_view");
      const metaData = {
        content_ids: [hotelId],
        content_type: "product",
        value: undefined,
        currency: undefined,
        checkin,
        checkout,
        adults,
      };
      fbqTrack("InitiateCheckout", metaData, { eventId });
      void sendMetaCapiEvent({
        eventName: "InitiateCheckout",
        eventId,
        eventSourceUrl: window.location.href,
        customData: metaData,
      });
      pinterestTrack("checkout", {
        event_id: `checkout-${offerId}-${hotelId}`,
        order_quantity: Number(adults),
      });
    }
  }, [offerId, hotelId, checkin, checkout, adults, step]);

  useEffect(() => {
    if (step !== "payment" || !hotelId || !offerId) return;
    trackFunnelEvent("PaymentSubmit", { hotelId, offerId, checkin, checkout, adults });
  }, [step, hotelId, offerId, checkin, checkout, adults]);

  useEffect(() => {
    const onLeave = () => {
      try {
        if (sessionStorage.getItem(CHECKOUT_COMPLETED_KEY) === "1") return;
        if (step === "done") return;
        track("Booking Abandoned", { step, hotelId, offerId, checkin, checkout, adults });
      } catch {
        /* ignore */
      }
    };
    window.addEventListener("pagehide", onLeave);
    return () => window.removeEventListener("pagehide", onLeave);
  }, [step, hotelId, offerId, checkin, checkout, adults]);

  // Detect when payment form fails to load (Stripe 400 on HTTP/localhost)
  useEffect(() => {
    if (step !== "payment" || !prebookData) return;
    setPaymentLoadFailed(false);
    const timer = setTimeout(() => {
      const el = document.getElementById("payment-form");
      const hasStripeForm = el?.querySelector("iframe, [data-stripe], [role='group']");
      if (el && !hasStripeForm) {
        setPaymentLoadFailed(true);
      }
    }, 10000);
    return () => clearTimeout(timer);
  }, [step, prebookData]);

  // Return from payment: we have prebookId + transactionId in URL
  useEffect(() => {
    if (prebookId && transactionId && step === "form") {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          const guest = JSON.parse(stored);
          setFirstName(guest.firstName ?? "");
          setLastName(guest.lastName ?? "");
          setEmail(guest.email ?? "");
          setStep("booking");
        } catch {
          setError("Guest details not found. Please start the checkout again.");
        }
      } else {
        setError("Guest details not found. Please start the checkout again.");
      }
    }
  }, [prebookId, transactionId, step]);

  // Execute book when we have everything (return from User Payment redirect)
  useEffect(() => {
    if (step !== "booking" || !prebookId || !transactionId) return;
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (!stored) return;

    (async () => {
      try {
        const guest = JSON.parse(stored);
        const clientRef = sessionStorage.getItem(CLIENT_REF_KEY);
        const res = await fetch("/api/book", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prebookId,
            transactionId,
            clientReference: clientRef || undefined,
            holder: {
              firstName: guest.firstName,
              lastName: guest.lastName,
              email: guest.email,
              phone: guest.phone ?? "",
            },
            // LiteAPI expects one primary guest per room (occupancyNumber = room index),
            // and this app currently books a single room with `adults` occupants.
            // So we send exactly one guest with occupancyNumber 1.
            guests: [
              {
                occupancyNumber: 1,
                firstName: guest.firstName,
                lastName: guest.lastName,
                email: guest.email,
              },
            ],
          }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? "Booking failed");
        const data = json.data;
        setBooking(data);
        sessionStorage.removeItem(STORAGE_KEY);
        sessionStorage.removeItem(CLIENT_REF_KEY);
        sessionStorage.setItem(`liteapi_booking_${(data as { bookingId?: string }).bookingId}`, JSON.stringify(data));
        setStep("done");
        sessionStorage.setItem(CHECKOUT_COMPLETED_KEY, "1");
        trackFunnelEvent("BookingSuccess", {
          bookingId: (data as { bookingId?: string }).bookingId,
          hotelId,
          checkin,
          checkout,
          adults,
          paymentMethod: "card",
        });
        pinterestTrack("checkout", {
          event_id: (data as { bookingId?: string }).bookingId ?? undefined,
          currency: (data as { currency?: string }).currency ?? undefined,
          value: (data as { price?: number }).price ?? undefined,
          order_quantity: Number(adults),
        });
        saveCustomerForSuggestions({
          email: guest.email,
          firstName: guest.firstName,
          lastName: guest.lastName,
          phone: guest.phone,
          hotelId: hotelId ?? undefined,
          checkin: checkin ?? undefined,
          checkout: checkout ?? undefined,
        });
        ingestBookingRevenue({
          bookingId: (data as { bookingId?: string }).bookingId,
          status: String((data as { status?: string }).status ?? "confirmed"),
          hotelName: (data as { hotel?: { name?: string } }).hotel?.name,
          grossRevenue: (data as { price?: number }).price ?? 0,
          currency: (data as { currency?: string }).currency ?? "EUR",
          leadEmail: guest.email,
        });
      } catch (e) {
        setError((e as Error).message);
        setStep("error");
      }
    })();
  }, [step, prebookId, transactionId, adults, hotelId, checkin, checkout, saveCustomerForSuggestions, ingestBookingRevenue]);

  // Suppress Stripe Element loaderrors (payment/expressCheckout fail on HTTP localhost; HTTPS required)
  // Must run unconditionally (before any early return) to avoid React "fewer hooks" error.
  useEffect(() => {
    const getMsg = (r: unknown) => {
      if (!r) return "";
      if (typeof r === "string") return r;
      const o = r as Record<string, unknown>;
      const err = o.error as { message?: string } | undefined;
      return (
        String(o.message ?? o.msg ?? "") ||
        String(err?.message ?? o.error ?? "") ||
        JSON.stringify(r)
      );
    };
    const matches = (s: string) =>
      /loaderror|expressCheckout|payment Element/i.test(s);
    const onRejection = (e: PromiseRejectionEvent) => {
      const msg = getMsg(e.reason);
      if (matches(msg)) {
        e.preventDefault();
        e.stopPropagation();
      }
    };
    const onError = (e: ErrorEvent) => {
      if (e.message && matches(e.message)) {
        e.preventDefault();
        return true;
      }
    };
    const origError = console.error;
    console.error = (...args: unknown[]) => {
      const str = args.map((a) => (typeof a === "string" ? a : JSON.stringify(a))).join(" ");
      if (matches(str) || /Stripe\.js.*legacy|options\.wallets.*paypal/i.test(str)) return;
      origError.apply(console, args);
    };
    window.addEventListener("unhandledrejection", onRejection, true);
    window.addEventListener("error", onError, true);
    return () => {
      window.removeEventListener("unhandledrejection", onRejection, true);
      window.removeEventListener("error", onError, true);
      console.error = origError;
    };
  }, []);

  const handleGuestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      alert("Please fill in your name and email to continue.");
      return;
    }
    if (!offerId) {
      setError("Missing offer. Go back and select an offer.");
      return;
    }

    const guestPayload = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      phone: phone.trim(),
    };

    trackGuestDetailsEntered();
    const addPaymentEventId = generateMetaEventId("add_payment");
    const addPaymentData = {
      content_ids: [hotelId],
      content_type: "product",
      has_phone: Boolean(phone.trim()),
      payment_method: paymentMethod,
    };
    fbqTrack("AddPaymentInfo", addPaymentData, { eventId: addPaymentEventId });
    void sendMetaCapiEvent({
      eventName: "AddPaymentInfo",
      eventId: addPaymentEventId,
      eventSourceUrl: window.location.href,
      customData: addPaymentData,
      userData: { email: email.trim(), phone: phone.trim() },
    });

    try {
      const usePaymentSdk = paymentMethod === "card";
      const prebookRes = await fetch("/api/prebook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          offerId,
          usePaymentSdk,
          hotelId,
          checkin,
          checkout,
          adults: Number(adults),
        }),
      });
      const prebookJson = await prebookRes.json();
      if (!prebookRes.ok) throw new Error(prebookJson.error ?? "Prebook failed");

      const pid = prebookJson.data.prebookId;

      const clientRef = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `ref-${Date.now()}`;

      if (paymentMethod === "account") {
        setStep("booking");
        const bookRes = await fetch("/api/book", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prebookId: pid,
            paymentMethod: "ACC_CREDIT_CARD",
            clientReference: clientRef,
            holder: guestPayload,
            // Single-room booking: one primary guest with occupancyNumber 1.
            guests: [
              {
                occupancyNumber: 1,
                firstName: firstName.trim(),
                lastName: lastName.trim(),
                email: email.trim(),
              },
            ],
          }),
        });
        const bookJson = await bookRes.json();
        if (!bookRes.ok) throw new Error(bookJson.error ?? "Booking failed");
        const data = bookJson.data;
        setBooking(data);
        sessionStorage.setItem(`liteapi_booking_${(data as { bookingId?: string }).bookingId}`, JSON.stringify(data));
        setStep("done");
        sessionStorage.setItem(CHECKOUT_COMPLETED_KEY, "1");
        trackFunnelEvent("BookingSuccess", {
          bookingId: (data as { bookingId?: string }).bookingId,
          hotelId,
          checkin,
          checkout,
          adults,
          paymentMethod: "account",
        });
        pinterestTrack("checkout", {
          event_id: (data as { bookingId?: string }).bookingId ?? undefined,
          currency: (data as { currency?: string }).currency ?? undefined,
          value: (data as { price?: number }).price ?? undefined,
          order_quantity: Number(adults),
        });
        saveCustomerForSuggestions({
          email: guestPayload.email,
          firstName: guestPayload.firstName,
          lastName: guestPayload.lastName,
          phone: guestPayload.phone,
          hotelId: hotelId ?? undefined,
          checkin: checkin ?? undefined,
          checkout: checkout ?? undefined,
        });
        ingestBookingRevenue({
          bookingId: (data as { bookingId?: string }).bookingId,
          status: String((data as { status?: string }).status ?? "confirmed"),
          hotelName: (data as { hotel?: { name?: string } }).hotel?.name,
          grossRevenue: (data as { price?: number }).price ?? 0,
          currency: (data as { currency?: string }).currency ?? "EUR",
          leadEmail: guestPayload.email,
        });
        return;
      }

      const tid = prebookJson.data.transactionId;
      const sk = prebookJson.data.secretKey;
      const prebookSandbox = prebookJson.data?.sandbox;
      setPrebookData({ prebookId: pid, transactionId: tid, secretKey: sk, sandbox: prebookSandbox });
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(guestPayload));
      sessionStorage.setItem(CLIENT_REF_KEY, clientRef);
      setStep("payment");

      const base = typeof window !== "undefined" ? window.location.origin + window.location.pathname : "";
      const returnUrl = `${base}?offerId=${offerId}&hotelId=${hotelId}&checkin=${checkin}&checkout=${checkout}&adults=${adults}&prebookId=${pid}&transactionId=${tid}`;
      const paymentEnv = typeof prebookSandbox === "boolean" ? (prebookSandbox ? "sandbox" : "live") : (paymentConfig?.paymentEnv ?? "sandbox");
      (window as unknown as { liteAPIConfig?: unknown }).liteAPIConfig = {
        publicKey: paymentEnv,
        secretKey: sk,
        returnUrl,
        targetElement: "#payment-form",
        appearance: { theme: "flat" },
        options: { business: { name: "Safer Stays" } },
      };
    } catch (e) {
      setError((e as Error).message);
      setStep("error");
    }
  };

  if (!offerId || !hotelId || !checkin || !checkout) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[var(--sand)] text-[var(--navy)]">
        <p className="text-[var(--coral)]">Missing checkout parameters.</p>
        <Link href="/" className="text-[var(--ocean-teal)] font-medium hover:underline">← Back to search</Link>
      </div>
    );
  }

  if (step === "error") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[var(--sand)] text-[var(--navy)]">
        <p className="text-[var(--coral)]">{error}</p>
        <Link href={`/hotel/${hotelId}?checkin=${checkin}&checkout=${checkout}&adults=${adults}`} className="text-[var(--ocean-teal)] font-medium hover:underline">
          ← Back to stay
        </Link>
      </div>
    );
  }

  if (step === "done" && booking) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[var(--sand)] text-[var(--navy)]">
        <div className="mx-auto max-w-lg rounded-xl border border-[var(--navy)]/10 bg-white p-8 text-center shadow-sm">
          <h1 className="mb-4 text-2xl font-bold text-[var(--ocean-teal)]">You&apos;re all set!</h1>
          <p className="mb-2">Booking ID: <strong>{(booking as { bookingId?: string }).bookingId}</strong></p>
          {(booking as { hotelConfirmationCode?: string }).hotelConfirmationCode && (
            <p className="mb-4 text-[var(--navy-light)]">Hotel confirmation: {(booking as { hotelConfirmationCode: string }).hotelConfirmationCode}</p>
          )}
          <Link
            href={`/confirmation?bookingId=${(booking as { bookingId?: string }).bookingId}`}
            className="inline-block rounded-lg bg-[var(--ocean-teal)] px-6 py-3 font-medium text-white hover:bg-[var(--ocean-teal-light)]"
          >
            View booking details
          </Link>
        </div>
      </div>
    );
  }

  if (step === "booking") {
    return (
      <div className="min-h-screen bg-[var(--sand)] text-[var(--navy)]">
        <div className="mx-auto max-w-xl px-4 py-6 sm:px-6 sm:py-10">
          <CheckoutTrustBar />
          <CheckoutProgress phase="confirm" />
          <div className="flex flex-col items-center justify-center rounded-2xl border border-[var(--navy)]/10 bg-white p-10 text-center shadow-sm">
            <div className="mb-4 h-10 w-10 animate-spin rounded-full border-2 border-[var(--ocean-teal)] border-t-transparent" aria-hidden />
            <p className="text-lg font-medium text-[var(--navy)]">Confirming your stay…</p>
            <p className="mt-2 text-sm text-[var(--navy-light)]">Please don&apos;t close this page.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--sand)] text-[var(--navy)]">
      <Script src="https://payment-wrapper.liteapi.travel/dist/liteAPIPayment.js?v=a1" strategy="afterInteractive" />
      <div className="mx-auto max-w-xl px-4 py-6 sm:px-6 sm:py-10">
        <CheckoutTrustBar />

        {(step === "form" || step === "payment") && <CheckoutProgress phase={progressPhase} />}

        <Link
          href={backToHotelsHref}
          className="mb-6 flex min-h-[52px] w-full items-center justify-center rounded-xl border-2 border-[var(--navy)]/15 bg-white px-4 text-base font-bold text-[var(--navy)] shadow-sm transition-colors hover:border-[var(--ocean-teal)]/40 hover:bg-[var(--sand)]"
        >
          ← Back to hotels
        </Link>

        {step === "form" ? (
          <form onSubmit={handleGuestSubmit} className="space-y-5 rounded-2xl border border-[var(--navy)]/10 bg-white p-4 shadow-sm sm:space-y-6 sm:p-6">
            {(stayInfo?.name || checkin) && (
              <div className="flex gap-3 rounded-xl border border-[var(--navy)]/15 bg-[var(--sand)]/40 p-3">
                {stayInfo?.mainPhoto ? (
                  <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-[var(--sand)] sm:h-24 sm:w-24">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={stayInfo.mainPhoto}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg bg-[var(--sand)] text-[var(--navy-light)] sm:h-24 sm:w-24" aria-hidden>
                    <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l9-9 9 9M4.5 10.5V21h15V10.5" />
                    </svg>
                  </div>
                )}
                <div className="flex min-w-0 flex-1 flex-col justify-center">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-[var(--navy-light)]">
                    You&apos;re booking
                  </p>
                  {stayInfo?.name ? (
                    <p className="truncate text-base font-semibold text-[var(--navy)] sm:text-lg">
                      {stayInfo.name}
                    </p>
                  ) : (
                    <p className="truncate text-sm text-[var(--navy-light)]">Loading stay details…</p>
                  )}
                  {stayInfo?.address && (
                    <p className="truncate text-xs text-[var(--navy-light)] sm:text-sm">{stayInfo.address}</p>
                  )}
                  {checkin && checkout && (
                    <p className="mt-1 text-xs text-[var(--navy)] sm:text-sm">
                      {checkin} → {checkout}
                      {nights > 0 && <> · {nights} night{nights === 1 ? "" : "s"}</>}
                      {adults && <> · {adults} guest{Number(adults) === 1 ? "" : "s"}</>}
                    </p>
                  )}
                </div>
              </div>
            )}

            {quotedTotalValid && quotedTotal && (
              <div className="rounded-xl border border-[var(--ocean-teal)]/30 bg-[var(--ocean-teal)]/[0.08] px-3 py-3 text-center sm:px-4 sm:text-left">
                <p className="text-xs font-semibold uppercase tracking-wide text-[var(--navy-light)]">Your price</p>
                <p className="mt-1 text-2xl font-bold text-[var(--ocean-teal)]">
                  {formatStayTotal(quotedTotal.amount, quotedTotal.currency)}
                </p>
                <p className="mt-2 text-sm leading-snug text-[var(--navy)]">
                  Including all taxes, fees, and cleaning fee — nothing hidden.
                </p>
              </div>
            )}

            <div className="rounded-xl border border-[var(--coral)]/20 bg-[var(--coral)]/[0.07] px-3 py-3 text-sm font-medium leading-snug text-[var(--navy)] sm:px-4 sm:text-base">
              Limited rooms available at this price — book now to lock this rate.
            </div>

            <div>
              <h1 className="text-xl font-bold text-[var(--navy)] sm:text-2xl">Your details</h1>
              <p className="mt-1 text-sm text-[var(--navy-light)] sm:text-base">We&apos;ll use this to confirm your booking.</p>
            </div>

            {paymentConfig?.accountPaymentEnabled && (
              <div>
                <span className="mb-2 block text-sm font-medium text-[var(--navy)] sm:text-base">Payment method</span>
                <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                  <label className="flex min-h-[48px] cursor-pointer items-center gap-3 rounded-lg border border-[var(--navy)]/15 px-3 py-2 sm:min-h-0">
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === "account"}
                      onChange={() => setPaymentMethod("account")}
                      className="h-5 w-5 shrink-0 accent-[var(--ocean-teal)] sm:h-4 sm:w-4"
                    />
                    <span className="text-sm sm:text-base">Charge to account</span>
                  </label>
                  <label className="flex min-h-[48px] cursor-pointer items-center gap-3 rounded-lg border border-[var(--navy)]/15 px-3 py-2 sm:min-h-0">
                    <input
                      type="radio"
                      name="paymentMethod"
                      checked={paymentMethod === "card"}
                      onChange={() => setPaymentMethod("card")}
                      className="h-5 w-5 shrink-0 accent-[var(--ocean-teal)] sm:h-4 sm:w-4"
                    />
                    <span className="text-sm sm:text-base">Pay with card</span>
                  </label>
                </div>
                {paymentMethod === "account" && paymentConfig?.paymentEnv === "sandbox" && (
                  <p className="mt-2 text-sm text-[var(--navy-light)]">
                    In sandbox, no real charge. Easiest option for testing.
                  </p>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <label htmlFor="firstName" className="mb-1.5 block text-sm font-medium text-[var(--navy)] sm:mb-2 sm:text-base">
                  First name
                </label>
                <input
                  id="firstName"
                  type="text"
                  value={firstName}
                  onChange={(e) => {
                    trackGuestDetailsEntered();
                    setFirstName(e.target.value);
                  }}
                  autoComplete="given-name"
                  className="w-full rounded-lg border border-[var(--navy)]/20 bg-white px-4 py-4 text-base text-[var(--navy)] focus:border-[var(--ocean-teal)] focus:ring-2 focus:ring-[var(--ocean-teal)]/30 sm:py-3.5"
                  required
                />
              </div>
              <div className="sm:col-span-1">
                <label htmlFor="lastName" className="mb-1.5 block text-sm font-medium text-[var(--navy)] sm:mb-2 sm:text-base">
                  Last name
                </label>
                <input
                  id="lastName"
                  type="text"
                  value={lastName}
                  onChange={(e) => {
                    trackGuestDetailsEntered();
                    setLastName(e.target.value);
                  }}
                  autoComplete="family-name"
                  className="w-full rounded-lg border border-[var(--navy)]/20 bg-white px-4 py-4 text-base text-[var(--navy)] focus:border-[var(--ocean-teal)] focus:ring-2 focus:ring-[var(--ocean-teal)]/30 sm:py-3.5"
                  required
                />
              </div>
            </div>
            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-[var(--navy)] sm:mb-2 sm:text-base">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => {
                  trackGuestDetailsEntered();
                  setEmail(e.target.value);
                }}
                autoComplete="email"
                className="w-full rounded-lg border border-[var(--navy)]/20 bg-white px-4 py-4 text-base text-[var(--navy)] focus:border-[var(--ocean-teal)] focus:ring-2 focus:ring-[var(--ocean-teal)]/30 sm:py-3.5"
                required
              />
            </div>
            <div>
              <label htmlFor="phone" className="mb-1.5 block text-sm font-medium text-[var(--navy)] sm:mb-2 sm:text-base">
                Mobile phone <span className="font-normal text-[var(--navy-light)]">(optional)</span>
              </label>
              <input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => {
                  trackGuestDetailsEntered();
                  setPhone(e.target.value);
                }}
                placeholder="+46 70 123 45 67"
                autoComplete="tel"
                className="w-full rounded-lg border border-[var(--navy)]/20 bg-white px-4 py-4 text-base text-[var(--navy)] placeholder-[var(--navy-light)]/60 focus:border-[var(--ocean-teal)] focus:ring-2 focus:ring-[var(--ocean-teal)]/30 sm:py-3.5"
              />
              <p className="mt-1.5 text-xs text-[var(--navy-light)]">
                Only shared with the hotel — handy for late check-in or flight-delay updates. We don&apos;t text or call you.
              </p>
            </div>
            <button
              type="submit"
              disabled={paymentMethod === "card" && paymentConfig === null}
              className="min-h-[54px] w-full rounded-xl bg-[var(--ocean-teal)] px-6 py-4 text-lg font-semibold text-white hover:bg-[var(--ocean-teal-light)] disabled:opacity-50"
            >
              {paymentMethod === "card" && paymentConfig === null
                ? "Loading..."
                : "Continue to payment"}
            </button>
          </form>
        ) : (
          <div className="space-y-6 rounded-2xl border border-[var(--navy)]/10 bg-white p-4 shadow-sm sm:p-6">
            <h1 className="text-xl font-bold text-[var(--navy)] sm:text-2xl">Payment</h1>
            {(prebookData?.sandbox ?? paymentConfig?.paymentEnv === "sandbox") && (
              <p className="rounded-lg bg-[var(--ocean-teal)]/10 p-4 text-base text-[var(--navy)]">
                Sandbox: use test card <strong>4242 4242 4242 4242</strong>, any 3 digits for CVV, any future expiration date.
                {typeof window !== "undefined" &&
                  window.location?.protocol === "http:" &&
                  window.location?.hostname === "localhost" && (
                    <span className="mt-2 block text-sm text-[var(--navy-light)]">
                      Payment may not load on HTTP localhost. Deploy to Vercel (HTTPS) for full payment flow.
                    </span>
                  )}
              </p>
            )}
            <div id="payment-form" className="min-h-[200px]" />
            {paymentLoadFailed && (
              <div className="mt-4 rounded-lg border border-[var(--coral)]/50 bg-[var(--coral)]/10 p-4 text-[var(--navy)]">
                <p className="font-medium">Payment form didn&apos;t load.</p>
                <p className="mt-1 text-sm text-[var(--navy-light)]">
                  The payment provider returned an error. Please try again in a moment. If it persists,
                  LiteAPI may need to verify your domain (yesicantravel.com) for their Stripe integration.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setPaymentLoadFailed(false);
                    setStep("form");
                  }}
                  className="mt-3 rounded-lg bg-[var(--ocean-teal)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--ocean-teal-light)]"
                >
                  Back to details
                </button>
              </div>
            )}
            {prebookData && (
              <PaymentFormInit
                secretKey={prebookData.secretKey}
                publicKey={typeof prebookData.sandbox === "boolean" ? (prebookData.sandbox ? "sandbox" : "live") : (paymentConfig?.paymentEnv ?? "sandbox")}
                prebookId={prebookData.prebookId}
                transactionId={prebookData.transactionId}
                offerId={offerId!}
                hotelId={hotelId!}
                checkin={checkin!}
                checkout={checkout!}
                adults={adults}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-[var(--sand)] text-[var(--navy-light)]">Loading...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
