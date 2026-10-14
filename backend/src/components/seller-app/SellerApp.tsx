"use client";

import React from "react";
import { Admin } from "@/components/admin";
import { Resource } from "ra-core";
import { Layout } from "@/components/admin/layout";
import { raSellerDataProvider } from "@/lib/raSellerDataProvider";
import { raSellerAuthProvider } from "@/lib/raSellerAuthProvider";
import { i18nProvider } from "@/lib/i18nProvider";
import { SellerDashboard } from "./SellerDashboard";
import { SellerLoginPage } from "./SellerLoginPage";
import { SellerProductList } from "./SellerProductList";
import { SellerProductCreate } from "./SellerProductCreate";
import { SellerProductEdit } from "./SellerProductEdit";
import { SellerShopProfile } from "./SellerShopProfile";
import { SellerAnalytics } from "./SellerAnalytics";
import {
  Store,
  Package,
  BarChart2,
} from "lucide-react";

const SellerLayout = (props: any) => (
  <Layout
    {...props}
    title="Vyom Seller"
    icon={<Store className="!size-5 text-orange-600 dark:text-orange-400" />}
  />
);

export const SellerApp = () => {
  return (
    <Admin
      basename="/seller"
      dataProvider={raSellerDataProvider}
      authProvider={raSellerAuthProvider}
      i18nProvider={i18nProvider}
      dashboard={SellerDashboard}
      loginPage={SellerLoginPage}
      layout={SellerLayout}
      title="Vyom Seller"
      requireAuth
    >
      <Resource
        name="products"
        list={SellerProductList}
        create={SellerProductCreate}
        edit={SellerProductEdit}
        icon={Package}
      />
      <Resource
        name="shop"
        list={SellerShopProfile}
        icon={Store}
      />
      <Resource
        name="analytics"
        list={SellerAnalytics}
        icon={BarChart2}
      />
    </Admin>
  );
};

export default SellerApp;
