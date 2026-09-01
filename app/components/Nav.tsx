"use client";

import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { nav as LINKS } from "../lib/content";

export default function Nav() {
  const [active, setActive] = useState("home");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const sections = LINKS.filter((x) => !x.disabled)
      .map((l) => document.getElementById(l.id))
      .filter(Boolean) as HTMLElement[];

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-45% 0px -55% 0px" },
    );

    sections.forEach((s) => obs.observe(s));
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open]);

  const navigateTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
    setOpen(false);
  };

  return (
    <nav
      aria-label="Main navigation"
      className="fixed top-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-500"
    >
      <div className="hidden sm:block bg-background/80 backdrop-blur-md border border-foreground/10 transition-all duration-500 overflow-hidden shadow-lg min-w-70 h-11 rounded-full">
        <div className="flex justify-between items-center px-4 h-11 gap-4">
          <div className="flex items-center gap-1 overflow-hidden">
            {LINKS.filter((x) => !x.disabled).map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() => navigateTo(l.id)}
                className={`inline-flex items-center min-h-11 px-3 py-2 text-xs font-semibold uppercase tracking-wide rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  active === l.id
                    ? "text-accent bg-accent/10"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {l.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="sm:hidden">
        {!open && (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex h-11 min-w-44 items-center justify-between gap-4 rounded-full border border-foreground/10 bg-background/80 px-4 font-bold text-sm uppercase tracking-widest text-accent shadow-lg backdrop-blur-md transition-colors hover:bg-background/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            aria-label="Open menu"
            aria-expanded={open}
          >
            <span>{LINKS.find((l) => l.id === active)?.label ?? "Home"}</span>
            <Menu className="size-4.5" aria-hidden="true" />
          </button>
        )}

        {open && (
          <div
            className="w-[min(calc(100vw-4rem),17rem)] overflow-hidden rounded-[1.15rem] border border-foreground/10 bg-background/92 shadow-[0_24px_80px_-32px_rgba(0,0,0,0.9)] backdrop-blur-xl"
            role="dialog"
            aria-modal="true"
            aria-label="Mobile navigation"
          >
            <div className="flex items-center justify-between px-4 py-3">
              <span className="font-mono text-xs font-bold uppercase tracking-[0.2em] text-accent">
                Menu
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex size-10 items-center justify-center rounded-full text-foreground transition-colors hover:bg-foreground/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                aria-label="Close menu"
              >
                <X className="size-4.5" aria-hidden="true" />
              </button>
            </div>
            <div className="px-4 pb-5 pt-2">
              {LINKS.map((l) => (
                <button
                  key={l.id}
                  type="button"
                  onClick={() => navigateTo(l.id)}
                  className={`block min-h-12 w-full rounded-xl py-2 text-left text-lg font-black uppercase tracking-tight transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                    active === l.id
                      ? "text-accent"
                      : "text-foreground hover:text-accent"
                  }`}
                  aria-label={`Navigate to ${l.label} section`}
                >
                  {l.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
