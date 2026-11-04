"use client";

import React from "react";

interface BorderBeamProps {
  className?: string;
  size?: number;
  duration?: number;
  colorFrom?: string;
  colorTo?: string;
}

export default function BorderBeam({
  className = "",
  size = 200,
  duration = 12,
  colorFrom = "#a855f7",
  colorTo = "#a3e635",
}: BorderBeamProps) {
  return (
    <div
      style={
        {
          "--size": `${size}px`,
          "--duration": `${duration}s`,
          "--color-from": colorFrom,
          "--color-to": colorTo,
        } as React.CSSProperties
      }
      className={`pointer-events-none absolute inset-0 rounded-[inherit] border border-transparent [mask-clip:padding-box,border-box] [mask-composite:intersect] [mask-image:linear-gradient(transparent,transparent),linear-gradient(#000,#000)] ${className}`}
    >
      <div
        className="absolute aspect-square w-[var(--size)] bg-gradient-to-r from-[var(--color-from)] via-fuchsia-500 to-[var(--color-to)] [animation:border-beam_var(--duration)_infinite_linear]"
        style={{
          offsetPath: "rect(0 auto auto 0 round var(--size))",
        }}
      />
    </div>
  );
}

