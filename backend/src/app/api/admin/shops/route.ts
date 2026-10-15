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
    const q = searchParams.get("q");

    const where: any = {};
    if (status) where.status = status;
    if (q) {
      where.OR = [
        { name: { contains: q } },
        { phone: { contains: q } },
        { email: { contains: q } },
        { area: { contains: q } },
      ];
    }

    const [total, shops] = await Promise.all([
      prisma.shop.count({ where }),
      prisma.shop.findMany({
        where,
        skip,
        take,
        orderBy: { [sortField]: sortOrder },
        include: {
          owner: {
            select: { id: true, name: true, email: true, phoneNumber: true },
          },
          _count: {
            select: { products: true, transactions: true },
          },
        },
      }),
    ]);

    const formatted = shops.map((s) => ({
      id: s.id,
      name: s.name,
      slug: s.slug,
      status: s.status,
      rejectionReason: s.rejectionReason,
      phone: s.phone,
      email: s.email,
      address: s.address,
      area: s.area,
      city: s.city,
      pincode: s.pincode,
      latitude: s.latitude,
      longitude: s.longitude,
      googleMapsPin: s.googleMapsPin,
      shopImage: s.shopImage,
      bannerImage: s.bannerImage,
      timings: s.timings,
      creditsBalance: s.creditsBalance,
      isVerified: s.isVerified,
      totalViews: s.totalViews,
      directionClicks: s.directionClicks,
      callClicks: s.callClicks,
      owner: s.owner,
      productsCount: s._count.products,
      transactionsCount: s._count.transactions,
      createdAt: s.createdAt,
      updatedAt: s.updatedAt,
    }));

    return new NextResponse(JSON.stringify(formatted), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "x-total-count": total.toString(),
        "Access-Control-Expose-Headers": "x-total-count",
      },
    });
  } catch (error: any) {
    console.error("admin get shops error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to load shops" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  const authRes = await requireAuth(req, ["SUPER_ADMIN", "ADMIN"]);
  if ("response" in authRes) return authRes.response;

  try {
    const body = await req.json();
    const {
      ownerId,
      name,
      phone,
      email,
      address,
      area,
      city = "Delhi",
      latitude = 28.6139,
      longitude = 77.2090,
      timings = "10:00 AM - 9:00 PM",
      status = "APPROVED",
      creditsBalance = 10,
    } = body;

    const baseSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const slug = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`;

    const newShop = await prisma.shop.create({
      data: {
        ownerId: ownerId || authRes.authContext.user.id,
        name,
        slug,
        phone,
        email,
        address,
        area,
        city,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        timings,
        status,
        creditsBalance: parseInt(creditsBalance, 10) || 0,
        isVerified: status === "APPROVED",
      },
    });

    if (status === "APPROVED" && newShop.ownerId) {
      const owner = await prisma.user.findUnique({ where: { id: newShop.ownerId } });
      if (owner && owner.role !== "SUPER_ADMIN" && owner.role !== "ADMIN") {
        await prisma.user.update({
          where: { id: newShop.ownerId },
          data: { role: "SELLER" },
        });
      }
    }

    return NextResponse.json(newShop, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
