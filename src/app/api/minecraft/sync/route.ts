import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { lookupMojangProfile } from "@/lib/minecraft/verification";
import { z } from "zod";

const syncRequestSchema = z.object({
  secret: z.string().optional(),
  action: z.enum(["verify", "rank_sync", "player_query", "join_sync"]).default("verify"),
  username: z.string().min(1).max(16),
  code: z.string().optional(),
  rank: z.string().optional(),
  uuid: z.string().optional(),
});

/**
 * Universal Automated Player Synchronization Endpoint
 * Called by in-game plugin, Skript, RCON, or console webhooks.
 *
 * GET /api/minecraft/sync?code=HU-12345&username=PlayerName
 * POST /api/minecraft/sync { "action": "verify", "code": "HU-12345", "username": "PlayerName" }
 */
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = syncRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid payload" },
        { status: 400 }
      );
    }

    const { action, username, code, rank, uuid } = parsed.data;
    const cleanUsername = username.trim();

    // 1. In-game /verify command execution
    if (action === "verify") {
      let account = null;

      if (code) {
        account = await prisma.minecraftAccount.findFirst({
          where: {
            verificationCode: code.toUpperCase().trim(),
          },
          include: { user: true },
        });
      }

      if (!account) {
        // Fallback: match by username
        account = await prisma.minecraftAccount.findFirst({
          where: {
            username: { equals: cleanUsername, mode: "insensitive" },
          },
          include: { user: true },
        });
      }

      if (!account) {
        return NextResponse.json(
          { error: `No pending linking request found for player ${cleanUsername}` },
          { status: 404 }
        );
      }

      // Update to VERIFIED status
      const updated = await prisma.minecraftAccount.update({
        where: { id: account.id },
        data: {
          verificationStatus: "VERIFIED",
          minecraftUuid: uuid || account.minecraftUuid,
        },
      });

      // Link any pending entitlements for this player's orders
      await prisma.entitlement.updateMany({
        where: {
          userId: account.userId,
          minecraftAccountId: null,
        },
        data: {
          minecraftAccountId: updated.id,
        },
      });

      return NextResponse.json({
        success: true,
        message: `Account ${cleanUsername} verified and synced with ${account.user.email}!`,
        user: {
          id: account.userId,
          name: account.user.name,
          email: account.user.email,
        },
      });
    }

    // 2. Synchronize in-game LuckPerms rank to website profile
    if (action === "rank_sync" && rank) {
      const cleanRank = rank.toLowerCase().trim();
      const account = await prisma.minecraftAccount.findFirst({
        where: {
          username: { equals: cleanUsername, mode: "insensitive" },
        },
      });

      if (!account) {
        return NextResponse.json(
          { error: `Player ${cleanUsername} not registered on website` },
          { status: 404 }
        );
      }

      // Find or create product for this rank
      const product = await prisma.product.findFirst({
        where: { slug: { equals: cleanRank, mode: "insensitive" } },
      });

      if (product) {
        // Check if entitlement exists
        const existingEntitlement = await prisma.entitlement.findFirst({
          where: {
            userId: account.userId,
            productId: product.id,
            status: "ACTIVE",
          },
        });

        if (!existingEntitlement) {
          await prisma.entitlement.create({
            data: {
              userId: account.userId,
              minecraftAccountId: account.id,
              productId: product.id,
              productName: product.name,
              status: "ACTIVE",
            },
          });
        }
      }

      return NextResponse.json({
        success: true,
        message: `Rank ${cleanRank} synced for player ${cleanUsername}`,
      });
    }

    // 3. Player join query (Server asks website what ranks player owns)
    if (action === "join_sync" || action === "player_query") {
      const account = await prisma.minecraftAccount.findFirst({
        where: {
          username: { equals: cleanUsername, mode: "insensitive" },
        },
        include: {
          entitlements: {
            where: { status: "ACTIVE" },
          },
        },
      });

      if (!account) {
        return NextResponse.json({
          registered: false,
          ranks: [],
        });
      }

      const activeRanks = account.entitlements.map((e) => e.productName);

      return NextResponse.json({
        registered: true,
        verified: account.verificationStatus === "VERIFIED",
        ranks: activeRanks,
      });
    }

    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  } catch (error: any) {
    console.error("Player sync error:", error);
    return NextResponse.json(
      { error: "Internal server error during player sync" },
      { status: 500 }
    );
  }
}

// Support GET requests for easy in-game webhook pings
export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code") || "";
  const username = searchParams.get("username") || searchParams.get("player") || "";

  if (!code && !username) {
    return NextResponse.json({ error: "Missing verification code or username" }, { status: 400 });
  }

  // Delegate to POST handler
  return POST(
    new Request(req.url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "verify",
        code,
        username,
      }),
    })
  );
}
