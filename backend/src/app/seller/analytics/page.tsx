"use client";

import { useCustom, useGetIdentity } from "@refinedev/core";
import {
  Card,
  Row,
  Col,
  Statistic,
  Typography,
  Spin,
  Tag,
  Empty,
  Progress,
} from "antd";
import { Eye, Navigation, Phone, BarChart2, TrendingUp } from "lucide-react";

const { Title, Text } = Typography;

const eventTypeColors: Record<string, string> = {
  VIEW: "blue",
  GET_DIRECTION: "green",
  CALL: "purple",
  SEARCH: "orange",
};

export default function SellerAnalyticsPage() {
  const { data: identity } = useGetIdentity<any>();
  const shop = identity?.shop;

  const { query } = useCustom({
    url: "/api/seller/analytics",
    method: "get",
    queryOptions: { enabled: !!shop },
  });

  const analytics = query.data?.data as any;

  if (query.isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="p-6">
        <Empty description="Register your shop first to see analytics" />
      </div>
    );
  }

  const stats = analytics?.stats || {};
  const topProducts = analytics?.topProducts || [];
  const recentEvents = analytics?.recentEvents || [];

  return (
    <div className="p-6 space-y-6">
      <div>
        <Title level={4} className="!mb-1">Analytics</Title>
        <Text type="secondary">Shop performance overview</Text>
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={12} md={6}>
          <Card className="rounded-xl border-0 shadow-sm">
            <Statistic
              title={<Text type="secondary">Total Views</Text>}
              value={stats.totalViews ?? 0}
              prefix={<Eye size={18} className="text-blue-500 mr-1" />}
              valueStyle={{ color: "#3b82f6" }}
            />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card className="rounded-xl border-0 shadow-sm">
            <Statistic
              title={<Text type="secondary">Direction Clicks</Text>}
              value={stats.directionClicks ?? 0}
              prefix={<Navigation size={18} className="text-green-500 mr-1" />}
              valueStyle={{ color: "#22c55e" }}
            />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card className="rounded-xl border-0 shadow-sm">
            <Statistic
              title={<Text type="secondary">Call Clicks</Text>}
              value={stats.callClicks ?? 0}
              prefix={<Phone size={18} className="text-purple-500 mr-1" />}
              valueStyle={{ color: "#a855f7" }}
            />
          </Card>
        </Col>
        <Col xs={12} md={6}>
          <Card className="rounded-xl border-0 shadow-sm">
            <Statistic
              title={<Text type="secondary">Conversion Rate</Text>}
              value={stats.conversionRate ?? 0}
              suffix="%"
              prefix={<TrendingUp size={18} className="text-orange-500 mr-1" />}
              valueStyle={{ color: "#f97316" }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={14}>
          <Card
            title={
              <div className="flex items-center gap-2">
                <BarChart2 size={18} className="text-orange-500" />
                Top Products by Views
              </div>
            }
            className="rounded-xl border-0 shadow-sm"
          >
            {topProducts.length === 0 ? (
              <Empty description="No product data yet" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            ) : (
              <div className="space-y-3">
                {topProducts.map((p: any, idx: number) => (
                  <div key={p.id} className="flex items-center gap-3">
                    <Text type="secondary" className="w-5 text-right text-xs">{idx + 1}</Text>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <Text strong className="truncate text-sm">{p.name}</Text>
                        <Text type="secondary" className="text-xs ml-2">{p.totalViews} views</Text>
                      </div>
                      <Progress
                        percent={topProducts[0]?.totalViews > 0 ? Math.round((p.totalViews / topProducts[0].totalViews) * 100) : 0}
                        strokeColor="#f97316"
                        showInfo={false}
                        size="small"
                      />
                    </div>
                    <Tag color={p.stockStatus === "IN_STOCK" ? "green" : p.stockStatus === "LIMITED" ? "orange" : "red"}>
                      ₹{p.price?.toLocaleString()}
                    </Tag>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </Col>

        <Col xs={24} lg={10}>
          <Card
            title="Recent Activity"
            className="rounded-xl border-0 shadow-sm"
          >
            {recentEvents.length === 0 ? (
              <Empty description="No events yet" image={Empty.PRESENTED_IMAGE_SIMPLE} />
            ) : (
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {recentEvents.slice(0, 20).map((e: any) => (
                  <div key={e.id} className="flex items-center justify-between py-1">
                    <Tag color={eventTypeColors[e.eventType] || "default"} className="text-xs">
                      {e.eventType}
                    </Tag>
                    <Text type="secondary" className="text-xs">
                      {new Date(e.createdAt).toLocaleDateString("en-IN", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </Text>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </Col>
      </Row>
    </div>
  );
}
