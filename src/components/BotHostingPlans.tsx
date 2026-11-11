"use client";

import React from "react";
import { Cpu, HardDrive, ShieldCheck, Zap, Server, RotateCcw, Check, ArrowRight, Gift } from "lucide-react";
import DiscordIcon from "./DiscordIcon";
import ClockDialBackground from "./ClockDialBackground";
import { playCyberClick, playCyberHover } from "./ui/SoundEffects";

export interface PlanItem {
  id: string;
  name: string;
  price: string;
  originalPrice?: string;
  period: string;
  popular?: boolean;
  tagline: string;
  specs: {
    ram: string;
    cpu: string;
    storage: string;
    backups: string;
  };
  features: string[];
}

const PLANS: PlanItem[] = [
  {
    id: "basic",
    name: "Basic Plan",
    price: "₹69",
    originalPrice: "₹99",
    period: "/month",
    tagline: "Entry-level hosting for lightweight scripts & hobby bots.",
    specs: {
      ram: "1GB DDR4/DDR5",
      cpu: "50% vCPU",
      storage: "3GB High-Speed NVMe",
      backups: "1 Automated Snapshot",
    },
    features: [
      "1GB Dedicated RAM",
      "50% CPU allocation",
      "3GB NVMe SSD storage",
      "1 Automated cloud backup",
      "Anti-DDoS filtering",
      "Instant setup in Discord",
    ],
  },
  {
    id: "standard",
    name: "Standard Plan",
    price: "₹149",
    originalPrice: "₹219",
    period: "/month",
    tagline: "Solid, continuous uptime for growing community bots.",
    specs: {
      ram: "2GB DDR4/DDR5",
      cpu: "100% vCPU",
      storage: "5GB High-Speed NVMe",
      backups: "2 Automated Snapshots",
    },
    features: [
      "2GB Dedicated RAM",
      "100% Full vCPU core",
      "5GB NVMe SSD storage",
      "2 Automated cloud backups",
      "Multi-guild support",
      "Sub-15ms network latency",
    ],
  },
  {
    id: "premium",
    name: "Premium Plan",
    price: "₹249",
    originalPrice: "₹369",
    period: "/month",
    popular: true,
    tagline: "High-performance compute for multi-server production bots.",
    specs: {
      ram: "4GB DDR4/DDR5",
      cpu: "150% vCPU",
      storage: "10GB High-Speed NVMe",
      backups: "2 Automated Snapshots",
    },
    features: [
      "4GB High-Speed RAM",
      "150% Turbo vCPU",
      "10GB NVMe SSD storage",
      "2 Automated cloud backups",
      "Optimized for SQLite / Mongo / PG",
      "Priority founder support",
    ],
  },
  {
    id: "ultimate",
    name: "Ultimate Plan",
    price: "₹399",
    originalPrice: "₹599",
    period: "/month",
    tagline: "Maximum tier performance for heavy shards & AI-powered bots.",
    specs: {
      ram: "6GB DDR4/DDR5",
      cpu: "200% vCPU",
      storage: "15GB High-Speed NVMe",
      backups: "3 Automated Snapshots",
    },
    features: [
      "6GB Ultra RAM",
      "200% Dual vCPU cores",
      "15GB Enterprise NVMe storage",
      "3 Automated cloud backups",
      "Unlimited subdomains / ports",
      "24/7 dedicated Discord VIP role",
    ],
  },
];

