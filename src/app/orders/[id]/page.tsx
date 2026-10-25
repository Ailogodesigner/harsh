"use client";

import { useEffect, useState, use } from "react";
import NextLink from "next/link";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  RefreshCw,
  ShoppingBag,
  Server,
  Shield,
  ArrowRight,
  ExternalLink,
} from "lucide-react";

export default function OrderStatusPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const orderId = resolvedParams.id;

  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOrder = () => {
    setLoading(true);
    fetch(`/api/orders/${encodeURIComponent(orderId)}`)
      .then((res) => {
        if (!res.ok) throw new Error("Order not found or inaccessible");
        return res.json();
      })
      .then((data) => {
        if (data.order) setOrder(data.order);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchOrder();
    const interval = setInterval(fetchOrder, 15000); // 15s poll
    return () => clearInterval(interval);
  }, [orderId]);

  if (loading && !order) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <RefreshCw className="w-8 h-8 text-emerald-400 animate-spin mx-auto" />
        <h2 className="text-xl font-bold text-white">Loading Order Details...</h2>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-rose-400 mx-auto" />
        <h2 className="text-2xl font-bold text-white">Order Not Found</h2>
        <p className="text-xs text-slate-400">{error || "The requested order could not be loaded."}</p>
        <NextLink
          href="/store"
          className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-white hover:border-emerald-500/30"
        >
          <span>Return to Store</span>
        </NextLink>
      </div>
    );
  }

  const isPaid = order.status === "PAID";
  const isPending = order.status === "PENDING";
  const isFailed = order.status === "FAILED";

  const entitlement = order.entitlements?.[0];
  const deliveryJob = entitlement?.deliveryJobs?.[0];

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
      {/* Status Header Box */}
      <div className="glass-panel rounded-2xl p-8 border border-slate-800 space-y-6 text-center">
        <div className="w-16 h-16 rounded-full mx-auto flex items-center justify-center">
          {isPaid ? (
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8" />
            </div>
          ) : isPending ? (
            <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/40 flex items-center justify-center">
              <Clock className="w-8 h-8 animate-pulse" />
            </div>
          ) : (
            <div className="w-16 h-16 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center justify-center">
              <AlertCircle className="w-8 h-8" />
            </div>
          )}
        </div>

        <div>
          <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase">
            Order Reference: {order.id}
          </span>
          <h1 className="text-3xl font-black text-white mt-1">
            {isPaid
              ? "Payment Verified & Complete"
              : isPending
              ? "Awaiting Payment Confirmation"
              : "Payment Unsuccessful"}
          </h1>
          <p className="text-xs text-slate-400 mt-2 max-w-md mx-auto">
            {isPaid
              ? "Thank you for supporting Harsh Unlimited! Your ranks and digital entitlements are active."
              : isPending
              ? "Your payment is currently being processed or confirmed by Cashfree Payments."
              : "This order was cancelled or failed. No funds were captured."}
          </p>
        </div>

        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={fetchOrder}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-200 hover:text-white hover:border-slate-700 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-emerald-400" : ""}`} />
            <span>Refresh Status</span>
          </button>
        </div>
      </div>

      {/* Rank Delivery Fulfilment Card */}
      {isPaid && (
        <div className="glass-panel rounded-2xl p-6 border border-emerald-500/30 space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
                <Server className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Minecraft Rank Delivery</h3>
                <p className="text-xs text-slate-400">
                  Target Account:{" "}
                  <span className="text-emerald-400 font-mono font-semibold">
                    {order.items[0]?.targetMinecraftUsername || "Player"}
                  </span>
                </p>
              </div>
            </div>

            <span
              className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                deliveryJob?.status === "DELIVERED"
                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                  : deliveryJob?.status === "MANUAL_REVIEW"
                  ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                  : "bg-amber-500/20 text-amber-300 border border-amber-500/30"
              }`}
            >
              {deliveryJob?.status || "QUEUED"}
            </span>
          </div>

          <div className="text-xs text-slate-300 space-y-2">
            {deliveryJob?.status === "DELIVERED" ? (
              <p className="text-emerald-300">
                ✓ Ranks have been executed on the server. Relog or type{" "}
                <span className="font-mono bg-slate-950 px-1 py-0.5 rounded">/hub</span> to refresh your tab prefix and permissions.
              </p>
            ) : deliveryJob?.status === "MANUAL_REVIEW" ? (
              <p className="text-slate-300">
                ℹ Order is securely stored in our Administrator Fulfilment Queue. If automatic server bridge is offline, our staff team will apply your perks shortly.
              </p>
            ) : (
              <p className="text-slate-300">
                ⏳ Delivery job is in queue. The server dispatch worker is transmitting commands.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Order Items Breakdown */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
        <h3 className="font-bold text-white text-sm uppercase tracking-wider">Purchased Items</h3>

        <div className="divide-y divide-slate-800/80">
          {order.items.map((item: any) => (
            <div key={item.id} className="py-3 flex items-center justify-between text-xs">
              <div>
                <p className="font-bold text-white text-sm">{item.productName}</p>
                <p className="text-slate-400">
                  For player: <span className="text-emerald-400 font-mono">{item.targetMinecraftUsername}</span>
                </p>
              </div>
              <span className="font-bold text-white text-sm">
                {formatCurrency(item.price, order.currency)}
              </span>
            </div>
          ))}
        </div>

        <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-sm font-bold">
          <span className="text-slate-300">Total Amount Paid</span>
          <span className="text-emerald-400 text-base">
            {formatCurrency(order.totalAmount, order.currency)}
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-slate-400 pt-2">
        <span>Created: {formatDateTime(order.createdAt)}</span>
        <NextLink href="/store" className="text-emerald-400 hover:text-emerald-300 font-semibold">
          ← Return to Store
        </NextLink>
      </div>
    </div>
  );
}
