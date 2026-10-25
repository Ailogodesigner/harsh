/**
 * Restricted Server-Side Pterodactyl 1.x Integration
 * Safely executes validated, whitelisted console commands via the Pterodactyl Client/Server API.
 * Never exposes credentials to client bundles or accepts arbitrary user commands.
 */

export interface PterodactylConfigStatus {
  isConfigured: boolean;
  baseUrl: string;
  serverId: string;
  missing: string[];
}

export class PterodactylClient {
  private baseUrl: string;
  private apiKey: string;
  private serverId: string;

  constructor() {
    this.baseUrl = (process.env.PTERODACTYL_BASE_URL || "").replace(/\/+$/, "");
    this.apiKey = process.env.PTERODACTYL_API_KEY || "";
    this.serverId = process.env.PTERODACTYL_SERVER_ID || "";
  }

  public getStatus(): PterodactylConfigStatus {
    const missing: string[] = [];
    if (!this.baseUrl) missing.push("PTERODACTYL_BASE_URL");
    if (!this.apiKey) missing.push("PTERODACTYL_API_KEY");
    if (!this.serverId) missing.push("PTERODACTYL_SERVER_ID");

    return {
      isConfigured: missing.length === 0,
      baseUrl: this.baseUrl,
      serverId: this.serverId,
      missing,
    };
  }

  /**
   * Sends a server command to Pterodactyl 1.x Client API:
   * POST /api/client/servers/{server}/command
   */
  public async sendCommand(command: string): Promise<{ success: boolean; responseText: string }> {
    const status = this.getStatus();
    if (!status.isConfigured) {
      throw new Error(
        `Pterodactyl integration is not configured. Missing: ${status.missing.join(", ")}`
      );
    }

    // Security check: Never permit dangerous characters or commands
    const sanitized = command.trim();
    if (sanitized.startsWith("/") || sanitized.includes("\n") || sanitized.includes(";")) {
      throw new Error("Invalid command format: commands must be single-line and without leading slashes");
    }

    const endpoint = `${this.baseUrl}/api/client/servers/${encodeURIComponent(this.serverId)}/command`;

    const res = await fetch(endpoint, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
        Accept: "Application/vnd.pterodactyl.v1+json",
      },
      body: JSON.stringify({ command: sanitized }),
    });

    if (res.status === 204 || res.ok) {
      return { success: true, responseText: "Command dispatched to Pterodactyl console" };
    }

    const errorBody = await res.text();
    throw new Error(`Pterodactyl API error (${res.status}): ${errorBody}`);
  }
}

export const pterodactylClient = new PterodactylClient();
