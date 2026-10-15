"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { LinkBase } from "ra-core";
import { useSellerShop } from "@/hooks/useSellerShop";
import {
  Eye,
  Navigation,
  Phone,
  TrendingUp,
  BarChart2,
  Activity,
  Lock,
  ArrowRight,
} from "lucide-react";

const eventTypeVariants: Record<string, string> = {
  VIEW: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-300 dark:border-blue-700",
  GET_DIRECTION: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700",
  CALL: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-300 dark:border-purple-700",
  SEARCH: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-700",
};

export const SellerAnalytics = () => {
  const { shopStatus, isLoading: shopLoading } = useSellerShop();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (shopStatus === "APPROVED") {
      fetch("/api/seller/analytics", { credentials: "include" })
        .then((res) => res.json())
        .then((res) => {
          setData(res);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [shopStatus]);

  if (!shopLoading && shopStatus !== "APPROVED") {
    return (
      <div className="p-6 max-w-xl">
        <Alert variant={shopStatus === "REJECTED" ? "destructive" : "default"}>
          <Lock className="size-4" />
          <AlertTitle>Analytics Locked</AlertTitle>
          <AlertDescription className="mt-2 text-sm space-y-3">
            <p>
              {shopStatus === "PENDING" && "Your shop application is currently pending admin verification. Store analytics will unlock once your shop is approved."}
              {shopStatus === "REJECTED" && "Your shop application was rejected. Please review and update your shop details to re-apply."}
              {shopStatus === "SUSPENDED" && "Your shop is currently suspended. Please contact platform support."}
              {(!shopStatus || shopStatus === null) && "You haven't registered a shop yet. Register your shop profile first."}
            </p>
            <div>
              <Button size="sm" variant="outline" render={<LinkBase to="/shop" />}>
                Go to Shop Profile <ArrowRight className="size-3.5 ml-1" />
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-72 rounded-xl" />
          <Skeleton className="h-72 rounded-xl" />
        </div>
      </div>
    );
  }

  const stats = data?.stats || {};
  const topProducts = data?.topProducts || [];
  const recentEvents = data?.recentEvents || [];
  const highestViews = topProducts[0]?.totalViews || 1;

  return (
    <div className="p-6 space-y-6 pb-16">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Analytics & Insights</h1>
        <p className="text-sm text-muted-foreground">
          Track customer discovery, directions requested, and call conversions for your shop
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Total Views</CardTitle>
            <Eye className="size-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
              {(stats.totalViews ?? 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Directions Requested</CardTitle>
            <Navigation className="size-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {(stats.directionClicks ?? 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Call Clicks</CardTitle>
            <Phone className="size-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {(stats.callClicks ?? 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-medium text-muted-foreground">Conversion Rate</CardTitle>
            <TrendingUp className="size-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {stats.conversionRate ?? 0}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Analysis: Top Products & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <Card className="shadow-xs">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <BarChart2 className="size-4 text-orange-500" /> Top Products by Views
            </CardTitle>
            <CardDescription>Most viewed products in your storefront</CardDescription>
          </CardHeader>
          <CardContent>
            {topProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">
                No product view data recorded yet.
              </p>
            ) : (
              <div className="space-y-4">
                {topProducts.map((product: any, idx: number) => {
                  const percent = Math.round((product.totalViews / highestViews) * 100);
                  return (
                    <div key={product.id} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium truncate flex items-center gap-2">
                          <span className="text-xs text-muted-foreground w-4">
                            #{idx + 1}
                          </span>
                          {product.name}
                        </span>
                        <div className="flex items-center gap-2 text-xs">
                          <span className="text-muted-foreground">
                            {product.totalViews} views
                          </span>
                          <span className="font-semibold text-emerald-600">
                            ₹{product.price?.toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <Progress value={percent} className="h-1.5" />
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Events */}
        <Card className="shadow-xs">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Activity className="size-4 text-orange-500" /> Recent Activity Stream
            </CardTitle>
            <CardDescription>Real-time customer interactions with your shop</CardDescription>
          </CardHeader>
          <CardContent>
            {recentEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground py-8 text-center">
                No recent activity recorded yet.
              </p>
            ) : (
              <div className="divide-y max-h-96 overflow-y-auto">
                {recentEvents.slice(0, 20).map((event: any) => (
                  <div key={event.id} className="py-2.5 flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={`text-xs ${eventTypeVariants[event.eventType] || ""}`}
                      >
                        {event.eventType}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {event.metadata ? JSON.stringify(event.metadata) : "Interaction"}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(event.createdAt).toLocaleDateString("en-IN", {
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
