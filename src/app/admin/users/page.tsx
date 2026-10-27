"use client";

import { useState, useEffect } from "react";
import { formatDateTime } from "@/lib/utils";
import {
  Users,
  Search,
  RefreshCw,
  Shield,
  Gamepad2,
  Calendar,
  UserCheck,
  ShoppingCart,
  LifeBuoy,
  Check,
  AlertCircle,
  Copy,
} from "lucide-react";

interface MinecraftAccount {
  username: string;
  verificationStatus: string;
}

interface UserEntry {
  id: string;
  name: string;
  email: string;
  role: "USER" | "ADMIN" | "SUPERADMIN";
  createdAt: string;
  minecraftAccounts?: MinecraftAccount[];
  _count?: {
    orders: number;
    supportTickets: number;
  };
}

interface UserStats {
  totalUsers: number;
  todaySignups: number;
  admins: number;
  superAdmins: number;
  regularUsers: number;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserEntry[]>([]);
  const [stats, setStats] = useState<UserStats>({
    totalUsers: 0,
    todaySignups: 0,
    admins: 0,
    superAdmins: 0,
    regularUsers: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<{ text: string; type: "success" | "error" } | null>(null);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search.trim()) params.set("search", search.trim());
      if (roleFilter !== "ALL") params.set("role", roleFilter);

      const res = await fetch(`/api/admin/users?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        if (data.users) setUsers(data.users);
        if (data.stats) setStats(data.stats);
      }
    } catch (err) {
      console.error("Failed to load users:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, search]);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setUsers((prev) =>
          prev.map((u) => (u.id === userId ? { ...u, role: newRole as any } : u))
        );
        setActionMsg({ text: `User role updated to ${newRole}`, type: "success" });
        setTimeout(() => setActionMsg(null), 3000);
        fetchUsers();
      } else {
        setActionMsg({ text: data.error || "Failed to update role", type: "error" });
        setTimeout(() => setActionMsg(null), 4000);
      }
    } catch {
      setActionMsg({ text: "Network error updating role", type: "error" });
      setTimeout(() => setActionMsg(null), 4000);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "SUPERADMIN":
        return "bg-rose-500/15 text-rose-400 border-rose-500/30 font-black";
      case "ADMIN":
        return "bg-amber-500/15 text-amber-400 border-amber-500/30 font-bold";
      default:
        return "bg-slate-800 text-slate-300 border-slate-700";
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                <span>Registered Community &amp; Users</span>
                <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-cyan-500/15 text-cyan-400 border border-cyan-500/30 uppercase tracking-widest font-mono">
                  {stats.totalUsers} Total
                </span>
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time member registry, linked Minecraft accounts, player spend, and role authorization.
              </p>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={fetchUsers}
          disabled={loading}
          className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-slate-900 border border-slate-800 hover:border-slate-700 hover:bg-slate-800 transition-all cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-cyan-400" : ""}`} />
          <span>Sync Members</span>
        </button>
      </div>

      {/* Action Notification Alert */}
      {actionMsg && (
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between text-xs font-semibold ${
            actionMsg.type === "success"
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/25"
              : "bg-rose-500/10 text-rose-400 border-rose-500/25"
          }`}
        >
          <span>{actionMsg.text}</span>
          <button onClick={() => setActionMsg(null)} className="opacity-70 hover:opacity-100">
            ✕
          </button>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-cyan-400" />
            <span>Total Signups</span>
          </span>
          <p className="text-2xl font-black text-white">{stats.totalUsers}</p>
          <span className="text-[10px] text-slate-500 font-mono">Accounts registered</span>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-emerald-500/30 bg-emerald-950/10 space-y-1">
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-emerald-400" />
            <span>Today's Registrations</span>
          </span>
          <p className="text-2xl font-black text-emerald-400">{stats.todaySignups}</p>
          <span className="text-[10px] text-emerald-500/80 font-mono">New players joined today</span>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-slate-400" />
            <span>Regular Members</span>
          </span>
          <p className="text-2xl font-black text-slate-300">{stats.regularUsers}</p>
          <span className="text-[10px] text-slate-500 font-mono">Community players</span>
        </div>

        <div className="glass-panel p-4 rounded-xl border border-amber-500/30 bg-amber-950/10 space-y-1">
          <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
            <Shield className="w-3.5 h-3.5 text-amber-400" />
            <span>Staff / Admins</span>
          </span>
          <p className="text-2xl font-black text-amber-400">
            {stats.admins + stats.superAdmins}
          </p>
          <span className="text-[10px] text-amber-500/80 font-mono">Elevated access roles</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-panel p-3.5 rounded-xl border border-slate-800 bg-slate-950/80 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search name, email, ID, or Minecraft username..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-900/90 border border-slate-800 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-white focus:outline-none focus:border-cyan-500"
          >
            <option value="ALL">All Roles</option>
            <option value="USER">Players (USER)</option>
            <option value="ADMIN">Staff (ADMIN)</option>
            <option value="SUPERADMIN">Super Admin (OWNER)</option>
          </select>

          {(search || roleFilter !== "ALL") && (
            <button
              onClick={() => {
                setSearch("");
                setRoleFilter("ALL");
              }}
              className="text-xs text-rose-400 hover:underline px-2"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Users Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-xl bg-slate-950/70">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center text-center space-y-3">
            <RefreshCw className="w-6 h-6 text-cyan-400 animate-spin" />
            <p className="text-xs text-slate-400 font-semibold">Loading registered accounts...</p>
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Users className="w-8 h-8 text-slate-600 mx-auto" />
            <h3 className="text-sm font-bold text-white">No Users Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No registered user accounts match your search or filter criteria.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300 border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px] bg-slate-900/50">
                  <th className="py-3 px-4">User</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Minecraft Account</th>
                  <th className="py-3 px-4">Activity</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Registered Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-sans">
                {users.map((u) => {
                  const ign = u.minecraftAccounts?.[0]?.username;
                  const isVerified = u.minecraftAccounts?.[0]?.verificationStatus === "VERIFIED";

                  return (
                    <tr key={u.id} className="hover:bg-slate-900/40 transition-colors">
                      {/* Name + ID */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          {ign ? (
                            <img
                              src={`https://minotar.net/avatar/${ign}/28`}
                              alt={ign}
                              className="w-7 h-7 rounded border border-slate-700 shrink-0"
                            />
                          ) : (
                            <div className="w-7 h-7 rounded bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-cyan-400 text-xs shrink-0">
                              {u.name.slice(0, 2).toUpperCase()}
                            </div>
                          )}
                          <div>
                            <span className="font-bold text-white block">{u.name}</span>
                            <button
                              onClick={() => handleCopy(u.id, u.id)}
                              className="text-[10px] font-mono text-slate-500 hover:text-cyan-400 flex items-center gap-1"
                            >
                              {copiedId === u.id ? (
                                <Check className="w-3 h-3 text-emerald-400" />
                              ) : (
                                <Copy className="w-3 h-3" />
                              )}
                              <span>ID: {u.id.slice(0, 8)}...</span>
                            </button>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-3 px-4 font-mono text-slate-300">{u.email}</td>

                      {/* Minecraft Account */}
                      <td className="py-3 px-4">
                        {ign ? (
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                              {ign}
                            </span>
                            {isVerified && (
                              <span className="text-[9px] bg-emerald-500 text-slate-950 font-black px-1 rounded uppercase">
                                Verified
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-500 italic">Not linked</span>
                        )}
                      </td>

                      {/* Activity Metrics */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3 text-[11px]">
                          <span className="flex items-center gap-1 text-slate-400" title="Orders Count">
                            <ShoppingCart className="w-3 h-3 text-cyan-400" />
                            <strong className="text-white font-mono">{u._count?.orders ?? 0}</strong>
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-slate-400" title="Support Tickets">
                            <LifeBuoy className="w-3 h-3 text-amber-400" />
                            <strong className="text-white font-mono">
                              {u._count?.supportTickets ?? 0}
                            </strong>
                          </span>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-block px-2 py-0.5 rounded border text-[10px] uppercase tracking-wider ${getRoleBadge(
                            u.role
                          )}`}
                        >
                          {u.role}
                        </span>
                      </td>

                      {/* Registration Date */}
                      <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                        {formatDateTime(u.createdAt)}
                      </td>

                      {/* Role Changer Dropdown */}
                      <td className="py-3 px-4 text-right">
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          className="px-2 py-1 bg-slate-900 border border-slate-800 rounded-lg text-[11px] font-bold text-slate-300 focus:outline-none focus:border-cyan-500 cursor-pointer"
                        >
                          <option value="USER">Role: Player</option>
                          <option value="ADMIN">Role: Admin</option>
                          <option value="SUPERADMIN">Role: Super Admin</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
