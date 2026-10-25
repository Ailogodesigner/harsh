import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { cashfreeProvider } from "@/lib/cashfree";
import { executeDeliveryJob } from "@/lib/minecraft/delivery";
import { OrderStatus, PaymentStatus, ProcessingStatus } from "@prisma/client";

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-webhook-signature") || "";
    const timestamp = req.headers.get("x-webhook-timestamp") || "";

    // In testing or development without keys, we check signature validity
    const isValidSignature = cashfreeProvider.verifyWebhookSignature(
      rawBody,
      signature,
      timestamp
    );

    // If Cashfree is configured in production and signature is invalid, reject
    const gatewayStatus = cashfreeProvider.getStatus();
    if (gatewayStatus.isConfigured && !isValidSignature) {
      console.warn("Invalid Cashfree webhook signature received!");
      return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
    }

    let event: any;
    try {
      event = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ error: "Malformed JSON payload" }, { status: 400 });
    }

    // Extract Cashfree event data
    const eventType = event.type || "PAYMENT_WEBHOOK";
    const eventData = event.data || {};
    const orderData = eventData.order || {};
    const paymentData = eventData.payment || {};

    const orderId = String(orderData.order_id || event.order_id || "");
    const paymentId = String(paymentData.cf_payment_id || event.cf_payment_id || "");
    const paymentStatusRaw = String(paymentData.payment_status || event.payment_status || "").toUpperCase();
    const orderAmountMajor = Number(orderData.order_amount || paymentData.payment_amount || 0);

    // Deduplication Key
    const deduplicationKey = paymentId ? `CF-PAY-${paymentId}` : `CF-EVT-${orderId}-${timestamp}`;

    // Check if event was already processed
    const existingEvent = await prisma.webhookEvent.findUnique({
      where: { providerEventId: deduplicationKey },
    });

    if (existingEvent && existingEvent.processingStatus === ProcessingStatus.PROCESSED) {
      return NextResponse.json({ message: "Duplicate event skipped idempotently" }, { status: 200 });
    }

    // Record webhook event in DB
    const recordedEvent = await prisma.webhookEvent.upsert({
      where: { providerEventId: deduplicationKey },
      update: {
        payload: rawBody,
        signature,
        receivedAt: new Date(),
      },
      create: {
        providerEventId: deduplicationKey,
        eventType,
        payload: rawBody,
        signature,
        processingStatus: ProcessingStatus.PENDING,
      },
    });

    // Lookup matching order in DB
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
        user: true,
      },
    });

    if (!order) {
      await prisma.webhookEvent.update({
        where: { id: recordedEvent.id },
        data: {
          processingStatus: ProcessingStatus.FAILED,
          errorMessage: `Order ${orderId} not found in database`,
        },
      });
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Verify Amount (convert minor units to major for comparison)
    const expectedMajorAmount = order.totalAmount / 100;
    if (orderAmountMajor > 0 && Math.abs(orderAmountMajor - expectedMajorAmount) > 0.01) {
      const err = `Payment amount mismatch: expected ${expectedMajorAmount}, got ${orderAmountMajor}`;
      await prisma.webhookEvent.update({
        where: { id: recordedEvent.id },
        data: { processingStatus: ProcessingStatus.FAILED, errorMessage: err },
      });
      return NextResponse.json({ error: err }, { status: 400 });
    }

    // Map Cashfree payment status
    let mappedPaymentStatus: PaymentStatus = PaymentStatus.PENDING;
    if (paymentStatusRaw === "SUCCESS") {
      mappedPaymentStatus = PaymentStatus.SUCCESS;
    } else if (paymentStatusRaw === "FAILED") {
      mappedPaymentStatus = PaymentStatus.FAILED;
    } else if (paymentStatusRaw === "USER_DROPPED") {
      mappedPaymentStatus = PaymentStatus.USER_DROPPED;
    } else if (paymentStatusRaw === "CANCELLED") {
      mappedPaymentStatus = PaymentStatus.CANCELLED;
    }

    // Update Payment record
    await prisma.payment.create({
      data: {
        orderId: order.id,
        provider: "CASHFREE",
        providerOrderId: String(orderData.cf_order_id || ""),
        providerPaymentReference: paymentId,
        amount: order.totalAmount,
        currency: order.currency,
        status: mappedPaymentStatus,
        verifiedAt: mappedPaymentStatus === PaymentStatus.SUCCESS ? new Date() : null,
        rawResponse: rawBody,
      },
    });

    // If Payment was successful and order was pending, complete the order
    if (mappedPaymentStatus === PaymentStatus.SUCCESS && order.status !== OrderStatus.PAID) {
      await prisma.$transaction(async (tx) => {
        // 1. Transition Order to PAID
        await tx.order.update({
          where: { id: order.id },
          data: { status: OrderStatus.PAID },
        });

        // 2. Create Entitlements and DeliveryJobs for each order item
        for (const item of order.items) {
          const targetUsername = item.targetMinecraftUsername;

          // Find linked minecraft account if exists
          const mcAccount = await tx.minecraftAccount.findFirst({
            where: {
              username: { equals: targetUsername, mode: "insensitive" },
              userId: order.userId,
            },
          });

          const entitlement = await tx.entitlement.create({
            data: {
              userId: order.userId,
              minecraftAccountId: mcAccount?.id || null,
              orderId: order.id,
              productId: item.productId,
              productName: item.productName,
              status: "PENDING_DELIVERY",
            },
          });

          // Create DeliveryJob with unique idempotency key
          const deliveryJob = await tx.deliveryJob.create({
            data: {
              entitlementId: entitlement.id,
              uniqueDeliveryKey: `DELIV-${order.id}-${item.id}`,
              status: "QUEUED",
            },
          });

          // Trigger execution in background
          setTimeout(() => {
            executeDeliveryJob(deliveryJob.id).catch((err) =>
              console.error(`Async delivery execution error for job ${deliveryJob.id}:`, err)
            );
          }, 100);
        }
      });
    } else if (mappedPaymentStatus === PaymentStatus.FAILED) {
      await prisma.order.update({
        where: { id: order.id },
        data: { status: OrderStatus.FAILED },
      });
    }

    // Mark webhook event as processed
    await prisma.webhookEvent.update({
      where: { id: recordedEvent.id },
      data: {
        processingStatus: ProcessingStatus.PROCESSED,
        processedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, orderStatus: order.status });
  } catch (error: any) {
    console.error("Cashfree webhook processing error:", error);
    return NextResponse.json({ error: "Webhook processing failure" }, { status: 500 });
  }
}
