import type { Metadata, Viewport } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SecurityGuard from "@/components/SecurityGuard";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#10b981",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://harshunlimited.fun"),
  title: "Harsh Unlimited | Premium Minecraft Gaming Network",
  description:
    "India's premier Minecraft network featuring custom Lifesteal SMP, enhanced Survival economy, BoxPvP, and automated instant rank delivery.",
  alternates: {
    canonical: "https://harshunlimited.fun",
  },
  verification: {
    google:
      process.env.GOOGLE_SITE_VERIFICATION ||
      process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION ||
      undefined,
  },
  keywords: [
    "Harsh Unlimited",
    "Minecraft server",
    "Lifesteal SMP",
    "BoxPvP",
    "Survival SMP",
    "Minecraft Java Bedrock",
    "play.harshunlimited.fun",
  ],
  authors: [{ name: "Harsh Unlimited Network" }],
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  openGraph: {
    title: "Harsh Unlimited — Premium Minecraft Gaming Network",
    description: "Your Next Adventure Starts Here. Join on Java and Bedrock at play.harshunlimited.fun",
    url: "https://harshunlimited.fun",
    siteName: "Harsh Unlimited",
    images: [{ url: "/logo.png", width: 512, height: 512, alt: "Harsh Unlimited Mascot Logo" }],
    locale: "en_IN",
    type: "website",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Harsh Unlimited",
  url: "https://harshunlimited.fun",
  description:
    "India's premier Minecraft network featuring custom Lifesteal SMP, enhanced Survival economy, BoxPvP, and automated instant rank delivery.",
  potentialAction: {
    "@type": "SearchAction",
    target: "https://harshunlimited.fun/wiki?q={search_term_string}",
    "query-input": "required name=search_term_string",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full antialiased scroll-smooth">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-screen flex flex-col bg-[#08090d] text-slate-100 selection:bg-emerald-500/30 selection:text-emerald-300">
        <SecurityGuard />
        <Navbar />
        <main className="flex-1 w-full">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
