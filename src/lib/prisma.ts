import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";

// Use ws in environments without native WebSocket
if (typeof globalThis.WebSocket === "undefined") {
  neonConfig.webSocketConstructor = ws;
}

declare global {
  // eslint-disable-next-line no-var
  var globalPrisma: PrismaClient | undefined;
}

function getConnectionString(): string | undefined {
  let url = process.env.DATABASE_URL;
  if (url) {
    url = url.trim();
    if ((url.startsWith('"') && url.endsWith('"')) || (url.startsWith("'") && url.endsWith("'"))) {
      url = url.slice(1, -1).trim();
    }
    return url;
  }
  return undefined;
}

export function getPrisma(): PrismaClient {
  const connectionString = getConnectionString();

  if (global.globalPrisma) {
    // If existing client already has the Neon adapter, return it
    if ((global.globalPrisma as any)._engineConfig?.adapter) {
      return global.globalPrisma;
    }
    // If it had no adapter but connectionString is now available, upgrade it
    if (connectionString) {
      const adapter = new PrismaNeon({ connectionString });
      global.globalPrisma = new PrismaClient({ adapter });
      return global.globalPrisma;
    }
    return global.globalPrisma;
  }

  if (connectionString) {
    const adapter = new PrismaNeon({ connectionString });
    global.globalPrisma = new PrismaClient({ adapter });
    return global.globalPrisma;
  }

  // Fallback for build time when DATABASE_URL is not available in CI/build container
  return new PrismaClient();
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getPrisma();
    const val = (client as any)[prop];
    if (typeof val === "function") {
      return val.bind(client);
    }
    return val;
  },
});

export default prisma;
