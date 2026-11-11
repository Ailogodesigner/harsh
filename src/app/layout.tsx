import type { Metadata, Viewport } from "next";
import "./globals.css";

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#06b6d4",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://notixnode.online"),
  alternates: {
    canonical: "https://notixnode.online",
  },
  title: "Marcel | Full-Stack Web Developer & Systems Engineer",
  description:
    "Portfolio of Marcel — Full-Stack Developer specializing in Next.js 16, React 19, TypeScript, scalable cloud backends, e-commerce payment engines, and high-performance web systems.",
  keywords: [
    "NOTIXNODE",
    "Best Discord Setups",
    "Custom Bot Development",
    "Marcel",
    "Full-Stack Developer",
    "Web Developer",
    "Next.js Developer",
    "React 19",
    "TypeScript",
    "Node.js",
    "Cloudflare Workers",
    "Freelance Developer India",
    "Software Engineer",
  ],
  authors: [{ name: "Marcel" }],
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Marcel | Full-Stack Web Developer",
    description:
      "Crafting high-performance web applications, scalable backends, and digital systems with clean code.",
    siteName: "Marcel Portfolio",
    locale: "en_US",
    type: "website",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Marcel",
  jobTitle: "Full-Stack Web Developer",
  url: "https://notixnode.online",
  sameAs: ["https://dsc.gg/notixnode"],
  knowsAbout: [
    "Next.js",
    "React",
    "TypeScript",
    "Node.js",
    "PostgreSQL",
    "Prisma ORM",
    "Cloudflare Workers",
    "E-Commerce Payment Gateways",
  ],
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
        {/* Google AdSense Script */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-6426115653237480"
          crossOrigin="anonymous"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-[#090a0f] text-slate-100 font-sans antialiased overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}
