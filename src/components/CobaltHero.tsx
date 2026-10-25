"use client";

import { useState, useEffect } from "react";
import CopyButton from "./CopyButton";
import { Check, Copy } from "lucide-react";

export default function CobaltHero() {
  const [serverOnline, setServerOnline] = useState(true);
  const [playerCount, setPlayerCount] = useState<number>(0);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/minecraft/status")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setServerOnline(Boolean(data.online));
          setPlayerCount(data.players?.online || 0);
        }
      })
      .catch(() => {});
  }, []);

  const handleCopyIp = async () => {
    try {
      await navigator.clipboard.writeText("play.harshunlimited.fun");
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="relative w-full pt-8 pb-12 overflow-hidden">
      {/* Background radial atmosphere */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[350px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
        {/* Left: Server Status Box with Sliding Reel (AppleMC style) */}
        <div
          onClick={handleCopyIp}
          className="group cursor-pointer flex items-center gap-4 bg-slate-950/80 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/50 p-4 sm:p-5 rounded-2xl transition-all duration-300 shadow-xl w-full sm:w-auto"
        >
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform shrink-0">
            {copied ? (
              <Check className="w-6 h-6 text-emerald-400" />
            ) : (
              <svg className="w-6 h-6 fill-current text-emerald-400" viewBox="0 0 512 512">
                <path d="M0 256a256 256 0 1 1 512 0A256 256 0 1 1 0 256zM188.3 147.1c-7.6 4.2-12.3 12.3-12.3 20.9V344c0 8.7 4.7 16.7 12.3 20.9s16.8 4.1 24.3-.5l144-88c7.1-4.4 11.5-12.1 11.5-20.5s-4.4-16.1-11.5-20.5l-144-88c-7.4-4.5-16.7-4.7-24.3-.5z" />
              </svg>
            )}
          </div>

          <div className="text-left overflow-hidden">
            <div className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>{serverOnline ? `${playerCount} Players Online` : "Network Starting"}</span>
            </div>

            {/* Sliding Reel Text */}
            <div className="relative h-5 overflow-hidden mt-0.5">
              <div className="group-hover:-translate-y-5 transition-transform duration-300">
                <div className="h-5 text-sm font-black text-white font-mono flex items-center">
                  play.harshunlimited.fun
                </div>
                <div className="h-5 text-xs font-semibold text-emerald-300 flex items-center gap-1">
                  <Copy className="w-3 h-3" />
                  <span>Click to copy IP</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Center: Glowing Animated Harsh Unlimited Mascot Logo */}
        <div className="flex flex-col items-center text-center group">
          <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-3xl bg-gradient-to-br from-emerald-400 via-green-500 to-teal-700 p-1 shadow-2xl shadow-emerald-500/30 group-hover:shadow-emerald-500/60 group-hover:scale-105 transition-all duration-500 animate-float">
            <div className="w-full h-full bg-[#08090d] rounded-[22px] overflow-hidden flex items-center justify-center p-1 relative">
              <img
                src="/logo.png"
                alt="Harsh Unlimited Mascot Logo"
                className="w-full h-full object-cover rounded-[18px] filter drop-shadow-[0_4px_12px_rgba(16,185,129,0.3)]"
              />
            </div>
          </div>

          <div className="mt-4">
            <h1 className="text-2xl sm:text-3xl font-black tracking-wider text-white uppercase">
              Harsh <span className="text-emerald-400">Unlimited</span>
            </h1>
            <p className="text-[11px] uppercase tracking-widest text-slate-400 font-bold mt-0.5">
              India&apos;s Premier Minecraft Experience
            </p>
          </div>
        </div>

        {/* Right: Discord Box with Sliding Reel (AppleMC style) */}
        <a
          href="https://discord.gg/harshunlimited"
          target="_blank"
          rel="noopener noreferrer"
          className="group flex items-center gap-4 bg-slate-950/80 hover:bg-slate-900 border border-slate-800 hover:border-[#5865F2]/50 p-4 sm:p-5 rounded-2xl transition-all duration-300 shadow-xl w-full sm:w-auto"
        >
          <div className="w-12 h-12 rounded-xl bg-[#5865F2]/10 border border-[#5865F2]/30 flex items-center justify-center text-[#5865F2] group-hover:scale-105 transition-transform shrink-0">
            <svg className="w-6 h-6 fill-current text-[#5865F2]" viewBox="0 0 245 240">
              <path d="M104.4 103.9c-5.7 0-10.2 5-10.2 11.1s4.6 11.1 10.2 11.1c5.7 0 10.2-5 10.2-11.1.1-6.1-4.5-11.1-10.2-11.1zM140.9 103.9c-5.7 0-10.2 5-10.2 11.1s4.6 11.1 10.2 11.1c5.7 0 10.2-5 10.2-11.1s-4.5-11.1-10.2-11.1z" />
              <path d="M189.5 20h-134C44.2 20 35 29.2 35 40.6v135.2c0 11.4 9.2 20.6 20.5 20.6h113.4l-5.3-18.5 12.8 11.9 12.1 11.2 21.5 19V40.6c0-11.4-9.2-20.6-20.5-20.6zm-38.6 130.6s-3.6-4.3-6.6-8.1c13.1-3.7 18.1-11.9 18.1-11.9-4.1 2.7-8 4.6-11.5 5.9-5 2.1-9.8 3.5-14.5 4.3-9.6 1.8-18.4 1.3-25.9-.1-5.7-1.1-10.6-2.7-14.7-4.3-2.3-.9-4.8-2-7.3-3.4-.3-.2-.6-.3-.9-.5-.2-.1-.3-.2-.4-.3-1.8-1-2.8-1.7-2.8-1.7s4.8 8 17.5 11.8c-3 3.8-6.7 8.3-6.7 8.3-22.1-.7-30.5-15.2-30.5-15.2 0-32.2 14.4-58.3 14.4-58.3 14.4-10.8 28.1-10.5 28.1-10.5l1 1.2c-18 5.2-26.3 13.1-26.3 13.1s2.2-1.2 5.9-2.9c10.7-4.7 19.2-6 22.7-6.3.6-.1 1.1-.2 1.7-.2 6.1-.8 13-1 20.2-.2 9.5 1.1 19.7 3.9 30.1 9.6 0 0-7.9-7.5-24.9-12.7l1.4-1.6s13.7-.3 28.1 10.5c0 0 14.4 26.1 14.4 58.3 0 0-8.5 14.5-30.6 15.2z" />
            </svg>
          </div>

          <div className="text-left overflow-hidden">
            <div className="text-xs font-bold text-[#5865F2] flex items-center gap-1.5 uppercase tracking-wider">
              <span className="w-2 h-2 rounded-full bg-[#5865F2] animate-pulse" />
              <span>Official Discord</span>
            </div>

            {/* Sliding Reel Text */}
            <div className="relative h-5 overflow-hidden mt-0.5">
              <div className="group-hover:-translate-y-5 transition-transform duration-300">
                <div className="h-5 text-sm font-black text-white font-mono flex items-center">
                  discord.gg/harshunlimited
                </div>
                <div className="h-5 text-xs font-semibold text-[#8a94fd] flex items-center gap-1">
                  <span>Click to join community</span>
                </div>
              </div>
            </div>
          </div>
        </a>
      </div>
    </div>
  );
}
