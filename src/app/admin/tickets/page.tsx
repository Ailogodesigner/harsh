"use client";

import { useState, useEffect, useRef } from "react";
import {
  LifeBuoy,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  AlertTriangle,
  Send,
  User,
  Shield,
  Trash2,
  RefreshCw,
  Copy,
  Check,
  CheckCheck,
  MessageSquare,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Zap,
  Tag,
  Gamepad2,
  CreditCard,
  Bug,
  HelpCircle,
  ShieldAlert,
  ChevronDown,
} from "lucide-react";

interface TicketMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  content: string;
  createdAt: string;
}

interface TicketUser {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  minecraftAccounts?: {
    username: string;
    verificationStatus: string;
  }[];
  _count?: {
    orders: number;
  };
}

interface Ticket {
  id: string;
  userId: string;
  subject: string;
  category: string;
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  status: "OPEN" | "WAITING_ADMIN" | "WAITING_USER" | "RESOLVED" | "CLOSED";
  createdAt: string;
  updatedAt: string;
  user: TicketUser;
  messages: TicketMessage[];
}

const CANNED_RESPONSES = [
  {
    label: "Payment & Rank Verification",
    category: "BILLING",
    text: "Hello! We have reviewed your transaction and verified your perks on the server. Please reconnect to play.harshunlimited.fun and check your rank and perks with /rank and /perks.",
  },
  {
    label: "Request Cashfree Reference / Order ID",
    category: "BILLING",
    text: "Hi! To investigate this promptly, could you please provide your Cashfree Payment Reference ID or Internal Order ID (starts with HU-ORD-2026...) along with the payment receipt screenshot?",
  },
  {
    label: "Bug Fixed on Survival SMP",
    category: "BUG",
    text: "Thank you for reporting this issue! Our development and technical team investigated the server logs and deployed a fix to the Survival SMP. Please test it again in-game.",
  },
  {
    label: "Claim Blocks & Kits Credited",
    category: "GAMEPLAY",
    text: "Your land claim blocks and server kit entitlements have been synchronized to your linked Minecraft account. You can use /kit and /claim in-game to access them.",
  },
  {
    label: "Issue Resolved / Close",
    category: "GENERAL",
    text: "We are glad we could assist you! This ticket has now been marked as resolved. If you have any further questions or encounter any problems, feel free to open a new ticket anytime.",
  },
];