const INCLUDED_FEATURES = [
  {
    title: "Advanced DDoS Protection",
    desc: "Layer 4 & Layer 7 enterprise DDoS mitigation keeps your bot online through any high-volume malicious traffic.",
    emojiUrl: "https://cdn.discordapp.com/emojis/1524002050004877404.gif?size=64&quality=lossless",
    iconFallback: ShieldCheck,
  },
  {
    title: "99.99% Uptime Guarantee",
    desc: "High-availability edge architecture with proactive health monitors ensures continuous 24/7 daemon uptime.",
    emojiUrl: "https://cdn.discordapp.com/emojis/1532373711905226923.gif?size=64&quality=lossless",
    iconFallback: Zap,
  },
  {
    title: "Node.js & Python Support",
    desc: "Native out-of-the-box runtimes for discord.js, discord.py, disnake, and custom packages with one-click startup.",
    emojiUrl: "https://cdn.discordapp.com/emojis/1541090280218820768.webp?size=64&quality=lossless",
    iconFallback: Cpu,
  },
  {
    title: "Custom Runtimes On Request",
    desc: "You can request other software or coding languages to be added besides Node.js or Python (Golang, Java, Bun, Rust, etc.).",
    emojiUrl: "https://cdn.discordapp.com/emojis/1541090277857562675.webp?size=64&quality=lossless",
    iconFallback: Server,
  },
];

