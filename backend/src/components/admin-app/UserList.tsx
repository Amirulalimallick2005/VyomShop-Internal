"use client";

import React, { useState } from "react";
import { List } from "@/components/admin/list";
import { DataTable } from "@/components/admin/data-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Ban, CheckCircle } from "lucide-react";
import { useRefresh, useNotify } from "ra-core";

const roleVariants: Record<string, string> = {
  SUPER_ADMIN: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-300 dark:border-rose-700",
  SELLER: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-700",
  CUSTOMER: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-700",
};

export const UserList = () => {
  const refresh = useRefresh();
  const notify = useNotify();
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const toggleBan = async (user: any) => {
    setUpdatingId(user.id);
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ banned: !user.banned }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update user");
      notify(`User ${user.banned ? "unbanned" : "banned"} successfully`, { type: "info" });
      refresh();
    } catch (err: any) {
      notify(err.message || "Failed to update user", { type: "error" });
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <List>
      <DataTable>
        <DataTable.Col
          source="name"
          label="User"
          render={(record: any) => (
            <div>
              <div className="font-semibold text-sm">{record.name || "—"}</div>
              <div className="text-xs text-muted-foreground">
                {record.email || record.phoneNumber || "No contact info"}
              </div>
            </div>
          )}
        />
        <DataTable.Col
          source="role"
          label="Role"
          render={(record: any) => (
            <Badge
              variant="outline"
              className={roleVariants[record.role] || ""}
            >
              {record.role}
            </Badge>
          )}
        />
        <DataTable.Col
          source="banned"
          label="Status"
          render={(record: any) =>
            record.banned ? (
              <Badge variant="destructive">Banned</Badge>
            ) : (
              <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-300 dark:border-emerald-700">
                Active
              </Badge>
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
          render={(record: any) =>
            record.role !== "SUPER_ADMIN" ? (
              <Button
                variant={record.banned ? "outline" : "destructive"}
                size="sm"
                disabled={updatingId === record.id}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleBan(record);
                }}
              >
                {record.banned ? (
                  <>
                    <CheckCircle className="size-3.5 mr-1 text-emerald-600" /> Unban
                  </>
                ) : (
                  <>
                    <Ban className="size-3.5 mr-1" /> Ban
                  </>
                )}
              </Button>
            ) : null
          }
        />
      </DataTable>
    </List>
  );
};
