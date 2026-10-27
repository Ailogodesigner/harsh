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
      todaySignups,
      recentUsers,
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
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
      prisma.user.findMany({
        take: 6,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          minecraftAccounts: {
            take: 1,
            select: { username: true },
          },
        },
      }),
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
        take: 15,
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
        todaySignups,
        openTickets,
      },
      recentUsers,
      recentOrders,
      recentLogs,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Unauthorized" }, { status: 403 });
  }
}
