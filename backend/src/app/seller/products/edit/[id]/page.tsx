"use client";

import { useOne, useUpdate } from "@refinedev/core";
import {
  Form,
  Input,
  InputNumber,
  Select,
  Button,
  Card,
  Row,
  Col,
  Typography,
  Spin,
  Divider,
} from "antd";
import { ArrowLeft, Save } from "lucide-react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { useEffect } from "react";

const { Title, Text } = Typography;
const { TextArea } = Input;

const CATEGORIES = ["Footwear", "Apparel", "Ethnic Wear", "Accessories", "Sports", "Kids", "Other"];
const GENDERS = ["Men", "Women", "Unisex", "Kids"];
const STOCK_STATUSES = [
  { label: "In Stock", value: "IN_STOCK" },
  { label: "Limited Stock", value: "LIMITED" },
  { label: "Out of Stock", value: "OUT_OF_STOCK" },
];

export default function EditProductPage() {
  const params = useParams();
  const id = params.id as string;
  const [form] = Form.useForm();
  const { mutate: update, mutation } = useUpdate();
  const router = useRouter();

  const { query } = useOne({ resource: "products", id });
  const product = query.data?.data as any;

  useEffect(() => {
    if (product) {
      form.setFieldsValue({
        ...product,
        images: Array.isArray(product.images)
          ? product.images.join("\n")
          : product.images,
        sizes: Array.isArray(product.sizes) ? product.sizes : product.sizes?.split(",").map((s: string) => s.trim()),
        colors: Array.isArray(product.colors) ? product.colors.join(", ") : product.colors,
      });
    }
  }, [product, form]);

  if (query.isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Spin size="large" />
      </div>
    );
  }

  const onFinish = (values: any) => {
    const payload = {
      ...values,
      images: values.images ? values.images.split("\n").map((s: string) => s.trim()).filter(Boolean) : [],
      sizes: values.sizes || [],
      colors: values.colors ? values.colors.split(",").map((s: string) => s.trim()).filter(Boolean) : [],
    };
    update(
      { resource: "products", id, values: payload },
      { onSuccess: () => router.push("/seller/products") }
    );
  };

  return (
    <div className="p-6">
      <div className="flex items-center gap-3 mb-6">
        <Link href="/seller/products">
          <Button icon={<ArrowLeft size={16} />} />
        </Link>
        <div>
          <Title level={4} className="!mb-0">Edit Product</Title>
          <Text type="secondary">{product?.name}</Text>
        </div>
      </div>

      <Card className="rounded-xl border-0 shadow-sm max-w-3xl">
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Row gutter={16}>
            <Col xs={24} md={16}>
              <Form.Item name="name" label="Product Name" rules={[{ required: true }]}>
                <Input size="large" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="brand" label="Brand">
                <Input size="large" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="description" label="Description">
            <TextArea rows={3} />
          </Form.Item>

          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item name="price" label="Selling Price (₹)" rules={[{ required: true }]}>
                <InputNumber size="large" min={0} className="w-full" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="mrp" label="MRP (₹)">
                <InputNumber size="large" min={0} className="w-full" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="stockStatus" label="Stock Status">
                <Select size="large" options={STOCK_STATUSES} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={8}>
              <Form.Item name="category" label="Category" rules={[{ required: true }]}>
                <Select size="large" options={CATEGORIES.map((c) => ({ label: c, value: c }))} />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="subcategory" label="Subcategory">
                <Input size="large" />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item name="gender" label="Gender">
                <Select size="large" options={GENDERS.map((g) => ({ label: g, value: g }))} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col xs={24} md={12}>
              <Form.Item name="sizes" label="Available Sizes">
                <Select mode="tags" size="large" />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item name="colors" label="Colors (comma separated)">
                <Input size="large" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="images" label="Image URLs (one per line)">
            <TextArea rows={3} />
          </Form.Item>

          <Divider />

          <div className="flex items-center gap-3">
            <Button
              type="primary"
              size="large"
              htmlType="submit"
              loading={mutation.isPending}
              icon={<Save size={16} />}
              className="bg-orange-500"
            >
              Save Changes
            </Button>
            <Link href="/seller/products">
              <Button size="large">Cancel</Button>
            </Link>
          </div>
        </Form>
      </Card>
    </div>
  );
}
