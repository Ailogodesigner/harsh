export const metadata = {
  title: "Terms of Service | Harsh Unlimited",
  description: "Terms and conditions governing the use of Harsh Unlimited services and rank store.",
};

export default function TermsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="border-b border-slate-800 pb-6">
        <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">Legal Agreement</span>
        <h1 className="text-3xl sm:text-4xl font-black text-white mt-1">TERMS OF SERVICE</h1>
        <p className="text-xs text-slate-400 mt-2">Last updated: October 2026</p>
      </div>

      <div className="space-y-6 text-xs sm:text-sm text-slate-300 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">1. Acceptance of Terms</h2>
          <p>
            By accessing or playing on the Harsh Unlimited Minecraft network (play.harshunlimited.fun) or utilizing our official web store, you agree to be bound by these Terms of Service and all server rules. If you disagree with any portion of these terms, you must discontinue use immediately.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">2. Nature of Digital Goods</h2>
          <p>
            All products offered in the Harsh Unlimited store are intangible virtual goods, cosmetic enhancements, and gameplay privileges specifically designed for use within the Harsh Unlimited server ecosystem. Purchases do not grant ownership of intellectual property or underlying server hardware.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">3. Mojang Disclaimer</h2>
          <p>
            Harsh Unlimited is NOT affiliated with, sponsored by, or endorsed by Mojang Studios or Microsoft. Any purchase made through our platform is made directly with the Harsh Unlimited network administration.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">4. Disciplinary Actions &amp; Bans</h2>
          <p>
            Holding a paid rank or in-game product does not grant immunity from server rules. In the event of severe rule infractions (including cheating, toxicity, harassment, or item duplication), staff reserve the right to suspend or ban any player account without refund eligibility.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">5. Service Availability</h2>
          <p>
            While we strive for 99.9% uptime, we do not guarantee uninterrupted server operations. Occasional maintenance, updates, or network provider interruptions may occur.
          </p>
        </section>
      </div>
    </div>
  );
}
