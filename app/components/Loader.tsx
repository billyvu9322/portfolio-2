"use client";

import { useEffect, useState } from "react";

export default function Loader() {
  const [show, setShow] = useState(false);
  const [pct, setPct] = useState(0);

  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (reduced) return;
    let visited = false;
    try {
      visited = sessionStorage.getItem("portfolio-visited") === "1";
    } catch {}
    if (visited) return;

    setShow(true);
    const start = Date.now();
    let cur = 0;
    const id = window.setInterval(() => {
      const elapsed = Date.now() - start;
      cur = Math.min(100, cur + Math.floor(18 * Math.random()) + 8);
      if (cur >= 100 || elapsed >= 800) {
        cur = 100;
        setPct(100);
        clearInterval(id);
        try {
          sessionStorage.setItem("portfolio-visited", "1");
        } catch {}
        setTimeout(() => setShow(false), 200);
        return;
      }
      setPct(cur);
    }, 60);
    return () => clearInterval(id);
  }, []);

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 bg-background/95 z-50 flex flex-col justify-between p-6 md:p-10 font-mono pointer-events-none"
      aria-hidden="true"
    >
      <div className="flex max-md:flex-col justify-between items-start text-xs md:text-sm tracking-widest uppercase gap-2">
        <div className="flex items-center gap-2">
          <span className="size-2 bg-accent rounded-full animate-pulse" />
          <span>SYSTEM_CHECK... OK</span>
        </div>
        <span className="text-muted-foreground">ANTANANARIVO, MADAGASCAR</span>
      </div>
      <div
        className="text-5xl md:text-7xl leading-none font-bold tracking-tighter self-end text-accent select-none"
        aria-hidden="true"
      >
        {pct}%
      </div>
    </div>
  );
}
