import { NextResponse } from "next/server";
import { getMinecraftServerStatus } from "@/lib/minecraft/ping";

export async function GET() {
  try {
    const status = await getMinecraftServerStatus();
    return NextResponse.json(status);
  } catch (error: any) {
    return NextResponse.json(
      {
        online: false,
        ip: "play.harshunlimited.fun",
        port: 25565,
        players: { online: 0, max: 0, list: [] },
        error: error?.message || "Failed to query server",
      },
      { status: 200 }
    );
  }
}
