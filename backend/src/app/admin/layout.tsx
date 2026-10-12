"use client";

import React, { Suspense } from "react";
import { Refine } from "@refinedev/core";
import {
  useNotificationProvider,
  ThemedLayout,
  ThemedTitle,
} from "@refinedev/antd";
import { usePathname } from "next/navigation";
import routerProvider from "@refinedev/nextjs-router";
import { App as AntdApp, ConfigProvider, Spin } from "antd";
import {
  ShieldCheck,
  LayoutDashboard,
  Store,
  Package,
  Users,
  CreditCard,
  ArrowLeftRight,
} from "lucide-react";
import { adminAuthProvider } from "@/lib/adminAuthProvider";
import { adminDataProvider } from "@/lib/adminDataProvider";
import { RefineThemedSider } from "@/components/RefineThemedSider";
import "@refinedev/antd/dist/reset.css";

export const dynamic = "force-dynamic";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";

  if (isLoginPage) {
    return (
      <AntdApp>
        <Suspense fallback={<div className="flex justify-center items-center h-screen"><Spin size="large" /></div>}>
          {children}
        </Suspense>
      </AntdApp>
    );
  }

  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#4f46e5",
          borderRadius: 8,
        },
      }}
    >
      <AntdApp>
        <Suspense fallback={<div className="flex justify-center items-center h-screen"><Spin size="large" /></div>}>
          <Refine
            routerProvider={routerProvider}
            dataProvider={adminDataProvider}
            authProvider={adminAuthProvider}
            notificationProvider={useNotificationProvider}
            resources={[
              {
                name: "dashboard",
                list: "/admin/dashboard",
                meta: {
                  label: "Dashboard",
                  icon: <LayoutDashboard size={16} />,
                },
              },
              {
                name: "shops",
                list: "/admin/shops",
                show: "/admin/shops/:id",
                meta: {
                  label: "Shops",
                  icon: <Store size={16} />,
                },
              },
              {
                name: "products",
                list: "/admin/products",
                meta: {
                  label: "Products",
                  icon: <Package size={16} />,
                },
              },
              {
                name: "users",
                list: "/admin/users",
                meta: {
                  label: "Users",
                  icon: <Users size={16} />,
                },
              },
              {
                name: "packages",
                list: "/admin/packages",
                create: "/admin/packages/create",
                meta: {
                  label: "Packages",
                  icon: <CreditCard size={16} />,
                },
              },
              {
                name: "transactions",
                list: "/admin/transactions",
                meta: {
                  label: "Transactions",
                  icon: <ArrowLeftRight size={16} />,
                },
              },
            ]}
            options={{ syncWithLocation: true, warnWhenUnsavedChanges: true }}
          >
            <ThemedLayout
              Sider={RefineThemedSider}
              Title={({ collapsed }: { collapsed: boolean }) => (
                <ThemedTitle
                  collapsed={collapsed}
                  text="Vyom Admin"
                  icon={<ShieldCheck size={20} />}
                />
              )}
            >
              {children}
            </ThemedLayout>
          </Refine>
        </Suspense>
      </AntdApp>
    </ConfigProvider>
  );
}
