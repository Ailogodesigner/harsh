"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { formatCurrency } from "@/lib/utils";
import { getMinecraftAvatarUrl } from "@/lib/minecraft/verification";
import {
  ShoppingBag,
  Zap,
  Crown,
  Flame,
  Shield,
  Search,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Lock,
  ArrowRight,
  ExternalLink,
  Coins,
  Package,
  Swords,
} from "lucide-react";
import MinecraftChestModal from "@/components/MinecraftChestModal";

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: "RANK" | "KIT" | "CRATE" | "COINS" | "ITEM";
  price: number; // minor units
  currency: string;
  duration: string;
  perks: string;
  featured: boolean;
  badgeColor: string;
}

export default function StorePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Checkout modal state
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [minecraftUsername, setMinecraftUsername] = useState<string>("");
  const [customerEmail, setCustomerEmail] = useState<string>("");
  const [checkingOut, setCheckingOut] = useState<boolean>(false);
  const [checkoutError, setCheckoutError] = useState<string | null>(null);
  const [setupRequiredNote, setSetupRequiredNote] = useState<string | null>(null);
  const [chestKitSlug, setChestKitSlug] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/products")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.products) {
          setProducts(data.products);
        }
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const categories = [
    { id: "ALL", label: "All Items", icon: ShoppingBag },
    { id: "RANK", label: "Ranks", icon: Crown },
    { id: "KIT", label: "Server Kits", icon: Swords },
    { id: "CRATE", label: "Crates & Keys", icon: Package },
    { id: "COINS", label: "Coins", icon: Coins },
  ];

  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === "ALL" || p.category === selectedCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutError(null);
    setSetupRequiredNote(null);

    if (!selectedProduct) return;
    if (!minecraftUsername.trim() || minecraftUsername.length < 3) {
      setCheckoutError("Please enter a valid Minecraft username.");
      return;
    }

    setCheckingOut(true);

    try {
      const res = await fetch("/api/checkout/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: selectedProduct.id,
          targetUsername: minecraftUsername.trim(),
          guestEmail: customerEmail.trim() || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.setupRequired) {
          setSetupRequiredNote(data.details || data.error);
        } else {
          setCheckoutError(data.error || "Failed to create order");
        }
        setCheckingOut(false);
        return;
      }

      if (data.paymentLink) {
        window.location.href = data.paymentLink;
      } else if (data.orderId) {
        window.location.href = `/orders/${data.orderId}`;
      }
    } catch (err: any) {
      setCheckoutError(err?.message || "An unexpected network error occurred");
    } finally {
      setCheckingOut(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Store Banner */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
          Official Digital Store
        </span>
        <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
          HARSH UNLIMITED <span className="text-emerald-400">STORE</span>
        </h1>
        <p className="text-sm text-slate-300 leading-relaxed">
          Enhance your server experience with verified server ranks, crate keys, and coins. Instant delivery powered by Cashfree Payments.
        </p>
      </div>

      {/* Security & Verification Guarantee Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel rounded-xl p-4 border border-slate-800 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-white">Cashfree Payments</h4>
            <p className="text-[11px] text-slate-400">UPI, NetBanking, Cards, &amp; Wallets</p>
          </div>
        </div>

        <div className="glass-panel rounded-xl p-4 border border-slate-800 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-white">Automated Delivery</h4>
            <p className="text-[11px] text-slate-400">Ranks & Coins applied in-game within seconds</p>
          </div>
        </div>

        <div className="glass-panel rounded-xl p-4 border border-slate-800 flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-bold text-xs text-white">Direct Server Operations</h4>
            <p className="text-[11px] text-slate-400">Restricted backend execution via Pterodactyl</p>
          </div>
        </div>
      </div>

      {/* Coin Shop Quick Banner */}
      <div className="glass-panel rounded-2xl p-5 border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-slate-900 to-amber-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg shadow-amber-500/5">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 shadow-md shadow-amber-500/20">
            <Coins className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-0.5">
              <h4 className="text-xs font-bold text-white">Server Coin Shop &bull; Rate: 1 Coin = ₹1</h4>
              <span className="text-[9px] font-black px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 tracking-wider uppercase">
                /COINSHOP
              </span>
            </div>
            <p className="text-[11px] text-slate-300">
              Official server exchange rate: <strong className="text-amber-300 font-semibold">1 Coin = 1 Rs (₹1)</strong>. Instant automated in-game delivery via PlayerPoints. Spend on custom prefixes, chat colors, crate keys, tags &amp; emotes!
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setSelectedCategory("COINS")}
          className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shrink-0 shadow-md shadow-amber-500/20 flex items-center gap-1.5"
        >
          <Coins className="w-3.5 h-3.5" />
          <span>Browse Coins ({products.filter((p) => p.category === "COINS").length})</span>
        </button>
      </div>

      {/* Search & Category Filter Controls */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Category Buttons */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isSelected
                    ? cat.id === "COINS"
                      ? "bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20"
                      : "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                    : "bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search Bar */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search items or perks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>
      </div>

      {/* Product Catalog Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-pulse">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-96 rounded-2xl bg-slate-900/60 border border-slate-800" />
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center space-y-3">
          <ShoppingBag className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="font-bold text-white text-base">No products found</h3>
          <p className="text-xs text-slate-400">
            Try adjusting your search query or select another category.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => {
            let perksList: string[] = [];
            try {
              perksList = JSON.parse(product.perks);
            } catch {
              perksList = [];
            }

            const isCoinProduct = product.category === "COINS";

            return (
              <div
                key={product.id}
                className={`glass-panel rounded-2xl p-7 flex flex-col justify-between border transition-all duration-200 relative ${
                  isCoinProduct
                    ? product.featured
                      ? "border-amber-500/50 shadow-lg shadow-amber-500/10"
                      : "border-amber-500/20 hover:border-amber-500/40"
                    : product.featured
                    ? "emerald-border-glow"
                    : "border-slate-800 hover:border-emerald-500/50"
                }`}
              >
                {product.featured && (
                  <div className={`absolute -top-3 right-6 px-3 py-0.5 rounded-full text-slate-950 text-[10px] font-extrabold uppercase tracking-wider shadow-md ${
                    isCoinProduct
                      ? "bg-amber-400 shadow-amber-500/30"
                      : "bg-emerald-500 shadow-emerald-500/20"
                  }`}>
                    BEST VALUE
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className={`text-[10px] font-extrabold uppercase tracking-widest px-2.5 py-1 rounded-md flex items-center gap-1.5 ${
                      isCoinProduct
                        ? "text-amber-300 bg-amber-500/15 border border-amber-500/30"
                        : "text-emerald-400 bg-emerald-500/10"
                    }`}>
                      {isCoinProduct && <Coins className="w-3 h-3 text-amber-400" />}
                      <span>{isCoinProduct ? "IN-GAME COINS" : product.category}</span>
                    </span>
                    <span className="text-xs text-slate-400 font-mono">
                      {product.duration === "30_DAYS" ? "30 Days" : product.duration === "LIFETIME" ? "Permanent" : isCoinProduct ? "Instant /coinshop" : product.duration}
                    </span>
                  </div>

                  <h3 className="text-2xl font-black text-white mb-2">{product.name}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-6">
                    {product.description}
                  </p>

                  <div className="mb-6 pb-6 border-b border-slate-800">
                    <span className="text-3xl font-black text-white">
                      {formatCurrency(product.price, product.currency)}
                    </span>
                    <span className="text-xs text-slate-400 ml-1.5">One-time payment</span>
                  </div>

                  <div className="space-y-2 mb-8">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-slate-300">
                      Included Perks:
                    </span>
                    <ul className="space-y-2">
                      {perksList.slice(0, 6).map((perk, i) => (
                        <li key={i} className="flex items-start gap-2 text-xs text-slate-300">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span className="leading-snug">{perk}</span>
                        </li>
                      ))}
                      {perksList.length > 6 && (
                        <li className="text-[11px] text-emerald-400 pl-6 font-medium">
                          + {perksList.length - 6} additional exclusive perks
                        </li>
                      )}
                    </ul>
                  </div>
                </div>

                {(product.category === "KIT" || product.slug.startsWith("kit-")) && (
                  <button
                    type="button"
                    onClick={() => setChestKitSlug(product.slug)}
                    className="w-full py-2.5 rounded-xl text-center text-xs font-bold uppercase tracking-wider bg-slate-900/90 hover:bg-slate-800 text-cyan-400 border border-cyan-500/30 hover:border-cyan-500/60 transition-all flex items-center justify-center gap-2 mb-2.5 cursor-pointer shadow-sm hover:shadow-cyan-950/40"
                  >
                    <span>📦 View All Items in Chest</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setSelectedProduct(product);
                    setCheckoutError(null);
                    setSetupRequiredNote(null);
                  }}
                  className={`w-full py-3.5 rounded-xl text-center text-xs font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md ${
                    isCoinProduct
                      ? "bg-amber-400 hover:bg-amber-300 text-slate-950 shadow-amber-500/20 hover:shadow-amber-500/40"
                      : "bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20 hover:shadow-emerald-500/40"
                  }`}
                >
                  {isCoinProduct ? <Coins className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
                  <span>{isCoinProduct ? "ACQUIRE COINS" : "PURCHASE NOW"}</span>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Checkout Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="text-lg font-black text-white">Confirm Purchase</h3>
                <p className="text-xs text-slate-400">Harsh Unlimited Official Store</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedProduct(null)}
                className="text-slate-400 hover:text-white text-sm p-1 rounded-lg hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            {/* Selected Item Summary */}
            <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                  {selectedProduct.category}
                </span>
                <h4 className="font-bold text-white text-base">{selectedProduct.name}</h4>
                <p className="text-xs text-slate-400">{selectedProduct.duration} Access</p>
              </div>
              <span className="text-xl font-black text-emerald-400">
                {formatCurrency(selectedProduct.price, selectedProduct.currency)}
              </span>
            </div>

            {/* Form */}
            <form onSubmit={handleCheckout} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Target Minecraft Username <span className="text-emerald-400">*</span>
                </label>
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      required
                      placeholder="e.g. Notch, Steve, YourIGN"
                      value={minecraftUsername}
                      onChange={(e) => setMinecraftUsername(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors font-mono"
                    />
                  </div>

                  {/* Live Minecraft Skin Avatar Preview */}
                  <div className="w-10 h-10 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden shrink-0">
                    <img
                      src={getMinecraftAvatarUrl(minecraftUsername || "MHF_Steve", 40)}
                      alt="Player Avatar"
                      className="w-8 h-8 rounded"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src =
                          "https://mc-heads.net/avatar/MHF_Steve/40";
                      }}
                    />
                  </div>
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Ensure exact spelling and capitalization. Rank will be delivered to this account.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Customer Email (for receipt &amp; order updates)
                </label>
                <input
                  type="email"
                  placeholder="you@domain.com"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              {/* Error Box */}
              {checkoutError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{checkoutError}</span>
                </div>
              )}

              {/* Gateway Setup Required Notice (Transparent Architecture) */}
              {setupRequiredNote && (
                <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-amber-300">
                    <AlertCircle className="w-4 h-4" />
                    <span>Payment Gateway Setup Notice</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-amber-200/90">
                    {setupRequiredNote}
                  </p>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={checkingOut}
                  className="w-full py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 shadow-lg shadow-emerald-500/25 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {checkingOut ? (
                    <span>Initiating Cashfree Payment...</span>
                  ) : (
                    <>
                      <span>Proceed to Cashfree Checkout</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>

              <p className="text-[10px] text-center text-slate-400 pt-2">
                By purchasing, you accept the Harsh Unlimited{" "}
                <a href="/terms" className="underline hover:text-white">
                  Terms of Service
                </a>{" "}
                and{" "}
                <a href="/refunds" className="underline hover:text-white">
                  Refund Policy
                </a>
                .
              </p>
            </form>
          </div>
        </div>
      )}

      {/* Minecraft Chest Inventory Modal */}
      {chestKitSlug && (
        <MinecraftChestModal
          kitSlug={chestKitSlug}
          onClose={() => setChestKitSlug(null)}
          onPurchase={(kitId) => {
            const p = products.find(
              (prod) =>
                prod.id === kitId ||
                prod.slug === kitId ||
                prod.slug === kitId.replace(/^kit-/, "") ||
                `kit-${prod.slug}` === kitId
            );
            if (p) {
              setSelectedProduct(p);
              setCheckoutError(null);
              setSetupRequiredNote(null);
            }
          }}
        />
      )}
    </div>
  );
}
