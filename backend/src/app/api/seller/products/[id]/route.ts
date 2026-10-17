import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/authHelper";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authRes = await requireAuth(req, ["SELLER", "SUPER_ADMIN", "ADMIN"]);
  if ("response" in authRes) return authRes.response;

  const { id } = await params;

  try {
    const product = await prisma.product.findUnique({
      where: { id },
      include: { categoryRel: true },
    });

    if (!product) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
    }

    const attrs = (product.attributes as Record<string, any>) || {};

    return NextResponse.json({
      success: true,
      product: {
        ...product,
        attributes: attrs,
        images: (() => {
          try {
            return JSON.parse(product.images);
          } catch {
            return [product.images];
          }
        })(),
        sizes: attrs.sizes
          ? Array.isArray(attrs.sizes)
            ? attrs.sizes
            : String(attrs.sizes).split(",").map((s) => s.trim())
          : [],
        colors: attrs.colors || attrs.colour
          ? Array.isArray(attrs.colors || attrs.colour)
            ? attrs.colors || attrs.colour
            : String(attrs.colors || attrs.colour).split(",").map((c) => c.trim())
          : [],
        gender: attrs.gender || null,
        subcategory: attrs.type || null,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authRes = await requireAuth(req, ["SELLER", "SUPER_ADMIN", "ADMIN"]);
  if ("response" in authRes) return authRes.response;

  const { authContext } = authRes;
  const { id } = await params;

  try {
    const shop = await prisma.shop.findFirst({
      where: { ownerId: authContext.user.id },
    });

    if (!shop && authContext.user.role !== "SUPER_ADMIN" && authContext.user.role !== "ADMIN") {
      return NextResponse.json({ success: false, error: "Shop not found" }, { status: 404 });
    }

    const existingProduct = await prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
    }

    if (
      shop &&
      existingProduct.shopId !== shop.id &&
      authContext.user.role !== "SUPER_ADMIN" &&
      authContext.user.role !== "ADMIN"
    ) {
      return NextResponse.json({ success: false, error: "Unauthorized access to this product" }, { status: 403 });
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
      images,
      attributes,
      subcategory,
      gender,
      sizes,
      colors,
    } = body;

    let matchedCategory: any = null;
    if (category) {
      matchedCategory = await prisma.category.findFirst({
        where: {
          OR: [
            { name: { equals: category, mode: "insensitive" } },
            { slug: { equals: category.toLowerCase().replace(/[^a-z0-9]+/g, "-"), mode: "insensitive" } },
          ],
        },
      });
    }

    // Merge attributes
    let nextAttributes: Record<string, any> | undefined = undefined;
    if (attributes !== undefined || gender !== undefined || sizes !== undefined || colors !== undefined || subcategory !== undefined) {
      const currentAttrs = (existingProduct.attributes as Record<string, any>) || {};
      const newAttrs = typeof attributes === "object" && attributes !== null ? attributes : {};
      const merged: Record<string, any> = {
        ...currentAttrs,
        ...newAttrs,
      };
      if (gender !== undefined) merged.gender = gender;
      if (sizes !== undefined) {
        merged.sizes = Array.isArray(sizes) ? sizes : String(sizes).split(",").map((s) => s.trim());
      }
      if (colors !== undefined) {
        merged.colour = Array.isArray(colors) ? colors : String(colors).split(",").map((c) => c.trim());
      }
      if (subcategory !== undefined) merged.type = subcategory;
      nextAttributes = merged;
    }

    const updated = await prisma.product.update({
      where: { id },
      data: {
        ...(name ? { name } : {}),
        ...(description !== undefined ? { description } : {}),
        ...(brand !== undefined ? { brand } : {}),
        ...(price !== undefined ? { price: parseFloat(price) } : {}),
        ...(mrp !== undefined ? { mrp: mrp ? parseFloat(mrp) : null } : {}),
        ...(category
          ? {
              category: matchedCategory ? matchedCategory.name : category,
              categoryId: matchedCategory ? matchedCategory.id : null,
            }
          : {}),
        ...(stockStatus ? { stockStatus } : {}),
        ...(nextAttributes !== undefined ? { attributes: nextAttributes } : {}),
        ...(images !== undefined
          ? { images: JSON.stringify(Array.isArray(images) ? images : [images]) }
          : {}),
      },
    });

    const finalAttrs = (updated.attributes as Record<string, any>) || {};

    return NextResponse.json({
      success: true,
      message: "Product updated successfully",
      product: {
        ...updated,
        attributes: finalAttrs,
        images: (() => {
          try {
            return JSON.parse(updated.images);
          } catch {
            return [updated.images];
          }
        })(),
      },
    });
  } catch (error: any) {
    console.error("update product error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update product" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authRes = await requireAuth(req, ["SELLER", "SUPER_ADMIN", "ADMIN"]);
  if ("response" in authRes) return authRes.response;

  const { authContext } = authRes;
  const { id } = await params;

  try {
    const shop = await prisma.shop.findFirst({
      where: { ownerId: authContext.user.id },
    });

    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return NextResponse.json({ success: false, error: "Product not found" }, { status: 404 });
    }

    if (
      shop &&
      product.shopId !== shop.id &&
      authContext.user.role !== "SUPER_ADMIN" &&
      authContext.user.role !== "ADMIN"
    ) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    await prisma.product.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Product removed successfully",
    });
  } catch (error: any) {
    console.error("delete product error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to delete product" },
      { status: 500 }
    );
  }
}
