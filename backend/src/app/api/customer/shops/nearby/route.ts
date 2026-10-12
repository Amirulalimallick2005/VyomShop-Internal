import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateDistanceKm } from "@/lib/geo";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userLat = parseFloat(searchParams.get("lat") || "28.6139"); // Default Delhi
    const userLng = parseFloat(searchParams.get("lng") || "77.2090");
    const radiusKm = parseFloat(searchParams.get("radius") || "25");
    const areaFilter = searchParams.get("area");
    const category = searchParams.get("category");
    const search = searchParams.get("q");

    const whereClause: any = {
      status: "APPROVED",
    };

    if (areaFilter) {
      whereClause.area = { contains: areaFilter };
    }

    if (search) {
      whereClause.OR = [
        { name: { contains: search } },
        { description: { contains: search } },
        { area: { contains: search } },
      ];
    }

    if (category) {
      whereClause.products = {
        some: {
          category: { contains: category },
          stockStatus: { in: ["IN_STOCK", "LIMITED"] },
          moderationStatus: "APPROVED",
        },
      };
    }

    const shops = await prisma.shop.findMany({
      where: whereClause,
      include: {
        products: {
          where: {
            stockStatus: { in: ["IN_STOCK", "LIMITED"] },
            moderationStatus: "APPROVED",
          },
          take: 4,
          select: {
            id: true,
            name: true,
            price: true,
            images: true,
            category: true,
          },
        },
        _count: {
          select: {
            products: {
              where: {
                stockStatus: { in: ["IN_STOCK", "LIMITED"] },
                moderationStatus: "APPROVED",
              },
            },
          },
        },
      },
    });

    // Map distance and filter within radius
    const enrichedShops = shops
      .map((shop) => {
        const distance = calculateDistanceKm(userLat, userLng, shop.latitude, shop.longitude);
        return {
          id: shop.id,
          name: shop.name,
          slug: shop.slug,
          description: shop.description,
          phone: shop.phone,
          address: shop.address,
          area: shop.area,
          city: shop.city,
          latitude: shop.latitude,
          longitude: shop.longitude,
          googleMapsPin: shop.googleMapsPin,
          shopImage: shop.shopImage,
          bannerImage: shop.bannerImage,
          timings: shop.timings,
          distanceKm: distance,
          activeProductsCount: shop._count.products,
          featuredProducts: shop.products.map((p) => ({
            id: p.id,
            name: p.name,
            price: p.price,
            images: (() => {
              try {
                return JSON.parse(p.images);
              } catch {
                return [p.images];
              }
            })(),
            category: p.category,
          })),
        };
      })
      .filter((s) => s.distanceKm <= radiusKm)
      .sort((a, b) => a.distanceKm - b.distanceKm);

    return NextResponse.json({
      success: true,
      count: enrichedShops.length,
      userLocation: { lat: userLat, lng: userLng },
      shops: enrichedShops,
    });
  } catch (error: any) {
    console.error("nearby shops error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch nearby shops" },
      { status: 500 }
    );
  }
}
