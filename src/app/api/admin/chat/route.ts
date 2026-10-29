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

const PTERODACTYL_BASE_URL = (process.env.PTERODACTYL_BASE_URL || "").replace(/\/+$/, "");
const PTERODACTYL_API_KEY = process.env.PTERODACTYL_API_KEY || "";
const PTERODACTYL_SERVER_ID = process.env.PTERODACTYL_SERVER_ID || "";

// In-memory cache to maintain stream continuity even if CavrixCloud origin has transient SSL (525) hiccups
let cachedEntries: ChatLogEntry[] = [];
let lastSuccessfulFetchTime = 0;

const SYSTEM_IGNORE_STRINGS = [
  "logged in with entity id",
  "UUID of player",
  "Server Ping Player",
  "Using 4 threads",
  "Generating keypair",
  "Starting minecraft server",
  "Loading properties",
  "Default game type",
  "Loaded 1585 recipes",
  "Loaded 1688 advancements",
  "Environment[sessionHost",
  "Using libdeflate",
  "Using OpenSSL",
  "Vault detected",
  "This plugin is not supposed",
  "Running migration",
  "Cloud commands have been registered",
  "You are using a development build",
  "No kits found to migrate",
  "No provider found",
  "No extensions to load",
  "ABSOLUTELY NO DISCORD",
  "The server will make no attempt",
  "Please report them on our discord",
  "Read more about the risks",
  "Legacy Mode:",
  "Adventure Native:",
  "Using legacy text handling",
  "Support:     https://",
  "free plugins by SK Studio",
  "builtbybit.com",
  "No MaxMind credentials",
  "There is no newer GEO IP",
  "Could not download GeoLiteAPI",
  "No new version available",
  "No updates available",
  "The 'permission message' entry has been deprecated",
  "[voicechat] Received secret",
  "[voicechat] Sent secret",
  "[voicechat] Disconnecting client",
];

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

    let rawLog = "";
    let fetchSuccess = false;
    let warningMessage: string | null = null;

    // Retry up to 3 times to shield against CavrixCloud intermittent 525 SSL errors
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 9000);

        const res = await fetch(endpoint, {
          headers: {
            Authorization: `Bearer ${PTERODACTYL_API_KEY}`,
            Accept: "Application/vnd.pterodactyl.v1+json",
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) HarshUnlimited/1.0",
          },
          signal: controller.signal,
          cache: "no-store",
        });

        clearTimeout(timeoutId);

        if (res.ok) {
          rawLog = await res.text();
          fetchSuccess = true;
          break;
        } else if (res.status === 525) {
          // Cloudflare SSL handshake issue with host, wait and retry
          if (attempt < 3) {
            await new Promise((resolve) => setTimeout(resolve, 350 * attempt));
          }
        }
      } catch (err: any) {
        if (attempt < 3) {
          await new Promise((resolve) => setTimeout(resolve, 350 * attempt));
        }
      }
    }

    if (!fetchSuccess || !rawLog) {
      if (cachedEntries.length > 0) {
        return NextResponse.json({
          success: true,
          entries: cachedEntries,
          totalParsed: cachedEntries.length,
          serverTime: new Date().toISOString(),
          warning: "Panel host synchronizing; displaying cached recent live server activity.",
        });
      }

      return NextResponse.json({
        success: true,
        entries: [],
        totalParsed: 0,
        serverTime: new Date().toISOString(),
        warning: "Minecraft server log tailing is currently offline or synchronizing. Retrying in background...",
      });
    }

    const lines = rawLog.split(/\r?\n/).filter((l) => l.trim().length > 0);
    const parsedEntries: Array<ChatLogEntry & { lineIdx: number }> = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Extract timestamp [HH:MM:SS]
      const timeMatch = line.match(/^\[(\d{2}:\d{2}:\d{2})\]/);
      const timestamp = timeMatch ? timeMatch[1] : "";

      // 1. Player Commands (including private messages and party chats)
      const cmdMatch = line.match(/]:\s*([a-zA-Z0-9_\.]{3,16})\s+issued server command:\s*(.+)$/i);
      if (cmdMatch) {
        const player = cmdMatch[1];
        const command = cmdMatch[2];

        // Check if the command is a player chat/messaging command
        const pmMatch = command.match(/^\/(?:msg|tell|w|whisper)\s+([a-zA-Z0-9_\.]{3,16})\s+(.+)$/i);
        const rMatch = command.match(/^\/r\s+(.+)$/i);
        const partyMatch = command.match(/^\/(?:pc|tc|ac|helpop|me)\s+(.+)$/i);

        if (pmMatch) {
          parsedEntries.push({
            lineIdx: i,
            id: `pm-${i}`,
            timestamp,
            type: "CHAT",
            player,
            rankInfo: getPlayerRankInfo(player),
            message: `➜ ${pmMatch[1]}: ${pmMatch[2]}`,
            raw: line,
          });
        } else if (rMatch) {
          parsedEntries.push({
            lineIdx: i,
            id: `reply-${i}`,
            timestamp,
            type: "CHAT",
            player,
            rankInfo: getPlayerRankInfo(player),
            message: `➜ (reply): ${rMatch[1]}`,
            raw: line,
          });
        } else if (partyMatch) {
          const channelName = command.split(" ")[0].slice(1).toUpperCase();
          parsedEntries.push({
            lineIdx: i,
            id: `party-${i}`,
            timestamp,
            type: "CHAT",
            player,
            rankInfo: getPlayerRankInfo(player),
            message: `[${channelName}] ${partyMatch[1]}`,
            raw: line,
          });
        } else {
          parsedEntries.push({
            lineIdx: i,
            id: `cmd-${i}`,
            timestamp,
            type: "COMMAND",
            player,
            rankInfo: getPlayerRankInfo(player),
            message: command,
            raw: line,
          });
        }
        continue;
      }

      // 2. Player Joins (+ Player or standard Paper join message)
      const joinPlusMatch = line.match(/]:\s*\+\s*([a-zA-Z0-9_\.]{3,16})$/);
      const joinStdMatch = line.match(/]:\s*([a-zA-Z0-9_\.]{3,16})\s+(?:joined the game|logged in)\b/i);
      if (joinPlusMatch || joinStdMatch) {
        const player = (joinPlusMatch || joinStdMatch)![1];
        parsedEntries.push({
          lineIdx: i,
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

      // 3. Player Leaves (- Player or standard Paper disconnect)
      const leaveMinusMatch = line.match(/]:\s*\-\s*([a-zA-Z0-9_\.]{3,16})$/);
      const leaveStdMatch = line.match(/]:\s*([a-zA-Z0-9_\.]{3,16})\s+(?:left the game|lost connection|disconnected|was kicked)\b/i);
      if (leaveMinusMatch || leaveStdMatch) {
        const player = (leaveMinusMatch || leaveStdMatch)![1];
        parsedEntries.push({
          lineIdx: i,
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

      // 4. In-Game Public Chat: `<Player> msg` or `[Prefix] Player: msg`
      const chatMatch1 = line.match(/]:\s*<([a-zA-Z0-9_\.]{3,16})>\s*(.+)$/);
      const chatMatch2 = line.match(/]:\s*(?:\[[^\]]+\]\s*)*([a-zA-Z0-9_\.]{3,16})\s*[:\xbb]\s*(.+)$/);
      const matchedChat = chatMatch1 || chatMatch2;
      if (matchedChat) {
        const player = matchedChat[1];
        const message = matchedChat[2];
        const isSystem =
          SYSTEM_IGNORE_STRINGS.some((ig) => line.includes(ig)) ||
          player.toLowerCase() === "server" ||
          player.toLowerCase() === "authme";

        if (!isSystem && player.length >= 3) {
          parsedEntries.push({
            lineIdx: i,
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

      // 5. Broadcasts & Major Server Events
      if (
        line.includes("[Broadcast]") ||
        line.includes("Harsh Unlimited |") ||
        line.includes("BankTop has been updated") ||
        line.includes("Shop >>") ||
        line.includes("Restarting in")
      ) {
        const cleanMsg = line.replace(/^.+?]:\s*/, "");
        parsedEntries.push({
          lineIdx: i,
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

    // Ensure balanced distribution so high command activity never drowns out player chats or joins
    const recentChats = parsedEntries.filter((e) => e.type === "CHAT").slice(-100);
    const recentCommands = parsedEntries.filter((e) => e.type === "COMMAND").slice(-150);
    const recentJoins = parsedEntries.filter((e) => e.type === "JOIN" || e.type === "LEAVE").slice(-60);
    const recentBroadcasts = parsedEntries.filter((e) => e.type === "BROADCAST").slice(-40);

    // Merge and sort in exact chronological order
    const merged = [...recentChats, ...recentCommands, ...recentJoins, ...recentBroadcasts]
      .sort((a, b) => a.lineIdx - b.lineIdx)
      .map(({ lineIdx, ...entry }) => entry);

    cachedEntries = merged;
    lastSuccessfulFetchTime = Date.now();

    return NextResponse.json({
      success: true,
      entries: merged,
      totalParsed: parsedEntries.length,
      serverTime: new Date().toISOString(),
      warning: warningMessage,
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
