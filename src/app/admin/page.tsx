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
            Real-time status of orders, revenue, rank delivery queues, and administrative activity.
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
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="glass-panel p-5 rounded-2xl border border-emerald-500/30 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Total Revenue (Verified)</span>
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
            <span className="text-xs font-semibold">Total Orders Created</span>
            <div className="p-1.5 rounded-lg bg-cyan-500/10 text-cyan-400">
              <ShoppingCart className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-white">{metrics.totalOrders}</p>
          <span className="text-[10px] text-slate-400 block font-mono">
            All historical checkout sessions
          </span>
        </div>

        {/* Pending Payments */}
        <div className="glass-panel p-5 rounded-2xl border border-amber-500/30 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Pending Payments</span>
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-amber-300">{metrics.pendingOrders}</p>
          <span className="text-[10px] text-amber-400/80 block font-mono">
            Awaiting webhook confirmation
          </span>
        </div>

        {/* Failed / Manual Delivery */}
        <div className="glass-panel p-5 rounded-2xl border border-rose-500/30 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold">Manual / Failed Deliveries</span>
            <div className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-rose-400">{metrics.failedDeliveries}</p>
          <span className="text-[10px] text-rose-400/80 block font-mono">
            Requires admin fulfillment
          </span>
        </div>
      </div>

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
                  <th className="py-2.5 px-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {data.recentOrders.map((ord: any) => (
                  <tr key={ord.id} className="hover:bg-slate-900/40">
                    <td className="py-2.5 px-3 font-bold text-white">{ord.id}</td>
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
                    <td className="py-2.5 px-3 text-slate-400">{formatDateTime(ord.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
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
                    Target: {log.targetEntity} #{log.targetId}
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
