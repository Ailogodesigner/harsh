"use client";

import React, { useRef, useEffect } from "react";

interface ClockDialBackgroundProps {
  className?: string;
  opacity?: string; // e.g. "opacity-25"
  blendMode?: string; // e.g. "mix-blend-screen"
  size?: string; // e.g. "w-[750px] h-[750px]"
  align?: "center" | "top" | "hero";
}

export default function ClockDialBackground({
  className = "",
  opacity = "opacity-25",
  blendMode = "mix-blend-screen",
  size = "w-[650px] h-[650px] sm:w-[850px] sm:h-[850px]",
  align = "center",
}: ClockDialBackgroundProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    // Ensure autoplay works on all browsers and mobile power-saving modes
    if (videoRef.current) {
      videoRef.current.playbackRate = 0.85; // Slight atmospheric slow-down for elegant rotation
      videoRef.current.play().catch(() => {
        // Autoplay policy fallback
      });
    }
  }, []);

  return (
    <div
      className={`absolute pointer-events-none select-none overflow-hidden z-0 ${
        align === "hero"
          ? "top-12 left-1/2 -translate-x-1/2"
          : align === "top"
          ? "top-0 left-1/2 -translate-x-1/2"
          : "top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
      } ${size} ${className}`}
      aria-hidden="true"
    >
      <div className={`relative w-full h-full rounded-full overflow-hidden ${opacity} ${blendMode}`}>
        <video
          ref={videoRef}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          className="w-full h-full object-cover scale-110 filter contrast-125 brightness-95"
        >
          <source src="/videos/clock-dial.mp4" type="video/mp4" />
        </video>

        {/* Circular radial vignette fade into background */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_25%,rgba(5,5,10,0.6)_60%,#05050a_95%)]" />

        {/* Atmospheric Cyber Tint */}
        <div className="absolute inset-0 bg-gradient-to-tr from-purple-900/30 via-transparent to-lime-400/10 mix-blend-overlay" />
      </div>
    </div>
  );
}

