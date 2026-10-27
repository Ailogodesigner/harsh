"use client";

import { useState, useEffect } from "react";
import { formatDateTime } from "@/lib/utils";
import {
  Shield,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  User,
  Key,
  Ticket,
  ShoppingCart,
  Terminal,
  ChevronLeft,
  ChevronRight,
  Code,
  Layers,
} from "lucide-react";

interface AuditLog {
  id: string;
  actorId: string | null;
  actorEmail: string | null;
  action: string;
  targetEntity: string;
  targetId: string;
  metadata: string | null;
  timestamp: string;
}

const CATEGORIES = [
  { id: "ALL", label: "All Activity", icon: Layers },
  { id: "AUTH", label: "Signups & Logins", icon: Key },
  { id: "TICKETS", label: "Tickets & Support", icon: Ticket },
  { id: "STORE", label: "Orders & Payments", icon: ShoppingCart },
  { id: "ADMIN", label: "Admin & Console", icon: Terminal },
];

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const [category, setCategory] = useState("ALL");
  const [search, setSearch] = useState("");
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

  const fetchLogs = async (targetPage = page) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", targetPage.toString());
      params.set("limit", "40");
      if (category !== "ALL") params.set("category", category);
      if (search.trim()) params.set("search", search.trim());

      const res = await fetch(`/api/admin/audit?${params.toString()}`);
      const data = await res.json();

      if (res.ok && data.logs) {
        setLogs(data.logs);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);
        setPage(data.page || 1);
      }
    } catch (err) {
      console.error("Failed to load audit logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs(1);
  }, [category, search]);

  const getActionBadge = (action: string) => {
    if (action.startsWith("USER_REGISTER") || action === "LINK_MINECRAFT") {
      return "bg-cyan-500/15 text-cyan-300 border-cyan-500/30";
    }
    if (action.startsWith("USER_LOGIN")) {
      return "bg-blue-500/15 text-blue-300 border-blue-500/30";
    }
    if (action.includes("TICKET")) {
      return "bg-emerald-500/15 text-emerald-300 border-emerald-500/30";
    }
    if (action.includes("ORDER") || action.includes("PAYMENT")) {
      return "bg-amber-500/15 text-amber-300 border-amber-500/30";
    }
    if (action.includes("ROLE") || action.includes("DELETE") || action === "SERVER_COMMAND") {
      return "bg-purple-500/15 text-purple-300 border-purple-500/30";
    }
    return "bg-slate-800 text-slate-300 border-slate-700";
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Shield className="w-4 h-4 text-amber-400" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">
              Security Compliance &amp; Owner Audit Trail
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">System Audit &amp; Event Logs</h1>
          <p className="text-xs text-slate-400 mt-1">
            Immutable log recording user registrations, logins, support interactions, order checkouts, and staff actions.
          </p>
        </div>

        <button
          type="button"
          onClick={() => fetchLogs(page)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-200 hover:text-white transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-emerald-400" : ""}`} />
          <span>Refresh Feed</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((cat) => {
            const Icon = cat.icon;
            const active = category === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCategory(cat.id)}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  active
                    ? "bg-amber-400 text-slate-950 shadow-md shadow-amber-500/20"
                    : "bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search email, action, target..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-amber-400 transition-colors"
          />
        </div>
      </div>

      {/* Log Feed Card */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-2xl bg-[#07090e]">
        <div className="px-5 py-3.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="font-bold text-white">Audit Event Feed</span>
            <span className="text-[10px] text-slate-400 font-mono">
              ({total} recorded events in database)
            </span>
          </div>

          <span className="text-[10px] text-slate-500 font-mono">
            Page {page} of {totalPages}
          </span>
        </div>

        <div className="p-4 sm:p-6 space-y-3">
          {loading && logs.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
              <RefreshCw className="w-6 h-6 text-amber-400 animate-spin" />
              <p className="text-xs text-slate-400">Loading audit records...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="py-12 text-center text-slate-400 space-y-2">
              <Shield className="w-8 h-8 text-slate-600 mx-auto" />
              <p className="text-xs font-semibold text-white">No audit logs matching your criteria</p>
              <p className="text-[11px] text-slate-500">
                New user signups, logins, tickets, and store activity will automatically be recorded here.
              </p>
            </div>
          ) : (
            logs.map((log) => {
              const isExpanded = expandedLogId === log.id;
              let prettyMetadata = "";
              if (log.metadata) {
                try {
                  prettyMetadata = JSON.stringify(JSON.parse(log.metadata), null, 2);
                } catch {
                  prettyMetadata = log.metadata;
                }
              }

              return (
                <div
                  key={log.id}
                  className="bg-slate-950/70 p-4 rounded-xl border border-slate-800/80 hover:border-slate-700 transition-colors space-y-2.5"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`font-mono text-xs font-bold px-2.5 py-0.5 rounded-lg border ${getActionBadge(
                          log.action
                        )}`}
                      >
                        {log.action}
                      </span>
                      <span className="text-slate-200 text-xs font-medium">
                        Target: <span className="text-white font-bold">{log.targetEntity}</span>
                        {log.targetId && (
                          <span className="text-slate-400 font-mono text-[11px] ml-1">
                            #{log.targetId.slice(0, 16)}
                          </span>
                        )}
                      </span>
                    </div>

                    <span className="text-slate-400 font-mono text-[11px] shrink-0">
                      {formatDateTime(log.timestamp)}
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
                    <div className="text-slate-400 text-[11px]">
                      Actor:{" "}
                      <span className="text-amber-300 font-medium">
                        {log.actorEmail || log.actorId || "System / Guest"}
                      </span>
                    </div>

                    {prettyMetadata && (
                      <button
                        type="button"
                        onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                        className="text-[10px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 self-start sm:self-auto cursor-pointer"
                      >
                        <Code className="w-3 h-3" />
                        <span>{isExpanded ? "Hide Metadata ▲" : "View Metadata ▼"}</span>
                      </button>
                    )}
                  </div>

                  {isExpanded && prettyMetadata && (
                    <pre className="text-[11px] text-cyan-200 bg-slate-900/90 p-3 rounded-lg font-mono overflow-x-auto border border-slate-800 leading-relaxed">
                      {prettyMetadata}
                    </pre>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Pagination Toolbar */}
        {totalPages > 1 && (
          <div className="px-5 py-3 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-xs">
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => fetchLogs(page - 1)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-40 cursor-pointer"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>

            <span className="text-slate-400 font-mono text-[11px]">
              Page {page} of {totalPages}
            </span>

            <button
              type="button"
              disabled={page >= totalPages || loading}
              onClick={() => fetchLogs(page + 1)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:text-white disabled:opacity-40 cursor-pointer"
            >
              <span>Next</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
