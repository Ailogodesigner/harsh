"use client";

import { useState } from "react";
import PortfolioNavbar from "@/components/PortfolioNavbar";
import PortfolioFooter from "@/components/PortfolioFooter";
import CopyButton from "@/components/CopyButton";
import GithubIcon from "@/components/GithubIcon";
import HeroTerminal from "@/components/HeroTerminal";
import ArchitectureDiagram from "@/components/ArchitectureDiagram";
import GithubCommitHeatmap from "@/components/GithubCommitHeatmap";
import CursorAura from "@/components/ui/CursorAura";
import DynamicIslandDock from "@/components/ui/DynamicIslandDock";
import TextScramble from "@/components/ui/TextScramble";
import InfiniteMarquee from "@/components/ui/InfiniteMarquee";
import SpotlightCard from "@/components/ui/SpotlightCard";
import TiltCard from "@/components/ui/TiltCard";
import BorderBeam from "@/components/ui/BorderBeam";
import { MacbookScroll } from "@/components/ui/macbook-scroll";
import { ThreeDCardDemo } from "@/components/ThreeDCardDemo";
import { BackgroundLines } from "@/components/ui/background-lines";
import { ContainerTextFlip } from "@/components/ui/container-text-flip";
import { FocusCards } from "@/components/ui/focus-cards";
import { ExpandableCards } from "@/components/ui/expandable-card";
import { Skiper52 } from "@/components/ui/Skiper52";
import { playCyberClick, playCyberHover, playCyberSuccess } from "@/components/ui/SoundEffects";
import {
  Briefcase,
  Code2,
  Terminal,
  Server,
  Zap,
  Shield,
  Layers,
  ExternalLink,
  Mail,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  Send,
  Database,
  Globe,
  Compass,
  Cpu,
  Lock,
  Boxes,
  FileCode,
  Check,
} from "lucide-react";

