"use client";

import { useTable } from "@refinedev/antd";
import { Table, Tag, Button, Typography, Card, Space } from "antd";
import { Plus } from "lucide-react";
import Link from "next/link";

const { Title, Text } = Typography;

export default function AdminPackagesPage() {
  const { tableProps } = useTable({
    resource: "packages",
    syncWithLocation: false,
  });

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Title level={4} className="!mb-0">Credit Packages</Title>
          <Text type="secondary">Packages available for sellers to purchase listing credits</Text>
        </div>
        <Link href="/admin/packages/create">
          <Button type="primary" icon={<Plus size={16} />} className="bg-indigo-600">
            New Package
          </Button>
        </Link>
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
                <Space>
                  <Text strong>{name}</Text>
                  {r.badge && <Tag color="gold">{r.badge}</Tag>}
                </Space>
              ),
            },
            { title: "Listings", dataIndex: "totalListings", align: "center" },
            { title: "Free Credits", dataIndex: "freeCredits", align: "center" },
            { title: "Paid Credits", dataIndex: "paidCredits", align: "center" },
            {
              title: "Price",
              dataIndex: "price",
              render: (p: number) => <Text strong>₹{p?.toLocaleString()}</Text>,
            },
            {
              title: "Per Product",
              dataIndex: "perProductPrice",
              render: (p: number) => <Text type="secondary">₹{p}</Text>,
            },
            {
              title: "Active",
              dataIndex: "isActive",
              render: (v: boolean) => v ? <Tag color="success">Active</Tag> : <Tag>Inactive</Tag>,
              align: "center",
            },
          ]}
        />
      </Card>
    </div>
  );
}
