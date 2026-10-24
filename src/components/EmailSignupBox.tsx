"use client";

import { useId, useMemo, useState } from "react";
import { track } from "@vercel/analytics";
import { Mail } from "lucide-react";
import {
  formatNewsletterCityName,
  getNewsletterCopy,
  newsletterCopy,
} from "@/lib/newsletterCopy";
import { pinterestTrack } from "@/lib/pinterest";
import { TextField } from "@/components/ui/TextField";
import { PrimaryButton } from "@/components/ui/PrimaryButton";

type EmailSignupBoxProps = {
  variant?: "section" | "compact" | "inline";
  /** Display city name (destination, blog-mapped city, or results search). */
  city?: string | null;
  pagePath?: string;
  className?: string;
};

export function EmailSignupBox({
  variant = "compact",
  city,
  pagePath,
  className = "",
}: EmailSignupBoxProps) {
  const uid = useId();
  const copy = useMemo(() => getNewsletterCopy(city), [city]);

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [honeypot, setHoneypot] = useState("");

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setMessage(null);

    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setStatus("error");
      setMessage(newsletterCopy.messages.errorEmail);
      return;
    }

    setStatus("loading");

    const resolvedPath =
      pagePath ?? (typeof window !== "undefined" ? window.location.pathname : "/");
    const cityForApi = formatNewsletterCityName(city);

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: email.trim(),
          consent: true,
          city: cityForApi,
          pageUrl: resolvedPath,
          company: honeypot,
        }),
      });

      const json = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        alreadySubscribed?: boolean;
        error?: string;
      };

      if (res.status === 503) {
        setStatus("error");
        setMessage(newsletterCopy.messages.errorUnavailable);
        return;
      }

      if (!res.ok || !json.ok) {
        setStatus("error");
        setMessage(json.error ?? newsletterCopy.messages.errorGeneric);
        return;
      }

      setStatus("success");
      setMessage(json.alreadySubscribed ? copy.successAlready : copy.success);
      setEmail("");

      try {
        track("NewsletterSignup", {
          page: resolvedPath,
          city: cityForApi ?? "generic",
        });
      } catch {
        // ignore
      }
      pinterestTrack("lead", { lead_type: "Newsletter" });
    } catch {
      setStatus("error");
      setMessage(newsletterCopy.messages.errorGeneric);
    }
  };

  if (variant === "section") {
    return (
      <section className={`bg-surface-inverse ${className}`}>
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-12 sm:px-6 md:flex-row md:items-center md:py-14">
          <div className="md:w-1/2">
            <h2 className="font-display text-2xl font-semibold tracking-tight text-ink-inverse md:text-3xl">
              {copy.title}
            </h2>
            <p className="mt-3 text-[0.9375rem] text-ink-inverse/70">{copy.description}</p>
          </div>
          <form onSubmit={onSubmit} className="md:w-1/2" noValidate>
            {renderFields()}
          </form>
        </div>
      </section>
    );
  }

  if (variant === "inline") {
    return (
      <aside
        className={`rounded-card border border-border bg-surface p-4 sm:p-5 ${className}`}
      >
        <div className="flex gap-3">
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-control bg-teal-soft text-teal">
            <Mail className="h-4 w-4" aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="font-display text-base font-semibold text-ink">{copy.title}</p>
            <p className="mt-0.5 text-sm text-ink-muted">{copy.description}</p>
            <form onSubmit={onSubmit} className="mt-3" noValidate>
              {renderFields()}
            </form>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <div className={className}>
      <h2 className="font-display text-base font-semibold text-ink">{copy.title}</h2>
      <p className="mt-1.5 text-[0.9375rem] text-ink-muted">{copy.description}</p>
      <form onSubmit={onSubmit} className="mt-3" noValidate>
        {renderFields()}
      </form>
    </div>
  );

  function renderFields() {
    const isSection = variant === "section";
    const statusColor =
      status === "success"
        ? isSection
          ? "text-teal-soft"
          : "text-teal"
        : status === "error"
          ? isSection
            ? "text-coral-soft"
            : "text-coral"
          : "";

    return (
      <>
        <div
          className="absolute -left-[9999px] h-0 w-0 overflow-hidden"
          aria-hidden="true"
        >
          <label htmlFor={`${uid}-company`}>Company</label>
          <input
            id={`${uid}-company`}
            type="text"
            name="company"
            tabIndex={-1}
            autoComplete="off"
            value={honeypot}
            onChange={(e) => setHoneypot(e.target.value)}
          />
        </div>

        <div className={isSection ? "flex flex-col gap-2.5 sm:flex-row sm:items-start" : "space-y-2.5"}>
          <div className={isSection ? "flex-1" : undefined}>
            <TextField
              id={`${uid}-email`}
              label="Email"
              hideLabel
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={copy.emailPlaceholder}
              disabled={status === "loading" || status === "success"}
            />
          </div>
          <PrimaryButton
            type="submit"
            variant="coral"
            size="md"
            fullWidth={!isSection}
            disabled={status === "loading" || status === "success"}
            className={isSection ? "shrink-0" : undefined}
          >
            {status === "loading" ? copy.submitLoadingLabel : copy.submitLabel}
          </PrimaryButton>
        </div>

        <p
          className={`mt-2.5 text-xs leading-snug ${
            isSection ? "text-ink-inverse/60" : "text-ink-muted"
          }`}
        >
          {copy.finePrint}
        </p>

        {message && (
          <p role="status" className={`mt-3 text-[0.8125rem] ${statusColor}`}>
            {message}
          </p>
        )}
      </>
    );
  }
}
