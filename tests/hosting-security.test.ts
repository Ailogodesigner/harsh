import { describe, it, expect } from "vitest";
import { PterodactylHostingService } from "../src/lib/hosting/pterodactylService";
import { maskEmail, maskIdentifier, scrubSensitiveUserData, verifyAdmin } from "../src/lib/adminAuth";
import { createSessionToken, SessionUser } from "../src/lib/auth";

describe("Phase 9: Hosting & Infrastructure Security Verification", () => {
  const service = new PterodactylHostingService();

  describe("1. Sensitive Data Masking & Secret Leakage Prevention", () => {
    it("masks player and admin emails properly to prevent PII exposure", () => {
      expect(maskEmail("admin@harshunlimited.fun")).toBe("a***n@harshunlimited.fun");
      expect(maskEmail("player123@gmail.com")).toBe("p******3@gmail.com");
      expect(maskEmail("ab@test.com")).toBe("a*@test.com");
      expect(maskEmail("")).toBe("");
      expect(maskEmail(null)).toBe("");
    });

    it("masks backend instance and server identifiers", () => {
      expect(maskIdentifier("srv_a1b2c3d4", 4)).toBe("srv_****");
      expect(maskIdentifier("srv_a1b2c3d4-b3c1-4d40-a9ab-0bfaec82b8f1", 4)).toBe("srv_****");
      expect(maskIdentifier("abc", 4)).toBe("***");
    });

    it("strips passwordHash and tokenVersion from user payloads", () => {
      const userObj = {
        id: "usr_123",
        name: "Test User",
        email: "testuser@domain.com",
        passwordHash: "$2a$12$eX4mpleH4shV4lu3N0tExpos3d",
        tokenVersion: 5,
        role: "ADMIN",
      };

      const sanitized = scrubSensitiveUserData(userObj);
      expect(sanitized).toBeDefined();
      expect(sanitized?.passwordHash).toBeUndefined();
      expect(sanitized?.tokenVersion).toBeUndefined();
      expect(sanitized?.email).toBe("t******r@domain.com");
      expect(sanitized?.id).toBe("usr_123");
    });
  });

  describe("2. Operation Policies & High-Impact Action Safeguards", () => {
    const adminUser = {
      id: "cmv_admin_1",
      email: "admin@harshunlimited.fun",
      name: "Admin User",
      role: "ADMIN" as const,
      tokenVersion: 1,
    };

    const superAdminUser = {
      id: "cmv_super_1",
      email: "super@harshunlimited.fun",
      name: "Super Admin",
      role: "SUPERADMIN" as const,
      tokenVersion: 1,
    };

    it("rejects unauthorized power signals", async () => {
      await expect(
        service.executePowerAction("nuke" as any, superAdminUser)
      ).rejects.toThrow(/Invalid power signal requested/);
    });

    it("rejects server 'stop' or 'kill' if actor is not SUPERADMIN", async () => {
      await expect(
        service.executePowerAction("stop", adminUser, "CONFIRM_SHUTDOWN")
      ).rejects.toThrow(/FORBIDDEN.*Superadmin authorization/);

      await expect(
        service.executePowerAction("kill", adminUser, "CONFIRM_SHUTDOWN")
      ).rejects.toThrow(/FORBIDDEN.*Superadmin authorization/);
    });

    it("rejects server 'stop' or 'kill' without explicit confirmation challenge", async () => {
      await expect(
        service.executePowerAction("stop", superAdminUser, "wrong_code")
      ).rejects.toThrow(/Confirmation required.*CONFIRM_SHUTDOWN/);

      await expect(
        service.executePowerAction("stop", superAdminUser, "")
      ).rejects.toThrow(/Confirmation required.*CONFIRM_SHUTDOWN/);
    });

    it("blocks destructive root console commands", async () => {
      const blockedCmds = [
        "stop",
        "minecraft:stop",
        "end",
        "shutdown",
        "rm -rf /",
        "sudo rm",
        "kill -9 1",
      ];

      for (const cmd of blockedCmds) {
        await expect(
          service.executeConsoleCommand(cmd, superAdminUser)
        ).rejects.toThrow(/restricted for server safety|Invalid command format/);
      }
    });

    it("rejects command injection with newlines or semicolons", async () => {
      await expect(
        service.executeConsoleCommand("say hi; stop", superAdminUser)
      ).rejects.toThrow(/Invalid command format/);

      await expect(
        service.executeConsoleCommand("say hi\nstop", superAdminUser)
      ).rejects.toThrow(/Invalid command format/);
    });
  });

  describe("3. Authentication Verification & Session Protection", () => {
    it("rejects verifyAdmin requests when no cookie or header is provided", async () => {
      const dummyReq = new Request("https://web.harshunlimited.fun/api/admin/hosting");
      const { user, error } = await verifyAdmin(dummyReq);

      expect(user).toBeNull();
      expect(error).not.toBeNull();
      expect(error?.status).toBe(401);
    });

    it("rejects verifyAdmin requests with non-admin roles", async () => {
      const playerUser: SessionUser = {
        id: "cmv_regular_player",
        email: "player@harshunlimited.fun",
        name: "Regular Player",
        role: "USER",
        tokenVersion: 0,
      };

      const token = await createSessionToken(playerUser);
      const reqWithPlayerToken = new Request("https://web.harshunlimited.fun/api/admin/hosting", {
        headers: { Cookie: `hu_session=${token}` },
      });

      const { user, error } = await verifyAdmin(reqWithPlayerToken);
      expect(user).toBeNull();
      expect(error).not.toBeNull();
      expect(error?.status).toBe(403);
    });
  });
});
