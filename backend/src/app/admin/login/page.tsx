"use client";

import { useState } from "react";
import { Form, Input, Button, Card, Typography, Alert, Divider } from "antd";
import { ShieldCheck, Mail, Lock } from "lucide-react";
import { useRouter } from "next/navigation";

const { Title, Text } = Typography;

export default function AdminLoginPage() {
  const [form] = Form.useForm();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onFinish = async (values: { email: string; password: string }) => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        setError(data.error || "Invalid email or password");
      } else {
        router.push("/admin/dashboard");
      }
    } catch (err: any) {
      setError(err?.message || "Failed to sign in");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-slate-100 flex items-center justify-center p-6">
      <Card className="w-full max-w-md shadow-xl rounded-2xl" styles={{ body: { padding: "40px" } }}>
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-600 text-white mb-4">
            <ShieldCheck size={32} />
          </div>
          <Title level={3} className="!mb-1">Super Admin</Title>
          <Text type="secondary">Sign in to the management console</Text>
        </div>

        {error && (
          <Alert type="error" title={error} className="mb-6" closable onClose={() => setError(null)} />
        )}

        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            name="email"
            label="Email Address"
            rules={[{ required: true, type: "email", message: "Enter a valid email" }]}
          >
            <Input
              size="large"
              prefix={<Mail size={16} className="text-gray-400" />}
              placeholder="admin@vyomshops.com"
            />
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[{ required: true, message: "Password is required" }]}
          >
            <Input.Password
              size="large"
              prefix={<Lock size={16} className="text-gray-400" />}
              placeholder="••••••••"
            />
          </Form.Item>

          <Button
            type="primary"
            size="large"
            block
            htmlType="submit"
            loading={loading}
            className="bg-indigo-600 hover:bg-indigo-700 mt-2"
          >
            Sign In
          </Button>
        </Form>

        <Divider />
        <div className="text-center">
          <Button type="link" onClick={() => router.push("/")} className="text-gray-400">
            ← Back to portal selection
          </Button>
        </div>
      </Card>
    </div>
  );
}
