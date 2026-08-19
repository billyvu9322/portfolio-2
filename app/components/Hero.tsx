"use client";

import { useEffect, useRef } from "react";
import { ArrowUpRight } from "lucide-react";
import { motion } from "framer-motion";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

const EASE = [0.23, 1, 0.32, 1] as const;

const lineVariants = {
  hidden: { y: "100%", opacity: 0, scale: 0.95 },
  visible: (i: number) => ({
    y: 0,
    opacity: 1,
    scale: 1,
    transition: { duration: 0.55, delay: 0.08 * i, ease: EASE },
  }),
};

export default function Hero() {
  const section = useRef<HTMLElement>(null);
  const content = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!section.current || !content.current) return;
    const ctx = gsap.context(() => {
      gsap.to(content.current, {
        yPercent: 30,
        ease: "none",
        scrollTrigger: {
          trigger: section.current,
          start: "top top",
          end: "bottom top",
          scrub: 1,
        },
      });
    }, section);
    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={section}
      id="home"
      className="relative min-h-[100dvh] flex flex-col justify-center px-4 md:px-12 pt-24 pb-16 overflow-hidden"
    >
      <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-25 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-accent/30 via-background to-background" />
      <div ref={content} className="w-full max-w-6xl mx-auto z-10 flex flex-col">
        <motion.div
          className="mb-8 md:mb-10"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="font-mono text-sm tracking-widest uppercase text-accent mb-2">
            Antananarivo, Madagascar
          </p>
          <p className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">
            Anthony MAHEFA
          </p>
          <p className="text-lg md:text-xl text-muted-foreground mt-1">
            Fullstack &amp; DevOps Engineer
          </p>
        </motion.div>
        <h1 className="w-full flex flex-col gap-1 md:gap-0 relative z-10 text-[clamp(2.5rem,10vw,6rem)] font-black leading-[0.85] tracking-[-0.04em] uppercase text-balance">
          <div className="overflow-hidden pb-4 -mb-4 self-start">
            <motion.span
              className="block text-foreground"
              custom={0}
              variants={lineVariants}
              initial="hidden"
              animate="visible"
            >
              Creative
            </motion.span>
          </div>
          <div className="overflow-hidden pb-4 -mb-4 self-center">
            <motion.span
              className="block stroke-text text-transparent hover:text-accent transition-colors duration-500"
              custom={1}
              variants={lineVariants}
              initial="hidden"
              animate="visible"
            >
              Software
            </motion.span>
          </div>
          <div className="overflow-hidden pb-4 -mb-4 self-end">
            <motion.span
              className="block stroke-text text-accent hover:text-foreground transition-colors duration-500"
              custom={2}
              variants={lineVariants}
              initial="hidden"
              animate="visible"
            >
              Engineer
            </motion.span>
          </div>
        </h1>
        <motion.div
          className="mt-12 md:mt-16 flex flex-col lg:flex-row lg:items-end lg:justify-between gap-10"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45, duration: 0.6, ease: EASE }}
        >
          <p className="text-muted-foreground text-lg md:text-xl leading-relaxed max-w-xl text-pretty">
            I build production web apps with React, Next.js, and solid
            infrastructure — from Webcup-winning products to client-ready
            deployments.
          </p>
          <div className="flex flex-col gap-4 shrink-0">
            <div className="flex flex-wrap gap-4">
              <a
                href="#work"
                className="duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 active:scale-[0.97] inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-md font-semibold text-sm uppercase tracking-wide hover:opacity-90 transition-opacity"
              >
                View Work
                <ArrowUpRight className="size-4" aria-hidden="true" />
              </a>
              <a
                href="#contact"
                className="duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 active:scale-[0.97] inline-flex items-center gap-2 px-8 py-4 border border-border bg-background rounded-md font-semibold text-sm uppercase tracking-wide hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                Contact
              </a>
            </div>
            <p className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-mono uppercase tracking-wide text-muted-foreground">
              <a
                href="https://www.linkedin.com/in/anthony-mahefasoa-3672361b2/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
              >
                LinkedIn
              </a>
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
