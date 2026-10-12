import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/authHelper";

export async function GET(req: NextRequest) {
  const authRes = await requireAuth(req, ["SELLER", "SUPER_ADMIN", "ADMIN"]);
  if ("response" in authRes) return authRes.response;

  const { authContext } = authRes;

  const shop = await prisma.shop.findFirst({
    where: { ownerId: authContext.user.id },
    include: {
      transactions: {
        orderBy: { createdAt: "desc" },
        take: 50,
      },
    },
  });

  if (!shop) {
    return NextResponse.json({ success: false, error: "Shop not found" }, { status: 404 });
  }

  return NextResponse.json({
    success: true,
    creditsBalance: shop.creditsBalance,
    shopId: shop.id,
    transactions: shop.transactions,
  });
}
