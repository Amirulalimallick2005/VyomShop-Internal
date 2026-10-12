"use client";

import { useOne, useCustomMutation } from "@refinedev/core";
import {
  Card,
  Button,
  Tag,
  Typography,
  Spin,
  Descriptions,
  Space,
  Input,
  Row,
  Col,
  Statistic,
  Alert,
  Popconfirm,
} from "antd";
import { ArrowLeft, CheckCircle, XCircle, PauseCircle } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

const { Title, Text } = Typography;
const { TextArea } = Input;

const statusColors: Record<string, "warning" | "success" | "error" | "default"> = {
  PENDING: "warning",
  APPROVED: "success",
  REJECTED: "error",
  SUSPENDED: "default",
};

export default function AdminShopDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [rejectionReason, setRejectionReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);

  const { query } = useOne({ resource: "shops", id });
  const shop = (query.data?.data as any)?.shop || query.data?.data;

  const { mutate: updateShop, mutation } = useCustomMutation();

  const changeStatus = (status: string, reason?: string) => {
    updateShop(
      {
        url: `/api/admin/shops/${id}`,
        method: "put",
        values: { status, ...(reason ? { rejectionReason: reason } : {}) },
      },
      { onSuccess: () => query.refetch() }
    );
  };

  if (query.isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  if (!shop) {
    return <Alert type="error" title="Shop not found" />;
  }

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/shops">
          <Button icon={<ArrowLeft size={16} />} />
        </Link>
        <div className="flex-1">
          <Title level={4} className="!mb-0">{shop.name}</Title>
          <Text type="secondary">{shop.area}, {shop.city}</Text>
        </div>
        <Tag color={statusColors[shop.status] || "default"} className="text-sm px-3 py-1">
          {shop.status}
        </Tag>
      </div>

      <Card className="rounded-xl border-0 shadow-sm mb-6">
        <Title level={5} className="!mb-4">Moderation Actions</Title>
        <Space wrap>
          {shop.status !== "APPROVED" && (
            <Popconfirm
              title="Approve this shop?"
              description="This will make the shop live for customers."
              onConfirm={() => changeStatus("APPROVED")}
            >
              <Button
                type="primary"
                icon={<CheckCircle size={16} />}
                loading={mutation.isPending}
                className="bg-green-600 hover:bg-green-700"
              >
                Approve Shop
              </Button>
            </Popconfirm>
          )}

          {shop.status !== "SUSPENDED" && shop.status === "APPROVED" && (
            <Popconfirm
              title="Suspend this shop?"
              onConfirm={() => changeStatus("SUSPENDED")}
            >
              <Button icon={<PauseCircle size={16} />} loading={mutation.isPending}>
                Suspend
              </Button>
            </Popconfirm>
          )}

          {shop.status !== "REJECTED" && shop.status !== "APPROVED" && (
            <Button
              danger
              icon={<XCircle size={16} />}
              onClick={() => setShowRejectForm(!showRejectForm)}
            >
              Reject Shop
            </Button>
          )}
        </Space>

        {showRejectForm && (
          <div className="mt-4">
            <TextArea
              rows={3}
              placeholder="Reason for rejection (will be shown to seller)..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="mb-3"
            />
            <Button
              danger
              loading={mutation.isPending}
              onClick={() => {
                changeStatus("REJECTED", rejectionReason);
                setShowRejectForm(false);
              }}
            >
              Confirm Rejection
            </Button>
          </div>
        )}
      </Card>

      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card className="rounded-xl border-0 shadow-sm">
            <Descriptions
              title="Shop Details"
              bordered
              column={{ xs: 1, md: 2 }}
              size="small"
            >
              <Descriptions.Item label="Phone">{shop.phone}</Descriptions.Item>
              <Descriptions.Item label="Email">{shop.email || "—"}</Descriptions.Item>
              <Descriptions.Item label="Address" span={2}>{shop.address}</Descriptions.Item>
              <Descriptions.Item label="Area">{shop.area}</Descriptions.Item>
              <Descriptions.Item label="Pincode">{shop.pincode || "—"}</Descriptions.Item>
              <Descriptions.Item label="Timings">{shop.timings}</Descriptions.Item>
              <Descriptions.Item label="Verified">
                {shop.isVerified ? <Tag color="blue">Yes</Tag> : <Tag>No</Tag>}
              </Descriptions.Item>
              <Descriptions.Item label="Description" span={2}>
                {shop.description || "—"}
              </Descriptions.Item>
              {shop.rejectionReason && (
                <Descriptions.Item label="Rejection Reason" span={2}>
                  <Text type="danger">{shop.rejectionReason}</Text>
                </Descriptions.Item>
              )}
              {shop.googleMapsPin && (
                <Descriptions.Item label="Maps" span={2}>
                  <a href={shop.googleMapsPin} target="_blank" rel="noreferrer" className="text-indigo-600">
                    View on Google Maps
                  </a>
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card className="rounded-xl border-0 shadow-sm mb-4">
            <Title level={5} className="!mb-4">Owner</Title>
            <Descriptions column={1} size="small">
              <Descriptions.Item label="Name">{shop.owner?.name || "—"}</Descriptions.Item>
              <Descriptions.Item label="Email">{shop.owner?.email || "—"}</Descriptions.Item>
              <Descriptions.Item label="Phone">{shop.owner?.phoneNumber || "—"}</Descriptions.Item>
              <Descriptions.Item label="Role"><Tag>{shop.owner?.role}</Tag></Descriptions.Item>
            </Descriptions>
          </Card>

          <Card className="rounded-xl border-0 shadow-sm">
            <Title level={5} className="!mb-4">Stats</Title>
            <Space direction="vertical" className="w-full">
              <Statistic title="Credits Balance" value={shop.creditsBalance ?? 0} />
              <Statistic title="Total Views" value={shop.totalViews ?? 0} />
              <Statistic title="Direction Clicks" value={shop.directionClicks ?? 0} />
              <Statistic title="Call Clicks" value={shop.callClicks ?? 0} />
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
