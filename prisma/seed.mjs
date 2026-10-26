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
      sortOrder: 1,
    },
    {
      title: "Lifesteal SMP",
      slug: "lifesteal",
      description: "Eliminate players to steal their hearts. Craft custom revive beacons and conquer the brutal open wilderness.",
      status: "COMING_SOON",
      version: "1.20 - 1.21.x",
      features: JSON.stringify([
        "Steal +1 Heart per player kill",
        "Craftable Revive Beacons",
        "Custom PvP Arenas & Warps",
        "Anti-Cheat & Anti-Combat Log",
      ]),
      sortOrder: 2,
    },
    {
      title: "BoxPvP",
      slug: "boxpvp",
      description: "Fast-paced grinding, tier upgrades, mining mines, and competitive daily tournament arenas.",
      status: "COMING_SOON",
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
      status: "COMING_SOON",
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

  // 4. Seed Products (Ranks & Digital Items matching LuckPerms groups)
  const products = [
    {
      name: "Supporter Rank",
      slug: "supporter",
      description: "Starter donor status with chat formatting, lobby flight, and daily perks.",
      category: "RANK",
      price: 9900, // ₹99.00
      currency: "INR",
      duration: "LIFETIME",
      featured: false,
      badgeColor: "emerald",
      sortOrder: 1,
      perks: JSON.stringify([
        "Permanent [Supporter] chat and tab tag",
        "Fly in all hub lobbies (/fly)",
        "1.5x In-Game Coin Multiplier",
        "Access to /workbench and /anvil",
        "Supporter Exclusive Kit (Weekly)",
      ]),
      deliveryConfig: JSON.stringify({
        commands: [
          "lp user {username} parent add supporter",
          "broadcast &a{username} &7has supported the network with &aSupporter Rank&7!",
        ],
      }),
    },
    {
      name: "MVP Rank",
      slug: "mvp",
      description: "The classic player rank. Fly in Survival SMP, glowing names, and bonus crate keys.",
      category: "RANK",
      price: 24900, // ₹249.00
      currency: "INR",
      duration: "LIFETIME",
      featured: false,
      badgeColor: "cyan",
      sortOrder: 2,
      perks: JSON.stringify([
        "Permanent [MVP] aqua chat & tab tag",
        "All Supporter perks included",
        "Fly in Survival SMP claims (/fly)",
        "2.0x In-Game Coin Multiplier",
        "Custom Glowing Color (/glow)",
        "Priority Server Queue bypass",
      ]),
      deliveryConfig: JSON.stringify({
        commands: [
          "lp user {username} parent add mvp",
          "broadcast &b{username} &7has ascended to &bMVP Rank&7!",
        ],
      }),
    },
    {
      name: "Elite Rank",
      slug: "elite",
      description: "Popular competitive rank with particle trails, extra auction slots, and special kits.",
      category: "RANK",
      price: 49900, // ₹499.00
      currency: "INR",
      duration: "LIFETIME",
      featured: true,
      badgeColor: "blue",
      sortOrder: 3,
      perks: JSON.stringify([
        "Permanent [Elite] royal blue chat & tab tag",
        "All lower rank perks included",
        "3.0x In-Game Coin Multiplier",
        "Custom Particle Trails (/trails)",
        "8 Player Auction House slots",
        "Elite War Kit (Bi-weekly)",
      ]),
      deliveryConfig: JSON.stringify({
        commands: [
          "lp user {username} parent add elite",
          "broadcast &9{username} &7has unlocked the formidable &9Elite Rank&7!",
        ],
      }),
    },
    {
      name: "Supreme Rank",
      slug: "supreme",
      description: "High-tier dominance with private voice channels, massive kit access, and custom death effects.",
      category: "RANK",
      price: 99900, // ₹999.00
      currency: "INR",
      duration: "LIFETIME",
      featured: false,
      badgeColor: "purple",
      sortOrder: 4,
      perks: JSON.stringify([
        "Permanent [Supreme] purple chat & tab tag",
        "All lower rank perks included",
        "4.5x In-Game Coin Multiplier",
        "Private VIP Discord Voice Channel",
        "15 Player Auction House slots",
        "Supreme God Kit (Weekly)",
        "Instant Full Server join pass",
      ]),
      deliveryConfig: JSON.stringify({
        commands: [
          "lp user {username} parent add supreme",
          "broadcast &5{username} &7has attained the almighty &5Supreme Rank&7!",
        ],
      }),
    },
    {
      name: "Overlord Rank",
      slug: "overlord",
      description: "The pinnacle network rank. Ultimate prestige, animated gold tag, and supreme power.",
      category: "RANK",
      price: 199900, // ₹1,999.00
      currency: "INR",
      duration: "LIFETIME",
      featured: true,
      badgeColor: "gold",
      sortOrder: 5,
      perks: JSON.stringify([
        "Permanent [Overlord] animated gold tag",
        "All lower rank perks included",
        "6x In-Game Coin Multiplier",
        "Custom Nickname colors (/nick)",
        "30 Auction House slots",
        "Overlord Netherite God Gear set",
        "Reserved server slot even during maintenance",
        "Exclusive Discord Overlord Role & Lounge",
      ]),
      deliveryConfig: JSON.stringify({
        commands: [
          "lp user {username} parent add overlord",
          "broadcast &6★ {username} &7has ascended as the supreme &6OVERLORD&7! ★",
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
    {
      name: "500 Server Coins (Pouch)",
      slug: "coins-500",
      description: "Starter coin pouch for in-game /coinshop tags, chat colors, and particle trails.",
      category: "COINS",
      price: 4900, // ₹49.00
      currency: "INR",
      duration: "ONE_TIME",
      featured: false,
      badgeColor: "emerald",
      sortOrder: 10,
      perks: JSON.stringify([
        "500 In-Game Server Coins",
        "Spend immediately via /coinshop in-game",
        "Unlock custom chat colors & basic cosmetics",
        "Permanent on your linked player account",
      ]),
      deliveryConfig: JSON.stringify({
        commands: [
          "p give {username} 500",
          "broadcast &e[Store] &a{username} &7has purchased &e500 Coins&7!",
        ],
      }),
    },
    {
      name: "1,200 Server Coins (Sack)",
      slug: "coins-1200",
      description: "Popular bundle with +20% bonus coins. Spend in /coinshop for crate keys and custom player tags.",
      category: "COINS",
      price: 9900, // ₹99.00
      currency: "INR",
      duration: "ONE_TIME",
      featured: false,
      badgeColor: "cyan",
      sortOrder: 11,
      perks: JSON.stringify([
        "1,200 In-Game Server Coins (+20% Bonus)",
        "Unlock premium /coinshop tags & glow colors",
        "Redeemable for Rare Crate Keys in-game",
        "Permanent currency addition",
      ]),
      deliveryConfig: JSON.stringify({
        commands: [
          "p give {username} 1200",
          "broadcast &e[Store] &a{username} &7has purchased &e1,200 Coins&7!",
        ],
      }),
    },
    {
      name: "3,000 Server Coins (Chest)",
      slug: "coins-3000",
      description: "Heavy coin stack with +25% bonus coins. Unlock rare tags, particle auras, and crate keys.",
      category: "COINS",
      price: 24900, // ₹249.00
      currency: "INR",
      duration: "ONE_TIME",
      featured: false,
      badgeColor: "purple",
      sortOrder: 12,
      perks: JSON.stringify([
        "3,000 In-Game Server Coins (+25% Bonus)",
        "Massive purchasing power in /coinshop",
        "Unlock exclusive emotes, skins, and crate keys",
        "Instantly delivered to your character",
      ]),
      deliveryConfig: JSON.stringify({
        commands: [
          "p give {username} 3000",
          "broadcast &e[Store] &a{username} &7has purchased &e3,000 Coins&7!",
        ],
      }),
    },
    {
      name: "7,500 Server Coins (Vault)",
      slug: "coins-7500",
      description: "Best Value bundle with +50% bonus coins! Max out your cosmetics and /coinshop unlocking.",
      category: "COINS",
      price: 49900, // ₹499.00
      currency: "INR",
      duration: "ONE_TIME",
      featured: true,
      badgeColor: "gold",
      sortOrder: 13,
      perks: JSON.stringify([
        "7,500 In-Game Server Coins (+50% Bonus!)",
        "Best value coin bundle on the network",
        "Unlock high-tier /coinshop tags, emotes & crates",
        "Exclusive Gold Coin Purchaser Discord badge",
      ]),
      deliveryConfig: JSON.stringify({
        commands: [
          "p give {username} 7500",
          "broadcast &6★ [Store] &e{username} &7has unlocked the &67,500 Coins Vault&7! ★",
        ],
      }),
    },
    {
      name: "16,000 Server Coins (Dragon's Hoard)",
      slug: "coins-16000",
      description: "The ultimate coin hoard with +60% bonus coins. Unlock the entire /coinshop catalog effortlessly.",
      category: "COINS",
      price: 99900, // ₹999.00
      currency: "INR",
      duration: "ONE_TIME",
      featured: false,
      badgeColor: "purple",
      sortOrder: 14,
      perks: JSON.stringify([
        "16,000 In-Game Server Coins (+60% Bonus!)",
        "Supreme coin purchasing power in /coinshop",
        "Unlock every chat color, custom tag, and key bundle",
        "Server-wide announcement upon purchase",
      ]),
      deliveryConfig: JSON.stringify({
        commands: [
          "p give {username} 16000",
          "broadcast &d★ [Store] &e{username} &7has acquired the legendary &d16,000 Dragon's Hoard&7! ★",
        ],
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
  console.log("✅ Products seeded (including Coin Shop packages)");

  // 5. Seed Announcements
  const announcements = [
    {
      title: "Harsh Unlimited Survival SMP Online & Season Drop",
      content: "Survival SMP is officially LIVE! Join at paid58.cavrixcloud.fun:25565 or play.harshunlimited.fun. Explore /coinshop and new rewards!",
      tag: "UPDATE",
    },
    {
      title: "Weekend Store Discount - 20% Off",
      content: "Use coupon code HARSH at checkout for an instant 20% discount on all ranks and coin bundles this weekend.",
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

  // 6. Seed Real Server Staff Members (matching LuckPerms)
  const staffMembers = [
    {
      name: "HarshUnlimited",
      displayName: "Harsh",
      role: "Network Director & Founder",
      tag: "OWNER",
      category: "LEADERSHIP",
      color: "rose",
      sortOrder: 1,
    },
    {
      name: "UVTANDI",
      displayName: "UV Tandi",
      role: "Network Operations & Community Manager",
      tag: "MANAGER",
      category: "LEADERSHIP",
      color: "amber",
      sortOrder: 2,
    },
    {
      name: "akhilplayzyt",
      displayName: "Akhil",
      role: "Lead Systems Architect & Developer",
      tag: "LEAD DEV",
      category: "DEVELOPMENT",
      color: "cyan",
      sortOrder: 3,
    },
    {
      name: "kairo04_",
      displayName: "Kairo",
      role: "Server Administrator & Technical Ops",
      tag: "ADMIN",
      category: "MANAGEMENT",
      color: "purple",
      sortOrder: 4,
    },
    {
      name: "nxt_mohit",
      displayName: "Mohit",
      role: "Senior Survival SMP Moderator",
      tag: "MOD",
      category: "MODERATION",
      color: "emerald",
      sortOrder: 5,
    },
  ];

  for (const s of staffMembers) {
    const existing = await prisma.staffMember.findFirst({ where: { name: s.name } });
    if (existing) {
      await prisma.staffMember.update({
        where: { id: existing.id },
        data: s,
      });
    } else {
      await prisma.staffMember.create({ data: s });
    }
  }
  console.log("✅ Real Staff members seeded from server LuckPerms");

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
