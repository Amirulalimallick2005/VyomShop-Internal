"use client";

import React from "react";
import { List } from "@/components/admin/list";
import { DataTable } from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";
import { Package } from "lucide-react";

const statusVariants: Record<string, string> = {
  APPROVED: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700",
  PENDING: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-700",
  REJECTED: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-300 dark:border-rose-700",
};

export const ProductList = () => {
  return (
    <List>
      <DataTable>
        <DataTable.Col
          source="name"
          label="Product"
          render={(record: any) => {
            let firstImage = "";
            try {
              const imgs = typeof record.images === "string" ? JSON.parse(record.images) : record.images;
              if (Array.isArray(imgs) && imgs.length > 0) firstImage = imgs[0];
            } catch {
              if (typeof record.images === "string") firstImage = record.images;
            }
            return (
              <div className="flex items-center gap-3">
                {firstImage ? (
                  <img
                    src={firstImage}
                    alt={record.name}
                    className="w-10 h-10 rounded-lg object-cover border"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
                    <Package className="size-4 text-muted-foreground" />
                  </div>
                )}
                <div>
                  <div className="font-semibold text-sm">{record.name}</div>
                  {record.brand && (
                    <div className="text-xs text-muted-foreground">{record.brand}</div>
                  )}
                </div>
              </div>
            );
          }}
        />
        <DataTable.Col
          source="category"
          label="Category"
          render={(record: any) => (
            <Badge variant="secondary" className="text-xs">
              {record.category}
            </Badge>
          )}
        />
        <DataTable.Col
          source="price"
          label="Price"
          render={(record: any) => (
            <span className="font-semibold text-sm">
              ₹{(record.price || 0).toLocaleString()}
            </span>
          )}
        />
        <DataTable.Col
          source="moderationStatus"
          label="Status"
          render={(record: any) => (
            <Badge
              variant="outline"
              className={statusVariants[record.moderationStatus] || ""}
            >
              {record.moderationStatus || "APPROVED"}
            </Badge>
          )}
        />
        <DataTable.NumberCol source="totalViews" label="Views" />
        <DataTable.Col
          source="createdAt"
          label="Added"
          render={(record: any) =>
            new Date(record.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })
          }
        />
      </DataTable>
    </List>
  );
};
