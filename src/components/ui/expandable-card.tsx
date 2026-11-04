"use client";

import React, { useEffect, useId, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useOutsideClick } from "@/hooks/use-outside-click";
import { X, Check, ArrowRight, ShieldCheck, Zap } from "lucide-react";
import { playCyberClick, playCyberHover } from "./SoundEffects";

export interface ExpandableCardItem {
  title: string;
  category: string;
  tagline: string;
  description: string;
  src?: string;
  highlights: string[];
  tech: string[];
  metrics?: { label: string; value: string }[];
}

export function ExpandableCards({ items }: { items: ExpandableCardItem[] }) {
  const [active, setActive] = useState<ExpandableCardItem | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const id = useId();

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setActive(null);
      }
    }

    if (active) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [active]);

  useOutsideClick(ref, () => setActive(null));

  return (
    <>
      <AnimatePresence>
        {active && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 h-full w-full z-50 backdrop-blur-md"
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {active ? (
          <div className="fixed inset-0 grid place-items-center z-50 p-4 font-mono">
            <motion.div
              layoutId={`card-${active.title}-${id}`}
              ref={ref}
              className="w-full max-w-2xl bg-[#090815] border border-purple-500/30 rounded-3xl overflow-hidden shadow-2xl shadow-purple-950/50 flex flex-col max-h-[90vh]"
            >
              <div className="flex items-center justify-between p-6 border-b border-purple-500/20 bg-[#0c0a1f]">
                <div>
                  <span className="text-[11px] font-bold text-lime-400 uppercase tracking-wider">
                    {active.category}
                  </span>
                  <h3 className="text-xl font-black text-white font-sans tracking-tight">
                    {active.title}
                  </h3>
                </div>
                <button
                  onClick={() => {
                    setActive(null);
                    playCyberClick();
                  }}
                  className="w-8 h-8 rounded-full bg-[#15122e] border border-purple-500/30 flex items-center justify-center text-slate-300 hover:text-white hover:border-lime-400/50 transition-colors cursor-pointer"
                  aria-label="Close"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 overflow-y-auto space-y-6 text-left">
                <p className="text-xs sm:text-sm text-slate-300 font-sans leading-relaxed">
                  {active.description}
                </p>

                {active.metrics && (
                  <div className="grid grid-cols-3 gap-3">
                    {active.metrics.map((m) => (
                      <div key={m.label} className="p-3 rounded-2xl bg-[#0e0c20] border border-purple-500/20">
                        <span className="text-[10px] text-purple-300/80 block">{m.label}</span>
                        <span className="text-base font-black text-lime-400">{m.value}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="space-y-2">
                  <span className="text-xs font-bold text-purple-300 uppercase tracking-wider block">
                    Engineering Specifications:
                  </span>
                  <ul className="space-y-2">
                    {active.highlights.map((hl) => (
                      <li key={hl} className="flex items-start gap-2.5 text-xs text-slate-300 font-sans">
                        <Check className="w-4 h-4 text-lime-400 shrink-0 mt-0.5" />
                        <span>{hl}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <span className="text-xs font-bold text-purple-300 uppercase tracking-wider block mb-2">
                    Technology Stack:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {active.tech.map((t) => (
                      <span
                        key={t}
                        className="px-2.5 py-1 rounded-lg text-[11px] bg-[#120f26] border border-purple-500/30 text-lime-300"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-4 bg-[#0a0818] border-t border-purple-500/20 flex items-center justify-between">
                <span className="text-[11px] text-purple-400/80">
                  Zero external redirects • On-site verified architecture
                </span>
                <button
                  onClick={() => setActive(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-lime-400 text-slate-950 hover:bg-lime-300 transition-colors cursor-pointer"
                >
                  Close Inspection
                </button>
              </div>
            </motion.div>
          </div>
        ) : null}
      </AnimatePresence>

      <div className="space-y-4 max-w-5xl mx-auto w-full">
        {items.map((item) => (
          <motion.div
            layoutId={`card-${item.title}-${id}`}
            key={item.title}
            onClick={() => {
              setActive(item);
              playCyberClick();
            }}
            onMouseEnter={() => playCyberHover()}
            className="p-5 rounded-2xl bg-[#090815] border border-purple-500/25 hover:border-lime-400/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer shadow-lg group text-left font-mono"
          >
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                  {item.category}
                </span>
                <span className="text-xs text-lime-400 font-bold group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                  <span>Inspect Spec</span>
                  <ArrowRight className="w-3 h-3" />
                </span>
              </div>
              <h4 className="text-lg font-black text-white font-sans tracking-tight mt-1">
                {item.title}
              </h4>
              <p className="text-xs text-purple-200/70 font-sans mt-0.5">
                {item.tagline}
              </p>
            </div>

            <div className="flex flex-wrap gap-1.5 shrink-0">
              {item.tech.slice(0, 3).map((t) => (
                <span
                  key={t}
                  className="px-2 py-0.5 rounded text-[10px] bg-[#120f26] border border-purple-500/20 text-purple-300"
                >
                  {t}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
      </div>
    </>
  );
}

