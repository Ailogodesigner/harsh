import { describe, it, expect, vi, beforeEach } from "vitest";
import { CashfreePaymentProvider } from "@/lib/cashfree";
import crypto from "crypto";

describe("Cashfree Payments Integration", () => {
  const secretKey = "test_cashfree_secret_key_mock_123456789";

  beforeEach(() => {
    process.env.CASHFREE_APP_ID = "test_app_id_123456";
    process.env.CASHFREE_SECRET_KEY = secretKey;
    process.env.CASHFREE_ENV = "SANDBOX";
  });

  it("verifies authentic Cashfree webhook signatures accurately using HMAC-SHA256", () => {
    const provider = new CashfreePaymentProvider();
    const rawBody = JSON.stringify({
      data: {
        order: { order_id: "HU-ORD-20261025-ABCD" },
        payment: { cf_payment_id: "998877", payment_status: "SUCCESS" },
      },
    });

    const timestamp = "1761400000";
    const signaturePayload = `${timestamp}${rawBody}`;
    const validSignature = crypto
      .createHmac("sha256", secretKey)
      .update(signaturePayload)
      .digest("base64");

    const isValid = provider.verifyWebhookSignature(rawBody, validSignature, timestamp);
    expect(isValid).toBe(true);
  });

  it("rejects forged or tampered webhook signatures", () => {
    const provider = new CashfreePaymentProvider();
    const rawBody = JSON.stringify({
      data: {
        order: { order_id: "HU-ORD-20261025-ABCD" },
        payment: { cf_payment_id: "998877", payment_status: "SUCCESS" },
      },
    });

    const timestamp = "1761400000";
    const invalidSignature = Buffer.from("invalid_signature_hash").toString("base64");

    const isValid = provider.verifyWebhookSignature(rawBody, invalidSignature, timestamp);
    expect(isValid).toBe(false);
  });

  it("identifies missing credentials and reports setup-required status safely", () => {
    process.env.CASHFREE_APP_ID = "";
    process.env.CASHFREE_SECRET_KEY = "";

    const provider = new CashfreePaymentProvider();
    const status = provider.getStatus();

    expect(status.isConfigured).toBe(false);
    expect(status.missingKeys).toContain("CASHFREE_APP_ID");
    expect(status.missingKeys).toContain("CASHFREE_SECRET_KEY");
  });
});
