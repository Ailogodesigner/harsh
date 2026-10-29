import prisma from "@/lib/prisma";
import { AuthenticatedAdminUser, maskIdentifier } from "@/lib/adminAuth";

export type PowerSignal = "start" | "stop" | "restart" | "kill";

export interface ServerOverview {
  name: string;
  identifier: string;
  node: string;
  isSuspended: boolean;
  limits: {
    memoryMb: number;
    diskMb: number;
    cpuPercentage: number;
  };
}

export interface LiveServerResources {
  currentState: "running" | "starting" | "stopping" | "offline" | "unknown";
  isSuspended: boolean;
  cpuPercentage: number;
  memoryBytes: number;
  memoryFormatted: string;
  memoryPercentage: number;
  diskBytes: number;
  diskFormatted: string;
  diskPercentage: number;
  networkRxFormatted: string;
  networkTxFormatted: string;
  uptimeSeconds: number;
  uptimeFormatted: string;
  timestamp: string;
  source: "live" | "cached";
}

// In-memory cache to ensure dashboard responsiveness during transient network or SSL (525) events
let cachedMetrics: LiveServerResources | null = null;
let lastMetricsFetchTime = 0;
let lastPowerActionTime = 0;

const POWER_ACTION_COOLDOWN_MS = 15000; // 15-second cooldown to prevent server state flapping

// Commands forbidden from web console execution for system security and world preservation
const FORBIDDEN_CONSOLE_COMMANDS = [
  "stop",
  "minecraft:stop",
  "end",
  "restart",
  "shutdown",
  "kill",
  "rm",
  "sh",
  "bash",
  "wget",
  "curl",
  "python",
  "perl",
  "sudo",
  "chmod",
];

export class PterodactylHostingService {
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly serverId: string;

  constructor() {
    this.baseUrl = (process.env.PTERODACTYL_BASE_URL || "").replace(/\/+$/, "");
    this.apiKey = process.env.PTERODACTYL_API_KEY || "";
    this.serverId = process.env.PTERODACTYL_SERVER_ID || "";
  }

  /**
   * Verifies that the hosting integration credentials and server target are configured.
   * Fails closed if any credential is missing.
   */
  public isConfigured(): boolean {
    return Boolean(this.baseUrl && this.apiKey && this.serverId);
  }

  private getHeaders(): Record<string, string> {
    return {
      Authorization: `Bearer ${this.apiKey}`,
      Accept: "Application/vnd.pterodactyl.v1+json",
      "Content-Type": "application/json",
      "User-Agent": "HarshUnlimited-HostingService/1.0",
    };
  }

