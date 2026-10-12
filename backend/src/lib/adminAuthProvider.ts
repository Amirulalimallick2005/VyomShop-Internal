"use client";

import type { AuthProvider } from "@refinedev/core";

export const adminAuthProvider: AuthProvider = {
  login: async ({ email, password }: any) => {
    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: { message: data.error || "Login failed", name: "AuthError" } };
      }
      return { success: true, redirectTo: "/admin/dashboard" };
    } catch (err: any) {
      return { success: false, error: { message: err.message, name: "NetworkError" } };
    }
  },

  logout: async () => {
    await fetch("/api/admin/auth/logout", { method: "POST", credentials: "include" });
    return { success: true, redirectTo: "/" };
  },

  check: async () => {
    try {
      const res = await fetch("/api/admin/auth/me", { credentials: "include" });
      if (!res.ok) return { authenticated: false, redirectTo: "/admin/login" };
      const data = await res.json();
      if (!data.success) return { authenticated: false, redirectTo: "/admin/login" };
      return { authenticated: true };
    } catch {
      return { authenticated: false, redirectTo: "/admin/login" };
    }
  },

  getPermissions: async () => "SUPER_ADMIN",

  getIdentity: async () => {
    try {
      const res = await fetch("/api/admin/auth/me", { credentials: "include" });
      if (!res.ok) return null;
      const data = await res.json();
      return data.user ? { id: data.user.id, name: data.user.name || "Super Admin", email: data.user.email } : null;
    } catch {
      return null;
    }
  },

  onError: async (error) => {
    if (error?.status === 401 || error?.status === 403) {
      return { logout: true, redirectTo: "/admin/login" };
    }
    return { error };
  },
};
