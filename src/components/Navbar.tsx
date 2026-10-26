"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import NextLink from "next/link";
import {
  Menu,
  X,
  Compass,
  ShoppingCart,
  Gamepad2,
  Trophy,
  BookMarked,
  Newspaper,
  BookOpen,
  LifeBuoy,
  User,
  Shield,
  LogOut,
  Sparkles,
  Map as MapIcon,
  ClipboardList,
  ChevronDown,
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
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
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

  // Close dropdown when route changes or clicking outside
  useEffect(() => {
    setDropdownOpen(false);
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Primary navigation links shown directly in the navbar
  const primaryNavLinks = [
    { href: "/", label: "Home", icon: Compass },
    { href: "/play", label: "Play", icon: Gamepad2 },
    { href: "/store", label: "Store", icon: ShoppingCart, highlight: true },
    { href: "/map", label: "Map", icon: MapIcon },
    { href: "/wiki", label: "Wiki", icon: BookMarked },
    { href: "/leaderboards", label: "Leaderboards", icon: Trophy },
  ];

  // Secondary community links grouped in the "Community ▾" dropdown to avoid navbar crowding
  const communityNavLinks = [
    { href: "/news", label: "News & Updates", description: "Latest network changelogs", icon: Newspaper },
    { href: "/rules", label: "Server Rules", description: "Network guidelines & conduct", icon: BookOpen },
    { href: "/staff", label: "Staff Team", description: "Meet our leadership & mods", icon: Shield },
    { href: "/apply", label: "Apply for Staff", description: "Helper, Mod & Builder recruitment", icon: ClipboardList },
    { href: "/support", label: "Support & Help", description: "Player tickets & knowledgebase", icon: LifeBuoy },
  ];

  const isCommunityActive = communityNavLinks.some((l) => pathname === l.href);

  // Full list for mobile drawer
  const allLinks = [...primaryNavLinks, ...communityNavLinks];

  return (
    <header className="sticky top-0 z-50 glass-nav transition-all duration-200">
      <div className="max-w-[1560px] w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20 gap-3">
          {/* Logo & Server Status */}
          <div className="flex items-center gap-3 xl:gap-5 shrink-0">
            <NextLink href="/" className="flex items-center gap-2.5 group">
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 p-0.5 shadow-lg shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition-all duration-300 overflow-hidden shrink-0">
                <img
                  src="/logo.png"
                  alt="Harsh Unlimited"
                  className="w-full h-full object-cover rounded-[10px]"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-sm sm:text-base tracking-wider text-white uppercase group-hover:text-emerald-400 transition-colors whitespace-nowrap">
                  Harsh <span className="text-emerald-400">Unlimited</span>
                </span>
                <span className="text-[9px] uppercase tracking-widest text-slate-400 font-bold whitespace-nowrap">
                  Minecraft Network
                </span>
              </div>
            </NextLink>

            {/* Server Online Status Pill */}
            <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-full bg-slate-900/90 border border-slate-800 text-[11px] text-slate-300 shadow-inner whitespace-nowrap">
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
              <span className="font-semibold">
                {serverOnline ? `${playerCount} Online` : "Network Starting"}
              </span>
            </div>
          </div>

          {/* Desktop Nav Links - Properly Scaled with Responsive Spacing */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 shrink-0">
            {primaryNavLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <NextLink
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-1.5 px-2.5 xl:px-3 py-1.5 rounded-xl text-xs xl:text-[13px] font-semibold transition-all duration-150 whitespace-nowrap ${
                    isActive
                      ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 shadow-sm shadow-emerald-500/10"
                      : link.highlight
                      ? "text-emerald-300 hover:text-emerald-200 hover:bg-emerald-500/15"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 xl:w-4 xl:h-4 ${link.highlight ? "text-emerald-400 animate-pulse" : ""}`} />
                  <span>{link.label}</span>
                  {link.highlight && (
                    <span className="ml-0.5 px-1.5 py-0.5 rounded text-[9px] font-black bg-emerald-500/25 text-emerald-400 uppercase tracking-wider">
                      Store
                    </span>
                  )}
                </NextLink>
              );
            })}

            {/* Community Dropdown to Prevent Navbar Overflow */}
            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
                onMouseEnter={() => setDropdownOpen(true)}
                className={`flex items-center gap-1.5 px-2.5 xl:px-3 py-1.5 rounded-xl text-xs xl:text-[13px] font-semibold transition-all duration-150 whitespace-nowrap cursor-pointer ${
                  isCommunityActive
                    ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/25 shadow-sm shadow-emerald-500/10"
                    : dropdownOpen
                    ? "text-white bg-slate-800/80"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/60"
                }`}
              >
                <span>Community</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${dropdownOpen ? "rotate-180 text-emerald-400" : ""}`} />
              </button>

              {/* Glass Dropdown Popover */}
              {dropdownOpen && (
                <div
                  onMouseLeave={() => setDropdownOpen(false)}
                  className="absolute top-full right-0 mt-2 w-72 bg-slate-950/98 backdrop-blur-2xl border border-slate-800 rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150 space-y-1"
                >
                  {communityNavLinks.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <NextLink
                        key={item.href}
                        href={item.href}
                        onClick={() => setDropdownOpen(false)}
                        className={`flex items-start gap-3 p-2.5 rounded-xl transition-all ${
                          isActive
                            ? "bg-emerald-500/10 border border-emerald-500/25 text-emerald-400"
                            : "hover:bg-slate-900/90 text-slate-300 hover:text-white"
                        }`}
                      >
                        <div className={`p-2 rounded-lg shrink-0 ${isActive ? "bg-emerald-500/20 text-emerald-400" : "bg-slate-900 text-slate-400"}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold leading-tight">{item.label}</span>
                          <span className="text-[10px] text-slate-400 mt-0.5 leading-tight">{item.description}</span>
                        </div>
                      </NextLink>
                    );
                  })}
                </div>
              )}
            </div>
          </nav>

          {/* User Auth Buttons / Profile - Compact & Scaled */}
          <div className="hidden sm:flex items-center gap-2.5 shrink-0">
            {user ? (
              <div className="flex items-center gap-2">
                {user.role === "ADMIN" || user.role === "SUPERADMIN" ? (
                  <NextLink
                    href="/admin"
                    className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30 hover:bg-amber-500/25 transition-colors whitespace-nowrap"
                  >
                    <Shield className="w-3.5 h-3.5 text-amber-400" />
                    <span>Admin Panel</span>
                  </NextLink>
                ) : null}

                <NextLink
                  href="/dashboard"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 border border-slate-800 hover:border-emerald-500/40 text-slate-200 hover:text-white transition-all whitespace-nowrap"
                >
                  <User className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="max-w-[100px] truncate">{user.name}</span>
                </NextLink>

                <button
                  type="button"
                  onClick={async () => {
                    await fetch("/api/auth/logout", { method: "POST" });
                    window.location.href = "/";
                  }}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
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
                  className="px-3 py-1.5 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors whitespace-nowrap"
                >
                  Sign In
                </NextLink>
                <NextLink
                  href="/register"
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all cursor-pointer whitespace-nowrap"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Join Network</span>
                </NextLink>
              </div>
            )}
          </div>

          {/* Mobile menu trigger */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-slate-950/98 border-b border-slate-800/80 px-4 pt-3 pb-6 space-y-3 animate-in slide-in-from-top duration-200">
          <div className="grid grid-cols-2 gap-2 pt-2">
            {allLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <NextLink
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold transition-colors ${
                    isActive
                      ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20"
                      : "text-slate-300 hover:bg-slate-900"
                  }`}
                >
                  <Icon className="w-4 h-4 text-emerald-400" />
                  <span>{link.label}</span>
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
                  className="flex items-center justify-between w-full px-3 py-2 rounded-xl bg-slate-900 text-xs font-semibold text-slate-200"
                >
                  <span>Dashboard ({user.name})</span>
                  <User className="w-4 h-4 text-emerald-400" />
                </NextLink>

                {user.role === "ADMIN" || user.role === "SUPERADMIN" ? (
                  <NextLink
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-between w-full px-3 py-2 rounded-xl bg-amber-500/10 text-xs font-semibold text-amber-300 border border-amber-500/20"
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
                  className="flex items-center gap-2 w-full px-3 py-2 rounded-xl text-xs font-semibold text-rose-400 hover:bg-rose-500/10"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 pt-1">
                <NextLink
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 py-2 text-center rounded-xl bg-slate-900 text-xs font-semibold text-slate-200 border border-slate-800"
                >
                  Sign In
                </NextLink>
                <NextLink
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex-1 py-2 text-center rounded-xl bg-emerald-500 text-xs font-bold text-slate-950"
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
