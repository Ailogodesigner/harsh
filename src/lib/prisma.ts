import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";

// Set WebSocket implementation in environments without global WebSocket
if (typeof globalThis.WebSocket === "undefined") {
  neonConfig.webSocketConstructor = ws;
}

declare global {
  // eslint-disable-next-line no-var
  var globalPrisma: PrismaClient | undefined;
}

function createPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;

  if (connectionString) {
    const adapter = new PrismaNeon({ connectionString });
    return new PrismaClient({
      adapter,
      log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
    });
  }

  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

export const prisma = global.globalPrisma || createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  global.globalPrisma = prisma;
}

export default prisma;
