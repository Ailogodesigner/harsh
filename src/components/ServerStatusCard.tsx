"use client";

import { useState, useEffect } from "react";
import CopyButton from "./CopyButton";
import { Server, Smartphone, Monitor, Activity, Users, ShieldCheck, RefreshCw, Sparkles } from "lucide-react";

import { getPlayerRankInfo } from "@/lib/minecraft/ranks";

interface StatusData {
  online: boolean;
  ip: string;
  port: number;
  players: {
    online: number;
    max: number;
    list?: string[];
  };
  version: string;
  motd: {
    clean: string[];
  };
}

export default function ServerStatusCard() {
  const [status, setStatus] = useState<StatusData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchStatus = () => {
    setLoading(true);
    fetch("/api/minecraft/status")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setStatus(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 30000); // refresh every 30s
    return () => clearInterval(interval);
  }, []);

  const isOnline = status?.online ?? true;
  const onlinePlayers = status?.players?.online ?? 0;
  const maxPlayers = status?.players?.max ?? 100;
  const version = status?.version || "1.20 - 1.21.x";
  const playerList = status?.players?.list || [];

  return (
    <div className="w-full max-w-5xl mx-auto glass-panel rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden border border-emerald-500/20 bg-gradient-to-b from-slate-950/95 via-slate-900/90 to-slate-950/95">
      {/* Background glow accent */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-800/80 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-inner">
            <Server className="w-5 h-5" />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2">
              <h3 className="font-black text-white text-lg tracking-tight">Harsh Unlimited Status</h3>
              <span
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                  isOnline
                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                    : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isOnline ? "bg-emerald-400 animate-pulse" : "bg-amber-400"
                  }`}
                />
                {isOnline ? "ONLINE" : "BOOTING"}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Active Node: <span className="text-emerald-400 font-mono font-semibold">play.harshunlimited.fun</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-900/90 px-4 py-2 rounded-xl border border-slate-800">
            <Users className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-white">
              {onlinePlayers} <span className="text-slate-400 font-normal">/ {maxPlayers} Players</span>
            </span>
          </div>

          <button
            type="button"
            onClick={fetchStatus}
            disabled={loading}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/50 text-slate-400 hover:text-white transition-all cursor-pointer"
            title="Refresh Server Status"
            aria-label="Refresh Server Status"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-emerald-400" : ""}`} />
          </button>
        </div>
      </div>

      {/* Two Connection Cards: Java & Bedrock */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6 relative z-10 text-left">
        {/* Java Card */}
        <div className="bg-slate-950/80 rounded-2xl p-5 border border-slate-800 hover:border-emerald-500/40 transition-all group shadow-md">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Monitor className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">Java Edition</h4>
                <p className="text-[11px] text-slate-400">PC / Mac / Linux (1.20 - 1.21.x)</p>
              </div>
            </div>
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              Port: 25565
            </span>
          </div>

          <div className="flex items-center justify-between gap-2 bg-slate-900/90 rounded-xl p-2.5 border border-slate-800">
            <span className="font-mono text-xs text-slate-200 select-all truncate font-semibold">
              play.harshunlimited.fun
            </span>
            <CopyButton textToCopy="play.harshunlimited.fun" label="Copy IP" />
          </div>
        </div>

        {/* Bedrock Card */}
        <div className="bg-slate-950/80 rounded-2xl p-5 border border-slate-800 hover:border-cyan-500/40 transition-all group shadow-md">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Smartphone className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">Bedrock Edition</h4>
                <p className="text-[11px] text-slate-400">Mobile (MCPE) / Windows 10 / Console</p>
              </div>
            </div>
            <span className="text-[11px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
              Port: 19132
            </span>
          </div>

          <div className="flex items-center justify-between gap-2 bg-slate-900/90 rounded-xl p-2.5 border border-slate-800">
            <span className="font-mono text-xs text-slate-200 select-all truncate font-semibold">
              play.harshunlimited.fun
            </span>
            <CopyButton textToCopy="play.harshunlimited.fun:19132" label="Copy IP & Port" />
          </div>
        </div>
      </div>

      {/* Online Members List Display with Real In-Game Ranks */}
      <div className="mt-6 pt-5 border-t border-slate-800/80 text-left relative z-10">
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
              {playerList.length > 0
                ? `Online Players (${playerList.length})`
                : "Active Community Network Roster"}
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">
            Verified LuckPerms Synchronization
          </span>
        </div>

        {playerList.length > 0 ? (
          <div className="flex items-center gap-2 flex-wrap">
            {playerList.map((player) => {
              const rankInfo = getPlayerRankInfo(player);
              return (
                <div
                  key={player}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/40 transition-colors shadow-sm"
                >
                  <img
                    src={`https://mc-heads.net/avatar/${player}/24`}
                    alt={player}
                    className="w-5 h-5 rounded-md bg-slate-950 border border-slate-700"
                  />
                  <span className="text-xs font-bold text-slate-200">{player}</span>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${rankInfo.color} ${rankInfo.border}`}
                  >
                    {rankInfo.rank}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs text-slate-400">
              No players currently in-game. Be the first to join at{" "}
              <span className="text-emerald-400 font-mono font-semibold">play.harshunlimited.fun</span>!
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              {[
                "HarshUnlimited",
                "UVTANDI",
                "CaptainCharlie56",
                "darky",
                "JNVIRAJ",
                "bulli_bhai",
                "erida_nyx",
              ].map((name) => {
                const rankInfo = getPlayerRankInfo(name);
                return (
                  <div
                    key={name}
                    className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800/80 shadow-sm"
                  >
                    <img
                      src={`https://mc-heads.net/avatar/${name}/24`}
                      alt={name}
                      className="w-5 h-5 rounded-md bg-slate-950 border border-slate-700"
                    />
                    <span className="text-xs font-semibold text-slate-200">{name}</span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${rankInfo.color} ${rankInfo.border}`}
                    >
                      {rankInfo.rank}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Network Perks Bar */}
      <div className="mt-6 pt-4 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400 relative z-10">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Advanced Anti-Cheat Protection</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Activity className="w-4 h-4 text-emerald-400" />
          <span>Low Latency Indian Network Node</span>
        </div>
        <div className="text-[11px] text-slate-400 font-mono">
          Supported: {version}
        </div>
      </div>
    </div>
  );
}
