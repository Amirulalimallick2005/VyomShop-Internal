import defaultMessages from "ra-language-english";
import polyglotI18nProvider from "ra-i18n-polyglot";

const customMessages: any = {
  ...defaultMessages,
  resources: {
    shops: {
      name: "Shop |||| Shops",
      fields: {
        id: "ID",
        name: "Shop Name",
        area: "Area",
        city: "City",
        status: "Status",
        creditsBalance: "Credits",
        isVerified: "Verified",
        createdAt: "Joined",
      },
    },
    products: {
      name: "Product |||| Products",
      fields: {
        id: "ID",
        name: "Product Name",
        brand: "Brand",
        category: "Category",
        price: "Price",
        mrp: "MRP",
        stockStatus: "Stock Status",
        moderationStatus: "Moderation Status",
        totalViews: "Views",
        createdAt: "Created",
      },
    },
    users: {
      name: "User |||| Users",
      fields: {
        id: "ID",
        name: "Name",
        role: "Role",
        banned: "Banned",
        createdAt: "Joined",
      },
    },
    packages: {
      name: "Credit Package |||| Credit Packages",
      fields: {
        id: "ID",
        name: "Package Name",
        totalListings: "Listings",
        freeCredits: "Free Credits",
        paidCredits: "Paid Credits",
        price: "Price",
        perProductPrice: "Per Product Price",
        isActive: "Active",
      },
    },
    transactions: {
      name: "Transaction |||| Transactions",
      fields: {
        id: "ID",
        type: "Type",
        amount: "Amount",
        status: "Status",
        createdAt: "Date",
      },
    },
    shop: {
      name: "Shop Profile |||| Shop Profile",
    },
    analytics: {
      name: "Analytics |||| Analytics",
    },
  },
};

export const i18nProvider = polyglotI18nProvider(
  () => customMessages,
  "en",
  [{ name: "en", value: "English" }],
  { allowMissing: true },
);
