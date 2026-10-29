import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        {
          status: 401,
          headers: {
            "Cache-Control": "no-store, no-cache, must-revalidate",
          },
        }
      );
    }

    const [accounts, orders, entitlements, tickets] = await Promise.all([
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
      prisma.supportTicket.findMany({
        where: { userId: user.id },
        include: {
          messages: {
            orderBy: { createdAt: "asc" },
          },
        },
        orderBy: { updatedAt: "desc" },
      }),
    ]);

    return NextResponse.json(
      {
        accounts,
        orders,
        entitlements,
        tickets,
      },
      {
        headers: {
          "Cache-Control": "no-store, no-cache, must-revalidate",
        },
      }
    );
  } catch (error: any) {
    console.error("Profile error:", error);
    return NextResponse.json({ error: "Failed to load profile" }, { status: 500 });
  }
}
