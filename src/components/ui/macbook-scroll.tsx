"use client";

import React, { useEffect, useRef, useState } from "react";
import { MotionValue, motion, useScroll, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Sparkles,
  Command,
  Option,
  CornerDownLeft,
  ChevronUp,
  Cpu,
  Radio,
  Shield,
} from "lucide-react";

export const MacbookScroll = ({
  src,
  showGradient,
  title,
  badge,
  children,
}: {
  src?: string;
  showGradient?: boolean;
  title?: string | React.ReactNode;
  badge?: React.ReactNode;
  children?: React.ReactNode;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    if (window && window.innerWidth < 768) {
      setIsMobile(true);
    }
  }, []);

  const scaleX = useTransform(
    scrollYProgress,
    [0, 0.3],
    [1.2, isMobile ? 1 : 1.5]
  );
  const scaleY = useTransform(
    scrollYProgress,
    [0, 0.3],
    [0.6, isMobile ? 1 : 1.5]
  );
  const translate = useTransform(scrollYProgress, [0, 1], [0, 1500]);
  const rotate = useTransform(scrollYProgress, [0.1, 0.12, 0.3], [-28, -28, 0]);
  const textTransform = useTransform(scrollYProgress, [0, 0.3], [0, 100]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);

  return (
    <div
      ref={ref}
      className="min-h-[160vh] flex flex-col items-center py-0 md:py-24 justify-start flex-shrink-0 [perspective:800px] transform md:scale-100 scale-[0.8] relative overflow-hidden"
    >
      <motion.div
        style={{
          translateY: textTransform,
          opacity: textOpacity,
        }}
        className="text-center mb-8 px-4"
      >
        {badge && <div className="mb-4 flex justify-center">{badge}</div>}
        <h2 className="text-3xl md:text-5xl font-black text-white tracking-tight">
          {title || "Precision Engineered Architecture on Every Display"}
        </h2>
        <p className="text-xs sm:text-sm text-purple-300/80 font-mono mt-2 max-w-xl mx-auto">
          Fey.com Hardware Acceleration • Scroll to open the 3D MacBook Lid
        </p>
      </motion.div>

      {/* Lid */}
      <Lid
        src={src}
        scaleX={scaleX}
        scaleY={scaleY}
        rotate={rotate}
        translate={translate}
      >
        {children}
      </Lid>

      {/* Base chassis */}
      <div className="h-[22rem] w-[32rem] bg-gray-900 border border-purple-500/30 rounded-2xl overflow-hidden relative -mt-12 shadow-[0_20px_60px_-15px_rgba(168,85,247,0.4)]">
        {/* Above keyboard strip */}
        <div className="h-10 w-full bg-[#0d0c1e] border-b border-purple-500/20 flex items-center justify-between px-6">
          <div className="flex items-center gap-2 text-[10px] font-mono text-purple-400">
            <span className="w-1.5 h-1.5 rounded-full bg-lime-400 animate-pulse" />
            <span>APPLE M3 MAX // 128GB UNIFIED MEMORY</span>
          </div>
          <div className="text-[10px] font-mono text-slate-500">
            60FPS HARDWARE ENGINE
          </div>
        </div>

        {/* Keyboard Area */}
        <div className="flex w-full h-full">
          <div className="mx-auto w-[85%] mt-2">
            <Keypad />
          </div>
        </div>

        {/* Trackpad */}
        <Trackpad />

        {/* Rubber feet */}
        <div className="h-2 w-20 mx-auto bg-purple-950/80 rounded-t-none rounded-b-lg" />
      </div>
    </div>
  );
};

