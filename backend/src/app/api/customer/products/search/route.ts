import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateDistanceKm } from "@/lib/geo";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";
    const category = searchParams.get("category");
    const gender = searchParams.get("gender");
    const minPrice = searchParams.get("minPrice") ? parseFloat(searchParams.get("minPrice")!) : undefined;
    const maxPrice = searchParams.get("maxPrice") ? parseFloat(searchParams.get("maxPrice")!) : undefined;
    const userLat = parseFloat(searchParams.get("lat") || "28.6139");
    const userLng = parseFloat(searchParams.get("lng") || "77.2090");
    const sortBy = searchParams.get("sort") || "distance"; // "distance" | "price_asc" | "price_desc" | "newest"

    const whereClause: any = {
      moderationStatus: "APPROVED",
      shop: {
        status: "APPROVED",
      },
    };

    if (query) {
      whereClause.OR = [
        { name: { contains: query } },
        { brand: { contains: query } },
        { category: { contains: query } },
        { subcategory: { contains: query } },
        { description: { contains: query } },
      ];
    }

    if (category) {
      whereClause.category = { contains: category };
    }

    if (gender) {
      whereClause.gender = gender;
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
            timings: true,
          },
        },
      },
    });

    // Enrich with distance to shop
    let results = products.map((prod) => {
      const distance = calculateDistanceKm(
        userLat,
        userLng,
        prod.shop.latitude,
        prod.shop.longitude
      );

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
        subcategory: prod.subcategory,
        gender: prod.gender,
        sizes: prod.sizes ? prod.sizes.split(",").map((s) => s.trim()) : [],
        colors: prod.colors ? prod.colors.split(",").map((c) => c.trim()) : [],
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
          distanceKm: distance,
        },
      };
    });

    // Sorting
    if (sortBy === "price_asc") {
      results.sort((a, b) => a.price - b.price);
    } else if (sortBy === "price_desc") {
      results.sort((a, b) => b.price - a.price);
    } else if (sortBy === "newest") {
      results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else {
      // Default: distance
      results.sort((a, b) => a.shop.distanceKm - b.shop.distanceKm);
    }

    return NextResponse.json({
      success: true,
      count: results.length,
      query,
      userLocation: { lat: userLat, lng: userLng },
      products: results,
    });
  } catch (error: any) {
    console.error("product search error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to search products" },
      { status: 500 }
    );
  }
}
