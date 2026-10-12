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
    const sortField = searchParams.get("_sort") || "createdAt";
    const sortOrder = (searchParams.get("_order") || "desc").toLowerCase() === "asc" ? "asc" : "desc";
    const role = searchParams.get("role");
    const q = searchParams.get("q");

    const where: any = {};
    if (role) where.role = role;
    if (q) {
      where.OR = [
        { name: { contains: q } },
        { email: { contains: q } },
        { phoneNumber: { contains: q } },
      ];
    }

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip,
        take,
        orderBy: { [sortField]: sortOrder },
        include: {
          shops: { select: { id: true, name: true, status: true, creditsBalance: true } },
        },
      }),
    ]);

    const formatted = users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role || "CUSTOMER",
      phoneNumber: u.phoneNumber,
      banned: u.banned,
      banReason: u.banReason,
      shops: u.shops,
      shopName: u.shops[0]?.name || "N/A",
      createdAt: u.createdAt,
      updatedAt: u.updatedAt,
    }));

    return new NextResponse(JSON.stringify(formatted), {
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
