import { describe, it, expect } from "vitest";
import { hashPassword, verifyPassword, createSessionToken, verifySessionToken } from "@/lib/auth";

describe("Authentication & Session Security", () => {
  it("securely hashes passwords and verifies valid password correctly", async () => {
    const raw = "SuperSecretPassword123!";
    const hash = await hashPassword(raw);

    expect(hash).not.toBe(raw);
    expect(hash.startsWith("$2")).toBe(true);

    const isMatch = await verifyPassword(raw, hash);
    expect(isMatch).toBe(true);

    const isWrongMatch = await verifyPassword("WrongPassword!", hash);
    expect(isWrongMatch).toBe(false);
  });

  it("creates and verifies signed JWT session tokens", async () => {
    const userPayload = {
      id: "user-12345",
      name: "HarshAdmin",
      email: "admin@harshunlimited.fun",
      role: "SUPERADMIN" as const,
    };

    const token = await createSessionToken(userPayload);
    expect(token).toBeDefined();
    expect(token.split(".").length).toBe(3);

    const decoded = await verifySessionToken(token);
    expect(decoded).not.toBeNull();
    expect(decoded?.id).toBe("user-12345");
    expect(decoded?.email).toBe("admin@harshunlimited.fun");
    expect(decoded?.role).toBe("SUPERADMIN");
  });

  it("rejects tampered JWT session tokens", async () => {
    const userPayload = {
      id: "user-123",
      name: "Player",
      email: "player@domain.com",
      role: "USER" as const,
    };

    const token = await createSessionToken(userPayload);
    const tampered = token.slice(0, -6) + "abcdef";

    const decoded = await verifySessionToken(tampered);
    expect(decoded).toBeNull();
  });
});
