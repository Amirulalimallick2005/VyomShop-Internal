"use client";

import { useGetIdentity, useCustom } from "@refinedev/core";
import {
  Card,
  Row,
  Col,
  Statistic,
  Tag,
  Button,
  Typography,
  Spin,
  Alert,
  Progress,
  Space,
} from "antd";
import {
  Eye,
  Navigation,
  Phone,
  Package,
  Coins,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  ArrowRight,
  Store,
} from "lucide-react";
import Link from "next/link";

const { Title, Text } = Typography;

const StatusConfig: Record<string, { color: "warning" | "success" | "error" | "default"; icon: React.ReactNode; label: string; description: string }> = {
  PENDING: {
    color: "warning",
    icon: <Clock size={20} className="text-yellow-500" />,
    label: "Pending Approval",
    description: "Your shop is under review. The admin will approve it shortly.",
  },
  APPROVED: {
    color: "success",
    icon: <CheckCircle size={20} className="text-green-500" />,
    label: "Approved & Live",
    description: "Your shop is live and visible to customers!",
  },
  REJECTED: {
    color: "error",
    icon: <XCircle size={20} className="text-red-500" />,
    label: "Rejected",
    description: "Your shop was rejected. Please contact support.",
  },
  SUSPENDED: {
    color: "default",
    icon: <AlertTriangle size={20} className="text-gray-500" />,
    label: "Suspended",
    description: "Your shop has been suspended. Please contact support.",
  },
};

export default function SellerDashboardPage() {
  const { data: identity } = useGetIdentity<any>();
  const shop = identity?.shop;

  const { query: analyticsQuery } = useCustom({
    url: "/api/seller/analytics",
    method: "get",
    queryOptions: { enabled: !!shop },
  });

  const { query: walletQuery } = useCustom({
    url: "/api/seller/wallet",
    method: "get",
    queryOptions: { enabled: !!shop },
  });

  if (!identity) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="p-6">
        <Alert
          type="info"
          showIcon
          title="No shop registered yet"
          description={
            <Space orientation="vertical">
              <Text>You haven't registered your shop yet. Set up your shop profile to get started.</Text>
              <Link href="/seller/shop">
                <Button type="primary" icon={<ArrowRight size={16} />} className="bg-orange-500">
                  Register Your Shop
                </Button>
              </Link>
            </Space>
          }
        />
      </div>
    );
  }

  const status = shop?.status || "PENDING";
  const statusConfig = StatusConfig[status] || StatusConfig.PENDING;
  const analytics = (analyticsQuery.data?.data as any)?.stats;
  const wallet = walletQuery.data?.data as any;

  return (
    <div className="p-6 space-y-6">
      <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <Text className="text-orange-100 text-sm">Welcome back,</Text>
            <Title level={3} className="!text-white !mb-1">
              {identity?.name || "Seller"}
            </Title>
            <Text className="text-orange-100">{shop.name}</Text>
          </div>
          <div className="text-right">
            <div className="flex items-center gap-2 justify-end">
              {statusConfig.icon}
              <Tag color={statusConfig.color} className="text-sm">
                {statusConfig.label}
              </Tag>
            </div>
            {shop.area && <Text className="text-orange-100 text-xs mt-1 block">{shop.area}, {shop.city || "Delhi"}</Text>}
          </div>
        </div>

        {status !== "APPROVED" && (
          <Alert
            className="mt-4"
            type={status === "PENDING" ? "warning" : "error"}
            title={statusConfig.description}
            showIcon
          />
        )}
      </div>

      {status === "REJECTED" && shop.rejectionReason && (
        <Alert
          type="error"
          showIcon
          title="Rejection Reason"
          description={shop.rejectionReason}
        />
      )}

      <Row gutter={[16, 16]}>
        <Col xs={12} sm={6}>
          <Card className="rounded-xl border-0 shadow-sm">
            <Statistic
              title={<Text type="secondary">Total Views</Text>}
              value={analytics?.totalViews ?? shop.totalViews ?? 0}
              prefix={<Eye size={18} className="text-blue-500 mr-1" />}
              styles={{ content: { color: "#3b82f6" } }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="rounded-xl border-0 shadow-sm">
            <Statistic
              title={<Text type="secondary">Direction Clicks</Text>}
              value={analytics?.directionClicks ?? shop.directionClicks ?? 0}
              prefix={<Navigation size={18} className="text-green-500 mr-1" />}
              styles={{ content: { color: "#22c55e" } }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="rounded-xl border-0 shadow-sm">
            <Statistic
              title={<Text type="secondary">Call Clicks</Text>}
              value={analytics?.callClicks ?? shop.callClicks ?? 0}
              prefix={<Phone size={18} className="text-purple-500 mr-1" />}
              styles={{ content: { color: "#a855f7" } }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card className="rounded-xl border-0 shadow-sm">
            <Statistic
              title={<Text type="secondary">Credits Balance</Text>}
              value={wallet?.shop?.creditsBalance ?? shop.creditsBalance ?? 0}
              prefix={<Coins size={18} className="text-orange-500 mr-1" />}
              styles={{ content: { color: "#f97316" } }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <Card title="Quick Actions" className="rounded-xl border-0 shadow-sm">
            <Space orientation="vertical" className="w-full">
              <Link href="/seller/products/create">
                <Button block icon={<Package size={16} />} type="primary" className="bg-orange-500 text-left">
                  Add New Product
                </Button>
              </Link>
              <Link href="/seller/shop">
                <Button block icon={<Store size={16} />}>
                  Edit Shop Profile
                </Button>
              </Link>
              <Link href="/seller/analytics">
                <Button block icon={<Eye size={16} />}>
                  View Full Analytics
                </Button>
              </Link>
            </Space>
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card
            title="Listing Credits"
            extra={
              <Link href="/seller/wallet">
                <Button size="small" type="link">Buy More</Button>
              </Link>
            }
            className="rounded-xl border-0 shadow-sm"
          >
            <Statistic
              value={wallet?.shop?.creditsBalance ?? shop.creditsBalance ?? 0}
              suffix="credits remaining"
              styles={{ content: { fontSize: 28, color: "#f97316" } }}
            />
            <Text type="secondary" className="text-xs">
              Each product listing costs 1 credit
            </Text>
            <Progress
              percent={Math.min(100, ((wallet?.shop?.creditsBalance ?? shop.creditsBalance ?? 0) / 50) * 100)}
              strokeColor="#f97316"
              className="mt-3"
              showInfo={false}
            />
          </Card>
        </Col>
      </Row>
    </div>
  );
}
