"use client";

import { useEffect, useRef } from "react";
import { Howl } from "howler";
import confetti from "canvas-confetti";
import { useMusic } from "../lib/stores";

type Theme = "light" | "dark";

export default function ThemeAudioDock() {
  const sounds = useRef<Record<Theme, Howl> | null>(null);
  const music = useRef<Howl | null>(null);
  const { isMusicInitialized, isSoundEnabled, toggleSound } = useMusic();

  useEffect(() => {
    sounds.current = {
      light: new Howl({ src: ["/audio/light-theme-sound.mp3"] }),
      dark: new Howl({ src: ["/audio/dark-theme-sound.mp3"] }),
    };
  }, []);

  // lazily create + control the background music Howl
  useEffect(() => {
    if (!isMusicInitialized) return;
    if (!music.current) {
      music.current = new Howl({
        src: ["/audio/audio.ogg"],
        autoplay: false,
        loop: true,
        volume: 0.5,
      });
    }
    if (isSoundEnabled) music.current.play();
    else music.current.pause();
  }, [isMusicInitialized, isSoundEnabled]);

  const fireConfetti = (theme: Theme) => {
    const colors =
      theme === "light" ? ["#FFD700", "#FFA500"] : ["#A020F0", "#4B0082"];
    [0, 100, 200].forEach((delay) =>
      setTimeout(
        () => confetti({ particleCount: 50, spread: 60, colors }),
        delay
      )
    );
  };

  const setTheme = (theme: Theme) => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    try {
      localStorage.setItem("ui-theme", theme);
    } catch {}
    sounds.current?.[theme]?.play();
    fireConfetti(theme);
  };

  return (
    <div className="fixed bottom-2 right-2 z-50 flex items-center gap-3 backdrop-blur-2xl p-2 sm:p-4 rounded-full border border-border/50 bg-background/5">
      <button
        onClick={() => setTheme("light")}
        className="relative rounded-full p-2 hover:bg-foreground/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        aria-label="Switch to Light Mode"
      >
        <div className="w-6 overflow-hidden max-sm:scale-90 lg:translate-y-1 group">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="group-hover:rotate-45 duration-300"
          >
            <path
              d="M17 12C17 14.7614 14.7614 17 12 17C9.23858 17 7 14.7614 7 12C7 9.23858 9.23858 7 12 7C14.7614 7 17 9.23858 17 12Z"
              fill="#ffcc00"
            />
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M12 1.25C12.4142 1.25 12.75 1.58579 12.75 2V4C12.75 4.41421 12.4142 4.75 12 4.75C11.5858 4.75 11.25 4.41421 11.25 4V2C11.25 1.58579 11.5858 1.25 12 1.25ZM1.25 12C1.25 11.5858 1.58579 11.25 2 11.25H4C4.41421 11.25 4.75 11.5858 4.75 12C4.75 12.4142 4.41421 12.75 4 12.75H2C1.58579 12.75 1.25 12.4142 1.25 12ZM19.25 12C19.25 11.5858 19.5858 11.25 20 11.25H22C22.4142 11.25 22.75 11.5858 22.75 12C22.75 12.4142 22.4142 12.75 22 12.75H20C19.5858 12.75 19.25 12.4142 19.25 12ZM12 19.25C12.4142 19.25 12.75 19.5858 12.75 20V22C12.75 22.4142 12.4142 22.75 12 22.75C11.5858 22.75 11.25 22.4142 11.25 22V20C11.25 19.5858 11.5858 19.25 12 19.25Z"
              fill="currentColor"
            />
          </svg>
        </div>
      </button>
      <button
        onClick={() => setTheme("dark")}
        className="relative rounded-full p-2 hover:bg-foreground/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        aria-label="Switch to Dark Mode"
      >
        <div className="w-6 overflow-hidden max-sm:scale-90 lg:translate-y-1 group">
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              opacity="0.5"
              fillRule="evenodd"
              clipRule="evenodd"
              d="M22 12.0004C22 17.5232 17.5228 22.0004 12 22.0004C10.8358 22.0004 9.71801 21.8014 8.67887 21.4357C8.24138 20.3772 8 19.217 8 18.0004C8 15.7792 8.80467 13.7459 10.1384 12.1762C11.31 13.8818 13.2744 15.0004 15.5 15.0004C17.8615 15.0004 19.9289 13.741 21.0672 11.8572C21.3065 11.4612 22 11.5377 22 12.0004Z"
              className="fill-current group-hover:translate-y-0.5 duration-300"
            />
            <path
              d="M2 12C2 16.3586 4.78852 20.0659 8.67887 21.4353C8.24138 20.3768 8 19.2166 8 18C8 15.7788 8.80467 13.7455 10.1384 12.1758C9.42027 11.1303 9 9.86422 9 8.5C9 6.13845 10.2594 4.07105 12.1432 2.93276C12.5392 2.69347 12.4627 2 12 2C6.47715 2 2 6.47715 2 12Z"
              className="fill-current group-hover:-translate-y-0.5 duration-300"
            />
          </svg>
        </div>
      </button>
      <button
        onClick={toggleSound}
        className="relative rounded-full p-2 hover:bg-foreground/5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        aria-label={isSoundEnabled ? "Disable music" : "Enable music"}
      >
        <div className="w-6 overflow-hidden max-sm:scale-90 lg:translate-y-1">
          <svg
            className={`relative w-48 ${isSoundEnabled ? "animate-wave" : ""}`}
            viewBox="0 0 456.7 39.9"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              className="stroke-current stroke-8 fill-none"
              d="M 8 26 c 7.5 0 26 2 70 0 l 21 -4 c 14 -2 20.2 -6.9 41 2 c 10 2 13.9 6.5 33 8 c 14 1 34 -8 43 -14 C 227 12 229 11 236 11 c 9 2 13 7 20.2 12.9 l 0.4 0.4 c 6.8 6.9 13.4 10.7 25.4 10.7 c 7 0 17.7 -7.8 24.5 -14.6 l 0.3 -0.3 c 6.3 -6.4 12.9 -13 18.2 -12.1 c 7.5 0 14.1 6.6 20.4 13 l 0.3 0.3 c 6.8 6.9 14.6 14.6 24.5 14.6 c 9.9 0 17.8 -10.9 20.8 -14.9 l 0.402 -0.596 C 396 15 404 7 410.202 7.41 c 8.7 0 14.186 6.497 22.528 15.39 c 5.981 6.453 10.546 10.23 16 13.8M 8 26 c 7.5 0 26 2 70 0 l 21 -4 c 14 -2 20.2 -6.9 41 2 c 10 2 13.9 6.5 33 8 c 14 1 34 -8 43 -14 C 227 12 229 11 236 11 c 9 2 13 7 20.2 12.9 l 0.4 0.4 c 6.8 6.9 13.4 10.7 25.4 10.7 c 7 0 17.7 -7.8 24.5 -14.6 l 0.3 -0.3 c 6.3 -6.4 12.685 -11.938 18.2 -12.1 c 7.5 0 14.1 6.6 20.4 13 l 0.3 0.3 c 6.8 6.9 14.6 14.6 24.5 14.6 c 9.9 0 17.593 -11.369 21.428 -15.087 l 0.315 -0.315 C 397.079 14.615 404.161 8.241 409.675 8.044 c 8.7 0 14.186 6.497 22.528 15.39 c 5.981 6.453 10.546 10.23 16 13.8"
            />
          </svg>
        </div>
      </button>
    </div>
  );
}
