"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  Check,
  Plus,
  Shield,
  Ticket,
  Coins,
  Trophy,
  Bot,
  Music,
  Gift,
  Globe,
  Sliders,
  ArrowRight,
  Sparkles,
  Zap,
  CheckCircle2,
  Clock,
  Send,
  HelpCircle,
  X,
  CreditCard,
  Lock,
  Layers,
} from "lucide-react";
import DiscordIcon from "@/components/DiscordIcon";
import { playCyberClick, playCyberHover, playCyberSuccess } from "@/components/ui/SoundEffects";

interface BotFeature {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  recommended?: boolean;
  tags: string[];
}

const FEATURE_CATALOG: BotFeature[] = [
  // 🛡️ Moderation & Security
  {
    id: "automod",
    name: "Advanced AutoMod Engine",
    category: "Moderation",
    price: 399,
    description: "Anti-spam, mass mention detection, custom regex filters, and zero-delay rule enforcement.",
    recommended: true,
    tags: ["automod", "spam", "filter", "antispam", "moderation", "security"],
  },
  {
    id: "anti-nuke",
    name: "Anti-Nuke & Anti-Raid Guard",
    category: "Moderation",
    price: 499,
    description: "Protection against mass kicks, channel/role deletions, unauthorized webhooks, and sudden raid joins.",
    recommended: true,
    tags: ["antinuke", "antiraid", "security", "protection", "raid", "nuke"],
  },
  {
    id: "captcha-verification",
    name: "Captcha & Rules Gate Verification",
    category: "Moderation",
    price: 299,
    description: "Interactive button/modal or image captcha verification before granting access to server channels.",
    tags: ["captcha", "verify", "verification", "onboarding", "rules", "gate"],
  },
  {
    id: "warn-punish",
    name: "Warning System & Auto-Punishment",
    category: "Moderation",
    price: 249,
    description: "Tiered infraction tracking with automated mute/kick/ban escalations when warning thresholds are hit.",
    tags: ["warn", "warnings", "punish", "infractions", "modlog"],
  },
  {
    id: "mod-audit-log",
    name: "Comprehensive Staff Audit Logging",
    category: "Moderation",
    price: 199,
    description: "Formatted rich embed logs for message edits, deletions, voice state changes, and role assignments.",
    tags: ["logs", "audit", "modlogs", "tracking", "history"],
  },
  {
    id: "timeout-mute",
    name: "Timeout & Voice Isolation Suite",
    category: "Moderation",
    price: 199,
    description: "Custom duration timeout commands with DM appeal notifications and voice channel muting.",
    tags: ["mute", "timeout", "voice", "appeal"],
  },

  // 🎫 Ticket Systems
  {
    id: "multi-ticket",
    name: "Multi-Department Ticket System",
    category: "Tickets",
    price: 499,
    description: "Button/dropdown ticket creator routing to specific staff departments (Support, Billing, Staff Apps).",
    recommended: true,
    tags: ["tickets", "ticket", "support", "department", "claim"],
  },
  {
    id: "ticket-transcripts",
    name: "HTML & Text Transcript Archiving",
    category: "Tickets",
    price: 299,
    description: "Automatically renders complete message history with attachments into downloadable web transcripts.",
    recommended: true,
    tags: ["transcripts", "html", "archive", "export", "tickets"],
  },
  {
    id: "ticket-modal-forms",
    name: "Modal Questionnaire Gate",
    category: "Tickets",
    price: 249,
    description: "Opens pop-up modal questionnaires before ticket creation so users provide necessary order/account details.",
    tags: ["modal", "forms", "questions", "tickets", "intake"],
  },
  {
    id: "ticket-claim-survey",
    name: "Staff Claim System & Star Rating",
    category: "Tickets",
    price: 249,
    description: "Staff members can claim tickets exclusively, with 5-star customer feedback ratings upon closing.",
    tags: ["claim", "survey", "rating", "staff", "tickets"],
  },

  // 💰 Economy & Currency
  {
    id: "virtual-currency",
    name: "Virtual Currency & Banking System",
    category: "Economy",
    price: 449,
    description: "Wallet and bank balances, deposit/withdraw limits, hourly work commands, and transfer fees.",
    recommended: true,
    tags: ["economy", "currency", "bank", "wallet", "coins", "money"],
  },
  {
    id: "server-shop",
    name: "Server Shop & Role Purchases",
    category: "Economy",
    price: 349,
    description: "Interactive shop where members purchase VIP roles, color roles, badge items, or temporary perks.",
    tags: ["shop", "store", "roles", "perks", "buy", "economy"],
  },
  {
    id: "gambling-casino",
    name: "Casino & Gambling Mini-Games",
    category: "Economy",
    price: 399,
    description: "Blackjack, Coinflip, Roulette, and Slots with fair server-side odds and jackpot announcements.",
    tags: ["gambling", "casino", "coinflip", "blackjack", "slots", "games"],
  },
  {
    id: "rob-crime-work",
    name: "Work, Crime, Rob & Slut Commands",
    category: "Economy",
    price: 249,
    description: "Fun probabilistic risk-reward actions with customizable jail cooldowns and police fines.",
    tags: ["work", "rob", "crime", "cooldowns", "economy"],
  },
  {
    id: "daily-streaks",
    name: "Daily & Weekly Streak Multipliers",
    category: "Economy",
    price: 199,
    description: "Consecutive daily check-in streaks with compounding currency multipliers to boost daily activity.",
    tags: ["daily", "streaks", "rewards", "multiplier", "login"],
  },

  // 🏆 Leveling & Engagement
  {
    id: "text-voice-xp",
    name: "Text & Voice Minute XP Tracking",
    category: "Leveling",
    price: 399,
    description: "Accrues XP dynamically for text messages and active voice channel minutes with anti-spam algorithms.",
    recommended: true,
    tags: ["leveling", "xp", "voice", "activity", "levels"],
  },
  {
    id: "canvas-rank-cards",
    name: "Custom Graphic Canvas Rank Cards",
    category: "Leveling",
    price: 499,
    description: "High-resolution custom image rank cards generated on-the-fly with avatar, rank, and progress bar.",
    recommended: true,
    tags: ["rankcard", "canvas", "image", "graphics", "card", "leveling"],
  },
  {
    id: "role-rewards",
    name: "Automated Level Role Rewards",
    category: "Leveling",
    price: 249,
    description: "Automatically awards elevated roles and unlocked permissions as members hit level milestones.",
    tags: ["roles", "rewards", "milestones", "leveling"],
  },
  {
    id: "web-leaderboard",
    name: "Real-Time Server Leaderboard",
    category: "Leveling",
    price: 349,
    description: "Live top-100 member ranking display in Discord embeds with pagination and web link support.",
    tags: ["leaderboard", "ranking", "top", "competition", "leveling"],
  },

  // 🤖 AI & Smart Automation
  {
    id: "ai-chatgpt",
    name: "ChatGPT / Claude AI Conversation",
    category: "AI & Smart",
    price: 599,
    description: "Intelligent AI chat agent with server-specific memory, personality tuning, and thread support.",
    recommended: true,
    tags: ["ai", "chatgpt", "claude", "bot", "assistant", "smart"],
  },
  {
    id: "ai-faq-responder",
    name: "Automated Rules & FAQ Assistant",
    category: "AI & Smart",
    price: 449,
    description: "Semantic search answering community questions instantly from server guidelines without human staff.",
    tags: ["ai", "faq", "answers", "rules", "assistant", "help"],
  },
  {
    id: "ai-image-gen",
    name: "AI Image Generation Integration",
    category: "AI & Smart",
    price: 499,
    description: "Generate customized images inside Discord via DALL-E or Stable Diffusion with parameter controls.",
    tags: ["ai", "image", "dalle", "generate", "art"],
  },

  // 🎵 Music, Voice & Audio
  {
    id: "music-streamer",
    name: "High-Fidelity Audio Streamer",
    category: "Music & Voice",
    price: 499,
    description: "Queue management, Spotify playlist importing, pause/skip, volume control, and bass boost filters.",
    tags: ["music", "audio", "spotify", "youtube", "queue", "voice"],
  },
  {
    id: "temp-voice-channels",
    name: "Dynamic Temporary Voice Channels",
    category: "Music & Voice",
    price: 349,
    description: "'Join to Create' voice hubs giving users private temporary rooms with locking, renaming, and limits.",
    recommended: true,
    tags: ["voice", "tempvoice", "channels", "j2c", "private"],
  },
  {
    id: "radio-247",
    name: "24/7 Keep-Alive Radio Stream",
    category: "Music & Voice",
    price: 299,
    description: "Non-stop uninterrupted stream in designated voice channels with automatic reconnect on restart.",
    tags: ["radio", "247", "lofi", "voice", "stream"],
  },

  // 🎁 Giveaways & Community
  {
    id: "interactive-giveaways",
    name: "Requirement-Gated Giveaway System",
    category: "Giveaways",
    price: 349,
    description: "Button-click giveaways requiring specific roles, server invites, or XP levels to participate.",
    recommended: true,
    tags: ["giveaway", "giveaways", "prizes", "events", "winner"],
  },
  {
    id: "live-voting-polls",
    name: "Interactive Polls & Starboard",
    category: "Giveaways",
    price: 249,
    description: "Multi-option live-updating polls and community Starboard pinning popular messages to a highlight feed.",
    tags: ["polls", "starboard", "voting", "community"],
  },

  // 🌐 Web Dashboard & Integrations
  {
    id: "web-dashboard",
    name: "Next.js 16 Web Dashboard",
    category: "Web & API",
    price: 999,
    description: "Complete web portal for server owners to toggle bot modules, edit embeds, and view real-time statistics.",
    recommended: true,
    tags: ["dashboard", "web", "nextjs", "portal", "admin"],
  },
  {
    id: "custom-api-endpoints",
    name: "Custom REST API & Webhook Bridge",
    category: "Web & API",
    price: 499,
    description: "Connect your Discord bot to external websites, games, databases, or payment gateways via secure API.",
    tags: ["api", "rest", "webhooks", "integration", "backend"],
  },
  {
    id: "payment-gateway-upi",
    name: "UPI / Cashfree / Stripe Invoicing",
    category: "Web & API",
    price: 699,
    description: "Direct automated in-Discord payments with QR codes, webhook verification, and automatic role delivery.",
    recommended: true,
    tags: ["payment", "upi", "cashfree", "stripe", "invoicing", "store"],
  },
  {
    id: "social-media-feeds",
    name: "YouTube, Twitch & X Feeds",
    category: "Web & API",
    price: 299,
    description: "Instant notification pings whenever your favorite creator goes live or publishes a new video/tweet.",
    tags: ["youtube", "twitch", "twitter", "feeds", "notifications"],
  },
];

