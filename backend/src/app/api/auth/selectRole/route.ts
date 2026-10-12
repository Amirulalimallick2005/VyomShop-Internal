import { NextRequest, NextResponse } from "next/server";
import { getAuthSession } from "@/lib/authHelper";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const authContext = await getAuthSession(req);

  if (!authContext) {
    return NextResponse.json(
      { success: false, error: "Unauthorized: Invalid or missing token" },
      { status: 401 }
    );
  }

  try {
    const body = await req.json();
    const { role } = body;

    if (!role || !["CUSTOMER", "SELLER"].includes(role.toUpperCase())) {
      return NextResponse.json(
        { success: false, error: "Valid role is required ('CUSTOMER' or 'SELLER')" },
        { status: 400 }
      );
    }

    const updatedUser = await prisma.user.update({
      where: { id: authContext.firebaseUid },
      data: { role: role.toUpperCase() },
      include: {
        shops: true,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Role switched to ${updatedUser.role}`,
      user: {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        phoneNumber: updatedUser.phoneNumber,
      },
      shop: updatedUser.shops[0] || null,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to update role" },
      { status: 500 }
    );
  }
}
