import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAdmin, handleAdminError } from "@/lib/adminAuth";
import { z } from "zod";

export async function GET(req: Request) {
  try {
    const { user: admin, error: authError } = await verifyAdmin(req);
    if (authError || !admin) return authError!;

    const announcements = await prisma.serverAnnouncement.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ success: true, announcements });
  } catch (error: any) {
    return handleAdminError(error, "Failed to fetch announcements");
  }
}

const announcementSchema = z.object({
  title: z.string().min(2),
  content: z.string().min(5),
  tag: z.enum(["UPDATE", "EVENT", "SALE", "MAINTENANCE"]).default("UPDATE"),
  active: z.boolean().default(true),
});

export async function POST(req: Request) {
  try {
    const { user: admin, error: authError } = await verifyAdmin(req);
    if (authError || !admin) return authError!;

    const body = await req.json();
    const parsed = announcementSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
    }

    const { title, content, tag, active } = parsed.data;

    const created = await prisma.serverAnnouncement.create({
      data: {
        title,
        content,
        tag,
        active,
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: admin.id,
        actorEmail: admin.email,
        action: "CREATE_ANNOUNCEMENT",
        targetEntity: "ServerAnnouncement",
        targetId: created.id,
        metadata: JSON.stringify({ title, tag, active }),
      },
    });

    return NextResponse.json({ success: true, announcement: created });
  } catch (error: any) {
    return handleAdminError(error, "Failed to create announcement");
  }
}

export async function PUT(req: Request) {
  try {
    const { user: admin, error: authError } = await verifyAdmin(req);
    if (authError || !admin) return authError!;

    const body = await req.json();
    const { id, title, content, tag, active } = body;

    if (!id) {
      return NextResponse.json({ error: "Announcement ID is required" }, { status: 400 });
    }

    const updated = await prisma.serverAnnouncement.update({
      where: { id },
      data: {
        title,
        content,
        tag,
        active,
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: admin.id,
        actorEmail: admin.email,
        action: "UPDATE_ANNOUNCEMENT",
        targetEntity: "ServerAnnouncement",
        targetId: id,
        metadata: JSON.stringify({ title, tag, active }),
      },
    });

    return NextResponse.json({ success: true, announcement: updated });
  } catch (error: any) {
    return handleAdminError(error, "Failed to update announcement");
  }
}

export async function DELETE(req: Request) {
  try {
    const { user: admin, error: authError } = await verifyAdmin(req);
    if (authError || !admin) return authError!;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Announcement ID is required" }, { status: 400 });
    }

    await prisma.serverAnnouncement.delete({
      where: { id },
    });

    await prisma.auditLog.create({
      data: {
        actorId: admin.id,
        actorEmail: admin.email,
        action: "DELETE_ANNOUNCEMENT",
        targetEntity: "ServerAnnouncement",
        targetId: id,
      },
    });

    return NextResponse.json({ success: true, message: "Announcement deleted" });
  } catch (error: any) {
    return handleAdminError(error, "Failed to delete announcement");
  }
}
