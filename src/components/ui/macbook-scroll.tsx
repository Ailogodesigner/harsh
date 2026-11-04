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
  Activity,
  Zap,
} from "lucide-react";
import { playCyberHover, playCyberClick } from "./SoundEffects";

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
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Lid smoothly opens from -65deg to 0deg upright
  const lidRotate = useTransform(scrollYProgress, [0, 0.45], [-65, 0]);
  
  // Entire laptop scales smoothly into view
  const laptopScale = useTransform(
    scrollYProgress,
    [0, 0.45],
    [isMobile ? 0.65 : 0.85, isMobile ? 0.78 : 1.02]
  );

  // Title fades out cleanly as laptop opens
  const textTransform = useTransform(scrollYProgress, [0, 0.25], [0, -30]);
  const textOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0]);

  return (
    <div
      ref={containerRef}
      className="min-h-[170vh] sm:min-h-[200vh] relative w-full flex flex-col items-center justify-start py-8 sm:py-16 overflow-visible"
    >
      {/* Sticky viewport anchor so the laptop stays in view during scroll */}
      <div className="sticky top-12 sm:top-16 w-full flex flex-col items-center justify-center max-w-7xl mx-auto px-4 z-20">
        
        {/* Header Title & Badge */}
        <motion.div
          style={{
            y: textTransform,
            opacity: textOpacity,
          }}
          className="text-center mb-6 sm:mb-8 px-4 z-30 pointer-events-none"
        >
          {badge && <div className="mb-3 flex justify-center pointer-events-auto">{badge}</div>}
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
            {title || "Precision Engineered Architecture on Every Display"}
          </h2>
          <p className="text-xs sm:text-sm text-purple-300/80 font-mono mt-2 max-w-xl mx-auto">
            Fey.com 3D Hardware Engine • Scroll to open the MacBook Lid
          </p>
        </motion.div>

        {/* 3D Laptop Perspective Container */}
        <div className="relative flex flex-col items-center justify-center [perspective:1400px] [transform-style:preserve-3d] overflow-visible w-full py-2">
          
          {/* 1. THE LID (SCREEN) - Stands upright ABOVE the hinge */}
          <motion.div
            style={{
              scale: laptopScale,
              rotateX: lidRotate,
              transformOrigin: "bottom center",
              transformStyle: "preserve-3d",
            }}
            className="relative z-20 w-[32rem] sm:w-[48rem] md:w-[54rem] h-[21rem] sm:h-[29rem] md:h-[33rem] rounded-2xl p-2.5 sm:p-3 bg-[#0a0816] border-2 border-[#2b2447] shadow-[0_0_60px_rgba(168,85,247,0.3)] flex flex-col"
          >
            {/* Camera Notch with 1080p Lens & Privacy LED */}
            <div className="absolute top-2.5 sm:top-3 left-1/2 -translate-x-1/2 w-28 sm:w-36 h-4 sm:h-5 bg-black rounded-b-xl flex items-center justify-center gap-2 z-30 shadow-md">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#0a2e1d] border border-emerald-500/60 flex items-center justify-center">
                <div className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-[#1e293b]" />
              <span className="text-[7px] sm:text-[8px] font-mono text-slate-500 uppercase tracking-wider">
                1080P PRO
              </span>
            </div>

            {/* Display Bezel & Screen Inner Canvas */}
            <div className="relative w-full h-full rounded-xl overflow-hidden bg-[#04030a] border border-purple-500/20 shadow-inner flex flex-col">
              {children ? (
                <div className="w-full h-full relative z-10">{children}</div>
              ) : src ? (
                <img
                  src={src}
                  alt="MacBook Screen"
                  className="w-full h-full object-cover relative z-10"
                />
              ) : (
                /* Bespoke Live Telemetry Dashboard on Display */
                <div className="h-full w-full p-4 sm:p-6 flex flex-col justify-between font-mono text-left bg-gradient-to-br from-[#0c0a20] via-[#070512] to-[#040308] relative z-10">
                  {/* Top Bar */}
                  <div className="flex items-center justify-between pb-3 border-b border-purple-500/20">
                    <div className="flex items-center gap-2.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-lime-400 animate-pulse shadow-[0_0_10px_#a3e635]" />
                      <span className="text-xs sm:text-sm font-bold text-white tracking-wide">
                        Harsh Unlimited // Production Telemetry
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] sm:text-xs px-2.5 py-0.5 rounded bg-lime-500/10 text-lime-400 border border-lime-500/30 flex items-center gap-1.5">
                        <Activity className="w-3 h-3 text-lime-400" />
                        <span>20.0 TPS</span>
                      </span>
                      <span className="text-[10px] sm:text-xs px-2.5 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/30">
                        LIVE EDGE
                      </span>
                    </div>
                  </div>

                  {/* Metrics Grid */}
                  <div className="grid grid-cols-3 gap-2.5 sm:gap-4 my-auto">
                    <div className="p-3 sm:p-4 rounded-xl bg-[#090818]/90 border border-purple-500/25 shadow-lg">
                      <div className="text-[10px] sm:text-xs text-purple-300/80 uppercase">
                        Concurrent Players
                      </div>
                      <div className="text-lg sm:text-2xl font-black text-lime-400 mt-1">
                        9 / 100
                      </div>
                      <div className="text-[9px] sm:text-[10px] text-slate-500 mt-0.5">
                        SMP Survival Node #1
                      </div>
                    </div>

                    <div className="p-3 sm:p-4 rounded-xl bg-[#090818]/90 border border-purple-500/25 shadow-lg">
                      <div className="text-[10px] sm:text-xs text-purple-300/80 uppercase">
                        Edge Ping
                      </div>
                      <div className="text-lg sm:text-2xl font-black text-purple-300 mt-1">
                        &lt; 15ms
                      </div>
                      <div className="text-[9px] sm:text-[10px] text-slate-500 mt-0.5">
                        Cloudflare Workers
                      </div>
                    </div>

                    <div className="p-3 sm:p-4 rounded-xl bg-[#090818]/90 border border-purple-500/25 shadow-lg">
                      <div className="text-[10px] sm:text-xs text-purple-300/80 uppercase">
                        Cashfree Gateway
                      </div>
                      <div className="text-lg sm:text-2xl font-black text-emerald-400 mt-1">
                        HMAC-SHA256
                      </div>
                      <div className="text-[9px] sm:text-[10px] text-slate-500 mt-0.5">
                        Direct UPI Automated
                      </div>
                    </div>
                  </div>

                  {/* Terminal Execution Status */}
                  <div className="p-3 rounded-lg bg-black/70 border border-purple-500/30 text-[10px] sm:text-xs text-lime-300 flex items-center justify-between font-mono">
                    <div className="flex items-center gap-2 truncate">
                      <span className="text-purple-400">$</span>
                      <span className="truncate">next build --turbopack &amp;&amp; vitest run</span>
                    </div>
                    <span className="text-purple-300 shrink-0 ml-2">
                      Ready in 420ms (100% Pass)
                    </span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* 2. THE HINGE - Connecting Lid to Base */}
          <div className="relative z-30 w-[28rem] sm:w-[42rem] md:w-[48rem] h-2.5 sm:h-3 bg-gradient-to-r from-[#141024] via-[#2a2245] to-[#141024] rounded-sm -my-1 border-y border-[#3d325c] shadow-lg flex items-center justify-center">
            <div className="w-16 h-1 bg-[#100d1e] rounded-full" />
          </div>

          {/* 3. THE BASE CHASSIS - Angled flat into the desk plane in 3D perspective */}
          <motion.div
            style={{
              scale: laptopScale,
              transformOrigin: "top center",
              transform: "rotateX(62deg)",
              transformStyle: "preserve-3d",
            }}
            className="relative z-10 w-[34rem] sm:w-[50rem] md:w-[56rem] h-[20rem] sm:h-[25rem] rounded-2xl bg-gradient-to-b from-[#130f26] via-[#0d0a1b] to-[#070510] border border-purple-500/30 p-3 sm:p-4 shadow-[0_30px_70px_rgba(0,0,0,0.85)] -mt-2 flex flex-col justify-between"
          >
            {/* Top Deck Info Strip */}
            <div className="w-full flex items-center justify-between px-3 py-1 rounded-md bg-[#080614] border border-purple-500/15 text-[9px] sm:text-[10px] font-mono text-purple-400">
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-lime-400 animate-pulse" />
                <span className="text-white font-bold">APPLE M3 MAX // 128GB UNIFIED RAM</span>
              </div>
              <div className="flex items-center gap-3 text-slate-400">
                <span className="text-lime-400">60 FPS HARDWARE</span>
                <span className="text-purple-300 hidden sm:inline">ZERO LAG</span>
              </div>
            </div>

            {/* Keyboard Deck Well with Stereo Speakers */}
            <div className="grid grid-cols-[1.2rem_1fr_1.2rem] sm:grid-cols-[2rem_1fr_2rem] gap-2 items-center my-auto">
              {/* Left Acoustic Speaker Grille */}
              <div className="h-32 sm:h-40 w-full flex flex-col justify-center gap-1 items-center opacity-40">
                {Array.from({ length: 16 }).map((_, i) => (
                  <div key={i} className="w-full flex justify-center gap-0.5">
                    <div className="w-0.5 h-0.5 rounded-full bg-purple-400/60" />
                    <div className="w-0.5 h-0.5 rounded-full bg-purple-400/30" />
                  </div>
                ))}
              </div>

              {/* Chiclet Keypad */}
              <div className="w-full bg-[#070512] p-1.5 sm:p-2 rounded-xl border border-purple-500/20 shadow-inner">
                <Keypad />
              </div>

              {/* Right Acoustic Speaker Grille */}
              <div className="h-32 sm:h-40 w-full flex flex-col justify-center gap-1 items-center opacity-40">
                {Array.from({ length: 16 }).map((_, i) => (
                  <div key={i} className="w-full flex justify-center gap-0.5">
                    <div className="w-0.5 h-0.5 rounded-full bg-purple-400/30" />
                    <div className="w-0.5 h-0.5 rounded-full bg-purple-400/60" />
                  </div>
                ))}
              </div>
            </div>

            {/* Force Touch Trackpad & Front Lip Groove */}
            <div className="flex flex-col items-center">
              <Trackpad />
              <div className="w-16 h-1 bg-[#282142] rounded-b-md mt-1 shadow-sm" />
            </div>
          </motion.div>

        </div>
      </div>
    </div>
  );
};

