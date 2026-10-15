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
    const sortField = searchParams.get("_sort") || "sortOrder";
    const sortOrder = (searchParams.get("_order") || "asc").toLowerCase() === "desc" ? "desc" : "asc";
    const q = searchParams.get("q");

    const where: any = {};
    if (q) {
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { slug: { contains: q, mode: "insensitive" } },
        { city: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ];
    }

    const [total, markets] = await Promise.all([
      prisma.market.count({ where }),
      prisma.market.findMany({
        where,
        skip,
        take,
        orderBy: { [sortField]: sortOrder },
        include: {
          _count: {
            select: { shops: true },
          },
        },
      }),
    ]);

    const formatted = markets.map((m) => ({
      ...m,
      shopsCount: m._count.shops,
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
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const authRes = await requireAuth(req, ["SUPER_ADMIN", "ADMIN"]);
  if ("response" in authRes) return authRes.response;

  try {
    const body = await req.json();
    const {
      name,
      slug: customSlug,
      city = "Delhi",
      pincode,
      latitude,
      longitude,
      description,
      isActive = true,
      sortOrder = 0,
    } = body;

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Market / Area name is required" }, { status: 400 });
    }

    const cleanName = name.trim();
    const slug = (customSlug || cleanName)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");

    const existing = await prisma.market.findFirst({
      where: {
        OR: [{ name: cleanName }, { slug }],
      },
    });

    if (existing) {
      return NextResponse.json(
        { error: "A market or area with this name or slug already exists" },
        { status: 400 }
      );
    }

    const newMarket = await prisma.market.create({
      data: {
        name: cleanName,
        slug,
        city: city || "Delhi",
        pincode: pincode || null,
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
        description: description || null,
        isActive: Boolean(isActive),
        sortOrder: parseInt(sortOrder, 10) || 0,
      },
    });

    return NextResponse.json(newMarket, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
