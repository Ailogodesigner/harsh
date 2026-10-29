import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { cashfreeProvider } from "@/lib/cashfree";
import { generateInternalOrderId } from "@/lib/utils";
import { checkRateLimit } from "@/lib/rateLimit";
import { getClientIp, validateOrigin } from "@/lib/security";
import { z } from "zod";

const checkoutSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  targetUsername: z
    .string()
    .min(3, "Minecraft username must be at least 3 characters")
    .max(16, "Minecraft username cannot exceed 16 characters")
    .regex(/^[a-zA-Z0-9_]+$/, "Username can only contain letters, numbers, and underscores"),
  guestEmail: z.string().email().optional(),
  guestName: z.string().min(2).optional(),
});

export async function POST(req: Request) {
  try {
    const originCheck = validateOrigin(req);
    if (!originCheck.valid) {
      return NextResponse.json({ error: "Forbidden: Security policy violation" }, { status: 403 });
    }

    const ip = getClientIp(req);
    const rateCheck = checkRateLimit(`order_${ip}`, {
      maxRequests: 15,
      windowMs: 60 * 1000,
      lockoutMs: 5 * 60 * 1000,
    });
    if (!rateCheck.allowed) {
      return NextResponse.json({ error: rateCheck.error || "Too many checkout attempts. Please slow down." }, { status: 429 });
    }

    const body = await req.json();
    const parsed = checkoutSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
    }

    const { productId, targetUsername, guestEmail, guestName } = parsed.data;

    // Load product directly from DB to prevent client tampering
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product || !product.active) {
      return NextResponse.json({ error: "Product is not available for purchase" }, { status: 404 });
    }

    // Determine customer info
    const sessionUser = await getCurrentUser();
    let userId = sessionUser?.id;
    let customerEmail = sessionUser?.email || guestEmail;
    let customerName = sessionUser?.name || guestName || targetUsername;

    if (!userId) {
      if (!customerEmail) {
        return NextResponse.json(
          { error: "Please log in or provide an email for order confirmation" },
          { status: 400 }
        );
      }

      // Check if user exists or create guest user
      let user = await prisma.user.findUnique({ where: { email: customerEmail } });
      if (!user) {
        user = await prisma.user.create({
          data: {
            email: customerEmail,
            name: customerName,
            passwordHash: "", // Guest account, can claim password later
            role: "USER",
          },
        });
      }
      userId = user.id;
    }

    const internalOrderId = generateInternalOrderId();
    const orderAmountMajor = product.price / 100; // Minor to major units (paise to INR)

    // Check Cashfree gateway configuration
    const gatewayStatus = cashfreeProvider.getStatus();
    if (!gatewayStatus.isConfigured) {
      return NextResponse.json(
        {
          error: "Payment Gateway Setup Required",
          setupRequired: true,
          details: `The server administrator has not yet configured Cashfree credentials: ${gatewayStatus.missingKeys.join(
            ", "
          )}. In sandbox/production, add these keys to .env to accept real or test payments.`,
        },
        { status: 503 }
      );
    }

    // Create database Order & OrderItem inside transaction
    const appUrl = process.env.APP_URL || "http://localhost:3000";
    const order = await prisma.$transaction(async (tx) => {
      const createdOrder = await tx.order.create({
        data: {
          id: internalOrderId,
          userId: userId!,
          currency: product.currency,
          totalAmount: product.price,
          status: "PENDING",
          items: {
            create: {
              productId: product.id,
              productName: product.name,
              price: product.price,
              quantity: 1,
              targetMinecraftUsername: targetUsername,
              configuration: JSON.stringify({
                category: product.category,
                duration: product.duration,
                perks: product.perks,
              }),
            },
          },
        },
      });

      return createdOrder;
    });

    // Call Cashfree API
    try {
      const cfOrder = await cashfreeProvider.createOrder({
        orderId: order.id,
        orderAmount: orderAmountMajor,
        orderCurrency: product.currency,
        customerDetails: {
          customerId: userId!,
          customerEmail: customerEmail!,
          customerName,
        },
        orderMeta: {
          returnUrl: `${appUrl}/orders/${order.id}?status={order_status}&order_id={order_id}`,
          notifyUrl: `${appUrl}/api/webhooks/cashfree`,
        },
        orderNote: `Harsh Unlimited: ${product.name} for ${targetUsername}`,
      });

      // Record initial Payment entity
      await prisma.payment.create({
        data: {
          orderId: order.id,
          provider: "CASHFREE",
          providerOrderId: cfOrder.cfOrderId,
          amount: product.price,
          currency: product.currency,
          status: "PENDING",
        },
      });

      try {
        await prisma.auditLog.create({
          data: {
            actorId: userId || "guest",
            actorEmail: customerEmail || "guest",
            action: "CREATE_ORDER",
            targetEntity: "Order",
            targetId: order.id,
            metadata: JSON.stringify({
              productName: product.name,
              amount: product.price,
              targetMinecraftUsername: targetUsername,
            }),
          },
        });
      } catch (e) {
        console.warn("AuditLog error on create order:", e);
      }

      return NextResponse.json({
        success: true,
        orderId: order.id,
        paymentSessionId: cfOrder.paymentSessionId,
        paymentLink: cfOrder.paymentLink,
        environment: gatewayStatus.environment,
      });
    } catch (cfErr: any) {
      console.error("Cashfree order creation error:", cfErr);
      await prisma.order.update({
        where: { id: order.id },
        data: { status: "FAILED" },
      });

      return NextResponse.json(
        {
          error: `Payment provider error: ${cfErr.message || "Failed to initiate Cashfree order"}`,
        },
        { status: 502 }
      );
    }
  } catch (error: any) {
    console.error("Checkout error:", error);
    return NextResponse.json({ error: "Failed to process checkout" }, { status: 500 });
  }
}
