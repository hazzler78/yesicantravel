"use client";

import { useState } from "react";

export default function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setStatus("error");
      setMessage("Please enter your email.");
      return;
    }
    setStatus("loading");
    setMessage(null);
    try {
      const res = await fetch("/api/customer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          firstName: firstName.trim() || undefined,
        }),
      });
      const json = await res.json().catch(() => ({} as { saved?: boolean; reason?: string }));
      if (res.ok && json.saved) {
        setStatus("success");
        setMessage("You’re in. We’ll send you solo travel tips and safer stay ideas.");
        setEmail("");
        setFirstName("");
      } else {
        setStatus("error");
        setMessage("Couldn’t save your email right now. Please try again later.");
      }
    } catch {
      setStatus("error");
      setMessage("Something went wrong. Please try again.");
    }
  };

  return (
    <section className="bg-[var(--navy)] py-12 md:py-16">
      <div className="mx-auto flex max-w-4xl flex-col gap-6 px-6 md:flex-row md:items-center">
        <div className="md:w-1/2">
          <h2 className="text-2xl font-semibold text-white md:text-3xl">
            Stay in the loop for safer solo stays
          </h2>
          <p className="mt-3 text-sm text-white/80 md:text-base">
            Get occasional updates with new safer destinations, hotel picks and solo travel tips.
            No spam, just genuinely helpful ideas.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="md:w-1/2">
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="flex-1">
              <label htmlFor="newsletter-first-name" className="sr-only">
                First name
              </label>
              <input
                id="newsletter-first-name"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First name (optional)"
                className="w-full rounded-lg border border-white/20 bg-white/10 px-4 py-3 text-sm text-white placeholder:text-white/70 focus:border-[var(--ocean-teal)] focus:outline-none focus:ring-2 focus:ring-[var(--ocean-teal)]/40"
              />
            </div>
            <div className="flex-1">
              <label htmlFor="newsletter-email" className="sr-only">
                Email
              </label>
              <input
                id="newsletter-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email to get safer stay tips"
                required
                className="w-full rounded-lg border border-white/20 bg-white px-4 py-3 text-sm text-[var(--navy)] placeholder:text-[var(--navy)]/60 focus:border-[var(--ocean-teal)] focus:outline-none focus:ring-2 focus:ring-[var(--ocean-teal)]/40"
              />
            </div>
            <button
              type="submit"
              disabled={status === "loading"}
              className="mt-1 inline-flex items-center justify-center rounded-lg bg-[var(--ocean-teal)] px-5 py-3 text-sm font-semibold text-white shadow-md transition-colors hover:bg-[var(--ocean-teal-light)] disabled:opacity-70 sm:mt-0"
            >
              {status === "loading" ? "Joining..." : "Join newsletter"}
            </button>
          </div>
          {message && (
            <p
              className={`mt-3 text-xs md:text-sm ${
                status === "success" ? "text-[var(--ocean-teal-light)]" : "text-red-300"
              }`}
            >
              {message}
            </p>
          )}
          <p className="mt-2 text-[10px] text-white/60 md:text-[11px]">
            By joining, you agree to receive occasional emails about solo travel and safer stays.
            You can unsubscribe at any time.
          </p>
        </form>
      </div>
    </section>
  );
}

