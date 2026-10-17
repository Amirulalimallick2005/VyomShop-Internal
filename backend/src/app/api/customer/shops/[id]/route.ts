import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const shop = await prisma.shop.findFirst({
      where: {
        OR: [{ id }, { slug: id }],
        status: "APPROVED",
      },
      include: {
        products: {
          where: {
            moderationStatus: "APPROVED",
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!shop) {
      return NextResponse.json(
        { success: false, error: "Shop not found or not currently active" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      shop: {
        id: shop.id,
        name: shop.name,
        slug: shop.slug,
        description: shop.description,
        phone: shop.phone,
        email: shop.email,
        address: shop.address,
        area: shop.area,
        city: shop.city,
        pincode: shop.pincode,
        latitude: shop.latitude,
        longitude: shop.longitude,
        googleMapsPin: shop.googleMapsPin,
        shopImage: shop.shopImage,
        bannerImage: shop.bannerImage,
        timings: shop.timings,
        productsCount: shop.products.length,
        products: shop.products.map((p) => {
          const attrs = (p.attributes as Record<string, any>) || {};
          return {
            id: p.id,
            name: p.name,
            description: p.description,
            brand: p.brand,
            price: p.price,
            mrp: p.mrp,
            category: p.category,
            attributes: attrs,
            subcategory: attrs.type || null,
            gender: attrs.gender || null,
            sizes: attrs.sizes ? (Array.isArray(attrs.sizes) ? attrs.sizes : String(attrs.sizes).split(",").map((s) => s.trim())) : [],
            colors: attrs.colors || attrs.colour ? (Array.isArray(attrs.colors || attrs.colour) ? attrs.colors || attrs.colour : String(attrs.colors || attrs.colour).split(",").map((c) => c.trim())) : [],
            stockStatus: p.stockStatus,
            images: (() => {
              try {
                return JSON.parse(p.images);
              } catch {
                return [p.images];
              }
            })(),
            createdAt: p.createdAt,
          };
        }),
      },
    });
  } catch (error: any) {
    console.error("get shop by id error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch shop" },
      { status: 500 }
    );
  }
}
