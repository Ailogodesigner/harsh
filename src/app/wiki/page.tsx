"use client";

import { useState } from "react";
import NextLink from "next/link";
import {
  BookOpen,
  Shield,
  Coins,
  Sparkles,
  Swords,
  Briefcase,
  Terminal,
  Search,
  Copy,
  Check,
  HelpCircle,
  ArrowRight,
  ExternalLink,
  Layers,
  MapPin,
  Lock,
  ChevronRight,
  Zap,
} from "lucide-react";

interface CommandItem {
  cmd: string;
  desc: string;
  example?: string;
  category: "essential" | "teleport" | "economy" | "claims" | "social";
}

const COMMANDS: CommandItem[] = [
  // Essential & Teleportation
  { cmd: "/spawn", desc: "Teleport to the main server spawn safezone", category: "teleport" },
  { cmd: "/rtp", desc: "Randomly teleport into the survival wilderness to find open land", category: "teleport" },
  { cmd: "/sethome [name]", desc: "Save your current position as a named home", example: "/sethome base", category: "teleport" },
  { cmd: "/home [name]", desc: "Teleport back to your saved home location", example: "/home base", category: "teleport" },
  { cmd: "/delhome [name]", desc: "Delete a saved home location", example: "/delhome base", category: "teleport" },
  { cmd: "/homes", desc: "List all your saved home locations and available slots", category: "teleport" },
  { cmd: "/tpa <player>", desc: "Request to teleport to another player", example: "/tpa HarshUnlimited", category: "teleport" },
  { cmd: "/tpahere <player>", desc: "Request another player to teleport to you", example: "/tpahere darky", category: "teleport" },
  { cmd: "/tpaccept", desc: "Accept an incoming teleport request", category: "teleport" },
  { cmd: "/tpdeny", desc: "Decline an incoming teleport request", category: "teleport" },
  { cmd: "/back", desc: "Return to your previous location or last death point", category: "teleport" },

  // Land Claims & Protection
  { cmd: "/kit claim", desc: "Obtain your starter Golden Shovel and inspection stick", category: "claims" },
  { cmd: "/trust <player>", desc: "Grant a player full permission to build and break in your claim", example: "/trust JNVIRAJ", category: "claims" },
  { cmd: "/untrust <player>", desc: "Revoke a player's permissions from your claim", example: "/untrust JNVIRAJ", category: "claims" },
  { cmd: "/containertrust <player>", desc: "Allow a player to access chests, furnaces, and hoppers only", example: "/containertrust Manav_123", category: "claims" },
  { cmd: "/accesstrust <player>", desc: "Allow a player to use doors, buttons, levers, and beds only", example: "/accesstrust bulli_bhai", category: "claims" },
  { cmd: "/permissiontrust <player>", desc: "Grant a player the power to trust and manage other players", category: "claims" },
  { cmd: "/abandonclaim", desc: "Delete the specific land claim you are standing inside", category: "claims" },
  { cmd: "/abandonallclaims", desc: "Delete all of your land claims on the server", category: "claims" },
  { cmd: "/claimslist", desc: "View a list of all your claims, coordinates, and remaining blocks", category: "claims" },
  { cmd: "/subdivideclaim", desc: "Switch your shovel to subdivide mode to make rent/town plots", category: "claims" },

  // Economy & Trading
  { cmd: "/bal", desc: "Check your current server cash balance", category: "economy" },
  { cmd: "/baltop", desc: "View the wealthiest players on the server ($109M+ economy)", category: "economy" },
  { cmd: "/pay <player> <amount>", desc: "Send server cash directly to another online player", example: "/pay darky 5000", category: "economy" },
  { cmd: "/ah", desc: "Open the global player Auction House marketplace", category: "economy" },
  { cmd: "/ah sell <price>", desc: "List the item held in your main hand for sale on the Auction House", example: "/ah sell 25000", category: "economy" },
  { cmd: "/shop", desc: "Open the server admin supply and resource shop", category: "economy" },
  { cmd: "/trade <player>", desc: "Initiate a secure GUI trade window with a nearby player", example: "/trade CaptainCharlie56", category: "economy" },

  // Jobs & Skills
  { cmd: "/jobs browse", desc: "Open the interactive jobs board to view all 8 occupations", category: "essential" },
  { cmd: "/jobs join <job>", desc: "Join an occupation (Miner, Hunter, Woodcutter, Farmer, etc.)", example: "/jobs join Miner", category: "essential" },
  { cmd: "/jobs stats", desc: "View your current job levels, XP progress, and income multipliers", category: "essential" },
  { cmd: "/quests", desc: "Open daily and weekly community quests for extra coins & loot", category: "essential" },

  // Social & Community
  { cmd: "/msg <player> <text>", desc: "Send a private direct message to an online player", example: "/msg HarshUnlimited Need help with claim", category: "social" },
  { cmd: "/r <text>", desc: "Quickly reply to the last private message you received", example: "/r On my way!", category: "social" },
  { cmd: "/mail read", desc: "Read offline messages sent to you by other players or staff", category: "social" },
  { cmd: "/discord", desc: "Get the official Harsh Unlimited Discord community invite link", category: "social" },
  { cmd: "/rules", desc: "Review server conduct rules, griefing laws, and PvP guidelines", category: "social" },
];

