"use client";

import React from "react";
import { List } from "@/components/admin/list";
import { DataTable } from "@/components/admin/data-table";
import { EditButton } from "@/components/admin/edit-button";
import { DeleteButton } from "@/components/admin/delete-button";
import { Badge } from "@/components/ui/badge";
import { Package } from "lucide-react";

const stockVariants: Record<string, string> = {
  IN_STOCK: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700",
  LIMITED: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-700",
  OUT_OF_STOCK: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-300 dark:border-rose-700",
};

export const SellerProductList = () => {
  return (
    <List>
      <DataTable>
        <DataTable.Col
          source="name"
          label="Product"
          render={(record: any) => {
            let firstImage = "";
            try {
              const imgs =
                typeof record.images === "string"
                  ? JSON.parse(record.images)
                  : record.images;
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
                    className="w-12 h-12 rounded-lg object-cover border"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-lg bg-orange-500/10 flex items-center justify-center">
                    <Package className="size-5 text-orange-500" />
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
            <div>
              <Badge variant="secondary" className="text-xs">
                {record.category}
              </Badge>
              {record.subcategory && (
                <span className="block text-[11px] text-muted-foreground mt-0.5">
                  {record.subcategory}
                </span>
              )}
            </div>
          )}
        />
        <DataTable.Col
          source="price"
          label="Price"
          render={(record: any) => (
            <div>
              <div className="font-semibold text-sm">
                ₹{(record.price || 0).toLocaleString()}
              </div>
              {record.mrp && record.mrp > record.price && (
                <div className="text-xs text-muted-foreground line-through">
                  ₹{record.mrp.toLocaleString()}
                </div>
              )}
            </div>
          )}
        />
        <DataTable.Col
          source="stockStatus"
          label="Stock"
          render={(record: any) => (
            <Badge
              variant="outline"
              className={stockVariants[record.stockStatus] || ""}
            >
              {(record.stockStatus || "IN_STOCK").replace("_", " ")}
            </Badge>
          )}
        />
        <DataTable.NumberCol source="totalViews" label="Views" />
        <DataTable.Col
          label="Actions"
          headerClassName="text-right"
          cellClassName="text-right"
          render={() => (
            <div className="flex items-center justify-end gap-2">
              <EditButton />
              <DeleteButton />
            </div>
          )}
        />
      </DataTable>
    </List>
  );
};
