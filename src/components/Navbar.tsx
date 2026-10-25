"use client";

import { useState, useEffect } from "react";
import Link from "next/navigation";
import { usePathname } from "next/navigation";
import NextLink from "next/link";
import {
  Menu,
  X,
  Compass,
  ShoppingCart,
  Gamepad2,
  Trophy,
  Vote,
  Newspaper,
  BookOpen,
  LifeBuoy,
  User,
  Shield,
  LogOut,
  Sparkles,
  Map as MapIcon,
  ClipboardList,
} from "lucide-react";

interface UserSession {
  id: string;
  name: string;
  email: string;
  role: string;
}

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<UserSession | null>(null);
  const [serverOnline, setServerOnline] = useState<boolean>(true);
  const [playerCount, setPlayerCount] = useState<number>(0);

  useEffect(() => {
    // Fetch current auth session
    fetch("/api/auth/me")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data?.user) setUser(data.user);
      })
      .catch(() => {});

    // Fetch live Minecraft server status
    fetch("/api/minecraft/status")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) {
          setServerOnline(Boolean(data.online));
          setPlayerCount(data.players?.online || 0);
        }
      })
      .catch(() => {});
  }, [pathname]);

  const navLinks = [
    { href: "/", label: "Home", icon: Compass },
    { href: "/play", label: "Play", icon: Gamepad2 },
    { href: "/store", label: "Store", icon: ShoppingCart, highlight: true },
    { href: "/map", label: "Map", icon: MapIcon },
    { href: "/vote", label: "Vote", icon: Vote },
    { href: "/leaderboards", label: "Leaderboards", icon: Trophy },
    { href: "/rules", label: "Rules", icon: BookOpen },
    { href: "/staff", label: "Staff", icon: Shield },
    { href: "/apply", label: "Apply", icon: ClipboardList },
    { href: "/news", label: "News", icon: Newspaper },
    { href: "/support", label: "Support", icon: LifeBuoy },
  ];

  return (
    <header className="sticky top-0 z-50 glass-nav transition-all duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo & Server Status */}
          <div className="flex items-center gap-6">
            <NextLink href="/" className="flex items-center gap-3 group">
              <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 p-0.5 shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition-all duration-300 overflow-hidden">
                <img
                  src="/logo.png"
                  alt="Harsh Unlimited"
                  className="w-full h-full object-cover rounded-[10px]"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-lg tracking-wider text-white uppercase group-hover:text-emerald-400 transition-colors">
                  Harsh <span className="text-emerald-400">Unlimited</span>
                </span>
                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">
                  Minecraft Network
                </span>
              </div>
            </NextLink>

            {/* Server Online Status Pill */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-800 text-xs text-slate-300 shadow-inner">
              <span className="relative flex h-2 w-2">
                <span
                  className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                    serverOnline ? "bg-emerald-400" : "bg-amber-400"
                  }`}
                />
                <span
                  className={`relative inline-flex rounded-full h-2 w-2 ${
                    serverOnline ? "bg-emerald-500" : "bg-amber-500"
                  }`}
                />
              </span>
              <span className="font-medium">
                {serverOnline ? `${playerCount} Players Online` : "Network Starting"}
              </span>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden xl:flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <NextLink
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 shadow-sm shadow-emerald-500/10"
                      : link.highlight
                      ? "text-emerald-300 hover:text-emerald-200 hover:bg-emerald-500/10"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${link.highlight ? "text-emerald-400 animate-pulse" : ""}`} />
                  {link.label}
                  {link.highlight && (
                    <span className="ml-1 px-1.5 py-0.2 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-400 uppercase tracking-wider">
                      Store
                    </span>
                  )}
                </NextLink>
              );
            })}
          </nav>

          {/* User Auth Buttons / Dropdown */}
          <div className="hidden sm:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-2">
                {user.role === "ADMIN" || user.role === "SUPERADMIN" ? (
                  <NextLink
                    href="/admin"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-500/15 text-amber-300 border border-amber-500/30 hover:bg-amber-500/25 transition-colors"
                  >
                    <Shield className="w-3.5 h-3.5" />
                    Admin Panel
                  </NextLink>
                ) : null}

                <NextLink
                  href="/dashboard"
                  className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium bg-slate-900 border border-slate-800 hover:border-emerald-500/40 text-slate-200 hover:text-white transition-all"
                >
                  <User className="w-4 h-4 text-emerald-400" />
                  <span>{user.name}</span>
                </NextLink>

                <button
                  type="button"
                  onClick={async () => {
                    await fetch("/api/auth/logout", { method: "POST" });
                    window.location.href = "/";
                  }}
                  className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                  title="Sign out"
                  aria-label="Sign out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <NextLink
                  href="/login"
                  className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors"
                >
                  Sign In
                </NextLink>
                <NextLink
                  href="/register"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  Join Network
                </NextLink>
              </div>
            )}
          </div>

          {/* Mobile menu trigger */}
          <div className="flex xl:hidden items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="xl:hidden bg-slate-950/98 border-b border-slate-800/80 px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top duration-200">
          <div className="grid grid-cols-2 gap-2 pt-2">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <NextLink
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20"
                      : "text-slate-300 hover:bg-slate-900"
                  }`}
                >
                  <Icon className="w-4 h-4 text-emerald-400" />
                  {link.label}
                </NextLink>
              );
            })}
          </div>

          <div className="border-t border-slate-800 pt-3">
            {user ? (
              <div className="space-y-2">
                <NextLink
                  href="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between w-full px-3 py-2 rounded-lg bg-slate-900 text-sm font-medium text-slate-200"
                >
                  <span>Dashboard ({user.name})</span>
                  <User className="w-4 h-4 text-emerald-400" />
                </NextLink>

                {user.role === "ADMIN" || user.role === "SUPERADMIN" ? (
                  <NextLink
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between w-full px-3 py-2 rounded-lg bg-amber-500/10 text-sm font-medium text-amber-300 border border-amber-500/20"
                  >
                    <span>Admin Panel</span>
                    <Shield className="w-4 h-4 text-amber-400" />
                  </NextLink>
                ) : null}

                <button
                  type="button"
                  onClick={async () => {
                    await fetch("/api/auth/logout", { method: "POST" });
                    setMobileMenuOpen(false);
                    window.location.href = "/";
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-sm text-rose-400 hover:bg-rose-500/10"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 pt-1">
                <NextLink
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 py-2 text-center rounded-lg bg-slate-900 text-sm font-medium text-slate-200 border border-slate-800"
                >
                  Sign In
                </NextLink>
                <NextLink
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 py-2 text-center rounded-lg bg-emerald-500 text-sm font-semibold text-slate-950"
                >
                  Register
                </NextLink>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
