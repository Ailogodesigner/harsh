import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { Role } from "@prisma/client";
import prisma from "@/lib/prisma";

export interface SessionUser {
  id: string;
  email: string;
  name: string;
  role: Role;
  tokenVersion?: number;
}

const COOKIE_NAME = "hu_session";
const SESSION_DURATION = 7 * 24 * 60 * 60; // 7 days in seconds

export function getSecretKey(): Uint8Array {
  const secret =
    process.env.JWT_SECRET ||
    process.env.AUTH_SECRET ||
    "harsh-unlimited-fallback-secret-at-least-32-chars-long";
  return new TextEncoder().encode(secret);
}

export function getSessionCookieOptions(maxAge = SESSION_DURATION) {
  return {
    name: COOKIE_NAME,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export async function createSessionToken(user: SessionUser): Promise<string> {
  const secretKey = getSecretKey();
  return new SignJWT({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    tokenVersion: user.tokenVersion ?? 0,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION}s`)
    .sign(secretKey);
}

export async function verifySessionToken(token: string): Promise<SessionUser | null> {
  try {
    const secretKey = getSecretKey();
    const { payload } = await jwtVerify(token, secretKey);
    return {
      id: payload.id as string,
      email: payload.email as string,
      name: payload.name as string,
      role: payload.role as Role,
      tokenVersion: typeof payload.tokenVersion === "number" ? payload.tokenVersion : 0,
    };
  } catch {
    return null;
  }
}

/**
 * Retrieves the current session user. If validateWithDb is true, checks the database
 * to verify that the user still exists and the tokenVersion has not been revoked.
 */
export async function getCurrentUser(validateWithDb = true): Promise<SessionUser | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get(COOKIE_NAME)?.value;
    if (!token) return null;

    const sessionUser = await verifySessionToken(token);
    if (!sessionUser) return null;

    if (validateWithDb) {
      try {
        const dbUser = await prisma.user.findUnique({
          where: { id: sessionUser.id },
          select: { id: true, email: true, name: true, role: true, tokenVersion: true },
        });

        if (!dbUser) return null;

        // If user changed password, logged out, or admin revoked sessions:
        if (dbUser.tokenVersion !== (sessionUser.tokenVersion ?? 0)) {
          return null; // Session has been invalidated/revoked!
        }

        return {
          id: dbUser.id,
          email: dbUser.email,
          name: dbUser.name,
          role: dbUser.role,
          tokenVersion: dbUser.tokenVersion,
        };
      } catch (dbErr) {
        console.warn("DB validation warning in getCurrentUser, falling back to verified JWT payload:", dbErr);
        return sessionUser;
      }
    }

    return sessionUser;
  } catch {
    return null;
  }
}

/**
 * Instantly invalidates all active JWT sessions for a user by incrementing their tokenVersion in the database.
 */
export async function revokeUserSessions(userId: string): Promise<void> {
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { tokenVersion: { increment: 1 } },
    });
  } catch (err) {
    console.error("Failed to revoke user sessions:", err);
  }
}

export async function requireAuth(): Promise<SessionUser> {
  const user = await getCurrentUser(true);
  if (!user) {
    throw new Error("UNAUTHORIZED");
  }
  return user;
}

export async function requireAdmin(): Promise<SessionUser> {
  const user = await requireAuth();
  if (user.role !== "ADMIN" && user.role !== "SUPERADMIN") {
    throw new Error("FORBIDDEN: Admin privileges required");
  }
  return user;
}

export { COOKIE_NAME, SESSION_DURATION };
