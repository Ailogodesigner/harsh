"use client";

import { ArrowUp, Mail, Globe, Heart } from "lucide-react";
import CopyButton from "./CopyButton";
import DiscordIcon from "./DiscordIcon";

export default function PortfolioFooter() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative bg-[#05050a] border-t border-purple-500/20 pt-16 pb-32 overflow-hidden text-slate-400">
      {/* Subtle top atmospheric glow in violet & lime */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-purple-500/15">
          {/* Brand & Bio */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 via-fuchsia-500 to-lime-400 p-[1px]">
                <div className="w-full h-full bg-[#0a0914] rounded-[11px] flex items-center justify-center font-black text-sm text-lime-400 font-mono">
                  NN
                </div>
              </div>
              <span className="font-black text-white text-lg tracking-tight">
                NOTIXNODE <span className="text-purple-400 font-normal text-sm font-mono">// Dev Studio</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Full-Stack Web Architect specialized in building
              resilient web apps, modern e-commerce stores, real-time telemetry systems,
              and low-latency edge architectures.
            </p>
            <div className="pt-2 flex items-center gap-2">
              <span className="text-xs text-purple-300/70 font-mono">Official Hub:</span>
              <a
                href="https://dsc.gg/notixnode"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-lime-400 hover:underline font-mono"
              >
                dsc.gg/notixnode
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-purple-300">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#about" className="hover:text-lime-400 transition-colors">
                  About Me
                </a>
              </li>
              <li>
                <a href="#projects" className="hover:text-lime-400 transition-colors">
                  Featured Projects
                </a>
              </li>
              <li>
                <a href="#skills" className="hover:text-lime-400 transition-colors">
                  Skills &amp; Tech Stack
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-lime-400 transition-colors">
                  Services Offered
                </a>
              </li>
              <li>
                <a href="#hosting" className="hover:text-lime-400 text-purple-300 font-semibold transition-colors flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-lime-400 animate-pulse" />
                  <span>Bot Hosting Plans</span>
                </a>
              </li>
              <li>
                <a href="/bot-order" className="hover:text-lime-400 text-lime-400 font-semibold transition-colors flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-lime-400" />
                  <span>Custom Bot Builder</span>
                </a>
              </li>
              <li>
                <a href="/login" className="hover:text-lime-400 transition-colors">
                  Client &amp; Admin Login
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-lime-400 transition-colors">
                  Hire Me / Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Connect & Socials */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-purple-300">
              Official Channels
            </h4>
            <div className="flex flex-col space-y-2.5 text-xs">
              {/* Discord Dedicated Pill */}
              <a
                href="https://dsc.gg/notixnode"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-2.5 rounded-xl bg-[#0d0b1e] border border-[#5865F2]/30 hover:border-[#5865F2] hover:bg-[#5865F2]/10 text-white transition-all group shadow-sm"
              >
                <div className="flex items-center gap-2">
                  <DiscordIcon className="w-4 h-4 text-[#5865F2]" />
                  <div>
                    <span className="font-mono text-xs font-bold text-slate-200 group-hover:text-white block">
                      NOTIXNODE
                    </span>
                    <span className="text-[10px] text-purple-300/70 font-mono block">
                      Best Discord Setups &amp; Custom Bots
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#5865F2]/20 text-[#8ea1e1] border border-[#5865F2]/40 whitespace-nowrap">
                  dsc.gg/notixnode
                </span>
              </a>

              <div className="flex items-center gap-2 text-slate-400 pt-1">
                <Globe className="w-4 h-4 text-amber-400" />
                <span>Worldwide Remote</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500">
            <span>© {new Date().getFullYear()} NOTIXNODE. Built with Next.js 16, React 19 &amp; Tailwind CSS.</span>
          </div>

          <button
            onClick={scrollToTop}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0e0c1c] border border-purple-500/20 text-slate-300 hover:text-lime-400 hover:border-lime-400/40 transition-all text-xs cursor-pointer"
          >
            <span>Back to top</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Massive NOTIXNODE Typographic Brand Watermark at End */}
        <div className="pt-16 pb-4 relative flex flex-col items-center justify-center w-full overflow-hidden">
          <a
            href="https://dsc.gg/notixnode"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 mb-4 px-4 py-1.5 rounded-full bg-[#5865F2]/10 border border-[#5865F2]/30 hover:border-[#5865F2] hover:bg-[#5865F2]/20 transition-all shadow-md group"
          >
            <DiscordIcon className="w-4 h-4 text-[#5865F2]" />
            <span className="text-[11px] font-mono text-[#8ea1e1] group-hover:text-white font-bold uppercase tracking-wider">
              dsc.gg/notixnode • Best Discord Setups &amp; Custom Bot Development
            </span>
          </a>

          {/* Big Text NOTIXNODE - Fluid responsive sizing: NEVER cut off */}
          <div className="w-full flex items-center justify-center my-2 px-2">
            <h1 className="text-[clamp(2.6rem,8.2vw,7.5rem)] font-black tracking-tight uppercase select-none text-center bg-gradient-to-b from-white/30 via-purple-300/15 to-transparent bg-clip-text text-transparent leading-none pointer-events-none transition-all duration-700 whitespace-nowrap drop-shadow-[0_0_35px_rgba(168,85,247,0.15)]">
              NOTIXNODE
            </h1>
          </div>

          <p className="text-xs sm:text-sm font-mono text-purple-300/80 text-center mt-3 max-w-lg">
            Best Discord Setups • Custom Discord Bots • High-Performance Web Architecture
          </p>

          <div className="w-full max-w-md h-[1px] bg-gradient-to-r from-transparent via-[#5865F2]/50 to-transparent mt-4" />
        </div>
      </div>
    </footer>
  );
}
