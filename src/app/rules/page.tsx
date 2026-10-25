import { BookOpen, ShieldAlert, CheckCircle2, AlertOctagon } from "lucide-react";

export const metadata = {
  title: "Rules & Community Guidelines | Harsh Unlimited",
  description: "Official server rules, allowed client modifications, and punishment guidelines on Harsh Unlimited.",
};

export default function RulesPage() {
  const sections = [
    {
      title: "1. Respect & Chat Conduct",
      rules: [
        "Do not engage in harassment, hate speech, racism, or excessive toxicity in public chat or private messages.",
        "No spamming, flooding chat, or advertising external Minecraft servers, Discord servers, or non-whitelisted links.",
        "English and Hindi are the primary languages permitted in public global chat.",
        "Staff directions must be respected. If you disagree with a staff member's decision, submit a polite ticket on our website.",
      ],
    },
    {
      title: "2. Fair Play & Client Modifications",
      rules: [
        "Strictly prohibited: Hacked clients (e.g. Meteor, Aristois, LiquidBounce), fly hacks, kill aura, reach, and speed hacks.",
        "Strictly prohibited: X-Ray texture packs, baritone pathfinding bots, automatic mining scripts, and hardware macro clickers exceeding 16 CPS.",
        "Approved modifications: Sodium, Lithium, FerriteCore, Iris Shaders, OptiFine, Armor HUD, and official Badlion/Lunar/Feather clients.",
        "Minimap mods are allowed provided player entity tracking and cave radar functions are disabled.",
      ],
    },
    {
      title: "3. Gameplay, Griefing & Economy",
      rules: [
        "In Survival SMP: Griefing or stealing within player claimed land is strictly forbidden. Always use /claim to protect your builds.",
        "In Lifesteal SMP: Griefing and heart stealing outside designated safe spawn zones is permitted. Combat logging is automatically penalized by death.",
        "Bug exploitation and item duplication: Any attempt to dupe items, crash servers, or exploit unintended plugin bugs will result in an immediate permanent ban.",
        "Real-World Trading (RWT): Selling in-game currency, items, or ranks for real money outside our official Cashfree web store is strictly forbidden.",
      ],
    },
  ];

  const penalties = [
    { violation: "Minor Chat Toxicity / Spam", first: "1-Hour Mute", repeat: "24-Hour Mute / 3-Day Ban" },
    { violation: "Advertising External Servers", first: "7-Day Network Ban", repeat: "Permanent IP Ban" },
    { violation: "X-Ray / Unfair Advantage Mods", first: "14-Day Ban + Inventory Wipe", repeat: "Permanent Ban" },
    { violation: "Hacked Combat Clients (Killaura/Speed)", first: "30-Day Ban", repeat: "Permanent Hardware Ban" },
    { violation: "Duplication / Server Crashing", first: "Immediate Permanent Ban", repeat: "Permanent Hardware Ban" },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
          Server Guidelines
        </span>
        <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
          HARSH UNLIMITED <span className="text-emerald-400">RULES</span>
        </h1>
        <p className="text-sm text-slate-300 leading-relaxed">
          To maintain a fun, competitive, and welcoming atmosphere for all players, you must adhere to the following community standards.
        </p>
      </div>

      <div className="space-y-8">
        {sections.map((section, idx) => (
          <div key={idx} className="glass-panel rounded-2xl p-6 sm:p-8 border border-slate-800 space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <span className="text-emerald-400 font-mono">§</span>
              <span>{section.title}</span>
            </h2>
            <ul className="space-y-3">
              {section.rules.map((r, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{r}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {/* Penalty Tier Table */}
        <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-amber-500/30 space-y-4">
          <div className="flex items-center gap-2 text-amber-400">
            <AlertOctagon className="w-5 h-5" />
            <h2 className="text-xl font-bold text-white">Punishment &amp; Penalty Matrix</h2>
          </div>
          <p className="text-xs text-slate-400">
            Punishment severity escalates with repeat infractions. All moderation actions are logged permanently.
          </p>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300 border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase text-[11px]">
                  <th className="py-3 px-4">Infraction</th>
                  <th className="py-3 px-4">First Offense</th>
                  <th className="py-3 px-4">Repeat Offenses</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 font-mono">
                {penalties.map((p, i) => (
                  <tr key={i} className="hover:bg-slate-900/40">
                    <td className="py-3 px-4 font-sans font-medium text-white">{p.violation}</td>
                    <td className="py-3 px-4 text-amber-300">{p.first}</td>
                    <td className="py-3 px-4 text-rose-400">{p.repeat}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
