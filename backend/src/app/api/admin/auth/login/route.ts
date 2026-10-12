import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || "vyom_shops_admin_super_secret_jwt_key_2026_xyz";
const INITIAL_ADMIN_EMAIL = (process.env.INITIAL_ADMIN_EMAIL || "admin@vyomshops.com").toLowerCase();
const INITIAL_ADMIN_PASSWORD = process.env.INITIAL_ADMIN_PASSWORD || "SuperAdmin@123";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required" },
        { status: 400 }
      );
    }

    const cleanEmail = email.toLowerCase().trim();

    // Verify against initial admin credentials or PostgreSQL super admin
    const isInitialAdmin =
      cleanEmail === INITIAL_ADMIN_EMAIL && password === INITIAL_ADMIN_PASSWORD;

    let dbAdmin = await prisma.user.findFirst({
      where: {
        email: cleanEmail,
        role: { in: ["SUPER_ADMIN", "ADMIN"] },
      },
    });

    if (!isInitialAdmin && !dbAdmin) {
      return NextResponse.json(
        { success: false, error: "Invalid admin credentials or insufficient permissions" },
        { status: 401 }
      );
    }

    const adminUid = dbAdmin ? dbAdmin.id : (process.env.INITIAL_ADMIN_UID || "super_admin_vyom_uid");
    const adminName = dbAdmin?.name || "Super Admin";

    // Ensure super admin exists in PostgreSQL
    if (!dbAdmin) {
      dbAdmin = await prisma.user.upsert({
        where: { id: adminUid },
        update: { role: "SUPER_ADMIN" },
        create: {
          id: adminUid,
          email: cleanEmail,
          name: adminName,
          role: "SUPER_ADMIN",
        },
      });
    }

    // Sign 7-day Admin JWT
    const token = jwt.sign(
      {
        uid: adminUid,
        email: cleanEmail,
        name: adminName,
        role: "SUPER_ADMIN",
      },
      ADMIN_JWT_SECRET,
      { expiresIn: "7d" }
    );

    const response = NextResponse.json({
      success: true,
      message: "Admin authentication successful",
      token,
      user: {
        id: adminUid,
        email: cleanEmail,
        name: adminName,
        role: "SUPER_ADMIN",
      },
    });

    // Set HTTP-only secure cookie for web browser session
    response.cookies.set("vyom_admin_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("admin login error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to authenticate admin" },
      { status: 500 }
    );
  }
}
