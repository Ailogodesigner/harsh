import { NextResponse } from "next/server";
import { z } from "zod";
import { createPayZapiOrder, getPayZapiApiKey } from "@/lib/payzapi";

const createOrderSchema = z.object({
  amount: z.number().positive("Amount must be greater than 0"),
  clientOrderId: z.string().optional(),
  customerName: z.string().optional(),
  customerEmail: z.string().email().optional(),
  description: z.string().optional(),
  paymentProvider: z.enum(["fampay", "paytm", "bharatpe", "binance"]).optional(),
  redirectUrl: z.string().url().optional(),
  expiryMinutes: z.number().min(1).max(1440).optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = createOrderSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { ok: false, error: parsed.error.issues[0]?.message || "Invalid order parameters" },
        { status: 400 }
      );
    }

    const { amount, clientOrderId, customerName, customerEmail, description, paymentProvider, redirectUrl, expiryMinutes } =
      parsed.data;

    // Check if API key is configured
    const apiKey = getPayZapiApiKey();
    if (!apiKey) {
      // Return a simulated development order so local testing works without failing
      const mockOrderId = `sim_${Math.random().toString(36).substring(2, 10)}`;
      return NextResponse.json({
        ok: true,
        simulated: true,
        order_id: mockOrderId,
        amount,
        payment_url: `https://payzapi.in/pay/${mockOrderId}`,
        deep_link: `upi://pay?pa=mock@upi&pn=${encodeURIComponent(customerName || "NOTIXNODE")}&am=${amount}&cu=INR`,
        message:
          "Simulated order generated. Configure PAYZAPI_API_KEY in .env or Cloudflare environment variables for live gateway orders.",
      });
    }

    const result = await createPayZapiOrder({
      amount,
      clientOrderId: clientOrderId || `ORD-${Date.now()}`,
      customerName,
      customerEmail,
      description: description || "NOTIXNODE Order Payment",
      paymentProvider,
      redirectUrl: redirectUrl || `${process.env.NEXT_PUBLIC_APP_URL || "https://notixnode.online"}/bot-order`,
      expiryMinutes: expiryMinutes || 15,
    });

    if (!result.ok) {
      return NextResponse.json(
        { ok: false, error: result.error || "Failed to create payment order with PayZapi" },
        { status: 502 }
      );
    }

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("[PayZapi API] Create order route error:", error);
    return NextResponse.json(
      { ok: false, error: error.message || "Internal server error" },
      { status: 500 }
    );
  }
}
