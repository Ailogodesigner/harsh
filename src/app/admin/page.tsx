"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Shield,
  Bot,
  User,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  LogOut,
  RefreshCw,
  Search,
  Filter,
  CreditCard,
  Layers,
} from "lucide-react";
import DiscordIcon from "@/components/DiscordIcon";
import { playCyberClick, playCyberHover } from "@/components/ui/SoundEffects";

interface AdminOrder {
  id: string;
  clientName: string;
  discordTag: string;
  email: string;
  botName: string;
  botConcept: string;
  featuresCount: number;
  totalPrice: number;
  advanceDeposit: number;
  status: "PENDING_DEPOSIT" | "IN_DEVELOPMENT" | "TESTING" | "COMPLETED";
  createdAt: string;
}

const INITIAL_ORDERS: AdminOrder[] = [
  {
    id: "NN-BOT-Z386Z2",
    clientName: "Aditya Test",
    discordTag: "notix#0001",
    email: "aditya@notixnode.dev",
    botName: "Aegis Sentinel Bot",
    botConcept: "Automated moderation, ticket transcripts, and custom leveling rank cards with SQLite persistence.",
    featuresCount: 3,
    totalPrice: 1697,
    advanceDeposit: 848,
    status: "PENDING_DEPOSIT",
    createdAt: "Just now",
  },
  {
    id: "NN-BOT-K992R1",
    clientName: "Rohan V.",
    discordTag: "rohan_gaming",
    email: "rohan@gmail.com",
    botName: "Valorant Scrim Manager",
    botConcept: "Tournament brackets, automated team voice channels, and live score reports.",
    featuresCount: 5,
    totalPrice: 2845,
    advanceDeposit: 1422,
    status: "IN_DEVELOPMENT",
    createdAt: "2 hours ago",
  },
];

