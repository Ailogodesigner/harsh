"use client";

import React, { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";

export const ContainerTextFlip = ({
  words = ["Ultra-Fast", "Scalable Systems", "Zero-Cold-Start", "Battle-Tested"],
  duration = 2500,
  className,
}: {
  words?: string[];
  duration?: number;
  className?: string;
}) => {
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % words.length);
    }, duration);
    return () => clearInterval(timer);
  }, [words.length, duration]);

  return (
    <div
      className={cn(
        "inline-flex items-center justify-center px-4 py-1.5 rounded-2xl bg-[#0f0d24] border border-purple-500/30 text-lime-400 font-mono text-sm sm:text-base font-bold shadow-md shadow-purple-950/40 min-w-[200px] overflow-hidden",
        className
      )}
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={words[currentIdx]}
          initial={{ y: 20, opacity: 0, filter: "blur(4px)" }}
          animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
          exit={{ y: -20, opacity: 0, filter: "blur(4px)" }}
          transition={{ duration: 0.35, ease: "easeInOut" }}
          className="inline-block whitespace-nowrap"
        >
          {words[currentIdx]}
        </motion.span>
      </AnimatePresence>
    </div>
  );
};

