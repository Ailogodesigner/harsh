import { Newspaper, Calendar, Tag, ArrowRight } from "lucide-react";

export const metadata = {
  title: "News & Announcements | Harsh Unlimited Minecraft Network",
  description: "Latest development logs, seasonal launches, and patch notes for Harsh Unlimited.",
};

export default function NewsPage() {
  const articles = [
    {
      id: 1,
      title: "Season 4 Launch: The Revamped Lifesteal & Survival SMP",
      tag: "MAJOR UPDATE",
      date: "October 2026",
      summary:
        "We are thrilled to launch Harsh Unlimited Season 4! Featuring brand new custom enchantments, rebalanced revive beacons, optimized server ticks, and new BoxPvP tiers.",
      highlights: [
        "Brand new spawn hub with interactive parkour and NPC warps",
        "Over 20+ custom PvP enchantments added to Survival and Lifesteal",
        "Optimized client-to-server network latency for players across India and Asia",
        "Integration of official Cashfree DevStudio payments for seamless rank upgrades",
      ],
    },
    {
      id: 2,
      title: "Network Infrastructure & Anti-Cheat Heuristics Upgrade",
      tag: "SECURITY",
      date: "September 2026",
      summary:
        "To ensure completely fair and competitive combat, we deployed an updated anti-cheat engine combined with 100Gbps DDoS scrubbing mitigation.",
      highlights: [
        "Zero-tolerance mitigation for illegal movement packets and auto-clickers",
        "Reduced false positive rate to under 0.01%",
        "Improved cross-play synchronization between Java and Bedrock clients",
      ],
    },
    {
      id: 3,
      title: "Community Weekend: Double Coins & Drop Parties",
      tag: "COMMUNITY",
      date: "August 2026",
      summary:
        "Join us this Saturday at 7:00 PM IST at /warp party for our mega seasonal drop party with Ancient keys, god kits, and rank giveaway vouchers.",
      highlights: [
        "2x Economy Coin Multiplier active across Survival and BoxPvP all weekend",
        "30 Ancient Crate Keys dropped into the community pit",
        "Live voice lounge trivia on Discord with server administrators",
      ],
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
          Changelogs &amp; Updates
        </span>
        <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
          NEWS &amp; <span className="text-emerald-400">ANNOUNCEMENTS</span>
        </h1>
        <p className="text-sm text-slate-300 leading-relaxed">
          Stay informed about the latest server updates, gameplay rebalances, and upcoming community events.
        </p>
      </div>

      <div className="space-y-6">
        {articles.map((article) => (
          <article
            key={article.id}
            className="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-800 hover:border-emerald-500/30 transition-all space-y-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-md border border-emerald-500/20">
                {article.tag}
              </span>
              <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                <Calendar className="w-3.5 h-3.5" />
                <span>{article.date}</span>
              </div>
            </div>

            <h2 className="text-2xl font-black text-white">{article.title}</h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {article.summary}
            </p>

            <div className="pt-2">
              <h3 className="text-xs font-bold text-white mb-2 uppercase tracking-wider">Key Highlights:</h3>
              <ul className="space-y-1.5">
                {article.highlights.map((h, i) => (
                  <li key={i} className="text-xs text-slate-400 flex items-start gap-2">
                    <span className="text-emerald-400 font-bold">•</span>
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
