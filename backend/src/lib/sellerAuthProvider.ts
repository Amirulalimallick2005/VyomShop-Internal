"use client";

import type { AuthProvider } from "@refinedev/core";
import {
  getAuth,
  signInWithPhoneNumber,
  GoogleAuthProvider,
  signInWithPopup,
  RecaptchaVerifier,
  signOut,
} from "firebase/auth";
import { firebaseApp } from "./firebaseClient";

const auth = getAuth(firebaseApp);

export const sellerAuthProvider: AuthProvider = {
  login: async ({ providerName, phoneNumber, confirmationResult, otp }: any) => {
    try {
      if (providerName === "google") {
        const provider = new GoogleAuthProvider();
        const cred = await signInWithPopup(auth, provider);
        const token = await cred.user.getIdToken();
        // Set role to SELLER
        await fetch("/api/auth/selectRole", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ role: "SELLER" }),
        });
        document.cookie = `firebase_token=${token}; path=/; max-age=${7 * 24 * 3600}; samesite=lax`;
        return { success: true, redirectTo: "/seller/dashboard" };
      }

      if (providerName === "phone_confirm" && confirmationResult && otp) {
        const cred = await confirmationResult.confirm(otp);
        const token = await cred.user.getIdToken();
        await fetch("/api/auth/selectRole", {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ role: "SELLER" }),
        });
        document.cookie = `firebase_token=${token}; path=/; max-age=${7 * 24 * 3600}; samesite=lax`;
        return { success: true, redirectTo: "/seller/dashboard" };
      }

      return { success: false, error: { message: "Unknown login method", name: "LoginError" } };
    } catch (err: any) {
      return { success: false, error: { message: err.message, name: "FirebaseError" } };
    }
  },

  logout: async () => {
    await signOut(auth);
    document.cookie = "firebase_token=; max-age=0; path=/";
    return { success: true, redirectTo: "/" };
  },

  check: async () => {
    try {
      const user = auth.currentUser;
      if (!user) {
        // Try from cookie
        const match = document.cookie.match(/firebase_token=([^;]+)/);
        if (!match) return { authenticated: false, redirectTo: "/seller/login" };
        const res = await fetch("/api/auth/me", {
          headers: { Authorization: `Bearer ${match[1]}` },
        });
        if (!res.ok) return { authenticated: false, redirectTo: "/seller/login" };
        const data = await res.json();
        if (data.user?.role !== "SELLER" && data.user?.role !== "SUPER_ADMIN" && data.user?.role !== "ADMIN") {
          return { authenticated: false, redirectTo: "/seller/login" };
        }
        return { authenticated: true };
      }
      const token = await user.getIdToken();
      const res = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return { authenticated: false, redirectTo: "/seller/login" };
      const data = await res.json();
      if (data.user?.role !== "SELLER" && data.user?.role !== "SUPER_ADMIN" && data.user?.role !== "ADMIN") {
        return { authenticated: false, redirectTo: "/seller/login" };
      }
      return { authenticated: true };
    } catch {
      return { authenticated: false, redirectTo: "/seller/login" };
    }
  },

  getPermissions: async () => null,

  getIdentity: async () => {
    try {
      let token: string | null = null;
      const user = auth.currentUser;
      if (user) {
        token = await user.getIdToken();
      } else {
        const match = document.cookie.match(/firebase_token=([^;]+)/);
        if (match) token = match[1];
      }
      if (!token) return null;
      const res = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return null;
      const data = await res.json();
      return data.user
        ? { id: data.user.id, name: data.user.name, email: data.user.email, avatar: data.user.image, shop: data.shop }
        : null;
    } catch {
      return null;
    }
  },

  onError: async (error) => {
    if (error?.status === 401 || error?.status === 403) {
      return { logout: true, redirectTo: "/seller/login" };
    }
    return { error };
  },
};