export default function AdminTicketsPage() {
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [counts, setCounts] = useState<Record<string, number>>({
    TOTAL: 0,
    OPEN: 0,
    WAITING_ADMIN: 0,
    WAITING_USER: 0,
    RESOLVED: 0,
    CLOSED: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [priorityFilter, setPriorityFilter] = useState("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");

  // Reply state
  const [replyText, setReplyText] = useState("");
  const [replyStatus, setReplyStatus] = useState<string>("WAITING_USER");
  const [sendingReply, setSendingReply] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showScrollBottom, setShowScrollBottom] = useState(false);

  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (smooth = true) => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: smooth ? "smooth" : "auto",
      });
    }
  };

  const handleScroll = () => {
    const el = messagesContainerRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setShowScrollBottom(distanceFromBottom > 120);
  };

  const fetchTickets = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      if (priorityFilter !== "ALL") params.set("priority", priorityFilter);
      if (categoryFilter !== "ALL") params.set("category", categoryFilter);
      if (search.trim()) params.set("search", search.trim());

      const res = await fetch(`/api/admin/tickets?${params.toString()}`);
      const data = await res.json();

      if (res.ok && data.tickets) {
        setTickets(data.tickets);
        if (data.counts) setCounts(data.counts);

        // Auto select first ticket if none selected or if previous selected ticket is gone
        if (!selectedTicketId && data.tickets.length > 0) {
          setSelectedTicketId(data.tickets[0].id);
        } else if (selectedTicketId && !data.tickets.some((t: Ticket) => t.id === selectedTicketId)) {
          setSelectedTicketId(data.tickets[0]?.id || null);
        }
      }
    } catch (err) {
      console.error("Failed to load tickets", err);
    } finally {
      setLoading(false);
      if (isManual) setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, [statusFilter, priorityFilter, categoryFilter, search]);

  // Auto refresh interval - fast 3-second live sync for real-time customer support chat
  useEffect(() => {
    if (!autoRefresh) return;
    const interval = setInterval(() => {
      fetchTickets();
    }, 3000);
    return () => clearInterval(interval);
  }, [autoRefresh, statusFilter, priorityFilter, categoryFilter, search]);

  // Scroll ONLY the inner message list to bottom when a ticket is selected (never scroll full window)
  useEffect(() => {
    if (selectedTicketId && messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [selectedTicketId]);

  // Keep scrolled to bottom on background poll only if the user is already near the bottom
  useEffect(() => {
    const el = messagesContainerRef.current;
    if (!el) return;
    const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
    if (isNearBottom) {
      el.scrollTop = el.scrollHeight;
    }
  }, [tickets]);

  const selectedTicket = tickets.find((t) => t.id === selectedTicketId);

  const handleCopyId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleUpdateStatus = async (ticketId: string, newStatus: string) => {
    try {
      const res = await fetch("/api/admin/tickets", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: ticketId, status: newStatus }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTickets((prev) =>
          prev.map((t) => (t.id === ticketId ? { ...t, status: newStatus as any } : t))
        );
        setActionMessage({ type: "success", text: `Status updated to ${newStatus}` });
        setTimeout(() => setActionMessage(null), 3000);
        fetchTickets();
      }
    } catch {
      setActionMessage({ type: "error", text: "Failed to update ticket status" });
    }
  };

  const handleUpdatePriority = async (ticketId: string, newPriority: string) => {
    try {
      const res = await fetch("/api/admin/tickets", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: ticketId, priority: newPriority }),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTickets((prev) =>
          prev.map((t) => (t.id === ticketId ? { ...t, priority: newPriority as any } : t))
        );
        setActionMessage({ type: "success", text: `Priority changed to ${newPriority}` });
        setTimeout(() => setActionMessage(null), 3000);
      }
    } catch {
      setActionMessage({ type: "error", text: "Failed to update priority" });
    }
  };

  const handleDeleteTicket = async (ticketId: string) => {
    if (!confirm("Are you sure you want to permanently delete this support ticket?")) return;
    try {
      const res = await fetch(`/api/admin/tickets?id=${ticketId}`, { method: "DELETE" });
      if (res.ok) {
        setTickets((prev) => prev.filter((t) => t.id !== ticketId));
        setSelectedTicketId(null);
        setActionMessage({ type: "success", text: "Ticket deleted successfully" });
        setTimeout(() => setActionMessage(null), 3000);
        fetchTickets();
      }
    } catch {
      setActionMessage({ type: "error", text: "Failed to delete ticket" });
    }
  };

  const handleSendReply = async (customStatus?: string) => {
    const contentToSend = replyText.trim();
    if (!contentToSend || !selectedTicketId) return;
    setSendingReply(true);
    const targetStatus = customStatus || replyStatus;

    // Optimistic reply append
    const optimisticMsg: TicketMessage = {
      id: `opt-${Date.now()}`,
      senderId: "admin",
      senderName: "Support Staff",
      senderRole: "ADMIN",
      content: contentToSend,
      createdAt: new Date().toISOString(),
    };
    setTickets((prev) =>
      prev.map((t) =>
        t.id === selectedTicketId
          ? { ...t, messages: [...(t.messages || []), optimisticMsg] }
          : t
      )
    );
    setReplyText("");
    setTimeout(() => scrollToBottom(true), 40);

    try {
      const res = await fetch(`/api/admin/tickets/${selectedTicketId}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: contentToSend,
          status: targetStatus,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setTickets((prev) =>
          prev.map((t) => (t.id === selectedTicketId ? data.ticket : t))
        );
        setActionMessage({ type: "success", text: "Reply dispatched to player!" });
        setTimeout(() => setActionMessage(null), 3000);
        setTimeout(() => scrollToBottom(true), 50);
        fetchTickets();
      } else {
        setActionMessage({ type: "error", text: data.error || "Failed to send reply" });
        fetchTickets();
      }
    } catch {
      setActionMessage({ type: "error", text: "Network error sending reply" });
      fetchTickets();
    } finally {
      setSendingReply(false);
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "URGENT":
        return "bg-rose-500/20 text-rose-400 border-rose-500/30 animate-pulse font-black";
      case "HIGH":
        return "bg-amber-500/20 text-amber-400 border-amber-500/30 font-bold";
      case "MEDIUM":
        return "bg-cyan-500/20 text-cyan-400 border-cyan-500/30 font-semibold";
      default:
        return "bg-slate-800 text-slate-400 border-slate-700";
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "OPEN":
        return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
      case "WAITING_ADMIN":
        return "bg-rose-500/15 text-rose-400 border-rose-500/30 animate-pulse";
      case "WAITING_USER":
        return "bg-cyan-500/15 text-cyan-400 border-cyan-500/30";
      case "RESOLVED":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "CLOSED":
        return "bg-slate-800 text-slate-400 border-slate-700";
      default:
        return "bg-slate-800 text-slate-300";
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "BILLING":
        return <CreditCard className="w-3.5 h-3.5 text-amber-400" />;
      case "BUG":
        return <Bug className="w-3.5 h-3.5 text-rose-400" />;
      case "GAMEPLAY":
        return <Gamepad2 className="w-3.5 h-3.5 text-cyan-400" />;
      default:
        return <HelpCircle className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <LifeBuoy className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                <span>Support Ticket Desk</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 uppercase tracking-widest">
                  Live Operations
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Player ticket triage, payment verification, SMP bug reports, and customer resolution
              </p>
            </div>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-slate-400 bg-slate-900/80 px-3 py-2 rounded-xl border border-slate-800 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={autoRefresh}
              onChange={(e) => setAutoRefresh(e.target.checked)}
              className="accent-cyan-500 rounded"
            />
            <span>Auto Refresh (12s)</span>
          </label>

          <button
            onClick={() => fetchTickets(true)}
            disabled={refreshing}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin text-cyan-400" : ""}`} />
            <span>{refreshing ? "Syncing..." : "Sync Tickets"}</span>
          </button>
        </div>
      </div>

      {/* Action Notification Alert */}
      {actionMessage && (
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-semibold ${
            actionMessage.type === "success"
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25"
              : "bg-rose-500/10 text-rose-400 border-rose-500/25"
          }`}
        >
          <span>{actionMessage.text}</span>
          <button onClick={() => setActionMessage(null)} className="opacity-70 hover:opacity-100">
            ✕
          </button>
        </div>
      )}

      {/* KPI Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div
          onClick={() => setStatusFilter("ALL")}
          className={`glass-panel p-4 rounded-xl border cursor-pointer transition-all ${
            statusFilter === "ALL"
              ? "border-cyan-500/50 bg-cyan-950/20"
              : "border-slate-800 hover:border-slate-700 bg-slate-950/60"
          }`}
        >
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total</span>
          <p className="text-2xl font-black text-white mt-1">{counts.TOTAL || 0}</p>
        </div>

        <div
          onClick={() => setStatusFilter("OPEN")}
          className={`glass-panel p-4 rounded-xl border cursor-pointer transition-all ${
            statusFilter === "OPEN"
              ? "border-emerald-500/50 bg-emerald-950/20"
              : "border-slate-800 hover:border-slate-700 bg-slate-950/60"
          }`}
        >
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            Open
          </span>
          <p className="text-2xl font-black text-emerald-400 mt-1">{counts.OPEN || 0}</p>
        </div>

        <div
          onClick={() => setStatusFilter("WAITING_ADMIN")}
          className={`glass-panel p-4 rounded-xl border cursor-pointer transition-all ${
            statusFilter === "WAITING_ADMIN"
              ? "border-rose-500/50 bg-rose-950/20"
              : "border-slate-800 hover:border-slate-700 bg-slate-950/60"
          }`}
        >
          <span className="text-[10px] font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping"></span>
            Needs Staff
          </span>
          <p className="text-2xl font-black text-rose-400 mt-1">{counts.WAITING_ADMIN || 0}</p>
        </div>

        <div
          onClick={() => setStatusFilter("WAITING_USER")}
          className={`glass-panel p-4 rounded-xl border cursor-pointer transition-all ${
            statusFilter === "WAITING_USER"
              ? "border-cyan-500/50 bg-cyan-950/20"
              : "border-slate-800 hover:border-slate-700 bg-slate-950/60"
          }`}
        >
          <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">
            Waiting Player
          </span>
          <p className="text-2xl font-black text-cyan-400 mt-1">{counts.WAITING_USER || 0}</p>
        </div>

        <div
          onClick={() => setStatusFilter("RESOLVED")}
          className={`glass-panel p-4 rounded-xl border cursor-pointer transition-all ${
            statusFilter === "RESOLVED"
              ? "border-emerald-500/50 bg-emerald-950/20"
              : "border-slate-800 hover:border-slate-700 bg-slate-950/60"
          }`}
        >
          <span className="text-[10px] font-bold text-slate-300 uppercase tracking-wider">
            Resolved
          </span>
          <p className="text-2xl font-black text-slate-300 mt-1">{counts.RESOLVED || 0}</p>
        </div>

        <div
          onClick={() => setStatusFilter("CLOSED")}
          className={`glass-panel p-4 rounded-xl border cursor-pointer transition-all ${
            statusFilter === "CLOSED"
              ? "border-slate-600 bg-slate-900"
              : "border-slate-800 hover:border-slate-700 bg-slate-950/60"
          }`}
        >
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            Closed
          </span>
          <p className="text-2xl font-black text-slate-400 mt-1">{counts.CLOSED || 0}</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-3.5 rounded-xl border border-slate-800 bg-slate-950/80 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search subject, player, email, IGN, or ticket ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-900/90 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Status Dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="WAITING_ADMIN">Waiting Staff</option>
            <option value="WAITING_USER">Waiting User</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
          </select>

          {/* Priority Dropdown */}
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Priorities</option>
            <option value="URGENT">Urgent Priority</option>
            <option value="HIGH">High Priority</option>
            <option value="MEDIUM">Medium Priority</option>
            <option value="LOW">Low Priority</option>
          </select>

          {/* Category Dropdown */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Categories</option>
            <option value="BILLING">Billing & Store</option>
            <option value="GAMEPLAY">Gameplay & SMP</option>
            <option value="BUG">Technical & Bug</option>
            <option value="ACCOUNT">Account & Link</option>
            <option value="GENERAL">General Support</option>
          </select>

          {(search || statusFilter !== "ALL" || priorityFilter !== "ALL" || categoryFilter !== "ALL") && (
            <button
              onClick={() => {
                setSearch("");
                setStatusFilter("ALL");
                setPriorityFilter("ALL");
                setCategoryFilter("ALL");
              }}
              className="text-xs text-rose-400 hover:underline px-2"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Main Two-Column Support Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[680px]">
        {/* Left Column: Tickets Queue List (5 cols) */}
        <div className="lg:col-span-5 glass-panel rounded-2xl border border-slate-800 bg-slate-950/70 p-4 flex flex-col h-[740px]">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <span className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <span>Ticket Queue</span>
              <span className="px-2 py-0.5 rounded-full bg-slate-900 text-cyan-400 border border-slate-800 text-[10px]">
                {tickets.length}
              </span>
            </span>
            <span className="text-[11px] text-slate-500 font-mono">Sorted by urgency</span>
          </div>

          {loading ? (
            <div className="flex-1 flex items-center justify-center text-slate-500 text-xs">
              <RefreshCw className="w-5 h-5 animate-spin mr-2 text-cyan-400" />
              Loading support tickets...
            </div>
          ) : tickets.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-slate-600 mb-3">
                <CheckCircle2 className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className="text-sm font-bold text-white">All Caught Up!</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-xs">
                No tickets matching your filter criteria. The support inbox is clear.
              </p>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 custom-scrollbar">
              {tickets.map((t) => {
                const isSelected = t.id === selectedTicketId;
                const lastMessage = t.messages?.[t.messages.length - 1];
                const ign = t.user?.minecraftAccounts?.[0]?.username;

                return (
                  <div
                    key={t.id}
                    onClick={() => setSelectedTicketId(t.id)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? "bg-slate-900 border-cyan-500/50 shadow-lg shadow-cyan-950/20"
                        : "bg-slate-950/80 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/50"
                    }`}
                  >
                    {/* Top Row: Category + Priority + Status */}
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-1.5">
                        <span className="flex items-center gap-1 text-[10px] font-bold text-slate-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                          {getCategoryIcon(t.category)}
                          <span>{t.category}</span>
                        </span>
                        <span
                          className={`text-[9px] px-1.5 py-0.5 rounded border uppercase ${getPriorityBadge(
                            t.priority
                          )}`}
                        >
                          {t.priority}
                        </span>
                      </div>

                      <select
                        value={t.status}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleUpdateStatus(t.id, e.target.value);
                        }}
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider bg-transparent cursor-pointer focus:outline-none focus:bg-slate-900 ${getStatusBadge(
                          t.status
                        )}`}
                        title="Change ticket status directly"
                      >
                        <option value="OPEN" className="bg-slate-900 text-emerald-400">OPEN</option>
                        <option value="WAITING_ADMIN" className="bg-slate-900 text-rose-400">NEEDS STAFF</option>
                        <option value="WAITING_USER" className="bg-slate-900 text-cyan-400">WAITING PLAYER</option>
                        <option value="RESOLVED" className="bg-slate-900 text-emerald-300">RESOLVED</option>
                        <option value="CLOSED" className="bg-slate-900 text-slate-400">CLOSED</option>
                      </select>
                    </div>

                    {/* Subject */}
                    <h4 className="text-xs font-bold text-white line-clamp-1 group-hover:text-cyan-400">
                      {t.subject}
                    </h4>

                    {/* Message Preview */}
                    <p className="text-[11px] text-slate-400 line-clamp-2 mt-1">
                      {lastMessage?.content || "No message content"}
                    </p>

                    {/* Footer: User + Date */}
                    <div className="flex items-center justify-between pt-2.5 mt-2 border-t border-slate-800/60 text-[10px] text-slate-400">
                      <div className="flex items-center gap-1.5 truncate max-w-[200px]">
                        {ign ? (
                          <img
                            src={`https://minotar.net/avatar/${ign}/16`}
                            alt={ign}
                            className="w-4 h-4 rounded"
                          />
                        ) : (
                          <User className="w-3.5 h-3.5 text-slate-500" />
                        )}
                        <span className="font-semibold text-slate-300 truncate">
                          {ign || t.user?.name || "Player"}
                        </span>
                      </div>

                      <span className="text-slate-500 font-mono">
                        {new Date(t.updatedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Active Ticket Workspace (7 cols) */}
        <div className="lg:col-span-7 glass-panel rounded-2xl border border-slate-800 bg-slate-950/70 p-5 flex flex-col h-[740px]">
          {selectedTicket ? (
            <div className="flex flex-col h-full">
              {/* Workspace Header */}
              <div className="pb-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      {getCategoryIcon(selectedTicket.category)}
                      <span>{selectedTicket.category}</span>
                    </span>
                    <span className="text-slate-600">•</span>
                    <button
                      onClick={() => handleCopyId(selectedTicket.id)}
                      className="text-[10px] font-mono text-slate-400 hover:text-cyan-400 flex items-center gap-1 bg-slate-900 px-2 py-0.5 rounded border border-slate-800"
                    >
                      {copiedId === selectedTicket.id ? (
                        <>
                          <Check className="w-3 h-3 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>ID: {selectedTicket.id.slice(0, 10)}...</span>
                        </>
                      )}
                    </button>
                  </div>

                  <h2 className="text-lg font-black text-white">{selectedTicket.subject}</h2>
                </div>

                {/* Status & Priority Controls */}
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Status Group */}
                  <div className="flex items-center gap-1.5 bg-slate-900/90 px-2 py-1.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Status:</span>
                    <select
                      value={selectedTicket.status}
                      onChange={(e) => handleUpdateStatus(selectedTicket.id, e.target.value)}
                      className="px-2 py-1 bg-slate-950 border border-slate-700/80 rounded-lg text-xs font-bold text-cyan-400 focus:outline-none cursor-pointer"
                    >
                      <option value="OPEN">Open (Queued)</option>
                      <option value="WAITING_ADMIN">Needs Staff</option>
                      <option value="WAITING_USER">Waiting Player</option>
                      <option value="RESOLVED">Resolved</option>
                      <option value="CLOSED">Closed</option>
                    </select>

                    {selectedTicket.status !== "RESOLVED" && selectedTicket.status !== "CLOSED" ? (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(selectedTicket.id, "RESOLVED")}
                        className="px-2 py-1 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-400 text-[11px] font-bold border border-emerald-500/30 flex items-center gap-1 transition-all cursor-pointer"
                        title="Mark ticket as resolved"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Resolve</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleUpdateStatus(selectedTicket.id, "OPEN")}
                        className="px-2 py-1 rounded-lg bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-400 text-[11px] font-bold border border-cyan-500/30 flex items-center gap-1 transition-all cursor-pointer"
                        title="Reopen ticket"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Reopen</span>
                      </button>
                    )}
                  </div>

                  {/* Priority Changer */}
                  <div className="flex items-center gap-1.5 bg-slate-900/90 px-2 py-1.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Priority:</span>
                    <select
                      value={selectedTicket.priority}
                      onChange={(e) => handleUpdatePriority(selectedTicket.id, e.target.value)}
                      className="px-2 py-1 bg-slate-950 border border-slate-700/80 rounded-lg text-xs font-bold text-amber-400 focus:outline-none cursor-pointer"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                      <option value="URGENT">Urgent</option>
                    </select>
                  </div>

                  <button
                    onClick={() => handleDeleteTicket(selectedTicket.id)}
                    title="Delete ticket"
                    className="p-2.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition-all cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Player Dossier Ribbon */}
              <div className="py-2.5 px-3 bg-slate-900/60 rounded-xl border border-slate-800/80 my-3 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-3">
                  {selectedTicket.user?.minecraftAccounts?.[0]?.username ? (
                    <img
                      src={`https://minotar.net/helm/${selectedTicket.user.minecraftAccounts[0].username}/28`}
                      alt="IGN"
                      className="w-7 h-7 rounded border border-slate-700"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded bg-slate-800 flex items-center justify-center text-slate-400">
                      <User className="w-4 h-4" />
                    </div>
                  )}

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white">{selectedTicket.user?.name}</span>
                      {selectedTicket.user?.minecraftAccounts?.[0]?.username && (
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                          IGN: {selectedTicket.user.minecraftAccounts[0].username}
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-400">{selectedTicket.user?.email}</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-[11px] text-slate-400">
                  <span>
                    Orders:{" "}
                    <strong className="text-cyan-400">
                      {selectedTicket.user?._count?.orders ?? 0}
                    </strong>
                  </span>
                  <span>•</span>
                  <span>
                    Created:{" "}
                    <span className="font-mono text-slate-300">
                      {new Date(selectedTicket.createdAt).toLocaleDateString()}
                    </span>
                  </span>
                </div>
              </div>

              {/* Conversation Messages Thread */}
              <div className="relative flex-1 min-h-0 flex flex-col my-2">
                <div
                  ref={messagesContainerRef}
                  onScroll={handleScroll}
                  className="flex-1 overflow-y-auto space-y-3.5 pr-2 custom-scrollbar"
                >
                  {selectedTicket.messages?.map((msg) => {
                    const isStaff = msg.senderRole === "ADMIN" || msg.senderRole === "SUPERADMIN";

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isStaff ? "items-end" : "items-start"}`}
                      >
                        <div className="flex items-center gap-2 mb-1 text-[11px] text-slate-400">
                          {isStaff ? (
                            <>
                              <span className="font-bold text-emerald-400 flex items-center gap-1 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                                <Shield className="w-3 h-3 text-emerald-400" />
                                <span>{msg.senderName}</span>
                                <span className="text-[9px] bg-emerald-500 text-slate-950 px-1 rounded font-black uppercase">
                                  Staff
                                </span>
                              </span>
                              <span className="text-slate-500 font-mono text-[10px]">
                                {new Date(msg.createdAt).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </>
                          ) : (
                            <>
                              <span className="font-bold text-cyan-400 flex items-center gap-1 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                                <User className="w-3 h-3 text-cyan-400" />
                                <span>{msg.senderName}</span>
                              </span>
                              <span className="text-[9px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-semibold uppercase">
                                Player
                              </span>
                              <span className="text-slate-500 font-mono text-[10px]">
                                {new Date(msg.createdAt).toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </>
                          )}
                        </div>

                        <div
                          className={`max-w-[85%] px-4 py-3 rounded-2xl text-xs leading-relaxed ${
                            isStaff
                              ? "bg-gradient-to-r from-emerald-950/80 to-slate-900 text-emerald-100 border border-emerald-500/40 rounded-tr-xs shadow-lg shadow-black/30"
                              : "bg-[#0b101b] text-slate-200 border border-slate-800 rounded-tl-xs shadow-md shadow-black/40"
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{msg.content}</p>

                          {/* Timestamp and Double Tick for Staff Messages */}
                          <div
                            className={`flex items-center justify-end gap-1.5 mt-1.5 text-[10px] font-mono select-none ${
                              isStaff ? "text-emerald-400/80" : "text-slate-500"
                            }`}
                          >
                            <span>
                              {new Date(msg.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                            {isStaff && (
                              <span title="Delivered to Player" className="flex items-center">
                                <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Player Waiting Indicator */}
                  {selectedTicket.status === "WAITING_ADMIN" && (
                    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-[11px] animate-pulse">
                      <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>Player is waiting for staff reply on this ticket.</span>
                    </div>
                  )}

                  {/* Admin Draft Feedback */}
                  {replyText.trim().length > 0 && (
                    <div className="flex justify-end pt-1">
                      <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-3 py-1 flex items-center gap-1.5 text-[11px] text-emerald-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                        <span>Composing reply to customer...</span>
                      </div>
                    </div>
                  )}
                </div>

                {showScrollBottom && (
                  <button
                    type="button"
                    onClick={() => scrollToBottom(true)}
                    className="absolute bottom-3 right-4 px-3 py-1.5 rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-[11px] shadow-lg shadow-cyan-950/40 flex items-center gap-1.5 transition-all z-10 cursor-pointer"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                    <span>Jump to End</span>
                  </button>
                )}
              </div>

              {/* Staff Response Desk Area */}
              <div className="pt-3 border-t border-slate-800 mt-2 space-y-2.5">
                {/* Canned Macro Quick Selector */}
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                    <Zap className="w-3 h-3 text-amber-400" />
                    <span>Quick Response Macros:</span>
                  </span>

                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        setReplyText(e.target.value);
                      }
                    }}
                    defaultValue=""
                    className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-lg text-[11px] text-slate-300 focus:outline-none focus:border-cyan-500"
                  >
                    <option value="" disabled>
                      Select Canned Template...
                    </option>
                    {CANNED_RESPONSES.map((macro, idx) => (
                      <option key={idx} value={macro.text}>
                        [{macro.category}] {macro.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Response Textarea */}
                <div className="relative">
                  <textarea
                    rows={3}
                    placeholder="Type official support reply to the player..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="w-full p-3 bg-slate-900/90 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 resize-none custom-scrollbar"
                  />
                </div>

                {/* Action Dispatch Buttons */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-400 text-[11px]">Next Status:</span>
                    <select
                      value={replyStatus}
                      onChange={(e) => setReplyStatus(e.target.value)}
                      className="px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-lg text-[11px] font-bold text-cyan-400 focus:outline-none"
                    >
                      <option value="WAITING_USER">Waiting for Player</option>
                      <option value="RESOLVED">Mark as Resolved</option>
                      <option value="OPEN">Keep Open</option>
                      <option value="CLOSED">Close Ticket</option>
                    </select>
                  </div>

                  <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                    <button
                      onClick={() => handleSendReply("RESOLVED")}
                      disabled={sendingReply || !replyText.trim()}
                      className="px-3 py-2 rounded-xl text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500/20 disabled:opacity-50 transition-all"
                    >
                      Reply & Resolve
                    </button>

                    <button
                      onClick={() => handleSendReply()}
                      disabled={sendingReply || !replyText.trim()}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 disabled:opacity-50 transition-all shadow-lg shadow-cyan-900/30"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{sendingReply ? "Sending..." : "Send Reply"}</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 text-slate-500">
              <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800 text-slate-600 mb-3">
                <LifeBuoy className="w-10 h-10 text-cyan-400/50" />
              </div>
              <h3 className="text-sm font-bold text-white">No Ticket Selected</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                Select a support ticket from the queue on the left to view customer details, conversation history, and dispatch staff responses.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
