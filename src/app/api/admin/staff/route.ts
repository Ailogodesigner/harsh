import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAdmin, handleAdminError } from "@/lib/adminAuth";

export async function GET(req: Request) {
  try {
    const { user: admin, error: authError } = await verifyAdmin(req);
    if (authError || !admin) return authError!;

    const staff = await prisma.staffMember.findMany({
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });

    return NextResponse.json({ staff });
  } catch (error: any) {
    return handleAdminError(error, "Failed to fetch staff members");
  }
}

export async function POST(req: Request) {
  try {
    const { user: admin, error: authError } = await verifyAdmin(req);
    if (authError || !admin) return authError!;

    const body = await req.json();

    const { name, displayName, role, tag, category, color, sortOrder, active } = body;

    if (!name || !role || !tag) {
      return NextResponse.json(
        { error: "Name, role, and tag are required fields." },
        { status: 400 }
      );
    }

    const created = await prisma.staffMember.create({
      data: {
        name: name.trim(),
        displayName: displayName ? displayName.trim() : null,
        role: role.trim(),
        tag: tag.trim().toUpperCase(),
        category: category || "LEADERSHIP",
        color: color || "emerald",
        sortOrder: typeof sortOrder === "number" ? sortOrder : 0,
        active: typeof active === "boolean" ? active : true,
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: admin.id,
        actorEmail: admin.email,
        action: "CREATE_STAFF_MEMBER",
        targetEntity: "StaffMember",
        targetId: created.id,
        metadata: JSON.stringify({ name: created.name, tag: created.tag, role: created.role }),
      },
    });

    return NextResponse.json({ success: true, staff: created });
  } catch (error: any) {
    return handleAdminError(error, "Failed to create staff member");
  }
}

export async function PUT(req: Request) {
  try {
    const { user: admin, error: authError } = await verifyAdmin(req);
    if (authError || !admin) return authError!;

    const body = await req.json();

    const { id, name, displayName, role, tag, category, color, sortOrder, active } = body;

    if (!id) {
      return NextResponse.json({ error: "Staff member ID is required" }, { status: 400 });
    }

    const updated = await prisma.staffMember.update({
      where: { id },
      data: {
        ...(name && { name: name.trim() }),
        ...(displayName !== undefined && { displayName: displayName ? displayName.trim() : null }),
        ...(role && { role: role.trim() }),
        ...(tag && { tag: tag.trim().toUpperCase() }),
        ...(category && { category }),
        ...(color && { color }),
        ...(sortOrder !== undefined && { sortOrder: Number(sortOrder) }),
        ...(active !== undefined && { active: Boolean(active) }),
      },
    });

    await prisma.auditLog.create({
      data: {
        actorId: admin.id,
        actorEmail: admin.email,
        action: "UPDATE_STAFF_MEMBER",
        targetEntity: "StaffMember",
        targetId: updated.id,
        metadata: JSON.stringify({ name: updated.name, tag: updated.tag, active: updated.active }),
      },
    });

    return NextResponse.json({ success: true, staff: updated });
  } catch (error: any) {
    return handleAdminError(error, "Failed to update staff member");
  }
}

export async function DELETE(req: Request) {
  try {
    const { user: admin, error: authError } = await verifyAdmin(req);
    if (authError || !admin) return authError!;

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Staff member ID is required" }, { status: 400 });
    }

    const deleted = await prisma.staffMember.delete({
      where: { id },
    });

    await prisma.auditLog.create({
      data: {
        actorId: admin.id,
        actorEmail: admin.email,
        action: "DELETE_STAFF_MEMBER",
        targetEntity: "StaffMember",
        targetId: id,
        metadata: JSON.stringify({ name: deleted.name, role: deleted.role }),
      },
    });

    return NextResponse.json({ success: true, message: "Staff member deleted" });
  } catch (error: any) {
    return handleAdminError(error, "Failed to delete staff member");
  }
}
