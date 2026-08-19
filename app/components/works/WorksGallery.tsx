"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowUpRight, ChevronLeft, ChevronRight } from "lucide-react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLenis } from "lenis/react";
import { projects } from "../../lib/data";

export default function WorksGallery() {
  const container = useRef<HTMLDivElement>(null);
  const pinWrap = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const progress = useRef<HTMLSpanElement>(null);
  const stRef = useRef<ScrollTrigger | null>(null);
  const navigating = useRef(false);
  const [active, setActive] = useState(0);
  const lenis = useLenis();
  const n = projects.length;

  useEffect(() => {
    const cont = container.current;
    const pin = pinWrap.current;
    const trk = track.current;
    if (!cont || !pin || !trk) return;

    const cleanups: Array<() => void> = [];

    const ctx = gsap.context(() => {
      const total = () => (n - 1) * cont.clientWidth;

      const main = gsap.to(trk, {
        x: () => -total(),
        ease: "none",
        scrollTrigger: {
          trigger: cont,
          pin: pin,
          scrub: 1,
          anticipatePin: 1,
          invalidateOnRefresh: true,
          end: () => `+=${total()}`,
          snap: {
            // skip snapping while arrow/keyboard nav drives the scroll, so the
            // ScrollTrigger snap doesn't compound with lenis.scrollTo (overshoot)
            snapTo: (value: number) =>
              navigating.current
                ? value
                : Math.round(value * (n - 1)) / (n - 1),
            duration: { min: 0.15, max: 0.4 },
            delay: 0.06,
            ease: "power2.out",
          },
          onUpdate: (self) => {
            setActive(Math.round(self.progress * (n - 1)));
            if (progress.current)
              gsap.set(progress.current, { scaleX: self.progress });
          },
        },
      });
      stRef.current = main.scrollTrigger ?? null;

      gsap.utils.toArray<HTMLElement>(".project-strip", cont).forEach((strip) => {
        const shell = strip.querySelector(".project-strip-device-shell");
        const device = strip.querySelector(".project-strip-device");
        const content = strip.querySelector(".project-strip-content");
        const tags = strip.querySelectorAll(".works-tag");
        const st = (start: string, end: string, scrub: number) => ({
          trigger: strip,
          containerAnimation: main,
          start,
          end,
          scrub,
        });
        if (shell)
          gsap.fromTo(shell, { opacity: 0.3 }, { opacity: 1, ease: "none", scrollTrigger: st("left 90%", "left 45%", 0.5) });
        if (device)
          gsap.fromTo(
            device,
            { clipPath: "inset(8% 8% 8% 8% round 1.35rem)", scale: 0.92 },
            { clipPath: "inset(0% 0% 0% 0% round 1.35rem)", scale: 1, ease: "none", scrollTrigger: st("left 88%", "left 40%", 0.55) }
          );
        if (content)
          gsap.fromTo(content, { x: -28 }, { x: 0, ease: "none", scrollTrigger: st("left 92%", "left 48%", 0.55) });
        if (tags.length)
          gsap.fromTo(tags, { opacity: 0.5, y: 6 }, { opacity: 1, y: 0, ease: "none", stagger: 0.04, scrollTrigger: st("left 85%", "left 55%", 0.5) });
      });

      ScrollTrigger.refresh();
      // Lenis caches the document height; the pin-spacer just grew it, so tell
      // Lenis to remeasure — otherwise its scroll limit stays short and the last
      // project (and arrow/keyboard nav to it) is unreachable.
      lenis?.resize();
      const t = setTimeout(() => {
        ScrollTrigger.refresh();
        lenis?.resize();
      }, 300);
      cleanups.push(() => clearTimeout(t));
    }, cont);

    return () => {
      cleanups.forEach((fn) => fn());
      ctx.revert();
    };
  }, [n, lenis]);

  const step = (dir: number) => {
    const st = stRef.current;
    if (!st) return;
    const cur = Math.round(st.progress * (n - 1));
    const idx = Math.max(0, Math.min(n - 1, cur + dir));
    // exact endpoints so the first/last project is always reachable
    const target =
      idx === 0
        ? st.start
        : idx === n - 1
          ? st.end
          : st.start + (idx / (n - 1)) * (st.end - st.start);
    navigating.current = true;
    const done = () => {
      navigating.current = false;
    };
    if (lenis) lenis.scrollTo(target, { duration: 0.6, lock: true, onComplete: done });
    else {
      window.scrollTo({ top: target, behavior: "smooth" });
      setTimeout(done, 700);
    }
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      step(1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      step(-1);
    }
  };

  return (
    <div
      ref={container}
      className="relative -mx-4 md:-mx-8 lg:-mx-20 isolate"
      role="group"
      aria-label="Project gallery"
    >
      <div
        ref={pinWrap}
        className="relative flex h-svh max-h-[900px] w-full flex-col overflow-hidden"
        tabIndex={0}
        onKeyDown={onKey}
      >
        {/* Header: counter + prev/next arrows */}
        <div className="flex shrink-0 items-center justify-between gap-4 px-4 md:px-10 lg:px-16 pt-6 mb-4 md:mb-6">
          <p className="font-mono text-xs uppercase tracking-[0.15em] text-foreground">
            Project <span className="inline-block tabular-nums">{active + 1}</span> of {n}
            <span className="text-muted-foreground"> — scroll sideways or use arrows</span>
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={active === 0}
              aria-label="Previous project"
              onClick={() => step(-1)}
              className="inline-flex items-center justify-center min-h-11 min-w-11 rounded-full border border-border bg-background/80 hover:border-accent hover:text-accent transition-[colors,transform] duration-200 hover:scale-105 active:scale-95 disabled:opacity-40 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ChevronLeft className="size-5" aria-hidden="true" />
            </button>
            <button
              type="button"
              disabled={active === n - 1}
              aria-label="Next project"
              onClick={() => step(1)}
              className="inline-flex items-center justify-center min-h-11 min-w-11 rounded-full border border-border bg-background/80 hover:border-accent hover:text-accent transition-[colors,transform] duration-200 hover:scale-105 active:scale-95 disabled:opacity-40 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ChevronRight className="size-5" aria-hidden="true" />
            </button>
          </div>
        </div>

        {/* Track */}
        <div ref={track} className="flex min-h-0 w-full flex-1 will-change-transform">
          {projects.map((p, i) => (
            <article
              key={p.title}
              className="project-strip relative flex shrink-0 w-full h-full px-4 md:px-10 lg:px-16 pb-12 "
            >
              <div
                className="project-strip-panel relative flex h-full w-full overflow-hidden rounded-2xl md:rounded-3xl border border-border/50 backdrop-blur-sm flex-row items-stretch bg-background/92"
                data-active={i === active ? "true" : "false"}
              >
                <div
                  className="project-strip-media relative z-10 flex items-center justify-center overflow-hidden bg-muted/30 flex-1 min-h-0 rounded-l-2xl lg:rounded-l-3xl py-8 md:py-10 px-4 md:px-8"
                  data-in-view="true"
                  data-active={i === active ? "true" : "false"}
                  data-layout="gallery"
                >
                  <div className="project-strip-device-shell pointer-events-none absolute inset-0" aria-hidden="true" />
                  <div
                    className="project-strip-device relative shrink-0 overflow-hidden rounded-[1.35rem] border border-border/70 bg-background shadow-[0_28px_56px_-20px_rgba(0,0,0,0.55)] h-[min(100%,640px)] w-auto max-w-[min(42%,280px)] "
                    style={{ aspectRatio: "363 / 784" }}
                  >
                    <div className="project-strip-device-notch absolute top-0 inset-x-0 z-10 h-6 bg-linear-to-b from-black/25 to-transparent pointer-events-none" aria-hidden="true" />
                    <Image
                      alt={p.imageAlt}
                      fill
                      className="object-cover object-top"
                      sizes="(max-width: 768px) 60vw, 280px"
                      src={p.image}
                    />
                  </div>
                </div>
                <div className="project-strip-content relative z-10 flex flex-col justify-center p-6 md:p-10 lg:p-12 w-[38%] min-w-[280px]">
                  <div className="space-y-4 md:space-y-5">
                    <div>
                      <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent mb-2">
                        {String(i + 1).padStart(2, "0")} / {p.year} · {p.tagline}
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
                        <ArrowUpRight className="works-cta-arrow size-3.5" aria-hidden="true" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Full-width progress bar */}
        <div className="absolute bottom-6 left-4 md:left-10 lg:left-16 right-4 md:right-10 lg:right-16 h-1 bg-border/40 overflow-hidden rounded-full">
          <span
            ref={progress}
            className="block h-full w-full bg-accent origin-left"
            style={{ transform: "scaleX(0)" }}
          />
        </div>
      </div>
    </div>
  );
}
