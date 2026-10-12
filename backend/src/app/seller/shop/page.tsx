"use client";

import { useCustom, useCustomMutation, useGetIdentity } from "@refinedev/core";
import {
  Form,
  Input,
  Button,
  Card,
  Row,
  Col,
  Typography,
  Spin,
  Tag,
  Divider,
  Alert,
  InputNumber,
} from "antd";
import { Store, MapPin, Phone, Clock, Save, Plus } from "lucide-react";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const { Title, Text } = Typography;
const { TextArea } = Input;

const DELHI_AREAS = [
  "Lajpat Nagar",
  "Karol Bagh",
  "Sarojini Nagar",
  "Kamla Nagar",
  "Chandni Chowk",
  "Connaught Place",
  "Nehru Place",
  "Janpath",
  "Khan Market",
  "South Ex",
];

const statusColors: Record<string, "warning" | "success" | "error" | "default"> = {
  PENDING: "warning",
  APPROVED: "success",
  REJECTED: "error",
  SUSPENDED: "default",
};

export default function SellerShopPage() {
  const [form] = Form.useForm();
  const { mutate: updateShop, mutation } = useCustomMutation();
  const [registering, setRegistering] = useState(false);
  const router = useRouter();

  const { query } = useCustom({
    url: "/api/seller/shop",
    method: "get",
  });

  const fullShop = (query.data?.data as any)?.shop;

  useEffect(() => {
    if (fullShop) {
      form.setFieldsValue({
        name: fullShop.name,
        phone: fullShop.phone,
        email: fullShop.email,
        address: fullShop.address,
        area: fullShop.area,
        pincode: fullShop.pincode,
        latitude: fullShop.latitude,
        longitude: fullShop.longitude,
        googleMapsPin: fullShop.googleMapsPin,
        timings: fullShop.timings,
        description: fullShop.description,
        shopImage: fullShop.shopImage,
        bannerImage: fullShop.bannerImage,
      });
    }
  }, [fullShop, form]);

  if (query.isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  const hasShop = (query.data?.data as any)?.hasShop;

  const onFinish = async (values: any) => {
    if (hasShop) {
      updateShop(
        {
          url: "/api/seller/shop",
          method: "put",
          values,
        },
        {
          onSuccess: () => router.refresh(),
        }
      );
    } else {
      setRegistering(true);
      try {
        const res = await fetch("/api/seller/shop", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify(values),
        });
        if (res.ok) router.refresh();
      } finally {
        setRegistering(false);
      }
    }
  };

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <Title level={4} className="!mb-0">
            Shop Profile
          </Title>
          <Text type="secondary">
            {hasShop ? "Manage your shop details" : "Register your shop to get started"}
          </Text>
        </div>
        {fullShop && (
          <Tag color={statusColors[fullShop.status] || "default"} className="text-sm px-3 py-1">
            {fullShop.status}
          </Tag>
        )}
      </div>

      {!hasShop && (
        <Alert
          type="info"
          showIcon
          title="Register your shop"
          description="Fill in the details below to register your shop. It will be reviewed by the admin before going live."
          className="mb-6"
        />
      )}

      {fullShop?.rejectionReason && (
        <Alert
          type="error"
          showIcon
          title="Rejection Reason"
          description={fullShop.rejectionReason}
          className="mb-6"
        />
      )}

      <Card className="rounded-xl border-0 shadow-sm max-w-3xl">
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Title level={5} className="flex items-center gap-2 !mb-4">
            <Store size={18} className="text-orange-500" /> Basic Information
          </Title>

          <Row gutter={16}>
            <Col xs={24} md={16}>
              <Form.Item name="name" label="Shop Name" rules={[{ required: true }]}>
                <Input size="large" placeholder="e.g. Rajesh Footwear" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="phone" label="Phone Number" rules={[{ required: true }]}>
                <Input size="large" placeholder="9876543210" prefix={<Phone size={14} className="text-gray-400" />} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item name="email" label="Shop Email">
                <Input size="large" placeholder="shop@example.com" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="timings" label="Shop Timings">
                <Input size="large" prefix={<Clock size={14} className="text-gray-400" />} placeholder="10:00 AM - 9:00 PM" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="description" label="About Your Shop">
            <TextArea rows={3} placeholder="Describe your shop, specialties, etc." />
          </Form.Item>

          <Divider />

          <Title level={5} className="flex items-center gap-2 !mb-4">
            <MapPin size={18} className="text-orange-500" /> Location
          </Title>

          <Form.Item name="address" label="Full Address" rules={[{ required: !hasShop }]}>
            <TextArea rows={2} placeholder="Shop No., Street, Market Name" />
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item name="area" label="Market / Area">
                <Input size="large" placeholder="e.g. Lajpat Nagar" list="area-list" />
                <datalist id="area-list">
                  {DELHI_AREAS.map((a) => <option key={a} value={a} />)}
                </datalist>
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="pincode" label="Pincode">
                <Input size="large" placeholder="110001" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item name="latitude" label="Latitude" rules={[{ required: !hasShop }]}>
                <InputNumber size="large" className="w-full" placeholder="28.6139" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="longitude" label="Longitude" rules={[{ required: !hasShop }]}>
                <InputNumber size="large" className="w-full" placeholder="77.2090" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="googleMapsPin" label="Google Maps URL">
                <Input size="large" placeholder="https://maps.google.com/?q=..." />
              </Form.Item>
            </Col>
          </Row>

          <Divider />

          <Title level={5} className="!mb-4">Images</Title>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item name="shopImage" label="Shop Image URL">
                <Input size="large" placeholder="https://example.com/shop.jpg" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="bannerImage" label="Banner Image URL">
                <Input size="large" placeholder="https://example.com/banner.jpg" />
              </Form.Item>
            </Col>
          </Row>

          <Divider />

          <Button
            type="primary"
            size="large"
            htmlType="submit"
            loading={mutation.isPending || registering}
            icon={hasShop ? <Save size={16} /> : <Plus size={16} />}
            className="bg-orange-500"
          >
            {hasShop ? "Save Changes" : "Register Shop"}
          </Button>
        </Form>
      </Card>
    </div>
  );
}
