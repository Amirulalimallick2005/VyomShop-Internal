import { DataProvider } from "@refinedev/core";

const API_URL = "/api/admin";

const getHeaders = () => ({
  "Content-Type": "application/json",
});

export const adminDataProvider: DataProvider = {
  getList: async ({ resource, pagination, sorters }) => {
    const current = (pagination as any)?.current || 1;
    const pageSize = (pagination as any)?.pageSize || 20;
    const _start = (current - 1) * pageSize;
    const _end = _start + pageSize;
    const params = new URLSearchParams({
      _start: String(_start),
      _end: String(_end),
    });
    if (sorters?.[0]) {
      params.set("_sort", sorters[0].field);
      params.set("_order", sorters[0].order);
    }
    const url = `${API_URL}/${resource}?${params.toString()}`;
    const res = await fetch(url, { headers: getHeaders(), credentials: "include" });
    const total = parseInt(res.headers.get("x-total-count") || "0", 10);
    const data = await res.json();
    if (!res.ok) throw new Error((data as any).error || "Failed to fetch");
    const list = Array.isArray(data) ? data : (data as any)[resource] || (data as any).data || [];
    return { data: list, total: total || list.length };
  },

  getOne: async ({ resource, id }) => {
    const res = await fetch(`${API_URL}/${resource}/${id}`, {
      headers: getHeaders(),
      credentials: "include",
    });
    const data = await res.json() as any;
    if (!res.ok) throw new Error(data.error || "Failed to fetch");
    return { data: data.shop || data.user || data.product || data.package || data };
  },

  create: async ({ resource, variables }) => {
    const res = await fetch(`${API_URL}/${resource}`, {
      method: "POST",
      headers: getHeaders(),
      credentials: "include",
      body: JSON.stringify(variables),
    });
    const data = await res.json() as any;
    if (!res.ok) throw new Error(data.error || "Failed to create");
    return { data: data.shop || data.user || data.product || data.package || data };
  },

  update: async ({ resource, id, variables }) => {
    const res = await fetch(`${API_URL}/${resource}/${id}`, {
      method: "PUT",
      headers: getHeaders(),
      credentials: "include",
      body: JSON.stringify(variables),
    });
    const data = await res.json() as any;
    if (!res.ok) throw new Error(data.error || "Failed to update");
    return { data: data.shop || data.user || data.product || data.package || data };
  },

  deleteOne: async ({ resource, id }) => {
    const res = await fetch(`${API_URL}/${resource}/${id}`, {
      method: "DELETE",
      headers: getHeaders(),
      credentials: "include",
    });
    const data = await res.json() as any;
    if (!res.ok) throw new Error(data.error || "Failed to delete");
    return { data };
  },

  getApiUrl: () => API_URL,

  custom: async ({ url, method, payload }) => {
    const res = await fetch(url, {
      method: method?.toUpperCase() || "GET",
      headers: getHeaders(),
      credentials: "include",
      body: payload ? JSON.stringify(payload) : undefined,
    });
    const data = await res.json();
    if (!res.ok) throw new Error((data as any).error || "Failed");
    return { data };
  },
};
