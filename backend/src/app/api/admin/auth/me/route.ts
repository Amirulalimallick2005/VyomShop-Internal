import { NextRequest, NextResponse } from "next/server";
import { requireAuth } from "@/lib/authHelper";

export async function GET(req: NextRequest) {
  const authRes = await requireAuth(req, ["SUPER_ADMIN", "ADMIN"]);
  if ("response" in authRes) return authRes.response;

  return NextResponse.json({
    success: true,
    user: authRes.authContext.user,
  });
}
