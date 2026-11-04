import { NextResponse } from "next/server";
import { z } from "zod";

const contactSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(80),
  email: z.string().email("Please provide a valid email address"),
  projectType: z.string().optional(),
  budget: z.string().optional(),
  message: z.string().min(10, "Message must be at least 10 characters").max(3000),
});

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

    // Log the message securely to server console / audit
    console.log("=== NEW CONTACT INQUIRY RECEIVED ===");
    console.log(`From: ${name} (${email})`);
    console.log(`Type: ${projectType || "General Inquiry"} | Budget: ${budget || "Flexible"}`);
    console.log(`Message:\n${message}`);
    console.log("====================================");

    return NextResponse.json({
      success: true,
      message: "Thank you for reaching out! Your message has been sent successfully. I will get back to you within 24 hours.",
    });
  } catch (error: any) {
    console.error("Contact API error:", error);
    return NextResponse.json(
      { error: "Failed to dispatch message. Please email directly at dhruve123456789@gmail.com" },
      { status: 500 }
    );
  }
}

