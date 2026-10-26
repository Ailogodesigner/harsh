import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { z } from "zod";

export async function GET(req: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const priority = searchParams.get("priority");
    const category = searchParams.get("category");
    const search = searchParams.get("search");

    const where: any = {};

    if (status && status !== "ALL") {
      where.status = status;
    }

    if (priority && priority !== "ALL") {
      where.priority = priority;
    }

    if (category && category !== "ALL") {
      where.category = category;
    }

    if (search && search.trim()) {
      const q = search.trim();
      where.OR = [
        { subject: { contains: q, mode: "insensitive" } },
        { id: { contains: q, mode: "insensitive" } },
        { user: { name: { contains: q, mode: "insensitive" } } },
        { user: { email: { contains: q, mode: "insensitive" } } },
        {
          user: {
            minecraftAccounts: {
              some: {
                username: { contains: q, mode: "insensitive" },
              },
            },
          },
        },
      ];
    }

    const [tickets, stats] = await Promise.all([
      prisma.supportTicket.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              createdAt: true,
              minecraftAccounts: {
                select: {
                  username: true,
                  verificationStatus: true,
                },
              },
              _count: {
                select: {
                  orders: true,
                },
              },
            },
          },
          messages: {
            orderBy: { createdAt: "asc" },
          },
        },
        orderBy: [{ priority: "desc" }, { updatedAt: "desc" }],
      }),
      prisma.supportTicket.groupBy({
        by: ["status"],
        _count: { _all: true },
      }),
    ]);

    const statusCounts: Record<string, number> = {
      TOTAL: 0,
      OPEN: 0,
      WAITING_ADMIN: 0,
      WAITING_USER: 0,
      RESOLVED: 0,
      CLOSED: 0,
    };

    let total = 0;
    stats.forEach((s) => {
      statusCounts[s.status] = s._count._all;
      total += s._count._all;
    });
    statusCounts.TOTAL = total;

    return NextResponse.json({
      success: true,
      tickets,
      counts: statusCounts,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to fetch tickets" },
      { status: error?.message?.includes("FORBIDDEN") ? 403 : 401 }
    );
  }
}

const statusUpdateSchema = z.object({
  id: z.string().min(1),
  status: z.enum(["OPEN", "WAITING_ADMIN", "WAITING_USER", "RESOLVED", "CLOSED"]).optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).optional(),
  category: z.string().optional(),
});

export async function PATCH(req: Request) {
  try {
    const admin = await requireAdmin();
    const body = await req.json();
    const parsed = statusUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
    }

    const { id, status, priority, category } = parsed.data;

    const dataToUpdate: any = {};
    if (status) dataToUpdate.status = status;
    if (priority) dataToUpdate.priority = priority;
    if (category) dataToUpdate.category = category;

    const updated = await prisma.supportTicket.update({
      where: { id },
      data: dataToUpdate,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            minecraftAccounts: true,
          },
        },
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: admin.id,
        actorEmail: admin.email,
        action: "UPDATE_TICKET",
        targetEntity: "SupportTicket",
        targetId: id,
        metadata: JSON.stringify(dataToUpdate),
      },
    });

    return NextResponse.json({ success: true, ticket: updated });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to update ticket" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const admin = await requireAdmin();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Ticket ID is required" }, { status: 400 });
    }

    await prisma.supportTicket.delete({
      where: { id },
    });

    await prisma.auditLog.create({
      data: {
        actorId: admin.id,
        actorEmail: admin.email,
        action: "DELETE_TICKET",
        targetEntity: "SupportTicket",
        targetId: id,
      },
    });

    return NextResponse.json({ success: true, message: "Ticket deleted successfully" });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to delete ticket" },
      { status: 500 }
    );
  }
}
