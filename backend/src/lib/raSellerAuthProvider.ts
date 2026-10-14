import type { AuthProvider } from "ra-core";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
} from "firebase/auth";
import { firebaseApp } from "./firebaseClient";

export const raSellerAuthProvider: AuthProvider = {
  login: async (params?: any) => {
    if (params?.providerName === "google") {
      const auth = getAuth(firebaseApp);
      const provider = new GoogleAuthProvider();
      const res = await signInWithPopup(auth, provider);
      const token = await res.user.getIdToken();
      document.cookie = `firebase_token=${token}; path=/; max-age=604800`;
      await fetch("/api/auth/selectRole", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ role: "SELLER" }),
      });
      return Promise.resolve();
    }
    return Promise.resolve();
  },

  logout: async () => {
    try {
      const auth = getAuth(firebaseApp);
      await signOut(auth);
    } catch {}
    document.cookie = "firebase_token=; path=/; max-age=0";
    return Promise.resolve();
  },

  checkAuth: async () => {
    if (typeof window === "undefined") return Promise.resolve();
    const token = document.cookie.match(/firebase_token=([^;]+)/)?.[1];
    if (!token) return Promise.reject({ redirectTo: "/seller/login" });
    try {
      const res = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) return Promise.reject({ redirectTo: "/seller/login" });
      const data = await res.json();
      if (!data.user) return Promise.reject({ redirectTo: "/seller/login" });
      return Promise.resolve();
    } catch {
      return Promise.reject({ redirectTo: "/seller/login" });
    }
  },

  checkError: async (error: any) => {
    const status = error.status || error.statusCode;
    if (status === 401 || status === 403) {
      return Promise.reject({ redirectTo: "/seller/login" });
    }
    return Promise.resolve();
  },

  getPermissions: async () => "SELLER",

  getIdentity: async () => {
    const token = document.cookie.match(/firebase_token=([^;]+)/)?.[1];
    if (!token) return Promise.reject();
    try {
      const res = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!data.user) return Promise.reject();
      return {
        id: data.user.id,
        fullName: data.user.name || data.shop?.name || "Seller",
        email: data.user.email,
        shop: data.shop,
      };
    } catch {
      return Promise.reject();
    }
  },
};
