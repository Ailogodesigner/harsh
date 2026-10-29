"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { ShieldAlert, Clock, LogOut, CheckCircle2 } from "lucide-react";

// Security timeout settings (in milliseconds)
const INACTIVITY_WARNING_MS = 25 * 60 * 1000; // 25 minutes
const INACTIVITY_LOGOUT_MS = 30 * 60 * 1000;  // 30 minutes

export default function SecurityGuard() {
  const [showWarning, setShowWarning] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(300);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const lastActivityRef = useRef<number>(Date.now());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Chrome Console / Terminal Self-XSS Warning
  useEffect(() => {
    try {
      console.clear?.();
      console.log(
        "%cSTOP! SECURITY WARNING",
        "color: #ef4444; font-size: 36px; font-weight: 900; text-shadow: 2px 2px 0 #000; padding: 4px;"
      );
      console.log(
        "%cThis is a browser feature intended strictly for developers. If someone told you to copy-paste code or run commands here to 'hack', get free coins, or bypass permissions, it is an attack (Self-XSS) that will compromise your Harsh Unlimited account.",
        "font-size: 14px; font-weight: bold; color: #f87171; line-height: 1.5;"
      );
      console.log(
        "%c[Harsh Unlimited Security Shield is Active - Rate-limiting and Brute-force lockouts enforced]",
        "font-size: 12px; color: #10b981; font-weight: 600;"
      );
    } catch {
      // Ignore console logging restriction
    }
  }, []);

  // 2. Check if user is logged in
  useEffect(() => {
    let mounted = true;
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (mounted && data?.user) {
          setIsLoggedIn(true);
        }
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore
    }
    window.location.href = "/login?reason=timeout";
  }, []);

  const resetActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
    if (showWarning) {
      setShowWarning(false);
      setSecondsRemaining(300);
    }
  }, [showWarning]);

  // 3. User activity listener for idle timeout
  useEffect(() => {
    if (!isLoggedIn) return;

    const events = ["mousedown", "mousemove", "keydown", "scroll", "touchstart"];
    const handleUserActivity = () => {
      // Only throttle updates if warning is not visible
      if (!showWarning && Date.now() - lastActivityRef.current < 2000) return;
      resetActivity();
    };

    events.forEach((evt) => window.addEventListener(evt, handleUserActivity, { passive: true }));

    // Inactivity heartbeat timer
    timerRef.current = setInterval(() => {
      const idleTime = Date.now() - lastActivityRef.current;

      if (idleTime >= INACTIVITY_LOGOUT_MS) {
        clearInterval(timerRef.current!);
        handleLogout();
      } else if (idleTime >= INACTIVITY_WARNING_MS) {
        setShowWarning(true);
        const remaining = Math.max(0, Math.ceil((INACTIVITY_LOGOUT_MS - idleTime) / 1000));
        setSecondsRemaining(remaining);
      } else {
        setShowWarning(false);
      }
    }, 1000);

    return () => {
      events.forEach((evt) => window.removeEventListener(evt, handleUserActivity));
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isLoggedIn, showWarning, resetActivity, handleLogout]);

  if (!showWarning || !isLoggedIn) return null;

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const formattedTime = `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-panel max-w-md w-full rounded-3xl p-6 sm:p-8 border border-amber-500/40 shadow-2xl shadow-amber-500/10 text-center space-y-5 bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
          <Clock className="w-8 h-8 animate-pulse" />
        </div>

        <div className="space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
            Security Inactivity Timeout
          </span>
          <h3 className="text-xl font-black text-white">Your session is about to expire</h3>
          <p className="text-xs text-slate-300 leading-relaxed">
            To prevent unauthorized access and terminal tampering, inactive sessions are automatically locked.
          </p>
        </div>

        <div className="py-3 px-4 rounded-xl bg-slate-950/60 border border-slate-800">
          <div className="text-3xl font-mono font-bold text-amber-400">{formattedTime}</div>
          <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Remaining until automatic sign-out</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <button
            onClick={resetActivity}
            className="flex-1 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Stay Logged In</span>
          </button>
          <button
            onClick={handleLogout}
            className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            <span>Logout Now</span>
          </button>
        </div>
      </div>
    </div>
  );
}

