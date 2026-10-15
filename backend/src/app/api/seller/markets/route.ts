import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const markets = await prisma.market.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        slug: true,
        city: true,
        pincode: true,
        latitude: true,
        longitude: true,
        description: true,
        sortOrder: true,
      },
    });

    return NextResponse.json({
      success: true,
      count: markets.length,
      markets,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load markets" },
      { status: 500 }
    );
  }
}
