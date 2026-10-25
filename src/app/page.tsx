import NextLink from "next/link";
import ServerStatusCard from "@/components/ServerStatusCard";
import CobaltHero from "@/components/CobaltHero";
import RecentPurchasesTicker from "@/components/RecentPurchasesTicker";
import FeaturedAnnouncement from "@/components/FeaturedAnnouncement";
import CopyButton from "@/components/CopyButton";
import {
  Sparkles,
  Sword,
  Shield,
  Zap,
  Users,
  Compass,
  ArrowRight,
  ChevronRight,
  Flame,
  CheckCircle2,
  Crown,
  Heart,
  Layers,
  ShoppingBag,
  MessageSquare,
} from "lucide-react";

export default function HomePage() {
  const gameModes = [
    {
      title: "Lifesteal SMP",
      tag: "MOST POPULAR",
      tagColor: "bg-rose-500/10 text-rose-400 border-rose-500/20",
      icon: Heart,
      iconColor: "text-rose-400 bg-rose-500/10",
      description:
        "High-stakes PvP survival. Eliminate rival players to steal their hearts. Craft revive beacons to bring fallen teammates back.",
      features: ["Heart Stealing on Kill", "Revive Beacons", "Custom Armor & Talismans", "Anti-Combat Logging"],
    },
    {
      title: "Survival SMP",
      tag: "ECONOMY",
      tagColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
      icon: Compass,
      iconColor: "text-emerald-400 bg-emerald-500/10",
      description:
        "Peaceful and community-driven survival with GriefPrevention land claims, player shops, auction houses, and 100+ custom enchantments.",
      features: ["Land Claim Protection", "Player Economy & Chest Shops", "Custom Enchantments", "Community Quests"],
    },
    {
      title: "BoxPvP",
      tag: "FAST PACED",
      tagColor: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      icon: Sword,
      iconColor: "text-amber-400 bg-amber-500/10",
      description:
        "Mine tiers, upgrade overpowered armor, and engage in frantic arena brawls with instant respawns and daily tournament brackets.",
      features: ["Tiered Mining Pits", "Instant Respawn Arenas", "Custom Shards & Crystals", "Daily Tournaments"],
    },
    {
      title: "Custom Skyblock",
      tag: "BETA RELEASE",
      tagColor: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
      icon: Layers,
      iconColor: "text-cyan-400 bg-cyan-500/10",
      description:
        "Build a sky empire from scratch. Deploy automated resource minions, explore dangerous dungeon depths, and top the island wealth ranks.",
      features: ["Automated Minions", "Island Level Upgrades", "Dungeon Boss Battles", "Co-op Island Teams"],
    },
  ];

  const featuredRanks = [
    {
      name: "VIP Rank",
      price: "₹199",
      color: "border-emerald-500/30 hover:border-emerald-500",
      badgeColor: "bg-emerald-500/15 text-emerald-400",
      badgeText: "POPULAR",
      icon: Zap,
      perks: [
        "Permanent [VIP] chat and tab tag",
        "Fly in all hub lobbies (/fly)",
        "1.5x In-Game Coin Multiplier",
        "Access to /workbench and /anvil",
        "VIP Exclusive Weekly Kit",
      ],
    },
    {
      name: "MVP Rank",
      price: "₹499",
      featured: true,
      color: "border-cyan-500/50 hover:border-cyan-400 cyan-glow",
      badgeColor: "bg-cyan-500/20 text-cyan-300",
      badgeText: "BEST VALUE",
      icon: Crown,
      perks: [
        "Permanent [MVP] aqua chat & tab tag",
        "All VIP perks included",
        "Fly in Survival SMP claims (/fly)",
        "2.5x In-Game Coin Multiplier",
        "Custom Glowing Name (/glow)",
        "Priority Queue server bypass",
      ],
    },
    {
      name: "TITAN Rank",
      price: "₹999",
      color: "border-purple-500/40 hover:border-purple-400",
      badgeColor: "bg-purple-500/15 text-purple-400",
      badgeText: "ELITE",
      icon: Flame,
      perks: [
        "Permanent [TITAN] purple chat & tab tag",
        "All VIP & MVP perks included",
        "4x In-Game Coin Multiplier",
        "Custom Particle Trails (/trails)",
        "Bi-weekly Titan God Kit",
        "Private VIP Discord Voice Channel",
      ],
    },
  ];

  return (
    <div className="flex flex-col gap-16 pb-20">
      {/* 1. AppleMC Cobalt Style Hero Header */}
      <section className="relative pt-4 pb-2">
        <CobaltHero />
      </section>

      {/* 2. AppleMC Live Store Purchases Ticker */}
      <RecentPurchasesTicker />

      {/* 3. AppleMC Cobalt Featured Forum / Announcement Card */}
      <section className="py-2">
        <FeaturedAnnouncement />
      </section>

      {/* 4. Cinematic Network Introduction & Quick Join Bar */}
      <section className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full text-center">
        <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-slate-800 relative overflow-hidden bg-gradient-to-b from-slate-900/60 to-slate-950/80">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 border border-emerald-500/30 text-xs font-semibold text-emerald-400 mb-6 shadow-lg shadow-emerald-500/10">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>SEASON 4 LIVE &bull; JAVA &amp; BEDROCK COMPATIBLE</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white max-w-3xl mx-auto leading-tight uppercase">
            YOUR NEXT ADVENTURE <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-green-300 to-teal-300">
              STARTS HERE.
            </span>
          </h1>

          <p className="mt-4 text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Welcome to <span className="text-white font-semibold">Harsh Unlimited</span> — India&apos;s premier Minecraft gaming network. Experience custom Lifesteal SMP, player-driven economy, live web dynmaps, and instant Cashfree rank delivery.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <NextLink
              href="/play"
              className="flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-400 hover:to-green-400 text-slate-950 shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all transform hover:-translate-y-0.5 cursor-pointer"
            >
              <span>HOW TO JOIN</span>
              <ArrowRight className="w-4 h-4" />
            </NextLink>

            <NextLink
              href="/store"
              className="flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 transition-all transform hover:-translate-y-0.5"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>SERVER STORE</span>
            </NextLink>

            <NextLink
              href="/map"
              className="flex items-center gap-2 px-7 py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 transition-all transform hover:-translate-y-0.5"
            >
              <Compass className="w-4 h-4 text-emerald-400" />
              <span>LIVE WEB MAP</span>
            </NextLink>
          </div>

          <div className="mt-10 w-full max-w-4xl mx-auto">
            <ServerStatusCard />
          </div>
        </div>
      </section>

      {/* Feature Highlights Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800 hover:border-emerald-500/30 transition-all">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-white text-base mb-1">Low-Ping Indian Nodes</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              High-performance dedicated infrastructure ensuring butter-smooth 20 TPS gameplay across all modes.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-slate-800 hover:border-emerald-500/30 transition-all">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-white text-base mb-1">DDoS &amp; Anti-Cheat</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Enterprise mitigation with machine-learning heuristics keeping matches fair, safe, and uninterrupted.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-slate-800 hover:border-emerald-500/30 transition-all">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-white text-base mb-1">Instant Automated Delivery</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Ranks and perks delivered to your Minecraft account in seconds following verified Cashfree payment.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-slate-800 hover:border-emerald-500/30 transition-all">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-4">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-white text-base mb-1">Passionate Community</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Active Discord community, responsive staff team, weekly tournaments, and frequent content updates.
            </p>
          </div>
        </div>
      </section>

      {/* Available Game Modes */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col items-center text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-2">
            Diverse Multiplayer Experiences
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Featured Game Modes
          </h2>
          <p className="mt-3 text-sm text-slate-400 max-w-xl">
            Choose your playstyle. Whether you desire fierce heart-stealing battles or tranquil empire construction, Harsh Unlimited has a place for you.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {gameModes.map((mode) => {
            const Icon = mode.icon;
            return (
              <div
                key={mode.title}
                className="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-800 hover:border-emerald-500/40 transition-all group relative overflow-hidden"
              >
                <div className="flex items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`p-3 rounded-xl ${mode.iconColor}`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">
                        {mode.title}
                      </h3>
                      <span className="text-xs text-slate-400 font-mono">Status: ONLINE (1.20 - 1.21.x)</span>
                    </div>
                  </div>
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${mode.tagColor}`}>
                    {mode.tag}
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mb-6">
                  {mode.description}
                </p>

                <div className="grid grid-cols-2 gap-2 pt-4 border-t border-slate-800/80">
                  {mode.features.map((feat) => (
                    <div key={feat} className="flex items-center gap-1.5 text-xs text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="truncate">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Featured Ranks Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col items-center text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-400 mb-2">
            Upgrade Your Gameplay
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Featured Network Ranks
          </h2>
          <p className="mt-3 text-sm text-slate-400 max-w-xl">
            Unlock exclusive lobby flight, coin boosters, custom glow cosmetics, and priority queue slots across Harsh Unlimited.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredRanks.map((rank) => {
            const Icon = rank.icon;
            return (
              <div
                key={rank.name}
                className={`glass-panel rounded-2xl p-7 flex flex-col justify-between border transition-all relative ${
                  rank.color
                } ${rank.featured ? "md:-translate-y-2" : ""}`}
              >
                {rank.featured && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-cyan-500 text-slate-950 text-[10px] font-extrabold tracking-wider uppercase shadow-md shadow-cyan-500/30">
                    MOST POPULAR
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-slate-900 text-white">
                        <Icon className="w-5 h-5 text-emerald-400" />
                      </div>
                      <h3 className="text-xl font-black text-white">{rank.name}</h3>
                    </div>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${rank.badgeColor}`}>
                      {rank.badgeText}
                    </span>
                  </div>

                  <div className="mb-6">
                    <span className="text-3xl font-black text-white">{rank.price}</span>
                    <span className="text-xs text-slate-400 ml-1">/ Permanent Lifetime</span>
                  </div>

                  <ul className="space-y-2.5 mb-8">
                    {rank.perks.map((perk) => (
                      <li key={perk} className="flex items-start gap-2 text-xs text-slate-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{perk}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <NextLink
                  href="/store"
                  className={`w-full py-3 rounded-xl text-center text-xs font-bold transition-all ${
                    rank.featured
                      ? "bg-cyan-500 hover:bg-cyan-400 text-slate-950 shadow-lg shadow-cyan-500/25"
                      : "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20"
                  }`}
                >
                  VIEW IN STORE
                </NextLink>
              </div>
            );
          })}
        </div>

        <div className="mt-8 text-center">
          <NextLink
            href="/store"
            className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
          >
            <span>Browse All Ranks, Crates, and Bundles in Server Store</span>
            <ChevronRight className="w-4 h-4" />
          </NextLink>
        </div>
      </section>

      {/* Community Call to Action */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="glass-panel rounded-3xl p-8 sm:p-12 border border-emerald-500/30 relative overflow-hidden bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950">
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-3 text-center md:text-left">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                Join the Network
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white">
                Connect With Harsh Unlimited Today
              </h2>
              <p className="text-xs sm:text-sm text-slate-300 max-w-lg">
                Enter <span className="text-emerald-400 font-mono">play.harshunlimited.fun</span> in your Minecraft client or join our official Discord server to participate in community giveaways.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <NextLink
                href="/play"
                className="px-6 py-3 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20 transition-all"
              >
                HOW TO JOIN
              </NextLink>
              <a
                href="https://discord.gg/harshunlimited"
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-3 rounded-xl font-bold text-xs bg-[#5865F2] hover:bg-[#4752c4] text-white shadow-md shadow-[#5865F2]/20 transition-all flex items-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                DISCORD SERVER
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
