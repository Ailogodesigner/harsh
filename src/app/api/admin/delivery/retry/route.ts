import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth";
import { executeDeliveryJob } from "@/lib/minecraft/delivery";

export async function POST(req: Request) {
  try {
    const admin = await requireAdmin();
    const body = await req.json();
    const { deliveryJobId } = body;

    if (!deliveryJobId) {
      return NextResponse.json({ error: "deliveryJobId is required" }, { status: 400 });
    }

    const job = await prisma.deliveryJob.findUnique({
      where: { id: deliveryJobId },
    });

    if (!job) {
      return NextResponse.json({ error: "Delivery job not found" }, { status: 404 });
    }

    // Reset status to QUEUED and execute
    await prisma.deliveryJob.update({
      where: { id: job.id },
      data: {
        status: "QUEUED",
        lastError: null,
      },
    });

    const result = await executeDeliveryJob(job.id);

    // Audit log
    await prisma.auditLog.create({
      data: {
        actorId: admin.id,
        actorEmail: admin.email,
        action: "RETRY_DELIVERY_JOB",
        targetEntity: "DeliveryJob",
        targetId: job.id,
        metadata: JSON.stringify({ result }),
      },
    });

    return NextResponse.json({ success: true, result });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "Failed to retry delivery" }, { status: 500 });
  }
}
