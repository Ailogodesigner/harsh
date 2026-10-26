/**
 * Real Player Ranks resolution for Harsh Unlimited Minecraft Network.
 * Maps server players to their verified LuckPerms groups.
 * If a player has no donor or staff rank, defaults to "MEMBER".
 */

export interface PlayerRankInfo {
  rank: string;
  color: string;
  border: string;
  isDonorOrStaff: boolean;
}

export const KNOWN_PLAYER_RANKS: Record<string, { rank: string; color: string; border: string }> = {
  // Staff Team (from LuckPerms)
  harshunlimited: { rank: "OWNER", color: "text-amber-400 bg-amber-500/15", border: "border-amber-500/40" },
  harsh: { rank: "OWNER", color: "text-amber-400 bg-amber-500/15", border: "border-amber-500/40" },
  uvtandi: { rank: "MANAGER", color: "text-rose-400 bg-rose-500/15", border: "border-rose-500/40" },
  akhilplayzyt: { rank: "LEAD DEV", color: "text-blue-400 bg-blue-500/15", border: "border-blue-500/40" },
  kairo04_: { rank: "ADMIN", color: "text-red-400 bg-red-500/15", border: "border-red-500/40" },
  nxt_mohit: { rank: "MOD", color: "text-emerald-400 bg-emerald-500/15", border: "border-emerald-500/40" },

  // Real Donors (from LuckPerms)
  captaincharlie56: { rank: "OVERLORD", color: "text-yellow-400 bg-yellow-500/15", border: "border-yellow-500/40" },
  lord: { rank: "OVERLORD", color: "text-yellow-400 bg-yellow-500/15", border: "border-yellow-500/40" },
  darky: { rank: "ELITE", color: "text-purple-400 bg-purple-500/15", border: "border-purple-500/40" },
  jnviraj: { rank: "MVP", color: "text-cyan-400 bg-cyan-500/15", border: "border-cyan-500/40" },
  manav_123: { rank: "MVP", color: "text-cyan-400 bg-cyan-500/15", border: "border-cyan-500/40" },
};

/**
 * Returns the player's verified rank or defaults to "MEMBER".
 */
export function getPlayerRankInfo(username?: string | null): PlayerRankInfo {
  if (!username) {
    return {
      rank: "MEMBER",
      color: "text-slate-400 bg-slate-800/80",
      border: "border-slate-700/80",
      isDonorOrStaff: false,
    };
  }

  const clean = username.trim().toLowerCase();
  const matched = KNOWN_PLAYER_RANKS[clean];

  if (matched) {
    return {
      rank: matched.rank,
      color: matched.color,
      border: matched.border,
      isDonorOrStaff: true,
    };
  }

  // Default player rank is MEMBER
  return {
    rank: "MEMBER",
    color: "text-slate-400 bg-slate-800/80",
    border: "border-slate-700/80",
    isDonorOrStaff: false,
  };
}
