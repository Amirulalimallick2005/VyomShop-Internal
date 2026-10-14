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
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Store,
  Users,
  Package,
  IndianRupee,
  Eye,
  Navigation,
  Clock,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import { LinkBase } from "ra-core";

export const AdminDashboard = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/dashboard", { credentials: "include" })
      .then((res) => res.json())
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    );
  }

  const metrics = data?.metrics || {};
  const recentPendingShops = data?.recentPendingShops || [];
  const recentTransactions = data?.recentTransactions || [];

  const statCards = [
    { title: "Total Shops", value: metrics.totalShops ?? 0, icon: <Store className="size-5" /> },
    { title: "Approved Shops", value: metrics.approvedShops ?? 0, icon: <CheckCircle className="size-5" /> },
    { title: "Pending Approval", value: metrics.pendingShops ?? 0, icon: <Clock className="size-5" /> },
    { title: "Total Users", value: metrics.totalUsers ?? 0, icon: <Users className="size-5" /> },
    { title: "Total Products", value: metrics.totalProducts ?? 0, icon: <Package className="size-5" /> },
    { title: "Total Revenue", value: `₹${(metrics.totalRevenue || 0).toLocaleString()}`, icon: <IndianRupee className="size-5" /> },
    { title: "Total Views", value: (metrics.totalViews || 0).toLocaleString(), icon: <Eye className="size-5" /> },
    { title: "Direction Clicks", value: (metrics.totalDirections || 0).toLocaleString(), icon: <Navigation className="size-5" /> },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Platform Dashboard</h1>
        <p className="text-muted-foreground text-sm">Real-time metrics across all shops and activity</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((card) => (
          <Card key={card.title} className="shadow-xs">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-xs font-medium text-muted-foreground">{card.title}</CardTitle>
              {card.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{card.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Approvals */}
        <Card className="shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="size-4" />
                Pending Shop Approvals
                {metrics.pendingShops > 0 && (
                  <Badge variant="secondary">
                    {metrics.pendingShops}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>Shops awaiting admin review</CardDescription>
            </div>
            <Button variant="ghost" size="sm" render={<LinkBase to="/shops" />}>
              View all <ArrowRight className="size-3.5 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            {recentPendingShops.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">No pending shops awaiting approval.</p>
            ) : (
              <div className="divide-y">
                {recentPendingShops.map((shop: any) => (
                  <div key={shop.id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{shop.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {shop.area}, {shop.city} • Owner: {shop.owner?.name || shop.owner?.email || "Unknown"}
                      </p>
                    </div>
                    <Button size="sm" variant="outline" render={<LinkBase to={`/shops/${shop.id}/show`} />}>
                      Review
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card className="shadow-xs">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                <IndianRupee className="size-4" />
                Recent Transactions
              </CardTitle>
              <CardDescription>Latest credit package purchases</CardDescription>
            </div>
            <Button variant="ghost" size="sm" render={<LinkBase to="/transactions" />}>
              View all <ArrowRight className="size-3.5 ml-1" />
            </Button>
          </CardHeader>
          <CardContent>
            {recentTransactions.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">No transactions recorded yet.</p>
            ) : (
              <div className="divide-y">
                {recentTransactions.map((tx: any) => (
                  <div key={tx.id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{tx.shop?.name || "Shop"}</p>
                      <p className="text-xs text-muted-foreground">
                        {tx.package?.name || tx.type} • {new Date(tx.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-sm">₹{tx.amount?.toLocaleString()}</p>
                      <Badge variant={tx.status === "SUCCESS" ? "default" : "destructive"} className="text-[10px]">
                        {tx.status}
                      </Badge>
                    </div>
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
