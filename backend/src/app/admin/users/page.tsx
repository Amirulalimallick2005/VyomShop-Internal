"use client";

import { useCustomMutation } from "@refinedev/core";
import { useTable } from "@/lib/useTable";
import { Table, Tag, Button, Typography, Card, Popconfirm } from "antd";
import { Ban, CheckCircle } from "lucide-react";

const { Title, Text } = Typography;

export default function AdminUsersPage() {
  const { tableProps } = useTable({
    resource: "users",
    syncWithLocation: false,
  });

  const { mutate: updateUser } = useCustomMutation();

  return (
    <div className="p-6">
      <div className="mb-6">
        <Title level={4} className="!mb-0">Users</Title>
        <Text type="secondary">Registered users across customer, seller, and admin roles</Text>
      </div>

      <Card className="rounded-xl border-0 shadow-sm">
        <Table
          {...(tableProps as any)}
          rowKey="id"
          columns={[
            {
              title: "Name",
              dataIndex: "name",
              render: (name: string, r: any) => (
                <div>
                  <Text strong>{name || "—"}</Text>
                  <Text type="secondary" className="block text-xs">{r.email || r.phoneNumber}</Text>
                </div>
              ),
            },
            {
              title: "Role",
              dataIndex: "role",
              render: (role: string) => (
                <Tag color={role === "SUPER_ADMIN" ? "red" : role === "SELLER" ? "orange" : "blue"}>
                  {role}
                </Tag>
              ),
            },
            {
              title: "Status",
              dataIndex: "banned",
              render: (banned: boolean) => (
                banned ? <Tag color="error">Banned</Tag> : <Tag color="success">Active</Tag>
              ),
            },
            {
              title: "Joined",
              dataIndex: "createdAt",
              render: (d: string) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
            },
            {
              title: "Actions",
              key: "actions",
              align: "right",
              render: (_, r: any) => (
                r.role !== "SUPER_ADMIN" ? (
                  <Popconfirm
                    title={r.banned ? "Unban this user?" : "Ban this user?"}
                    onConfirm={() =>
                      updateUser({
                        url: `/api/admin/users/${r.id}`,
                        method: "put",
                        values: { banned: !r.banned },
                      }, { onSuccess: () => window.location.reload() })
                    }
                  >
                    <Button
                      size="small"
                      danger={!r.banned}
                      icon={r.banned ? <CheckCircle size={14} /> : <Ban size={14} />}
                    >
                      {r.banned ? "Unban" : "Ban"}
                    </Button>
                  </Popconfirm>
                ) : null
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
}
