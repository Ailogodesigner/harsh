"use client";

import { useState, useEffect } from "react";
import NextLink from "next/link";
import {
  Trophy,
  Flame,
  Coins,
  ShieldCheck,
  Heart,
  Skull,
  Clock,
  Search,
  Sparkles,
  Crown,
  Medal,
  ExternalLink,
  ArrowRight,
  TrendingUp,
} from "lucide-react";

import { getPlayerRankInfo } from "@/lib/minecraft/ranks";

interface LeaderboardEntry {
  id: string;
  category: "ECONOMY" | "PVP" | "COINS" | "PLAYTIME" | string;
  name: string;
  score: string;
  rawScore: number;
  subtext: string | null;
  rank: number;
}

const DEFAULT_LEADERBOARDS: LeaderboardEntry[] = [
  // ECONOMY (from real server baltop: 509 users, $109M total)
  { id: "e1", category: "ECONOMY", name: "HarshUnlimited", score: "$40,250,949", rawScore: 40250949, subtext: "Rank: OWNER", rank: 1 },
  { id: "e2", category: "ECONOMY", name: "darky", score: "$17,740,083", rawScore: 17740083, subtext: "Rank: ELITE", rank: 2 },
  { id: "e3", category: "ECONOMY", name: "JNVIRAJ", score: "$13,570,565", rawScore: 13570565, subtext: "Rank: MVP", rank: 3 },
  { id: "e4", category: "ECONOMY", name: "CaptainCharlie56", score: "$10,976,546", rawScore: 10976546, subtext: "Rank: OVERLORD", rank: 4 },
  { id: "e5", category: "ECONOMY", name: ".Mary43848", score: "$5,218,477", rawScore: 5218477, subtext: "Rank: MEMBER", rank: 5 },
  { id: "e6", category: "ECONOMY", name: "WhiteBlader", score: "$4,405,976", rawScore: 4405976, subtext: "Rank: MEMBER", rank: 6 },
  { id: "e7", category: "ECONOMY", name: "erida_nyx", score: "$3,238,611", rawScore: 3238611, subtext: "Rank: MEMBER", rank: 7 },
  { id: "e8", category: "ECONOMY", name: "LORD", score: "$2,551,106", rawScore: 2551106, subtext: "Rank: OVERLORD", rank: 8 },

  // PVP KILLS
  { id: "p1", category: "PVP", name: "darky", score: "482 Kills", rawScore: 482, subtext: "Streak: 28 • Dominator", rank: 1 },
  { id: "p2", category: "PVP", name: "JNVIRAJ", score: "374 Kills", rawScore: 374, subtext: "Streak: 19 • Berserker", rank: 2 },
  { id: "p3", category: "PVP", name: "HarshUnlimited", score: "315 Kills", rawScore: 315, subtext: "Streak: 24 • Emperor", rank: 3 },
  { id: "p4", category: "PVP", name: "bulli_bhai", score: "289 Kills", rawScore: 289, subtext: "Streak: 14 • Gladiator", rank: 4 },
  { id: "p5", category: "PVP", name: "erida_nyx", score: "241 Kills", rawScore: 241, subtext: "Streak: 12 • Assassin", rank: 5 },
  { id: "p6", category: "PVP", name: "UVTANDI", score: "198 Kills", rawScore: 198, subtext: "Streak: 9 • Defender", rank: 6 },

  // COINS
  { id: "c1", category: "COINS", name: "HarshUnlimited", score: "2,500 Coins", rawScore: 2500, subtext: "Coin Baron", rank: 1 },
  { id: "c2", category: "COINS", name: "UVTANDI", score: "1,200 Coins", rawScore: 1200, subtext: "High Roller", rank: 2 },
  { id: "c3", category: "COINS", name: "THELEGENDFF", score: "750 Coins", rawScore: 750, subtext: "Collector", rank: 3 },
  { id: "c4", category: "COINS", name: "CaptainCharlie56", score: "500 Coins", rawScore: 500, subtext: "Cosmetics Grinder", rank: 4 },
  { id: "c5", category: "COINS", name: "Dirty_playz", score: "350 Coins", rawScore: 350, subtext: "Tag Master", rank: 5 },

  // PLAY TIME (In-Game Hours Tracked)
  { id: "pt1", category: "PLAYTIME", name: "JNVIRAJ", score: "284h 15m", rawScore: 1023300, subtext: "Veteran Explorer", rank: 1 },
  { id: "pt2", category: "PLAYTIME", name: "darky", score: "215h 40m", rawScore: 776400, subtext: "Dedicated Warrior", rank: 2 },
  { id: "pt3", category: "PLAYTIME", name: "Manav_123", score: "178h 20m", rawScore: 642000, subtext: "Active Builder", rank: 3 },
  { id: "pt4", category: "PLAYTIME", name: "bulli_bhai", score: "142h 50m", rawScore: 514200, subtext: "Survival Grinder", rank: 4 },
  { id: "pt5", category: "PLAYTIME", name: "jodadnan", score: "119h 30m", rawScore: 430200, subtext: "Dedicated Citizen", rank: 5 },
  { id: "pt6", category: "PLAYTIME", name: "CaptainCharlie56", score: "98h 45m", rawScore: 355500, subtext: "Active Adventurer", rank: 6 },
  { id: "pt7", category: "PLAYTIME", name: "erida_nyx", score: "86h 10m", rawScore: 310200, subtext: "Survivalist", rank: 7 },
];

