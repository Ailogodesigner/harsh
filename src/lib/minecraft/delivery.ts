import prisma from "@/lib/prisma";
import { pterodactylClient } from "./pterodactyl";
import { DeliveryStatus, EntitlementStatus } from "@prisma/client";

export interface DeliveryExecutionResult {
  success: boolean;
  provider: "BRIDGE" | "PTERODACTYL" | "MANUAL_QUEUE";
  acknowledgement?: string;
  error?: string;
}

/**
 * Executes a queued rank delivery job idempotently.
 */
export async function executeDeliveryJob(deliveryJobId: string): Promise<DeliveryExecutionResult> {
  const job = await prisma.deliveryJob.findUnique({
    where: { id: deliveryJobId },
    include: {
      entitlement: {
        include: {
          minecraftAccount: true,
          order: {
            include: {
              items: true,
            },
          },
        },
      },
    },
  });

  if (!job) {
    throw new Error(`DeliveryJob ${deliveryJobId} not found`);
  }

  if (job.status === DeliveryStatus.DELIVERED) {
    return {
      success: true,
      provider: "MANUAL_QUEUE",
      acknowledgement: "Already delivered (idempotent skip)",
    };
  }

  // Find corresponding product for deliveryConfig
  const product = await prisma.product.findUnique({
    where: { id: job.entitlement.productId },
  });

  if (!product) {
    const errorMsg = `Product ${job.entitlement.productId} missing in database`;
    await prisma.deliveryJob.update({
      where: { id: job.id },
      data: {
        status: DeliveryStatus.FAILED,
        lastError: errorMsg,
        attemptCount: { increment: 1 },
      },
    });
    return { success: false, provider: "MANUAL_QUEUE", error: errorMsg };
  }

  // Parse delivery commands template
  let commands: string[] = [];
  try {
    const config = JSON.parse(product.deliveryConfig || "{}");
    if (Array.isArray(config.commands)) {
      commands = config.commands;
    } else if (typeof config.command === "string") {
      commands = [config.command];
    }
  } catch {
    commands = [];
  }

  // Fallback default LuckPerms command if template is empty
  if (commands.length === 0) {
    if (product.category === "RANK") {
      commands = [`lp user {username} parent add ${product.slug}`];
    } else {
      commands = [`eco give {username} 1000`];
    }
  }

  // Target player info
  const targetUsername =
    job.entitlement.minecraftAccount?.username ||
    job.entitlement.order?.items[0]?.targetMinecraftUsername ||
    "Player";
  const targetUuid = job.entitlement.minecraftAccount?.minecraftUuid || "";

  // Replace placeholders safely
  const renderedCommands = commands.map((cmd) =>
    cmd
      .replace(/{username}/gi, targetUsername)
      .replace(/{player}/gi, targetUsername)
      .replace(/{uuid}/gi, targetUuid)
      .replace(/{rank}/gi, product.slug)
      .replace(/^\/+/, "") // strip leading slashes
  );

  const bridgeUrl = process.env.MINECRAFT_DELIVERY_BRIDGE_URL;
  const bridgeSecret = process.env.MINECRAFT_DELIVERY_BRIDGE_SECRET;
  const pteroStatus = pterodactylClient.getStatus();

  // Attempt 1: In-game server command bridge
  if (bridgeUrl && bridgeSecret) {
    try {
      const res = await fetch(bridgeUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${bridgeSecret}`,
          "X-Delivery-Key": job.uniqueDeliveryKey,
        },
        body: JSON.stringify({
          deliveryKey: job.uniqueDeliveryKey,
          targetUsername,
          targetUuid,
          commands: renderedCommands,
        }),
      });

      if (res.ok) {
        const ack = await res.text();
        await markJobDelivered(job.id, job.entitlement.id, `Bridge ack: ${ack}`);
        return { success: true, provider: "BRIDGE", acknowledgement: ack };
      }
    } catch (err: any) {
      console.warn(`Bridge delivery attempt failed for job ${job.id}:`, err?.message);
    }
  }

  // Attempt 2: Pterodactyl API console command dispatch
  if (pteroStatus.isConfigured) {
    try {
      const acks: string[] = [];
      for (const cmd of renderedCommands) {
        const result = await pterodactylClient.sendCommand(cmd);
        acks.push(`${cmd} -> ${result.responseText}`);
      }
      const combinedAck = JSON.stringify(acks);
      await markJobDelivered(job.id, job.entitlement.id, combinedAck);
      return { success: true, provider: "PTERODACTYL", acknowledgement: combinedAck };
    } catch (err: any) {
      console.warn(`Pterodactyl delivery failed for job ${job.id}:`, err?.message);
      await markJobAttempt(job.id, err?.message || "Pterodactyl dispatch error");
    }
  }

  // Fallback: If neither live bridge is active, mark for Manual Review
  const pendingReason =
    "Automatic server delivery bridge / Pterodactyl credentials not configured. Job safely stored in manual fulfilment queue.";

  await prisma.deliveryJob.update({
    where: { id: job.id },
    data: {
      status: DeliveryStatus.MANUAL_REVIEW,
      lastError: pendingReason,
      attemptCount: { increment: 1 },
    },
  });

  return {
    success: false,
    provider: "MANUAL_QUEUE",
    error: pendingReason,
  };
}

async function markJobDelivered(jobId: string, entitlementId: string, acknowledgement: string) {
  const now = new Date();
  await prisma.$transaction([
    prisma.deliveryJob.update({
      where: { id: jobId },
      data: {
        status: DeliveryStatus.DELIVERED,
        deliveryAcknowledgement: acknowledgement,
        deliveredAt: now,
      },
    }),
    prisma.entitlement.update({
      where: { id: entitlementId },
      data: {
        status: EntitlementStatus.ACTIVE,
      },
    }),
  ]);
}

async function markJobAttempt(jobId: string, error: string) {
  const current = await prisma.deliveryJob.findUnique({ where: { id: jobId } });
  const attempts = (current?.attemptCount || 0) + 1;
  const maxAttempts = current?.maxAttempts || 5;

  await prisma.deliveryJob.update({
    where: { id: jobId },
    data: {
      attemptCount: attempts,
      lastError: error,
      status: attempts >= maxAttempts ? DeliveryStatus.FAILED : DeliveryStatus.QUEUED,
    },
  });
}
