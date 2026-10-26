"use client";

import { useState } from "react";
import {
  X,
  Copy,
  Check,
  ShoppingBag,
  ExternalLink,
  Sparkles,
  Shield,
  Coins,
  Clock,
  Layers,
} from "lucide-react";

export interface ChestItem {
  slot: number; // 0 to 26 (or 53)
  name: string;
  nameColor?: string; // e.g. text-cyan-400, text-purple-400, text-amber-400
  count?: number;
  iconUrl: string;
  isEnchanted?: boolean;
  type: string;
  enchants?: string[];
  lore?: string[];
}

export interface KitData {
  id: string;
  slug: string;
  name: string;
  price?: number;
  currency?: string;
  cooldown: string;
  command: string;
  money: string;
  claimBlocks: string;
  tierColor: string; // e.g. "rose", "purple", "amber", "cyan", "emerald"
  items: ChestItem[];
}

// Item Texture helper URLs (InventivetalentDev 1.20 assets + official Minecraft wiki)
const ASSET_ITEM = (name: string) =>
  `https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/1.20.1/assets/minecraft/textures/item/${name}.png`;
const ASSET_BLOCK = (name: string) =>
  `https://raw.githubusercontent.com/InventivetalentDev/minecraft-assets/1.20.1/assets/minecraft/textures/block/${name}.png`;
const SHIELD_URL = "https://minecraft.wiki/images/Shield_JE2_BE1.png";

