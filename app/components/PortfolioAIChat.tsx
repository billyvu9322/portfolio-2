"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { ArrowUpRight, CornerDownLeft, Sparkles, X } from "lucide-react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import { askPortfolioAI, PortfolioChatError } from "../api/portfolio-chat";
import PortfolioContactForm from "./PortfolioContactForm";

type ChatMessage = {
  id: string;
  role: "assistant" | "user";
  content: string;
};

const ASSISTANT_NAME = "Mochi";
const SUGGESTIONS = ["Summarize Binh for HR", "I want to contact"];
const DEFAULT_CONTACT_DRAFT = "Hi Binh, I would like to discuss a potential opportunity.";
const CONTACT_INTENT = /\bi want to (?:contact|email|message|reach out)\b|\b(?:send|email|message|contact|reach out|talk to)\b[\s\S]*\b(?:binh|you|owner)\b|\b(?:binh|you|owner)\b[\s\S]*\b(?:send|email|message|contact|reach out|talk to)\b|(?:gửi email|gui email|liên hệ|lien he|nhắn tin|nhan tin)/i;
const makeId = () => `${Date.now()}-${Math.random().toString(16).slice(2)}`;

export default function PortfolioAIChat() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [dailyLimitReached, setDailyLimitReached] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [contactDraft, setContactDraft] = useState(DEFAULT_CONTACT_DRAFT);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content:
        "Hi, I’m Mochi. Ask me about Binh’s skills, projects, stack, availability, or role fit.",
    },
  ]);
  const scroller = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const canSend = input.trim().length > 0 && !loading;
  const isLiveAssistant = Boolean(process.env.NEXT_PUBLIC_PORTFOLIO_CHAT_API_URL?.trim());
  const selectedSource = useMemo(() => {
    const last = messages[messages.length - 1]?.content ?? "";
    if (last.includes("Work")) return "Work";
    if (last.includes("Skills")) return "Skills";
    if (last.includes("Contact")) return "Contact";
    return "Profile";
  }, [messages]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    if (!contactOpen) inputRef.current?.focus();
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, contactOpen]);

  useEffect(() => {
    const handleOpenContact = () => {
      setContactDraft(DEFAULT_CONTACT_DRAFT);
      setContactOpen(true);
      setOpen(true);
    };
    window.addEventListener("portfolio-chat:open-contact", handleOpenContact);
    return () =>
      window.removeEventListener("portfolio-chat:open-contact", handleOpenContact);
  }, []);

  useEffect(() => {
    scroller.current?.scrollTo({
      top: scroller.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading]);

  const ask = async (question: string) => {
    const prompt = question.trim();
    if (!prompt || loading) return;
    if (CONTACT_INTENT.test(prompt)) {
      openContact(prompt);
      return;
    }

    const assistantId = makeId();
    setInput("");
    setDailyLimitReached(false);
    setLoading(true);
    setMessages((current) => [
      ...current,
      { id: makeId(), role: "user", content: prompt },
      { id: assistantId, role: "assistant", content: "" },
    ]);

    const updateAssistant = (content: string) => {
      setMessages((current) =>
        current.map((message) =>
          message.id === assistantId ? { ...message, content } : message,
        ),
      );
    };

    try {
      await askPortfolioAI(prompt, updateAssistant);
    } catch (error) {
      const limitReached = error instanceof PortfolioChatError && error.status === 429;
      setDailyLimitReached(limitReached);
      updateAssistant(
        limitReached
          ? "Daily chat limit reached. Please try again tomorrow."
          : error instanceof Error
            ? error.message
            : "AI temporarily unavailable. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void ask(input);
  };

  const openContact = (draft = "") => {
    setContactDraft(draft.trim() || DEFAULT_CONTACT_DRAFT);
    setContactOpen(true);
  };

  return open ? (
    <div className="fixed bottom-22 right-3 z-50 sm:bottom-24 sm:right-6">
      <section
        className={`mb-3 flex w-[min(calc(100vw-1.5rem),28rem)] flex-col rounded-[1.4rem] border border-foreground/10 bg-background/95 shadow-[0_28px_90px_-28px_rgba(0,0,0,0.86)] backdrop-blur-2xl ${contactOpen ? "max-h-[calc(100dvh-6rem)] overflow-y-auto overscroll-contain" : "h-[min(72dvh,36rem)] overflow-hidden"}`}
        data-lenis-prevent={contactOpen ? "true" : undefined}
        data-lenis-prevent-wheel={contactOpen ? "true" : undefined}
        data-lenis-prevent-touch={contactOpen ? "true" : undefined}
        onWheel={(event) => event.stopPropagation()}
        onTouchMove={(event) => event.stopPropagation()}
        role="dialog"
        aria-label={`${ASSISTANT_NAME} portfolio assistant`}
      >
        {contactOpen ? (
          <PortfolioContactForm
            initialMessage={contactDraft}
            onClose={() => setContactOpen(false)}
          />
        ) : (
          <>
            <header className="relative overflow-hidden border-b border-border/60 px-4 py-4">
              <div
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_0%,var(--accent)_0,transparent_32%),linear-gradient(135deg,rgba(255,255,255,0.08),transparent_44%)] opacity-20"
                aria-hidden="true"
              />
              <div className="relative flex items-start justify-between gap-4">
                <div className="flex min-w-0 items-start gap-3">
                  <div className="mt-0.5 size-12 shrink-0 overflow-hidden rounded-2xl border border-accent/35 bg-accent/10">
                    <DotLottieReact
                      src="/icons/SmilingDog.lottie"
                      loop
                      autoplay
                      className="size-full"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="min-w-0">
                    <p className="mb-2 flex items-center gap-2 font-mono text-[0.65rem] uppercase tracking-[0.22em] text-accent">
                      <Sparkles className="size-3.5" aria-hidden="true" />
                      {ASSISTANT_NAME} · {isLiveAssistant ? "Live" : "Preview"} · {selectedSource}
                    </p>
                    <h2 className="text-lg font-black uppercase tracking-tight text-foreground">
                      {ASSISTANT_NAME}, portfolio sidekick
                    </h2>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                      Shiba-powered assistant to explore Binh
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="inline-flex size-9 cursor-pointer shrink-0 items-center justify-center rounded-full text-foreground transition-colors hover:bg-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  aria-label={`Close Chat with ${ASSISTANT_NAME}`}
                  title={`Close Chat with ${ASSISTANT_NAME}`}
                >
                  <X className="size-4" aria-hidden="true" />
                </button>
              </div>
            </header>

            <div
              ref={scroller}
              data-lenis-prevent
              data-lenis-prevent-wheel
              data-lenis-prevent-touch
              onWheel={(event) => event.stopPropagation()}
              onTouchMove={(event) => event.stopPropagation()}
              className="portfolio-ai-scrollbar flex-1 space-y-3 overflow-y-auto overscroll-contain px-4 py-4"
              aria-live="polite"
              aria-label="Conversation"
            >
              {messages
                .filter((message) => message.content)
                .map((message) => (
                  <article
                    key={message.id}
                    className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[88%] whitespace-pre-line rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                        message.role === "user"
                          ? "bg-accent text-accent-foreground"
                          : "border border-border/60 bg-foreground/5 text-foreground"
                      }`}
                    >
                      {message.content}
                    </div>
                  </article>
                ))}
              {(messages.length === 1 || dailyLimitReached) && !loading && (
                <button
                  type="button"
                  onClick={() => openContact("I want to contact Binh")}
                  className="inline-flex min-h-9 items-center gap-1.5 rounded-full border border-accent/40 px-3 py-1.5 text-xs font-semibold text-accent transition-colors hover:bg-accent/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary sm:hidden"
                >
                  I want to contact Binh
                  <ArrowUpRight className="size-3.5" aria-hidden="true" />
                </button>
              )}
              {loading && (
                <div className="flex justify-start">
                  <div className="inline-flex items-center px-4 py-1 text-sm text-muted-foreground">
                    <span className="portfolio-ai-thinking-dots" aria-hidden="true">
                      <span className="portfolio-ai-thinking-dot" />
                      <span className="portfolio-ai-thinking-dot" />
                      <span className="portfolio-ai-thinking-dot" />
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-border/60 px-4 py-4">
              <div className="mb-3 hidden flex-wrap gap-2 overflow-x-auto pb-1 scrollbar-none sm:flex">
                {SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => ask(suggestion)}
                    disabled={loading}
                    className="shrink-0 rounded-full border border-accent/25 bg-accent/8 px-3 py-2 font-mono text-[0.65rem] uppercase tracking-wide text-foreground transition-colors hover:border-accent/60 hover:bg-accent/14 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-55"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
              <form onSubmit={handleSubmit} className="flex items-center gap-2">
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder={dailyLimitReached ? "Daily limit reached" : "Ask about skills, stack, fit…"}
                  disabled={dailyLimitReached}
                  className="min-h-12 min-w-0 flex-1 rounded-full border border-border/70 bg-background/80 px-4 text-[16px] text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-accent disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm"
                  aria-label="Ask AI about Binh"
                />
                <button
                  type="submit"
                  disabled={!canSend || dailyLimitReached}
                  className="inline-flex size-12 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform hover:scale-105 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-45 disabled:hover:scale-100"
                  aria-label="Send question"
                >
                  <CornerDownLeft className="size-4" aria-hidden="true" />
                </button>
              </form>
            </div>
          </>
        )}
      </section>
    </div>
  ) : (
    <div className="fixed bottom-22 right-0 z-50 sm:bottom-24 sm:right-0">
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="cursor-pointer"
        aria-label="Open AI portfolio chat"
        aria-expanded={open}
      >
        <DotLottieReact
          src="/icons/FlirtingDog.lottie"
          loop
          autoplay
          className="size-20 sm:size-25"
          aria-hidden="true"
        />
      </button>
    </div>
  );
}
