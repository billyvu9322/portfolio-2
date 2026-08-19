"use client";

import { useEffect } from "react";
import dynamic from "next/dynamic";
import { ReactLenis, useLenis } from "lenis/react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
import { useSection, type SectionId } from "../lib/stores";

import Nav from "./Nav";
import Hero from "./Hero";
import Works from "./Works";
import About from "./About";
import Contact from "./Contact";
import Cursor from "./Cursor";
import Loader from "./Loader";
import ThemeAudioDock from "./ThemeAudioDock";
import AudioPrompt from "./AudioPrompt";

const WebGLBackground = dynamic(() => import("./webgl/WebGLBackground"), {
  ssr: false,
});

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
}

function LenisScrollTriggerSync() {
  const lenis = useLenis();
  useEffect(() => {
    if (!lenis) return;
    const onScroll = () => ScrollTrigger.update();
    lenis.on("scroll", onScroll);
    return () => lenis.off("scroll", onScroll);
  }, [lenis]);
  return null;
}

function SectionObserver() {
  const setSection = useSection((s) => s.setSection);
  useEffect(() => {
    const ids: SectionId[] = ["home", "work", "about", "contact"];
    const els = ids
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];
    let ratios = new Map<string, number>();
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => ratios.set(e.target.id, e.intersectionRatio));
        let best: SectionId = "home";
        let max = -1;
        ids.forEach((id) => {
          const r = ratios.get(id) ?? 0;
          if (r > max) {
            max = r;
            best = id;
          }
        });
        if (max > 0) setSection(best);
      },
      { rootMargin: "-40% 0px -45% 0px", threshold: [0, 0.25, 0.5] }
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [setSection]);
  return null;
}

export default function ClientShell() {
  return (
    <ReactLenis root options={{ lerp: 0.1, smoothWheel: true }}>
      <LenisScrollTriggerSync />
      <SectionObserver />
      <div className="min-h-screen overflow-x-hidden">
        <WebGLBackground />
        <Cursor />
        <Nav />
        <a
          href="#home"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-background focus:text-foreground focus:border focus:border-border focus:rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
        >
          Skip to content
        </a>
        <main id="main-content">
          <Hero />
          <Works />
          <About />
          <Contact />
        </main>
        <ThemeAudioDock />
      </div>
      <AudioPrompt />
      <Loader />
    </ReactLenis>
  );
}
