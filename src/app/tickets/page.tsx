"use client";

import { useState, useEffect } from "react";
import NextLink from "next/link";
import { useRouter } from "next/navigation";
import {
  LifeBuoy,
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  ArrowRight,
  RefreshCw,
  Search,
  Filter,
  User,
  Shield,
  HelpCircle,
} from "lucide-react";

interface TicketMessage {
  id: string;
  senderName: string;
  senderRole: string;
  content: string;
  createdAt: string;
}

interface Ticket {
  id: string;
  subject: string;
  category: string;
  priority: string;
  status: "OPEN" | "WAITING_ADMIN" | "WAITING_USER" | "RESOLVED" | "CLOSED";
  createdAt: string;
  updatedAt: string;
  messages: TicketMessage[];
}

export default function TicketsOverviewPage() {
  const router = useRouter();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");

  // New ticket modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("GENERAL");
  const [priority, setPriority] = useState<"LOW" | "MEDIUM" | "HIGH" | "URGENT">("MEDIUM");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/tickets", { cache: "no-store" });
      if (res.status === 401) {
        router.push("/login?redirect=/tickets");
        return;
      }
      const data = await res.json();
      if (res.ok && data.tickets) {
        setTickets(data.tickets);
      } else {
        setError(data.error || "Failed to load tickets");
      }
    } catch {
      setError("Network error loading tickets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: subject.trim(),
          category,
          priority,
          message: message.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setSubmitError(data.error || "Failed to create ticket");
        setSubmitting(false);
        return;
      }

      setModalOpen(false);
      setSubject("");
      setMessage("");
      fetchTickets();
      if (data.ticket?.id) {
        router.push(`/tickets/${data.ticket.id}`);
      }
    } catch {
      setSubmitError("Network error creating ticket");
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "WAITING_USER":
        return {
          label: "Staff Replied",
          className: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30 font-bold animate-pulse",
        };
      case "WAITING_ADMIN":
        return {
          label: "Under Review",
          className: "bg-amber-500/15 text-amber-400 border-amber-500/30 font-semibold",
        };
      case "OPEN":
        return {
          label: "Open (Queued)",
          className: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
        };
      case "RESOLVED":
        return {
          label: "Resolved",
          className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        };
      case "CLOSED":
        return {
          label: "Closed",
          className: "bg-slate-800 text-slate-400 border-slate-700",
        };
      default:
        return {
          label: status,
          className: "bg-slate-800 text-slate-300 border-slate-700",
        };
    }
  };

  const filteredTickets = tickets.filter((t) => {
    const matchesStatus =
      statusFilter === "ALL" ||
      (statusFilter === "OPEN" && ["OPEN", "WAITING_ADMIN", "WAITING_USER"].includes(t.status)) ||
      (statusFilter === "RESOLVED" && t.status === "RESOLVED") ||
      (statusFilter === "CLOSED" && t.status === "CLOSED");

    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      t.subject.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q) ||
      t.id.toLowerCase().includes(q);

    return matchesStatus && matchesSearch;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
            Player Support Center
          </span>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight flex items-center gap-3">
            <LifeBuoy className="w-8 h-8 text-emerald-400" />
            <span>Support Tickets</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Track inquiries, payment verification, bug reports, and converse directly with server staff.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setModalOpen(true)}
          className="px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          <span>New Support Ticket</span>
        </button>
      </div>

      {/* KPI Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-2xl border border-slate-800">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Total Tickets</span>
          <p className="text-2xl font-black text-white mt-1">{tickets.length}</p>
        </div>
        <div className="glass-panel p-4 rounded-2xl border border-slate-800">
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Active Inquiries</span>
          <p className="text-2xl font-black text-emerald-400 mt-1">
            {tickets.filter((t) => ["OPEN", "WAITING_ADMIN", "WAITING_USER"].includes(t.status)).length}
          </p>
        </div>
        <div className="glass-panel p-4 rounded-2xl border border-slate-800">
          <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-wider">Resolved</span>
          <p className="text-2xl font-black text-cyan-400 mt-1">
            {tickets.filter((t) => t.status === "RESOLVED").length}
          </p>
        </div>
        <div className="glass-panel p-4 rounded-2xl border border-slate-800">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Closed</span>
          <p className="text-2xl font-black text-slate-400 mt-1">
            {tickets.filter((t) => t.status === "CLOSED").length}
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
          {[
            { id: "ALL", label: "All Tickets" },
            { id: "OPEN", label: "Active" },
            { id: "RESOLVED", label: "Resolved" },
            { id: "CLOSED", label: "Closed" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                statusFilter === tab.id
                  ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                  : "bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search tickets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Tickets List */}
      {loading ? (
        <div className="p-12 text-center text-slate-400 space-y-3">
          <RefreshCw className="w-6 h-6 animate-spin text-emerald-400 mx-auto" />
          <p className="text-xs">Loading support tickets...</p>
        </div>
      ) : filteredTickets.length === 0 ? (
        <div className="glass-panel p-12 rounded-2xl border border-slate-800 text-center space-y-3">
          <LifeBuoy className="w-10 h-10 text-slate-600 mx-auto" />
          <h3 className="text-base font-bold text-white">No tickets found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {tickets.length === 0
              ? "You do not have any open tickets. If you need assistance with rank delivery, store purchases, or land protection, open a ticket."
              : "No tickets match your filter criteria."}
          </p>
          <button
            type="button"
            onClick={() => setModalOpen(true)}
            className="mt-3 px-4 py-2 rounded-xl bg-emerald-500 text-slate-950 font-bold text-xs inline-flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Open Ticket</span>
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTickets.map((t) => {
            const badge = getStatusBadge(t.status);
            const lastMessage = t.messages?.[t.messages.length - 1];

            return (
              <NextLink
                key={t.id}
                href={`/tickets/${t.id}`}
                className="glass-panel p-5 rounded-2xl border border-slate-800/80 hover:border-emerald-500/40 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 group block cursor-pointer"
              >
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                      #{t.id.slice(0, 8)}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800">
                      {t.category}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase tracking-wider ${badge.className}`}>
                      {badge.label}
                    </span>
                  </div>

                  <h3 className="font-bold text-white text-sm sm:text-base group-hover:text-emerald-400 transition-colors truncate">
                    {t.subject}
                  </h3>

                  {lastMessage && (
                    <p className="text-xs text-slate-400 line-clamp-1">
                      <span className="text-slate-500 font-semibold">{lastMessage.senderName}:</span> {lastMessage.content}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-400 shrink-0">
                  <div className="flex items-center gap-1">
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>{t.messages?.length || 0} messages</span>
                  </div>
                  <div className="flex items-center gap-1 font-mono text-[11px]">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{new Date(t.updatedAt).toLocaleDateString()}</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-emerald-400 group-hover:translate-x-0.5 transition-all" />
                </div>
              </NextLink>
            );
          })}
        </div>
      )}

      {/* New Ticket Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800 max-w-lg w-full space-y-5 bg-slate-950 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <LifeBuoy className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Create Support Ticket</h3>
                  <p className="text-xs text-slate-400">Our team typically responds within a few hours.</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-white text-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            {submitError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{submitError}</span>
              </div>
            )}

            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Subject / Summary <span className="text-emerald-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Question regarding rank delivery or coins"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="GENERAL">General Support</option>
                    <option value="BILLING">Billing &amp; Store</option>
                    <option value="BUG">Bug Report</option>
                    <option value="APPEAL">Ban / Mute Appeal</option>
                    <option value="GAMEPLAY">Gameplay Help</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Detailed Message <span className="text-emerald-400">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="Explain your inquiry in detail, including in-game coordinates, transaction IDs, or error codes..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 hover:text-white cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider disabled:opacity-50 cursor-pointer flex items-center gap-1.5"
                >
                  {submitting ? "Submitting..." : "Submit Ticket"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
