import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const announcements = await prisma.serverAnnouncement.findMany({
      where: { active: true },
      orderBy: { createdAt: "desc" },
      take: 5,
    });
    return NextResponse.json({ success: true, announcements });
  } catch (error: any) {
    return NextResponse.json(
      {
        error: "Failed to fetch announcements",
        details: error?.message || String(error),
        name: error?.name,
        hasDbUrl: Boolean(process.env.DATABASE_URL),
      },
      { status: 500 }
    );
  }
}
