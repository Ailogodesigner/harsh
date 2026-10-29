import { NextResponse } from "next/server";
import { verifyAdmin, handleAdminError } from "@/lib/adminAuth";
import { pterodactylHostingService } from "@/lib/hosting/pterodactylService";
import { z } from "zod";

const commandSchema = z.object({
  command: z.string().min(1, "Command cannot be empty").max(500),
});

export async function POST(req: Request) {
  try {
    const { user: admin, error: authError } = await verifyAdmin(req);
    if (authError || !admin) return authError!;

    const body = await req.json();
    const parsed = commandSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid command payload." },
        { status: 400 }
      );
    }

    const { command } = parsed.data;

    const result = await pterodactylHostingService.executeConsoleCommand(command, admin);

    return NextResponse.json(result);
  } catch (error: any) {
    const errorMsg = error?.message || "Failed to dispatch command.";
    if (errorMsg.includes("restricted") || errorMsg.includes("format")) {
      return NextResponse.json({ error: errorMsg }, { status: 400 });
    }
    return handleAdminError(error, "Failed to dispatch console command");
  }
}

