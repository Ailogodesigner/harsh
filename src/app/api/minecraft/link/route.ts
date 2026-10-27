import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import prisma from "@/lib/prisma";
import { lookupMojangProfile } from "@/lib/minecraft/verification";
import { generateVerificationCode } from "@/lib/utils";
import { z } from "zod";

const linkSchema = z.object({
  username: z
    .string()
    .min(3, "Minecraft username must be at least 3 characters")
    .max(16, "Minecraft username cannot exceed 16 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain alphanumeric characters and underscores"),
});

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Please log in to link a Minecraft account" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = linkSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
    }

    const inputUsername = parsed.data.username;

    // Lookup Mojang Profile to get real UUID & correct casing
    const mojangProfile = await lookupMojangProfile(inputUsername);
    const officialUsername = mojangProfile?.name || inputUsername;
    const officialUuid = mojangProfile?.id || null;

    // Check if another user already linked this username/uuid
    const existing = await prisma.minecraftAccount.findFirst({
      where: {
        OR: [
          { username: { equals: officialUsername, mode: "insensitive" } },
          ...(officialUuid ? [{ minecraftUuid: officialUuid }] : []),
        ],
        userId: { not: user.id },
      },
    });

    if (existing && existing.verificationStatus === "VERIFIED") {
      return NextResponse.json(
        { error: "This Minecraft account is already verified by another player." },
        { status: 400 }
      );
    }

    const verificationCode = generateVerificationCode();

    const linkedAccount = await prisma.minecraftAccount.upsert({
      where: {
        userId_username: {
          userId: user.id,
          username: officialUsername,
        },
      },
      update: {
        minecraftUuid: officialUuid,
        verificationCode,
        verificationStatus: "VERIFIED",
      },
      create: {
        userId: user.id,
        username: officialUsername,
        minecraftUuid: officialUuid,
        verificationCode,
        verificationStatus: "VERIFIED",
      },
    });

    // Automatically link any pending entitlements matching this user
    await prisma.entitlement.updateMany({
      where: {
        userId: user.id,
        minecraftAccountId: null,
      },
      data: {
        minecraftAccountId: linkedAccount.id,
      },
    });

    try {
      await prisma.auditLog.create({
        data: {
          actorId: user.id,
          actorEmail: user.email,
          action: "LINK_MINECRAFT",
          targetEntity: "MinecraftAccount",
          targetId: linkedAccount.id,
          metadata: JSON.stringify({
            username: officialUsername,
            uuid: officialUuid,
          }),
        },
      });
    } catch (e) {
      console.warn("AuditLog error on minecraft link:", e);
    }

    return NextResponse.json({
      success: true,
      account: linkedAccount,
      message: `Minecraft account ${officialUsername} automatically synced and verified!`,
    });
  } catch (error: any) {
    console.error("Link account error:", error);
    return NextResponse.json({ error: "Failed to link Minecraft account" }, { status: 500 });
  }
}
