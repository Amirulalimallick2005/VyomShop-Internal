import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/authHelper";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const authContext = await getAuthSession(req);

  if (!authContext) {
    return NextResponse.json(
      { success: false, error: "Unauthorized: Invalid or missing Firebase token" },
      { status: 401 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: authContext.firebaseUid },
    include: {
      shops: {
        include: {
          _count: {
            select: { products: true, transactions: true },
          },
        },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
  }

  const shop = user.shops[0] || null;

  return NextResponse.json({
    success: true,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phoneNumber: user.phoneNumber,
      image: user.image,
      createdAt: user.createdAt,
    },
    shop: shop
      ? {
          id: shop.id,
          name: shop.name,
          slug: shop.slug,
          status: shop.status,
          creditsBalance: shop.creditsBalance,
          phone: shop.phone,
          address: shop.address,
          area: shop.area,
          city: shop.city,
          latitude: shop.latitude,
          longitude: shop.longitude,
          shopImage: shop.shopImage,
          bannerImage: shop.bannerImage,
          productsCount: shop._count.products,
          totalViews: shop.totalViews,
          directionClicks: shop.directionClicks,
          callClicks: shop.callClicks,
        }
      : null,
  });
}
