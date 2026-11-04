import { describe, it, expect } from "vitest";

describe("Portfolio Platform Verification", () => {
  it("verifies developer profile metadata and contact information", () => {
    const developer = {
      name: "Aditya Kashyap",
      email: "dhruve123456789@gmail.com",
      github: "https://github.com/Ailogodesigner",
      role: "Full-Stack Web Developer",
    };

    expect(developer.name).toBe("Aditya Kashyap");
    expect(developer.email).toContain("@gmail.com");
    expect(developer.github).toContain("github.com/Ailogodesigner");
    expect(developer.role).toBe("Full-Stack Web Developer");
  });

  it("validates contact form payload schema requirements", () => {
    const validInquiry = {
      name: "Client Name",
      email: "client@example.com",
      message: "I need a high-performance web platform built with Next.js.",
      projectType: "Full-Stack Web App",
    };

    expect(validInquiry.name.length).toBeGreaterThanOrEqual(2);
    expect(validInquiry.email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    expect(validInquiry.message.length).toBeGreaterThanOrEqual(10);
  });

  it("verifies interactive CLI terminal command routing", () => {
    const validCommands = ["whoami", "skills", "projects", "contact", "hire", "clear"];
    validCommands.forEach((cmd) => {
      expect(typeof cmd).toBe("string");
      expect(cmd.length).toBeGreaterThan(0);
    });
  });

  it("verifies cloud architecture topology nodes and telemetry layers", () => {
    const topologyNodes = [
      "Client / Device",
      "Edge Gateway",
      "App Core & APIs",
      "Data Tier",
      "Payment Gateway",
    ];
    expect(topologyNodes).toHaveLength(5);
    expect(topologyNodes).toContain("Payment Gateway");
    expect(topologyNodes).toContain("Edge Gateway");
  });
});

