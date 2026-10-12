import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/authHelper";
import crypto from "crypto";

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
    const { packageId, singleListing } = body;

    let amount = 10;
    let creditsToAdd = 1;
    let selectedPackage = null;
    let note = "Single product listing fee top-up";

    if (packageId) {
      selectedPackage = await prisma.package.findUnique({
        where: { id: packageId },
      });

      if (!selectedPackage || !selectedPackage.isActive) {
        return NextResponse.json({ success: false, error: "Selected package is not available" }, { status: 400 });
      }

      amount = selectedPackage.price;
      creditsToAdd = selectedPackage.totalListings;
      note = `Purchase of ${selectedPackage.name} Package (${selectedPackage.paidCredits} paid + ${selectedPackage.freeCredits} bonus free credits)`;
    } else if (!singleListing) {
      return NextResponse.json(
        { success: false, error: "Please specify packageId or singleListing: true" },
        { status: 400 }
      );
    }

    // Mock/Test Razorpay Order ID or live Razorpay order
    const mockOrderId = `order_${crypto.randomBytes(8).toString("hex")}`;

    const transaction = await prisma.transaction.create({
      data: {
        shopId: shop.id,
        packageId: selectedPackage?.id || null,
        amount,
        creditsAdded: creditsToAdd,
        type: "PURCHASE",
        paymentGateway: "Razorpay",
        orderId: mockOrderId,
        status: "PENDING",
        notes: note,
      },
    });

    return NextResponse.json({
      success: true,
      transactionId: transaction.id,
      orderId: mockOrderId,
      amount,
      amountInPaise: Math.round(amount * 100),
      currency: "INR",
      razorpayKeyId: process.env.RAZORPAY_KEY_ID || "rzp_test_mock123",
      creditsToBeAdded: creditsToAdd,
      packageName: selectedPackage ? selectedPackage.name : "Single Listing",
    });
  } catch (error: any) {
    console.error("wallet checkout error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create checkout order" },
      { status: 500 }
    );
  }
}
