"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Script from "next/script";
import Link from "next/link";

const STORAGE_KEY = "liteapi_checkout_guest";

function PaymentFormInit({
  secretKey,
  prebookId,
  transactionId,
  offerId,
  hotelId,
  checkin,
  checkout,
  adults,
}: {
  secretKey: string;
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
      publicKey: "sandbox",
      secretKey,
      returnUrl,
      targetElement: "#payment-form",
      appearance: { theme: "flat" },
      options: { business: { name: "Safer Stays" } },
    });
    payment.handlePayment();
  }, [secretKey, prebookId, transactionId, offerId, hotelId, checkin, checkout, adults]);
  return null;
}

function CheckoutContent() {
  const searchParams = useSearchParams();
  const offerId = searchParams.get("offerId");
  const hotelId = searchParams.get("hotelId");
  const checkin = searchParams.get("checkin");
  const checkout = searchParams.get("checkout");
  const adults = searchParams.get("adults") ?? "2";
  const prebookId = searchParams.get("prebookId");
  const transactionId = searchParams.get("transactionId");

  const [step, setStep] = useState<"form" | "payment" | "booking" | "done" | "error">("form");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [prebookData, setPrebookData] = useState<{
    prebookId: string;
    transactionId: string;
    secretKey: string;
  } | null>(null);
  const [booking, setBooking] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  // Execute book when we have everything
  useEffect(() => {
    if (step !== "booking" || !prebookId || !transactionId) return;
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (!stored) return;

    (async () => {
      try {
        const guest = JSON.parse(stored);
        const res = await fetch("/api/book", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            prebookId,
            transactionId,
            holder: {
              firstName: guest.firstName,
              lastName: guest.lastName,
              email: guest.email,
            },
            guests: Array.from({ length: Number(adults) || 1 }, (_, i) => ({
              occupancyNumber: i + 1,
              firstName: guest.firstName,
              lastName: guest.lastName,
              email: guest.email,
            })),
          }),
        });
        const json = await res.json();
        if (!res.ok) throw new Error(json.error ?? "Booking failed");
        const data = json.data;
        setBooking(data);
        sessionStorage.removeItem(STORAGE_KEY);
        sessionStorage.setItem(`liteapi_booking_${(data as { bookingId?: string }).bookingId}`, JSON.stringify(data));
        setStep("done");
      } catch (e) {
        setError((e as Error).message);
        setStep("error");
      }
    })();
  }, [step, prebookId, transactionId, adults]);

  const handleGuestSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim() || !email.trim()) {
      alert("Please fill in all guest details.");
      return;
    }
    if (!offerId) {
      setError("Missing offer. Go back and select an offer.");
      return;
    }

    setStep("payment");
    try {
      const res = await fetch("/api/prebook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ offerId }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Prebook failed");

      const data = json.data;
      const pid = data.prebookId;
      const tid = data.transactionId;
      const sk = data.secretKey;

      setPrebookData({ prebookId: pid, transactionId: tid, secretKey: sk });

      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ firstName, lastName, email })
      );

      const base = typeof window !== "undefined" ? window.location.origin + window.location.pathname : "";
      const returnUrl = `${base}?offerId=${offerId}&hotelId=${hotelId}&checkin=${checkin}&checkout=${checkout}&adults=${adults}&prebookId=${pid}&transactionId=${tid}`;

      (window as unknown as { liteAPIConfig?: unknown }).liteAPIConfig = {
        publicKey: "sandbox",
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
      <div className="flex min-h-screen items-center justify-center bg-[var(--sand)]">
        <div className="text-[var(--navy-light)]">Confirming your stay...</div>
      </div>
    );
  }

  // Suppress Stripe Element loaderrors (payment/expressCheckout fail on HTTP localhost; HTTPS required)
  useEffect(() => {
    const getMsg = (r: unknown) => {
      if (!r) return "";
      if (typeof r === "string") return r;
      const o = r as Record<string, unknown>;
      return (
        String(o.message ?? o.msg ?? "") ||
        String(o.error?.message ?? o.error ?? "") ||
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
    // Filter Stripe SDK noise from console
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

  return (
    <div className="min-h-screen bg-[var(--sand)] text-[var(--navy)]">
      <Script src="https://payment-wrapper.liteapi.travel/dist/liteAPIPayment.js?v=a1" strategy="afterInteractive" />
      <div className="mx-auto max-w-xl px-6 py-10">
        <Link href={`/hotel/${hotelId}?checkin=${checkin}&checkout=${checkout}&adults=${adults}`} className="mb-6 inline-block text-[var(--ocean-teal)] font-medium hover:underline">
          ← Back to stay
        </Link>

        {step === "form" ? (
          <form onSubmit={handleGuestSubmit} className="space-y-6 rounded-2xl border border-[var(--navy)]/10 bg-white p-6 shadow-sm">
            <h1 className="text-2xl font-bold text-[var(--navy)]">Your details</h1>
            <p className="text-[var(--navy-light)]">We&apos;ll use this to confirm your booking.</p>
            <div>
              <label htmlFor="firstName" className="mb-2 block text-base font-medium text-[var(--navy)]">First name</label>
              <input
                id="firstName"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full rounded-lg border border-[var(--navy)]/20 bg-white px-4 py-3.5 text-[var(--navy)] focus:border-[var(--ocean-teal)] focus:ring-2 focus:ring-[var(--ocean-teal)]/30"
                required
              />
            </div>
            <div>
              <label htmlFor="lastName" className="mb-2 block text-base font-medium text-[var(--navy)]">Last name</label>
              <input
                id="lastName"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full rounded-lg border border-[var(--navy)]/20 bg-white px-4 py-3.5 text-[var(--navy)] focus:border-[var(--ocean-teal)] focus:ring-2 focus:ring-[var(--ocean-teal)]/30"
                required
              />
            </div>
            <div>
              <label htmlFor="email" className="mb-2 block text-base font-medium text-[var(--navy)]">Email</label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-[var(--navy)]/20 bg-white px-4 py-3.5 text-[var(--navy)] focus:border-[var(--ocean-teal)] focus:ring-2 focus:ring-[var(--ocean-teal)]/30"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full rounded-lg bg-[var(--ocean-teal)] px-6 py-4 text-lg font-semibold text-white hover:bg-[var(--ocean-teal-light)]"
            >
              Continue to payment
            </button>
          </form>
        ) : (
          <div className="space-y-6 rounded-2xl border border-[var(--navy)]/10 bg-white p-6 shadow-sm">
            <h1 className="text-2xl font-bold text-[var(--navy)]">Payment</h1>
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
            <div id="payment-form" className="min-h-[200px]" />
            {prebookData && (
              <PaymentFormInit
                secretKey={prebookData.secretKey}
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
