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
  const pkg = await prisma.package.findUnique({ where: { id } });

  if (!pkg) {
    return NextResponse.json({ error: "Package not found" }, { status: 404 });
  }

  return NextResponse.json(pkg);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authRes = await requireAuth(req, ["SUPER_ADMIN", "ADMIN"]);
  if ("response" in authRes) return authRes.response;

  const { id } = await params;

  try {
    const body = await req.json();
    const {
      name,
      totalListings,
      freeCredits,
      paidCredits,
      price,
      perProductPrice,
      isActive,
      sortOrder,
      badge,
      description,
    } = body;

    const data: any = {};
    if (name !== undefined) data.name = name;
    if (totalListings !== undefined) data.totalListings = parseInt(totalListings, 10);
    if (freeCredits !== undefined) data.freeCredits = parseInt(freeCredits, 10);
    if (paidCredits !== undefined) data.paidCredits = parseInt(paidCredits, 10);
    if (price !== undefined) data.price = parseFloat(price);
    if (perProductPrice !== undefined) data.perProductPrice = parseFloat(perProductPrice);
    if (isActive !== undefined) data.isActive = Boolean(isActive);
    if (sortOrder !== undefined) data.sortOrder = parseInt(sortOrder, 10);
    if (badge !== undefined) data.badge = badge;
    if (description !== undefined) data.description = description;

    const updated = await prisma.package.update({
      where: { id },
      data,
    });

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
    await prisma.package.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Package deleted" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
