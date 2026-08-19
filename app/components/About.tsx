"use client";

export default function About() {
  return (
    <section
      id="about"
      className="relative py-24 md:py-32 px-4 md:px-12 lg:px-20 overflow-hidden"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04] dark:opacity-[0.06]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(-12deg, var(--accent) 0, var(--accent) 1px, transparent 1px, transparent 48px)",
        }}
        aria-hidden="true"
      />
      <div className="max-w-6xl mx-auto relative z-10">
        <header
          className="mb-16 md:mb-20 pb-12 border-b border-border/30 "
          data-reveal
        >
          <div className="flex items-start gap-4 md:gap-6 mb-6 md:mb-8">
            <div
              className="h-1 w-12 md:w-24 bg-accent origin-left shrink-0 mt-3 md:mt-4"
              aria-hidden="true"
              data-reveal-bar
            />
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-foreground text-balance">
              <span className="text-accent">A</span>bout
            </h2>
          </div>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl text-pretty">
            Engineer &amp; builder
          </p>
        </header>
        <div className="grid lg:grid-cols-[1.15fr_0.85fr] gap-12 lg:gap-20 items-start">
          <div data-reveal>
            <p className="text-xl md:text-2xl lg:text-[1.65rem] leading-relaxed text-foreground font-medium max-w-2xl text-pretty">
              Anthony MAHEFA (Hydra) is a fullstack and DevOps engineer based in
              Antananarivo, Madagascar. I ship React and Next.js products with
              motion and 3D when it serves the story — and reliable CI/CD when it
              serves the business.
            </p>
          </div>
          <aside
            className="rounded-2xl border border-accent/25 bg-accent/8 p-6 md:p-8"
            data-reveal-x
          >
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent mb-4">
              Proof
            </p>
            <p className="text-base md:text-lg font-semibold leading-relaxed text-foreground text-pretty">
              Webcup MG Winner 2024 · Webcup Finalist 2025 · M.S. Software
              Engineering, ENI Fianarantsoa
            </p>
          </aside>
        </div>
        <ul className="mt-20 md:mt-28 space-y-0 divide-y divide-border/60">
          {[
            {
              h: "Fullstack Engineering",
              p: "End-to-end web apps — React, Next.js, TypeScript, APIs, and deployment.",
            },
            {
              h: "Software Craftsmanship",
              p: "Clean, tested, maintainable code with attention to UX and performance.",
            },
            {
              h: "DevOps & Automation",
              p: "Docker, Kubernetes, pipelines, and infrastructure that keeps shipping calm.",
            },
          ].map((row) => (
            <li
              key={row.h}
              className="grid md:grid-cols-[minmax(0,240px)_1fr] gap-3 md:gap-10 py-8 md:py-10 first:pt-0"
              data-reveal
            >
              <h3 className="text-xl md:text-2xl font-black uppercase tracking-tight text-foreground">
                {row.h}
              </h3>
              <p className="text-muted-foreground text-base md:text-lg leading-relaxed text-pretty">
                {row.p}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
