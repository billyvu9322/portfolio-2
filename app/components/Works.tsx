"use client";

import { useEffect, useLayoutEffect, useRef, useState, type MouseEvent } from "react";
import Image from "next/image";
import { ArrowUpRight, Rows3, LayoutGrid } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { works, projects, archive } from "../lib/content";
import StripPanel from "./works/StripPanel";
import WorksGallery from "./works/WorksGallery";

type View = "list" | "gallery";

export default function Works() {
  const root = useRef<HTMLElement>(null);

  const openContactForm = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    window.dispatchEvent(new Event("portfolio-chat:open-contact"));
  };
  const [view, setView] = useState<View>("list");
  const [canGallery, setCanGallery] = useState(true);

  // toggle sliding indicator
  const listBtn = useRef<HTMLButtonElement>(null);
  const galleryBtn = useRef<HTMLButtonElement>(null);
  const indicator = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const mobile = window.matchMedia("(max-width: 767px)").matches;
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (mobile || reduced) {
      setCanGallery(false);
      setView("list");
    }
  }, []);

  useLayoutEffect(() => {
    const btn = view === "list" ? listBtn.current : galleryBtn.current;
    const ind = indicator.current;
    if (!btn || !ind) return;
    ind.style.width = `${btn.offsetWidth}px`;
    ind.style.transform = `translateX(${btn.offsetLeft}px)`;
  }, [view, canGallery]);

  // list-mode reveals
  useEffect(() => {
    if (view !== "list" || !root.current) return;
    const scope = root.current;
    const media = Array.from(
      scope.querySelectorAll<HTMLElement>(
        ".works-view-swap .project-strip-media",
      ),
    );
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting)
            (e.target as HTMLElement).dataset.inView = "true";
        });
      },
      { threshold: 0.35 },
    );
    media.forEach((m) => io.observe(m));

    const ctx = gsap.context(() => {
      scope
        .querySelectorAll(".works-view-swap .project-strip")
        .forEach((strip) => {
          const shell = strip.querySelector(".project-strip-device-shell");
          const device = strip.querySelector(".project-strip-device");
          const content = strip.querySelector(".project-strip-content");
          const tags = strip.querySelectorAll(".works-tag");
          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: strip,
              start: "top 84%",
              toggleActions: "play none none reverse",
            },
          });
          if (shell)
            tl.fromTo(
              shell,
              { opacity: 0 },
              { opacity: 1, duration: 0.55, ease: "expo.out" },
              0,
            );
          if (device)
            tl.fromTo(
              device,
              { clipPath: "inset(12% 12% 12% 12% round 1.35rem)", scale: 0.92 },
              {
                clipPath: "inset(0% 0% 0% 0% round 1.35rem)",
                scale: 1,
                duration: 0.55,
                ease: "expo.out",
              },
              0.04,
            );
          if (content)
            tl.fromTo(
              content,
              { x: -20 },
              { x: 0, duration: 0.55, ease: "expo.out" },
              0.14,
            );
          if (tags.length)
            tl.fromTo(
              tags,
              { opacity: 0.6, y: 8 },
              {
                opacity: 1,
                y: 0,
                duration: 0.35,
                stagger: 0.05,
                ease: "expo.out",
              },
              0.24,
            );
        });
    }, scope);

    return () => {
      io.disconnect();
      ctx.revert();
    };
  }, [view]);

  // archive + intro reveals (always)
  useEffect(() => {
    if (!root.current) return;
    const scope = root.current;
    const ctx = gsap.context(() => {
      const intro = scope.querySelector(".works-intro");
      if (intro)
        gsap.fromTo(
          intro,
          { clipPath: "inset(0 0 100% 0)" },
          {
            clipPath: "inset(0 0 0% 0)",
            duration: 0.55,
            ease: "expo.out",
            scrollTrigger: {
              trigger: intro,
              start: "top 90%",
              toggleActions: "play none none reverse",
            },
          },
        );
      const archiveEl = scope.querySelector("#works-archive");
      const heading = scope.querySelector(".works-archive-heading");
      if (heading && archiveEl)
        gsap.fromTo(
          heading,
          { opacity: 0.6, x: -12 },
          {
            opacity: 1,
            x: 0,
            duration: 0.35,
            ease: "expo.out",
            scrollTrigger: { trigger: archiveEl, start: "top 88%" },
          },
        );
      const items = scope.querySelectorAll(".works-archive-item");
      if (items.length && archiveEl)
        gsap.fromTo(
          items,
          { opacity: 0.7, x: -20 },
          {
            opacity: 1,
            x: 0,
            duration: 0.35,
            ease: "expo.out",
            stagger: { each: 0.05 },
            scrollTrigger: { trigger: archiveEl, start: "top 84%" },
          },
        );
    }, scope);
    return () => ctx.revert();
  }, []);

  const switchView = (v: View) => {
    if (v === "gallery" && !canGallery) return;
    setView(v);
    requestAnimationFrame(() => ScrollTrigger.refresh());
  };

  return (
    <section
      ref={root}
      id="work"
      className="relative py-24 md:py-32 px-4 md:px-8 lg:px-20 overflow-hidden"
    >
      <div className="max-w-7xl mx-auto relative z-10">
        <header
          className="mb-16 md:mb-20 pb-12 border-b border-border/30 "
          data-reveal
        >
          <div className="flex items-start gap-4 md:gap-6 mb-6 md:mb-8">
            <div
              className="h-1 w-12 md:w-24 bg-accent origin-left shrink-0 mt-3 md:mt-4"
              aria-hidden="true"
            />
            <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-foreground text-balance">
              <span className="text-accent">{works.heading.charAt(0)}</span>
              {works.heading.slice(1)}
            </h2>
          </div>
          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl text-pretty">
            {works.subheading}
          </p>
        </header>

        <p className="works-intro text-lg md:text-xl text-muted-foreground leading-relaxed max-w-2xl mb-12 md:mb-16 text-pretty">
          {works.intro}
        </p>

        {canGallery && (
          <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground max-w-xs text-pretty">
              {view === "list"
                ? works.galleryHint
                : "Scroll to move through projects — or use ← → keys."}
            </p>
            <div
              className="relative inline-flex items-center gap-1 rounded-lg border border-border/60 bg-background/60 p-1 self-start sm:self-auto"
              role="tablist"
              aria-label="Works view"
            >
              <span
                ref={indicator}
                className="works-tab-indicator absolute top-1 bottom-1 left-0 rounded-md bg-primary z-0 pointer-events-none"
                aria-hidden="true"
              />
              <button
                ref={listBtn}
                type="button"
                role="tab"
                aria-selected={view === "list"}
                onClick={() => switchView("list")}
                className={`relative z-10 inline-flex items-center gap-2 min-h-11 px-4 py-2 rounded-md text-sm font-semibold uppercase tracking-wide transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.98] ${
                  view === "list"
                    ? "text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Rows3 className="size-4" aria-hidden="true" />
                Quick scan
              </button>
              <button
                ref={galleryBtn}
                type="button"
                role="tab"
                aria-selected={view === "gallery"}
                onClick={() => switchView("gallery")}
                className={`relative z-10 inline-flex items-center gap-2 min-h-11 px-4 py-2 rounded-md text-sm font-semibold uppercase tracking-wide transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring active:scale-[0.98] ${
                  view === "gallery"
                    ? "text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <LayoutGrid className="size-4" aria-hidden="true" />
                Gallery
              </button>
            </div>
          </div>
        )}

        {view === "gallery" ? (
          <WorksGallery />
        ) : (
          <div className="flex flex-col gap-10 md:gap-14 works-view-swap">
            {projects.map((p) => (
              <article
                key={p.title}
                className="project-strip relative flex shrink-0 w-full min-h-0 px-4 md:px-8 lg:px-4 py-8 md:py-10 "
              >
                <StripPanel p={p} />
              </article>
            ))}
          </div>
        )}

        {/* Archive */}
        {archive?.length ? (
          <div id="works-archive" className="mt-24 md:mt-32 scroll-mt-28">
            <h3 className="works-archive-heading text-sm font-mono uppercase tracking-widest text-muted-foreground mb-2">
              {works.archiveHeading}
            </h3>
            <p className="text-muted-foreground text-base mb-8 max-w-xl text-pretty">
              {works.archiveIntro}
            </p>
            <ul>
              {archive?.map((a, i) => (
                <li
                  key={a.title}
                  className="works-archive-item group border-b border-border/40 last:border-b-0"
                  style={{ ["--i" as string]: String(i) }}
                >
                  <div className="relative flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 py-6 md:py-7 transition-colors duration-200 group-hover:bg-muted/30 group-focus-within:bg-muted/30 -mx-3 px-3 rounded-lg">
                    <span
                      className="works-archive-line absolute bottom-0 left-3 right-3 h-px bg-accent pointer-events-none"
                      aria-hidden="true"
                    />
                    <div className="flex items-start sm:items-center gap-4 min-w-0 flex-1">
                      <div className="works-archive-thumb relative size-14 shrink-0 overflow-hidden rounded-md border border-border/50 bg-muted">
                        <Image
                          alt=""
                          fill
                          className="object-cover object-top"
                          sizes="56px"
                          src={a.image}
                        />
                      </div>
                      <div className="min-w-0">
                        <a
                          className="font-black text-lg md:text-xl uppercase tracking-tight text-foreground hover:text-accent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm text-balance"
                          href={a.caseStudy}
                        >
                          {a.title}
                        </a>
                        <p className="mt-1 text-sm text-muted-foreground">
                          {a.year} · {a.tagline}
                        </p>
                        <p className="mt-2 font-mono text-xs uppercase tracking-wide text-muted-foreground">
                          {a.stack}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center gap-4 shrink-0 sm:pl-0 pl-[4.5rem]">
                      <a
                        className="inline-flex items-center gap-1 text-sm font-mono uppercase tracking-wide text-muted-foreground hover:text-accent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm min-h-11"
                        href={a.caseStudy}
                      >
                        Case study
                        <ArrowUpRight
                          className="works-cta-arrow size-4"
                          aria-hidden="true"
                        />
                      </a>
                      <a
                        href={a.liveSite}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-sm font-mono uppercase tracking-wide text-muted-foreground hover:text-accent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm min-h-11"
                      >
                        Live site
                        <ArrowUpRight
                          className="works-cta-arrow size-4"
                          aria-hidden="true"
                        />
                      </a>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <></>
        )}

        <div className="mt-20 text-center">
          <a
            href={works.cta.href}
            onClick={openContactForm}
            className="ease-[cubic-bezier(0.23,1,0.32,1)] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 active:scale-[0.97] inline-flex items-center gap-3 px-10 py-4 min-h-11 border border-border rounded-md font-bold text-sm uppercase tracking-widest hover:bg-primary hover:text-primary-foreground transition-colors duration-200"
          >
            {works.cta.label}
            <ArrowUpRight
              className="works-cta-arrow size-5"
              aria-hidden="true"
            />
          </a>
          <p className="mt-4 text-sm text-muted-foreground">{works.cta.note}</p>
          <a
            href={works.cta.archiveLink.href}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-flex items-center gap-1 text-sm font-mono uppercase tracking-wide text-muted-foreground hover:text-accent transition-colors duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm min-h-11"
          >
            {works.cta.archiveLink.label}
            <ArrowUpRight
              className="works-cta-arrow size-3.5"
              aria-hidden="true"
            />
          </a>
        </div>
      </div>
    </section>
  );
}
