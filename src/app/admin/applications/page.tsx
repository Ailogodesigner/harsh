"use client";

import { useState, useEffect } from "react";
import { formatDateTime } from "@/lib/utils";
import {
  ClipboardList,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Search,
  MessageSquare,
  Clock,
  User,
} from "lucide-react";

export default function AdminApplicationsPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [selectedApp, setSelectedApp] = useState<any | null>(null);

  const fetchApps = () => {
    setLoading(true);
    fetch("/api/apply")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.applications) setApplications(data.applications);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchApps();
  }, []);

  const filtered = applications.filter((app) => {
    const matchesStatus = filterStatus === "ALL" || app.status === filterStatus;
    const matchesSearch =
      app.minecraftName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.discordTag.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.position.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400">
            Recruitment Desk
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-white">Staff Applications</h1>
          <p className="text-xs text-slate-400 mt-1">
            Review applicant profiles, experience, and scenario responses for moderation positions.
          </p>
        </div>

        <button
          type="button"
          onClick={fetchApps}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-200 hover:text-white transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin text-emerald-400" : ""}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {["ALL", "PENDING", "ACCEPTED", "REJECTED"].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filterStatus === st
                  ? "bg-emerald-500 text-slate-950"
                  : "bg-slate-900 text-slate-400 hover:text-white border border-slate-800"
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search IGN, discord, role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="glass-panel rounded-2xl p-6 border border-slate-800">
        {filtered.length === 0 ? (
          <p className="text-xs text-slate-400 py-8 text-center">No matching applications found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300 border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase text-[10px]">
                  <th className="py-3 px-3">Applicant IGN</th>
                  <th className="py-3 px-3">Position</th>
                  <th className="py-3 px-3">Discord Tag</th>
                  <th className="py-3 px-3">Age / Timezone</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3">Submitted</th>
                  <th className="py-3 px-3 text-right">Review</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {filtered.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-900/40">
                    <td className="py-3 px-3 font-bold text-white flex items-center gap-2">
                      <img
                        src={`https://mc-heads.net/avatar/${app.minecraftName}/24`}
                        alt=""
                        className="w-5 h-5 rounded"
                      />
                      <span className="font-mono">{app.minecraftName}</span>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900 border border-slate-800 text-emerald-400">
                        {app.position}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-300">{app.discordTag}</td>
                    <td className="py-3 px-3 text-slate-400">
                      {app.age} yrs &bull; {app.timezone}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          app.status === "ACCEPTED"
                            ? "bg-emerald-500/15 text-emerald-400"
                            : app.status === "PENDING"
                            ? "bg-amber-500/15 text-amber-400"
                            : "bg-rose-500/15 text-rose-400"
                        }`}
                      >
                        {app.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-400 font-mono text-[11px]">
                      {formatDateTime(app.createdAt)}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedApp(app)}
                        className="px-3 py-1 rounded-lg text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-white border border-slate-800"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Review Modal */}
      {selectedApp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <img
                  src={`https://mc-heads.net/avatar/${selectedApp.minecraftName}/40`}
                  alt=""
                  className="w-10 h-10 rounded-xl bg-slate-950"
                />
                <div>
                  <h3 className="text-lg font-bold text-white">{selectedApp.minecraftName}</h3>
                  <p className="text-xs text-slate-400">
                    Applying for: <span className="text-emerald-400 font-bold">{selectedApp.position}</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedApp(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-950 p-4 rounded-xl border border-slate-800 font-mono">
              <div>Discord: <span className="text-white font-bold">{selectedApp.discordTag}</span></div>
              <div>Age: <span className="text-white font-bold">{selectedApp.age}</span></div>
              <div>Timezone: <span className="text-white font-bold">{selectedApp.timezone}</span></div>
              <div>Date: <span className="text-slate-400">{formatDateTime(selectedApp.createdAt)}</span></div>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <span className="font-bold text-slate-300 uppercase tracking-wider block mb-1">
                  Past Experience:
                </span>
                <p className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {selectedApp.experience}
                </p>
              </div>

              <div>
                <span className="font-bold text-slate-300 uppercase tracking-wider block mb-1">
                  Why join Harsh Unlimited?
                </span>
                <p className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {selectedApp.whyJoin}
                </p>
              </div>

              <div>
                <span className="font-bold text-slate-300 uppercase tracking-wider block mb-1">
                  Scenario Question:
                </span>
                <p className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-slate-300 leading-relaxed whitespace-pre-wrap">
                  {selectedApp.scenarioAnswer}
                </p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedApp(null)}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
