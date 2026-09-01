"use client";

import { skills } from "../lib/content";

export default function Skills() {
  return (
    <section
      id="skills"
      className="relative py-24 md:py-32 px-4 md:px-12 lg:px-20 overflow-hidden"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04] dark:opacity-[0.06]"
        style={{
          backgroundImage:
            "linear-gradient(90deg, var(--accent) 1px, transparent 1px), linear-gradient(180deg, var(--accent) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-x-4 top-16 h-px bg-linear-to-r from-transparent via-accent/60 to-transparent"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute right-0 top-1/4 h-72 w-72 rounded-full bg-accent/10 blur-3xl"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto max-w-6xl">
        <header
          className="mb-16 md:mb-20 pb-12 border-b border-border/30"
          data-reveal
        >
          <div className="flex items-start gap-4 md:gap-6 mb-8 md:mb-10">
            <div
              className="h-1 w-12 md:w-24 bg-accent origin-left shrink-0 mt-3 md:mt-4"
              aria-hidden="true"
              data-reveal-bar
            />
            <div>
              <p className="mb-4 font-mono text-xs uppercase tracking-[0.2em] text-accent">
                {skills.subheading}
              </p>
              <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-foreground text-balance">
                <span className="text-accent">{skills.heading.charAt(0)}</span>
                {skills.heading.slice(1)}
              </h2>
            </div>
          </div>
          <div className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
            <p className="text-xl md:text-2xl font-semibold leading-relaxed text-foreground text-pretty">
              {skills.intro}
            </p>
            <p className="text-base md:text-lg leading-relaxed text-muted-foreground text-pretty">
              {skills.positioning}
            </p>
          </div>
        </header>

        <div className="grid gap-4 md:grid-cols-3">
          {skills.matrix.map((group, index) => (
            <article
              key={group.title}
              className="group relative overflow-hidden rounded-3xl border border-border/50 bg-background/70 p-5 md:p-6 backdrop-blur-sm transition-colors duration-300 hover:border-accent/45"
              data-reveal
            >
              <div
                className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-accent/50 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                aria-hidden="true"
              />
              <span className="font-mono text-xs text-accent/80">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-4 text-lg md:text-xl font-black uppercase leading-tight tracking-tight text-foreground">
                {group.title}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground text-pretty">
                {group.description}
              </p>
              <ul className="mt-6 flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <li
                    key={item}
                    className="rounded-full border border-accent/20 bg-accent/8 px-3 py-1.5 font-mono text-[0.7rem] uppercase tracking-wide text-foreground"
                  >
                    {item}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>

        <div
          className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4"
          data-reveal
        >
          {skills.workingStyle.map((item) => (
            <article
              key={item.label}
              className="rounded-2xl border border-border/45 bg-background/60 p-4 backdrop-blur-sm"
            >
              <p className="font-mono text-xs uppercase tracking-[0.16em] text-accent">
                {item.label}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {item.detail}
              </p>
            </article>
          ))}
        </div>

        {/* <p
          className="mt-6 rounded-2xl border border-border/50 bg-muted/20 p-4 font-mono text-xs uppercase leading-relaxed tracking-wide text-muted-foreground"
          data-reveal
        >
          {skills.availability}
        </p> */}
      </div>
    </section>
  );
}
