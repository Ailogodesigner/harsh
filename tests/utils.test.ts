import { describe, it, expect } from "vitest";
import { formatCurrency, generateInternalOrderId, generateVerificationCode } from "@/lib/utils";

describe("Utility Functions", () => {
  it("formats integer minor currency units correctly in INR without floating-point artifacts", () => {
    // 49900 paise = ₹499
    const formatted = formatCurrency(49900, "INR");
    expect(formatted).toContain("499");

    // 199950 paise = ₹1,999.50
    const decimalFormatted = formatCurrency(199950, "INR");
    expect(decimalFormatted).toContain("1,999.5");
  });

  it("generates correctly formatted internal order IDs with HU-ORD prefix", () => {
    const orderId = generateInternalOrderId();
    expect(orderId).toMatch(/^HU-ORD-\d{8}-[A-Z0-9]+$/);
  });

  it("generates valid in-game verification codes with HU- prefix", () => {
    const code = generateVerificationCode();
    expect(code).toMatch(/^HU-\d{5}$/);
  });
});
