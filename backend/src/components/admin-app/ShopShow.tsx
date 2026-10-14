"use client";

import React, { useState } from "react";
import { Show } from "@/components/admin/show";
import {
  useRecordContext,
  useRefresh,
  useNotify,
  LinkBase,
} from "ra-core";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CheckCircle,
  PauseCircle,
  XCircle,
  ArrowLeft,
  ExternalLink,
  Store,
  User,
  BarChart,
  MapPin,
  Clock,
  Phone,
  Mail,
  Coins,
  Eye,
  Navigation,
} from "lucide-react";

const statusVariants: Record<string, string> = {
  PENDING: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-300 dark:border-amber-700",
  APPROVED: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700",
  REJECTED: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-300 dark:border-rose-700",
  SUSPENDED: "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-700",
};

const ShopShowContent = () => {
  const shop = useRecordContext();
  const refresh = useRefresh();
  const notify = useNotify();

  const [loading, setLoading] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectionReason, setRejectionReason] = useState("");

  if (!shop) return null;

  const handleUpdateStatus = async (status: string, reason?: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/shops/${shop.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          status,
          ...(reason ? { rejectionReason: reason } : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update shop status");
      notify(`Shop status updated to ${status}`, { type: "info" });
      refresh();
      setRejectDialogOpen(false);
      setRejectionReason("");
    } catch (err: any) {
      notify(err.message || "Failed to update status", { type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" render={<LinkBase to="/shops" />}>
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">{shop.name}</h1>
            <p className="text-sm text-muted-foreground">
              {shop.area}, {shop.city}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className={`text-sm px-3 py-1 ${statusVariants[shop.status] || ""}`}>
            {shop.status}
          </Badge>
        </div>
      </div>

      {/* Moderation Actions Card */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Moderation Actions</CardTitle>
          <CardDescription>Update the review and publication status of this shop</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-3">
            {shop.status !== "APPROVED" && (
              <Button
                className="bg-emerald-600 hover:bg-emerald-700 text-white"
                onClick={() => handleUpdateStatus("APPROVED")}
                disabled={loading}
              >
                <CheckCircle className="size-4 mr-1.5" /> Approve Shop
              </Button>
            )}

            {shop.status === "APPROVED" && (
              <Button
                variant="outline"
                className="text-amber-600 border-amber-300 hover:bg-amber-50 dark:hover:bg-amber-950/20"
                onClick={() => handleUpdateStatus("SUSPENDED")}
                disabled={loading}
              >
                <PauseCircle className="size-4 mr-1.5" /> Suspend Shop
              </Button>
            )}

            {shop.status !== "REJECTED" && (
              <Button
                variant="destructive"
                onClick={() => setRejectDialogOpen(true)}
                disabled={loading}
              >
                <XCircle className="size-4 mr-1.5" /> Reject Shop
              </Button>
            )}
          </div>

          {shop.rejectionReason && (
            <div className="mt-4 p-3 rounded-lg bg-rose-500/10 border border-rose-200 dark:border-rose-900 text-sm">
              <span className="font-semibold text-rose-700 dark:text-rose-400">Current Rejection Reason: </span>
              <span className="text-rose-600 dark:text-rose-300">{shop.rejectionReason}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Main Grid: Details + Owner/Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Shop Details */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Store className="size-4 text-primary" /> Shop Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-xs text-muted-foreground block">Phone</span>
                  <span className="font-medium flex items-center gap-1.5 mt-0.5">
                    <Phone className="size-3.5 text-muted-foreground" /> {shop.phone || "—"}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Email</span>
                  <span className="font-medium flex items-center gap-1.5 mt-0.5">
                    <Mail className="size-3.5 text-muted-foreground" /> {shop.email || "—"}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Area / Market</span>
                  <span className="font-medium flex items-center gap-1.5 mt-0.5">
                    <MapPin className="size-3.5 text-muted-foreground" /> {shop.area || "—"}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Pincode</span>
                  <span className="font-medium mt-0.5 block">{shop.pincode || "—"}</span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-xs text-muted-foreground block">Full Address</span>
                  <span className="font-medium mt-0.5 block">{shop.address || "—"}</span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Business Timings</span>
                  <span className="font-medium flex items-center gap-1.5 mt-0.5">
                    <Clock className="size-3.5 text-muted-foreground" /> {shop.timings || "—"}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-muted-foreground block">Verification Badge</span>
                  <span className="mt-0.5 block">
                    {shop.isVerified ? (
                      <Badge variant="outline" className="text-blue-600 bg-blue-500/10 border-blue-500/30">
                        Verified
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-muted-foreground">Unverified</Badge>
                    )}
                  </span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-xs text-muted-foreground block">Description</span>
                  <p className="font-medium mt-0.5 text-muted-foreground whitespace-pre-wrap">
                    {shop.description || "No description provided."}
                  </p>
                </div>
                {shop.googleMapsPin && (
                  <div className="sm:col-span-2">
                    <span className="text-xs text-muted-foreground block">Google Maps</span>
                    <a
                      href={shop.googleMapsPin}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary inline-flex items-center gap-1 text-sm font-medium hover:underline mt-0.5"
                    >
                      Open in Google Maps <ExternalLink className="size-3.5" />
                    </a>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Cards: Owner & Stats */}
        <div className="space-y-6">
          {/* Owner Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <User className="size-4 text-primary" /> Shop Owner
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <span className="text-xs text-muted-foreground block">Full Name</span>
                <span className="font-medium">{shop.owner?.name || "—"}</span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">Email</span>
                <span className="font-medium">{shop.owner?.email || "—"}</span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">Phone</span>
                <span className="font-medium">{shop.owner?.phoneNumber || "—"}</span>
              </div>
              <div>
                <span className="text-xs text-muted-foreground block">Role</span>
                <Badge variant="secondary" className="mt-1">
                  {shop.owner?.role || "SELLER"}
                </Badge>
              </div>
            </CardContent>
          </Card>

          {/* Stats Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart className="size-4 text-primary" /> Performance & Credits
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex items-center justify-between py-1 border-b">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Coins className="size-3.5 text-amber-500" /> Credits Balance
                </span>
                <span className="font-bold text-amber-600">{shop.creditsBalance ?? 0}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Eye className="size-3.5 text-blue-500" /> Total Views
                </span>
                <span className="font-bold">{shop.totalViews ?? 0}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Navigation className="size-3.5 text-emerald-500" /> Direction Clicks
                </span>
                <span className="font-bold">{shop.directionClicks ?? 0}</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-muted-foreground flex items-center gap-1.5">
                  <Phone className="size-3.5 text-purple-500" /> Call Clicks
                </span>
                <span className="font-bold">{shop.callClicks ?? 0}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Reject Modal */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reject Shop Registration</DialogTitle>
            <DialogDescription>
              Please enter the reason for rejection. This will be visible to the seller so they can correct their details.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <Textarea
              rows={4}
              placeholder="e.g. Shop address is incomplete or location photos could not be verified..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={loading || !rejectionReason.trim()}
              onClick={() => handleUpdateStatus("REJECTED", rejectionReason)}
            >
              Confirm Rejection
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export const ShopShow = () => {
  return (
    <Show actions={false}>
      <ShopShowContent />
    </Show>
  );
};
