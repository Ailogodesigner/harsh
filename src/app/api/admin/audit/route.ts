import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    await requireAdmin();

    const { searchParams } = new URL(req.url);
    const search = (searchParams.get("search") || "").trim();
    const actionFilter = searchParams.get("action") || "ALL";
    const categoryFilter = searchParams.get("category") || "ALL";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(10, parseInt(searchParams.get("limit") || "50", 10)));
    const skip = (page - 1) * limit;

    const where: any = {};

    // Filter by specific action or group category
    if (categoryFilter === "AUTH") {
      where.action = { in: ["USER_REGISTER", "USER_LOGIN", "LINK_MINECRAFT"] };
    } else if (categoryFilter === "TICKETS") {
      where.action = {
        in: [
          "CREATE_TICKET",
          "TICKET_USER_REPLY",
          "TICKET_STAFF_REPLY",
          "UPDATE_TICKET_STATUS",
          "DELETE_TICKET",
          "UPDATE_TICKET",
        ],
      };
    } else if (categoryFilter === "STORE") {
      where.action = { in: ["CREATE_ORDER", "PAYMENT_SUCCESS", "RETRY_DELIVERY"] };
    } else if (categoryFilter === "ADMIN") {
      where.action = {
        in: [
          "UPDATE_USER_ROLE",
          "SERVER_COMMAND",
          "CREATE_PRODUCT",
          "UPDATE_PRODUCT",
          "DELETE_PRODUCT",
          "CREATE_ANNOUNCEMENT",
        ],
      };
    } else if (actionFilter !== "ALL") {
      where.action = actionFilter;
    }

    // Search query across email, action, targetEntity, and targetId
    if (search) {
      where.OR = [
        { actorEmail: { contains: search, mode: "insensitive" } },
        { action: { contains: search, mode: "insensitive" } },
        { targetEntity: { contains: search, mode: "insensitive" } },
        { targetId: { contains: search, mode: "insensitive" } },
        { metadata: { contains: search, mode: "insensitive" } },
      ];
    }

    const [logs, total] = await Promise.all([
      prisma.auditLog.findMany({
        where,
        orderBy: { timestamp: "desc" },
        take: limit,
        skip,
      }),
      prisma.auditLog.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      logs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Unauthorized or database error" },
      { status: 403 }
    );
  }
}
