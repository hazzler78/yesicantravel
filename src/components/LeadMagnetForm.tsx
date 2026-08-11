"use client";

import { useState } from "react";
import { TextField } from "@/components/ui/TextField";
import { PrimaryButton } from "@/components/ui/PrimaryButton";

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
      const payload = { email: email.trim(), firstName: firstName.trim() || undefined };
      const [saveRes] = await Promise.all([
        fetch("/api/customer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }),
        fetch("/api/automation/ingest", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ kind: "lead", lead: { ...payload, consentMarketing: true } }),
        }),
      ]);

      if (!saveRes.ok) throw new Error("Unable to save lead");

      await fetch("/api/automation/email/nurture", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: payload.email, campaignName: "solo_female_checklist" }),
      });

      setStatus("success");
      setMessage("Checklist unlocked. Check your inbox for the download and next steps.");
      setEmail("");
      setFirstName("");
    } catch {
      setStatus("error");
      setMessage("Could not process your request right now. Please try again.");
    }
  };

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
        <p
          role="status"
          className={`text-[0.8125rem] ${status === "success" ? "text-positive" : "text-coral"}`}
        >
          {message}
        </p>
      )}
    </form>
  );
}
