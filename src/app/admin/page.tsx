"use client";

import { useState, useEffect } from "react";
import NextLink from "next/link";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import {
  DollarSign,
  ShoppingCart,
  AlertTriangle,
  Clock,
  Server,
  Users,
  Shield,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  LifeBuoy,
  UserPlus,
  Gamepad2,
  ArrowRight,
} from "lucide-react";

export default function AdminOverviewPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = () => {
    setLoading(true);
    fetch("/api/admin/stats")
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json) setData(json);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const metrics = data?.metrics || {
    totalOrders: 0,
    paidOrdersCount: 0,
    totalRevenueMinor: 0,
    pendingOrders: 0,
    failedDeliveries: 0,
    totalUsers: 0,
    todaySignups: 0,
    openTickets: 0,
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">
            Operations &amp; Security
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Network Overview</h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time status of orders, revenue, registered users, rank deliveries, and live support tickets.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchStats}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-200 hover:text-white transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-emerald-400" : ""}`} />
          <span>Refresh Data</span>
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Revenue */}
        <div className="glass-panel p-5 rounded-2xl border border-emerald-500/30 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Total Revenue</span>
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-white">
            {formatCurrency(metrics.totalRevenueMinor, "INR")}
          </p>
          <span className="text-[10px] text-emerald-400 block font-mono">
            {metrics.paidOrdersCount} Paid Orders
          </span>
        </div>

        {/* Total Orders */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Total Orders</span>
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-white">{metrics.totalOrders}</p>
          <span className="text-[10px] text-slate-400 block font-mono">
            All checkout sessions
          </span>
        </div>

        {/* Registered Users & Signups */}
        <NextLink
          href="/admin/users"
          className="glass-panel p-5 rounded-2xl border border-blue-500/30 space-y-2 hover:border-blue-400 transition-colors block group cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold group-hover:text-blue-300 transition-colors">
              Registered Users
            </span>
            <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-white">{metrics.totalUsers}</p>
          <span className="text-[10px] text-emerald-400 block font-semibold flex items-center gap-1">
            <UserPlus className="w-3 h-3" />
            <span>+{metrics.todaySignups || 0} signed up today</span>
          </span>
        </NextLink>

        {/* Active Support Tickets */}
        <NextLink
          href="/admin/tickets"
          className="glass-panel p-5 rounded-2xl border border-amber-500/30 space-y-2 hover:border-amber-400 transition-colors block group cursor-pointer"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold group-hover:text-amber-300 transition-colors">
              Support Tickets
            </span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
              <LifeBuoy className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-300">{metrics.openTickets || 0}</p>
          <span className="text-[10px] text-amber-400/80 block font-mono">
            Awaiting response
          </span>
        </NextLink>

        {/* Failed / Pending Deliveries */}
        <div className="glass-panel p-5 rounded-2xl border border-rose-500/30 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Fulfillment Attention</span>
            <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-rose-400">{metrics.failedDeliveries}</p>
          <span className="text-[10px] text-rose-400/80 block font-mono">
            {metrics.pendingOrders} pending webhooks
          </span>
        </div>
      </div>

      {/* Two Column Grid: Recent Orders & Recent Registered Users */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders Table */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-base font-bold text-white">Recent Orders</h2>
              <p className="text-xs text-slate-400">Live feed of store checkouts</p>
            </div>
            <NextLink
              href="/admin/orders"
              className="text-xs text-emerald-400 hover:text-emerald-300 font-semibold"
            >
              View All Orders →
            </NextLink>
          </div>

          {!data?.recentOrders?.length ? (
            <p className="text-xs text-slate-400 py-6 text-center">No orders recorded yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300 border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                    <th className="py-2.5 px-3">Order ID</th>
                    <th className="py-2.5 px-3">Customer</th>
                    <th className="py-2.5 px-3">Item</th>
                    <th className="py-2.5 px-3">Amount</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {data.recentOrders.slice(0, 6).map((ord: any) => (
                    <tr key={ord.id} className="hover:bg-slate-900/40">
                      <td className="py-2.5 px-3 font-bold text-white">{ord.id.slice(0, 10)}...</td>
                      <td className="py-2.5 px-3 font-sans text-slate-300">{ord.user?.name || "Guest"}</td>
                      <td className="py-2.5 px-3 font-sans text-white">
                        {ord.items?.[0]?.productName || "Product"}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-emerald-400">
                        {formatCurrency(ord.totalAmount, ord.currency)}
                      </td>
                      <td className="py-2.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
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
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Recent Member Registrations */}
        <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Recent User Signups</span>
                <span className="text-[10px] bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded font-mono">
                  {metrics.totalUsers} Total
                </span>
              </h2>
              <p className="text-xs text-slate-400">Newly registered players &amp; customers</p>
            </div>
            <NextLink
              href="/admin/users"
              className="text-xs text-blue-400 hover:text-blue-300 font-semibold"
            >
              Manage Users →
            </NextLink>
          </div>

          {!data?.recentUsers?.length ? (
            <p className="text-xs text-slate-400 py-6 text-center">No registered users found.</p>
          ) : (
            <div className="space-y-2.5">
              {data.recentUsers.map((u: any) => {
                const ign = u.minecraftAccounts?.[0]?.username;
                return (
                  <div
                    key={u.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition-colors text-xs"
                  >
                    <div className="flex items-center gap-3">
                      {ign ? (
                        <img
                          src={`https://mc-heads.net/avatar/${ign}/40`}
                          alt={ign}
                          className="w-8 h-8 rounded-lg border border-slate-700 shrink-0"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-400 shrink-0">
                          <Users className="w-4 h-4" />
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{u.name}</span>
                          <span
                            className={`px-1.5 py-0.2 rounded text-[9px] font-black uppercase ${
                              u.role === "ADMIN" || u.role === "SUPERADMIN"
                                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                : u.role === "STAFF"
                                ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                                : "bg-slate-800 text-slate-400"
                            }`}
                          >
                            {u.role}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 block">{u.email}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      {ign ? (
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 block mb-1">
                          IGN: {ign}
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-500 block mb-1">No IGN Linked</span>
                      )}
                      <span className="text-[10px] text-slate-500 font-mono">
                        {formatDateTime(u.createdAt)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Recent Administrative Audit Logs */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div>
            <h2 className="text-base font-bold text-white">Administrative Audit Trail</h2>
            <p className="text-xs text-slate-400">Immutable record of security and store operations</p>
          </div>
          <NextLink
            href="/admin/audit"
            className="text-xs text-amber-400 hover:text-amber-300 font-semibold"
          >
            Full Audit Log →
          </NextLink>
        </div>

        {!data?.recentLogs?.length ? (
          <p className="text-xs text-slate-400 py-4 text-center">No audit logs recorded yet.</p>
        ) : (
          <div className="space-y-2">
            {data.recentLogs.map((log: any) => (
              <div
                key={log.id}
                className="bg-slate-950/80 p-3 rounded-xl border border-slate-800/80 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-mono text-emerald-400 font-bold mr-2">[{log.action}]</span>
                  <span className="text-slate-200">
                    Target: {log.targetEntity} #{log.targetId?.slice(0, 16)}
                  </span>
                  <span className="text-[11px] text-slate-400 block font-sans">
                    By: {log.actorEmail || log.actorId}
                  </span>
                </div>
                <span className="text-slate-400 text-[11px] font-mono">
                  {formatDateTime(log.timestamp)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
