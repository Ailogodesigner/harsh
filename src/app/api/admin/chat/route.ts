import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { pterodactylClient } from "@/lib/minecraft/pterodactyl";
import { getPlayerRankInfo, PlayerRankInfo } from "@/lib/minecraft/ranks";

export interface ChatLogEntry {
  id: string;
  timestamp: string;
  type: "CHAT" | "COMMAND" | "JOIN" | "LEAVE" | "ADVANCEMENT" | "BROADCAST" | "SYSTEM";
  player: string | null;
  rankInfo: PlayerRankInfo | null;
  message: string;
  raw: string;
}

const PTERODACTYL_BASE_URL = (process.env.PTERODACTYL_BASE_URL || "https://panel.cavrixcloud.fun").replace(/\/+$/, "");
const PTERODACTYL_API_KEY = process.env.PTERODACTYL_API_KEY || "";
const PTERODACTYL_SERVER_ID = process.env.PTERODACTYL_SERVER_ID || "";

export async function GET(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPERADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!PTERODACTYL_BASE_URL || !PTERODACTYL_API_KEY || !PTERODACTYL_SERVER_ID) {
      return NextResponse.json(
        { error: "Pterodactyl integration is not configured." },
        { status: 500 }
      );
    }

    const endpoint = `${PTERODACTYL_BASE_URL}/api/client/servers/${PTERODACTYL_SERVER_ID}/files/contents?file=logs%2Flatest.log`;

    let res: Response;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 7000);
      res = await fetch(endpoint, {
        headers: {
          Authorization: `Bearer ${PTERODACTYL_API_KEY}`,
          Accept: "Application/vnd.pterodactyl.v1+json",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) HarshUnlimited/1.0",
        },
        signal: controller.signal,
        next: { revalidate: 0 },
      });
      clearTimeout(timeoutId);
    } catch (fetchErr: any) {
      console.warn("Pterodactyl fetch error (timeout or unreachable):", fetchErr?.message);
      return NextResponse.json({
        success: true,
        entries: [],
        totalParsed: 0,
        serverTime: new Date().toISOString(),
        warning: "Unable to reach server log file. Server panel may be rebooting or SSL handshake is in progress.",
      });
    }

    if (!res.ok) {
      const is525 = res.status === 525;
      return NextResponse.json({
        success: true,
        entries: [],
        totalParsed: 0,
        serverTime: new Date().toISOString(),
        warning: is525
          ? "Pterodactyl panel host returned HTTP 525 (SSL handshake issue at panel.cavrixcloud.fun). Log tailing is paused; commands can still be sent."
          : `Pterodactyl API returned HTTP ${res.status}. Log stream unavailable.`,
      });
    }

    const rawLog = await res.text();
    const lines = rawLog.split(/\r?\n/).filter((l) => l.trim().length > 0);

    const entries: ChatLogEntry[] = [];

    // Parse the lines into structured chat and activity objects
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Extract timestamp [HH:MM:SS]
      const timeMatch = line.match(/^\[(\d{2}:\d{2}:\d{2})\]/);
      const timestamp = timeMatch ? timeMatch[1] : "";

      // 1. Check if Command: "Player issued server command: /..."
      const cmdMatch = line.match(/]:\s*([a-zA-Z0-9_\.]{3,16})\s+issued server command:\s*(.+)$/i);
      if (cmdMatch) {
        const player = cmdMatch[1];
        const command = cmdMatch[2];
        entries.push({
          id: `cmd-${i}`,
          timestamp,
          type: "COMMAND",
          player,
          rankInfo: getPlayerRankInfo(player),
          message: command,
          raw: line,
        });
        continue;
      }

      // 2. Check if Join: "Player joined the game" or "+ Player" or "UUID of player Player is"
      const joinMatch = line.match(/]:\s*([a-zA-Z0-9_\.]{3,16})\s+joined the game/i) ||
        line.match(/]:\s*\+\s*([a-zA-Z0-9_\.]{3,16})/);
      if (joinMatch) {
        const player = joinMatch[1];
        entries.push({
          id: `join-${i}`,
          timestamp,
          type: "JOIN",
          player,
          rankInfo: getPlayerRankInfo(player),
          message: "joined the server",
          raw: line,
        });
        continue;
      }

      // 3. Check if Leave: "Player lost connection: ..." or "- Player" or "Player left the game"
      const leaveMatch = line.match(/]:\s*([a-zA-Z0-9_\.]{3,16})\s+lost connection/i) ||
        line.match(/]:\s*-\s*([a-zA-Z0-9_\.]{3,16})/) ||
        line.match(/]:\s*([a-zA-Z0-9_\.]{3,16})\s+left the game/i);
      if (leaveMatch) {
        const player = leaveMatch[1];
        entries.push({
          id: `leave-${i}`,
          timestamp,
          type: "LEAVE",
          player,
          rankInfo: getPlayerRankInfo(player),
          message: "disconnected from server",
          raw: line,
        });
        continue;
      }

      // 4. Check if Advancement: "Player has made the advancement [Advancement]"
      const advMatch = line.match(/]:\s*([a-zA-Z0-9_\.]{3,16})\s+has made the advancement\s*(\[.+\])/i);
      if (advMatch) {
        const player = advMatch[1];
        const advancement = advMatch[2];
        entries.push({
          id: `adv-${i}`,
          timestamp,
          type: "ADVANCEMENT",
          player,
          rankInfo: getPlayerRankInfo(player),
          message: `unlocked achievement ${advancement}`,
          raw: line,
        });
        continue;
      }

      // 5. Check if standard player chat: "<Player> Message"
      const chatAngleMatch = line.match(/]:\s*<([a-zA-Z0-9_\.]{3,16})>\s*(.+)$/);
      if (chatAngleMatch) {
        const player = chatAngleMatch[1];
        const message = chatAngleMatch[2];
        entries.push({
          id: `chat-${i}`,
          timestamp,
          type: "CHAT",
          player,
          rankInfo: getPlayerRankInfo(player),
          message,
          raw: line,
        });
        continue;
      }

      // 6. Check if formatted rank chat: "[Rank] Player: Message" or "Player: Message"
      const chatRankMatch = line.match(/]:\s*(?:\[([^\]]+)\]\s*)?([a-zA-Z0-9_\.]{3,16})\s*:\s*(.+)$/);
      if (
        chatRankMatch &&
        !line.includes("Server thread/INFO") &&
        !line.includes("DeluxeMenus") &&
        !line.includes("BankPlus") &&
        !line.includes("voicechat") &&
        !line.includes("HikariPool")
      ) {
        const player = chatRankMatch[2];
        const message = chatRankMatch[3];
        entries.push({
          id: `chat-${i}`,
          timestamp,
          type: "CHAT",
          player,
          rankInfo: getPlayerRankInfo(player),
          message,
          raw: line,
        });
        continue;
      }

      // 7. Check if Broadcast / Store Announcement
      if (
        line.includes("[Store]") ||
        line.includes("[Broadcast]") ||
        line.includes("Harsh Unlimited |") ||
        line.includes("BankTop has been updated")
      ) {
        const cleanMsg = line.replace(/^.+?]:\s*/, "");
        entries.push({
          id: `bc-${i}`,
          timestamp,
          type: "BROADCAST",
          player: null,
          rankInfo: null,
          message: cleanMsg,
          raw: line,
        });
      }
    }

    // Return the latest 200 entries
    const latestEntries = entries.slice(-200);

    return NextResponse.json({
      success: true,
      entries: latestEntries,
      totalParsed: entries.length,
      serverTime: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Admin chat API error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to fetch live chat logs" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user || (user.role !== "ADMIN" && user.role !== "SUPERADMIN")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const message = (body.message || "").trim();
    const actionType = body.actionType || "say"; // "say" | "broadcast" | "command"

    if (!message) {
      return NextResponse.json({ error: "Message cannot be empty" }, { status: 400 });
    }

    let commandToExecute = "";

    if (actionType === "command" || message.startsWith("/")) {
      // Direct console command
      commandToExecute = message.replace(/^\/+/, "");
    } else if (actionType === "broadcast") {
      // Prominent server broadcast
      commandToExecute = `broadcast &6★ [Admin] &f${message.replace(/["\\]/g, "")}`;
    } else {
      // Standard in-game chat message
      commandToExecute = `say [Admin]: ${message.replace(/["\\]/g, "")}`;
    }

    const result = await pterodactylClient.sendCommand(commandToExecute);

    try {
      await prisma.auditLog.create({
        data: {
          actorId: user.id,
          actorEmail: user.email,
          action: "SERVER_COMMAND",
          targetEntity: "PterodactylServer",
          targetId: PTERODACTYL_SERVER_ID,
          metadata: JSON.stringify({ actionType, command: commandToExecute }),
        },
      });
    } catch (logErr) {
      console.warn("Could not write audit log for command:", logErr);
    }

    return NextResponse.json({
      success: true,
      commandDispatched: commandToExecute,
      result,
    });
  } catch (error: any) {
    console.error("Failed to send message/command:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to dispatch message to server" },
      { status: 500 }
    );
  }
}
