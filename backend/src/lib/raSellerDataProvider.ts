import type { DataProvider } from "ra-core";
import { getAuth } from "firebase/auth";
import { firebaseApp } from "./firebaseClient";

const getToken = async (): Promise<string | null> => {
  if (typeof window === "undefined") return null;
  const auth = getAuth(firebaseApp);
  if (auth.currentUser) return auth.currentUser.getIdToken();
  const match = document.cookie.match(/firebase_token=([^;]+)/);
  return match ? match[1] : null;
};

const API_URL = "/api/seller";

const getHeaders = async () => {
  const token = await getToken();
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const raSellerDataProvider: DataProvider = {
  getList: async (resource, params) => {
    const headers = await getHeaders();
    const { page = 1, perPage = 20 } = params.pagination || {};
    const { field = "id", order = "DESC" } = params.sort || {};
    const searchParams = new URLSearchParams({
      _start: String((page - 1) * perPage),
      _end: String(page * perPage),
      _sort: field,
      _order: order,
    });
    if (params.filter) {
      Object.entries(params.filter).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== "") {
          searchParams.set(key, String(val));
        }
      });
    }
    const res = await fetch(`${API_URL}/${resource}?${searchParams.toString()}`, { headers });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to fetch");
    const list = data[resource] || data.products || data.packages || data.transactions || data.data || [];
    return { data: list, total: data.count || list.length };
  },

  getOne: async (resource, params) => {
    const headers = await getHeaders();
    const res = await fetch(`${API_URL}/${resource}/${params.id}`, { headers });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to fetch");
    return { data: data[resource.replace(/s$/, "")] || data };
  },

  getMany: async (resource, params) => {
    const headers = await getHeaders();
    const promises = params.ids.map((id) =>
      fetch(`${API_URL}/${resource}/${id}`, { headers })
        .then((r) => r.json())
        .then((data) => data[resource.replace(/s$/, "")] || data)
    );
    const data = await Promise.all(promises);
    return { data };
  },

  getManyReference: async (resource, params) => {
    const headers = await getHeaders();
    const res = await fetch(`${API_URL}/${resource}?${params.target}=${params.id}`, { headers });
    const data = await res.json();
    const list = data[resource] || data.data || [];
    return { data: list, total: data.count || list.length };
  },

  update: async (resource, params) => {
    const headers = await getHeaders();
    const res = await fetch(`${API_URL}/${resource}/${params.id}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(params.data),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to update");
    return { data: data[resource.replace(/s$/, "")] || data };
  },

  updateMany: async (resource, params) => {
    const headers = await getHeaders();
    const promises = params.ids.map((id) =>
      fetch(`${API_URL}/${resource}/${id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(params.data),
      })
    );
    await Promise.all(promises);
    return { data: params.ids };
  },

  create: async (resource, params) => {
    const headers = await getHeaders();
    const res = await fetch(`${API_URL}/${resource}`, {
      method: "POST",
      headers,
      body: JSON.stringify(params.data),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to create");
    return { data: data[resource.replace(/s$/, "")] || data };
  },

  delete: async (resource, params) => {
    const headers = await getHeaders();
    const res = await fetch(`${API_URL}/${resource}/${params.id}`, {
      method: "DELETE",
      headers,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to delete");
    return { data: (params.previousData || { id: params.id }) as any };
  },

  deleteMany: async (resource, params) => {
    const headers = await getHeaders();
    const promises = params.ids.map((id) =>
      fetch(`${API_URL}/${resource}/${id}`, {
        method: "DELETE",
        headers,
      })
    );
    await Promise.all(promises);
    return { data: params.ids };
  },
};
