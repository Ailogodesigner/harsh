import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [accounts, orders, entitlements] = await Promise.all([
      prisma.minecraftAccount.findMany({
        where: { userId: user.id },
        orderBy: { linkedAt: "desc" },
      }),
      prisma.order.findMany({
        where: { userId: user.id },
        include: {
          items: true,
          payments: { take: 1, orderBy: { createdAt: "desc" } },
          entitlements: {
            include: {
              deliveryJobs: { take: 1, orderBy: { createdAt: "desc" } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.entitlement.findMany({
        where: { userId: user.id },
        include: {
          deliveryJobs: true,
          minecraftAccount: true,
        },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return NextResponse.json({
      accounts,
      orders,
      entitlements,
    });
  } catch (error: any) {
    console.error("Profile error:", error);
    return NextResponse.json({ error: "Failed to load profile" }, { status: 500 });
  }
}
