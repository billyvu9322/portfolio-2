"use client";

import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import { nav as LINKS } from "../lib/content";

export default function Nav() {
  const [active, setActive] = useState("home");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const sections = LINKS.map((l) => document.getElementById(l.id)).filter(
      Boolean
    ) as HTMLElement[];
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: "-45% 0px -55% 0px" }
    );
    sections.forEach((s) => obs.observe(s));
    return () => obs.disconnect();
  }, []);

  return (
    <nav
      aria-label="Main navigation"
      className="fixed top-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-500"
    >
      <div className="bg-background/80 backdrop-blur-md border border-foreground/10 transition-all duration-500 overflow-hidden shadow-lg min-w-[280px] h-11 rounded-full">
        <div className="flex justify-between items-center px-4 h-11 gap-4">
          <div className="flex items-center gap-1 overflow-hidden">
            {LINKS.map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() =>
                  document
                    .getElementById(l.id)
                    ?.scrollIntoView({ behavior: "smooth" })
                }
                className={`hidden sm:inline-flex items-center min-h-11 px-3 py-2 text-xs font-semibold uppercase tracking-wide rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                  active === l.id
                    ? "text-accent bg-accent/10"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {l.label}
              </button>
            ))}
            <span className="font-bold text-sm tracking-widest uppercase sm:hidden text-accent">
              {LINKS.find((l) => l.id === active)?.label ?? "Home"}
            </span>
          </div>
          <button
            onClick={() => setOpen((v) => !v)}
            className="inline-flex items-center justify-center min-h-11 min-w-11 p-2 hover:bg-foreground/5 rounded-full transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:hidden"
            aria-label="Open menu"
            aria-expanded={open}
          >
            <Menu className="size-4.5" aria-hidden="true" />
          </button>
        </div>
        <div
          className={`flex flex-col gap-3 sm:hidden transition-opacity duration-300 ${
            open
              ? "opacity-100 h-auto p-4"
              : "opacity-0 h-0 overflow-hidden p-0 pointer-events-none"
          }`}
          aria-hidden={!open}
        >
          {LINKS.map((l) => (
            <a
              key={l.id}
              href={`#${l.id}`}
              onClick={() => setOpen(false)}
              className={`duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-xl active:scale-[0.97] text-lg font-bold uppercase block min-h-11 py-2 transition-colors text-left ${
                active === l.id ? "text-accent" : "hover:text-primary"
              }`}
              aria-label={`Navigate to ${l.label} section`}
            >
              {l.label}
            </a>
          ))}
        </div>
      </div>
    </nav>
  );
}
