"use client";

import React from "react";
import { List } from "@/components/admin/list";
import { DataTable } from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";

export const PackageList = () => {
  return (
    <List>
      <DataTable>
        <DataTable.Col
          source="name"
          label="Package"
          render={(record: any) => (
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm">{record.name}</span>
              {record.badge && (
                <Badge variant="secondary" className="bg-amber-500/10 text-amber-600 border-amber-300">
                  {record.badge}
                </Badge>
              )}
            </div>
          )}
        />
        <DataTable.NumberCol source="totalListings" label="Listings" />
        <DataTable.NumberCol source="freeCredits" label="Free Credits" />
        <DataTable.NumberCol source="paidCredits" label="Paid Credits" />
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
          source="perProductPrice"
          label="Per Product"
          render={(record: any) => (
            <span className="text-xs text-muted-foreground">
              {record.perProductPrice ? `₹${record.perProductPrice}` : "—"}
            </span>
          )}
        />
        <DataTable.Col
          source="isActive"
          label="Status"
          render={(record: any) =>
            record.isActive ? (
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-300">
                Active
              </Badge>
            ) : (
              <Badge variant="outline" className="text-muted-foreground">
                Inactive
              </Badge>
            )
          }
        />
      </DataTable>
    </List>
  );
};
