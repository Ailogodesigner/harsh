import { Trophy, Flame, Coins, ShieldCheck, Heart, Skull } from "lucide-react";

export const metadata = {
  title: "Leaderboards | Harsh Unlimited Minecraft Network",
  description: "View top players, PvP kills, server economy wealth, and top monthly voters on Harsh Unlimited.",
};

export default function LeaderboardsPage() {
  const topKills = [
    { rank: 1, name: "HarshWarrior", score: "1,248 Kills", hearts: "42 Hearts", tag: "IMMORTAL" },
    { rank: 2, name: "ViperKing", score: "982 Kills", hearts: "36 Hearts", tag: "TITAN" },
    { rank: 3, name: "ShadowStriker", score: "840 Kills", hearts: "31 Hearts", tag: "MVP" },
    { rank: 4, name: "PixelPhantom", score: "715 Kills", hearts: "28 Hearts", tag: "VIP" },
    { rank: 5, name: "ApexPredator", score: "620 Kills", hearts: "25 Hearts", tag: "PLAYER" },
  ];

  const topEconomy = [
    { rank: 1, name: "GoldTycoon", score: "$4,850,000", tag: "IMMORTAL" },
    { rank: 2, name: "BankerBob", score: "$3,120,000", tag: "TITAN" },
    { rank: 3, name: "EmeraldBaron", score: "$2,450,000", tag: "MVP" },
    { rank: 4, name: "DiamondMiner", score: "$1,890,000", tag: "PLAYER" },
    { rank: 5, name: "MarketMaster", score: "$1,420,000", tag: "VIP" },
  ];

  const topVoters = [
    { rank: 1, name: "LoyalGamer", score: "124 Votes", reward: "₹500 Store Voucher" },
    { rank: 2, name: "CraftKnight", score: "118 Votes", reward: "₹300 Store Voucher" },
    { rank: 3, name: "MineMaster", score: "105 Votes", reward: "₹150 Store Voucher" },
    { rank: 4, name: "NightWalker", score: "94 Votes", reward: "Mythic Keys" },
    { rank: 5, name: "DailyVoter", score: "88 Votes", reward: "Ancient Keys" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
          Hall of Champions
        </span>
        <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
          NETWORK <span className="text-emerald-400">LEADERBOARDS</span>
        </h1>
        <p className="text-sm text-slate-300 leading-relaxed">
          Honoring the most legendary warriors, wealth barons, and dedicated voters on Harsh Unlimited.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Lifesteal Kills */}
        <div className="glass-panel rounded-2xl p-6 border border-rose-500/30 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
            <div className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400">
              <Skull className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Lifesteal Top Kills</h2>
              <p className="text-[11px] text-slate-400">Season 4 Combat Rankings</p>
            </div>
          </div>

          <div className="space-y-3">
            {topKills.map((player) => (
              <div
                key={player.name}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-950/80 border border-slate-800/80"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      player.rank === 1
                        ? "bg-amber-400 text-slate-950"
                        : player.rank === 2
                        ? "bg-slate-300 text-slate-950"
                        : player.rank === 3
                        ? "bg-amber-700 text-white"
                        : "bg-slate-800 text-slate-300"
                    }`}
                  >
                    {player.rank}
                  </span>
                  <div>
                    <p className="font-bold text-xs text-white">{player.name}</p>
                    <span className="text-[10px] text-rose-400 font-semibold">{player.hearts}</span>
                  </div>
                </div>
                <span className="font-mono text-xs text-slate-200">{player.score}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Survival Economy */}
        <div className="glass-panel rounded-2xl p-6 border border-emerald-500/30 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
              <Coins className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Survival Wealth</h2>
              <p className="text-[11px] text-slate-400">Top Player Balances</p>
            </div>
          </div>

          <div className="space-y-3">
            {topEconomy.map((player) => (
              <div
                key={player.name}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-950/80 border border-slate-800/80"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      player.rank === 1
                        ? "bg-amber-400 text-slate-950"
                        : player.rank === 2
                        ? "bg-slate-300 text-slate-950"
                        : player.rank === 3
                        ? "bg-amber-700 text-white"
                        : "bg-slate-800 text-slate-300"
                    }`}
                  >
                    {player.rank}
                  </span>
                  <div>
                    <p className="font-bold text-xs text-white">{player.name}</p>
                    <span className="text-[10px] text-emerald-400 font-semibold">Rank: {player.tag}</span>
                  </div>
                </div>
                <span className="font-mono text-xs text-emerald-400 font-bold">{player.score}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Voters */}
        <div className="glass-panel rounded-2xl p-6 border border-purple-500/30 space-y-6">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
            <div className="p-2.5 rounded-xl bg-purple-500/10 text-purple-400">
              <Trophy className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Monthly Top Voters</h2>
              <p className="text-[11px] text-slate-400">Monthly Reset &amp; Store Vouchers</p>
            </div>
          </div>

          <div className="space-y-3">
            {topVoters.map((player) => (
              <div
                key={player.name}
                className="flex items-center justify-between p-3 rounded-xl bg-slate-950/80 border border-slate-800/80"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      player.rank === 1
                        ? "bg-amber-400 text-slate-950"
                        : player.rank === 2
                        ? "bg-slate-300 text-slate-950"
                        : player.rank === 3
                        ? "bg-amber-700 text-white"
                        : "bg-slate-800 text-slate-300"
                    }`}
                  >
                    {player.rank}
                  </span>
                  <div>
                    <p className="font-bold text-xs text-white">{player.name}</p>
                    <span className="text-[10px] text-purple-400 font-semibold">{player.reward}</span>
                  </div>
                </div>
                <span className="font-mono text-xs text-white">{player.score}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="text-center text-xs text-slate-400">
        Leaderboards synchronize every 10 minutes with in-game database storage.
      </div>
    </div>
  );
}
