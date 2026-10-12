import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/authHelper";

export async function GET(req: NextRequest) {
  const authRes = await requireAuth(req, ["SUPER_ADMIN", "ADMIN"]);
  if ("response" in authRes) return authRes.response;

  try {
    const { searchParams } = new URL(req.url);
    const start = parseInt(searchParams.get("_start") || "0", 10);
    const end = parseInt(searchParams.get("_end") || "20", 10);
    const take = Math.max(1, end - start);
    const skip = Math.max(0, start);
    const sortField = searchParams.get("_sort") || "createdAt";
    const sortOrder = (searchParams.get("_order") || "desc").toLowerCase() === "asc" ? "asc" : "desc";
    const status = searchParams.get("status");
    const type = searchParams.get("type");
    const shopId = searchParams.get("shopId");

    const where: any = {};
    if (status) where.status = status;
    if (type) where.type = type;
    if (shopId) where.shopId = shopId;

    const [total, transactions] = await Promise.all([
      prisma.transaction.count({ where }),
      prisma.transaction.findMany({
        where,
        skip,
        take,
        orderBy: { [sortField]: sortOrder },
        include: {
          shop: { select: { id: true, name: true, phone: true } },
          package: { select: { id: true, name: true, price: true } },
        },
      }),
    ]);

    return new NextResponse(JSON.stringify(transactions), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "x-total-count": total.toString(),
        "Access-Control-Expose-Headers": "x-total-count",
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const authRes = await requireAuth(req, ["SUPER_ADMIN", "ADMIN"]);
  if ("response" in authRes) return authRes.response;

  try {
    const body = await req.json();
    const { shopId, amount = 0, creditsToAdd = 0, type = "BONUS", notes } = body;

    if (!shopId) {
      return NextResponse.json({ error: "shopId is required" }, { status: 400 });
    }

    const shop = await prisma.shop.findUnique({ where: { id: shopId } });
    if (!shop) {
      return NextResponse.json({ error: "Shop not found" }, { status: 404 });
    }

    const added = parseInt(creditsToAdd, 10) || 0;

    const [updatedShop, tx] = await prisma.$transaction([
      prisma.shop.update({
        where: { id: shopId },
        data: { creditsBalance: { increment: added } },
      }),
      prisma.transaction.create({
        data: {
          shopId,
          amount: parseFloat(amount) || 0,
          creditsAdded: added,
          type: type || "MANUAL_ADJUST",
          paymentGateway: "SuperAdmin",
          status: "SUCCESS",
          notes: notes || `Admin adjustment: +${added} credits`,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: `Granted ${added} credits to ${shop.name}`,
      newCreditsBalance: updatedShop.creditsBalance,
      transaction: tx,
    }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
