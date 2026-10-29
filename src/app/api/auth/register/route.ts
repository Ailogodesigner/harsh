import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { hashPassword, createSessionToken, COOKIE_NAME, SESSION_DURATION } from "@/lib/auth";
import { checkRateLimit } from "@/lib/rateLimit";
import { getClientIp, validateOrigin, sanitizeString } from "@/lib/security";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export async function POST(req: Request) {
  try {
    // 1. Origin verification to prevent CSRF / cross-site terminal automation
    const originCheck = validateOrigin(req);
    if (!originCheck.valid) {
      return NextResponse.json(
        { error: "Forbidden: Security policy violation. Untrusted request origin." },
        { status: 403 }
      );
    }

    const ip = getClientIp(req);

    // 2. Rate limit registrations: Max 5 accounts per hour per IP
    const rateCheck = checkRateLimit(`register_${ip}`, {
      maxRequests: 5,
      windowMs: 60 * 60 * 1000,
      lockoutMs: 60 * 60 * 1000,
    });
    if (!rateCheck.allowed) {
      return NextResponse.json(
        { error: rateCheck.error || "Too many registration attempts. Please try again later." },
        { status: 429 }
      );
    }

    const body = await req.json();
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid input data" },
        { status: 400 }
      );
    }

    const { name, email, password } = parsed.data;
    const sanitizedName = sanitizeString(name);
    const normalizedEmail = email.toLowerCase().trim();

    // Check if user exists
    const existing = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return NextResponse.json(
        { error: "An account with this email address already exists" },
        { status: 409 }
      );
    }

    // Hash password & create user
    const passwordHash = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        name: sanitizedName,
        email: normalizedEmail,
        passwordHash,
        role: "USER",
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    try {
      await prisma.auditLog.create({
        data: {
          actorId: user.id,
          actorEmail: user.email,
          action: "USER_REGISTER",
          targetEntity: "User",
          targetId: user.id,
          metadata: JSON.stringify({
            name: user.name,
            ip,
          }),
        },
      });
    } catch (e) {
      console.warn("AuditLog error on register:", e);
    }

    // Create session token
    const token = await createSessionToken({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      tokenVersion: 0,
    });

    const response = NextResponse.json({
      success: true,
      user,
      message: "Account created successfully",
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
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error occurred during registration" },
      { status: 500 }
    );
  }
}
