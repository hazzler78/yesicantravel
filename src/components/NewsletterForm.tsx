"use client";

import { useState } from "react";
import { pinterestTrack } from "@/lib/pinterest";
import { TextField } from "@/components/ui/TextField";
import { PrimaryButton } from "@/components/ui/PrimaryButton";

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
        pinterestTrack("lead", { lead_type: "Newsletter" });
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
    <section className="bg-surface-inverse">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 sm:px-6 md:flex-row md:items-center md:py-14">
        <div className="md:w-1/2">
          <h2 className="font-display text-2xl font-semibold tracking-tight text-ink-inverse md:text-3xl">
            Solo travel notes, a few times a year
          </h2>
          <p className="mt-3 text-[0.9375rem] text-ink-inverse/70">
            New destinations we&apos;ve looked into, stays worth knowing about, and practical tips
            from women who travel on their own. No spam.
          </p>
        </div>
        <form onSubmit={handleSubmit} className="md:w-1/2">
          <div className="flex flex-col gap-2.5 sm:flex-row">
            <div className="flex-1">
              <TextField
                id="newsletter-first-name"
                label="First name"
                hideLabel
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="First name (optional)"
              />
            </div>
            <div className="flex-1">
              <TextField
                id="newsletter-email"
                label="Email"
                hideLabel
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
              />
            </div>
            <PrimaryButton
              type="submit"
              variant="coral"
              size="md"
              fullWidth={false}
              disabled={status === "loading"}
              className="shrink-0"
            >
              {status === "loading" ? "Joining…" : "Join"}
            </PrimaryButton>
          </div>
          {message && (
            <p
              role="status"
              className={`mt-3 text-[0.8125rem] ${
                status === "success" ? "text-teal-soft" : "text-coral-soft"
              }`}
            >
              {message}
            </p>
          )}
          <p className="mt-2.5 text-xs text-ink-inverse/50">
            Occasional emails about solo travel and safer stays. Unsubscribe any time.
          </p>
        </form>
      </div>
    </section>
  );
}