  /**
   * Internal resilient fetcher with automatic 3x retries to shield against Cloudflare 525 SSL handshakes.
   */
  private async safeFetch(endpoint: string, options: RequestInit = {}): Promise<Response> {
    if (!this.isConfigured()) {
      throw new Error("Pterodactyl hosting integration is not configured on this server.");
    }

    let lastError: any;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        const res = await fetch(`${this.baseUrl}${endpoint}`, {
          ...options,
          headers: {
            ...this.getHeaders(),
            ...(options.headers || {}),
          },
          signal: controller.signal,
          cache: "no-store",
        });

        clearTimeout(timeoutId);

        // If successful, return immediately
        if (res.ok || res.status === 204) {
          return res;
        }

        // Retry on 525 (SSL handshake issue) or 504 (gateway timeout)
        if (res.status === 525 || res.status === 504 || res.status === 502) {
          if (attempt < 3) {
            await new Promise((r) => setTimeout(r, 400 * attempt));
            continue;
          }
        }

        return res;
      } catch (err: any) {
        lastError = err;
        if (attempt < 3) {
          await new Promise((r) => setTimeout(r, 400 * attempt));
        }
      }
    }

    throw lastError || new Error("Failed to communicate with Pterodactyl hosting API.");
  }

  /**
   * Retrieves sanitized server specifications, limits, and operational boundaries.
   */
  public async getServerOverview(): Promise<ServerOverview> {
    const res = await this.safeFetch(`/api/client/servers/${encodeURIComponent(this.serverId)}`);
    if (!res.ok) {
      throw new Error(`Failed to fetch server overview (HTTP ${res.status})`);
    }

    const json = await res.json();
    const attrs = json.attributes || {};
    const limits = attrs.limits || {};

    return {
      name: attrs.name || "Harsh Unlimited Minecraft Network",
      identifier: attrs.identifier ? maskIdentifier(attrs.identifier, 4) : "7131****",
      node: attrs.node || "Primary Node",
      isSuspended: Boolean(attrs.is_suspended),
      limits: {
        memoryMb: typeof limits.memory === "number" ? limits.memory : 16448,
        diskMb: typeof limits.disk === "number" ? limits.disk : 41120,
        cpuPercentage: typeof limits.cpu === "number" ? limits.cpu : 400,
      },
    };
  }

  /**
   * Retrieves real-time server telemetry: CPU %, RAM bytes, Disk, Network RX/TX, and state.
   */
  public async getLiveMetrics(): Promise<LiveServerResources> {
    try {
      const res = await this.safeFetch(
        `/api/client/servers/${encodeURIComponent(this.serverId)}/resources`
      );

      if (res.ok) {
        const json = await res.json();
        const attrs = json.attributes || {};
        const resObj = attrs.resources || {};

        const cpu = typeof resObj.cpu_absolute === "number" ? Number(resObj.cpu_absolute.toFixed(1)) : 0;
        const memoryBytes = typeof resObj.memory_bytes === "number" ? resObj.memory_bytes : 0;
        const diskBytes = typeof resObj.disk_bytes === "number" ? resObj.disk_bytes : 0;
        const uptimeMs = typeof resObj.uptime === "number" ? resObj.uptime : 0;
        const uptimeSeconds = Math.floor(uptimeMs / 1000);

        const memoryMb = memoryBytes / (1024 * 1024);
        const totalMemoryMb = 16448; // 16 GB server limit
        const memoryPercentage = Number(Math.min(100, (memoryMb / totalMemoryMb) * 100).toFixed(1));

        const diskMb = diskBytes / (1024 * 1024);
        const totalDiskMb = 41120; // 40 GB server limit
        const diskPercentage = Number(Math.min(100, (diskMb / totalDiskMb) * 100).toFixed(1));

        const memoryFormatted = `${(memoryMb / 1024).toFixed(2)} GB / ${(totalMemoryMb / 1024).toFixed(1)} GB`;
        const diskFormatted = `${(diskMb / 1024).toFixed(2)} GB / ${(totalDiskMb / 1024).toFixed(1)} GB`;

        const networkRxMb = (resObj.network_rx_bytes || 0) / (1024 * 1024);
        const networkTxMb = (resObj.network_tx_bytes || 0) / (1024 * 1024);
        const networkRxFormatted = `${networkRxMb.toFixed(1)} MB`;
        const networkTxFormatted = `${networkTxMb.toFixed(1)} MB`;

        const hours = Math.floor(uptimeSeconds / 3600);
        const minutes = Math.floor((uptimeSeconds % 3600) / 60);
        const uptimeFormatted = `${hours}h ${minutes}m`;

        const metrics: LiveServerResources = {
          currentState: attrs.current_state || "unknown",
          isSuspended: Boolean(attrs.is_suspended),
          cpuPercentage: cpu,
          memoryBytes,
          memoryFormatted,
          memoryPercentage,
          diskBytes,
          diskFormatted,
          diskPercentage,
          networkRxFormatted,
          networkTxFormatted,
          uptimeSeconds,
          uptimeFormatted,
          timestamp: new Date().toISOString(),
          source: "live",
        };

        cachedMetrics = metrics;
        lastMetricsFetchTime = Date.now();
        return metrics;
      }
    } catch (fetchErr) {
      console.warn("Live metrics fetch warning:", fetchErr);
    }

    // Fallback to cache if available
    if (cachedMetrics) {
      return {
        ...cachedMetrics,
        source: "cached",
      };
    }

    // Default offline/initial metrics if no cache exists
    return {
      currentState: "unknown",
      isSuspended: false,
      cpuPercentage: 0,
      memoryBytes: 0,
      memoryFormatted: "0 GB / 16.0 GB",
      memoryPercentage: 0,
      diskBytes: 0,
      diskFormatted: "0 GB / 40.0 GB",
      diskPercentage: 0,
      networkRxFormatted: "0 MB",
      networkTxFormatted: "0 MB",
      uptimeSeconds: 0,
      uptimeFormatted: "0m",
      timestamp: new Date().toISOString(),
      source: "cached",
    };
  }

  /**
   * Executes a verified power action (start, restart, stop, kill) with safeguards and RBAC enforcement.
   */
  public async executePowerAction(
    signal: PowerSignal,
    actor: AuthenticatedAdminUser,
    confirmationChallenge?: string
  ): Promise<{ success: boolean; message: string }> {
    // 1. Validate Signal
    const ALLOWED_SIGNALS: PowerSignal[] = ["start", "restart", "stop", "kill"];
    if (!ALLOWED_SIGNALS.includes(signal)) {
      throw new Error(`Invalid power signal requested: "${signal}"`);
    }

    // 2. High-Impact Safeguards
    if (signal === "stop" || signal === "kill") {
      // High-impact actions are strictly restricted to SUPERADMIN
      if (actor.role !== "SUPERADMIN") {
        throw new Error("FORBIDDEN: Server shutdown and termination require Superadmin authorization.");
      }

      // Explicit confirmation challenge check
      if (confirmationChallenge !== "CONFIRM_SHUTDOWN") {
        throw new Error(
          "Confirmation required: High-impact power actions require explicit confirmation challenge 'CONFIRM_SHUTDOWN'."
        );
      }
    }

    // 3. Rate-Limit / Cooldown Check
    const now = Date.now();
    const timeSinceLastAction = now - lastPowerActionTime;
    if (timeSinceLastAction < POWER_ACTION_COOLDOWN_MS) {
      const waitSec = Math.ceil((POWER_ACTION_COOLDOWN_MS - timeSinceLastAction) / 1000);
      throw new Error(
        `Power action cooldown active. Please wait ${waitSec} second(s) before sending another power signal.`
      );
    }

    // 4. Dispatch Power Signal to Pterodactyl API
    const res = await this.safeFetch(
      `/api/client/servers/${encodeURIComponent(this.serverId)}/power`,
      {
        method: "POST",
        body: JSON.stringify({ signal }),
      }
    );

    if (res.status !== 204 && !res.ok) {
      const errText = await res.text().catch(() => "");
      throw new Error(`Pterodactyl power dispatch failed (${res.status}): ${errText || "Unknown error"}`);
    }

    lastPowerActionTime = Date.now();

    // 5. Immutable Audit Log Recording
    try {
      await prisma.auditLog.create({
        data: {
          actorId: actor.id,
          actorEmail: actor.email,
          action: `SERVER_POWER_${signal.toUpperCase()}`,
          targetEntity: "HostingServer",
          targetId: maskIdentifier(this.serverId),
          metadata: JSON.stringify({
            signal,
            actorRole: actor.role,
            dispatchedAt: new Date().toISOString(),
          }),
        },
      });
    } catch (auditErr) {
      console.warn("Audit logging warning for power action:", auditErr);
    }

    return {
      success: true,
      message: `Power signal '${signal}' successfully dispatched to server.`,
    };
  }

  /**
   * Dispatches a single-line validated administration command to the server console with input filtering.
   */
  public async executeConsoleCommand(
    command: string,
    actor: AuthenticatedAdminUser
  ): Promise<{ success: boolean; message: string }> {
    const cleanCmd = command.trim().replace(/^\/+/, ""); // strip leading slash

    if (!cleanCmd) {
      throw new Error("Command cannot be empty.");
    }

    if (cleanCmd.includes("\n") || cleanCmd.includes("\r") || cleanCmd.includes(";")) {
      throw new Error("Invalid command format: commands must be single-line and contain no command delimiters.");
    }

    const rootCommand = cleanCmd.split(" ")[0].toLowerCase();

    // Block destructive commands from web console
    if (FORBIDDEN_CONSOLE_COMMANDS.includes(rootCommand)) {
      throw new Error(
        `Command '${rootCommand}' is restricted for server safety. Use the dedicated dashboard power controls.`
      );
    }

    const res = await this.safeFetch(
      `/api/client/servers/${encodeURIComponent(this.serverId)}/command`,
      {
        method: "POST",
        body: JSON.stringify({ command: cleanCmd }),
      }
    );

    if (res.status !== 204 && !res.ok) {
      const errText = await res.text().catch(() => "");
      throw new Error(`Command dispatch failed (${res.status}): ${errText || "Unknown error"}`);
    }

    // Record in Audit Log
    try {
      await prisma.auditLog.create({
        data: {
          actorId: actor.id,
          actorEmail: actor.email,
          action: "SERVER_CONSOLE_COMMAND",
          targetEntity: "HostingServer",
          targetId: maskIdentifier(this.serverId),
          metadata: JSON.stringify({
            command: cleanCmd,
            actorRole: actor.role,
          }),
        },
      });
    } catch (auditErr) {
      console.warn("Audit logging warning for command:", auditErr);
    }

    return {
      success: true,
      message: `Command dispatched successfully: ${cleanCmd}`,
    };
  }
}

export const pterodactylHostingService = new PterodactylHostingService();
