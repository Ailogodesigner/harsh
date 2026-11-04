"use client";

import React from "react";

interface InfiniteMarqueeProps {
  items: Array<{ label: string; icon?: React.ReactNode; tag?: string }>;
  direction?: "left" | "right";
  speed?: number; // seconds for full loop
  className?: string;
}

export default function InfiniteMarquee({
  items,
  direction = "left",
  speed = 28,
  className = "",
}: InfiniteMarqueeProps) {
  return (
    <div className={`relative w-full overflow-hidden py-4 ${className}`}>
      {/* Edge gradient fade masks */}
      <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-[#05050a] to-transparent z-10" />
      <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-[#05050a] to-transparent z-10" />

      <div
        className="flex w-max gap-4 hover:[animation-play-state:paused]"
        style={{
          animation: `marquee-${direction} ${speed}s linear infinite`,
        }}
      >
        {/* Double the list to ensure seamless endless loop */}
        {[...items, ...items, ...items].map((item, idx) => (
          <div
            key={idx}
            className="flex items-center gap-2.5 px-4 py-2 rounded-2xl bg-[#0b0a14] border border-purple-500/20 hover:border-lime-400/40 text-xs font-mono text-slate-300 transition-all shadow-md group cursor-default"
          >
            {item.icon && <span className="text-lime-400 group-hover:scale-110 transition-transform">{item.icon}</span>}
            <span className="font-bold text-white group-hover:text-lime-300 transition-colors">{item.label}</span>
            {item.tag && (
              <span className="px-1.5 py-0.5 rounded text-[10px] bg-purple-500/10 text-purple-300 border border-purple-500/30">
                {item.tag}
              </span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

