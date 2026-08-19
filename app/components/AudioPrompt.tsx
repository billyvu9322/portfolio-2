"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Volume2, Loader2, X } from "lucide-react";
import { useMusic } from "../lib/stores";

export default function AudioPrompt() {
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const toggleSound = useMusic((s) => s.toggleSound);

  useEffect(() => {
    let dismissed = false;
    try {
      dismissed = localStorage.getItem("sound-alert-dismissed") === "true";
    } catch {}
    if (!dismissed) {
      const t = setTimeout(() => setShow(true), 1200);
      return () => clearTimeout(t);
    }
  }, []);

  const dismiss = () => {
    try {
      localStorage.setItem("sound-alert-dismissed", "true");
    } catch {}
    setShow(false);
  };

  const enable = () => {
    if (loading) return;
    setLoading(true);
    setProgress(0);
    const id = setInterval(() => {
      setProgress((p) => (p >= 90 ? (clearInterval(id), 90) : p + 15 * Math.random()));
    }, 100);
    toggleSound();
    setTimeout(() => {
      clearInterval(id);
      setProgress(100);
      setTimeout(() => {
        setShow(false);
        setLoading(false);
        try {
          localStorage.setItem("sound-alert-dismissed", "true");
        } catch {}
      }, 300);
    }, 500);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 z-[1000] w-[calc(100%-2rem)] max-w-md"
          initial={{ opacity: 0, y: 40, x: "-50%" }}
          animate={{ opacity: 1, y: 0, x: "-50%" }}
          exit={{ opacity: 0, y: 40, x: "-50%" }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        >
          <div className="flex flex-col gap-2 rounded-2xl bg-background/50 backdrop-blur-lg border border-primary/5 shadow-2xl shadow-primary/10 p-4">
            <div className="flex items-center gap-3 sm:gap-4">
              <motion.div
                className="relative flex-shrink-0"
                animate={{ scale: loading ? 1 : [1, 1.1, 1] }}
                transition={{ duration: 2, repeat: loading ? 0 : Infinity }}
              >
                {!loading && (
                  <span className="absolute inset-0 animate-ping rounded-full bg-primary opacity-75" />
                )}
                <div className="relative rounded-full bg-gradient-to-br from-primary to-primary/80 p-3 text-primary-foreground shadow-lg">
                  {loading ? (
                    <Loader2 size={20} className="animate-spin drop-shadow-sm" />
                  ) : (
                    <Volume2 size={20} className="drop-shadow-sm" />
                  )}
                </div>
              </motion.div>
              <div className="flex-1 min-w-0">
                <motion.h3
                  className="text-sm sm:text-base font-bold text-foreground"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  {loading ? "Loading Audio..." : "Enhanced Audio Experience"}
                </motion.h3>
                <motion.p
                  className="text-xs sm:text-sm text-muted-foreground mt-1"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  {loading
                    ? `${Math.round(progress)}% loaded`
                    : "Enable immersive sound effects for better engagement"}
                </motion.p>
              </div>
              <motion.div
                className="flex items-center gap-2 flex-shrink-0"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                <motion.button
                  onClick={enable}
                  disabled={loading}
                  className="rounded-full bg-gradient-to-r from-primary to-primary/90 px-4 sm:px-6 py-2 text-xs sm:text-sm font-bold text-primary-foreground hover:from-primary/90 hover:to-primary/80 transition-all duration-200 shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:scale-100"
                  whileHover={{ scale: loading ? 1 : 1.05 }}
                  whileTap={{ scale: loading ? 1 : 0.95 }}
                >
                  {loading ? "Loading..." : "Enable Sound"}
                </motion.button>
                <motion.button
                  onClick={dismiss}
                  className="rounded-full p-2 hover:bg-muted/80 transition-all duration-200 hover:scale-110 active:scale-95"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  title="Dismiss"
                >
                  <X size={18} />
                </motion.button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
