import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAdmin, scrubSensitiveUserData, handleAdminError } from "@/lib/adminAuth";
import { z } from "zod";

export async function GET(req: Request) {
  try {
    const { user: admin, error: authError } = await verifyAdmin(req);
    if (authError || !admin) return authError!;

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search")?.trim() || "";
    const role = searchParams.get("role") || "ALL";

    const where: any = {};

    if (role !== "ALL") {
      where.role = role;
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
        { id: { contains: search, mode: "insensitive" } },
        {
          minecraftAccounts: {
            some: {
              username: { contains: search, mode: "insensitive" },
            },
          },
        },
      ];
    }

    const [users, totalCount, todayCount, roleStats] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          minecraftAccounts: {
            select: {
              username: true,
              verificationStatus: true,
            },
          },
          _count: {
            select: {
              orders: true,
              supportTickets: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take: 100,
      }),
      prisma.user.count(),
      prisma.user.count({
        where: {
          createdAt: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
          },
        },
      }),
      prisma.user.groupBy({
        by: ["role"],
        _count: { _all: true },
      }),
    ]);

    const stats = {
      totalUsers: totalCount,
      todaySignups: todayCount,
      admins: roleStats.find((r) => r.role === "ADMIN")?._count._all || 0,
      superAdmins: roleStats.find((r) => r.role === "SUPERADMIN")?._count._all || 0,
      regularUsers: roleStats.find((r) => r.role === "USER")?._count._all || 0,
    };

    // Redact/mask player email addresses in user lists
    const sanitizedUsers = users.map((u) => scrubSensitiveUserData(u));

    return NextResponse.json({
      success: true,
      users: sanitizedUsers,
      stats,
    });
  } catch (error: any) {
    return handleAdminError(error, "Failed to fetch users");
  }
}

const roleUpdateSchema = z.object({
  userId: z.string().min(1),
  role: z.enum(["USER", "ADMIN", "SUPERADMIN"]),
});

export async function PATCH(req: Request) {
  try {
    const { user: admin, error: authError } = await verifyAdmin(req);
    if (authError || !admin) return authError!;

    const body = await req.json();
    const parsed = roleUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
    }

    const { userId, role } = parsed.data;

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: admin.id,
        actorEmail: admin.email,
        action: "UPDATE_USER_ROLE",
        targetEntity: "User",
        targetId: userId,
        metadata: JSON.stringify({
          targetUserEmail: targetUser.email,
          previousRole: targetUser.role,
          newRole: role,
        }),
      },
    });

    return NextResponse.json({ success: true, user: scrubSensitiveUserData(updated) });
  } catch (error: any) {
    return handleAdminError(error, "Failed to update user role");
  }
}
