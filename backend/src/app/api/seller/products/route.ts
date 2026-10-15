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
    products: products.map((p) => ({
      ...p,
      images: (() => {
        try {
          return JSON.parse(p.images);
        } catch {
          return [p.images];
        }
      })(),
      sizes: p.sizes ? p.sizes.split(",").map((s) => s.trim()) : [],
      colors: p.colors ? p.colors.split(",").map((c) => c.trim()) : [],
    })),
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
      subcategory,
      gender = "Unisex",
      sizes = [],
      colors = [],
      stockStatus = "IN_STOCK",
      images = [],
    } = body;

    if (!name || price === undefined || !category) {
      return NextResponse.json(
        { success: false, error: "Product name, price, and category are required" },
        { status: 400 }
      );
    }

    const imagesArray = Array.isArray(images) ? images : [images].filter(Boolean);
    const sizesString = Array.isArray(sizes) ? sizes.join(", ") : sizes || "";
    const colorsString = Array.isArray(colors) ? colors.join(", ") : colors || "";

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
          name,
          description: description || null,
          brand: brand || null,
          price: parseFloat(price),
          mrp: mrp ? parseFloat(mrp) : null,
          category,
          subcategory: subcategory || null,
          gender,
          sizes: sizesString,
          colors: colorsString,
          stockStatus,
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
        sizes: sizesString ? sizesString.split(",").map((s: string) => s.trim()) : [],
        colors: colorsString ? colorsString.split(",").map((c: string) => c.trim()) : [],
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
