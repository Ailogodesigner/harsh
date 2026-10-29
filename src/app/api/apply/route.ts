import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { verifyAdmin, handleAdminError } from "@/lib/adminAuth";
import { z } from "zod";

const applySchema = z.object({
  position: z.string().min(2),
  minecraftName: z.string().min(3).max(16),
  discordTag: z.string().min(3),
  age: z.number().int().min(15, "Minimum age requirement for staff applicants is 15 years"),
  timezone: z.string().min(2),
  experience: z.string().min(10),
  whyJoin: z.string().min(10),
  scenarioAnswer: z.string().min(10),
});

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    const body = await req.json();
    const parsed = applySchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid input data" },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const application = await prisma.staffApplication.create({
      data: {
        userId: user?.id || null,
        position: data.position,
        minecraftName: data.minecraftName,
        discordTag: data.discordTag,
        age: data.age,
        timezone: data.timezone,
        experience: data.experience,
        whyJoin: data.whyJoin,
        scenarioAnswer: data.scenarioAnswer,
        status: "PENDING",
      },
    });

    return NextResponse.json({ success: true, application });
  } catch (error: any) {
    console.error("Staff application error:", error);
    return NextResponse.json({ error: "Failed to submit application" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { user: admin, error: authError } = await verifyAdmin(req);
    if (authError || !admin) return authError!;

    const applications = await prisma.staffApplication.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ applications });
  } catch (error: any) {
    return handleAdminError(error, "Failed to fetch applications");
  }
}
