import { describe, it, expect } from "vitest";
import { formatCurrency, generateInquiryId, formatDate } from "@/lib/utils";

describe("Utility Functions", () => {
  it("formats integer minor currency units correctly in INR without floating-point artifacts", () => {
    // 49900 paise = ₹499
    const formatted = formatCurrency(49900, "INR");
    expect(formatted).toContain("499");

    // 199950 paise = ₹1,999.50
    const decimalFormatted = formatCurrency(199950, "INR");
    expect(decimalFormatted).toContain("1,999.5");
  });

  it("generates correctly formatted client inquiry IDs with INQ prefix", () => {
    const inquiryId = generateInquiryId();
    expect(inquiryId).toMatch(/^INQ-\d{8}-[A-Z0-9]+$/);
  });

  it("formats dates gracefully into readable format", () => {
    const formatted = formatDate(new Date("2026-11-04T00:00:00Z"));
    expect(formatted).toBeTruthy();
  });
});
