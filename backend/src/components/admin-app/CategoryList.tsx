"use client";

import React from "react";
import { List } from "@/components/admin/list";
import { DataTable } from "@/components/admin/data-table";
import { EditButton } from "@/components/admin/edit-button";
import { DeleteButton } from "@/components/admin/delete-button";
import { Badge } from "@/components/ui/badge";
import { Tag } from "lucide-react";

export const CategoryList = () => {
  return (
    <List>
      <DataTable>
        <DataTable.Col
          source="name"
          label="Category"
          render={(record: any) => (
            <div className="flex items-center gap-3">
              <div className="size-9 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-600 dark:text-orange-400 font-semibold">
                <Tag className="size-4" />
              </div>
              <div>
                <div className="font-semibold text-sm">{record.name}</div>
                <div className="text-xs text-muted-foreground font-mono">
                  /{record.slug}
                </div>
              </div>
            </div>
          )}
        />
        <DataTable.Col
          source="description"
          label="Description"
          render={(record: any) => (
            <span className="text-xs text-muted-foreground line-clamp-1 max-w-xs">
              {record.description || "—"}
            </span>
          )}
        />
        <DataTable.NumberCol source="sortOrder" label="Sort Order" />
        <DataTable.Col
          source="isActive"
          label="Status"
          render={(record: any) =>
            record.isActive ? (
              <Badge
                variant="outline"
                className="bg-emerald-500/10 text-emerald-600 border-emerald-300 dark:border-emerald-700"
              >
                Active
              </Badge>
            ) : (
              <Badge variant="outline" className="text-muted-foreground">
                Inactive
              </Badge>
            )
          }
        />
        <DataTable.Col
          source="productsCount"
          label="Products"
          render={(record: any) => (
            <Badge variant="secondary" className="font-mono text-xs">
              {record.productsCount ?? 0}
            </Badge>
          )}
        />
        <DataTable.Col
          source="createdAt"
          label="Created"
          render={(record: any) =>
            new Date(record.createdAt).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })
          }
        />
        <DataTable.Col
          label="Actions"
          headerClassName="text-right"
          cellClassName="text-right"
          render={() => (
            <div className="flex items-center justify-end gap-1">
              <EditButton />
              <DeleteButton />
            </div>
          )}
        />
      </DataTable>
    </List>
  );
};
