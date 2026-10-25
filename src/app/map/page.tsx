"use client";

import { useState } from "react";
import { Map as MapIcon, Maximize2, Compass, Layers, Info, ExternalLink, Shield } from "lucide-react";

export default function MapPage() {
  const [selectedWorld, setSelectedWorld] = useState<"survival" | "lifesteal" | "boxpvp">("survival");
  const [isFullscreen, setIsFullscreen] = useState(false);

  const worlds = [
    {
      id: "survival",
      name: "Survival SMP World",
      description: "Explore the vast 20,000 x 20,000 custom terrain, player claims, and town landmarks.",
      color: "text-emerald-400 border-emerald-500/30",
    },
    {
      id: "lifesteal",
      name: "Lifesteal Combat Realm",
      description: "High stakes wilderness, spawn safe-zones, and player base locations.",
      color: "text-rose-400 border-rose-500/30",
    },
    {
      id: "boxpvp",
      name: "BoxPvP Arena & Mines",
      description: "Tiered mining pits, duel arenas, and central loot drop crates.",
      color: "text-amber-400 border-amber-500/30",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
            Real-Time Dynmap &bull; BlueMap
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight flex items-center gap-3">
            <MapIcon className="w-8 h-8 text-emerald-400" />
            <span>LIVE WEB MAP</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time visual map of the Harsh Unlimited worlds, land claims, and active players.
          </p>
        </div>

        {/* World Selectors */}
        <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
          {worlds.map((w) => (
            <button
              key={w.id}
              type="button"
              onClick={() => setSelectedWorld(w.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedWorld === w.id
                  ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {w.name.split(" ")[0]}
            </button>
          ))}
        </div>
      </div>

      {/* Map Container */}
      <div
        className={`glass-panel rounded-3xl overflow-hidden border border-slate-800 transition-all ${
          isFullscreen
            ? "fixed inset-0 z-50 rounded-none bg-slate-950"
            : "relative h-[650px] shadow-2xl"
        }`}
      >
        {/* Map Top Control Bar */}
        <div className="bg-slate-950/90 border-b border-slate-800 px-6 py-3.5 flex items-center justify-between z-10 relative">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              {worlds.find((w) => w.id === selectedWorld)?.name}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-200 transition-colors cursor-pointer"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>{isFullscreen ? "Exit Fullscreen" : "Fullscreen"}</span>
            </button>
          </div>
        </div>

        {/* Map Canvas / Simulated Interactive Viewport */}
        <div className="w-full h-full relative flex items-center justify-center bg-[#090b10] mc-grid-pattern">
          {/* Decorative Terrain Elements */}
          <div className="absolute inset-0 opacity-40 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />

          {/* Interactive World Visuals */}
          <div className="text-center space-y-4 max-w-md p-8 glass-panel rounded-2xl border border-emerald-500/30 relative z-10">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mx-auto flex items-center justify-center animate-float">
              <Compass className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-lg font-bold text-white">
                {worlds.find((w) => w.id === selectedWorld)?.name}
              </h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                {worlds.find((w) => w.id === selectedWorld)?.description}
              </p>
            </div>

            <div className="p-3 rounded-xl bg-slate-950/90 border border-slate-800 text-[11px] text-slate-400 space-y-1">
              <div className="flex justify-between">
                <span>World Border:</span>
                <span className="font-mono text-emerald-400">20,000 x 20,000</span>
              </div>
              <div className="flex justify-between">
                <span>Spawn Coordinates:</span>
                <span className="font-mono text-emerald-400">X: 0 | Y: 72 | Z: 0</span>
              </div>
              <div className="flex justify-between">
                <span>Live Rendering:</span>
                <span className="font-mono text-cyan-400">BlueMap / Dynmap Active</span>
              </div>
            </div>

            <div className="pt-2">
              <span className="text-[11px] text-slate-400 block mb-2">
                Join in-game to see your live position on map:
              </span>
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs">
                <span>play.harshunlimited.fun</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