export const KITS_CHEST_DATA: Record<string, KitData> = {
  overlord: {
    id: "kit-overlord",
    slug: "overlord",
    name: "OVERLORD God Kit",
    price: 99900,
    currency: "INR",
    cooldown: "30 Days",
    command: "/kit overlord",
    money: "$40,000",
    claimBlocks: "10,000",
    tierColor: "rose",
    items: [
      // Row 1: Netherite Armor + Shield + Bow + Arrows + Cash
      {
        slot: 0,
        name: "God Netherite Helmet",
        nameColor: "#d8b4fe",
        count: 1,
        iconUrl: ASSET_ITEM("netherite_helmet"),
        isEnchanted: true,
        type: "Armor",
        enchants: ["Protection IV", "Unbreaking III", "Respiration III", "Aqua Affinity", "Mending"],
        lore: ["Forged in the depths of the Nether for Overlord sovereigns."],
      },
      {
        slot: 1,
        name: "God Netherite Chestplate",
        nameColor: "#d8b4fe",
        count: 1,
        iconUrl: ASSET_ITEM("netherite_chestplate"),
        isEnchanted: true,
        type: "Armor",
        enchants: ["Protection IV", "Unbreaking III", "Mending", "Thorns III"],
        lore: ["Impenetrable Netherite forged with supreme resistance."],
      },
      {
        slot: 2,
        name: "God Netherite Leggings",
        nameColor: "#d8b4fe",
        count: 1,
        iconUrl: ASSET_ITEM("netherite_leggings"),
        isEnchanted: true,
        type: "Armor",
        enchants: ["Protection IV", "Unbreaking III", "Mending", "Swift Sneak III"],
        lore: ["Reinforced plating for dominant mobility."],
      },
      {
        slot: 3,
        name: "God Netherite Boots",
        nameColor: "#d8b4fe",
        count: 1,
        iconUrl: ASSET_ITEM("netherite_boots"),
        isEnchanted: true,
        type: "Armor",
        enchants: ["Protection IV", "Unbreaking III", "Feather Falling IV", "Depth Strider III", "Mending"],
        lore: ["Lightweight god tread for high-velocity combat."],
      },
      {
        slot: 4,
        name: "Overlord Reinforced Shield",
        nameColor: "#67e8f9",
        count: 1,
        iconUrl: SHIELD_URL,
        isEnchanted: true,
        type: "Utility",
        enchants: ["Unbreaking III", "Mending"],
        lore: ["Blocks 100% of incoming physical & ranged damage."],
      },
      {
        slot: 5,
        name: "God Sniper Bow",
        nameColor: "#d8b4fe",
        count: 1,
        iconUrl: ASSET_ITEM("bow"),
        isEnchanted: true,
        type: "Weapon",
        enchants: ["Power V", "Flame", "Punch II", "Infinity", "Unbreaking III"],
        lore: ["Deliver devastating ranged strikes."],
      },
      {
        slot: 6,
        name: "Spectral Arrows",
        nameColor: "#fde047",
        count: 64,
        iconUrl: ASSET_ITEM("arrow"),
        type: "Ammunition",
        lore: ["Full stack of combat ammunition."],
      },
      {
        slot: 7,
        name: "$40,000 Cash Voucher",
        nameColor: "#4ade80",
        count: 1,
        iconUrl: ASSET_ITEM("paper"),
        isEnchanted: true,
        type: "Economy",
        lore: ["Credits $40,000 server balance immediately upon claiming.", "Usable in /shop, /ah, and player trades."],
      },
      {
        slot: 8,
        name: "10,000 Land Claim Blocks",
        nameColor: "#facc15",
        count: 1,
        iconUrl: ASSET_ITEM("golden_shovel"),
        isEnchanted: true,
        type: "Protection",
        lore: ["10,000 Grief-Prevention claim blocks.", "Secure vast mega-bases and clan territories."],
      },

      // Row 2: God Tools + Gapples + Resources
      {
        slot: 9,
        name: "God Netherite Sword",
        nameColor: "#f43f5e",
        count: 1,
        iconUrl: ASSET_ITEM("netherite_sword"),
        isEnchanted: true,
        type: "Weapon",
        enchants: ["Sharpness V", "Fire Aspect II", "Looting III", "Unbreaking III", "Mending", "Sweeping Edge III"],
        lore: ["Supreme blade of Harsh Unlimited overlords."],
      },
      {
        slot: 10,
        name: "God Netherite Pickaxe",
        nameColor: "#d8b4fe",
        count: 1,
        iconUrl: ASSET_ITEM("netherite_pickaxe"),
        isEnchanted: true,
        type: "Tool",
        enchants: ["Efficiency V", "Fortune III", "Unbreaking III", "Mending"],
        lore: ["Obliterates deepslate and ancient debris instantaneously."],
      },
      {
        slot: 11,
        name: "God Netherite Axe",
        nameColor: "#d8b4fe",
        count: 1,
        iconUrl: ASSET_ITEM("netherite_axe"),
        isEnchanted: true,
        type: "Tool",
        enchants: ["Efficiency V", "Sharpness V", "Unbreaking III", "Mending"],
        lore: ["Dual-purpose tool for timber logging & shield breaking."],
      },
      {
        slot: 12,
        name: "God Netherite Shovel",
        nameColor: "#d8b4fe",
        count: 1,
        iconUrl: ASSET_ITEM("netherite_shovel"),
        isEnchanted: true,
        type: "Tool",
        enchants: ["Efficiency V", "Silk Touch", "Unbreaking III", "Mending"],
        lore: ["Instant excavation shovel."],
      },
      {
        slot: 13,
        name: "Enchanted Golden Apples",
        nameColor: "#fbbf24",
        count: 64,
        iconUrl: ASSET_ITEM("golden_apple"),
        isEnchanted: true,
        type: "Consumable",
        lore: ["Regeneration II, Absorption IV, Resistance, Fire Resistance."],
      },
      {
        slot: 14,
        name: "Diamonds",
        nameColor: "#67e8f9",
        count: 32,
        iconUrl: ASSET_ITEM("diamond"),
        type: "Mineral",
        lore: ["32x Raw pure diamonds for crafting and currency."],
      },
      {
        slot: 15,
        name: "Iron Ingots",
        nameColor: "#e2e8f0",
        count: 64,
        iconUrl: ASSET_ITEM("iron_ingot"),
        type: "Mineral",
        lore: ["64x Iron Ingots for heavy construction & anvils."],
      },
      {
        slot: 16,
        name: "Gold Ingots",
        nameColor: "#facc15",
        count: 32,
        iconUrl: ASSET_ITEM("gold_ingot"),
        type: "Mineral",
        lore: ["32x Solid gold ingots."],
      },
      {
        slot: 17,
        name: "Obsidian",
        nameColor: "#c084fc",
        count: 32,
        iconUrl: ASSET_BLOCK("obsidian"),
        type: "Building",
        lore: ["32x Blast-resistant obsidian blocks."],
      },

      // Row 3: Building + Defense + Liquids
      {
        slot: 18,
        name: "Oak Wood Logs",
        nameColor: "#fdba74",
        count: 64,
        iconUrl: ASSET_BLOCK("oak_log"),
        type: "Building",
        lore: ["64x Raw natural oak logs (Yields 256 planks)."],
      },
      {
        slot: 19,
        name: "Combat Cobwebs",
        nameColor: "#f8fafc",
        count: 64,
        iconUrl: ASSET_BLOCK("cobweb"),
        type: "Tactical",
        lore: ["64x Cobwebs to trap opponents in PvP & clutch fall damage."],
      },
      {
        slot: 20,
        name: "Water Bucket",
        nameColor: "#38bdf8",
        count: 1,
        iconUrl: ASSET_ITEM("water_bucket"),
        type: "Liquid",
        lore: ["Water source bucket (Infinite water generator)."],
      },
      {
        slot: 21,
        name: "Water Bucket",
        nameColor: "#38bdf8",
        count: 1,
        iconUrl: ASSET_ITEM("water_bucket"),
        type: "Liquid",
        lore: ["Second water source bucket."],
      },
      {
        slot: 22,
        name: "Lava Bucket",
        nameColor: "#fb923c",
        count: 1,
        iconUrl: ASSET_ITEM("lava_bucket"),
        type: "Liquid",
        lore: ["Lava source bucket for cobblestone generator or smelting."],
      },
      {
        slot: 26,
        name: "Kit Info & Cooldown",
        nameColor: "#e2e8f0",
        count: 1,
        iconUrl: ASSET_ITEM("clock_00"),
        type: "Information",
        lore: ["Command: /kit overlord", "Cooldown: 30 Days", "Included with OVERLORD Rank permanently."],
      },
    ],
  },

  supreme: {
    id: "kit-supreme",
    slug: "supreme",
    name: "SUPREME Kit",
    price: 49900,
    currency: "INR",
    cooldown: "1 Hour",
    command: "/kit supreme",
    money: "$25,000",
    claimBlocks: "6,000",
    tierColor: "purple",
    items: [
      {
        slot: 0,
        name: "Supreme Diamond Helmet",
        nameColor: "#67e8f9",
        count: 1,
        iconUrl: ASSET_ITEM("diamond_helmet"),
        isEnchanted: true,
        type: "Armor",
        enchants: ["Protection IV", "Unbreaking III"],
        lore: ["Enchanted diamond war helmet."],
      },
      {
        slot: 1,
        name: "Supreme Diamond Chestplate",
        nameColor: "#67e8f9",
        count: 1,
        iconUrl: ASSET_ITEM("diamond_chestplate"),
        isEnchanted: true,
        type: "Armor",
        enchants: ["Protection IV", "Unbreaking III"],
        lore: ["Heavy diamond plating."],
      },
      {
        slot: 2,
        name: "Supreme Diamond Leggings",
        nameColor: "#67e8f9",
        count: 1,
        iconUrl: ASSET_ITEM("diamond_leggings"),
        isEnchanted: true,
        type: "Armor",
        enchants: ["Protection IV", "Unbreaking III"],
        lore: ["Reinforced diamond greaves."],
      },
      {
        slot: 3,
        name: "Supreme Diamond Boots",
        nameColor: "#67e8f9",
        count: 1,
        iconUrl: ASSET_ITEM("diamond_boots"),
        isEnchanted: true,
        type: "Armor",
        enchants: ["Protection IV", "Unbreaking III", "Feather Falling IV"],
        lore: ["Supreme impact absorption."],
      },
      {
        slot: 4,
        name: "Reinforced Shield",
        nameColor: "#67e8f9",
        count: 1,
        iconUrl: SHIELD_URL,
        isEnchanted: true,
        type: "Utility",
        enchants: ["Unbreaking III"],
      },
      {
        slot: 5,
        name: "Supreme Combat Bow",
        nameColor: "#d8b4fe",
        count: 1,
        iconUrl: ASSET_ITEM("bow"),
        isEnchanted: true,
        type: "Weapon",
        enchants: ["Power IV", "Punch I", "Unbreaking III"],
      },
      {
        slot: 6,
        name: "Arrows",
        nameColor: "#fde047",
        count: 64,
        iconUrl: ASSET_ITEM("arrow"),
        type: "Ammunition",
      },
      {
        slot: 7,
        name: "$25,000 Cash Voucher",
        nameColor: "#4ade80",
        count: 1,
        iconUrl: ASSET_ITEM("paper"),
        isEnchanted: true,
        type: "Economy",
        lore: ["Credits $25,000 in-game money."],
      },
      {
        slot: 8,
        name: "6,000 Claim Blocks",
        nameColor: "#facc15",
        count: 1,
        iconUrl: ASSET_ITEM("golden_shovel"),
        isEnchanted: true,
        type: "Protection",
        lore: ["Protects 6,000 blocks of builds."],
      },
      {
        slot: 9,
        name: "Supreme Diamond Sword",
        nameColor: "#67e8f9",
        count: 1,
        iconUrl: ASSET_ITEM("diamond_sword"),
        isEnchanted: true,
        type: "Weapon",
        enchants: ["Sharpness V", "Fire Aspect II", "Unbreaking III"],
      },
      {
        slot: 10,
        name: "Supreme Diamond Pickaxe",
        nameColor: "#67e8f9",
        count: 1,
        iconUrl: ASSET_ITEM("diamond_pickaxe"),
        isEnchanted: true,
        type: "Tool",
        enchants: ["Efficiency V", "Fortune III", "Unbreaking III"],
      },
      {
        slot: 11,
        name: "Supreme Diamond Axe",
        nameColor: "#67e8f9",
        count: 1,
        iconUrl: ASSET_ITEM("diamond_axe"),
        isEnchanted: true,
        type: "Tool",
        enchants: ["Efficiency V", "Unbreaking III"],
      },
      {
        slot: 12,
        name: "Supreme Diamond Shovel",
        nameColor: "#67e8f9",
        count: 1,
        iconUrl: ASSET_ITEM("diamond_shovel"),
        isEnchanted: true,
        type: "Tool",
        enchants: ["Efficiency V", "Unbreaking III"],
      },
      {
        slot: 13,
        name: "Golden Apples",
        nameColor: "#fbbf24",
        count: 64,
        iconUrl: ASSET_ITEM("golden_apple"),
        type: "Consumable",
      },
      {
        slot: 14,
        name: "Diamonds",
        nameColor: "#67e8f9",
        count: 24,
        iconUrl: ASSET_ITEM("diamond"),
        type: "Mineral",
      },
      {
        slot: 15,
        name: "Iron Ingots",
        nameColor: "#e2e8f0",
        count: 48,
        iconUrl: ASSET_ITEM("iron_ingot"),
        type: "Mineral",
      },
      {
        slot: 16,
        name: "Gold Ingots",
        nameColor: "#facc15",
        count: 24,
        iconUrl: ASSET_ITEM("gold_ingot"),
        type: "Mineral",
      },
      {
        slot: 17,
        name: "Obsidian",
        nameColor: "#c084fc",
        count: 24,
        iconUrl: ASSET_BLOCK("obsidian"),
        type: "Building",
      },
      {
        slot: 18,
        name: "Oak Wood Logs",
        nameColor: "#fdba74",
        count: 64,
        iconUrl: ASSET_BLOCK("oak_log"),
        type: "Building",
      },
      {
        slot: 19,
        name: "Combat Cobwebs",
        nameColor: "#f8fafc",
        count: 48,
        iconUrl: ASSET_BLOCK("cobweb"),
        type: "Tactical",
      },
      {
        slot: 20,
        name: "Water Bucket",
        nameColor: "#38bdf8",
        count: 1,
        iconUrl: ASSET_ITEM("water_bucket"),
        type: "Liquid",
      },
      {
        slot: 21,
        name: "Water Bucket",
        nameColor: "#38bdf8",
        count: 1,
        iconUrl: ASSET_ITEM("water_bucket"),
        type: "Liquid",
      },
      {
        slot: 22,
        name: "Lava Bucket",
        nameColor: "#fb923c",
        count: 1,
        iconUrl: ASSET_ITEM("lava_bucket"),
        type: "Liquid",
      },
      {
        slot: 26,
        name: "Kit Info & Cooldown",
        nameColor: "#e2e8f0",
        count: 1,
        iconUrl: ASSET_ITEM("clock_00"),
        type: "Information",
        lore: ["Command: /kit supreme", "Cooldown: 1 Hour (60m)", "Fast hourly re-claimable kit!"],
      },
    ],
  },

  elite: {
    id: "kit-elite",
    slug: "elite",
    name: "ELITE Kit",
    price: 34900,
    currency: "INR",
    cooldown: "30 Days",
    command: "/kit elite",
    money: "$15,000",
    claimBlocks: "4,000",
    tierColor: "amber",
    items: [
      {
        slot: 0,
        name: "Elite Diamond Helmet",
        nameColor: "#67e8f9",
        count: 1,
        iconUrl: ASSET_ITEM("diamond_helmet"),
        isEnchanted: true,
        type: "Armor",
        enchants: ["Protection III", "Unbreaking III"],
      },
      {
        slot: 1,
        name: "Elite Diamond Chestplate",
        nameColor: "#67e8f9",
        count: 1,
        iconUrl: ASSET_ITEM("diamond_chestplate"),
        isEnchanted: true,
        type: "Armor",
        enchants: ["Protection III", "Unbreaking III"],
      },
      {
        slot: 2,
        name: "Elite Diamond Leggings",
        nameColor: "#67e8f9",
        count: 1,
        iconUrl: ASSET_ITEM("diamond_leggings"),
        isEnchanted: true,
        type: "Armor",
        enchants: ["Protection III", "Unbreaking III"],
      },
      {
        slot: 3,
        name: "Elite Diamond Boots",
        nameColor: "#67e8f9",
        count: 1,
        iconUrl: ASSET_ITEM("diamond_boots"),
        isEnchanted: true,
        type: "Armor",
        enchants: ["Protection III", "Unbreaking III"],
      },
      {
        slot: 4,
        name: "Reinforced Shield",
        nameColor: "#67e8f9",
        count: 1,
        iconUrl: SHIELD_URL,
        isEnchanted: true,
        type: "Utility",
      },
      {
        slot: 5,
        name: "Elite Hunting Bow",
        nameColor: "#d8b4fe",
        count: 1,
        iconUrl: ASSET_ITEM("bow"),
        isEnchanted: true,
        type: "Weapon",
        enchants: ["Power III", "Unbreaking III"],
      },
      {
        slot: 6,
        name: "Arrows",
        nameColor: "#fde047",
        count: 64,
        iconUrl: ASSET_ITEM("arrow"),
        type: "Ammunition",
      },
      {
        slot: 7,
        name: "$15,000 Cash Voucher",
        nameColor: "#4ade80",
        count: 1,
        iconUrl: ASSET_ITEM("paper"),
        isEnchanted: true,
        type: "Economy",
      },
      {
        slot: 8,
        name: "4,000 Claim Blocks",
        nameColor: "#facc15",
        count: 1,
        iconUrl: ASSET_ITEM("golden_shovel"),
        isEnchanted: true,
        type: "Protection",
      },
      {
        slot: 9,
        name: "Elite Diamond Sword",
        nameColor: "#67e8f9",
        count: 1,
        iconUrl: ASSET_ITEM("diamond_sword"),
        isEnchanted: true,
        type: "Weapon",
        enchants: ["Sharpness IV", "Unbreaking III"],
      },
      {
        slot: 10,
        name: "Elite Diamond Pickaxe",
        nameColor: "#67e8f9",
        count: 1,
        iconUrl: ASSET_ITEM("diamond_pickaxe"),
        isEnchanted: true,
        type: "Tool",
        enchants: ["Efficiency IV", "Unbreaking III"],
      },
      {
        slot: 11,
        name: "Elite Diamond Axe",
        nameColor: "#67e8f9",
        count: 1,
        iconUrl: ASSET_ITEM("diamond_axe"),
        isEnchanted: true,
        type: "Tool",
        enchants: ["Efficiency IV"],
      },
      {
        slot: 12,
        name: "Elite Diamond Shovel",
        nameColor: "#67e8f9",
        count: 1,
        iconUrl: ASSET_ITEM("diamond_shovel"),
        isEnchanted: true,
        type: "Tool",
        enchants: ["Efficiency IV"],
      },
      {
        slot: 13,
        name: "Golden Apples",
        nameColor: "#fbbf24",
        count: 64,
        iconUrl: ASSET_ITEM("golden_apple"),
        type: "Consumable",
      },
      {
        slot: 14,
        name: "Diamonds",
        nameColor: "#67e8f9",
        count: 16,
        iconUrl: ASSET_ITEM("diamond"),
        type: "Mineral",
      },
      {
        slot: 15,
        name: "Iron Ingots",
        nameColor: "#e2e8f0",
        count: 32,
        iconUrl: ASSET_ITEM("iron_ingot"),
        type: "Mineral",
      },
      {
        slot: 16,
        name: "Gold Ingots",
        nameColor: "#facc15",
        count: 16,
        iconUrl: ASSET_ITEM("gold_ingot"),
        type: "Mineral",
      },
      {
        slot: 17,
        name: "Obsidian",
        nameColor: "#c084fc",
        count: 16,
        iconUrl: ASSET_BLOCK("obsidian"),
        type: "Building",
      },
      {
        slot: 18,
        name: "Oak Wood Logs",
        nameColor: "#fdba74",
        count: 64,
        iconUrl: ASSET_BLOCK("oak_log"),
        type: "Building",
      },
      {
        slot: 19,
        name: "Combat Cobwebs",
        nameColor: "#f8fafc",
        count: 32,
        iconUrl: ASSET_BLOCK("cobweb"),
        type: "Tactical",
      },
      {
        slot: 20,
        name: "Water Bucket",
        nameColor: "#38bdf8",
        count: 1,
        iconUrl: ASSET_ITEM("water_bucket"),
        type: "Liquid",
      },
      {
        slot: 21,
        name: "Water Bucket",
        nameColor: "#38bdf8",
        count: 1,
        iconUrl: ASSET_ITEM("water_bucket"),
        type: "Liquid",
      },
      {
        slot: 22,
        name: "Lava Bucket",
        nameColor: "#fb923c",
        count: 1,
        iconUrl: ASSET_ITEM("lava_bucket"),
        type: "Liquid",
      },
      {
        slot: 26,
        name: "Kit Info & Cooldown",
        nameColor: "#e2e8f0",
        count: 1,
        iconUrl: ASSET_ITEM("clock_00"),
        type: "Information",
        lore: ["Command: /kit elite", "Cooldown: 30 Days"],
      },
    ],
  },

  mvp: {
    id: "kit-mvp",
    slug: "mvp",
    name: "MVP Kit",
    price: 24900,
    currency: "INR",
    cooldown: "1 Hour",
    command: "/kit mvp",
    money: "$10,000",
    claimBlocks: "2,500",
    tierColor: "cyan",
    items: [
      {
        slot: 0,
        name: "MVP Netherite Helmet",
        nameColor: "#67e8f9",
        count: 1,
        iconUrl: ASSET_ITEM("netherite_helmet"),
        isEnchanted: true,
        type: "Armor",
        enchants: ["Protection II", "Unbreaking II"],
      },
      {
        slot: 1,
        name: "MVP Netherite Chestplate",
        nameColor: "#67e8f9",
        count: 1,
        iconUrl: ASSET_ITEM("netherite_chestplate"),
        isEnchanted: true,
        type: "Armor",
        enchants: ["Protection II", "Unbreaking II"],
      },
      {
        slot: 2,
        name: "MVP Netherite Leggings",
        nameColor: "#67e8f9",
        count: 1,
        iconUrl: ASSET_ITEM("netherite_leggings"),
        isEnchanted: true,
        type: "Armor",
        enchants: ["Protection II", "Unbreaking II"],
      },
      {
        slot: 3,
        name: "MVP Netherite Boots",
        nameColor: "#67e8f9",
        count: 1,
        iconUrl: ASSET_ITEM("netherite_boots"),
        isEnchanted: true,
        type: "Armor",
        enchants: ["Protection II", "Unbreaking II"],
      },
      {
        slot: 4,
        name: "Combat Shield",
        nameColor: "#67e8f9",
        count: 1,
        iconUrl: SHIELD_URL,
        isEnchanted: true,
        type: "Utility",
      },
      {
        slot: 5,
        name: "Recurve Bow",
        nameColor: "#d8b4fe",
        count: 1,
        iconUrl: ASSET_ITEM("bow"),
        isEnchanted: true,
        type: "Weapon",
        enchants: ["Power II"],
      },
      {
        slot: 6,
        name: "Arrows",
        nameColor: "#fde047",
        count: 64,
        iconUrl: ASSET_ITEM("arrow"),
        type: "Ammunition",
      },
      {
        slot: 7,
        name: "$10,000 Cash Voucher",
        nameColor: "#4ade80",
        count: 1,
        iconUrl: ASSET_ITEM("paper"),
        isEnchanted: true,
        type: "Economy",
      },
      {
        slot: 8,
        name: "2,500 Claim Blocks",
        nameColor: "#facc15",
        count: 1,
        iconUrl: ASSET_ITEM("golden_shovel"),
        isEnchanted: true,
        type: "Protection",
      },
      {
        slot: 9,
        name: "Diamond Sword",
        nameColor: "#67e8f9",
        count: 1,
        iconUrl: ASSET_ITEM("diamond_sword"),
        isEnchanted: true,
        type: "Weapon",
        enchants: ["Sharpness III"],
      },
      {
        slot: 10,
        name: "Diamond Pickaxe",
        nameColor: "#67e8f9",
        count: 1,
        iconUrl: ASSET_ITEM("diamond_pickaxe"),
        isEnchanted: true,
        type: "Tool",
        enchants: ["Efficiency III"],
      },
      {
        slot: 13,
        name: "Golden Apples",
        nameColor: "#fbbf24",
        count: 4,
        iconUrl: ASSET_ITEM("golden_apple"),
        type: "Consumable",
      },
      {
        slot: 14,
        name: "Diamonds",
        nameColor: "#67e8f9",
        count: 12,
        iconUrl: ASSET_ITEM("diamond"),
        type: "Mineral",
      },
      {
        slot: 15,
        name: "Iron Ingots",
        nameColor: "#e2e8f0",
        count: 32,
        iconUrl: ASSET_ITEM("iron_ingot"),
        type: "Mineral",
      },
      {
        slot: 16,
        name: "Gold Ingots",
        nameColor: "#facc15",
        count: 16,
        iconUrl: ASSET_ITEM("gold_ingot"),
        type: "Mineral",
      },
      {
        slot: 17,
        name: "Obsidian",
        nameColor: "#c084fc",
        count: 8,
        iconUrl: ASSET_BLOCK("obsidian"),
        type: "Building",
      },
      {
        slot: 18,
        name: "Oak Wood Logs",
        nameColor: "#fdba74",
        count: 64,
        iconUrl: ASSET_BLOCK("oak_log"),
        type: "Building",
      },
      {
        slot: 19,
        name: "Cobwebs",
        nameColor: "#f8fafc",
        count: 24,
        iconUrl: ASSET_BLOCK("cobweb"),
        type: "Tactical",
      },
      {
        slot: 20,
        name: "Water Bucket",
        nameColor: "#38bdf8",
        count: 1,
        iconUrl: ASSET_ITEM("water_bucket"),
        type: "Liquid",
      },
      {
        slot: 21,
        name: "Water Bucket",
        nameColor: "#38bdf8",
        count: 1,
        iconUrl: ASSET_ITEM("water_bucket"),
        type: "Liquid",
      },
      {
        slot: 22,
        name: "Lava Bucket",
        nameColor: "#fb923c",
        count: 1,
        iconUrl: ASSET_ITEM("lava_bucket"),
        type: "Liquid",
      },
      {
        slot: 26,
        name: "Kit Info & Cooldown",
        nameColor: "#e2e8f0",
        count: 1,
        iconUrl: ASSET_ITEM("clock_00"),
        type: "Information",
        lore: ["Command: /kit mvp", "Cooldown: 1 Hour (60m)"],
      },
    ],
  },

  vip: {
    id: "kit-vip",
    slug: "vip",
    name: "VIP Kit",
    price: 14900,
    currency: "INR",
    cooldown: "1 Hour",
    command: "/kit vip",
    money: "$5,000",
    claimBlocks: "1,000",
    tierColor: "emerald",
    items: [
      {
        slot: 0,
        name: "VIP Iron Helmet",
        nameColor: "#e2e8f0",
        count: 1,
        iconUrl: ASSET_ITEM("iron_helmet"),
        isEnchanted: true,
        type: "Armor",
        enchants: ["Protection II", "Unbreaking II"],
      },
      {
        slot: 1,
        name: "VIP Iron Chestplate",
        nameColor: "#e2e8f0",
        count: 1,
        iconUrl: ASSET_ITEM("iron_chestplate"),
        isEnchanted: true,
        type: "Armor",
        enchants: ["Protection II", "Unbreaking II"],
      },
      {
        slot: 2,
        name: "VIP Iron Leggings",
        nameColor: "#e2e8f0",
        count: 1,
        iconUrl: ASSET_ITEM("iron_leggings"),
        isEnchanted: true,
        type: "Armor",
        enchants: ["Protection II", "Unbreaking II"],
      },
      {
        slot: 3,
        name: "VIP Iron Boots",
        nameColor: "#e2e8f0",
        count: 1,
        iconUrl: ASSET_ITEM("iron_boots"),
        isEnchanted: true,
        type: "Armor",
        enchants: ["Protection II", "Unbreaking II"],
      },
      {
        slot: 4,
        name: "Shield",
        nameColor: "#67e8f9",
        count: 1,
        iconUrl: SHIELD_URL,
        type: "Utility",
      },
      {
        slot: 5,
        name: "Bow",
        nameColor: "#d8b4fe",
        count: 1,
        iconUrl: ASSET_ITEM("bow"),
        type: "Weapon",
      },
      {
        slot: 6,
        name: "Arrows",
        nameColor: "#fde047",
        count: 64,
        iconUrl: ASSET_ITEM("arrow"),
        type: "Ammunition",
      },
      {
        slot: 7,
        name: "$5,000 Cash Voucher",
        nameColor: "#4ade80",
        count: 1,
        iconUrl: ASSET_ITEM("paper"),
        isEnchanted: true,
        type: "Economy",
      },
      {
        slot: 8,
        name: "1,000 Claim Blocks",
        nameColor: "#facc15",
        count: 1,
        iconUrl: ASSET_ITEM("golden_shovel"),
        isEnchanted: true,
        type: "Protection",
      },
      {
        slot: 9,
        name: "VIP Iron Sword",
        nameColor: "#e2e8f0",
        count: 1,
        iconUrl: ASSET_ITEM("iron_sword"),
        isEnchanted: true,
        type: "Weapon",
        enchants: ["Sharpness II", "Unbreaking II"],
      },
      {
        slot: 10,
        name: "VIP Iron Pickaxe",
        nameColor: "#e2e8f0",
        count: 1,
        iconUrl: ASSET_ITEM("iron_pickaxe"),
        isEnchanted: true,
        type: "Tool",
        enchants: ["Efficiency II"],
      },
      {
        slot: 11,
        name: "VIP Iron Axe",
        nameColor: "#e2e8f0",
        count: 1,
        iconUrl: ASSET_ITEM("iron_axe"),
        type: "Tool",
      },
      {
        slot: 12,
        name: "VIP Iron Shovel",
        nameColor: "#e2e8f0",
        count: 1,
        iconUrl: ASSET_ITEM("iron_shovel"),
        type: "Tool",
      },
      {
        slot: 13,
        name: "Golden Apples",
        nameColor: "#fbbf24",
        count: 2,
        iconUrl: ASSET_ITEM("golden_apple"),
        type: "Consumable",
      },
      {
        slot: 14,
        name: "Diamonds",
        nameColor: "#67e8f9",
        count: 6,
        iconUrl: ASSET_ITEM("diamond"),
        type: "Mineral",
      },
      {
        slot: 15,
        name: "Iron Ingots",
        nameColor: "#e2e8f0",
        count: 16,
        iconUrl: ASSET_ITEM("iron_ingot"),
        type: "Mineral",
      },
      {
        slot: 16,
        name: "Gold Ingots",
        nameColor: "#facc15",
        count: 6,
        iconUrl: ASSET_ITEM("gold_ingot"),
        type: "Mineral",
      },
      {
        slot: 17,
        name: "Obsidian",
        nameColor: "#c084fc",
        count: 8,
        iconUrl: ASSET_BLOCK("obsidian"),
        type: "Building",
      },
      {
        slot: 18,
        name: "Oak Wood Logs",
        nameColor: "#fdba74",
        count: 32,
        iconUrl: ASSET_BLOCK("oak_log"),
        type: "Building",
      },
      {
        slot: 19,
        name: "Cobwebs",
        nameColor: "#f8fafc",
        count: 16,
        iconUrl: ASSET_BLOCK("cobweb"),
        type: "Tactical",
      },
      {
        slot: 20,
        name: "Water Bucket",
        nameColor: "#38bdf8",
        count: 1,
        iconUrl: ASSET_ITEM("water_bucket"),
        type: "Liquid",
      },
      {
        slot: 21,
        name: "Water Bucket",
        nameColor: "#38bdf8",
        count: 1,
        iconUrl: ASSET_ITEM("water_bucket"),
        type: "Liquid",
      },
      {
        slot: 22,
        name: "Lava Bucket",
        nameColor: "#fb923c",
        count: 1,
        iconUrl: ASSET_ITEM("lava_bucket"),
        type: "Liquid",
      },
      {
        slot: 26,
        name: "Kit Info & Cooldown",
        nameColor: "#e2e8f0",
        count: 1,
        iconUrl: ASSET_ITEM("clock_00"),
        type: "Information",
        lore: ["Command: /kit vip", "Cooldown: 1 Hour (60m)"],
      },
    ],
  },

  starter: {
    id: "kit-starter",
    slug: "starter",
    name: "Starter Kit",
    cooldown: "12 Hours",
    command: "/kit starter",
    money: "$500",
    claimBlocks: "100",
    tierColor: "slate",
    items: [
      {
        slot: 0,
        name: "Chainmail Helmet",
        nameColor: "#cbd5e1",
        count: 1,
        iconUrl: ASSET_ITEM("chainmail_helmet"),
        type: "Armor",
      },
      {
        slot: 1,
        name: "Chainmail Chestplate",
        nameColor: "#cbd5e1",
        count: 1,
        iconUrl: ASSET_ITEM("chainmail_chestplate"),
        type: "Armor",
      },
      {
        slot: 2,
        name: "Chainmail Leggings",
        nameColor: "#cbd5e1",
        count: 1,
        iconUrl: ASSET_ITEM("chainmail_leggings"),
        type: "Armor",
      },
      {
        slot: 3,
        name: "Chainmail Boots",
        nameColor: "#cbd5e1",
        count: 1,
        iconUrl: ASSET_ITEM("chainmail_boots"),
        type: "Armor",
      },
      {
        slot: 9,
        name: "Iron Sword",
        nameColor: "#cbd5e1",
        count: 1,
        iconUrl: ASSET_ITEM("iron_sword"),
        type: "Weapon",
      },
      {
        slot: 10,
        name: "Iron Pickaxe",
        nameColor: "#cbd5e1",
        count: 1,
        iconUrl: ASSET_ITEM("iron_pickaxe"),
        type: "Tool",
      },
      {
        slot: 11,
        name: "Iron Axe",
        nameColor: "#cbd5e1",
        count: 1,
        iconUrl: ASSET_ITEM("iron_axe"),
        type: "Tool",
      },
      {
        slot: 12,
        name: "Starter Golden Shovel",
        nameColor: "#facc15",
        count: 1,
        iconUrl: ASSET_ITEM("golden_shovel"),
        type: "Land Claiming",
        lore: ["Right-click corners to create your first protected claim!"],
      },
      {
        slot: 13,
        name: "Cooked Beef",
        nameColor: "#fb923c",
        count: 16,
        iconUrl: ASSET_ITEM("cooked_beef"),
        type: "Food",
      },
      {
        slot: 14,
        name: "Oak Planks",
        nameColor: "#fdba74",
        count: 32,
        iconUrl: ASSET_BLOCK("oak_planks"),
        type: "Building",
      },
      {
        slot: 26,
        name: "Kit Info & Cooldown",
        nameColor: "#e2e8f0",
        count: 1,
        iconUrl: ASSET_ITEM("clock_00"),
        type: "Information",
        lore: ["Command: /kit starter", "Cooldown: 12 Hours", "Free for all Survival SMP members!"],
      },
    ],
  },
};

