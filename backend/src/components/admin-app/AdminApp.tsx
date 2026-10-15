import React from "react";
import { Admin } from "@/components/admin";
import { Resource } from "ra-core";
import { Layout } from "@/components/admin/layout";
import { raAdminDataProvider } from "@/lib/raAdminDataProvider";
import { raAdminAuthProvider } from "@/lib/raAdminAuthProvider";
import { i18nProvider } from "@/lib/i18nProvider";
import { AdminDashboard } from "./AdminDashboard";
import { AdminLoginPage } from "./AdminLoginPage";
import { ShopList } from "./ShopList";
import { ShopShow } from "./ShopShow";
import { ProductList } from "./ProductList";
import { UserList } from "./UserList";
import { PackageList } from "./PackageList";
import { PackageCreate } from "./PackageCreate";
import { TransactionList } from "./TransactionList";
import { CategoryList } from "./CategoryList";
import { CategoryCreate } from "./CategoryCreate";
import { CategoryEdit } from "./CategoryEdit";
import { MarketList } from "./MarketList";
import { MarketCreate } from "./MarketCreate";
import { MarketEdit } from "./MarketEdit";
import {
  ShieldCheck,
  Store,
  Package,
  Users,
  CreditCard,
  Receipt,
  Tags,
  MapPin,
} from "lucide-react";

const AdminLayout = (props: any) => (
  <Layout
    {...props}
    title="Vyom Admin"
    icon={<ShieldCheck className="!size-5 text-indigo-600 dark:text-indigo-400" />}
  />
);

const AdminApp = () => {
  return (
    <Admin
      dataProvider={raAdminDataProvider}
      authProvider={raAdminAuthProvider}
      i18nProvider={i18nProvider}
      dashboard={AdminDashboard}
      loginPage={AdminLoginPage}
      layout={AdminLayout}
      title="Vyom Admin"
      requireAuth
    >
      <Resource
        name="shops"
        list={ShopList}
        show={ShopShow}
        icon={Store}
      />
      <Resource
        name="products"
        list={ProductList}
        icon={Package}
      />
      <Resource
        name="categories"
        list={CategoryList}
        create={CategoryCreate}
        edit={CategoryEdit}
        icon={Tags}
      />
      <Resource
        name="markets"
        list={MarketList}
        create={MarketCreate}
        edit={MarketEdit}
        icon={MapPin}
      />
      <Resource
        name="users"
        list={UserList}
        icon={Users}
      />
      <Resource
        name="packages"
        list={PackageList}
        create={PackageCreate}
        icon={CreditCard}
      />
      <Resource
        name="transactions"
        list={TransactionList}
        icon={Receipt}
      />
    </Admin>
  );
};

export default AdminApp;
