"use client";

import { useState, Suspense } from "react";
import NextLink from "next/link";
import { useSearchParams } from "next/navigation";
import { Lock, Mail, ArrowRight, AlertCircle, ShieldAlert, Sparkles, KeyRound, Clock } from "lucide-react";

function LoginForm() {
  const searchParams = useSearchParams();
  const urlError = searchParams.get("error");
  const redirectParam = searchParams.get("redirect");
  const isTimeout = searchParams.get("reason") === "timeout";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isUnauthorizedAdmin = urlError === "UnauthorizedAdminAccess";

  const handleFillAdminCredentials = () => {
    setEmail("admin@harshunlimited.fun");
    setPassword("Admin@HarshUnlimited2026!");
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to sign in");
        setLoading(false);
        return;
      }

      if (redirectParam && redirectParam.startsWith("/")) {
        window.location.href = redirectParam;
      } else if (data?.user?.role === "ADMIN" || data?.user?.role === "SUPERADMIN") {
        window.location.href = "/admin";
      } else {
        window.location.href = "/dashboard";
      }
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred");
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel rounded-3xl p-8 sm:p-10 border border-slate-800 max-w-md w-full space-y-6 shadow-2xl relative">
      <div className="text-center space-y-2">
        <div className="w-14 h-14 rounded-2xl overflow-hidden border border-emerald-500/40 mx-auto shadow-lg shadow-emerald-500/20">
          <img src="/logo.png" alt="Harsh Unlimited" className="w-full h-full object-cover" />
        </div>
        <h1 className="text-2xl font-black text-white">Welcome Back</h1>
        <p className="text-xs text-slate-400">Sign in to your Harsh Unlimited account</p>
      </div>

      {isUnauthorizedAdmin && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-2.5">
          <div className="flex items-start gap-2.5 font-semibold">
            <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>Admin Sign-In Required</span>
          </div>
          <p className="text-[11px] text-amber-300/80 leading-relaxed">
            You must be signed in with an authorized Administrator account to view the Admin Control Panel.
          </p>
          <button
            type="button"
            onClick={handleFillAdminCredentials}
            className="w-full py-2 px-3 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Fill Admin Credentials</span>
          </button>
        </div>
      )}

      {isTimeout && (
        <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-200 text-xs space-y-1.5 animate-in fade-in">
          <div className="flex items-center gap-2 font-semibold">
            <Clock className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>Session Security Timeout</span>
          </div>
          <p className="text-[11px] text-cyan-300/80 leading-relaxed">
            Your previous session was automatically signed out due to inactivity to protect your account. Please log in again.
          </p>
        </div>
      )}

      {error && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5">
            Email Address
          </label>
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="email"
              required
              placeholder="name@domain.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-semibold text-slate-300">Password</label>
          </div>
          <div className="relative">
            <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="password"
              required
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 shadow-md shadow-emerald-500/20 transition-all cursor-pointer flex items-center justify-center gap-2"
        >
          {loading ? (
            <span>Authenticating...</span>
          ) : (
            <>
              <span>Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="text-center pt-2 border-t border-slate-800 text-xs text-slate-400">
        Don&apos;t have an account yet?{" "}
        <NextLink href="/register" className="text-emerald-400 hover:text-emerald-300 font-semibold">
          Create account
        </NextLink>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <Suspense fallback={<div className="text-slate-400 text-xs">Loading sign in...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
