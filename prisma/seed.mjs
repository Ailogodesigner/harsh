import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting Harsh Unlimited database seed...");

  // 1. Seed Superadmin User
  const adminPasswordHash = await bcrypt.hash("Admin@HarshUnlimited2026!", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@harshunlimited.fun" },
    update: {
      role: "SUPERADMIN",
    },
    create: {
      name: "Harsh Admin",
      email: "admin@harshunlimited.fun",
      passwordHash: adminPasswordHash,
      role: "SUPERADMIN",
      emailVerified: new Date(),
    },
  });
  console.log("✅ Superadmin seeded:", admin.email);

  // 2. Seed Server Settings
  const defaultSettings = [
    { key: "JAVA_IP", value: "play.harshunlimited.fun" },
    { key: "BEDROCK_IP", value: "play.harshunlimited.fun" },
    { key: "BEDROCK_PORT", value: "25565" },
    { key: "DISCORD_URL", value: "https://discord.gg/harshunlimited" },
    { key: "STORE_NOTICE", value: "Summer Special: Use code HARSH for extra in-game perks!" },
  ];

  for (const s of defaultSettings) {
    await prisma.serverSetting.upsert({
      where: { key: s.key },
      update: { value: s.value },
      create: s,
    });
  }
  console.log("✅ Server settings seeded");

  // 3. Seed Game Modes
  const gameModes = [
    {
      title: "Lifesteal SMP",
      slug: "lifesteal",
      description: "Eliminate players to steal their hearts. Craft custom revive beacons and conquer the brutal open wilderness.",
      status: "ONLINE",
      version: "1.20 - 1.21.x",
      features: JSON.stringify([
        "Steal +1 Heart per player kill",
        "Craftable Revive Beacons",
        "Custom PvP Arenas & Warps",
        "Anti-Cheat & Anti-Combat Log",
      ]),
      sortOrder: 1,
    },
    {
      title: "Survival SMP",
      slug: "survival",
      description: "Rich enhanced survival with player economy, custom land claiming, quests, jobs, and auction house.",
      status: "ONLINE",
      version: "1.20 - 1.21.x",
      features: JSON.stringify([
        "Grief-prevention Land Claims",
        "Player Shops & Auction House",
        "Over 100+ Custom Enchantments",
        "Community Events & World Bosses",
      ]),
      sortOrder: 2,
    },
    {
      title: "BoxPvP",
      slug: "boxpvp",
      description: "Fast-paced grinding, tier upgrades, mining mines, and competitive daily tournament arenas.",
      status: "ONLINE",
      version: "1.20 - 1.21.x",
      features: JSON.stringify([
        "Multi-tier Mining Pits",
        "Instant Respawn PvP Zone",
        "Custom Armor Upgrades",
        "Daily Leaderboard Rewards",
      ]),
      sortOrder: 3,
    },
    {
      title: "Custom Skyblock",
      slug: "skyblock",
      description: "Build your floating empire with automated minions, custom dungeons, and island leaderboards.",
      status: "BETA",
      version: "1.20 - 1.21.x",
      features: JSON.stringify([
        "Custom Island Upgrades",
        "Resource Minions & Hoppers",
        "Co-op Island Team System",
        "Dungeon Raid Bosses",
      ]),
      sortOrder: 4,
    },
  ];

  for (const gm of gameModes) {
    await prisma.gameMode.upsert({
      where: { slug: gm.slug },
      update: gm,
      create: gm,
    });
  }
  console.log("✅ Game modes seeded");

  // 4. Seed Products (Ranks & Digital Items)
  const products = [
    {
      name: "VIP Rank",
      slug: "vip",
      description: "Essential status upgrade with lobby flight, chat formatting, and permanent coin multipliers.",
      category: "RANK",
      price: 19900, // ₹199.00
      currency: "INR",
      duration: "LIFETIME",
      featured: false,
      badgeColor: "emerald",
      sortOrder: 1,
      perks: JSON.stringify([
        "Permanent [VIP] chat and tab tag",
        "Fly in all hub lobbies (/fly)",
        "1.5x In-Game Coin Multiplier",
        "Access to /workbench and /anvil",
        "3 Player Auction House slots",
        "VIP Exclusive Kit (Weekly)",
      ]),
      deliveryConfig: JSON.stringify({
        commands: [
          "lp user {username} parent add vip",
          "broadcast &a{username} &7has purchased &aVIP Rank&7!",
        ],
      }),
    },
    {
      name: "MVP Rank",
      slug: "mvp",
      description: "The most popular player rank. Fly in Survival SMP, glowing names, and monthly crate keys.",
      category: "RANK",
      price: 49900, // ₹499.00
      currency: "INR",
      duration: "LIFETIME",
      featured: true,
      badgeColor: "cyan",
      sortOrder: 2,
      perks: JSON.stringify([
        "Permanent [MVP] aqua chat & tab tag",
        "All VIP perks included",
        "Fly in Survival SMP claims (/fly)",
        "2.5x In-Game Coin Multiplier",
        "Custom Glowing Color (/glow)",
        "6 Player Auction House slots",
        "3x Ancient Crate Keys monthly",
        "Priority Server Queue bypass",
      ]),
      deliveryConfig: JSON.stringify({
        commands: [
          "lp user {username} parent add mvp",
          "crate give {username} ancient 3",
          "broadcast &b{username} &7has ascended to &bMVP Rank&7!",
        ],
      }),
    },
    {
      name: "TITAN Rank",
      slug: "titan",
      description: "High-tier dominance with custom death effects, private voice channels, and massive kit access.",
      category: "RANK",
      price: 99900, // ₹999.00
      currency: "INR",
      duration: "LIFETIME",
      featured: false,
      badgeColor: "purple",
      sortOrder: 3,
      perks: JSON.stringify([
        "Permanent [TITAN] purple chat & tab tag",
        "All VIP & MVP perks included",
        "4x In-Game Coin Multiplier",
        "Custom Particle Trails (/trails)",
        "12 Player Auction House slots",
        "Private VIP Discord Voice Channel",
        "Titan God Kit (Bi-weekly)",
        "Instant Full Server join pass",
      ]),
      deliveryConfig: JSON.stringify({
        commands: [
          "lp user {username} parent add titan",
          "crate give {username} ancient 6",
          "broadcast &5{username} &7has acquired the almighty &5TITAN Rank&7!",
        ],
      }),
    },
    {
      name: "IMMORTAL Rank",
      slug: "immortal",
      description: "The pinnacle network rank. Ultimate prestige, direct developer perks, and unlimited flex.",
      category: "RANK",
      price: 199900, // ₹1,999.00
      currency: "INR",
      duration: "LIFETIME",
      featured: true,
      badgeColor: "gold",
      sortOrder: 4,
      perks: JSON.stringify([
        "Permanent [IMMORTAL] animated gold tag",
        "All lower rank perks included",
        "6x In-Game Coin Multiplier",
        "Custom Nickname colors (/nick)",
        "25 Auction House slots",
        "Immortal Armor & Weapon set",
        "10x Ancient Keys + 5x Mythic Keys",
        "Reserved server slot even during maintenance",
        "Exclusive Discord Immortal Role & Lounge",
      ]),
      deliveryConfig: JSON.stringify({
        commands: [
          "lp user {username} parent add immortal",
          "crate give {username} mythic 5",
          "broadcast &6★ {username} &7has claimed the ultimate &6IMMORTAL Rank&7! ★",
        ],
      }),
    },
    {
      name: "5x Ancient Crate Keys",
      slug: "crate-ancient-5",
      description: "Unlock rare cosmetics, custom enchant books, and high-tier equipment in spawn crate area.",
      category: "CRATE",
      price: 14900, // ₹149.00
      currency: "INR",
      duration: "ONE_TIME",
      featured: false,
      badgeColor: "emerald",
      sortOrder: 5,
      perks: JSON.stringify([
        "5 Keys for the Ancient Spawn Crate",
        "Guaranteed Epic or Legendary loot drop",
        "Chance to unlock rare particle effects",
      ]),
      deliveryConfig: JSON.stringify({
        commands: ["crate give {username} ancient 5"],
      }),
    },
    {
      name: "God Kit Bundle",
      slug: "kit-god",
      description: "Full Protection IV Netherite armor, Sharpness V sword, God Apples, and Totems.",
      category: "KIT",
      price: 29900, // ₹299.00
      currency: "INR",
      duration: "ONE_TIME",
      featured: false,
      badgeColor: "purple",
      sortOrder: 6,
      perks: JSON.stringify([
        "Full Netherite Armor (Protection IV, Unbreaking III)",
        "Netherite Sword (Sharpness V, Fire Aspect II)",
        "32x Enchanted Golden Apples",
        "4x Totems of Undying",
      ]),
      deliveryConfig: JSON.stringify({
        commands: ["kit give god {username}"],
      }),
    },
  ];

  for (const p of products) {
    await prisma.product.upsert({
      where: { slug: p.slug },
      update: p,
      create: p,
    });
  }
  console.log("✅ Products seeded");

  // 5. Seed Announcements
  const announcements = [
    {
      title: "Harsh Unlimited Season 4 Launch",
      content: "Welcome to Season 4! Explore new custom enchantments, revampled Lifesteal SMP, and brand new BoxPvP tiers.",
      tag: "UPDATE",
    },
    {
      title: "Weekend Store Discount - 20% Off",
      content: "Use coupon code HARSH at checkout for an instant 20% discount on all ranks this weekend.",
      tag: "SALE",
    },
  ];

  for (const a of announcements) {
    const existing = await prisma.serverAnnouncement.findFirst({ where: { title: a.title } });
    if (!existing) {
      await prisma.serverAnnouncement.create({ data: a });
    }
  }
  console.log("✅ Announcements seeded");

  console.log("🎉 Database seeding completed successfully!");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
