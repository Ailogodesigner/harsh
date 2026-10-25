import { AlertTriangle, ShieldCheck, Mail } from "lucide-react";

export const metadata = {
  title: "Refund & Cancellation Policy | Harsh Unlimited",
  description: "Official refund policy for digital Minecraft ranks and in-game store products on Harsh Unlimited.",
};

export default function RefundsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="border-b border-slate-800 pb-6">
        <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">Payment Terms</span>
        <h1 className="text-3xl sm:text-4xl font-black text-white mt-1">REFUND &amp; CANCELLATION POLICY</h1>
        <p className="text-xs text-slate-400 mt-2">Last updated: October 2026</p>
      </div>

      <div className="space-y-6 text-xs sm:text-sm text-slate-300 leading-relaxed">
        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-xs leading-relaxed">
            All purchases made on the Harsh Unlimited Store are for intangible virtual items and ranks that are immediately provisioned and delivered to the recipient in-game upon payment verification.
          </p>
        </div>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">1. Final Sale Policy</h2>
          <p>
            Due to the immediate consumption and delivery of digital goods in Minecraft, all sales are considered final once perks or ranks have been delivered to your in-game player profile. We do not provide refunds for buyer&apos;s remorse or accidental purchases if the items have already been utilized.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">2. Eligible Exceptions for Refunds</h2>
          <p>We will readily issue full refunds or correct orders under the following specific circumstances:</p>
          <ul className="list-disc list-inside space-y-1 pl-2 text-slate-400">
            <li>Duplicate billing caused by a payment gateway or network timeout.</li>
            <li>Failure of our server delivery systems to apply your perks within 48 hours of payment, provided you contacted support.</li>
            <li>Fraudulent or unauthorized payment card usage, upon verification with our payment aggregator Cashfree Payments.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">3. Chargebacks and Disputes</h2>
          <p>
            Opening an unauthorized chargeback or payment dispute via your bank without contacting our support team first constitutes a violation of our Terms of Service. In such cases, the associated Minecraft account and network IP will be automatically blacklisted from all Harsh Unlimited servers until the dispute is resolved.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-base font-bold text-white">4. How to Request Assistance</h2>
          <p>
            If you experienced an error during checkout or your perks did not arrive, please open a ticket on our Support page or join our Discord with your Internal Order ID (e.g. <span className="font-mono text-emerald-400">HU-ORD-20261025-XXXX</span>). Our billing team will resolve your inquiry promptly.
          </p>
        </section>
      </div>
    </div>
  );
}
