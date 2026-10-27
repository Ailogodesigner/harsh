import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const ticket = await prisma.supportTicket.findUnique({
      where: { id },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    // Only ticket creator or staff can view
    if (ticket.userId !== user.id && user.role !== "ADMIN" && user.role !== "SUPERADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ success: true, ticket });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch ticket" }, { status: 500 });
  }
}

const replySchema = z.object({
  message: z.string().min(2, "Message must be at least 2 characters").max(4000),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const parsed = replySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
    }

    const ticket = await prisma.supportTicket.findUnique({
      where: { id },
    });

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    if (ticket.userId !== user.id && user.role !== "ADMIN" && user.role !== "SUPERADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // If ticket is closed, don't allow replies unless reopened
    if (ticket.status === "CLOSED") {
      return NextResponse.json(
        { error: "This ticket is closed. Please submit a new ticket for new inquiries." },
        { status: 400 }
      );
    }

    const nextStatus = user.role === "ADMIN" || user.role === "SUPERADMIN" ? "WAITING_USER" : "WAITING_ADMIN";

    const [newMessage, updatedTicket] = await prisma.$transaction([
      prisma.ticketMessage.create({
        data: {
          ticketId: id,
          senderId: user.id,
          senderName: user.name,
          senderRole: user.role,
          content: parsed.data.message,
        },
      }),
      prisma.supportTicket.update({
        where: { id },
        data: {
          status: nextStatus,
          updatedAt: new Date(),
        },
        include: {
          messages: {
            orderBy: { createdAt: "asc" },
          },
        },
      }),
    ]);

    try {
      await prisma.auditLog.create({
        data: {
          actorId: user.id,
          actorEmail: user.email,
          action: user.role === "ADMIN" || user.role === "SUPERADMIN" ? "TICKET_STAFF_REPLY" : "TICKET_USER_REPLY",
          targetEntity: "SupportTicket",
          targetId: id,
          metadata: JSON.stringify({ messagePreview: parsed.data.message.slice(0, 100), nextStatus }),
        },
      });
    } catch (e) {
      console.warn("AuditLog error:", e);
    }

    return NextResponse.json({ success: true, message: newMessage, ticket: updatedTicket });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to send reply" }, { status: 500 });
  }
}

const statusUpdateSchema = z.object({
  status: z.enum(["OPEN", "WAITING_ADMIN", "WAITING_USER", "RESOLVED", "CLOSED"]),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const parsed = statusUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
    }

    const ticket = await prisma.supportTicket.findUnique({
      where: { id },
    });

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    const isStaff = user.role === "ADMIN" || user.role === "SUPERADMIN";
    const isOwner = ticket.userId === user.id;

    if (!isOwner && !isStaff) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const newStatus = parsed.data.status;

    // Regular users can resolve, close, or reopen tickets
    if (!isStaff && !["RESOLVED", "CLOSED", "OPEN"].includes(newStatus)) {
      return NextResponse.json(
        { error: "Members can only mark tickets as Resolved, Closed, or Reopen them." },
        { status: 400 }
      );
    }

    // Add a status notice into the conversation thread
    const statusNote =
      newStatus === "RESOLVED"
        ? `Ticket marked as RESOLVED by ${user.name}`
        : newStatus === "CLOSED"
        ? `Ticket marked as CLOSED by ${user.name}`
        : newStatus === "OPEN"
        ? `Ticket REOPENED by ${user.name}`
        : `Ticket status set to ${newStatus} by ${user.name}`;

    const [statusMessage, updatedTicket] = await prisma.$transaction([
      prisma.ticketMessage.create({
        data: {
          ticketId: id,
          senderId: user.id,
          senderName: user.name,
          senderRole: user.role,
          content: `📌 ${statusNote}`,
        },
      }),
      prisma.supportTicket.update({
        where: { id },
        data: {
          status: newStatus,
          updatedAt: new Date(),
        },
        include: {
          messages: {
            orderBy: { createdAt: "asc" },
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
        },
      }),
    ]);

    try {
      await prisma.auditLog.create({
        data: {
          actorId: user.id,
          actorEmail: user.email,
          action: "UPDATE_TICKET_STATUS",
          targetEntity: "SupportTicket",
          targetId: id,
          metadata: JSON.stringify({ newStatus, changedBy: user.email }),
        },
      });
    } catch (e) {
      console.warn("AuditLog error:", e);
    }

    return NextResponse.json({
      success: true,
      ticket: updatedTicket,
      message: statusMessage,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Failed to update ticket status" },
      { status: 500 }
    );
  }
}

