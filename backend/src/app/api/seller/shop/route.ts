import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/authHelper";

export async function GET(req: NextRequest) {
  const authRes = await requireAuth(req, ["CUSTOMER", "SELLER", "SUPER_ADMIN", "ADMIN"]);
  if ("response" in authRes) return authRes.response;

  const { authContext } = authRes;

  const shop = await prisma.shop.findFirst({
    where: { ownerId: authContext.user.id },
    include: {
      _count: {
        select: { products: true, transactions: true },
      },
    },
  });

  if (!shop) {
    return NextResponse.json({
      success: true,
      hasShop: false,
      shop: null,
      message: "No shop registered yet for this seller account",
    });
  }

  return NextResponse.json({
    success: true,
    hasShop: true,
    shop: {
      ...shop,
      productsCount: shop._count.products,
      transactionsCount: shop._count.transactions,
    },
  });
}

export async function POST(req: NextRequest) {
  const authRes = await requireAuth(req, ["CUSTOMER", "SELLER", "SUPER_ADMIN", "ADMIN"]);
  if ("response" in authRes) return authRes.response;

  const { authContext } = authRes;

  try {
    const existingShop = await prisma.shop.findFirst({
      where: { ownerId: authContext.user.id },
    });

    if (existingShop) {
      return NextResponse.json(
        { success: false, error: "A shop is already registered for this account" },
        { status: 400 }
      );
    }

    const body = await req.json();
    const {
      name,
      phone,
      email,
      address,
      city = "Delhi",
      area,
      pincode,
      latitude,
      longitude,
      googleMapsPin,
      shopImage,
      bannerImage,
      timings = "10:00 AM - 9:00 PM",
      description,
    } = body;

    if (!name || !phone || !address || latitude === undefined || longitude === undefined) {
      return NextResponse.json(
        { success: false, error: "Name, phone, address, latitude, and longitude are required" },
        { status: 400 }
      );
    }

    const baseSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const slug = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`;

    // Read default signup bonus credits from system settings
    const bonusSetting = await prisma.systemSetting.findUnique({
      where: { key: "default_free_credits_signup" },
    });
    const initialCredits = bonusSetting ? parseInt(bonusSetting.value, 10) : 5;

    const newShop = await prisma.shop.create({
      data: {
        ownerId: authContext.user.id,
        name,
        slug,
        phone,
        email: email || authContext.user.email,
        address,
        city,
        area: area || "Delhi",
        pincode,
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        googleMapsPin: googleMapsPin || `https://maps.google.com/?q=${latitude},${longitude}`,
        shopImage: shopImage || null,
        bannerImage: bannerImage || null,
        timings,
        description,
        status: "PENDING", // Super Admin will approve
        creditsBalance: initialCredits,
      },
    });

    // Record welcome bonus transaction
    if (initialCredits > 0) {
      await prisma.transaction.create({
        data: {
          shopId: newShop.id,
          amount: 0,
          creditsAdded: initialCredits,
          type: "BONUS",
          paymentGateway: "System",
          status: "SUCCESS",
          notes: "Welcome bonus listing credits on registration",
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Shop registered successfully! Awaiting admin verification.",
      shop: newShop,
    });
  } catch (error: any) {
    console.error("register shop error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to register shop" },
      { status: 500 }
    );
  }
}

export async function PUT(req: NextRequest) {
  const authRes = await requireAuth(req, ["CUSTOMER", "SELLER", "SUPER_ADMIN", "ADMIN"]);
  if ("response" in authRes) return authRes.response;

  const { authContext } = authRes;

  try {
    const shop = await prisma.shop.findFirst({
      where: { ownerId: authContext.user.id },
    });

    if (!shop) {
      return NextResponse.json({ success: false, error: "Shop not found" }, { status: 404 });
    }

    const body = await req.json();
    const {
      name,
      phone,
      email,
      address,
      area,
      pincode,
      latitude,
      longitude,
      googleMapsPin,
      shopImage,
      bannerImage,
      timings,
      description,
    } = body;

    const updatedShop = await prisma.shop.update({
      where: { id: shop.id },
      data: {
        ...(name ? { name } : {}),
        ...(phone ? { phone } : {}),
        ...(email !== undefined ? { email } : {}),
        ...(address ? { address } : {}),
        ...(area ? { area } : {}),
        ...(pincode ? { pincode } : {}),
        ...(latitude !== undefined ? { latitude: parseFloat(latitude) } : {}),
        ...(longitude !== undefined ? { longitude: parseFloat(longitude) } : {}),
        ...(googleMapsPin ? { googleMapsPin } : {}),
        ...(shopImage !== undefined ? { shopImage } : {}),
        ...(bannerImage !== undefined ? { bannerImage } : {}),
        ...(timings ? { timings } : {}),
        ...(description !== undefined ? { description } : {}),
        // If shop was previously rejected, updating shop details resets it to PENDING for admin review
        ...(shop.status === "REJECTED" ? { status: "PENDING", rejectionReason: null } : {}),
      },
    });

    return NextResponse.json({
      success: true,
      message: "Shop updated successfully",
      shop: updatedShop,
    });
  } catch (error: any) {
    console.error("update shop error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update shop" },
      { status: 500 }
    );
  }
}
