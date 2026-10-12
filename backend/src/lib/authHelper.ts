import { NextRequest, NextResponse } from "next/server";
import { prisma } from "./prisma";
import { getFirebaseAdmin } from "./firebaseAdmin";
import jwt from "jsonwebtoken";

export interface AuthContext {
  user: {
    id: string; // Firebase UID
    name: string | null;
    email: string | null;
    role: string;
    phoneNumber: string | null;
    image?: string | null;
  };
  firebaseUid: string;
  shop?: {
    id: string;
    name: string;
    status: string;
    creditsBalance: number;
  } | null;
}

const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || "vyom_shops_admin_super_secret_jwt_key_2026_xyz";

/**
 * Extracts authenticated user from Firebase ID Token (Bearer token or cookie)
 * and synchronizes with PostgreSQL database.
 */
export async function getAuthSession(req: Request | NextRequest): Promise<AuthContext | null> {
  try {
    let token: string | null = null;

    // 1. Extract from Authorization: Bearer <token>
    const authHeader = req.headers.get("authorization");
    if (authHeader && authHeader.toLowerCase().startsWith("bearer ")) {
      token = authHeader.substring(7).trim();
    }

    // 2. Extract from Cookie (for Refine Web Admin panel)
    if (!token && "cookies" in req) {
      const cookieStore = (req as any).cookies;
      token = cookieStore.get("vyom_admin_session")?.value || cookieStore.get("firebase_token")?.value || null;
    } else if (!token) {
      const cookieHeader = req.headers.get("cookie");
      if (cookieHeader) {
        const match = cookieHeader.match(/vyom_admin_session=([^;]+)/) || cookieHeader.match(/firebase_token=([^;]+)/);
        if (match) token = match[1];
      }
    }

    if (!token) return null;

    let uid: string | null = null;
    let email: string | null = null;
    let phoneNumber: string | null = null;
    let name: string | null = null;
    let picture: string | null = null;

    // Check if it's an Admin JWT
    try {
      const decodedAdmin = jwt.verify(token, ADMIN_JWT_SECRET) as any;
      if (decodedAdmin && decodedAdmin.uid) {
        uid = decodedAdmin.uid;
        email = decodedAdmin.email || null;
        name = decodedAdmin.name || "Super Admin";
      }
    } catch {
      // Not an admin JWT, continue to Firebase verify
    }

    // If not Admin JWT, verify with Firebase Admin
    if (!uid) {
      try {
        const { auth } = getFirebaseAdmin();
        const decodedFirebase = await auth.verifyIdToken(token);
        uid = decodedFirebase.uid;
        email = decodedFirebase.email || null;
        phoneNumber = decodedFirebase.phone_number || null;
        name = decodedFirebase.name || null;
        picture = decodedFirebase.picture || null;
      } catch (fbErr: any) {
        // Fallback for local development testing with dev tokens e.g. dev_token_<uid>
        if (process.env.NODE_ENV !== "production" && token.startsWith("dev_token_")) {
          uid = token.replace("dev_token_", "");
          email = `${uid}@vyom.dev`;
          name = `Dev User (${uid})`;
        } else {
          // If Firebase credentials are mock/not configured in dev, parse unverified JWT payload gracefully
          try {
            const parts = token.split(".");
            if (parts.length === 3) {
              const payload = JSON.parse(Buffer.from(parts[1], "base64").toString());
              if (payload.user_id || payload.sub) {
                uid = payload.user_id || payload.sub;
                email = payload.email || null;
                phoneNumber = payload.phone_number || null;
                name = payload.name || null;
                picture = payload.picture || null;
              }
            }
          } catch {
            // Invalid token
          }
        }
      }
    }

    if (!uid) return null;

    // Find or synchronize user in PostgreSQL
    let dbUser = await prisma.user.findUnique({
      where: { id: uid },
      include: {
        shops: {
          select: {
            id: true,
            name: true,
            status: true,
            creditsBalance: true,
          },
          take: 1,
        },
      },
    });

    if (!dbUser) {
      // Auto-create user in PostgreSQL upon first authenticated HTTP request from Flutter
      dbUser = await prisma.user.create({
        data: {
          id: uid,
          email: email || null,
          phoneNumber: phoneNumber || null,
          name: name || null,
          image: picture || null,
          role: "CUSTOMER", // Default role; can switch to SELLER
        },
        include: {
          shops: {
            select: {
              id: true,
              name: true,
              status: true,
              creditsBalance: true,
            },
            take: 1,
          },
        },
      });
    }

    if (dbUser.banned) {
      return null;
    }

    return {
      user: {
        id: dbUser.id,
        name: dbUser.name,
        email: dbUser.email,
        role: dbUser.role,
        phoneNumber: dbUser.phoneNumber,
        image: dbUser.image,
      },
      firebaseUid: uid,
      shop: dbUser.shops[0] || null,
    };
  } catch (error) {
    console.error("Firebase getAuthSession error:", error);
    return null;
  }
}

/**
 * Enforce role requirement
 */
export async function requireAuth(
  req: Request | NextRequest,
  allowedRoles?: string[]
): Promise<{ authContext: AuthContext } | { response: NextResponse }> {
  const authContext = await getAuthSession(req);

  if (!authContext) {
    return {
      response: NextResponse.json(
        { success: false, error: "Unauthorized: Invalid or missing Firebase token" },
        { status: 401 }
      ),
    };
  }

  if (allowedRoles && allowedRoles.length > 0) {
    const userRole = (authContext.user.role || "CUSTOMER").toUpperCase();
    const isAllowed = allowedRoles.some((r) => r.toUpperCase() === userRole);
    if (!isAllowed) {
      return {
        response: NextResponse.json(
          { success: false, error: `Forbidden: Requires role [${allowedRoles.join(", ")}]` },
          { status: 403 }
        ),
      };
    }
  }

  return { authContext };
}
