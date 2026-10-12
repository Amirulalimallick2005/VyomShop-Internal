import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/authHelper";

export async function POST(req: NextRequest) {
  const authRes = await requireAuth(req, ["SELLER", "SUPER_ADMIN", "ADMIN"]);
  if ("response" in authRes) return authRes.response;

  const { authContext } = authRes;

  try {
    const shop = await prisma.shop.findFirst({
      where: { ownerId: authContext.user.id },
    });

    if (!shop) {
      return NextResponse.json({ success: false, error: "Shop not found" }, { status: 404 });
    }

    const body = await req.json();
    const { transactionId, paymentId, orderId } = body;

    if (!transactionId) {
      return NextResponse.json(
        { success: false, error: "transactionId is required" },
        { status: 400 }
      );
    }

    const transaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!transaction || transaction.shopId !== shop.id) {
      return NextResponse.json(
        { success: false, error: "Transaction not found or belongs to another shop" },
        { status: 404 }
      );
    }

    if (transaction.status === "SUCCESS") {
      return NextResponse.json({
        success: true,
        message: "Payment already verified",
        creditsBalance: shop.creditsBalance,
      });
    }

    const effectivePaymentId = paymentId || `pay_mock_${Date.now()}`;

    // Atomically mark transaction SUCCESS and add credits to shop
    const [updatedShop, updatedTx] = await prisma.$transaction([
      prisma.shop.update({
        where: { id: shop.id },
        data: {
          creditsBalance: { increment: transaction.creditsAdded },
        },
      }),
      prisma.transaction.update({
        where: { id: transaction.id },
        data: {
          status: "SUCCESS",
          paymentId: effectivePaymentId,
          orderId: orderId || transaction.orderId,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: `Payment successful! Added ${transaction.creditsAdded} listing credits to your wallet.`,
      newCreditsBalance: updatedShop.creditsBalance,
      transaction: updatedTx,
    });
  } catch (error: any) {
    console.error("verify-payment error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to verify payment" },
      { status: 500 }
    );
  }
}
