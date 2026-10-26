"use client";

import NextLink from "next/link";
import {
  Compass,
  Heart,
  Sword,
  Layers,
  ShoppingBag,
  Trophy,
  MapPin,
  BookMarked,
  ChevronRight,
  Sparkles,
} from "lucide-react";

import CobaltHero from "@/components/CobaltHero";
import FeaturedAnnouncement from "@/components/FeaturedAnnouncement";
import ServerStatusCard from "@/components/ServerStatusCard";

export default function HomePage() {
  const gameModes = [
    {
      title: "Survival SMP",
      status: "ONLINE NOW",
      isLive: true,
      tag: "Active SMP",
      icon: Compass,
      description:
        "Land claims, player economy, chest shops, auction houses, and 100+ custom enchants.",
      href: "/play",
    },
    {
      title: "Lifesteal SMP",
      status: "COMING SOON",
      isLive: false,
      tag: "Upcoming",
      icon: Heart,
      description:
        "PvP heart stealing, revive beacons, anti-combat logging, and custom combat arenas.",
      href: "/play",
    },
    {
      title: "BoxPvP",
      status: "COMING SOON",
      isLive: false,
      tag: "In Development",
      icon: Sword,
      description:
        "Tiered mining pits, upgraded armor tiers, instant respawns, and daily arena tournaments.",
      href: "/play",
    },
    {
      title: "Custom Skyblock",
      status: "COMING SOON",
      isLive: false,
      tag: "In Development",
      icon: Layers,
      description:
        "Sky island empires, automated minions, dungeon boss raids, and co-op island rankings.",
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
    },
    {
      title: "Live Leaderboards",
      subtitle: "$109M+ Baltop & PvP stats",
      icon: Trophy,
      href: "/leaderboards",
      color: "text-amber-400",
    },
    {
      title: "Live Web Map",
      subtitle: "Explore 3D survival Dynmap",
      icon: MapPin,
      href: "/map",
      color: "text-cyan-400",
    },
    {
      title: "Server Wiki & Guide",
      subtitle: "Commands, land claim & enchants",
      icon: BookMarked,
      href: "/wiki",
      color: "text-purple-400",
    },
  ];

  return (
    <div className="space-y-12 sm:space-y-16 pb-16">
      {/* 1. APPLEMC COBALT HERO BANNER */}
      <CobaltHero />

      {/* 2. FEATURED ANNOUNCEMENT / NEWS CARD (APPLEMC COBALT STYLE) */}
      <FeaturedAnnouncement />

      {/* 3. LIVE SERVER STATUS & REAL RANK ROSTER */}
      <div className="max-w-6xl mx-auto px-4">
        <ServerStatusCard />
      </div>

      {/* 4. GAME MODES (CLEAN 4-GRID) */}
      <section className="max-w-6xl mx-auto px-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-black text-white uppercase tracking-tight">
              Network Game Modes
            </h2>
            <p className="text-xs text-slate-400">
              Active server modes &amp; upcoming network releases
            </p>
          </div>
          <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
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
                        mode.isLive
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-slate-800/80 text-slate-400"
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
                    <p className="text-xs text-slate-400 leading-relaxed mt-1">
                      {mode.description}
                    </p>
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
                    <span className="text-slate-500">Coming Soon</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 5. QUICK ACCESS LINKS */}
      <section className="max-w-6xl mx-auto px-4 space-y-4">
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
                  <div
                    className={`p-2.5 rounded-xl bg-slate-900 border border-slate-800 group-hover:scale-105 transition-transform ${item.color}`}
                  >
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
    </div>
  );
}
