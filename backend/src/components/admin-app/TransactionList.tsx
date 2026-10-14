"use client";

import React from "react";
import { List } from "@/components/admin/list";
import { DataTable } from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";

const typeVariants: Record<string, string> = {
  PURCHASE: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700",
  BONUS: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-700",
  DEDUCTION: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-700",
  MANUAL_ADJUST: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-300 dark:border-purple-700",
};

const statusVariants: Record<string, string> = {
  SUCCESS: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700",
  PENDING: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-700",
  FAILED: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-300 dark:border-rose-700",
};

export const TransactionList = () => {
  return (
    <List>
      <DataTable>
        <DataTable.Col
          source="shop"
          label="Shop"
          render={(record: any) => (
            <span className="font-semibold text-sm">
              {record.shop?.name || record.shopId || "—"}
            </span>
          )}
        />
        <DataTable.Col
          source="package"
          label="Package"
          render={(record: any) =>
            record.package?.name ? (
              <Badge variant="secondary">{record.package.name}</Badge>
            ) : (
              <span className="text-xs text-muted-foreground">—</span>
            )
          }
        />
        <DataTable.Col
          source="type"
          label="Type"
          render={(record: any) => (
            <Badge
              variant="outline"
              className={typeVariants[record.type] || ""}
            >
              {record.type}
            </Badge>
          )}
        />
        <DataTable.Col
          source="amount"
          label="Amount"
          render={(record: any) => (
            <span className="font-semibold text-sm text-emerald-600 dark:text-emerald-400">
              ₹{(record.amount || 0).toLocaleString()}
            </span>
          )}
        />
        <DataTable.Col
          label="Credits"
          render={(record: any) => (
            <span className="text-xs text-muted-foreground">
              +{record.creditsAdded ?? 0} / -{record.creditsDeducted ?? 0}
            </span>
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
        <DataTable.Col
          source="createdAt"
          label="Date"
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
