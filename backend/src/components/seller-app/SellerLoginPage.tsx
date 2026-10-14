"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Store, Phone, Globe, ArrowLeft } from "lucide-react";
import Link from "next/link";
import {
  getAuth,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  signInWithPopup,
  GoogleAuthProvider,
} from "firebase/auth";
import { firebaseApp } from "@/lib/firebaseClient";
import { useNavigate } from "ra-core";

export const SellerLoginPage = () => {
  const [mode, setMode] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmationResult, setConfirmationResult] = useState<any>(null);
  const recaptchaRef = useRef<any>(null);

  const navigate = useNavigate();

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const auth = getAuth(firebaseApp);
        recaptchaRef.current = new RecaptchaVerifier(auth, "seller-recaptcha", {
          size: "invisible",
        });
      } catch (e) {
        // Fallback
      }
    }
  }, []);

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    setError(null);
    try {
      const auth = getAuth(firebaseApp);
      const provider = new GoogleAuthProvider();
      const res = await signInWithPopup(auth, provider);
      const token = await res.user.getIdToken();
      document.cookie = `firebase_token=${token}; path=/; max-age=604800`;
      await fetch("/api/auth/selectRole", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ role: "SELLER" }),
      });
      navigate("/");
    } catch (err: any) {
      setError(err?.message || "Google sign-in failed");
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const auth = getAuth(firebaseApp);
      const fullPhone = phone.startsWith("+") ? phone : `+91${phone.trim()}`;
      const result = await signInWithPhoneNumber(auth, fullPhone, recaptchaRef.current);
      setConfirmationResult(result);
      setMode("otp");
    } catch (err: any) {
      setError(err?.message || "Failed to send OTP. Please check your phone number.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp.trim() || !confirmationResult) return;
    setLoading(true);
    setError(null);
    try {
      const credential = await confirmationResult.confirm(otp.trim());
      const token = await credential.user.getIdToken();
      document.cookie = `firebase_token=${token}; path=/; max-age=604800`;
      await fetch("/api/auth/selectRole", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ role: "SELLER" }),
      });
      navigate("/");
    } catch (err: any) {
      setError(err?.message || "Invalid OTP entered. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-orange-50/50 via-background to-amber-100/50 dark:from-slate-950 dark:to-orange-950/20 flex items-center justify-center p-4">
      <div id="seller-recaptcha" />
      <Card className="w-full max-w-md shadow-lg border">
        <CardHeader className="text-center space-y-2 pb-6">
          <div className="mx-auto inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-orange-600 text-white shadow-md mb-2">
            <Store className="size-7" />
          </div>
          <CardTitle className="text-2xl font-bold">Vyom Seller Portal</CardTitle>
          <CardDescription>
            Sign in to manage your shop profile, catalog, and store analytics
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {mode === "phone" ? (
            <>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleGoogleLogin}
                disabled={googleLoading}
              >
                <Globe className="size-4 mr-2" />
                {googleLoading ? "Signing in..." : "Continue with Google"}
              </Button>

              <div className="relative text-center my-3">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t" />
                </div>
                <span className="relative bg-card px-2 text-xs text-muted-foreground uppercase">
                  Or continue with phone
                </span>
              </div>

              <form onSubmit={handleSendOtp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs font-semibold text-muted-foreground flex items-center gap-1">
                      <Phone className="size-3.5" /> +91
                    </span>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="9876543210"
                      className="pl-14"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                  disabled={loading || !phone}
                >
                  {loading ? "Sending OTP..." : "Send OTP"}
                </Button>
              </form>
            </>
          ) : (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-200 dark:border-orange-900 flex items-center justify-between text-xs">
                <span className="text-orange-700 dark:text-orange-300">
                  OTP sent to +91 {phone}
                </span>
                <button
                  type="button"
                  onClick={() => setMode("phone")}
                  className="text-orange-600 font-semibold hover:underline"
                >
                  Change
                </button>
              </div>

              <div className="space-y-2">
                <Label htmlFor="otp">Enter 6-digit OTP</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="123456"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="text-center tracking-widest text-lg font-mono"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                disabled={loading || otp.length < 6}
              >
                {loading ? "Verifying..." : "Verify & Sign In"}
              </Button>
            </form>
          )}
        </CardContent>

        <CardFooter className="flex flex-col space-y-3 pt-2">
          <p className="text-[11px] text-muted-foreground text-center">
            By signing in, you agree to our Terms of Service & Privacy Policy
          </p>
          <div className="text-center">
            <Link
              href="/"
              className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
            >
              <ArrowLeft className="size-3" /> Back to portal selection
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
};
