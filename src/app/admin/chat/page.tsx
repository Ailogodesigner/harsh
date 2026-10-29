"use client";

import { useState, useEffect, useRef } from "react";
import {
  MessageSquare,
  Terminal,
  Send,
  RefreshCw,
  Search,
  ShieldAlert,
  Users,
  Radio,
  Sparkles,
  Zap,
  Volume2,
  VolumeX,
  Play,
  Pause,
  AlertCircle,
  CheckCircle2,
  ArrowDown,
  Megaphone,
} from "lucide-react";

interface RankInfo {
  rank: string;
  color: string;
  border: string;
  isDonorOrStaff: boolean;
}

interface ChatEntry {
  id: string;
  timestamp: string;
  type: "CHAT" | "COMMAND" | "JOIN" | "LEAVE" | "ADVANCEMENT" | "BROADCAST" | "SYSTEM";
  player: string | null;
  rankInfo: RankInfo | null;
  message: string;
  raw: string;
}

export default function AdminLiveChatPage() {
  const [entries, setEntries] = useState<ChatEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [autoRefreshInterval, setAutoRefreshInterval] = useState<number>(3000); // 3 seconds
  const [autoScroll, setAutoScroll] = useState(true);

  // Message dispatch state
  const [inputMessage, setInputMessage] = useState("");
  const [dispatchMode, setDispatchMode] = useState<"say" | "broadcast" | "command">("say");
  const [dispatching, setDispatching] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; success: boolean } | null>(null);
  const [panelWarning, setPanelWarning] = useState<string | null>(null);

  const chatContainerRef = useRef<HTMLDivElement>(null);

  const fetchChatLogs = async () => {
    try {
      const res = await fetch("/api/admin/chat");
      const data = await res.json();
      if (res.ok) {
        if (Array.isArray(data?.entries) && data.entries.length > 0) {
          setEntries(data.entries);
        }
        if (data?.warning) {
          setPanelWarning(data.warning);
        } else {
          setPanelWarning(null);
        }
      } else {
        if (data?.error) {
          setPanelWarning(data.error);
        }
      }
    } catch (err: any) {
      console.error("Failed to poll chat logs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChatLogs();
    if (autoRefreshInterval <= 0) return;

    const interval = setInterval(fetchChatLogs, autoRefreshInterval);
    return () => clearInterval(interval);
  }, [autoRefreshInterval]);

  // Auto scroll to bottom on new entries if enabled
  useEffect(() => {
    if (autoScroll && chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [entries, autoScroll]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    setDispatching(true);
    setStatusMessage(null);

    try {
      const res = await fetch("/api/admin/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: inputMessage.trim(),
          actionType: dispatchMode,
        }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStatusMessage({ text: "Message sent into server!", success: true });
        setInputMessage("");
        setTimeout(() => fetchChatLogs(), 800);
      } else {
        setStatusMessage({ text: data.error || "Failed to dispatch", success: false });
      }
    } catch (err: any) {
      setStatusMessage({ text: err?.message || "Network error", success: false });
    } finally {
      setDispatching(false);
      setTimeout(() => setStatusMessage(null), 4000);
    }
  };

  // Quick preset actions
  const handleQuickCommand = (cmd: string, mode: "say" | "broadcast" | "command") => {
    setInputMessage(cmd);
    setDispatchMode(mode);
  };

  // Filter entries
  const filteredEntries = entries.filter((e) => {
    const matchesType =
      filterType === "ALL" ||
      (filterType === "CHAT" && e.type === "CHAT") ||
      (filterType === "COMMAND" && e.type === "COMMAND") ||
      (filterType === "JOINS" && (e.type === "JOIN" || e.type === "LEAVE")) ||
      (filterType === "BROADCAST" && e.type === "BROADCAST");

    const matchesSearch =
      searchQuery.trim() === "" ||
      (e.player && e.player.toLowerCase().includes(searchQuery.toLowerCase())) ||
      e.message.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesType && matchesSearch;
  });

  const chatCount = entries.filter((e) => e.type === "CHAT").length;
  const cmdCount = entries.filter((e) => e.type === "COMMAND").length;
  const joinCount = entries.filter((e) => e.type === "JOIN" || e.type === "LEAVE").length;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white tracking-wide uppercase">
              Live Server Chat &amp; Console
            </h1>
            <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              LIVE STREAM
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time in-game player chat monitoring, command auditing, and direct web-to-server messaging.
          </p>
        </div>

        {/* Polling & Refresh Controls */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1 text-xs text-slate-300">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 px-2">
              Sync:
            </span>
            <button
              type="button"
              onClick={() => setAutoRefreshInterval(2000)}
              className={`px-2 py-1 rounded-lg font-bold text-[11px] transition-colors cursor-pointer ${
                autoRefreshInterval === 2000
                  ? "bg-emerald-500 text-slate-950"
                  : "hover:bg-slate-800 text-slate-400"
              }`}
            >
              2s
            </button>
            <button
              type="button"
              onClick={() => setAutoRefreshInterval(5000)}
              className={`px-2 py-1 rounded-lg font-bold text-[11px] transition-colors cursor-pointer ${
                autoRefreshInterval === 5000
                  ? "bg-emerald-500 text-slate-950"
                  : "hover:bg-slate-800 text-slate-400"
              }`}
            >
              5s
            </button>
            <button
              type="button"
              onClick={() => setAutoRefreshInterval(0)}
              className={`px-2 py-1 rounded-lg font-bold text-[11px] transition-colors cursor-pointer ${
                autoRefreshInterval === 0
                  ? "bg-amber-500 text-slate-950"
                  : "hover:bg-slate-800 text-slate-400"
              }`}
            >
              Paused
            </button>
          </div>

          <button
            type="button"
            onClick={fetchChatLogs}
            disabled={loading}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-emerald-500/40 text-slate-400 hover:text-white transition-all cursor-pointer"
            title="Manual Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin text-emerald-400" : ""}`} />
          </button>
        </div>
      </div>

      {/* Summary KPI Counters */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Total Log Entries
            </div>
            <div className="text-xl font-black text-white font-mono mt-0.5">{entries.length}</div>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
            <Radio className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Player Chats
            </div>
            <div className="text-xl font-black text-emerald-400 font-mono mt-0.5">{chatCount}</div>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
            <MessageSquare className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Commands Executed
            </div>
            <div className="text-xl font-black text-amber-400 font-mono mt-0.5">{cmdCount}</div>
          </div>
          <div className="p-2.5 rounded-xl bg-amber-500/10 text-amber-400">
            <Zap className="w-5 h-5" />
          </div>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Joins &amp; Leaves
            </div>
            <div className="text-xl font-black text-cyan-400 font-mono mt-0.5">{joinCount}</div>
          </div>
          <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400">
            <Users className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 flex-wrap w-full sm:w-auto">
          {[
            { id: "ALL", label: "All Activity" },
            { id: "CHAT", label: "💬 Player Chat" },
            { id: "COMMAND", label: "⚡ Commands" },
            { id: "JOINS", label: "🚪 Joins/Leaves" },
            { id: "BROADCAST", label: "📣 Broadcasts" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilterType(tab.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterType === tab.id
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
            placeholder="Search player or message..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>
      </div>

      {panelWarning && (
        <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/25 text-amber-300 text-xs flex items-center justify-between gap-3 shadow-lg">
          <div className="flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
            <span className="font-medium">{panelWarning}</span>
          </div>
          <button
            type="button"
            onClick={() => fetchChatLogs()}
            className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[11px] font-semibold shrink-0"
          >
            Retry Poll
          </button>
        </div>
      )}

      {/* Live Chat & Console Stream Box */}
      <div className="glass-panel rounded-3xl border border-slate-800 overflow-hidden shadow-2xl flex flex-col bg-[#07090e]">
        {/* Stream Top Toolbar */}
        <div className="px-5 py-3.5 bg-slate-950/80 border-b border-slate-800 flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <span className="font-bold text-white">In-Game Server Feed</span>
            <span className="text-[10px] text-slate-400 font-mono">
              ({filteredEntries.length} items shown)
            </span>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-1.5 cursor-pointer text-slate-400 hover:text-white text-xs select-none">
              <input
                type="checkbox"
                checked={autoScroll}
                onChange={(e) => setAutoScroll(e.target.checked)}
                className="rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-0"
              />
              <span>Auto-scroll</span>
            </label>
          </div>
        </div>

        {/* Scrollable Chat Area */}
        <div
          ref={chatContainerRef}
          className="h-[480px] overflow-y-auto p-4 sm:p-6 space-y-2.5 font-sans divide-y divide-slate-800/40"
        >
          {filteredEntries.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 text-slate-400 space-y-2">
              <MessageSquare className="w-8 h-8 text-slate-600" />
              <p className="text-xs">No matching log entries found.</p>
              <p className="text-[11px] text-slate-500">
                New in-game chats and player actions will appear here automatically.
              </p>
            </div>
          ) : (
            filteredEntries.map((item) => {
              const rank = item.rankInfo?.rank || "MEMBER";
              const rankColor = item.rankInfo?.color || "text-slate-400 bg-slate-800/80";
              const rankBorder = item.rankInfo?.border || "border-slate-700/80";

              return (
                <div
                  key={item.id}
                  className="pt-2.5 first:pt-0 flex items-start justify-between gap-3 group text-xs hover:bg-slate-900/30 px-2 py-1.5 rounded-xl transition-colors"
                >
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    {/* Timestamp */}
                    <span className="font-mono text-[11px] text-slate-500 shrink-0 pt-0.5">
                      [{item.timestamp || "Live"}]
                    </span>

                    {/* Entry Content by Type */}
                    {item.type === "CHAT" ? (
                      <div className="flex items-start gap-2 min-w-0 flex-1 flex-wrap">
                        {item.player && (
                          <div className="flex items-center gap-1.5 shrink-0">
                            <img
                              src={`https://mc-heads.net/avatar/${item.player}/20`}
                              alt={item.player}
                              className="w-4 h-4 rounded-sm bg-slate-900 border border-slate-700"
                            />
                            <span className="font-bold text-white">{item.player}</span>
                            <span
                              className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${rankColor} ${rankBorder}`}
                            >
                              {rank}
                            </span>
                            <span className="text-slate-400">:</span>
                          </div>
                        )}
                        <span className="text-slate-200 font-medium break-all select-text">
                          {item.message}
                        </span>
                      </div>
                    ) : item.type === "COMMAND" ? (
                      <div className="flex items-center gap-2 min-w-0 flex-1 flex-wrap">
                        {item.player && (
                          <div className="flex items-center gap-1.5 shrink-0">
                            <img
                              src={`https://mc-heads.net/avatar/${item.player}/20`}
                              alt={item.player}
                              className="w-4 h-4 rounded-sm bg-slate-900 border border-slate-700"
                            />
                            <span className="font-semibold text-slate-300">{item.player}</span>
                            <span
                              className={`text-[9px] font-bold px-1 py-0.2 rounded border ${rankColor} ${rankBorder}`}
                            >
                              {rank}
                            </span>
                          </div>
                        )}
                        <span className="px-1.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/20 text-amber-400 font-mono text-[11px] break-all select-text">
                          {item.message}
                        </span>
                      </div>
                    ) : item.type === "JOIN" ? (
                      <div className="flex items-center gap-2">
                        {item.player && (
                          <img
                            src={`https://mc-heads.net/avatar/${item.player}/20`}
                            alt={item.player}
                            className="w-4 h-4 rounded-sm bg-slate-900 border border-slate-700"
                          />
                        )}
                        <span className="font-bold text-emerald-400">
                          {item.player || "Player"}
                        </span>
                        <span className="text-emerald-300/80">joined the server</span>
                      </div>
                    ) : item.type === "LEAVE" ? (
                      <div className="flex items-center gap-2">
                        {item.player && (
                          <img
                            src={`https://mc-heads.net/avatar/${item.player}/20`}
                            alt={item.player}
                            className="w-4 h-4 rounded-sm bg-slate-900 border border-slate-700"
                          />
                        )}
                        <span className="font-bold text-rose-400">
                          {item.player || "Player"}
                        </span>
                        <span className="text-rose-300/80">disconnected</span>
                      </div>
                    ) : item.type === "ADVANCEMENT" ? (
                      <div className="flex items-center gap-2">
                        {item.player && (
                          <img
                            src={`https://mc-heads.net/avatar/${item.player}/20`}
                            alt={item.player}
                            className="w-4 h-4 rounded-sm bg-slate-900 border border-slate-700"
                          />
                        )}
                        <span className="font-bold text-purple-400">{item.player}</span>
                        <span className="text-purple-300 font-semibold">{item.message}</span>
                      </div>
                    ) : (
                      <div className="text-slate-400 font-mono text-[11px] break-all select-text">
                        {item.message}
                      </div>
                    )}
                  </div>

                  {/* Badge */}
                  <span
                    className={`text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full shrink-0 ${
                      item.type === "CHAT"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                        : item.type === "COMMAND"
                        ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        : item.type === "JOIN"
                        ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                        : item.type === "LEAVE"
                        ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                        : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {item.type}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Dispatch Controls & Send Bar */}
        <div className="p-4 sm:p-5 bg-slate-950 border-t border-slate-800 space-y-3">
          {/* Quick presets */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mr-1">
              Quick Actions:
            </span>
            <button
              type="button"
              onClick={() => handleQuickCommand("/list", "command")}
              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 font-mono text-[11px] border border-slate-800 transition-colors cursor-pointer"
            >
              /list
            </button>
            <button
              type="button"
              onClick={() => handleQuickCommand("/tps", "command")}
              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 font-mono text-[11px] border border-slate-800 transition-colors cursor-pointer"
            >
              /tps
            </button>
            <button
              type="button"
              onClick={() =>
                handleQuickCommand("Welcome to Harsh Unlimited Survival SMP!", "broadcast")
              }
              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-[11px] border border-slate-800 transition-colors cursor-pointer flex items-center gap-1"
            >
              <Megaphone className="w-3 h-3 text-amber-400" />
              <span>Broadcast Welcome</span>
            </button>
            <button
              type="button"
              onClick={() =>
                handleQuickCommand("Server reboot scheduled in 10 minutes. Please prepare!", "broadcast")
              }
              className="px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-[11px] border border-slate-800 transition-colors cursor-pointer flex items-center gap-1"
            >
              <AlertCircle className="w-3 h-3 text-rose-400" />
              <span>Broadcast Warning</span>
            </button>
          </div>

          {/* Form to Send Message or Execute Command */}
          <form onSubmit={handleSendMessage} className="flex flex-col sm:flex-row items-center gap-2.5">
            {/* Mode Selector */}
            <select
              value={dispatchMode}
              onChange={(e) => setDispatchMode(e.target.value as any)}
              className="w-full sm:w-auto bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white font-semibold focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="say">💬 In-Game Chat (/say)</option>
              <option value="broadcast">📣 Announcement (/broadcast)</option>
              <option value="command">⚡ Console Command (/)</option>
            </select>

            {/* Input field */}
            <div className="relative flex-1 w-full">
              <input
                type="text"
                placeholder={
                  dispatchMode === "say"
                    ? "Type a message to chat with in-game players..."
                    : dispatchMode === "broadcast"
                    ? "Type an announcement for all players on the network..."
                    : "Enter console command (e.g. kick PlayerName, lp user ...)"
                }
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono transition-colors"
              />
            </div>

            {/* Send Button */}
            <button
              type="submit"
              disabled={dispatching || !inputMessage.trim()}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-md shadow-emerald-500/20 transition-all cursor-pointer shrink-0"
            >
              <Send className="w-3.5 h-3.5" />
              <span>{dispatching ? "Sending..." : "Send"}</span>
            </button>
          </form>

          {/* Status feedback */}
          {statusMessage && (
            <div
              className={`text-xs px-3 py-2 rounded-xl border flex items-center gap-2 ${
                statusMessage.success
                  ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                  : "bg-rose-500/10 border-rose-500/30 text-rose-400"
              }`}
            >
              {statusMessage.success ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
