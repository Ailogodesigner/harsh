"use client";

import React, { useState, useEffect } from "react";
import {
  Home,
  User,
  Briefcase,
  Layers,
  Cpu,
  Mail,
  Volume2,
  VolumeX,
} from "lucide-react";
import DiscordIcon from "../DiscordIcon";
import {
  playCyberClick,
  playCyberHover,
  toggleSound,
  initSoundState,
} from "./SoundEffects";

export default function DynamicIslandDock() {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const [soundOn, setSoundOn] = useState(true);

  useEffect(() => {
    setSoundOn(initSoundState());
  }, []);

  const handleSoundToggle = () => {
    const newState = toggleSound();
    setSoundOn(newState);
    if (newState) {
      playCyberClick();
    }
  };

  const navItems = [
    { label: "Home", href: "#", icon: Home },
    { label: "About", href: "#about", icon: User },
    { label: "Architecture", href: "#architecture", icon: Cpu },
    { label: "Projects", href: "#projects", icon: Briefcase },
    { label: "Skills", href: "#skills", icon: Layers },
    { label: "Contact", href: "#contact", icon: Mail },
  ];

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-auto">
      <div className="flex items-center gap-1.5 p-2 rounded-full bg-[#0a0915]/85 backdrop-blur-xl border border-purple-500/30 shadow-[0_0_35px_-5px_rgba(168,85,247,0.35)] transition-all">
        {navItems.map((item, idx) => {
          const Icon = item.icon;
          const isHovered = hoveredIdx === idx;
          const isAdjacent = hoveredIdx !== null && Math.abs(hoveredIdx - idx) === 1;

          return (
            <div key={item.label} className="relative group">
              <a
                href={item.href}
                onMouseEnter={() => {
                  setHoveredIdx(idx);
                  playCyberHover();
                }}
                onMouseLeave={() => setHoveredIdx(null)}
                onClick={() => playCyberClick()}
                style={{
                  transform: isHovered
                    ? "scale(1.28) translateY(-6px)"
                    : isAdjacent
                    ? "scale(1.12) translateY(-2px)"
                    : "scale(1)",
                }}
                className="w-10 h-10 rounded-full flex items-center justify-center text-slate-300 hover:text-white hover:bg-purple-500/20 active:bg-lime-400 active:text-black transition-all duration-200"
                aria-label={item.label}
              >
                <Icon className="w-4 h-4" />
              </a>

              {/* Hover Tooltip */}
              <div className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-md bg-[#05050a] border border-purple-500/40 text-[10px] font-mono font-bold text-lime-400 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg whitespace-nowrap">
                {item.label}
              </div>
            </div>
          );
        })}

        {/* Divider */}
        <div className="w-[1px] h-6 bg-purple-500/30 mx-1" />

        {/* MacBook 3D Showcase Shortcut (In-Site, No External Redirect) */}
        <div className="relative group">
          <a
            href="#macbook"
            onMouseEnter={() => {
              setHoveredIdx(10);
              playCyberHover();
            }}
            onMouseLeave={() => setHoveredIdx(null)}
            onClick={() => playCyberClick()}
            style={{
              transform: hoveredIdx === 10 ? "scale(1.28) translateY(-6px)" : "scale(1)",
            }}
            className="w-10 h-10 rounded-full flex items-center justify-center text-slate-300 hover:text-white hover:bg-purple-500/20 active:bg-lime-400 active:text-black transition-all duration-200"
            aria-label="3D MacBook Showcase"
          >
            <Cpu className="w-4 h-4 text-purple-400" />
          </a>
          <div className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-md bg-[#05050a] border border-purple-500/40 text-[10px] font-mono font-bold text-lime-400 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg whitespace-nowrap">
            3D MacBook
          </div>
        </div>

        {/* Discord Link */}
        <div className="relative group">
          <a
            href="https://discord.gg/notixnode"
            target="_blank"
            rel="noopener noreferrer"
            onMouseEnter={() => {
              setHoveredIdx(12);
              playCyberHover();
            }}
            onMouseLeave={() => setHoveredIdx(null)}
            onClick={() => playCyberClick()}
            style={{
              transform: hoveredIdx === 12 ? "scale(1.28) translateY(-6px)" : "scale(1)",
            }}
            className="w-10 h-10 rounded-full flex items-center justify-center text-slate-300 hover:text-white hover:bg-[#5865F2]/20 active:bg-[#5865F2] active:text-white transition-all duration-200"
            aria-label="Join Discord"
          >
            <DiscordIcon className="w-4 h-4 text-[#5865F2]" />
          </a>
          <div className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-md bg-[#05050a] border border-[#5865F2]/40 text-[10px] font-mono font-bold text-[#8ea1e1] opacity-0 group-hover:opacity-100 transition-opacity shadow-lg whitespace-nowrap">
            Discord: NOTIXNODE
          </div>
        </div>

        {/* Audio Toggle */}
        <div className="relative group">
          <button
            type="button"
            onClick={handleSoundToggle}
            onMouseEnter={() => {
              setHoveredIdx(11);
              playCyberHover();
            }}
            onMouseLeave={() => setHoveredIdx(null)}
            style={{
              transform: hoveredIdx === 11 ? "scale(1.28) translateY(-6px)" : "scale(1)",
            }}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
              soundOn
                ? "text-lime-400 hover:bg-lime-400/20"
                : "text-slate-500 hover:bg-slate-800"
            }`}
            aria-label={soundOn ? "Mute Cyber Audio" : "Unmute Cyber Audio"}
          >
            {soundOn ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>
          <div className="pointer-events-none absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-md bg-[#05050a] border border-purple-500/40 text-[10px] font-mono font-bold text-lime-400 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg whitespace-nowrap">
            {soundOn ? "Audio: On" : "Audio: Muted"}
          </div>
        </div>
      </div>
    </div>
  );
}
