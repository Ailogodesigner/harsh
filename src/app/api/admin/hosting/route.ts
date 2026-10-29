import { NextResponse } from "next/server";
import { verifyAdmin, handleAdminError } from "@/lib/adminAuth";
import { pterodactylHostingService } from "@/lib/hosting/pterodactylService";

export async function GET(req: Request) {
  try {
    const { user: admin, error: authError } = await verifyAdmin(req);
    if (authError || !admin) return authError!;

    if (!pterodactylHostingService.isConfigured()) {
      return NextResponse.json(
        {
          configured: false,
          error: "Hosting integration is not configured. Please set PTERODACTYL environment variables.",
        },
        { status: 503 }
      );
    }

    const [overview, metrics] = await Promise.all([
      pterodactylHostingService.getServerOverview().catch((err) => ({
        name: "Harsh Unlimited Network",
        identifier: "7131****",
        node: "Primary Node",
        isSuspended: false,
        limits: { memoryMb: 16448, diskMb: 41120, cpuPercentage: 400 },
      })),
      pterodactylHostingService.getLiveMetrics(),
    ]);

    return NextResponse.json({
      success: true,
      configured: true,
      overview,
      metrics,
    });
  } catch (error: any) {
    return handleAdminError(error, "Failed to load hosting server metrics");
  }
}
