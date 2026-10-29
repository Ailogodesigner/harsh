import { NextResponse } from "next/server";
import { verifyAdmin, handleAdminError } from "@/lib/adminAuth";
import { pterodactylHostingService, PowerSignal } from "@/lib/hosting/pterodactylService";
import { z } from "zod";

const powerActionSchema = z.object({
  signal: z.enum(["start", "stop", "restart", "kill"]),
  confirmationChallenge: z.string().optional(),
});

export async function POST(req: Request) {
  try {
    const { user: admin, error: authError } = await verifyAdmin(req);
    if (authError || !admin) return authError!;

    const body = await req.json();
    const parsed = powerActionSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid power action request payload." },
        { status: 400 }
      );
    }

    const { signal, confirmationChallenge } = parsed.data;

    // Execute power action with full RBAC, rate-limiting, and confirmation enforcement
    const result = await pterodactylHostingService.executePowerAction(
      signal as PowerSignal,
      admin,
      confirmationChallenge
    );

    return NextResponse.json(result);
  } catch (error: any) {
    const errorMsg = error?.message || "Failed to execute server power operation.";
    if (errorMsg.includes("FORBIDDEN")) {
      return NextResponse.json({ error: errorMsg }, { status: 403 });
    }
    if (errorMsg.includes("Confirmation required") || errorMsg.includes("cooldown")) {
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }
    return handleAdminError(error, "Failed to execute server power operation");
  }
}

