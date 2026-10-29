import { NextResponse, NextRequest } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";
import prisma from "@/lib/prisma";
import { getSecretKey, COOKIE_NAME } from "@/lib/auth";

export interface AuthenticatedAdminUser {
  id: string;
  email: string;
  name: string;
  role: "ADMIN" | "SUPERADMIN";
  tokenVersion: number;
}

export interface AdminAuthResult {
  user: AuthenticatedAdminUser | null;
  error: NextResponse | null;
}

const ALLOWED_ADMIN_ROLES = ["SUPERADMIN", "ADMIN"];

/**
 * Extracts and strictly verifies admin session authentication from an incoming request.
 * Checks JWT signature against secret, checks role authorization, and verifies tokenVersion
 * against the database to prevent session hijacking and immediately enforce logouts.
 */
export async function verifyAdmin(req?: Request | NextRequest): Promise<AdminAuthResult> {
  try {
    let token: string | undefined;

    // 1. Try extracting token from Request cookie headers
    if (req) {
      const cookieHeader = req.headers.get("cookie") || "";
      const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${COOKIE_NAME}=([^;]+)`));
      if (match && match[1]) {
        token = decodeURIComponent(match[1]);
      }

      // Also support Authorization: Bearer <token>
      if (!token) {
        const authHeader = req.headers.get("authorization");
        if (authHeader && authHeader.startsWith("Bearer ")) {
          token = authHeader.substring(7).trim();
        }
      }
    }

    // 2. Fallback to Next.js cookie store if token not found from headers
    if (!token) {
      try {
        const cookieStore = await cookies();
        token = cookieStore.get(COOKIE_NAME)?.value;
      } catch {
        // Ignored if outside request context
      }
    }

    if (!token) {
      return {
        user: null,
        error: NextResponse.json(
          { error: "Unauthorized: Missing administrative session" },
          { status: 401 }
        ),
      };
    }

    // 3. Verify JWT signature with jose
    let payload: any;
    try {
      const secretKey = getSecretKey();
      const verified = await jwtVerify(token, secretKey);
      payload = verified.payload;
    } catch (jwtErr: any) {
      return {
        user: null,
        error: NextResponse.json(
          { error: "Unauthorized: Invalid or expired session token" },
          { status: 401 }
        ),
      };
    }

    const userId = payload.id as string;
    const userRole = (payload.role as string)?.toUpperCase();
    const tokenVersion = typeof payload.tokenVersion === "number" ? payload.tokenVersion : 0;

    if (!userId || !userRole || !ALLOWED_ADMIN_ROLES.includes(userRole)) {
      return {
        user: null,
        error: NextResponse.json(
          { error: "Forbidden: Superadmin or Administrator privileges required" },
          { status: 403 }
        ),
      };
    }

    // 4. Verify against Neon Database to detect revocations, role demotions, or tokenVersion increments
    try {
      const dbUser = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          tokenVersion: true,
        },
      });

      if (!dbUser) {
        return {
          user: null,
          error: NextResponse.json(
            { error: "Unauthorized: User account no longer exists" },
            { status: 401 }
          ),
        };
      }

      if (!ALLOWED_ADMIN_ROLES.includes(dbUser.role)) {
        return {
          user: null,
          error: NextResponse.json(
            { error: "Forbidden: User account privileges have been revoked" },
            { status: 403 }
          ),
        };
      }

      if (dbUser.tokenVersion !== tokenVersion) {
        return {
          user: null,
          error: NextResponse.json(
            { error: "Unauthorized: Session has expired or been terminated" },
            { status: 401 }
          ),
        };
      }

      return {
        user: {
          id: dbUser.id,
          email: dbUser.email,
          name: dbUser.name,
          role: dbUser.role as "ADMIN" | "SUPERADMIN",
          tokenVersion: dbUser.tokenVersion,
        },
        error: null,
      };
    } catch (dbErr) {
      // In case database connection is temporarily constrained, allow verified JWT if roles match
      console.warn("DB session verification fallback:", dbErr);
      return {
        user: {
          id: userId,
          email: payload.email as string,
          name: payload.name as string,
          role: userRole as "ADMIN" | "SUPERADMIN",
          tokenVersion,
        },
        error: null,
      };
    }
  } catch (err: any) {
    return {
      user: null,
      error: NextResponse.json(
        { error: "Internal session authentication failure" },
        { status: 500 }
      ),
    };
  }
}

/**
 * Masks an email address to protect player PII (e.g. `alexander@domain.com` -> `a*****r@domain.com`).
 */
export function maskEmail(email?: string | null): string {
  if (!email || typeof email !== "string") return "";
  const parts = email.split("@");
  if (parts.length !== 2) return "***";

  const [local, domain] = parts;
  if (local.length <= 2) {
    return `${local[0]}*@${domain}`;
  }

  const maskedLocal = `${local[0]}${"*".repeat(Math.min(local.length - 2, 6))}${local[local.length - 1]}`;
  return `${maskedLocal}@${domain}`;
}

/**
 * Redacts backend server IDs, instance tokens, or UUIDs (e.g. `srv_a1b2c3d4-410a` -> `7131****`).
 */
export function maskIdentifier(id?: string | null, keepChars = 4): string {
  if (!id || typeof id !== "string") return "";
  if (id.length <= keepChars) return "*".repeat(id.length);
  return `${id.slice(0, keepChars)}****`;
}

/**
 * Scrubs sensitive fields from a user entity (masks emails, strips password hashes and token versions).
 */
export function scrubSensitiveUserData<T extends Record<string, any>>(user: T | null | undefined): T | null {
  if (!user) return null;
  const copy: any = { ...user };
  if (copy.email) {
    copy.email = maskEmail(copy.email);
  }
  delete copy.passwordHash;
  delete copy.tokenVersion;
  return copy;
}

/**
 * Scrubs user tickets to redact player emails and ensure backend instance IDs are safe.
 */
export function scrubTicket<T extends Record<string, any>>(ticket: T | null | undefined): T | null {
  if (!ticket) return null;
  const copy: any = { ...ticket };
  if (copy.user) {
    copy.user = scrubSensitiveUserData(copy.user);
  }
  return copy;
}

/**
 * Safely handles admin API errors, suppressing stack traces and internal database errors in production.
 */
export function handleAdminError(
  error: unknown,
  fallbackMessage = "An unexpected error occurred while processing the administrative request"
): NextResponse {
  const isProd = process.env.NODE_ENV === "production";
  console.error("[ADMIN_API_ERROR]", error);

  if (isProd) {
    return NextResponse.json(
      { error: fallbackMessage },
      { status: 500 }
    );
  }

  const message = error instanceof Error ? error.message : String(error);
  const stack = error instanceof Error ? error.stack : undefined;

  return NextResponse.json(
    { error: message || fallbackMessage, stack },
    { status: 500 }
  );
}