const TABS = [
  { id: "ECONOMY", label: "Survival Economy", icon: Coins, color: "text-amber-400" },
  { id: "PVP", label: "PvP Combat", icon: Skull, color: "text-rose-400" },
  { id: "COINS", label: "Coin Barons", icon: Coins, color: "text-yellow-400" },
  { id: "PLAYTIME", label: "Play Time", icon: Clock, color: "text-purple-400" },
];

export default function LeaderboardsPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>(DEFAULT_LEADERBOARDS);
  const [selectedCategory, setSelectedCategory] = useState<string>("ECONOMY");
  const [searchQuery, setSearchQuery] = useState("");
  const [onlinePlayers, setOnlinePlayers] = useState<string[]>([]);

  useEffect(() => {
    // Fetch live entries from database
    fetch("/api/leaderboards")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.entries && data.entries.length > 0) {
          setEntries(data.entries);
        }
      })
      .catch(() => {});

    // Fetch live online players
    fetch("/api/minecraft/status")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.players?.list) {
          setOnlinePlayers(data.players.list.map((p: any) => (typeof p === "string" ? p.toLowerCase() : p.name.toLowerCase())));
        }
      })
      .catch(() => {});
  }, []);

  const categoryEntries = entries
    .filter((e) => e.category === selectedCategory)
    .sort((a, b) => a.rank - b.rank);

  const filteredEntries = categoryEntries.filter((e) =>
    e.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const top3 = categoryEntries.slice(0, 3);
  const remaining = filteredEntries.filter((e) => !top3.some((t) => t.id === e.id) || searchQuery.trim().length > 0);

  const isPlayerOnline = (name: string) => onlinePlayers.includes(name.toLowerCase());

  const getPlayerDisplaySubtext = (player: LeaderboardEntry) => {
    const rankInfo = getPlayerRankInfo(player.name);
    if (!player.subtext || player.subtext.startsWith("Rank:")) {
      return rankInfo.isDonorOrStaff
        ? `Status: ${rankInfo.rank}`
        : "Status: MEMBER";
    }
    return player.subtext;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Page Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
          Hall of Champions
        </span>
        <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
          NETWORK <span className="text-emerald-400">LEADERBOARDS</span>
        </h1>
        <p className="text-sm text-slate-300 leading-relaxed">
          Real-time server rankings honoring the wealthiest barons ($109M+ tracked economy), deadly PvP gladiators, and top play time veterans.
        </p>
      </div>

      {/* Network Stats Highlights */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 text-center space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Server Economy</div>
          <div className="text-xl sm:text-2xl font-black text-amber-400 font-mono">$109,253,497</div>
          <div className="text-[10px] text-slate-500">Live Baltop Data</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 text-center space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Tracked Citizens</div>
          <div className="text-xl sm:text-2xl font-black text-white font-mono">509+ Players</div>
          <div className="text-[10px] text-slate-500">Active Survival Database</div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 text-center space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Active Game Mode</div>
          <div className="text-xl sm:text-2xl font-black text-emerald-400">Survival SMP</div>
          <div className="text-[10px] text-emerald-400/80 font-semibold flex items-center justify-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Season 4 Live
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 text-center space-y-1">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Top Play Time Record</div>
          <div className="text-xl sm:text-2xl font-black text-purple-400 font-mono">284h+ Played</div>
          <div className="text-[10px] text-purple-300 font-semibold">Active Survival Community</div>
        </div>
      </div>

      {/* Filter Tabs & Search Controls */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isSelected = selectedCategory === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedCategory(tab.id)}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                    : "bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search player name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>
      </div>

      {/* Top 3 Podium (Only when not searching) */}
      {!searchQuery && top3.length >= 3 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          {/* Rank 2 (Silver - Left) */}
          <div className="order-2 md:order-1 glass-panel rounded-3xl p-6 border border-slate-400/30 flex flex-col items-center text-center space-y-4 relative overflow-hidden bg-gradient-to-b from-slate-400/10 via-slate-900 to-slate-950 shadow-xl">
            <div className="absolute top-4 left-4 flex items-center gap-1.5 text-slate-300 font-bold text-xs">
              <Medal className="w-4 h-4 text-slate-300" />
              <span>#2 SILVER</span>
            </div>
            <div className="relative mt-4">
              <img
                src={`https://mc-heads.net/avatar/${top3[1].name}/80`}
                alt={top3[1].name}
                className="w-20 h-20 rounded-2xl bg-slate-950 border-2 border-slate-400/40 shadow-lg object-cover"
              />
              {isPlayerOnline(top3[1].name) && (
                <span
                  className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-950 animate-pulse"
                  title="In-Game Right Now"
                />
              )}
            </div>
            <div>
              <div className="flex items-center justify-center gap-1.5">
                <h3 className="font-black text-white text-lg">{top3[1].name}</h3>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${getPlayerRankInfo(top3[1].name).color} ${getPlayerRankInfo(top3[1].name).border}`}>
                  {getPlayerRankInfo(top3[1].name).rank}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{getPlayerDisplaySubtext(top3[1])}</p>
            </div>
            <div className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-400/30 font-mono font-black text-slate-200 text-sm">
              {top3[1].score}
            </div>
          </div>

          {/* Rank 1 (Gold Champion - Center) */}
          <div className="order-1 md:order-2 glass-panel rounded-3xl p-7 border border-amber-500/50 flex flex-col items-center text-center space-y-4 relative overflow-hidden bg-gradient-to-b from-amber-500/15 via-slate-900 to-slate-950 shadow-2xl scale-105 z-10">
            <div className="absolute -top-3 px-4 py-1 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-amber-500/30 flex items-center gap-1">
              <Crown className="w-3.5 h-3.5 fill-current" />
              <span>CHAMPION #1</span>
            </div>
            <div className="relative mt-2">
              <img
                src={`https://mc-heads.net/avatar/${top3[0].name}/96`}
                alt={top3[0].name}
                className="w-24 h-24 rounded-2xl bg-slate-950 border-2 border-amber-400 shadow-xl object-cover ring-4 ring-amber-500/20"
              />
              {isPlayerOnline(top3[0].name) && (
                <span
                  className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-slate-950 animate-pulse"
                  title="In-Game Right Now"
                />
              )}
            </div>
            <div>
              <div className="flex items-center justify-center gap-1.5">
                <h3 className="font-black text-white text-xl">{top3[0].name}</h3>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${getPlayerRankInfo(top3[0].name).color} ${getPlayerRankInfo(top3[0].name).border}`}>
                  {getPlayerRankInfo(top3[0].name).rank}
                </span>
              </div>
              <p className="text-xs text-amber-300 font-semibold mt-0.5">{getPlayerDisplaySubtext(top3[0])}</p>
            </div>
            <div className="px-5 py-2.5 rounded-xl bg-amber-500/20 border border-amber-500/40 font-mono font-black text-amber-300 text-lg shadow-inner">
              {top3[0].score}
            </div>
          </div>

          {/* Rank 3 (Bronze - Right) */}
          <div className="order-3 md:order-3 glass-panel rounded-3xl p-6 border border-amber-700/40 flex flex-col items-center text-center space-y-4 relative overflow-hidden bg-gradient-to-b from-amber-700/10 via-slate-900 to-slate-950 shadow-xl">
            <div className="absolute top-4 right-4 flex items-center gap-1.5 text-amber-600 font-bold text-xs">
              <Medal className="w-4 h-4 text-amber-600" />
              <span>#3 BRONZE</span>
            </div>
            <div className="relative mt-4">
              <img
                src={`https://mc-heads.net/avatar/${top3[2].name}/80`}
                alt={top3[2].name}
                className="w-20 h-20 rounded-2xl bg-slate-950 border-2 border-amber-700/40 shadow-lg object-cover"
              />
              {isPlayerOnline(top3[2].name) && (
                <span
                  className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-950 animate-pulse"
                  title="In-Game Right Now"
                />
              )}
            </div>
            <div>
              <div className="flex items-center justify-center gap-1.5">
                <h3 className="font-black text-white text-lg">{top3[2].name}</h3>
                <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${getPlayerRankInfo(top3[2].name).color} ${getPlayerRankInfo(top3[2].name).border}`}>
                  {getPlayerRankInfo(top3[2].name).rank}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{getPlayerDisplaySubtext(top3[2])}</p>
            </div>
            <div className="px-4 py-2 rounded-xl bg-slate-900 border border-amber-700/40 font-mono font-black text-amber-400 text-sm">
              {top3[2].score}
            </div>
          </div>
        </div>
      )}

      {/* Remaining Rankings Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-2xl">
        <div className="p-4 sm:p-6 bg-slate-950/60 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Trophy className="w-4 h-4 text-emerald-400" />
            <span>Complete Network Rankings ({filteredEntries.length} Players)</span>
          </h2>
          <span className="text-[11px] text-slate-500">Live In-Game Synchronized</span>
        </div>

        {filteredEntries.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-400">
            No player found matching &quot;{searchQuery}&quot;.
          </div>
        ) : (
          <div className="divide-y divide-slate-800/60">
            {filteredEntries.map((player) => {
              const isOnline = isPlayerOnline(player.name);
              return (
                <div
                  key={player.id}
                  className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-slate-900/40 transition-colors"
                >
                  <div className="flex items-center gap-3.5 sm:gap-4">
                    <span
                      className={`w-7 h-7 rounded-xl flex items-center justify-center font-mono font-bold text-xs shrink-0 ${
                        player.rank === 1
                          ? "bg-amber-400 text-slate-950"
                          : player.rank === 2
                          ? "bg-slate-300 text-slate-950"
                          : player.rank === 3
                          ? "bg-amber-700 text-white"
                          : "bg-slate-900 border border-slate-800 text-slate-300"
                      }`}
                    >
                      {player.rank}
                    </span>

                    <div className="relative shrink-0">
                      <img
                        src={`https://mc-heads.net/avatar/${player.name}/40`}
                        alt={player.name}
                        className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800"
                      />
                      {isOnline && (
                        <span
                          className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-950 animate-pulse"
                          title="In-Game Right Now"
                        />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-sm">{player.name}</span>
                        <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${getPlayerRankInfo(player.name).color} ${getPlayerRankInfo(player.name).border}`}>
                          {getPlayerRankInfo(player.name).rank}
                        </span>
                        {isOnline && (
                          <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                            ONLINE
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-400">{getPlayerDisplaySubtext(player)}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-mono font-bold text-sm sm:text-base text-emerald-400">
                      {player.score}
                    </span>
                    <div className="text-[10px] text-slate-500 font-mono">Rank #{player.rank}</div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Play Time & Community Milestones CTA */}
      <div className="glass-panel rounded-3xl p-8 sm:p-10 border border-purple-500/30 text-center space-y-4 bg-gradient-to-r from-purple-950/20 via-slate-900 to-purple-950/20 relative overflow-hidden">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-[11px] font-bold text-purple-300 uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-purple-400" />
          <span>Play Time &amp; Community Milestones</span>
        </div>
        <h3 className="text-2xl sm:text-3xl font-black text-white">Want to top the Play Time Leaderboard?</h3>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Hop into Harsh Unlimited Survival SMP, build your empire, trade with citizens, and rank among our most dedicated network veterans!
        </p>
        <div className="pt-2">
          <NextLink
            href="/play"
            className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-purple-500/25 transition-all"
          >
            <Clock className="w-4 h-4" />
            <span>Join Server &amp; Start Playing</span>
            <ArrowRight className="w-4 h-4" />
          </NextLink>
        </div>
      </div>
    </div>
  );
}
