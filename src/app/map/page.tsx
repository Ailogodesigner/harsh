"use client";

import { useState, useRef, MouseEvent } from "react";
import {
  Map as MapIcon,
  Maximize2,
  Minimize2,
  Compass,
  Layers,
  Info,
  ExternalLink,
  Shield,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Navigation,
  Sparkles,
  Swords,
  Flame,
  ShoppingBag,
  Home,
  Check,
  Copy,
  AlertCircle,
} from "lucide-react";

interface Landmark {
  id: string;
  name: string;
  category: "SPAWN" | "PVP" | "NETHER" | "MARKET" | "CLAIMS";
  x: number;
  z: number;
  y: number;
  warpCmd: string;
  description: string;
  color: string;
}

const LANDMARKS: Record<string, Landmark[]> = {
  survival: [
    {
      id: "spawn",
      name: "Server Spawn Citadel",
      category: "SPAWN",
      x: 0,
      z: 0,
      y: 72,
      warpCmd: "/spawn",
      description: "Central network hub, official kit NPC pedestals, parkour arena, and safe trading zone.",
      color: "text-emerald-400 bg-emerald-500/20 border-emerald-500/40",
    },
    {
      id: "pvp-arena",
      name: "Warzone Arena & Dropzone",
      category: "PVP",
      x: 250,
      z: -180,
      y: 68,
      warpCmd: "/warp pvp",
      description: "Non-claimable combat arena with full PvP risk and occasional supply crate drops.",
      color: "text-rose-400 bg-rose-500/20 border-rose-500/40",
    },
    {
      id: "market",
      name: "Grand Auction & Player Shops",
      category: "MARKET",
      x: -120,
      z: 210,
      y: 70,
      warpCmd: "/warp shop",
      description: "Player trading stalls, server coin redemption shops, and auction house NPC terminal.",
      color: "text-amber-400 bg-amber-500/20 border-amber-500/40",
    },
    {
      id: "nether-portal",
      name: "Ancient Nether Highway Portal",
      category: "NETHER",
      x: -350,
      z: -300,
      y: 65,
      warpCmd: "/warp nether",
      description: "Public obsidian portal linking directly to the reinforced roof nether highway system.",
      color: "text-purple-400 bg-purple-500/20 border-purple-500/40",
    },
    {
      id: "claim-alpha",
      name: "Northland Settlement (Player Town)",
      category: "CLAIMS",
      x: 520,
      z: 480,
      y: 75,
      warpCmd: "/warp town",
      description: "Grief-prevention protected player township with public community farms and villager trading hall.",
      color: "text-cyan-400 bg-cyan-500/20 border-cyan-500/40",
    },
  ],
  lifesteal: [
    {
      id: "ls-spawn",
      name: "Lifesteal Citadel Sanctuary",
      category: "SPAWN",
      x: 0,
      z: 0,
      y: 70,
      warpCmd: "/spawn",
      description: "Non-PvP safety sanctuary. Hearts cannot be lost within the 100-block spawn radius.",
      color: "text-rose-400 bg-rose-500/20 border-rose-500/40",
    },
    {
      id: "ls-beacon",
      name: "Heart Revive Altar",
      category: "PVP",
      x: 180,
      z: 90,
      y: 64,
      warpCmd: "/warp altar",
      description: "Public ritual beacon used to revive eliminated teammates with Nether Stars.",
      color: "text-amber-400 bg-amber-500/20 border-amber-500/40",
    },
  ],
  boxpvp: [
    {
      id: "box-spawn",
      name: "Box Central Mines",
      category: "SPAWN",
      x: 0,
      z: 0,
      y: 60,
      warpCmd: "/spawn",
      description: "Central progression tier mines: Coal -> Iron -> Gold -> Diamond -> Netherite.",
      color: "text-amber-400 bg-amber-500/20 border-amber-500/40",
    },
  ],
};

