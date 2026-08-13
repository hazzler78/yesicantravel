"use client";

import { useCallback, useEffect, useState, useRef, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Script from "next/script";
import Link from "next/link";
import { track } from "@vercel/analytics";
import { ArrowLeft, ImageOff } from "lucide-react";
import { fbqTrack, generateMetaEventId } from "@/lib/metaPixel";
import { sendMetaCapiEvent } from "@/lib/metaCapi";
import { pinterestTrack } from "@/lib/pinterest";
import { trackFunnelEvent } from "@/lib/funnelEvents";
import { BookingSuccess } from "@/components/checkout/BookingSuccess";
import { CheckoutMessage } from "@/components/checkout/CheckoutMessage";
import { CheckoutTrustBar } from "@/components/checkout/CheckoutTrustBar";
import { CheckoutProgress } from "@/components/checkout/CheckoutProgress";
import { formatStayTotal } from "@/lib/formatStayPrice";
import { safetyBadgesFromHotel } from "@/lib/safetyBadges";
import { TextField } from "@/components/ui/TextField";
import { PrimaryButton, PrimaryLink } from "@/components/ui/PrimaryButton";
import { SecondaryLink } from "@/components/ui/SecondaryButton";
import { SafetyBadgeList } from "@/components/ui/SafetyBadge";
import {
  buildStaySearchParams,
  guestsForBooking,
  occupanciesForRequest,
  occupancySummary,
  parsePartyFromSearchParams,
  requestedRoomsFromSearchParams,
} from "@/lib/occupancy";

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
  occupancyQuery,
}: {
  secretKey: string;
  publicKey: "sandbox" | "live";
  prebookId: string;
  transactionId: string;
  offerId: string;
  hotelId: string;
  checkin: string;
  checkout: string;
  occupancyQuery: string;
}) {
  const initialized = useRef(false);
  useEffect(() => {
    if (initialized.current) return;
    const w = window as unknown as { LiteAPIPayment?: new (c: object) => { handlePayment: () => void } };
    if (!w.LiteAPIPayment) return;
    initialized.current = true;
    const returnUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}${window.location.pathname}?offerId=${offerId}&hotelId=${hotelId}&checkin=${checkin}&checkout=${checkout}&${occupancyQuery}&prebookId=${prebookId}&transactionId=${transactionId}`
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
  }, [secretKey, publicKey, prebookId, transactionId, offerId, hotelId, checkin, checkout, occupancyQuery]);
  return null;
}

function CheckoutContent() {
  const searchParams = useSearchParams();
  const offerId = searchParams.get("offerId");
  const hotelId = searchParams.get("hotelId");
  const checkin = searchParams.get("checkin");
  const checkout = searchParams.get("checkout");
  const adults = searchParams.get("adults") ?? "1";
  const placeId = searchParams.get("placeId");
  const aiSearch = searchParams.get("aiSearch");
  const party = parsePartyFromSearchParams(searchParams);
  const requestedRooms = requestedRoomsFromSearchParams(searchParams);
  const occupancies = occupanciesForRequest(party, requestedRooms);
  const occupancyQuery = buildStaySearchParams({ party, rooms: requestedRooms }).toString();
  const travellerCount = party.adults + party.childAges.length;
  const hotelStayHref = hotelId
    ? `/hotel/${hotelId}?${buildStaySearchParams({
        checkin,
        checkout,
        party,
        rooms: requestedRooms,
        placeId,
        aiSearch,
      })}`
    : "/";
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
      return `/results?${buildStaySearchParams({
        checkin,
        checkout,
        party,
        rooms: requestedRooms,
        placeId,
        aiSearch,
      })}`;
    }
    return hotelStayHref;
  }, [placeId, aiSearch, checkin, checkout, hotelId, hotelStayHref, party, requestedRooms]);

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
    safetyBadges?: string[];
  } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  }>({});
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
          facilities?: Array<{ name?: string }>;
          hotelFacilities?: string[];
        };
        setStayInfo({
          name: d.name,
          address: d.address,
          mainPhoto: d.main_photo ?? d.hotelImages?.[0]?.url,
          safetyBadges: safetyBadgesFromHotel(d),
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
        order_quantity: travellerCount,
      });
    }
  }, [offerId, hotelId, checkin, checkout, adults, travellerCount, step]);

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
          setPhone(guest.phone ?? "");
          if (!String(guest.phone ?? "").trim()) {
            setError("Mobile phone is required to complete the booking. Please start checkout again and include your phone number.");
            setStep("form");
            return;
          }
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
        if (!String(guest.phone ?? "").trim()) {
          throw new Error("Mobile phone is required to complete the booking. Please start checkout again and include your phone number.");
        }
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
              phone: String(guest.phone).trim(),
            },
            // LiteAPI expects one named guest per room (occupancyNumber = room index).
            guests: guestsForBooking(occupancies, {
              firstName: guest.firstName,
              lastName: guest.lastName,
              email: guest.email,
            }),
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
          order_quantity: travellerCount,
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
  }, [step, prebookId, transactionId, occupancyQuery, hotelId, checkin, checkout, saveCustomerForSuggestions, ingestBookingRevenue]);

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
    const nextErrors: {
      firstName?: string;
      lastName?: string;
      email?: string;
      phone?: string;
    } = {};
    if (!firstName.trim()) nextErrors.firstName = "Please enter your first name.";
    if (!lastName.trim()) nextErrors.lastName = "Please enter your last name.";
    if (!email.trim()) nextErrors.email = "Please enter your email.";
    if (!phone.trim()) nextErrors.phone = "Please enter your mobile phone.";
    setFieldErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

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
          adults: party.adults,
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
            guests: guestsForBooking(occupancies, {
              firstName: firstName.trim(),
              lastName: lastName.trim(),
              email: email.trim(),
            }),
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
          order_quantity: travellerCount,
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
      const returnUrl = `${base}?offerId=${offerId}&hotelId=${hotelId}&checkin=${checkin}&checkout=${checkout}&${occupancyQuery}&prebookId=${pid}&transactionId=${tid}`;
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
      <CheckoutMessage
        title="This checkout link is incomplete"
        body="Pick your room again and we'll take you straight back here."
        actionHref="/"
        actionLabel="Start a new search"
      />
    );
  }

  if (step === "error") {
    return (
      <CheckoutMessage
        title="We couldn't complete this booking"
        body={error ?? "Something went wrong on the way to the property."}
        actionHref={hotelStayHref}
        actionLabel="Back to the stay"
      />
    );
  }

  if (step === "done" && booking) {
    const bookingId = (booking as { bookingId?: string }).bookingId;
    return (
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <BookingSuccess
          bookingId={bookingId}
          hotelConfirmationCode={(booking as { hotelConfirmationCode?: string }).hotelConfirmationCode}
          email={email || undefined}
          actions={
            <>
              <PrimaryLink
                href={`/confirmation?bookingId=${bookingId}`}
                variant="teal"
                fullWidth={false}
              >
                View booking details
              </PrimaryLink>
              <SecondaryLink href="/">Plan another trip</SecondaryLink>
            </>
          }
        />
      </div>
    );
  }

  if (step === "booking") {
    return (
      <div className="mx-auto max-w-xl px-4 py-8 sm:px-6 sm:py-10">
        <CheckoutProgress phase="confirm" />
        <div className="flex flex-col items-center justify-center rounded-card border border-border bg-surface p-10 text-center shadow-card">
          <div
            className="mb-4 h-9 w-9 animate-spin rounded-full border-2 border-teal border-t-transparent"
            aria-hidden
          />
          <p className="font-display text-lg font-semibold text-ink">Confirming your stay…</p>
          <p className="mt-1.5 text-[0.9375rem] text-ink-muted">Please don&apos;t close this page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-canvas">
      <Script src="https://payment-wrapper.liteapi.travel/dist/liteAPIPayment.js?v=a1" strategy="afterInteractive" />
      <div className="mx-auto max-w-xl px-4 py-6 sm:px-6 sm:py-10">
        <Link
          href={backToHotelsHref}
          className="mb-4 inline-flex items-center gap-1.5 text-[0.9375rem] font-medium text-ink-muted underline-offset-4 hover:text-ink hover:underline"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Back to the stay
        </Link>

        {(step === "form" || step === "payment") && <CheckoutProgress phase={progressPhase} />}

        <CheckoutTrustBar />

        {step === "form" ? (
          <form onSubmit={handleGuestSubmit} className="space-y-5 rounded-card border border-border bg-surface p-4 shadow-card sm:p-6">
            {(stayInfo?.name || checkin) && (
              <div className="space-y-3 rounded-control border border-border bg-surface-muted/60 p-3">
                <div className="flex gap-3">
                  {stayInfo?.mainPhoto ? (
                    <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-control bg-surface-muted sm:h-24 sm:w-24">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={stayInfo.mainPhoto}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                    </div>
                  ) : (
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-control bg-surface-muted text-ink-muted sm:h-24 sm:w-24" aria-hidden>
                      <ImageOff className="h-6 w-6" />
                    </div>
                  )}
                  <div className="flex min-w-0 flex-1 flex-col justify-center">
                    <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-ink-muted">
                      You&apos;re booking
                    </p>
                    {stayInfo?.name ? (
                      <p className="truncate font-display text-base font-semibold text-ink">
                        {stayInfo.name}
                      </p>
                    ) : (
                      <p className="truncate text-[0.8125rem] text-ink-muted">Loading stay details…</p>
                    )}
                    {stayInfo?.address && (
                      <p className="truncate text-xs text-ink-muted">{stayInfo.address}</p>
                    )}
                    {checkin && checkout && (
                      <p className="tnum mt-1 text-[0.8125rem] text-ink">
                        {checkin} – {checkout}
                        {nights > 0 && <> · {nights} night{nights === 1 ? "" : "s"}</>}
                        {occupancySummary(party, requestedRooms) && (
                          <> · {occupancySummary(party, requestedRooms)}</>
                        )}
                      </p>
                    )}
                  </div>
                </div>
                {(stayInfo?.safetyBadges?.length ?? 0) > 0 && (
                  <SafetyBadgeList badges={stayInfo?.safetyBadges ?? []} max={3} />
                )}
              </div>
            )}

            {quotedTotalValid && quotedTotal && (
              <div className="rounded-control border border-border bg-teal-soft px-4 py-3">
                <p className="text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-ink-muted">
                  Your price
                </p>
                <p className="tnum mt-1 font-display text-2xl font-semibold text-ink">
                  {formatStayTotal(quotedTotal.amount, quotedTotal.currency)}
                </p>
                <p className="mt-1 text-[0.8125rem] text-ink-muted">
                  All taxes, fees and cleaning included — nothing added later.
                </p>
              </div>
            )}

            <div>
              <h1 className="font-display text-xl font-semibold tracking-tight text-ink">
                Your details
              </h1>
              <p className="mt-1 text-[0.9375rem] text-ink-muted">
                These go to the hotel to confirm the reservation.
              </p>
            </div>

            {paymentConfig?.accountPaymentEnabled && (
              <div>
                <span className="mb-2 block text-[0.8125rem] font-semibold text-ink">
                  Payment method
                </span>
                <div className="grid gap-2 sm:grid-cols-2">
                  {(
                    [
                      { id: "account", label: "Charge to account" },
                      { id: "card", label: "Pay with card" },
                    ] as const
                  ).map((option) => (
                    <label
                      key={option.id}
                      className={`flex min-h-[48px] cursor-pointer items-center gap-2.5 rounded-control border px-3 text-[0.9375rem] transition-colors ${
                        paymentMethod === option.id
                          ? "border-teal bg-teal-soft font-semibold text-ink"
                          : "border-border text-ink-muted hover:border-border-strong"
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={paymentMethod === option.id}
                        onChange={() => setPaymentMethod(option.id)}
                        className="h-4 w-4 shrink-0 accent-[var(--color-teal)]"
                      />
                      {option.label}
                    </label>
                  ))}
                </div>
                {paymentMethod === "account" && paymentConfig?.paymentEnv === "sandbox" && (
                  <p className="mt-2 text-[0.8125rem] text-ink-muted">
                    Sandbox mode — no real charge is made.
                  </p>
                )}
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <TextField
                id="firstName"
                label="First name"
                type="text"
                value={firstName}
                onChange={(e) => {
                  trackGuestDetailsEntered();
                  setFirstName(e.target.value);
                  if (fieldErrors.firstName) setFieldErrors((prev) => ({ ...prev, firstName: undefined }));
                }}
                autoComplete="given-name"
                required
                error={fieldErrors.firstName}
              />
              <TextField
                id="lastName"
                label="Last name"
                type="text"
                value={lastName}
                onChange={(e) => {
                  trackGuestDetailsEntered();
                  setLastName(e.target.value);
                  if (fieldErrors.lastName) setFieldErrors((prev) => ({ ...prev, lastName: undefined }));
                }}
                autoComplete="family-name"
                required
                error={fieldErrors.lastName}
              />
            </div>
            <TextField
              id="email"
              label="Email"
              type="email"
              value={email}
              onChange={(e) => {
                trackGuestDetailsEntered();
                setEmail(e.target.value);
                if (fieldErrors.email) setFieldErrors((prev) => ({ ...prev, email: undefined }));
              }}
              autoComplete="email"
              required
              error={fieldErrors.email}
            />
            <TextField
              id="phone"
              label="Mobile phone"
              type="tel"
              value={phone}
              onChange={(e) => {
                trackGuestDetailsEntered();
                setPhone(e.target.value);
                if (fieldErrors.phone) setFieldErrors((prev) => ({ ...prev, phone: undefined }));
              }}
              placeholder="+46 70 123 45 67"
              autoComplete="tel"
              required
              error={fieldErrors.phone}
              hint="Required for the hotel booking. Only shared with the hotel — handy for late check-in or flight-delay updates. We don't text or call you."
            />
            <PrimaryButton
              type="submit"
              variant="coral"
              disabled={paymentMethod === "card" && paymentConfig === null}
            >
              {paymentMethod === "card" && paymentConfig === null
                ? "Loading..."
                : "Continue to payment"}
            </PrimaryButton>
          </form>
        ) : (
          <div className="space-y-6 rounded-card border border-border bg-surface p-4 shadow-card sm:p-6">
            <h1 className="font-display text-xl font-semibold tracking-tight text-ink">Payment</h1>
            {(prebookData?.sandbox ?? paymentConfig?.paymentEnv === "sandbox") && (
              <p className="rounded-control bg-teal-soft p-4 text-[0.9375rem] text-ink">
                Sandbox: use test card <strong>4242 4242 4242 4242</strong>, any 3 digits for CVV, any future expiration date.
                {typeof window !== "undefined" &&
                  window.location?.protocol === "http:" &&
                  window.location?.hostname === "localhost" && (
                    <span className="mt-2 block text-[0.8125rem] text-ink-muted">
                      Payment may not load on HTTP localhost. Deploy to Vercel (HTTPS) for full payment flow.
                    </span>
                  )}
              </p>
            )}
            <div id="payment-form" className="min-h-[200px]" />
            {paymentLoadFailed && (
              <div className="mt-4 rounded-control border border-border bg-coral-soft p-4 text-ink">
                <p className="font-semibold">The payment form didn&apos;t load.</p>
                <p className="mt-1 text-[0.8125rem] text-ink-muted">
                  The payment provider returned an error. Please try again in a moment. If it persists,
                  LiteAPI may need to verify your domain (yesicantravel.com) for their Stripe integration.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setPaymentLoadFailed(false);
                    setStep("form");
                  }}
                  className="mt-3 inline-flex min-h-[44px] items-center justify-center rounded-control bg-teal px-4 text-[0.9375rem] font-semibold text-white hover:bg-teal-hover"
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
                occupancyQuery={occupancyQuery}
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
    <Suspense
      fallback={
        <div className="mx-auto max-w-xl px-4 py-10 sm:px-6">
          <div className="h-72 animate-pulse rounded-card bg-surface-muted" />
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}
