import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAdmin, scrubSensitiveUserData, maskEmail, handleAdminError } from "@/lib/adminAuth";

export async function GET(req: Request) {
  try {
    const { user: admin, error: authError } = await verifyAdmin(req);
    if (authError || !admin) return authError!;

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

    // Scrub player emails from dashboard stats and logs
    const sanitizedRecentUsers = recentUsers.map((u) => scrubSensitiveUserData(u));
    const sanitizedRecentOrders = recentOrders.map((ord) => ({
      ...ord,
      user: ord.user ? scrubSensitiveUserData(ord.user) : null,
    }));
    const sanitizedRecentLogs = recentLogs.map((log) => ({
      ...log,
      actorEmail: log.actorEmail ? maskEmail(log.actorEmail) : null,
    }));

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
      recentUsers: sanitizedRecentUsers,
      recentOrders: sanitizedRecentOrders,
      recentLogs: sanitizedRecentLogs,
    });
  } catch (error: any) {
    return handleAdminError(error, "Failed to load dashboard statistics");
  }
}
