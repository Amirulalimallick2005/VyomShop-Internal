import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateDistanceKm } from "@/lib/geo";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const userLat = parseFloat(searchParams.get("lat") || "28.6139");
    const userLng = parseFloat(searchParams.get("lng") || "77.2090");

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        shop: true,
      },
    });

    if (!product || product.moderationStatus !== "APPROVED" || product.shop.status !== "APPROVED") {
      return NextResponse.json(
        { success: false, error: "Product not found or unavailable" },
        { status: 404 }
      );
    }

    const distance = calculateDistanceKm(
      userLat,
      userLng,
      product.shop.latitude,
      product.shop.longitude
    );

    // Other products from this shop
    const otherProducts = await prisma.product.findMany({
      where: {
        shopId: product.shopId,
        id: { not: product.id },
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
    });

    return NextResponse.json({
      success: true,
      product: {
        id: product.id,
        name: product.name,
        brand: product.brand,
        description: product.description,
        price: product.price,
        mrp: product.mrp,
        category: product.category,
        subcategory: product.subcategory,
        gender: product.gender,
        sizes: product.sizes ? product.sizes.split(",").map((s) => s.trim()) : [],
        colors: product.colors ? product.colors.split(",").map((c) => c.trim()) : [],
        stockStatus: product.stockStatus,
        images: (() => {
          try {
            return JSON.parse(product.images);
          } catch {
            return [product.images];
          }
        })(),
        createdAt: product.createdAt,
        shop: {
          id: product.shop.id,
          name: product.shop.name,
          slug: product.shop.slug,
          phone: product.shop.phone,
          address: product.shop.address,
          area: product.shop.area,
          city: product.shop.city,
          latitude: product.shop.latitude,
          longitude: product.shop.longitude,
          googleMapsPin: product.shop.googleMapsPin,
          shopImage: product.shop.shopImage,
          timings: product.shop.timings,
          distanceKm: distance,
        },
        otherShopProducts: otherProducts.map((p) => ({
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
        })),
      },
    });
  } catch (error: any) {
    console.error("get product error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch product" },
      { status: 500 }
    );
  }
}
