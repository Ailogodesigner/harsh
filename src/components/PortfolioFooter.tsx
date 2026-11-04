"use client";

import { ArrowUp, Mail, Globe, Heart } from "lucide-react";
import CopyButton from "./CopyButton";
import GithubIcon from "./GithubIcon";

export default function PortfolioFooter() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative bg-[#06070a] border-t border-slate-800/80 pt-16 pb-12 overflow-hidden text-slate-400">
      {/* Subtle top atmospheric glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-slate-800/60">
          {/* Brand & Bio */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-emerald-500 p-[1px]">
                <div className="w-full h-full bg-[#0d0f17] rounded-[11px] flex items-center justify-center font-black text-sm text-cyan-400 font-mono">
                  AK
                </div>
              </div>
              <span className="font-black text-white text-lg tracking-tight">
                Aditya Kashyap
              </span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Full-Stack Web Developer &amp; Systems Engineer specialized in building
              resilient web apps, modern e-commerce stores, real-time telemetry systems,
              and low-latency edge architectures.
            </p>
            <div className="pt-2 flex items-center gap-2">
              <span className="text-xs text-slate-500 font-mono">Direct Contact:</span>
              <CopyButton textToCopy="dhruve123456789@gmail.com" label="dhruve123456789@gmail.com" />
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#about" className="hover:text-cyan-400 transition-colors">
                  About Me
                </a>
              </li>
              <li>
                <a href="#projects" className="hover:text-cyan-400 transition-colors">
                  Featured Projects
                </a>
              </li>
              <li>
                <a href="#skills" className="hover:text-cyan-400 transition-colors">
                  Skills &amp; Tech Stack
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-cyan-400 transition-colors">
                  Services Offered
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-cyan-400 transition-colors">
                  Hire Me / Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Connect & Socials */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-200">
              Online Profiles
            </h4>
            <div className="flex flex-col space-y-2.5 text-xs">
              <a
                href="https://github.com/Ailogodesigner"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-white transition-colors"
              >
                <GithubIcon className="w-4 h-4 text-slate-400" />
                <span>GitHub (@Ailogodesigner)</span>
              </a>
              <a
                href="mailto:dhruve123456789@gmail.com"
                className="flex items-center gap-2 hover:text-white transition-colors"
              >
                <Mail className="w-4 h-4 text-cyan-400" />
                <span>dhruve123456789@gmail.com</span>
              </a>
              <div className="flex items-center gap-2 text-slate-400">
                <Globe className="w-4 h-4 text-emerald-400" />
                <span>India (Available Worldwide)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <div className="flex items-center gap-1.5 text-slate-500">
            <span>© {new Date().getFullYear()} Aditya Kashyap. Built with Next.js 16, React 19 &amp; Tailwind CSS.</span>
          </div>

          <button
            onClick={scrollToTop}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-all text-xs cursor-pointer"
          >
            <span>Back to top</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
}
