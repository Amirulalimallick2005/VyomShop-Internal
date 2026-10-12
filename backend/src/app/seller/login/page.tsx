"use client";

import { useState, useRef, useEffect } from "react";
import { Button, Input, Form, Divider, Alert, Typography, Card } from "antd";
import { Store, Phone, Globe } from "lucide-react";
import { getAuth, RecaptchaVerifier, signInWithPhoneNumber } from "firebase/auth";
import { firebaseApp } from "@/lib/firebaseClient";
import { sellerAuthProvider } from "@/lib/sellerAuthProvider";
import { useRouter } from "next/navigation";

const { Title, Text } = Typography;

export default function SellerLoginPage() {
  const [form] = Form.useForm();
  const [otpForm] = Form.useForm();
  const [mode, setMode] = useState<"phone" | "otp">("phone");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const recaptchaRef = useRef<any>(null);
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const auth = getAuth(firebaseApp);
        recaptchaRef.current = new RecaptchaVerifier(auth, "recaptcha-container", {
          size: "invisible",
        });
      } catch (e) {
        // Recaptcha fallback
      }
    }
  }, []);

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError(null);
    try {
      const res = await sellerAuthProvider.login({ providerName: "google" });
      if (res.success) {
        router.push(res.redirectTo || "/seller/dashboard");
      } else {
        setError(res.error?.message || "Google sign in failed");
      }
    } catch (err: any) {
      setError(err?.message || "Google sign in failed");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSendOtp = async (values: { phone: string }) => {
    setLoading(true);
    setError(null);
    try {
      const auth = getAuth(firebaseApp);
      const phone = values.phone.startsWith("+") ? values.phone : `+91${values.phone}`;
      const result = await signInWithPhoneNumber(auth, phone, recaptchaRef.current);
      setConfirmationResult(result);
      setMode("otp");
    } catch (err: any) {
      setError(err?.message || "Failed to send OTP. Please check your phone number.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (values: { otp: string }) => {
    setLoading(true);
    setError(null);
    try {
      const res = await sellerAuthProvider.login({
        providerName: "phone_confirm",
        confirmationResult,
        otp: values.otp,
      });
      if (res.success) {
        router.push(res.redirectTo || "/seller/dashboard");
      } else {
        setError(res.error?.message || "Invalid OTP");
      }
    } catch (err: any) {
      setError(err?.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center p-6">
      <div id="recaptcha-container" />
      <Card className="w-full max-w-md shadow-xl rounded-2xl" styles={{ body: { padding: "40px" } }}>
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-orange-500 text-white mb-4">
            <Store size={32} />
          </div>
          <Title level={3} className="!mb-1">
            Seller Portal
          </Title>
          <Text type="secondary">Sign in to manage your Vyom Shop</Text>
        </div>

        {error && (
          <Alert type="error" title={error} className="mb-6" closable onClose={() => setError(null)} />
        )}

        {mode === "phone" ? (
          <>
            <Button
              size="large"
              block
              icon={<Globe size={18} />}
              onClick={handleGoogleLogin}
              loading={googleLoading}
              className="mb-4 flex items-center justify-center gap-2"
            >
              Continue with Google
            </Button>

            <Divider>or sign in with phone</Divider>

            <Form form={form} onFinish={handleSendOtp} layout="vertical">
              <Form.Item
                name="phone"
                label="Phone Number"
                rules={[{ required: true, message: "Enter your mobile number" }]}
              >
                <Input
                  size="large"
                  placeholder="9876543210"
                  prefix={
                    <span className="flex items-center gap-1 text-gray-400">
                      <Phone size={16} />
                      <span className="text-xs">+91</span>
                    </span>
                  }
                />
              </Form.Item>
              <Button
                type="primary"
                size="large"
                block
                htmlType="submit"
                loading={loading}
                className="bg-orange-500 hover:bg-orange-600"
              >
                Send OTP
              </Button>
            </Form>
          </>
        ) : (
          <>
            <Alert
              type="info"
              title="OTP sent to your phone"
              className="mb-6"
              action={
                <Button size="small" onClick={() => setMode("phone")}>
                  Change
                </Button>
              }
            />
            <Form form={otpForm} onFinish={handleVerifyOtp} layout="vertical">
              <Form.Item
                name="otp"
                label="Enter OTP"
                rules={[{ required: true, message: "Enter the 6-digit OTP" }]}
              >
                <Input.OTP size="large" length={6} />
              </Form.Item>
              <Button
                type="primary"
                size="large"
                block
                htmlType="submit"
                loading={loading}
                className="bg-orange-500"
              >
                Verify & Sign In
              </Button>
            </Form>
          </>
        )}

        <div className="mt-6 text-center">
          <Text type="secondary" className="text-xs">
            By signing in you agree to our Terms of Service
          </Text>
        </div>
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
