"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useNotify } from "ra-core";
import { Store, MapPin, Image as ImageIcon, Save, Plus, AlertCircle, Clock, CheckCircle } from "lucide-react";

const statusVariants: Record<string, string> = {
  PENDING: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-700",
  APPROVED: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700",
  REJECTED: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-300 dark:border-rose-700",
  SUSPENDED: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700",
};

interface MarketItem {
  id: string;
  name: string;
  slug: string;
  city?: string;
}

export const SellerShopProfile = () => {
  const notify = useNotify();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasShop, setHasShop] = useState(false);
  const [shopStatus, setShopStatus] = useState<string | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string | null>(null);
  const [markets, setMarkets] = useState<MarketItem[]>([]);
  const [marketsLoading, setMarketsLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    timings: "",
    description: "",
    address: "",
    area: "",
    pincode: "",
    latitude: "",
    longitude: "",
    googleMapsPin: "",
    shopImage: "",
    bannerImage: "",
  });

  useEffect(() => {
    // Load shop profile
    fetch("/api/seller/shop", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.shop) {
          setHasShop(true);
          setShopStatus(data.shop.status);
          setRejectionReason(data.shop.rejectionReason);
          setFormData({
            name: data.shop.name || "",
            phone: data.shop.phone || "",
            email: data.shop.email || "",
            timings: data.shop.timings || "",
            description: data.shop.description || "",
            address: data.shop.address || "",
            area: data.shop.area || "",
            pincode: data.shop.pincode || "",
            latitude: data.shop.latitude ? String(data.shop.latitude) : "",
            longitude: data.shop.longitude ? String(data.shop.longitude) : "",
            googleMapsPin: data.shop.googleMapsPin || "",
            shopImage: data.shop.shopImage || "",
            bannerImage: data.shop.bannerImage || "",
          });
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));

    // Load available markets dynamically from database
    fetch("/api/markets")
      .then((res) => res.json())
      .then((data) => {
        if (data.markets) {
          setMarkets(data.markets);
        }
      })
      .catch((err) => console.error("Failed to load markets:", err))
      .finally(() => setMarketsLoading(false));
  }, []);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const payload = {
        ...formData,
        latitude: formData.latitude ? parseFloat(formData.latitude) : null,
        longitude: formData.longitude ? parseFloat(formData.longitude) : null,
      };

      const res = await fetch("/api/seller/shop", {
        method: hasShop ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save shop details");

      notify(hasShop ? "Application updated successfully" : "Application submitted successfully! Awaiting admin approval.", {
        type: "info",
      });
      setHasShop(true);
      if (data.shop) {
        setShopStatus(data.shop.status);
      }
    } catch (err: any) {
      notify(err.message || "Failed to save shop profile", { type: "error" });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6 max-w-4xl">
        <Skeleton className="h-10 w-48" />
        <Skeleton className="h-96 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl pb-16">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {hasShop ? "Shop Application" : "Shop Application"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {hasShop
              ? "Your shop application has been submitted. View and edit your details below."
              : "Register your shop to start listing products on Vyom"}
          </p>
        </div>
        {shopStatus && (
          <Badge variant="outline" className={`text-sm px-3 py-1 ${statusVariants[shopStatus] || ""}`}>
            {shopStatus}
          </Badge>
        )}
      </div>

      {hasShop && shopStatus === "PENDING" && (
        <Alert className="border-amber-500/20 bg-amber-500/5">
          <Clock className="size-4 text-amber-600" />
          <AlertTitle>Application Submitted</AlertTitle>
          <AlertDescription className="text-xs text-muted-foreground mt-1">
            Your shop application has been submitted and is currently under review by the admin team. 
            You can edit your application details below while it's being reviewed.
          </AlertDescription>
        </Alert>
      )}

      {hasShop && shopStatus === "APPROVED" && (
        <Alert className="border-emerald-500/20 bg-emerald-500/5">
          <CheckCircle className="size-4 text-emerald-600" />
          <AlertTitle>Shop Approved!</AlertTitle>
          <AlertDescription className="text-xs text-muted-foreground mt-1">
            Congratulations! Your shop has been approved and is now live on Vyom. You can now list products and manage your inventory.
          </AlertDescription>
        </Alert>
      )}

      {!hasShop && (
        <Alert className="border-primary/20 bg-primary/5">
          <Store className="size-4 text-primary" />
          <AlertTitle>Register your shop</AlertTitle>
          <AlertDescription className="text-xs text-muted-foreground mt-1">
            Fill in the details below to register your retail shop. Your shop profile will be reviewed by the admin before going live.
          </AlertDescription>
        </Alert>
      )}

      {rejectionReason && (
        <Alert variant="destructive">
          <AlertCircle className="size-4" />
          <AlertTitle>Rejection Reason</AlertTitle>
          <AlertDescription className="text-xs mt-1">
            {rejectionReason}
          </AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Store className="size-4 text-orange-500" /> Basic Information
            </CardTitle>
            <CardDescription>Primary shop name and direct contact numbers</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Shop Name *</Label>
                <Input
                  id="name"
                  placeholder="e.g. Rajesh Footwear"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number *</Label>
                <Input
                  id="phone"
                  placeholder="9876543210"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Shop Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="shop@example.com"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timings">Business Timings</Label>
                <Input
                  id="timings"
                  placeholder="e.g. 10:00 AM - 9:00 PM"
                  value={formData.timings}
                  onChange={(e) => handleChange("timings", e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">About Your Shop</Label>
              <Textarea
                id="description"
                rows={3}
                placeholder="Describe your shop specialties, brand collections, etc."
                value={formData.description}
                onChange={(e) => handleChange("description", e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Location Details */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <MapPin className="size-4 text-orange-500" /> Location & Address
            </CardTitle>
            <CardDescription>Help nearby customers locate and visit your physical store</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="address">Full Address *</Label>
              <Textarea
                id="address"
                rows={2}
                placeholder="Shop No., Block, Market Name"
                value={formData.address}
                onChange={(e) => handleChange("address", e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="area">Market / Area *</Label>
                <Select
                  value={formData.area}
                  onValueChange={(val) => handleChange("area", val || "")}
                >
                  <SelectTrigger id="area" className="w-full">
                    <SelectValue placeholder={marketsLoading ? "Loading markets..." : "Select market area"} />
                  </SelectTrigger>
                  <SelectContent>
                    {markets.map((market) => (
                      <SelectItem key={market.id} value={market.name}>
                        {market.name}
                      </SelectItem>
                    ))}
                    {formData.area && !markets.some((m) => m.name === formData.area) && (
                      <SelectItem key={formData.area} value={formData.area}>
                        {formData.area}
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pincode">Pincode</Label>
                <Input
                  id="pincode"
                  placeholder="110001"
                  value={formData.pincode}
                  onChange={(e) => handleChange("pincode", e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="latitude">Latitude</Label>
                <Input
                  id="latitude"
                  placeholder="28.6139"
                  value={formData.latitude}
                  onChange={(e) => handleChange("latitude", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="longitude">Longitude</Label>
                <Input
                  id="longitude"
                  placeholder="77.2090"
                  value={formData.longitude}
                  onChange={(e) => handleChange("longitude", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="googleMapsPin">Google Maps URL</Label>
                <Input
                  id="googleMapsPin"
                  placeholder="https://maps.google.com/?q=..."
                  value={formData.googleMapsPin}
                  onChange={(e) => handleChange("googleMapsPin", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Media / Images */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <ImageIcon className="size-4 text-orange-500" /> Storefront Images
            </CardTitle>
            <CardDescription>Visuals to help customers recognize your store</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="shopImage">Shop Image URL</Label>
                <Input
                  id="shopImage"
                  placeholder="https://example.com/storefront.jpg"
                  value={formData.shopImage}
                  onChange={(e) => handleChange("shopImage", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bannerImage">Banner Image URL</Label>
                <Input
                  id="bannerImage"
                  placeholder="https://example.com/banner.jpg"
                  value={formData.bannerImage}
                  onChange={(e) => handleChange("bannerImage", e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button
            type="submit"
            className="bg-orange-600 hover:bg-orange-700 text-white min-w-36"
            disabled={saving}
          >
            {saving ? (
              "Saving..."
            ) : hasShop ? (
              <>
                <Save className="size-4 mr-2" /> Update Application
              </>
            ) : (
              <>
                <Plus className="size-4 mr-2" /> Submit Application
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};