const CUSTOM_ENCHANTS = [
  {
    name: "Lifesteal",
    tier: "LEGENDARY",
    target: "Swords / Axes",
    desc: "Chance to siphon hearts directly from your opponent on hit and heal yourself.",
    color: "text-amber-400 border-amber-500/30 bg-amber-500/10",
  },
  {
    name: "Overload",
    tier: "LEGENDARY",
    target: "Armor (Chestplate)",
    desc: "Permanently adds extra heart containers (up to +4 extra hearts) while worn.",
    color: "text-amber-400 border-amber-500/30 bg-amber-500/10",
  },
  {
    name: "Double Strike",
    tier: "ULTIMATE",
    target: "Swords",
    desc: "Chance to unleash a swift second hit dealing 100% additional damage in one swing.",
    color: "text-purple-400 border-purple-500/30 bg-purple-500/10",
  },
  {
    name: "Vein Miner",
    tier: "ULTIMATE",
    target: "Pickaxes",
    desc: "Mines out an entire connected vein of ores in a single stroke.",
    color: "text-purple-400 border-purple-500/30 bg-purple-500/10",
  },
  {
    name: "Timber",
    tier: "ELITE",
    target: "Axes",
    desc: "Cuts down entire trees from top to bottom instantly when breaking the bottom log.",
    color: "text-cyan-400 border-cyan-500/30 bg-cyan-500/10",
  },
  {
    name: "Auto-Smelt",
    tier: "ELITE",
    target: "Pickaxes / Shovels",
    desc: "Automatically smelts mined blocks (e.g. Iron Ore into Iron Ingot, Sand into Glass).",
    color: "text-cyan-400 border-cyan-500/30 bg-cyan-500/10",
  },
  {
    name: "Gears",
    tier: "UNIQUE",
    target: "Boots",
    desc: "Grants continuous Speed II / Speed III buff while boots are equipped.",
    color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
  },
  {
    name: "Springs",
    tier: "UNIQUE",
    target: "Boots",
    desc: "Grants Jump Boost II allowing effortless mountain climbing and obstacle leaping.",
    color: "text-emerald-400 border-emerald-500/30 bg-emerald-500/10",
  },
  {
    name: "Telepathy",
    tier: "SIMPLE",
    target: "All Mining Tools",
    desc: "Drops mined items and experience directly into your inventory instead of falling on the ground.",
    color: "text-slate-300 border-slate-700 bg-slate-800/40",
  },
];

const JOBS = [
  {
    title: "Miner",
    icon: "⛏️",
    desc: "Earn cash and XP by mining stone, deepslate, diamonds, emeralds, and ancient debris.",
    income: "High Cash / High Rare Materials",
  },
  {
    title: "Woodcutter",
    icon: "🪓",
    desc: "Get paid for chopping down oak, spruce, birch, cherry, and mangrove forests.",
    income: "Steady Hourly Cash",
  },
  {
    title: "Hunter",
    icon: "🏹",
    desc: "Earn bounties by slaying hostile mobs, Nether monsters, and rival players in PvP.",
    income: "High Combat XP & Mob Drops",
  },
  {
    title: "Farmer",
    icon: "🌾",
    desc: "Cultivate wheat, carrots, potatoes, nether wart, and breed animals for steady profit.",
    income: "Passive / Automated Wealth",
  },
  {
    title: "Builder",
    icon: "🧱",
    desc: "Get rewarded simply for placing blocks and constructing grand bases and towns.",
    income: "Rewarded on Build Milestones",
  },
  {
    title: "Digger",
    icon: "铲",
    desc: "Dig up dirt, sand, gravel, and clay to terraform land and supply builders.",
    income: "Fast Early-Game Cash",
  },
];

