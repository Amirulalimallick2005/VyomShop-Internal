import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const packages = await prisma.package.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" },
    });

    const listingFeeSetting = await prisma.systemSetting.findUnique({
      where: { key: "listing_fee_per_product" },
    });

    return NextResponse.json({
      success: true,
      baseListingFee: listingFeeSetting ? parseFloat(listingFeeSetting.value) : 10,
      currency: "INR",
      packages,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to fetch packages" },
      { status: 500 }
    );
  }
}
