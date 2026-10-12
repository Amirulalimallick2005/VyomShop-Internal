"use client";

import { useDelete, useGetIdentity } from "@refinedev/core";
import { useTable } from "@refinedev/antd";
import {
  Table,
  Button,
  Tag,
  Space,
  Image,
  Typography,
  Popconfirm,
  Card,
  Empty,
  Tooltip,
  Alert,
} from "antd";
import { Plus, Trash2, Pencil, Package } from "lucide-react";
import Link from "next/link";

const { Title, Text } = Typography;

const stockColors: Record<string, string> = {
  IN_STOCK: "green",
  LIMITED: "orange",
  OUT_OF_STOCK: "red",
};

export default function SellerProductsPage() {
  const { tableProps } = useTable({
    resource: "products",
    syncWithLocation: false,
  });

  const { mutate: deleteProduct } = useDelete();
  const { data: identity } = useGetIdentity<any>();
  const shop = identity?.shop;
  const credits = shop?.creditsBalance ?? 0;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Title level={4} className="!mb-0">
            Products
          </Title>
          <Text type="secondary">Manage products in your shop</Text>
        </div>
        <Link href="/seller/products/create">
          <Button
            type="primary"
            icon={<Plus size={16} />}
            className="bg-orange-500 hover:bg-orange-600"
            disabled={credits < 1}
          >
            Add Product
          </Button>
        </Link>
      </div>

      {credits < 1 && (
        <Alert
          type="warning"
          showIcon
          title="No listing credits"
          description="Purchase a credit package to add new products."
          className="mb-4"
          action={
            <Link href="/seller/wallet">
              <Button size="small" type="primary" className="bg-orange-500">
                Buy Credits
              </Button>
            </Link>
          }
        />
      )}

      <Card className="rounded-xl border-0 shadow-sm">
        <Table
          {...(tableProps as any)}
          rowKey="id"
          locale={{ emptyText: <Empty description="No products yet" image={Empty.PRESENTED_IMAGE_SIMPLE} /> }}
          columns={[
            {
              title: "Product",
              key: "product",
              render: (_, record: any) => (
                <div className="flex items-center gap-3">
                  {record.images?.[0] ? (
                    <Image
                      src={record.images[0]}
                      alt={record.name}
                      width={48}
                      height={48}
                      className="rounded-lg object-cover"
                      preview={false}
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-lg bg-orange-50 flex items-center justify-center">
                      <Package size={20} className="text-orange-300" />
                    </div>
                  )}
                  <div>
                    <Text strong>{record.name}</Text>
                    {record.brand && <Text type="secondary" className="block text-xs">{record.brand}</Text>}
                  </div>
                </div>
              ),
            },
            {
              title: "Category",
              dataIndex: "category",
              render: (cat: string, record: any) => (
                <Space direction="vertical" size={0}>
                  <Tag>{cat}</Tag>
                  {record.subcategory && <Text type="secondary" className="text-xs">{record.subcategory}</Text>}
                </Space>
              ),
            },
            {
              title: "Price",
              key: "price",
              render: (_, record: any) => (
                <Space direction="vertical" size={0}>
                  <Text strong>₹{record.price?.toLocaleString()}</Text>
                  {record.mrp && record.mrp > record.price && (
                    <Text delete type="secondary" className="text-xs">
                      ₹{record.mrp?.toLocaleString()}
                    </Text>
                  )}
                </Space>
              ),
            },
            {
              title: "Stock",
              dataIndex: "stockStatus",
              render: (status: string) => (
                <Tag color={stockColors[status] || "default"}>
                  {status?.replace("_", " ")}
                </Tag>
              ),
            },
            {
              title: "Views",
              dataIndex: "totalViews",
              align: "center",
              sorter: true,
            },
            {
              title: "Actions",
              key: "actions",
              align: "right",
              render: (_, record: any) => (
                <Space>
                  <Link href={`/seller/products/edit/${record.id}`}>
                    <Tooltip title="Edit">
                      <Button size="small" icon={<Pencil size={14} />} />
                    </Tooltip>
                  </Link>
                  <Popconfirm
                    title="Delete this product?"
                    description="This action cannot be undone."
                    onConfirm={() => deleteProduct({ resource: "products", id: record.id })}
                    okButtonProps={{ danger: true }}
                  >
                    <Tooltip title="Delete">
                      <Button size="small" danger icon={<Trash2 size={14} />} />
                    </Tooltip>
                  </Popconfirm>
                </Space>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
}
