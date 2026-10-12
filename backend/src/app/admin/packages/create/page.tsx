"use client";

import { useCreate } from "@refinedev/core";
import {
  Form,
  Input,
  InputNumber,
  Switch,
  Button,
  Card,
  Row,
  Col,
  Typography,
  Divider,
} from "antd";
import { ArrowLeft, Plus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const { Title, Text } = Typography;

export default function CreatePackagePage() {
  const [form] = Form.useForm();
  const { mutate: create, mutation } = useCreate();
  const router = useRouter();

  const onFinish = (values: any) => {
    create(
      { resource: "packages", values },
      { onSuccess: () => router.push("/admin/packages") }
    );
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/admin/packages">
          <Button icon={<ArrowLeft size={16} />} />
        </Link>
        <div>
          <Title level={4} className="!mb-0">New Credit Package</Title>
          <Text type="secondary">Create a listing credit package for sellers</Text>
        </div>
      </div>

      <Card className="rounded-xl border-0 shadow-sm max-w-2xl">
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item name="name" label="Package Name" rules={[{ required: true }]}>
                <Input size="large" placeholder="e.g. Starter, Growth, Pro" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="badge" label="Badge (optional)">
                <Input size="large" placeholder="e.g. Popular, Best Value" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="description" label="Description">
            <Input size="large" placeholder="Short description for sellers" />
          </Form.Item>

          <Row gutter={16}>
            <Col xs={12} md={6}>
              <Form.Item name="totalListings" label="Total Listings" rules={[{ required: true }]}>
                <InputNumber size="large" min={1} className="w-full" />
              </Form.Item>
            </Col>
            <Col xs={12} md={6}>
              <Form.Item name="freeCredits" label="Free Credits" rules={[{ required: true }]}>
                <InputNumber size="large" min={0} className="w-full" />
              </Form.Item>
            </Col>
            <Col xs={12} md={6}>
              <Form.Item name="paidCredits" label="Paid Credits" rules={[{ required: true }]}>
                <InputNumber size="large" min={0} className="w-full" />
              </Form.Item>
            </Col>
            <Col xs={12} md={6}>
              <Form.Item name="price" label="Price (₹)" rules={[{ required: true }]}>
                <InputNumber size="large" min={0} className="w-full" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={12} md={6}>
              <Form.Item name="perProductPrice" label="Per Product (₹)" rules={[{ required: true }]}>
                <InputNumber size="large" min={0} step={0.5} className="w-full" />
              </Form.Item>
            </Col>
            <Col xs={12} md={6}>
              <Form.Item name="sortOrder" label="Sort Order" initialValue={0}>
                <InputNumber size="large" min={0} className="w-full" />
              </Form.Item>
            </Col>
            <Col xs={12} md={6}>
              <Form.Item name="isActive" label="Active" valuePropName="checked" initialValue={true}>
                <Switch />
              </Form.Item>
            </Col>
          </Row>

          <Divider />

          <div className="flex items-center gap-3">
            <Button
              type="primary"
              size="large"
              htmlType="submit"
              loading={mutation.isPending}
              icon={<Plus size={16} />}
              className="bg-indigo-600"
            >
              Create Package
            </Button>
            <Link href="/admin/packages">
              <Button size="large">Cancel</Button>
            </Link>
          </div>
        </Form>
      </Card>
    </div>
  );
}
