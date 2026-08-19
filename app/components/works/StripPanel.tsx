"use client";

import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import type { Project } from "../../lib/data";

/** Shared inner panel (media + content) used by both list and gallery layouts. */
export default function StripPanel({
  p,
  active = false,
}: {
  p: Project;
  active?: boolean;
}) {
  return (
    <div
      className="project-strip-panel relative flex h-full w-full overflow-hidden rounded-2xl md:rounded-3xl border border-border/50 backdrop-blur-sm flex-col md:flex-row items-stretch bg-background/80"
      data-active={active ? "true" : "false"}
    >
      <div
        className="project-strip-media relative z-10 flex items-center justify-center overflow-hidden bg-muted/30 order-1 md:order-none flex-1 min-h-[300px] md:min-h-0 rounded-t-2xl md:rounded-l-2xl md:rounded-r-none py-8 md:py-10 px-6"
        data-in-view="false"
        data-active={active ? "true" : "false"}
        data-layout="stack"
      >
        <div
          className="project-strip-device-shell pointer-events-none absolute inset-0"
          aria-hidden="true"
        />
        <div
          className="project-strip-device relative shrink-0 overflow-hidden rounded-[1.35rem] border border-border/70 bg-background shadow-[0_28px_56px_-20px_rgba(0,0,0,0.55)] w-[min(220px,52vw)] md:h-[min(100%,560px)] md:w-auto md:max-w-[min(38%,260px)] "
          style={{ aspectRatio: "363 / 784" }}
        >
          <div
            className="project-strip-device-notch absolute top-0 inset-x-0 z-10 h-6 bg-linear-to-b from-black/25 to-transparent pointer-events-none"
            aria-hidden="true"
          />
          <Image
            alt={p.imageAlt}
            fill
            className="object-cover object-top"
            sizes="(max-width: 768px) 52vw, 260px"
            src={p.image}
          />
        </div>
      </div>
      <div className="project-strip-content relative z-10 flex flex-col justify-center p-6 md:p-10 lg:p-12 order-2 md:order-none md:w-[45%] md:min-w-[300px] md:flex-1">
        <div className="space-y-4 md:space-y-5">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent mb-2">
              {p.year} · {p.tagline}
            </p>
            <h3 className="text-[clamp(1.75rem,4vw,3rem)] font-black uppercase tracking-tighter leading-[0.95] text-balance">
              {p.title}
            </h3>
          </div>
          <p className="text-base md:text-lg text-muted-foreground leading-relaxed max-w-md text-pretty line-clamp-4 md:line-clamp-none">
            {p.description}
          </p>
          <ul className="flex flex-wrap gap-2" aria-label="Technologies used">
            {p.tags.map((t) => (
              <li
                key={t}
                className="works-tag px-2.5 py-1 rounded-md border border-accent/25 bg-accent/8 font-mono text-xs uppercase tracking-wide text-foreground"
              >
                {t}
              </li>
            ))}
          </ul>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-3 pt-1 group">
            <a
              className="inline-flex items-center gap-2 min-h-11 px-5 py-2.5 bg-primary text-primary-foreground rounded-md text-sm font-semibold uppercase tracking-wide hover:opacity-90 transition-[opacity,transform] duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              href={p.caseStudy}
            >
              Case study
              <ArrowUpRight className="works-cta-arrow size-4" aria-hidden="true" />
            </a>
            <a
              href={p.liveSite}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 min-h-11 text-sm font-mono uppercase tracking-wide text-muted-foreground hover:text-accent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
            >
              Live site
              <ArrowUpRight
                className="works-cta-arrow size-3.5"
                aria-hidden="true"
              />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
