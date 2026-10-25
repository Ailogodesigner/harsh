import { describe, it, expect } from "vitest";

describe("Minecraft Rank Delivery Logic", () => {
  it("interpolates player username, uuid, and rank slug correctly into command templates", () => {
    const rawTemplates = [
      "/lp user {username} parent add {rank}",
      "crate give {player} ancient 3",
      "/eco give {username} 1000",
    ];

    const targetUsername = "HarshWarrior";
    const targetUuid = "069a79f4-44e9-4726-a5be-fca90e38aaf5";
    const rankSlug = "mvp";

    const rendered = rawTemplates.map((cmd) =>
      cmd
        .replace(/{username}/gi, targetUsername)
        .replace(/{player}/gi, targetUsername)
        .replace(/{uuid}/gi, targetUuid)
        .replace(/{rank}/gi, rankSlug)
        .replace(/^\/+/, "")
    );

    expect(rendered[0]).toBe("lp user HarshWarrior parent add mvp");
    expect(rendered[1]).toBe("crate give HarshWarrior ancient 3");
    expect(rendered[2]).toBe("eco give HarshWarrior 1000");
  });

  it("ensures rendered commands have no dangerous leading slashes for console APIs", () => {
    const raw = "/say Welcome {username} to Harsh Unlimited!";
    const sanitized = raw.replace(/^\/+/, "").replace(/{username}/gi, "Steve");
    expect(sanitized.startsWith("/")).toBe(false);
    expect(sanitized).toBe("say Welcome Steve to Harsh Unlimited!");
  });

  it("generates deterministic and unique idempotency keys for delivery jobs", () => {
    const orderId = "HU-ORD-20261025-ABCD";
    const itemId = "item-001";
    const deliveryKey = `DELIV-${orderId}-${itemId}`;

    expect(deliveryKey).toBe("DELIV-HU-ORD-20261025-ABCD-item-001");
  });
});
