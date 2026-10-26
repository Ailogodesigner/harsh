import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";

export async function GET() {
  try {
    await requireAdmin();

    const [
      totalOrders,
      paidOrders,
      pendingOrders,
      failedDeliveries,
      totalUsers,
      recentOrders,
      recentLogs,
      openTickets,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.findMany({
        where: { status: "PAID" },
        select: { totalAmount: true },
      }),
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.deliveryJob.count({
        where: { status: { in: ["FAILED", "MANUAL_REVIEW"] } },
      }),
      prisma.user.count(),
      prisma.order.findMany({
        take: 8,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { name: true, email: true } },
          items: true,
          payments: { take: 1, orderBy: { createdAt: "desc" } },
        },
      }),
      prisma.auditLog.findMany({
        take: 8,
        orderBy: { timestamp: "desc" },
      }),
      prisma.supportTicket.count({
        where: { status: { in: ["OPEN", "WAITING_ADMIN"] } },
      }),
    ]);

    const totalRevenueMinor = paidOrders.reduce((acc, curr) => acc + curr.totalAmount, 0);

    return NextResponse.json({
      metrics: {
        totalOrders,
        paidOrdersCount: paidOrders.length,
        totalRevenueMinor,
        pendingOrders,
        failedDeliveries,
        totalUsers,
        openTickets,
      },
      recentOrders,
      recentLogs,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Unauthorized" }, { status: 403 });
  }
}
