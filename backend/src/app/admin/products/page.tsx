"use client";

import { useTable } from "@/lib/useTable";
import { Table, Tag, Typography, Card, Image } from "antd";
import { Package } from "lucide-react";

const { Title, Text } = Typography;

export default function AdminProductsPage() {
  const { tableProps } = useTable({
    resource: "products",
    syncWithLocation: false,
  });

  return (
    <div className="p-6">
      <div className="mb-6">
        <Title level={4} className="!mb-0">Products</Title>
        <Text type="secondary">All products listed platform-wide</Text>
      </div>

      <Card className="rounded-xl border-0 shadow-sm">
        <Table
          {...(tableProps as any)}
          rowKey="id"
          columns={[
            {
              title: "Product",
              key: "product",
              render: (_, r: any) => {
                const images = (() => { try { return JSON.parse(r.images); } catch { return [r.images]; } })();
                return (
                  <div className="flex items-center gap-3">
                    {images?.[0] ? (
                      <Image src={images[0]} width={40} height={40} className="rounded-lg object-cover" preview={false} />
                    ) : (
                      <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                        <Package size={16} className="text-gray-400" />
                      </div>
                    )}
                    <div>
                      <Text strong className="text-sm">{r.name}</Text>
                      {r.brand && <Text type="secondary" className="block text-xs">{r.brand}</Text>}
                    </div>
                  </div>
                );
              },
            },
            { title: "Category", dataIndex: "category", render: (c: string) => <Tag>{c}</Tag> },
            {
              title: "Price",
              dataIndex: "price",
              render: (p: number) => <Text strong>₹{p?.toLocaleString()}</Text>,
            },
            {
              title: "Status",
              dataIndex: "moderationStatus",
              render: (s: string) => (
                <Tag color={s === "APPROVED" ? "success" : s === "PENDING" ? "warning" : "error"}>{s}</Tag>
              ),
            },
            { title: "Views", dataIndex: "totalViews", align: "center" },
            {
              title: "Added",
              dataIndex: "createdAt",
              render: (d: string) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" }),
            },
          ]}
        />
      </Card>
    </div>
  );
}
