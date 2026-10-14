"use client";

import React from "react";
import { List } from "@/components/admin/list";
import { DataTable } from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { LinkBase } from "ra-core";

const statusVariants: Record<string, string> = {
  PENDING: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-700",
  APPROVED: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700",
  REJECTED: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-300 dark:border-rose-700",
  SUSPENDED: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700",
};

export const ShopList = () => {
  return (
    <List>
      <DataTable rowClick="show">
        <DataTable.Col
          source="name"
          label="Shop"
          render={(record: any) => (
            <div>
              <div className="font-semibold text-sm">{record.name}</div>
              <div className="text-xs text-muted-foreground">
                {record.area}, {record.city}
              </div>
            </div>
          )}
        />
        <DataTable.Col
          label="Owner"
          render={(record: any) => (
            <div>
              <div className="text-sm">{record.owner?.name || "—"}</div>
              <div className="text-xs text-muted-foreground">
                {record.owner?.email || record.owner?.phoneNumber || ""}
              </div>
            </div>
          )}
        />
        <DataTable.Col
          source="status"
          label="Status"
          render={(record: any) => (
            <Badge
              variant="outline"
              className={statusVariants[record.status] || ""}
            >
              {record.status}
            </Badge>
          )}
        />
        <DataTable.NumberCol source="creditsBalance" label="Credits" />
        <DataTable.Col
          source="isVerified"
          label="Verified"
          render={(record: any) =>
            record.isVerified ? (
              <Badge variant="outline" className="border-blue-500/30 text-blue-600 dark:text-blue-400 bg-blue-500/10">
                Verified
              </Badge>
            ) : (
              <span className="text-xs text-muted-foreground">—</span>
            )
          }
        />
        <DataTable.Col
          source="createdAt"
          label="Joined"
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
          render={(record: any) => (
            <Button
              variant="outline"
              size="sm"
              render={<LinkBase to={`/shops/${record.id}/show`} />}
              onClick={(e) => e.stopPropagation()}
            >
              <Eye className="size-3.5 mr-1" /> Review
            </Button>
          )}
        />
      </DataTable>
    </List>
  );
};
