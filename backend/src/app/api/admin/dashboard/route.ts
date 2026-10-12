import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/authHelper";

export async function GET(req: NextRequest) {
  const authRes = await requireAuth(req, ["SUPER_ADMIN", "ADMIN"]);
  if ("response" in authRes) return authRes.response;

  try {
    const [
      totalShops,
      approvedShops,
      pendingShops,
      totalProducts,
      totalUsers,
      transactionsAgg,
      totalAnalyticsEvents,
      recentPendingShops,
      recentTransactions,
    ] = await Promise.all([
      prisma.shop.count(),
      prisma.shop.count({ where: { status: "APPROVED" } }),
      prisma.shop.count({ where: { status: "PENDING" } }),
      prisma.product.count(),
      prisma.user.count(),
      prisma.transaction.aggregate({
        where: { status: "SUCCESS" },
        _sum: { amount: true, creditsAdded: true, creditsDeducted: true },
        _count: true,
      }),
      prisma.analyticsLog.count(),
      prisma.shop.findMany({
        where: { status: "PENDING" },
        include: { owner: { select: { name: true, email: true, phoneNumber: true } } },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.transaction.findMany({
        include: { shop: { select: { name: true } }, package: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
        take: 6,
      }),
    ]);

    // Aggregate direction clicks and calls across all shops
    const shopsEngagement = await prisma.shop.aggregate({
      _sum: {
        totalViews: true,
        directionClicks: true,
        callClicks: true,
      },
    });

    // Market / Area distribution
    const areas = await prisma.shop.groupBy({
      by: ["area"],
      _count: { id: true },
    });

    return NextResponse.json({
      success: true,
      metrics: {
        totalShops,
        approvedShops,
        pendingShops,
        totalProducts,
        totalUsers,
        totalRevenue: transactionsAgg._sum.amount || 0,
        totalCreditsSold: transactionsAgg._sum.creditsAdded || 0,
        totalCreditsUsed: transactionsAgg._sum.creditsDeducted || 0,
        totalTransactionsCount: transactionsAgg._count,
        totalViews: shopsEngagement._sum.totalViews || 0,
        totalDirections: shopsEngagement._sum.directionClicks || 0,
        totalCalls: shopsEngagement._sum.callClicks || 0,
        totalEventsLogged: totalAnalyticsEvents,
      },
      areaDistribution: areas.map((a) => ({
        area: a.area || "Other",
        shopCount: a._count.id,
      })),
      recentPendingShops,
      recentTransactions,
    });
  } catch (error: any) {
    console.error("admin dashboard error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load dashboard metrics" },
      { status: 500 }
    );
  }
}
