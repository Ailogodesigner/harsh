import { NextResponse } from "next/server";
import { checkPayZapiOrderStatus, getPayZapiApiKey } from "@/lib/payzapi";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const orderId = searchParams.get("order_id");

    if (!orderId) {
      return NextResponse.json(
        { ok: false, error: "Missing required query parameter: order_id" },
        { status: 400 }
      );
    }

    const apiKey = getPayZapiApiKey();
    if (!apiKey) {
      // In development simulation mode
      return NextResponse.json({
        ok: true,
        order_id: orderId,
        status: "pending",
        simulated: true,
        message: "Configure PAYZAPI_API_KEY for live verification.",
      });
    }

    const statusData = await checkPayZapiOrderStatus(orderId);
    return NextResponse.json(statusData);
  } catch (error: any) {
    console.error("[PayZapi API] Status check route error:", error);
    return NextResponse.json(
      { ok: false, error: error.message || "Failed to query order status" },
      { status: 500 }
    );
  }
}
