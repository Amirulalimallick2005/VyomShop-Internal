"use client";

import React, { useEffect, useState } from "react";
import { useGetIdentity, LinkBase } from "ra-core";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Eye,
  Navigation,
  Phone,
  Coins,
  CheckCircle,
  Clock,
  XCircle,
  AlertTriangle,
  ArrowRight,
  Store,
  Package,
  BarChart2,
} from "lucide-react";

const statusConfig: Record<
  string,
  { label: string; badgeClass: string; icon: React.ReactNode; description: string }
> = {
  PENDING: {
    label: "Pending Approval",
    badgeClass: "",
    icon: <Clock className="size-4" />,
    description: "Your shop is currently under review. The admin will verify and approve it shortly.",
  },
  APPROVED: {
    label: "Approved & Live",
    badgeClass: "",
    icon: <CheckCircle className="size-4" />,
    description: "Your shop is live and visible to all customers on the Vyom platform!",
  },
  REJECTED: {
    label: "Rejected",
    badgeClass: "destructive",
    icon: <XCircle className="size-4" />,
    description: "Your shop was rejected by the admin. Please see the rejection reason below to correct and update your details.",
  },
  SUSPENDED: {
    label: "Suspended",
    badgeClass: "",
    icon: <AlertTriangle className="size-4" />,
    description: "Your shop has been suspended. Please contact platform support for assistance.",
  },
};

export const SellerDashboard = () => {
  const { data: identity, isLoading: identityLoading } = useGetIdentity();
  const [analytics, setAnalytics] = useState<any>(null);
  const [wallet, setWallet] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const shop = (identity as any)?.shop;

  useEffect(() => {
    if (shop) {
      Promise.all([
        fetch("/api/seller/analytics", { credentials: "include" })
          .then((r) => r.json())
          .catch(() => null),
        fetch("/api/seller/wallet", { credentials: "include" })
          .then((r) => r.json())
          .catch(() => null),
      ]).then(([analyticsRes, walletRes]) => {
        setAnalytics(analyticsRes);
        setWallet(walletRes);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [shop]);

  if (identityLoading || loading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-32 rounded-xl" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-48 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="p-6 max-w-2xl">
        <Alert className="border-primary/20 bg-primary/5">
          <Store className="size-5 text-primary" />
          <AlertTitle className="text-base font-semibold">Register Your Shop</AlertTitle>
          <AlertDescription className="mt-2 text-sm text-muted-foreground space-y-3">
            <p>
              Welcome to Vyom Seller Portal! You haven't registered your shop yet.
              Set up your shop profile with your store name, market location, and contact information to begin listing products.
            </p>
            <div>
              <Button render={<LinkBase to="/shop" />}>
                Register Your Shop <ArrowRight className="size-4 ml-1" />
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const status = shop.status || "PENDING";
  const currentStatus = statusConfig[status] || statusConfig.PENDING;
  const stats = analytics?.stats || {};
  const creditsBalance = wallet?.shop?.creditsBalance ?? shop.creditsBalance ?? 0;

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Banner */}
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Welcome, {identity?.fullName || "Seller"}
              </h1>
              <p className="text-muted-foreground text-sm mt-1">{shop.name}</p>
            </div>
            <div className="flex flex-col items-end gap-2">
              <Badge variant={status === "REJECTED" ? "destructive" : "default"}>
                {currentStatus.label}
              </Badge>
              {shop.area && (
                <span className="text-xs text-muted-foreground">
                  {shop.area}, {shop.city || "Delhi"}
                </span>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {status !== "APPROVED" && (
        <Alert>
          <AlertDescription className="text-xs flex items-center gap-2">
            {currentStatus.icon}
            <span>{currentStatus.description}</span>
          </AlertDescription>
        </Alert>
      )}

      {/* Rejection Alert if applicable */}
      {status === "REJECTED" && shop.rejectionReason && (
        <Alert variant="destructive">
          <XCircle className="size-4" />
          <AlertTitle>Rejection Reason</AlertTitle>
          <AlertDescription className="mt-1">
            {shop.rejectionReason}
            <div className="mt-2">
              <Button size="sm" variant="outline" render={<LinkBase to="/shop" />}>
                Edit Shop Details
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Total Views</CardTitle>
            <Eye className="size-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(stats.totalViews ?? shop.totalViews ?? 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Direction Clicks</CardTitle>
            <Navigation className="size-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(stats.directionClicks ?? shop.directionClicks ?? 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Call Clicks</CardTitle>
            <Phone className="size-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {(stats.callClicks ?? shop.callClicks ?? 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Credits Balance</CardTitle>
            <Coins className="size-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {creditsBalance}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions and Credits Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card className="shadow-xs">
          <CardHeader>
            <CardTitle className="text-base">Quick Actions</CardTitle>
            <CardDescription>Common tasks for managing your catalog and shop</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              className="w-full justify-start"
              render={<LinkBase to="/products/create" />}
              disabled={creditsBalance < 1}
            >
              <Package className="size-4 mr-2" /> Add New Product
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              render={<LinkBase to="/shop" />}
            >
              <Store className="size-4 mr-2" /> Edit Shop Profile
            </Button>
            <Button
              variant="outline"
              className="w-full justify-start"
              render={<LinkBase to="/analytics" />}
            >
              <BarChart2 className="size-4 mr-2" /> View Detailed Analytics
            </Button>
          </CardContent>
        </Card>

        {/* Listing Credits Info */}
        <Card className="shadow-xs">
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              <span>Listing Credits</span>
              <Badge variant="outline">
                {creditsBalance} remaining
              </Badge>
            </CardTitle>
            <CardDescription>
              Each product listing consumes 1 listing credit
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Credit utilization</span>
                <span>{creditsBalance} / 50</span>
              </div>
              <Progress value={Math.min(100, (creditsBalance / 50) * 100)} className="h-2" />
            </div>
            {creditsBalance < 1 && (
              <Alert className="text-xs py-2">
                <AlertDescription>
                  You have run out of listing credits. Contact admin or buy a credit package to list more products.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
