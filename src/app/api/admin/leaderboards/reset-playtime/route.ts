import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { pterodactylClient } from "@/lib/minecraft/pterodactyl";

export async function POST(req: Request) {
  try {
    const admin = await requireAdmin();

    const body = await req.json().catch(() => ({}));
    const resetConsole = body.resetConsole !== false; // default true
    const broadcastNotification = body.broadcastNotification !== false; // default true

    // 1. Wipe or reset all PLAYTIME entries in the database
    const deleteResult = await prisma.leaderboardEntry.deleteMany({
      where: {
        category: "PLAYTIME",
      },
    });

    const consoleResults: string[] = [];

    // 2. Dispatch server commands via Pterodactyl console if requested
    if (resetConsole) {
      const commands = [
        "playtime resetall",
        "ajplaytime reset all",
        "scoreboard players reset * play_time",
        "scoreboard players reset * stats_play_time",
      ];

      for (const cmd of commands) {
        try {
          await pterodactylClient.sendCommand(cmd);
          consoleResults.push(`Dispatched: ${cmd}`);
        } catch (cmdErr: any) {
          // If a specific plugin command isn't registered, log gracefully
          consoleResults.push(`Skipped/Unavailable: ${cmd} (${cmdErr?.message || "error"})`);
        }
      }

      if (broadcastNotification) {
        try {
          await pterodactylClient.sendCommand(
            "broadcast &6★ [Harsh Unlimited] &ePlayer server playtimes have been reset by network administrators!"
          );
        } catch {
          // Ignore broadcast error
        }
      }
    }

    // 3. Record AuditLog
    await prisma.auditLog.create({
      data: {
        actorId: admin.id,
        actorEmail: admin.email,
        action: "RESET_PLAYER_PLAYTIME",
        targetEntity: "LeaderboardEntry",
        targetId: "PLAYTIME",
        metadata: JSON.stringify({
          deletedDbRecords: deleteResult.count,
          resetConsole,
          broadcastNotification,
          consoleResults,
        }),
      },
    });

    return NextResponse.json({
      success: true,
      message: `Successfully reset player playtime (${deleteResult.count} database records cleared).`,
      consoleResults,
    });
  } catch (error: any) {
    console.error("Failed to reset play time:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to reset play time" },
      { status: error?.message?.includes("Unauthorized") ? 403 : 500 }
    );
  }
}