export const Lid = ({
  scaleX,
  scaleY,
  rotate,
  translate,
  src,
  children,
}: {
  scaleX: MotionValue<number>;
  scaleY: MotionValue<number>;
  rotate: MotionValue<number>;
  translate: MotionValue<number>;
  src?: string;
  children?: React.ReactNode;
}) => {
  return (
    <div className="relative [perspective:800px]">
      <div
        style={{
          transform: "perspective(800px) rotateX(-25deg) translateZ(0px)",
          transformOrigin: "bottom",
          transformStyle: "preserve-3d",
        }}
        className="h-[12rem] w-[32rem] bg-[#05050a] p-1 rounded-2xl"
      >
        <motion.div
          style={{
            scaleX: scaleX,
            scaleY: scaleY,
            rotateX: rotate,
            translateY: translate,
            transformStyle: "preserve-3d",
            transformOrigin: "bottom",
          }}
          className="h-96 w-[32rem] bg-[#0c0a1f] rounded-2xl p-2 relative border-2 border-purple-500/40 shadow-2xl shadow-purple-900/50"
        >
          {/* Top Notch & Camera */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-20 h-3 bg-black rounded-b-md flex items-center justify-center gap-1.5 z-20">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500/80" />
            <div className="w-1 h-1 rounded-full bg-slate-800" />
          </div>

          {/* Screen Content */}
          <div className="h-full w-full bg-[#05050a] rounded-xl overflow-hidden relative border border-purple-500/20">
            {children ? (
              children
            ) : (
              <div className="h-full w-full p-4 flex flex-col justify-between font-mono text-left bg-gradient-to-br from-[#0c0a1f] via-[#070611] to-[#040408]">
                <div className="flex items-center justify-between pb-3 border-b border-purple-500/20">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-lime-400 animate-pulse" />
                    <span className="text-xs font-bold text-white">Harsh Unlimited // Store Engine</span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/30">
                    Live Telemetry
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 my-auto">
                  <div className="p-2.5 rounded-xl bg-[#090815] border border-purple-500/20">
                    <div className="text-[10px] text-purple-300">Peak Players</div>
                    <div className="text-lg font-black text-lime-400">9 / 100</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#090815] border border-purple-500/20">
                    <div className="text-[10px] text-purple-300">Edge Ping</div>
                    <div className="text-lg font-black text-purple-300">&lt; 15ms</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#090815] border border-purple-500/20">
                    <div className="text-[10px] text-purple-300">Cashfree PG</div>
                    <div className="text-lg font-black text-amber-400">Verified</div>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-black/60 border border-purple-500/30 text-[10px] text-lime-300 flex items-center justify-between">
                  <span>$ next build --turbopack && opennextjs-cloudflare</span>
                  <span className="text-purple-400">Ready in 420ms</span>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export const Trackpad = () => {
  return (
    <div className="w-[40%] mx-auto h-24 rounded-xl my-1 bg-gradient-to-b from-[#100e26] to-[#0a0918] border border-purple-500/20 shadow-inner" />
  );
};

export const Keypad = () => {
  return (
    <div className="h-full rounded-md bg-[#070611] p-1 border border-purple-500/20 space-y-1">
      {/* Row 1 */}
      <div className="flex gap-1 justify-center">
        {["esc", "F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8", "F9", "F10", "F11", "F12"].map((k) => (
          <div key={k} className="h-4 flex-1 rounded-[2px] bg-[#121026] text-[7px] text-slate-400 flex items-center justify-center">
            {k}
          </div>
        ))}
      </div>
      {/* Row 2 */}
      <div className="flex gap-1 justify-center">
        {["~", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "=", "delete"].map((k) => (
          <div key={k} className="h-5 flex-1 rounded-[2px] bg-[#15122e] text-[8px] text-slate-300 flex items-center justify-center font-mono">
            {k}
          </div>
        ))}
      </div>
      {/* Row 3 */}
      <div className="flex gap-1 justify-center">
        {["tab", "Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "[", "]", "\\"].map((k) => (
          <div key={k} className="h-5 flex-1 rounded-[2px] bg-[#15122e] text-[8px] text-slate-300 flex items-center justify-center font-mono">
            {k}
          </div>
        ))}
      </div>
      {/* Row 4 */}
      <div className="flex gap-1 justify-center">
        {["caps", "A", "S", "D", "F", "G", "H", "J", "K", "L", ";", "'", "return"].map((k) => (
          <div key={k} className="h-5 flex-1 rounded-[2px] bg-[#15122e] text-[8px] text-slate-300 flex items-center justify-center font-mono">
            {k}
          </div>
        ))}
      </div>
      {/* Row 5 Spacebar */}
      <div className="flex gap-1 justify-center items-center">
        <div className="h-5 w-12 rounded-[2px] bg-[#121026] text-[8px] text-slate-400 flex items-center justify-center">fn</div>
        <div className="h-5 w-10 rounded-[2px] bg-[#121026] text-[8px] text-slate-400 flex items-center justify-center">control</div>
        <div className="h-5 w-10 rounded-[2px] bg-[#121026] text-[8px] text-slate-400 flex items-center justify-center">option</div>
        <div className="h-5 w-12 rounded-[2px] bg-[#121026] text-[8px] text-slate-400 flex items-center justify-center">command</div>
        <div className="h-5 flex-1 rounded-[2px] bg-[#1a1738] text-[8px] text-slate-300 flex items-center justify-center" />
        <div className="h-5 w-12 rounded-[2px] bg-[#121026] text-[8px] text-slate-400 flex items-center justify-center">command</div>
        <div className="h-5 w-10 rounded-[2px] bg-[#121026] text-[8px] text-slate-400 flex items-center justify-center">option</div>
      </div>
    </div>
  );
};
