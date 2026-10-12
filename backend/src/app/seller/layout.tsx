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
import { Store, BarChart2, Package, Home } from "lucide-react";
import { sellerAuthProvider } from "@/lib/sellerAuthProvider";
import { sellerDataProvider } from "@/lib/sellerDataProvider";
import "@refinedev/antd/dist/reset.css";

export const dynamic = "force-dynamic";

export default function SellerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/seller/login";

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
          colorPrimary: "#f97316",
          borderRadius: 8,
        },
      }}
    >
      <AntdApp>
        <Suspense fallback={<div className="flex justify-center items-center h-screen"><Spin size="large" /></div>}>
          <Refine
            routerProvider={routerProvider}
            dataProvider={sellerDataProvider}
            authProvider={sellerAuthProvider}
            notificationProvider={useNotificationProvider}
            resources={[
              {
                name: "dashboard",
                list: "/seller/dashboard",
                meta: {
                  label: "Dashboard",
                  icon: <Home size={16} />,
                },
              },
              {
                name: "products",
                list: "/seller/products",
                create: "/seller/products/create",
                edit: "/seller/products/edit/:id",
                meta: {
                  label: "Products",
                  icon: <Package size={16} />,
                },
              },
              {
                name: "shop",
                list: "/seller/shop",
                meta: {
                  label: "Shop Profile",
                  icon: <Store size={16} />,
                },
              },
              {
                name: "analytics",
                list: "/seller/analytics",
                meta: {
                  label: "Analytics",
                  icon: <BarChart2 size={16} />,
                },
              },
            ]}
            options={{ syncWithLocation: true, warnWhenUnsavedChanges: true }}
          >
            <ThemedLayout
              Title={({ collapsed }: { collapsed: boolean }) => (
                <ThemedTitle
                  collapsed={collapsed}
                  text="Vyom Seller"
                  icon={<Store size={20} />}
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
