"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import NextLink from "next/link";
import {
  LifeBuoy,
  Send,
  Shield,
  User,
  ArrowLeft,
  Clock,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  MessageSquare,
  Lock,
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

interface Ticket {
  id: string;
  userId: string;
  subject: string;
  category: string;
  priority: string;
  status: "OPEN" | "WAITING_ADMIN" | "WAITING_USER" | "RESOLVED" | "CLOSED";
  createdAt: string;
  updatedAt: string;
  messages: TicketMessage[];
}

export default function PlayerTicketDetailPage() {
  const params = useParams();
  const router = useRouter();
  const ticketId = params.id as string;

  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [replyMessage, setReplyMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showScrollBottom, setShowScrollBottom] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [statusActionMsg, setStatusActionMsg] = useState<string | null>(null);

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

  const fetchTicket = async () => {
    try {
      const res = await fetch(`/api/tickets/${ticketId}`);
      const data = await res.json();

      if (!res.ok) {
        if (res.status === 401) {
          router.push(`/login?redirect=/tickets/${ticketId}`);
          return;
        }
        setError(data.error || "Failed to load ticket");
        return;
      }

      setTicket(data.ticket);
    } catch {
      setError("Network error loading ticket details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTicket();
  }, [ticketId]);

  // Scroll ONLY the inner message list to bottom on load without scrolling the browser window
  useEffect(() => {
    if (ticket?.id && messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop = messagesContainerRef.current.scrollHeight;
    }
  }, [ticket?.id]);

  const handleCopyId = () => {
    if (!ticket) return;
    navigator.clipboard.writeText(ticket.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleUpdateStatus = async (newStatus: string) => {
    if (updatingStatus || !ticket) return;
    setUpdatingStatus(true);
    setError(null);

    try {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to update ticket status");
        return;
      }

      if (data.ticket) {
        setTicket(data.ticket);
      } else {
        fetchTicket();
      }

      setStatusActionMsg(`Ticket status updated to ${newStatus.replace("_", " ")}`);
      setTimeout(() => setStatusActionMsg(null), 3500);
      setTimeout(() => scrollToBottom(true), 50);
    } catch {
      setError("Network error updating ticket status.");
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleSendReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMessage.trim() || sending) return;

    setSending(true);
    setError(null);

    try {
      const res = await fetch(`/api/tickets/${ticketId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: replyMessage.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Failed to submit reply");
        return;
      }

      setReplyMessage("");
      setSendSuccess(true);
      setTimeout(() => setSendSuccess(false), 3000);

      // Update state with new message & status
      if (data.ticket) {
        setTicket(data.ticket);
        setTimeout(() => scrollToBottom(true), 50);
      } else {
        fetchTicket();
      }
    } catch {
      setError("An unexpected network error occurred.");
    } finally {
      setSending(false);
    }
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case "WAITING_USER":
        return {
          label: "Staff Replied • Awaiting Your Response",
          color: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30 animate-pulse font-bold",
        };
      case "WAITING_ADMIN":
        return {
          label: "Under Review by Staff",
          color: "bg-amber-500/15 text-amber-400 border-amber-500/30 font-semibold",
        };
      case "OPEN":
        return {
          label: "Open • Queued for Support",
          color: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
        };
      case "RESOLVED":
        return {
          label: "Resolved",
          color: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
        };
      case "CLOSED":
        return {
          label: "Closed",
          color: "bg-slate-800 text-slate-400 border-slate-700",
        };
      default:
        return {
          label: status,
          color: "bg-slate-800 text-slate-300",
        };
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center text-center p-6 space-y-3">
        <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
        <p className="text-sm font-semibold text-white">Loading your support ticket...</p>
        <p className="text-xs text-slate-500">Retrieving encrypted conversation thread</p>
      </div>
    );
  }

  if (error || !ticket) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400 inline-block">
          <AlertCircle className="w-10 h-10 mx-auto" />
        </div>
        <h2 className="text-xl font-bold text-white">Ticket Unavailable</h2>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          {error || "We could not locate this support ticket or you do not have permission to access it."}
        </p>
        <div className="pt-4 flex items-center justify-center gap-3">
          <NextLink
            href="/dashboard"
            className="px-5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-bold text-white hover:bg-slate-800"
          >
            ← Back to Dashboard
          </NextLink>
          <NextLink
            href="/support"
            className="px-5 py-2.5 rounded-xl bg-emerald-500 text-slate-950 text-xs font-bold hover:bg-emerald-400"
          >
            Support Center
          </NextLink>
        </div>
      </div>
    );
  }

  const statusInfo = getStatusDisplay(ticket.status);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      {/* Top Breadcrumb & Return Link */}
      <div className="flex items-center justify-between">
        <NextLink
          href="/dashboard"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Customer Dashboard</span>
        </NextLink>

        <button
          onClick={fetchTicket}
          className="text-xs text-slate-400 hover:text-cyan-400 flex items-center gap-1.5 transition-colors"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh</span>
        </button>
      </div>

      {/* Status Notification Alert */}
      {statusActionMsg && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center justify-between shadow-lg shadow-emerald-950/20">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{statusActionMsg}</span>
          </div>
          <button
            onClick={() => setStatusActionMsg(null)}
            className="text-emerald-400 hover:text-white text-xs px-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Ticket Header Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-4 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                {ticket.category}
              </span>
              <span className="text-slate-600">•</span>
              <button
                onClick={handleCopyId}
                className="text-[10px] font-mono text-slate-400 hover:text-cyan-400 flex items-center gap-1 bg-slate-900 px-2 py-0.5 rounded border border-slate-800"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>ID: {ticket.id.slice(0, 12)}...</span>
                  </>
                )}
              </button>
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-white">{ticket.subject}</h1>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-2.5">
            <span
              className={`inline-block px-3 py-1.5 rounded-xl text-xs uppercase tracking-wider border ${statusInfo.color}`}
            >
              {statusInfo.label}
            </span>

            {/* Quick Status Action Controls */}
            <div className="flex items-center gap-2">
              {ticket.status !== "RESOLVED" && ticket.status !== "CLOSED" ? (
                <>
                  <button
                    type="button"
                    disabled={updatingStatus}
                    onClick={() => handleUpdateStatus("RESOLVED")}
                    className="px-3 py-1.5 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/30 text-emerald-400 text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-sm"
                    title="Mark your issue as resolved"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>{updatingStatus ? "Updating..." : "Mark Resolved"}</span>
                  </button>

                  <button
                    type="button"
                    disabled={updatingStatus}
                    onClick={() => handleUpdateStatus("CLOSED")}
                    className="px-2.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-400 hover:text-white text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
                    title="Close ticket"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Close</span>
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  disabled={updatingStatus}
                  onClick={() => handleUpdateStatus("OPEN")}
                  className="px-3.5 py-1.5 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-400 text-xs font-bold transition-all flex items-center gap-1.5 disabled:opacity-50 cursor-pointer shadow-sm"
                  title="Reopen ticket to continue discussion"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${updatingStatus ? "animate-spin" : ""}`} />
                  <span>{updatingStatus ? "Reopening..." : "Reopen Ticket"}</span>
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-slate-500" />
              <span>Created {new Date(ticket.createdAt).toLocaleDateString()}</span>
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
              <span>{ticket.messages.length} Messages in Discussion</span>
            </span>
          </div>

          <span className="text-[11px] text-slate-500 font-mono">
            Direct Staff Assistance Channel
          </span>
        </div>
      </div>

      {/* Messages Thread */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-4 shadow-xl">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-400 pb-2 border-b border-slate-800">
          Conversation History
        </h3>

        <div className="relative">
          <div
            ref={messagesContainerRef}
            onScroll={handleScroll}
            className="space-y-4 max-h-[520px] overflow-y-auto pr-2 custom-scrollbar py-2"
          >
            {ticket.messages.map((msg) => {
              const isStaff = msg.senderRole === "ADMIN" || msg.senderRole === "SUPERADMIN";

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isStaff ? "items-start" : "items-end"}`}
                >
                  {/* Message Header */}
                  <div className="flex items-center gap-2 mb-1.5 text-xs">
                    {isStaff ? (
                      <>
                        <div className="flex items-center gap-1.5 font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          <Shield className="w-3.5 h-3.5 text-emerald-400" />
                          <span>{msg.senderName}</span>
                          <span className="text-[9px] bg-emerald-500 text-slate-950 px-1 rounded uppercase font-black">
                            STAFF
                          </span>
                        </div>
                        <span className="text-slate-500 font-mono text-[10px]">
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-slate-500 font-mono text-[10px]">
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                        <div className="flex items-center gap-1 font-bold text-slate-300">
                          <User className="w-3 h-3 text-slate-400" />
                          <span>You</span>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Message Body */}
                  <div
                    className={`max-w-[85%] p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      isStaff
                        ? "bg-emerald-950/40 text-emerald-100 border border-emerald-500/30 rounded-tl-none shadow-md shadow-emerald-950/20"
                        : "bg-slate-900 text-slate-200 border border-slate-800 rounded-tr-none"
                    }`}
                  >
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {showScrollBottom && (
            <button
              type="button"
              onClick={() => scrollToBottom(true)}
              className="absolute bottom-4 right-4 px-3 py-1.5 rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-[11px] shadow-lg shadow-cyan-950/40 flex items-center gap-1.5 transition-all z-10 cursor-pointer"
            >
              <ChevronDown className="w-3.5 h-3.5" />
              <span>Jump to End</span>
            </button>
          )}
        </div>

        {/* Member Reply Box */}
        <div className="pt-4 border-t border-slate-800">
          {ticket.status === "CLOSED" ? (
            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 text-center space-y-3">
              <Lock className="w-5 h-5 text-slate-500 mx-auto" />
              <p className="text-xs text-slate-300 font-semibold">
                This support ticket has been closed.
              </p>
              <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                Need to continue this conversation? You can reopen this ticket or open a new one.
              </p>
              <div className="flex items-center justify-center gap-3 pt-1">
                <button
                  type="button"
                  disabled={updatingStatus}
                  onClick={() => handleUpdateStatus("OPEN")}
                  className="px-4 py-2 rounded-xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-500/30 text-cyan-400 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${updatingStatus ? "animate-spin" : ""}`} />
                  <span>{updatingStatus ? "Reopening..." : "Reopen This Ticket"}</span>
                </button>
                <NextLink
                  href="/support"
                  className="px-4 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-bold hover:bg-slate-800 transition-all"
                >
                  Create New Ticket
                </NextLink>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSendReply} className="space-y-3">
              {sendSuccess && (
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Your reply has been delivered to the support team!</span>
                </div>
              )}

              {error && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-semibold">
                  {error}
                </div>
              )}

              <div className="relative">
                <textarea
                  rows={3}
                  required
                  placeholder="Type your response to the support team..."
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  className="w-full p-4 bg-slate-950 border border-slate-800 rounded-2xl text-xs sm:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-colors resize-none custom-scrollbar"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
                <p className="text-[11px] text-slate-500">
                  Staff typically review follow-ups within 2 to 12 hours.
                </p>

                <button
                  type="submit"
                  disabled={sending || !replyMessage.trim()}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-emerald-400 hover:from-cyan-300 hover:to-emerald-300 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-cyan-900/20 cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{sending ? "Sending Reply..." : "Send Reply to Staff"}</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
