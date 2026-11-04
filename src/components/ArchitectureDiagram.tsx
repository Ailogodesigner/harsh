"use client";

import { ShieldCheck, Server, Database, Globe, CreditCard, Cpu, ArrowRight, Zap, Radio } from "lucide-react";
import BorderBeam from "./ui/BorderBeam";

export default function ArchitectureDiagram() {
  const nodes = [
    {
      title: "Client / Device",
      role: "Global Visitors & Players",
      tech: "Next.js App / Desktop / Mobile",
      icon: Globe,
      accent: "from-purple-500/20 to-indigo-500/20",
      border: "border-purple-500/30",
      textAccent: "text-purple-300",
      status: "HTTP/3 • Zero-Lag",
    },
    {
      title: "Edge Gateway",
      role: "Cloudflare Workers / OpenNext",
      tech: "Sub-15ms Edge Caching • HSTS A+",
      icon: Radio,
      accent: "from-fuchsia-500/20 to-purple-500/20",
      border: "border-fuchsia-500/30",
      textAccent: "text-fuchsia-300",
      status: "Edge Verified",
    },
    {
      title: "App Core & APIs",
      role: "Next.js 16 Turbopack",
      tech: "React 19 RSC • JWT Auth • Zod",
      icon: Cpu,
      accent: "from-lime-500/20 to-emerald-500/20",
      border: "border-lime-500/40",
      textAccent: "text-lime-400",
      status: "Active Runtime",
    },
    {
      title: "Data Tier",
      role: "PostgreSQL & Prisma",
      tech: "Neon Serverless Pool • ACID",
      icon: Database,
      accent: "from-amber-500/20 to-yellow-500/20",
      border: "border-amber-500/30",
      textAccent: "text-amber-400",
      status: "Persistent Storage",
    },
    {
      title: "Payment Gateway",
      role: "Cashfree DevStudio & Webhooks",
      tech: "HMAC-SHA256 Verification • UPI",
      icon: CreditCard,
      accent: "from-rose-500/20 to-pink-500/20",
      border: "border-rose-500/30",
      textAccent: "text-rose-400",
      status: "Auto-Settlement",
    },
  ];

  return (
    <div className="w-full rounded-3xl border border-purple-500/25 bg-[#070611] p-6 sm:p-10 shadow-2xl shadow-purple-950/40 relative overflow-hidden text-left font-mono">
      {/* Skiper UI Border Beam */}
      <BorderBeam size={240} duration={14} colorFrom="#a855f7" colorTo="#a3e635" />

      {/* Decorative Grid Lines */}
      <div className="absolute inset-0 opacity-10 pointer-events-none bg-[radial-gradient(#a855f7_1px,transparent_1px)] [background-size:24px_24px]" />

      <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-purple-500/20 relative z-10">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-lime-400 animate-pulse shadow-[0_0_8px_rgba(163,230,53,0.7)]" />
            <h3 className="font-black text-white text-base sm:text-lg tracking-tight">
              Production Architecture Topology
            </h3>
          </div>
          <p className="text-xs text-purple-200/70 font-sans mt-0.5">
            Distributed multi-tier cloud infrastructure designed for high concurrency and sub-100ms global latency.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] px-2.5 py-1 rounded-full bg-[#0e0c1e] border border-purple-500/30 text-purple-300">
            Node: Edge Global
          </span>
          <span className="text-[11px] px-2.5 py-1 rounded-full bg-lime-500/10 border border-lime-500/30 text-lime-400 font-bold">
            Uptime: 99.99%
          </span>
        </div>
      </div>

      {/* Nodes Pipeline */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 pt-8 relative z-10">
        {nodes.map((node, i) => {
          const Icon = node.icon;
          return (
            <div key={node.title} className="relative flex flex-col justify-between">
              <div
                className={`p-5 rounded-2xl bg-gradient-to-b ${node.accent} border ${node.border} bg-slate-950/80 shadow-lg space-y-3 h-full flex flex-col justify-between hover:scale-[1.02] transition-transform`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center">
                      <Icon className={`w-4 h-4 ${node.textAccent}`} />
                    </div>
                    <span className="text-[10px] text-slate-500 font-mono">0{i + 1}</span>
                  </div>

                  <h4 className="font-bold text-white text-sm tracking-tight">{node.title}</h4>
                  <p className="text-[11px] text-slate-400 mt-1 font-sans">{node.role}</p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 space-y-1">
                  <div className="text-[10px] text-slate-300 font-mono leading-tight">{node.tech}</div>
                  <div className={`text-[10px] font-bold ${node.textAccent} flex items-center gap-1`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    <span>{node.status}</span>
                  </div>
                </div>
              </div>

              {/* Connecting arrow indicator for desktop */}
              {i < nodes.length - 1 && (
                <div className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-20 w-6 h-6 rounded-full bg-slate-900 border border-slate-700 items-center justify-center text-slate-400">
                  <ArrowRight className="w-3 h-3" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Benchmarks Footer Strip */}
      <div className="mt-8 pt-6 border-t border-purple-500/20 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center relative z-10">
        <div className="p-3 rounded-xl bg-[#090814] border border-purple-500/20">
          <div className="text-purple-300 font-black text-lg">12ms</div>
          <div className="text-[10px] text-purple-300/70">Edge Gateway Ping</div>
        </div>
        <div className="p-3 rounded-xl bg-[#090814] border border-purple-500/20">
          <div className="text-lime-400 font-black text-lg">A+ Grade</div>
          <div className="text-[10px] text-purple-300/70">CSP / HSTS Security</div>
        </div>
        <div className="p-3 rounded-xl bg-[#090814] border border-purple-500/20">
          <div className="text-fuchsia-400 font-black text-lg">SHA-256</div>
          <div className="text-[10px] text-purple-300/70">HMAC Webhooks</div>
        </div>
        <div className="p-3 rounded-xl bg-[#090814] border border-purple-500/20">
          <div className="text-amber-400 font-black text-lg">Zero-Wait</div>
          <div className="text-[10px] text-purple-300/70">Serverless Cold-Start</div>
        </div>
      </div>
    </div>
  );
}

