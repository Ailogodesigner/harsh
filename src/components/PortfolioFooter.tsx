"use client";

import { ArrowUp, Mail, Globe, Heart } from "lucide-react";
import CopyButton from "./CopyButton";
import GithubIcon from "./GithubIcon";

export default function PortfolioFooter() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="relative bg-[#05050a] border-t border-purple-500/20 pt-16 pb-28 overflow-hidden text-slate-400">
      {/* Subtle top atmospheric glow in violet & lime */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-purple-500/50 to-transparent" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 pb-12 border-b border-purple-500/15">
          {/* Brand & Bio */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 via-fuchsia-500 to-lime-400 p-[1px]">
                <div className="w-full h-full bg-[#0a0914] rounded-[11px] flex items-center justify-center font-black text-sm text-lime-400 font-mono">
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
              <span className="text-xs text-purple-300/70 font-mono">Direct Contact:</span>
              <CopyButton textToCopy="dhruve123456789@gmail.com" label="dhruve123456789@gmail.com" />
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-purple-300">
              Navigation
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <a href="#about" className="hover:text-lime-400 transition-colors">
                  About Me
                </a>
              </li>
              <li>
                <a href="#projects" className="hover:text-lime-400 transition-colors">
                  Featured Projects
                </a>
              </li>
              <li>
                <a href="#skills" className="hover:text-lime-400 transition-colors">
                  Skills &amp; Tech Stack
                </a>
              </li>
              <li>
                <a href="#services" className="hover:text-lime-400 transition-colors">
                  Services Offered
                </a>
              </li>
              <li>
                <a href="#contact" className="hover:text-lime-400 transition-colors">
                  Hire Me / Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Connect & Socials */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-purple-300">
              Online Profiles
            </h4>
            <div className="flex flex-col space-y-2.5 text-xs">
              <a
                href="https://github.com/Ailogodesigner"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-lime-400 transition-colors"
              >
                <GithubIcon className="w-4 h-4 text-purple-400" />
                <span>GitHub (@Ailogodesigner)</span>
              </a>
              <a
                href="mailto:dhruve123456789@gmail.com"
                className="flex items-center gap-2 hover:text-lime-400 transition-colors"
              >
                <Mail className="w-4 h-4 text-lime-400" />
                <span>dhruve123456789@gmail.com</span>
              </a>
              <div className="flex items-center gap-2 text-slate-400">
                <Globe className="w-4 h-4 text-amber-400" />
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
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#0e0c1c] border border-purple-500/20 text-slate-300 hover:text-lime-400 hover:border-lime-400/40 transition-all text-xs cursor-pointer"
          >
            <span>Back to top</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
}