const CATEGORIES = [
  "All",
  "Moderation",
  "Tickets",
  "Economy",
  "Leveling",
  "AI & Smart",
  "Music & Voice",
  "Giveaways",
  "Web & API",
];

const BASE_CORE_SETUP_PRICE = 999; // Base Discord.js / Python core engine setup

export default function BotOrderPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedFeatureIds, setSelectedFeatureIds] = useState<string[]>([
    "automod",
    "multi-ticket",
    "ticket-transcripts",
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submittedOrder, setSubmittedOrder] = useState<any | null>(null);

  // Form State
  const [clientName, setClientName] = useState("");
  const [discordTag, setDiscordTag] = useState("");
  const [email, setEmail] = useState("");
  const [botName, setBotName] = useState("");
  const [botConcept, setBotConcept] = useState("");
  const [timeline, setTimeline] = useState("3-5 Days");
  const [additionalNotes, setAdditionalNotes] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  // Toggle Feature Selection
  const toggleFeature = (id: string) => {
    playCyberClick();
    if (selectedFeatureIds.includes(id)) {
      setSelectedFeatureIds(selectedFeatureIds.filter((item) => item !== id));
    } else {
      setSelectedFeatureIds([...selectedFeatureIds, id]);
    }
  };

  // Filter features based on search and category
  const filteredFeatures = useMemo(() => {
    return FEATURE_CATALOG.filter((f) => {
      const matchesCategory =
        selectedCategory === "All" || f.category.toLowerCase() === selectedCategory.toLowerCase();
      const query = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !query ||
        f.name.toLowerCase().includes(query) ||
        f.description.toLowerCase().includes(query) ||
        f.tags.some((t) => t.toLowerCase().includes(query));
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  // Selected features array & totals
  const selectedFeatures = useMemo(() => {
    return FEATURE_CATALOG.filter((f) => selectedFeatureIds.includes(f.id));
  }, [selectedFeatureIds]);

  const featuresTotal = useMemo(() => {
    return selectedFeatures.reduce((acc, curr) => acc + curr.price, 0);
  }, [selectedFeatures]);

  const totalPrice = BASE_CORE_SETUP_PRICE + featuresTotal;
  const advanceDeposit = Math.round(totalPrice * 0.5); // 50% Advance Milestone
  const balanceDue = totalPrice - advanceDeposit; // 50% On Delivery

  // Submit Order to API
  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (selectedFeatures.length === 0) {
      setFormError("Please select at least one feature for your custom bot.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/bot-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientName,
          discordTag,
          email,
          botName,
          botConcept,
          selectedFeatures: selectedFeatures.map((f) => ({
            id: f.id,
            name: f.name,
            category: f.category,
            price: f.price,
          })),
          totalEstimatedPrice: totalPrice,
          advancePaymentRequired: advanceDeposit,
          timeline,
          additionalNotes,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setFormError(data.error || "Failed to submit order.");
      } else {
        playCyberSuccess();
        setSubmittedOrder(data);
      }
    } catch {
      setFormError("Network error. Please make sure your server is online or contact on Discord.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05050a] text-slate-100 relative pb-32">
      {/* Background ambient lighting */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-[450px] bg-gradient-to-b from-purple-600/15 via-fuchsia-600/5 to-transparent blur-[120px] pointer-events-none" />

      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#070512]/90 backdrop-blur-xl border-b border-purple-500/20 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 via-fuchsia-500 to-lime-400 p-[1px]">
            <div className="w-full h-full bg-[#0a0914] rounded-[11px] flex items-center justify-center font-black text-xs text-lime-400 font-mono">
              NN
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-black text-white text-base tracking-tight group-hover:text-lime-400 transition-colors">
              NOTIXNODE
            </span>
            <span className="text-[10px] font-mono text-purple-300/80">/ BOT BUILDER</span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="text-xs font-mono text-purple-300 hover:text-white px-3 py-1.5 rounded-lg border border-purple-500/30 hover:border-purple-500/60 transition-colors"
          >
            Client Login
          </Link>
          <a
            href="https://dsc.gg/notixnode"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg bg-[#5865F2] hover:bg-[#4752c4] text-white text-xs font-bold transition-all shadow-sm"
          >
            <DiscordIcon className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Join Discord</span>
          </a>
        </div>
      </header>

      {/* Hero Header */}
      <section className="pt-12 pb-8 px-4 sm:px-6 max-w-6xl mx-auto text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-xs font-semibold text-purple-300">
          <Sparkles className="w-3.5 h-3.5 text-lime-400" />
          <span>Interactive Discord Bot Configurator</span>
        </div>

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-black text-white tracking-tight font-sans">
          Build Your Custom Discord Bot
        </h1>

        <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto font-sans leading-relaxed">
          Select the features your server needs from over 40+ production-tested modules. Receive live transparent pricing with our safe{" "}
          <strong className="text-lime-400">50% Advance Milestone Policy</strong>.
        </p>

        {/* Milestone Policy Notice */}
        <div className="max-w-xl mx-auto p-3.5 rounded-2xl bg-[#0d0a21]/90 border border-purple-500/30 text-xs text-purple-200 flex items-center justify-between gap-4 font-mono shadow-lg">
          <div className="flex items-center gap-2.5 text-left">
            <Shield className="w-4 h-4 text-lime-400 shrink-0" />
            <span>
              <strong>Milestone Payment:</strong> 50% deposit to commence development • 50% final balance upon live server demonstration.
            </span>
          </div>
        </div>
      </section>

      {/* Search & Category Filter Bar */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-6">
        <div className="flex flex-col sm:flex-row items-center gap-4">
          {/* Search Input */}
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-purple-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search features (e.g. ticket, automod, economy, ai)..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#090718] border border-purple-500/30 focus:border-lime-400 focus:outline-none text-xs text-white placeholder:text-purple-300/40 transition-colors shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white text-xs"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Category Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto w-full pb-2 sm:pb-0 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => {
                  setSelectedCategory(cat);
                  playCyberClick();
                }}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-medium transition-all shrink-0 cursor-pointer ${
                  selectedCategory === cat
                    ? "bg-lime-400 text-black font-bold shadow-[0_0_15px_rgba(163,230,53,0.3)]"
                    : "bg-[#090718] text-purple-300/80 hover:text-white border border-purple-500/20 hover:border-purple-500/50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Main Content Layout: Feature Grid + Sticky Sidebar Summary */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Feature Cards Grid (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-purple-500/20">
            <span className="text-xs font-mono text-purple-300">
              Showing {filteredFeatures.length} available bot capabilities
            </span>
            <span className="text-xs font-mono text-lime-400">
              {selectedFeatureIds.length} Selected
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredFeatures.map((feat) => {
              const isSelected = selectedFeatureIds.includes(feat.id);
              return (
                <div
                  key={feat.id}
                  onClick={() => toggleFeature(feat.id)}
                  onMouseEnter={() => playCyberHover()}
                  className={`p-4 sm:p-5 rounded-2xl transition-all duration-200 cursor-pointer border flex flex-col justify-between relative group ${
                    isSelected
                      ? "bg-gradient-to-br from-[#120d2c] via-[#0d0921] to-[#070512] border-lime-400 shadow-[0_0_20px_rgba(163,230,53,0.2)]"
                      : "bg-[#090718] border-purple-500/20 hover:border-purple-400/50 hover:bg-[#0d0a22]"
                  }`}
                >
                  {/* Top Bar with Category & Checkbox */}
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/30 uppercase font-semibold">
                        {feat.category}
                      </span>

                      <div
                        className={`w-5 h-5 rounded-lg flex items-center justify-center transition-all ${
                          isSelected
                            ? "bg-lime-400 text-black shadow-[0_0_10px_#a3e635]"
                            : "bg-[#110d28] border border-purple-500/30 text-transparent group-hover:border-lime-400/60"
                        }`}
                      >
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    </div>

                    <h3 className="text-base font-bold text-white font-sans tracking-tight leading-snug">
                      {feat.name}
                    </h3>

                    <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                      {feat.description}
                    </p>
                  </div>

                  {/* Bottom Price Strip */}
                  <div className="mt-4 pt-3 border-t border-purple-500/15 flex items-center justify-between text-xs font-mono">
                    <span className="text-purple-300/80">Add-on module:</span>
                    <span className="text-lime-400 font-bold">+₹{feat.price}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredFeatures.length === 0 && (
            <div className="py-16 text-center space-y-3 p-8 rounded-2xl bg-[#090718] border border-purple-500/20">
              <HelpCircle className="w-8 h-8 text-purple-400 mx-auto" />
              <h4 className="text-base font-bold text-white">No matching features found</h4>
              <p className="text-xs text-slate-400">
                Try searching with a different keyword or reset category to "All".
              </p>
              <button
                onClick={() => {
                  setSearchQuery("");
                  setSelectedCategory("All");
                }}
                className="px-4 py-2 rounded-xl bg-purple-500/20 text-purple-300 text-xs font-mono font-bold hover:bg-purple-500/30"
              >
                Reset Search Filters
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Sticky Summary & Price Calculator (4 cols) */}
        <div className="lg:col-span-4 sticky top-20 space-y-6">
          <div className="p-6 rounded-3xl bg-gradient-to-b from-[#100b28] via-[#090718] to-[#05040f] border border-purple-500/30 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-lime-400/5 blur-[50px] rounded-full pointer-events-none" />

            <div className="flex items-center justify-between pb-4 border-b border-purple-500/20">
              <div className="flex items-center gap-2">
                <Sliders className="w-4 h-4 text-lime-400" />
                <h3 className="font-bold text-white text-base font-sans">
                  Order Summary
                </h3>
              </div>
              <span className="text-[11px] font-mono text-purple-300 px-2 py-0.5 rounded bg-purple-500/10 border border-purple-500/30">
                {selectedFeatures.length} Modules
              </span>
            </div>

            {/* Cost Breakdown */}
            <div className="space-y-3 py-4 text-xs font-mono border-b border-purple-500/20">
              <div className="flex justify-between items-center text-slate-300">
                <span>Base Architecture Core:</span>
                <span className="font-bold text-white">₹{BASE_CORE_SETUP_PRICE}</span>
              </div>
              <div className="flex justify-between items-center text-slate-300">
                <span>Selected Feature Modules:</span>
                <span className="font-bold text-lime-400">+₹{featuresTotal}</span>
              </div>
              <div className="text-[10px] text-purple-300/70 font-sans">
                Includes Discord.js v14 core, slash commands engine, event dispatcher, crash recovery, and database connection.
              </div>
            </div>

            {/* Total & 50% Milestone Display */}
            <div className="py-4 space-y-3">
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-mono text-slate-300 uppercase">
                  Total Project Cost:
                </span>
                <span className="text-2xl sm:text-3xl font-black text-white font-sans">
                  ₹{totalPrice.toLocaleString("en-IN")}
                </span>
              </div>

              {/* 50% Milestone Box */}
              <div className="p-3.5 rounded-xl bg-lime-400/10 border border-lime-400/30 space-y-2">
                <div className="flex items-center justify-between text-xs font-mono font-bold text-lime-400">
                  <span className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>50% Advance Deposit:</span>
                  </span>
                  <span className="text-sm">₹{advanceDeposit.toLocaleString("en-IN")}</span>
                </div>
                <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>50% Balance on Delivery:</span>
                  <span>₹{balanceDue.toLocaleString("en-IN")}</span>
                </div>
              </div>
            </div>

            {/* Selected Modules Preview Tags */}
            <div className="py-2">
              <div className="text-[10px] font-mono uppercase text-purple-300 mb-2">
                Included in Your Bot:
              </div>
              <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1 scrollbar-thin">
                {selectedFeatures.map((f) => (
                  <div
                    key={f.id}
                    className="flex items-center justify-between text-[11px] p-1.5 rounded-lg bg-[#070512] text-slate-300 font-sans border border-purple-500/15"
                  >
                    <span className="truncate pr-2">{f.name}</span>
                    <button
                      type="button"
                      onClick={() => toggleFeature(f.id)}
                      className="text-slate-500 hover:text-rose-400 shrink-0 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Proceed to Checkout / Order Button */}
            <div className="pt-4 space-y-2.5">
              <button
                type="button"
                onClick={() => {
                  playCyberClick();
                  setIsModalOpen(true);
                }}
                className="w-full py-3.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-black font-bold text-xs uppercase tracking-wider font-mono shadow-[0_0_25px_rgba(163,230,53,0.3)] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Proceed to Order (₹{advanceDeposit})</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href="https://dsc.gg/notixnode"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-2.5 rounded-xl bg-[#5865F2]/15 hover:bg-[#5865F2]/25 text-[#8ea1e1] hover:text-white border border-[#5865F2]/30 text-xs font-mono flex items-center justify-center gap-2 transition-colors"
              >
                <DiscordIcon className="w-3.5 h-3.5 text-[#5865F2]" />
                <span>Discuss on Discord First</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Order Specification Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative w-full max-w-2xl bg-[#090718] border border-purple-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl my-8 text-left">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 text-slate-400 hover:text-white w-8 h-8 rounded-full bg-[#110d29] flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            {!submittedOrder ? (
              <form onSubmit={handleSubmitOrder} className="space-y-4">
                <div className="space-y-1 pb-3 border-b border-purple-500/20">
                  <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-md bg-lime-400/10 text-lime-400 text-[10px] font-mono font-bold uppercase">
                    Step 2: Bot Specification Intake
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-white font-sans">
                    Finalize Custom Bot Order
                  </h3>
                  <p className="text-xs text-slate-400 font-sans">
                    Please provide your contact details and describe your bot concept. Our founder will review and ping you on Discord within hours.
                  </p>
                </div>

                {formError && (
                  <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
                    {formError}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Your Name / Nickname <span className="text-lime-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={clientName}
                      onChange={(e) => setClientName(e.target.value)}
                      placeholder="e.g. Alex"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#0e0c1f] border border-purple-500/30 focus:border-lime-400 focus:outline-none text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Discord Username / Tag <span className="text-lime-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={discordTag}
                      onChange={(e) => setDiscordTag(e.target.value)}
                      placeholder="e.g. alex#0001 or alex_dev"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#0e0c1f] border border-purple-500/30 focus:border-lime-400 focus:outline-none text-xs text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Email Address <span className="text-lime-400">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="alex@gmail.com"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#0e0c1f] border border-purple-500/30 focus:border-lime-400 focus:outline-none text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Proposed Bot Name <span className="text-lime-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={botName}
                      onChange={(e) => setBotName(e.target.value)}
                      placeholder="e.g. Nexus Guardian"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#0e0c1f] border border-purple-500/30 focus:border-lime-400 focus:outline-none text-xs text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Describe Your Bot Concept &amp; Special Workflows <span className="text-lime-400">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={botConcept}
                    onChange={(e) => setBotConcept(e.target.value)}
                    placeholder="Tell us what you want the bot to do, any specific commands, roles, or rules you need..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#0e0c1f] border border-purple-500/30 focus:border-lime-400 focus:outline-none text-xs text-white resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      Target Timeline
                    </label>
                    <select
                      value={timeline}
                      onChange={(e) => setTimeline(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#0e0c1f] border border-purple-500/30 focus:border-lime-400 focus:outline-none text-xs text-white"
                    >
                      <option value="2-3 Days (Fast Track)">2-3 Days (Fast Track)</option>
                      <option value="3-5 Days (Standard)">3-5 Days (Standard)</option>
                      <option value="1-2 Weeks (Complex Build)">1-2 Weeks (Complex Build)</option>
                      <option value="Flexible">Flexible / Discuss on Discord</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-300 block mb-1">
                      50% Advance Milestone
                    </label>
                    <div className="w-full px-3.5 py-2.5 rounded-xl bg-[#130f28] border border-purple-500/30 text-xs font-mono font-bold text-lime-400 flex items-center justify-between">
                      <span>Deposit Due:</span>
                      <span>₹{advanceDeposit.toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-3">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3.5 rounded-xl bg-lime-400 hover:bg-lime-300 text-black font-bold text-xs uppercase tracking-wider font-mono shadow-[0_0_20px_rgba(163,230,53,0.3)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? (
                      <span>Dispatching Order to Engineering Team...</span>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Submit Order &amp; Request Deposit (₹{advanceDeposit})</span>
                      </>
                    )}
                  </button>
                  <p className="text-[10px] text-center text-slate-400 mt-2 font-mono">
                    Order details will be sent directly to the NOTIXNODE Discord engineering desk.
                  </p>
                </div>
              </form>
            ) : (
              /* Success View */
              <div className="py-6 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-lime-400/20 border border-lime-400/40 text-lime-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black text-white font-sans">
                  Order Successfully Dispatched!
                </h3>
                <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                  Thank you, <strong>{clientName}</strong>! Your custom bot specification has been assigned order tracking ID:
                </p>
                <div className="inline-block px-4 py-2 rounded-xl bg-[#110d29] border border-purple-500/40 text-lime-400 font-mono text-sm font-bold tracking-wider">
                  {submittedOrder.orderId}
                </div>
                <p className="text-xs text-slate-400 max-w-md mx-auto">
                  Our founder will reach out to you directly on Discord (<strong>{discordTag}</strong>) to confirm the 50% milestone advance (₹{advanceDeposit}) and begin development.
                </p>

                <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <a
                    href="https://dsc.gg/notixnode"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#5865F2] hover:bg-[#4752c4] text-white text-xs font-bold flex items-center justify-center gap-2"
                  >
                    <DiscordIcon className="w-4 h-4" />
                    <span>Join NOTIXNODE Discord</span>
                  </a>
                  <button
                    onClick={() => {
                      setIsModalOpen(false);
                      setSubmittedOrder(null);
                    }}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#110d29] hover:bg-[#18133b] text-slate-200 text-xs font-mono"
                  >
                    Close Window
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

