import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAuthSession } from "@/lib/authHelper";

export async function POST(req: NextRequest) {
  try {
    const authContext = await getAuthSession(req);
    const body = await req.json();
    const { eventType, shopId, productId, metadata } = body;

    if (!eventType || !["VIEW", "GET_DIRECTION", "CALL", "SEARCH"].includes(eventType.toUpperCase())) {
      return NextResponse.json(
        { success: false, error: "Valid eventType is required ('VIEW', 'GET_DIRECTION', 'CALL', 'SEARCH')" },
        { status: 400 }
      );
    }

    const type = eventType.toUpperCase();

    // 1. Log event
    await prisma.analyticsLog.create({
      data: {
        eventType: type,
        shopId: shopId || null,
        productId: productId || null,
        userId: authContext?.user?.id || null,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    });

    // 2. Increment counters on shop / product
    if (shopId) {
      if (type === "VIEW") {
        await prisma.shop.update({
          where: { id: shopId },
          data: { totalViews: { increment: 1 } },
        });
      } else if (type === "GET_DIRECTION") {
        await prisma.shop.update({
          where: { id: shopId },
          data: { directionClicks: { increment: 1 } },
        });
      } else if (type === "CALL") {
        await prisma.shop.update({
          where: { id: shopId },
          data: { callClicks: { increment: 1 } },
        });
      }
    }

    if (productId) {
      if (type === "VIEW") {
        await prisma.product.update({
          where: { id: productId },
          data: { totalViews: { increment: 1 } },
        });
      } else if (type === "GET_DIRECTION") {
        await prisma.product.update({
          where: { id: productId },
          data: { totalDirections: { increment: 1 } },
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `Event ${type} recorded successfully`,
    });
  } catch (error: any) {
    console.error("analytics event error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to record event" },
      { status: 500 }
    );
  }
}
