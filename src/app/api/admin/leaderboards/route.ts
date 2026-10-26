import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    await requireAdmin();

    const entries = await prisma.leaderboardEntry.findMany({
      orderBy: [{ category: "asc" }, { rank: "asc" }],
    });

    return NextResponse.json({ entries });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Unauthorized" },
      { status: error?.message?.includes("Unauthorized") ? 403 : 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const admin = await requireAdmin();
    const body = await req.json();

    const { category, name, score, rawScore, subtext, rank } = body;

    if (!category || !name || !score) {
      return NextResponse.json(
        { error: "Category, name, and score are required fields." },
        { status: 400 }
      );
    }

    const created = await prisma.leaderboardEntry.create({
      data: {
        category: category.trim().toUpperCase(),
        name: name.trim(),
        score: score.trim(),
        rawScore: typeof rawScore === "number" ? rawScore : 0,
        subtext: subtext ? subtext.trim() : null,
        rank: typeof rank === "number" ? rank : 1,
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: admin.id,
        actorEmail: admin.email,
        action: "CREATE_LEADERBOARD_ENTRY",
        targetEntity: "LeaderboardEntry",
        targetId: created.id,
        metadata: JSON.stringify({ category: created.category, name: created.name, score: created.score }),
      },
    });

    return NextResponse.json({ success: true, entry: created });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to create leaderboard entry" },
      { status: error?.message?.includes("Unauthorized") ? 403 : 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const admin = await requireAdmin();
    const body = await req.json();

    const { id, category, name, score, rawScore, subtext, rank } = body;

    if (!id) {
      return NextResponse.json({ error: "Leaderboard entry ID is required" }, { status: 400 });
    }

    const updated = await prisma.leaderboardEntry.update({
      where: { id },
      data: {
        ...(category && { category: category.trim().toUpperCase() }),
        ...(name && { name: name.trim() }),
        ...(score && { score: score.trim() }),
        ...(rawScore !== undefined && { rawScore: Number(rawScore) }),
        ...(subtext !== undefined && { subtext: subtext ? subtext.trim() : null }),
        ...(rank !== undefined && { rank: Number(rank) }),
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: admin.id,
        actorEmail: admin.email,
        action: "UPDATE_LEADERBOARD_ENTRY",
        targetEntity: "LeaderboardEntry",
        targetId: updated.id,
        metadata: JSON.stringify({ name: updated.name, category: updated.category, score: updated.score }),
      },
    });

    return NextResponse.json({ success: true, entry: updated });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to update leaderboard entry" },
      { status: error?.message?.includes("Unauthorized") ? 403 : 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const admin = await requireAdmin();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Leaderboard entry ID is required" }, { status: 400 });
    }

    const deleted = await prisma.leaderboardEntry.delete({
      where: { id },
    });

    await prisma.auditLog.create({
      data: {
        actorId: admin.id,
        actorEmail: admin.email,
        action: "DELETE_LEADERBOARD_ENTRY",
        targetEntity: "LeaderboardEntry",
        targetId: id,
        metadata: JSON.stringify({ name: deleted.name, category: deleted.category }),
      },
    });

    return NextResponse.json({ success: true, message: "Leaderboard entry deleted" });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to delete leaderboard entry" },
      { status: error?.message?.includes("Unauthorized") ? 403 : 500 }
    );
  }
}
