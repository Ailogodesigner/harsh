"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Lock,
  Mail,
  User,
  Shield,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  AlertCircle,
  KeyRound,
  Layers,
} from "lucide-react";
import DiscordIcon from "@/components/DiscordIcon";
import { playCyberClick, playCyberSuccess } from "@/components/ui/SoundEffects";

export default function LoginPage() {
  const router = useRouter();
  const [tab, setTab] = useState<"login" | "register" | "admin">("login");
  const [username, setUsername] = useState("");
  const [discordTag, setDiscordTag] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: tab === "admin" ? "admin_login" : tab,
          username,
          discordTag,
          email,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Authentication failed. Please verify credentials.");
      } else {
        playCyberSuccess();
        setSuccessMsg(data.message);

        if (tab === "admin") {
          localStorage.setItem("nn_admin_token", data.token);
          setTimeout(() => {
            router.push("/admin");
          }, 1000);
        } else {
          localStorage.setItem("nn_client_token", data.token);
          setTimeout(() => {
            router.push("/bot-order");
          }, 1200);
        }
      }
    } catch {
      setError("Network or server connection error.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#05050a] text-slate-100 flex flex-col justify-between relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] bg-purple-600/10 blur-[130px] rounded-full pointer-events-none" />

      {/* Header */}
      <header className="px-6 py-5 flex items-center justify-between border-b border-purple-500/20 bg-[#070512]/80 backdrop-blur-xl">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-purple-500 via-fuchsia-500 to-lime-400 p-[1px]">
            <div className="w-full h-full bg-[#0a0914] rounded-[11px] flex items-center justify-center font-black text-xs text-lime-400 font-mono">
              NN
            </div>
          </div>
          <span className="font-black text-white text-base tracking-tight group-hover:text-lime-400 transition-colors">
            NOTIXNODE
          </span>
        </Link>

        <a
          href="https://dsc.gg/notixnode"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-xs font-mono text-purple-300 hover:text-white"
        >
          <DiscordIcon className="w-4 h-4 text-[#5865F2]" />
          <span>dsc.gg/notixnode</span>
        </a>
      </header>

      {/* Main Auth Card Container */}
      <div className="max-w-md w-full mx-auto px-4 py-12 relative z-10">
        <div className="p-7 sm:p-9 rounded-3xl bg-[#0a071c] border border-purple-500/30 shadow-2xl relative">
          
          {/* Card Title & Description */}
          <div className="text-center space-y-2 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center mx-auto text-lime-400">
              {tab === "admin" ? <KeyRound className="w-6 h-6" /> : <Lock className="w-6 h-6" />}
            </div>
            <h2 className="text-2xl font-black text-white font-sans tracking-tight">
              {tab === "login" && "Client Login"}
              {tab === "register" && "Create Client Account"}
              {tab === "admin" && "Administrator Deck"}
            </h2>
            <p className="text-xs text-slate-400 font-sans">
              {tab === "admin"
                ? "Enter your secure master password to access system orders."
                : "Manage your custom bots, active hosting, and project specs."}
            </p>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="grid grid-cols-3 gap-1 p-1 rounded-xl bg-[#060410] border border-purple-500/20 mb-6 text-xs font-mono">
            <button
              type="button"
              onClick={() => {
                setTab("login");
                setError(null);
                setSuccessMsg(null);
                playCyberClick();
              }}
              className={`py-1.5 rounded-lg transition-colors cursor-pointer ${
                tab === "login"
                  ? "bg-purple-500/30 text-white font-bold border border-purple-500/50"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Login
            </button>
            <button
              type="button"
              onClick={() => {
                setTab("register");
                setError(null);
                setSuccessMsg(null);
                playCyberClick();
              }}
              className={`py-1.5 rounded-lg transition-colors cursor-pointer ${
                tab === "register"
                  ? "bg-purple-500/30 text-white font-bold border border-purple-500/50"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Register
            </button>
            <button
              type="button"
              onClick={() => {
                setTab("admin");
                setError(null);
                setSuccessMsg(null);
                playCyberClick();
              }}
              className={`py-1.5 rounded-lg transition-colors cursor-pointer ${
                tab === "admin"
                  ? "bg-lime-400/20 text-lime-400 font-bold border border-lime-400/40"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Admin
            </button>
          </div>

          {/* Alerts */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-lime-400/10 border border-lime-400/30 text-lime-300 text-xs flex items-center gap-2 font-mono">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-lime-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {tab === "register" && (
              <>
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Username
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-purple-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="e.g. shadow_coder"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#0e0c1f] border border-purple-500/30 focus:border-lime-400 focus:outline-none text-xs text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">
                    Discord Tag / Username
                  </label>
                  <div className="relative">
                    <DiscordIcon className="w-4 h-4 text-[#5865F2] absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      required
                      value={discordTag}
                      onChange={(e) => setDiscordTag(e.target.value)}
                      placeholder="e.g. shadow#0001 or shadow"
                      className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#0e0c1f] border border-purple-500/30 focus:border-lime-400 focus:outline-none text-xs text-white"
                    />
                  </div>
                </div>
              </>
            )}

            {tab !== "admin" && (
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-purple-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@example.com"
                    className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#0e0c1f] border border-purple-500/30 focus:border-lime-400 focus:outline-none text-xs text-white"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                {tab === "admin" ? "Master Administrator Password" : "Password"}
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-purple-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3.5 py-2.5 rounded-xl bg-[#0e0c1f] border border-purple-500/30 focus:border-lime-400 focus:outline-none text-xs text-white font-mono"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl bg-lime-400 hover:bg-lime-300 text-black font-bold text-xs uppercase tracking-wider font-mono shadow-[0_0_20px_rgba(163,230,53,0.3)] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-2"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>
                    {tab === "login" && "Sign In"}
                    {tab === "register" && "Create Account"}
                    {tab === "admin" && "Access Admin Deck"}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Bottom Footer Info */}
          <div className="mt-6 pt-4 border-t border-purple-500/15 text-center text-xs text-slate-400 font-sans">
            Need bot development immediately?{" "}
            <Link href="/bot-order" className="text-lime-400 hover:underline font-semibold">
              Open Bot Builder &rarr;
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-4 text-center text-[11px] font-mono text-slate-500 border-t border-purple-500/15">
        NOTIXNODE Authentication Sentinel • 256-Bit TLS End-to-End Encrypted
      </footer>
    </div>
  );
}
