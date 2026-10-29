"use client";

import { useState, useEffect } from "react";
import {
  Server,
  Cpu,
  HardDrive,
  Activity,
  Play,
  RotateCcw,
  Square,
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  Terminal,
  ShieldAlert,
  Wifi,
  Clock,
  Layers,
  Send,
  Zap,
} from "lucide-react";

interface ServerOverview {
  name: string;
  identifier: string;
  node: string;
  isSuspended: boolean;
  limits: {
    memoryMb: number;
    diskMb: number;
    cpuPercentage: number;
  };
}

interface LiveMetrics {
  currentState: "running" | "starting" | "stopping" | "offline" | "unknown";
  isSuspended: boolean;
  cpuPercentage: number;
  memoryBytes: number;
  memoryFormatted: string;
  memoryPercentage: number;
  diskBytes: number;
  diskFormatted: string;
  diskPercentage: number;
  networkRxFormatted: string;
  networkTxFormatted: string;
  uptimeSeconds: number;
  uptimeFormatted: string;
  timestamp: string;
  source: "live" | "cached";
}

export default function AdminHostingDashboard() {
  const [overview, setOverview] = useState<ServerOverview | null>(null);
  const [metrics, setMetrics] = useState<LiveMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshInterval, setRefreshInterval] = useState(3000); // 3s
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [configured, setConfigured] = useState(true);

  // Power action modal state
  const [pendingPowerAction, setPendingPowerAction] = useState<"start" | "restart" | "stop" | "kill" | null>(null);
  const [confirmationInput, setConfirmationInput] = useState("");
  const [actionProcessing, setActionProcessing] = useState(false);

  // Console command state
  const [commandInput, setCommandInput] = useState("");
  const [commandProcessing, setCommandProcessing] = useState(false);
  const [commandHistory, setCommandHistory] = useState<Array<{ command: string; result: string; timestamp: string }>>([]);

  const fetchMetrics = async () => {
    try {
      const res = await fetch("/api/admin/hosting");
      const data = await res.json();
      if (res.ok && data.success) {
        setOverview(data.overview);
        setMetrics(data.metrics);
        setConfigured(true);
      } else {
        if (data.configured === false) {
          setConfigured(false);
        }
      }
    } catch (err: any) {
      console.warn("Failed to poll server metrics:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
    if (refreshInterval <= 0) return;
    const timer = setInterval(fetchMetrics, refreshInterval);
    return () => clearInterval(timer);
  }, [refreshInterval]);

  const handlePowerAction = async () => {
    if (!pendingPowerAction) return;

    setActionProcessing(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/admin/hosting/power", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          signal: pendingPowerAction,
          confirmationChallenge: confirmationInput.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStatusMessage({ text: data.message, type: "success" });
        setPendingPowerAction(null);
        setConfirmationInput("");
        setTimeout(() => fetchMetrics(), 1500);
      } else {
        setStatusMessage({ text: data.error || "Action execution failed", type: "error" });
      }
    } catch (err: any) {
      setStatusMessage({ text: err?.message || "Network error executing power operation", type: "error" });
    } finally {
      setActionProcessing(false);
    }
  };

  const handleDispatchCommand = async (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = commandInput.trim();
    if (!cmd) return;

    setCommandProcessing(true);
    try {
      const res = await fetch("/api/admin/hosting/command", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ command: cmd }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setCommandHistory((prev) => [
          { command: cmd, result: data.message, timestamp: new Date().toLocaleTimeString() },
          ...prev.slice(0, 19),
        ]);
        setCommandInput("");
        setStatusMessage({ text: `Dispatched: ${cmd}`, type: "success" });
      } else {
        setStatusMessage({ text: data.error || "Failed to dispatch command", type: "error" });
      }
    } catch (err: any) {
      setStatusMessage({ text: err?.message || "Network error", type: "error" });
    } finally {
      setCommandProcessing(false);
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };

  const isRunning = metrics?.currentState === "running";
  const isStarting = metrics?.currentState === "starting";
  const isStopping = metrics?.currentState === "stopping";
  const isOffline = metrics?.currentState === "offline" || metrics?.currentState === "unknown";

  const getCpuBadgeColor = (cpu: number) => {
    if (cpu > 85) return "text-rose-400 bg-rose-500/10 border-rose-500/30";
    if (cpu > 65) return "text-amber-400 bg-amber-500/10 border-amber-500/30";
    return "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
  };

  const getRamBadgeColor = (pct: number) => {
    if (pct > 90) return "text-rose-400 bg-rose-500/10 border-rose-500/30";
    if (pct > 75) return "text-amber-400 bg-amber-500/10 border-amber-500/30";
    return "text-emerald-400 bg-emerald-500/10 border-emerald-500/30";
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Top Banner & Control Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white tracking-wide uppercase">
              Hosting &amp; Server Infrastructure
            </h1>
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 font-mono">
              PTERODACTYL 1.X
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Production-grade server telemetry, live resource utilization, and secure state management.
          </p>
        </div>

        {/* Polling interval & Refresh */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs text-slate-300">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-2">Sync:</span>
            <button
              type="button"
              onClick={() => setRefreshInterval(2000)}
              className={`px-2 py-1 rounded-lg font-bold text-[11px] transition-colors cursor-pointer ${
                refreshInterval === 2000 ? "bg-emerald-500 text-slate-950" : "hover:bg-slate-800 text-slate-400"
              }`}
            >
              2s
            </button>
            <button
              type="button"
              onClick={() => setRefreshInterval(5000)}
              className={`px-2 py-1 rounded-lg font-bold text-[11px] transition-colors cursor-pointer ${
                refreshInterval === 5000 ? "bg-emerald-500 text-slate-950" : "hover:bg-slate-800 text-slate-400"
              }`}
            >
              5s
            </button>
            <button
              type="button"
              onClick={() => setRefreshInterval(0)}
              className={`px-2 py-1 rounded-lg font-bold text-[11px] transition-colors cursor-pointer ${
                refreshInterval === 0 ? "bg-amber-500 text-slate-950" : "hover:bg-slate-800 text-slate-400"
              }`}
            >
              Paused
            </button>
          </div>

          <button
            type="button"
            onClick={fetchMetrics}
            disabled={loading}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 text-slate-400 hover:text-white transition-all cursor-pointer"
            title="Manual Telemetry Poll"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-emerald-400" : ""}`} />
          </button>
        </div>
      </div>

      {statusMessage && (
        <div
          className={`p-4 rounded-2xl border text-xs flex items-center justify-between gap-3 shadow-lg ${
            statusMessage.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
              : "bg-rose-500/10 border-rose-500/30 text-rose-300"
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMessage.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
            )}
            <span className="font-semibold">{statusMessage.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setStatusMessage(null)}
            className="text-[11px] underline opacity-80 hover:opacity-100 cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Main Server Overview Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900/60 to-slate-950">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/25">
                <Server className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-white tracking-wide">
                  {overview?.name || "Paid | 16gb harsh bhai"}
                </h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="text-[11px] text-slate-400 font-mono">
                    ID: {overview?.identifier || "7131****"}
                  </span>
                  <span className="text-slate-600">•</span>
                  <span className="text-[11px] text-slate-400">Node: {overview?.node || "Primary Node"}</span>
                </div>
              </div>
            </div>

            {/* Status Pills */}
            <div className="flex items-center gap-2 flex-wrap pt-1">
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                  isRunning
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                    : isStarting
                    ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                    : isStopping
                    ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                    : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    isRunning
                      ? "bg-emerald-400 animate-pulse"
                      : isStarting || isStopping
                      ? "bg-amber-400 animate-spin"
                      : "bg-rose-400"
                  }`}
                />
                {metrics?.currentState?.toUpperCase() || "UNKNOWN"}
              </span>

              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono text-slate-300 bg-slate-900 border border-slate-800">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                Uptime: {metrics?.uptimeFormatted || "0m"}
              </span>

              {metrics?.source === "cached" && (
                <span className="text-[10px] font-mono text-amber-400/90 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md">
                  CACHED TELEMETRY
                </span>
              )}
            </div>
          </div>

          {/* Power Control Buttons */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Start Button */}
            <button
              type="button"
              disabled={isRunning || isStarting || actionProcessing}
              onClick={() => {
                setPendingPowerAction("start");
                setConfirmationInput("");
              }}
              className="px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 disabled:opacity-40 disabled:hover:bg-emerald-500 transition-all shadow-md shadow-emerald-500/20 cursor-pointer"
            >
              <Play className="w-4 h-4" />
              <span>Start</span>
            </button>

            {/* Restart Button */}
            <button
              type="button"
              disabled={isOffline || actionProcessing}
              onClick={() => {
                setPendingPowerAction("restart");
                setConfirmationInput("");
              }}
              className="px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 disabled:opacity-40 transition-all cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Restart</span>
            </button>

            {/* Stop Button */}
            <button
              type="button"
              disabled={isOffline || actionProcessing}
              onClick={() => {
                setPendingPowerAction("stop");
                setConfirmationInput("");
              }}
              className="px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 border border-rose-500/40 disabled:opacity-40 transition-all cursor-pointer"
            >
              <Square className="w-4 h-4" />
              <span>Stop</span>
            </button>

            {/* Kill Button */}
            <button
              type="button"
              disabled={isOffline || actionProcessing}
              onClick={() => {
                setPendingPowerAction("kill");
                setConfirmationInput("");
              }}
              className="px-3.5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-1.5 bg-rose-950/80 hover:bg-rose-900 text-rose-400 border border-rose-800/80 disabled:opacity-40 transition-all cursor-pointer"
              title="Force terminate immediately (Emergency only)"
            >
              <ShieldAlert className="w-4 h-4 text-rose-500" />
              <span>Kill</span>
            </button>
          </div>
        </div>
      </div>

      {/* Telemetry Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* CPU Utilization */}
        <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              CPU Utilization
            </span>
            <div className="p-2 rounded-xl bg-slate-900 text-cyan-400 border border-slate-800">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-white font-mono">
                {metrics?.cpuPercentage || 0}%
              </span>
              <span className="text-[11px] text-slate-400 font-mono">/ 400% (4 Cores)</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-900 border border-slate-800 overflow-hidden mt-2">
              <div
                className="h-full bg-cyan-400 transition-all duration-500 rounded-full"
                style={{ width: `${Math.min(100, (metrics?.cpuPercentage || 0) / 4)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Memory (RAM) */}
        <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Allocated RAM
            </span>
            <div className="p-2 rounded-xl bg-slate-900 text-emerald-400 border border-slate-800">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-emerald-400 font-mono">
                {metrics?.memoryPercentage || 0}%
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                {metrics?.memoryFormatted || "0 GB / 16.0 GB"}
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-900 border border-slate-800 overflow-hidden mt-2">
              <div
                className="h-full bg-emerald-400 transition-all duration-500 rounded-full"
                style={{ width: `${Math.min(100, metrics?.memoryPercentage || 0)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Disk Space */}
        <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              NVMe Disk
            </span>
            <div className="p-2 rounded-xl bg-slate-900 text-purple-400 border border-slate-800">
              <HardDrive className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-black text-purple-400 font-mono">
                {metrics?.diskPercentage || 0}%
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                {metrics?.diskFormatted || "0 GB / 40.0 GB"}
              </span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-900 border border-slate-800 overflow-hidden mt-2">
              <div
                className="h-full bg-purple-400 transition-all duration-500 rounded-full"
                style={{ width: `${Math.min(100, metrics?.diskPercentage || 0)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Network Throughput */}
        <div className="glass-panel p-5 rounded-3xl border border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Network Throughput
            </span>
            <div className="p-2 rounded-xl bg-slate-900 text-amber-400 border border-slate-800">
              <Wifi className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-xs font-mono text-slate-200">
              <span className="text-slate-400">In (RX):</span>{" "}
              <strong className="text-white font-bold">{metrics?.networkRxFormatted || "0 MB"}</strong>
            </div>
            <div className="text-xs font-mono text-slate-200 mt-1">
              <span className="text-slate-400">Out (TX):</span>{" "}
              <strong className="text-white font-bold">{metrics?.networkTxFormatted || "0 MB"}</strong>
            </div>
            <div className="text-[10px] text-slate-500 font-mono mt-2">
              Total session traffic
            </div>
          </div>
        </div>
      </div>

      {/* Console Dispatch Box */}
      <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden shadow-2xl bg-[#07090e]">
        <div className="px-6 py-4 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-white text-sm">Dedicated Web Server Console</h3>
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            Filtered execution &amp; command auditing active
          </span>
        </div>

        {/* Quick Action Presets */}
        <div className="p-5 border-b border-slate-800/80 space-y-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">
              Quick Actions:
            </span>
            {[
              "list",
              "tps",
              "save-all",
              "whitelist on",
              "whitelist off",
              "playtime top",
              "spark tps",
            ].map((cmd) => (
              <button
                key={cmd}
                type="button"
                onClick={() => setCommandInput(cmd)}
                className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 font-mono text-[11px] border border-slate-800 transition-colors cursor-pointer"
              >
                /{cmd}
              </button>
            ))}
          </div>

          <form onSubmit={handleDispatchCommand} className="flex gap-2">
            <input
              type="text"
              placeholder="Enter server command (e.g. say Maintenance in 5 minutes)..."
              value={commandInput}
              onChange={(e) => setCommandInput(e.target.value)}
              className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-emerald-500 transition-colors"
            />
            <button
              type="submit"
              disabled={commandProcessing || !commandInput.trim()}
              className="px-5 py-2.5 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center gap-2 disabled:opacity-40 shadow-md shadow-emerald-500/20 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Execute</span>
            </button>
          </form>
        </div>

        {/* Command Activity Log */}
        <div className="p-5 space-y-2 max-h-48 overflow-y-auto font-mono text-xs text-slate-300">
          {commandHistory.length === 0 ? (
            <p className="text-[11px] text-slate-500 italic">No console commands executed this session.</p>
          ) : (
            commandHistory.map((item, idx) => (
              <div key={idx} className="flex items-start gap-3 py-1 border-b border-slate-900/60 last:border-0">
                <span className="text-slate-500 text-[10px]">[{item.timestamp}]</span>
                <span className="text-amber-400 font-bold">&gt; {item.command}</span>
                <span className="text-emerald-400 text-[11px]">• {item.result}</span>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Safety Confirmation Modal for Destructive Operations */}
      {pendingPowerAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="glass-panel max-w-md w-full p-6 rounded-3xl border border-slate-800 space-y-5 bg-slate-950 shadow-2xl">
            <div className="flex items-center gap-3">
              <div
                className={`p-3 rounded-2xl border ${
                  pendingPowerAction === "stop" || pendingPowerAction === "kill"
                    ? "bg-rose-500/10 text-rose-400 border-rose-500/30"
                    : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                }`}
              >
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-black text-base text-white uppercase tracking-wide">
                  Confirm Server {pendingPowerAction.toUpperCase()}
                </h3>
                <p className="text-xs text-slate-400">Target: {overview?.name || "Harsh Unlimited"}</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {pendingPowerAction === "restart"
                ? "This will restart the Paper Minecraft instance. Connected players will be disconnected and will reconnect once the server reboots."
                : pendingPowerAction === "stop"
                ? "This will gracefully stop the Minecraft server process. Players will be kicked to the fallback lobby or disconnected."
                : pendingPowerAction === "kill"
                ? "EMERGENCY ACTION: Immediately terminates the server process. Unsaved chunk and inventory changes may be lost. Use only if server is locked or unresponsive."
                : "Proceed with server state transition."}
            </p>

            {(pendingPowerAction === "stop" || pendingPowerAction === "kill") && (
              <div className="space-y-1.5 pt-2">
                <label className="text-[11px] font-bold text-rose-300 block">
                  Type <span className="font-mono bg-rose-950/80 px-1 py-0.5 rounded text-white">CONFIRM_SHUTDOWN</span> to authorize:
                </label>
                <input
                  type="text"
                  placeholder="CONFIRM_SHUTDOWN"
                  value={confirmationInput}
                  onChange={(e) => setConfirmationInput(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2 text-xs font-mono text-white focus:outline-none focus:border-rose-500"
                />
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-900">
              <button
                type="button"
                onClick={() => {
                  setPendingPowerAction(null);
                  setConfirmationInput("");
                }}
                disabled={actionProcessing}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handlePowerAction}
                disabled={
                  actionProcessing ||
                  ((pendingPowerAction === "stop" || pendingPowerAction === "kill") &&
                    confirmationInput.trim() !== "CONFIRM_SHUTDOWN")
                }
                className={`px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all disabled:opacity-40 cursor-pointer ${
                  pendingPowerAction === "kill" || pendingPowerAction === "stop"
                    ? "bg-rose-500 hover:bg-rose-400 text-white shadow-lg shadow-rose-500/20"
                    : "bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/20"
                }`}
              >
                {actionProcessing ? "Processing..." : `Confirm ${pendingPowerAction}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
