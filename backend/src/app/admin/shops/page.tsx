"use client";

import { useTable } from "@refinedev/antd";
import {
  Table,
  Tag,
  Button,
  Typography,
  Card,
} from "antd";
import { Eye } from "lucide-react";
import Link from "next/link";

const { Title, Text } = Typography;

const statusColors: Record<string, "warning" | "success" | "error" | "default"> = {
  PENDING: "warning",
  APPROVED: "success",
  REJECTED: "error",
  SUSPENDED: "default",
};

export default function AdminShopsPage() {
  const { tableProps } = useTable({
    resource: "shops",
    syncWithLocation: false,
  });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Title level={4} className="!mb-0">Shops</Title>
          <Text type="secondary">All registered shops across the platform</Text>
        </div>
      </div>

      <Card className="rounded-xl border-0 shadow-sm">
        <Table
          {...(tableProps as any)}
          rowKey="id"
          columns={[
            {
              title: "Shop",
              key: "shop",
              render: (_, r: any) => (
                <div>
                  <Text strong>{r.name}</Text>
                  <Text type="secondary" className="block text-xs">{r.area}, {r.city}</Text>
                </div>
              ),
            },
            {
              title: "Owner",
              key: "owner",
              render: (_, r: any) => (
                <div>
                  <Text className="text-sm">{r.owner?.name || "—"}</Text>
                  <Text type="secondary" className="block text-xs">{r.owner?.email || r.owner?.phoneNumber}</Text>
                </div>
              ),
            },
            {
              title: "Status",
              dataIndex: "status",
              render: (status: string) => (
                <Tag color={statusColors[status] || "default"}>{status}</Tag>
              ),
              filters: [
                { text: "Pending", value: "PENDING" },
                { text: "Approved", value: "APPROVED" },
                { text: "Rejected", value: "REJECTED" },
                { text: "Suspended", value: "SUSPENDED" },
              ],
            },
            {
              title: "Credits",
              dataIndex: "creditsBalance",
              align: "center",
            },
            {
              title: "Verified",
              dataIndex: "isVerified",
              render: (v: boolean) => v ? <Tag color="blue">Verified</Tag> : null,
              align: "center",
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
                <Link href={`/admin/shops/${r.id}`}>
                  <Button size="small" icon={<Eye size={14} />}>
                    Review
                  </Button>
                </Link>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
}