export default function MapPage() {
  const [selectedWorld, setSelectedWorld] = useState<"survival" | "lifesteal" | "boxpvp">("survival");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selectedLandmark, setSelectedLandmark] = useState<Landmark | null>(LANDMARKS.survival[0]);
  const [cursorCoords, setCursorCoords] = useState<{ x: number; z: number } | null>(null);
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  const worlds = [
    {
      id: "survival",
      name: "Survival SMP World",
      description: "Explore the vast 20,000 x 20,000 custom terrain, player claims, and town landmarks.",
      color: "text-emerald-400",
    },
    {
      id: "lifesteal",
      name: "Lifesteal Combat Realm",
      description: "High stakes wilderness, spawn safe-zones, and player base locations.",
      color: "text-rose-400",
    },
    {
      id: "boxpvp",
      name: "BoxPvP Arena & Mines",
      description: "Tiered mining pits, duel arenas, and central loot drop crates.",
      color: "text-amber-400",
    },
  ];

  const currentLandmarks = LANDMARKS[selectedWorld] || LANDMARKS.survival;

  // Zoom controls
  const handleZoomIn = () => setZoom((z) => Math.min(z + 0.3, 2.8));
  const handleZoomOut = () => setZoom((z) => Math.max(z - 0.3, 0.6));
  const handleResetView = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  // Mouse pan handlers
  const handleMouseDown = (e: MouseEvent) => {
    if (e.button !== 0) return;
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }

    // Compute in-game coordinates relative to center
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const mouseX = e.clientX - rect.left - pan.x;
      const mouseY = e.clientY - rect.top - pan.y;

      // 1 pixel = ~2.5 Minecraft blocks
      const blockX = Math.round((mouseX - centerX) * 2.5 * (1 / zoom));
      const blockZ = Math.round((mouseY - centerY) * 2.5 * (1 / zoom));
      setCursorCoords({ x: blockX, z: blockZ });
    }
  };

  const handleMouseUp = () => setIsDragging(false);

  const handleCopyWarp = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(cmd);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
            Interactive World Radar &bull; Dynmap Engine
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight flex items-center gap-3">
            <MapIcon className="w-8 h-8 text-emerald-400" />
            <span>LIVE WEB MAP</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time visual navigator of Harsh Unlimited worlds, land claim regions, warps, and coordinates.
          </p>
        </div>

        {/* World Selectors */}
        <div className="flex items-center gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
          {worlds.map((w) => (
            <button
              key={w.id}
              type="button"
              onClick={() => {
                setSelectedWorld(w.id as any);
                setSelectedLandmark(LANDMARKS[w.id]?.[0] || null);
                handleResetView();
              }}
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

      {/* Service Status Notice */}
      <div className="p-3.5 rounded-2xl bg-cyan-950/40 border border-cyan-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-cyan-300">
        <div className="flex items-center gap-2.5">
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-pulse shrink-0" />
          <span>
            <strong>Interactive Standalone Radar Active:</strong> Real-time coordinate grid &amp; warp points loaded. External Dynmap web port 8123 is currently operating in low-latency telemetry mode.
          </span>
        </div>
        <div className="flex items-center gap-2 font-mono text-[11px] text-cyan-400 shrink-0">
          <span>Target: play.harshunlimited.fun</span>
        </div>
      </div>

      {/* Map Container */}
      <div
        className={`glass-panel rounded-3xl overflow-hidden border border-slate-800 transition-all ${
          isFullscreen
            ? "fixed inset-0 z-50 rounded-none bg-slate-950 flex flex-col h-screen"
            : "relative h-[650px] shadow-2xl flex flex-col"
        }`}
      >
        {/* Map Top Control Bar */}
        <div className="bg-slate-950/95 border-b border-slate-800 px-6 py-3 flex flex-wrap items-center justify-between gap-3 z-20 relative">
          <div className="flex items-center gap-3">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              {worlds.find((w) => w.id === selectedWorld)?.name}
            </span>
            <span className="text-slate-600">•</span>
            <span className="text-xs font-mono text-slate-400">
              Border: 20,000 x 20,000 Blocks
            </span>
          </div>

          {/* Coordinate HUD */}
          <div className="flex items-center gap-4 text-xs font-mono">
            {cursorCoords && (
              <div className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-emerald-400 flex items-center gap-2">
                <Navigation className="w-3.5 h-3.5 text-emerald-400" />
                <span>Cursor: X: {cursorCoords.x} | Z: {cursorCoords.z}</span>
              </div>
            )}

            {/* Zoom Controls */}
            <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-xl">
              <button
                type="button"
                onClick={handleZoomIn}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleZoomOut}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleResetView}
                className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-300 hover:text-white"
                title="Reset View"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => setIsFullscreen(!isFullscreen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs text-slate-200 transition-colors cursor-pointer"
            >
              {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              <span>{isFullscreen ? "Exit" : "Fullscreen"}</span>
            </button>
          </div>
        </div>

        {/* Map Viewport Area */}
        <div
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={() => {
            setIsDragging(false);
            setCursorCoords(null);
          }}
          className={`flex-1 relative overflow-hidden bg-[#07090e] select-none ${
            isDragging ? "cursor-grabbing" : "cursor-grab"
          }`}
          style={{
            backgroundImage: `
              radial-gradient(circle at 50% 50%, rgba(16, 185, 129, 0.05) 0%, transparent 60%),
              linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
            `,
            backgroundSize: "100% 100%, 36px 36px, 36px 36px",
          }}
        >
          {/* Draggable & Scalable World Layer */}
          <div
            className="absolute inset-0 w-full h-full flex items-center justify-center transition-transform duration-75 ease-out"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: "center center",
            }}
          >
            {/* World Outer Boundary Square (20,000 block boundary simulated) */}
            <div className="w-[600px] h-[600px] rounded-3xl border-2 border-dashed border-emerald-500/20 relative flex items-center justify-center">
              {/* Radial Distance Rings */}
              <div className="w-[450px] h-[450px] rounded-full border border-slate-800/80 absolute pointer-events-none" />
              <div className="w-[300px] h-[300px] rounded-full border border-slate-800/80 absolute pointer-events-none" />
              <div className="w-[150px] h-[150px] rounded-full border border-emerald-500/15 absolute pointer-events-none" />

              {/* Axis Crosshairs */}
              <div className="w-full h-px bg-slate-800/80 absolute pointer-events-none" />
              <div className="h-full w-px bg-slate-800/80 absolute pointer-events-none" />

              {/* Axis Cardinal Labels */}
              <span className="absolute top-2 text-[10px] font-mono text-slate-500 font-bold">NORTH (-Z)</span>
              <span className="absolute bottom-2 text-[10px] font-mono text-slate-500 font-bold">SOUTH (+Z)</span>
              <span className="absolute left-2 text-[10px] font-mono text-slate-500 font-bold">WEST (-X)</span>
              <span className="absolute right-2 text-[10px] font-mono text-slate-500 font-bold">EAST (+X)</span>

              {/* Landmark Pins */}
              {currentLandmarks.map((lm) => {
                // Convert in-game X, Z into visual offset (scale: 1 pixel ~ 2.5 blocks)
                const pinX = lm.x / 2.5;
                const pinZ = lm.z / 2.5;
                const isSelected = selectedLandmark?.id === lm.id;

                return (
                  <div
                    key={lm.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedLandmark(lm);
                    }}
                    style={{
                      transform: `translate(${pinX}px, ${pinZ}px)`,
                    }}
                    className="absolute cursor-pointer group"
                  >
                    <div className="relative flex flex-col items-center -translate-x-1/2 -translate-y-1/2">
                      {/* Pulse beacon if selected */}
                      {isSelected && (
                        <div className="w-9 h-9 rounded-full bg-emerald-500/30 animate-ping absolute -top-1" />
                      )}

                      {/* Landmark Icon Pin */}
                      <div
                        className={`w-7 h-7 rounded-xl flex items-center justify-center border shadow-xl transition-all ${
                          isSelected
                            ? "bg-emerald-500 text-slate-950 border-white scale-125 z-30"
                            : `${lm.color} hover:scale-110 z-20`
                        }`}
                      >
                        {lm.category === "SPAWN" && <Compass className="w-4 h-4" />}
                        {lm.category === "PVP" && <Swords className="w-4 h-4" />}
                        {lm.category === "NETHER" && <Flame className="w-4 h-4" />}
                        {lm.category === "MARKET" && <ShoppingBag className="w-4 h-4" />}
                        {lm.category === "CLAIMS" && <Home className="w-4 h-4" />}
                      </div>

                      {/* Landmark Name Label */}
                      <span
                        className={`mt-1.5 px-2 py-0.5 rounded text-[10px] font-bold font-mono whitespace-nowrap border pointer-events-none transition-all ${
                          isSelected
                            ? "bg-slate-900 text-white border-emerald-500 shadow-md"
                            : "bg-slate-950/80 text-slate-300 border-slate-800 opacity-90 group-hover:opacity-100"
                        }`}
                      >
                        {lm.name}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Interactive Landmark Detail Panel (Floating Bottom Left) */}
          {selectedLandmark && (
            <div className="absolute bottom-4 left-4 z-20 max-w-sm w-full p-4 glass-panel bg-slate-950/90 border border-slate-800 rounded-2xl shadow-2xl space-y-3">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-mono">
                    {selectedLandmark.category} Landmark
                  </span>
                  <h3 className="text-sm font-black text-white mt-1">
                    {selectedLandmark.name}
                  </h3>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedLandmark(null)}
                  className="text-slate-500 hover:text-white text-xs px-1"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                {selectedLandmark.description}
              </p>

              <div className="grid grid-cols-3 gap-2 p-2 rounded-xl bg-slate-900 border border-slate-800 text-center font-mono text-[11px]">
                <div>
                  <span className="text-[9px] text-slate-500 block">X</span>
                  <span className="font-bold text-white">{selectedLandmark.x}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 block">Y</span>
                  <span className="font-bold text-white">{selectedLandmark.y}</span>
                </div>
                <div>
                  <span className="text-[9px] text-slate-500 block">Z</span>
                  <span className="font-bold text-white">{selectedLandmark.z}</span>
                </div>
              </div>

              <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800/80">
                <code className="text-xs font-mono font-bold text-emerald-400">
                  {selectedLandmark.warpCmd}
                </code>
                <button
                  type="button"
                  onClick={() => handleCopyWarp(selectedLandmark.warpCmd)}
                  className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-semibold text-white flex items-center gap-1 transition-all cursor-pointer"
                >
                  {copiedCmd === selectedLandmark.warpCmd ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copy Warp</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Map Controls Tip (Floating Bottom Right) */}
          <div className="absolute bottom-4 right-4 z-20 hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800/80 text-[11px] text-slate-400 font-mono">
            <span>🖱️ Drag to pan &bull; Click pins to inspect warps</span>
          </div>
        </div>
      </div>
    </div>
  );
}
