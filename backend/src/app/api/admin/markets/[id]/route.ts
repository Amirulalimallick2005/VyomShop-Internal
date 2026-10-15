import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/authHelper";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authRes = await requireAuth(req, ["SUPER_ADMIN", "ADMIN"]);
  if ("response" in authRes) return authRes.response;

  const { id } = await params;
  const market = await prisma.market.findUnique({
    where: { id },
    include: {
      _count: {
        select: { shops: true },
      },
    },
  });

  if (!market) {
    return NextResponse.json({ error: "Market / Area not found" }, { status: 404 });
  }

  return NextResponse.json({
    ...market,
    shopsCount: market._count.shops,
  });
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authRes = await requireAuth(req, ["SUPER_ADMIN", "ADMIN"]);
  if ("response" in authRes) return authRes.response;

  const { id } = await params;

  try {
    const existing = await prisma.market.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Market / Area not found" }, { status: 404 });
    }

    const body = await req.json();
    const { name, slug, city, pincode, latitude, longitude, description, isActive, sortOrder } = body;

    const data: any = {};
    if (name !== undefined) data.name = name.trim();
    if (slug !== undefined) {
      data.slug = slug.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    }
    if (city !== undefined) data.city = city.trim();
    if (pincode !== undefined) data.pincode = pincode ? pincode.trim() : null;
    if (latitude !== undefined) data.latitude = latitude ? parseFloat(latitude) : null;
    if (longitude !== undefined) data.longitude = longitude ? parseFloat(longitude) : null;
    if (description !== undefined) data.description = description || null;
    if (isActive !== undefined) data.isActive = Boolean(isActive);
    if (sortOrder !== undefined) data.sortOrder = parseInt(sortOrder, 10);

    const updated = await prisma.market.update({
      where: { id },
      data,
    });

    // If the market name changed, synchronize shops referencing it by area
    if (name && name.trim() !== existing.name) {
      await prisma.shop.updateMany({
        where: { marketId: id },
        data: { area: name.trim() },
      });
    }

    return NextResponse.json(updated);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  return PATCH(req, context);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authRes = await requireAuth(req, ["SUPER_ADMIN", "ADMIN"]);
  if ("response" in authRes) return authRes.response;

  const { id } = await params;

  try {
    const existing = await prisma.market.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Market / Area not found" }, { status: 404 });
    }

    // Set marketId to null on associated shops before deleting
    await prisma.shop.updateMany({
      where: { marketId: id },
      data: { marketId: null },
    });

    await prisma.market.delete({ where: { id } });

    return NextResponse.json({ success: true, message: "Market / Area deleted" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
