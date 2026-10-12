import { DataProvider } from "@refinedev/core";
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

export const sellerDataProvider: DataProvider = {
  getList: async ({ resource, pagination, filters, sorters }) => {
    const headers = await getHeaders();
    const url = `${API_URL}/${resource}`;
    const res = await fetch(url, { headers });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to fetch");
    // Handle different response shapes
    const list = data[resource] || data.products || data.packages || data.transactions || data.data || [];
    return { data: list, total: data.count || list.length };
  },

  getOne: async ({ resource, id }) => {
    const headers = await getHeaders();
    const res = await fetch(`${API_URL}/${resource}/${id}`, { headers });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to fetch");
    return { data: data[resource.replace(/s$/, "")] || data };
  },

  create: async ({ resource, variables }) => {
    const headers = await getHeaders();
    const res = await fetch(`${API_URL}/${resource}`, {
      method: "POST",
      headers,
      body: JSON.stringify(variables),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to create");
    return { data: data[resource.replace(/s$/, "")] || data };
  },

  update: async ({ resource, id, variables }) => {
    const headers = await getHeaders();
    const res = await fetch(`${API_URL}/${resource}/${id}`, {
      method: "PUT",
      headers,
      body: JSON.stringify(variables),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to update");
    return { data: data[resource.replace(/s$/, "")] || data };
  },

  deleteOne: async ({ resource, id }) => {
    const headers = await getHeaders();
    const res = await fetch(`${API_URL}/${resource}/${id}`, {
      method: "DELETE",
      headers,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to delete");
    return { data: data[resource.replace(/s$/, "")] || data };
  },

  getApiUrl: () => API_URL,

  custom: async ({ url, method, payload, headers: customHeaders }) => {
    const headers = { ...(await getHeaders()), ...customHeaders };
    const res = await fetch(url, {
      method: method?.toUpperCase() || "GET",
      headers,
      body: payload ? JSON.stringify(payload) : undefined,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed");
    return { data };
  },
};
