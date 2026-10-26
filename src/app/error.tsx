"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Minecraft web application error caught by error boundary:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#06080E] text-slate-100 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-[#0D111D] border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6 shadow-2xl text-center">
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-7 h-7" />
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-black tracking-wider uppercase text-white">Something Went Wrong</h1>
          <p className="text-xs text-slate-400">
            A temporary client-side error occurred while rendering the page.
          </p>
        </div>

        {error?.message && (
          <div className="p-3 rounded-lg bg-black/40 border border-slate-800 text-left text-[11px] font-mono text-amber-300 break-words max-h-32 overflow-y-auto">
            {error.message}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={() => reset()}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-black font-bold text-xs transition shadow-lg shadow-emerald-500/20"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Try Again</span>
          </button>

          <Link
            href="/"
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-white text-xs font-semibold transition"
          >
            <Home className="w-3.5 h-3.5 text-emerald-400" />
            <span>Return Home</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
