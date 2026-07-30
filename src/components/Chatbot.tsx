"use client";

import { useState, useEffect, useRef, FormEvent } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import ReactMarkdown from "react-markdown";

type ChatMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
};

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hi, I’m your Yes I Can Travel assistant. Ask about safer solo stays, bookings, how the site works—or paste text (e.g. a German review) and ask me to translate it into your language.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString() ? `?${searchParams.toString()}` : "";
  const containerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    if (!containerRef.current) return;
    containerRef.current.scrollTop = containerRef.current.scrollHeight;
  }, [messages, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    // Focus input after open so mobile users can type immediately.
    const t = window.setTimeout(() => inputRef.current?.focus(), 50);
    return () => window.clearTimeout(t);
  }, [isOpen]);

  // Keep checkout/confirmation calm — no floating assistant over payment.
  const hideOnTransactional =
    pathname.startsWith("/checkout") || pathname.startsWith("/confirmation");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      role: "user",
      content: trimmed,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          pathname,
          search,
          locale: typeof navigator !== "undefined" ? navigator.language : "en",
          messages: [
            {
              role: "system",
              content:
                "You are the Yes I Can Travel website assistant. Be calm, reassuring, and practical. Always prioritise women’s safety, clarity, and a sense of control. Do not make medical, legal, or emergency safety guarantees. If someone is in immediate danger, tell them to contact local emergency services. For questions, support, or if something is not working on the website, tell them to email hello@yesicantravel.com so we can help or fix it. The server sends current site copy, product updates, and your visitor’s browser language—use those for accurate answers and translations. Prefer the visitor’s language (see locale) unless they switch language in their message. Keep replies concise (1–3 sentences) except when they only want a translation—you may then give a short faithful translation.",
            },
            {
              role: "system",
              content: `The visitor is currently on the path: "${pathname}". Use this to infer what they are trying to do (homepage, results, hotel details, checkout, confirmation). When they are on a hotel page, hotel-specific context (including guest reviews that may be in German or other languages) will be provided separately—answer and translate using that data when relevant.`,
            },
            ...messages.map(({ role, content }) => ({ role, content })),
            { role: "user", content: trimmed },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`Chat API error: ${response.status}`);
      }

      const data = await response.json();
      const assistantText: string =
        data.choices?.[0]?.message?.content ??
        "Sorry, I had trouble answering that. Please try again in a moment.";

      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        content: assistantText,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch {
      const assistantMessage: ChatMessage = {
        id: `assistant-error-${Date.now()}`,
        role: "assistant",
        content:
          "I’m having trouble reaching the help service right now. Please refresh the page or try again in a few minutes.",
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } finally {
      setIsLoading(false);
    }
  }

  if (hideOnTransactional) return null;

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex justify-end p-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <div className="pointer-events-auto flex w-full max-w-[22rem] flex-col items-stretch gap-3 sm:w-80">
        {isOpen && (
          <div
            className="flex max-h-[min(28rem,calc(100dvh-6.5rem))] flex-col overflow-hidden rounded-2xl border border-[var(--navy)]/15 bg-[var(--sand)] shadow-xl"
            role="dialog"
            aria-label="Yes I Can Travel chat assistant"
          >
            <div className="flex shrink-0 items-center justify-between rounded-t-2xl bg-[var(--navy)] px-4 py-3 text-sm text-white">
              <div className="min-w-0 flex-col">
                <span className="block font-semibold">Yes I Can Travel</span>
                <span className="block text-xs text-[var(--sand)]">
                  Safer solo stays assistant
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-base hover:bg-[var(--navy-light)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ocean-teal)]"
                aria-label="Close chat"
              >
                ✕
              </button>
            </div>
            <div
              ref={containerRef}
              className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain px-4 py-3 text-sm"
            >
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.role === "user" ? "justify-end" : "justify-start"
                  }`}
                >
                  <div
                    className={`rounded-2xl px-3 py-2 ${
                      message.role === "user"
                        ? "max-w-[80%] bg-[var(--ocean-teal)] text-white"
                        : "max-w-[85%] bg-white text-[var(--foreground)]"
                    }`}
                  >
                    {message.role === "assistant" ? (
                      <div className="chat-markdown max-w-none whitespace-pre-line text-sm leading-snug [&_p]:my-1 [&_strong]:font-semibold [&_a]:text-[var(--ocean-teal)] [&_a]:underline">
                        <ReactMarkdown
                          components={{
                            p: ({ children }) => <p className="my-1">{children}</p>,
                            strong: ({ children }) => (
                              <strong className="font-semibold">{children}</strong>
                            ),
                            a: ({ href, children }) => (
                              <a
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-[var(--ocean-teal)] underline"
                              >
                                {children}
                              </a>
                            ),
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    ) : (
                      <p className="whitespace-pre-line leading-snug">
                        {message.content}
                      </p>
                    )}
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="rounded-2xl bg-white px-3 py-2 text-xs text-[var(--navy-light)]">
                    Thinking…
                  </div>
                </div>
              )}
            </div>
            <form
              onSubmit={handleSubmit}
              className="shrink-0 border-t border-[var(--navy)]/10 bg-[var(--background)] px-3 py-2.5"
            >
              <div className="flex items-end gap-2">
                <label className="sr-only" htmlFor="chat-input">
                  Ask a question
                </label>
                <textarea
                  ref={inputRef}
                  id="chat-input"
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      event.currentTarget.form?.requestSubmit();
                    }
                  }}
                  rows={1}
                  className="box-border max-h-24 min-h-[44px] min-w-0 flex-1 resize-none rounded-lg border border-[var(--navy)]/15 bg-white px-3 py-2.5 text-base text-[var(--navy)] shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ocean-teal)]"
                  placeholder="Ask anything, or paste text to translate…"
                />
                <button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  className="inline-flex min-h-[44px] shrink-0 items-center justify-center rounded-full bg-[var(--ocean-teal)] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[var(--ocean-teal-light)] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  Send
                </button>
              </div>
            </form>
          </div>
        )}
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="ml-auto flex min-h-[44px] items-center gap-2 self-end rounded-full bg-[var(--ocean-teal)] px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:bg-[var(--ocean-teal-light)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ocean-teal-light)]"
          aria-expanded={isOpen}
          aria-label={isOpen ? "Hide chat assistant" : "Open chat assistant"}
        >
          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[var(--sand)] text-xs font-bold text-[var(--ocean-teal)]">
            {isOpen ? "✕" : "?"}
          </span>
          <span>{isOpen ? "Close" : "Ask about your stay"}</span>
        </button>
      </div>
    </div>
  );
}
