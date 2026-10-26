import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const entries = await prisma.leaderboardEntry.findMany({
      orderBy: [{ category: "asc" }, { rank: "asc" }],
    });

    return NextResponse.json({ entries });
  } catch (error: any) {
    console.error("Failed to fetch leaderboards:", error);
    return NextResponse.json(
      { error: "Failed to fetch leaderboards" },
      { status: 500 }
    );
  }
}
