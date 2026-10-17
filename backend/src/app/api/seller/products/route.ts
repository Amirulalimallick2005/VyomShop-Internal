import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/authHelper";

export async function GET(req: NextRequest) {
  const authRes = await requireAuth(req, ["SELLER", "SUPER_ADMIN", "ADMIN"]);
  if ("response" in authRes) return authRes.response;

  const { authContext } = authRes;

  const shop = await prisma.shop.findFirst({
    where: { ownerId: authContext.user.id },
  });

  if (!shop) {
    return NextResponse.json(
      { success: false, error: "Please register your shop first" },
      { status: 400 }
    );
  }

  const products = await prisma.product.findMany({
    where: { shopId: shop.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({
    success: true,
    count: products.length,
    creditsBalance: shop.creditsBalance,
    products: products.map((p) => {
      const attrs = (p.attributes as Record<string, any>) || {};
      return {
        ...p,
        attributes: attrs,
        images: (() => {
          try {
            return JSON.parse(p.images);
          } catch {
            return [p.images];
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
      };
    }),
  });
}

export async function POST(req: NextRequest) {
  const authRes = await requireAuth(req, ["SELLER", "SUPER_ADMIN", "ADMIN"]);
  if ("response" in authRes) return authRes.response;

  const { authContext } = authRes;

  try {
    const shop = await prisma.shop.findFirst({
      where: { ownerId: authContext.user.id },
    });

    if (!shop) {
      return NextResponse.json(
        { success: false, error: "Please register your shop before uploading products" },
        { status: 400 }
      );
    }

    if (shop.status !== "APPROVED") {
      return NextResponse.json(
        { success: false, error: `Shop is currently ${shop.status.toLowerCase()}. Only approved shops can publish products.` },
        { status: 403 }
      );
    }

    // Check credits balance (1 credit per product)
    if (shop.creditsBalance < 1) {
      const activePackages = await prisma.package.findMany({
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
      });

      return NextResponse.json(
        {
          success: false,
          code: "INSUFFICIENT_CREDITS",
          error: "You have 0 active listing credits. Please purchase a credit package to publish this product.",
          currentCredits: shop.creditsBalance,
          costPerProduct: 10,
          packages: activePackages,
        },
        { status: 402 } // Payment Required
      );
    }

    const body = await req.json();
    const {
      name,
      description,
      brand,
      price,
      mrp,
      category,
      stockStatus = "IN_STOCK",
      images = [],
      attributes = {},
      subcategory,
      gender,
      sizes,
      colors,
    } = body;

    if (!name || price === undefined || !category) {
      return NextResponse.json(
        { success: false, error: "Product name, price, and category are required" },
        { status: 400 }
      );
    }

    const imagesArray = Array.isArray(images) ? images : [images].filter(Boolean);

    // Merge attributes from template fields and any legacy fields
    const attributesObj: Record<string, any> = {
      ...(typeof attributes === "object" && attributes !== null ? attributes : {}),
    };
    if (gender !== undefined && !attributesObj.gender) attributesObj.gender = gender;
    if (sizes !== undefined && !attributesObj.sizes) {
      attributesObj.sizes = Array.isArray(sizes) ? sizes : String(sizes).split(",").map((s) => s.trim());
    }
    if (colors !== undefined && !attributesObj.colors && !attributesObj.colour) {
      attributesObj.colour = Array.isArray(colors) ? colors : String(colors).split(",").map((c) => c.trim());
    }
    if (subcategory !== undefined && !attributesObj.type) attributesObj.type = subcategory;

    const matchedCategory = await prisma.category.findFirst({
      where: {
        OR: [
          { name: { equals: category, mode: "insensitive" } },
          { slug: { equals: category.toLowerCase().replace(/[^a-z0-9]+/g, "-"), mode: "insensitive" } },
        ],
      },
    });

    // Atomic transaction: deduct 1 credit, log transaction, create product
    const [updatedShop, , newProduct] = await prisma.$transaction([
      prisma.shop.update({
        where: { id: shop.id },
        data: { creditsBalance: { decrement: 1 } },
      }),
      prisma.transaction.create({
        data: {
          shopId: shop.id,
          amount: 0,
          creditsDeducted: 1,
          type: "DEDUCTION",
          paymentGateway: "System",
          status: "SUCCESS",
          notes: `Listing credit deducted for product: ${name}`,
        },
      }),
      prisma.product.create({
        data: {
          shopId: shop.id,
          categoryId: matchedCategory ? matchedCategory.id : null,
          name,
          description: description || null,
          brand: brand || null,
          price: parseFloat(price),
          mrp: mrp ? parseFloat(mrp) : null,
          category: matchedCategory ? matchedCategory.name : category,
          stockStatus,
          attributes: attributesObj,
          images: JSON.stringify(imagesArray),
          moderationStatus: "APPROVED", // Or PENDING if auto-mod disabled
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: "Product uploaded successfully! 1 listing credit deducted.",
      remainingCredits: updatedShop.creditsBalance,
      product: {
        ...newProduct,
        images: imagesArray,
        attributes: attributesObj,
      },
    });
  } catch (error: any) {
    console.error("add product error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create product" },
      { status: 500 }
    );
  }
}
