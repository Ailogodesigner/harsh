import { Vote, Gift, ExternalLink, Sparkles, CheckCircle2, Trophy } from "lucide-react";

export const metadata = {
  title: "Vote for Rewards | Harsh Unlimited Minecraft Network",
  description: "Vote daily for Harsh Unlimited to receive free in-game keys, coins, and win monthly store vouchers.",
};

export default function VotePage() {
  const votingSites = [
    {
      id: 1,
      title: "Minecraft-MP (Server List)",
      cooldown: "Every 24 Hours",
      url: "https://minecraft-mp.com/server/harshunlimited/vote/",
    },
    {
      id: 2,
      title: "Planet Minecraft",
      cooldown: "Every 24 Hours",
      url: "https://www.planetminecraft.com/server/harshunlimited/vote/",
    },
    {
      id: 3,
      title: "TopG Minecraft Servers",
      cooldown: "Every 24 Hours",
      url: "https://topg.org/minecraft-servers/server-harshunlimited",
    },
    {
      id: 4,
      title: "Minecraft ServerList",
      cooldown: "Every 12 Hours",
      url: "https://minecraft-server-list.com/server/harshunlimited/vote/",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
          Support the Server
        </span>
        <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
          VOTE FOR <span className="text-emerald-400">HARSH UNLIMITED</span>
        </h1>
        <p className="text-sm text-slate-300 leading-relaxed">
          Voting takes less than 30 seconds and directly rewards you in-game with Vote Keys, Coins, and monthly voucher draw entries.
        </p>
      </div>

      {/* Rewards Overview Bar */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-emerald-500/30 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
            <Gift className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">1x Vote Crate Key</h3>
            <p className="text-xs text-slate-400">Redeemable at /warp crates</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">$500 In-Game Coins</h3>
            <p className="text-xs text-slate-400">Added directly to your balance</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-white text-sm">₹500 Monthly Prize</h3>
            <p className="text-xs text-slate-400">Top 3 voters win store vouchers</p>
          </div>
        </div>
      </div>

      {/* Voting Links Grid */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white">Daily Voting Links</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {votingSites.map((site) => (
            <div
              key={site.id}
              className="glass-panel rounded-xl p-5 border border-slate-800 flex items-center justify-between gap-4 hover:border-emerald-500/30 transition-all"
            >
              <div>
                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                  {site.cooldown}
                </span>
                <h3 className="font-bold text-sm text-white mt-1">{site.title}</h3>
                <p className="text-[11px] text-slate-400">Enter your Minecraft IGN on site</p>
              </div>

              <a
                href={site.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-colors shrink-0 shadow-md shadow-emerald-500/20"
              >
                <span>VOTE</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-panel rounded-xl p-6 border border-slate-800 text-xs text-slate-300 space-y-2">
        <h3 className="font-bold text-white text-sm">How to Claim In-Game:</h3>
        <p>1. Make sure you are logged into <span className="text-emerald-400 font-mono">play.harshunlimited.fun</span>.</p>
        <p>2. Complete the CAPTCHA and submit your exact Minecraft username on any voting site above.</p>
        <p>3. Your keys and economy cash will be automatically granted within 60 seconds!</p>
      </div>
    </div>
  );
}
