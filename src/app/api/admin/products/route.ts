import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { verifyAdmin, handleAdminError } from "@/lib/adminAuth";
import { z } from "zod";

const productSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2),
  slug: z.string().min(2),
  description: z.string().min(5),
  category: z.enum(["RANK", "KIT", "CRATE", "COINS", "ITEM"]),
  price: z.number().int().positive("Price must be a positive integer in minor units"),
  duration: z.string().default("LIFETIME"),
  perks: z.string().default("[]"),
  deliveryConfig: z.string().default("{}"),
  active: z.boolean().default(true),
  featured: z.boolean().default(false),
  badgeColor: z.string().default("emerald"),
});

export async function GET(req: Request) {
  try {
    const { user: admin, error: authError } = await verifyAdmin(req);
    if (authError || !admin) return authError!;

    const products = await prisma.product.findMany({
      orderBy: [{ sortOrder: "asc" }, { price: "asc" }],
    });
    return NextResponse.json({ products });
  } catch (error: any) {
    return handleAdminError(error, "Failed to fetch products");
  }
}

export async function POST(req: Request) {
  try {
    const { user: admin, error: authError } = await verifyAdmin(req);
    if (authError || !admin) return authError!;

    const body = await req.json();
    const parsed = productSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues[0]?.message }, { status: 400 });
    }

    const data = parsed.data;

    let product;
    if (data.id) {
      product = await prisma.product.update({
        where: { id: data.id },
        data: {
          name: data.name,
          slug: data.slug,
          description: data.description,
          category: data.category,
          price: data.price,
          duration: data.duration,
          perks: data.perks,
          deliveryConfig: data.deliveryConfig,
          active: data.active,
          featured: data.featured,
          badgeColor: data.badgeColor,
        },
      });

      await prisma.auditLog.create({
        data: {
          actorId: admin.id,
          actorEmail: admin.email,
          action: "UPDATE_PRODUCT",
          targetEntity: "Product",
          targetId: product.id,
          metadata: JSON.stringify({ name: product.name, price: product.price }),
        },
      });
    } else {
      product = await prisma.product.create({
        data: {
          name: data.name,
          slug: data.slug,
          description: data.description,
          category: data.category,
          price: data.price,
          currency: "INR",
          duration: data.duration,
          perks: data.perks,
          deliveryConfig: data.deliveryConfig,
          active: data.active,
          featured: data.featured,
          badgeColor: data.badgeColor,
        },
      });

      await prisma.auditLog.create({
        data: {
          actorId: admin.id,
          actorEmail: admin.email,
          action: "CREATE_PRODUCT",
          targetEntity: "Product",
          targetId: product.id,
          metadata: JSON.stringify({ name: product.name, price: product.price }),
        },
      });
    }

    return NextResponse.json({ success: true, product });
  } catch (error: any) {
    return handleAdminError(error, "Failed to save product");
  }
}
