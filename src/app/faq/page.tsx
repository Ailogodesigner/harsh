import { HelpCircle, ChevronRight, ShoppingCart, Gamepad2, Shield } from "lucide-react";

export const metadata = {
  title: "Frequently Asked Questions | Harsh Unlimited",
  description: "Common questions about store purchases, account verification, server connectivity, and ranks.",
};

export default function FAQPage() {
  const faqSections = [
    {
      category: "Rank Store & Purchases",
      icon: ShoppingCart,
      items: [
        {
          q: "How long does rank delivery take after checkout?",
          a: "Rank delivery is completely automated. As soon as Cashfree confirms your payment (usually 10 to 60 seconds), our backend queues and executes the in-game commands. If you are online during purchase, you may need to relog or type /hub to refresh your tab prefix.",
        },
        {
          q: "What payment methods are supported?",
          a: "Through our payment provider Cashfree Payments, we support UPI (Google Pay, PhonePe, Paytm), Indian NetBanking (all major banks), Debit/Credit Cards (Visa, MasterCard, RuPay), and popular digital wallets.",
        },
        {
          q: "What happens if I entered the wrong Minecraft username?",
          a: "Contact our staff team immediately via our Discord or open a Support Ticket on this website before claiming perks in-game. Please provide your order ID (HU-ORD-...) and Cashfree payment reference.",
        },
        {
          q: "Are store purchases permanent?",
          a: "Yes! All ranks (VIP, MVP, TITAN, IMMORTAL) are permanent lifetime upgrades that persist across map resets and season updates.",
        },
      ],
    },
    {
      category: "Connecting & Gameplay",
      icon: Gamepad2,
      items: [
        {
          q: "How do I connect from Minecraft Bedrock Edition (Phone/Console)?",
          a: "Open Bedrock Edition, navigate to Servers > Add Server. Enter Server Address: play.harshunlimited.fun and Port: 25565. Save and tap Play.",
        },
        {
          q: "Can I upgrade my rank later (e.g. from VIP to MVP)?",
          a: "Yes! Our store supports rank upgrades. You only pay the difference in minor currency units between your existing rank and the target rank.",
        },
        {
          q: "What is Lifesteal SMP?",
          a: "Lifesteal is an intense PvP game mode where killing another player steals +1 heart from them and adds it to your maximum health pool. If you lose all your hearts, you enter a temporary spectator cooldown until teammates craft a Revive Beacon.",
        },
      ],
    },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-12">
      <div className="text-center space-y-4 max-w-3xl mx-auto">
        <span className="text-xs font-bold uppercase tracking-widest text-emerald-400">
          Knowledge Base
        </span>
        <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight">
          FREQUENTLY ASKED <span className="text-emerald-400">QUESTIONS</span>
        </h1>
        <p className="text-sm text-slate-300 leading-relaxed">
          Quick answers to common inquiries regarding store orders, payments, connection troubleshooting, and server rules.
        </p>
      </div>

      <div className="space-y-10">
        {faqSections.map((sec, idx) => {
          const Icon = sec.icon;
          return (
            <div key={idx} className="space-y-4">
              <div className="flex items-center gap-2.5 pb-2 border-b border-slate-800">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <Icon className="w-5 h-5" />
                </div>
                <h2 className="text-xl font-bold text-white">{sec.category}</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {sec.items.map((item, i) => (
                  <div key={i} className="glass-panel rounded-2xl p-6 border border-slate-800 space-y-2">
                    <h3 className="font-bold text-sm text-white flex items-start gap-2">
                      <span className="text-emerald-400 font-mono font-bold">Q.</span>
                      <span>{item.q}</span>
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed pl-5">
                      {item.a}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