export default function AdminPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<AdminOrder[]>(INITIAL_ORDERS);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    // Check if token exists or prompt for authorization
    const token = localStorage.getItem("nn_admin_token");
    if (!token) {
      router.push("/login");
    } else {
      setAuthorized(true);
    }
  }, [router]);

  const handleStatusChange = (orderId: string, newStatus: AdminOrder["status"]) => {
    playCyberClick();
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
  };

  const handleLogout = () => {
    playCyberClick();
    localStorage.removeItem("nn_admin_token");
    router.push("/login");
  };

  const filteredOrders = orders.filter((o) => {
    const matchesStatus = statusFilter === "ALL" || o.status === statusFilter;
    const query = search.toLowerCase();
    const matchesSearch =
      !query ||
      o.clientName.toLowerCase().includes(query) ||
      o.discordTag.toLowerCase().includes(query) ||
      o.botName.toLowerCase().includes(query) ||
      o.id.toLowerCase().includes(query);
    return matchesStatus && matchesSearch;
  });

  if (!authorized) {
    return (
      <div className="min-h-screen bg-[#05050a] flex items-center justify-center text-purple-300 font-mono text-xs">
        Checking administrator session...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05050a] text-slate-100 pb-20">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-[#070512]/95 backdrop-blur-xl border-b border-purple-500/25 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-lime-400 text-black flex items-center justify-center font-black font-mono text-xs shadow-[0_0_15px_rgba(163,230,53,0.4)]">
            ADM
          </div>
          <div>
            <h1 className="text-base font-black text-white font-sans tracking-tight leading-none">
              NOTIXNODE Admin Control Deck
            </h1>
            <span className="text-[10px] font-mono text-purple-300">
              Bot Orders &amp; Client Inquiries Monitor
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/bot-order"
            className="text-xs font-mono text-purple-300 hover:text-white px-3 py-1.5 rounded-lg border border-purple-500/30"
          >
            Bot Builder &rarr;
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-mono transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Logout</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-8 space-y-6">
        
        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-2xl bg-[#090718] border border-purple-500/20 shadow-lg">
            <span className="text-[10px] font-mono text-purple-300 uppercase">Total Bot Orders</span>
            <div className="text-2xl font-black text-white mt-1">{orders.length}</div>
          </div>
          <div className="p-4 rounded-2xl bg-[#090718] border border-purple-500/20 shadow-lg">
            <span className="text-[10px] font-mono text-purple-300 uppercase">Pending Deposits</span>
            <div className="text-2xl font-black text-amber-400 mt-1">
              {orders.filter((o) => o.status === "PENDING_DEPOSIT").length}
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-[#090718] border border-purple-500/20 shadow-lg">
            <span className="text-[10px] font-mono text-purple-300 uppercase">Active In-Dev</span>
            <div className="text-2xl font-black text-lime-400 mt-1">
              {orders.filter((o) => o.status === "IN_DEVELOPMENT").length}
            </div>
          </div>
          <div className="p-4 rounded-2xl bg-[#090718] border border-purple-500/20 shadow-lg">
            <span className="text-[10px] font-mono text-purple-300 uppercase">Expected Pipeline</span>
            <div className="text-2xl font-black text-purple-300 mt-1">
              ₹{orders.reduce((sum, o) => sum + o.totalPrice, 0).toLocaleString("en-IN")}
            </div>
          </div>
        </div>

        {/* Filters and Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-[#090718] border border-purple-500/20">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-purple-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by client, bot name, or ID..."
              className="w-full pl-9 pr-3.5 py-2 rounded-xl bg-[#0e0c1f] border border-purple-500/30 text-xs text-white placeholder:text-purple-300/40 focus:outline-none focus:border-lime-400"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto">
            {["ALL", "PENDING_DEPOSIT", "IN_DEVELOPMENT", "COMPLETED"].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-all ${
                  statusFilter === st
                    ? "bg-purple-500/30 text-lime-400 border border-purple-500/50"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {st.replace("_", " ")}
              </button>
            ))}
          </div>
        </div>

        {/* Orders Table / List */}
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="p-5 sm:p-6 rounded-2xl bg-[#090718] border border-purple-500/20 hover:border-purple-500/40 transition-all shadow-xl space-y-4"
            >
              {/* Header row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-purple-500/15">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-lime-400 font-bold">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white font-sans">
                      {order.botName}
                    </h3>
                    <div className="flex items-center gap-2 text-xs font-mono text-purple-300">
                      <span>Order: {order.id}</span>
                      <span>•</span>
                      <span>{order.createdAt}</span>
                    </div>
                  </div>
                </div>

                {/* Status Badge & Selector */}
                <div className="flex items-center gap-2">
                  <select
                    value={order.status}
                    onChange={(e) =>
                      handleStatusChange(order.id, e.target.value as AdminOrder["status"])
                    }
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold focus:outline-none border cursor-pointer ${
                      order.status === "PENDING_DEPOSIT"
                        ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                        : order.status === "IN_DEVELOPMENT"
                        ? "bg-lime-500/10 text-lime-400 border-lime-500/30"
                        : "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                    }`}
                  >
                    <option value="PENDING_DEPOSIT">Pending 50% Deposit</option>
                    <option value="IN_DEVELOPMENT">In Development</option>
                    <option value="TESTING">Testing / Staging</option>
                    <option value="COMPLETED">Delivered &amp; Paid</option>
                  </select>
                </div>
              </div>

              {/* Client & Financial Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
                <div className="p-3 rounded-xl bg-[#0e0c1f] border border-purple-500/15 space-y-1">
                  <span className="text-slate-400 text-[10px] uppercase">Client Details:</span>
                  <div className="font-bold text-white">{order.clientName}</div>
                  <div className="text-purple-300 flex items-center gap-1.5">
                    <DiscordIcon className="w-3.5 h-3.5 text-[#5865F2]" />
                    <span>{order.discordTag}</span>
                  </div>
                  <div className="text-slate-400 text-[11px]">{order.email}</div>
                </div>

                <div className="p-3 rounded-xl bg-[#0e0c1f] border border-purple-500/15 space-y-1">
                  <span className="text-slate-400 text-[10px] uppercase">Milestone Financials:</span>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Price:</span>
                    <span className="font-bold text-white">₹{order.totalPrice}</span>
                  </div>
                  <div className="flex justify-between text-lime-400 font-bold">
                    <span>50% Advance:</span>
                    <span>₹{order.advanceDeposit}</span>
                  </div>
                  <div className="text-[10px] text-purple-300/80">
                    {order.featuresCount} Custom Modules Included
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[#0e0c1f] border border-purple-500/15 space-y-1">
                  <span className="text-slate-400 text-[10px] uppercase">Quick Action:</span>
                  <a
                    href="https://dsc.gg/notixnode"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full mt-1.5 py-1.5 rounded-lg bg-[#5865F2] hover:bg-[#4752c4] text-white text-xs font-bold font-sans flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <DiscordIcon className="w-3.5 h-3.5" />
                    <span>Ping in Discord</span>
                  </a>
                </div>
              </div>

              {/* Bot Concept */}
              <div className="p-3 rounded-xl bg-[#070512] border border-purple-500/10 text-xs text-slate-300 font-sans leading-relaxed">
                <strong className="text-purple-300 font-mono">Concept &amp; Instructions:</strong>{" "}
                {order.botConcept}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
