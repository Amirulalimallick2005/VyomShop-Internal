import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/authHelper";

export async function GET(req: NextRequest) {
  const authRes = await requireAuth(req, ["SUPER_ADMIN", "ADMIN"]);
  if ("response" in authRes) return authRes.response;

  try {
    const { searchParams } = new URL(req.url);
    const start = parseInt(searchParams.get("_start") || "0", 10);
    const end = parseInt(searchParams.get("_end") || "20", 10);
    const take = Math.max(1, end - start);
    const skip = Math.max(0, start);

    const [total, packages] = await Promise.all([
      prisma.package.count(),
      prisma.package.findMany({
        skip,
        take,
        orderBy: { sortOrder: "asc" },
      }),
    ]);

    return new NextResponse(JSON.stringify(packages), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "x-total-count": total.toString(),
        "Access-Control-Expose-Headers": "x-total-count",
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const authRes = await requireAuth(req, ["SUPER_ADMIN", "ADMIN"]);
  if ("response" in authRes) return authRes.response;

  try {
    const body = await req.json();
    const {
      name,
      totalListings,
      freeCredits,
      paidCredits,
      price,
      perProductPrice,
      isActive = true,
      sortOrder = 0,
      badge,
      description,
    } = body;

    const newPkg = await prisma.package.create({
      data: {
        name,
        totalListings: parseInt(totalListings, 10),
        freeCredits: parseInt(freeCredits, 10),
        paidCredits: parseInt(paidCredits, 10),
        price: parseFloat(price),
        perProductPrice: parseFloat(perProductPrice),
        isActive: Boolean(isActive),
        sortOrder: parseInt(sortOrder, 10),
        badge: badge || null,
        description: description || null,
      },
    });

    return NextResponse.json(newPkg, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
