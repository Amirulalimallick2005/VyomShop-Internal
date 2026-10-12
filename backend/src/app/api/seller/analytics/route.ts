import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/authHelper";

export async function GET(req: NextRequest) {
  const authRes = await requireAuth(req, ["SELLER", "SUPER_ADMIN", "ADMIN"]);
  if ("response" in authRes) return authRes.response;

  const { authContext } = authRes;

  const shop = await prisma.shop.findFirst({
    where: { ownerId: authContext.user.id },
  });

  if (!shop) {
    return NextResponse.json({ success: false, error: "Shop not found" }, { status: 404 });
  }

  // Aggregate product views & directions
  const products = await prisma.product.findMany({
    where: { shopId: shop.id },
    select: {
      id: true,
      name: true,
      totalViews: true,
      totalDirections: true,
      stockStatus: true,
      price: true,
    },
    orderBy: { totalViews: "desc" },
    take: 10,
  });

  // Recent 30 days events
  const recentLogs = await prisma.analyticsLog.findMany({
    where: { shopId: shop.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json({
    success: true,
    shopId: shop.id,
    stats: {
      totalViews: shop.totalViews,
      directionClicks: shop.directionClicks,
      callClicks: shop.callClicks,
      conversionRate: shop.totalViews > 0
        ? Math.round((shop.directionClicks / shop.totalViews) * 100 * 10) / 10
        : 0,
    },
    topProducts: products,
    recentEvents: recentLogs,
  });
}
