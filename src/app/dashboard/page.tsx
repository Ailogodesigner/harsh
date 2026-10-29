"use client";

import { useState, useEffect } from "react";
import NextLink from "next/link";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { getMinecraftAvatarUrl } from "@/lib/minecraft/verification";
import {
  User,
  Shield,
  ShoppingBag,
  Gamepad2,
  LifeBuoy,
  CheckCircle2,
  Clock,
  AlertCircle,
  Plus,
  RefreshCw,
  ExternalLink,
  Crown,
  Key,
  ArrowRight,
  MessageSquare,
} from "lucide-react";

export default function CustomerDashboard() {
  const [user, setUser] = useState<any>(null);
  const [accounts, setAccounts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [entitlements, setEntitlements] = useState<any[]>([]);
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Link account state
  const [newUsername, setNewUsername] = useState("");
  const [linking, setLinking] = useState(false);
  const [linkMsg, setLinkMsg] = useState<string | null>(null);
  const [linkError, setLinkError] = useState<string | null>(null);

  const fetchDashboardData = () => {
    setLoading(true);
    fetch("/api/auth/me", { cache: "no-store" })
      .then((res) => {
        if (res.status === 401) {
          window.location.href = "/login?redirect=/dashboard";
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data?.user) {
          setUser(data.user);
        }
      })
      .catch((err) => {
        console.warn("Session check warning:", err);
      });

    fetch("/api/tickets", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (Array.isArray(data?.tickets)) {
          setTickets(data.tickets);
        }
      })
      .catch(() => {});

    // Fetch user orders, accounts & synchronized tickets
    fetch("/api/user/profile", { cache: "no-store" })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          if (Array.isArray(data.accounts)) setAccounts(data.accounts);
          if (Array.isArray(data.orders)) setOrders(data.orders);
          if (Array.isArray(data.entitlements)) setEntitlements(data.entitlements);
          if (Array.isArray(data.tickets) && data.tickets.length > 0) {
            setTickets(data.tickets);
          }
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleLinkAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setLinkError(null);
    setLinkMsg(null);
    setLinking(true);

    try {
      const res = await fetch("/api/minecraft/link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: newUsername }),
      });

      const data = await res.json();
      if (!res.ok) {
        setLinkError(data.error || "Failed to link Minecraft account");
        setLinking(false);
        return;
      }

      // Immediately update linked accounts state for instant UI reflection & count increment
      if (data.account) {
        setAccounts((prev) => [data.account, ...prev.filter((a) => a.id !== data.account.id)]);
      }

      setLinkMsg(data.message);
      setNewUsername("");
      fetchDashboardData();
    } catch (err: any) {
      setLinkError(err?.message || "Failed to link account");
    } finally {
      setLinking(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Welcome Banner */}
      <div className="glass-panel rounded-3xl p-8 border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <User className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-white">
                Welcome, {user?.name || "Player"}
              </h1>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                {user?.role || "USER"}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">{user?.email}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <NextLink
            href="/store"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20 transition-all"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Store Catalogue</span>
          </NextLink>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <span className="text-xs text-slate-400 font-medium">Linked Minecraft Accounts</span>
          <p className="text-2xl font-black text-white mt-1">{accounts.length}</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <span className="text-xs text-slate-400 font-medium">Active Entitlements</span>
          <p className="text-2xl font-black text-emerald-400 mt-1">{entitlements.length}</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <span className="text-xs text-slate-400 font-medium">Total Orders</span>
          <p className="text-2xl font-black text-white mt-1">{orders.length}</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <span className="text-xs text-slate-400 font-medium">Support Tickets</span>
          <p className="text-2xl font-black text-cyan-400 mt-1">{tickets.length}</p>
        </div>
      </div>

      {/* Linked Minecraft Accounts Section */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-800 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Gamepad2 className="w-5 h-5 text-emerald-400" />
              <span>Linked Minecraft Profiles</span>
            </h2>
            <p className="text-xs text-slate-400">
              Only verified profiles are eligible for sensitive digital item claims.
            </p>
          </div>
        </div>

        {/* Link Form */}
        <form onSubmit={handleLinkAccount} className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            required
            placeholder="Enter Minecraft Java/Bedrock username..."
            value={newUsername}
            onChange={(e) => setNewUsername(e.target.value)}
            className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
          />
          <button
            type="submit"
            disabled={linking}
            className="px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 shadow-md shadow-emerald-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
          >
            <Plus className="w-4 h-4" />
            <span>{linking ? "Linking..." : "Link Profile"}</span>
          </button>
        </form>

        {linkMsg && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span>{linkMsg}</span>
          </div>
        )}

        {linkError && (
          <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span>{linkError}</span>
          </div>
        )}

        {/* Account Cards */}
        {accounts.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">
            No Minecraft accounts linked yet. Enter your in-game username above.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
            {accounts.map((acc) => (
              <div
                key={acc.id}
                className="bg-slate-950/80 rounded-xl p-4 border border-slate-800 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={getMinecraftAvatarUrl(acc.username, 40)}
                    alt={acc.username}
                    className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        "https://mc-heads.net/avatar/MHF_Steve/40";
                    }}
                  />
                  <div>
                    <h4 className="font-bold text-sm text-white font-mono">{acc.username}</h4>
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-bold ${
                        acc.verificationStatus === "VERIFIED"
                          ? "text-emerald-400"
                          : "text-amber-400"
                      }`}
                    >
                      {acc.verificationStatus === "VERIFIED" && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                      <span>{acc.verificationStatus === "VERIFIED" ? "SYNCED & VERIFIED" : acc.verificationStatus}</span>
                    </span>
                  </div>
                </div>

                {acc.verificationCode && acc.verificationStatus !== "VERIFIED" && (
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block">Verify In-Game:</span>
                    <span className="text-xs font-mono font-bold text-amber-300">
                      /verify {acc.verificationCode}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Order History & Delivery Status */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-800 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-emerald-400" />
              <span>Purchase History &amp; Rank Delivery</span>
            </h2>
            <p className="text-xs text-slate-400">Real-time status of your store orders</p>
          </div>
        </div>

        {orders.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">
            No orders found. Explore our{" "}
            <NextLink href="/store" className="text-emerald-400 underline">
              Store
            </NextLink>{" "}
            to purchase ranks and in-game keys.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300 border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[11px]">
                  <th className="py-3 px-3">Order ID</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Item</th>
                  <th className="py-3 px-3">Amount</th>
                  <th className="py-3 px-3">Payment</th>
                  <th className="py-3 px-3">Delivery Status</th>
                  <th className="py-3 px-3 text-right">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {orders.map((ord) => {
                  const item = ord.items?.[0];
                  const deliveryJob = ord.entitlements?.[0]?.deliveryJobs?.[0];

                  return (
                    <tr key={ord.id} className="hover:bg-slate-900/40">
                      <td className="py-3 px-3 font-mono text-white font-bold">{ord.id}</td>
                      <td className="py-3 px-3 text-slate-400">{formatDateTime(ord.createdAt)}</td>
                      <td className="py-3 px-3 font-medium text-white">
                        {item?.productName || "Digital Product"}
                      </td>
                      <td className="py-3 px-3 font-bold text-white">
                        {formatCurrency(ord.totalAmount, ord.currency)}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            ord.status === "PAID"
                              ? "bg-emerald-500/15 text-emerald-400"
                              : ord.status === "PENDING"
                              ? "bg-amber-500/15 text-amber-400"
                              : "bg-rose-500/15 text-rose-400"
                          }`}
                        >
                          {ord.status}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            deliveryJob?.status === "DELIVERED"
                              ? "bg-emerald-500/15 text-emerald-400"
                              : deliveryJob?.status === "MANUAL_REVIEW"
                              ? "bg-blue-500/15 text-blue-300"
                              : "bg-amber-500/15 text-amber-400"
                          }`}
                        >
                          {deliveryJob?.status || "QUEUED"}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <NextLink
                          href={`/orders/${ord.id}`}
                          className="text-emerald-400 hover:text-emerald-300 font-semibold"
                        >
                          View →
                        </NextLink>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Support Tickets Overview */}
      <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-800 space-y-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <LifeBuoy className="w-5 h-5 text-cyan-400" />
              <span>Your Support Tickets</span>
            </h2>
            <p className="text-xs text-slate-400">Direct inquiries with Harsh Unlimited administration</p>
          </div>

          <NextLink
            href="/support"
            className="px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 border border-slate-800 hover:border-slate-700 text-white"
          >
            + New Ticket
          </NextLink>
        </div>

        {tickets.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">
            No active support tickets. Need help? Visit our{" "}
            <NextLink href="/support" className="text-emerald-400 underline">
              Support Page
            </NextLink>
            .
          </p>
        ) : (
          <div className="space-y-3">
            {tickets.map((t) => {
              const lastMsg = t.messages?.[t.messages.length - 1];
              const isStaffReply = lastMsg?.senderRole === "ADMIN" || lastMsg?.senderRole === "SUPERADMIN";
              const isAwaitingPlayer = t.status === "WAITING_USER";

              return (
                <NextLink
                  key={t.id}
                  href={`/tickets/${t.id}`}
                  className={`block p-4 sm:p-5 rounded-2xl border transition-all cursor-pointer ${
                    isAwaitingPlayer
                      ? "bg-slate-900/90 border-cyan-500/50 hover:border-cyan-400 shadow-lg shadow-cyan-950/30"
                      : "bg-slate-950/80 border-slate-800 hover:border-slate-700 hover:bg-slate-900/50"
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                          {t.category}
                        </span>
                        <h4 className="font-bold text-sm sm:text-base text-white hover:text-cyan-400 transition-colors">
                          {t.subject}
                        </h4>
                      </div>

                      <div className="flex items-center gap-2 text-xs text-slate-400">
                        {isStaffReply ? (
                          <span className="text-emerald-400 font-semibold flex items-center gap-1">
                            <Shield className="w-3 h-3 text-emerald-400" />
                            <span>Staff Replied:</span>
                          </span>
                        ) : (
                          <span className="text-slate-500">You:</span>
                        )}
                        <span className="line-clamp-1 italic text-slate-300">
                          &quot;{lastMsg?.content?.slice(0, 80) || "No message content"}&quot;
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span
                        className={`text-[10px] font-bold px-2.5 py-1 rounded-lg uppercase tracking-wider ${
                          isAwaitingPlayer
                            ? "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 animate-pulse font-black"
                            : t.status === "OPEN"
                            ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30"
                            : "bg-slate-800 text-slate-400 border border-slate-700"
                        }`}
                      >
                        {isAwaitingPlayer ? "Staff Replied • Answer Now" : t.status.replace("_", " ")}
                      </span>

                      <div className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-cyan-500/50 text-cyan-400 text-xs font-bold inline-flex items-center gap-1 transition-all">
                        <span>Open Chat</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                </NextLink>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