export default function BotHostingPlans({
  onSelectPlan,
}: {
  onSelectPlan?: (planName: string, price: string) => void;
}) {
  const handleSelect = (plan: PlanItem) => {
    playCyberClick();
    if (onSelectPlan) {
      onSelectPlan(plan.name, plan.price);
    } else {
      const contactSection = document.getElementById("contact");
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <section id="hosting" className="py-24 border-t border-purple-500/20 relative bg-[#04030a] overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[350px] bg-purple-600/10 blur-[130px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-10 w-[400px] h-[300px] bg-lime-500/5 blur-[120px] rounded-full pointer-events-none" />

      {/* Atmospheric 24/7 Clock Dial Background Loop */}
      <ClockDialBackground
        opacity="opacity-20 hover:opacity-30 transition-opacity duration-700"
        blendMode="mix-blend-screen"
        size="w-[700px] h-[700px] md:w-[950px] md:h-[950px]"
        align="center"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 relative z-10">
        
        {/* Section Header */}
        <div className="text-center space-y-3 max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-xs font-semibold text-purple-300 shadow-sm">
            <img
              src="https://cdn.discordapp.com/emojis/1516074375491878943.webp?size=48&quality=lossless"
              alt="Bots"
              className="w-4 h-4 object-contain inline-block"
              onError={(e) => {
                (e.currentTarget as HTMLElement).style.display = "none";
              }}
            />
            <span className="font-mono uppercase tracking-wider text-[11px] text-lime-400 font-bold">
              NOTIXNODE // INFRASTRUCTURE
            </span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight flex items-center justify-center gap-3">
            <img
              src="https://cdn.discordapp.com/emojis/1516074375491878943.webp?size=64&quality=lossless"
              alt="Bots"
              className="w-8 h-8 sm:w-10 sm:h-10 object-contain inline-block"
              onError={(e) => {
                (e.currentTarget as HTMLElement).style.display = "none";
              }}
            />
            <span>BOT HOSTING PLANS</span>
          </h2>

          <p className="text-sm text-slate-300 leading-relaxed font-sans max-w-xl mx-auto">
            Ultra-fast NVMe storage, unmetered bandwidth, and instant setup. Choose a plan tailored to your Discord bot's RAM and CPU needs.
          </p>
        </div>

        {/* Free Starter Kit Promo Box (Discord Community Funnel) */}
        <div className="mb-8 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-purple-900/40 via-purple-950/60 to-lime-950/30 border border-purple-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left shadow-lg">
          <div className="flex flex-col sm:flex-row items-center gap-3.5">
            <div className="p-3 rounded-xl bg-lime-400/20 text-lime-400 border border-lime-400/30 shadow-[0_0_15px_rgba(163,230,53,0.2)]">
              <Gift className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2 justify-center sm:justify-start">
                <span>Free 2026 Discord Bot Starter Kit & Source Code</span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-lime-400 text-black">FREE</span>
              </h4>
              <p className="text-xs text-slate-300 font-sans mt-0.5">
                Download pre-configured Ticket, Moderation & Economy templates before starting your hosting cluster.
              </p>
            </div>
          </div>
          <a
            href="https://dsc.gg/notixnode"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => playCyberClick()}
            className="whitespace-nowrap px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider text-black bg-lime-400 hover:bg-lime-300 transition-all shadow-md shadow-lime-500/20 flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <span>Download Kit &rarr;</span>
          </a>
        </div>

        {/* 4-Column Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              onMouseEnter={() => playCyberHover()}
              className={`relative rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 group ${
                plan.popular
                  ? "bg-gradient-to-b from-[#140e2e] via-[#0b081a] to-[#070512] border-2 border-purple-400/60 shadow-[0_0_40px_rgba(168,85,247,0.25)] scale-[1.02] lg:-translate-y-2"
                  : "bg-gradient-to-b from-[#0c091d] via-[#080614] to-[#05040d] border border-purple-500/20 hover:border-lime-400/50 hover:shadow-[0_0_30px_rgba(163,230,53,0.15)] shadow-xl"
              }`}
            >
              {/* Most Popular Badge */}
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full bg-gradient-to-r from-purple-500 via-fuchsia-500 to-lime-400 text-black text-[10px] font-black tracking-wider uppercase font-mono shadow-md flex items-center gap-1.5 whitespace-nowrap">
                  <span className="w-1.5 h-1.5 rounded-full bg-black animate-ping" />
                  <span>MOST POPULAR</span>
                </div>
              )}

              {/* Plan Header */}
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <img
                    src="https://cdn.discordapp.com/emojis/1529512144050065480.gif?size=32&quality=lossless"
                    alt="Arrow"
                    className="w-4 h-4 object-contain"
                    onError={(e) => {
                      (e.currentTarget as HTMLElement).style.display = "none";
                    }}
                  />
                  <h3 className="text-xl font-black text-white font-sans tracking-tight">
                    {plan.name}
                  </h3>
                </div>

                <p className="text-xs text-slate-400 min-h-[34px] leading-relaxed">
                  {plan.tagline}
                </p>

                {/* Price Display */}
                <div className="mt-5 pb-5 border-b border-purple-500/20 flex items-baseline gap-2">
                  <span className="text-4xl sm:text-5xl font-black text-white tracking-tight font-sans">
                    {plan.price}
                  </span>
                  <span className="text-xs font-mono text-purple-300 font-semibold">
                    {plan.period}
                  </span>
                  {plan.originalPrice && (
                    <span className="text-xs font-mono text-slate-500 line-through ml-auto">
                      {plan.originalPrice}
                    </span>
                  )}
                </div>

                {/* Core Hardware Specs Highlight */}
                <div className="grid grid-cols-2 gap-2 my-5">
                  <div className="p-2.5 rounded-xl bg-[#070512] border border-purple-500/20">
                    <div className="text-[10px] font-mono text-purple-300/80 uppercase">RAM</div>
                    <div className="text-xs font-bold text-lime-400 font-mono mt-0.5">{plan.specs.ram}</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#070512] border border-purple-500/20">
                    <div className="text-[10px] font-mono text-purple-300/80 uppercase">CPU</div>
                    <div className="text-xs font-bold text-white font-mono mt-0.5">{plan.specs.cpu}</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#070512] border border-purple-500/20">
                    <div className="text-[10px] font-mono text-purple-300/80 uppercase">NVMe Disk</div>
                    <div className="text-xs font-bold text-slate-200 font-mono mt-0.5">{plan.specs.storage}</div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[#070512] border border-purple-500/20">
                    <div className="text-[10px] font-mono text-purple-300/80 uppercase">Backups</div>
                    <div className="text-xs font-bold text-purple-300 font-mono mt-0.5">{plan.specs.backups}</div>
                  </div>
                </div>

                {/* Feature Bullet List */}
                <ul className="space-y-2.5 mb-6 text-xs text-slate-300">
                  {plan.features.map((feat, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="w-3.5 h-3.5 text-lime-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 space-y-2">
                <button
                  type="button"
                  onClick={() => handleSelect(plan)}
                  className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md ${
                    plan.popular
                      ? "bg-gradient-to-r from-purple-500 to-fuchsia-600 hover:from-purple-400 hover:to-fuchsia-500 text-white shadow-purple-500/25"
                      : "bg-[#0e0c1f] hover:bg-[#16132f] text-slate-200 hover:text-white border border-purple-500/30 hover:border-lime-400"
                  }`}
                >
                  <span>Deploy {plan.name}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <a
                  href="https://dsc.gg/notixnode"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => playCyberClick()}
                  className="w-full py-2 rounded-xl text-[11px] font-mono text-purple-300 hover:text-white bg-[#5865F2]/10 hover:bg-[#5865F2]/20 border border-[#5865F2]/30 flex items-center justify-center gap-1.5 transition-colors"
                >
                  <DiscordIcon className="w-3.5 h-3.5 text-[#5865F2]" />
                  <span>Order in Discord</span>
                </a>
              </div>
            </div>
          ))}
        </div>

        {/* Included Features Banner */}
        <div className="mt-20 p-8 sm:p-10 rounded-3xl bg-gradient-to-b from-[#0b081a] via-[#080614] to-[#04030a] border border-purple-500/25 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-purple-500/5 blur-[90px] rounded-full pointer-events-none" />

          {/* Features Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-8 border-b border-purple-500/20 mb-8">
            <div className="flex items-center gap-3">
              <img
                src="https://cdn.discordapp.com/emojis/1532373363257774190.gif?size=64&quality=lossless"
                alt="Verified"
                className="w-7 h-7 sm:w-8 sm:h-8 object-contain"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = "none";
                }}
              />
              <div>
                <h3 className="text-xl sm:text-2xl font-black text-white font-sans tracking-tight">
                  Included Features With Every Plan
                </h3>
                <p className="text-xs text-purple-300/80 font-mono mt-0.5">
                  Enterprise-grade infrastructure standard across all tiers.
                </p>
              </div>
            </div>

            <a
              href="https://dsc.gg/notixnode"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#5865F2] hover:bg-[#4752c4] text-white text-xs font-bold transition-all shadow-md shrink-0"
            >
              <DiscordIcon className="w-4 h-4" />
              <span>Join dsc.gg/notixnode</span>
            </a>
          </div>

          {/* 4 Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {INCLUDED_FEATURES.map((item, idx) => {
              const FallbackIcon = item.iconFallback;
              return (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-[#060410] border border-purple-500/20 hover:border-lime-400/40 transition-colors flex flex-col justify-between"
                >
                  <div className="space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center">
                      <img
                        src={item.emojiUrl}
                        alt={item.title}
                        className="w-6 h-6 object-contain"
                        onError={(e) => {
                          (e.currentTarget as HTMLElement).style.display = "none";
                        }}
                      />
                    </div>
                    <h4 className="text-sm font-bold text-white font-sans">
                      {item.title}
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed font-sans">
                      {item.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Custom Software Callout Banner */}
          <div className="mt-8 p-4 rounded-xl bg-purple-500/10 border border-purple-500/25 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-purple-200">
            <div className="flex items-center gap-2.5">
              <img
                src="https://cdn.discordapp.com/emojis/1541090277857562675.webp?size=48&quality=lossless"
                alt="Customer"
                className="w-5 h-5 object-contain"
                onError={(e) => {
                  (e.currentTarget as HTMLElement).style.display = "none";
                }}
              />
              <span className="font-mono">
                <strong>Need custom software?</strong> You can request other software, databases, or coding languages to be added besides Node.js or Python anytime!
              </span>
            </div>
            <a
              href="https://dsc.gg/notixnode"
              target="_blank"
              rel="noopener noreferrer"
              className="text-lime-400 hover:text-lime-300 font-mono text-xs font-bold underline shrink-0"
            >
              Request in Discord &rarr;
            </a>
          </div>
        </div>

      </div>
    </section>
  );
}

