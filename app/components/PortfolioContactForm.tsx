"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import { ArrowLeft, Check, SendHorizonal, X } from "lucide-react";
import { sendPortfolioContact } from "../api/portfolio-contact";

type TurnstileWidget = {
  render: (
    container: HTMLElement,
    options: {
      sitekey: string;
      callback: (token: string) => void;
      "expired-callback": () => void;
      "error-callback": () => void;
    },
  ) => string;
  reset: (widgetId?: string) => void;
};

declare global {
  interface Window {
    turnstile?: TurnstileWidget;
  }
}

type PortfolioContactFormProps = {
  initialMessage: string;
  onClose: () => void;
};

const TURNSTILE_SCRIPT =
  "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
const DEFAULT_MESSAGE =
  "Hi Binh, I would like to discuss a potential opportunity.";

export default function PortfolioContactForm({
  initialMessage,
  onClose,
}: PortfolioContactFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(initialMessage || DEFAULT_MESSAGE);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [website, setWebsite] = useState("");
  const [status, setStatus] = useState<
    "idle" | "sending" | "success" | "error"
  >("idle");
  const [error, setError] = useState("");
  const widgetContainer = useRef<HTMLDivElement>(null);
  const widgetId = useRef<string | undefined>(undefined);
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY?.trim();

  useEffect(() => {
    if (!siteKey || !widgetContainer.current) return;

    const render = () => {
      if (!widgetContainer.current || !window.turnstile || widgetId.current)
        return;
      widgetId.current = window.turnstile.render(widgetContainer.current, {
        sitekey: siteKey,
        callback: (token) => setTurnstileToken(token),
        "expired-callback": () => setTurnstileToken(""),
        "error-callback": () => {
          setTurnstileToken("");
          setError("Contact verification failed. Please try again.");
        },
      });
    };

    if (window.turnstile) {
      render();
      return;
    }

    const existingScript = document.querySelector<HTMLScriptElement>(
      `script[src^="${TURNSTILE_SCRIPT}"]`,
    );
    if (existingScript) {
      existingScript.addEventListener("load", render);
      return () => existingScript.removeEventListener("load", render);
    }

    const script = document.createElement("script");
    script.src = TURNSTILE_SCRIPT;
    script.async = true;
    script.defer = true;
    script.addEventListener("load", render);
    document.head.appendChild(script);
    return () => script.removeEventListener("load", render);
  }, [siteKey]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (status === "sending") return;
    setError("");

    if (!siteKey || !turnstileToken) {
      setStatus("error");
      setError(
        siteKey
          ? "Complete contact verification before sending."
          : "Contact verification is not configured.",
      );
      return;
    }

    setStatus("sending");
    try {
      await sendPortfolioContact({
        name,
        email,
        message,
        turnstileToken,
        website,
      });
      setStatus("success");
    } catch (requestError) {
      setStatus("error");
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Unable to send message right now. Please try again.",
      );
      if (widgetId.current && window.turnstile)
        window.turnstile.reset(widgetId.current);
      setTurnstileToken("");
    }
  };

  if (status === "success") {
    return (
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-5 py-8 text-center">
        <div className="inline-flex size-14 items-center justify-center rounded-full bg-accent/15 text-accent">
          <Check className="size-7" aria-hidden="true" />
        </div>
        <h3 className="mt-5 text-xl font-black uppercase tracking-tight">
          Message sent
        </h3>
        <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
          Thanks. Your message reached Binh. They can reply directly to your
          email.
        </p>
        <button
          type="button"
          onClick={onClose}
          className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-5 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          Close
          <X className="size-4" aria-hidden="true" />
        </button>
      </div>
    );
  }

  return (
    <div
      className="flex flex-col overscroll-contain px-4 py-4"
      data-lenis-prevent
      data-lenis-prevent-wheel
      data-lenis-prevent-touch
      onWheel={(event) => event.stopPropagation()}
      onTouchMove={(event) => event.stopPropagation()}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <p className="font-mono text-[0.65rem] uppercase tracking-[0.2em] text-accent">
            Contact Binh
          </p>
          <h3 className="mt-1 text-lg font-black uppercase tracking-tight">
            Review your message
          </h3>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex size-9 shrink-0 items-center justify-center rounded-full text-foreground transition-colors hover:bg-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-label="Close contact form"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      </div>
      <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
        Mochi will not send anything until you review this draft and click Send
        message.
      </p>

      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label
            htmlFor="contact-name"
            className="mb-1.5 block font-mono text-[0.65rem] uppercase tracking-wide text-muted-foreground"
          >
            Name
          </label>
          <input
            placeholder="Enter name"
            id="contact-name"
            required
            maxLength={100}
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="min-h-11 w-full rounded-xl border border-border/70 bg-background/80 px-3 text-[16px] text-foreground outline-none focus:border-accent sm:text-sm"
            autoComplete="name"
          />
        </div>
        <div>
          <label
            htmlFor="contact-email"
            className="mb-1.5 block font-mono text-[0.65rem] uppercase tracking-wide text-muted-foreground"
          >
            Email
          </label>
          <input
            placeholder="Enter email"
            id="contact-email"
            required
            type="email"
            maxLength={254}
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            className="min-h-11 w-full rounded-xl border border-border/70 bg-background/80 px-3 text-[16px] text-foreground outline-none focus:border-accent sm:text-sm"
            autoComplete="email"
          />
        </div>
        <div>
          <label
            htmlFor="contact-message"
            className="mb-1.5 block font-mono text-[0.65rem] uppercase tracking-wide text-muted-foreground"
          >
            Message
          </label>
          <textarea
            placeholder="Enter message"
            id="contact-message"
            required
            maxLength={4000}
            rows={5}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            className="w-full resize-y rounded-xl border border-border/70 bg-background/80 px-3 py-3 text-[16px] leading-relaxed text-foreground outline-none focus:border-accent sm:text-sm"
          />
        </div>
        <div className="absolute -left-[10000px] h-px w-px overflow-hidden">
          <label
            htmlFor="contact-website"
            className="absolute -left-[10000px] h-px w-px overflow-hidden"
          >
            Website
          </label>
          <input
            id="contact-website"
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(event) => setWebsite(event.target.value)}
            aria-hidden="true"
          />
          <div
            ref={widgetContainer}
            className="min-h-[65px]"
            aria-label="Contact verification"
          />
        </div>
        {error && (
          <p
            className="rounded-xl border border-destructive/30 bg-destructive/8 px-3 py-2 text-sm text-destructive"
            role="alert"
          >
            {error}
          </p>
        )}
        <div className="flex items-center justify-between gap-3 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border px-4 text-sm font-semibold transition-colors hover:border-accent hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            Back
          </button>
          <button
            type="submit"
            disabled={status === "sending"}
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground transition-transform hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50"
          >
            {status === "sending" ? "Sending…" : "Send"}
            <SendHorizonal className="size-4" aria-hidden="true" />
          </button>
        </div>
      </form>
    </div>
  );
}
