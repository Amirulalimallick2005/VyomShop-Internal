"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

const AdminApp = dynamic(
  () => import("@/components/admin-app/AdminApp"),
  {
    ssr: false,
    loading: () => (
      <div className="flex h-screen w-screen items-center justify-center p-8">
        <div className="w-full max-w-4xl space-y-4">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
    ),
  }
);

export default function AdminPage() {
  return <AdminApp />;
}
