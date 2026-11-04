"use client";

import { useState } from "react";
import { Terminal, Code, Cpu, Play, Check, Copy } from "lucide-react";
import BorderBeam from "./ui/BorderBeam";
import { playCyberClick, playCyberHover, playCyberSuccess } from "./ui/SoundEffects";

export default function HeroTerminal() {
  const [activeTab, setActiveTab] = useState<"code" | "architecture" | "cli">("code");
  const [copied, setCopied] = useState(false);

  // Interactive CLI state
  const [cliInput, setCliInput] = useState("");
  const [cliHistory, setCliHistory] = useState<Array<{ command: string; output: string }>>([
    {
      command: "whoami",
      output: "Aditya Kashyap — Full-Stack Web Developer & Systems Engineer",
    },
    {
      command: "stack --list",
      output: "Next.js 16 • React 19 • TypeScript • PostgreSQL • Cloudflare Edge • Cashfree PG",
    },
    {
      command: "help",
      output: "Available commands: whoami, skills, projects, contact, clear",
    },
  ]);

  const handleCliSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cmd = cliInput.trim().toLowerCase();
    if (!cmd) return;

    let output = "";
    if (cmd === "clear") {
      setCliHistory([]);
      setCliInput("");
      return;
    } else if (cmd === "whoami") {
      output = "Aditya Kashyap — Full-Stack Web Developer & Systems Architect (India / Remote).";
    } else if (cmd === "skills" || cmd === "stack") {
      output = "Frontend: React 19, Next.js 16, TypeScript, Tailwind 4\nBackend: Node.js, PostgreSQL, Prisma, WebSockets\nCloud: Cloudflare Workers, Edge Caching, OpenNext, Docker";
    } else if (cmd === "projects") {
      output = "1. Gaming E-Commerce & Telemetry Platform\n2. Real-Time Server Console & Log Parser\n3. Dynamic Live Radar Map\n4. Support Desk & Ticket Portal\n5. Cloudflare Edge Microservices";
    } else if (cmd === "contact" || cmd === "email") {
      output = "Email: dhruve123456789@gmail.com\nDiscord: discord.gg/notixnode\nStatus: Available immediately for freelance & full-time roles.";
    } else if (cmd === "sudo hire" || cmd === "hire") {
      output = "Access Granted! 🎉 Scroll to #contact or email dhruve123456789@gmail.com to start your project.";
    } else if (cmd === "help") {
      output = "Commands: whoami, skills, projects, contact, hire, clear";
    } else {
      output = `Command not recognized: "${cmd}". Type 'help' for available commands.`;
    }

    setCliHistory([...cliHistory, { command: cliInput, output }]);
    setCliInput("");
    playCyberSuccess();
  };

  const codeSnippet = `/**
 * @file AdityaKashyap.ts
 * @description Senior Full-Stack Engineer Profile
 */
export const developer: FullStackEngineer = {
  name: "Aditya Kashyap",
  title: "Full-Stack Web Developer & Systems Architect",
  location: "India (Available Worldwide Remote)",
  status: "🟢 Available for Hire",
  specialties: [
    "Next.js 16 App Router & Server Components",
    "High-Throughput E-Commerce & Payment Gateways",
    "Real-Time Telemetry & Log Stream Processors",
    "Cloudflare Edge Deployments & Zero-Cold-Start APIs",
    "Bulletproof Security Hardening (A+ HSTS / CSP)"
  ],
  metrics: {
    projectsShipped: 20,
    edgeLatencyMs: 12,
    codeIntegrityScore: 100,
    testCoverage: "Vitest Tested"
  },
  contact: {
    email: "dhruve123456789@gmail.com",
    discord: "discord.gg/notixnode"
  }
};`;

  const architectureSnippet = `// Edge Topology & Verification Pipeline
const systemTopology: CloudArchitecture = {
  edgeTier: {
    provider: "Cloudflare Workers / OpenNext",
    latency: "< 15ms globally",
    securityHeaders: "Strict HSTS (2y Preload) + CSP + COOP"
  },
  applicationCore: {
    framework: "Next.js 16.4 (Turbopack Engine)",
    renderer: "React 19 Server Components",
    typeSafety: "TypeScript 5.8 Strict"
  },
  dataLayer: {
    engine: "PostgreSQL with Neon Connection Pooler",
    orm: "Prisma Client (Driver Adapters)",
    durability: "ACID Compliant Transactions"
  },
  paymentPipeline: {
    gateway: "Cashfree DevStudio (UPI, Cards, Netbanking)",
    signature: "HMAC-SHA256 (Timestamp + Raw Body Payload)",
    delivery: "Zero-Downtime Entitlement Dispatch Queue"
  }
};`;

  const handleCopyCode = () => {
    const text = activeTab === "code" ? codeSnippet : architectureSnippet;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto rounded-3xl overflow-hidden border border-purple-500/30 bg-[#080713]/95 shadow-2xl shadow-purple-950/40 text-left font-mono relative">
      {/* Skiper UI Border Beam */}
      <BorderBeam size={220} duration={10} colorFrom="#a855f7" colorTo="#a3e635" />

      {/* Decorative corner HUD markers */}
      <span className="absolute top-2 left-3 text-[10px] text-purple-400/60 font-mono pointer-events-none">
        [SYS_DEV_TERMINAL]
      </span>
      <span className="absolute top-2 right-3 text-[10px] text-lime-400/80 font-mono pointer-events-none">
        PORT: 3000 // LIVE
      </span>

      {/* Terminal Titlebar */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#0d0c1e] border-b border-purple-500/20">
        {/* Left: Window Controls */}
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-rose-500/90 shadow-sm" />
          <div className="w-3 h-3 rounded-full bg-amber-500/90 shadow-sm" />
          <div className="w-3 h-3 rounded-full bg-lime-400 shadow-[0_0_8px_rgba(163,230,53,0.6)]" />
          <span className="text-xs text-purple-300/60 ml-2 font-mono hidden sm:inline">
            aditya@workstation: ~/portfolio
          </span>
        </div>

        {/* Center: Tabs */}
        <div className="flex items-center gap-1 bg-[#06050e] p-1 rounded-xl border border-purple-500/20">
          <button
            onClick={() => {
              setActiveTab("code");
              playCyberClick();
            }}
            onMouseEnter={() => playCyberHover()}
            className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "code"
                ? "bg-purple-600/30 text-purple-300 border border-purple-500/40 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Code className="w-3 h-3 text-purple-400" />
            <span>Profile.ts</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("architecture");
              playCyberClick();
            }}
            onMouseEnter={() => playCyberHover()}
            className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "architecture"
                ? "bg-lime-500/20 text-lime-300 border border-lime-500/40 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Cpu className="w-3 h-3 text-lime-400" />
            <span>Architecture.ts</span>
          </button>

          <button
            onClick={() => {
              setActiveTab("cli");
              playCyberClick();
            }}
            onMouseEnter={() => playCyberHover()}
            className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
              activeTab === "cli"
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Terminal className="w-3 h-3 text-amber-400" />
            <span>Interactive CLI</span>
          </button>
        </div>

        {/* Right: Copy Button */}
        <div>
          {activeTab !== "cli" && (
            <button
              onClick={() => {
                handleCopyCode();
                playCyberSuccess();
              }}
              onMouseEnter={() => playCyberHover()}
              className="p-1.5 rounded-lg bg-purple-500/10 border border-purple-500/30 hover:bg-purple-500/20 text-purple-300 hover:text-white transition-colors cursor-pointer text-xs flex items-center gap-1"
              title="Copy snippet"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>
          )}
        </div>
      </div>

      {/* Terminal Body */}
      <div className="p-4 sm:p-6 text-xs sm:text-[13px] leading-relaxed overflow-x-auto min-h-[300px] max-h-[360px] scrollbar-thin">
        {activeTab === "code" && (
          <div className="space-y-1">
            <span className="text-slate-500">// TypeScript 5.8 • Modern App Router Engine</span>
            <pre className="text-slate-300 font-mono">
              <span className="text-purple-400">export const</span>{" "}
              <span className="text-cyan-300 font-bold">developer</span>:{" "}
              <span className="text-amber-300">FullStackEngineer</span> = {"{\n"}
              {"  "}
              <span className="text-slate-400">name:</span>{" "}
              <span className="text-emerald-300">&quot;Aditya Kashyap&quot;</span>,{"\n"}
              {"  "}
              <span className="text-slate-400">role:</span>{" "}
              <span className="text-emerald-300">&quot;Full-Stack Web Developer &amp; Systems Architect&quot;</span>,{"\n"}
              {"  "}
              <span className="text-slate-400">stack:</span> [
              <span className="text-cyan-300">&quot;Next.js 16&quot;</span>,{" "}
              <span className="text-cyan-300">&quot;React 19&quot;</span>,{" "}
              <span className="text-cyan-300">&quot;TypeScript&quot;</span>,{" "}
              <span className="text-cyan-300">&quot;Node.js&quot;</span>,{" "}
              <span className="text-cyan-300">&quot;PostgreSQL&quot;</span>
              ],{"\n"}
              {"  "}
              <span className="text-slate-400">status:</span>{" "}
              <span className="text-emerald-400">&quot;🟢 Ready for Projects &amp; Contracts&quot;</span>,{"\n"}
              {"  "}
              <span className="text-slate-400">metrics:</span> {"{\n"}
              {"    "}
              <span className="text-slate-400">projectsShipped:</span>{" "}
              <span className="text-amber-400">20</span>,{"\n"}
              {"    "}
              <span className="text-slate-400">edgeLatencyMs:</span>{" "}
              <span className="text-amber-400">12</span>,{"\n"}
              {"    "}
              <span className="text-slate-400">securityGrade:</span>{" "}
              <span className="text-emerald-400">&quot;A+ (HSTS &amp; CSP Hardened)&quot;</span>
              {"\n"}
              {"  }"}
              ,{"\n"}
              {"  "}
              <span className="text-slate-400">contact:</span> {"{\n"}
              {"    "}
              <span className="text-slate-400">email:</span>{" "}
              <span className="text-cyan-300">&quot;dhruve123456789@gmail.com&quot;</span>,{"\n"}
              {"    "}
              <span className="text-slate-400">discord:</span>{" "}
              <span className="text-cyan-300">&quot;discord.gg/notixnode&quot;</span>
              {"\n"}
              {"  }"}
              {"\n}"};
            </pre>
          </div>
        )}

        {activeTab === "architecture" && (
          <div className="space-y-1">
            <span className="text-slate-500">// Distributed Cloud Edge &amp; Payment Topology</span>
            <pre className="text-slate-300 font-mono">
              <span className="text-purple-400">const</span>{" "}
              <span className="text-emerald-300 font-bold">systemTopology</span> = {"{\n"}
              {"  "}
              <span className="text-slate-400">edgeGateway:</span> {"{\n"}
              {"    "}
              <span className="text-slate-400">runtime:</span>{" "}
              <span className="text-emerald-300">&quot;Cloudflare Workers (OpenNext)&quot;</span>,{"\n"}
              {"    "}
              <span className="text-slate-400">globalLatency:</span>{" "}
              <span className="text-amber-300">&quot;&lt; 15ms globally&quot;</span>,{"\n"}
              {"    "}
              <span className="text-slate-400">securityShield:</span>{" "}
              <span className="text-emerald-300">&quot;Strict HSTS (2y Preload) + CSP + COOP&quot;</span>
              {"\n"}
              {"  }"}
              ,{"\n"}
              {"  "}
              <span className="text-slate-400">database:</span> {"{\n"}
              {"    "}
              <span className="text-slate-400">engine:</span>{" "}
              <span className="text-emerald-300">&quot;PostgreSQL (Neon Serverless Pool)&quot;</span>,{"\n"}
              {"    "}
              <span className="text-slate-400">orm:</span>{" "}
              <span className="text-emerald-300">&quot;Prisma 6 with Driver Adapters&quot;</span>
              {"\n"}
              {"  }"}
              ,{"\n"}
              {"  "}
              <span className="text-slate-400">paymentSecurity:</span> {"{\n"}
              {"    "}
              <span className="text-slate-400">verification:</span>{" "}
              <span className="text-cyan-300">&quot;HMAC-SHA256 (Timestamp + Payload)&quot;</span>,{"\n"}
              {"    "}
              <span className="text-slate-400">rateLimiter:</span>{" "}
              <span className="text-cyan-300">&quot;Sliding Window IP Lockout&quot;</span>
              {"\n"}
              {"  }"}
              {"\n}"};
            </pre>
          </div>
        )}

        {activeTab === "cli" && (
          <div className="space-y-3 font-mono">
            <div className="text-purple-400/60 text-[11px] pb-1 border-b border-purple-500/20 flex items-center justify-between">
              <span>Interactive Shell: type &apos;help&apos;, &apos;skills&apos;, &apos;projects&apos;, &apos;contact&apos;, &apos;clear&apos;</span>
              <span className="text-lime-400">● LIVE</span>
            </div>

            <div className="space-y-2">
              {cliHistory.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex items-center gap-2 text-lime-400">
                    <span className="text-purple-400">$</span>
                    <span>{item.command}</span>
                  </div>
                  <div className="text-slate-200 whitespace-pre-wrap pl-4 border-l border-purple-500/30 text-[12px]">
                    {item.output}
                  </div>
                </div>
              ))}
            </div>

            <form onSubmit={handleCliSubmit} className="flex items-center gap-2 pt-2">
              <span className="text-lime-400 font-bold">$</span>
              <input
                type="text"
                value={cliInput}
                onChange={(e) => setCliInput(e.target.value)}
                placeholder="type a command (e.g. skills, hire, whoami)..."
                className="w-full bg-transparent border-none text-white focus:outline-none text-xs font-mono placeholder:text-purple-300/40"
                autoFocus
              />
              <button
                type="submit"
                className="px-2.5 py-0.5 rounded bg-lime-400 hover:bg-lime-300 text-slate-950 font-bold text-[10px] cursor-pointer"
              >
                Run
              </button>
            </form>
          </div>
        )}
      </div>

      {/* Terminal Footer Status Bar */}
      <div className="flex flex-wrap items-center justify-between px-4 py-2 bg-[#06050e] border-t border-purple-500/20 text-[11px] text-purple-300/70 font-mono">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-lime-400">
            <span className="w-1.5 h-1.5 rounded-full bg-lime-400 animate-pulse" />
            <span>ONLINE</span>
          </span>
          <span>UTF-8</span>
          <span className="hidden sm:inline">TypeScript 5.8</span>
        </div>
        <div className="flex items-center gap-3">
          <span>Turbopack: Active</span>
          <span className="text-lime-400">Git: main</span>
        </div>
      </div>
    </div>
  );
}

