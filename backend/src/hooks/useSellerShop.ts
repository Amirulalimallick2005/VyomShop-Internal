import { useGetIdentity } from "ra-core";

export type ShopStatus = "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED" | null;

export interface SellerShopData {
  hasShop: boolean;
  shopStatus: ShopStatus;
  shop: any | null;
  isLoading: boolean;
}

export function useSellerShop(): SellerShopData {
  const { data: identity, isLoading } = useGetIdentity();

  const shop = (identity as any)?.shop || null;
  const hasShop = !!shop;
  const shopStatus: ShopStatus = shop?.status || null;

  return {
    hasShop,
    shopStatus,
    shop,
    isLoading,
  };
}
