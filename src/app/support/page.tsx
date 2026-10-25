"use client";

import { useState } from "react";
import { LifeBuoy, MessageSquare, Send, CheckCircle2, AlertCircle, Clock, Shield } from "lucide-react";

export default function SupportPage() {
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("BILLING");
  const [priority, setPriority] = useState("MEDIUM");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const res = await fetch("/api/tickets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ subject, category, priority, message }),
      });

      const data = await res.json();
      if (!res.ok) {
        if (res.status === 401) {
          setError("Please log in to your account first so our team can follow up with your ticket.");
        } else {
          setError(data.error || "Failed to create support ticket");
        }
        setSubmitting(false);
        return;
      }

      setSuccess(true);
      setSubject("");
      setMessage("");
    } catch (err: any) {
      setError(err?.message || "An unexpected network error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
          Player Assistance
        </span>
        <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
          SUPPORT &amp; <span className="text-emerald-400">CONTACT</span>
        </h1>
        <p className="text-sm text-slate-300 leading-relaxed">
          Need help with an order, rank delivery, or technical gameplay issue? Our team is available 24/7.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Support Channels & Discord info */}
        <div className="space-y-6 lg:col-span-1">
          <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-xl bg-[#5865F2]/10 text-[#5865F2]">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Discord Support</h3>
                <p className="text-xs text-slate-400">Fastest response (&lt; 15 mins)</p>
              </div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Open a ticket in the #support channel on our Discord server to chat directly with active staff and developers.
            </p>
            <a
              href="https://discord.gg/harshunlimited"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-bold text-xs bg-[#5865F2] hover:bg-[#4752c4] text-white transition-colors"
            >
              <span>JOIN DISCORD SERVER</span>
            </a>
          </div>

          <div className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <Clock className="w-4 h-4" />
              <span>Standard Response SLA</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Website tickets are generally reviewed within 6 to 24 hours. For urgent payment reconciliation, please have your Cashfree Order ID handy.
            </p>
          </div>
        </div>

        {/* Web Ticket Form */}
        <div className="glass-panel rounded-2xl p-8 border border-slate-800 lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h2 className="text-xl font-bold text-white">Create a Support Ticket</h2>
              <p className="text-xs text-slate-400">Directly monitored by server administrators</p>
            </div>
            <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded">
              Secure Channel
            </span>
          </div>

          {success ? (
            <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
              <h3 className="text-lg font-bold text-white">Ticket Submitted Successfully!</h3>
              <p className="text-xs text-slate-300 max-w-md mx-auto">
                Your support request has been logged. You can review administrative replies anytime inside your Customer Dashboard.
              </p>
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setSuccess(false)}
                  className="px-6 py-2 rounded-xl text-xs font-bold bg-slate-900 border border-slate-800 text-slate-200 hover:text-white"
                >
                  Submit Another Ticket
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Ticket Subject <span className="text-emerald-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Issue with rank delivery for HU-ORD-20261025-XXXX"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="BILLING">Billing &amp; Store Purchases</option>
                    <option value="DELIVERY">Minecraft Rank Delivery</option>
                    <option value="TECHNICAL">Connection &amp; Technical Bug</option>
                    <option value="PLAYER_REPORT">Player Report / Griefing</option>
                    <option value="GENERAL">General Inquiry</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Priority</label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="LOW">Low - General Question</option>
                    <option value="MEDIUM">Medium - Normal Issue</option>
                    <option value="HIGH">High - Urgent Purchase Concern</option>
                    <option value="URGENT">Urgent - Security / Critical Bug</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Detailed Explanation <span className="text-emerald-400">*</span>
                </label>
                <textarea
                  required
                  rows={5}
                  placeholder="Please describe your issue in detail. Include your Minecraft IGN and relevant order IDs if applicable..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors resize-none"
                />
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 shadow-md shadow-emerald-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <span>Sending Ticket...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit Ticket to Administrators</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
