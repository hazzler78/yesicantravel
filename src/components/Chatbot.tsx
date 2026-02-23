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
        "Hi, I’m your Yes I Can Travel assistant. Ask me anything about safer solo stays, bookings, or how this site works.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString() ? `?${searchParams.toString()}` : "";
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    if (!containerRef.current) return;
    containerRef.current.scrollTop = containerRef.current.scrollHeight;
  }, [messages, isOpen]);

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
          messages: [
            {
              role: "system",
              content:
                "You are the Yes I Can Travel website assistant. Be calm, reassuring, and practical. Always prioritise women’s safety, clarity, and a sense of control. Do not make medical, legal, or emergency safety guarantees. If someone is in immediate danger, tell them to contact local emergency services. Keep every reply SHORT: 1–3 sentences max. No intros, no long lists, no repetition. Get to the point.",
            },
            {
              role: "system",
              content: `The visitor is currently on the path: "${pathname}". Use this to infer what they are trying to do (homepage, results, hotel details, checkout, confirmation). When they are on a hotel page, hotel-specific context will be provided separately—answer using that data for questions about that hotel.`,
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
    } catch (error) {
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

  return (
    <div className="fixed bottom-4 right-4 z-40">
      {isOpen && (
        <div className="mb-3 w-80 max-w-[90vw] rounded-2xl border border-[color:var(--navy-light)] bg-[color:var(--sand)] shadow-xl shadow-[color:var(--navy)/0.15]">
          <div className="flex items-center justify-between rounded-t-2xl bg-[color:var(--navy)] px-4 py-3 text-sm text-white">
            <div className="flex flex-col">
              <span className="font-semibold">Yes I Can Travel</span>
              <span className="text-xs text-[color:var(--sand)]">
                Safer solo stays assistant
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-full p-1 text-xs hover:bg-[color:var(--navy-light)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ocean-teal)]"
              aria-label="Close chat"
            >
              ✕
            </button>
          </div>
          <div
            ref={containerRef}
            className="max-h-80 space-y-3 overflow-y-auto px-4 py-3 text-sm"
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
                      ? "max-w-[80%] bg-[color:var(--ocean-teal)] text-white"
                      : "max-w-[85%] bg-white text-[color:var(--foreground)]"
                  }`}
                >
                  {message.role === "assistant" ? (
                    <div className="chat-markdown max-w-none whitespace-pre-line text-sm leading-snug [&_p]:my-1 [&_strong]:font-semibold [&_a]:text-[color:var(--ocean-teal)] [&_a]:underline">
                      <ReactMarkdown
                        components={{
                          p: ({ children }) => <p className="my-1">{children}</p>,
                          strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
                          a: ({ href, children }) => (
                            <a href={href} target="_blank" rel="noopener noreferrer" className="text-[color:var(--ocean-teal)] underline">
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
                <div className="rounded-2xl bg-white px-3 py-2 text-xs text-[color:var(--foreground)]/70">
                  Thinking…
                </div>
              </div>
            )}
          </div>
          <form
            onSubmit={handleSubmit}
            className="border-t border-[color:var(--sand)] bg-[color:var(--background)] px-3 py-2"
          >
            <div className="flex items-end gap-2">
              <label className="sr-only" htmlFor="chat-input">
                Ask a question
              </label>
              <textarea
                id="chat-input"
                value={input}
                onChange={(event) => setInput(event.target.value)}
                rows={1}
                className="max-h-24 min-h-[2.5rem] flex-1 resize-none rounded-lg border border-[color:var(--sand)] bg-white px-2.5 py-1.5 text-sm text-[color:var(--foreground)] shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ocean-teal)]"
                placeholder="Ask about safety, bookings, or a page you’re on…"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                className="inline-flex items-center justify-center rounded-full bg-[color:var(--ocean-teal)] px-3 py-2 text-xs font-semibold text-white shadow-sm transition hover:bg-[color:var(--ocean-teal-light)] disabled:cursor-not-allowed disabled:bg-[color:var(--ocean-teal)]/60"
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
        className="flex items-center gap-2 rounded-full bg-[color:var(--ocean-teal)] px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-[color:var(--navy)/0.25] transition hover:bg-[color:var(--ocean-teal-light)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--ocean-teal-light)]"
        aria-label={isOpen ? "Hide chat assistant" : "Open chat assistant"}
      >
        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-[color:var(--sand)] text-xs font-bold text-[color:var(--ocean-teal)]">
          ?
        </span>
        <span>Ask about your stay</span>
      </button>
    </div>
  );
}

