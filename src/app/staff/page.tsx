import { Shield, Code, HeartHandshake, UserCheck, MessageSquare } from "lucide-react";

export const metadata = {
  title: "Staff Team | Harsh Unlimited Minecraft Network",
  description: "Meet the administration, development, and moderation team keeping Harsh Unlimited safe and active.",
};

export default function StaffPage() {
  const leadership = [
    { name: "Harsh", role: "Owner & Network Director", tag: "OWNER", color: "text-rose-400 bg-rose-500/10 border-rose-500/20" },
    { name: "Aditya", role: "Lead Systems Architect & Tech", tag: "LEAD DEV", color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20" },
  ];

  const administration = [
    { name: "NexusAdmin", role: "Server Operations & Billing", tag: "ADMIN", color: "text-amber-400 bg-amber-500/10 border-amber-500/20" },
    { name: "ShadowMod", role: "Head of Moderation", tag: "HEAD MOD", color: "text-purple-400 bg-purple-500/10 border-purple-500/20" },
  ];

  const moderators = [
    { name: "FrostyGuard", role: "Senior Moderator (Lifesteal)", tag: "MOD", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
    { name: "IronShield", role: "Senior Moderator (Survival)", tag: "MOD", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
    { name: "BlazeHelper", role: "Community Helper & Support", tag: "HELPER", color: "text-blue-400 bg-blue-500/10 border-blue-500/20" },
  ];

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
          The dedicated volunteers, developers, and administrators committed to maintaining a high-performance, cheat-free environment.
        </p>
      </div>

      <div className="space-y-10">
        {/* Leadership */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Shield className="w-5 h-5 text-rose-400" />
            <span>Network Leadership</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {leadership.map((member) => (
              <div
                key={member.name}
                className="glass-panel rounded-2xl p-6 border border-slate-800 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={`https://mc-heads.net/avatar/${member.name}/48`}
                    alt={member.name}
                    className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800"
                  />
                  <div>
                    <h3 className="font-bold text-white text-base">{member.name}</h3>
                    <p className="text-xs text-slate-400">{member.role}</p>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md border ${member.color}`}>
                  {member.tag}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Administration */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <Code className="w-5 h-5 text-amber-400" />
            <span>Server Administration</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {administration.map((member) => (
              <div
                key={member.name}
                className="glass-panel rounded-2xl p-6 border border-slate-800 flex items-center justify-between"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={`https://mc-heads.net/avatar/${member.name}/48`}
                    alt={member.name}
                    className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800"
                  />
                  <div>
                    <h3 className="font-bold text-white text-base">{member.name}</h3>
                    <p className="text-xs text-slate-400">{member.role}</p>
                  </div>
                </div>
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md border ${member.color}`}>
                  {member.tag}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Moderation */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <HeartHandshake className="w-5 h-5 text-emerald-400" />
            <span>Community Moderation Team</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {moderators.map((member) => (
              <div
                key={member.name}
                className="glass-panel rounded-2xl p-5 border border-slate-800 flex flex-col justify-between space-y-4"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={`https://mc-heads.net/avatar/${member.name}/40`}
                    alt={member.name}
                    className="w-10 h-10 rounded-xl bg-slate-950 border border-slate-800"
                  />
                  <div>
                    <h3 className="font-bold text-white text-sm">{member.name}</h3>
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${member.color}`}>
                      {member.tag}
                    </span>
                  </div>
                </div>
                <p className="text-[11px] text-slate-400">{member.role}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Staff Application CTA */}
        <div className="glass-panel rounded-2xl p-8 border border-emerald-500/30 text-center space-y-3 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950">
          <h3 className="text-xl font-bold text-white">Interested in joining our staff team?</h3>
          <p className="text-xs text-slate-300 max-w-lg mx-auto">
            We are always scouting for enthusiastic, mature, and dedicated community moderators and developers.
          </p>
          <div className="pt-2">
            <a
              href="https://discord.gg/harshunlimited"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-md shadow-emerald-500/20 transition-all"
            >
              <MessageSquare className="w-4 h-4" />
              <span>APPLY VIA DISCORD</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
