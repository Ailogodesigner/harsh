export const metadata = {
  title: "Privacy Policy | Harsh Unlimited",
  description: "Privacy policy regarding user data handling and security on Harsh Unlimited.",
};

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="border-b border-slate-800 pb-6">
        <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">Data Protection</span>
        <h1 className="text-3xl sm:text-4xl font-black text-white mt-1">PRIVACY POLICY</h1>
        <p className="text-xs text-slate-400 mt-2">Last updated: October 2026</p>
      </div>

      <div className="space-y-6 text-xs sm:text-sm text-slate-300 leading-relaxed">
        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">1. Information We Collect</h2>
          <p>
            When you register on our website or make a store purchase, we collect necessary account data including:
          </p>
          <ul className="list-disc list-inside space-y-1 pl-2 text-slate-400">
            <li>Customer name and email address</li>
            <li>Minecraft username and Mojang unique identifier (UUID)</li>
            <li>IP addresses and transaction metadata for fraud prevention</li>
            <li>Support correspondence and server connection logs</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">2. Payment Security</h2>
          <p>
            We process all digital payments through Cashfree Payments, an authorized and PCI-DSS compliant payment aggregator. We NEVER collect, store, or process raw credit card numbers or sensitive banking credentials on our web servers.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">3. How Information is Used</h2>
          <p>
            Your information is used strictly to authenticate accounts, deliver purchased digital ranks and entitlements to the correct Minecraft player, send transaction receipts, and respond to support tickets. We never sell or distribute player information to third-party advertising companies.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">4. Cookies &amp; Sessions</h2>
          <p>
            Our web application utilizes HTTP-only, secure cookies for session authentication and user security. These cookies contain encrypted JSON Web Tokens (JWT) and do not track you across external websites.
          </p>
        </section>
      </div>
    </div>
  );
}
