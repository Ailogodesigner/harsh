"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { playCyberHover } from "./SoundEffects";

interface TextScrambleProps {
  text: string;
  className?: string;
  triggerOnHover?: boolean;
  autostart?: boolean;
  glyphSpeed?: number;
}

const GLYPHS = "!<>-_\\/[]{}—=+*^?#0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";

export default function TextScramble({
  text,
  className = "",
  triggerOnHover = true,
  autostart = true,
  glyphSpeed = 30,
}: TextScrambleProps) {
  const [displayText, setDisplayText] = useState(text);
  const isScramblingRef = useRef(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const startScramble = useCallback(() => {
    if (isScramblingRef.current) return;
    isScramblingRef.current = true;
    playCyberHover();

    let iteration = 0;
    const maxIterations = text.length;

    if (intervalRef.current) clearInterval(intervalRef.current);

    intervalRef.current = setInterval(() => {
      setDisplayText(
        text
          .split("")
          .map((char, index) => {
            if (char === " ") return " ";
            if (index < iteration) {
              return text[index];
            }
            return GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
          })
          .join("")
      );

      if (iteration >= maxIterations) {
        if (intervalRef.current) clearInterval(intervalRef.current);
        isScramblingRef.current = false;
        setDisplayText(text);
      }

      iteration += 1 / 2;
    }, glyphSpeed);
  }, [text, glyphSpeed]);

  useEffect(() => {
    if (autostart) {
      startScramble();
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [autostart, startScramble]);

  return (
    <span
      onMouseEnter={() => {
        if (triggerOnHover) startScramble();
      }}
      className={`inline-block cursor-pointer select-none font-mono ${className}`}
    >
      {displayText}
    </span>
  );
}

