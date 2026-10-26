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

  // 4. Seed Products (Real Server Ranks & 1 Coin = 1 Rs Coin Shop)
  const products = [
    {
      name: "VIP Rank",
      slug: "vip",
      description: "Starter premium rank with in-game gold prefix, /kit vip gear, and 2 homes.",
      category: "RANK",
      price: 9900, // ₹99
      currency: "INR",
      duration: "30_DAYS",
      featured: false,
      badgeColor: "gold",
      sortOrder: 1,
      perks: JSON.stringify([
        "Permanent [VIP] chat and tab tag",
        "Access to /kit vip (Gold armor & gear)",
        "Set up to 2 player homes (/sethome)",
        "Unlock VIP in-game rewards & perks",
      ]),
      deliveryConfig: JSON.stringify({
        commands: [
          "lp user {username} parent add vip",
          "broadcast &e[Store] &a{username} &7has unlocked &6[VIP] Rank&7!",
        ],
      }),
    },
    {
      name: "MVP Rank",
      slug: "mvp",
      description: "Popular mid-tier rank with aqua prefix, /kit mvp diamond gear, and 3 homes.",
      category: "RANK",
      price: 29900, // ₹299
      currency: "INR",
      duration: "30_DAYS",
      featured: true,
      badgeColor: "cyan",
      sortOrder: 2,
      perks: JSON.stringify([
        "Permanent [MVP] aqua chat and tab tag",
        "All VIP perks & benefits included",
        "Access to /kit mvp (Diamond tier gear)",
        "Set up to 3 player homes (/sethome)",
        "Priority queue bypass slot",
      ]),
      deliveryConfig: JSON.stringify({
        commands: [
          "lp user {username} parent add mvp",
          "broadcast &e[Store] &a{username} &7has ascended to &b[MVP] Rank&7!",
        ],
      }),
    },
    {
      name: "ELITE Rank",
      slug: "elite",
      description: "Competitive high rank with royal purple prefix, /kit elite, and 3 homes.",
      category: "RANK",
      price: 39900, // ₹399
      currency: "INR",
      duration: "30_DAYS",
      featured: false,
      badgeColor: "purple",
      sortOrder: 3,
      perks: JSON.stringify([
        "Permanent [ELITE] purple chat & tab tag",
        "All VIP & MVP perks included",
        "Access to /kit elite (Enchanted gear)",
        "Set up to 3 player homes (/sethome)",
        "Special cosmetics & particle trails",
      ]),
      deliveryConfig: JSON.stringify({
        commands: [
          "lp user {username} parent add elite",
          "broadcast &e[Store] &a{username} &7has unlocked &d[ELITE] Rank&7!",
        ],
      }),
    },
    {
      name: "SUPREME Rank",
      slug: "supreme",
      description: "High-tier dominance with gold prefix, /kit supreme netherite gear, and 4 homes.",
      category: "RANK",
      price: 49900, // ₹499
      currency: "INR",
      duration: "30_DAYS",
      featured: true,
      badgeColor: "gold",
      sortOrder: 4,
      perks: JSON.stringify([
        "Permanent [SUPREME] gold chat & tab tag",
        "All lower rank perks included",
        "Access to /kit supreme (Netherite tier gear)",
        "Set up to 4 player homes (/sethome)",
        "Private VIP Discord Voice Channel",
      ]),
      deliveryConfig: JSON.stringify({
        commands: [
          "lp user {username} parent add supreme",
          "broadcast &e[Store] &a{username} &7has attained the almighty &6[SUPREME] Rank&7!",
        ],
      }),
    },
    {
      name: "OVERLORD Rank",
      slug: "overlord",
      description: "The pinnacle network rank. Ultimate prestige, animated yellow prefix, /kit overlord god gear, and 5 homes.",
      category: "RANK",
      price: 99900, // ₹999
      currency: "INR",
      duration: "30_DAYS",
      featured: true,
      badgeColor: "yellow",
      sortOrder: 5,
      perks: JSON.stringify([
        "Permanent [OVERLORD] animated yellow tag",
        "All lower rank perks included",
        "Access to /kit overlord (God Netherite set & G-Apples)",
        "Set up to 5 player homes (/sethome)",
        "Reserved server slot during full network",
        "Exclusive Discord Overlord role & lounge",
      ]),
      deliveryConfig: JSON.stringify({
        commands: [
          "lp user {username} parent add overlord",
          "broadcast &6★ [Store] &a{username} &7has ascended to supreme &eOVERLORD Rank&7! ★",
        ],
      }),
    },
    {
      name: "50 Server Coins",
      slug: "coins-50",
      description: "Starter coin bundle. Official Server Rate: 1 Coin = ₹1. Instant in-game delivery.",
      category: "COINS",
      price: 5000, // ₹50
      currency: "INR",
      duration: "ONE_TIME",
      featured: false,
      badgeColor: "emerald",
      sortOrder: 10,
      perks: JSON.stringify([
        "50 In-Game Coins (1 Coin = ₹1)",
        "Spend immediately via /coinshop in-game",
        "Unlock custom chat colors & player tags",
        "Instant delivery via PlayerPoints",
      ]),
      deliveryConfig: JSON.stringify({
        commands: [
          "p give {username} 50",
          "broadcast &e[Store] &a{username} &7has purchased &e50 Coins&7!",
        ],
      }),
    },
    {
      name: "100 Server Coins",
      slug: "coins-100",
      description: "Pouch of coins. Official Server Rate: 1 Coin = ₹1. Spend in /coinshop.",
      category: "COINS",
      price: 10000, // ₹100
      currency: "INR",
      duration: "ONE_TIME",
      featured: false,
      badgeColor: "emerald",
      sortOrder: 11,
      perks: JSON.stringify([
        "100 In-Game Coins (1 Coin = ₹1)",
        "Spend in /coinshop for crate keys & tags",
        "Permanent addition to your balance",
        "Instant delivery via PlayerPoints",
      ]),
      deliveryConfig: JSON.stringify({
        commands: [
          "p give {username} 100",
          "broadcast &e[Store] &a{username} &7has purchased &e100 Coins&7!",
        ],
      }),
    },
    {
      name: "250 Server Coins",
      slug: "coins-250",
      description: "Sack of coins. Official Server Rate: 1 Coin = ₹1. Unlock tags, chat colors, and crate keys.",
      category: "COINS",
      price: 25000, // ₹250
      currency: "INR",
      duration: "ONE_TIME",
      featured: true,
      badgeColor: "cyan",
      sortOrder: 12,
      perks: JSON.stringify([
        "250 In-Game Coins (1 Coin = ₹1)",
        "Unlock premium /coinshop tags & cosmetics",
        "Redeemable for crate keys in-game",
        "Instant delivery via PlayerPoints",
      ]),
      deliveryConfig: JSON.stringify({
        commands: [
          "p give {username} 250",
          "broadcast &e[Store] &a{username} &7has purchased &e250 Coins&7!",
        ],
      }),
    },
    {
      name: "500 Server Coins",
      slug: "coins-500",
      description: "Chest of coins. Official Server Rate: 1 Coin = ₹1. Unlock rare tags and crate keys.",
      category: "COINS",
      price: 50000, // ₹500
      currency: "INR",
      duration: "ONE_TIME",
      featured: false,
      badgeColor: "purple",
      sortOrder: 13,
      perks: JSON.stringify([
        "500 In-Game Coins (1 Coin = ₹1)",
        "Massive purchasing power in /coinshop",
        "Unlock exclusive emotes, skins, and crate keys",
        "Instant delivery via PlayerPoints",
      ]),
      deliveryConfig: JSON.stringify({
        commands: [
          "p give {username} 500",
          "broadcast &e[Store] &a{username} &7has purchased &e500 Coins&7!",
        ],
      }),
    },
    {
      name: "1,000 Server Coins",
      slug: "coins-1000",
      description: "Vault of coins. Official Server Rate: 1 Coin = ₹1. Top player coin package.",
      category: "COINS",
      price: 100000, // ₹1,000
      currency: "INR",
      duration: "ONE_TIME",
      featured: true,
      badgeColor: "gold",
      sortOrder: 14,
      perks: JSON.stringify([
        "1,000 In-Game Coins (1 Coin = ₹1)",
        "Ultimate coin reserve for all /coinshop items",
        "Instantly top the in-game Coin Barons leaderboard",
        "Instant delivery via PlayerPoints",
      ]),
      deliveryConfig: JSON.stringify({
        commands: [
          "p give {username} 1000",
          "broadcast &e[Store] &a{username} &7has purchased &61,000 Coins&7!",
        ],
      }),
    },
    {
      name: "2,500 Server Coins",
      slug: "coins-2500",
      description: "Emperor Treasury. Official Server Rate: 1 Coin = ₹1. Maximum purchasing power.",
      category: "COINS",
      price: 250000, // ₹2,500
      currency: "INR",
      duration: "ONE_TIME",
      featured: false,
      badgeColor: "gold",
      sortOrder: 15,
      perks: JSON.stringify([
        "2,500 In-Game Coins (1 Coin = ₹1)",
        "The largest coin package on the network",
        "Unlock everything in /coinshop permanently",
        "Instant delivery via PlayerPoints",
      ]),
      deliveryConfig: JSON.stringify({
        commands: [
          "p give {username} 2500",
          "broadcast &6★ [Store] &a{username} &7has purchased a massive &62,500 Coins&7! ★",
        ],
      }),
    },
    {
      name: "5x Ancient Crate Keys",
      slug: "crate-ancient-5",
      description: "Unlock rare cosmetics, custom enchant books, and high-tier equipment in spawn crate area.",
      category: "CRATE",
      price: 14900, // ₹149
      currency: "INR",
      duration: "ONE_TIME",
      featured: false,
      badgeColor: "emerald",
      sortOrder: 20,
      perks: JSON.stringify([
        "5 Keys for the Ancient Spawn Crate",
        "Guaranteed Epic or Legendary loot drop",
        "Chance to unlock rare particle effects",
      ]),
      deliveryConfig: JSON.stringify({
        commands: ["crate give {username} ancient 5"],
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

  // 7. Seed Real Live Leaderboards (Economy from Essentials baltop, PvP, Coins, Votes)
  const leaderboardEntries = [
    // ECONOMY (from server baltop: 509 users, $109M total)
    { category: "ECONOMY", name: "HarshUnlimited", score: "$40,250,949", rawScore: 40250949, subtext: "Rank: OWNER", rank: 1 },
    { category: "ECONOMY", name: "darky", score: "$17,740,083", rawScore: 17740083, subtext: "Rank: OVERLORD", rank: 2 },
    { category: "ECONOMY", name: "JNVIRAJ", score: "$13,570,565", rawScore: 13570565, subtext: "Rank: OVERLORD", rank: 3 },
    { category: "ECONOMY", name: "CaptainCharlie56", score: "$10,976,546", rawScore: 10976546, subtext: "Rank: ELITE", rank: 4 },
    { category: "ECONOMY", name: ".Mary43848", score: "$5,218,477", rawScore: 5218477, subtext: "Rank: MVP", rank: 5 },
    { category: "ECONOMY", name: "WhiteBlader", score: "$4,405,976", rawScore: 4405976, subtext: "Rank: MEMBER", rank: 6 },
    { category: "ECONOMY", name: "erida_nyx", score: "$3,238,611", rawScore: 3238611, subtext: "Rank: MEMBER", rank: 7 },
    { category: "ECONOMY", name: "LORD", score: "$2,551,106", rawScore: 2551106, subtext: "Rank: OVERLORD", rank: 8 },

    // PVP KILLS (Survival SMP)
    { category: "PVP", name: "darky", score: "482 Kills", rawScore: 482, subtext: "Streak: 28 • Dominator", rank: 1 },
    { category: "PVP", name: "JNVIRAJ", score: "374 Kills", rawScore: 374, subtext: "Streak: 19 • Berserker", rank: 2 },
    { category: "PVP", name: "HarshUnlimited", score: "315 Kills", rawScore: 315, subtext: "Streak: 24 • Emperor", rank: 3 },
    { category: "PVP", name: "bulli_bhai", score: "289 Kills", rawScore: 289, subtext: "Streak: 14 • Gladiator", rank: 4 },
    { category: "PVP", name: "erida_nyx", score: "241 Kills", rawScore: 241, subtext: "Streak: 12 • Assassin", rank: 5 },
    { category: "PVP", name: "UVTANDI", score: "198 Kills", rawScore: 198, subtext: "Streak: 9 • Defender", rank: 6 },

    // COINS (In-Game PlayerPoints)
    { category: "COINS", name: "HarshUnlimited", score: "2,500 Coins", rawScore: 2500, subtext: "Coin Baron", rank: 1 },
    { category: "COINS", name: "UVTANDI", score: "1,200 Coins", rawScore: 1200, subtext: "High Roller", rank: 2 },
    { category: "COINS", name: "THELEGENDFF", score: "750 Coins", rawScore: 750, subtext: "Collector", rank: 3 },
    { category: "COINS", name: "CaptainCharlie56", score: "500 Coins", rawScore: 500, subtext: "Cosmetics Grinder", rank: 4 },
    { category: "COINS", name: "Dirty_playz", score: "350 Coins", rawScore: 350, subtext: "Tag Master", rank: 5 },

    // PLAY TIME (Survival SMP)
    { category: "PLAYTIME", name: "JNVIRAJ", score: "284h 15m", rawScore: 17055, subtext: "Rank: OVERLORD • Active Survival Pioneer", rank: 1 },
    { category: "PLAYTIME", name: "darky", score: "215h 40m", rawScore: 12940, subtext: "Rank: OVERLORD • SMP Veteran", rank: 2 },
    { category: "PLAYTIME", name: "Manav_123", score: "178h 20m", rawScore: 10700, subtext: "Rank: VIP • Community Regular", rank: 3 },
    { category: "PLAYTIME", name: "bulli_bhai", score: "142h 50m", rawScore: 8570, subtext: "Rank: MEMBER • Daily Grinder", rank: 4 },
    { category: "PLAYTIME", name: "jodadnan", score: "119h 30m", rawScore: 7170, subtext: "Rank: MEMBER • Builder & Adventurer", rank: 5 },
    { category: "PLAYTIME", name: "CaptainCharlie56", score: "98h 45m", rawScore: 5925, subtext: "Rank: ELITE • Explorer", rank: 6 },
    { category: "PLAYTIME", name: "erida_nyx", score: "86h 10m", rawScore: 5170, subtext: "Rank: MEMBER • Survival Enthusiast", rank: 7 },
  ];

  await prisma.leaderboardEntry.deleteMany({});
  for (const entry of leaderboardEntries) {
    await prisma.leaderboardEntry.create({ data: entry });
  }
  console.log("✅ Live Leaderboard entries seeded from server data");

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
