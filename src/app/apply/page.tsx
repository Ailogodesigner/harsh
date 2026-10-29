"use client";

import { useState } from "react";
import {
  ClipboardList,
  CheckCircle2,
  AlertCircle,
  Send,
  Shield,
  HelpCircle,
  User,
  MessageSquare,
  Sparkles,
} from "lucide-react";

export default function ApplyPage() {
  const [position, setPosition] = useState("HELPER");
  const [minecraftName, setMinecraftName] = useState("");
  const [discordTag, setDiscordTag] = useState("");
  const [age, setAge] = useState(16);
  const [timezone, setTimezone] = useState("IST (UTC+5:30)");
  const [experience, setExperience] = useState("");
  const [whyJoin, setWhyJoin] = useState("");
  const [scenarioAnswer, setScenarioAnswer] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (Number(age) < 15) {
      setError("Minimum age requirement for staff applicants is 15 years.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          position,
          minecraftName,
          discordTag,
          age: Number(age),
          timezone,
          experience,
          whyJoin,
          scenarioAnswer,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to submit application");
        setSubmitting(false);
        return;
      }

      setSuccess(true);
    } catch (err: any) {
      setError(err?.message || "An unexpected error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      {/* Page Header */}
      <div className="text-center space-y-4 max-w-2xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
          Staff Recruitment
        </span>
        <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight flex items-center justify-center gap-3">
          <ClipboardList className="w-10 h-10 text-emerald-400" />
          <span>APPLY FOR <span className="text-emerald-400">STAFF</span></span>
        </h1>
        <p className="text-sm text-slate-300 leading-relaxed">
          Join our leadership team. We are looking for mature, dedicated community moderators and developers to help grow Harsh Unlimited.
        </p>
      </div>

      {/* Application Requirements Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Requirement 1</span>
          <h4 className="font-bold text-white text-sm">Age Requirement</h4>
          <p className="text-xs text-slate-400">Must be at least 15 years of age or older.</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Requirement 2</span>
          <h4 className="font-bold text-white text-sm">Active &amp; Vocal</h4>
          <p className="text-xs text-slate-400">Active presence on in-game server and Discord.</p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-1">
          <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Requirement 3</span>
          <h4 className="font-bold text-white text-sm">Working Microphone</h4>
          <p className="text-xs text-slate-400">Ability to attend staff voice conferences.</p>
        </div>
      </div>

      {/* Main Application Form */}
      <div className="glass-panel rounded-3xl p-8 sm:p-10 border border-slate-800 shadow-2xl">
        {success ? (
          <div className="py-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 mx-auto flex items-center justify-center animate-in zoom-in">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-black text-white">Application Submitted Successfully!</h2>
            <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
              Thank you for applying to join the Harsh Unlimited staff team. Our administration will review your responses within 48 to 72 hours. Check your Discord messages for updates.
            </p>
            <div className="pt-4">
              <a
                href="https://dsc.gg/harshunlimited"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-xs bg-[#5865F2] hover:bg-[#4752c4] text-white shadow-md shadow-[#5865F2]/20 transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Return to Discord</span>
              </a>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-slate-800 text-white font-bold text-base">
              <User className="w-5 h-5 text-emerald-400" />
              <span>General Information</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Desired Staff Position <span className="text-emerald-400">*</span>
                </label>
                <select
                  value={position}
                  onChange={(e) => setPosition(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                >
                  <option value="HELPER">Community Helper (Chat &amp; Support)</option>
                  <option value="MODERATOR">Server Moderator (Anti-Cheat &amp; Bans)</option>
                  <option value="BUILDER">Network Builder (Maps &amp; Arenas)</option>
                  <option value="DEVELOPER">Systems / Plugin Developer</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Minecraft Username (IGN) <span className="text-emerald-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. HarshWarrior"
                  value={minecraftName}
                  onChange={(e) => setMinecraftName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Discord Tag / Username <span className="text-emerald-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. aditya_7047"
                  value={discordTag}
                  onChange={(e) => setDiscordTag(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Age <span className="text-emerald-400">* (Min 15)</span>
                </label>
                <input
                  type="number"
                  min={15}
                  max={60}
                  required
                  value={age}
                  onChange={(e) => setAge(parseInt(e.target.value, 10))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                  Timezone <span className="text-emerald-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. IST (UTC+5:30) or EST"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 pt-4 pb-2 border-b border-slate-800 text-white font-bold text-base">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              <span>Experience &amp; Detailed Scenarios</span>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Past Moderation or Administration Experience <span className="text-emerald-400">*</span>
              </label>
              <textarea
                required
                rows={4}
                placeholder="List any previous Minecraft servers or gaming communities you have staffed on, including your role and responsibilities..."
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Why do you want to join Harsh Unlimited? <span className="text-emerald-400">*</span>
              </label>
              <textarea
                required
                rows={4}
                placeholder="What motivates you to contribute to Harsh Unlimited over other networks? What unique skills do you bring?"
                value={whyJoin}
                onChange={(e) => setWhyJoin(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Scenario: A high-tier IMMORTAL rank holder is accused of hacking in Lifesteal SMP. How do you handle this? <span className="text-emerald-400">*</span>
              </label>
              <textarea
                required
                rows={4}
                placeholder="Detail your step-by-step investigation protocol, evidence gathering, command usage, and communication with both parties..."
                value={scenarioAnswer}
                onChange={(e) => setScenarioAnswer(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500 resize-none"
              />
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-4 rounded-xl font-bold text-xs uppercase tracking-wider bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 shadow-lg shadow-emerald-500/25 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              {submitting ? (
                <span>Submitting Application...</span>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit Staff Application</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
