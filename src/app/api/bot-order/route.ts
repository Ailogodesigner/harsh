import { NextResponse } from "next/server";
import { z } from "zod";

const DEFAULT_ORDERS_WEBHOOK =
  "https://discord.com/api/webhooks/1567450561874497588/ax42SS0-HJJr_xDhMvPlK1emMqevib_Mu-82ijaY2hwHt9XcAFhGCl0vilJTqre1WTqb";

const DEFAULT_FOUNDER_ROLE_ID = "1566306403264762067";

const botOrderSchema = z.object({
  clientName: z.string().min(2, "Name must be at least 2 characters").max(80),
  discordTag: z.string().min(2, "Please provide your Discord username or tag").max(60),
  email: z.string().email("Valid email address required"),
  botName: z.string().min(2, "Bot name must be at least 2 characters").max(80),
  botConcept: z.string().min(10, "Please describe the bot's purpose in at least 10 characters").max(4000),
  selectedFeatures: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      category: z.string().optional(),
      price: z.number().optional(),
    })
  ).min(1, "Please select at least one feature module for your bot"),
  totalEstimatedPrice: z.number().min(100),
  advancePaymentRequired: z.number().min(50),
  timeline: z.string().default("3-5 Days"),
  additionalNotes: z.string().max(2000).optional(),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = botOrderSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message || "Invalid bot order submission" },
        { status: 400 }
      );
    }

    const data = result.data;
    const orderId = `NN-BOT-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    // Format selected features summary for Discord
    const featureNames = data.selectedFeatures.map((f) => `• **${f.name}**${f.category ? ` (${f.category})` : ""}`).join("\n");
    const featureSummary = featureNames.length > 1000 ? featureNames.substring(0, 995) + "\n...and more" : featureNames;

    // Resolve Founder Mention
    const roleId = process.env.DISCORD_FOUNDER_ROLE_ID?.trim() || DEFAULT_FOUNDER_ROLE_ID;
    const mentionString = `<@&${roleId.replace(/[<@&>]/g, "")}>`;

    const webhookUrl = process.env.DISCORD_ORDERS_WEBHOOK_URL || DEFAULT_ORDERS_WEBHOOK;

    if (webhookUrl) {
      const discordPayload = {
        content: `${mentionString} 🤖 **NEW CUSTOM BOT ORDER RECEIVED!** [Order \`${orderId}\`]`,
        username: "NOTIXNODE Bot Orders",
        avatar_url: "https://cdn.discordapp.com/emojis/1516074375491878943.webp?size=64&quality=lossless",
        allowed_mentions: {
          parse: ["roles", "users", "everyone"],
          roles: [roleId.replace(/[<@&>]/g, "")],
        },
        embeds: [
          {
            title: `🛠️ New Custom Bot Order: ${data.botName}`,
            description: `**Order ID:** \`${orderId}\`\nA client has configured and submitted a custom Discord bot development order.`,
            color: 0xa3e635, // Cyber Lime Green
            fields: [
              {
                name: "👑 Notification",
                value: mentionString,
                inline: true,
              },
              {
                name: "👤 Client Name",
                value: `**${data.clientName}**`,
                inline: true,
              },
              {
                name: "💬 Discord Tag / Handle",
                value: `**${data.discordTag}**`,
                inline: true,
              },
              {
                name: "📧 Client Email",
                value: `[${data.email}](mailto:${data.email})`,
                inline: true,
              },
              {
                name: "💰 Total Estimated Budget",
                value: `**₹${data.totalEstimatedPrice.toLocaleString("en-IN")}**`,
                inline: true,
              },
              {
                name: "💳 50% Advance Milestone",
                value: `**₹${data.advancePaymentRequired.toLocaleString("en-IN")}** *(Due Before Dev Start)*`,
                inline: true,
              },
              {
                name: "⏱️ Target Delivery Timeline",
                value: `**${data.timeline}**`,
                inline: true,
              },
              {
                name: `🧩 Selected Modules (${data.selectedFeatures.length})`,
                value: featureSummary,
                inline: false,
              },
              {
                name: "📝 Bot Concept & Functional Details",
                value: data.botConcept.length > 1000 ? data.botConcept.substring(0, 995) + "..." : data.botConcept,
                inline: false,
              },
              ...(data.additionalNotes
                ? [
                    {
                      name: "📌 Additional Notes & Custom Software",
                      value: data.additionalNotes,
                      inline: false,
                    },
                  ]
                : []),
            ],
            footer: {
              text: `NOTIXNODE Bot Studio • Order ID: ${orderId} • dsc.gg/notixnode`,
            },
            timestamp: new Date().toISOString(),
          },
        ],
      };

      try {
        const discordRes = await fetch(webhookUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(discordPayload),
          signal: AbortSignal.timeout(6000),
        });

        if (!discordRes.ok) {
          const errText = await discordRes.text();
          console.error("Discord bot-order webhook error:", discordRes.status, errText);
        } else {
          console.log(`✓ Bot order ${orderId} dispatched to Discord successfully!`);
        }
      } catch (webhookErr) {
        console.error("Failed to post bot-order to Discord webhook:", webhookErr);
      }
    }

    return NextResponse.json({
      success: true,
      orderId,
      message: `Your bot development order #${orderId} has been submitted! Our team will review your specifications and contact your Discord (${data.discordTag}) shortly.`,
      advanceDeposit: data.advancePaymentRequired,
      totalPrice: data.totalEstimatedPrice,
    });
  } catch (error: any) {
    console.error("Bot Order API error:", error);
    return NextResponse.json(
      { error: "Failed to submit bot order. Please contact us directly on Discord at dsc.gg/notixnode" },
      { status: 500 }
    );
  }
}