export default function WikiPage() {
  const [activeTab, setActiveTab] = useState<"claims" | "commands" | "enchants" | "jobs" | "faq">("claims");
  const [searchQuery, setSearchQuery] = useState("");
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const copyToClipboard = (cmd: string) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(cmd);
    setTimeout(() => setCopiedCmd(null), 2000);
  };

  const filteredCommands = COMMANDS.filter(
    (c) =>
      c.cmd.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.example && c.example.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-12">
      {/* Hero Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs font-bold text-emerald-400 uppercase tracking-widest">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Official Knowledge Base</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
          SERVER <span className="text-emerald-400">WIKI &amp; GUIDE</span>
        </h1>
        <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
          The complete player manual for Harsh Unlimited Survival SMP. Master land claiming, auction house trading, custom enchantments, in-game jobs, and all player commands.
        </p>

        {/* Quick Search */}
        <div className="pt-2 max-w-xl mx-auto">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (e.target.value.trim().length > 0 && activeTab !== "commands") {
                  setActiveTab("commands");
                }
              }}
              placeholder="Search commands, land claims, enchantments..."
              className="w-full bg-slate-900/90 border border-slate-700/80 rounded-2xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-xl shadow-black/40"
            />
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center justify-center">
        <div className="inline-flex flex-wrap items-center justify-center gap-1.5 p-1.5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
          <button
            onClick={() => setActiveTab("claims")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "claims"
                ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <Shield className="w-4 h-4" />
            <span>Land Claiming</span>
          </button>

          <button
            onClick={() => setActiveTab("commands")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "commands"
                ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>Commands Cheatsheet</span>
          </button>

          <button
            onClick={() => setActiveTab("enchants")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "enchants"
                ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>Custom Enchants</span>
          </button>

          <button
            onClick={() => setActiveTab("jobs")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "jobs"
                ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>Jobs &amp; Economy</span>
          </button>

          <button
            onClick={() => setActiveTab("faq")}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeTab === "faq"
                ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                : "text-slate-400 hover:text-white hover:bg-slate-800/60"
            }`}
          >
            <HelpCircle className="w-4 h-4" />
            <span>FAQ &amp; Crossplay</span>
          </button>
        </div>
      </div>

      {/* TAB CONTENT 1: LAND CLAIMING */}
      {activeTab === "claims" && (
        <div className="space-y-8 animate-in fade-in duration-200">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Shield className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white">How Land Claiming Works</h2>
                <p className="text-xs sm:text-sm text-slate-400">
                  Protect your bases, chests, animal pens, and builds from griefing, theft, and unauthorized destruction.
                </p>
              </div>
            </div>

            {/* 3 Step Visual Guide */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 font-black text-sm flex items-center justify-center font-mono">
                  1
                </div>
                <h3 className="font-bold text-white text-sm">Equip a Golden Shovel</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Type <code className="text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded font-mono">/kit claim</code> in chat to receive your free starter Golden Shovel and inspection stick.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-black text-sm flex items-center justify-center font-mono">
                  2
                </div>
                <h3 className="font-bold text-white text-sm">Select Two Opposite Corners</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Right-click one corner block of your desired plot, then run across and right-click the opposite diagonal corner. Gold &amp; glowstone boundary blocks will visualize your claim.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
                <div className="w-8 h-8 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 font-black text-sm flex items-center justify-center font-mono">
                  3
                </div>
                <h3 className="font-bold text-white text-sm">Trust Friends &amp; Clan</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Use <code className="text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded font-mono">/trust &lt;friend&gt;</code> to allow friends to build, or <code className="text-purple-400 bg-purple-500/10 px-1.5 py-0.5 rounded font-mono">/containertrust</code> to grant chest access only.
                </p>
              </div>
            </div>
          </div>

          {/* Trust Permissions Table */}
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-400" />
              <span>Claim Trust Levels &amp; Permissions</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-3 px-4">Command</th>
                    <th className="py-3 px-4">Access Level</th>
                    <th className="py-3 px-4">What They Can Do</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  <tr>
                    <td className="py-3.5 px-4 font-bold text-emerald-400">/trust &lt;player&gt;</td>
                    <td className="py-3.5 px-4 text-white font-sans font-semibold">Full Build Trust</td>
                    <td className="py-3.5 px-4 text-slate-300 font-sans">Can build, break, access chests, and use animals.</td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => copyToClipboard("/trust ")}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-sans inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-4 font-bold text-amber-400">/containertrust &lt;player&gt;</td>
                    <td className="py-3.5 px-4 text-white font-sans font-semibold">Container Trust</td>
                    <td className="py-3.5 px-4 text-slate-300 font-sans">Can open chests, furnaces, hoppers, shulkers, and brewing stands.</td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => copyToClipboard("/containertrust ")}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-sans inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-4 font-bold text-cyan-400">/accesstrust &lt;player&gt;</td>
                    <td className="py-3.5 px-4 text-white font-sans font-semibold">Access Trust</td>
                    <td className="py-3.5 px-4 text-slate-300 font-sans">Can open wooden doors, trapdoors, press buttons, and sleep in beds.</td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => copyToClipboard("/accesstrust ")}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-sans inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </button>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-4 font-bold text-rose-400">/untrust &lt;player&gt;</td>
                    <td className="py-3.5 px-4 text-white font-sans font-semibold">Revoke Permissions</td>
                    <td className="py-3.5 px-4 text-slate-300 font-sans">Removes all access rights from this player in your claim.</td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => copyToClipboard("/untrust ")}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] font-sans inline-flex items-center gap-1 cursor-pointer"
                      >
                        <Copy className="w-3 h-3" />
                        <span>Copy</span>
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Pro Tip */}
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-300 flex items-center gap-3">
              <Sparkles className="w-5 h-5 shrink-0 text-emerald-400" />
              <span>
                <strong>How to earn claim blocks:</strong> You earn 100 bonus claim blocks for every hour of active survival playtime on Harsh Unlimited!
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: COMMANDS CHEATSHEET */}
      {activeTab === "commands" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
                <Terminal className="w-6 h-6 text-emerald-400" />
                <span>All In-Game Player Commands</span>
              </h2>
              <p className="text-xs text-slate-400">
                Click any command to copy it directly to your clipboard.
              </p>
            </div>
            <div className="text-xs font-mono text-slate-400 bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-800">
              Showing {filteredCommands.length} commands
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {filteredCommands.map((item) => {
              const isCopied = copiedCmd === item.cmd;
              return (
                <div
                  key={item.cmd}
                  onClick={() => copyToClipboard(item.cmd)}
                  className="glass-panel p-4 rounded-2xl border border-slate-800/80 hover:border-emerald-500/40 transition-all cursor-pointer group flex items-start justify-between gap-3 bg-slate-900/60 hover:bg-slate-900"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-emerald-400 text-sm group-hover:text-emerald-300 transition-colors">
                        {item.cmd}
                      </span>
                      <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-mono">
                        {item.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300">{item.desc}</p>
                    {item.example && (
                      <p className="text-[11px] font-mono text-slate-500">
                        Example: <span className="text-slate-400">{item.example}</span>
                      </p>
                    )}
                  </div>

                  <button
                    type="button"
                    className={`p-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                      isCopied
                        ? "bg-emerald-500 text-slate-950"
                        : "bg-slate-800 text-slate-400 group-hover:text-white group-hover:bg-slate-700"
                    }`}
                  >
                    {isCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: CUSTOM ENCHANTS */}
      {activeTab === "enchants" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white">Custom Enchantments</h2>
                <p className="text-xs sm:text-sm text-slate-400">
                  Over 100+ custom enchants accessible in-game via Enchanter NPC, Tinkerer, and Dungeon Boss drops.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4">
              {CUSTOM_ENCHANTS.map((enc) => (
                <div
                  key={enc.name}
                  className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3 bg-slate-900/60 hover:border-purple-500/30 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-black text-white text-base">{enc.name}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider font-mono ${enc.color}`}>
                      {enc.tier}
                    </span>
                  </div>
                  <div className="text-[11px] font-bold text-slate-400 flex items-center gap-1.5">
                    <Swords className="w-3.5 h-3.5 text-slate-500" />
                    <span>Applies to: {enc.target}</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{enc.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 4: JOBS & ECONOMY */}
      {activeTab === "jobs" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Coins className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-black text-white">Jobs &amp; Player Economy ($109M+ Baltop)</h2>
                <p className="text-xs sm:text-sm text-slate-400">
                  Join up to 3 jobs at once with <code className="text-amber-400 font-mono">/jobs join &lt;name&gt;</code> to automatically earn server cash while mining, chopping, or farming!
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {JOBS.map((job) => (
                <div
                  key={job.title}
                  className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3 bg-slate-900/60"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">{job.icon}</div>
                    <div>
                      <h3 className="font-bold text-white text-base">{job.title}</h3>
                      <span className="text-[10px] text-amber-400 font-mono">{job.income}</span>
                    </div>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">{job.desc}</p>
                </div>
              ))}
            </div>

            {/* Auction House Guide */}
            <div className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Coins className="w-4 h-4 text-emerald-400" />
                <span>Player Auction House (/ah)</span>
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Sell rare enchanted books, Netherite gear, or custom heads to the entire network:
              </p>
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                <span className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-emerald-400">
                  /ah sell &lt;price&gt;
                </span>
                <span className="text-slate-400 font-sans text-xs">Lists your held item on the market.</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 5: FAQ & CROSSPLAY */}
      {activeTab === "faq" && (
        <div className="space-y-6 animate-in fade-in duration-200">
          <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
            <h2 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <HelpCircle className="w-6 h-6 text-emerald-400" />
              <span>Frequently Asked Questions &amp; Technical Guide</span>
            </h2>

            <div className="space-y-4">
              <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                <h3 className="font-bold text-white text-sm">Can Java and Bedrock players play together?</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Yes! Harsh Unlimited features seamless cross-play powered by Geyser &amp; Floodgate. PC, Mobile, Xbox, PlayStation, and Switch players can all build and PvP together in the exact same world.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                <h3 className="font-bold text-white text-sm">What is the Bedrock Server Port?</h3>
                <p className="text-xs text-slate-300 leading-relaxed font-mono">
                  IP: <span className="text-emerald-400">play.harshunlimited.fun</span> • Port: <span className="text-emerald-400 font-bold">25565</span> (Updated uniform connection port).
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                <h3 className="font-bold text-white text-sm">What happens when I die in Survival SMP?</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  In Survival SMP, you can use <code className="text-emerald-400 font-mono">/back</code> to return to your last location or death point. Your items are protected inside your death beacon for 15 minutes.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
                <h3 className="font-bold text-white text-sm">How do I report griefing or rulebreakers?</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Take screenshots or record video, then submit a player report via our Support Desk at{" "}
                  <NextLink href="/support" className="text-emerald-400 underline font-semibold">
                    /support
                  </NextLink>{" "}
                  or join our official Discord server.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Bottom CTA Banner */}
      <div className="glass-panel rounded-3xl p-8 sm:p-10 border border-emerald-500/30 text-center space-y-4 bg-gradient-to-r from-emerald-950/20 via-slate-900 to-emerald-950/20 relative overflow-hidden">
        <h3 className="text-2xl sm:text-3xl font-black text-white">Ready to Put Your Skills to the Test?</h3>
        <p className="text-xs sm:text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Join hundreds of active players on Harsh Unlimited Survival SMP today. Connect now on Java or Bedrock with port 25565!
        </p>
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <NextLink
            href="/play"
            className="inline-flex items-center gap-2 px-7 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/25 transition-all"
          >
            <span>Connect &amp; Play Now</span>
            <ArrowRight className="w-4 h-4" />
          </NextLink>

          <NextLink
            href="/leaderboards"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-white font-bold text-xs uppercase tracking-wider transition-all"
          >
            <span>View Leaderboards</span>
          </NextLink>
        </div>
      </div>
    </div>
  );
}
