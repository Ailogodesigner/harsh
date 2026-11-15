import { NextResponse } from "next/server";
import { getPayZapiWebhookSecret, verifyPayZapiSignature } from "@/lib/payzapi";

const DEFAULT_ORDERS_WEBHOOK =
  "https://discord.com/api/webhooks/1567450561874497588/ax42SS0-HJJr_xDhMvPlK1emMqevib_Mu-82ijaY2hwHt9XcAFhGCl0vilJTqre1WTqb";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature =
      req.headers.get("x-fampay-signature") ||
      req.headers.get("x-payzapi-signature") ||
      req.headers.get("X-FamPay-Signature") ||
      req.headers.get("X-PayZapi-Signature");

    const webhookSecret = getPayZapiWebhookSecret();

    // Verify HMAC-SHA256 signature if secret is configured
    if (webhookSecret) {
      if (!signature) {
        console.warn("[PayZapi Webhook] Missing signature header");
        return NextResponse.json(
          { ok: false, error: "Missing signature header" },
          { status: 401 }
        );
      }

      const isValid = verifyPayZapiSignature(rawBody, signature, webhookSecret);
      if (!isValid) {
        console.error("[PayZapi Webhook] Invalid HMAC-SHA256 signature");
        return NextResponse.json(
          { ok: false, error: "Invalid HMAC signature" },
          { status: 401 }
        );
      }
    } else {
      console.warn(
        "[PayZapi Webhook] PAYZAPI_WEBHOOK_SECRET not set. Skipping signature verification in development."
      );
    }

    let payload: any;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        { ok: false, error: "Invalid JSON body" },
        { status: 400 }
      );
    }

    const event = payload.event;
    const data = payload.data || payload;

    console.log(`[PayZapi Webhook] Received event: ${event || "unknown"}`, data);

    if (event === "payment.completed" || payload.status === "completed") {
      const orderId = data.order_id || payload.order_id;
      const utr = data.utr || payload.utr || "N/A";
      const amount = data.amount || payload.amount;
      const provider = data.provider || payload.payment_provider || "UPI / USDT";

      // Dispatch payment confirmation to Discord
      const webhookUrl = process.env.DISCORD_ORDERS_WEBHOOK_URL || DEFAULT_ORDERS_WEBHOOK;
      if (webhookUrl) {
        try {
          await fetch(webhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              username: "PayZapi Payment Gateway",
              avatar_url: "https://payzapi.in/favicon.ico",
              embeds: [
                {
                  title: "⚡ PAYMENT SETTLED — ORDER CONFIRMED",
                  description: `Instant payment verified via **PayZapi Gateway** (${provider.toUpperCase()}).`,
                  color: 0x10b981, // Emerald Green
                  fields: [
                    {
                      name: "🆔 Order ID",
                      value: `\`${orderId}\``,
                      inline: true,
                    },
                    {
                      name: "💰 Amount Settled",
                      value: `**₹${Number(amount).toLocaleString("en-IN")}**`,
                      inline: true,
                    },
                    {
                      name: "🏦 UTR / TX Hash",
                      value: `\`${utr}\``,
                      inline: true,
                    },
                    {
                      name: "⚡ Gateway Provider",
                      value: `\`${provider}\``,
                      inline: true,
                    },
                  ],
                  footer: {
                    text: "PayZapi Automated Webhook Settlement • 0% Hold",
                  },
                  timestamp: new Date().toISOString(),
                },
              ],
            }),
            signal: AbortSignal.timeout(6000),
          });
        } catch (discordErr) {
          console.error("[PayZapi Webhook] Failed to forward payment to Discord:", discordErr);
        }
      }
    }

    return NextResponse.json({ ok: true, received: true });
  } catch (error: any) {
    console.error("[PayZapi Webhook] Handler error:", error);
    return NextResponse.json(
      { ok: false, error: error.message || "Webhook processing error" },
      { status: 500 }
    );
  }
}
