"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { track } from "@vercel/analytics";
import { X } from "lucide-react";
import {
  canShowVisitorFeedback,
  readVisitorFeedbackSnooze,
  writeVisitorFeedbackSnooze,
} from "@/lib/visitorFeedback";
import { visitorUiLanguageInBrowser, type VisitorUiLanguage } from "@/lib/visitorLanguage";

const SHOW_DELAY_MS = 2_500;
const SCROLL_SHOW_PX = 320;
const MAX_COMMENT = 500;

type FeedbackPhase = "hidden" | "prompt" | "comment" | "thanks";

export type ResultsFeedbackContext = {
  placeId?: string | null;
  city?: string | null;
  checkin?: string | null;
  checkout?: string | null;
  adults?: number;
  stayType?: string;
  resultCount: number;
};

type ResultsFeedbackWidgetProps = {
  /** Results list finished loading (not skeleton state). */
  resultsReady: boolean;
  /** Block during enriching / thin retry if parent sets it. */
  blocked?: boolean;
  context: ResultsFeedbackContext;
};

function copy(lang: VisitorUiLanguage) {
  if (lang === "sv") {
    return {
      question: "Hittade du det du sökte?",
      yes: "Ja",
      no: "Nej",
      commentYes: "Något vi kan göra bättre?",
      commentNo: "Vad saknade du?",
      send: "Skicka",
      skip: "Hoppa över",
      thanks: "Tack — det hjälper oss att förbättra sidan.",
      dismiss: "Stäng",
    };
  }
  return {
    question: "Did you find what you were looking for?",
    yes: "Yes",
    no: "No",
    commentYes: "Anything we could do better?",
    commentNo: "What was missing?",
    send: "Send",
    skip: "Skip",
    thanks: "Thanks — this helps us improve the page.",
    dismiss: "Close",
  };
}

export function ResultsFeedbackWidget({
  resultsReady,
  blocked = false,
  context,
}: ResultsFeedbackWidgetProps) {
  const [lang, setLang] = useState<VisitorUiLanguage>("en");
  const [phase, setPhase] = useState<FeedbackPhase>("hidden");
  const [answer, setAnswer] = useState<"yes" | "no" | null>(null);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const strings = useMemo(() => copy(lang), [lang]);

  const snoozeAndHide = useCallback(() => {
    writeVisitorFeedbackSnooze(Date.now());
    setPhase("hidden");
  }, []);

  const postFeedback = useCallback(
    async (payload: { answer: "yes" | "no"; comment?: string }) => {
      const body = {
        ...payload,
        pageUrl: typeof window !== "undefined" ? window.location.href : "/results",
        placeId: context.placeId ?? undefined,
        city: context.city ?? undefined,
        checkin: context.checkin ?? undefined,
        checkout: context.checkout ?? undefined,
        adults: context.adults,
        stayType: context.stayType,
        resultCount: context.resultCount,
        language: lang,
        userAgent:
          typeof navigator !== "undefined"
            ? String(navigator.userAgent).slice(0, 256)
            : undefined,
      };
      try {
        await fetch("/api/feedback", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
          keepalive: true,
        });
      } catch {
        // Never block the UI on persistence failures.
      }
    },
    [context, lang],
  );

  useEffect(() => {
    setLang(visitorUiLanguageInBrowser());
  }, []);

  useEffect(() => {
    if (!resultsReady || blocked) {
      setPhase("hidden");
      return;
    }
    const snooze = readVisitorFeedbackSnooze();
    if (!canShowVisitorFeedback(Date.now(), snooze)) {
      setPhase("hidden");
      return;
    }

    let shown = false;
    let delayTimer: ReturnType<typeof setTimeout> | undefined;

    const reveal = () => {
      if (shown) return;
      shown = true;
      setPhase("prompt");
    };

    const onScroll = () => {
      if (window.scrollY >= SCROLL_SHOW_PX) reveal();
    };

    delayTimer = setTimeout(reveal, SHOW_DELAY_MS);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    return () => {
      if (delayTimer) clearTimeout(delayTimer);
      window.removeEventListener("scroll", onScroll);
    };
  }, [resultsReady, blocked]);

  const onAnswer = (value: "yes" | "no") => {
    setAnswer(value);
    try {
      track(value === "yes" ? "feedback_yes" : "feedback_no", {
        resultCount: context.resultCount,
        stayType: context.stayType ?? "",
      });
    } catch {
      // analytics must not throw
    }
    setPhase("comment");
  };

  const finish = async (withComment: boolean) => {
    if (!answer) return;
    setSubmitting(true);
    const trimmed = withComment ? comment.trim().slice(0, MAX_COMMENT) : undefined;
    await postFeedback({
      answer,
      comment: trimmed || undefined,
    });
    writeVisitorFeedbackSnooze(Date.now());
    setSubmitting(false);
    setPhase("thanks");
    window.setTimeout(() => setPhase("hidden"), 4_000);
  };

  if (phase === "hidden") return null;

  return (
    <aside
      className="relative rounded-card border border-border bg-surface-muted/90 px-4 py-4 shadow-sm sm:px-5"
      aria-live="polite"
      data-testid="results-feedback-widget"
    >
      <button
        type="button"
        onClick={snoozeAndHide}
        className="absolute right-3 top-3 rounded-full p-1.5 text-ink-muted hover:bg-surface hover:text-ink"
        aria-label={strings.dismiss}
      >
        <X className="h-4 w-4" aria-hidden />
      </button>

      {phase === "prompt" && (
        <div className="pr-8">
          <p className="text-[0.9375rem] font-medium text-ink">{strings.question}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => onAnswer("yes")}
              className="inline-flex min-h-[40px] items-center justify-center rounded-control border border-border bg-surface px-4 text-[0.9375rem] font-semibold text-ink hover:border-teal hover:text-teal"
            >
              {strings.yes}
            </button>
            <button
              type="button"
              onClick={() => onAnswer("no")}
              className="inline-flex min-h-[40px] items-center justify-center rounded-control border border-border bg-surface px-4 text-[0.9375rem] font-semibold text-ink hover:border-teal hover:text-teal"
            >
              {strings.no}
            </button>
          </div>
        </div>
      )}

      {phase === "comment" && answer && (
        <div className="pr-8">
          <label className="block text-[0.9375rem] font-medium text-ink" htmlFor="results-feedback-comment">
            {answer === "yes" ? strings.commentYes : strings.commentNo}
          </label>
          <textarea
            id="results-feedback-comment"
            maxLength={MAX_COMMENT}
            rows={3}
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            className="mt-2 w-full resize-y rounded-control border border-border bg-surface px-3 py-2 text-[0.9375rem] text-ink placeholder:text-ink-muted focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/30"
            placeholder=""
          />
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={submitting}
              onClick={() => finish(true)}
              className="inline-flex min-h-[40px] items-center justify-center rounded-control bg-teal px-4 text-[0.9375rem] font-semibold text-white hover:bg-teal-hover disabled:opacity-60"
            >
              {strings.send}
            </button>
            <button
              type="button"
              disabled={submitting}
              onClick={() => finish(false)}
              className="inline-flex min-h-[40px] items-center justify-center rounded-control px-3 text-[0.9375rem] font-medium text-ink-muted hover:text-ink"
            >
              {strings.skip}
            </button>
          </div>
        </div>
      )}

      {phase === "thanks" && (
        <p className="pr-8 text-[0.9375rem] text-ink">{strings.thanks}</p>
      )}
    </aside>
  );
}
