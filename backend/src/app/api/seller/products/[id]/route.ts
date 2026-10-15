import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/authHelper";

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
      subcategory,
      gender,
      sizes,
      colors,
      stockStatus,
      images,
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
        ...(subcategory !== undefined ? { subcategory } : {}),
        ...(gender ? { gender } : {}),
        ...(sizes !== undefined
          ? { sizes: Array.isArray(sizes) ? sizes.join(", ") : sizes }
          : {}),
        ...(colors !== undefined
          ? { colors: Array.isArray(colors) ? colors.join(", ") : colors }
          : {}),
        ...(stockStatus ? { stockStatus } : {}),
        ...(images !== undefined
          ? { images: JSON.stringify(Array.isArray(images) ? images : [images]) }
          : {}),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Product updated successfully",
      product: {
        ...updated,
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
