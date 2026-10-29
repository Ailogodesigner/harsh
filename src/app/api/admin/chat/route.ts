import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAdmin, maskIdentifier, handleAdminError } from "@/lib/adminAuth";
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
    const { user, error: authError } = await verifyAdmin(req);
    if (authError || !user) return authError!;

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
        warning: "Unable to reach server log stream. Server may be synchronizing.",
      });
    }

    if (!res.ok) {
      return NextResponse.json({
        success: true,
        entries: [],
        totalParsed: 0,
        serverTime: new Date().toISOString(),
        warning: "Minecraft server log tailing is currently offline or synchronizing.",
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

      // 2. Check if Chat message:
      const chatMatch1 = line.match(/]:\s*<([a-zA-Z0-9_\.]{3,16})>\s*(.+)$/);
      const chatMatch2 = line.match(/]:\s*\[[^\]]+\]\s*([a-zA-Z0-9_\.]{3,16})\s*[:\xbb]\s*(.+)$/);
      const chatMatch3 = line.match(/]:\s*([a-zA-Z0-9_\.]{3,16})\s*[:\xbb]\s*(.+)$/);

      const matchedChat = chatMatch1 || chatMatch2 || chatMatch3;
      if (matchedChat && !line.includes("issued server command:")) {
        const player = matchedChat[1];
        const message = matchedChat[2];
        if (
          player.toLowerCase() !== "server" &&
          !line.includes("logged in with entity id")
        ) {
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
      }

      // 3. Check for Join events
      const joinMatch = line.match(/]:\s*([a-zA-Z0-9_\.]{3,16})\s+(?:joined the game|logged in)/i);
      if (joinMatch) {
        const player = joinMatch[1];
        entries.push({
          id: `join-${i}`,
          timestamp,
          type: "JOIN",
          player,
          rankInfo: getPlayerRankInfo(player),
          message: `${player} joined the network`,
          raw: line,
        });
        continue;
      }

      // 4. Check for Leave events
      const leaveMatch = line.match(/]:\s*([a-zA-Z0-9_\.]{3,16})\s+(?:left the game|lost connection|disconnected)/i);
      if (leaveMatch) {
        const player = leaveMatch[1];
        entries.push({
          id: `leave-${i}`,
          timestamp,
          type: "LEAVE",
          player,
          rankInfo: getPlayerRankInfo(player),
          message: `${player} disconnected`,
          raw: line,
        });
        continue;
      }

      // 5. Broadcasts & System messages
      if (
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

    const latestEntries = entries.slice(-200);

    return NextResponse.json({
      success: true,
      entries: latestEntries,
      totalParsed: entries.length,
      serverTime: new Date().toISOString(),
    });
  } catch (error: any) {
    return handleAdminError(error, "Failed to fetch live chat logs");
  }
}

export async function POST(req: Request) {
  try {
    const { user, error: authError } = await verifyAdmin(req);
    if (authError || !user) return authError!;

    const body = await req.json();
    const message = (body.message || "").trim();
    const actionType = body.actionType || "say";

    if (!message) {
      return NextResponse.json({ error: "Message cannot be empty" }, { status: 400 });
    }

    let commandToExecute = "";

    if (actionType === "command" || message.startsWith("/")) {
      commandToExecute = message.replace(/^\/+/, "");
    } else if (actionType === "broadcast") {
      commandToExecute = `broadcast &6★ [Admin] &f${message.replace(/["\\]/g, "")}`;
    } else {
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
          targetId: maskIdentifier(PTERODACTYL_SERVER_ID),
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
    return handleAdminError(error, "Failed to dispatch message to server");
  }
}
