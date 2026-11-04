"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Code2,
  Briefcase,
  Layers,
  Wrench,
  Mail,
  Menu,
  X,
  ExternalLink,
  Sparkles,
} from "lucide-react";

export default function PortfolioNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "#about", label: "About", icon: Code2 },
    { href: "#projects", label: "Projects", icon: Briefcase },
    { href: "#skills", label: "Skills", icon: Layers },
    { href: "#services", label: "Services", icon: Wrench },
    { href: "#contact", label: "Contact", icon: Mail },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#090a0f]/90 backdrop-blur-xl border-b border-slate-800/80 shadow-2xl shadow-black/50 py-3.5"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between">
        {/* Brand / Logo */}
        <Link
          href="/"
          className="flex items-center gap-3 group focus:outline-none"
        >
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 via-indigo-500 to-emerald-500 p-[1.5px] shadow-lg shadow-cyan-500/20 group-hover:shadow-cyan-500/40 transition-all">
            <div className="w-full h-full bg-[#0d0f17] rounded-[10px] flex items-center justify-center">
              <span className="font-black text-sm text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-emerald-400 font-mono">
                AK
              </span>
            </div>
          </div>
          <div className="text-left">
            <div className="font-black text-white text-base tracking-tight flex items-center gap-1.5 group-hover:text-cyan-400 transition-colors">
              <span>Aditya Kashyap</span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono tracking-wider">
              Full-Stack Developer
            </p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 border border-slate-800/80 rounded-full px-3 py-1.5 backdrop-blur-md">
          {navLinks.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/70 rounded-full transition-all duration-200"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Availability Badge & CTA */}
        <div className="hidden lg:flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-semibold text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Available for Hire</span>
          </div>
          <a
            href="#contact"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 via-teal-300 to-emerald-400 hover:brightness-110 transition-all shadow-md shadow-cyan-500/20 active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Let&apos;s Talk</span>
          </a>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center gap-2">
          <a
            href="#contact"
            className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-950 bg-gradient-to-r from-cyan-400 to-emerald-400"
          >
            Hire
          </a>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 hover:text-white"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-3 px-4 pb-4 bg-[#0d0f17]/95 backdrop-blur-2xl border-b border-slate-800 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="flex flex-col space-y-2 pt-2">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-xs font-semibold text-emerald-400 mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Available for Hire &amp; Freelance Work</span>
            </div>
            {navLinks.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors"
                >
                  <Icon className="w-4 h-4 text-cyan-400" />
                  <span>{item.label}</span>
                </a>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
}
