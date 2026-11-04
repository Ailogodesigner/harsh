"use client";

import { GitCommit, GitBranch, GitPullRequest, Flame, CheckCircle2 } from "lucide-react";
import GithubIcon from "./GithubIcon";

export default function GithubCommitHeatmap() {
  // Generate a mock representation of 52 weeks x 7 days grid with varying green intensities
  const weeks = 36;
  const days = 7;

  // Predictable pattern generation based on week/day indices for realistic activity
  const getActivityLevel = (w: number, d: number) => {
    const seed = (w * 17 + d * 31) % 100;
    if (seed < 25) return "bg-slate-900 border-slate-800"; // none
    if (seed < 55) return "bg-emerald-950 border-emerald-900/60"; // low
    if (seed < 80) return "bg-emerald-800/80 border-emerald-700/80"; // medium
    return "bg-emerald-500 border-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.4)]"; // high
  };

  return (
    <div className="w-full rounded-3xl border border-slate-800 bg-[#090b11] p-6 sm:p-8 shadow-2xl relative overflow-hidden font-mono text-left">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-white">
            <GithubIcon className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-sm">github.com/Ailogodesigner</span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                Active Contributor
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-sans mt-0.5">
              Consistent commit velocity across full-stack repositories &amp; open-source tooling.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Streak: 45 Days</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-slate-300">
            <GitCommit className="w-3.5 h-3.5 text-cyan-400" />
            <span>680+ Commits</span>
          </div>
        </div>
      </div>

      {/* Contribution Grid */}
      <div className="pt-6 overflow-x-auto pb-2">
        <div className="inline-flex gap-1.5 min-w-[620px]">
          {Array.from({ length: weeks }).map((_, wIdx) => (
            <div key={wIdx} className="flex flex-col gap-1.5">
              {Array.from({ length: days }).map((_, dIdx) => (
                <div
                  key={dIdx}
                  className={`w-3.5 h-3.5 rounded-[3px] border ${getActivityLevel(
                    wIdx,
                    dIdx
                  )} transition-transform hover:scale-125 cursor-pointer`}
                  title={`Week ${wIdx + 1}, Day ${dIdx + 1}: Active commits`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Heatmap Legend & Summary */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-800/80 text-[11px] text-slate-400">
        <div className="flex items-center gap-2">
          <span>Less</span>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-[3px] bg-slate-900 border border-slate-800" />
            <span className="w-3 h-3 rounded-[3px] bg-emerald-950 border border-emerald-900/60" />
            <span className="w-3 h-3 rounded-[3px] bg-emerald-800/80 border border-emerald-700/80" />
            <span className="w-3 h-3 rounded-[3px] bg-emerald-500 border border-emerald-400 shadow-sm" />
          </div>
          <span>More activity</span>
        </div>

        <div className="flex items-center gap-4 text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400" />
            <span>TypeScript 88%</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>React/Next.js</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-purple-400" />
            <span>Node / SQL</span>
          </span>
        </div>
      </div>
    </div>
  );
}

