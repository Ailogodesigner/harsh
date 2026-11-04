"use client";

import React, { useEffect, useState } from "react";

export default function CursorAura() {
  const [pos, setPos] = useState({ x: -100, y: -100 });
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    // Only run on desktop/devices with fine pointer
    if (typeof window === "undefined" || window.matchMedia("(pointer: coarse)").matches) {
      return;
    }

    const handlePointerMove = (e: MouseEvent) => {
      setPos({ x: e.clientX, y: e.clientY });
      if (!visible) setVisible(true);
    };

    const handleMouseLeave = () => {
      setVisible(false);
    };

    window.addEventListener("mousemove", handlePointerMove);
    document.body.addEventListener("mouseleave", handleMouseLeave);

    return () => {
      window.removeEventListener("mousemove", handlePointerMove);
      document.body.removeEventListener("mouseleave", handleMouseLeave);
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-30 transition-opacity duration-300"
      style={{ opacity: visible ? 1 : 0 }}
    >
      <div
        className="absolute w-72 h-72 rounded-full -translate-x-1/2 -translate-y-1/2 bg-gradient-to-tr from-purple-600/15 via-fuchsia-600/10 to-lime-400/10 blur-[80px] pointer-events-none"
        style={{
          left: `${pos.x}px`,
          top: `${pos.y}px`,
          transition: "left 0.12s ease-out, top 0.12s ease-out",
        }}
      />
    </div>
  );
}
