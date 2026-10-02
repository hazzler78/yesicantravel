"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { TextField } from "@/components/ui/TextField";
import { PrimaryButton, PrimaryLink } from "@/components/ui/PrimaryButton";

type LeadMagnetFormProps = {
  /** Page path for analytics (e.g. /bio, /destinations/milan) */
  pagePath?: string;
  /** Email-only — fewer fields on inline CTAs */
  compact?: boolean;
};

export default function LeadMagnetForm({ pagePath, compact = false }: LeadMagnetFormProps) {
  const uid = useId();
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [showName, setShowName] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const onChecklistPage = pagePath === "/checklist";

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setStatus("loading");
    setMessage("");

    try {
      const resolvedPath =
        pagePath ??
        (typeof window !== "undefined" ? window.location.pathname : "/lead-magnet");

      const payload = {
        email: email.trim(),
        firstName: firstName.trim() || undefined,
        source: "lead_magnet" as const,
        pageUrl: resolvedPath,
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
      setMessage(
        onChecklistPage
          ? "You’re in. Tips will arrive by email — keep using the checklist below."
          : "You’re in. Open your checklist below — tips will also arrive by email."
      );
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
        {!onChecklistPage && (
          <PrimaryLink href="/checklist" variant="coral" size="md">
            Open your checklist
          </PrimaryLink>
        )}
        <p className="text-[0.8125rem] text-ink-muted">
          {onChecklistPage ? (
            <>
              Next:{" "}
              <Link href="/popular-cities" className="font-medium text-teal hover:underline">
                browse safer cities
              </Link>
              .
            </>
          ) : (
            <>
              Prefer email? Watch your inbox for the same checklist and follow-up tips.{" "}
              <Link href="/popular-cities" className="font-medium text-teal hover:underline">
                Or start browsing cities
              </Link>
              .
            </>
          )}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mt-4 space-y-3">
      <TextField
        id={`${uid}-email`}
        label="Email address"
        type="email"
        required
        autoComplete="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
      />
      {!compact && (showName || firstName) ? (
        <TextField
          id={`${uid}-first-name`}
          label="First name (optional)"
          type="text"
          autoComplete="given-name"
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          placeholder="First name"
        />
      ) : !compact ? (
        <button
          type="button"
          className="text-[0.8125rem] font-medium text-teal underline-offset-4 hover:underline"
          onClick={() => setShowName(true)}
        >
          Add first name (optional)
        </button>
      ) : null}
      <PrimaryButton type="submit" variant="coral" size="md" disabled={status === "loading"}>
        {status === "loading"
          ? "Sending…"
          : onChecklistPage
            ? "Email me the tips"
            : "Send me the checklist"}
      </PrimaryButton>
      {message && (
        <p role="status" className="text-[0.8125rem] text-coral">
          {message}
        </p>
      )}
    </form>
  );
}
