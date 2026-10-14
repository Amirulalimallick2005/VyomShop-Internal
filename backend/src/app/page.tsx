import Link from "next/link";
import { Store, ShieldCheck, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export const metadata = {
  title: "Vyom Shop - Dashboard Portal",
  description: "Seller and Admin dashboard for Vyom Shop",
};

export default function LandingPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="max-w-2xl w-full space-y-8">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Vyom Shop</h1>
          <p className="text-muted-foreground">Select your portal to continue</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Link href="/seller" className="block">
            <Card className="h-full hover:bg-accent transition-colors cursor-pointer">
              <CardHeader className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                    <Store className="h-5 w-5" />
                  </div>
                  <ArrowRight className="ml-auto h-5 w-5 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                  <CardTitle>Seller Dashboard</CardTitle>
                  <CardDescription>
                    Manage your shop, products, and track analytics
                  </CardDescription>
                </div>
              </CardHeader>
            </Card>
          </Link>

          <Link href="/admin" className="block">
            <Card className="h-full hover:bg-accent transition-colors cursor-pointer">
              <CardHeader className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <ArrowRight className="ml-auto h-5 w-5 text-muted-foreground" />
                </div>
                <div className="space-y-1">
                  <CardTitle>Admin Dashboard</CardTitle>
                  <CardDescription>
                    Platform management, approvals and oversight
                  </CardDescription>
                </div>
              </CardHeader>
            </Card>
          </Link>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Vyom Shop. All rights reserved.
        </p>
      </div>
    </div>
  );
}