export const Trackpad = () => {
  return (
    <div className="w-40 sm:w-56 h-14 sm:h-18 rounded-xl bg-gradient-to-b from-[#110d24] to-[#0a0817] border border-purple-500/25 shadow-inner flex items-center justify-center">
      <div className="w-1.5 h-1.5 rounded-full bg-purple-500/30" />
    </div>
  );
};

export const Lid = ({ children, src }: { children?: React.ReactNode; src?: string }) => (
  <div className="relative w-full h-full">{children}</div>
);

export const Keypad = () => {
  return (
    <div className="h-full rounded-md bg-[#070611] p-1 border border-purple-500/20 space-y-1">
      {/* Row 1: Function Keys */}
      <div className="flex gap-0.5 sm:gap-1 justify-center">
        {["esc", "F1", "F2", "F3", "F4", "F5", "F6", "F7", "F8", "F9", "F10", "F11", "F12"].map((k) => (
          <div
            key={k}
            className="h-3.5 sm:h-4 flex-1 rounded-[2px] bg-[#121026] text-[6px] sm:text-[7px] text-slate-400 flex items-center justify-center font-mono border border-purple-500/10"
          >
            {k}
          </div>
        ))}
      </div>

      {/* Row 2: Numbers */}
      <div className="flex gap-0.5 sm:gap-1 justify-center">
        {["~", "1", "2", "3", "4", "5", "6", "7", "8", "9", "0", "-", "=", "del"].map((k) => (
          <div
            key={k}
            className="h-4 sm:h-5 flex-1 rounded-[2px] bg-[#15122e] text-[7px] sm:text-[8px] text-slate-300 flex items-center justify-center font-mono border border-purple-500/10"
          >
            {k}
          </div>
        ))}
      </div>

      {/* Row 3: QWERTY */}
      <div className="flex gap-0.5 sm:gap-1 justify-center">
        {["tab", "Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P", "[", "]", "\\"].map((k) => (
          <div
            key={k}
            className="h-4 sm:h-5 flex-1 rounded-[2px] bg-[#15122e] text-[7px] sm:text-[8px] text-slate-300 flex items-center justify-center font-mono border border-purple-500/10"
          >
            {k}
          </div>
        ))}
      </div>

      {/* Row 4: ASDF */}
      <div className="flex gap-0.5 sm:gap-1 justify-center">
        {["caps", "A", "S", "D", "F", "G", "H", "J", "K", "L", ";", "'", "return"].map((k) => (
          <div
            key={k}
            className="h-4 sm:h-5 flex-1 rounded-[2px] bg-[#15122e] text-[7px] sm:text-[8px] text-slate-300 flex items-center justify-center font-mono border border-purple-500/10"
          >
            {k}
          </div>
        ))}
      </div>

      {/* Row 5: Modifier Keys & Spacebar */}
      <div className="flex gap-0.5 sm:gap-1 justify-center items-center">
        <div className="h-4 sm:h-5 w-8 sm:w-12 rounded-[2px] bg-[#121026] text-[7px] sm:text-[8px] text-slate-400 flex items-center justify-center font-mono border border-purple-500/10">
          fn
        </div>
        <div className="h-4 sm:h-5 w-7 sm:w-10 rounded-[2px] bg-[#121026] text-[7px] sm:text-[8px] text-slate-400 flex items-center justify-center font-mono border border-purple-500/10">
          ctrl
        </div>
        <div className="h-4 sm:h-5 w-7 sm:w-10 rounded-[2px] bg-[#121026] text-[7px] sm:text-[8px] text-slate-400 flex items-center justify-center font-mono border border-purple-500/10">
          opt
        </div>
        <div className="h-4 sm:h-5 w-8 sm:w-12 rounded-[2px] bg-[#121026] text-[7px] sm:text-[8px] text-slate-400 flex items-center justify-center font-mono border border-purple-500/10">
          cmd
        </div>
        <div className="h-4 sm:h-5 flex-1 rounded-[2px] bg-[#1a1738] text-[7px] text-slate-300 flex items-center justify-center border border-purple-500/15" />
        <div className="h-4 sm:h-5 w-8 sm:w-12 rounded-[2px] bg-[#121026] text-[7px] sm:text-[8px] text-slate-400 flex items-center justify-center font-mono border border-purple-500/10">
          cmd
        </div>
        <div className="h-4 sm:h-5 w-7 sm:w-10 rounded-[2px] bg-[#121026] text-[7px] sm:text-[8px] text-slate-400 flex items-center justify-center font-mono border border-purple-500/10">
          opt
        </div>
      </div>
    </div>
  );
};
