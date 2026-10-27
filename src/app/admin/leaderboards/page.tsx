"use client";

import { useState, useEffect } from "react";
import {
  Trophy,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  Save,
  Coins,
  Skull,
  Clock,
  Crown,
  AlertTriangle,
  X,
} from "lucide-react";

interface LeaderboardEntry {
  id: string;
  category: "ECONOMY" | "PVP" | "COINS" | "PLAYTIME" | string;
  name: string;
  score: string;
  rawScore: number;
  subtext: string | null;
  rank: number;
  updatedAt: string;
}

const CATEGORIES = [
  { id: "ECONOMY", label: "Survival Economy & Baltop", icon: Coins, color: "text-amber-400" },
  { id: "PVP", label: "PvP Combat & Top Kills", icon: Skull, color: "text-rose-400" },
  { id: "COINS", label: "In-Game Coin Shop Barons", icon: Coins, color: "text-yellow-400" },
  { id: "PLAYTIME", label: "Server Play Time", icon: Clock, color: "text-purple-400" },
];

export default function AdminLeaderboardsPage() {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string>("ALL");

  // Form states
  const [category, setCategory] = useState("ECONOMY");
  const [name, setName] = useState("");
  const [score, setScore] = useState("");
  const [subtext, setSubtext] = useState("");
  const [rank, setRank] = useState(1);
  const [msg, setMsg] = useState<string | null>(null);

  // Playtime Reset modal states
  const [showResetModal, setShowResetModal] = useState(false);
  const [resetConsole, setResetConsole] = useState(true);
  const [broadcastNotification, setBroadcastNotification] = useState(true);
  const [resettingPlaytime, setResettingPlaytime] = useState(false);

  const handleResetPlaytime = async () => {
    setResettingPlaytime(true);
    setMsg(null);
    try {
      const res = await fetch("/api/admin/leaderboards/reset-playtime", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resetConsole, broadcastNotification }),
      });
      const data = await res.json();
      if (res.ok) {
        setMsg(data.message || "Player play time has been reset successfully!");
        setShowResetModal(false);
        fetchEntries();
      } else {
        setMsg(data.error || "Failed to reset play time.");
      }
    } catch (err: any) {
      setMsg(err?.message || "Network error resetting play time");
    } finally {
      setResettingPlaytime(false);
    }
  };

  const fetchEntries = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/leaderboards");
      const data = await res.json();
      if (data?.entries) {
        setEntries(data.entries);
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, []);

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);

    try {
      const isEdit = Boolean(editingId);
      const res = await fetch("/api/admin/leaderboards", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingId,
          category,
          name: name.trim(),
          score: score.trim(),
          subtext: subtext.trim() || null,
          rank: Number(rank),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setMsg(data.error || "Failed to save leaderboard entry");
        setSaving(false);
        return;
      }

      setMsg(isEdit ? "Leaderboard entry updated successfully!" : "Leaderboard entry added successfully!");
      resetForm();
      fetchEntries();
    } catch (err: any) {
      setMsg(err?.message || "An unexpected error occurred");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (entry: LeaderboardEntry) => {
    setEditingId(entry.id);
    setCategory(entry.category);
    setName(entry.name);
    setScore(entry.score);
    setSubtext(entry.subtext || "");
    setRank(entry.rank);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string, playerName: string) => {
    if (!confirm(`Are you sure you want to delete ${playerName} from this leaderboard?`)) return;

    try {
      const res = await fetch(`/api/admin/leaderboards?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchEntries();
      }
    } catch {
      // Ignore
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setScore("");
    setSubtext("");
    setRank(entries.filter((e) => e.category === category).length + 1);
  };

  const filteredEntries = entries.filter((e) => {
    if (selectedFilter === "ALL") return true;
    return e.category === selectedFilter;
  });

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
              Rankings & Hall of Fame
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Leaderboards Management</h1>
          <p className="text-xs text-slate-400">
            Manage live rankings for Survival Baltop ($109M+ economy), PvP Kills, In-Game Coins, and Server Play Time.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setShowResetModal(true)}
            className="px-3.5 py-2 rounded-xl bg-purple-500/15 hover:bg-purple-500/25 border border-purple-500/30 text-purple-300 text-xs font-bold flex items-center gap-2 transition-all cursor-pointer shadow-sm"
          >
            <Clock className="w-3.5 h-3.5 text-purple-400" />
            <span>Reset Player Play Time</span>
          </button>

          <button
            onClick={fetchEntries}
            className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold flex items-center gap-2 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {msg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      {/* Editor & Create Form */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            {editingId ? <Edit3 className="w-4 h-4 text-amber-400" /> : <Plus className="w-4 h-4 text-emerald-400" />}
            <span>{editingId ? "Edit Leaderboard Entry" : "Add Leaderboard Entry"}</span>
          </h2>
          {editingId && (
            <button
              onClick={resetForm}
              className="text-[11px] text-slate-400 hover:text-white font-medium cursor-pointer"
            >
              Cancel Edit
            </button>
          )}
        </div>

        <form onSubmit={handleCreateOrUpdate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Category *</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Rank Position */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Rank # *</label>
              <input
                type="number"
                required
                min={1}
                value={rank}
                onChange={(e) => setRank(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            {/* Player IGN */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Player IGN *</label>
              <input
                type="text"
                required
                placeholder="e.g. HarshUnlimited"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>

            {/* Formatted Score */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Score / Display *</label>
              <input
                type="text"
                required
                placeholder="e.g. $40,250,949 or 284h 15m"
                value={score}
                onChange={(e) => setScore(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
              />
            </div>

            {/* Subtext / Tag */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">Subtitle / Perk</label>
              <input
                type="text"
                placeholder="e.g. Rank: OWNER or Status: MEMBER"
                value={subtext}
                onChange={(e) => setSubtext(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center gap-3">
              <img
                src={`https://mc-heads.net/avatar/${name.trim() || "steve"}/40`}
                alt="Player Head Preview"
                className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-700"
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">#{rank} {name || "Player Name"}</span>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                    {score || "Score"}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">{subtext || category}</p>
              </div>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50 shrink-0"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? "Saving..." : editingId ? "Save Changes" : "Add to Leaderboard"}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Category Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setSelectedFilter("ALL")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
            selectedFilter === "ALL"
              ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
              : "bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800"
          }`}
        >
          All Categories ({entries.length})
        </button>
        {CATEGORIES.map((cat) => {
          const isSelected = selectedFilter === cat.id;
          const count = entries.filter((e) => e.category === cat.id).length;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedFilter(cat.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isSelected
                  ? "bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20"
                  : "bg-slate-900 text-slate-300 border border-slate-800 hover:bg-slate-800"
              }`}
            >
              <span>{cat.label}</span>
              <span className="text-[10px] opacity-75 font-mono">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Leaderboard Table List */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        {loading ? (
          <div className="text-center py-12 text-xs text-slate-500">Loading rankings...</div>
        ) : filteredEntries.length === 0 ? (
          <div className="p-8 text-center text-xs text-slate-400">
            No entries found in this category.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                <tr>
                  <th className="py-3 px-4">Rank</th>
                  <th className="py-3 px-4">Player</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Score / Value</th>
                  <th className="py-3 px-4">Subtitle / Note</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredEntries.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold">
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs ${
                          entry.rank === 1
                            ? "bg-amber-400 text-slate-950 font-black"
                            : entry.rank === 2
                            ? "bg-slate-300 text-slate-950 font-black"
                            : entry.rank === 3
                            ? "bg-amber-700 text-white font-black"
                            : "text-slate-400 font-medium"
                        }`}
                      >
                        {entry.rank}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={`https://mc-heads.net/avatar/${entry.name}/28`}
                          alt={entry.name}
                          className="w-7 h-7 rounded-lg bg-slate-950 border border-slate-800"
                        />
                        <span className="font-bold text-white text-xs">{entry.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-300 uppercase">
                        {entry.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                      {entry.score}
                    </td>
                    <td className="py-3 px-4 text-slate-400 text-[11px]">
                      {entry.subtext || "—"}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(entry)}
                          className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
                          title="Edit Entry"
                        >
                          <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                        </button>
                        <button
                          onClick={() => handleDelete(entry.id, entry.name)}
                          className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-rose-400 transition-colors cursor-pointer"
                          title="Delete Entry"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reset Play Time Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="glass-panel w-full max-w-lg rounded-3xl border border-purple-500/30 p-6 sm:p-8 space-y-5 bg-[#090b12] shadow-2xl shadow-purple-950/40">
            <div className="flex items-start justify-between gap-4 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-purple-500/15 border border-purple-500/30 text-purple-400">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">Reset Player Play Time</h3>
                  <p className="text-xs text-slate-400">Website Leaderboards &amp; Minecraft Server Console</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowResetModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-3 text-xs text-amber-200">
              <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-amber-300">Caution: Season Play Time Wipe</p>
                <p className="text-[11px] text-amber-200/80 leading-relaxed">
                  This action will permanently delete all current play time entries from the website leaderboards so a fresh new season can begin.
                </p>
              </div>
            </div>

            {/* Options */}
            <div className="space-y-3 text-xs">
              <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/80 border border-slate-800 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={true}
                  disabled
                  className="rounded border-slate-700 bg-slate-800 text-purple-500 mt-0.5"
                />
                <div>
                  <span className="font-bold text-white block">Wipe Website Leaderboard Records</span>
                  <span className="text-[11px] text-slate-400">
                    Clears all stored player playtime entries from database tables.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={resetConsole}
                  onChange={(e) => setResetConsole(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-800 text-purple-500 mt-0.5"
                />
                <div>
                  <span className="font-bold text-white block">Dispatch Server Console Commands</span>
                  <span className="text-[11px] text-slate-400">
                    Executes /playtime resetall and resets in-game statistics via Pterodactyl.
                  </span>
                </div>
              </label>

              <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={broadcastNotification}
                  onChange={(e) => setBroadcastNotification(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-800 text-purple-500 mt-0.5"
                />
                <div>
                  <span className="font-bold text-white block">Broadcast In-Game Announcement</span>
                  <span className="text-[11px] text-slate-400">
                    Notifies connected players in-game that playtimes have been reset.
                  </span>
                </div>
              </label>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                type="button"
                disabled={resettingPlaytime}
                onClick={() => setShowResetModal(false)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={resettingPlaytime}
                onClick={handleResetPlaytime}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-rose-600 hover:from-purple-500 hover:to-rose-500 text-white shadow-lg shadow-purple-950/40 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {resettingPlaytime ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Resetting Play Time...</span>
                  </>
                ) : (
                  <>
                    <Clock className="w-3.5 h-3.5" />
                    <span>Confirm &amp; Reset Play Time</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
