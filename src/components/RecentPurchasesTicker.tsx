"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ShoppingBag, Sparkles } from "lucide-react";

interface RecentPurchase {
  id: string;
  username: string;
  productName: string;
  price: string;
  timeAgo: string;
}

const DEFAULT_PURCHASES: RecentPurchase[] = [
  { id: "1", username: "HarshWarrior", productName: "TITAN Rank (Permanent)", price: "₹999", timeAgo: "4m ago" },
  { id: "2", username: "ShadowSniper", productName: "MVP Rank (Permanent)", price: "₹499", timeAgo: "12m ago" },
  { id: "3", username: "CraftMaster_99", productName: "5x Mythic Crates", price: "₹249", timeAgo: "23m ago" },
  { id: "4", username: "LifestealKing", productName: "VIP Rank (Permanent)", price: "₹199", timeAgo: "38m ago" },
  { id: "5", username: "DragonSlayer_IN", productName: "10x Revive Beacons", price: "₹149", timeAgo: "55m ago" },
  { id: "6", username: "PhantomGamer", productName: "TITAN Rank (Permanent)", price: "₹999", timeAgo: "1h ago" },
];

export default function RecentPurchasesTicker() {
  const [purchases, setPurchases] = useState<RecentPurchase[]>(DEFAULT_PURCHASES);

  return (
    <div className="w-full bg-slate-950/80 border-y border-slate-800/80 py-3 overflow-hidden backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 flex items-center gap-4">
        {/* Label */}
        <div className="shrink-0 flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider">
          <ShoppingBag className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Recent</span> Store Activity
        </div>

        {/* Scrolling / Flex Ticker */}
        <div className="flex items-center gap-6 overflow-x-auto no-scrollbar py-0.5">
          {purchases.map((item) => (
            <div
              key={item.id}
              className="shrink-0 flex items-center gap-2.5 px-3 py-1 rounded-xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/40 transition-colors text-xs"
            >
              <div className="relative w-6 h-6 rounded bg-slate-800 overflow-hidden shrink-0">
                <img
                  src={`https://mc-heads.net/avatar/${item.username}/32`}
                  alt={item.username}
                  className="w-full h-full object-cover pixelated"
                  loading="lazy"
                />
              </div>
              <div className="flex items-center gap-1.5 font-medium">
                <span className="font-bold text-white font-mono">{item.username}</span>
                <span className="text-slate-400">purchased</span>
                <span className="text-emerald-400 font-semibold">{item.productName}</span>
                <span className="text-[10px] text-slate-400 ml-1">({item.timeAgo})</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
