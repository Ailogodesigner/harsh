import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyPassword, createSessionToken, COOKIE_NAME, SESSION_DURATION } from "@/lib/auth";
import { isAuthLocked, recordFailedAuth, clearFailedAuth } from "@/lib/rateLimit";
import { getClientIp, validateOrigin } from "@/lib/security";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
});

export async function POST(req: Request) {
  try {
    // 1. Origin verification to prevent cross-site/terminal CSRF
    const originCheck = validateOrigin(req);
    if (!originCheck.valid) {
      return NextResponse.json(
        { error: "Forbidden: Security policy violation. Untrusted request origin." },
        { status: 403 }
      );
    }

    const ip = getClientIp(req);

    // 2. Check if IP is currently in a security lockout
    const ipLock = isAuthLocked(ip);
    if (ipLock.locked) {
      return NextResponse.json(
        { error: ipLock.error || "Security lockout active. Please try again later." },
        {
          status: 429,
          headers: ipLock.retryAfterSeconds ? { "Retry-After": String(ipLock.retryAfterSeconds) } : undefined,
        }
      );
    }

    const body = await req.json();
    const parsed = loginSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid input data" },
        { status: 400 }
      );
    }

    const { email, password } = parsed.data;
    const normalizedEmail = email.toLowerCase().trim();

    // 3. Check if specific account is in a security lockout
    const accountLock = isAuthLocked(normalizedEmail);
    if (accountLock.locked) {
      return NextResponse.json(
        { error: accountLock.error || "Account locked due to multiple failed attempts." },
        {
          status: 429,
          headers: accountLock.retryAfterSeconds ? { "Retry-After": String(accountLock.retryAfterSeconds) } : undefined,
        }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      // Record failed attempt against IP and email
      const failIp = recordFailedAuth(ip);
      const failAcc = recordFailedAuth(normalizedEmail);
      if (failIp.locked || failAcc.locked) {
        return NextResponse.json(
          { error: failIp.error || failAcc.error || "Security lockout: 5 failed attempts reached." },
          { status: 429 }
        );
      }

      return NextResponse.json(
        { error: "Invalid email or password", remainingAttempts: failIp.remaining },
        { status: 401 }
      );
    }

    const isValid = await verifyPassword(password, user.passwordHash);
    if (!isValid) {
      const failIp = recordFailedAuth(ip);
      const failAcc = recordFailedAuth(normalizedEmail);
      if (failIp.locked || failAcc.locked) {
        return NextResponse.json(
          { error: failIp.error || failAcc.error || "Security lockout: 5 failed attempts reached." },
          { status: 429 }
        );
      }

      return NextResponse.json(
        { error: "Invalid email or password", remainingAttempts: failIp.remaining },
        { status: 401 }
      );
    }

    // 4. Success: Clear failed attempt counters
    clearFailedAuth(ip);
    clearFailedAuth(normalizedEmail);

    const token = await createSessionToken({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      tokenVersion: user.tokenVersion ?? 0,
    });

    try {
      await prisma.auditLog.create({
        data: {
          actorId: user.id,
          actorEmail: user.email,
          action: "USER_LOGIN",
          targetEntity: "User",
          targetId: user.id,
          metadata: JSON.stringify({
            role: user.role,
            ip,
          }),
        },
      });
    } catch (e) {
      console.warn("AuditLog error on login:", e);
    }

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      message: "Signed in successfully",
    });

    response.cookies.set({
      name: COOKIE_NAME,
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: SESSION_DURATION,
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("Login error:", error);
    const isDbError =
      error?.name === "PrismaClientInitializationError" ||
      error?.name === "PrismaClientKnownRequestError" ||
      error?.message?.toLowerCase().includes("connect") ||
      error?.message?.toLowerCase().includes("database");

    return NextResponse.json(
      {
        error: isDbError
          ? "Database connection error. Please verify your DATABASE_URL and run prisma migrations."
          : "Internal server error during login",
        details: error?.message || String(error),
        name: error?.name,
        hasDbUrl: Boolean(process.env.DATABASE_URL),
      },
      { status: 500 }
    );
  }
}
