import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/authHelper";

export async function GET(req: NextRequest) {
  const authRes = await requireAuth(req, ["SUPER_ADMIN", "ADMIN"]);
  if ("response" in authRes) return authRes.response;

  try {
    const { searchParams } = new URL(req.url);
    const start = parseInt(searchParams.get("_start") || "0", 10);
    const end = parseInt(searchParams.get("_end") || "20", 10);
    const take = Math.max(1, end - start);
    const skip = Math.max(0, start);
    const sortField = searchParams.get("_sort") || "createdAt";
    const sortOrder = (searchParams.get("_order") || "desc").toLowerCase() === "asc" ? "asc" : "desc";
    const moderationStatus = searchParams.get("moderationStatus");
    const stockStatus = searchParams.get("stockStatus");
    const category = searchParams.get("category");
    const shopId = searchParams.get("shopId");
    const q = searchParams.get("q");

    const where: any = {};
    if (moderationStatus) where.moderationStatus = moderationStatus;
    if (stockStatus) where.stockStatus = stockStatus;
    if (category) where.category = category;
    if (shopId) where.shopId = shopId;
    if (q) {
      where.OR = [
        { name: { contains: q } },
        { brand: { contains: q } },
        { category: { contains: q } },
      ];
    }

    const [total, products] = await Promise.all([
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        skip,
        take,
        orderBy: { [sortField]: sortOrder },
        include: {
          shop: {
            select: { id: true, name: true, area: true, phone: true },
          },
        },
      }),
    ]);

    const formatted = products.map((p) => ({
      id: p.id,
      name: p.name,
      description: p.description,
      brand: p.brand,
      price: p.price,
      mrp: p.mrp,
      category: p.category,
      subcategory: p.subcategory,
      gender: p.gender,
      sizes: p.sizes,
      colors: p.colors,
      stockStatus: p.stockStatus,
      moderationStatus: p.moderationStatus,
      totalViews: p.totalViews,
      totalDirections: p.totalDirections,
      images: (() => {
        try {
          return JSON.parse(p.images);
        } catch {
          return [p.images];
        }
      })(),
      shopId: p.shopId,
      shop: p.shop,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));

    return new NextResponse(JSON.stringify(formatted), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "x-total-count": total.toString(),
        "Access-Control-Expose-Headers": "x-total-count",
      },
    });
  } catch (error: any) {
    console.error("admin products error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load products" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const authRes = await requireAuth(req, ["SUPER_ADMIN", "ADMIN"]);
  if ("response" in authRes) return authRes.response;

  try {
    const body = await req.json();
    const {
      shopId,
      name,
      description,
      brand,
      price,
      mrp,
      category,
      subcategory,
      gender,
      sizes,
      colors,
      stockStatus = "IN_STOCK",
      moderationStatus = "APPROVED",
      images = [],
    } = body;

    const newProduct = await prisma.product.create({
      data: {
        shopId,
        name,
        description,
        brand,
        price: parseFloat(price),
        mrp: mrp ? parseFloat(mrp) : null,
        category,
        subcategory,
        gender,
        sizes: Array.isArray(sizes) ? sizes.join(", ") : sizes || "",
        colors: Array.isArray(colors) ? colors.join(", ") : colors || "",
        stockStatus,
        moderationStatus,
        images: JSON.stringify(Array.isArray(images) ? images : [images]),
      },
    });

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
