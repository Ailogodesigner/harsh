"use client";

import { useState, useEffect } from "react";
import NextLink from "next/link";
import { MessageSquare, Eye, Calendar, User, ArrowRight, Sparkles, X, Check, Gamepad2 } from "lucide-react";

interface Announcement {
  id: string;
  title: string;
  content: string;
  tag: string;
  createdAt: string;
}

export default function FeaturedAnnouncement() {
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [showFullModal, setShowFullModal] = useState(false);
  const [copiedIp, setCopiedIp] = useState(false);

  useEffect(() => {
    fetch("/api/announcements")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.announcements && data.announcements.length > 0) {
          setAnnouncement(data.announcements[0]);
        }
      })
      .catch(() => {});
  }, []);

  // Handle ESC key to close modal
  useEffect(() => {
    if (!showFullModal) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setShowFullModal(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showFullModal]);

  const displayTitle =
    announcement?.title ||
    "Survival SMP Live Now • Cashfree Automated Store & In-Game Ranks";
  const displayContent =
    announcement?.content ||
    "Survival SMP is now officially live on Harsh Unlimited! Enjoy player economy, GriefPrevention land claims, auction houses, and instant automated in-game rank deliveries. Lifesteal SMP & BoxPvP coming soon!";
  const displayTag = announcement?.tag || "ACTIVE NOW";

  const handleCopy = () => {
    navigator.clipboard.writeText("play.harshunlimited.fun");
    setCopiedIp(true);
    setTimeout(() => setCopiedIp(false), 2000);
  };

  return (
    <div className="w-full max-w-6xl mx-auto px-4">
      <div className="glass-panel rounded-3xl border border-slate-800 hover:border-emerald-500/40 transition-all p-6 sm:p-8 relative overflow-hidden bg-gradient-to-r from-slate-950/95 via-slate-900/90 to-slate-950/95 shadow-2xl">
        {/* Ambient background glow */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-center gap-8 relative z-10">
          {/* Left/Avatar Side: 3D Minecraft Character Body Render */}
          <div className="shrink-0 relative group">
            <div className="w-36 h-48 sm:w-44 sm:h-56 relative flex items-center justify-center">
              <div className="absolute bottom-2 w-28 h-6 bg-black/40 rounded-full blur-md" />
              <img
                src="https://mc-heads.net/body/Harsh/left"
                alt="Owner Character Skin"
                className="h-full object-contain filter drop-shadow-[0_10px_20px_rgba(16,185,129,0.25)] group-hover:scale-105 transition-transform duration-300 pixelated"
                loading="eager"
              />
            </div>
          </div>

          {/* Right/Content Side: Announcement Details */}
          <div className="flex-1 space-y-4 text-center lg:text-left">
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2.5">
              <span className="px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Official Network Announcement
              </span>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300">
                {displayTag}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-snug">
              {displayTitle}
            </h2>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed max-w-2xl line-clamp-3">
              {displayContent}
            </p>

            {/* Metadata Bar */}
            <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 pt-2 text-xs text-slate-400 border-t border-slate-800/80">
              <div className="flex items-center gap-1.5 font-medium">
                <User className="w-4 h-4 text-emerald-400" />
                <span className="text-white font-semibold">Harsh</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold uppercase ml-1">
                  Owner
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-slate-400" />
                <span>Live Network</span>
              </div>

              <div className="flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-slate-400" />
                <span>4,120 views</span>
              </div>

              <div className="flex items-center gap-1.5">
                <MessageSquare className="w-4 h-4 text-slate-400" />
                <span>102 comments</span>
              </div>
            </div>

            {/* Read Button */}
            <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-3">
              <button
                type="button"
                onClick={() => setShowFullModal(true)}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all cursor-pointer"
              >
                <span>Read Full Announcement</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <NextLink
                href="/news"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all"
              >
                <span>All Updates & Changelogs</span>
              </NextLink>
            </div>
          </div>
        </div>
      </div>

      {/* Full Announcement Modal */}
      {showFullModal && (
        <div
          onClick={() => setShowFullModal(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl glass-panel bg-slate-900 border border-slate-700/80 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-start justify-between gap-4 pb-4 border-b border-slate-800">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2.5 py-0.5 rounded-md">
                    {displayTag}
                  </span>
                  <span className="text-xs text-slate-500 font-mono">Harsh Unlimited SMP</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white pt-1">
                  {displayTitle}
                </h3>
              </div>

              <button
                onClick={() => setShowFullModal(false)}
                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-4 text-xs text-slate-400 border-b border-slate-800/60 pb-3">
              <div className="flex items-center gap-1.5 font-medium">
                <User className="w-4 h-4 text-emerald-400" />
                <span className="text-white font-semibold">Harsh</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold uppercase ml-1">
                  Founder
                </span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-500" />
                <span>Published October 2026</span>
              </div>
            </div>

            <div className="text-sm text-slate-300 leading-relaxed space-y-4">
              <p className="text-base text-white font-medium">
                {displayContent}
              </p>
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400">
                  Included In This Release:
                </h4>
                <ul className="space-y-1.5 text-xs text-slate-300">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400">✓</span>
                    <span>High-performance 1.20.1+ Survival SMP with dedicated Indian server nodes (Sub-20ms latency).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400">✓</span>
                    <span>GriefPrevention golden shovel land claims with sub-claims and siege toggles.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400">✓</span>
                    <span>Automated web store delivery with instant in-game rank sync via Cashfree.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-400">✓</span>
                    <span>Player-driven economy: 6 unique jobs (/jobs), Auction House (/ah), and chest shops.</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-800">
              <button
                type="button"
                onClick={handleCopy}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-700 text-xs font-mono text-emerald-400 font-bold flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                {copiedIp ? <Check className="w-4 h-4 text-emerald-400" /> : <Gamepad2 className="w-4 h-4 text-emerald-400" />}
                <span>{copiedIp ? "IP Copied to Clipboard!" : "play.harshunlimited.fun"}</span>
              </button>

              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <NextLink
                  href="/news"
                  className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-all text-center"
                >
                  View All News
                </NextLink>
                <button
                  type="button"
                  onClick={() => setShowFullModal(false)}
                  className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold transition-all cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