interface MinecraftChestModalProps {
  kitSlug: string;
  onClose: () => void;
  onPurchase?: (kitId: string) => void;
}

export default function MinecraftChestModal({
  kitSlug,
  onClose,
  onPurchase,
}: MinecraftChestModalProps) {
  const [copied, setCopied] = useState(false);
  const [hoveredSlot, setHoveredSlot] = useState<number | null>(null);

  // Normalize slug (e.g. "kit-overlord" -> "overlord")
  const cleanSlug = kitSlug.replace(/^kit-/, "").toLowerCase();
  const kit = KITS_CHEST_DATA[cleanSlug] || KITS_CHEST_DATA.overlord;

  // Build a 27-slot map (3 rows x 9 columns)
  const slotMap: Record<number, ChestItem> = {};
  kit.items.forEach((item) => {
    slotMap[item.slot] = item;
  });

  const handleCopyCommand = () => {
    navigator.clipboard.writeText(kit.command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const hoveredItem = hoveredSlot !== null ? slotMap[hoveredSlot] : null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-200"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl bg-[#c6c6c6] text-[#3f3f3f] rounded-lg shadow-2xl overflow-hidden border-4 border-t-[#ffffff] border-l-[#ffffff] border-b-[#555555] border-r-[#555555] select-none font-sans"
        style={{
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.75), inset 2px 2px 0px #ffffff, inset -2px -2px 0px #555555",
        }}
      >
        {/* Chest Header */}
        <div className="px-4 py-2.5 bg-[#c6c6c6] flex items-center justify-between border-b-2 border-[#555555]">
          <div className="flex items-center gap-2">
            <span className="text-sm sm:text-base font-bold text-[#373737] tracking-wide font-mono uppercase">
              Chest • {kit.name} (27 Slots)
            </span>
          </div>

          <button
            onClick={onClose}
            className="w-6 h-6 rounded flex items-center justify-center bg-[#8f8f8f] hover:bg-[#a0a0a0] active:bg-[#707070] text-white border-2 border-t-[#ffffff] border-l-[#ffffff] border-b-[#373737] border-r-[#373737] text-xs font-bold transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 text-[#373737]" />
          </button>
        </div>

        {/* Chest Contents Area */}
        <div className="p-4 sm:p-6 bg-[#c6c6c6] space-y-4">
          {/* Quick Info Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-1.5 bg-[#b8b8b8] border-2 border-t-[#555555] border-l-[#555555] border-b-[#ffffff] border-r-[#ffffff] text-[11px] font-mono font-bold text-[#2e2e2e]">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-emerald-800">
                <span>💰 Cash:</span>
                <strong>{kit.money}</strong>
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-amber-900">
                <span>🛡️ Claims:</span>
                <strong>{kit.claimBlocks} Blocks</strong>
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[#474747]">⏱️ Cooldown:</span>
              <span className="px-1.5 py-0.2 bg-[#8f8f8f] text-white rounded text-[10px]">
                {kit.cooldown}
              </span>
            </div>
          </div>

          {/* Minecraft 9x3 Slot Inventory Grid */}
          <div className="p-3 bg-[#8f8f8f] border-2 border-t-[#373737] border-l-[#373737] border-b-[#ffffff] border-r-[#ffffff] rounded relative">
            <div className="grid grid-cols-9 gap-1 sm:gap-1.5 justify-items-center">
              {Array.from({ length: 27 }).map((_, index) => {
                const item = slotMap[index];
                const isHovered = hoveredSlot === index;

                return (
                  <div
                    key={index}
                    onMouseEnter={() => setHoveredSlot(index)}
                    onMouseLeave={() => setHoveredSlot(null)}
                    className={`w-9 h-9 sm:w-12 sm:h-12 bg-[#8b8b8b] border-2 border-t-[#373737] border-l-[#373737] border-b-[#ffffff] border-r-[#ffffff] relative flex items-center justify-center cursor-pointer transition-transform ${
                      isHovered ? "brightness-110 shadow-inner" : ""
                    }`}
                  >
                    {item ? (
                      <div className="relative w-full h-full p-1 flex items-center justify-center">
                        {/* Enchanted Glint Shimmer Effect */}
                        {item.isEnchanted && (
                          <div className="absolute inset-0 bg-purple-500/25 mix-blend-color-dodge rounded animate-pulse pointer-events-none z-10" />
                        )}

                        <img
                          src={item.iconUrl}
                          alt={item.name}
                          className="w-7 h-7 sm:w-9 sm:h-9 object-contain drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]"
                          style={{ imageRendering: "pixelated" }}
                          onError={(e) => {
                            // Fallback if image fails
                            (e.target as HTMLElement).style.display = "none";
                          }}
                        />

                        {/* Stack Count Badge */}
                        {item.count && item.count > 1 && (
                          <span
                            className="absolute bottom-0 right-0.5 sm:bottom-0.5 sm:right-1 text-[10px] sm:text-xs font-black text-white font-mono leading-none z-20"
                            style={{
                              textShadow:
                                "1px 1px 0px #000, -1px -1px 0px #000, 1px -1px 0px #000, -1px 1px 0px #000, 0 1px 3px rgba(0,0,0,0.9)",
                            }}
                          >
                            {item.count}
                          </span>
                        )}

                        {/* Slot Selection Overlay */}
                        {isHovered && (
                          <div className="absolute inset-0 bg-white/30 pointer-events-none z-30" />
                        )}
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Minecraft Interactive Lore / Tooltip Card */}
          <div className="min-h-[96px] bg-[#100010] border-2 border-[#2b0058] rounded p-3 text-xs shadow-2xl relative">
            {hoveredItem ? (
              <div className="space-y-1 animate-in fade-in duration-100">
                <div className="flex items-center justify-between">
                  <h4
                    className="font-bold text-sm tracking-wide font-mono"
                    style={{ color: hoveredItem.nameColor || "#55ffff" }}
                  >
                    {hoveredItem.name} {hoveredItem.count && hoveredItem.count > 1 ? `x${hoveredItem.count}` : ""}
                  </h4>
                  <span className="text-[10px] text-[#aaaaaa] font-mono uppercase bg-[#220033] px-2 py-0.5 rounded border border-[#440066]">
                    {hoveredItem.type}
                  </span>
                </div>

                {/* Enchantments */}
                {hoveredItem.enchants && hoveredItem.enchants.length > 0 && (
                  <div className="space-y-0.5 pt-0.5">
                    {hoveredItem.enchants.map((ench, i) => (
                      <p key={i} className="text-[#55ffff] font-mono text-[11px] leading-tight">
                        {ench}
                      </p>
                    ))}
                  </div>
                )}

                {/* Lore */}
                {hoveredItem.lore && hoveredItem.lore.length > 0 && (
                  <div className="pt-1 border-t border-[#330044] space-y-0.5">
                    {hoveredItem.lore.map((line, i) => (
                      <p key={i} className="text-[#aa00aa] italic font-mono text-[11px] leading-snug">
                        {line}
                      </p>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full py-4 text-center text-[#888888] font-mono text-xs">
                <span>Hover over any item inside the chest to inspect enchants and lore.</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-[#b0b0b0] border-t-2 border-[#ffffff] flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            onClick={handleCopyCommand}
            className="w-full sm:w-auto px-4 py-2 bg-[#8f8f8f] hover:bg-[#a0a0a0] active:bg-[#707070] text-[#1c1c1c] border-2 border-t-[#ffffff] border-l-[#ffffff] border-b-[#373737] border-r-[#373737] rounded text-xs font-bold font-mono flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-800" />
                <span className="text-emerald-900">Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy: {kit.command}</span>
              </>
            )}
          </button>

          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-[#8f8f8f] hover:bg-[#999999] active:bg-[#707070] text-[#222222] border-2 border-t-[#ffffff] border-l-[#ffffff] border-b-[#373737] border-r-[#373737] rounded text-xs font-bold cursor-pointer"
            >
              Close Chest (ESC)
            </button>

            {onPurchase && kit.price && (
              <button
                onClick={() => {
                  onPurchase(kit.id);
                  onClose();
                }}
                className="w-full sm:w-auto px-5 py-2 bg-[#2e7d32] hover:bg-[#388e3c] active:bg-[#1b5e20] text-white border-2 border-t-[#81c784] border-l-[#81c784] border-b-[#1b5e20] border-r-[#1b5e20] rounded text-xs font-black uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Buy Kit (₹{kit.price / 100})</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
