"use client";

import NextLink from "next/link";
import CopyButton from "./CopyButton";
import { Shield, Sparkles, MessageSquare, Heart } from "lucide-react";
import { SocialButtonsRow, SOCIAL_LINKS } from "./SocialLinks";

export default function Footer() {
  const currentYear = 2026;

  return (
    <footer className="bg-slate-950 border-t border-slate-800/80 text-slate-400 text-sm">
      {/* Top Banner with Server IP */}
      <div className="border-b border-slate-900 bg-slate-900/40 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <p className="font-bold text-white text-base">Ready to start your adventure?</p>
              <p className="text-xs text-slate-400">
                Join thousands of players online on Harsh Unlimited today.
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 bg-slate-950 px-3.5 py-2 rounded-xl border border-slate-800">
              <span className="text-xs font-mono font-medium text-slate-300">play.harshunlimited.fun</span>
              <CopyButton textToCopy="play.harshunlimited.fun" label="Copy Java" />
            </div>
            <a
              href={SOCIAL_LINKS.discord}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-[#5865F2] hover:bg-[#4752c4] text-white transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Join Discord
            </a>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Brand Info & Socials */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl overflow-hidden border border-emerald-500/30 shadow-md shadow-emerald-500/20">
                <img
                  src="/logo.png"
                  alt="Harsh Unlimited"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="font-extrabold text-base tracking-wider text-white uppercase">
                Harsh <span className="text-emerald-400">Unlimited</span>
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              India&apos;s premier high-performance Minecraft gaming network. Delivering custom Lifesteal SMP, enhanced Survival, BoxPvP, and lag-free multiplayer adventures.
            </p>
            <div className="pt-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">
                Official Channels
              </span>
              <SocialButtonsRow />
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400 pt-1">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span>DDoS Protected &bull; 99.9% Uptime</span>
            </div>
          </div>

          {/* Col 2: Navigation */}
          <div>
            <h3 className="font-bold text-white text-xs uppercase tracking-wider mb-3">Navigation</h3>
            <ul className="space-y-2 text-xs">
              <li>
                <NextLink href="/" className="hover:text-emerald-400 transition-colors">
                  Home
                </NextLink>
              </li>
              <li>
                <NextLink href="/play" className="hover:text-emerald-400 transition-colors">
                  How to Play (Java &amp; Bedrock)
                </NextLink>
              </li>
              <li>
                <NextLink href="/store" className="hover:text-emerald-400 transition-colors">
                  Rank &amp; In-Game Store
                </NextLink>
              </li>
              <li>
                <NextLink href="/map" className="hover:text-emerald-400 transition-colors">
                  Live Web Map (Dynmap)
                </NextLink>
              </li>
              <li>
                <NextLink href="/leaderboards" className="hover:text-emerald-400 transition-colors">
                  Leaderboards &amp; Stats
                </NextLink>
              </li>
              <li>
                <NextLink href="/wiki" className="hover:text-emerald-400 transition-colors">
                  Server Wiki &amp; Guides
                </NextLink>
              </li>
            </ul>
          </div>

          {/* Col 3: Community & Help */}
          <div>
            <h3 className="font-bold text-white text-xs uppercase tracking-wider mb-3">Community</h3>
            <ul className="space-y-2 text-xs">
              <li>
                <NextLink href="/news" className="hover:text-emerald-400 transition-colors">
                  News &amp; Updates
                </NextLink>
              </li>
              <li>
                <NextLink href="/apply" className="hover:text-emerald-400 transition-colors font-semibold text-emerald-400">
                  Staff Recruitment (Apply)
                </NextLink>
              </li>
              <li>
                <NextLink href="/rules" className="hover:text-emerald-400 transition-colors">
                  Server Rules
                </NextLink>
              </li>
              <li>
                <NextLink href="/staff" className="hover:text-emerald-400 transition-colors">
                  Staff Team
                </NextLink>
              </li>
              <li>
                <NextLink href="/faq" className="hover:text-emerald-400 transition-colors">
                  Frequently Asked Questions
                </NextLink>
              </li>
              <li>
                <NextLink href="/support" className="hover:text-emerald-400 transition-colors">
                  Support &amp; Contact
                </NextLink>
              </li>
            </ul>
          </div>

          {/* Col 4: Legal & Policies */}
          <div>
            <h3 className="font-bold text-white text-xs uppercase tracking-wider mb-3">Legal &amp; Policy</h3>
            <ul className="space-y-2 text-xs">
              <li>
                <NextLink href="/terms" className="hover:text-emerald-400 transition-colors">
                  Terms of Service
                </NextLink>
              </li>
              <li>
                <NextLink href="/privacy" className="hover:text-emerald-400 transition-colors">
                  Privacy Policy
                </NextLink>
              </li>
              <li>
                <NextLink href="/refunds" className="hover:text-emerald-400 transition-colors">
                  Refund &amp; Cancellation Policy
                </NextLink>
              </li>
              <li>
                <NextLink href="/verification-policy" className="hover:text-emerald-400 transition-colors">
                  Account Verification Policy
                </NextLink>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Disclaimer */}
        <div className="border-t border-slate-900 mt-10 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>
            &copy; {currentYear} Harsh Unlimited. All rights reserved. Built with pride for the community.
          </p>
          <p className="text-[11px] max-w-xl text-center md:text-right">
            Not an official Minecraft product. We are not approved by or associated with Mojang Studios or Microsoft.
          </p>
        </div>
      </div>
    </footer>
  );
}
