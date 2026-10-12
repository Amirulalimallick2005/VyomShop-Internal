"use client";

import { useTable } from "@refinedev/antd";
import { Table, Tag, Typography, Card } from "antd";

const { Title, Text } = Typography;

const txTypeColors: Record<string, string> = {
  PURCHASE: "green",
  BONUS: "blue",
  DEDUCTION: "orange",
  MANUAL_ADJUST: "purple",
};

export default function AdminTransactionsPage() {
  const { tableProps } = useTable({
    resource: "transactions",
    syncWithLocation: false,
  });

  return (
    <div className="p-6">
      <div className="mb-6">
        <Title level={4} className="!mb-0">Transactions</Title>
        <Text type="secondary">Audit log of all credits and payments</Text>
      </div>

      <Card className="rounded-xl border-0 shadow-sm">
        <Table
          {...(tableProps as any)}
          rowKey="id"
          columns={[
            {
              title: "Shop",
              key: "shop",
              render: (_, r: any) => <Text strong className="text-sm">{r.shop?.name || r.shopId}</Text>,
            },
            {
              title: "Package",
              key: "package",
              render: (_, r: any) => r.package?.name ? <Tag>{r.package.name}</Tag> : <Text type="secondary">—</Text>,
            },
            {
              title: "Type",
              dataIndex: "type",
              render: (t: string) => <Tag color={txTypeColors[t] || "default"}>{t}</Tag>,
            },
            {
              title: "Amount",
              dataIndex: "amount",
              render: (a: number) => (
                <Text strong className="text-green-600">₹{a?.toLocaleString()}</Text>
              ),
            },
            {
              title: "Credits",
              key: "credits",
              render: (_, r: any) => (
                <Text type="secondary" className="text-xs">
                  +{r.creditsAdded} / -{r.creditsDeducted}
                </Text>
              ),
            },
            {
              title: "Status",
              dataIndex: "status",
              render: (s: string) => (
                <Tag color={s === "SUCCESS" ? "success" : s === "PENDING" ? "warning" : "error"}>{s}</Tag>
              ),
            },
            {
              title: "Date",
              dataIndex: "createdAt",
              render: (d: string) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" }),
            },
          ]}
        />
      </Card>
    </div>
  );
}
