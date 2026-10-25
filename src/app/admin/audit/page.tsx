"use client";

import { useState, useEffect } from "react";
import { formatDateTime } from "@/lib/utils";
import { Shield, RefreshCw, FileText } from "lucide-react";

export default function AdminAuditPage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLogs = () => {
    setLoading(true);
    fetch("/api/admin/stats")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.recentLogs) setLogs(data.recentLogs);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">
            Security Compliance
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Administrative Audit Trail</h1>
          <p className="text-xs text-slate-400 mt-1">
            Immutable system logs recording administrative interventions, role changes, and delivery re-triggers.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchLogs}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-200 hover:text-white transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-emerald-400" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
        {logs.length === 0 ? (
          <p className="text-xs text-slate-400 py-8 text-center">No audit logs recorded yet.</p>
        ) : (
          <div className="space-y-3">
            {logs.map((log) => (
              <div
                key={log.id}
                className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">
                      {log.action}
                    </span>
                    <span className="text-white font-medium">
                      Target: {log.targetEntity} #{log.targetId}
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px] mt-1 font-sans">
                    Executed by: <span className="text-slate-300">{log.actorEmail || log.actorId}</span>
                  </p>
                  {log.metadata && (
                    <pre className="text-[10px] text-slate-400 bg-slate-900 p-1.5 rounded mt-1 font-mono overflow-x-auto max-w-xl">
                      {log.metadata}
                    </pre>
                  )}
                </div>
                <span className="text-slate-400 font-mono text-[11px] shrink-0">
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
