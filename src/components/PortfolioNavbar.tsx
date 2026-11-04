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
    { href: "#hosting", label: "Bot Hosting", icon: Layers },
    { href: "/bot-order", label: "Bot Builder", icon: Sparkles },
    { href: "#services", label: "Services", icon: Wrench },
    { href: "#contact", label: "Contact", icon: Mail },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-[#05050a]/90 backdrop-blur-xl border-b border-purple-500/20 shadow-2xl shadow-purple-950/30 py-3.5"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between">
        {/* Brand / Logo */}
        <Link
          href="/"
          className="flex items-center gap-3 group focus:outline-none"
        >
          <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 via-fuchsia-500 to-lime-400 p-[1.5px] shadow-lg shadow-purple-500/25 group-hover:shadow-lime-400/30 transition-all">
            <div className="w-full h-full bg-[#07060f] rounded-[10px] flex items-center justify-center">
              <span className="font-black text-sm text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-fuchsia-300 to-lime-400 font-mono">
                AK
              </span>
            </div>
          </div>
          <div className="text-left">
            <div className="font-black text-white text-base tracking-tight flex items-center gap-1.5 group-hover:text-lime-400 transition-colors">
              <span>Aditya Kashyap</span>
            </div>
            <p className="text-[11px] text-purple-300/80 font-mono tracking-wider">
              Full-Stack Developer
            </p>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 bg-[#0b0a17]/90 border border-purple-500/20 rounded-full px-3 py-1.5 backdrop-blur-md">
          {navLinks.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white hover:bg-purple-500/20 rounded-full transition-all duration-200"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Availability Badge & CTA */}
        <div className="hidden lg:flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-lime-500/10 border border-lime-500/30 text-[11px] font-semibold text-lime-400">
            <span className="w-2 h-2 rounded-full bg-lime-400 animate-pulse" />
            <span>Available for Hire</span>
          </div>
          <a
            href="#contact"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-slate-950 bg-gradient-to-r from-purple-400 via-fuchsia-400 to-lime-400 hover:brightness-110 transition-all shadow-md shadow-purple-500/20 active:scale-95"
          >
            <Sparkles className="w-3.5 h-3.5 text-slate-950" />
            <span>Let&apos;s Talk</span>
          </a>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center gap-2">
          <a
            href="#contact"
            className="px-3 py-1.5 rounded-lg text-xs font-bold text-slate-950 bg-gradient-to-r from-purple-400 to-lime-400"
          >
            Hire
          </a>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-xl bg-[#0b0a17] border border-purple-500/30 text-slate-300 hover:text-white"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-3 px-4 pb-4 bg-[#0a0815]/95 backdrop-blur-2xl border-b border-purple-500/30 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="flex flex-col space-y-2 pt-2">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-lime-500/10 border border-lime-500/30 text-xs font-semibold text-lime-400 mb-2">
              <span className="w-2 h-2 rounded-full bg-lime-400 animate-pulse" />
              <span>Available for Hire &amp; Freelance Work</span>
            </div>
            {navLinks.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-300 hover:text-white hover:bg-purple-500/20 transition-colors"
                >
                  <Icon className="w-4 h-4 text-lime-400" />
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

