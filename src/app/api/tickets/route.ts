import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { z } from "zod";

const ticketSchema = z.object({
  subject: z.string().min(4, "Subject must be at least 4 characters").max(100),
  category: z.string().default("GENERAL"),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]).default("MEDIUM"),
  message: z.string().min(10, "Please provide more details in your message"),
});

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const tickets = await prisma.supportTicket.findMany({
      where: { userId: user.id },
      include: {
        messages: {
          orderBy: { createdAt: "asc" },
        },
      },
      orderBy: { updatedAt: "desc" },
    });

    return NextResponse.json({ tickets });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to fetch tickets" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parsed = ticketSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
    }

    const { subject, category, priority, message } = parsed.data;

    // Enforce 1 active ticket per member policy
    const isStaff = user.role === "ADMIN" || user.role === "SUPERADMIN";
    if (!isStaff) {
      const activeTicket = await prisma.supportTicket.findFirst({
        where: {
          userId: user.id,
          status: { in: ["OPEN", "WAITING_ADMIN", "WAITING_USER"] },
        },
        select: { id: true, subject: true, status: true },
      });

      if (activeTicket) {
        return NextResponse.json(
          {
            error: `Active ticket limit reached: You already have an open ticket ("${activeTicket.subject}"). Each member can have only 1 active ticket at a time. Please wait for staff or resolve your current ticket before opening another.`,
            activeTicketId: activeTicket.id,
          },
          { status: 409 }
        );
      }
    }

    const ticket = await prisma.supportTicket.create({
      data: {
        userId: user.id,
        subject,
        category,
        priority,
        status: "OPEN",
        messages: {
          create: {
            senderId: user.id,
            senderName: user.name,
            senderRole: user.role,
            content: message,
          },
        },
      },
      include: {
        messages: true,
      },
    });

    try {
      await prisma.auditLog.create({
        data: {
          actorId: user.id,
          actorEmail: user.email,
          action: "CREATE_TICKET",
          targetEntity: "SupportTicket",
          targetId: ticket.id,
          metadata: JSON.stringify({ subject, category, priority }),
        },
      });
    } catch (e) {
      console.warn("AuditLog error:", e);
    }

    return NextResponse.json({ success: true, ticket });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to create support ticket" }, { status: 500 });
  }
}
