import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
        payments: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
        entitlements: {
          include: {
            deliveryJobs: true,
            minecraftAccount: true,
          },
        },
      },
    });

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Authorization check: If logged in, order must belong to user unless user is admin
    if (user && order.userId !== user.id && user.role !== "ADMIN" && user.role !== "SUPERADMIN") {
      return NextResponse.json({ error: "Unauthorized access to order" }, { status: 403 });
    }

    return NextResponse.json({ order });
  } catch (error: any) {
    console.error("Fetch order error:", error);
    return NextResponse.json({ error: "Failed to load order" }, { status: 500 });
  }
}
