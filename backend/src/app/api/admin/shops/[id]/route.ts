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

  const shop = await prisma.shop.findUnique({
    where: { id },
    include: {
      owner: { select: { id: true, name: true, email: true, phoneNumber: true } },
      products: { orderBy: { createdAt: "desc" }, take: 20 },
      transactions: { orderBy: { createdAt: "desc" }, take: 10 },
    },
  });

  if (!shop) {
    return NextResponse.json({ error: "Shop not found" }, { status: 404 });
  }

  return NextResponse.json(shop);
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authRes = await requireAuth(req, ["SUPER_ADMIN", "ADMIN"]);
  if ("response" in authRes) return authRes.response;

  const { id } = await params;

  try {
    const existing = await prisma.shop.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Shop not found" }, { status: 404 });
    }

    const body = await req.json();
    const {
      status,
      rejectionReason,
      name,
      phone,
      email,
      address,
      area,
      creditsBalance,
      isVerified,
      timings,
    } = body;

    const data: any = {};
    if (status !== undefined) {
      data.status = status;
      if (status === "APPROVED") {
        data.isVerified = true;
        data.rejectionReason = null;
      }
    }
    if (rejectionReason !== undefined) data.rejectionReason = rejectionReason;
    if (name !== undefined) data.name = name;
    if (phone !== undefined) data.phone = phone;
    if (email !== undefined) data.email = email;
    if (address !== undefined) data.address = address;
    if (area !== undefined) data.area = area;
    if (creditsBalance !== undefined) data.creditsBalance = parseInt(creditsBalance, 10);
    if (isVerified !== undefined) data.isVerified = Boolean(isVerified);
    if (timings !== undefined) data.timings = timings;

    const updated = await prisma.shop.update({
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
    await prisma.shop.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Shop deleted" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
