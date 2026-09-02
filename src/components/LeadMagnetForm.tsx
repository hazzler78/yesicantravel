"use client";

import { useState } from "react";
import Link from "next/link";
import { TextField } from "@/components/ui/TextField";
import { PrimaryButton, PrimaryLink } from "@/components/ui/PrimaryButton";

export default function LeadMagnetForm() {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const payload = {
        email: email.trim(),
        firstName: firstName.trim() || undefined,
        source: "lead_magnet" as const,
      };

      const saveRes = await fetch("/api/customer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = (await saveRes.json()) as { saved?: boolean; reason?: string };
      if (!saveRes.ok || !data.saved) {
        throw new Error(data.reason ?? "Unable to save lead");
      }

      setStatus("success");
      setMessage("You’re in. Open your checklist below — tips will also arrive by email.");
      setEmail("");
      setFirstName("");
    } catch {
      setStatus("error");
      setMessage("Could not process your request right now. Please try again.");
    }
  };

  if (status === "success") {
    return (
      <div className="mt-4 space-y-3 rounded-card border border-teal/30 bg-teal-soft/30 p-4">
        <p role="status" className="text-[0.9375rem] font-medium text-ink">
          {message}
        </p>
        <PrimaryLink href="/checklist" variant="coral" size="md">
          Open your checklist
        </PrimaryLink>
        <p className="text-[0.8125rem] text-ink-muted">
          Prefer email? Watch your inbox for the same checklist and follow-up tips.{" "}
          <Link href="/popular-cities" className="font-medium text-teal hover:underline">
            Or start browsing cities
          </Link>
          .
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mt-4 space-y-3">
      <TextField
        id="lead-first-name"
        label="First name (optional)"
        type="text"
        value={firstName}
        onChange={(e) => setFirstName(e.target.value)}
        placeholder="First name"
      />
      <TextField
        id="lead-email"
        label="Email address"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
      />
      <PrimaryButton type="submit" variant="coral" size="md" disabled={status === "loading"}>
        {status === "loading" ? "Sending…" : "Send me the checklist"}
      </PrimaryButton>
      {message && (
        <p role="status" className="text-[0.8125rem] text-coral">
          {message}
        </p>
      )}
    </form>
  );
}
