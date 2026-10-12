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

  const product = await prisma.product.findUnique({
    where: { id },
    include: {
      shop: true,
    },
  });

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  return NextResponse.json({
    ...product,
    images: (() => {
      try {
        return JSON.parse(product.images);
      } catch {
        return [product.images];
      }
    })(),
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
    const body = await req.json();
    const {
      name,
      description,
      brand,
      price,
      mrp,
      category,
      subcategory,
      gender,
      sizes,
      colors,
      stockStatus,
      moderationStatus,
      images,
    } = body;

    const data: any = {};
    if (name !== undefined) data.name = name;
    if (description !== undefined) data.description = description;
    if (brand !== undefined) data.brand = brand;
    if (price !== undefined) data.price = parseFloat(price);
    if (mrp !== undefined) data.mrp = mrp ? parseFloat(mrp) : null;
    if (category !== undefined) data.category = category;
    if (subcategory !== undefined) data.subcategory = subcategory;
    if (gender !== undefined) data.gender = gender;
    if (sizes !== undefined) data.sizes = Array.isArray(sizes) ? sizes.join(", ") : sizes;
    if (colors !== undefined) data.colors = Array.isArray(colors) ? colors.join(", ") : colors;
    if (stockStatus !== undefined) data.stockStatus = stockStatus;
    if (moderationStatus !== undefined) data.moderationStatus = moderationStatus;
    if (images !== undefined) data.images = JSON.stringify(Array.isArray(images) ? images : [images]);

    const updated = await prisma.product.update({
      where: { id },
      data,
      include: { shop: { select: { name: true } } },
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
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Product deleted" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
