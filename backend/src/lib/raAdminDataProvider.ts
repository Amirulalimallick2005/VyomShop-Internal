import type { DataProvider } from "ra-core";

const API_URL = "/api/admin";

export const raAdminDataProvider: DataProvider = {
  getList: async (resource, params) => {
    const { page = 1, perPage = 20 } = params.pagination || {};
    const { field = "id", order = "DESC" } = params.sort || {};
    const _start = (page - 1) * perPage;
    const _end = _start + perPage;
    const searchParams = new URLSearchParams({
      _start: String(_start),
      _end: String(_end),
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
    const res = await fetch(`${API_URL}/${resource}?${searchParams.toString()}`, {
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    const total = parseInt(res.headers.get("x-total-count") || "0", 10);
    const data = await res.json();
    if (!res.ok) throw new Error((data as any).error || "Failed to fetch");
    const list = Array.isArray(data) ? data : (data as any)[resource] || (data as any).data || [];
    return { data: list, total: total || list.length };
  },

  getOne: async (resource, params) => {
    const res = await fetch(`${API_URL}/${resource}/${params.id}`, {
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    const data = (await res.json()) as any;
    if (!res.ok) throw new Error(data.error || "Failed to fetch");
    return { data: data.shop || data.user || data.product || data.package || data };
  },

  getMany: async (resource, params) => {
    const promises = params.ids.map((id) =>
      fetch(`${API_URL}/${resource}/${id}`, {
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      })
        .then((r) => r.json())
        .then((data: any) => data.shop || data.user || data.product || data.package || data)
    );
    const data = await Promise.all(promises);
    return { data };
  },

  getManyReference: async (resource, params) => {
    const { page = 1, perPage = 20 } = params.pagination || {};
    const { field = "id", order = "DESC" } = params.sort || {};
    const _start = (page - 1) * perPage;
    const _end = _start + perPage;
    const searchParams = new URLSearchParams({
      _start: String(_start),
      _end: String(_end),
      _sort: field,
      _order: order,
      [params.target]: String(params.id),
    });
    const res = await fetch(`${API_URL}/${resource}?${searchParams.toString()}`, {
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    const total = parseInt(res.headers.get("x-total-count") || "0", 10);
    const data = await res.json();
    const list = Array.isArray(data) ? data : (data as any)[resource] || (data as any).data || [];
    return { data: list, total: total || list.length };
  },

  update: async (resource, params) => {
    const res = await fetch(`${API_URL}/${resource}/${params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(params.data),
    });
    const data = (await res.json()) as any;
    if (!res.ok) throw new Error(data.error || "Failed to update");
    return { data: data.shop || data.user || data.product || data.package || data };
  },

  updateMany: async (resource, params) => {
    const promises = params.ids.map((id) =>
      fetch(`${API_URL}/${resource}/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(params.data),
      })
    );
    await Promise.all(promises);
    return { data: params.ids };
  },

  create: async (resource, params) => {
    const res = await fetch(`${API_URL}/${resource}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(params.data),
    });
    const data = (await res.json()) as any;
    if (!res.ok) throw new Error(data.error || "Failed to create");
    return { data: data.shop || data.user || data.product || data.package || data };
  },

  delete: async (resource, params) => {
    const res = await fetch(`${API_URL}/${resource}/${params.id}`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    const data = (await res.json()) as any;
    if (!res.ok) throw new Error(data.error || "Failed to delete");
    return { data: (params.previousData || { id: params.id }) as any };
  },

  deleteMany: async (resource, params) => {
    const promises = params.ids.map((id) =>
      fetch(`${API_URL}/${resource}/${id}`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
      })
    );
    await Promise.all(promises);
    return { data: params.ids };
  },
};
