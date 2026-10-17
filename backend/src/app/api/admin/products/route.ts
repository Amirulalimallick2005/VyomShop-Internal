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
    const q = searchParams.get("q");

    const where: any = {};
    if (q) {
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { brand: { contains: q, mode: "insensitive" } },
        { category: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
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

    const formatted = products.map((p) => {
      const attrs = (p.attributes as Record<string, any>) || {};
      return {
        id: p.id,
        name: p.name,
        description: p.description,
        brand: p.brand,
        price: p.price,
        mrp: p.mrp,
        category: p.category,
        stockStatus: p.stockStatus,
        moderationStatus: p.moderationStatus,
        totalViews: p.totalViews,
        totalDirections: p.totalDirections,
        attributes: attrs,
        subcategory: attrs.type || null,
        gender: attrs.gender || null,
        sizes: attrs.sizes ? (Array.isArray(attrs.sizes) ? attrs.sizes.join(", ") : String(attrs.sizes)) : null,
        colors: attrs.colors || attrs.colour ? (Array.isArray(attrs.colors || attrs.colour) ? (attrs.colors || attrs.colour).join(", ") : String(attrs.colors || attrs.colour)) : null,
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
      };
    });

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
      stockStatus = "IN_STOCK",
      moderationStatus = "APPROVED",
      images = [],
      attributes = {},
      subcategory,
      gender,
      sizes,
      colors,
    } = body;

    const attributesObj: Record<string, any> = {
      ...(typeof attributes === "object" && attributes !== null ? attributes : {}),
    };
    if (gender !== undefined && !attributesObj.gender) attributesObj.gender = gender;
    if (sizes !== undefined && !attributesObj.sizes) {
      attributesObj.sizes = Array.isArray(sizes) ? sizes : String(sizes).split(",").map((s) => s.trim());
    }
    if (colors !== undefined && !attributesObj.colors && !attributesObj.colour) {
      attributesObj.colour = Array.isArray(colors) ? colors : String(colors).split(",").map((c) => c.trim());
    }
    if (subcategory !== undefined && !attributesObj.type) attributesObj.type = subcategory;

    const newProduct = await prisma.product.create({
      data: {
        shopId,
        name,
        description,
        brand,
        price: parseFloat(price),
        mrp: mrp ? parseFloat(mrp) : null,
        category,
        stockStatus,
        moderationStatus,
        attributes: attributesObj,
        images: JSON.stringify(Array.isArray(images) ? images : [images]),
      },
    });

    return NextResponse.json(newProduct, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
