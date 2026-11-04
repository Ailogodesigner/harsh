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

const DEFAULT_FOUNDER_ROLE_ID = "1566306403264762067";

function getDiscordFounderMention(): { mentionString: string; roleId?: string; userId?: string } {
  // If role ID is configured or default
  const roleId = process.env.DISCORD_FOUNDER_ROLE_ID?.trim() || DEFAULT_FOUNDER_ROLE_ID;
  if (roleId) {
    const rawId = roleId.replace(/[<@&>]/g, "");
    return { mentionString: `<@&${rawId}>`, roleId: rawId };
  }

  // If user ID is provided (personal user account ID)
  if (process.env.DISCORD_FOUNDER_USER_ID) {
    const rawId = process.env.DISCORD_FOUNDER_USER_ID.trim().replace(/[<@!>]/g, "");
    return { mentionString: `<@${rawId}>`, userId: rawId };
  }

  // If custom DISCORD_MENTION is provided
  if (process.env.DISCORD_MENTION) {
    const mention = process.env.DISCORD_MENTION.trim();
    if (/^\d{17,20}$/.test(mention)) {
      return { mentionString: `<@&${mention}>`, roleId: mention };
    }
    return { mentionString: mention };
  }

  // Default fallback
  return { mentionString: `<@&${DEFAULT_FOUNDER_ROLE_ID}>`, roleId: DEFAULT_FOUNDER_ROLE_ID };
}

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
      const { mentionString, roleId, userId } = getDiscordFounderMention();

      const allowedMentions: {
        parse: string[];
        roles?: string[];
        users?: string[];
      } = {
        parse: ["roles", "users", "everyone"],
      };

      if (roleId) {
        allowedMentions.roles = [roleId];
      }
      if (userId) {
        allowedMentions.users = [userId];
      }

      const discordPayload = {
        content: `${mentionString} 📬 **New Client Inquiry Received!**`,
        username: "NOTIXNODE Inquiries",
        avatar_url: "https://api.dicebear.com/7.x/bottts/png?seed=notixnode",
        allowed_mentions: allowedMentions,
        embeds: [
          {
            title: "📬 New Client Project Inquiry Received!",
            description: "A new inquiry was submitted via the website contact form.",
            color: 0x5865f2, // Discord Blurple
            fields: [
              {
                name: "👑 Notification",
                value: mentionString,
                inline: true,
              },
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
