import prisma from "@/lib/prisma";
import { getMinecraftServerStatus } from "@/lib/minecraft/ping";
import { Shield, Code, HeartHandshake, UserCheck, Sparkles, CheckCircle2 } from "lucide-react";
import NextLink from "next/link";

export const metadata = {
  title: "Staff Team | Harsh Unlimited Minecraft Network",
  description: "Meet the administration, development, and moderation team keeping Harsh Unlimited safe, active, and cheat-free.",
};

const DEFAULT_STAFF = [
  {
    id: "1",
    name: "HarshUnlimited",
    displayName: "Harsh",
    role: "Network Director & Founder",
    tag: "OWNER",
    category: "LEADERSHIP",
    color: "rose",
    sortOrder: 1,
  },
  {
    id: "2",
    name: "UVTANDI",
    displayName: "UV Tandi",
    role: "Network Operations & Community Manager",
    tag: "MANAGER",
    category: "LEADERSHIP",
    color: "amber",
    sortOrder: 2,
  },
  {
    id: "3",
    name: "akhilplayzyt",
    displayName: "Akhil",
    role: "Lead Systems Architect & Developer",
    tag: "LEAD DEV",
    category: "DEVELOPMENT",
    color: "cyan",
    sortOrder: 3,
  },
  {
    id: "4",
    name: "kairo04_",
    displayName: "Kairo",
    role: "Server Administrator & Technical Ops",
    tag: "ADMIN",
    category: "MANAGEMENT",
    color: "purple",
    sortOrder: 4,
  },
  {
    id: "5",
    name: "nxt_mohit",
    displayName: "Mohit",
    role: "Senior Survival SMP Moderator",
    tag: "MOD",
    category: "MODERATION",
    color: "emerald",
    sortOrder: 5,
  },
];

const COLOR_MAP: Record<string, string> = {
  rose: "text-rose-400 bg-rose-500/10 border-rose-500/25",
  amber: "text-amber-400 bg-amber-500/10 border-amber-500/25",
  cyan: "text-cyan-400 bg-cyan-500/10 border-cyan-500/25",
  purple: "text-purple-400 bg-purple-500/10 border-purple-500/25",
  emerald: "text-emerald-400 bg-emerald-500/10 border-emerald-500/25",
  blue: "text-blue-400 bg-blue-500/10 border-blue-500/25",
};

interface StaffItem {
  id: string;
  name: string;
  displayName?: string | null;
  role: string;
  tag: string;
  category: string;
  color: string;
  sortOrder: number;
}

export default async function StaffPage() {
  let staffList: StaffItem[] = DEFAULT_STAFF;

  try {
    const dbStaff = await prisma.staffMember.findMany({
      where: { active: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });
    if (dbStaff && dbStaff.length > 0) {
      staffList = dbStaff;
    }
  } catch {
    // Graceful fallback to verified staff
  }

  // Fetch live server players to detect who is currently playing in-game!
  let onlinePlayers: string[] = [];
  try {
    const status = await getMinecraftServerStatus();
    if (status.online && status.players?.list) {
      onlinePlayers = status.players.list.map((p) => p.toLowerCase());
    }
  } catch {
    // Ignore ping error
  }

  const leadership = staffList.filter((s) => s.category === "LEADERSHIP");
  const development = staffList.filter((s) => s.category === "DEVELOPMENT");
  const management = staffList.filter((s) => s.category === "MANAGEMENT");
  const moderation = staffList.filter((s) => s.category === "MODERATION" || (!["LEADERSHIP", "DEVELOPMENT", "MANAGEMENT"].includes(s.category)));

  const renderStaffCard = (member: (typeof staffList)[0]) => {
    const isOnlineNow = onlinePlayers.includes(member.name.toLowerCase());
    const badgeStyle = COLOR_MAP[member.color] || COLOR_MAP.emerald;

    return (
      <div
        key={member.id}
        className="glass-panel rounded-2xl p-5 border border-slate-800/80 hover:border-slate-700 transition-all flex items-center justify-between gap-4 group relative overflow-hidden"
      >
        <div className="flex items-center gap-4">
          <div className="relative shrink-0">
            <img
              src={`https://mc-heads.net/avatar/${member.name}/54`}
              alt={member.name}
              className="w-13 h-13 rounded-2xl bg-slate-950 border border-slate-800 shadow-md object-cover"
            />
            {isOnlineNow && (
              <span
                className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-slate-950 flex items-center justify-center animate-pulse"
                title="Playing online right now!"
              />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-white text-base">
                {member.displayName || member.name}
              </h3>
              <span className={`text-[9px] font-black px-2 py-0.5 rounded-md border tracking-wider uppercase ${badgeStyle}`}>
                {member.tag}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{member.role}</p>
            <div className="flex items-center gap-2 mt-1.5">
              <span className="text-[10px] text-slate-500 font-mono">IGN: {member.name}</span>
              {isOnlineNow && (
                <>
                  <span className="text-[10px] text-slate-600">•</span>
                  <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block animate-ping" />
                    In-Game Now
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
          Network Guardians
        </span>
        <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
          STAFF <span className="text-emerald-400">TEAM</span>
        </h1>
        <p className="text-sm text-slate-300 leading-relaxed">
          The dedicated administrators, developers, and moderators keeping Harsh Unlimited high-performance, welcoming, and cheat-free.
        </p>
      </div>

      <div className="space-y-10">
        {/* Leadership */}
        {leadership.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-rose-400" />
              <span>Network Leadership & Founders</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {leadership.map(renderStaffCard)}
            </div>
          </div>
        )}

        {/* Development & Tech */}
        {development.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Code className="w-5 h-5 text-cyan-400" />
              <span>Systems Architecture & Development</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {development.map(renderStaffCard)}
            </div>
          </div>
        )}

        {/* Server Management */}
        {management.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-purple-400" />
              <span>Operations & Infrastructure</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {management.map(renderStaffCard)}
            </div>
          </div>
        )}

        {/* Moderation */}
        {moderation.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <HeartHandshake className="w-5 h-5 text-emerald-400" />
              <span>Community Moderation Team</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {moderation.map(renderStaffCard)}
            </div>
          </div>
        )}

        {/* Staff Application CTA */}
        <div className="glass-panel rounded-2xl p-8 border border-emerald-500/30 text-center space-y-3 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950">
          <h3 className="text-xl font-bold text-white">Interested in joining our staff team?</h3>
          <p className="text-xs text-slate-300 max-w-lg mx-auto">
            We are always scouting for enthusiastic, mature, and dedicated community moderators and builders.
          </p>
          <div className="pt-2">
            <NextLink
              href="/apply"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/20 transition-all"
            >
              <Sparkles className="w-4 h-4" />
              <span>Submit Staff Application</span>
            </NextLink>
          </div>
        </div>
      </div>
    </div>
  );
}
