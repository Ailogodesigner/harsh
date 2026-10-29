import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const COOKIE_NAME = "hu_session";
const ALLOWED_ADMIN_ROLES = ["SUPERADMIN", "ADMIN"];

function getSecretKey(): Uint8Array {
  const secret =
    process.env.JWT_SECRET ||
    process.env.AUTH_SECRET ||
    "harsh-unlimited-fallback-secret-at-least-32-chars-long";
  return new TextEncoder().encode(secret);
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const isApiAdmin = pathname.startsWith("/api/admin");
  const isPageAdmin = pathname.startsWith("/admin");

  if (!isApiAdmin && !isPageAdmin) {
    return NextResponse.next();
  }

  const token = req.cookies.get(COOKIE_NAME)?.value;

  if (!token) {
    if (isApiAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    loginUrl.searchParams.set("error", "UnauthorizedAdminAccess");
    return NextResponse.redirect(loginUrl);
  }

  try {
    const secretKey = getSecretKey();
    const { payload } = await jwtVerify(token, secretKey);
    const role = (payload.role as string)?.toUpperCase();

    if (!role || !ALLOWED_ADMIN_ROLES.includes(role)) {
      if (isApiAdmin) {
        return NextResponse.json({ error: "Forbidden: Administrator role required" }, { status: 403 });
      }
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("error", "UnauthorizedAdminAccess");
      return NextResponse.redirect(loginUrl);
    }

    // Pass authenticated user details to downstream routes via request headers
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-user-id", String(payload.id || ""));
    requestHeaders.set("x-user-email", String(payload.email || ""));
    requestHeaders.set("x-user-role", role);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch {
    // Token signature invalid, expired, or corrupted
    if (isApiAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("redirect", pathname);
    loginUrl.searchParams.set("error", "UnauthorizedAdminAccess");
    return NextResponse.redirect(loginUrl);
  }
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