export default function PortfolioPage() {
  // Contact Form State
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    projectType: "Full-Stack Web App",
    budget: "$500 - $1,500 (₹40,000 - ₹1,20,000)",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setSubmitStatus(null);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formState),
      });

      const data = await res.json();
      if (res.ok) {
        setSubmitStatus({ success: true, message: data.message });
        playCyberSuccess();
        setFormState({
          name: "",
          email: "",
          projectType: "Full-Stack Web App",
          budget: "$500 - $1,500 (₹40,000 - ₹1,20,000)",
          message: "",
        });
      } else {
        setSubmitStatus({
          success: false,
          message: data.error || "Failed to send message. Please try again.",
        });
      }
    } catch {
      setSubmitStatus({
        success: false,
        message: "Failed to dispatch message. You can also email directly at dhruve123456789@gmail.com",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const projects = [
    {
      title: "Harsh Unlimited — Gaming E-Commerce & Telemetry Platform",
      tagline: "High-throughput server store, automated Cashfree payment gateway, live player telemetry (9/100 concurrency), and Pterodactyl console bridge.",
      tech: ["Next.js 16", "React 19", "TypeScript", "PostgreSQL", "Prisma", "Cashfree PG", "REST APIs"],
      category: "Full-Stack & E-Commerce",
      description:
        "Engineered a production-ready Minecraft network management and store platform for Harsh Unlimited. Built with Next.js App Router, integrating Cashfree DevStudio for automated UPI/card checkout, HMAC-SHA256 signature verification, and automated rank delivery via Pterodactyl console bridge. Features live server status telemetry (player counts, ping metrics) and interactive chest item preview GUIs.",
      highlights: [
        "Server-side payment verification & raw webhook deduplication",
        "Pterodactyl 1.x REST API integration with 3x SSL handshake backoff resilience",
        "Live server MOTD & player telemetry tracking with sub-second polling",
        "Interactive Minecraft chest GUI modal with sound effects and enchantment tooltips",
        "Sub-150ms TTFB on global edge with zero-layout-shift UI",
      ],
      github: "https://github.com/Ailogodesigner",
    },
    {
      title: "Real-Time Server Console & Log Parser",
      tagline: "High-volume stream tailer with balanced event parsing and zero-lag web display.",
      tech: ["Node.js", "WebSockets", "Stream Processing", "Regex Parsing", "In-Memory Caching"],
      category: "Systems & Backend",
      description:
        "Architected an ultra-resilient administrative log streaming pipeline that ingests continuous console output from remote server nodes. Features in-memory caching to eliminate redundant downloads, automated retry loops against upstream transient hiccups, and balanced event classification.",
      highlights: [
        "In-memory stream cache with 3.5-second TTL eliminating redundant 800KB log downloads",
        "Balanced chronological distribution so high command activity never drowns player chats",
        "Strict regex parsing for player chats, broadcasts, join/leave events, and system alerts",
        "Sensitive credential scrubbing and production stack trace masking",
      ],
      github: "https://github.com/Ailogodesigner",
    },
    {
      title: "Dynamic Live Radar & Landmark Coordinates Map",
      tagline: "Interactive HTML5 canvas radar map with coordinate triangulation and landmark coordinates.",
      tech: ["React 19", "HTML5 Canvas", "Vector Math", "Tailwind CSS", "Client State"],
      category: "Frontend & Graphics",
      description:
        "Developed a fluid, interactive web map and radar component for open-world gaming servers. Renders an interactive radar display with smooth pan, zoom, landmark pinpoints, and live player coordinate inputs, eliminating the need for heavy resource-intensive map renderers.",
      highlights: [
        "HTML5 Canvas vector rendering with crosshairs, distance rings, and landmark nodes",
        "Dynamic distance calculator plotting Cartesian world coordinates to pixel radar points",
        "Interactive pan, zoom slider, center-reset controls, and custom pin creator",
        "Responsive, mobile-optimized touch navigation with 60 FPS fluid rendering",
      ],
      github: "https://github.com/Ailogodesigner",
    },
    {
      title: "Enterprise Support Desk & Live Ticket Workflow",
      tagline: "Real-time customer support platform with status workflows and role-based permissions.",
      tech: ["Next.js App Router", "Prisma ORM", "RBAC Security", "Audit Logging", "Zod"],
      category: "SaaS & Dashboard",
      description:
        "Built an interactive customer support ticket portal allowing authenticated users to open tickets, chat with staff in real time, upload attachments, and track issue resolution. Features administrative priority tagging, status toggles (OPEN, IN_PROGRESS, RESOLVED, CLOSED), and full audit logging.",
      highlights: [
        "Real-time ticket conversation threads with double-tick delivery indicators",
        "Role-Based Access Control (RBAC) ensuring players only access their personal tickets",
        "Administrative priority triage, status transitions, and quick response shortcuts",
        "Automated audit logging of all administrative status changes and notes",
      ],
      github: "https://github.com/Ailogodesigner",
    },
    {
      title: "Serverless Cloudflare Edge Worker & Security Gateway",
      tagline: "High-speed edge deployment with A+ security headers and automated caching.",
      tech: ["Cloudflare Workers", "OpenNext", "Edge Computing", "HSTS / CSP", "Vitest"],
      category: "DevOps & Cloud",
      description:
        "Architected an OpenNext serverless deployment pipeline targeting Cloudflare Workers. Implemented rigorous security headers (HSTS preload, Content-Security-Policy, COOP, and X-Content-Type-Options) achieving an A+ security grade, accompanied by automated Vitest regression suites.",
      highlights: [
        "A+ Security Rating with HSTS 2-year preload, strict CSP, and cross-origin isolation",
        "Zero-cold-start edge distribution with Cloudflare Workerd and WASM bindings",
        "Automated Vitest test suite covering payment signatures, token auth, and RBAC",
        "Dynamic sitemap generator and robots.txt for 100% Google Search Console indexing",
      ],
      github: "https://github.com/Ailogodesigner",
    },
  ];

  const skillCategories = [
    {
      title: "Frontend Engineering",
      icon: Code2,
      skills: [
        { name: "React 19 & Next.js 16", level: "Expert" },
        { name: "TypeScript (Strict)", level: "Expert" },
        { name: "Tailwind CSS & CSS Grid", level: "Expert" },
        { name: "App Router & Server Components", level: "Advanced" },
        { name: "HTML5 Canvas & Vector Math", level: "Advanced" },
        { name: "Responsive & Mobile-First UI", level: "Expert" },
      ],
    },
    {
      title: "Backend & Systems",
      icon: Server,
      skills: [
        { name: "Node.js & Edge Runtime", level: "Expert" },
        { name: "PostgreSQL & Neon DB", level: "Advanced" },
        { name: "Prisma ORM & Schema Design", level: "Advanced" },
        { name: "RESTful API Architecture", level: "Expert" },
        { name: "WebSockets & Stream Processing", level: "Advanced" },
        { name: "Microservices & Webhooks", level: "Expert" },
      ],
    },
    {
      title: "Cloud & DevOps",
      icon: Globe,
      skills: [
        { name: "Cloudflare Workers & Pages", level: "Advanced" },
        { name: "OpenNext & Vercel Deployments", level: "Advanced" },
        { name: "Docker & Containerization", level: "Intermediate" },
        { name: "Git, GitHub & Version Control", level: "Expert" },
        { name: "DNS, SSL & Domain Routing", level: "Advanced" },
        { name: "CI/CD & Automated Testing", level: "Advanced" },
      ],
    },
    {
      title: "Security & Payments",
      icon: Shield,
      skills: [
        { name: "Cashfree & UPI Payment Gateways", level: "Expert" },
        { name: "HMAC-SHA256 Webhook Verification", level: "Expert" },
        { name: "JWT Auth & Session Revocation", level: "Advanced" },
        { name: "HSTS, CSP & Security Hardening (A+)", level: "Expert" },
        { name: "Rate Limiting & Anti-Brute-Force", level: "Advanced" },
        { name: "Vitest & Unit Testing", level: "Advanced" },
      ],
    },
  ];

  const services = [
    {
      title: "Full-Stack Web App Development",
      description:
        "Building responsive, blazing-fast web applications from architecture to deployment using Next.js, React 19, TypeScript, and modern styling.",
      icon: Boxes,
      badge: "Flagship",
    },
    {
      title: "E-Commerce & Automated Payment Gateways",
      description:
        "Custom webstores with Indian UPI, Cashfree, and international gateways. Includes automated entitlement delivery, webhook verification, and digital invoicing.",
      icon: Zap,
      badge: "High Demand",
    },
    {
      title: "API Design, Integrations & Real-Time Telemetry",
      description:
        "Connecting web platforms to remote servers, databases, and third-party APIs (Pterodactyl, Discord bots, analytics) with real-time log tailing and telemetry.",
      icon: Terminal,
      badge: "Specialized",
    },
    {
      title: "Security Auditing & Performance Optimization",
      description:
        "Hardening web security to A+ standards (CSP, HSTS, JWT tokens), optimizing Core Web Vitals, eliminating server bottlenecks, and setting up SEO indexing.",
      icon: Lock,
      badge: "Quality",
    },
  ];

  return (
    <div className="min-h-screen bg-[#05050a] text-slate-100 selection:bg-lime-400 selection:text-black relative">
      {/* AnimMasterLib Interactive Cursor Aura */}
      <CursorAura />

      {/* Skiper UI Dynamic Island Floating Dock */}
      <DynamicIslandDock />

      <PortfolioNavbar />

      {/* ========================================================================= */}
      {/* 1. HERO SECTION WITH ACETERNITY BACKGROUND LINES                         */}
      {/* ========================================================================= */}
      <section className="relative pt-24 pb-16 md:pt-32 md:pb-24 overflow-hidden">
        <BackgroundLines className="py-6">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
            <div className="flex flex-col items-center text-center space-y-6 max-w-3xl mx-auto">
              {/* Top Pill with Skiper Text Scramble */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#0c0a1b]/90 border border-purple-500/30 shadow-inner backdrop-blur-md">
                <span className="w-2 h-2 rounded-full bg-lime-400 animate-pulse shadow-[0_0_8px_rgba(163,230,53,0.8)]" />
                <TextScramble
                  text="Full-Stack Web Developer & Systems Architect"
                  className="text-xs font-semibold text-purple-200"
                />
              </div>

              {/* Main Headline with Aceternity ContainerTextFlip */}
              <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-white leading-[1.15] flex flex-wrap items-center justify-center gap-3">
                <span>Architecting</span>
                <ContainerTextFlip
                  words={["High-Performance", "Zero-Cold-Start", "Battle-Tested", "Ultra-Scalable"]}
                />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-fuchsia-300 to-lime-400">
                  Digital Systems.
                </span>
              </h1>

              {/* Subheading */}
              <p className="text-sm sm:text-base md:text-lg text-slate-300 leading-relaxed max-w-2xl font-normal">
                Hi, I&apos;m <span className="text-white font-semibold">Aditya Kashyap</span>. I build scalable full-stack
                applications, automated payment engines, real-time telemetry systems, and edge infrastructure with clean,
                battle-tested code.
              </p>

              {/* CTA Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                <a
                  href="#projects"
                  onClick={() => playCyberClick()}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs sm:text-sm text-slate-950 bg-gradient-to-r from-purple-400 via-fuchsia-400 to-lime-400 hover:brightness-110 shadow-lg shadow-purple-500/25 transition-all active:scale-95 cursor-pointer"
                >
                  <span>Explore Featured Work</span>
                  <ArrowRight className="w-4 h-4" />
                </a>

                <a
                  href="#macbook"
                  onClick={() => playCyberClick()}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-xs sm:text-sm text-purple-200 bg-[#0c0b1a] hover:bg-[#151228] border border-purple-500/30 hover:border-lime-400/50 transition-all active:scale-95 cursor-pointer"
                >
                  <Cpu className="w-4 h-4 text-lime-400" />
                  <span>3D MacBook Live View</span>
                </a>

                <CopyButton
                  textToCopy="dhruve123456789@gmail.com"
                  label="Copy Email"
                  copiedLabel="Email Copied!"
                  className="py-3 px-4 text-xs sm:text-sm"
                />
              </div>

              {/* Developer GFX: Interactive Terminal & Code Workstation */}
              <div className="w-full pt-6 pb-2">
                <HeroTerminal />
              </div>

              {/* Metric Strip */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full pt-8 border-t border-purple-500/20 mt-6">
                <div className="p-4 rounded-2xl bg-[#090815] border border-purple-500/20 text-left">
                  <div className="text-2xl sm:text-3xl font-black text-purple-300 font-mono">3+</div>
                  <div className="text-xs text-purple-200/70 font-medium mt-0.5">Years Developing</div>
                </div>
                <div className="p-4 rounded-2xl bg-[#090815] border border-purple-500/20 text-left">
                  <div className="text-2xl sm:text-3xl font-black text-lime-400 font-mono">20+</div>
                  <div className="text-xs text-purple-200/70 font-medium mt-0.5">Projects Delivered</div>
                </div>
                <div className="p-4 rounded-2xl bg-[#090815] border border-purple-500/20 text-left">
                  <div className="text-2xl sm:text-3xl font-black text-amber-400 font-mono">100%</div>
                  <div className="text-xs text-purple-200/70 font-medium mt-0.5">A+ Security &amp; SEO</div>
                </div>
                <div className="p-4 rounded-2xl bg-[#090815] border border-purple-500/20 text-left">
                  <div className="text-2xl sm:text-3xl font-black text-fuchsia-400 font-mono">&lt;150ms</div>
                  <div className="text-xs text-purple-200/70 font-medium mt-0.5">Global Edge TTFB</div>
                </div>
              </div>
            </div>
          </div>
        </BackgroundLines>
      </section>

      {/* Skiper UI Infinite Tech Marquee Ticker */}
      <div className="border-y border-purple-500/20 bg-[#070611]">
        <InfiniteMarquee
          items={[
            { label: "Next.js 16.4", tag: "Turbopack" },
            { label: "React 19", tag: "RSC Streaming" },
            { label: "TypeScript 5.8", tag: "Strict Mode" },
            { label: "Cloudflare Edge", tag: "Sub-15ms" },
            { label: "PostgreSQL", tag: "Neon Pool" },
            { label: "Prisma ORM", tag: "Driver Adapters" },
            { label: "Cashfree DevStudio", tag: "Instant UPI" },
            { label: "WebSockets", tag: "Real-Time Telemetry" },
            { label: "HMAC-SHA256", tag: "Webhook Security" },
            { label: "Vitest TDD", tag: "100% Passes" },
            { label: "Tailwind CSS v4", tag: "Modern Styling" },
          ]}
          speed={26}
        />
      </div>

      {/* ========================================================================= */}
      {/* 2. ABOUT ME SECTION                                                      */}
      {/* ========================================================================= */}
      <section id="about" className="py-20 border-t border-purple-500/20 relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Bio Card */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-xs font-semibold text-purple-300">
                <Sparkles className="w-3.5 h-3.5 text-lime-400" />
                <span>About Aditya</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                Architecting modern software with a relentless focus on{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-fuchsia-300 to-lime-400">
                  speed, security, and developer craftsmanship.
                </span>
              </h2>

              <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
                I am a full-stack engineer driven by building applications that are not just visually refined, but
                structurally rock-solid under the hood. From designing low-latency serverless edge workers to crafting
                frictionless e-commerce checkout flows with automated rank delivery, I bridge modern frontend
                micro-interactions with robust backend data pipelines.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <SpotlightCard
                  spotlightColor="rgba(163, 230, 53, 0.15)"
                  borderColor="rgba(163, 230, 53, 0.4)"
                  className="p-4 rounded-2xl bg-[#090815] border border-purple-500/20 space-y-1"
                >
                  <div className="flex items-center gap-2 text-lime-400 font-bold text-sm">
                    <Zap className="w-4 h-4" />
                    <span>Performance First</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Optimized for sub-second page loads, minimal client bundle sizes, and 99+ Core Web Vitals.
                  </p>
                </SpotlightCard>

                <SpotlightCard
                  spotlightColor="rgba(168, 85, 247, 0.15)"
                  borderColor="rgba(168, 85, 247, 0.4)"
                  className="p-4 rounded-2xl bg-[#090815] border border-purple-500/20 space-y-1"
                >
                  <div className="flex items-center gap-2 text-purple-300 font-bold text-sm">
                    <Shield className="w-4 h-4 text-purple-400" />
                    <span>Bulletproof Security</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    HSTS preload, strict CSP policies, cryptographic HMAC webhook signatures, and RBAC authentication.
                  </p>
                </SpotlightCard>
              </div>
            </div>

            {/* Right Interactive Highlights Card */}
            <div className="lg:col-span-5">
              <SpotlightCard
                spotlightColor="rgba(168, 85, 247, 0.18)"
                borderColor="rgba(168, 85, 247, 0.35)"
                className="p-6 sm:p-8 rounded-3xl border border-purple-500/25 shadow-2xl relative overflow-hidden bg-gradient-to-br from-[#0c0a1b] via-[#090815] to-[#070611]"
              >
                <div className="flex items-center justify-between pb-4 border-b border-purple-500/20">
                  <span className="text-xs font-mono font-bold text-purple-300 uppercase tracking-wider">
                    Core Engineering Highlights
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-lime-500/10 text-lime-400 border border-lime-500/30">
                    2026 Production Ready
                  </span>
                </div>

                <div className="space-y-4 pt-4 text-xs">
                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-lime-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-200">Modern Next.js 16 &amp; React 19 Mastery:</span>
                      <p className="text-slate-400 text-[11px] mt-0.5">
                        Deep expertise in React Server Components, Suspense streaming, and Turbopack pipelines.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-lime-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-200">Automated Payment &amp; Entitlement Gateways:</span>
                      <p className="text-slate-400 text-[11px] mt-0.5">
                        Cashfree DevStudio, UPI QR, and Stripe checkout pipelines with zero-duplicate delivery jobs.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-lime-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-200">Cloudflare Edge &amp; Database Architecture:</span>
                      <p className="text-slate-400 text-[11px] mt-0.5">
                        PostgreSQL data modeling with Prisma, serverless Neon adapter connection pooling, and OpenNext edge workers.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <CheckCircle2 className="w-4 h-4 text-lime-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold text-slate-200">Real-Time Telemetry &amp; Log Streaming:</span>
                      <p className="text-slate-400 text-[11px] mt-0.5">
                        Low-latency log tailers, WebSocket streams, and custom regex event classification engines.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-5 border-t border-purple-500/20 flex items-center justify-between text-xs">
                  <span className="text-purple-300/80">Open to freelance &amp; remote contracts:</span>
                  <a
                    href="#contact"
                    className="font-bold text-lime-400 hover:text-lime-300 flex items-center gap-1"
                  >
                    <span>Connect</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </a>
                </div>
              </SpotlightCard>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2.5 CLOUD ARCHITECTURE & SYSTEM TOPOLOGY (GFX)                            */}
      {/* ========================================================================= */}
      <section id="architecture" className="py-20 border-t border-purple-500/20 relative cyber-grid">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <ArchitectureDiagram />
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 2.8 FEY.COM STYLE 3D MACBOOK SCROLL (HARDWARE ENGINE)                     */}
      {/* ========================================================================= */}
      <section id="macbook" className="border-t border-purple-500/20 bg-[#06050e] relative overflow-hidden py-16">
        <MacbookScroll
          badge={
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-lime-500/10 border border-lime-500/30 text-xs font-mono text-lime-400">
              <span className="w-2 h-2 rounded-full bg-lime-400 animate-pulse" />
              <span>Fey.com 3D Hardware Telemetry</span>
            </div>
          }
          title="Hardware-Accelerated Engineering Across Every Display"
        />
      </section>

      {/* ========================================================================= */}
      {/* 2.9 SKIPER 52 HOVER-EXPAND SYSTEM GALLERY                                */}
      {/* ========================================================================= */}
      <section className="py-16 border-t border-purple-500/20 bg-[#070611] relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 text-center space-y-3 mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-xs font-semibold text-purple-300">
            <Sparkles className="w-3.5 h-3.5 text-lime-400" />
            <span>Skiper UI • Interactive Stack Showcase</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight">
            Hover to Expand Core Architecture Pillars
          </h2>
          <p className="text-xs sm:text-sm text-purple-200/70 font-mono">
            Interactive multi-panel accordions with dynamic spring physics.
          </p>
        </div>
        <Skiper52 />
      </section>

      {/* ========================================================================= */}
      {/* 3. FEATURED PROJECTS SHOWCASE                                            */}
      {/* ========================================================================= */}
      {/* ========================================================================= */}
      <section id="projects" className="py-20 border-t border-purple-500/20 relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center space-y-3 max-w-2xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-xs font-semibold text-purple-300">
              <Briefcase className="w-3.5 h-3.5 text-lime-400" />
              <span>Proven Work &amp; Architecture</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Featured Case Studies &amp; Projects
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Explore real-world software platforms, full-stack applications, and backend systems I&apos;ve designed, built, and shipped.
            </p>
          </div>

          <div className="space-y-12">
            {projects.map((proj, idx) => (
              <TiltCard key={proj.title} maxTilt={5} glareColor="rgba(168, 85, 247, 0.18)">
                <div
                  className="glass-panel hud-bracket p-6 sm:p-10 rounded-3xl border border-purple-500/20 shadow-2xl relative overflow-hidden bg-gradient-to-b from-[#0a0918] via-[#0d0a1f] to-[#070611] transition-all duration-300 hover:border-lime-400/40"
                >
                  {/* Highlight BorderBeam on Flagship Project */}
                  {idx === 0 && (
                    <BorderBeam size={280} duration={12} colorFrom="#a3e635" colorTo="#a855f7" />
                  )}

                  <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-purple-500/20">
                    <div className="flex items-center gap-3">
                      <span className="w-8 h-8 rounded-xl bg-[#0c0a1c] border border-purple-500/30 flex items-center justify-center font-mono font-bold text-xs text-lime-400">
                        0{idx + 1}
                      </span>
                      <div>
                        <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-purple-300">
                          {proj.category}
                        </span>
                        <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                          {proj.title}
                        </h3>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <a
                        href="#architecture"
                        onClick={() => playCyberClick()}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0e0c1f] border border-purple-500/30 hover:border-lime-400/40 text-xs font-medium text-lime-400 hover:text-white transition-colors"
                      >
                        <span>Inspect Architecture</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-6">
                    {/* Left Column: Description & Highlights */}
                    <div className="lg:col-span-8 space-y-4">
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                        {proj.description}
                      </p>

                      <div className="space-y-2 pt-2">
                        <span className="text-xs font-bold font-mono text-purple-300 uppercase tracking-wider block">
                          Key Engineering Highlights:
                        </span>
                        <ul className="space-y-2">
                          {proj.highlights.map((hl) => (
                            <li key={hl} className="flex items-start gap-2.5 text-xs text-slate-300">
                              <Check className="w-4 h-4 text-lime-400 shrink-0 mt-0.5" />
                              <span>{hl}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Right Column: Tech Stack Tags & Meta */}
                    <div className="lg:col-span-4 bg-[#090815]/90 p-5 rounded-2xl border border-purple-500/20 space-y-4">
                      <div>
                        <span className="text-[11px] font-mono font-semibold text-purple-300 uppercase tracking-wider block mb-2">
                          Technologies Used:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {proj.tech.map((t) => (
                            <span
                              key={t}
                              className="px-2.5 py-1 rounded-lg text-[11px] font-mono font-medium bg-[#0f0d23] border border-purple-500/30 text-lime-300"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="pt-3 border-t border-purple-500/20 text-[11px] text-purple-300/70 space-y-1">
                        <div className="flex items-center justify-between">
                          <span>Architecture:</span>
                          <span className="text-slate-200 font-mono">Serverless Edge &amp; Full-Stack</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Role:</span>
                          <span className="text-slate-200 font-mono">Lead Full-Stack Engineer</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </TiltCard>
            ))}
          </div>

          {/* Aceternity UI Focus Cards */}
          <div className="pt-16">
            <div className="text-center space-y-2 mb-8">
              <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-lime-500/10 border border-lime-500/30 text-lime-400 font-bold uppercase">
                Aceternity Focus Cards
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Interactive Multi-Product Focus Matrix
              </h3>
              <p className="text-xs text-purple-300/80 font-mono">
                Hover over a card to focus details while siblings blur dynamically.
              </p>
            </div>
            <FocusCards
              cards={[
                {
                  title: "Harsh Unlimited Store",
                  tagline: "Instant Cashfree UPI checkout, live telemetry, and Pterodactyl bridge.",
                  category: "E-Commerce & Gaming",
                  stats: "9/100 Peak Players",
                  src: "/images/harsh-unlimited.svg",
                },
                {
                  title: "Real-Time Log Tailer",
                  tagline: "High-volume stream tailer with 3.5s in-memory cache and zero-lag regex parsing.",
                  category: "Systems & Streams",
                  stats: "< 5ms Latency",
                  src: "/images/log-tailer.svg",
                },
                {
                  title: "Dynamic Radar & Map",
                  tagline: "Interactive HTML5 canvas radar map with coordinate triangulation and landmark pins.",
                  category: "Frontend & Canvas",
                  stats: "60 FPS Fluid",
                  src: "/images/radar-map.svg",
                },
              ]}
            />
          </div>

          {/* Aceternity UI Expandable Cards Specification Inspector */}
          <div className="pt-16 border-t border-purple-500/20 mt-16">
            <div className="text-center space-y-2 mb-8">
              <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 font-bold uppercase">
                Aceternity Expandable Cards
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Detailed Technical Specifications Inspector
              </h3>
              <p className="text-xs text-purple-300/80 font-mono">
                Click any architecture card to expand comprehensive benchmarks on-site with zero external redirects.
              </p>
            </div>
            <ExpandableCards items={projects} />
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. SKILLS & TECH STACK BENTO                                             */}
      {/* ========================================================================= */}
      <section id="skills" className="py-20 border-t border-purple-500/20 relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center space-y-3 max-w-2xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-xs font-semibold text-purple-300">
              <Layers className="w-3.5 h-3.5 text-lime-400" />
              <span>Full-Stack Capabilities</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Technical Stack &amp; Skills
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              A comprehensive toolkit of languages, frameworks, databases, and deployment platforms I use to build scalable products.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {skillCategories.map((cat) => {
              const Icon = cat.icon;
              return (
                <SpotlightCard
                  key={cat.title}
                  spotlightColor="rgba(168, 85, 247, 0.15)"
                  borderColor="rgba(168, 85, 247, 0.35)"
                  className="p-6 sm:p-8 rounded-3xl border border-purple-500/20 bg-gradient-to-b from-[#0a0918] via-[#090815] to-[#070611] shadow-xl"
                >
                  <div className="flex items-center gap-3 pb-5 border-b border-purple-500/20">
                    <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/25 flex items-center justify-center text-lime-400">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-black text-white text-lg tracking-tight">
                      {cat.title}
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-5">
                    {cat.skills.map((s) => (
                      <div
                        key={s.name}
                        className="p-3 rounded-xl bg-[#0e0c1f] border border-purple-500/20 flex items-center justify-between hover:border-lime-400/40 transition-colors"
                      >
                        <span className="text-xs font-semibold text-slate-200">
                          {s.name}
                        </span>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#15122b] text-lime-300 border border-purple-500/30">
                          {s.level}
                        </span>
                      </div>
                    ))}
                  </div>
                </SpotlightCard>
              );
            })}
          </div>

          {/* GitHub Activity & Commit Heatmap GFX */}
          <div className="mt-12">
            <GithubCommitHeatmap />
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. SERVICES / WHAT I OFFER                                              */}
      {/* ========================================================================= */}
      <section id="services" className="py-20 border-t border-purple-500/20 relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center space-y-3 max-w-2xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-xs font-semibold text-purple-300">
              <Sparkles className="w-3.5 h-3.5 text-lime-400" />
              <span>Client Services</span>
            </div>
            <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
              Services &amp; What I Deliver
            </h2>
            <p className="text-sm text-slate-300 leading-relaxed">
              Available for freelance contracts, full-stack product builds, and consulting for startups and creators.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((svc) => {
              const Icon = svc.icon;
              return (
                <SpotlightCard
                  key={svc.title}
                  spotlightColor="rgba(168, 85, 247, 0.16)"
                  borderColor="rgba(168, 85, 247, 0.35)"
                  className="p-6 rounded-3xl bg-[#090815] border border-purple-500/20 hover:border-lime-400/40 transition-all flex flex-col justify-between space-y-4 shadow-xl"
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="w-11 h-11 rounded-2xl bg-purple-500/10 border border-purple-500/25 flex items-center justify-center text-lime-400">
                        <Icon className="w-5 h-5" />
                      </div>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#120f26] border border-purple-500/30 text-purple-300">
                        {svc.badge}
                      </span>
                    </div>

                    <h3 className="font-bold text-white text-base tracking-tight leading-snug">
                      {svc.title}
                    </h3>

                    <p className="text-xs text-slate-400 leading-relaxed">
                      {svc.description}
                    </p>
                  </div>

                  <a
                    href="#contact"
                    onClick={() => playCyberClick()}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-lime-400 hover:text-lime-300 pt-2"
                  >
                    <span>Inquire Details</span>
                    <ArrowRight className="w-3 h-3" />
                  </a>
                </SpotlightCard>
              );
            })}
          </div>

          {/* Aceternity UI 3D Card Interactive Lab */}
          <div className="pt-20 flex flex-col items-center justify-center">
            <div className="text-center space-y-2 mb-4">
              <span className="text-[11px] font-mono px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 font-bold uppercase">
                Aceternity 3D Card Experience
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                CSS Perspective &amp; 3D Parallax Depth
              </h3>
              <p className="text-xs text-purple-200/70 font-mono">
                Physical depth tracking cursor motion with multi-layer Z-index transformations.
              </p>
            </div>
            <ThreeDCardDemo />
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. CONTACT & HIRE ME SECTION                                             */}
      {/* ========================================================================= */}
      <section id="contact" className="py-24 border-t border-purple-500/20 relative">
        {/* Glow ambient */}
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[300px] bg-purple-600/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Left Column: Direct Outreach & Details */}
            <div className="lg:col-span-5 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-xs font-semibold text-purple-300">
                <Mail className="w-3.5 h-3.5 text-lime-400" />
                <span>Start a Project</span>
              </div>

              <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                Let&apos;s build something extraordinary together.
              </h2>

              <p className="text-sm text-slate-300 leading-relaxed">
                Have an idea for a web platform, e-commerce store, or custom server backend? Or looking to bring a
                skilled full-stack developer onto your team? Send a message and let&apos;s discuss.
              </p>

              <div className="space-y-3 pt-2">
                <SpotlightCard
                  spotlightColor="rgba(168, 85, 247, 0.15)"
                  className="p-4 rounded-2xl bg-[#090815] border border-purple-500/20 space-y-1"
                >
                  <span className="text-[11px] font-mono text-purple-300/80 block uppercase">Direct Email</span>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-white">dhruve123456789@gmail.com</span>
                    <CopyButton textToCopy="dhruve123456789@gmail.com" label="Copy" />
                  </div>
                </SpotlightCard>

                <SpotlightCard
                  spotlightColor="rgba(163, 230, 53, 0.15)"
                  className="p-4 rounded-2xl bg-[#090815] border border-purple-500/20 space-y-1"
                >
                  <span className="text-[11px] font-mono text-purple-300/80 block uppercase">Developer Profile</span>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-white">@Ailogodesigner</span>
                    <CopyButton textToCopy="Ailogodesigner" label="Copy Handle" copiedLabel="Copied!" />
                  </div>
                </SpotlightCard>

                <div className="p-4 rounded-2xl bg-[#090815] border border-purple-500/20 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-[11px] font-mono text-purple-300/80 block uppercase">Location &amp; Timezone</span>
                    <span className="font-semibold text-white">India (IST / UTC+5:30)</span>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-lime-500/10 text-lime-400 border border-lime-500/30 text-[10px] font-bold">
                    Worldwide Remote
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Contact Form */}
            <div className="lg:col-span-7">
              <div className="glass-panel p-6 sm:p-10 rounded-3xl border border-purple-500/30 shadow-2xl relative bg-gradient-to-br from-[#0c0a1e] via-[#090815] to-[#070611] overflow-hidden">
                {/* Skiper UI Border Beam on Contact Panel */}
                <BorderBeam size={220} duration={12} colorFrom="#a855f7" colorTo="#a3e635" />

                <h3 className="text-xl font-bold text-white mb-2">Send an Inquiry</h3>
                <p className="text-xs text-slate-400 mb-6">
                  Fill in your details below and I will respond to your email within 24 hours.
                </p>

                {submitStatus && (
                  <div
                    className={`p-4 rounded-2xl text-xs mb-6 font-medium flex items-start gap-2.5 ${
                      submitStatus.success
                        ? "bg-lime-500/10 border border-lime-500/30 text-lime-300"
                        : "bg-rose-500/10 border border-rose-500/30 text-rose-300"
                    }`}
                  >
                    {submitStatus.success ? (
                      <CheckCircle2 className="w-4 h-4 text-lime-400 shrink-0 mt-0.5" />
                    ) : (
                      <Shield className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    )}
                    <span>{submitStatus.message}</span>
                  </div>
                )}

                <form onSubmit={handleFormSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5 text-left">
                      <label className="text-xs font-semibold text-slate-300 block">Your Name</label>
                      <input
                        type="text"
                        required
                        value={formState.name}
                        onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                        placeholder="John Doe"
                        className="w-full px-4 py-2.5 rounded-xl bg-[#0e0c1f] border border-purple-500/30 focus:border-lime-400 focus:outline-none text-xs text-white placeholder:text-purple-300/40 transition-colors"
                      />
                    </div>

                    <div className="space-y-1.5 text-left">
                      <label className="text-xs font-semibold text-slate-300 block">Email Address</label>
                      <input
                        type="email"
                        required
                        value={formState.email}
                        onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                        placeholder="john@example.com"
                        className="w-full px-4 py-2.5 rounded-xl bg-[#0e0c1f] border border-purple-500/30 focus:border-lime-400 focus:outline-none text-xs text-white placeholder:text-purple-300/40 transition-colors"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5 text-left">
                      <label className="text-xs font-semibold text-slate-300 block">Project Category</label>
                      <select
                        value={formState.projectType}
                        onChange={(e) => setFormState({ ...formState, projectType: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-[#0e0c1f] border border-purple-500/30 focus:border-lime-400 focus:outline-none text-xs text-slate-200 transition-colors"
                      >
                        <option value="Full-Stack Web App">Full-Stack Web App</option>
                        <option value="E-Commerce & Store">E-Commerce Store &amp; Payments</option>
                        <option value="Gaming & Server Integrations">Gaming &amp; Server Integrations</option>
                        <option value="API & Cloud Infrastructure">API &amp; Cloud Infrastructure</option>
                        <option value="Freelance Consultation">Freelance Consultation</option>
                      </select>
                    </div>

                    <div className="space-y-1.5 text-left">
                      <label className="text-xs font-semibold text-slate-300 block">Estimated Budget</label>
                      <select
                        value={formState.budget}
                        onChange={(e) => setFormState({ ...formState, budget: e.target.value })}
                        className="w-full px-4 py-2.5 rounded-xl bg-[#0e0c1f] border border-purple-500/30 focus:border-lime-400 focus:outline-none text-xs text-slate-200 transition-colors"
                      >
                        <option value="< $500 (Under ₹40,000)">&lt; $500 (Under ₹40,000)</option>
                        <option value="$500 - $1,500 (₹40,000 - ₹1,20,000)">$500 - $1,500 (₹40k - ₹1.2L)</option>
                        <option value="$1,500 - $5,000 (₹1.2L - ₹4L)">$1,500 - $5,000 (₹1.2L - ₹4L)</option>
                        <option value="$5,000+ (Enterprise)">$5,000+ (Enterprise Scale)</option>
                        <option value="Flexible / Hourly">Flexible / Hourly Contract</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-left">
                    <label className="text-xs font-semibold text-slate-300 block">Project Scope &amp; Details</label>
                    <textarea
                      required
                      rows={4}
                      value={formState.message}
                      onChange={(e) => setFormState({ ...formState, message: e.target.value })}
                      placeholder="Describe your goals, requirements, features needed, or timeline..."
                      className="w-full px-4 py-3 rounded-xl bg-[#0e0c1f] border border-purple-500/30 focus:border-lime-400 focus:outline-none text-xs text-white placeholder:text-purple-300/40 transition-colors resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3.5 px-6 rounded-xl font-bold text-xs sm:text-sm text-slate-950 bg-gradient-to-r from-purple-400 via-fuchsia-400 to-lime-400 hover:brightness-110 shadow-lg shadow-purple-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {submitting ? (
                      <span>Dispatching Message...</span>
                    ) : (
                      <>
                        <Send className="w-4 h-4 text-slate-950" />
                        <span>Send Message Directly</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>

      <PortfolioFooter />
    </div>
  );
}
