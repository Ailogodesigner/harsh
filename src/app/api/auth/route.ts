import { NextResponse } from "next/server";
import { z } from "zod";

const DEFAULT_ORDERS_WEBHOOK =
  "https://discord.com/api/webhooks/1567450561874497588/ax42SS0-HJJr_xDhMvPlK1emMqevib_Mu-82ijaY2hwHt9XcAFhGCl0vilJTqre1WTqb";

const DEFAULT_ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "notixnode_admin";

const authSchema = z.object({
  action: z.enum(["login", "register", "admin_login"]),
  username: z.string().min(2).max(50).optional(),
  discordTag: z.string().min(2).max(60).optional(),
  email: z.string().email().optional(),
  password: z.string().min(4, "Password must be at least 4 characters").max(100),
});

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const result = authSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message || "Invalid authentication request" },
        { status: 400 }
      );
    }

    const { action, username, discordTag, email, password } = result.data;
    const webhookUrl = process.env.DISCORD_ORDERS_WEBHOOK_URL || DEFAULT_ORDERS_WEBHOOK;

    // Handle Admin Login
    if (action === "admin_login") {
      const isValidAdmin = password === DEFAULT_ADMIN_PASSWORD;
      if (!isValidAdmin) {
        return NextResponse.json({ error: "Invalid admin authorization password" }, { status: 401 });
      }

      return NextResponse.json({
        success: true,
        role: "admin",
        token: "admin_session_" + Buffer.from(Date.now().toString()).toString("base64"),
        message: "Welcome to NOTIXNODE Administrator Command Deck!",
      });
    }

    // Handle Client Registration
    if (action === "register") {
      const clientId = `NN-CLI-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

      // Notify Discord Registration Channel
      if (webhookUrl) {
        const discordPayload = {
          username: "NOTIXNODE Auth System",
          avatar_url: "https://cdn.discordapp.com/emojis/1532373363257774190.gif?size=64&quality=lossless",
          embeds: [
            {
              title: "👤 New Client Registered",
              description: `A new client has created an account on the NOTIXNODE platform.`,
              color: 0x5865f2,
              fields: [
                {
                  name: "🆔 Client ID",
                  value: `\`${clientId}\``,
                  inline: true,
                },
                {
                  name: "💬 Discord Tag",
                  value: `**${discordTag || username || "Not specified"}**`,
                  inline: true,
                },
                {
                  name: "📧 Email",
                  value: email ? `[${email}](mailto:${email})` : "N/A",
                  inline: true,
                },
                {
                  name: "🛡️ Account Status",
                  value: "✅ Verified Client (Active)",
                  inline: true,
                },
              ],
              footer: {
                text: "NOTIXNODE Security • Registration Audit",
              },
              timestamp: new Date().toISOString(),
            },
          ],
        };

        try {
          await fetch(webhookUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(discordPayload),
            signal: AbortSignal.timeout(5000),
          });
        } catch (e) {
          console.error("Auth webhook error:", e);
        }
      }

      return NextResponse.json({
        success: true,
        role: "client",
        clientId,
        username: username || discordTag,
        token: "cli_session_" + Buffer.from(clientId).toString("base64"),
        message: "Account created successfully! You can now configure and track your custom bots.",
      });
    }

    // Handle Client Login
    return NextResponse.json({
      success: true,
      role: "client",
      username: username || discordTag || email?.split("@")[0] || "Client",
      token: "cli_session_" + Buffer.from(Date.now().toString()).toString("base64"),
      message: "Logged in successfully!",
    });
  } catch (error: any) {
    console.error("Auth API error:", error);
    return NextResponse.json({ error: "Authentication system error" }, { status: 500 });
  }
}
