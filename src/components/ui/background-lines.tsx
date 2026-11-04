"use client";

import { cn } from "@/lib/utils";
import React from "react";
import { motion } from "framer-motion";

export const BackgroundLines = ({
  children,
  className,
  svgOptions,
}: {
  children?: React.ReactNode;
  className?: string;
  svgOptions?: {
    duration?: number;
  };
}) => {
  return (
    <div
      className={cn(
        "relative w-full overflow-hidden bg-[#05050a] flex flex-col items-center justify-center",
        className
      )}
    >
      <SVGComponent duration={svgOptions?.duration} />
      <div className="relative z-10 w-full">{children}</div>
    </div>
  );
};

const SVGComponent = ({ duration = 10 }: { duration?: number }) => {
  const paths = [
    "M-400 100 Q 200 400 800 100 T 2000 100",
    "M-400 200 Q 300 50 900 200 T 2000 200",
    "M-400 300 Q 400 600 1000 300 T 2000 300",
    "M-400 400 Q 500 150 1100 400 T 2000 400",
    "M-400 500 Q 600 700 1200 500 T 2000 500",
    "M-400 600 Q 700 250 1300 600 T 2000 600",
  ];

  return (
    <motion.svg
      className="absolute inset-0 w-full h-full pointer-events-none opacity-40"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1600 800"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="line-gradient-1" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#a855f7" stopOpacity="0" />
          <stop offset="50%" stopColor="#a855f7" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#a3e635" stopOpacity="0" />
        </linearGradient>
        <linearGradient id="line-gradient-2" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#a3e635" stopOpacity="0" />
          <stop offset="50%" stopColor="#a3e635" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#c084fc" stopOpacity="0" />
        </linearGradient>
      </defs>

      {paths.map((d, index) => (
        <motion.path
          key={index}
          d={d}
          stroke={`url(#line-gradient-${(index % 2) + 1})`}
          strokeWidth="1.5"
          fill="none"
          initial={{ pathLength: 0.1, pathOffset: 0 }}
          animate={{
            pathLength: [0.1, 0.4, 0.1],
            pathOffset: [0, 1],
          }}
          transition={{
            duration: duration + index * 2,
            repeat: Infinity,
            ease: "linear",
          }}
        />
      ))}
    </motion.svg>
  );
};
