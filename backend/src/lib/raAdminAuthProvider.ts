import type { AuthProvider } from "ra-core";

export const raAdminAuthProvider: AuthProvider = {
  login: async ({ username, password }: any) => {
    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: username, password }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || "Login failed");
      }
      return Promise.resolve();
    } catch (err: any) {
      throw new Error(err.message || "Login failed");
    }
  },

  logout: async () => {
    await fetch("/api/admin/auth/logout", { method: "POST", credentials: "include" });
    return Promise.resolve();
  },

  checkAuth: async () => {
    try {
      const res = await fetch("/api/admin/auth/me", { credentials: "include" });
      if (!res.ok) return Promise.reject({ redirectTo: "/admin/login" });
      const data = await res.json();
      if (!data.success) return Promise.reject({ redirectTo: "/admin/login" });
      return Promise.resolve();
    } catch {
      return Promise.reject({ redirectTo: "/admin/login" });
    }
  },

  checkError: async (error: any) => {
    const status = error.status || error.statusCode;
    if (status === 401 || status === 403) {
      return Promise.reject({ redirectTo: "/admin/login" });
    }
    return Promise.resolve();
  },

  getPermissions: async () => "SUPER_ADMIN",

  getIdentity: async () => {
    try {
      const res = await fetch("/api/admin/auth/me", { credentials: "include" });
      if (!res.ok) return Promise.reject();
      const data = await res.json();
      if (!data.user) return Promise.reject();
      return {
        id: data.user.id,
        fullName: data.user.name || "Super Admin",
        email: data.user.email,
      };
    } catch {
      return Promise.reject();
    }
  },
};
