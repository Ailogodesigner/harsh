import type { NextConfig } from "next";

const cspHeader = [
  "default-src 'self' https: data: blob:",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https:",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https:",
  "font-src 'self' https://fonts.gstatic.com data: https:",
  "img-src 'self' blob: data: https:",
  "media-src 'self' blob: data: https:",
  "connect-src 'self' https: wss:",
  "frame-src 'self' https: data:",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join("; ");

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  async redirects() {
    return [
      { source: "/store", destination: "/bot-order", permanent: true },
      { source: "/rules", destination: "/", permanent: true },
      { source: "/staff", destination: "/", permanent: true },
      { source: "/gamemodes", destination: "/", permanent: true },
      { source: "/announcements", destination: "/", permanent: true },
      { source: "/tickets", destination: "/#contact", permanent: true },
      { source: "/bans", destination: "/", permanent: true },
      { source: "/vote", destination: "/", permanent: true },
      { source: "/leaderboard", destination: "/", permanent: true },
      { source: "/apply", destination: "/#contact", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: cspHeader },
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-XSS-Protection", value: "1; mode=block" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
        ],
      },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
