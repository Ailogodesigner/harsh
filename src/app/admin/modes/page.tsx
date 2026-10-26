"use client";

import { useState, useEffect } from "react";
import { Gamepad2, CheckCircle2, Clock, AlertTriangle, Sparkles, RefreshCw, Save } from "lucide-react";

interface GameMode {
  id: string;
  title: string;
  slug: string;
  description: string;
  status: "ONLINE" | "COMING_SOON" | "MAINTENANCE" | "BETA";
  version: string;
  features: string;
  sortOrder: number;
  active: boolean;
}

export default function AdminGameModesPage() {
  const [modes, setModes] = useState<GameMode[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const fetchModes = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/gamemodes");
      const data = await res.json();
      if (data?.modes) {
        setModes(data.modes);
      }
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchModes();
  }, []);

  const handleUpdateField = (id: string, field: keyof GameMode, value: any) => {
    setModes((prev) =>
      prev.map((m) => (m.id === id ? { ...m, [field]: value } : m))
    );
  };

  const handleSaveMode = async (mode: GameMode) => {
    setSavingId(mode.id);
    setSuccessMsg(null);
    try {
      const res = await fetch("/api/admin/gamemodes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: mode.id,
          title: mode.title,
          status: mode.status,
          version: mode.version,
          description: mode.description,
          active: mode.active,
          sortOrder: mode.sortOrder,
        }),
      });

      if (res.ok) {
        setSuccessMsg(`"${mode.title}" updated successfully!`);
        setTimeout(() => setSuccessMsg(null), 3000);
      }
    } catch {
      alert("Failed to save game mode");
    } finally {
      setSavingId(null);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <Gamepad2 className="w-6 h-6 text-emerald-400" />
            <span>Game Modes & Server Modules</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage your network game modes, toggle "ONLINE" vs "COMING SOON", and update descriptions.
          </p>
        </div>

        <button
          onClick={fetchModes}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-emerald-500/30 transition-all cursor-pointer w-fit"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-emerald-400" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {successMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Game Mode Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {modes.map((mode) => (
          <div
            key={mode.id}
            className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4 relative"
          >
            <div className="flex items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
              <input
                type="text"
                value={mode.title}
                onChange={(e) => handleUpdateField(mode.id, "title", e.target.value)}
                className="text-lg font-bold text-white bg-transparent border-b border-transparent hover:border-slate-700 focus:border-emerald-500 focus:outline-none px-1 py-0.5"
              />

              {/* Status Selector Dropdown */}
              <select
                value={mode.status}
                onChange={(e) => handleUpdateField(mode.id, "status", e.target.value)}
                className={`text-xs font-bold px-3 py-1.5 rounded-xl border cursor-pointer focus:outline-none ${
                  mode.status === "ONLINE"
                    ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                    : mode.status === "COMING_SOON"
                    ? "bg-amber-500/15 text-amber-400 border-amber-500/30"
                    : mode.status === "BETA"
                    ? "bg-cyan-500/15 text-cyan-400 border-cyan-500/30"
                    : "bg-rose-500/15 text-rose-400 border-rose-500/30"
                }`}
              >
                <option value="ONLINE" className="bg-slate-950 text-emerald-400">● ONLINE (Active Now)</option>
                <option value="COMING_SOON" className="bg-slate-950 text-amber-400">⏳ COMING SOON</option>
                <option value="BETA" className="bg-slate-950 text-cyan-400">🚀 BETA RELEASE</option>
                <option value="MAINTENANCE" className="bg-slate-950 text-rose-400">🔧 MAINTENANCE</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                Description
              </label>
              <textarea
                rows={3}
                value={mode.description}
                onChange={(e) => handleUpdateField(mode.id, "description", e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Supported Versions
                </label>
                <input
                  type="text"
                  value={mode.version}
                  onChange={(e) => handleUpdateField(mode.id, "version", e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-[11px] font-semibold text-slate-400 block mb-1">
                  Display Order
                </label>
                <input
                  type="number"
                  value={mode.sortOrder}
                  onChange={(e) => handleUpdateField(mode.id, "sortOrder", parseInt(e.target.value, 10) || 0)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-800/80">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
                <input
                  type="checkbox"
                  checked={mode.active}
                  onChange={(e) => handleUpdateField(mode.id, "active", e.target.checked)}
                  className="rounded border-slate-800 text-emerald-500 focus:ring-0"
                />
                <span>Visible on website</span>
              </label>

              <button
                type="button"
                onClick={() => handleSaveMode(mode)}
                disabled={savingId === mode.id}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{savingId === mode.id ? "Saving..." : "Save Changes"}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
