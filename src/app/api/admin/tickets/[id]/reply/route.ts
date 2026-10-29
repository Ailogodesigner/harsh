import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAdmin, scrubTicket, handleAdminError } from "@/lib/adminAuth";
import { z } from "zod";

const replySchema = z.object({
  content: z.string().min(1, "Message content cannot be empty").max(4000),
  status: z.enum(["OPEN", "WAITING_ADMIN", "WAITING_USER", "RESOLVED", "CLOSED"]).optional(),
});

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user: admin, error: authError } = await verifyAdmin(req);
    if (authError || !admin) return authError!;

    const { id } = await params;

    const body = await req.json();
    const parsed = replySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
    }

    const { content, status } = parsed.data;

    // Verify ticket exists
    const ticket = await prisma.supportTicket.findUnique({
      where: { id },
      include: { user: true },
    });

    if (!ticket) {
      return NextResponse.json({ error: "Ticket not found" }, { status: 404 });
    }

    // Determine new status: defaults to WAITING_USER unless specified
    const nextStatus = status || (ticket.status === "RESOLVED" || ticket.status === "CLOSED" ? ticket.status : "WAITING_USER");

    // Create message and update ticket status in a transaction
    const [newMessage, updatedTicket] = await prisma.$transaction([
      prisma.ticketMessage.create({
        data: {
          ticketId: id,
          senderId: admin.id,
          senderName: `${admin.name} (Support)`,
          senderRole: admin.role,
          content,
        },
      }),
      prisma.supportTicket.update({
        where: { id },
        data: {
          status: nextStatus,
          updatedAt: new Date(),
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              minecraftAccounts: true,
              _count: {
                select: { orders: true },
              },
            },
          },
          messages: {
            orderBy: { createdAt: "asc" },
          },
        },
      }),
    ]);

    await prisma.auditLog.create({
      data: {
        actorId: admin.id,
        actorEmail: admin.email,
        action: "TICKET_STAFF_REPLY",
        targetEntity: "SupportTicket",
        targetId: id,
        metadata: JSON.stringify({
          ticketSubject: ticket.subject,
          newStatus: nextStatus,
          messageSnippet: content.slice(0, 100),
        }),
      },
    });

    return NextResponse.json({
      success: true,
      message: newMessage,
      ticket: scrubTicket(updatedTicket),
    });
  } catch (error: any) {
    return handleAdminError(error, "Failed to post reply to support ticket");
  }
}
