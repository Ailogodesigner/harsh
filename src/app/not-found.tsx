import Link from "next/link";
import { Terminal, ArrowLeft, Bot, ShieldAlert } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-screen bg-[#070512] text-slate-100 flex items-center justify-center p-4 relative overflow-hidden font-mono">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 translate-y-1/2 w-96 h-96 bg-lime-400/5 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 max-w-lg w-full bg-[#090818]/90 border border-purple-500/25 rounded-2xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl text-center space-y-6">
        <div className="inline-flex p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 text-lime-400 mb-2">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <div className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
            HTTP STATUS 404
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            Node Not Found
          </h1>
          <p className="text-sm text-slate-400 font-sans leading-relaxed">
            The requested cluster endpoint or legacy route no longer exists on the NOTIXNODE network.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#05040d] border border-purple-500/20 text-left text-xs space-y-1 font-mono text-slate-400">
          <div className="text-lime-400 flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5" />
            <span>DIAGNOSTIC TRACE</span>
          </div>
          <p className="text-slate-500 truncate">$ router.resolve(request.path) =&gt; NULL</p>
          <p className="text-slate-500">$ status: 404_NOT_FOUND</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Link
            href="/"
            className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-lime-400 text-black font-bold text-xs uppercase tracking-wider hover:bg-lime-300 transition-all shadow-[0_0_20px_rgba(163,230,53,0.3)]"
          >
            <ArrowLeft className="w-4 h-4" />
            Return Home
          </Link>
          <Link
            href="/bot-order"
            className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-purple-600/30 text-purple-200 border border-purple-500/40 font-bold text-xs uppercase tracking-wider hover:bg-purple-600/50 hover:text-white transition-all"
          >
            <Bot className="w-4 h-4" />
            Bot Configurator
          </Link>
        </div>
      </div>
    </main>
  );
}
