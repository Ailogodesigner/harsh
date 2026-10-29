import { ShieldCheck, Lock, CheckCircle2, AlertTriangle, Key, Terminal } from "lucide-react";
import NextLink from "next/link";

export const metadata = {
  title: "Account Verification Policy | Harsh Unlimited",
  description:
    "Official player account verification, Minecraft profile linking protocol, and identity security guidelines for Harsh Unlimited.",
};

export default function VerificationPolicyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Header */}
      <div className="border-b border-slate-800 pb-6 space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs font-bold text-emerald-400 uppercase tracking-widest">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Security &amp; Fraud Prevention</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          ACCOUNT VERIFICATION POLICY
        </h1>
        <p className="text-xs text-slate-400">
          Last updated: October 2026 &bull; Effective for all Harsh Unlimited players and store patrons
        </p>
      </div>

      {/* Highlights Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-emerald-500/30 bg-emerald-950/10 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="flex items-start gap-3">
          <Lock className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Zero Password Exposure</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">We will never ask for your Microsoft or Minecraft credentials.</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <Terminal className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">In-Game Handshake</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Verified securely using our native in-game /verify command.</p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">Fraud &amp; Chargeback Shield</h4>
            <p className="text-[11px] text-slate-400 mt-0.5">Guarantees digital perks are credited to the rightful owner.</p>
          </div>
        </div>
      </div>

      {/* Main Policy Sections */}
      <div className="space-y-8 text-xs sm:text-sm text-slate-300 leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="text-emerald-400 font-mono">1.</span>
            <span>Purpose of Player Account Verification</span>
          </h2>
          <p>
            Harsh Unlimited enforces an integrated verification mechanism between website user accounts and in-game Minecraft Java / Bedrock profiles. This protocol ensures that:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-400">
            <li>Paid ranks, kit claims, and virtual currencies purchased in the web store are deposited instantly into the correct player inventory without manual staff delays.</li>
            <li>Unauthorized third parties cannot impersonate high-ranking players or hijack in-game permissions.</li>
            <li>Support tickets and player dispute inquiries can be accurately cross-referenced against server activity logs and purchase history.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="text-emerald-400 font-mono">2.</span>
            <span>The Verification Protocol &amp; In-Game Handshake</span>
          </h2>
          <p>
            To verify a Minecraft profile, the player initiates linking from their Customer Dashboard. The network generates a temporary, cryptographically randomized 6-character verification token (e.g., <code className="text-emerald-400 font-mono bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">HU-XXXXX</code>).
          </p>
          <p>
            The player must log in to the server at <code className="text-cyan-400 font-mono bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800">play.harshunlimited.fun</code> and execute:
          </p>
          <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 font-mono text-xs text-emerald-400 font-bold">
            /verify &lt;your-code&gt;
          </div>
          <p className="text-xs text-slate-400">
            Once executed, our backend verifies the handshake, queries the public Mojang API to confirm the unique player UUID, and marks the profile as verified permanently.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="text-emerald-400 font-mono">3.</span>
            <span>Credential Safety &amp; Non-Disclosure</span>
          </h2>
          <p>
            Harsh Unlimited administrators, developers, and automated tools will <strong>NEVER</strong> request your Microsoft account password, email authentication codes, or session tokens.
          </p>
          <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-2.5">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <strong>Security Warning:</strong> Any individual in-game or on Discord claiming to be server staff and requesting your account credentials or payment OTPs is attempting an unauthorized scam. Report such interactions immediately through our <NextLink href="/support" className="text-white underline">Support Portal</NextLink>.
            </div>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="text-emerald-400 font-mono">4.</span>
            <span>Enforcement, Ban Inheritance &amp; Multi-Accounting</span>
          </h2>
          <p>
            In accordance with network rules against ban evasion, punishments (including blacklists, bans, and temporary mutes) applied to an in-game profile are strictly tied to the verified user account and associated hardware identifiers.
          </p>
          <p>
            Attempting to bypass punishments by linking unpunished alternate accounts will result in immediate permanent network blacklisting without eligibility for store refunds.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span className="text-emerald-400 font-mono">5.</span>
            <span>Unlinking &amp; Profile Transfer Requests</span>
          </h2>
          <p>
            Players wishing to unlink a compromised Minecraft IGN or transfer their verified rank to a new Mojang username must submit an official <NextLink href="/support" className="text-emerald-400 underline">Support Ticket</NextLink>. Proof of original order payment (Cashfree transaction ID) may be required to prevent fraudulent identity takeovers.
          </p>
        </section>
      </div>

      {/* Return CTA */}
      <div className="pt-6 border-t border-slate-800 flex items-center justify-between">
        <NextLink
          href="/dashboard"
          className="text-xs font-bold text-slate-400 hover:text-white transition-colors"
        >
          ← Return to Customer Dashboard
        </NextLink>

        <NextLink
          href="/terms"
          className="text-xs font-bold text-emerald-400 hover:text-emerald-300 transition-colors"
        >
          Terms of Service →
        </NextLink>
      </div>
    </div>
  );
}
