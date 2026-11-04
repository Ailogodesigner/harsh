import { NextResponse } from "next/server";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(80),
  email: z.string().email("Please provide a valid email address"),
  projectType: z.string().optional(),
  budget: z.string().optional(),
  message: z.string().min(10, "Message must be at least 10 characters").max(3000),
});

const DEFAULT_DISCORD_WEBHOOK =
  "https://discord.com/api/webhooks/1567450558669914182/Nfa_NdwtT2NEnlKql_-KtsvJlDT3kPydph3grz-2Ai9vHw0WM0GnLsmzSy7Ho4VqWEV4";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = contactSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message || "Invalid contact form submission" },
        { status: 400 }
      );
    }

    const { name, email, projectType, budget, message } = result.data;

    // Log the message to server console / audit
    console.log("=== NEW CONTACT INQUIRY RECEIVED ===");
    console.log(`From: ${name} (${email})`);
    console.log(`Type: ${projectType || "General Inquiry"} | Budget: ${budget || "Flexible"}`);
    console.log(`Message:\n${message}`);
    console.log("====================================");

    // Dispatch to Discord Webhook
    const webhookUrl = process.env.DISCORD_WEBHOOK_URL || DEFAULT_DISCORD_WEBHOOK;
    if (webhookUrl) {
      const discordPayload = {
        username: "NOTIXNODE Inquiries",
        avatar_url: "https://api.dicebear.com/7.x/bottts/png?seed=notixnode",
        embeds: [
          {
            title: "📬 New Client Project Inquiry Received!",
            description: "A new inquiry was submitted via the website contact form.",
            color: 0x5865f2, // Discord Blurple
            fields: [
              {
                name: "👤 Client Name",
                value: `**${name}**`,
                inline: true,
              },
              {
                name: "📧 Email Address",
                value: `[${email}](mailto:${email})`,
                inline: true,
              },
              {
                name: "🛠️ Project Type",
                value: projectType || "Custom Project / Bot / Web",
                inline: true,
              },
              {
                name: "💰 Estimated Budget",
                value: budget || "Flexible / Discussion",
                inline: true,
              },
              {
                name: "💬 Project Requirements & Details",
                value: message.length > 1024 ? message.substring(0, 1021) + "..." : message,
                inline: false,
              },
            ],
            timestamp: new Date().toISOString(),
            footer: {
              text: "NOTIXNODE Studio • dsc.gg/notixnode",
            },
          },
        ],
      };

      try {
        const discordRes = await fetch(webhookUrl, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(discordPayload),
          signal: AbortSignal.timeout(6000),
        });

        if (!discordRes.ok) {
          const errText = await discordRes.text();
          console.error("Discord webhook dispatch non-200 response:", discordRes.status, errText);
        } else {
          console.log("✓ Discord inquiry webhook dispatched successfully!");
        }
      } catch (webhookErr) {
        console.error("Failed to post inquiry to Discord webhook:", webhookErr);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Thank you for reaching out! Your message has been sent to our Discord team. We will get back to you shortly!",
    });
  } catch (error: any) {
    console.error("Contact API error:", error);
    return NextResponse.json(
      { error: "Failed to dispatch message. Please join our Discord at dsc.gg/notixnode" },
      { status: 500 }
    );
  }
}
