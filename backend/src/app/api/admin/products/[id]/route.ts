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

  const attrs = (product.attributes as Record<string, any>) || {};

  return NextResponse.json({
    ...product,
    attributes: attrs,
    gender: attrs.gender || null,
    sizes: attrs.sizes ? (Array.isArray(attrs.sizes) ? attrs.sizes.join(", ") : String(attrs.sizes)) : null,
    colors: attrs.colors || attrs.colour ? (Array.isArray(attrs.colors || attrs.colour) ? (attrs.colors || attrs.colour).join(", ") : String(attrs.colors || attrs.colour)) : null,
    subcategory: attrs.type || null,
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
    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const body = await req.json();
    const {
      name,
      description,
      brand,
      price,
      mrp,
      category,
      stockStatus,
      moderationStatus,
      images,
      attributes,
      subcategory,
      gender,
      sizes,
      colors,
    } = body;

    const data: any = {};
    if (name !== undefined) data.name = name;
    if (description !== undefined) data.description = description;
    if (brand !== undefined) data.brand = brand;
    if (price !== undefined) data.price = parseFloat(price);
    if (mrp !== undefined) data.mrp = mrp ? parseFloat(mrp) : null;
    if (category !== undefined) data.category = category;
    if (stockStatus !== undefined) data.stockStatus = stockStatus;
    if (moderationStatus !== undefined) data.moderationStatus = moderationStatus;
    if (images !== undefined) data.images = JSON.stringify(Array.isArray(images) ? images : [images]);

    if (attributes !== undefined || gender !== undefined || sizes !== undefined || colors !== undefined || subcategory !== undefined) {
      const currentAttrs = (existing.attributes as Record<string, any>) || {};
      const newAttrs = typeof attributes === "object" && attributes !== null ? attributes : {};
      const merged = { ...currentAttrs, ...newAttrs };
      if (gender !== undefined) merged.gender = gender;
      if (sizes !== undefined) {
        merged.sizes = Array.isArray(sizes) ? sizes : String(sizes).split(",").map((s) => s.trim());
      }
      if (colors !== undefined) {
        merged.colour = Array.isArray(colors) ? colors : String(colors).split(",").map((c) => c.trim());
      }
      if (subcategory !== undefined) merged.type = subcategory;
      data.attributes = merged;
    }

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
