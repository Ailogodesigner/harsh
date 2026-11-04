"use client";

import { GitCommit, GitBranch, GitPullRequest, Flame, CheckCircle2 } from "lucide-react";
import GithubIcon from "./GithubIcon";
import { playCyberHover } from "./ui/SoundEffects";

export default function GithubCommitHeatmap() {
  // Generate a mock representation of 52 weeks x 7 days grid with varying green intensities
  const weeks = 36;
  const days = 7;

  // Predictable pattern generation based on week/day indices for realistic activity
  const getActivityLevel = (w: number, d: number) => {
    const seed = (w * 17 + d * 31) % 100;
    if (seed < 25) return "bg-[#0c0a1a] border-purple-950/60"; // none
    if (seed < 55) return "bg-purple-950/60 border-purple-900/60"; // low
    if (seed < 80) return "bg-emerald-700/80 border-lime-600/80"; // medium
    return "bg-lime-400 border-lime-300 shadow-[0_0_10px_rgba(163,230,53,0.5)]"; // high
  };

  return (
    <div className="w-full rounded-3xl border border-purple-500/25 bg-[#070611] p-6 sm:p-8 shadow-2xl shadow-purple-950/40 relative overflow-hidden font-mono text-left">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-5 border-b border-purple-500/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#0f0d22] border border-purple-500/30 flex items-center justify-center text-white">
            <GithubIcon className="w-5 h-5 text-purple-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-sm">github.com/Ailogodesigner</span>
              <span className="px-2 py-0.5 rounded text-[10px] bg-lime-500/10 text-lime-400 border border-lime-500/30 font-bold">
                Active Contributor
              </span>
            </div>
            <p className="text-[11px] text-purple-200/70 font-sans mt-0.5">
              Consistent commit velocity across full-stack repositories &amp; open-source tooling.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0d0b1f] border border-purple-500/30 text-amber-300">
            <Flame className="w-3.5 h-3.5 text-amber-400" />
            <span>Streak: 45 Days</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0d0b1f] border border-purple-500/30 text-lime-300">
            <GitCommit className="w-3.5 h-3.5 text-lime-400" />
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
                  onMouseEnter={() => playCyberHover()}
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
      <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-purple-500/20 text-[11px] text-purple-300/70">
        <div className="flex items-center gap-2">
          <span>Less</span>
          <div className="flex items-center gap-1">
            <span className="w-3 h-3 rounded-[3px] bg-[#0c0a1a] border border-purple-950/60" />
            <span className="w-3 h-3 rounded-[3px] bg-purple-950/60 border border-purple-900/60" />
            <span className="w-3 h-3 rounded-[3px] bg-emerald-700/80 border border-lime-600/80" />
            <span className="w-3 h-3 rounded-[3px] bg-lime-400 border border-lime-300 shadow-sm" />
          </div>
          <span>More activity</span>
        </div>

        <div className="flex items-center gap-4 text-purple-300/80">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-lime-400 shadow-[0_0_6px_rgba(163,230,53,0.8)]" />
            <span className="text-white font-mono">TypeScript 88%</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_6px_rgba(168,85,247,0.8)]" />
            <span className="text-white font-mono">React/Next.js</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.8)]" />
            <span className="text-white font-mono">Node / SQL</span>
          </span>
        </div>
      </div>
    </div>
  );
}

