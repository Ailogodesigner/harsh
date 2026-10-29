import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAdmin, handleAdminError } from "@/lib/adminAuth";
import { z } from "zod";

export async function GET(req: Request) {
  try {
    const { user: admin, error: authError } = await verifyAdmin(req);
    if (authError || !admin) return authError!;

    const modes = await prisma.gameMode.findMany({
      orderBy: { sortOrder: "asc" },
    });
    return NextResponse.json({ success: true, modes });
  } catch (error: any) {
    return handleAdminError(error, "Failed to fetch game modes");
  }
}

const updateSchema = z.object({
  id: z.string(),
  title: z.string().min(2),
  status: z.enum(["ONLINE", "COMING_SOON", "MAINTENANCE", "BETA"]),
  version: z.string().default("1.20 - 1.21.x"),
  description: z.string(),
  active: z.boolean().default(true),
  sortOrder: z.number().default(0),
});

export async function PUT(req: Request) {
  try {
    const { user: admin, error: authError } = await verifyAdmin(req);
    if (authError || !admin) return authError!;

    const body = await req.json();
    const parsed = updateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
    }

    const { id, title, status, version, description, active, sortOrder } = parsed.data;

    const updated = await prisma.gameMode.update({
      where: { id },
      data: {
        title,
        status,
        version,
        description,
        active,
        sortOrder,
      },
    });

    // Create Audit Log
    await prisma.auditLog.create({
      data: {
        actorId: admin.id,
        actorEmail: admin.email,
        action: "UPDATE_GAMEMODE",
        targetEntity: "GameMode",
        targetId: id,
        metadata: JSON.stringify({ title, status, version }),
      },
    });

    return NextResponse.json({ success: true, mode: updated });
  } catch (error: any) {
    return handleAdminError(error, "Failed to update game mode");
  }
}
