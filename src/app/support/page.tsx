"use client";

import { useState, useEffect } from "react";
import NextLink from "next/link";
import {
  LifeBuoy,
  MessageSquare,
  Send,
  CheckCircle2,
  AlertCircle,
  Clock,
  Shield,
  ArrowRight,
  ExternalLink,
  Lock,
} from "lucide-react";
import { SOCIAL_LINKS, DiscordIcon, YoutubeIcon, InstagramIcon } from "@/components/SocialLinks";

interface ActiveTicket {
  id: string;
  subject: string;
  status: string;
  createdAt: string;
}

export default function SupportPage() {
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("BILLING");
  const [priority, setPriority] = useState("MEDIUM");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [createdTicketId, setCreatedTicketId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [activeTicket, setActiveTicket] = useState<ActiveTicket | null>(null);
  const [checkingExisting, setCheckingExisting] = useState(true);

  // Check if member already has an active support ticket (Limit: 1 active ticket per member)
  const checkActiveTickets = async () => {
    try {
      setCheckingExisting(true);
      const res = await fetch("/api/tickets");
      if (res.ok) {
        const data = await res.json();
        if (data?.tickets && Array.isArray(data.tickets)) {
          const open = data.tickets.find((t: any) =>
            ["OPEN", "WAITING_ADMIN", "WAITING_USER"].includes(t.status)
          );
          if (open) {
            setActiveTicket({
              id: open.id,
              subject: open.subject,
              status: open.status,
              createdAt: open.createdAt,
            });
          } else {
            setActiveTicket(null);
          }
        }
      }
    } catch (err) {
      console.error("Failed to check active tickets:", err);
    } finally {
      setCheckingExisting(false);
    }
  };

  useEffect(() => {
    checkActiveTickets();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (activeTicket) {
      setError(
        `Active ticket limit reached: You already have an open ticket ("${activeTicket.subject}"). Each member can have only 1 active ticket at a time.`
      );
      return;
    }

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
        } else if (res.status === 409 && data.activeTicketId) {
          setError(data.error);
          checkActiveTickets();
        } else {
          setError(data.error || "Failed to create support ticket");
        }
        setSubmitting(false);
        return;
      }

      if (data.ticket?.id) {
        setCreatedTicketId(data.ticket.id);
      }
      setSuccess(true);
      setSubject("");
      setMessage("");
      checkActiveTickets();
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
          Need help with an order, rank delivery, or technical gameplay issue? Our team is available 24/7 across our live ticket desk and community channels.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Support Channels & Socials info */}
        <div className="space-y-4 lg:col-span-1">
          {/* Discord Card */}
          <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#5865F2]/15 text-[#5865F2]">
                <DiscordIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Discord Community</h3>
                <p className="text-[11px] text-slate-400">Fastest response (&lt; 15 mins)</p>
              </div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Open a ticket in the #support channel on our Discord server to chat directly with active staff and developers.
            </p>
            <a
              href={SOCIAL_LINKS.discord}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-bold text-xs bg-[#5865F2] hover:bg-[#4752c4] text-white transition-all shadow-md shadow-[#5865F2]/20"
            >
              <DiscordIcon className="w-4 h-4" />
              <span>JOIN DISCORD (DSC.GG)</span>
            </a>
          </div>

          {/* YouTube Channel Card */}
          <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#FF0000]/15 text-[#FF0000]">
                <YoutubeIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Official YouTube</h3>
                <p className="text-[11px] text-slate-400">Trailers, SMP Guides &amp; Streams</p>
              </div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Watch server update trailers, survival SMP base tours, and official announcements on our YouTube channel.
            </p>
            <a
              href={SOCIAL_LINKS.youtube}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-bold text-xs bg-[#FF0000] hover:bg-[#cc0000] text-white transition-all shadow-md shadow-[#FF0000]/20"
            >
              <YoutubeIcon className="w-4 h-4" />
              <span>VISIT YOUTUBE CHANNEL</span>
            </a>
          </div>

          {/* Instagram Card */}
          <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-3">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-tr from-amber-500 via-rose-500 to-purple-600 text-white">
                <InstagramIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Official Instagram</h3>
                <p className="text-[11px] text-slate-400">Giveaways, Clips &amp; Stories</p>
              </div>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Follow @harshnlimited on Instagram for rank giveaways, SMP highlights, and behind-the-scenes teasers.
            </p>
            <a
              href={SOCIAL_LINKS.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl font-bold text-xs bg-gradient-to-r from-[#833AB4] via-[#FD1D1D] to-[#F77737] hover:opacity-95 text-white transition-all shadow-md"
            >
              <InstagramIcon className="w-4 h-4" />
              <span>FOLLOW ON INSTAGRAM</span>
            </a>
          </div>

          <div className="glass-panel rounded-2xl p-5 border border-slate-800 space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <Clock className="w-4 h-4" />
              <span>Standard Response SLA</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Website tickets are reviewed within 2 to 12 hours. For immediate rank delivery or billing inquiry, have your Order ID handy.
            </p>
          </div>
        </div>

        {/* Web Ticket Form */}
        <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-800 lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div>
              <h2 className="text-xl font-bold text-white">Create a Support Ticket</h2>
              <p className="text-xs text-slate-400">Directly monitored by server administrators</p>
            </div>
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2.5 py-1 rounded border border-cyan-500/20 font-bold uppercase">
              1 Active Ticket Limit
            </span>
          </div>

          {/* Active Ticket Alert (If user already has 1 open ticket) */}
          {activeTicket && !success && (
            <div className="p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-3 shadow-lg shadow-amber-950/20">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                  <AlertCircle className="w-4 h-4" />
                  <span>Active Ticket in Progress</span>
                </div>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 font-mono px-2 py-0.5 rounded font-bold uppercase">
                  {activeTicket.status.replace("_", " ")}
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                To guarantee priority support and fast responses, each member can have only{" "}
                <strong className="text-white">1 active ticket</strong> at a time. You currently have an open discussion:
              </p>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-amber-500/20 text-xs text-white font-medium">
                &ldquo;{activeTicket.subject}&rdquo;
              </div>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <NextLink
                  href={`/tickets/${activeTicket.id}`}
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs inline-flex items-center gap-2 transition-all shadow-md shadow-cyan-950/30"
                >
                  <span>Open Active Ticket Conversation</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </NextLink>
                <span className="text-[11px] text-slate-500">
                  Resolve or close this ticket if you need to start a new subject.
                </span>
              </div>
            </div>
          )}

          {success ? (
            <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
              <h3 className="text-lg font-bold text-white">Ticket Submitted Successfully!</h3>
              <p className="text-xs text-slate-300 max-w-md mx-auto">
                Your support request has been logged. Our staff team will review and reply directly to your inquiry in real-time.
              </p>
              <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                {createdTicketId && (
                  <NextLink
                    href={`/tickets/${createdTicketId}`}
                    className="px-6 py-2.5 rounded-xl text-xs font-bold bg-cyan-400 hover:bg-cyan-300 text-slate-950 inline-flex items-center gap-2 shadow-lg shadow-cyan-900/30 transition-all"
                  >
                    <span>Open Ticket &amp; Live Chat With Staff</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </NextLink>
                )}
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
                  disabled={Boolean(activeTicket)}
                  placeholder="e.g. Issue with rank delivery for HU-ORD-20261025-XXXX"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors disabled:opacity-50"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1.5">Category</label>
                  <select
                    disabled={Boolean(activeTicket)}
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 disabled:opacity-50"
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
                    disabled={Boolean(activeTicket)}
                    value={priority}
                    onChange={(e) => setPriority(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 disabled:opacity-50"
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
                  disabled={Boolean(activeTicket)}
                  placeholder="Please describe your issue in detail. Include your Minecraft IGN and relevant order IDs if applicable..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors resize-none disabled:opacity-50"
                />
              </div>

              {error && (
                <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p>{error}</p>
                    {activeTicket && (
                      <NextLink
                        href={`/tickets/${activeTicket.id}`}
                        className="text-cyan-400 hover:text-cyan-300 font-bold inline-flex items-center gap-1"
                      >
                        <span>Open Your Current Ticket</span>
                        <ArrowRight className="w-3 h-3" />
                      </NextLink>
                    )}
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting || Boolean(activeTicket)}
                className="w-full py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:cursor-not-allowed text-slate-950 shadow-md shadow-emerald-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {submitting ? (
                  <span>Sending Ticket...</span>
                ) : activeTicket ? (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Active Ticket Already In Progress (Limit: 1 Ticket)</span>
                  </>
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
