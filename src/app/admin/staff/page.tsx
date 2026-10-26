"use client";

import { useState, useEffect } from "react";
import {
  Shield,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  Sparkles,
  RefreshCw,
  Save,
  UserCheck,
  Crown,
  Code,
  HeartHandshake,
  ExternalLink,
} from "lucide-react";

interface StaffMember {
  id: string;
  name: string;
  displayName: string | null;
  role: string;
  tag: string;
  category: string;
  color: string;
  sortOrder: number;
  active: boolean;
  createdAt: string;
}

const CATEGORIES = [
  { id: "LEADERSHIP", label: "Network Leadership & Founders" },
  { id: "MANAGEMENT", label: "Server Management & Operations" },
  { id: "DEVELOPMENT", label: "Development & Systems Architecture" },
  { id: "MODERATION", label: "Community Moderation & Support" },
];

const COLORS = [
  { id: "rose", label: "Red / Rose (Owner)", class: "text-rose-400 bg-rose-500/10 border-rose-500/20" },
  { id: "amber", label: "Gold / Amber (Manager)", class: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
  { id: "cyan", label: "Aqua / Cyan (Developer)", class: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20" },
  { id: "purple", label: "Purple (Admin)", class: "text-purple-400 bg-purple-500/10 border-purple-500/20" },
  { id: "emerald", label: "Emerald (Moderator)", class: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
  { id: "blue", label: "Blue (Helper)", class: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
];

export default function AdminStaffPage() {
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [name, setName] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [role, setRole] = useState("");
  const [tag, setTag] = useState("MOD");
  const [category, setCategory] = useState("LEADERSHIP");
  const [color, setColor] = useState("emerald");
  const [sortOrder, setSortOrder] = useState(0);
  const [active, setActive] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/staff");
      const data = await res.json();
      if (data?.staff) {
        setStaff(data.staff);
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStaff();
  }, []);

  const handleCreateOrUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMsg(null);

    try {
      const isEdit = Boolean(editingId);
      const res = await fetch("/api/admin/staff", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingId,
          name: name.trim(),
          displayName: displayName.trim() || null,
          role: role.trim(),
          tag: tag.trim().toUpperCase(),
          category,
          color,
          sortOrder: Number(sortOrder),
          active,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setMsg(data.error || "Failed to save staff member");
        setSaving(false);
        return;
      }

      setMsg(isEdit ? "Staff member updated successfully!" : "Staff member created successfully!");
      resetForm();
      fetchStaff();
    } catch (err: any) {
      setMsg(err?.message || "An unexpected error occurred");
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (member: StaffMember) => {
    setEditingId(member.id);
    setName(member.name);
    setDisplayName(member.displayName || "");
    setRole(member.role);
    setTag(member.tag);
    setCategory(member.category);
    setColor(member.color);
    setSortOrder(member.sortOrder);
    setActive(member.active);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id: string, memberName: string) => {
    if (!confirm(`Are you sure you want to remove ${memberName} from the staff list?`)) return;

    try {
      const res = await fetch(`/api/admin/staff?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        fetchStaff();
      }
    } catch {
      // Ignore
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setDisplayName("");
    setRole("");
    setTag("MOD");
    setCategory("LEADERSHIP");
    setColor("emerald");
    setSortOrder(0);
    setActive(true);
  };

  const getColorClass = (col: string) => {
    const match = COLORS.find((c) => c.id === col);
    return match ? match.class : "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
  };

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400">
              Community Team
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Staff Management</h1>
          <p className="text-xs text-slate-400">
            Manage public staff listings on /staff with synchronized Minecraft skin heads and roles.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchStaff}
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
            <span>{editingId ? "Edit Staff Member" : "Add New Staff Member"}</span>
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Minecraft Username */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Minecraft Username (IGN) *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. HarshUnlimited"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            {/* Display Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Display Name (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Harsh"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>

            {/* Role Subtitle */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Role / Subtitle *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Network Director & Founder"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {/* Rank Tag */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Badge / Tag Text *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. OWNER, MANAGER, DEV, MOD"
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors uppercase font-bold"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Color Theme */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Badge Color
              </label>
              <select
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
              >
                {COLORS.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Order */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Sort Order (1 = Top)
              </label>
              <input
                type="number"
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
              />
            </div>
          </div>

          {/* Live Preview & Active Checkbox */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-950/60 border border-slate-800">
            <div className="flex items-center gap-3">
              <img
                src={`https://mc-heads.net/avatar/${name.trim() || "steve"}/48`}
                alt="Skin Preview"
                className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700"
              />
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-white">
                    {displayName || name || "Player Name"}
                  </span>
                  <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${getColorClass(color)}`}>
                    {tag || "TAG"}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">{role || "Staff Member Role"}</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-300 select-none">
                <input
                  type="checkbox"
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  className="rounded border-slate-700 text-emerald-500 focus:ring-0 bg-slate-900"
                />
                <span>Visible on /staff</span>
              </label>

              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-emerald-500 hover:bg-emerald-400 text-slate-950 flex items-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{saving ? "Saving..." : editingId ? "Save Changes" : "Create Staff"}</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Staff List */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <Shield className="w-4 h-4 text-emerald-400" />
          <span>Active Staff Team ({staff.length} Members)</span>
        </h2>

        {loading ? (
          <div className="text-center py-12 text-xs text-slate-500">Loading staff members...</div>
        ) : staff.length === 0 ? (
          <div className="glass-panel rounded-2xl p-8 border border-slate-800 text-center text-xs text-slate-400">
            No staff members created yet. Use the form above to add your first staff member.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {staff.map((member) => (
              <div
                key={member.id}
                className="glass-panel rounded-2xl p-5 border border-slate-800 flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={`https://mc-heads.net/avatar/${member.name}/48`}
                    alt={member.name}
                    className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 shrink-0"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-white text-sm">
                        {member.displayName || member.name}
                      </h3>
                      <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${getColorClass(member.color)}`}>
                        {member.tag}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400">{member.role}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[10px] text-slate-500">IGN: {member.name}</span>
                      <span className="text-[10px] text-slate-600">•</span>
                      <span className="text-[10px] text-slate-500">Order: #{member.sortOrder}</span>
                      <span className="text-[10px] text-slate-600">•</span>
                      <span className={`text-[10px] font-semibold ${member.active ? "text-emerald-400" : "text-rose-400"}`}>
                        {member.active ? "Active" : "Hidden"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleEdit(member)}
                    className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
                    title="Edit Staff Member"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-amber-400" />
                  </button>
                  <button
                    onClick={() => handleDelete(member.id, member.name)}
                    className="p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-rose-400 transition-colors cursor-pointer"
                    title="Delete Staff Member"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
