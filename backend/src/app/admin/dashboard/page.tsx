"use client";

import { useCustom } from "@refinedev/core";
import {
  Card,
  Row,
  Col,
  Statistic,
  Typography,
  Spin,
  Table,
  Tag,
  Badge,
  Space,
} from "antd";
import {
  Store,
  Users,
  Package,
  IndianRupee,
  Eye,
  Navigation,
  Clock,
  CheckCircle,
} from "lucide-react";
import Link from "next/link";

const { Title, Text } = Typography;

export default function AdminDashboardPage() {
  const { query } = useCustom({
    url: "/api/admin/dashboard",
    method: "get",
  });

  const dashboard = query.data?.data as any;
  const metrics = dashboard?.metrics || {};

  if (query.isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <Title level={4} className="!mb-1">Platform Dashboard</Title>
        <Text type="secondary">Real-time metrics across all shops</Text>
      </div>

      <Row gutter={[16, 16]}>
        {[
          { title: "Total Shops", value: metrics.totalShops, icon: <Store size={18} className="text-indigo-500" />, color: "#6366f1" },
          { title: "Approved Shops", value: metrics.approvedShops, icon: <CheckCircle size={18} className="text-green-500" />, color: "#22c55e" },
          { title: "Pending Approval", value: metrics.pendingShops, icon: <Clock size={18} className="text-yellow-500" />, color: "#eab308" },
          { title: "Total Users", value: metrics.totalUsers, icon: <Users size={18} className="text-blue-500" />, color: "#3b82f6" },
          { title: "Total Products", value: metrics.totalProducts, icon: <Package size={18} className="text-purple-500" />, color: "#a855f7" },
          { title: "Total Revenue", value: `₹${(metrics.totalRevenue || 0).toLocaleString()}`, icon: <IndianRupee size={18} className="text-orange-500" />, color: "#f97316" },
          { title: "Total Views", value: metrics.totalViews, icon: <Eye size={18} className="text-cyan-500" />, color: "#06b6d4" },
          { title: "Direction Clicks", value: metrics.totalDirections, icon: <Navigation size={18} className="text-teal-500" />, color: "#14b8a6" },
        ].map((m) => (
          <Col xs={12} sm={8} md={6} key={m.title}>
            <Card className="rounded-xl border-0 shadow-sm">
              <div className="flex items-center gap-2 mb-1">{m.icon}</div>
              <Statistic
                title={<Text type="secondary" className="text-xs">{m.title}</Text>}
                value={m.value ?? 0}
                valueStyle={{ color: m.color, fontSize: 22 }}
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card
            title={
              <Space>
                <Clock size={16} className="text-yellow-500" />
                <span>Pending Shop Approvals</span>
                {metrics.pendingShops > 0 && <Badge count={metrics.pendingShops} color="#eab308" />}
              </Space>
            }
            extra={<Link href="/admin/shops"><Text type="secondary" className="text-xs">View all</Text></Link>}
            className="rounded-xl border-0 shadow-sm"
          >
            <Table
              dataSource={dashboard?.recentPendingShops || []}
              rowKey="id"
              size="small"
              pagination={false}
              locale={{ emptyText: "No pending shops" }}
              columns={[
                {
                  title: "Shop",
                  key: "shop",
                  render: (_, r: any) => (
                    <div>
                      <Text strong className="text-sm">{r.name}</Text>
                      <Text type="secondary" className="block text-xs">{r.area}, {r.city}</Text>
                    </div>
                  ),
                },
                {
                  title: "Owner",
                  key: "owner",
                  render: (_, r: any) => (
                    <Text type="secondary" className="text-xs">
                      {r.owner?.name || r.owner?.email || "Unknown"}
                    </Text>
                  ),
                },
                {
                  title: "Date",
                  dataIndex: "createdAt",
                  render: (d: string) => (
                    <Text type="secondary" className="text-xs">
                      {new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                    </Text>
                  ),
                },
                {
                  title: "",
                  key: "action",
                  render: (_, r: any) => (
                    <Link href={`/admin/shops/${r.id}`}>
                      <Text className="text-indigo-600 text-xs cursor-pointer">Review →</Text>
                    </Link>
                  ),
                },
              ]}
            />
          </Card>
        </Col>

        <Col xs={24} lg={10}>
          <Card
            title="Recent Transactions"
            extra={<Link href="/admin/transactions"><Text type="secondary" className="text-xs">View all</Text></Link>}
            className="rounded-xl border-0 shadow-sm"
          >
            <div className="space-y-3">
              {(dashboard?.recentTransactions || []).map((t: any) => (
                <div key={t.id} className="flex items-center justify-between">
                  <div className="min-w-0">
                    <Text strong className="text-sm truncate block">{t.shop?.name}</Text>
                    <Text type="secondary" className="text-xs">{t.package?.name || t.type}</Text>
                  </div>
                  <div className="text-right ml-3">
                    <Text strong className="text-green-600 block">₹{t.amount?.toLocaleString()}</Text>
                    <Tag color={t.status === "SUCCESS" ? "success" : "error"} className="text-xs">
                      {t.status}
                    </Tag>
                  </div>
                </div>
              ))}
              {!dashboard?.recentTransactions?.length && (
                <Text type="secondary" className="text-xs">No transactions yet</Text>
              )}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
