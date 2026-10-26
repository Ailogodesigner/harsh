"use client";

import { useState, useEffect } from "react";
import NextLink from "next/link";
import {
  Compass,
  Heart,
  Sword,
  Layers,
  ShoppingBag,
  Trophy,
  MapPin,
  Vote,
  Copy,
  Check,
  ArrowRight,
  ExternalLink,
  MessageSquare,
  Sparkles,
  Server,
  Users,
  Activity,
  CheckCircle2,
  ChevronRight,
  BookOpen,
} from "lucide-react";

interface StatusData {
  online: boolean;
  ip: string;
  port: number;
  players: {
    online: number;
    max: number;
    list?: string[];
  };
  version?: string;
}

interface Announcement {
  id: string;
  title: string;
  tag: string;
}

export default function HomePage() {
  const [status, setStatus] = useState<StatusData | null>(null);
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [copiedJava, setCopiedJava] = useState(false);
  const [copiedBedrock, setCopiedBedrock] = useState(false);

  useEffect(() => {
    // Live Server Status
    fetch("/api/minecraft/status")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setStatus(data);
      })
      .catch(() => {});

    // Latest Announcement
    fetch("/api/announcements")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.announcements && data.announcements.length > 0) {
          setAnnouncement(data.announcements[0]);
        }
      })
      .catch(() => {});
  }, []);

  const handleCopyJava = async () => {
    try {
      await navigator.clipboard.writeText("play.harshunlimited.fun");
      setCopiedJava(true);
      setTimeout(() => setCopiedJava(false), 2200);
    } catch {
      setCopiedJava(true);
      setTimeout(() => setCopiedJava(false), 2200);
    }
  };

  const handleCopyBedrock = async () => {
    try {
      await navigator.clipboard.writeText("play.harshunlimited.fun:19132");
      setCopiedBedrock(true);
      setTimeout(() => setCopiedBedrock(false), 2200);
    } catch {
      setCopiedBedrock(true);
      setTimeout(() => setCopiedBedrock(false), 2200);
    }
  };

  const isOnline = status?.online ?? true;
  const onlinePlayers = status?.players?.online ?? 0;
  const playerList = status?.players?.list || [];

  const gameModes = [
    {
      title: "Survival SMP",
      status: "ONLINE NOW",
      isLive: true,
      tag: "Season 4",
      icon: Compass,
      description: "Land claims, player economy, chest shops, auction houses, and 100+ custom enchants.",
      href: "/play",
    },
    {
      title: "Lifesteal SMP",
      status: "COMING SOON",
      isLive: false,
      tag: "Season 4",
      icon: Heart,
      description: "PvP heart stealing, revive beacons, anti-combat logging, and custom combat arenas.",
      href: "/play",
    },
    {
      title: "BoxPvP",
      status: "COMING SOON",
      isLive: false,
      tag: "In Development",
      icon: Sword,
      description: "Tiered mining pits, upgraded armor tiers, instant respawns, and daily arena tournaments.",
      href: "/play",
    },
    {
      title: "Custom Skyblock",
      status: "COMING SOON",
      isLive: false,
      tag: "In Development",
      icon: Layers,
      description: "Sky island empires, automated minions, dungeon boss raids, and co-op island rankings.",
      href: "/play",
    },
  ];

  const quickLinks = [
    {
      title: "Server Store",
      subtitle: "Ranks, crate keys & coins",
      icon: ShoppingBag,
      href: "/store",
      color: "text-emerald-400",
      badge: "STORE",
    },
    {
      title: "Live Leaderboards",
      subtitle: "$109M+ Baltop & PvP stats",
      icon: Trophy,
      href: "/leaderboards",
      color: "text-amber-400",
      badge: "STATS",
    },
    {
      title: "Live Web Map",
      subtitle: "Explore 3D survival Dynmap",
      icon: MapPin,
      href: "/map",
      color: "text-cyan-400",
      badge: "DYNMAP",
    },
    {
      title: "Vote for Rewards",
      subtitle: "Free crate keys & coins daily",
      icon: Vote,
      href: "/vote",
      color: "text-purple-400",
      badge: "FREE",
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-14 space-y-16">
      {/* 1. MINIMAL HERO SECTION */}
      <section className="relative text-center space-y-6 pt-4">
        {/* Subtle Ambient Radial Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[300px] bg-emerald-500/10 rounded-full blur-[110px] pointer-events-none" />

        {/* Minimal Announcement Pill */}
        {announcement && (
          <div className="relative z-10 flex justify-center">
            <NextLink
              href="/news"
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/90 hover:bg-slate-800/90 border border-emerald-500/30 text-xs text-slate-300 hover:text-white transition-all shadow-md group max-w-xl truncate"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
              <span className="text-emerald-400 font-bold uppercase text-[10px] tracking-wider shrink-0">
                {announcement.tag || "NOTICE"}
              </span>
              <span className="truncate text-[11px] sm:text-xs">{announcement.title}</span>
              <ChevronRight className="w-3.5 h-3.5 text-emerald-400 group-hover:translate-x-0.5 transition-transform shrink-0" />
            </NextLink>
          </div>
        )}

        {/* Mascot Logo */}
        <div className="relative z-10 flex justify-center">
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-br from-emerald-400 via-green-500 to-teal-700 p-0.5 shadow-2xl shadow-emerald-500/25 animate-float">
            <div className="w-full h-full bg-[#08090d] rounded-[22px] overflow-hidden flex items-center justify-center p-1">
              <img
                src="/logo.png"
                alt="Harsh Unlimited Mascot Logo"
                className="w-full h-full object-cover rounded-[18px] filter drop-shadow-[0_4px_12px_rgba(16,185,129,0.3)]"
              />
            </div>
          </div>
        </div>

        {/* Title & Tagline */}
        <div className="relative z-10 space-y-2 max-w-2xl mx-auto">
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white uppercase">
            HARSH <span className="text-emerald-400">UNLIMITED</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-lg mx-auto">
            India&apos;s premier Minecraft gaming network. Experience custom Survival SMP, player-driven economy, and lag-free multiplayer on Java &amp; Bedrock.
          </p>
        </div>

        {/* Server IP Copy Box (Minimal & Interactive) */}
        <div className="relative z-10 max-w-md mx-auto">
          <div
            onClick={handleCopyJava}
            className="group cursor-pointer flex items-center justify-between gap-3 bg-slate-950/80 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/50 p-2.5 sm:p-3 rounded-2xl transition-all shadow-xl"
          >
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 shrink-0">
                <Server className="w-4 h-4" />
              </div>
              <div className="text-left truncate">
                <div className="text-[10px] font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{isOnline ? `${onlinePlayers} Players Online` : "Server Online"}</span>
                </div>
                <div className="font-mono text-xs sm:text-sm font-bold text-white truncate">
                  play.harshunlimited.fun
                </div>
              </div>
            </div>

            <button
              type="button"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${
                copiedJava
                  ? "bg-emerald-500 text-slate-950"
                  : "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
              }`}
            >
              {copiedJava ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy IP</span>
                </>
              )}
            </button>
          </div>

          <div className="flex items-center justify-center gap-3 mt-2 text-[11px] text-slate-400 font-mono">
            <span>Java: <strong className="text-slate-300">25565</strong></span>
            <span>&bull;</span>
            <span>Bedrock Port: <strong className="text-emerald-400">19132</strong></span>
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="relative z-10 flex flex-wrap items-center justify-center gap-3 pt-2">
          <NextLink
            href="/play"
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20 transition-all transform hover:-translate-y-0.5"
          >
            <Compass className="w-4 h-4" />
            <span>How to Join</span>
          </NextLink>

          <a
            href="https://discord.gg/harshunlimited"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-slate-900 hover:bg-[#5865F2] text-slate-200 hover:text-white border border-slate-700/80 hover:border-[#5865F2] transition-all transform hover:-translate-y-0.5 shadow-md"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Join Discord</span>
          </a>
        </div>
      </section>

      {/* 2. GAME MODES (CLEAN 4-GRID) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight">
              Game Modes
            </h2>
            <p className="text-xs text-slate-400">Active server modes &amp; upcoming releases</p>
          </div>
          <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
            Survival SMP Live
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {gameModes.map((mode) => {
            const Icon = mode.icon;
            return (
              <div
                key={mode.title}
                className={`glass-panel rounded-2xl p-5 border transition-all flex flex-col justify-between ${
                  mode.isLive
                    ? "border-emerald-500/40 bg-emerald-500/[0.03] hover:border-emerald-500"
                    : "border-slate-800 hover:border-slate-700"
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div
                      className={`p-2.5 rounded-xl ${
                        mode.isLive ? "bg-emerald-500/10 text-emerald-400" : "bg-slate-800/80 text-slate-400"
                      }`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border uppercase tracking-wider ${
                        mode.isLive
                          ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                          : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      }`}
                    >
                      {mode.status}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white">{mode.title}</h3>
                    <p className="text-xs text-slate-400 leading-relaxed mt-1">{mode.description}</p>
                  </div>
                </div>

                <div className="pt-4 mt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500 font-mono">{mode.tag}</span>
                  {mode.isLive ? (
                    <NextLink
                      href={mode.href}
                      className="text-emerald-400 font-bold hover:underline flex items-center gap-1"
                    >
                      Play Now &rarr;
                    </NextLink>
                  ) : (
                    <span className="text-slate-500">Soon</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3. ESSENTIAL QUICK LINKS (MINIMAL 4-GRID) */}
      <section className="space-y-4">
        <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight">
          Quick Access
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickLinks.map((item) => {
            const Icon = item.icon;
            return (
              <NextLink
                key={item.title}
                href={item.href}
                className="glass-panel rounded-2xl p-4 sm:p-5 border border-slate-800 hover:border-emerald-500/40 transition-all flex items-center justify-between gap-3 group"
              >
                <div className="flex items-center gap-3 truncate">
                  <div className={`p-2.5 rounded-xl bg-slate-900 border border-slate-800 group-hover:scale-105 transition-transform ${item.color}`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="truncate text-left">
                    <h3 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">
                      {item.title}
                    </h3>
                    <p className="text-[11px] text-slate-400 truncate">{item.subtitle}</p>
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all shrink-0" />
              </NextLink>
            );
          })}
        </div>
      </section>

      {/* 4. COMPACT LIVE SERVER STATUS CARD */}
      <section className="glass-panel rounded-2xl p-5 sm:p-6 border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <h3 className="text-sm font-bold text-white">Live Node Connection</h3>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              paid58.cavrixcloud.fun
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono text-slate-400">
            <span>TPS: <strong className="text-emerald-400">20.0</strong></span>
            <span>Online: <strong className="text-white">{onlinePlayers}</strong>/100</span>
          </div>
        </div>

        {/* Live player avatars strip */}
        {playerList.length > 0 && (
          <div className="space-y-2">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              Players Currently In-Game
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {playerList.slice(0, 16).map((name) => (
                <div
                  key={name}
                  className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-900 border border-slate-800 text-[11px] font-mono text-slate-300"
                >
                  <img
                    src={`https://mc-heads.net/avatar/${name}/20`}
                    alt={name}
                    className="w-4 h-4 rounded-sm bg-slate-800"
                  />
                  <span>{name}</span>
                </div>
              ))}
              {playerList.length > 16 && (
                <span className="text-[10px] text-slate-500 font-mono px-2 py-1">
                  +{playerList.length - 16} more
                </span>
              )}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs">
            <span className="text-slate-400 font-mono truncate">Java: play.harshunlimited.fun:25565</span>
            <button
              type="button"
              onClick={handleCopyJava}
              className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 shrink-0 ml-2 cursor-pointer"
            >
              {copiedJava ? "Copied!" : "Copy"}
            </button>
          </div>

          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs">
            <span className="text-slate-400 font-mono truncate">Bedrock: play.harshunlimited.fun:19132</span>
            <button
              type="button"
              onClick={handleCopyBedrock}
              className="text-[11px] font-bold text-cyan-400 hover:text-cyan-300 shrink-0 ml-2 cursor-pointer"
            >
              {copiedBedrock ? "Copied!" : "Copy"}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
