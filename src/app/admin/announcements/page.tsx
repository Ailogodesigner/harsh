"use client";

import { useState, useEffect } from "react";
import { Bell, Plus, Trash2, Edit3, CheckCircle2, Sparkles, RefreshCw, Save } from "lucide-react";

interface ServerAnnouncement {
  id: string;
  title: string;
  content: string;
  tag: "UPDATE" | "EVENT" | "SALE" | "MAINTENANCE";
  active: boolean;
  createdAt: string;
}

export default function AdminAnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<ServerAnnouncement[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tag, setTag] = useState<"UPDATE" | "EVENT" | "SALE" | "MAINTENANCE">("UPDATE");
  const [active, setActive] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/announcements");
      const data = await res.json();
      if (data?.announcements) {
        setAnnouncements(data.announcements);
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);

    try {
      const isEdit = Boolean(editingId);
      const res = await fetch("/api/admin/announcements", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingId,
          title,
          content,
          tag,
          active,
        }),
      });

      if (res.ok) {
        setMsg(isEdit ? "Announcement updated successfully!" : "Announcement published successfully!");
        setTitle("");
        setContent("");
        setTag("UPDATE");
        setActive(true);
        setEditingId(null);
        fetchAnnouncements();
      }
    } catch {
      alert("Failed to save announcement");
    } finally {
      setSaving(false);
    }
  };

  const handleEditClick = (a: ServerAnnouncement) => {
    setEditingId(a.id);
    setTitle(a.title);
    setContent(a.content);
    setTag(a.tag);
    setActive(a.active);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this announcement?")) return;
    try {
      const res = await fetch(`/api/admin/announcements?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchAnnouncements();
      }
    } catch {
      alert("Failed to delete announcement");
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white flex items-center gap-2.5">
            <Bell className="w-6 h-6 text-emerald-400" />
            <span>Server Announcements & News Banners</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Publish server announcements, discount codes, or maintenance notices to the website homepage.
          </p>
        </div>

        <button
          onClick={fetchAnnouncements}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-slate-900 border border-slate-800 text-slate-300 hover:text-white hover:border-emerald-500/30 transition-all cursor-pointer w-fit"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-emerald-400" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {msg && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      {/* Form: Create or Edit */}
      <form onSubmit={handleCreateOrUpdate} className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
        <h2 className="text-base font-bold text-white flex items-center gap-2 pb-2 border-b border-slate-800">
          <Edit3 className="w-4 h-4 text-emerald-400" />
          <span>{editingId ? "Edit Announcement" : "Create New Announcement"}</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Headline Title
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Network Update & Weekend 20% Sale"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Tag / Category
            </label>
            <select
              value={tag}
              onChange={(e) => setTag(e.target.value as any)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="UPDATE">UPDATE</option>
              <option value="EVENT">EVENT</option>
              <option value="SALE">SALE (Special Offer)</option>
              <option value="MAINTENANCE">MAINTENANCE</option>
            </select>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1">
            Announcement Content & Details
          </label>
          <textarea
            required
            rows={3}
            placeholder="Write the full announcement text that displays to players on the homepage..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500 leading-relaxed"
          />
        </div>

        <div className="flex items-center justify-between pt-2">
          <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300">
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
              className="rounded border-slate-800 text-emerald-500 focus:ring-0"
            />
            <span>Active (Visible on homepage)</span>
          </label>

          <div className="flex items-center gap-2">
            {editingId && (
              <button
                type="button"
                onClick={() => {
                  setEditingId(null);
                  setTitle("");
                  setContent("");
                }}
                className="px-4 py-2 rounded-xl text-xs font-bold text-slate-400 hover:text-white"
              >
                Cancel
              </button>
            )}

            <button
              type="submit"
              disabled={saving}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>{saving ? "Saving..." : editingId ? "Update Announcement" : "Publish Announcement"}</span>
            </button>
          </div>
        </div>
      </form>

      {/* Announcements List */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
          Published Announcements ({announcements.length})
        </h2>

        {announcements.map((a) => (
          <div
            key={a.id}
            className={`glass-panel rounded-2xl p-5 border transition-all ${
              a.active ? "border-slate-800 bg-slate-950/80" : "border-slate-900 bg-slate-950/40 opacity-60"
            }`}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                      a.tag === "SALE"
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                        : a.tag === "EVENT"
                        ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                        : a.tag === "MAINTENANCE"
                        ? "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                        : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    }`}
                  >
                    {a.tag}
                  </span>
                  <h3 className="text-sm font-bold text-white">{a.title}</h3>
                  {!a.active && (
                    <span className="text-[10px] text-slate-500 font-mono font-bold">(INACTIVE)</span>
                  )}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{a.content}</p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => handleEditClick(a)}
                  className="p-2 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                  title="Edit"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(a.id)}
                  className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  title="Delete"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
