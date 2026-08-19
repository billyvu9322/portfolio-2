"use client";

import { useEffect, useRef, useState } from "react";

export default function Cursor() {
  const dot = useRef<HTMLDivElement>(null);
  const ring = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState(false);

  useEffect(() => {
    const move = (e: MouseEvent) => {
      if (dot.current) {
        dot.current.style.transform = `translate3d(${e.clientX - 4}px, ${
          e.clientY - 4
        }px, 0)`;
      }
      if (ring.current) {
        ring.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;
      }
      const el = e.target as HTMLElement | null;
      setHover(
        !!el &&
          (el.tagName === "A" ||
            el.tagName === "BUTTON" ||
            !!el.closest("a") ||
            !!el.closest("button") ||
            !!el.closest(".cursor-pointer"))
      );
    };
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  return (
    <>
      <div
        ref={dot}
        className="max-lg:hidden fixed top-0 left-0 w-2 h-2 bg-primary rounded-full pointer-events-none z-9999 mix-blend-difference"
        style={{ transform: "translate3d(-4px, -4px, 0)" }}
      />
      <div
        ref={ring}
        className={`max-lg:hidden fixed top-0 left-0 border rounded-full pointer-events-none z-9998 mix-blend-difference transition-all duration-300 ease-out flex items-center justify-center ${
          hover ? "w-16 h-16 border-primary" : "w-8 h-8 bg-transparent"
        }`}
        style={{ transform: "translate3d(0px, 0px, 0) translate(-50%, -50%)" }}
      />
    </>
  );
}
