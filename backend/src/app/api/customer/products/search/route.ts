import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";
    const category = searchParams.get("category");
    const gender = searchParams.get("gender");
    const minPrice = searchParams.get("minPrice") ? parseFloat(searchParams.get("minPrice")!) : undefined;
    const maxPrice = searchParams.get("maxPrice") ? parseFloat(searchParams.get("maxPrice")!) : undefined;
    const sortBy = searchParams.get("sort") || "newest"; // "price_asc" | "price_desc" | "newest"

    const whereClause: any = {
      moderationStatus: "APPROVED",
      shop: {
        status: "APPROVED",
      },
    };

    if (query) {
      whereClause.OR = [
        { name: { contains: query, mode: "insensitive" } },
        { brand: { contains: query, mode: "insensitive" } },
        { category: { contains: query, mode: "insensitive" } },
        { description: { contains: query, mode: "insensitive" } },
      ];
    }

    if (category) {
      whereClause.category = { contains: category, mode: "insensitive" };
    }

    if (gender) {
      whereClause.attributes = {
        path: ["gender"],
        equals: gender,
      };
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      whereClause.price = {};
      if (minPrice !== undefined) whereClause.price.gte = minPrice;
      if (maxPrice !== undefined) whereClause.price.lte = maxPrice;
    }

    const products = await prisma.product.findMany({
      where: whereClause,
      include: {
        shop: {
          select: {
            id: true,
            name: true,
            slug: true,
            phone: true,
            address: true,
            area: true,
            city: true,
            latitude: true,
            longitude: true,
            googleMapsPin: true,
            shopImage: true,
          },
        },
      },
      take: 50,
    });

    const formatted = products.map((prod) => {
      const attrs = (prod.attributes as Record<string, any>) || {};
      return {
        id: prod.id,
        name: prod.name,
        brand: prod.brand,
        description: prod.description,
        price: prod.price,
        mrp: prod.mrp,
        discountPercent: prod.mrp && prod.mrp > prod.price
          ? Math.round(((prod.mrp - prod.price) / prod.mrp) * 100)
          : 0,
        category: prod.category,
        attributes: attrs,
        subcategory: attrs.type || null,
        gender: attrs.gender || null,
        sizes: attrs.sizes ? (Array.isArray(attrs.sizes) ? attrs.sizes : String(attrs.sizes).split(",").map((s) => s.trim())) : [],
        colors: attrs.colors || attrs.colour ? (Array.isArray(attrs.colors || attrs.colour) ? attrs.colors || attrs.colour : String(attrs.colors || attrs.colour).split(",").map((c) => c.trim())) : [],
        stockStatus: prod.stockStatus,
        images: (() => {
          try {
            return JSON.parse(prod.images);
          } catch {
            return [prod.images];
          }
        })(),
        createdAt: prod.createdAt,
        shop: {
          id: prod.shop.id,
          name: prod.shop.name,
          slug: prod.shop.slug,
          phone: prod.shop.phone,
          address: prod.shop.address,
          area: prod.shop.area,
          city: prod.shop.city,
          latitude: prod.shop.latitude,
          longitude: prod.shop.longitude,
          googleMapsPin: prod.shop.googleMapsPin,
          shopImage: prod.shop.shopImage,
        },
      };
    });

    // Sorting
    if (sortBy === "price_asc") {
      formatted.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price_desc") {
      formatted.sort((a, b) => b.price - a.price);
    } else {
      formatted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return NextResponse.json({
      success: true,
      count: formatted.length,
      products: formatted,
    });
  } catch (error: any) {
    console.error("search products error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to search products" },
      { status: 500 }
    );
  }
}
