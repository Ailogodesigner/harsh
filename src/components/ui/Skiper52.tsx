"use client";

import { AnimatePresence, motion } from "framer-motion";
import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { playCyberHover, playCyberClick } from "./SoundEffects";

export const Skiper52 = () => {
  const showcaseItems = [
    {
      title: "Next.js 16 App Router",
      category: "Full-Stack Core",
      code: "SYS://NEXT16",
      src: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?q=80&w=1200&auto=format&fit=crop",
      badge: "Turbopack Engine",
    },
    {
      title: "Cloudflare Edge Workers",
      category: "Distributed Edge",
      code: "EDGE://SUB-15MS",
      src: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?q=80&w=1200&auto=format&fit=crop",
      badge: "A+ HSTS Preload",
    },
    {
      title: "Cashfree Payment Gateway",
      category: "Automated Checkout",
      code: "PG://HMAC-SHA256",
      src: "https://images.unsplash.com/photo-1563986768609-322da13575f3?q=80&w=1200&auto=format&fit=crop",
      badge: "Instant UPI QR",
    },
    {
      title: "Harsh Unlimited Store",
      category: "Gaming Network",
      code: "GAME://SMP-SURVIVAL",
      src: "https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200&auto=format&fit=crop",
      badge: "9/100 Peak Players",
    },
    {
      title: "PostgreSQL & Prisma 6",
      category: "Serverless Database",
      code: "DB://NEON-POOL",
      src: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?q=80&w=1200&auto=format&fit=crop",
      badge: "ACID Compliant",
    },
    {
      title: "Vitest TDD Test Suite",
      category: "Automated Testing",
      code: "TEST://100-PASS",
      src: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=1200&auto=format&fit=crop",
      badge: "Zero Regression",
    },
  ];

  return (
    <div className="w-full flex flex-col items-center justify-center overflow-hidden py-12">
      <HoverExpand_001 items={showcaseItems} />
    </div>
  );
};

export const HoverExpand_001 = ({
  items,
  className,
}: {
  items: { title: string; category: string; code: string; src: string; badge: string }[];
  className?: string;
}) => {
  const [activeItem, setActiveItem] = useState<number | null>(0);

  return (
    <motion.div
      initial={{ opacity: 0, translateY: 20 }}
      whileInView={{ opacity: 1, translateY: 0 }}
      viewport={{ once: true }}
      transition={{
        duration: 0.3,
        delay: 0.2,
      }}
      className={cn("relative w-full max-w-6xl px-4", className)}
    >
      <div className="w-full overflow-x-auto pb-4">
        <div className="flex w-full items-center justify-center gap-2 min-w-[700px]">
          {items.map((item, index) => (
            <motion.div
              key={index}
              className="relative cursor-pointer overflow-hidden rounded-3xl border border-purple-500/25 bg-[#090815] shadow-xl"
              initial={{ width: "4.5rem", height: "20rem" }}
              animate={{
                width: activeItem === index ? "22rem" : "5rem",
                height: "22rem",
              }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
              onClick={() => {
                setActiveItem(index);
                playCyberClick();
              }}
              onHoverStart={() => {
                setActiveItem(index);
                playCyberHover();
              }}
            >
              {/* Background Dim & Image */}
              <img
                src={item.src}
                className="size-full object-cover brightness-[0.65] hover:brightness-[0.8] transition-all"
                alt={item.title}
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#06050e] via-[#06050e]/50 to-transparent" />

              {/* Collapsed Vertical Identifier */}
              {activeItem !== index && (
                <div className="absolute inset-0 flex flex-col items-center justify-between py-6 pointer-events-none">
                  <span className="text-[10px] font-mono text-lime-400 font-bold">
                    0{index + 1}
                  </span>
                  <span className="[writing-mode:vertical-lr] text-xs font-mono font-bold text-purple-300/80 tracking-widest uppercase">
                    {item.code}
                  </span>
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500/50" />
                </div>
              )}

              {/* Expanded Card Content */}
              <AnimatePresence>
                {activeItem === index && (
                  <motion.div
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    transition={{ duration: 0.25 }}
                    className="absolute inset-0 flex flex-col justify-between p-6 z-10 text-left font-mono"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-2.5 py-1 rounded-full text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/40">
                        {item.category}
                      </span>
                      <span className="text-xs text-lime-400 font-bold">
                        {item.code}
                      </span>
                    </div>

                    <div className="space-y-1.5">
                      <h4 className="text-lg font-black text-white font-sans tracking-tight">
                        {item.title}
                      </h4>
                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] bg-lime-500/10 text-lime-400 border border-lime-500/30">
                        <span className="w-1.5 h-1.5 rounded-full bg-lime-400 animate-pulse" />
                        <span>{item.badge}</span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};
