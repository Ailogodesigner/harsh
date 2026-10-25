import ServerStatusCard from "@/components/ServerStatusCard";
import CopyButton from "@/components/CopyButton";
import { Monitor, Smartphone, CheckCircle, HelpCircle, AlertTriangle, ShieldCheck } from "lucide-react";

export const metadata = {
  title: "How to Play | Harsh Unlimited Minecraft Network",
  description: "Connection instructions for Minecraft Java and Bedrock Edition on Harsh Unlimited.",
};

export default function PlayPage() {
  const javaSteps = [
    "Launch Minecraft: Java Edition (version 1.20 - 1.21.x recommended).",
    "Click on 'Multiplayer' in the main menu, then select 'Add Server'.",
    "Enter 'Harsh Unlimited' in the Server Name field.",
    "Paste 'play.harshunlimited.fun' in the Server Address field.",
    "Set Server Resource Packs to 'Enabled' or 'Prompt' for custom item textures.",
    "Click 'Done' and double-click Harsh Unlimited to enter the network!",
  ];

  const bedrockSteps = [
    "Open Minecraft Bedrock Edition on Windows, Mobile (iOS/Android), or Console.",
    "Click 'Play' and navigate to the 'Servers' tab.",
    "Scroll to the bottom of the server list and tap 'Add Server'.",
    "Enter Server Name: 'Harsh Unlimited'.",
    "Enter Server Address: 'play.harshunlimited.fun'.",
    "Set Port: '25565' (Harsh Unlimited uses default 25565 for universal Bedrock routing).",
    "Tap 'Save' or 'Play' to connect immediately!",
  ];

  const faqs = [
    {
      q: "Can Java and Bedrock players play together in the same world?",
      a: "Yes! Harsh Unlimited features full cross-play bridging with GeyserMC. You can build, trade, and fight alongside friends regardless of platform.",
    },
    {
      q: "What Minecraft client versions are supported?",
      a: "Our core engine runs on modern 1.20 - 1.21.x releases with backward protocol compatibility for players using versions from 1.16 through 1.21.",
    },
    {
      q: "Are custom clients or mods allowed?",
      a: "Performance optimization mods such as Sodium, Lithium, and cosmetic client mods like Lunar Client or Badlion Client are fully approved. Any modification providing an unfair advantage (e.g. X-ray, auto-clickers, baritone) is strictly prohibited.",
    },
    {
      q: "I get 'Connection Timed Out' or 'Unknown Host', what should I do?",
      a: "Double-check your spelling for 'play.harshunlimited.fun'. If issues persist, try flushing your local DNS (ipconfig /flushdns on Windows) or connecting to our Discord for live server maintenance announcements.",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Page Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
          Connection Guide
        </span>
        <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
          CONNECT TO <span className="text-emerald-400">HARSH UNLIMITED</span>
        </h1>
        <p className="text-sm text-slate-300 leading-relaxed">
          Follow the simple steps below to join Harsh Unlimited on PC, Mac, Linux, iOS, Android, or Console.
        </p>
      </div>

      {/* Live Server Status Card */}
      <ServerStatusCard />

      {/* Step by Step Platform Instructions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Java Card */}
        <div className="glass-panel rounded-2xl p-8 border border-emerald-500/30 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-6 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
                  <Monitor className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Java Edition Guide</h2>
                  <p className="text-xs text-slate-400">PC / macOS / Linux</p>
                </div>
              </div>
              <span className="text-xs font-mono px-2.5 py-1 rounded bg-emerald-500/15 text-emerald-400">
                Port: 25565
              </span>
            </div>

            <div className="mt-6 space-y-4">
              {javaSteps.map((step, idx) => (
                <div key={idx} className="flex items-start gap-3 text-xs text-slate-300">
                  <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center shrink-0 text-[10px]">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed">{step}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-800/80 flex items-center justify-between bg-slate-950/80 p-3 rounded-xl border border-slate-800">
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Java Server Address</span>
              <span className="font-mono text-sm text-white font-semibold">play.harshunlimited.fun</span>
            </div>
            <CopyButton textToCopy="play.harshunlimited.fun" label="Copy Address" />
          </div>
        </div>

        {/* Bedrock Card */}
        <div className="glass-panel rounded-2xl p-8 border border-cyan-500/30 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-6 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400">
                  <Smartphone className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Bedrock Edition Guide</h2>
                  <p className="text-xs text-slate-400">Mobile (MCPE) / Windows 10 / Consoles</p>
                </div>
              </div>
              <span className="text-xs font-mono px-2.5 py-1 rounded bg-cyan-500/15 text-cyan-400">
                Port: 25565
              </span>
            </div>

            <div className="mt-6 space-y-4">
              {bedrockSteps.map((step, idx) => (
                <div key={idx} className="flex items-start gap-3 text-xs text-slate-300">
                  <span className="w-5 h-5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold flex items-center justify-center shrink-0 text-[10px]">
                    {idx + 1}
                  </span>
                  <span className="leading-relaxed">{step}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-800/80 flex items-center justify-between bg-slate-950/80 p-3 rounded-xl border border-slate-800">
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">Bedrock IP &amp; Port</span>
              <span className="font-mono text-sm text-white font-semibold">play.harshunlimited.fun:25565</span>
            </div>
            <CopyButton textToCopy="play.harshunlimited.fun" label="Copy IP" />
          </div>
        </div>
      </div>

      {/* Troubleshooting & FAQ Section */}
      <div className="space-y-6 pt-4">
        <div className="flex items-center gap-2">
          <HelpCircle className="w-5 h-5 text-emerald-400" />
          <h2 className="text-2xl font-bold text-white">Connection FAQs &amp; Troubleshooting</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {faqs.map((faq, i) => (
            <div key={i} className="glass-panel rounded-xl p-5 border border-slate-800 space-y-2">
              <h3 className="font-bold text-sm text-white flex items-start gap-2">
                <span className="text-emerald-400 font-mono">Q.</span>
                <span>{faq.q}</span>
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed pl-5">
                {faq.a}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
