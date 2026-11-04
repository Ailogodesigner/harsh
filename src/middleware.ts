import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const host = request.headers.get("host") || "";
  const { pathname } = request.nextUrl;

  // Check if incoming request is targeting the bot domain / subdomain
  // e.g., bot.notixnode.online, bot.localhost:3000, or host starting with bot.
  const isBotDomain =
    host.toLowerCase().startsWith("bot.") ||
    host.toLowerCase().includes("bot.notixnode");

  if (isBotDomain) {
    // When accessing root on the bot domain, rewrite directly to /bot-order
    if (pathname === "/" || pathname === "") {
      const url = request.nextUrl.clone();
      url.pathname = "/bot-order";
      return NextResponse.rewrite(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - api routes (e.g. /api/bot-order, /api/auth)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - static metadata files
     */
    "/((?!api|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
