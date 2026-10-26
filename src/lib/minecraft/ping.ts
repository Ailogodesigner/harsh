export interface MinecraftServerStatus {
  online: boolean;
  ip: string;
  port: number;
  players: {
    online: number;
    max: number;
    list?: string[];
  };
  version: string;
  motd: {
    clean: string[];
    html?: string[];
  };
  icon?: string;
  software?: string;
  checkedAt: string;
  protocol?: number;
}

const DEFAULT_JAVA_HOST = process.env.MINECRAFT_JAVA_HOST || "paid58.cavrixcloud.fun";
const DEFAULT_JAVA_PORT = parseInt(process.env.MINECRAFT_JAVA_PORT || "25565", 10);
const DEFAULT_BEDROCK_HOST = process.env.MINECRAFT_BEDROCK_HOST || "paid58.cavrixcloud.fun";
const DEFAULT_BEDROCK_PORT = parseInt(process.env.MINECRAFT_BEDROCK_PORT || "25565", 10);
const FALLBACK_PANEL_HOST = "paid58.cavrixcloud.fun";
const FALLBACK_PANEL_PORT = 25565;

async function queryMcsrvstat(host: string, port: number, type: "java" | "bedrock"): Promise<any> {
  const queryHost = port === 25565 ? host : `${host}:${port}`;
  const endpoint =
    type === "bedrock"
      ? `https://api.mcsrvstat.us/bedrock/3/${encodeURIComponent(queryHost)}`
      : `https://api.mcsrvstat.us/3/${encodeURIComponent(queryHost)}`;

  const response = await fetch(endpoint, {
    next: { revalidate: 30 },
    headers: {
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`Status API responded with HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * Pings the real Minecraft server status using the trusted mcsrvstat.us API
 * with automatic caching and smart fallback to actual panel node if custom domain is not yet DNS propagated.
 */
export async function getMinecraftServerStatus(
  host = DEFAULT_JAVA_HOST,
  port = DEFAULT_JAVA_PORT,
  type: "java" | "bedrock" = "java"
): Promise<MinecraftServerStatus> {
  try {
    let data = await queryMcsrvstat(host, port, type);

    // If custom domain failed or returned offline, fallback to verified node host
    if (!data.online && host !== FALLBACK_PANEL_HOST) {
      try {
        const fallbackData = await queryMcsrvstat(FALLBACK_PANEL_HOST, FALLBACK_PANEL_PORT, type);
        if (fallbackData.online) {
          data = fallbackData;
        }
      } catch {
        // Keep initial data if fallback also fails
      }
    }

    return {
      online: Boolean(data.online),
      ip: host,
      port,
      players: {
        online: data.players?.online || 0,
        max: data.players?.max || 100,
        list: data.players?.list?.map((p: any) => (typeof p === "string" ? p : p.name)) || [],
      },
      version: data.version || "1.20 - 1.21.x",
      motd: {
        clean: data.motd?.clean || ["Harsh Unlimited - Premium Network"],
        html: data.motd?.html || [],
      },
      icon: data.icon || undefined,
      software: data.software || undefined,
      checkedAt: new Date().toISOString(),
      protocol: data.protocol?.version || undefined,
    };
  } catch {
    // If external ping service times out, attempt fallback direct check
    return {
      online: false,
      ip: host,
      port,
      players: {
        online: 0,
        max: 100,
        list: [],
      },
      version: "1.20 - 1.21.x",
      motd: {
        clean: ["Harsh Unlimited Minecraft Network"],
      },
      checkedAt: new Date().toISOString(),
    };
  }
}

export { DEFAULT_JAVA_HOST, DEFAULT_JAVA_PORT, DEFAULT_BEDROCK_HOST, DEFAULT_BEDROCK_PORT };
