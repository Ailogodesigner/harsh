"use client";

import { useState, useEffect } from "react";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import {
  Search,
  RefreshCw,
  RotateCcw,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Server,
  ExternalLink,
} from "lucide-react";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");
  const [retryingJobId, setRetryingJobId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const fetchOrders = () => {
    setLoading(true);
    fetch("/api/admin/stats")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.recentOrders) setOrders(data.recentOrders);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleRetryDelivery = async (deliveryJobId: string) => {
    if (!deliveryJobId) return;
    setRetryingJobId(deliveryJobId);
    setActionMessage(null);

    try {
      const res = await fetch("/api/admin/delivery/retry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deliveryJobId }),
      });

      const data = await res.json();
      if (!res.ok) {
        setActionMessage(`Retry failed: ${data.error}`);
      } else {
        setActionMessage(
          `Delivery job dispatched! Provider: ${data.result?.provider}. Result: ${
            data.result?.acknowledgement || data.result?.error
          }`
        );
      }
      fetchOrders();
    } catch (err: any) {
      setActionMessage(`Error: ${err.message}`);
    } finally {
      setRetryingJobId(null);
    }
  };

  const filteredOrders = orders.filter((ord) => {
    const matchesStatus = filterStatus === "ALL" || ord.status === filterStatus;
    const matchesSearch =
      ord.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ord.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ord.items?.[0]?.targetMinecraftUsername?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
            Fulfillment Management
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Orders &amp; Rank Delivery</h1>
          <p className="text-xs text-slate-400 mt-1">
            Audit payment states, inspect Minecraft delivery jobs, and safely retry failed console dispatches.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchOrders}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-200 hover:text-white transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-emerald-400" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {actionMessage && (
        <div className="p-3.5 rounded-xl bg-slate-900 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {["ALL", "PAID", "PENDING", "FAILED"].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterStatus === st
                  ? "bg-emerald-500 text-slate-950"
                  : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search order ID, email, player..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Orders Table */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800">
        {filteredOrders.length === 0 ? (
          <p className="text-xs text-slate-400 py-8 text-center">No matching orders found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300 border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                  <th className="py-3 px-3">Order ID</th>
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Target IGN</th>
                  <th className="py-3 px-3">Item</th>
                  <th className="py-3 px-3">Amount</th>
                  <th className="py-3 px-3">Order Status</th>
                  <th className="py-3 px-3">Payment Ref</th>
                  <th className="py-3 px-3 text-right">Delivery Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 font-mono">
                {filteredOrders.map((ord) => {
                  const item = ord.items?.[0];
                  const payment = ord.payments?.[0];
                  const isPaid = ord.status === "PAID";

                  return (
                    <tr key={ord.id} className="hover:bg-slate-900/40">
                      <td className="py-3 px-3 font-bold text-white">{ord.id}</td>
                      <td className="py-3 px-3 text-slate-400 font-sans">
                        {formatDateTime(ord.createdAt)}
                      </td>
                      <td className="py-3 px-3 font-bold text-emerald-400">
                        {item?.targetMinecraftUsername || "N/A"}
                      </td>
                      <td className="py-3 px-3 font-sans text-white">
                        {item?.productName || "Product"}
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
                      <td className="py-3 px-3 text-slate-400 truncate max-w-[120px]">
                        {payment?.providerPaymentReference || payment?.providerOrderId || "Awaiting"}
                      </td>
                      <td className="py-3 px-3 text-right">
                        {isPaid && (
                          <button
                            type="button"
                            onClick={() => handleRetryDelivery(ord.id)}
                            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-[11px] font-bold bg-slate-900 hover:bg-slate-800 text-amber-400 border border-slate-800 hover:border-amber-500/30 transition-all cursor-pointer"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Retry</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
