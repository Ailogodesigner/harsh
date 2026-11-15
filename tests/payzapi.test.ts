import { describe, it, expect } from "vitest";
import { verifyPayZapiSignature } from "../src/lib/payzapi";
import crypto from "node:crypto";

describe("PayZapi Gateway Service", () => {
  it("correctly verifies valid HMAC-SHA256 signature", () => {
    const secret = "whsec_test_secret_123456";
    const rawBody = JSON.stringify({
      event: "payment.completed",
      data: {
        order_id: "ord_1024",
        amount: 250,
        utr: "412389102938",
      },
    });

    const validSignature = crypto
      .createHmac("sha256", secret)
      .update(rawBody)
      .digest("hex");

    expect(verifyPayZapiSignature(rawBody, validSignature, secret)).toBe(true);
  });

  it("rejects tampered body or invalid signature", () => {
    const secret = "whsec_test_secret_123456";
    const rawBody = JSON.stringify({ order_id: "ord_1024", amount: 250 });
    const forgedSignature = "0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef";

    expect(verifyPayZapiSignature(rawBody, forgedSignature, secret)).toBe(false);
    expect(verifyPayZapiSignature(rawBody, null, secret)).toBe(false);
  });
});
